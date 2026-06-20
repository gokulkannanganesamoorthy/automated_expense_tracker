import { getAdminAuth } from '@/lib/firebase-admin';
import UsersClient from './UsersClient';

export const dynamic = 'force-dynamic';

export default async function UsersPage() {
  const auth = getAdminAuth();
  
  let formattedUsers: any[] = [];

  try {
    const listUsersResult = await auth.listUsers(1000);
    
    formattedUsers = listUsersResult.users.map(user => {
      // Mock plan and status for now if custom claims aren't fully set up yet
      const plan = user.customClaims?.stripeRole ? 'Pro' : 'Free';
      const status = user.disabled ? 'Suspended' : 'Active';
      
      const creationTime = new Date(user.metadata.creationTime || Date.now());
      const lastSignInTime = new Date(user.metadata.lastSignInTime || Date.now());

      return {
        id: user.uid,
        name: user.displayName || user.email?.split('@')[0] || 'Unknown User',
        email: user.email || 'No Email',
        plan: plan,
        status: status,
        joined: creationTime.toISOString().split('T')[0],
        lastActive: lastSignInTime.toLocaleDateString(),
      };
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    // Silent fail
  }

  return (
    <UsersClient initialUsers={formattedUsers} />
  );
}
