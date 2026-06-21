/**
 * SMS Parser Orchestrator.
 * Pipeline: Sender whitelist → Bank detection → Parse → Normalize → Score → Dedup → Output
 */

import { v4 as uuidv4 } from 'uuid';
import type { ParsedSmsResult, TransactionSource, CreateTransaction } from '@expense-tracker/shared';
import { buildSenderLookup, type BankConfig, BANK_CONFIGS } from '@expense-tracker/shared';
import { parseBankSms } from './banks';
import { normalizeMerchant } from './normalizer';
import { calculateConfidence } from './confidence';
import { generateDedupHash, isDuplicate } from './dedup';
import { classifyCategory } from '../../utils/category-classifier';

// ═══════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════

export interface IncomingSms {
  sender: string;
  body: string;
  timestamp: number; // Unix ms
  simSlot?: number;  // Android multi-SIM
}

export interface ParseResult {
  status: 'success' | 'duplicate' | 'rejected' | 'review' | 'error';
  transaction?: CreateTransaction;
  parsedResult?: ParsedSmsResult;
  reason?: string;
  confidenceScore?: number;
}

// ═══════════════════════════════════════════════════════════
// SENDER LOOKUP (cached)
// ═══════════════════════════════════════════════════════════

let senderLookup: Map<string, BankConfig> | null = null;

/**
 * Initialize or refresh the sender lookup map.
 * Call on app start and when Remote Config updates.
 */
export function initSenderLookup(remoteSenders?: Record<string, string[]>): void {
  senderLookup = buildSenderLookup(BANK_CONFIGS, remoteSenders);
}

function getSenderLookup(): Map<string, BankConfig> {
  if (!senderLookup) {
    senderLookup = buildSenderLookup(BANK_CONFIGS);
  }
  return senderLookup;
}

// ═══════════════════════════════════════════════════════════
// MAIN PARSE PIPELINE
// ═══════════════════════════════════════════════════════════

/**
 * Parse an incoming SMS through the full pipeline.
 * This is the single entry point for all SMS processing.
 */
export async function parseSms(sms: IncomingSms): Promise<ParseResult> {
  try {
    // Step 1: Normalize sender and check whitelist
    const normalizedSender = normalizeSender(sms.sender);
    const lookup = getSenderLookup();
    const bankConfig = lookup.get(normalizedSender);

    if (!bankConfig) {
      return {
        status: 'rejected',
        reason: `Sender not in whitelist: ${normalizedSender}`,
      };
    }

    // Step 2: Detect language — if non-Latin chars, send to review
    if (containsNonLatinChars(sms.body)) {
      return {
        status: 'review',
        reason: 'Non-Latin characters detected (Hindi/regional language)',
        parsedResult: {
          amountPaise: 0,
          type: 'debit',
          merchant: '',
          merchantNormalized: '',
          accountLast4: null,
          balanceAfterPaise: null,
          upiRef: null,
          txnTimestamp: null,
          bankName: bankConfig.name,
          txnMode: null,
          originalCurrency: null,
          originalAmountPaise: null,
          confidenceScore: 0,
          isPartial: true,
          rawText: sms.body,
        },
      };
    }

    // Step 3: Parse with bank-specific parser
    const parsed = parseBankSms(bankConfig.id, sms.body, bankConfig.name);

    if (!parsed) {
      return {
        status: 'review',
        reason: `Failed to parse SMS from ${bankConfig.name}`,
      };
    }

    // Step 4: Normalize merchant name
    parsed.merchantNormalized = normalizeMerchant(parsed.merchant);

    // Step 5: Calculate confidence score
    parsed.confidenceScore = calculateConfidence(parsed, normalizedSender, sms.body);

    // Step 6: Validate amount
    if (parsed.amountPaise <= 0) {
      return {
        status: 'review',
        reason: 'Zero or negative amount detected',
        parsedResult: parsed,
      };
    }

    // Step 7: Check for dedup
    const hash = generateDedupHash(
      parsed.amountPaise,
      parsed.accountLast4,
      parsed.txnTimestamp ?? new Date(sms.timestamp).toISOString(),
    );

    const isDup = await isDuplicate(hash);
    if (isDup) {
      return {
        status: 'duplicate',
        reason: 'Transaction hash already exists (dedup)',
        parsedResult: parsed,
      };
    }

    // Step 8: Classify category
    const category = classifyCategory(parsed.merchantNormalized, parsed.txnMode, parsed.type);

    // Step 9: Build transaction
    const now = new Date().toISOString();
    const transaction: CreateTransaction = {
      id: uuidv4(),
      merchant: parsed.merchant,
      merchantNormalized: parsed.merchantNormalized,
      amountPaise: parsed.amountPaise,
      type: parsed.type,
      category: category.categoryId,
      subCategory: category.subCategory,
      source: 'sms' as TransactionSource,
      accountLast4: parsed.accountLast4,
      upiRef: parsed.upiRef,
      bankName: parsed.bankName,
      txnMode: parsed.txnMode,
      originalCurrency: parsed.originalCurrency,
      originalAmountPaise: parsed.originalAmountPaise,
      date: parsed.txnTimestamp ?? new Date(sms.timestamp).toISOString(),
      parsedAt: now,
      isManual: false,
      isSplit: false,
      isRecurring: false,
      recurringGroupId: null,
      confidenceScore: parsed.confidenceScore,
      needsReview: parsed.confidenceScore < 70,
      notes: null,
      tags: [],
      receiptUrl: null,
      hash,
      createdAt: now,
    };

    return {
      status: 'success',
      transaction,
      parsedResult: parsed,
      confidenceScore: parsed.confidenceScore,
    };

  } catch (error) {
    const err = error as Error;
    return {
      status: 'error',
      reason: `Parser error: ${err.message}`,
    };
  }
}

