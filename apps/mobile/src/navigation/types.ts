/**
 * Navigation type definitions.
 * Type-safe navigation across all stacks: Auth, Main Tabs, Modal.
 */

import type { NavigatorScreenParams } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

// ═══════════════════════════════════════════════════════════
// ROOT STACK (Auth + Main + Modals)
// ═══════════════════════════════════════════════════════════

export type RootStackParamList = {
  // Auth Flow
  Onboarding: undefined;
  Login: undefined;
  SignUp: undefined;
  PhoneOTP: { phoneNumber: string };
  EmailVerification: { email: string };
  BiometricLock: undefined;
  PINEntry: { mode: 'verify' | 'set' | 'reset' };

  // Main App
  MainTabs: NavigatorScreenParams<MainTabParamList>;

  // Modal Stack
  TransactionDetail: { transactionId: string };
  ManualEntry: { prefill?: Partial<{ merchant: string; amountPaise: number; category: string }> };
  EditTransaction: { transactionId: string };
  ReceiptCapture: { transactionId: string };
  ReceiptViewer: { receiptUrl: string };
  FilterDrawer: undefined;
  CategoryDrilldown: { categoryId: string; period: string };
  BudgetSetup: { budgetId?: string };
  SavingsGoalSetup: { goalId?: string };
  CreateSplit: { transactionId: string };
  SplitDetail: { splitId: string };
  ReviewItem: { reviewItemId: string };
  ExportOptions: undefined;
  ImportData: undefined;
  DeleteAccount: undefined;
  Profile: undefined;
  SecuritySettings: undefined;
  NotificationPrefs: undefined;
  PrivacyPolicy: undefined;
  TermsOfService: undefined;
  About: undefined;
  RecurringDetail: { patternId: string };
  AAWaitlist: undefined; // Account Aggregator waitlist
  PaywallScreen: undefined;
  BudgetTemplateSelect: undefined;
};

// ═══════════════════════════════════════════════════════════
// MAIN TAB NAVIGATOR
// ═══════════════════════════════════════════════════════════

export type MainTabParamList = {
  Home: undefined;
  Transactions: undefined;
  Analytics: { period?: 'week' | 'month' | 'quarter' | 'year' | 'custom' };
  Budgets: undefined;
  Settings: undefined;
};

// ═══════════════════════════════════════════════════════════
// ONBOARDING STACK
// ═══════════════════════════════════════════════════════════

export type OnboardingStackParamList = {
  ValueProp: undefined;
  SignInChoice: undefined;
  PermissionsSetup: undefined; // SMS (Android) / Email (iOS)
  NotificationsSetup: undefined;
  BudgetOnboarding: undefined;
  RestoreData: { uid: string }; // Returning user restore
};

// ═══════════════════════════════════════════════════════════
// SCREEN PROPS — convenience types for each screen
// ═══════════════════════════════════════════════════════════

// Root Stack screen props
export type RootScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;

// Tab screen props
export type TabScreenProps<T extends keyof MainTabParamList> =
  BottomTabScreenProps<MainTabParamList, T>;

// Onboarding screen props
export type OnboardingScreenProps<T extends keyof OnboardingStackParamList> =
  NativeStackScreenProps<OnboardingStackParamList, T>;

// ═══════════════════════════════════════════════════════════
// DEEP LINK CONFIG
// ═══════════════════════════════════════════════════════════

export const DEEP_LINK_CONFIG = {
  prefixes: ['expensetracker://'],
  config: {
    screens: {
      MainTabs: {
        screens: {
          Home: 'home',
          Transactions: 'transactions',
          Analytics: 'analytics',
          Budgets: 'budgets',
          Settings: 'settings',
        },
      },
      TransactionDetail: 'transaction/:transactionId',
      ReviewItem: 'review/:reviewItemId',
      SplitDetail: 'split/:splitId',
      PaywallScreen: 'premium',
    },
  },
} as const;
