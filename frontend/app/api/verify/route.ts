import { NextResponse } from "next/server";
import { Resend } from "resend";
import { createClient } from "@supabase/supabase-js";

const resend = new Resend(process.env.RESEND_API_KEY);

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// POST /api/verify — Generate OTP, store in DB, send via email
export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    // Generate 6-digit code
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString(); // 10 min

    // Delete any existing codes for this email, then insert new one
    await supabaseAdmin
      .from("verification_codes")
      .delete()
      .eq("email", email);

    const { error: insertError } = await supabaseAdmin
      .from("verification_codes")
      .insert({ email, code, expires_at: expiresAt });

    if (insertError) {
      console.error("[verify] DB insert error:", insertError);
      return NextResponse.json(
        { error: "Failed to generate code. Please try again." },
        { status: 500 }
      );
    }

    // Send email via Resend
    const { error: emailError } = await resend.emails.send({
      from: "Fashai <onboarding@resend.dev>",
      to: email,
      subject: "Your Fashai verification code",
      html: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 24px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #3D4FE0; font-size: 28px; margin: 0;">Fashai</h1>
            <p style="color: #666; font-size: 14px; margin-top: 4px;">Your AI Fashion Assistant</p>
          </div>
          <div style="background: #f8f9fa; border-radius: 16px; padding: 32px; text-align: center;">
            <p style="color: #333; font-size: 16px; margin: 0 0 8px;">Your verification code is:</p>
            <div style="font-size: 36px; font-weight: 700; letter-spacing: 8px; color: #3D4FE0; padding: 16px 0; font-family: monospace;">
              ${code}
            </div>
            <p style="color: #999; font-size: 13px; margin: 16px 0 0;">
              This code expires in 10 minutes.<br/>
              If you didn't request this, you can safely ignore this email.
            </p>
          </div>
        </div>
      `,
    });

    if (emailError) {
      console.error("[verify] Resend error:", emailError);
      // Clean up the code since email failed
      await supabaseAdmin.from("verification_codes").delete().eq("email", email);
      return NextResponse.json(
        { error: "Failed to send verification email. Please try again." },
        { status: 500 }
      );
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

// PUT /api/verify — Verify OTP code from DB
export async function PUT(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json(
        { error: "Email and code are required" },
        { status: 400 }
      );
    }

    // Look up code in DB
    const { data, error: fetchError } = await supabaseAdmin
      .from("verification_codes")
      .select("code, expires_at")
      .eq("email", email)
      .single();

    if (fetchError || !data) {
      return NextResponse.json(
        { error: "No verification code found. Please request a new one." },
        { status: 400 }
      );
    }

    // Check expiry
    if (new Date() > new Date(data.expires_at)) {
      await supabaseAdmin.from("verification_codes").delete().eq("email", email);
      return NextResponse.json(
        { error: "Code has expired. Please request a new one." },
        { status: 400 }
      );
    }

    // Check code match
    if (data.code !== code) {
      return NextResponse.json(
        { error: "Invalid code. Please try again." },
        { status: 400 }
      );
    }

    // Success — clean up
    await supabaseAdmin.from("verification_codes").delete().eq("email", email);

    return NextResponse.json({ success: true, verified: true });
  } catch {
    return NextResponse.json(
      { error: "Verification failed" },
      { status: 500 }
    );
  }
}
