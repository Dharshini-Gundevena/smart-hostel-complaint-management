import Link from 'next/link';

export default async function AccessDeniedPage({
  searchParams,
}: {
  searchParams: Promise<{ reason?: string }>;
}) {
  const { reason } = await searchParams;
  return (
    <main className="auth-main">
      <section className="access-state" aria-labelledby="denied-title">
        <p className="eyebrow">Account access</p>
        <h1 id="denied-title">{reason === 'profile' ? 'Profile not ready' : 'Access not available'}</h1>
        <p>
          {reason === 'profile'
            ? 'Your account profile could not be loaded. Try again shortly or contact your hostel administrator.'
            : 'Your account does not have permission to open this area.'}
        </p>
        <Link href="/dashboard">Return to your dashboard</Link>
      </section>
    </main>
  );
}