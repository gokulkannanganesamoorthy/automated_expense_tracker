import * as admin from 'firebase-admin';
import * as fs from 'fs';
import * as path from 'path';

let isInitialized = false;

// Default dummy service account to prevent crash if not configured
const dummyServiceAccount = {
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'demo-project',
  clientEmail: 'demo@demo.iam.gserviceaccount.com',
  privateKey: '-----BEGIN PRIVATE KEY-----\nMOCK\n-----END PRIVATE KEY-----\n',
};

export function initFirebaseAdmin() {
  if (isInitialized) return;
  if (admin.apps.length > 0) {
    isInitialized = true;
    return;
  }

  try {
    const serviceAccountPath = process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT_PATH || './serviceAccountKey.json';
    const absolutePath = path.resolve(/*turbopackIgnore: true*/ process.cwd(), serviceAccountPath);
    
    let credential;

    if (fs.existsSync(absolutePath)) {
      const serviceAccount = JSON.parse(fs.readFileSync(absolutePath, 'utf-8'));
      credential = admin.credential.cert(serviceAccount);
      console.log('Firebase Admin SDK initialized successfully using service account file.');
    } else {
      console.warn('⚠️ FIREBASE_ADMIN_SERVICE_ACCOUNT_PATH file not found! Falling back to dummy credentials. Firestore queries will fail.');
      credential = admin.credential.cert(dummyServiceAccount);
    }

    admin.initializeApp({
      credential,
      databaseURL: `https://${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseio.com`
    });

    isInitialized = true;
  } catch (error) {
    console.error('Firebase admin initialization error', error);
  }
}

export const getAdminAuth = () => {
  initFirebaseAdmin();
  return admin.auth();
};

export const getAdminFirestore = () => {
  initFirebaseAdmin();
  return admin.firestore();
};
