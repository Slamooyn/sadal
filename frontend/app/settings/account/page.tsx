"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut, Eye, EyeOff, Check, AlertCircle, Loader2, Info } from "lucide-react";
import Sidebar from "../../dashboard/components/Sidebar";

interface ProfileData {
  id: string;
  username: string;
  bio: string;
  avatar_url: string | null;
  email: string;
  provider: string;
}

/* ── Toast ──────────────────────────────────────────────────────────────────── */
function Toast({
  message,
  type,
  onDone,
}: {
  message: string;
  type: "success" | "error";
  onDone: () => void;
}) {
  useEffect(() => {
    const t = setTimeout(onDone, 3000);
    return () => clearTimeout(t);
  }, [onDone]);

  return (
    <div
      className="fixed bottom-8 right-8 z-[999] flex items-center gap-2 px-5 py-3 rounded-xl
        text-white text-sm font-medium shadow-2xl"
      style={{
        backgroundColor: type === "success" ? "#16a34a" : "#dc2626",
        animation: "slideUp 0.3s ease",
      }}
    >
      {type === "success" ? <Check size={16} /> : <AlertCircle size={16} />}
      {message}
    </div>
  );
}

/* ── Main Page ──────────────────────────────────────────────────────────────── */
export default function AccountSettingPage() {
  const router = useRouter();
  const [sessionUser, setSessionUser] = useState<any>(null);
  const [sessionStatus, setSessionStatus] = useState("loading");

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => {
      setSessionUser(user);
      setSessionStatus(user ? "authenticated" : "unauthenticated");
    });
  }, []);

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const [savingEmail, setSavingEmail] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const [toast, setToast] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const showToast = useCallback(
    (message: string, type: "success" | "error") => {
      setToast({ message, type });
    },
    []
  );

  const userEmail = sessionUser?.email || null;
  const isGoogleUser =
    profile?.provider === "google" || sessionUser?.app_metadata?.provider === "google";

  // Fetch profile from Supabase via API
  useEffect(() => {
    if (sessionStatus === "loading") return;

    const params = new URLSearchParams();
    if (userEmail) params.set("email", userEmail);

    fetch(`/api/profile?${params.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (!data.error) {
          setProfile(data);
          setEmail(data.email || userEmail || "");
        }
      })
      .catch(() => showToast("Failed to load profile", "error"))
      .finally(() => setLoading(false));
  }, [sessionStatus, userEmail, showToast]);

  async function updateField(field: string, value: string) {
    const res = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ field, value, email: userEmail }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Update failed");
    if (data.profile) setProfile(data.profile);
    return data;
  }

  async function handleChangeEmail() {
    if (!email.trim()) return;
    setSavingEmail(true);
    try {
      await updateField("email", email.trim());
      showToast("Email updated!", "success");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to update email",
        "error"
      );
    } finally {
      setSavingEmail(false);
    }
  }

  async function handleChangePassword() {
    if (!password.trim() || password.length < 6) {
      showToast("Password must be at least 6 characters", "error");
      return;
    }
    setSavingPassword(true);
    try {
      await updateField("password", password);
      setPassword("");
      showToast("Password updated!", "success");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to update password",
        "error"
      );
    } finally {
      setSavingPassword(false);
    }
  }

  async function handleLogout() {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      localStorage.removeItem("fashai_onboarding_completed");
      localStorage.removeItem("fashai_is_new_user");
      localStorage.removeItem("fashai_needs_onboarding");
      localStorage.removeItem("fashai_signup_email");
      localStorage.removeItem("fashai_mood");
      localStorage.removeItem("fashai_style");
      router.push("/login");
    } catch {
      router.push("/login");
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen bg-[#F0F0F5] overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex items-center justify-center">
          <Loader2 size={40} className="text-[#3D47D6] animate-spin" />
        </main>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-[#F0F0F5] overflow-hidden">
      <Sidebar />

      <main className="flex-1 flex items-center justify-center p-8">
        <div
          className="relative w-full flex flex-col"
          style={{
            maxWidth: 780,
            backgroundColor: "#3D47D6",
            borderRadius: 32,
            padding: "48px 56px 40px",
            boxShadow: "0 12px 48px rgba(61,71,214,0.35)",
          }}
        >
          {/* Header */}
          <div className="flex items-center gap-4 mb-10">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div>
              <h1 className="text-white font-bold text-3xl leading-tight">Account</h1>
              <p className="text-white/60 text-sm font-medium">Setting</p>
            </div>
          </div>

          {/* Google notice */}
          {isGoogleUser && (
            <div
              className="flex items-start gap-3 px-4 py-3.5 rounded-xl mb-8"
              style={{ backgroundColor: "rgba(255,255,255,0.1)" }}
            >
              <Info size={18} className="text-white/70 shrink-0 mt-0.5" />
              <p className="text-white/70 text-sm leading-relaxed">
                You&apos;re signed in with Google. Email and password changes are managed through your Google account.
              </p>
            </div>
          )}

          {/* Email */}
          <div className="mb-6">
            <label className="text-white/80 text-sm font-medium block mb-2">Email</label>
            <div className="flex gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                disabled={isGoogleUser}
                className="flex-1 bg-white text-gray-900 rounded-xl px-4 py-3 text-sm outline-none
                  focus:ring-2 focus:ring-white/30 transition-all placeholder:text-gray-400
                  disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
              />
              <button
                onClick={handleChangeEmail}
                disabled={savingEmail || isGoogleUser}
                className="px-6 py-3 rounded-xl text-white text-sm font-semibold transition-all duration-200
                  hover:brightness-110 active:scale-[0.96] disabled:opacity-40 disabled:cursor-not-allowed
                  flex items-center gap-2"
                style={{ backgroundColor: "#7B2ABD" }}
              >
                {savingEmail && <Loader2 size={14} className="animate-spin" />}
                Change
              </button>
            </div>
          </div>

          {/* Password */}
          <div className="mb-6">
            <label className="text-white/80 text-sm font-medium block mb-2">Password</label>
            <div className="flex gap-3">
              <div className="relative flex-1">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isGoogleUser ? "Not available for Google accounts" : "Enter new password"}
                  disabled={isGoogleUser}
                  className="w-full bg-white text-gray-900 rounded-xl px-4 py-3 pr-12 text-sm outline-none
                    focus:ring-2 focus:ring-white/30 transition-all placeholder:text-gray-400
                    disabled:bg-gray-200 disabled:text-gray-500 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isGoogleUser}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400
                    hover:text-gray-600 transition-colors disabled:opacity-40"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
              <button
                onClick={handleChangePassword}
                disabled={savingPassword || isGoogleUser}
                className="px-6 py-3 rounded-xl text-white text-sm font-semibold transition-all duration-200
                  hover:brightness-110 active:scale-[0.96] disabled:opacity-40 disabled:cursor-not-allowed
                  flex items-center gap-2"
                style={{ backgroundColor: "#7B2ABD" }}
              >
                {savingPassword && <Loader2 size={14} className="animate-spin" />}
                Change
              </button>
            </div>
          </div>

          {/* Logout */}
          <div className="mt-6">
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 text-white/60 hover:text-white transition-colors duration-200
                text-sm font-medium hover:bg-white/10 px-4 py-2.5 rounded-xl"
            >
              <LogOut size={18} strokeWidth={2} />
              Logout
            </button>
          </div>
        </div>
      </main>

      {toast && <Toast message={toast.message} type={toast.type} onDone={() => setToast(null)} />}
    </div>
  );
}
