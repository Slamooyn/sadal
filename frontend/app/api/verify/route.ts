import { NextResponse } from "next/server";


export async function POST() {
  return NextResponse.json({
    success: true,
    message: "Email verification is handled by Supabase Auth. Use supabase.auth.resend() on the client.",
  });
}


export async function PUT() {
  return NextResponse.json(
    { error: "This endpoint is deprecated. Email verification is now handled by Supabase Auth." },
    { status: 410 }
  );
}
