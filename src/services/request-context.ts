import { AppError } from '@/lib/errors';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function createRequestContext() {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getUser();

  if (error?.name === 'AuthSessionMissingError') {
    return { supabase, user: null };
  }
  if (error) {
    throw new AppError('Your session could not be verified. Please sign in again.', 401, 'UNAUTHENTICATED');
  }

  return { supabase, user: data.user };
}