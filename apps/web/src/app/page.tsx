import { getAdminFirestore, getAdminAuth } from '@/lib/firebase-admin';
import DashboardClient from './DashboardClient';

// Ensure this page always renders dynamically to get live data
export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const db = getAdminFirestore();
  const auth = getAdminAuth();

  let activeUsersCount = 0;
  let totalTransactions = 0;
  let avgConfidence = 0;

  try {
    // 1. Fetch total users
    const listUsersResult = await auth.listUsers(1000);
    activeUsersCount = listUsersResult.users.length;

    // 2. Fetch global transactions to calculate metrics
    // WARNING: In production with millions of rows, use an aggregation function instead!
    const txSnapshot = await db.collectionGroup('transactions').get();
    totalTransactions = txSnapshot.size;

    let totalConfidence = 0;
    txSnapshot.forEach(doc => {
      const data = doc.data();
      if (data.confidenceScore) {
        totalConfidence += data.confidenceScore;
      }
    });

    avgConfidence = totalTransactions > 0 ? (totalConfidence / totalTransactions) : 100;
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    // Silent fail so the dashboard still loads with 0s if Firebase isn't fully configured
  }

  // Format numbers nicely
  const formattedUsers = activeUsersCount.toLocaleString();
  const formattedTransactions = totalTransactions > 10000 
    ? (totalTransactions / 1000).toFixed(1) + 'k' 
    : totalTransactions.toLocaleString();
  const formattedConfidence = avgConfidence.toFixed(1) + '%';

  return (
    <DashboardClient 
      activeUsers={formattedUsers}
      totalTransactions={formattedTransactions}
      avgConfidence={formattedConfidence}
    />
  );
}
