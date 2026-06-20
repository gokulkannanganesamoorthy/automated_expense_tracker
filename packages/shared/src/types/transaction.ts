import { z } from 'zod';

// ═══════════════════════════════════════════════════════════
// TRANSACTION ENUMS
// ═══════════════════════════════════════════════════════════

export const TransactionType = z.enum(['debit', 'credit']);
export type TransactionType = z.infer<typeof TransactionType>;

export const TransactionMode = z.enum([
  'UPI',
  'NEFT',
  'IMPS',
  'RTGS',
  'ATM',
  'POS',
  'EMI',
  'AutoDebit',
  'Refund',
  'NetBanking',
  'Card',
  'Unknown',
]);
export type TransactionMode = z.infer<typeof TransactionMode>;

export const TransactionSource = z.enum([
  'sms',
  'email',
  'manual',
  'upi_callback',
  'gpay_notification',
  'phonepe_notification',
  'paytm_notification',
  'cred_notification',
  'import_csv',
  'import_json',
]);
export type TransactionSource = z.infer<typeof TransactionSource>;

// ═══════════════════════════════════════════════════════════
// TRANSACTION SCHEMA
// ═══════════════════════════════════════════════════════════

export const TransactionSchema = z.object({
  id: z.string().uuid(),
  merchant: z.string().min(1),
  merchantNormalized: z.string().min(1),
  amountPaise: z.number().int().nonnegative(),
  type: TransactionType,
  category: z.string().min(1),
  subCategory: z.string().nullable(),
  source: TransactionSource,
  accountLast4: z.string().length(4).nullable(),
  upiRef: z.string().nullable(),
  bankName: z.string().nullable(),
  txnMode: TransactionMode.nullable(),
  originalCurrency: z.string().length(3).nullable(), // ISO 4217
  originalAmountPaise: z.number().int().nonnegative().nullable(),
  date: z.string().datetime(), // ISO8601 UTC
  parsedAt: z.string().datetime(),
  syncedAt: z.string().datetime().nullable(),
  isManual: z.boolean().default(false),
  isSplit: z.boolean().default(false),
  isRecurring: z.boolean().default(false),
  recurringGroupId: z.string().uuid().nullable(),
  confidenceScore: z.number().int().min(0).max(100).nullable(),
  needsReview: z.boolean().default(false),
  notes: z.string().nullable(),
  tags: z.array(z.string()).default([]),
  receiptUrl: z.string().url().nullable(),
  hash: z.string().min(1),
  isDeleted: z.boolean().default(false),
  deletedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Transaction = z.infer<typeof TransactionSchema>;

// ═══════════════════════════════════════════════════════════
// CREATE / UPDATE PARTIALS
// ═══════════════════════════════════════════════════════════

export const CreateTransactionSchema = TransactionSchema.omit({
  syncedAt: true,
  isDeleted: true,
  deletedAt: true,
  updatedAt: true,
}).extend({
  updatedAt: z.string().datetime().optional(),
});

export type CreateTransaction = z.infer<typeof CreateTransactionSchema>;

export const UpdateTransactionSchema = TransactionSchema.partial().required({
  id: true,
  updatedAt: true,
});

export type UpdateTransaction = z.infer<typeof UpdateTransactionSchema>;

// ═══════════════════════════════════════════════════════════
// PARSED SMS RESULT
// ═══════════════════════════════════════════════════════════

export const ParsedSmsResultSchema = z.object({
  amountPaise: z.number().int().nonnegative(),
  type: TransactionType,
  merchant: z.string(),
  merchantNormalized: z.string(),
  accountLast4: z.string().length(4).nullable(),
  balanceAfterPaise: z.number().int().nullable(),
  upiRef: z.string().nullable(),
  txnTimestamp: z.string().datetime().nullable(),
  bankName: z.string(),
  txnMode: TransactionMode.nullable(),
  originalCurrency: z.string().length(3).nullable(),
  originalAmountPaise: z.number().int().nonnegative().nullable(),
  confidenceScore: z.number().int().min(0).max(100),
  isPartial: z.boolean().default(false),
  rawText: z.string(),
});

export type ParsedSmsResult = z.infer<typeof ParsedSmsResultSchema>;

// ═══════════════════════════════════════════════════════════
// REVIEW QUEUE ITEM
// ═══════════════════════════════════════════════════════════

export const ReviewQueueItemSchema = z.object({
  id: z.string().uuid(),
  rawText: z.string(),
  sender: z.string(),
  receivedAt: z.string().datetime(),
  failureReason: z.string(),
  partialParse: ParsedSmsResultSchema.partial().nullable(),
  isResolved: z.boolean().default(false),
  resolvedAt: z.string().datetime().nullable(),
  resolvedTransactionId: z.string().uuid().nullable(),
  createdAt: z.string().datetime(),
});

export type ReviewQueueItem = z.infer<typeof ReviewQueueItemSchema>;

// ═══════════════════════════════════════════════════════════
// TRANSACTION FILTER
// ═══════════════════════════════════════════════════════════

export const TransactionFilterSchema = z.object({
  categories: z.array(z.string()).optional(),
  types: z.array(TransactionType).optional(),
  sources: z.array(TransactionSource).optional(),
  banks: z.array(z.string()).optional(),
  txnModes: z.array(TransactionMode).optional(),
  dateFrom: z.string().datetime().optional(),
  dateTo: z.string().datetime().optional(),
  amountMinPaise: z.number().int().nonnegative().optional(),
  amountMaxPaise: z.number().int().nonnegative().optional(),
  merchantSearch: z.string().optional(),
  isRecurring: z.boolean().optional(),
  needsReview: z.boolean().optional(),
  tags: z.array(z.string()).optional(),
});

export type TransactionFilter = z.infer<typeof TransactionFilterSchema>;

export const TransactionSortField = z.enum(['date', 'amount', 'merchant']);
export type TransactionSortField = z.infer<typeof TransactionSortField>;

export const SortDirection = z.enum(['asc', 'desc']);
export type SortDirection = z.infer<typeof SortDirection>;
