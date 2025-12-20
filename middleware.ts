import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that require authentication
const protectedRoutes = ['/feed', '/create', '/chat'];

// Routes that should redirect to feed if already authenticated
const authRoutes = ['/login'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionCookie = request.cookies.get('athena_session');

  // Check if trying to access protected route without session
  const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route));
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (isProtectedRoute && !sessionCookie) {
    const loginUrl = new URL('/login', request.url);
    return NextResponse.redirect(loginUrl);
  }

  // Note: We can't fully validate the session in middleware without decrypting it
  // The actual validation happens in the API routes and page components
  // This is just a quick check for the presence of a session cookie

  return NextResponse.next();
}

export const config = {
  matcher: ['/feed/:path*', '/create/:path*', '/chat/:path*', '/login'],
};

