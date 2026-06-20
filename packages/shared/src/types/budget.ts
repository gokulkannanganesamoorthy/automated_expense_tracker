import { z } from 'zod';

// ═══════════════════════════════════════════════════════════
// BUDGET
// ═══════════════════════════════════════════════════════════

export const BudgetPeriod = z.enum(['monthly', 'weekly', 'custom']);
export type BudgetPeriod = z.infer<typeof BudgetPeriod>;

export const BudgetSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  amountPaise: z.number().int().nonnegative(),
  spentPaise: z.number().int().nonnegative().default(0),
  period: BudgetPeriod,
  category: z.string().nullable(), // null = overall budget
  startDate: z.string().datetime(),
  endDate: z.string().datetime().nullable(), // null = recurring monthly
  isActive: z.boolean().default(true),
  alertAt50: z.boolean().default(true),
  alertAt80: z.boolean().default(true),
  alertAt100: z.boolean().default(true),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type Budget = z.infer<typeof BudgetSchema>;

export const CreateBudgetSchema = BudgetSchema.omit({
  spentPaise: true,
  createdAt: true,
  updatedAt: true,
});

export type CreateBudget = z.infer<typeof CreateBudgetSchema>;

// ═══════════════════════════════════════════════════════════
// BUDGET TEMPLATE
// ═══════════════════════════════════════════════════════════

export const BudgetTemplateId = z.enum(['student', 'working_professional', 'family']);
export type BudgetTemplateId = z.infer<typeof BudgetTemplateId>;

export interface BudgetTemplate {
  id: BudgetTemplateId;
  name: string;
  description: string;
  overallBudgetPaise: number;
  categoryBudgets: Record<string, number>; // category → amount in paise
}

export const BUDGET_TEMPLATES: readonly BudgetTemplate[] = [
  {
    id: 'student',
    name: 'Student',
    description: 'Budget-friendly plan for students',
    overallBudgetPaise: 1500000, // ₹15,000
    categoryBudgets: {
      'Food & Dining': 500000,      // ₹5,000
      'Transport': 200000,           // ₹2,000
      'Entertainment': 150000,       // ₹1,500
      'Shopping': 200000,            // ₹2,000
      'Education': 300000,           // ₹3,000
      'Health': 100000,              // ₹1,000
      'Other': 50000,                // ₹500
    },
  },
  {
    id: 'working_professional',
    name: 'Working Professional',
    description: 'Balanced budget for professionals',
    overallBudgetPaise: 5000000, // ₹50,000
    categoryBudgets: {
      'Food & Dining': 800000,       // ₹8,000
      'Transport': 500000,           // ₹5,000
      'Entertainment': 300000,       // ₹3,000
      'Shopping': 500000,            // ₹5,000
      'Bills & Utilities': 800000,   // ₹8,000
      'Health': 200000,              // ₹2,000
      'Investment': 1000000,         // ₹10,000
      'EMI/Loan': 500000,            // ₹5,000
      'Other': 400000,               // ₹4,000
    },
  },
  {
    id: 'family',
    name: 'Family',
    description: 'Comprehensive family budget',
    overallBudgetPaise: 10000000, // ₹1,00,000
    categoryBudgets: {
      'Food & Dining': 1500000,      // ₹15,000
      'Groceries': 1000000,          // ₹10,000
      'Transport': 800000,           // ₹8,000
      'Entertainment': 500000,       // ₹5,000
      'Shopping': 800000,            // ₹8,000
      'Bills & Utilities': 1500000,  // ₹15,000
      'Health': 500000,              // ₹5,000
      'Education': 1000000,          // ₹10,000
      'Investment': 1500000,         // ₹15,000
      'EMI/Loan': 500000,            // ₹5,000
      'Other': 400000,               // ₹4,000
    },
  },
] as const;

// ═══════════════════════════════════════════════════════════
// SAVINGS GOAL
// ═══════════════════════════════════════════════════════════

export const SavingsGoalSchema = z.object({
  id: z.string().uuid(),
  name: z.string().min(1),
  targetAmountPaise: z.number().int().positive(),
  currentAmountPaise: z.number().int().nonnegative().default(0),
  deadline: z.string().datetime().nullable(),
  iconEmoji: z.string().default('🎯'),
  colorHex: z.string().default('#A78BFA'),
  isCompleted: z.boolean().default(false),
  completedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type SavingsGoal = z.infer<typeof SavingsGoalSchema>;

// ═══════════════════════════════════════════════════════════
// BUDGET STATUS (computed, not stored)
// ═══════════════════════════════════════════════════════════

export const BudgetStatus = z.enum([
  'healthy',    // 0-50%
  'warning',    // 50-80%
  'danger',     // 80-100%
  'exceeded',   // 100%+
]);
export type BudgetStatus = z.infer<typeof BudgetStatus>;

export function computeBudgetStatus(spentPaise: number, budgetPaise: number): BudgetStatus {
  if (budgetPaise <= 0) return 'healthy';
  const ratio = spentPaise / budgetPaise;
  if (ratio <= 0.5) return 'healthy';
  if (ratio <= 0.8) return 'warning';
  if (ratio <= 1.0) return 'danger';
  return 'exceeded';
}

export function computeBudgetPercentage(spentPaise: number, budgetPaise: number): number {
  if (budgetPaise <= 0) return 0;
  return Math.round((spentPaise / budgetPaise) * 100);
}
