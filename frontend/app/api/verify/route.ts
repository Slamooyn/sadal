import { NextResponse } from "next/server";

// POST /api/verify — Placeholder for future use
// Email verification is now fully handled by Supabase Auth's built-in flow.
// The client calls supabase.auth.resend() directly — no server endpoint needed.
export async function POST() {
  return NextResponse.json({
    success: true,
    message: "Email verification is handled by Supabase Auth. Use supabase.auth.resend() on the client.",
  });
}

// PUT /api/verify — Deprecated (was custom OTP verification)
export async function PUT() {
  return NextResponse.json(
    { error: "This endpoint is deprecated. Email verification is now handled by Supabase Auth." },
    { status: 410 }
  );
}
