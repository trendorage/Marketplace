import { NextRequest, NextResponse } from 'next/server';

const protectedRoutes = ['/dashboard'];
const authRoutes = ['/sign-in', '/sign-up'];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const sessionToken =
    req.cookies.get('authjs.session-token')?.value ??
    req.cookies.get('__Secure-authjs.session-token')?.value;

  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));
  if (isAuthRoute && sessionToken) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  const isProtected = protectedRoutes.some((route) => pathname.startsWith(route));
  if (isProtected && !sessionToken) {
    const loginUrl = new URL('/sign-in', req.url);
    loginUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*', '/sign-in', '/sign-up'],
};
