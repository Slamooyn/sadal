import { NextResponse, type NextRequest } from 'next/server'

const AUTH_ONLY_PAGES = ["/login", "/register", "/add_your_email", "/verify_email", "/create_password", "/welcome_page", "/welcome_animation"]
const ALWAYS_PUBLIC = ["/welcome_animation", "/auth_redirect", "/onboarding", "/auth/callback"]

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl


    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      console.error('[middleware] Missing env vars:', {
        url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      })
      return NextResponse.next()
    }

    if (pathname.startsWith("/api")) return NextResponse.next()

    if (ALWAYS_PUBLIC.some((route) => pathname.startsWith(route))) {
      return NextResponse.next()
    }


    const { createServerClient } = await import('@supabase/ssr')

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
  } catch (error) {

    console.error('[middleware] Unhandled error:', error)
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|favicon\\.png|login_page_components|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}