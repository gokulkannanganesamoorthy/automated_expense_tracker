import { z } from 'zod';

// ═══════════════════════════════════════════════════════════
// ADMIN ROLES
// ═══════════════════════════════════════════════════════════

export const AdminRole = z.enum(['superadmin', 'support', 'analyst']);
export type AdminRole = z.infer<typeof AdminRole>;

export const AdminPermissions: Record<AdminRole, readonly string[]> = {
  superadmin: [
    'view_users',
    'edit_users',
    'delete_users',
    'suspend_users',
    'view_transactions_aggregate',
    'view_transactions_detail',
    'view_analytics',
    'view_system',
    'manage_config',
    'manage_admins',
    'impersonate',
    'trigger_actions',
  ],
  support: [
    'view_users',
    'view_transactions_aggregate',
    'view_analytics',
    'view_system',
    'trigger_actions',
    'impersonate', // read-only, logged
  ],
  analyst: [
    'view_analytics',
    'view_system',
    // NO PII access
  ],
} as const;

// ═══════════════════════════════════════════════════════════
// ADMIN USER
// ═══════════════════════════════════════════════════════════

export const AdminUserSchema = z.object({
  uid: z.string(),
  email: z.string().email(),
  name: z.string(),
  role: AdminRole,
  is2FAEnabled: z.boolean().default(false),
  lastLoginAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  createdBy: z.string(), // uid of admin who created this admin
});

export type AdminUser = z.infer<typeof AdminUserSchema>;

// ═══════════════════════════════════════════════════════════
// ADMIN ACTION LOG
// ═══════════════════════════════════════════════════════════

export const AdminActionType = z.enum([
  'view_user',
  'search_user',
  'suspend_user',
  'unsuspend_user',
  'delete_user',
  'reset_password',
  'reset_biometric',
  'trigger_sync',
  'clear_review_queue',
  'send_notification',
  'update_config',
  'update_whitelist',
  'impersonate_start',
  'impersonate_end',
  'grant_premium',
  'revoke_premium',
  'export_data',
]);
export type AdminActionType = z.infer<typeof AdminActionType>;

export const AdminActionLogSchema = z.object({
  id: z.string().uuid(),
  adminUid: z.string(),
  adminEmail: z.string().email(),
  actionType: AdminActionType,
  targetUid: z.string().nullable(),
  justification: z.string().nullable(), // required for some actions
  metadata: z.record(z.string(), z.unknown()).default({}),
  createdAt: z.string().datetime(),
});

export type AdminActionLog = z.infer<typeof AdminActionLogSchema>;

// ═══════════════════════════════════════════════════════════
// DASHBOARD STATS
// ═══════════════════════════════════════════════════════════

export const DashboardStatsSchema = z.object({
  dau: z.number().int().nonnegative(),
  wau: z.number().int().nonnegative(),
  mau: z.number().int().nonnegative(),
  totalUsers: z.number().int().nonnegative(),
  newSignupsToday: z.number().int().nonnegative(),
  newSignupsWeek: z.number().int().nonnegative(),
  newSignupsMonth: z.number().int().nonnegative(),
  platformSplit: z.object({
    ios: z.number().int().nonnegative(),
    android: z.number().int().nonnegative(),
  }),
  transactionVolumeToday: z.number().int().nonnegative(),
  transactionValueTodayPaise: z.number().int().nonnegative(),
  avgTransactionsPerUser: z.number().nonnegative(),
  parserSuccessRate: z.number().min(0).max(100),
  reviewQueueVolume: z.number().int().nonnegative(),
  syncFailureRate: z.number().min(0).max(100),
  crashRate: z.number().min(0).max(100),
  featureAdoption: z.object({
    sms: z.number().int().nonnegative(),
    manual: z.number().int().nonnegative(),
    email: z.number().int().nonnegative(),
    upi: z.number().int().nonnegative(),
  }),
  updatedAt: z.string().datetime(),
});

export type DashboardStats = z.infer<typeof DashboardStatsSchema>;

// ═══════════════════════════════════════════════════════════
// PARSER MONITORING
// ═══════════════════════════════════════════════════════════

export const ParserStatsSchema = z.object({
  bankName: z.string(),
  date: z.string(), // YYYY-MM-DD
  totalParsed: z.number().int().nonnegative(),
  successCount: z.number().int().nonnegative(),
  failCount: z.number().int().nonnegative(),
  avgConfidence: z.number().min(0).max(100),
  failedPatterns: z.array(z.object({
    pattern: z.string(), // anonymized SMS pattern
    count: z.number().int().nonnegative(),
  })),
});

export type ParserStats = z.infer<typeof ParserStatsSchema>;

// ═══════════════════════════════════════════════════════════
// SYSTEM HEALTH
// ═══════════════════════════════════════════════════════════

export const SystemHealthSchema = z.object({
  firestoreReads: z.number().int().nonnegative(),
  firestoreWrites: z.number().int().nonnegative(),
  firestoreDeletes: z.number().int().nonnegative(),
  storageUsedBytes: z.number().int().nonnegative(),
  bandwidthUsedBytes: z.number().int().nonnegative(),
  cloudFunctionInvocations: z.number().int().nonnegative(),
  cloudFunctionErrors: z.number().int().nonnegative(),
  cloudFunctionP50Ms: z.number().nonnegative(),
  cloudFunctionP95Ms: z.number().nonnegative(),
  cloudFunctionP99Ms: z.number().nonnegative(),
  activeConnections: z.number().int().nonnegative(),
  alertThresholds: z.object({
    parseFailureRate: z.number().default(10),
    crashRate: z.number().default(1),
    syncFailureRate: z.number().default(5),
  }),
  updatedAt: z.string().datetime(),
});

export type SystemHealth = z.infer<typeof SystemHealthSchema>;

// ═══════════════════════════════════════════════════════════
// RETENTION COHORTS
// ═══════════════════════════════════════════════════════════

export const RetentionCohortSchema = z.object({
  cohortDate: z.string(), // YYYY-MM-DD (signup date)
  totalUsers: z.number().int().nonnegative(),
  day1: z.number().min(0).max(100), // percentage retained
  day7: z.number().min(0).max(100),
  day14: z.number().min(0).max(100),
  day30: z.number().min(0).max(100),
  day60: z.number().min(0).max(100),
  day90: z.number().min(0).max(100),
});

export type RetentionCohort = z.infer<typeof RetentionCohortSchema>;
