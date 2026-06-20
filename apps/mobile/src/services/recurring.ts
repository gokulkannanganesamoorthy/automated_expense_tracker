import type { Transaction } from '@expense-tracker/shared';

export interface RecurringPattern {
  merchant: string;
  amountPaise: number;
  frequency: 'monthly' | 'yearly' | 'weekly';
  confidence: number; // 0-100
  lastSeenDate: number;
  nextExpectedDate: number;
}

export const recurringService = {
  /**
   * Analyzes past transactions to detect recurring patterns
   * Strategy: Group by merchant -> group by amount -> calculate time deltas
   */
  detectRecurringSubscriptions(transactions: Transaction[]): RecurringPattern[] {
    const patterns: RecurringPattern[] = [];
    
    // 1. Group by merchant
    const byMerchant = new Map<string, Transaction[]>();
    for (const txn of transactions) {
      if (!txn.merchant || txn.type !== 'debit') continue;
      const normalizedMerchant = txn.merchant.toLowerCase().trim();
      
      const existing = byMerchant.get(normalizedMerchant) || [];
      existing.push(txn);
      byMerchant.set(normalizedMerchant, existing);
    }

    // 2. Analyze each group for frequency
    for (const [merchant, txns] of byMerchant.entries()) {
      if (txns.length < 2) continue; // Need at least 2 to establish a pattern

      // Sort by date ascending
      txns.sort((a, b) => a.date - b.date);

      // Simple heuristic for monthly (approx 30 days)
      const deltas = [];
      for (let i = 1; i < txns.length; i++) {
        const diffMs = txns[i].date - txns[i-1].date;
        const diffDays = diffMs / (1000 * 60 * 60 * 24);
        deltas.push(diffDays);
      }

      // Check if all deltas are around 28-31 days
      const isMonthly = deltas.every(d => d >= 27 && d <= 32);
      
      if (isMonthly) {
        // Find most common amount
        const lastTxn = txns[txns.length - 1];
        patterns.push({
          merchant,
          amountPaise: lastTxn.amountPaise,
          frequency: 'monthly',
          confidence: Math.min(100, txns.length * 20), // 5 hits = 100%
          lastSeenDate: lastTxn.date,
          // Next expected date approx 30 days from last seen
          nextExpectedDate: lastTxn.date + (30 * 24 * 60 * 60 * 1000)
        });
      }
    }

    return patterns;
  }
};
