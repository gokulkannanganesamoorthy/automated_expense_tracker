/**
 * Bank sender IDs for SMS whitelist verification.
 * These are the sender IDs used by Indian banks in transactional SMS.
 * Updatable via Firebase Remote Config without app update.
 */

export interface BankConfig {
  id: string;
  name: string;
  shortName: string;
  senderIds: readonly string[];
  color: string; // Brand color hex
  logo: string;  // Emoji fallback
}

export const BANK_CONFIGS: readonly BankConfig[] = [
  {
    id: 'hdfc',
    name: 'HDFC Bank',
    shortName: 'HDFC',
    senderIds: ['HDFCBK', 'HDFCBN', 'HDFCCC', 'HD-HDFCBK', 'VM-HDFCBK', 'BZ-HDFCBK', 'AD-HDFCBK'],
    color: '#004B87',
    logo: '🔵',
  },
  {
    id: 'sbi',
    name: 'State Bank of India',
    shortName: 'SBI',
    senderIds: ['SBIINB', 'SBIPSG', 'SBISMS', 'SBI-UPI', 'ATMSBI', 'VM-SBIINB', 'BZ-SBIINB'],
    color: '#00529B',
    logo: '🏦',
  },
  {
    id: 'icici',
    name: 'ICICI Bank',
    shortName: 'ICICI',
    senderIds: ['ICICIB', 'ICICIS', 'ICICBC', 'iMobile', 'VM-ICICIB', 'BZ-ICICIB'],
    color: '#B02A30',
    logo: '🔴',
  },
  {
    id: 'axis',
    name: 'Axis Bank',
    shortName: 'Axis',
    senderIds: ['AXISBK', 'AXISBN', 'UTIBK', 'VM-AXISBK', 'BZ-AXISBK'],
    color: '#97144D',
    logo: '🟣',
  },
  {
    id: 'kotak',
    name: 'Kotak Mahindra Bank',
    shortName: 'Kotak',
    senderIds: ['KOTAKB', 'KOTAKM', 'KMBank', 'VM-KOTAKB', 'BZ-KOTAKB'],
    color: '#ED232A',
    logo: '🔴',
  },
  {
    id: 'idfc_first',
    name: 'IDFC First Bank',
    shortName: 'IDFC First',
    senderIds: ['IDFCFB', 'IDFCBK', 'VM-IDFCFB'],
    color: '#9C1D26',
    logo: '🟥',
  },
  {
    id: 'yes_bank',
    name: 'YES Bank',
    shortName: 'YES',
    senderIds: ['YESBK', 'YESBNK', 'VM-YESBK'],
    color: '#00518A',
    logo: '🔵',
  },
  {
    id: 'pnb',
    name: 'Punjab National Bank',
    shortName: 'PNB',
    senderIds: ['PNBSMS', 'PNB', 'PNBBNK', 'VM-PNBSMS'],
    color: '#1A1A6C',
    logo: '🟦',
  },
  {
    id: 'bob',
    name: 'Bank of Baroda',
    shortName: 'BOB',
    senderIds: ['BOBTXN', 'BOBBNK', 'BARODATXN', 'VM-BOBTXN'],
    color: '#F37021',
    logo: '🟠',
  },
  {
    id: 'canara',
    name: 'Canara Bank',
    shortName: 'Canara',
    senderIds: ['CANBK', 'CANBNK', 'CANARA', 'VM-CANBK'],
    color: '#FFCC00',
    logo: '🟡',
  },
  {
    id: 'indusind',
    name: 'IndusInd Bank',
    shortName: 'IndusInd',
    senderIds: ['INDUSB', 'INDBNK', 'INDUSL', 'VM-INDUSB'],
    color: '#78232C',
    logo: '🟤',
  },
  {
    id: 'au_small_finance',
    name: 'AU Small Finance Bank',
    shortName: 'AU SFB',
    senderIds: ['AUBANK', 'AUSFBK', 'VM-AUBANK'],
    color: '#B91C1C',
    logo: '🔴',
  },
  {
    id: 'federal',
    name: 'Federal Bank',
    shortName: 'Federal',
    senderIds: ['FEDBK', 'FEDBNK', 'FEDERAL', 'VM-FEDBK'],
    color: '#1E3A5F',
    logo: '🔵',
  },
  {
    id: 'rbl',
    name: 'RBL Bank',
    shortName: 'RBL',
    senderIds: ['RBLBNK', 'RBLBK', 'VM-RBLBNK'],
    color: '#002B5C',
    logo: '🔵',
  },
  {
    id: 'standard_chartered',
    name: 'Standard Chartered',
    shortName: 'StanChart',
    senderIds: ['SCBANK', 'SCBINDIA', 'STCBKI', 'VM-SCBANK'],
    color: '#00A5B5',
    logo: '🟢',
  },
  {
    id: 'citi',
    name: 'Citibank India',
    shortName: 'Citi',
    senderIds: ['CITIBK', 'CITIBNK', 'CITIIN', 'VM-CITIBK'],
    color: '#003B70',
    logo: '🔵',
  },
  {
    id: 'hsbc',
    name: 'HSBC India',
    shortName: 'HSBC',
    senderIds: ['HSBCBK', 'HSBCIN', 'VM-HSBCBK'],
    color: '#DB0011',
    logo: '🔴',
  },
  {
    id: 'airtel_payments',
    name: 'Airtel Payments Bank',
    shortName: 'Airtel',
    senderIds: ['ARTPAY', 'AIRTELPB', 'AIRTEL', 'VM-ARTPAY'],
    color: '#ED1C24',
    logo: '🔴',
  },
  {
    id: 'paytm_payments',
    name: 'Paytm Payments Bank',
    shortName: 'Paytm',
    senderIds: ['PYTMPB', 'PAYTMB', 'PAYTM', 'VM-PYTMPB'],
    color: '#00BAF2',
    logo: '🔵',
  },
  {
    id: 'jupiter',
    name: 'Jupiter (Federal Bank)',
    shortName: 'Jupiter',
    senderIds: ['JUPTER', 'JUPITERBK', 'JUPITER', 'VM-JUPTER'],
    color: '#6C3AFF',
    logo: '🟣',
  },
  {
    id: 'fi_money',
    name: 'Fi Money (Federal Bank)',
    shortName: 'Fi',
    senderIds: ['FIMONY', 'FIMONEYB', 'VM-FIMONY'],
    color: '#000000',
    logo: '⬛',
  },
  {
    id: 'niyo',
    name: 'Niyo (DCB Bank / Equitas)',
    shortName: 'Niyo',
    senderIds: ['NIYOBK', 'NIYOBNK', 'VM-NIYOBK'],
    color: '#1A73E8',
    logo: '🔵',
  },
  {
    id: 'slice',
    name: 'Slice (North East SFB)',
    shortName: 'Slice',
    senderIds: ['SLICEB', 'SLICEBNK', 'VM-SLICEB'],
    color: '#5B21B6',
    logo: '🟣',
  },
] as const;

/**
 * Build a lookup map from sender ID to bank config.
 * Used for O(1) sender verification in SMS parser.
 */
export function buildSenderLookup(
  configs: readonly BankConfig[] = BANK_CONFIGS,
  remoteSenders?: Record<string, string[]>,
): Map<string, BankConfig> {
  const map = new Map<string, BankConfig>();

  for (const bank of configs) {
    for (const sender of bank.senderIds) {
      map.set(sender.toUpperCase(), bank);
    }
  }

  // Merge remote config senders (from Firebase Remote Config)
  if (remoteSenders) {
    for (const [bankId, senders] of Object.entries(remoteSenders)) {
      const bank = configs.find((b) => b.id === bankId);
      if (bank) {
        for (const sender of senders) {
          map.set(sender.toUpperCase(), bank);
        }
      }
    }
  }

  return map;
}

/**
 * All known sender IDs as a flat set for quick membership check.
 */
export function buildSenderWhitelist(
  configs: readonly BankConfig[] = BANK_CONFIGS,
): Set<string> {
  const set = new Set<string>();
  for (const bank of configs) {
    for (const sender of bank.senderIds) {
      set.add(sender.toUpperCase());
    }
  }
  return set;
}
