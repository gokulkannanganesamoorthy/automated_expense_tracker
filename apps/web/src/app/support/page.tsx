import { getAdminFirestore } from '@/lib/firebase-admin';
import SupportClient from './SupportClient';

export const dynamic = 'force-dynamic';

export default async function SupportPage() {
  const db = getAdminFirestore();

  let tickets: any[] = [];

  try {
    const snapshot = await db.collection('tickets').orderBy('createdAt', 'desc').limit(10).get();
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const date = data.createdAt ? new Date(data.createdAt.toDate()) : new Date();
      tickets.push({
        id: doc.id,
        user: data.userName || 'Unknown User',
        subject: data.subject || 'No Subject',
        status: data.status || 'open',
        time: date.toLocaleDateString(),
      });
    });
  } catch (error) {
    console.error("Error fetching support tickets:", error);
  }

  return (
    <SupportClient initialTickets={tickets} />
  );
}
