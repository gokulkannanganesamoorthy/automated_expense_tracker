/**
 * Bank SMS parser dispatcher.
 * Routes SMS to the correct bank-specific parser or the generic fallback.
 * Integrates dynamic patterns fetched from Firebase Remote Config.
 */

import type { ParsedSmsResult } from '@expense-tracker/shared';
import { parseHDFCSms } from './hdfc';
import { parseSBISms } from './sbi';
import { parseGenericBankSms } from './generic';

// ═══════════════════════════════════════════════════════════
// DYNAMIC PATTERNS STORE (From Firebase Remote Config)
// ═══════════════════════════════════════════════════════════

export interface DynamicBankPattern {
  amountPattern: string; // Regex string
  typePattern: string; // Regex string for debit/credit detection
  merchantPattern: string; // Regex string
  dateFormat: string; // e.g., 'dd-MMM-yy'
}

const remotePatterns: Record<string, DynamicBankPattern[]> = {};

/**
 * Update dynamic patterns from Firebase Remote Config.
 * Call this when the app starts or config updates.
 */
export function updateDynamicPatterns(patterns: Record<string, DynamicBankPattern[]>) {
  Object.assign(remotePatterns, patterns);
}

// ═══════════════════════════════════════════════════════════
// BANK PARSER REGISTRY
// ═══════════════════════════════════════════════════════════

type BankParser = (smsBody: string, bankName: string) => ParsedSmsResult | null;

// We only maintain explicit parsers for highly complex banks.
// The rest use the generic fallback parser + dynamic remote patterns.
const CUSTOM_PARSERS: Record<string, BankParser> = {
  hdfc: parseHDFCSms,
  sbi: parseSBISms,
};

// ═══════════════════════════════════════════════════════════
// DISPATCHER
// ═══════════════════════════════════════════════════════════

/**
 * Parse an SMS body using the bank-specific parser or generic fallback.
 */
export function parseBankSms(
  bankId: string,
  smsBody: string,
  bankName: string,
): ParsedSmsResult | null {
  // 1. Try custom explicit parser if it exists
  const customParser = CUSTOM_PARSERS[bankId];
  if (customParser) {
    try {
      const result = customParser(smsBody, bankName);
      if (result) return result;
    } catch (error) {
      console.error(`[BankParser] Custom parser error for ${bankId}:`, error);
    }
  }

  // 2. Fallback: Generic parser (which will also use remote patterns if we implement them in generic.ts)
  try {
    const dynamicPatterns = remotePatterns[bankId];
    return parseGenericBankSms(smsBody, bankName, dynamicPatterns);
  } catch (error) {
    console.error(`[BankParser] Generic parser error for ${bankId}:`, error);
    return null;
  }
}

/**
 * Check if a parser exists for a given bank (always true now due to generic fallback).
 */
export function hasBankParser(bankId: string): boolean {
  return true; // We can attempt to parse any bank with the generic parser
}

/**
 * Get list of banks with custom explicit parsers.
 */
export function getCustomBankIds(): string[] {
  return Object.keys(CUSTOM_PARSERS);
}
