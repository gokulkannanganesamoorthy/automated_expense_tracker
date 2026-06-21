import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth, db } from '../services/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import type { UserProfile, UserSettings, UserStats, AuthProvider as AuthProviderType } from '@expense-tracker/shared';

// ═══════════════════════════════════════════════════════════
// AUTH STATE
// ═══════════════════════════════════════════════════════════

interface AuthState {
  // Core auth
  isAuthenticated: boolean;
  isOnboarded: boolean;
  isLocked: boolean;
  isGuest: boolean;

  // User data
  user: UserProfile | null;
  settings: UserSettings | null;
  stats: UserStats | null;

  // Session
  lastActiveTimestamp: number;
  biometricFailCount: number;
  pinFailCount: number;
  sessionToken: string | null;

  // Loading states
  isLoading: boolean;
  authError: string | null;
}

interface AuthActions {
  // Auth flow
  setAuthenticated: (user: UserProfile, settings: UserSettings) => void;
  setOnboarded: (value: boolean) => void;
  setLocked: (value: boolean) => void;
  logout: () => void;

  // Guest mode
  setGuestMode: () => void;
  upgradeFromGuest: (user: UserProfile) => void;

  // Profile
  updateProfile: (updates: Partial<UserProfile>) => void;
  updateSettings: (updates: Partial<UserSettings>) => void;
  updateStats: (updates: Partial<UserStats>) => void;

  // Session
  updateLastActive: () => void;
  setSessionToken: (token: string | null) => void;

  // Biometric / PIN
  incrementBiometricFail: () => void;
  resetBiometricFail: () => void;
  incrementPinFail: () => void;
  resetPinFail: () => void;

  // Loading
  setLoading: (loading: boolean) => void;
  setAuthError: (error: string | null) => void;
  
  // Initialization
  initAuthListener: () => () => void;
}

type AuthStore = AuthState & AuthActions;

const INITIAL_STATE: AuthState = {
  isAuthenticated: false,
  isOnboarded: false,
  isLocked: false,
  isGuest: false,
  user: null,
  settings: null,
  stats: null,
  lastActiveTimestamp: Date.now(),
  biometricFailCount: 0,
  pinFailCount: 0,
  sessionToken: null,
  isLoading: false,
  authError: null,
};

// ═══════════════════════════════════════════════════════════
// STORE
// ═══════════════════════════════════════════════════════════

