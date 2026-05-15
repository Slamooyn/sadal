import { NextResponse } from "next/server";
import crypto from "crypto";
import { supabase } from "../../../lib/supabase/supabase";

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 1000, 64, "sha512").toString("hex");
}


export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }


    const { data: existing } = await supabase
      .from("users")
      .select("email")
      .eq("email", email)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: "Account already exists" },
        { status: 409 }
      );
    }


    const salt = crypto.randomBytes(16).toString("hex");
    const passwordHash = hashPassword(password, salt);

    const { error: insertError } = await supabase.from("users").insert({
      email,
      password_hash: passwordHash,
      salt,
    });

    if (insertError) {
      console.error("[supabase] user insert error:", insertError.message);
      return NextResponse.json(
        { error: "Registration failed: " + insertError.message },
        { status: 500 }
      );
    }


    await supabase.from("profiles").upsert(
      {
        id: email,
        email,
        username: email.split("@")[0],
        bio: "",
        avatar_url: null,
        provider: "credentials",
      },
      { onConflict: "id", ignoreDuplicates: true }
    );

    console.log(`\n✅ User registered in Supabase: ${email}\n`);

    const response = NextResponse.json({ success: true, isNewUser: true });
    response.cookies.set("fashai_token", `user_${Date.now()}_${email}`, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24,
      sameSite: "lax",
    });

    return response;
  } catch (err) {
    console.error("[users] POST error:", err);
    return NextResponse.json(
      { error: "Registration failed" },
      { status: 500 }
    );
  }
}


export async function PUT(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }


    const { data: user, error } = await supabase
      .from("users")
      .select("*")
      .eq("email", email)
      .single();

    if (error || !user) {
      return NextResponse.json(
        { error: "Account not found. Please create an account first." },
        { status: 404 }
      );
    }


    const passwordHash = hashPassword(password, user.salt);
    if (passwordHash !== user.password_hash) {
      return NextResponse.json(
        { error: "Incorrect password" },
        { status: 401 }
      );
    }

    console.log(`\n🔑 User logged in from Supabase: ${email}\n`);

    const response = NextResponse.json({ success: true, isNewUser: false });
    response.cookies.set("fashai_token", `user_${Date.now()}_${email}`, {
      httpOnly: true,
      path: "/",
      maxAge: 60 * 60 * 24,
      sameSite: "lax",
    });

    return response;
  } catch (err) {
    console.error("[users] PUT error:", err);
    return NextResponse.json({ error: "Login failed" }, { status: 500 });
  }
}


export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("fashai_token");
  return response;
}
