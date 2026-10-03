import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';
import { getSupabasePublicEnv } from '@/lib/env';
import type { Database } from '@/types/database';

const protectedRoleRoutes: Record<string, 'ADMIN' | 'MAINTENANCE' | 'STUDENT'> = {
  '/admin': 'ADMIN',
  '/maintenance': 'MAINTENANCE',
  '/student': 'STUDENT',
};

export async function middleware(request: NextRequest) {
  const { url, publishableKey } = getSupabasePublicEnv();
  let response = NextResponse.next({ request });
  const supabase = createServerClient<Database>(url, publishableKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll(cookiesToSet) {
        for (const { name, value } of cookiesToSet) request.cookies.set(name, value);
        response = NextResponse.next({ request });
        for (const { name, value, options } of cookiesToSet) response.cookies.set(name, value, options);
      },
    },
  });

  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;
  const requiredRole = Object.entries(protectedRoleRoutes).find(([prefix]) =>
    pathname === prefix || pathname.startsWith(`${prefix}/`),
  )?.[1];
  const isProtected = Boolean(requiredRole || pathname === '/dashboard');

  if (isProtected && !user) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    loginUrl.searchParams.set('reason', 'session');
    return NextResponse.redirect(loginUrl);
  }

  if (requiredRole && user) {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .maybeSingle();
    if (error || !profile) return NextResponse.redirect(new URL('/access-denied?reason=profile', request.url));
    if (profile.role !== requiredRole) return NextResponse.redirect(new URL('/access-denied', request.url));
  }

  return response;
}

export const config = {
  matcher: ['/dashboard/:path*', '/admin/:path*', '/maintenance/:path*', '/student/:path*'],
};