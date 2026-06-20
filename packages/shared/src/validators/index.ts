/**
 * Centralized validation utilities using Zod schemas.
 * All data flowing in and out of the system passes through these validators.
 */

import { z } from 'zod';
import {
  TransactionSchema,
  CreateTransactionSchema,
  UpdateTransactionSchema,
  ParsedSmsResultSchema,
  ReviewQueueItemSchema,
  TransactionFilterSchema,
} from '../types/transaction';
import { UserProfileSchema, UserSettingsSchema, UserStatsSchema, AuditLogEntrySchema } from '../types/user';
import { BudgetSchema, CreateBudgetSchema, SavingsGoalSchema } from '../types/budget';
import { SyncQueueItemSchema, SyncConflictSchema, SyncMetadataSchema } from '../types/sync';
import { SplitExpenseSchema, CreateSplitExpenseSchema } from '../types/split';
import { NotificationPayloadSchema, NotificationLogEntrySchema } from '../types/notification';
import { CustomCategoryMappingSchema, RecurringPatternSchema } from '../types/category';

// ═══════════════════════════════════════════════════════════
// VALIDATION RESULT
// ═══════════════════════════════════════════════════════════

export interface ValidationResult<T> {
  success: boolean;
  data?: T;
  errors?: z.ZodError;
}

/**
 * Generic validation wrapper that never throws.
 */
export function validate<T>(schema: z.ZodType<T>, data: unknown): ValidationResult<T> {
  const result = schema.safeParse(data);
  if (result.success) {
    return { success: true, data: result.data };
  }
  return { success: false, errors: result.error };
}

/**
 * Strict validation that throws on failure.
 */
export function validateStrict<T>(schema: z.ZodType<T>, data: unknown): T {
  return schema.parse(data);
}

// ═══════════════════════════════════════════════════════════
// TRANSACTION VALIDATORS
// ═══════════════════════════════════════════════════════════

export function validateTransaction(data: unknown): ValidationResult<z.infer<typeof TransactionSchema>> {
  return validate(TransactionSchema, data);
}

export function validateCreateTransaction(data: unknown): ValidationResult<z.infer<typeof CreateTransactionSchema>> {
  return validate(CreateTransactionSchema, data);
}

export function validateUpdateTransaction(data: unknown): ValidationResult<z.infer<typeof UpdateTransactionSchema>> {
  return validate(UpdateTransactionSchema, data);
}

export function validateParsedSms(data: unknown): ValidationResult<z.infer<typeof ParsedSmsResultSchema>> {
  return validate(ParsedSmsResultSchema, data);
}

export function validateReviewQueueItem(data: unknown): ValidationResult<z.infer<typeof ReviewQueueItemSchema>> {
  return validate(ReviewQueueItemSchema, data);
}

export function validateTransactionFilter(data: unknown): ValidationResult<z.infer<typeof TransactionFilterSchema>> {
  return validate(TransactionFilterSchema, data);
}

// ═══════════════════════════════════════════════════════════
// USER VALIDATORS
// ═══════════════════════════════════════════════════════════

export function validateUserProfile(data: unknown): ValidationResult<z.infer<typeof UserProfileSchema>> {
  return validate(UserProfileSchema, data);
}

export function validateUserSettings(data: unknown): ValidationResult<z.infer<typeof UserSettingsSchema>> {
  return validate(UserSettingsSchema, data);
}

export function validateUserStats(data: unknown): ValidationResult<z.infer<typeof UserStatsSchema>> {
  return validate(UserStatsSchema, data);
}

export function validateAuditLogEntry(data: unknown): ValidationResult<z.infer<typeof AuditLogEntrySchema>> {
  return validate(AuditLogEntrySchema, data);
}

// ═══════════════════════════════════════════════════════════
// BUDGET VALIDATORS
// ═══════════════════════════════════════════════════════════

export function validateBudget(data: unknown): ValidationResult<z.infer<typeof BudgetSchema>> {
  return validate(BudgetSchema, data);
}

export function validateCreateBudget(data: unknown): ValidationResult<z.infer<typeof CreateBudgetSchema>> {
  return validate(CreateBudgetSchema, data);
}

