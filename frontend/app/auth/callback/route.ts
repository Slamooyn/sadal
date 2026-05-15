import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const next = searchParams.get('next') ?? '/auth_redirect'

  // Handle error responses from Supabase (e.g., database errors)
  const error_description = searchParams.get('error_description')
  if (error_description) {
    console.error('[auth/callback] Supabase error:', error_description)
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent(error_description)}`
    )
  }

  // Handle token_hash for email confirmation (magic link / confirm email flow)
  const token_hash = searchParams.get('token_hash')
  const type = searchParams.get('type')

  if (token_hash && type) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as 'signup' | 'email' | 'recovery' | 'invite',
    })

    if (!error) {
      // Email confirmed successfully
      return NextResponse.redirect(`${origin}${next}`)
    }

    console.error('[auth/callback] Verify OTP error:', error.message)
    return NextResponse.redirect(
      `${origin}/login?error=${encodeURIComponent('Email confirmation failed. Please try again.')}`
    )
  }

  // Handle OAuth code exchange
  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          },
        },
      }
    )

    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      return NextResponse.redirect(`${origin}${next}`)
    }
    console.error('[auth/callback] Exchange error:', error.message)
  }

  return NextResponse.redirect(`${origin}/login?error=auth_callback_failed`)
}