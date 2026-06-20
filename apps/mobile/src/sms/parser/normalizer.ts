/**
 * Merchant name normalizer.
 * Cleans raw merchant strings from bank SMS into consistent format.
 */

// ═══════════════════════════════════════════════════════════
// SUFFIX REMOVAL PATTERNS
// ═══════════════════════════════════════════════════════════

const SUFFIXES_TO_REMOVE = [
  /\s*(pvt\.?\s*ltd\.?|private\s+limited)$/i,
  /\s*(ltd\.?|limited)$/i,
  /\s*(inc\.?|incorporated)$/i,
  /\s*(llp|llc)$/i,
  /\s*(technologies|tech|solutions|services|systems|enterprises)$/i,
  /\s*(india|ind)$/i,
  /\s*(\.com|\.in|\.co\.in|\.org|\.net)$/i,
  /\s*(payments|payment|pay)$/i,
  /\s*\(india\)$/i,
  /\s*\(p\)\s*ltd\.?$/i,
];

// ═══════════════════════════════════════════════════════════
// KNOWN MERCHANT ALIASES
// ═══════════════════════════════════════════════════════════

const MERCHANT_ALIASES: Record<string, string> = {
  // Food delivery
  'bundl technologies': 'swiggy',
  'swiggy': 'swiggy',
  'zomato': 'zomato',
  'zomato media': 'zomato',
  'jubilant foodworks': 'dominos',
  'dominos pizza': 'dominos',

  // Ride-hailing
  'olacabs': 'ola',
  'ani technologies': 'ola',
  'uber india': 'uber',
  'uber bv': 'uber',

  // E-commerce
  'amazon seller': 'amazon',
  'amazon pay': 'amazon',
  'amzn mktp': 'amazon',
  'amzn': 'amazon',
  'flipkart': 'flipkart',
  'flipkart internet': 'flipkart',
  'fk retail': 'flipkart',
  'myntra designs': 'myntra',

  // Groceries
  'bundl instamart': 'swiggy instamart',
  'blinkit': 'blinkit',
  'grofers': 'blinkit',
  'bigbasket': 'bigbasket',
  'supermarket grocery': 'bigbasket',

  // UPI apps
  'google pay': 'google pay',
  'gpay': 'google pay',
  'phonepe': 'phonepe',
  'paytm': 'paytm',
  'one97': 'paytm',

  // Telecom
  'bharti airtel': 'airtel',
  'reliance jio': 'jio',
  'vodafone idea': 'vi',
  'bsnl': 'bsnl',

  // Streaming
  'netflix': 'netflix',
  'hotstar': 'disney+ hotstar',
  'disney plus': 'disney+ hotstar',
  'spotify': 'spotify',
  'youtube premium': 'youtube premium',

  // Transport
  'indian railway': 'irctc',
  'irctc': 'irctc',
};

// ═══════════════════════════════════════════════════════════
// NORMALIZER
// ═══════════════════════════════════════════════════════════

/**
 * Normalize a raw merchant name from bank SMS.
 *
 * Steps:
 * 1. Lowercase
 * 2. Remove UPI suffixes (@xxx)
 * 3. Remove common legal suffixes (Pvt Ltd, Inc, etc.)
 * 4. Apply known aliases
 * 5. Clean up whitespace and special chars
 * 6. Title case the result
 */
export function normalizeMerchant(raw: string): string {
  if (!raw || raw.trim().length === 0) return 'unknown';

  let name = raw.trim().toLowerCase();

  // Remove UPI VPA suffix (e.g., "merchant@upi" → "merchant")
  name = name.replace(/@[a-z0-9]+$/i, '');

  // Remove asterisks, leading/trailing dashes
  name = name.replace(/\*/g, '').replace(/^-+|-+$/g, '');

  // Remove transaction IDs that might be in merchant field
  name = name.replace(/\b[a-f0-9]{10,}\b/gi, '');

  // Remove common legal suffixes
  for (const suffix of SUFFIXES_TO_REMOVE) {
    name = name.replace(suffix, '');
  }

  // Check known aliases
  const aliasKey = name.trim();
  const alias = MERCHANT_ALIASES[aliasKey];
  if (alias) {
    name = alias;
  } else {
    // Check partial matches in aliases
    for (const [key, value] of Object.entries(MERCHANT_ALIASES)) {
      if (aliasKey.includes(key)) {
        name = value;
        break;
      }
    }
  }

  // Clean up whitespace
  name = name.replace(/\s+/g, ' ').trim();

  if (name.length === 0) return 'unknown';

  // Title case
  return toTitleCase(name);
}

/**
 * Convert string to title case.
 */
function toTitleCase(str: string): string {
  return str.replace(/\w\S*/g, (txt) => {
    return txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase();
  });
}

// ═══════════════════════════════════════════════════════════
// AMOUNT NORMALIZER
// ═══════════════════════════════════════════════════════════

/**
 * Parse amount string to paise (integer).
 * Handles Indian comma format (1,00,000), decimal variations, currency symbols.
 */
export function parseAmountToPaise(amountStr: string): number {
  if (!amountStr) return 0;

  let cleaned = amountStr.trim();

  // Remove currency symbols
  cleaned = cleaned.replace(/[₹Rs\.INR\s]/gi, '').trim();

  // Remove Indian-style commas (1,00,000 format)
  cleaned = cleaned.replace(/,/g, '');

  // Handle "500." or "500.0" or "500.00"
  const parsed = parseFloat(cleaned);

  if (isNaN(parsed) || parsed < 0) return 0;

  // Convert to paise (integer)
  return Math.round(parsed * 100);
}

/**
 * Extract amount from SMS text using common patterns.
 */
export function extractAmount(text: string): number {
  // Pattern priority: most specific first
  const patterns = [
    // Rs. 1,234.56 or Rs 1234.56 or INR 1,234.56
    /(?:Rs\.?|INR|₹)\s*([0-9,]+\.?\d*)/i,
    // 1,234.56 INR
    /([0-9,]+\.?\d*)\s*(?:Rs\.?|INR|₹)/i,
    // Amount: Rs 1234
    /amount[:\s]*(?:Rs\.?|INR|₹)?\s*([0-9,]+\.?\d*)/i,
    // debited for Rs 1234
    /(?:debited|credited|paid|received|sent|transferred)\s*(?:for|of|with)?\s*(?:Rs\.?|INR|₹)?\s*([0-9,]+\.?\d*)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      const paise = parseAmountToPaise(match[1]);
      if (paise > 0) return paise;
    }
  }

  return 0;
}
