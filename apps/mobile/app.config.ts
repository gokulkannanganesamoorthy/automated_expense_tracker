import { ExpoConfig, ConfigContext } from 'expo/config';

const IS_DEV = process.env.APP_ENV === 'development';
const IS_STAGING = process.env.APP_ENV === 'staging';

const getAppName = (): string => {
  if (IS_DEV) return 'ExpenseTracker (Dev)';
  if (IS_STAGING) return 'ExpenseTracker (Staging)';
  return 'ExpenseTracker';
};

const getBundleId = (): string => {
  if (IS_DEV) return 'com.expensetracker.app.dev';
  if (IS_STAGING) return 'com.expensetracker.app.staging';
  return 'com.expensetracker.app';
};

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: getAppName(),
  slug: 'expense-tracker',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/icon.png',
  userInterfaceStyle: 'dark',
  scheme: 'expensetracker',
  splash: {
    image: './assets/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#0A0A0F',
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    bundleIdentifier: getBundleId(),
    supportsTablet: false,
    infoPlist: {
      NSFaceIDUsageDescription: 'Authenticate with Face ID to access your financial data',
      NSCameraUsageDescription: 'Take photos of receipts to attach to transactions',
      NSPhotoLibraryUsageDescription: 'Select receipt photos from your library',
      NSContactsUsageDescription: 'Find friends to split expenses with',
      CFBundleURLTypes: [
        {
          CFBundleURLSchemes: ['expensetracker'],
        },
      ],
    },
    config: {
      usesNonExemptEncryption: false,
    },
    buildNumber: '1',
  },
  android: {
    package: getBundleId(),
    adaptiveIcon: {
      foregroundImage: './assets/android-icon-foreground.png',
      backgroundColor: '#0A0A0F',
    },
    permissions: [
      'android.permission.READ_SMS',
      'android.permission.RECEIVE_SMS',
      'android.permission.USE_BIOMETRIC',
      'android.permission.USE_FINGERPRINT',
      'android.permission.VIBRATE',
      'android.permission.CAMERA',
      'android.permission.READ_CONTACTS',
      'android.permission.FOREGROUND_SERVICE',
      'android.permission.POST_NOTIFICATIONS',
      'android.permission.RECEIVE_BOOT_COMPLETED',
      'android.permission.BIND_NOTIFICATION_LISTENER_SERVICE',
    ],
    versionCode: 1,
    intentFilters: [
      {
        action: 'VIEW',
        autoVerify: true,
        data: [
          {
            scheme: 'expensetracker',
          },
        ],
        category: ['DEFAULT', 'BROWSABLE'],
      },
    ],
  },
  plugins: [
    'expo-secure-store',
    'expo-local-authentication',
    'expo-notifications',
    [
      'expo-updates',
      {
        username: 'expense-tracker',
      },
    ],
  ],
  extra: {
    eas: {
      projectId: process.env.EAS_PROJECT_ID ?? '',
    },
    firebaseApiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    firebaseAuthDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    firebaseProjectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    firebaseStorageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    firebaseMessagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    firebaseAppId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
  },
  updates: {
    fallbackToCacheTimeout: 0,
    url: `https://u.expo.dev/${process.env.EAS_PROJECT_ID ?? ''}`,
  },
  runtimeVersion: {
    policy: 'appVersion',
  },
});
