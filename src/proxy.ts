import { NextResponse, type NextRequest } from 'next/server';

import { SESSION_COOKIE, verifyToken } from '@/lib/auth/jwt';

const PROTECTED = ['/people', '/tree'];
const AUTH_PAGES = ['/login', '/signup'];

export async function proxy(request: NextRequest): Promise<NextResponse> {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const session = token ? await verifyToken(token) : null;

  const isProtected = PROTECTED.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );
  if (isProtected && !session) {
    const url = request.nextUrl.clone();
    url.pathname = '/login';
    url.searchParams.set('next', pathname);
    return NextResponse.redirect(url);
  }

  if (AUTH_PAGES.includes(pathname) && session) {
    const url = request.nextUrl.clone();
    url.pathname = '/people';
    url.search = '';
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/people/:path*', '/tree/:path*', '/login', '/signup'],
};
