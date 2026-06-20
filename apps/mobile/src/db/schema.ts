/**
 * SQLite schema definition.
 * All tables, indices, and triggers for the local database.
 */

export const SCHEMA_VERSION = 1;

export const CREATE_TABLES_SQL = `
-- ═══════════════════════════════════════════════════════════
-- TRANSACTIONS
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS transactions (
  id TEXT PRIMARY KEY NOT NULL,
  merchant TEXT NOT NULL,
  merchant_normalized TEXT NOT NULL,
  amount_paise INTEGER NOT NULL CHECK(amount_paise >= 0),
  type TEXT NOT NULL CHECK(type IN ('debit', 'credit')),
  category TEXT NOT NULL,
  sub_category TEXT,
  source TEXT NOT NULL,
  account_last4 TEXT,
  upi_ref TEXT,
  bank_name TEXT,
  txn_mode TEXT,
  original_currency TEXT,
  original_amount_paise INTEGER,
  date TEXT NOT NULL,
  parsed_at TEXT NOT NULL,
  synced_at TEXT,
  is_manual INTEGER DEFAULT 0,
  is_split INTEGER DEFAULT 0,
  is_recurring INTEGER DEFAULT 0,
  recurring_group_id TEXT,
  confidence_score INTEGER,
  needs_review INTEGER DEFAULT 0,
  notes TEXT,
  tags TEXT DEFAULT '[]',
  receipt_url TEXT,
  hash TEXT UNIQUE NOT NULL,
  is_deleted INTEGER DEFAULT 0,
  deleted_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- Performance indices for transactions
CREATE INDEX IF NOT EXISTS idx_transactions_date ON transactions(date DESC);
CREATE INDEX IF NOT EXISTS idx_transactions_category ON transactions(category);
CREATE INDEX IF NOT EXISTS idx_transactions_merchant_normalized ON transactions(merchant_normalized);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON transactions(type);
CREATE INDEX IF NOT EXISTS idx_transactions_is_deleted ON transactions(is_deleted);
CREATE INDEX IF NOT EXISTS idx_transactions_needs_review ON transactions(needs_review);
CREATE INDEX IF NOT EXISTS idx_transactions_hash ON transactions(hash);
CREATE INDEX IF NOT EXISTS idx_transactions_synced_at ON transactions(synced_at);
CREATE INDEX IF NOT EXISTS idx_transactions_source ON transactions(source);
CREATE INDEX IF NOT EXISTS idx_transactions_bank_name ON transactions(bank_name);
CREATE INDEX IF NOT EXISTS idx_transactions_is_recurring ON transactions(is_recurring);
CREATE INDEX IF NOT EXISTS idx_transactions_date_type ON transactions(date DESC, type);
CREATE INDEX IF NOT EXISTS idx_transactions_category_date ON transactions(category, date DESC);

-- ═══════════════════════════════════════════════════════════
-- CUSTOM CATEGORY MAPPINGS
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS category_mappings (
  id TEXT PRIMARY KEY NOT NULL,
  merchant_normalized TEXT NOT NULL UNIQUE,
  category_id TEXT NOT NULL,
  sub_category TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_category_mappings_merchant ON category_mappings(merchant_normalized);

-- ═══════════════════════════════════════════════════════════
-- BUDGETS
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS budgets (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  amount_paise INTEGER NOT NULL CHECK(amount_paise >= 0),
  spent_paise INTEGER DEFAULT 0 CHECK(spent_paise >= 0),
  period TEXT NOT NULL CHECK(period IN ('monthly', 'weekly', 'custom')),
  category TEXT,
  start_date TEXT NOT NULL,
  end_date TEXT,
  is_active INTEGER DEFAULT 1,
  alert_at_50 INTEGER DEFAULT 1,
  alert_at_80 INTEGER DEFAULT 1,
  alert_at_100 INTEGER DEFAULT 1,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- ═══════════════════════════════════════════════════════════
-- SAVINGS GOALS
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS savings_goals (
  id TEXT PRIMARY KEY NOT NULL,
  name TEXT NOT NULL,
  target_amount_paise INTEGER NOT NULL CHECK(target_amount_paise > 0),
  current_amount_paise INTEGER DEFAULT 0 CHECK(current_amount_paise >= 0),
  deadline TEXT,
  icon_emoji TEXT DEFAULT '🎯',
  color_hex TEXT DEFAULT '#A78BFA',
  is_completed INTEGER DEFAULT 0,
  completed_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

-- ═══════════════════════════════════════════════════════════
-- SYNC QUEUE
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS sync_queue (
  id TEXT PRIMARY KEY NOT NULL,
  collection TEXT NOT NULL,
  document_id TEXT NOT NULL,
  operation TEXT NOT NULL CHECK(operation IN ('INSERT', 'UPDATE', 'DELETE')),
  data TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'in_progress', 'completed', 'failed', 'dead_letter')),
  retry_count INTEGER DEFAULT 0,
  max_retries INTEGER DEFAULT 3,
  last_error TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  completed_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue(status);
CREATE INDEX IF NOT EXISTS idx_sync_queue_created ON sync_queue(created_at);

-- ═══════════════════════════════════════════════════════════
-- REVIEW QUEUE
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS review_queue (
  id TEXT PRIMARY KEY NOT NULL,
  raw_text TEXT NOT NULL,
  sender TEXT NOT NULL,
  received_at TEXT NOT NULL,
  failure_reason TEXT NOT NULL,
  partial_parse TEXT,
  is_resolved INTEGER DEFAULT 0,
  resolved_at TEXT,
  resolved_transaction_id TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_review_queue_resolved ON review_queue(is_resolved);

-- ═══════════════════════════════════════════════════════════
-- RECURRING PATTERNS
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS recurring_patterns (
  id TEXT PRIMARY KEY NOT NULL,
  merchant_normalized TEXT NOT NULL,
  expected_amount_paise INTEGER NOT NULL,
  amount_variance_percent REAL DEFAULT 10,
  frequency TEXT NOT NULL CHECK(frequency IN ('weekly', 'monthly', 'quarterly', 'yearly')),
  expected_day_of_month INTEGER,
  last_occurrence TEXT,
  next_expected TEXT,
  is_subscription INTEGER DEFAULT 0,
  is_active INTEGER DEFAULT 1,
  transaction_ids TEXT DEFAULT '[]',
  alert_on_amount_change INTEGER DEFAULT 1,
  alert_amount_change_threshold_percent REAL DEFAULT 20,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_recurring_merchant ON recurring_patterns(merchant_normalized);
CREATE INDEX IF NOT EXISTS idx_recurring_active ON recurring_patterns(is_active);

-- ═══════════════════════════════════════════════════════════
-- SPLIT EXPENSES
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS split_expenses (
  id TEXT PRIMARY KEY NOT NULL,
  transaction_id TEXT NOT NULL,
  total_amount_paise INTEGER NOT NULL,
  split_method TEXT NOT NULL CHECK(split_method IN ('equal', 'percentage', 'custom')),
  participants TEXT NOT NULL,
  status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'partial', 'settled')),
  created_by_uid TEXT NOT NULL,
  description TEXT,
  settled_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (transaction_id) REFERENCES transactions(id)
);

-- ═══════════════════════════════════════════════════════════
-- AUDIT LOG
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS audit_log (
  id TEXT PRIMARY KEY NOT NULL,
  uid TEXT NOT NULL,
  event_type TEXT NOT NULL,
  device_info TEXT,
  ip_address TEXT,
  metadata TEXT DEFAULT '{}',
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_audit_log_uid ON audit_log(uid);
CREATE INDEX IF NOT EXISTS idx_audit_log_created ON audit_log(created_at DESC);

-- ═══════════════════════════════════════════════════════════
-- PARSER ERRORS (auto-purge after 30 days)
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS parser_errors (
  id TEXT PRIMARY KEY NOT NULL,
  raw_text TEXT NOT NULL,
  sender TEXT NOT NULL,
  error_message TEXT NOT NULL,
  stack_trace TEXT,
  bank_id TEXT,
  created_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_parser_errors_bank ON parser_errors(bank_id);
CREATE INDEX IF NOT EXISTS idx_parser_errors_created ON parser_errors(created_at);

-- ═══════════════════════════════════════════════════════════
-- NOTIFICATION LOG (for dedup)
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS notification_log (
  id TEXT PRIMARY KEY NOT NULL,
  notification_type TEXT NOT NULL,
  transaction_id TEXT,
  hash TEXT NOT NULL,
  sent_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_notification_log_hash ON notification_log(hash);
CREATE INDEX IF NOT EXISTS idx_notification_log_type ON notification_log(notification_type);

-- ═══════════════════════════════════════════════════════════
-- TRANSACTION HASHES (for dedup, with 90-day TTL)
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS hashes (
  hash TEXT PRIMARY KEY NOT NULL,
  transaction_id TEXT NOT NULL,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_hashes_expires ON hashes(expires_at);

-- ═══════════════════════════════════════════════════════════
-- SCHEMA METADATA
-- ═══════════════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS schema_meta (
  key TEXT PRIMARY KEY NOT NULL,
  value TEXT NOT NULL
);

INSERT OR REPLACE INTO schema_meta (key, value) VALUES ('version', '${SCHEMA_VERSION}');
INSERT OR REPLACE INTO schema_meta (key, value) VALUES ('created_at', datetime('now'));
`;

/**
 * Cleanup queries run periodically.
 */
export const CLEANUP_SQL = {
  /** Purge expired hashes (90-day TTL) */
  purgeExpiredHashes: `DELETE FROM hashes WHERE expires_at < datetime('now')`,

  /** Purge parser errors older than 30 days */
  purgeOldParserErrors: `DELETE FROM parser_errors WHERE created_at < datetime('now', '-30 days')`,

  /** Purge completed sync queue items older than 7 days */
  purgeCompletedSync: `DELETE FROM sync_queue WHERE status = 'completed' AND completed_at < datetime('now', '-7 days')`,

  /** Purge old notification log entries (90 days) */
  purgeOldNotifications: `DELETE FROM notification_log WHERE sent_at < datetime('now', '-90 days')`,

  /** Purge old audit log entries (365 days) */
  purgeOldAuditLog: `DELETE FROM audit_log WHERE created_at < datetime('now', '-365 days')`,
} as const;
