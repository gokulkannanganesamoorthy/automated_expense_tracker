/**
 * Confidence scoring for parsed SMS results.
 * Score 0-100 determines if transaction goes to review queue.
 * <70 → review queue, 70-89 → saved with optional review flag, 90+ → silent save.
 */

import type { ParsedSmsResult } from '@expense-tracker/shared';

// ═══════════════════════════════════════════════════════════
// SCORING WEIGHTS
// ═══════════════════════════════════════════════════════════

const WEIGHTS = {
  SENDER_WHITELISTED: 15,        // Sender in known bank list
  AMOUNT_EXTRACTED: 20,          // Amount successfully parsed
  AMOUNT_REASONABLE: 5,          // Amount within reasonable bounds
  TYPE_DETECTED: 10,             // Debit/credit determined
  MERCHANT_EXTRACTED: 15,        // Merchant name found
  MERCHANT_QUALITY: 5,           // Merchant name > 2 chars and not generic
  ACCOUNT_LAST4: 10,             // Account number last 4 found
  TIMESTAMP_EXTRACTED: 5,        // Transaction timestamp found
  UPI_REF_FOUND: 5,             // UPI reference number found
  TXN_MODE_DETECTED: 5,         // Transaction mode identified
  BALANCE_FOUND: 5,             // Available balance found
} as const;

const MAX_SCORE = Object.values(WEIGHTS).reduce((a, b) => a + b, 0); // Should be 100

// ═══════════════════════════════════════════════════════════
// CONFIDENCE CALCULATOR
// ═══════════════════════════════════════════════════════════

/**
 * Calculate confidence score for a parsed SMS result.
 * @param parsed - The parsed result
 * @param sender - Normalized sender ID
 * @param rawSms - Original SMS text
 * @returns Score 0-100
 */
export function calculateConfidence(
  parsed: ParsedSmsResult,
  sender: string,
  rawSms: string,
): number {
  let score = 0;

  // Sender whitelisted (already passed whitelist check if we're here)
  score += WEIGHTS.SENDER_WHITELISTED;

  // Amount extracted
  if (parsed.amountPaise > 0) {
    score += WEIGHTS.AMOUNT_EXTRACTED;

    // Amount reasonable (between 1 paise and ₹10 crore)
    if (parsed.amountPaise >= 1 && parsed.amountPaise <= 1_000_000_000_00) {
      score += WEIGHTS.AMOUNT_REASONABLE;
    }
  }

  // Transaction type detected
  if (parsed.type === 'debit' || parsed.type === 'credit') {
    score += WEIGHTS.TYPE_DETECTED;
  }

  // Merchant extracted
  if (parsed.merchant && parsed.merchant.length > 0) {
    score += WEIGHTS.MERCHANT_EXTRACTED;

    // Merchant quality — more than 2 chars and not just numbers
    if (parsed.merchant.length > 2 && !/^\d+$/.test(parsed.merchant)) {
      score += WEIGHTS.MERCHANT_QUALITY;
    }
  }

  // Account last 4
  if (parsed.accountLast4 && /^\d{4}$/.test(parsed.accountLast4)) {
    score += WEIGHTS.ACCOUNT_LAST4;
  }

  // Timestamp extracted (not just using SMS receive time)
  if (parsed.txnTimestamp) {
    score += WEIGHTS.TIMESTAMP_EXTRACTED;
  }

  // UPI reference
  if (parsed.upiRef && parsed.upiRef.length >= 6) {
    score += WEIGHTS.UPI_REF_FOUND;
  }

  // Transaction mode
  if (parsed.txnMode) {
    score += WEIGHTS.TXN_MODE_DETECTED;
  }

  // Balance after transaction
  if (parsed.balanceAfterPaise !== null && parsed.balanceAfterPaise >= 0) {
    score += WEIGHTS.BALANCE_FOUND;
  }

  // Penalty: SMS truncated (160 char carrier limit)
  if (rawSms.length >= 155 && parsed.isPartial) {
    score = Math.max(0, score - 15);
  }

  // Penalty: very short SMS (likely incomplete)
  if (rawSms.length < 50) {
    score = Math.max(0, score - 10);
  }

  // Cap at 100
  return Math.min(100, Math.round((score / MAX_SCORE) * 100));
}

// ═══════════════════════════════════════════════════════════
// CONFIDENCE BAND
// ═══════════════════════════════════════════════════════════

export type ConfidenceBand = 'low' | 'medium' | 'high';

export function getConfidenceBand(score: number): ConfidenceBand {
  if (score < 70) return 'low';
  if (score < 90) return 'medium';
  return 'high';
}

export function shouldAutoSave(score: number): boolean {
  return score >= 70;
}

export function shouldFlagForReview(score: number): boolean {
  return score < 70;
}

export function shouldNotifyUser(score: number): boolean {
  return score >= 90;
}
