import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

/**
 * Triggered on user creation
 * Initializes default categories and settings for the user
 */
export const onUserCreated = functions.auth.user().onCreate(async (user) => {
  const db = admin.firestore();
  
  await db.collection('users').doc(user.uid).set({
    email: user.email,
    createdAt: admin.firestore.FieldValue.serverTimestamp(),
    tier: 'free',
    settings: {
      currency: 'INR',
      notificationsEnabled: true
    }
  });

  return null;
});

/**
 * Callable Function: Analyze Spending
 * Generates AI-based insights on a user's spending patterns for the month
 */
export const generateInsights = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be logged in.');
  }

  // Implementation would aggregate transactions and generate insights
  return {
    insights: [
      "You've spent 20% less on dining out this month compared to last month.",
      "Consider setting a stricter budget for Shopping as you are nearing your limit."
    ]
  };
});
