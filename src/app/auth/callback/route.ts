import { NextResponse, type NextRequest } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  if (!code) return NextResponse.redirect(new URL('/login?error=callback', request.url));

  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.exchangeCodeForSession(code);
  if (error || !data.user) return NextResponse.redirect(new URL('/login?error=callback', request.url));

  const fullName = data.user.user_metadata.full_name;
  const phone = data.user.user_metadata.phone;
  const profileUpdate: DatabaseProfileUpdate = {};
  if (typeof fullName === 'string') profileUpdate.full_name = fullName;
  if (typeof phone === 'string' && phone.length > 0) profileUpdate.phone = phone;
  if (Object.keys(profileUpdate).length > 0) {
    const { error: updateError } = await supabase
      .from('profiles')
      .update(profileUpdate)
      .eq('id', data.user.id);
    if (updateError) return NextResponse.redirect(new URL('/login?error=profile', request.url));
  }

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', data.user.id)
    .maybeSingle();
  if (profileError || !profile) return NextResponse.redirect(new URL('/login?error=profile', request.url));

  return NextResponse.redirect(new URL('/dashboard', request.url));
}

type DatabaseProfileUpdate = {
  full_name?: string;
  phone?: string;
};