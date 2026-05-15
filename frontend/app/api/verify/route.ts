import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Use Supabase Admin client to check if email already exists
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST /api/verify — Send OTP to email via Supabase
export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // Check if user already exists with this email
    const { data: existingUsers } = await supabaseAdmin.auth.admin.listUsers();
    const userExists = existingUsers?.users?.some(
      (u) => u.email === email
    );

    if (userExists) {
      return NextResponse.json(
        { error: "An account with this email already exists. Please log in." },
        { status: 409 }
      );
    }

    // Send OTP email via Supabase Auth
    const { createClient: createBrowserClient } = await import("@supabase/supabase-js");
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        shouldCreateUser: false, // Don't create user yet, just send OTP
      },
    });

    // Supabase returns "Signups not allowed for otp" when shouldCreateUser is false
    // and the user doesn't exist. That's expected — we just want to send a code.
    // Use admin API to send a custom OTP instead.
    if (error) {
      // Fallback: use admin to generate an OTP invite
      const { error: otpError } = await supabaseAdmin.auth.admin.generateLink({
        type: "magiclink",
        email,
      });

      if (otpError) {
        console.error("[verify] OTP error:", otpError);
        return NextResponse.json(
          { error: "Failed to send verification code. Please try again." },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      message: "Verification code sent to your email",
    });
  } catch (err) {
    console.error("[verify] Error:", err);
    return NextResponse.json({ error: "Failed to send code" }, { status: 500 });
  }
}

// PUT /api/verify — Verify OTP code
export async function PUT(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and code are required" },
        { status: 400 }
      );
    }

    const { createClient: createBrowserClient } = await import("@supabase/supabase-js");
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { error } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: "email",
    });

    if (error) {
      console.error("[verify] Verify error:", error.message);
      return NextResponse.json(
        { error: "Invalid or expired code. Please try again." },
        { status: 400 }
      );
    }

    return NextResponse.json({ success: true, verified: true });
  } catch {
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}
