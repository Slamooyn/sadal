"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { UserCircle2, UserCog, Bookmark } from "lucide-react";

interface SettingsPanelProps {
  open: boolean;
  onClose: () => void;
}

export default function SettingsPanel({ open, onClose }: SettingsPanelProps) {
  const router = useRouter();
  const panelRef = useRef<HTMLDivElement>(null);

  // Close on click outside
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        onClose();
      }
    }
    // Delay to avoid immediate close from the same click that opened it
    const timer = setTimeout(() => {
      document.addEventListener("mousedown", handleClick);
    }, 50);
    return () => {
      clearTimeout(timer);
      document.removeEventListener("mousedown", handleClick);
    };
  }, [open, onClose]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  return (
    <div
      ref={panelRef}
      className="fixed z-50 flex flex-col"
      style={{
        left: 166,
        top: 30,
        bottom: 30,
        width: 480,
        backgroundColor: "#4361ee",
        borderRadius: 22,
        boxShadow: "0 8px 40px rgba(0,0,0,0.35)",
        transform: open ? "translateX(0)" : "translateX(-120%)",
        opacity: open ? 1 : 0,
        transition: "transform 0.35s cubic-bezier(0.22,1,0.36,1), opacity 0.25s ease",
        pointerEvents: open ? "auto" : "none",
        padding: "48px 44px",
      }}
    >
      {/* Title */}
      <h1 className="text-white font-bold leading-tight mb-12" style={{ fontSize: 64 }}>
        Settings
      </h1>

      {/* Profile Setting */}
      <button
        onClick={() => {
          onClose();
          router.push("/settings/profile");
        }}
        className="flex items-center gap-4 text-white hover:bg-white/10 active:scale-[0.97] transition-all duration-200 text-left rounded-xl px-3 py-3 mb-3"
      >
        <UserCircle2 size={32} strokeWidth={1.5} className="shrink-0" />
        <span style={{ fontSize: 22 }}>
          <span className="font-bold">Profile</span>
          <span className="font-light"> Setting</span>
        </span>
      </button>

      {/* Account Setting */}
      <button
        onClick={() => {
          onClose();
          router.push("/settings/account");
        }}
        className="flex items-center gap-4 text-white hover:bg-white/10 active:scale-[0.97] transition-all duration-200 text-left rounded-xl px-3 py-3 mb-3"
      >
        <UserCog size={32} strokeWidth={1.5} className="shrink-0" />
        <span style={{ fontSize: 22 }}>
          <span className="font-bold">Account</span>
          <span className="font-light"> Setting</span>
        </span>
      </button>

      {/* Saved Outfits */}
      <button
        onClick={() => {
          onClose();
          router.push("/settings/saved");
        }}
        className="flex items-center gap-4 text-white hover:bg-white/10 active:scale-[0.97] transition-all duration-200 text-left rounded-xl px-3 py-3"
      >
        <Bookmark size={32} strokeWidth={1.5} className="shrink-0" />
        <span style={{ fontSize: 22 }}>
          <span className="font-bold">Saved</span>
          <span className="font-light"> Outfits</span>
        </span>
      </button>
    </div>
  );
}
