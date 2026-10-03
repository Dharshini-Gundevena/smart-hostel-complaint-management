'use client';

import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState, type FormEvent } from 'react';
import { getFriendlyAuthError } from '@/lib/auth-errors';
import { createSupabaseBrowserClient } from '@/lib/supabase/browser';

type AuthFormProps = { mode: 'login' | 'register' };

export function AuthForm({ mode }: AuthFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState(() => {
    const reason = searchParams.get('error');
    if (reason === 'callback') return 'That confirmation link has expired or is invalid. Request a new one or sign in.';
    if (reason === 'profile') return 'Your account was confirmed, but its profile is not ready yet. Please try again shortly.';
    if (reason === 'logout') return 'We could not end your session. Please try again.';
    if (searchParams.get('loggedOut') === '1') return 'You have been signed out.';
    if (searchParams.get('reason') === 'session') return 'Your session expired. Sign in again to continue.';
    return '';
  });
  const isRegister = mode === 'register';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setError('');
    setMessage('');
    const formData = new FormData(event.currentTarget);
    const email = String(formData.get('email') ?? '').trim().toLowerCase();
    const password = String(formData.get('password') ?? '');

    try {
      const supabase = createSupabaseBrowserClient();
      if (isRegister) {
      const fullName = String(formData.get('fullName') ?? '').trim();
      const phone = String(formData.get('phone') ?? '').trim();
      const { data, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
          data: { full_name: fullName, ...(phone ? { phone } : {}) },
        },
      });
      if (authError) {
        setError(getFriendlyAuthError(authError));
      } else if (data.session) {
        router.replace('/dashboard');
        router.refresh();
      } else {
        setMessage('Check your email for a confirmation link to finish creating your account.');
      }
      } else {
        const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
        if (authError) {
          setError(getFriendlyAuthError(authError));
        } else {
          const next = searchParams.get('next');
          const destination = next?.startsWith('/') && !next.startsWith('//') ? next : '/dashboard';
          router.replace(destination);
          router.refresh();
        }
      }
    } catch {
      setError('We could not reach the authentication service. Check your connection and try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <form className="auth-form" onSubmit={handleSubmit}>
      {isRegister && (
        <>
          <label>
            Full name
            <input autoComplete="name" name="fullName" required maxLength={120} />
          </label>
          <label>
            Phone <span className="field-note">Optional</span>
            <input autoComplete="tel" name="phone" type="tel" maxLength={32} />
          </label>
        </>
      )}
      <label>
        Email address
        <input autoComplete="email" name="email" type="email" required maxLength={254} />
      </label>
      <label>
        Password
        <input
          autoComplete={isRegister ? 'new-password' : 'current-password'}
          name="password"
          type="password"
          required
          minLength={8}
          maxLength={128}
        />
      </label>
      {error && <p className="form-alert form-alert-error" role="alert">{error}</p>}
      {message && <p className="form-alert form-alert-success" role="status">{message}</p>}
      <button className="primary-button" type="submit" disabled={pending}>
        {pending ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'}
      </button>
      <p className="auth-switch">
        {isRegister ? 'Already registered?' : 'New to Smart Hostel?'}{' '}
        <Link href={isRegister ? '/login' : '/register'}>{isRegister ? 'Sign in' : 'Create an account'}</Link>
      </p>
    </form>
  );
}