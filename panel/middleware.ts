import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

export const config = {
  matcher: [
    '/contentoire/((?!api|_next/static|_next/image|favicon.ico|auth).*)',
    '/contentoire/auth/((?!signin).*)',
  ],
};

// Add basePath to NextResponse.redirect
const redirectWithBasePath = (url: string, request: NextRequest) => {
  const baseUrl = new URL(request.url);
  baseUrl.pathname = '/contentoire' + url;
  return NextResponse.redirect(baseUrl);
};

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAuth = !!token;
  const isAuthPage = request.nextUrl.pathname.startsWith('/contentoire/auth');
  const isSignInPage = request.nextUrl.pathname === '/contentoire/auth/signin';
  const isRootPath = request.nextUrl.pathname === '/';

  // If accessing auth pages and already authenticated
  if (isAuthPage && isAuth) {
    return redirectWithBasePath('/dashboard', request);
  }

  // If accessing protected pages and not authenticated
  if (!isAuth && !isSignInPage) {
    return redirectWithBasePath('/auth/signin', request);
  }

  // Redirect root path to dashboard if authenticated
  if (isRootPath && isAuth) {
    return redirectWithBasePath('/dashboard', request);
  }

  return NextResponse.next();
}