export function validateSavingsGoal(data: unknown): ValidationResult<z.infer<typeof SavingsGoalSchema>> {
  return validate(SavingsGoalSchema, data);
}

// ═══════════════════════════════════════════════════════════
// SYNC VALIDATORS
// ═══════════════════════════════════════════════════════════

export function validateSyncQueueItem(data: unknown): ValidationResult<z.infer<typeof SyncQueueItemSchema>> {
  return validate(SyncQueueItemSchema, data);
}

export function validateSyncConflict(data: unknown): ValidationResult<z.infer<typeof SyncConflictSchema>> {
  return validate(SyncConflictSchema, data);
}

export function validateSyncMetadata(data: unknown): ValidationResult<z.infer<typeof SyncMetadataSchema>> {
  return validate(SyncMetadataSchema, data);
}

// ═══════════════════════════════════════════════════════════
// SPLIT VALIDATORS
// ═══════════════════════════════════════════════════════════

export function validateSplitExpense(data: unknown): ValidationResult<z.infer<typeof SplitExpenseSchema>> {
  return validate(SplitExpenseSchema, data);
}

export function validateCreateSplitExpense(data: unknown): ValidationResult<z.infer<typeof CreateSplitExpenseSchema>> {
  return validate(CreateSplitExpenseSchema, data);
}

// ═══════════════════════════════════════════════════════════
// NOTIFICATION VALIDATORS
// ═══════════════════════════════════════════════════════════

export function validateNotificationPayload(data: unknown): ValidationResult<z.infer<typeof NotificationPayloadSchema>> {
  return validate(NotificationPayloadSchema, data);
}

export function validateNotificationLogEntry(data: unknown): ValidationResult<z.infer<typeof NotificationLogEntrySchema>> {
  return validate(NotificationLogEntrySchema, data);
}

// ═══════════════════════════════════════════════════════════
// CATEGORY VALIDATORS
// ═══════════════════════════════════════════════════════════

export function validateCustomCategoryMapping(data: unknown): ValidationResult<z.infer<typeof CustomCategoryMappingSchema>> {
  return validate(CustomCategoryMappingSchema, data);
}

export function validateRecurringPattern(data: unknown): ValidationResult<z.infer<typeof RecurringPatternSchema>> {
  return validate(RecurringPatternSchema, data);
}

// ═══════════════════════════════════════════════════════════
// AMOUNT HELPERS
// ═══════════════════════════════════════════════════════════

/**
 * Convert rupees to paise. Always returns integer.
 */
export function rupeesToPaise(rupees: number): number {
  return Math.round(rupees * 100);
}

/**
 * Convert paise to rupees. Returns number with up to 2 decimal places.
 */
export function paiseToRupees(paise: number): number {
  return paise / 100;
}

/**
 * Format paise as Indian Rupee string.
 * e.g., 1234567 paise → "₹12,345.67"
 */
export function formatAmountPaise(paise: number, showSign: boolean = false): string {
  const rupees = paise / 100;
  const formatted = new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: rupees % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(Math.abs(rupees));

  if (showSign && paise > 0) return `+${formatted}`;
  if (paise < 0) return `-${formatted}`;
  return formatted;
}

/**
 * Validate amount is within reasonable bounds.
 * Max ₹10,00,00,000 (10 crore), flag amounts > ₹10,00,000 (10 lakh)
 */
export const AMOUNT_LIMITS = {
  MIN_PAISE: 1,
  MAX_PAISE: 1_000_000_000_00, // ₹10 crore in paise
  FLAG_THRESHOLD_PAISE: 10_000_00_00, // ₹10 lakh in paise
} as const;

export function isReasonableAmount(paise: number): boolean {
  return paise >= AMOUNT_LIMITS.MIN_PAISE && paise <= AMOUNT_LIMITS.MAX_PAISE;
}

export function isLargeAmount(paise: number, thresholdPaise: number = AMOUNT_LIMITS.FLAG_THRESHOLD_PAISE): boolean {
  return paise >= thresholdPaise;
}
