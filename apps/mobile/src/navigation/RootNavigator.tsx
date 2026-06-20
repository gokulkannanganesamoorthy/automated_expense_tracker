import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
import type { RootStackParamList, DEEP_LINK_CONFIG } from './types';
import { TabNavigator } from './TabNavigator';
import { colors } from '../theme/tokens';

// Auth Screens
import { LoginScreen } from '../screens/Auth/LoginScreen';
import { SignUpScreen } from '../screens/Auth/SignUpScreen';
import { PhoneOTPScreen } from '../screens/Auth/PhoneOTPScreen';
import { BiometricLockScreen } from '../screens/Auth/BiometricLockScreen';
import { PINScreen } from '../screens/Auth/PINScreen';

// Onboarding
import { OnboardingNavigator } from './OnboardingNavigator';

// Modal Screens
import { TransactionDetailScreen } from '../screens/Transactions/TransactionDetailScreen';
import { ManualEntryScreen } from '../screens/Transactions/ManualEntryScreen';
import { DeleteAccountScreen } from '../screens/Settings/DeleteAccountScreen';
import { ProfileScreen } from '../screens/Settings/ProfileScreen';
import { SecuritySettingsScreen } from '../screens/Settings/SecuritySettingsScreen';
import { NotificationPrefsScreen } from '../screens/Settings/NotificationPrefsScreen';
import { ExportScreen } from '../screens/Settings/ExportScreen';
import { ReviewItemScreen } from '../screens/Review/ReviewItemScreen';
import { CreateSplitScreen } from '../screens/Split/CreateSplitScreen';
import { SplitDetailScreen } from '../screens/Split/SplitDetailScreen';
import { BudgetSetupScreen } from '../screens/Budgets/BudgetSetupScreen';
import { SavingsGoalScreen } from '../screens/Budgets/SavingsGoalScreen';
import { CategoryDrilldownScreen } from '../screens/Analytics/CategoryDrilldownScreen';
import { PaywallScreen } from '../screens/Paywall/PaywallScreen';
import { PrivacyPolicyScreen } from '../screens/Settings/PrivacyPolicyScreen';
import { TermsScreen } from '../screens/Settings/TermsScreen';
import { AboutScreen } from '../screens/Settings/AboutScreen';
import { ImportDataScreen } from '../screens/Settings/ImportDataScreen';

// Hooks
import { useAuthStore } from '../stores/auth-store';

const Stack = createNativeStackNavigator<RootStackParamList>();

// ═══════════════════════════════════════════════════════════
// NAVIGATION THEME
// ═══════════════════════════════════════════════════════════

const navigationTheme = {
  dark: true,
  colors: {
    primary: colors.accentPrimary,
    background: colors.background,
    card: colors.surface,
    text: colors.textPrimary,
    border: colors.border,
    notification: colors.dangerHigh,
  },
  fonts: {
    regular: { fontFamily: 'System', fontWeight: '400' as const },
    medium: { fontFamily: 'System', fontWeight: '500' as const },
    bold: { fontFamily: 'System', fontWeight: '700' as const },
    heavy: { fontFamily: 'System', fontWeight: '800' as const },
  },
};

// ═══════════════════════════════════════════════════════════
// ROOT NAVIGATOR
// ═══════════════════════════════════════════════════════════

export function RootNavigator(): React.ReactElement {
  const { isAuthenticated, isOnboarded, isLocked } = useAuthStore();

  return (
    <NavigationContainer theme={navigationTheme}>
      <StatusBar style="light" backgroundColor={colors.background} />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: 'slide_from_right',
        }}
      >
        {/* Auth State Machine */}
        {!isAuthenticated ? (
          // Not logged in → Auth flow
          <>
            <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="PhoneOTP" component={PhoneOTPScreen} />
          </>
        ) : isLocked ? (
          // Logged in but locked → Biometric/PIN
          <>
            <Stack.Screen
              name="BiometricLock"
              component={BiometricLockScreen}
              options={{ gestureEnabled: false }}
            />
            <Stack.Screen name="PINEntry" component={PINScreen} />
          </>
        ) : !isOnboarded ? (
          // Logged in, unlocked, but not onboarded
          <Stack.Screen name="Onboarding" component={OnboardingNavigator} />
        ) : (
          // Fully authenticated → Main app
          <>
            <Stack.Screen name="MainTabs" component={TabNavigator} />

            {/* Modal Stack — presented over tabs */}
            <Stack.Group
              screenOptions={{
                presentation: 'modal',
                animation: 'slide_from_bottom',
                gestureEnabled: true,
                gestureDirection: 'vertical',
              }}
            >
              <Stack.Screen name="TransactionDetail" component={TransactionDetailScreen} />
              <Stack.Screen name="ManualEntry" component={ManualEntryScreen} />
              <Stack.Screen name="EditTransaction" component={TransactionDetailScreen} />
              <Stack.Screen name="BudgetSetup" component={BudgetSetupScreen} />
              <Stack.Screen name="SavingsGoalSetup" component={SavingsGoalScreen} />
              <Stack.Screen name="CreateSplit" component={CreateSplitScreen} />
              <Stack.Screen name="SplitDetail" component={SplitDetailScreen} />
              <Stack.Screen name="ReviewItem" component={ReviewItemScreen} />
              <Stack.Screen name="CategoryDrilldown" component={CategoryDrilldownScreen} />
              <Stack.Screen name="ExportOptions" component={ExportScreen} />
              <Stack.Screen name="ImportData" component={ImportDataScreen} />
              <Stack.Screen name="PaywallScreen" component={PaywallScreen} />
            </Stack.Group>

            {/* Full-screen modals */}
            <Stack.Group
              screenOptions={{
                presentation: 'fullScreenModal',
                animation: 'slide_from_bottom',
              }}
            >
              <Stack.Screen name="DeleteAccount" component={DeleteAccountScreen} />
              <Stack.Screen name="Profile" component={ProfileScreen} />
              <Stack.Screen name="SecuritySettings" component={SecuritySettingsScreen} />
              <Stack.Screen name="NotificationPrefs" component={NotificationPrefsScreen} />
              <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
              <Stack.Screen name="TermsOfService" component={TermsScreen} />
              <Stack.Screen name="About" component={AboutScreen} />
            </Stack.Group>
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}
