import { redirect } from 'next/navigation';
import { getAuthenticatedProfile } from '@/lib/auth';
import { isUserRole } from '@/lib/authorization';
import { SessionStatus } from '@/components/auth/session-status';

export default async function DashboardPage() {
  let profile;
  try {
    profile = await getAuthenticatedProfile();
  } catch {
    redirect('/access-denied?reason=profile');
  }

  if (!isUserRole(profile.role)) redirect('/access-denied');
  const section = profile.role === 'ADMIN' ? 'Admin' : profile.role === 'MAINTENANCE' ? 'Maintenance' : 'Student';

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <p className="eyebrow">Smart Hostel</p>
          <h1>{section} workspace</h1>
        </div>
        <SessionStatus />
        <form action="/auth/logout" method="post">
          <button className="text-button" type="submit">Sign out</button>
        </form>
      </header>
      <section className="dashboard-card">
        <h2>Welcome{profile.full_name ? `, ${profile.full_name}` : ''}</h2>
        <p>Your account is active with the {profile.role.toLowerCase()} role.</p>
      </section>
    </main>
  );
}