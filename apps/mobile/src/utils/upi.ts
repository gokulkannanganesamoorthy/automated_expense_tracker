import * as Linking from 'expo-linking';
import { Platform } from 'react-native';

export interface UPIPaymentDetails {
  pa: string; // Payee VPA
  pn: string; // Payee Name
  mc?: string; // Merchant Code
  tid?: string; // Transaction ID
  tr?: string; // Transaction Ref ID
  tn?: string; // Transaction Note
  am: string; // Amount
  cu: string; // Currency (usually INR)
  url?: string; // Reference URL
}

export const upiService = {
  /**
   * Generates a UPI deep link URI string
   */
  generateUPILink(details: UPIPaymentDetails): string {
    const baseUrl = 'upi://pay';
    const params = new URLSearchParams();
    
    // Required fields
    params.append('pa', details.pa);
    params.append('pn', details.pn);
    params.append('am', details.am);
    params.append('cu', details.cu || 'INR');
    
    // Optional fields
    if (details.mc) params.append('mc', details.mc);
    if (details.tid) params.append('tid', details.tid);
    if (details.tr) params.append('tr', details.tr);
    if (details.tn) params.append('tn', details.tn);
    if (details.url) params.append('url', details.url);

    return `${baseUrl}?${params.toString()}`;
  },

  /**
   * Attempts to open the generated UPI link in any installed UPI app
   * such as GPay, PhonePe, Paytm, etc.
   */
  async initiatePayment(details: UPIPaymentDetails): Promise<boolean> {
    const upiUrl = this.generateUPILink(details);
    
    try {
      const canOpen = await Linking.canOpenURL(upiUrl);
      if (canOpen) {
        await Linking.openURL(upiUrl);
        return true;
      } else {
        console.warn('[UPIService] No UPI apps found on device to handle deep link.');
        return false;
      }
    } catch (error) {
      console.error('[UPIService] Failed to launch UPI intent:', error);
      return false;
    }
  },

  /**
   * Specific helper to open Google Pay directly if multiple apps exist and user prefers GPay
   */
  async initiatePaymentGPay(details: UPIPaymentDetails): Promise<boolean> {
    const upiUrl = this.generateUPILink(details);
    
    // Android specific explicit intent for GPay package
    if (Platform.OS === 'android') {
      const gpayUrl = upiUrl.replace('upi://pay', 'tez://upi/pay');
      try {
        const canOpen = await Linking.canOpenURL(gpayUrl);
        if (canOpen) {
          await Linking.openURL(gpayUrl);
          return true;
        }
      } catch (e) {
        // Fallback to general UPI intent if specific intent fails
      }
    }
    
    // Fallback
    return this.initiatePayment(details);
  }
};
