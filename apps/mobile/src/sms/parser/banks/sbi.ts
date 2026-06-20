/**
 * SBI (State Bank of India) SMS parser.
 * SBI has unique formats including bulk transaction SMS.
 */

import type { ParsedSmsResult, TransactionMode } from '@expense-tracker/shared';
import { parseGenericBankSms, extractAmountPaise, extractAccountLast4, extractBalance, extractUpiRef, detectTxnMode, extractTimestamp } from './generic';

// ═══════════════════════════════════════════════════════════
// SBI-SPECIFIC PATTERNS
// ═══════════════════════════════════════════════════════════

const PATTERNS = {
  // "Your a/c no. XXXXXXXX1234 is debited for Rs.500.00 on 15-Jan-24 by trf to MERCHANT(Ref No 123456789). Avl Bal Rs 25000.00"
  debit: /(?:a\/c|account)\s*(?:no\.?\s*)?(?:\w*?)(\d{4})\s*is\s*debited\s*(?:for|by)\s*Rs\.?\s*([0-9,]+\.?\d*)\s*on\s*(\d{2}-\w{3}-\d{2,4})\s*(?:by\s*(?:trf\s*)?to\s*)?(.+?)(?:\(Ref\s*No\.?\s*(\d+)\))?.*?(?:Avl\s*Bal)\s*Rs\.?\s*([0-9,]+\.?\d*)/i,

  // "Your a/c no. XXXXXXXX1234 is credited by Rs.1000.00 on 15-Jan-24 by NEFT from SENDER(Ref No 123456). Avl Bal Rs 26000.00"
  credit: /(?:a\/c|account)\s*(?:no\.?\s*)?(?:\w*?)(\d{4})\s*is\s*credited\s*(?:by|with)\s*Rs\.?\s*([0-9,]+\.?\d*)\s*on\s*(\d{2}-\w{3}-\d{2,4})\s*(?:by\s*(?:\w+\s*)?from\s*)?(.+?)(?:\(Ref\s*No\.?\s*(\d+)\))?.*?(?:Avl\s*Bal)\s*Rs\.?\s*([0-9,]+\.?\d*)/i,

  // SBI UPI: "Rs.500.00 debited from your A/c XXXXXXXX1234 on 15Jan24 by UPI-MERCHANT-UPI Ref No 401234567890"
  upi: /Rs\.?\s*([0-9,]+\.?\d*)\s*(debited|credited)\s*(?:from|to)\s*(?:your\s*)?(?:A\/c|account)\s*(?:\w*?)(\d{4})\s*on\s*(\d{2}\w{3}\d{2,4})\s*by\s*UPI[- ](.+?)[- ]UPI\s*Ref\s*(?:No\.?)?\s*(\d+)/i,

  // SBI ATM: "Your A/c XXXXXXXX1234 has been debited by Rs.10000 on 15-Jan-24 through ATM withdrawal"
  atm: /(?:A\/c|account)\s*(?:\w*?)(\d{4})\s*(?:has\s*been\s*)?debited\s*(?:by|for)\s*Rs\.?\s*([0-9,]+\.?\d*)\s*on\s*(\d{2}-\w{3}-\d{2,4})\s*(?:through|at)\s*ATM/i,

  // SBI bulk: "Dear Customer, your A/c XXXXXXXX1234 has been debited..." (multiple in one SMS)
  // We detect this and split accordingly
  bulkSeparator: /(?=Your\s*(?:a\/c|account))/gi,
};

// ═══════════════════════════════════════════════════════════
// PARSER
// ═══════════════════════════════════════════════════════════

export function parseSBISms(body: string, bankName: string): ParsedSmsResult | null {
  const text = body.trim();

  // Check for bulk SMS (multiple transactions in one message)
  const parts = text.split(PATTERNS.bulkSeparator).filter((p) => p.trim().length > 20);
  if (parts.length > 1) {
    // Parse first transaction only — caller should handle splitting
    // (The orchestrator calls this, but we return only the first match)
    return parseSingleSBISms(parts[0] ?? text, bankName);
  }

  return parseSingleSBISms(text, bankName);
}

