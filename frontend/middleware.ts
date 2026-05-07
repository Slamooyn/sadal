import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE = "fashai_token";
const NEXTAUTH_SESSION_COOKIE = "authjs.session-token";

const AUTH_ONLY_PAGES = ["/login", "/register", "/add_your_email", "/verify_email", "/create_password", "/welcome_page", "/welcome_animation"];

const ALWAYS_PUBLIC = ["/welcome_animation", "/auth_redirect", "/onboarding"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  if (ALWAYS_PUBLIC.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  const token = request.cookies.get(AUTH_COOKIE)?.value;
  const nextAuthSession = request.cookies.get(NEXTAUTH_SESSION_COOKIE)?.value;
  const isAuthenticated = !!token || !!nextAuthSession;
  const isAuthPage = AUTH_ONLY_PAGES.some((route) => pathname.startsWith(route));

  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL("/auth_redirect", request.url));
  }

  if (!isAuthenticated && !isAuthPage) {
    const welcomeUrl = new URL("/welcome_page", request.url);
    welcomeUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(welcomeUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|login_page_components).*)",
  ],
};