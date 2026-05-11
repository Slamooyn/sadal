import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "../../../lib/supabase";

// Helper: extract email from fashai_token (format: user_{timestamp}_{email})
function getEmailFromToken(token: string): string | null {
  const parts = token.split("_");
  if (parts.length >= 3) return parts.slice(2).join("_");
  return null;
}

// Helper: get current user's email from cookies
async function getCurrentUserEmail(): Promise<{
  email: string | null;
  provider: string;
}> {
  const cookieStore = await cookies();
  const token = cookieStore.get("fashai_token")?.value;
  const nextAuthSession = cookieStore.get("authjs.session-token")?.value;

  if (token) {
    const email = getEmailFromToken(token);
    return { email, provider: "credentials" };
  }

  if (nextAuthSession) {
    // For Google users, we need to look them up by provider
    // We'll return a special marker — the session page will pass email from client
    return { email: null, provider: "google" };
  }

  return { email: null, provider: "none" };
}

export async function GET(request: Request) {
  try {
    const { email: tokenEmail, provider } = await getCurrentUserEmail();

    // Check if client passed email via query param (for Google users)
    const url = new URL(request.url);
    const clientEmail = url.searchParams.get("email");
    const email = tokenEmail || clientEmail;

    if (!email) {
      return NextResponse.json(
        { error: "Not authenticated", provider },
        { status: 401 }
      );
    }

    // Fetch from Supabase
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", email)
      .single();

    if (error || !data) {
      // Return default profile if not found
      return NextResponse.json({
        id: email,
        username: email.split("@")[0],
        bio: "",
        avatar_url: null,
        email,
        provider,
      });
    }

    return NextResponse.json({ ...data, provider: data.provider || provider });
  } catch (err) {
    console.error("[profile] GET error:", err);
    return NextResponse.json(
      { error: "Failed to fetch profile" },
      { status: 500 }
    );
  }
}

export async function PUT(request: Request) {
  try {
    const { email: tokenEmail, provider } = await getCurrentUserEmail();

    const body = await request.json();
    const { field, value, email: clientEmail } = body;

    const email = tokenEmail || clientEmail;

    if (!email) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }

    const validFields = ["username", "bio", "avatar_url", "email", "password"];
    if (!field || !validFields.includes(field)) {
      return NextResponse.json({ error: "Invalid field" }, { status: 400 });
    }

    // Google users cannot change email or password
    if (provider === "google" && (field === "email" || field === "password")) {
      return NextResponse.json(
        { error: "Google accounts cannot change email or password here" },
        { status: 403 }
      );
    }

    if (field === "password") {
      // Password changes are not stored in profiles table
      console.log(`\n🔐 Password change requested for: ${email}\n`);
      return NextResponse.json({ success: true });
    }

    // Update profile in Supabase
    const updateData: Record<string, string> = { [field]: value };

    // First try update
    const { data: existing } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", email)
      .single();

    if (existing) {
      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", email);

      if (error) {
        console.error("[profile] update error:", error.message);
        return NextResponse.json(
          { error: "Failed to update: " + error.message },
          { status: 500 }
        );
      }
    } else {
      // Create profile if it doesn't exist
      const { error } = await supabase.from("profiles").insert({
        id: email,
        email,
        username: field === "username" ? value : email.split("@")[0],
        bio: field === "bio" ? value : "",
        avatar_url: field === "avatar_url" ? value : null,
        provider,
      });

      if (error) {
        console.error("[profile] insert error:", error.message);
        return NextResponse.json(
          { error: "Failed to create profile: " + error.message },
          { status: 500 }
        );
      }
    }

    // Fetch updated profile
    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", email)
      .single();

    console.log(`\n✏️ Profile [${field}] updated for: ${email}\n`);

    return NextResponse.json({ success: true, profile });
  } catch (err) {
    console.error("[profile] PUT error:", err);
    return NextResponse.json(
      { error: "Failed to update profile" },
      { status: 500 }
    );
  }
}
