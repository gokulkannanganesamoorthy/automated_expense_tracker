import { getAdminFirestore } from '@/lib/firebase-admin';
import AnalyticsClient from './AnalyticsClient';

export const dynamic = 'force-dynamic';

export default async function AnalyticsPage() {
  const db = getAdminFirestore();

  let categoryData = [
    { name: 'Food', value: 0 },
    { name: 'Transport', value: 0 },
    { name: 'Shopping', value: 0 },
    { name: 'Bills', value: 0 },
    { name: 'Other', value: 0 },
  ];

  let volumeData = [
    { name: 'Jan', volume: 0 },
    { name: 'Feb', volume: 0 },
    { name: 'Mar', volume: 0 },
    { name: 'Apr', volume: 0 },
    { name: 'May', volume: 0 },
    { name: 'Jun', volume: 0 },
  ];

  try {
    const txSnapshot = await db.collectionGroup('transactions').get();
    
    // Process real transactions
    txSnapshot.forEach(doc => {
      const data = doc.data();
      const amount = data.amount || 0;
      const category = data.category || 'Other';
      const date = data.date ? new Date(data.date) : new Date();

      // Aggregate categories
      const catIndex = categoryData.findIndex(c => c.name.toLowerCase() === category.toLowerCase());
      if (catIndex >= 0) {
        categoryData[catIndex].value += amount;
      } else {
        categoryData[categoryData.length - 1].value += amount; // Add to Other
      }

      // Aggregate volumes by month (simplistic for Jan-Jun)
      const monthIndex = date.getMonth(); // 0 = Jan
      if (monthIndex < 6) {
        volumeData[monthIndex].volume += 1; // Count of transactions
      }
    });

  } catch (error) {
    console.error("Error fetching analytics data:", error);
    // Silent fail
  }

  // Filter out empty categories for pie chart
  categoryData = categoryData.filter(c => c.value > 0);
  if (categoryData.length === 0) {
    categoryData = [{ name: 'No Data', value: 1 }]; // Placeholder if empty
  }

  return (
    <AnalyticsClient 
      initialCategoryData={categoryData} 
      initialVolumeData={volumeData} 
    />
  );
}
