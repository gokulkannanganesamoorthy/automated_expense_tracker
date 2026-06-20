import { z } from 'zod';

// ═══════════════════════════════════════════════════════════
// NOTIFICATION TYPES
// ═══════════════════════════════════════════════════════════

export const NotificationType = z.enum([
  // Instant
  'transaction_detected',
  'large_transaction',
  'unusual_merchant',
  'duplicate_suspected',
  'parse_failed_review',

  // Budget
  'budget_50_percent',
  'budget_80_percent',
  'budget_100_percent',
  'category_budget_80',
  'category_budget_100',
  'overspend_alert',
  'daily_spend_high',

  // Recurring
  'recurring_upcoming_3d',
  'recurring_due_today',
  'recurring_amount_changed',
  'subscription_renewed',

  // Summaries
  'daily_summary',
  'weekly_summary',
  'monthly_summary',
  'quarterly_summary',

  // Social / Split
  'split_paid',
  'split_you_owe',
  'split_reminder_others',

  // System
  'sync_failed',
  'sms_permission_revoked',
  'app_update_available',
  'new_feature',
  'concurrent_session',
  'password_changed_other_device',
]);
export type NotificationType = z.infer<typeof NotificationType>;

// ═══════════════════════════════════════════════════════════
// NOTIFICATION PAYLOAD
// ═══════════════════════════════════════════════════════════

export const NotificationPayloadSchema = z.object({
  id: z.string().uuid(),
  type: NotificationType,
  title: z.string(),
  body: z.string(),
  data: z.record(z.string(), z.string()).default({}),
  deepLink: z.string().nullable(),
  transactionId: z.string().uuid().nullable(),
  isRead: z.boolean().default(false),
  sentAt: z.string().datetime(),
  readAt: z.string().datetime().nullable(),
});

export type NotificationPayload = z.infer<typeof NotificationPayloadSchema>;

// ═══════════════════════════════════════════════════════════
// NOTIFICATION LOG (for dedup)
// ═══════════════════════════════════════════════════════════

export const NotificationLogEntrySchema = z.object({
  id: z.string().uuid(),
  notificationType: NotificationType,
  transactionId: z.string().uuid().nullable(),
  hash: z.string(), // for dedup
  sentAt: z.string().datetime(),
});

export type NotificationLogEntry = z.infer<typeof NotificationLogEntrySchema>;

// ═══════════════════════════════════════════════════════════
// NOTIFICATION SCHEDULE CONFIG
// ═══════════════════════════════════════════════════════════

export const NOTIFICATION_CONFIG = {
  DAILY_SUMMARY_HOUR: 21,         // 9 PM
  WEEKLY_SUMMARY_DAY: 0,          // Sunday
  WEEKLY_SUMMARY_HOUR: 20,        // 8 PM
  MONTHLY_SUMMARY_DAY: 1,         // 1st of month
  RECURRING_ADVANCE_DAYS: 3,
  DAILY_AVERAGE_MULTIPLIER: 2,    // Alert if daily spend > 2x average
  DEFAULT_DND_START: 23,
  DEFAULT_DND_END: 7,
} as const;
