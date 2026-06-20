import { z } from 'zod';

// ═══════════════════════════════════════════════════════════
// CATEGORY DEFINITION
// ═══════════════════════════════════════════════════════════

export const CategoryIconMap = z.record(z.string(), z.string());

export interface CategoryDefinition {
  id: string;
  name: string;
  icon: string; // Emoji
  color: string; // Hex
  keywords: readonly string[]; // For auto-classification
  subCategories: readonly string[];
}

export const DEFAULT_CATEGORIES: readonly CategoryDefinition[] = [
  {
    id: 'food_dining',
    name: 'Food & Dining',
    icon: '🍕',
    color: '#FF6B35',
    keywords: [
      'swiggy', 'zomato', 'dominos', 'mcdonalds', 'kfc', 'burger king',
      'pizza hut', 'starbucks', 'cafe', 'restaurant', 'hotel', 'food',
      'biryani', 'dine', 'eat', 'meal', 'lunch', 'dinner', 'breakfast',
      'dhaba', 'haldirams', 'barbeque nation', 'subway', 'dunkin',
    ],
    subCategories: ['Restaurants', 'Fast Food', 'Delivery', 'Cafe', 'Snacks'],
  },
  {
    id: 'groceries',
    name: 'Groceries',
    icon: '🛒',
    color: '#34D399',
    keywords: [
      'bigbasket', 'grofers', 'blinkit', 'jiomart', 'dmart', 'more',
      'reliance fresh', 'nature basket', 'zepto', 'swiggy instamart',
      'grocery', 'supermarket', 'provision', 'kirana', 'vegetables',
      'fruits', 'milk', 'daily needs', 'instamart',
    ],
    subCategories: ['Online', 'Supermarket', 'Local Store', 'Dairy'],
  },
  {
    id: 'transport',
    name: 'Transport',
    icon: '🚗',
    color: '#60A5FA',
    keywords: [
      'uber', 'ola', 'rapido', 'metro', 'irctc', 'railway', 'bus',
      'petrol', 'diesel', 'fuel', 'parking', 'toll', 'fastag',
      'makemytrip', 'redbus', 'auto', 'cab', 'taxi', 'indigo',
      'spicejet', 'vistara', 'air india', 'goibibo', 'cleartrip',
      'flight', 'train', 'airline',
    ],
    subCategories: ['Cab', 'Public Transport', 'Fuel', 'Flight', 'Train', 'Parking'],
  },
  {
    id: 'shopping',
    name: 'Shopping',
    icon: '🛍️',
    color: '#F472B6',
    keywords: [
      'amazon', 'flipkart', 'myntra', 'ajio', 'meesho', 'nykaa',
      'tata cliq', 'snapdeal', 'shoppers stop', 'lifestyle',
      'westside', 'pantaloons', 'zara', 'h&m', 'uniqlo', 'max',
      'reliance trends', 'decathlon', 'croma', 'vijay sales',
    ],
    subCategories: ['Online', 'Clothing', 'Electronics', 'Home', 'Beauty'],
  },
  {
    id: 'entertainment',
    name: 'Entertainment',
    icon: '🎬',
    color: '#C084FC',
    keywords: [
      'netflix', 'hotstar', 'prime video', 'spotify', 'youtube',
      'bookmyshow', 'paytm movies', 'pvr', 'inox', 'cinepolis',
      'gaming', 'play station', 'xbox', 'steam', 'twitch',
      'apple music', 'gaana', 'jio cinema', 'zee5', 'sonyliv',
    ],
    subCategories: ['Streaming', 'Movies', 'Gaming', 'Events', 'Music'],
  },
  {
    id: 'bills_utilities',
    name: 'Bills & Utilities',
    icon: '💡',
    color: '#FBBF24',
    keywords: [
      'electricity', 'water', 'gas', 'internet', 'broadband',
      'jio', 'airtel', 'vi', 'bsnl', 'tata sky', 'dish tv',
      'recharge', 'postpaid', 'prepaid', 'wifi', 'mobile bill',
      'phone bill', 'utility', 'maintenance', 'society',
    ],
    subCategories: ['Electricity', 'Water', 'Internet', 'Phone', 'Gas', 'DTH'],
  },
  {
    id: 'health',
    name: 'Health',
    icon: '💊',
    color: '#FB7185',
    keywords: [
      'apollo', 'pharmeasy', 'netmeds', '1mg', 'medlife',
      'hospital', 'clinic', 'doctor', 'pharmacy', 'medicine',
      'lab test', 'diagnostic', 'dental', 'eye', 'gym',
      'cult fit', 'yoga', 'wellness', 'health', 'medical',
    ],
    subCategories: ['Pharmacy', 'Doctor', 'Hospital', 'Fitness', 'Insurance'],
  },
  {
    id: 'education',
    name: 'Education',
    icon: '📚',
    color: '#818CF8',
    keywords: [
      'udemy', 'coursera', 'byju', 'unacademy', 'upgrad',
      'school', 'college', 'university', 'tuition', 'coaching',
      'books', 'course', 'exam', 'certification', 'training',
      'education', 'fees', 'tutorial', 'skill', 'learn',
    ],
    subCategories: ['Courses', 'Books', 'Fees', 'Coaching', 'Certification'],
  },
  {
    id: 'investment',
    name: 'Investment',
    icon: '📈',
    color: '#2DD4BF',
    keywords: [
      'zerodha', 'groww', 'upstox', 'coin', 'kuvera',
      'mutual fund', 'sip', 'stock', 'share', 'investment',
      'fd', 'fixed deposit', 'ppf', 'nps', 'gold',
      'sovereign gold', 'demat', 'trading', 'dividend',
    ],
    subCategories: ['Stocks', 'Mutual Funds', 'FD', 'Gold', 'PPF/NPS'],
  },
  {
    id: 'emi_loan',
    name: 'EMI & Loans',
    icon: '🏦',
    color: '#F97316',
    keywords: [
      'emi', 'loan', 'home loan', 'car loan', 'personal loan',
      'education loan', 'repayment', 'installment', 'bajaj finserv',
      'hdfc ltd', 'lic housing', 'pnb housing', 'auto debit',
    ],
    subCategories: ['Home Loan', 'Car Loan', 'Personal Loan', 'Education Loan', 'Credit Card EMI'],
  },
  {
    id: 'insurance',
    name: 'Insurance',
    icon: '🛡️',
    color: '#06B6D4',
    keywords: [
      'insurance', 'lic', 'icici prudential', 'hdfc life',
      'sbi life', 'star health', 'max bupa', 'care health',
      'premium', 'policy', 'term plan', 'health insurance',
      'car insurance', 'bike insurance', 'motor insurance',
    ],
    subCategories: ['Life', 'Health', 'Vehicle', 'Term Plan'],
  },
  {
    id: 'rent',
    name: 'Rent',
    icon: '🏠',
    color: '#A78BFA',
    keywords: [
      'rent', 'house rent', 'flat rent', 'pg', 'hostel',
      'accommodation', 'landlord', 'tenant', 'lease',
    ],
    subCategories: ['House', 'PG/Hostel', 'Office'],
  },
  {
    id: 'salary_income',
    name: 'Salary & Income',
    icon: '💰',
    color: '#34D399',
    keywords: [
      'salary', 'sal', 'stipend', 'income', 'credit salary',
      'wage', 'pay', 'remuneration', 'freelance', 'bonus',
      'incentive', 'commission', 'pension',
    ],
    subCategories: ['Salary', 'Freelance', 'Bonus', 'Interest', 'Dividend'],
  },
  {
    id: 'transfer',
    name: 'Transfer',
    icon: '🔄',
    color: '#94A3B8',
    keywords: [
      'transfer', 'self transfer', 'own account', 'fund transfer',
      'neft', 'imps', 'rtgs', 'between accounts',
    ],
    subCategories: ['Self Transfer', 'Family', 'Friend'],
  },
  {
    id: 'cash',
    name: 'Cash Withdrawal',
    icon: '🏧',
    color: '#78716C',
    keywords: [
      'atm', 'cash withdrawal', 'cashback', 'cash', 'withdraw',
    ],
    subCategories: ['ATM', 'Counter'],
  },
  {
    id: 'bank_charges',
    name: 'Bank Charges',
    icon: '🏛️',
    color: '#EF4444',
    keywords: [
      'charge', 'fee', 'annual fee', 'maintenance', 'penalty',
      'gst', 'service charge', 'bank fee', 'debit card',
      'credit card fee', 'late fee', 'overdue',
    ],
    subCategories: ['Annual Fee', 'Service Charge', 'Penalty', 'GST'],
  },
  {
    id: 'refund',
    name: 'Refund',
    icon: '↩️',
    color: '#10B981',
    keywords: [
      'refund', 'reversal', 'cashback', 'return', 'cancelled',
      'chargeback', 'credit back',
    ],
    subCategories: ['Purchase Refund', 'Cashback', 'Reversal'],
  },
  {
    id: 'charity',
    name: 'Charity & Donations',
    icon: '🤲',
    color: '#EC4899',
    keywords: [
      'donation', 'charity', 'ngo', 'fundraiser', 'temple',
      'church', 'mosque', 'gurudwara', 'tithe', 'zakat',
    ],
    subCategories: ['Religious', 'NGO', 'Crowdfunding'],
  },
  {
    id: 'other',
    name: 'Other',
    icon: '📦',
    color: '#64748B',
    keywords: [],
    subCategories: ['Miscellaneous'],
  },
] as const;

