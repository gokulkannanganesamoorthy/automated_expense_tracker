import { parsePastedText } from '../sms/parser';

export interface GmailSyncResult {
  success: boolean;
  transactionsAdded: number;
  reviewNeeded: number;
  errors: number;
  message?: string;
}

/**
 * Fetches recent bank transaction emails from Gmail and parses them.
 * @param accessToken The OAuth access token with gmail.readonly scope
 */
export async function syncBankEmails(accessToken: string): Promise<GmailSyncResult> {
  try {
    // We search for common bank transaction keywords in the subject or from typical bank email addresses.
    // E.g., HDFC: alerts@hdfcbank.net, SBI: e-statement@sbi.co.in, ICICI: transaction@icicibank.com
    const query = encodeURIComponent('(subject:"transaction" OR subject:"alert" OR subject:"debited" OR subject:"credited" OR subject:"payment") (from:hdfc OR from:sbi OR from:icici OR from:axis OR from:kotak)');
    
    // Fetch the list of message IDs
    const listResponse = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${query}&maxResults=15`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!listResponse.ok) {
      throw new Error(`Gmail API error: ${listResponse.statusText}`);
    }

    const listData = await listResponse.json();
    const messages = listData.messages || [];

    if (messages.length === 0) {
      return { success: true, transactionsAdded: 0, reviewNeeded: 0, errors: 0, message: 'No recent bank emails found.' };
    }

    let transactionsAdded = 0;
    let reviewNeeded = 0;
    let errors = 0;

    // Fetch the full content of each message
    for (const msg of messages) {
      try {
        const msgResponse = await fetch(`https://gmail.googleapis.com/gmail/v1/users/me/messages/${msg.id}?format=full`, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        });
        const msgData = await msgResponse.json();
        
        const bodyText = extractEmailBody(msgData.payload);
        if (bodyText) {
          const result = await parsePastedText(bodyText);
          
          if (result.status === 'success' && result.transaction) {
            // We use require here to avoid circular dependencies if any
            const { useTransactionStore } = require('../stores/transaction-store');
            
            if (result.transaction.needsReview) {
              reviewNeeded++;
              useTransactionStore.getState().setReviewQueueCount(useTransactionStore.getState().reviewQueueCount + 1);
            } else {
              transactionsAdded++;
            }
            useTransactionStore.getState().addTransaction(result.transaction);
          } else {
            errors++;
          }
        }
      } catch (err) {
        console.error('Error fetching/parsing individual email:', err);
        errors++;
      }
    }

    return {
      success: true,
      transactionsAdded,
      reviewNeeded,
      errors,
      message: `Sync complete. Added ${transactionsAdded} transactions.`,
    };
  } catch (error: any) {
    console.error('Gmail Sync Error:', error);
    return {
      success: false,
      transactionsAdded: 0,
      reviewNeeded: 0,
      errors: 1,
      message: error.message,
    };
  }
}

/**
 * Recursively extracts plain text from the Gmail payload parts.
 */
function extractEmailBody(payload: any): string {
  if (!payload) return '';
  
  let body = '';

  // If it's a multipart message
  if (payload.parts && payload.parts.length > 0) {
    for (const part of payload.parts) {
      if (part.mimeType === 'text/plain') {
        body += decodeBase64Url(part.body?.data || '');
      } else if (part.mimeType === 'text/html') {
        // Fallback to HTML if plain text isn't available, but strip tags
        const html = decodeBase64Url(part.body?.data || '');
        body += html.replace(/<[^>]*>?/gm, ' '); // simple strip tags
      } else if (part.parts) {
        body += extractEmailBody(part);
      }
    }
  } else if (payload.body && payload.body.data) {
    // If it's a simple message
    const decoded = decodeBase64Url(payload.body.data);
    if (payload.mimeType === 'text/html') {
      body = decoded.replace(/<[^>]*>?/gm, ' ');
    } else {
      body = decoded;
    }
  }

  return body;
}

function decodeBase64Url(base64Url: string): string {
  if (!base64Url) return '';
  // Convert base64url to base64
  let base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
  // Pad with '='
  while (base64.length % 4) {
    base64 += '=';
  }
  // Decode
  try {
    // React Native doesn't have atob globally by default unless polyfilled, 
    // but we can use Buffer if available, or a simple polyfill.
    // For Expo, usually we can use expo-crypto or just simple JS decoder.
    return decodeURIComponent(escape(global.atob ? global.atob(base64) : require('buffer').Buffer.from(base64, 'base64').toString('binary')));
  } catch (e) {
    try {
        return require('buffer').Buffer.from(base64, 'base64').toString('utf8');
    } catch (err) {
        console.error('Base64 decode failed', err);
        return '';
    }
  }
}
