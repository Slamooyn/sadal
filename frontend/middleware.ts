import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE = "fashai_token";
const NEXTAUTH_SESSION_COOKIE = "authjs.session-token";
const PUBLIC_ROUTES = ["/login", "/register", "/add_your_email", "/verify_email", "/create_password", "/welcome_page", "/dashboard", "/onboarding"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow NextAuth API routes to pass through
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));

  // Check both the custom token and NextAuth session cookie
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const nextAuthSession = request.cookies.get(NEXTAUTH_SESSION_COOKIE)?.value;
  const isAuthenticated = !!token || !!nextAuthSession;

  if (!isAuthenticated && !isPublic) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }
  if (isAuthenticated && isPublic) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|login_page_components).*)",
  ],
};