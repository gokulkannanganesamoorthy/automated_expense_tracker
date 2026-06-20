import { z } from 'zod';

// ═══════════════════════════════════════════════════════════
// USER PROFILE
// ═══════════════════════════════════════════════════════════

export const UserPlan = z.enum(['free', 'premium', 'trial']);
export type UserPlan = z.infer<typeof UserPlan>;

export const AuthProvider = z.enum([
  'google',
  'apple',
  'email',
  'phone',
  'guest',
]);
export type AuthProvider = z.infer<typeof AuthProvider>;

export const UserProfileSchema = z.object({
  uid: z.string().min(1),
  name: z.string().min(1),
  email: z.string().email().nullable(),
  phone: z.string().nullable(),
  photoUrl: z.string().url().nullable(),
  plan: UserPlan.default('free'),
  trialEndsAt: z.string().datetime().nullable(),
  authProvider: AuthProvider,
  country: z.string().length(2).default('IN'), // ISO 3166-1 alpha-2
  appVersion: z.string(),
  deviceCount: z.number().int().nonnegative().default(1),
  createdAt: z.string().datetime(),
  lastActiveAt: z.string().datetime(),
  isGuest: z.boolean().default(false),
  guestTransactionCount: z.number().int().nonnegative().default(0),
  guestStartedAt: z.string().datetime().nullable(),
});

export type UserProfile = z.infer<typeof UserProfileSchema>;

// ═══════════════════════════════════════════════════════════
// USER SETTINGS
// ═══════════════════════════════════════════════════════════

export const NotificationPrefsSchema = z.object({
  transactionAlerts: z.boolean().default(true),
  budgetAlerts: z.boolean().default(true),
  recurringReminders: z.boolean().default(true),
  dailySummary: z.boolean().default(true),
  weeklySummary: z.boolean().default(true),
  monthlySummary: z.boolean().default(true),
  splitReminders: z.boolean().default(true),
  systemAlerts: z.boolean().default(true),
  largeTransactionThresholdPaise: z.number().int().default(500000), // ₹5,000
  dndStartHour: z.number().int().min(0).max(23).default(23),
  dndEndHour: z.number().int().min(0).max(23).default(7),
  mutedCategories: z.array(z.string()).default([]),
});

export type NotificationPrefs = z.infer<typeof NotificationPrefsSchema>;

export const UserSettingsSchema = z.object({
  monthlyBudgetPaise: z.number().int().nonnegative().nullable(),
  categoryBudgets: z.record(z.string(), z.number().int().nonnegative()).default({}),
  currency: z.string().length(3).default('INR'),
  notificationPrefs: NotificationPrefsSchema.default({}),
  screenshotPrevention: z.boolean().default(false),
  biometricEnabled: z.boolean().default(false),
  pinEnabled: z.boolean().default(false),
  pinHash: z.string().nullable().default(null),
  inactivityTimeoutMinutes: z.number().int().min(1).max(60).default(15),
  defaultTransactionView: z.enum(['list', 'calendar']).default('list'),
  smsAutoCapture: z.boolean().default(true),
  notificationCapture: z.boolean().default(false),
  analyticsOptIn: z.boolean().default(false),
  theme: z.enum(['dark', 'system']).default('dark'),
});

export type UserSettings = z.infer<typeof UserSettingsSchema>;

// ═══════════════════════════════════════════════════════════
// USER STATS (precomputed for efficiency)
// ═══════════════════════════════════════════════════════════

export const UserStatsSchema = z.object({
  totalTransactions: z.number().int().nonnegative().default(0),
  totalSpentPaise: z.number().int().nonnegative().default(0),
  totalIncomePaise: z.number().int().nonnegative().default(0),
  currentMonthSpentPaise: z.number().int().nonnegative().default(0),
  currentMonthIncomePaise: z.number().int().nonnegative().default(0),
  lastSyncAt: z.string().datetime().nullable(),
  storageUsedBytes: z.number().int().nonnegative().default(0),
  reviewQueueCount: z.number().int().nonnegative().default(0),
  pendingSyncCount: z.number().int().nonnegative().default(0),
});

export type UserStats = z.infer<typeof UserStatsSchema>;

// ═══════════════════════════════════════════════════════════
// DEVICE INFO (for concurrent session detection)
// ═══════════════════════════════════════════════════════════

export const DeviceInfoSchema = z.object({
  deviceId: z.string(),
  platform: z.enum(['ios', 'android']),
  model: z.string(),
  osVersion: z.string(),
  appVersion: z.string(),
  lastActiveAt: z.string().datetime(),
  pushToken: z.string().nullable(),
});

export type DeviceInfo = z.infer<typeof DeviceInfoSchema>;

// ═══════════════════════════════════════════════════════════
// AUDIT LOG
// ═══════════════════════════════════════════════════════════

export const AuditEventType = z.enum([
  'login',
  'logout',
  'login_failed',
  'signup',
  'password_change',
  'password_reset',
  'biometric_enabled',
  'biometric_disabled',
  'biometric_failed',
  'pin_set',
  'pin_failed',
  'pin_locked',
  'session_timeout',
  'concurrent_session_detected',
  'account_delete_started',
  'account_delete_completed',
  'data_export',
  'data_import',
  'profile_updated',
  'settings_updated',
  'device_registered',
  'device_removed',
  'root_detected',
  'jailbreak_detected',
]);
export type AuditEventType = z.infer<typeof AuditEventType>;

export const AuditLogEntrySchema = z.object({
  id: z.string().uuid(),
  uid: z.string(),
  eventType: AuditEventType,
  deviceInfo: DeviceInfoSchema.nullable(),
  ipAddress: z.string().nullable(),
  metadata: z.record(z.string(), z.unknown()).default({}),
  createdAt: z.string().datetime(),
});

export type AuditLogEntry = z.infer<typeof AuditLogEntrySchema>;
