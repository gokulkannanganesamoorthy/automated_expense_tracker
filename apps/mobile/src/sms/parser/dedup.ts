/**
 * Transaction deduplication engine.
 * Uses SHA-256 hash of (amount + account_last4 + timestamp_rounded_to_minute).
 * 30-second debounce for carrier double-delivery, 90-day TTL.
 */

import * as Crypto from 'expo-crypto';
import { getDatabase } from '../../db/database';

// ═══════════════════════════════════════════════════════════
// HASH GENERATION
// ═══════════════════════════════════════════════════════════

/**
 * Generate a dedup hash for a transaction.
 * Hash = SHA256(amount_paise + account_last4 + txn_timestamp_rounded_to_minute)
 */
export function generateDedupHash(
  amountPaise: number,
  accountLast4: string | null,
  txnTimestamp: string,
): string {
  // Round timestamp to minute for fuzzy matching
  const roundedTimestamp = roundToMinute(txnTimestamp);
  const input = `${amountPaise}|${accountLast4 ?? 'XXXX'}|${roundedTimestamp}`;
  // Use sync hash for performance (this runs in hot path)
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, input)
    .then((hash) => hash)
    .catch(() => {
      // Fallback: simple hash if crypto fails
      return simpleHash(input);
    }) as unknown as string;
}

/**
 * Synchronous hash generation for immediate use.
 * Falls back to a simple FNV-1a hash for performance.
 */
export function generateDedupHashSync(
  amountPaise: number,
  accountLast4: string | null,
  txnTimestamp: string,
): string {
  const roundedTimestamp = roundToMinute(txnTimestamp);
  const input = `${amountPaise}|${accountLast4 ?? 'XXXX'}|${roundedTimestamp}`;
  return simpleHash(input);
}

/**
 * Simple FNV-1a hash as fallback.
 */
function simpleHash(str: string): string {
  let hash = 2166136261;
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

/**
 * Round ISO timestamp to the nearest minute.
 */
function roundToMinute(timestamp: string): string {
  try {
    const date = new Date(timestamp);
    date.setSeconds(0, 0);
    return date.toISOString();
  } catch {
    return timestamp;
  }
}

// ═══════════════════════════════════════════════════════════
// DUPLICATE DETECTION
// ═══════════════════════════════════════════════════════════

/** Debounce window in milliseconds (30 seconds) */
const DEBOUNCE_MS = 30_000;

/** TTL for hash entries in days */
const HASH_TTL_DAYS = 90;

/** In-memory cache for recent hashes (debounce window) */
const recentHashes = new Map<string, number>(); // hash → timestamp

/**
 * Check if a transaction is a duplicate.
 * 1. Check in-memory debounce cache (30 seconds)
 * 2. Check SQLite hashes table (90-day TTL)
 */
export async function isDuplicate(hash: string): Promise<boolean> {
  // Step 1: In-memory debounce check
  const cachedTimestamp = recentHashes.get(hash);
  if (cachedTimestamp && Date.now() - cachedTimestamp < DEBOUNCE_MS) {
    return true;
  }

  // Step 2: SQLite check
  try {
    const db = await getDatabase();
    const result = await db.getFirstAsync<{ hash: string }>(
      `SELECT hash FROM hashes WHERE hash = ? AND expires_at > datetime('now')`,
      [hash],
    );

    if (result) {
      // Found in DB — it's a duplicate
      recentHashes.set(hash, Date.now());
      return true;
    }
  } catch (error) {
    console.error('[Dedup] SQLite check failed:', error);
    // On error, don't block — allow through
    return false;
  }

  return false;
}

/**
 * Record a transaction hash in both cache and SQLite.
 * Call this AFTER successfully saving the transaction.
 */
export async function recordHash(hash: string, transactionId: string): Promise<void> {
  // Update in-memory cache
  recentHashes.set(hash, Date.now());

  // Persist to SQLite
  try {
    const db = await getDatabase();
    const now = new Date().toISOString();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + HASH_TTL_DAYS);

    await db.runAsync(
      `INSERT OR REPLACE INTO hashes (hash, transaction_id, created_at, expires_at)
       VALUES (?, ?, ?, ?)`,
      [hash, transactionId, now, expiresAt.toISOString()],
    );
  } catch (error) {
    console.error('[Dedup] Failed to record hash:', error);
  }
}

/**
 * Clear the in-memory debounce cache.
 * Call on app restart or when memory pressure is high.
 */
export function clearDedupCache(): void {
  recentHashes.clear();
}

/**
 * Clean up expired hashes from SQLite.
 */
export async function purgeExpiredHashes(): Promise<number> {
  try {
    const db = await getDatabase();
    const result = await db.runAsync(
      `DELETE FROM hashes WHERE expires_at < datetime('now')`,
    );
    return result.changes;
  } catch (error) {
    console.error('[Dedup] Purge failed:', error);
    return 0;
  }
}
