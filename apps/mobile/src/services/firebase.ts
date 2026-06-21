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
let auth;
let db;

if (!getApps().length) {
  app = initializeApp(firebaseConfig);
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
  db = initializeFirestore(app, {
    localCache: persistentLocalCache()
  });
} else {
  app = getApp();
  try {
    auth = getAuth(app);
  } catch (e) {
    auth = initializeAuth(app, {
      persistence: getReactNativePersistence(AsyncStorage)
    });
  }
  try {
    db = getFirestore(app);
  } catch (e) {
    db = initializeFirestore(app, {
      localCache: persistentLocalCache()
    });
  }
}

// Initialize Remote Config with a graceful fallback for environments where IndexedDB is unavailable (like Hermes/React Native)
let remoteConfig: any = null;
let useMockRemoteConfig = false;

const DEFAULT_BANK_PATTERNS = [
  { bank: 'HDFC', type: 'debit', pattern: '(?i)debited.*?rs\\.?\\s*(?<amount>[\\d,]+\\.?\\d*).*?a/c\\s*(?<account>\\d+)' },
  { bank: 'HDFC', type: 'credit', pattern: '(?i)credited.*?rs\\.?\\s*(?<amount>[\\d,]+\\.?\\d*).*?a/c\\s*(?<account>\\d+)' },
  { bank: 'SBI', type: 'debit', pattern: '(?i)debited.*?inr\\s*(?<amount>[\\d,]+\\.?\\d*).*?a/c\\s*(?<account>\\d+)' },
  { bank: 'SBI', type: 'credit', pattern: '(?i)credited.*?inr\\s*(?<amount>[\\d,]+\\.?\\d*).*?a/c\\s*(?<account>\\d+)' },
  { bank: 'ICICI', type: 'debit', pattern: '(?i)acct\\s*(?<account>\\w+).*?debited.*?inr\\s*(?<amount>[\\d,]+\\.?\\d*)' },
  { bank: 'ICICI', type: 'credit', pattern: '(?i)acct\\s*(?<account>\\w+).*?credited.*?inr\\s*(?<amount>[\\d,]+\\.?\\d*)' }
];

try {
  remoteConfig = getRemoteConfig(app);
  remoteConfig.settings.minimumFetchIntervalMillis = 3600000; // 1 hour in prod
  remoteConfig.defaultConfig = {
    bank_patterns: JSON.stringify(DEFAULT_BANK_PATTERNS)
  };
} catch (e) {
  console.warn('[RemoteConfig] Remote config is not supported in this environment, using local fallbacks:', e);
  useMockRemoteConfig = true;
  remoteConfig = {
    _isMock: true,
    defaultConfig: {
      bank_patterns: JSON.stringify(DEFAULT_BANK_PATTERNS)
    }
  };
}

const customFetchAndActivate = async (rc: any) => {
  if (rc?._isMock) {
    return false;
  }
  return fetchAndActivate(rc);
};

const customGetAll = (rc: any) => {
  if (rc?._isMock) {
    return {
      bank_patterns: {
        asString: () => rc.defaultConfig.bank_patterns
      }
    };
  }
  return getAll(rc);
};

export { app, auth, db, remoteConfig, customFetchAndActivate as fetchAndActivate, customGetAll as getAll };
