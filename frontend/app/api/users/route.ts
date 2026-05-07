import { NextResponse } from "next/server";
import crypto from "crypto";

const users = new Map<string, { email: string; passwordHash: string; salt: string }>();

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
}

export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    if (users.has(email)) {
      return NextResponse.json({ error: "Account already exists" }, { status: 409 });
    }

    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = hashPassword(password, salt);

    users.set(email, { email, passwordHash, salt });

    console.log(`\n✅ User registered: ${email}\n`);

    const response = NextResponse.json({ success: true, isNewUser: true });
    response.cookies.set("fashai_token", `user_${Date.now()}_${email}`, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24,
      sameSite: "lax",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const user = users.get(email);
    if (!user) {
      return NextResponse.json({ error: "Account not found. Please create an account first." }, { status: 404 });
    }

    const passwordHash = hashPassword(password, user.salt);
    if (passwordHash !== user.passwordHash) {
      return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
    }

    console.log(`\n🔑 User logged in: ${email}\n`);

    const response = NextResponse.json({ success: true, isNewUser: false });
    response.cookies.set("fashai_token", `user_${Date.now()}_${email}`, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24,
      sameSite: "lax",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("fashai_token");
  return response;
}