export const useAuthStore = create<AuthStore>()(
  immer((set) => ({
    ...INITIAL_STATE,

    setAuthenticated: (user, settings) => {
      set((state) => {
        state.isAuthenticated = true;
        state.user = user;
        state.settings = settings;
        state.isGuest = user.isGuest;
        state.isLocked = false;
        state.biometricFailCount = 0;
        state.pinFailCount = 0;
        state.authError = null;
        state.lastActiveTimestamp = Date.now();
      });
    },

    setOnboarded: (value) => {
      set((state) => {
        state.isOnboarded = value;
      });
    },

    setLocked: (value) => {
      set((state) => {
        state.isLocked = value;
        if (!value) {
          state.biometricFailCount = 0;
          state.pinFailCount = 0;
          state.lastActiveTimestamp = Date.now();
        }
      });
    },

    logout: () => {
      set(() => ({ ...INITIAL_STATE }));
    },

    setGuestMode: () => {
      set((state) => {
        state.isAuthenticated = true;
        state.isGuest = true;
        state.isOnboarded = true;
        state.user = {
          uid: `guest_${Date.now()}`,
          name: 'Guest',
          email: null,
          phone: null,
          photoUrl: null,
          plan: 'free',
          trialEndsAt: null,
          authProvider: 'guest',
          country: 'IN',
          appVersion: '1.0.0',
          deviceCount: 1,
          createdAt: new Date().toISOString(),
          lastActiveAt: new Date().toISOString(),
          isGuest: true,
          guestTransactionCount: 0,
          guestStartedAt: new Date().toISOString(),
        };
        state.settings = {
          monthlyBudgetPaise: null,
          categoryBudgets: {},
          currency: 'INR',
          notificationPrefs: {
            transactionAlerts: true,
            budgetAlerts: true,
            recurringReminders: true,
            dailySummary: true,
            weeklySummary: true,
            monthlySummary: true,
            splitReminders: true,
            systemAlerts: true,
            largeTransactionThresholdPaise: 500000,
            dndStartHour: 23,
            dndEndHour: 7,
            mutedCategories: [],
          },
          screenshotPrevention: false,
          biometricEnabled: false,
          pinEnabled: false,
          pinHash: null,
          inactivityTimeoutMinutes: 15,
          defaultTransactionView: 'list',
          smsAutoCapture: true,
          notificationCapture: false,
          analyticsOptIn: false,
          theme: 'dark',
        };
      });
    },

    upgradeFromGuest: (user) => {
      set((state) => {
        state.user = user;
        state.isGuest = false;
      });
    },

    updateProfile: (updates) => {
      set((state) => {
        if (state.user) {
          Object.assign(state.user, updates);
        }
      });
    },

    updateSettings: (updates) => {
      set((state) => {
        if (state.settings) {
          Object.assign(state.settings, updates);
        }
      });
    },

    updateStats: (updates) => {
      set((state) => {
        if (state.stats) {
          Object.assign(state.stats, updates);
        } else {
          state.stats = {
            totalTransactions: 0,
            totalSpentPaise: 0,
            totalIncomePaise: 0,
            currentMonthSpentPaise: 0,
            currentMonthIncomePaise: 0,
            lastSyncAt: null,
            storageUsedBytes: 0,
            reviewQueueCount: 0,
            pendingSyncCount: 0,
            ...updates,
          };
        }
      });
    },

    updateLastActive: () => {
      set((state) => {
        state.lastActiveTimestamp = Date.now();
      });
    },

    setSessionToken: (token) => {
      set((state) => {
        state.sessionToken = token;
      });
    },

    incrementBiometricFail: () => {
      set((state) => {
        state.biometricFailCount += 1;
      });
    },

    resetBiometricFail: () => {
      set((state) => {
        state.biometricFailCount = 0;
      });
    },

    incrementPinFail: () => {
      set((state) => {
        state.pinFailCount += 1;
      });
    },

    resetPinFail: () => {
      set((state) => {
        state.pinFailCount = 0;
      });
    },

    setLoading: (loading) => {
      set((state) => {
        state.isLoading = loading;
      });
    },

    setAuthError: (error) => {
      set((state) => {
        state.authError = error;
      });
    },

    initAuthListener: () => {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          // Fetch user profile from Firestore
          try {
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const userDocSnap = await getDoc(userDocRef);
            
            if (userDocSnap.exists()) {
              const data = userDocSnap.data();
              // Parse out settings vs profile
              set((state) => {
                state.isAuthenticated = true;
                state.isGuest = false;
                state.isOnboarded = true;
                state.user = {
                  uid: firebaseUser.uid,
                  name: data.name || firebaseUser.displayName || 'User',
                  email: firebaseUser.email,
                  phone: firebaseUser.phoneNumber,
                  photoUrl: firebaseUser.photoURL,
                  plan: data.plan || 'free',
                  trialEndsAt: data.trialEndsAt || null,
                  authProvider: 'email',
                  country: data.country || 'IN',
                  appVersion: data.appVersion || '1.0.0',
                  deviceCount: data.deviceCount || 1,
                  createdAt: data.createdAt || new Date().toISOString(),
                  lastActiveAt: new Date().toISOString(),
                  isGuest: false,
                  guestTransactionCount: 0,
                  guestStartedAt: null,
                };
                // Default settings if missing
                state.settings = data.settings || {
                  monthlyBudgetPaise: null,
                  categoryBudgets: {},
                  currency: 'INR',
                  notificationPrefs: { transactionAlerts: true, budgetAlerts: true, recurringReminders: true, dailySummary: true, weeklySummary: true, monthlySummary: true, splitReminders: true, systemAlerts: true, largeTransactionThresholdPaise: 500000, dndStartHour: 23, dndEndHour: 7, mutedCategories: [] },
                  screenshotPrevention: false, biometricEnabled: false, pinEnabled: false, pinHash: null, inactivityTimeoutMinutes: 15, defaultTransactionView: 'list', smsAutoCapture: true, notificationCapture: false, analyticsOptIn: true, theme: 'dark',
                };
              });
            } else {
              // Document doesn't exist (maybe they just signed up and we haven't created the doc yet, 
              // but we will create it during the sign up flow in SignInScreen)
            }
          } catch (e) {
            console.error("Error fetching user doc:", e);
          }
        } else {
          // Logged out
          set((state) => {
            // Keep guest mode if they were guest?
            // If they are guest, firebaseUser is null.
            // So if they are a guest, don't wipe them!
            if (!state.isGuest) {
              state.isAuthenticated = false;
              state.user = null;
              state.settings = null;
            }
          });
        }
      });
      return unsubscribe;
    },
  })),
);

// ═══════════════════════════════════════════════════════════
// SELECTORS
// ═══════════════════════════════════════════════════════════

export const selectIsGuestLimitReached = (state: AuthState): boolean => {
  if (!state.isGuest || !state.user) return false;
  const txnLimit = state.user.guestTransactionCount >= 10;
  const dayLimit = state.user.guestStartedAt
    ? Date.now() - new Date(state.user.guestStartedAt).getTime() > 7 * 24 * 60 * 60 * 1000
    : false;
  return txnLimit || dayLimit;
};

export const selectShouldShowBiometricFallback = (state: AuthState): boolean => {
  return state.biometricFailCount >= 3;
};

export const selectShouldForceRelogin = (state: AuthState): boolean => {
  return state.pinFailCount >= 5;
};