// ═══════════════════════════════════════════════════════════
// CUSTOM CATEGORY MAPPING (user overrides)
// ═══════════════════════════════════════════════════════════

export const CustomCategoryMappingSchema = z.object({
  id: z.string().uuid(),
  merchantNormalized: z.string(),
  categoryId: z.string(),
  subCategory: z.string().nullable(),
  createdAt: z.string().datetime(),
});

export type CustomCategoryMapping = z.infer<typeof CustomCategoryMappingSchema>;

// ═══════════════════════════════════════════════════════════
// RECURRING PATTERN
// ═══════════════════════════════════════════════════════════

export const RecurringFrequency = z.enum(['weekly', 'monthly', 'quarterly', 'yearly']);
export type RecurringFrequency = z.infer<typeof RecurringFrequency>;

export const RecurringPatternSchema = z.object({
  id: z.string().uuid(),
  merchantNormalized: z.string(),
  expectedAmountPaise: z.number().int().nonnegative(),
  amountVariancePercent: z.number().default(10), // ±10%
  frequency: RecurringFrequency,
  expectedDayOfMonth: z.number().int().min(1).max(31).nullable(),
  lastOccurrence: z.string().datetime().nullable(),
  nextExpected: z.string().datetime().nullable(),
  isSubscription: z.boolean().default(false),
  isActive: z.boolean().default(true),
  transactionIds: z.array(z.string().uuid()).default([]),
  alertOnAmountChange: z.boolean().default(true),
  alertAmountChangeThresholdPercent: z.number().default(20),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type RecurringPattern = z.infer<typeof RecurringPatternSchema>;
