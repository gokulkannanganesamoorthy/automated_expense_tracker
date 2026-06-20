/**
 * Transaction Category Classifier.
 * Rules-based engine for assigning categories to transactions.
 */

import { DEFAULT_CATEGORIES } from '@expense-tracker/shared';

// Pre-compute lookup maps
const KEYWORD_MAP = new Map<string, string>(); // lowercase keyword -> category ID

// Populate the keyword map from default categories
for (const category of DEFAULT_CATEGORIES) {
  for (const keyword of category.keywords) {
    KEYWORD_MAP.set(keyword.toLowerCase(), category.id);
  }
}

export interface ClassificationResult {
  categoryId: string;
  subCategory: string | null;
}

/**
 * Classify a transaction based on merchant name, mode, and type.
 */
export function classifyCategory(
  merchantNormalized: string,
  txnMode: string | null,
  type: 'debit' | 'credit',
): ClassificationResult {
  // Always set Income for credits unless there's a specific refund pattern
  if (type === 'credit') {
    if (merchantNormalized.includes('refund') || txnMode === 'Refund') {
      return { categoryId: 'other', subCategory: 'Refund' };
    }
    if (merchantNormalized.includes('salary')) {
      return { categoryId: 'income', subCategory: 'Salary' };
    }
    return { categoryId: 'income', subCategory: null };
  }

  const normalized = merchantNormalized.toLowerCase();

  // Try exact match on keywords
  for (const [keyword, categoryId] of KEYWORD_MAP.entries()) {
    if (normalized.includes(keyword)) {
      return { categoryId, subCategory: null };
    }
  }

  // Fallback heuristics based on mode or names
  if (txnMode === 'ATM') {
    return { categoryId: 'cash', subCategory: 'ATM Withdrawal' };
  }

  if (normalized.includes('upi') || txnMode === 'UPI') {
    return { categoryId: 'transfer', subCategory: 'UPI' };
  }

  return { categoryId: 'other', subCategory: null };
}
