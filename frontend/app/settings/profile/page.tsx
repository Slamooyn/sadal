"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { LogOut, Camera, Check, AlertCircle, Loader2 } from "lucide-react";
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
export default function ProfileSettingPage() {
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  const [username, setUsername] = useState("");
  const [bio, setBio] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  const [savingUsername, setSavingUsername] = useState(false);
  const [savingBio, setSavingBio] = useState(false);
  const [savingAvatar, setSavingAvatar] = useState(false);

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

  // Determine user email
  const userEmail = sessionUser?.email || null;

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
          setUsername(data.username || "");
          setBio(data.bio || "");
          setAvatarPreview(data.avatar_url);
        }
      })
      .catch(() => showToast("Failed to load profile", "error"))
      .finally(() => setLoading(false));
  }, [sessionStatus, userEmail, showToast]);

  const displayName = profile?.username || sessionUser?.user_metadata?.full_name || sessionUser?.email?.split('@')[0] || "User";
  const displayAvatar = avatarPreview || sessionUser?.user_metadata?.avatar_url || null;

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

  async function handleChangeUsername() {
    if (!username.trim()) return;
    setSavingUsername(true);
    try {
      await updateField("username", username.trim());
      showToast("Username updated!", "success");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to update username",
        "error"
      );
    } finally {
      setSavingUsername(false);
    }
  }

  async function handleChangeBio() {
    setSavingBio(true);
    try {
      await updateField("bio", bio.trim());
      showToast("Bio updated!", "success");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Failed to update bio",
        "error"
      );
    } finally {
      setSavingBio(false);
    }
  }

  function handleAvatarClick() {
    fileInputRef.current?.click();
  }

  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const localUrl = URL.createObjectURL(file);
    setAvatarPreview(localUrl);
    setSavingAvatar(true);

    try {
      // Convert to base64 for storage
      const reader = new FileReader();
      reader.onloadend = async () => {
        const dataUrl = reader.result as string;
        try {
          await updateField("avatar_url", dataUrl);
          setAvatarPreview(dataUrl);
          showToast("Avatar updated!", "success");
        } catch {
          showToast("Failed to upload avatar", "error");
        } finally {
          setSavingAvatar(false);
        }
      };
      reader.readAsDataURL(file);
    } catch {
      showToast("Failed to upload avatar", "error");
      setSavingAvatar(false);
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
          <div className="flex items-center gap-4 mb-8">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ backgroundColor: "rgba(255,255,255,0.15)" }}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </div>
            <div>
              <h1 className="text-white font-bold text-3xl leading-tight">Profile</h1>
              <p className="text-white/60 text-sm font-medium">Setting</p>
            </div>
          </div>

          {/* Avatar + Name */}
          <div className="flex items-center gap-5 mb-10">
            <div className="relative group shrink-0">
              <button
                onClick={handleAvatarClick}
                className="relative w-[88px] h-[88px] rounded-full overflow-hidden cursor-pointer
                  transition-transform duration-200 hover:scale-105 active:scale-95"
                style={{ border: "3px solid #F97316", padding: 3 }}
                title="Click to change avatar"
              >
                {displayAvatar ? (
                  <img src={displayAvatar} alt={displayName} className="w-full h-full rounded-full object-cover" />
                ) : (
                  <div className="w-full h-full rounded-full bg-gradient-to-br from-[#4361ee] to-[#738ef5] flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">{displayName[0]?.toUpperCase()}</span>
                  </div>
                )}
                <div className="absolute inset-0 rounded-full bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center">
                  {savingAvatar ? (
                    <Loader2 size={20} className="text-white animate-spin" />
                  ) : (
                    <Camera size={20} className="text-white" />
                  )}
                </div>
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
            </div>
            <div className="flex flex-col">
              <span className="text-white font-semibold text-xl">{displayName}</span>
              <span className="text-white/50 text-sm">{profile?.bio || "No bio yet"}</span>
            </div>
          </div>

          {/* Username */}
          <div className="mb-6">
            <label className="text-white/80 text-sm font-medium block mb-2">Username</label>
            <div className="flex gap-3">
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="flex-1 bg-white text-gray-900 rounded-xl px-4 py-3 text-sm outline-none
                  focus:ring-2 focus:ring-white/30 transition-all placeholder:text-gray-400"
              />
              <button
                onClick={handleChangeUsername}
                disabled={savingUsername}
                className="px-6 py-3 rounded-xl text-white text-sm font-semibold transition-all duration-200
                  hover:brightness-110 active:scale-[0.96] disabled:opacity-60 disabled:cursor-not-allowed
                  flex items-center gap-2"
                style={{ backgroundColor: "#7B2ABD" }}
              >
                {savingUsername && <Loader2 size={14} className="animate-spin" />}
                Change
              </button>
            </div>
          </div>

          {/* Bio */}
          <div className="mb-6">
            <label className="text-white/80 text-sm font-medium block mb-2">Profile Bio</label>
            <div className="flex gap-3">
              <input
                type="text"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                placeholder="Tell us about yourself"
                className="flex-1 bg-white text-gray-900 rounded-xl px-4 py-3 text-sm outline-none
                  focus:ring-2 focus:ring-white/30 transition-all placeholder:text-gray-400"
              />
              <button
                onClick={handleChangeBio}
                disabled={savingBio}
                className="px-6 py-3 rounded-xl text-white text-sm font-semibold transition-all duration-200
                  hover:brightness-110 active:scale-[0.96] disabled:opacity-60 disabled:cursor-not-allowed
                  flex items-center gap-2"
                style={{ backgroundColor: "#7B2ABD" }}
              >
                {savingBio && <Loader2 size={14} className="animate-spin" />}
                Change
              </button>
            </div>
          </div>

          {/* Logout */}
          <div className="mt-4">
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