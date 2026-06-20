/**
 * SQLite database initialization and migration runner.
 * Uses expo-sqlite for local-first data storage.
 */

import * as SQLite from 'expo-sqlite';
import { CREATE_TABLES_SQL, CLEANUP_SQL, SCHEMA_VERSION } from './schema';

let db: SQLite.SQLiteDatabase | null = null;

const DB_NAME = 'expense_tracker.db';

// ═══════════════════════════════════════════════════════════
// INITIALIZATION
// ═══════════════════════════════════════════════════════════

/**
 * Get or create the database instance.
 * Always call this before any database operation.
 */
export async function getDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;

  db = await SQLite.openDatabaseAsync(DB_NAME);

  // Enable WAL mode for better concurrent read/write performance
  await db.execAsync('PRAGMA journal_mode = WAL;');
  // Enable foreign keys
  await db.execAsync('PRAGMA foreign_keys = ON;');

  // Run migrations
  await runMigrations(db);

  return db;
}

/**
 * Run all pending migrations.
 */
async function runMigrations(database: SQLite.SQLiteDatabase): Promise<void> {
  const currentVersion = await getCurrentVersion(database);

  if (currentVersion === 0) {
    // Fresh install — create all tables
    await database.execAsync(CREATE_TABLES_SQL);
    console.log(`[DB] Created schema v${SCHEMA_VERSION}`);
    return;
  }

  if (currentVersion < SCHEMA_VERSION) {
    // Run incremental migrations
    for (let v = currentVersion + 1; v <= SCHEMA_VERSION; v++) {
      const migration = MIGRATIONS[v];
      if (migration) {
        console.log(`[DB] Running migration v${v}`);
        await database.execAsync(migration);
      }
    }
    // Update version
    await database.runAsync(
      `INSERT OR REPLACE INTO schema_meta (key, value) VALUES ('version', ?)`,
      [String(SCHEMA_VERSION)],
    );
    console.log(`[DB] Migrated to v${SCHEMA_VERSION}`);
  }
}

/**
 * Get the current schema version from the database.
 */
async function getCurrentVersion(database: SQLite.SQLiteDatabase): Promise<number> {
  try {
    const result = await database.getFirstAsync<{ value: string }>(
      `SELECT value FROM schema_meta WHERE key = 'version'`,
    );
    return result ? parseInt(result.value, 10) : 0;
  } catch {
    // Table doesn't exist yet — fresh install
    return 0;
  }
}

// ═══════════════════════════════════════════════════════════
// MIGRATIONS (add new versions here as schema evolves)
// ═══════════════════════════════════════════════════════════

const MIGRATIONS: Record<number, string> = {
  // Version 2 migration would go here:
  // 2: `ALTER TABLE transactions ADD COLUMN new_field TEXT;`,
};

// ═══════════════════════════════════════════════════════════
// CLEANUP
// ═══════════════════════════════════════════════════════════

/**
 * Run periodic cleanup tasks.
 * Call this on app foreground or every 24 hours.
 */
export async function runCleanup(): Promise<void> {
  const database = await getDatabase();

  const cleanups = Object.entries(CLEANUP_SQL);
  for (const [name, sql] of cleanups) {
    try {
      const result = await database.runAsync(sql);
      if (result.changes > 0) {
        console.log(`[DB Cleanup] ${name}: removed ${result.changes} rows`);
      }
    } catch (error) {
      console.error(`[DB Cleanup] ${name} failed:`, error);
    }
  }
}

// ═══════════════════════════════════════════════════════════
// UTILITY HELPERS
// ═══════════════════════════════════════════════════════════

/**
 * Execute a transaction with automatic rollback on error.
 */
export async function withTransaction<T>(
  fn: (db: SQLite.SQLiteDatabase) => Promise<T>,
): Promise<T> {
  const database = await getDatabase();
  await database.execAsync('BEGIN TRANSACTION');

  try {
    const result = await fn(database);
    await database.execAsync('COMMIT');
    return result;
  } catch (error) {
    await database.execAsync('ROLLBACK');
    throw error;
  }
}

/**
 * Close the database connection.
 * Call on app unmount or before reinstall cleanup.
 */
export async function closeDatabase(): Promise<void> {
  if (db) {
    await db.closeAsync();
    db = null;
  }
}

/**
 * Delete the entire database.
 * Used during account deletion flow.
 */
export async function deleteDatabase(): Promise<void> {
  await closeDatabase();
  await SQLite.deleteDatabaseAsync(DB_NAME);
  console.log('[DB] Database deleted');
}

/**
 * Get database file size in bytes.
 */
export async function getDatabaseSize(): Promise<number> {
  const database = await getDatabase();
  const result = await database.getFirstAsync<{ size: number }>(
    `SELECT page_count * page_size as size FROM pragma_page_count(), pragma_page_size()`,
  );
  return result?.size ?? 0;
}
