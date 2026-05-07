import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const AUTH_COOKIE = "fashai_token";
const PUBLIC_ROUTES = ["/login", "/register", "/add_your_email", "/verify_email","/create_password","/welcome_page", "/dashboard", "/onboarding"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const isPublic = PUBLIC_ROUTES.some((route) => pathname.startsWith(route));
  const token = request.cookies.get(AUTH_COOKIE)?.value;
  if (!token && !isPublic) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }
  if (token && isPublic) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|login_page_components).*)",
  ],
};