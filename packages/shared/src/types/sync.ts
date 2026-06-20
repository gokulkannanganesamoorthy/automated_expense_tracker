import { z } from 'zod';

// ═══════════════════════════════════════════════════════════
// SYNC OPERATION
// ═══════════════════════════════════════════════════════════

export const SyncOperation = z.enum(['INSERT', 'UPDATE', 'DELETE']);
export type SyncOperation = z.infer<typeof SyncOperation>;

export const SyncStatus = z.enum([
  'pending',
  'in_progress',
  'completed',
  'failed',
  'dead_letter',
]);
export type SyncStatus = z.infer<typeof SyncStatus>;

export const SyncCollectionType = z.enum([
  'transactions',
  'budgets',
  'categories',
  'settings',
  'split_expenses',
  'recurring_patterns',
]);
export type SyncCollectionType = z.infer<typeof SyncCollectionType>;

// ═══════════════════════════════════════════════════════════
// SYNC QUEUE ITEM
// ═══════════════════════════════════════════════════════════

export const SyncQueueItemSchema = z.object({
  id: z.string().uuid(),
  collection: SyncCollectionType,
  documentId: z.string(),
  operation: SyncOperation,
  data: z.string(), // JSON-serialized document
  status: SyncStatus.default('pending'),
  retryCount: z.number().int().nonnegative().default(0),
  maxRetries: z.number().int().default(3),
  lastError: z.string().nullable().default(null),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  completedAt: z.string().datetime().nullable().default(null),
});

export type SyncQueueItem = z.infer<typeof SyncQueueItemSchema>;

// ═══════════════════════════════════════════════════════════
// SYNC METADATA
// ═══════════════════════════════════════════════════════════

export const SyncMetadataSchema = z.object({
  date: z.string(), // YYYY-MM-DD
  transactionCount: z.number().int().nonnegative(),
  lastTransactionId: z.string().nullable(),
  lastSyncTimestamp: z.string().datetime(),
  checksum: z.string(), // for integrity verification
});

export type SyncMetadata = z.infer<typeof SyncMetadataSchema>;

// ═══════════════════════════════════════════════════════════
// CONFLICT RESOLUTION
// ═══════════════════════════════════════════════════════════

export const ConflictResolutionStrategy = z.enum([
  'server_wins',     // For ordering/timestamps
  'local_wins',      // For user edits (notes, category corrections)
  'manual',          // User decides
]);
export type ConflictResolutionStrategy = z.infer<typeof ConflictResolutionStrategy>;

export const SyncConflictSchema = z.object({
  id: z.string().uuid(),
  documentId: z.string(),
  collection: SyncCollectionType,
  localData: z.string(), // JSON
  serverData: z.string(), // JSON
  strategy: ConflictResolutionStrategy,
  resolvedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
});

export type SyncConflict = z.infer<typeof SyncConflictSchema>;

// ═══════════════════════════════════════════════════════════
// SYNC STATE (for UI display)
// ═══════════════════════════════════════════════════════════

export const SyncState = z.enum([
  'idle',
  'syncing',
  'offline',
  'error',
  'paused', // e.g., Firebase quota hit
]);
export type SyncState = z.infer<typeof SyncState>;

export const SyncStatusInfoSchema = z.object({
  state: SyncState,
  lastSyncedAt: z.string().datetime().nullable(),
  pendingCount: z.number().int().nonnegative(),
  failedCount: z.number().int().nonnegative(),
  errorMessage: z.string().nullable(),
  isOnline: z.boolean(),
});

export type SyncStatusInfo = z.infer<typeof SyncStatusInfoSchema>;

// ═══════════════════════════════════════════════════════════
// BATCH SYNC CONFIG
// ═══════════════════════════════════════════════════════════

export const SYNC_CONFIG = {
  MAX_BATCH_SIZE: 500,
  SYNC_INTERVAL_MS: 60_000,       // 60 seconds
  RETRY_DELAY_BASE_MS: 1_000,     // 1 second base, exponential backoff
  MAX_RETRY_DELAY_MS: 300_000,    // 5 minutes max
  MAX_RETRIES: 3,
  FULL_RESYNC_OFFLINE_DAYS: 7,
  STALE_SYNC_ALERT_HOURS: 24,
} as const;
