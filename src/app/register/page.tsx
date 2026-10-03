import { Suspense } from 'react';
import { AuthForm } from '@/components/auth/auth-form';

function RegisterFormFallback() {
  return <p className="form-alert form-alert-success" role="status">Loading registration…</p>;
}

export default function RegisterPage() {
  return (
    <main className="auth-shell">
      <aside className="auth-aside">
        <div className="brand-lockup">SMART <span>HOSTEL</span></div>
        <div className="aside-copy">
          <h1>Make your stay work better.</h1>
          <p>Create your account to connect with the people who keep your residence running.</p>
        </div>
        <div className="aside-foot">SMART HOSTEL COMPLAINT MANAGEMENT</div>
      </aside>
      <section className="auth-main" aria-labelledby="register-title">
        <div className="auth-panel">
          <p className="eyebrow">Get started</p>
          <h2 id="register-title">Create your account</h2>
          <p className="auth-intro">Use your campus email. You can complete your room details after signing in.</p>
          <Suspense fallback={<RegisterFormFallback />}><AuthForm mode="register" /></Suspense>
        </div>
      </section>
    </main>
  );
}