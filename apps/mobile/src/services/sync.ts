import { collection, doc, setDoc, getDocs, query, where, Timestamp, writeBatch } from 'firebase/firestore';
import { db, auth } from './firebase';
import type { Transaction } from '@expense-tracker/shared';
import * as SQLite from 'expo-sqlite';
// Import would ideally come from DB repository
// import { TransactionRepository } from '../db/repositories/TransactionRepository';

/**
 * Sync Engine for Firebase Firestore
 * 
 * Strategy: Offline-first
 * 1. Read local modified/new transactions since last sync
 * 2. Push to Firestore in a batch
 * 3. Pull latest changes from Firestore since last sync
 * 4. Merge into local SQLite
 */

export const syncService = {
  /**
   * Pushes local pending transactions to Firestore
   */
  async pushLocalChanges(localTransactions: Transaction[]): Promise<boolean> {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    try {
      const batch = writeBatch(db);
      
      localTransactions.forEach(txn => {
        const docRef = doc(db, 'users', user.uid, 'transactions', txn.id);
        // Use setDoc with merge to handle both creates and updates cleanly
        batch.set(docRef, {
          ...txn,
          syncedAt: Timestamp.now(),
          _serverUpdatedAt: Timestamp.now(),
        }, { merge: true });
      });

      await batch.commit();
      return true;
    } catch (error) {
      console.error("[Sync] Push failed:", error);
      return false;
    }
  },

  /**
   * Pulls remote changes from Firestore and returns them
   */
  async pullRemoteChanges(lastSyncTimestamp: number): Promise<any[]> {
    const user = auth.currentUser;
    if (!user) throw new Error("User not authenticated");

    try {
      const txnsRef = collection(db, 'users', user.uid, 'transactions');
      
      // Get documents updated on the server after our last sync time
      const q = query(
        txnsRef, 
        where('_serverUpdatedAt', '>', Timestamp.fromMillis(lastSyncTimestamp))
      );
      
      const snapshot = await getDocs(q);
      const remoteTxns: any[] = [];
      
      snapshot.forEach(doc => {
        remoteTxns.push({ id: doc.id, ...doc.data() });
      });

      return remoteTxns;
    } catch (error) {
      console.error("[Sync] Pull failed:", error);
      return [];
    }
  },

  /**
   * Full Sync operation
   */
  async performSync(dbInstance: SQLite.SQLiteDatabase): Promise<void> {
    const user = auth.currentUser;
    if (!user) return; // Skip silently if not logged in

    // 1. Get last sync timestamp from AsyncStorage/SecureStore
    // const lastSync = await AsyncStorage.getItem('last_sync_time');
    const lastSyncTime = 0; // Mock: replace with actual retrieval

    // 2. Fetch local changes (mocking the repo call)
    // const localChanges = await TransactionRepository.getUnsynced(dbInstance);
    const localChanges: Transaction[] = [];

    // 3. Push local changes
    if (localChanges.length > 0) {
      await this.pushLocalChanges(localChanges);
      // Mark local as synced
      // await TransactionRepository.markAsSynced(dbInstance, localChanges.map(t => t.id));
    }

    // 4. Pull remote changes
    const remoteChanges = await this.pullRemoteChanges(lastSyncTime);

    // 5. Apply remote changes locally
    if (remoteChanges.length > 0) {
      // Iterate and upsert into SQLite
      // await TransactionRepository.upsertMany(dbInstance, remoteChanges);
    }

    // 6. Update last sync time
    // await AsyncStorage.setItem('last_sync_time', Date.now().toString());
  }
};
