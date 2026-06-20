/**
 * UPI app identifiers, deep link schemes, and notification patterns.
 */

export interface UPIAppConfig {
  id: string;
  name: string;
  packageName: string; // Android
  urlScheme: string;   // iOS
  notificationSenders: readonly string[]; // For notification listener
  color: string;
  icon: string;
}

export const UPI_APPS: readonly UPIAppConfig[] = [
  {
    id: 'gpay',
    name: 'Google Pay',
    packageName: 'com.google.android.apps.nbu.paisa.user',
    urlScheme: 'gpay',
    notificationSenders: ['Google Pay', 'GPay'],
    color: '#4285F4',
    icon: '🟦',
  },
  {
    id: 'phonepe',
    name: 'PhonePe',
    packageName: 'com.phonepe.app',
    urlScheme: 'phonepe',
    notificationSenders: ['PhonePe'],
    color: '#5F259F',
    icon: '🟪',
  },
  {
    id: 'paytm',
    name: 'Paytm',
    packageName: 'net.one97.paytm',
    urlScheme: 'paytm',
    notificationSenders: ['Paytm'],
    color: '#00BAF2',
    icon: '🔵',
  },
  {
    id: 'bhim',
    name: 'BHIM UPI',
    packageName: 'in.org.npci.upiapp',
    urlScheme: 'bhim',
    notificationSenders: ['BHIM', 'BHIM UPI'],
    color: '#00B140',
    icon: '🟩',
  },
  {
    id: 'cred',
    name: 'CRED',
    packageName: 'com.dreamplug.androidapp',
    urlScheme: 'cred',
    notificationSenders: ['CRED'],
    color: '#FFFFFF',
    icon: '⬜',
  },
  {
    id: 'slice',
    name: 'Slice',
    packageName: 'com.juice.slicepay',
    urlScheme: 'slice',
    notificationSenders: ['slice'],
    color: '#5B21B6',
    icon: '🟣',
  },
] as const;

/**
 * UPI deep link scheme for initiating payments.
 */
export const UPI_DEEP_LINK_SCHEME = 'upi://pay';

/**
 * UPI response codes from intent result.
 */
export const UPI_RESPONSE_CODES = {
  SUCCESS: '0',
  SUBMITTED: 'S',
  FAILURE: 'U',
  USER_CANCELLED: 'Z',
} as const;

/**
 * Parse UPI response from deep link return.
 */
export interface UPIResponse {
  txnId: string;
  responseCode: string;
  approvalRefNo: string;
  status: 'SUCCESS' | 'FAILURE' | 'SUBMITTED' | 'CANCELLED' | 'UNKNOWN';
  amount: string; // As string from UPI response
}

/**
 * Map UPI response code to status.
 */
export function parseUPIResponseCode(code: string): UPIResponse['status'] {
  switch (code) {
    case UPI_RESPONSE_CODES.SUCCESS:
      return 'SUCCESS';
    case UPI_RESPONSE_CODES.SUBMITTED:
      return 'SUBMITTED';
    case UPI_RESPONSE_CODES.FAILURE:
      return 'FAILURE';
    case UPI_RESPONSE_CODES.USER_CANCELLED:
      return 'CANCELLED';
    default:
      return 'UNKNOWN';
  }
}

/**
 * UPI VPA (Virtual Payment Address) validation pattern.
 */
export const UPI_VPA_REGEX = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9]+$/;

export function isValidUPIId(vpa: string): boolean {
  return UPI_VPA_REGEX.test(vpa);
}
