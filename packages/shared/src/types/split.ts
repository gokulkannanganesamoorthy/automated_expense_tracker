import { z } from 'zod';

// ═══════════════════════════════════════════════════════════
// SPLIT EXPENSE
// ═══════════════════════════════════════════════════════════

export const SplitMethod = z.enum(['equal', 'percentage', 'custom']);
export type SplitMethod = z.infer<typeof SplitMethod>;

export const SplitStatus = z.enum(['pending', 'partial', 'settled']);
export type SplitStatus = z.infer<typeof SplitStatus>;

export const SplitParticipantSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  phone: z.string().nullable(),
  upiId: z.string().nullable(),
  sharePaise: z.number().int().nonnegative(),
  sharePercentage: z.number().min(0).max(100).nullable(),
  hasPaid: z.boolean().default(false),
  paidAt: z.string().datetime().nullable(),
  reminderSentAt: z.string().datetime().nullable(),
  reminderCount: z.number().int().nonnegative().default(0),
});

export type SplitParticipant = z.infer<typeof SplitParticipantSchema>;

export const SplitExpenseSchema = z.object({
  id: z.string().uuid(),
  transactionId: z.string().uuid(),
  totalAmountPaise: z.number().int().nonnegative(),
  splitMethod: SplitMethod,
  participants: z.array(SplitParticipantSchema).min(1),
  status: SplitStatus.default('pending'),
  createdByUid: z.string(),
  description: z.string().nullable(),
  settledAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type SplitExpense = z.infer<typeof SplitExpenseSchema>;

export const CreateSplitExpenseSchema = SplitExpenseSchema.omit({
  status: true,
  settledAt: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateSplitExpense = z.infer<typeof CreateSplitExpenseSchema>;
