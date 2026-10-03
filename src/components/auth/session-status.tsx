'use client';

import { useAuth } from '@/components/auth/auth-provider';

export function SessionStatus() {
  const { session, loading } = useAuth();
  const label = loading ? 'Restoring session…' : session ? 'Session active' : 'Session ended';
  return <span aria-live="polite" className="session-status">{label}</span>;
}