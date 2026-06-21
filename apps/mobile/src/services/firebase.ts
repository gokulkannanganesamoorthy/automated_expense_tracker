import { initializeApp, getApp, getApps } from 'firebase/app';
import { getAuth, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import { getFirestore, initializeFirestore, persistentLocalCache } from 'firebase/firestore';
import { getRemoteConfig, fetchAndActivate, getAll } from 'firebase/remote-config';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Constants from 'expo-constants';

// Firebase configuration using Expo Constants for environment variables
const firebaseConfig = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY || Constants.expoConfig?.extra?.firebaseApiKey,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Initialize Firebase App
let app;
if (!getApps().length) {
  app = initializeApp(firebaseConfig);
} else {
  app = getApp();
}

// Initialize Auth with AsyncStorage for React Native persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

// Initialize Firestore with offline persistence
const db = initializeFirestore(app, {
  localCache: persistentLocalCache()
});

// Initialize Remote Config
const remoteConfig = getRemoteConfig(app);
remoteConfig.settings.minimumFetchIntervalMillis = 3600000; // 1 hour in prod
// Set sensible defaults for parser logic before fetch
remoteConfig.defaultConfig = {
  bank_patterns: JSON.stringify([
    { bank: 'HDFC', type: 'debit', pattern: '(?i)debited.*?rs\\.?\\s*(?<amount>[\\d,]+\\.?\\d*).*?a/c\\s*(?<account>\\d+)' },
    { bank: 'HDFC', type: 'credit', pattern: '(?i)credited.*?rs\\.?\\s*(?<amount>[\\d,]+\\.?\\d*).*?a/c\\s*(?<account>\\d+)' },
    { bank: 'SBI', type: 'debit', pattern: '(?i)debited.*?inr\\s*(?<amount>[\\d,]+\\.?\\d*).*?a/c\\s*(?<account>\\d+)' },
    { bank: 'SBI', type: 'credit', pattern: '(?i)credited.*?inr\\s*(?<amount>[\\d,]+\\.?\\d*).*?a/c\\s*(?<account>\\d+)' },
    { bank: 'ICICI', type: 'debit', pattern: '(?i)acct\\s*(?<account>\\w+).*?debited.*?inr\\s*(?<amount>[\\d,]+\\.?\\d*)' },
    { bank: 'ICICI', type: 'credit', pattern: '(?i)acct\\s*(?<account>\\w+).*?credited.*?inr\\s*(?<amount>[\\d,]+\\.?\\d*)' }
  ])
};

export { app, auth, db, remoteConfig, fetchAndActivate, getAll };