function parseSingleSBISms(text: string, bankName: string): ParsedSmsResult | null {
  // Try SBI UPI pattern
  let match = text.match(PATTERNS.upi);
  if (match) {
    return buildSBIResult({
      amountStr: match[1] ?? '',
      type: (match[2] ?? '').toLowerCase().includes('credit') ? 'credit' : 'debit',
      accountLast4: match[3] ?? null,
      dateStr: match[4] ?? null,
      merchant: (match[5] ?? '').trim(),
      upiRef: match[6] ?? null,
      balanceStr: null,
      txnMode: 'UPI',
      bankName,
      rawText: text,
    });
  }

  // Try SBI debit pattern
  match = text.match(PATTERNS.debit);
  if (match) {
    return buildSBIResult({
      amountStr: match[2] ?? '',
      type: 'debit',
      accountLast4: match[1] ?? null,
      dateStr: match[3] ?? null,
      merchant: (match[4] ?? '').trim(),
      upiRef: match[5] ?? null,
      balanceStr: match[6] ?? null,
      txnMode: detectTxnMode(text),
      bankName,
      rawText: text,
    });
  }

  // Try SBI credit pattern
  match = text.match(PATTERNS.credit);
  if (match) {
    return buildSBIResult({
      amountStr: match[2] ?? '',
      type: 'credit',
      accountLast4: match[1] ?? null,
      dateStr: match[3] ?? null,
      merchant: (match[4] ?? '').trim(),
      upiRef: match[5] ?? null,
      balanceStr: match[6] ?? null,
      txnMode: detectTxnMode(text),
      bankName,
      rawText: text,
    });
  }

  // Try ATM
  match = text.match(PATTERNS.atm);
  if (match) {
    return buildSBIResult({
      amountStr: match[2] ?? '',
      type: 'debit',
      accountLast4: match[1] ?? null,
      dateStr: match[3] ?? null,
      merchant: 'ATM Withdrawal',
      upiRef: null,
      balanceStr: null,
      txnMode: 'ATM',
      bankName,
      rawText: text,
    });
  }

  // Fall back to generic parser
  return parseGenericBankSms(text, bankName);
}

// ═══════════════════════════════════════════════════════════
// HELPERS
// ═══════════════════════════════════════════════════════════

interface BuildParams {
  amountStr: string;
  type: 'debit' | 'credit';
  accountLast4: string | null;
  dateStr: string | null;
  merchant: string;
  upiRef: string | null;
  balanceStr: string | null;
  txnMode: TransactionMode | null;
  bankName: string;
  rawText: string;
}

function buildSBIResult(params: BuildParams): ParsedSmsResult {
  const amountPaise = parseAmount(params.amountStr);
  const balancePaise = params.balanceStr ? parseAmount(params.balanceStr) : null;
  const timestamp = params.dateStr ? parseSBIDate(params.dateStr) : null;

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
    confidenceScore: 0,
    isPartial: params.rawText.length >= 155,
    rawText: params.rawText,
  };
}

function parseAmount(str: string): number {
  if (!str) return 0;
  const cleaned = str.replace(/[₹Rs\.INR\s,]/gi, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : Math.round(num * 100);
}

function parseSBIDate(dateStr: string): string | null {
  const months: Record<string, string> = {
    jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
    jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
  };

  // Handle "15-Jan-24" or "15Jan24" or "15/01/2024"
  const clean = dateStr.replace(/\//g, '-');

  // Try DD-MMM-YY
  const match1 = clean.match(/(\d{1,2})-?(\w{3})-?(\d{2,4})/);
  if (match1) {
    const d = (match1[1] ?? '').padStart(2, '0');
    const m = months[(match1[2] ?? '').toLowerCase()];
    let y = match1[3] ?? '';
    if (y.length === 2) y = `20${y}`;
    if (m) {
      try { return new Date(`${y}-${m}-${d}T00:00:00.000Z`).toISOString(); } catch { /* ignore */ }
    }
  }

  return null;
}
