/**
 * Generic bank SMS parser utilities.
 * Shared patterns and helpers used across all bank-specific parsers.
 * Banks with custom format differences override specific patterns.
 */

import type { ParsedSmsResult, TransactionMode, TransactionType } from '@expense-tracker/shared';

// ═══════════════════════════════════════════════════════════
// COMMON REGEX PATTERNS
// ═══════════════════════════════════════════════════════════

export const COMMON = {
  /** Amount patterns: Rs. 1,234.56 or INR 1234 or ₹500 */
  amount: /(?:Rs\.?|INR|₹)\s*([0-9,]+\.?\d*)/i,
  amountReverse: /([0-9,]+\.?\d*)\s*(?:Rs\.?|INR|₹)/i,

  /** Account last 4 digits: **1234, XX1234, A/c 1234, ending 1234 */
  accountLast4: /(?:\*{1,4}|XX|x{1,4}|ending\s*|a\/c\s*(?:no\.?\s*)?)(\d{4})/i,

  /** Date formats */
  dateDDMMMYY: /(\d{1,2})[-\/](\w{3})[-\/](\d{2,4})/,           // 15-Jan-24
  dateDDMMYYYY: /(\d{1,2})[-\/](\d{1,2})[-\/](\d{2,4})/,        // 15/01/2024
  dateYYYYMMDD: /(\d{4})[-\/](\d{2})[-\/](\d{2})/,               // 2024-01-15

  /** UPI reference */
  upiRef: /(?:UPI\s*(?:Ref|Reference|Txn)\s*(?:No\.?|ID)?)\s*:?\s*(\d{10,})/i,
  upiRefAlt: /(?:ref\s*(?:no\.?|number)?)\s*:?\s*(\d{10,})/i,

  /** Balance after transaction */
  balance: /(?:Avl\.?\s*Bal\.?|Available\s*(?:Bal(?:ance)?)|Bal\.?)\s*:?\s*(?:Rs\.?|INR|₹)?\s*([0-9,]+\.?\d*)/i,

  /** Transaction type indicators */
  debitKeywords: /\b(?:debited|deducted|withdrawn|spent|paid|sent|transferred|purchase|payment)\b/i,
  creditKeywords: /\b(?:credited|received|deposited|refund|cashback|reversed|added)\b/i,

  /** Transaction mode */
  modeUPI: /\bUPI\b/i,
  modeNEFT: /\bNEFT\b/i,
  modeIMPS: /\bIMPS\b/i,
  modeRTGS: /\bRTGS\b/i,
  modeATM: /\bATM\b/i,
  modePOS: /\b(?:POS|point\s*of\s*sale)\b/i,
  modeEMI: /\bEMI\b/i,
  modeAutoDebit: /\b(?:auto[\s-]?debit|standing\s*instruction|SI\s*payment|mandate)\b/i,
  modeRefund: /\b(?:refund|reversal|chargeback)\b/i,
  modeNetBanking: /\b(?:net\s*banking|online\s*banking|internet\s*banking)\b/i,

  /** Salary/income keywords */
  salaryKeywords: /\b(?:salary|sal|stipend|wage|remuneration)\b/i,

  /** Merchant extraction: "to/at/for <merchant>" */
  merchantTo: /(?:to|towards)\s+([A-Za-z][A-Za-z0-9\s&.'_@/-]+?)(?:\s*(?:on|via|for|Avl|Available|\.|Ref|UPI|$))/i,
  merchantAt: /(?:at)\s+([A-Za-z][A-Za-z0-9\s&.'_-]+?)(?:\s*(?:on|Avl|Available|\.|$))/i,
  merchantFrom: /(?:from)\s+([A-Za-z][A-Za-z0-9\s&.'_@/-]+?)(?:\s*(?:on|via|for|Avl|Available|\.|Ref|UPI|$))/i,
  merchantVPA: /VPA\s+([^\(\s]+)/i,
};

// ═══════════════════════════════════════════════════════════
// GENERIC PARSER
// ═══════════════════════════════════════════════════════════

/**
 * Generic SMS parser that works for most Indian banks.
 * Bank-specific parsers should try their custom patterns first,
 * then fall back to this if none match.
 */
export function parseGenericBankSms(
  body: string,
  bankName: string,
  dynamicPatterns?: import('./index').DynamicBankPattern[],
): ParsedSmsResult | null {
  const text = body.trim();

  // 1. Try dynamic remote patterns first (if any)
  if (dynamicPatterns && dynamicPatterns.length > 0) {
    for (const dp of dynamicPatterns) {
      try {
        const amtMatch = text.match(new RegExp(dp.amountPattern, 'i'));
        const typeMatch = text.match(new RegExp(dp.typePattern, 'i'));
        
        if (amtMatch && amtMatch[1] && typeMatch) {
          const amountPaise = extractAmountPaiseFromMatch(amtMatch[1]);
          if (amountPaise > 0) {
            const type = typeMatch[0].toLowerCase().includes('credit') ? 'credit' : 'debit';
            const merchantMatch = text.match(new RegExp(dp.merchantPattern, 'i'));
            const merchant = merchantMatch ? merchantMatch[1]?.trim() : 'Unknown';
            
            // Fallbacks for missing fields
            const accountLast4 = extractAccountLast4(text);
            const upiRef = extractUpiRef(text);
            const balance = extractBalance(text);
            const txnMode = detectTxnMode(text);
            const timestamp = extractTimestamp(text);

            return {
              amountPaise,
              type,
              merchant: merchant || 'Unknown',
              merchantNormalized: (merchant || 'unknown').toLowerCase(),
              accountLast4,
              balanceAfterPaise: balance,
              upiRef,
              txnTimestamp: timestamp,
              bankName,
              txnMode,
              originalCurrency: detectForeignCurrency(text),
              originalAmountPaise: detectForeignAmount(text),
              confidenceScore: 0,
              isPartial: text.length >= 155,
              rawText: text,
            };
          }
        }
      } catch (e) {
        console.error('[GenericParser] Invalid dynamic regex:', e);
      }
    }
  }

  // 2. Fallback to generic hardcoded patterns
  const amountPaise = extractAmountPaise(text);
  if (amountPaise <= 0) return null;

  // Detect transaction type
  const type = detectType(text);
  if (!type) return null;

  // Extract other fields
  const accountLast4 = extractAccountLast4(text);
  const upiRef = extractUpiRef(text);
  const balance = extractBalance(text);
  const txnMode = detectTxnMode(text);
  const merchant = extractMerchant(text, type);
  const timestamp = extractTimestamp(text);

  // Check for partial/truncated SMS
  const isPartial = text.length >= 155;

  return {
    amountPaise,
    type,
    merchant: merchant || 'Unknown',
    merchantNormalized: (merchant || 'unknown').toLowerCase(),
    accountLast4: accountLast4,
    balanceAfterPaise: balance,
    upiRef,
    txnTimestamp: timestamp,
    bankName,
    txnMode,
    originalCurrency: detectForeignCurrency(text),
    originalAmountPaise: detectForeignAmount(text),
    confidenceScore: 0, // Calculated by confidence.ts
    isPartial,
    rawText: text,
  };
}

// ═══════════════════════════════════════════════════════════
// EXTRACTION HELPERS
// ═══════════════════════════════════════════════════════════

export function extractAmountPaise(text: string): number {
  // Try multiple patterns
  const patterns = [
    COMMON.amount,
    COMMON.amountReverse,
    /(?:amount|amt)\s*:?\s*(?:Rs\.?|INR|₹)?\s*([0-9,]+\.?\d*)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      return extractAmountPaiseFromMatch(match[1]);
    }
  }

  return 0;
}

export function extractAmountPaiseFromMatch(amountStr: string): number {
  const cleaned = amountStr.replace(/,/g, '');
  const num = parseFloat(cleaned);
  if (!isNaN(num) && num > 0) {
    return Math.round(num * 100);
  }
  return 0;
}

export function detectType(text: string): TransactionType | null {
  // Check debit first (more common)
  if (COMMON.debitKeywords.test(text)) return 'debit';
  if (COMMON.creditKeywords.test(text)) return 'credit';
  return null;
}

export function extractAccountLast4(text: string): string | null {
  const match = text.match(COMMON.accountLast4);
  return match?.[1] ?? null;
}

export function extractUpiRef(text: string): string | null {
  const match = text.match(COMMON.upiRef) ?? text.match(COMMON.upiRefAlt);
  return match?.[1] ?? null;
}

export function extractBalance(text: string): number | null {
  const match = text.match(COMMON.balance);
  if (match?.[1]) {
    const cleaned = match[1].replace(/,/g, '');
    const num = parseFloat(cleaned);
    if (!isNaN(num) && num >= 0) {
      return Math.round(num * 100);
    }
  }
  return null;
}

export function detectTxnMode(text: string): TransactionMode | null {
  if (COMMON.modeUPI.test(text)) return 'UPI';
  if (COMMON.modeNEFT.test(text)) return 'NEFT';
  if (COMMON.modeIMPS.test(text)) return 'IMPS';
  if (COMMON.modeRTGS.test(text)) return 'RTGS';
  if (COMMON.modeATM.test(text)) return 'ATM';
  if (COMMON.modePOS.test(text)) return 'POS';
  if (COMMON.modeEMI.test(text)) return 'EMI';
  if (COMMON.modeAutoDebit.test(text)) return 'AutoDebit';
  if (COMMON.modeRefund.test(text)) return 'Refund';
  if (COMMON.modeNetBanking.test(text)) return 'NetBanking';
  return null;
}

export function extractMerchant(text: string, type: TransactionType): string | null {
  // Check VPA first
  const vpaMatch = text.match(COMMON.merchantVPA);
  if (vpaMatch?.[1]) {
    // Extract name from VPA (e.g., "merchant@upi" → "merchant")
    return vpaMatch[1].split('@')[0] ?? vpaMatch[1];
  }

  // For debits, look for "to" pattern
  if (type === 'debit') {
    const toMatch = text.match(COMMON.merchantTo);
    if (toMatch?.[1]) return toMatch[1].trim();

    const atMatch = text.match(COMMON.merchantAt);
    if (atMatch?.[1]) return atMatch[1].trim();
  }

  // For credits, look for "from" pattern
  if (type === 'credit') {
    // Check if it's a salary
    if (COMMON.salaryKeywords.test(text)) return 'Salary';

    const fromMatch = text.match(COMMON.merchantFrom);
    if (fromMatch?.[1]) return fromMatch[1].trim();
  }

  return null;
}

export function extractTimestamp(text: string): string | null {
  // Try DD-MMM-YY format (most common in Indian bank SMS)
  const dmmyMatch = text.match(COMMON.dateDDMMMYY);
  if (dmmyMatch) {
    return parseDateDDMMMYY(dmmyMatch[1] ?? '', dmmyMatch[2] ?? '', dmmyMatch[3] ?? '');
  }

  // Try DD/MM/YYYY format
  const ddmmMatch = text.match(COMMON.dateDDMMYYYY);
  if (ddmmMatch) {
    return parseDateDDMMYYYY(ddmmMatch[1] ?? '', ddmmMatch[2] ?? '', ddmmMatch[3] ?? '');
  }

  // Try YYYY-MM-DD format
  const ymdMatch = text.match(COMMON.dateYYYYMMDD);
  if (ymdMatch) {
    try {
      return new Date(`${ymdMatch[1]}-${ymdMatch[2]}-${ymdMatch[3]}T00:00:00.000Z`).toISOString();
    } catch {
      return null;
    }
  }

  return null;
}

function parseDateDDMMMYY(day: string, month: string, year: string): string | null {
  const months: Record<string, string> = {
    jan: '01', feb: '02', mar: '03', apr: '04', may: '05', jun: '06',
    jul: '07', aug: '08', sep: '09', oct: '10', nov: '11', dec: '12',
  };
  const m = months[month.toLowerCase()];
  if (!m) return null;

  const y = year.length === 2 ? `20${year}` : year;
  const d = day.padStart(2, '0');

  try {
    return new Date(`${y}-${m}-${d}T00:00:00.000Z`).toISOString();
  } catch {
    return null;
  }
}

function parseDateDDMMYYYY(day: string, month: string, year: string): string | null {
  const y = year.length === 2 ? `20${year}` : year;
  const m = month.padStart(2, '0');
  const d = day.padStart(2, '0');

  try {
    return new Date(`${y}-${m}-${d}T00:00:00.000Z`).toISOString();
  } catch {
    return null;
  }
}

export function detectForeignCurrency(text: string): string | null {
  const match = text.match(/\b(USD|EUR|GBP|AED|SGD|AUD|CAD|JPY|CHF|CNY|SAR|QAR|MYR|THB)\b/i);
  return match?.[1]?.toUpperCase() ?? null;
}

export function detectForeignAmount(text: string): number | null {
  const currency = detectForeignCurrency(text);
  if (!currency) return null;

  const match = text.match(new RegExp(`${currency}\\s*([0-9,]+\\.?\\d*)`, 'i'));
  if (match?.[1]) {
    const cleaned = match[1].replace(/,/g, '');
    const num = parseFloat(cleaned);
    if (!isNaN(num) && num > 0) {
      return Math.round(num * 100);
    }
  }
  return null;
}
