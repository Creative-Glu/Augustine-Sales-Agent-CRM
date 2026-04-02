import { NextRequest, NextResponse } from 'next/server';

/**
 * Next.js 16 proxy (replaces middleware.ts).
 *
 * Checks for the `augustine-auth` cookie (set by AuthProvider on login).
 * - Protected routes → redirect to /login if no cookie
 * - /login → redirect to /dashboard if cookie exists (already logged in)
 *
 * This prevents the "flash of protected content" that happens with
 * client-side-only auth checks via useEffect.
 */

const AUTH_COOKIE = 'augustine-auth';
const LOGIN_PATH = '/login';
const DEFAULT_AUTHENTICATED_PATH = '/execution-dashboard';

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasAuthCookie = request.cookies.has(AUTH_COOKIE);

  // If on login page and already authenticated → redirect to dashboard
  if (pathname === LOGIN_PATH && hasAuthCookie) {
    return NextResponse.redirect(new URL(DEFAULT_AUTHENTICATED_PATH, request.url));
  }

  // If on a protected page and NOT authenticated → redirect to login
  if (!hasAuthCookie && pathname !== LOGIN_PATH) {
    const loginUrl = new URL(LOGIN_PATH, request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Run on all pages except Next.js internals, static files, and API routes
    '/((?!_next|api|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
  ],
};
