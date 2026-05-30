"use client";

import { useState, useEffect } from "react";
import { Search, ShoppingCart, Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";

interface TopBarProps {
  userName?: string;
  showGreeting?: boolean;
  searchValue: string;
  onSearchChange: (value: string) => void;
}

function UserAvatar({ name, avatarUrl }: { name: string; avatarUrl?: string | null }) {
  if (avatarUrl) {
    return (
      <div className="size-[62px] rounded-full overflow-hidden shrink-0 shadow-md select-none border border-[#4361ee]/20">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={avatarUrl}
          alt={name}
          className="w-full h-full object-cover"
        />
      </div>
    );
  }

  const trimmed = name.trim();
  const parts = trimmed ? trimmed.split(/\s+/) : [];
  const initials =
    parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : parts.length === 1
      ? parts[0][0].toUpperCase()
      : "?";

  return (
    <div className="size-[62px] rounded-full bg-gradient-to-br from-[#4361ee] to-[#738ef5] flex items-center justify-center shrink-0 shadow-md select-none">
      <span className="text-white text-xl font-bold tracking-wide">{initials}</span>
    </div>
  );
}

export default function TopBar({
  userName = "Risyad",
  showGreeting = true,
  searchValue,
  onSearchChange,
}: TopBarProps) {
  const [sessionUser, setSessionUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<{ username?: string; avatar_url?: string | null } | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let active = true;

    async function load() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user || !active) return;
        setSessionUser(user);

        const email = user.email;
        if (!email) return;

        // Try load from cache first
        const cacheKey = `fashai_profile_${email}`;
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          try {
            setProfile(JSON.parse(cached));
          } catch {
            // ignore corrupt cache
          }
        }

        // Fetch fresh profile
        const params = new URLSearchParams({ email });
        const res = await fetch(`/api/profile?${params.toString()}`);
        if (res.ok) {
          const data = await res.json();
          if (!data.error && active) {
            setProfile(data);
            sessionStorage.setItem(cacheKey, JSON.stringify(data));
          }
        }
      } catch (err) {
        console.error("TopBar profile load error:", err);
      }
    }
    load();

    return () => {
      active = false;
    };
  }, []);

  const displayName = profile?.username || sessionUser?.user_metadata?.full_name || sessionUser?.email?.split('@')[0] || userName;
  const displayAvatar = profile?.avatar_url || sessionUser?.user_metadata?.avatar_url || null;

  console.log("[TopBar Debug]", { displayName, displayAvatar, profile, sessionUser });

  return (
    <div className="flex items-center gap-[60px] shrink-0">
      {showGreeting && (
        <div className="flex items-center gap-5 shrink-0">
          {displayAvatar ? (
            <div className="size-[78px] rounded-full overflow-hidden shrink-0 shadow-md select-none border border-[#4361ee]/20">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={displayAvatar}
                alt={displayName}
                className="w-full h-full object-cover"
              />
            </div>
          ) : (
            <div className="size-[78px] rounded-full bg-gradient-to-br from-[#4361ee] to-[#738ef5] flex items-center justify-center shrink-0 shadow-md select-none">
              <span className="text-white text-2xl font-bold tracking-wide">
                {displayName.trim() ? displayName.trim()[0].toUpperCase() : "?"}
              </span>
            </div>
          )}
          <div className="flex flex-col leading-normal">
            <span className="text-[#b9b9b9] text-base font-medium">Hi, {displayName} !</span>
            <span className="text-black text-2xl font-semibold">Welcome Back!</span>
          </div>
        </div>
      )}

      <div className="flex items-center gap-8 flex-1">
        <div className="flex-1 bg-white rounded-full h-[61px] px-[30px] flex items-center gap-4 transition-shadow focus-within:shadow-[0_0_0_3px_rgba(67,97,238,0.15)]">
          <input
            type="text"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search"
            className="flex-1 text-lg font-medium text-gray-800 bg-transparent outline-none placeholder:text-[#cacaca]"
          />
          <Search size={22} strokeWidth={1.8} className="text-[#cacaca] shrink-0" />
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <button
            title="Cart"
            className="relative p-2.5 rounded-xl bg-white hover:bg-gray-100 active:scale-95 transition-all duration-150 shadow-sm"
          >
            <ShoppingCart size={22} strokeWidth={1.8} className="text-gray-600" />
            <span className="absolute top-1.5 right-1.5 size-2 bg-red-500 rounded-full ring-1 ring-white" />
          </button>
          <button
            title="Notifications"
            className="relative p-2.5 rounded-xl bg-white hover:bg-gray-100 active:scale-95 transition-all duration-150 shadow-sm"
          >
            <Bell size={22} strokeWidth={1.8} className="text-gray-600" />
            <span className="absolute top-1.5 right-1.5 size-2 bg-red-500 rounded-full ring-1 ring-white" />
          </button>

          {!showGreeting && <UserAvatar name={displayName} avatarUrl={displayAvatar} />}
        </div>
      </div>
    </div>
  );
}

