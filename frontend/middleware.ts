import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

const AUTH_ONLY_PAGES = ["/login", "/register", "/add_your_email", "/verify_email", "/create_password", "/welcome_page", "/welcome_animation"]
const ALWAYS_PUBLIC = ["/welcome_animation", "/auth_redirect", "/onboarding", "/auth/callback"]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith("/api")) return NextResponse.next()

  if (ALWAYS_PUBLIC.some((route) => pathname.startsWith(route))) {
    return NextResponse.next()
  }

  let supabaseResponse = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  const { data: { user } } = await supabase.auth.getUser()
  const isAuthenticated = !!user
  const isAuthPage = AUTH_ONLY_PAGES.some((route) => pathname.startsWith(route))

  if (isAuthenticated && isAuthPage) {
    return NextResponse.redirect(new URL("/auth_redirect", request.url))
  }

  if (!isAuthenticated && !isAuthPage) {
    const welcomeUrl = new URL("/welcome_page", request.url)
    welcomeUrl.searchParams.set("from", pathname)
    return NextResponse.redirect(welcomeUrl)
  }

  return supabaseResponse
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|login_page_components).*)",
  ],
}