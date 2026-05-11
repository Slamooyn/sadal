"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { User, Lock } from "lucide-react";

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
      className="fixed z-50 top-[30px] bottom-[30px] flex flex-col gap-3 p-5"
      style={{
        left: 166, // sidebar width(106) + sidebar margin-left(30) + gap(30)
        width: 260,
        backgroundColor: "#3D47D6",
        borderRadius: 22,
        boxShadow: "0 8px 40px rgba(0,0,0,0.35)",
        transform: open ? "translateX(0)" : "translateX(-120%)",
        opacity: open ? 1 : 0,
        transition: "transform 0.35s cubic-bezier(0.22,1,0.36,1), opacity 0.25s ease",
        pointerEvents: open ? "auto" : "none",
      }}
    >
      <h3
        className="text-white font-bold text-lg px-2 pt-2 pb-4"
        style={{ borderBottom: "1px solid rgba(255,255,255,0.15)" }}
      >
        Settings
      </h3>

      <button
        onClick={() => {
          onClose();
          router.push("/settings/profile");
        }}
        className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-white font-medium
          hover:bg-white/15 active:scale-[0.97] transition-all duration-200 text-left"
      >
        <User size={20} strokeWidth={2} />
        <span>👤 Profile Setting</span>
      </button>

      <button
        onClick={() => {
          onClose();
          router.push("/settings/account");
        }}
        className="flex items-center gap-3 px-4 py-3.5 rounded-xl text-white font-medium
          hover:bg-white/15 active:scale-[0.97] transition-all duration-200 text-left"
      >
        <Lock size={20} strokeWidth={2} />
        <span>🔐 Account Setting</span>
      </button>
    </div>
  );
}
