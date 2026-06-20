/**
 * Local SQLite repository for transactions.
 * All reads/writes go through here — never direct SQL in components.
 */

import { v4 as uuidv4 } from 'uuid';
import type {
  Transaction,
  TransactionFilter,
  TransactionSortField,
  SortDirection,
  CreateTransaction,
  UpdateTransaction,
} from '@expense-tracker/shared';
import { getDatabase, withTransaction } from '../database';

// ═══════════════════════════════════════════════════════════
// ROW → TRANSACTION MAPPER
// ═══════════════════════════════════════════════════════════

interface TransactionRow {
  id: string;
  merchant: string;
  merchant_normalized: string;
  amount_paise: number;
  type: string;
  category: string;
  sub_category: string | null;
  source: string;
  account_last4: string | null;
  upi_ref: string | null;
  bank_name: string | null;
  txn_mode: string | null;
  original_currency: string | null;
  original_amount_paise: number | null;
  date: string;
  parsed_at: string;
  synced_at: string | null;
  is_manual: number;
  is_split: number;
  is_recurring: number;
  recurring_group_id: string | null;
  confidence_score: number | null;
  needs_review: number;
  notes: string | null;
  tags: string;
  receipt_url: string | null;
  hash: string;
  is_deleted: number;
  deleted_at: string | null;
  created_at: string;
  updated_at: string;
}

