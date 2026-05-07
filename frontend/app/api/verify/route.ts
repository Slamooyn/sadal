import { NextResponse } from "next/server";

const verificationCodes = new Map<string, { code: string; expiresAt: number }>();

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: "Invalid email" }, { status: 400 });
    }

    const code = Math.floor(10000 + Math.random() * 90000).toString();

    verificationCodes.set(email, {
      code,
      expiresAt: Date.now() + 10 * 60 * 1000,
    });

    console.log(`\n📧 Verification code for ${email}: ${code}\n`);

    return NextResponse.json({
      success: true,
      message: "Verification code sent",
      ...(process.env.NODE_ENV !== "production" && { devCode: code }),
    });
  } catch {
    return NextResponse.json({ error: "Failed to send code" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { email, code } = await request.json();

    if (!email || !code) {
      return NextResponse.json({ error: "Email and code are required" }, { status: 400 });
    }

    const stored = verificationCodes.get(email);

    if (!stored) {
      return NextResponse.json({ error: "No verification code found. Please request a new one." }, { status: 400 });
    }

    if (Date.now() > stored.expiresAt) {
      verificationCodes.delete(email);
      return NextResponse.json({ error: "Code has expired. Please request a new one." }, { status: 400 });
    }

    if (stored.code !== code) {
      return NextResponse.json({ error: "Invalid code. Please try again." }, { status: 400 });
    }

    verificationCodes.delete(email);

    return NextResponse.json({ success: true, verified: true });
  } catch {
    return NextResponse.json({ error: "Verification failed" }, { status: 500 });
  }
}
