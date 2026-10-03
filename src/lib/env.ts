import { AppError } from '@/lib/errors';

function requiredEnv(name: string, rawValue: string | undefined): string {
  const value = rawValue?.trim();
  if (!value) {
    throw new AppError(`Missing required environment variable: ${name}`, 500, 'SERVER_CONFIGURATION_ERROR');
  }
  return value;
}

export function getSupabasePublicEnv() {
  return {
    url: requiredEnv('NEXT_PUBLIC_SUPABASE_URL', process.env.NEXT_PUBLIC_SUPABASE_URL),
    publishableKey: requiredEnv(
      'NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY',
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
    ),
  };
}