// ═══════════════════════════════════════════════════════════
// BULK PARSE (SMS inbox scan)
// ═══════════════════════════════════════════════════════════

/**
 * Parse multiple SMS messages, typically from inbox scan.
 * Returns successfully parsed transactions and failed items.
 */
export async function parseBulkSms(messages: IncomingSms[]): Promise<{
  transactions: CreateTransaction[];
  reviewItems: Array<{ sms: IncomingSms; reason: string; partialParse?: ParsedSmsResult }>;
  duplicates: number;
  rejected: number;
  errors: number;
}> {
  const transactions: CreateTransaction[] = [];
  const reviewItems: Array<{ sms: IncomingSms; reason: string; partialParse?: ParsedSmsResult }> = [];
  let duplicates = 0;
  let rejected = 0;
  let errors = 0;

  for (const sms of messages) {
    const result = await parseSms(sms);

    switch (result.status) {
      case 'success':
        if (result.transaction) {
          transactions.push(result.transaction);
        }
        break;
      case 'duplicate':
        duplicates++;
        break;
      case 'rejected':
        rejected++;
        break;
      case 'review':
        reviewItems.push({
          sms,
          reason: result.reason ?? 'Unknown parse failure',
          partialParse: result.parsedResult,
        });
        break;
      case 'error':
        errors++;
        break;
    }
  }

  return { transactions, reviewItems, duplicates, rejected, errors };
}

// ═══════════════════════════════════════════════════════════
// PASTED TEXT PARSE (iOS Smart Paste)
// ═══════════════════════════════════════════════════════════

/**
 * Attempt to parse a raw text string without a sender ID (e.g. pasted from clipboard).
 * It tests the string against all known bank parsers.
 */
export async function parsePastedText(text: string): Promise<ParseResult> {
  try {
    if (containsNonLatinChars(text)) {
      return {
        status: 'rejected',
        reason: 'Non-Latin characters detected (Hindi/regional language)',
      };
    }

    // Try parsing with each bank configuration
    for (const bankConfig of BANK_CONFIGS) {
      const parsed = parseBankSms(bankConfig.id, text, bankConfig.name);
      
      if (parsed && parsed.amountPaise > 0) {
        parsed.merchantNormalized = normalizeMerchant(parsed.merchant);
        
        // Use a generic sender for confidence calculation
        parsed.confidenceScore = calculateConfidence(parsed, 'PASTE', text);
        
        const txnDate = parsed.txnTimestamp ?? new Date().toISOString();
        const hash = generateDedupHash(parsed.amountPaise, parsed.accountLast4, txnDate);

        const isDup = await isDuplicate(hash);
        if (isDup) {
          return {
            status: 'duplicate',
            reason: 'Transaction already exists',
            parsedResult: parsed,
          };
        }

        const category = classifyCategory(parsed.merchantNormalized, parsed.txnMode, parsed.type);
        const now = new Date().toISOString();

        const transaction: CreateTransaction = {
          id: uuidv4(),
          merchant: parsed.merchant,
          merchantNormalized: parsed.merchantNormalized,
          amountPaise: parsed.amountPaise,
          type: parsed.type,
          category: category.categoryId,
          subCategory: category.subCategory,
          source: 'sms' as TransactionSource,
          accountLast4: parsed.accountLast4,
          upiRef: parsed.upiRef,
          bankName: parsed.bankName,
          txnMode: parsed.txnMode,
          originalCurrency: parsed.originalCurrency,
          originalAmountPaise: parsed.originalAmountPaise,
          date: txnDate,
          parsedAt: now,
          isManual: false,
          isSplit: false,
          isRecurring: false,
          recurringGroupId: null,
          confidenceScore: parsed.confidenceScore,
          needsReview: parsed.confidenceScore < 80, // Be slightly stricter for pasted text
          notes: 'Added via Smart Paste',
          tags: [],
          receiptUrl: null,
          hash,
          createdAt: now,
        };

        return {
          status: 'success',
          transaction,
          parsedResult: parsed,
          confidenceScore: parsed.confidenceScore,
        };
      }
    }

    return {
      status: 'error',
      reason: 'Could not detect any transaction data in the pasted text.',
    };
  } catch (error) {
    const err = error as Error;
    return {
      status: 'error',
      reason: `Parser error: ${err.message}`,
    };
  }
}

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

/**
 * Normalize SMS sender ID.
 * Remove common prefixes: VM-, AD-, BZ-, BW-, LM-, TD-, TA-, TM-
 */
function normalizeSender(sender: string): string {
  return sender
    .replace(/^(VM-|AD-|BZ-|BW-|LM-|TD-|TA-|TM-|HP-|DM-|JD-|JR-)/i, '')
    .toUpperCase()
    .trim();
}

/**
 * Detect non-Latin characters (Hindi, Tamil, etc.)
 */
function containsNonLatinChars(text: string): boolean {
  // Devanagari, Tamil, Telugu, Kannada, Malayalam, Gujarati, Bengali, Punjabi, Odia
  const nonLatinRegex = /[\u0900-\u097F\u0B80-\u0BFF\u0C00-\u0C7F\u0C80-\u0CFF\u0D00-\u0D7F\u0A80-\u0AFF\u0980-\u09FF\u0A00-\u0A7F\u0B00-\u0B7F]/;
  // Only flag if more than 30% of characters are non-Latin
  const nonLatinCount = (text.match(nonLatinRegex) || []).length;
  return nonLatinCount > text.length * 0.3;
}
