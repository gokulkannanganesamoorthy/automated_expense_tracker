/**
 * Android SMS Listener.
 * Wraps platform-specific SMS reading logic for Android.
 * Note: Requires custom Expo dev client or prebuild to include native SMS permissions.
 */

import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import { parseSms, type IncomingSms } from '../parser';
import { transactionRepo } from '../../db/repositories/TransactionRepository';
import { useTransactionStore } from '../../stores/transaction-store';

/**
 * Initializes the SMS listener for Android.
 * Registers notification listeners and native SMS broadcast receivers if available.
 */
export async function initializeSmsListener(): Promise<void> {
  if (Platform.OS !== 'android') {
    console.log('[SMS Listener] Skipping initialization: Not on Android.');
    return;
  }

  console.log('[SMS Listener] Initializing Android SMS listener...');

  // Fallback: Use Expo Notifications as a pseudo-listener for SMS
  // Many users get SMS alerts via Push Notifications from bank apps, which we can intercept if granted permission.
  // Full raw SMS broadcast receiving requires custom native modules in bare workflow.
  
  Notifications.addNotificationReceivedListener(async (notification) => {
    const title = notification.request.content.title;
    const body = notification.request.content.body;

    if (body) {
      console.log('=========================================');
      console.log('[SMS Interceptor] New Notification Received');
      console.log('[SMS Interceptor] Title/Sender:', title);
      console.log('[SMS Interceptor] Body:', body);
      console.log('=========================================');
      const incomingSms: IncomingSms = {
        sender: title || 'Unknown',
        body: body,
        timestamp: Date.now(),
      };

      const result = await parseSms(incomingSms);

      if (result.status === 'success' && result.transaction) {
        console.log('[SMS Interceptor] ✅ Successfully parsed transaction:', result.transaction.id);
        // Automatically save to database
        await transactionRepo.insert(result.transaction);

        // Update Zustand store
        useTransactionStore.getState().addTransaction(result.transaction);
      } else if (result.status === 'review') {
        console.log('[SMS Interceptor] ⚠️ Requires review, adding to queue.');
        // Increment review queue counter in store
        const currentCount = useTransactionStore.getState().reviewQueueCount;
        useTransactionStore.getState().setReviewQueueCount(currentCount + 1);
      } else {
        console.log('[SMS Interceptor] ❌ Could not parse SMS into a transaction.');
      }
    }
  });

  // Note: For true Android SMS BroadcastReceiver, a custom config plugin
  // or react-native-android-sms-listener is required during prebuild.
  // This placeholder architecture prepares the entry point.
}
