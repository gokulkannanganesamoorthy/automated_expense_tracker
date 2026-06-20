import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configure how notifications are handled when the app is foregrounded
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export const notificationService = {
  /**
   * Request permissions to send push notifications
   */
  async requestPermissions(): Promise<boolean> {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    return finalStatus === 'granted';
  },

  /**
   * Schedule a local notification (e.g., Budget Alert, Bill Reminder)
   */
  async scheduleReminder(title: string, body: string, triggerDate: Date, data: any = {}): Promise<string> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return '';

    // Check if we already scheduled this specific reminder to prevent dupes
    const dedupKey = `notif_${title}_${triggerDate.getTime()}`;
    const exists = await AsyncStorage.getItem(dedupKey);
    if (exists) return exists;

    const identifier = await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        data,
        sound: true,
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DATE,
        date: triggerDate,
      },
    });

    await AsyncStorage.setItem(dedupKey, identifier);
    return identifier;
  },

  /**
   * Schedule a recurring daily notification (e.g., Daily summary at 8 PM)
   */
  async scheduleDailySummary(hour: number = 20, minute: number = 0): Promise<void> {
    const hasPermission = await this.requestPermissions();
    if (!hasPermission) return;

    // Cancel existing summary notifications first
    const scheduled = await Notifications.getAllScheduledNotificationsAsync();
    for (const notif of scheduled) {
      if (notif.content.data?.type === 'daily_summary') {
        await Notifications.cancelScheduledNotificationAsync(notif.identifier);
      }
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: "Daily Spending Summary",
        body: "Tap to see how much you spent today and check your remaining budgets.",
        data: { type: 'daily_summary' },
      },
      trigger: {
        type: Notifications.SchedulableTriggerInputTypes.DAILY,
        hour,
        minute,
      },
    });
  },

  /**
   * Handle incoming background notification clicks
   */
  setupListeners(navigationRef: any) {
    const subscription = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      
      // Route based on data
      if (data?.type === 'daily_summary') {
        navigationRef.current?.navigate('Analytics');
      } else if (data?.transactionId) {
        navigationRef.current?.navigate('TransactionDetail', { id: data.transactionId });
      }
    });

    return () => subscription.remove();
  }
};