function rowToTransaction(row: TransactionRow): Transaction {
  return {
    id: row.id,
    merchant: row.merchant,
    merchantNormalized: row.merchant_normalized,
    amountPaise: row.amount_paise,
    type: row.type as Transaction['type'],
    category: row.category,
    subCategory: row.sub_category,
    source: row.source as Transaction['source'],
    accountLast4: row.account_last4,
    upiRef: row.upi_ref,
    bankName: row.bank_name,
    txnMode: row.txn_mode as Transaction['txnMode'],
    originalCurrency: row.original_currency,
    originalAmountPaise: row.original_amount_paise,
    date: row.date,
    parsedAt: row.parsed_at,
    syncedAt: row.synced_at,
    isManual: row.is_manual === 1,
    isSplit: row.is_split === 1,
    isRecurring: row.is_recurring === 1,
    recurringGroupId: row.recurring_group_id,
    confidenceScore: row.confidence_score,
    needsReview: row.needs_review === 1,
    notes: row.notes,
    tags: JSON.parse(row.tags || '[]') as string[],
    receiptUrl: row.receipt_url,
    hash: row.hash,
    isDeleted: row.is_deleted === 1,
    deletedAt: row.deleted_at,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

// ═══════════════════════════════════════════════════════════
// TRANSACTION REPOSITORY
// ═══════════════════════════════════════════════════════════

export class TransactionRepository {

  // ── INSERT ────────────────────────────────────────────────

  async insert(txn: CreateTransaction): Promise<Transaction> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    const transaction: Transaction = {
      ...txn,
      syncedAt: null,
      isDeleted: false,
      deletedAt: null,
      updatedAt: txn.updatedAt ?? now,
    };

    await db.runAsync(
      `INSERT INTO transactions (
        id, merchant, merchant_normalized, amount_paise, type, category,
        sub_category, source, account_last4, upi_ref, bank_name, txn_mode,
        original_currency, original_amount_paise, date, parsed_at, synced_at,
        is_manual, is_split, is_recurring, recurring_group_id,
        confidence_score, needs_review, notes, tags, receipt_url, hash,
        is_deleted, deleted_at, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        transaction.id,
        transaction.merchant,
        transaction.merchantNormalized,
        transaction.amountPaise,
        transaction.type,
        transaction.category,
        transaction.subCategory,
        transaction.source,
        transaction.accountLast4,
        transaction.upiRef,
        transaction.bankName,
        transaction.txnMode,
        transaction.originalCurrency,
        transaction.originalAmountPaise,
        transaction.date,
        transaction.parsedAt,
        transaction.syncedAt,
        transaction.isManual ? 1 : 0,
        transaction.isSplit ? 1 : 0,
        transaction.isRecurring ? 1 : 0,
        transaction.recurringGroupId,
        transaction.confidenceScore,
        transaction.needsReview ? 1 : 0,
        transaction.notes,
        JSON.stringify(transaction.tags),
        transaction.receiptUrl,
        transaction.hash,
        transaction.isDeleted ? 1 : 0,
        transaction.deletedAt,
        transaction.createdAt,
        transaction.updatedAt,
      ],
    );

    return transaction;
  }

  // ── BULK INSERT ───────────────────────────────────────────

  async insertBatch(transactions: CreateTransaction[]): Promise<number> {
    return withTransaction(async (db) => {
      let inserted = 0;
      for (const txn of transactions) {
        try {
          await this.insert(txn);
          inserted++;
        } catch (error) {
          // Skip duplicates (hash constraint violation)
          const err = error as Error;
          if (!err.message?.includes('UNIQUE constraint failed')) {
            console.error('[TransactionRepo] Batch insert error:', error);
          }
        }
      }
      return inserted;
    });
  }

  // ── GET BY ID ─────────────────────────────────────────────

  async getById(id: string): Promise<Transaction | null> {
    const db = await getDatabase();
    const row = await db.getFirstAsync<TransactionRow>(
      `SELECT * FROM transactions WHERE id = ? AND is_deleted = 0`,
      [id],
    );
    return row ? rowToTransaction(row) : null;
  }

  // ── LIST WITH FILTERS ────────────────────────────────────

  async list(
    filter: TransactionFilter = {},
    sortField: TransactionSortField = 'date',
    sortDirection: SortDirection = 'desc',
    limit: number = 50,
    offset: number = 0,
  ): Promise<{ transactions: Transaction[]; totalCount: number }> {
    const db = await getDatabase();
    const { where, params } = buildWhereClause(filter);

    const sortColumn = SORT_COLUMN_MAP[sortField];
    const direction = sortDirection.toUpperCase();

    // Get total count
    const countResult = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM transactions WHERE is_deleted = 0 ${where}`,
      params,
    );
    const totalCount = countResult?.count ?? 0;

    // Get paginated results
    const rows = await db.getAllAsync<TransactionRow>(
      `SELECT * FROM transactions WHERE is_deleted = 0 ${where}
       ORDER BY ${sortColumn} ${direction}
       LIMIT ? OFFSET ?`,
      [...params, limit, offset],
    );

    return {
      transactions: rows.map(rowToTransaction),
      totalCount,
    };
  }

  // ── RECENT ────────────────────────────────────────────────

  async getRecent(limit: number = 5): Promise<Transaction[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<TransactionRow>(
      `SELECT * FROM transactions WHERE is_deleted = 0
       ORDER BY date DESC LIMIT ?`,
      [limit],
    );
    return rows.map(rowToTransaction);
  }

  // ── SEARCH ────────────────────────────────────────────────

  async search(query: string, limit: number = 20): Promise<Transaction[]> {
    const db = await getDatabase();
    const normalized = query.toLowerCase().trim();
    const rows = await db.getAllAsync<TransactionRow>(
      `SELECT * FROM transactions
       WHERE is_deleted = 0
       AND (merchant_normalized LIKE ? OR notes LIKE ? OR category LIKE ?)
       ORDER BY date DESC LIMIT ?`,
      [`%${normalized}%`, `%${normalized}%`, `%${normalized}%`, limit],
    );
    return rows.map(rowToTransaction);
  }

  // ── UPDATE ────────────────────────────────────────────────

  async update(id: string, updates: Partial<Transaction>): Promise<void> {
    const db = await getDatabase();
    const now = new Date().toISOString();

    const setClauses: string[] = ['updated_at = ?'];
    const values: unknown[] = [now];

    if (updates.merchant !== undefined) { setClauses.push('merchant = ?'); values.push(updates.merchant); }
    if (updates.merchantNormalized !== undefined) { setClauses.push('merchant_normalized = ?'); values.push(updates.merchantNormalized); }
    if (updates.amountPaise !== undefined) { setClauses.push('amount_paise = ?'); values.push(updates.amountPaise); }
    if (updates.type !== undefined) { setClauses.push('type = ?'); values.push(updates.type); }
    if (updates.category !== undefined) { setClauses.push('category = ?'); values.push(updates.category); }
    if (updates.subCategory !== undefined) { setClauses.push('sub_category = ?'); values.push(updates.subCategory); }
    if (updates.notes !== undefined) { setClauses.push('notes = ?'); values.push(updates.notes); }
    if (updates.tags !== undefined) { setClauses.push('tags = ?'); values.push(JSON.stringify(updates.tags)); }
    if (updates.receiptUrl !== undefined) { setClauses.push('receipt_url = ?'); values.push(updates.receiptUrl); }
    if (updates.isSplit !== undefined) { setClauses.push('is_split = ?'); values.push(updates.isSplit ? 1 : 0); }
    if (updates.isRecurring !== undefined) { setClauses.push('is_recurring = ?'); values.push(updates.isRecurring ? 1 : 0); }
    if (updates.recurringGroupId !== undefined) { setClauses.push('recurring_group_id = ?'); values.push(updates.recurringGroupId); }
    if (updates.needsReview !== undefined) { setClauses.push('needs_review = ?'); values.push(updates.needsReview ? 1 : 0); }
    if (updates.syncedAt !== undefined) { setClauses.push('synced_at = ?'); values.push(updates.syncedAt); }

    values.push(id);

    await db.runAsync(
      `UPDATE transactions SET ${setClauses.join(', ')} WHERE id = ?`,
      values,
    );
  }

  // ── SOFT DELETE ───────────────────────────────────────────

  async softDelete(id: string): Promise<void> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    await db.runAsync(
      `UPDATE transactions SET is_deleted = 1, deleted_at = ?, updated_at = ? WHERE id = ?`,
      [now, now, id],
    );
  }

  // ── BULK SOFT DELETE ──────────────────────────────────────

  async bulkSoftDelete(ids: string[]): Promise<void> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    const placeholders = ids.map(() => '?').join(',');
    await db.runAsync(
      `UPDATE transactions SET is_deleted = 1, deleted_at = ?, updated_at = ?
       WHERE id IN (${placeholders})`,
      [now, now, ...ids],
    );
  }

  // ── UNDO DELETE ───────────────────────────────────────────

  async undoDelete(id: string): Promise<void> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    await db.runAsync(
      `UPDATE transactions SET is_deleted = 0, deleted_at = NULL, updated_at = ? WHERE id = ?`,
      [now, id],
    );
  }

  // ── HARD DELETE ALL (account deletion) ────────────────────

  async hardDeleteAll(): Promise<void> {
    const db = await getDatabase();
    await db.runAsync('DELETE FROM transactions');
  }

  // ── AGGREGATIONS ──────────────────────────────────────────

  async getTotalSpentThisMonth(): Promise<number> {
    const db = await getDatabase();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const result = await db.getFirstAsync<{ total: number | null }>(
      `SELECT SUM(amount_paise) as total FROM transactions
       WHERE type = 'debit' AND is_deleted = 0 AND date >= ?`,
      [startOfMonth],
    );
    return result?.total ?? 0;
  }

  async getTotalIncomeThisMonth(): Promise<number> {
    const db = await getDatabase();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const result = await db.getFirstAsync<{ total: number | null }>(
      `SELECT SUM(amount_paise) as total FROM transactions
       WHERE type = 'credit' AND is_deleted = 0 AND date >= ?`,
      [startOfMonth],
    );
    return result?.total ?? 0;
  }

  async getTodaySpent(): Promise<number> {
    const db = await getDatabase();
    const today = new Date().toISOString().split('T')[0] ?? '';
    const result = await db.getFirstAsync<{ total: number | null }>(
      `SELECT SUM(amount_paise) as total FROM transactions
       WHERE type = 'debit' AND is_deleted = 0 AND date LIKE ?`,
      [`${today}%`],
    );
    return result?.total ?? 0;
  }

  async getSpendByCategory(startDate: string, endDate: string): Promise<Array<{ category: string; totalPaise: number }>> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<{ category: string; total_paise: number }>(
      `SELECT category, SUM(amount_paise) as total_paise FROM transactions
       WHERE type = 'debit' AND is_deleted = 0 AND date >= ? AND date < ?
       GROUP BY category ORDER BY total_paise DESC`,
      [startDate, endDate],
    );
    return rows.map((r) => ({ category: r.category, totalPaise: r.total_paise }));
  }

  async getDailySpend(days: number = 7): Promise<Array<{ date: string; totalPaise: number }>> {
    const db = await getDatabase();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    const rows = await db.getAllAsync<{ day: string; total_paise: number }>(
      `SELECT substr(date, 1, 10) as day, SUM(amount_paise) as total_paise
       FROM transactions
       WHERE type = 'debit' AND is_deleted = 0 AND date >= ?
       GROUP BY day ORDER BY day ASC`,
      [startDate.toISOString()],
    );
    return rows.map((r) => ({ date: r.day, totalPaise: r.total_paise }));
  }

  async getTopMerchants(limit: number = 10, startDate: string, endDate: string): Promise<Array<{ merchant: string; totalPaise: number; count: number }>> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<{ merchant_normalized: string; total_paise: number; count: number }>(
      `SELECT merchant_normalized, SUM(amount_paise) as total_paise, COUNT(*) as count
       FROM transactions
       WHERE type = 'debit' AND is_deleted = 0 AND date >= ? AND date < ?
       GROUP BY merchant_normalized
       ORDER BY total_paise DESC LIMIT ?`,
      [startDate, endDate, limit],
    );
    return rows.map((r) => ({ merchant: r.merchant_normalized, totalPaise: r.total_paise, count: r.count }));
  }

  async getCount(): Promise<number> {
    const db = await getDatabase();
    const result = await db.getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM transactions WHERE is_deleted = 0`,
    );
    return result?.count ?? 0;
  }

  // ── UNSYNCED ──────────────────────────────────────────────

  async getUnsynced(limit: number = 500): Promise<Transaction[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<TransactionRow>(
      `SELECT * FROM transactions WHERE synced_at IS NULL AND is_deleted = 0
       ORDER BY created_at ASC LIMIT ?`,
      [limit],
    );
    return rows.map(rowToTransaction);
  }

  async markSynced(ids: string[]): Promise<void> {
    const db = await getDatabase();
    const now = new Date().toISOString();
    const placeholders = ids.map(() => '?').join(',');
    await db.runAsync(
      `UPDATE transactions SET synced_at = ?, updated_at = ? WHERE id IN (${placeholders})`,
      [now, now, ...ids],
    );
  }

  // ── REVIEW QUEUE ITEMS ────────────────────────────────────

  async getReviewNeeded(limit: number = 50): Promise<Transaction[]> {
    const db = await getDatabase();
    const rows = await db.getAllAsync<TransactionRow>(
      `SELECT * FROM transactions WHERE needs_review = 1 AND is_deleted = 0
       ORDER BY date DESC LIMIT ?`,
      [limit],
    );
    return rows.map(rowToTransaction);
  }
}

// ═══════════════════════════════════════════════════════════
// FILTER BUILDER
// ═══════════════════════════════════════════════════════════

const SORT_COLUMN_MAP: Record<TransactionSortField, string> = {
  date: 'date',
  amount: 'amount_paise',
  merchant: 'merchant_normalized',
};

function buildWhereClause(filter: TransactionFilter): { where: string; params: unknown[] } {
  const conditions: string[] = [];
  const params: unknown[] = [];

  if (filter.categories?.length) {
    const placeholders = filter.categories.map(() => '?').join(',');
    conditions.push(`AND category IN (${placeholders})`);
    params.push(...filter.categories);
  }

  if (filter.types?.length) {
    const placeholders = filter.types.map(() => '?').join(',');
    conditions.push(`AND type IN (${placeholders})`);
    params.push(...filter.types);
  }

  if (filter.sources?.length) {
    const placeholders = filter.sources.map(() => '?').join(',');
    conditions.push(`AND source IN (${placeholders})`);
    params.push(...filter.sources);
  }

  if (filter.banks?.length) {
    const placeholders = filter.banks.map(() => '?').join(',');
    conditions.push(`AND bank_name IN (${placeholders})`);
    params.push(...filter.banks);
  }

  if (filter.txnModes?.length) {
    const placeholders = filter.txnModes.map(() => '?').join(',');
    conditions.push(`AND txn_mode IN (${placeholders})`);
    params.push(...filter.txnModes);
  }

  if (filter.dateFrom) {
    conditions.push('AND date >= ?');
    params.push(filter.dateFrom);
  }

  if (filter.dateTo) {
    conditions.push('AND date < ?');
    params.push(filter.dateTo);
  }

  if (filter.amountMinPaise !== undefined) {
    conditions.push('AND amount_paise >= ?');
    params.push(filter.amountMinPaise);
  }

  if (filter.amountMaxPaise !== undefined) {
    conditions.push('AND amount_paise <= ?');
    params.push(filter.amountMaxPaise);
  }

  if (filter.merchantSearch) {
    conditions.push('AND merchant_normalized LIKE ?');
    params.push(`%${filter.merchantSearch.toLowerCase()}%`);
  }

  if (filter.isRecurring !== undefined) {
    conditions.push('AND is_recurring = ?');
    params.push(filter.isRecurring ? 1 : 0);
  }

  if (filter.needsReview !== undefined) {
    conditions.push('AND needs_review = ?');
    params.push(filter.needsReview ? 1 : 0);
  }

  return { where: conditions.join(' '), params };
}

// Export singleton
export const transactionRepo = new TransactionRepository();
