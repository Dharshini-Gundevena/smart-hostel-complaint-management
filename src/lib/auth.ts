import type { User } from '@supabase/supabase-js';
import { AppError } from '@/lib/errors';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createRequestContext } from '@/services/request-context';
import type { Database } from '@/types/database';

export type ProfileRecord = Database['public']['Tables']['profiles']['Row'];

export async function getAuthenticatedUser(): Promise<User | null> {
  const { user } = await createRequestContext();
  return user;
}

export async function requireAuthenticatedUser(): Promise<User> {
  const user = await getAuthenticatedUser();
  if (!user) {
    throw new AppError('Authentication is required.', 401, 'UNAUTHENTICATED');
  }
  return user;
}

export async function getAuthenticatedProfile(): Promise<ProfileRecord> {
  const user = await requireAuthenticatedUser();
  const supabase = await createSupabaseServerClient();
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    throw new AppError('Unable to load your account profile.', 500, 'PROFILE_LOOKUP_FAILED');
  }
  if (!profile) {
    throw new AppError('Your account profile is still being prepared. Please try again shortly.', 409, 'PROFILE_NOT_READY');
  }
  return profile;
}