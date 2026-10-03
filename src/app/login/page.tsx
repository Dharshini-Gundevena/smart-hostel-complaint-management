import { Suspense } from 'react';
import { AuthForm } from '@/components/auth/auth-form';

function LoginFormFallback() {
  return <p className="form-alert form-alert-success" role="status">Loading sign-in…</p>;
}

export default function LoginPage() {
  return (
    <main className="auth-shell">
      <aside className="auth-aside">
        <div className="brand-lockup">SMART <span>HOSTEL</span></div>
        <div className="aside-copy">
          <h1>A better way to care for your campus.</h1>
          <p>One place to report, follow, and resolve the things that make hostel life work.</p>
        </div>
        <div className="aside-foot">SMART HOSTEL COMPLAINT MANAGEMENT</div>
      </aside>
      <section className="auth-main" aria-labelledby="login-title">
        <div className="auth-panel">
          <p className="eyebrow">Your campus account</p>
          <h2 id="login-title">Welcome back</h2>
          <p className="auth-intro">Sign in to continue to your hostel workspace.</p>
          <Suspense fallback={<LoginFormFallback />}><AuthForm mode="login" /></Suspense>
        </div>
      </section>
    </main>
  );
}