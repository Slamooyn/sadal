"use client";

import { Search, ShoppingCart, Bell } from "lucide-react";

interface TopBarProps {
  userName?: string;
  showGreeting?: boolean;
  searchValue: string;
  onSearchChange: (value: string) => void;
}

function UserAvatar({ name }: { name: string }) {
  const parts = name.trim().split(/\s+/);
  const initials =
    parts.length >= 2
      ? (parts[0][0] + parts[1][0]).toUpperCase()
      : parts[0][0].toUpperCase();
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
  return (
    <div className="flex items-center gap-[60px] shrink-0">
      {showGreeting && (
        <div className="flex items-center gap-5 shrink-0">
          <div className="size-[78px] rounded-full bg-gradient-to-br from-[#4361ee] to-[#738ef5] flex items-center justify-center shrink-0 shadow-md select-none">
            <span className="text-white text-2xl font-bold tracking-wide">
              {userName.trim()[0].toUpperCase()}
            </span>
          </div>
          <div className="flex flex-col leading-normal">
            <span className="text-[#b9b9b9] text-base font-medium">Hi, {userName} !</span>
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

          {!showGreeting && <UserAvatar name={userName} />}
        </div>
      </div>
    </div>
  );
}
