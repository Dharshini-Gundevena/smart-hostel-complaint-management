import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function POST(request: NextRequest) {
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase.auth.signOut();
  if (error) {
    return NextResponse.redirect(new URL('/login?error=logout', request.url), { status: 303 });
  }
  return NextResponse.redirect(new URL('/login?loggedOut=1', request.url), { status: 303 });
}