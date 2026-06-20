/**
 * HDFC Bank SMS parser.
 * Handles all known HDFC Bank transactional SMS formats.
 */

import type { ParsedSmsResult, TransactionMode, TransactionType } from '@expense-tracker/shared';
import { extractAmount } from '../normalizer';

// ═══════════════════════════════════════════════════════════
// HDFC SMS PATTERNS
// ═══════════════════════════════════════════════════════════

const PATTERNS = {
  // Pattern 1: UPI debit
  // "Rs 500.00 debited from A/c **1234 on 15-Jan-24 to VPA merchant@upi(UPI Ref No 401234567890). Avl Bal Rs 25,000.00"
  upiDebit: /Rs\.?\s*([0-9,]+\.?\d*)\s*debited\s*from\s*(?:A\/c|account)\s*\*{0,2}(\d{4})\s*on\s*(\d{2}-\w{3}-\d{2,4})\s*to\s*VPA\s*([^\(]+)\(UPI\s*Ref\s*(?:No\.?)?\s*(\d+)\).*?(?:Avl\s*Bal|Available\s*balance)\s*(?:Rs\.?|INR)?\s*([0-9,]+\.?\d*)/i,

  // Pattern 2: UPI credit
  // "Rs 1,000.00 credited to A/c **1234 on 15-Jan-24 from VPA merchant@upi(UPI Ref No 401234567890). Avl Bal Rs 26,000.00"
  upiCredit: /Rs\.?\s*([0-9,]+\.?\d*)\s*credited\s*to\s*(?:A\/c|account)\s*\*{0,2}(\d{4})\s*on\s*(\d{2}-\w{3}-\d{2,4})\s*from\s*VPA\s*([^\(]+)\(UPI\s*Ref\s*(?:No\.?)?\s*(\d+)\).*?(?:Avl\s*Bal|Available\s*balance)\s*(?:Rs\.?|INR)?\s*([0-9,]+\.?\d*)/i,

  // Pattern 3: Card/POS debit
  // "Rs 750.00 has been debited from A/c **1234 on 15-Jan-24 to SWIGGY NEW DELHI IN. Avl Bal:Rs 24,250.00"
  cardDebit: /Rs\.?\s*([0-9,]+\.?\d*)\s*(?:has been\s*)?debited\s*from\s*(?:A\/c|account)\s*\*{0,2}(\d{4})\s*on\s*(\d{2}-\w{3}-\d{2,4})\s*to\s*(.+?)\.?\s*(?:Avl\s*Bal|Available\s*balance)[:\s]*(?:Rs\.?|INR)?\s*([0-9,]+\.?\d*)/i,

  // Pattern 4: NEFT/IMPS debit
  // "Rs 5,000.00 debited from A/c **1234 by NEFT on 15-Jan-24 to JOHN DOE. Avl Bal Rs 20,000.00"
  neftDebit: /Rs\.?\s*([0-9,]+\.?\d*)\s*debited\s*from\s*(?:A\/c|account)\s*\*{0,2}(\d{4})\s*by\s*(NEFT|IMPS|RTGS)\s*on\s*(\d{2}-\w{3}-\d{2,4})\s*to\s*(.+?)\.?\s*(?:Avl\s*Bal|Available\s*balance)\s*(?:Rs\.?|INR)?\s*([0-9,]+\.?\d*)/i,

  // Pattern 5: NEFT/IMPS credit
  neftCredit: /Rs\.?\s*([0-9,]+\.?\d*)\s*credited\s*to\s*(?:A\/c|account)\s*\*{0,2}(\d{4})\s*by\s*(NEFT|IMPS|RTGS)\s*on\s*(\d{2}-\w{3}-\d{2,4})\s*from\s*(.+?)\.?\s*(?:Avl\s*Bal|Available\s*balance)\s*(?:Rs\.?|INR)?\s*([0-9,]+\.?\d*)/i,

  // Pattern 6: ATM withdrawal
  // "Rs 10,000.00 debited from A/c **1234 on 15-Jan-24 at ATM. Avl Bal Rs 15,000.00"
  atm: /Rs\.?\s*([0-9,]+\.?\d*)\s*debited\s*from\s*(?:A\/c|account)\s*\*{0,2}(\d{4})\s*on\s*(\d{2}-\w{3}-\d{2,4})\s*(?:at|for)\s*ATM/i,

  // Pattern 7: Auto-debit / EMI
  // "Rs 5,000.00 auto-debited from A/c **1234 for EMI/SIP/Insurance"
  autoDebit: /Rs\.?\s*([0-9,]+\.?\d*)\s*auto-?debited\s*from\s*(?:A\/c|account)\s*\*{0,2}(\d{4})\s*(?:on\s*(\d{2}-\w{3}-\d{2,4}))?\s*for\s*(.+?)\.?\s*(?:Avl\s*Bal|Available\s*balance)?\s*(?:Rs\.?|INR)?\s*([0-9,]+\.?\d*)?/i,

  // Pattern 8: Salary credit
  // "Rs 50,000.00 credited to A/c **1234 on 01-Feb-24. Salary credit. Avl Bal Rs 70,000.00"
  salary: /Rs\.?\s*([0-9,]+\.?\d*)\s*credited\s*to\s*(?:A\/c|account)\s*\*{0,2}(\d{4})\s*on\s*(\d{2}-\w{3}-\d{2,4})\.\s*(?:Salary|Sal)\s*credit/i,

  // Pattern 9: Generic debit
  genericDebit: /(?:debited|withdrawn|spent|paid)\s*(?:Rs\.?|INR|₹)?\s*([0-9,]+\.?\d*)\s*from\s*(?:A\/c|account|a\/c)\s*\*{0,2}(\d{4})/i,

  // Pattern 10: Generic credit
  genericCredit: /(?:credited|received|deposited)\s*(?:Rs\.?|INR|₹)?\s*([0-9,]+\.?\d*)\s*to\s*(?:A\/c|account|a\/c)\s*\*{0,2}(\d{4})/i,
};

// ═══════════════════════════════════════════════════════════
// PARSER
// ═══════════════════════════════════════════════════════════

export function parseHDFCSms(body: string, bankName: string): ParsedSmsResult | null {
  const text = body.trim();

  // Try UPI debit
  let match = text.match(PATTERNS.upiDebit);
  if (match) {
    return buildResult({
      amountStr: match[1] ?? '',
      type: 'debit',
      accountLast4: match[2] ?? null,
      dateStr: match[3] ?? null,
      merchant: (match[4] ?? '').trim(),
      upiRef: match[5] ?? null,
      balanceStr: match[6] ?? null,
      txnMode: 'UPI',
      bankName,
      rawText: text,
    });
  }

  // Try UPI credit
  match = text.match(PATTERNS.upiCredit);
  if (match) {
    return buildResult({
      amountStr: match[1] ?? '',
      type: 'credit',
      accountLast4: match[2] ?? null,
      dateStr: match[3] ?? null,
      merchant: (match[4] ?? '').trim(),
      upiRef: match[5] ?? null,
      balanceStr: match[6] ?? null,
      txnMode: 'UPI',
      bankName,
      rawText: text,
    });
  }

  // Try card/POS debit
  match = text.match(PATTERNS.cardDebit);
  if (match) {
    return buildResult({
      amountStr: match[1] ?? '',
      type: 'debit',
      accountLast4: match[2] ?? null,
      dateStr: match[3] ?? null,
      merchant: (match[4] ?? '').trim(),
      upiRef: null,
      balanceStr: match[5] ?? null,
      txnMode: 'POS',
      bankName,
      rawText: text,
    });
  }

  // Try NEFT/IMPS debit
  match = text.match(PATTERNS.neftDebit);
  if (match) {
    return buildResult({
      amountStr: match[1] ?? '',
      type: 'debit',
      accountLast4: match[2] ?? null,
      dateStr: match[4] ?? null,
      merchant: (match[5] ?? '').trim(),
      upiRef: null,
      balanceStr: match[6] ?? null,
      txnMode: (match[3] ?? 'NEFT') as TransactionMode,
      bankName,
      rawText: text,
    });
  }

  // Try NEFT/IMPS credit
  match = text.match(PATTERNS.neftCredit);
  if (match) {
    return buildResult({
      amountStr: match[1] ?? '',
      type: 'credit',
      accountLast4: match[2] ?? null,
      dateStr: match[4] ?? null,
      merchant: (match[5] ?? '').trim(),
      upiRef: null,
      balanceStr: match[6] ?? null,
      txnMode: (match[3] ?? 'NEFT') as TransactionMode,
      bankName,
      rawText: text,
    });
  }

  // Try ATM
  match = text.match(PATTERNS.atm);
  if (match) {
    return buildResult({
      amountStr: match[1] ?? '',
      type: 'debit',
      accountLast4: match[2] ?? null,
      dateStr: match[3] ?? null,
      merchant: 'ATM Withdrawal',
      upiRef: null,
      balanceStr: null,
      txnMode: 'ATM',
      bankName,
      rawText: text,
    });
  }

  // Try auto-debit
  match = text.match(PATTERNS.autoDebit);
  if (match) {
    return buildResult({
      amountStr: match[1] ?? '',
      type: 'debit',
      accountLast4: match[2] ?? null,
      dateStr: match[3] ?? null,
      merchant: (match[4] ?? '').trim(),
      upiRef: null,
      balanceStr: match[5] ?? null,
      txnMode: 'AutoDebit',
      bankName,
      rawText: text,
    });
  }

  // Try salary credit
  match = text.match(PATTERNS.salary);
  if (match) {
    return buildResult({
      amountStr: match[1] ?? '',
      type: 'credit',
      accountLast4: match[2] ?? null,
      dateStr: match[3] ?? null,
      merchant: 'Salary',
      upiRef: null,
      balanceStr: null,
      txnMode: 'NEFT',
      bankName,
      rawText: text,
    });
  }

  // Try generic debit
  match = text.match(PATTERNS.genericDebit);
  if (match) {
    const amount = extractAmount(text);
    return buildResult({
      amountStr: match[1] ?? '',
      type: 'debit',
      accountLast4: match[2] ?? null,
      dateStr: null,
      merchant: extractMerchantFromGeneric(text),
      upiRef: extractUpiRef(text),
      balanceStr: extractBalance(text),
      txnMode: detectTxnMode(text),
      bankName,
      rawText: text,
    });
  }

  // Try generic credit
  match = text.match(PATTERNS.genericCredit);
  if (match) {
    return buildResult({
      amountStr: match[1] ?? '',
      type: 'credit',
      accountLast4: match[2] ?? null,
      dateStr: null,
      merchant: extractMerchantFromGeneric(text),
      upiRef: extractUpiRef(text),
      balanceStr: extractBalance(text),
      txnMode: detectTxnMode(text),
      bankName,
      rawText: text,
    });
  }

  // No pattern matched
  return null;
}

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

interface BuildResultParams {
  amountStr: string;
  type: TransactionType;
  accountLast4: string | null;
  dateStr: string | null;
  merchant: string;
  upiRef: string | null;
  balanceStr: string | null;
  txnMode: TransactionMode | null;
  bankName: string;
  rawText: string;
}

function buildResult(params: BuildResultParams): ParsedSmsResult {
  const amountPaise = parseAmountString(params.amountStr);
  const balancePaise = params.balanceStr ? parseAmountString(params.balanceStr) : null;
  const timestamp = params.dateStr ? parseHDFCDate(params.dateStr) : null;

  return {
    amountPaise,
    type: params.type,
    merchant: params.merchant,
    merchantNormalized: params.merchant.toLowerCase(),
    accountLast4: params.accountLast4,
    balanceAfterPaise: balancePaise,
    upiRef: params.upiRef,
    txnTimestamp: timestamp,
    bankName: params.bankName,
    txnMode: params.txnMode,
    originalCurrency: null,
    originalAmountPaise: null,
    confidenceScore: 0, // Calculated later
    isPartial: false,
    rawText: params.rawText,
  };
}

function parseAmountString(str: string): number {
  if (!str) return 0;
  const cleaned = str.replace(/[₹Rs\.INR\s,]/gi, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : Math.round(num * 100);
}

/**
 * Parse HDFC date format: "15-Jan-24" or "15-Jan-2024"
 */
function parseHDFCDate(dateStr: string): string | null {
  try {
    const months: Record<string, string> = {
      Jan: '01', Feb: '02', Mar: '03', Apr: '04', May: '05', Jun: '06',
      Jul: '07', Aug: '08', Sep: '09', Oct: '10', Nov: '11', Dec: '12',
    };

    const parts = dateStr.split('-');
    if (parts.length !== 3) return null;

    const day = parts[0]?.padStart(2, '0');
    const monthStr = parts[1] ?? '';
    const month = months[monthStr];
    let year = parts[2] ?? '';

    if (!day || !month || !year) return null;

    if (year.length === 2) {
      year = `20${year}`;
    }

    return new Date(`${year}-${month}-${day}T00:00:00.000Z`).toISOString();
  } catch {
    return null;
  }
}

function extractMerchantFromGeneric(text: string): string {
  // Try to extract merchant from "to <merchant>" or "at <merchant>"
  const match = text.match(/(?:to|at|for)\s+([A-Za-z][A-Za-z0-9\s&.'_-]+?)(?:\s*(?:on|Avl|Available|\.|$))/i);
  return match?.[1]?.trim() ?? 'Unknown';
}

function extractUpiRef(text: string): string | null {
  const match = text.match(/UPI\s*(?:Ref|Reference)\s*(?:No\.?)?\s*(\d{10,})/i);
  return match?.[1] ?? null;
}

function extractBalance(text: string): string | null {
  const match = text.match(/(?:Avl\s*Bal|Available\s*balance)[:\s]*(?:Rs\.?|INR|₹)?\s*([0-9,]+\.?\d*)/i);
  return match?.[1] ?? null;
}

function detectTxnMode(text: string): TransactionMode | null {
  if (/UPI/i.test(text)) return 'UPI';
  if (/NEFT/i.test(text)) return 'NEFT';
  if (/IMPS/i.test(text)) return 'IMPS';
  if (/RTGS/i.test(text)) return 'RTGS';
  if (/ATM/i.test(text)) return 'ATM';
  if (/POS|point of sale/i.test(text)) return 'POS';
  if (/EMI/i.test(text)) return 'EMI';
  if (/auto[\s-]?debit/i.test(text)) return 'AutoDebit';
  if (/refund/i.test(text)) return 'Refund';
  return null;
}
