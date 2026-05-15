import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { supabase } from "../../../lib/supabase/supabase";
import { supabaseAdmin } from "../../../lib/supabase/admin";

// Helper: get current user's email from cookies or query params
async function getCurrentUserEmail(): Promise<{
  email: string | null;
  provider: string;
}> {
  const cookieStore = await cookies();
  // Legacy token support (can be removed once fully migrated)
  const token = cookieStore.get("fashai_token")?.value;

  if (token) {
    const parts = token.split("_");
    const email = parts.length >= 3 ? parts.slice(2).join("_") : null;
    return { email, provider: "credentials" };
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

    // Google users cannot change email (managed by Google), but CAN set a password
    if (provider === "google" && field === "email") {
      return NextResponse.json(
        { error: "Google accounts cannot change email here" },
        { status: 403 }
      );
    }

    if (field === "password") {
      // Update password in Supabase Auth using admin client
      try {
        // Find user by email in auth.users
        const { data: { users }, error: listError } = await supabaseAdmin.auth.admin.listUsers();
        
        if (listError) {
          console.error("[profile] List users error:", listError);
          return NextResponse.json(
            { error: "Failed to update password" },
            { status: 500 }
          );
        }

        const authUser = users.find((u) => u.email === email);
        if (!authUser) {
          return NextResponse.json(
            { error: "User not found in auth system" },
            { status: 404 }
          );
        }

        const { error: updateError } = await supabaseAdmin.auth.admin.updateUserById(
          authUser.id,
          { password: value }
        );

        if (updateError) {
          console.error("[profile] Password update error:", updateError);
          return NextResponse.json(
            { error: updateError.message || "Failed to update password" },
            { status: 500 }
          );
        }

        console.log(`\n🔐 Password updated for: ${email}\n`);
        return NextResponse.json({ success: true });
      } catch (err) {
        console.error("[profile] Password update error:", err);
        return NextResponse.json(
          { error: "Failed to update password" },
          { status: 500 }
        );
      }
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
