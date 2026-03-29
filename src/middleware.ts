import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that don't require authentication
const publicRoutes = ['/login', '/register'];

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({ req, res });

  // Refresh session if expired
  const {
    data: { session },
  } = await supabase.auth.getSession();

  const { pathname } = req.nextUrl;

  // Allow public routes
  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    // If already logged in, redirect to appropriate page
    if (session) {
      const { data: profile } = await supabase
        .from('users')
        .select('role')
        .eq('id', session.user.id)
        .single();

      if (profile?.role === 'teacher') {
        return NextResponse.redirect(new URL('/teacher', req.url));
      }
      return NextResponse.redirect(new URL('/session', req.url));
    }
    return res;
  }

  // Require auth for all other routes
  if (!session) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  // Teacher-only routes
  if (pathname.startsWith('/teacher')) {
    const { data: profile } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (profile?.role !== 'teacher') {
      return NextResponse.redirect(new URL('/session', req.url));
    }
  }

  return res;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};
