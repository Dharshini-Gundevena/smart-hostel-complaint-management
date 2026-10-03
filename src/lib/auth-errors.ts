'use client';

export function getFriendlyAuthError(error: { code?: string; message?: string }): string {
  const code = error.code?.toLowerCase() ?? '';
  const message = error.message?.toLowerCase() ?? '';

  if (code.includes('invalid_credentials') || message.includes('invalid login credentials')) {
    return 'Email or password is incorrect.';
  }
  if (code.includes('user_already_exists') || message.includes('already registered')) {
    return 'An account with this email already exists. Sign in instead.';
  }
  if (code.includes('email_not_confirmed') || message.includes('email not confirmed')) {
    return 'Confirm your email using the link we sent before signing in.';
  }
  if (code.includes('weak_password') || message.includes('password should be')) {
    return 'Choose a stronger password with at least 8 characters.';
  }
  if (message.includes('rate limit')) {
    return 'Too many attempts. Please wait a moment and try again.';
  }
  return 'We could not complete that request. Check your details and try again.';
}