"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Home,
  Package,
  BarChart,
  LayoutGrid,
  Bell,
  Settings,
  LogOut,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import SettingsPanel from "./SettingsPanel";

const NAV_ITEMS = [
  { href: "/dashboard",               icon: Home,       label: "Home" },
  { href: "/dashboard/orders",        icon: Package,    label: "Orders" },
  { href: "/dashboard/wardrobe",      icon: BarChart,   label: "Wardrobe" },
  { href: "/dashboard/products",      icon: LayoutGrid, label: "Products" },
  { href: "/dashboard/notifications", icon: Bell,       label: "Notifications" },
];

export default function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [settingsOpen, setSettingsOpen] = useState(false);

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  const isSettingsPage = pathname.startsWith("/settings");

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

  return (
    <>
      <aside className="m-[30px] mr-0 w-[106px] shrink-0 rounded-[22px] bg-[#4361ee] flex flex-col items-center py-[30px]">
        <img src="/dashboard/logo.svg" alt="Fashai" className="size-[45px] object-contain shrink-0" />

        <nav className="flex flex-col flex-1 items-center justify-between mt-[84px] w-full">
          <ul className="flex flex-col items-center gap-8 list-none p-0 m-0 w-full px-3">
            {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
              const active = isActive(href);
              return (
                <li key={href} className="w-full flex justify-center">
                  <Link
                    href={href}
                    title={label}
                    className={[
                      "flex items-center justify-center w-[52px] h-[42px] rounded-xl transition-all duration-200",
                      active ? "bg-white/25 shadow-sm" : "hover:bg-white/15",
                    ].join(" ")}
                  >
                    <Icon size={22} strokeWidth={active ? 2.5 : 1.8} className="text-white" />
                  </Link>
                </li>
              );
            })}

            {/* Settings button — toggles panel instead of navigating */}
            <li className="w-full flex justify-center">
              <button
                title="Settings"
                onClick={() => setSettingsOpen((prev) => !prev)}
                className={[
                  "flex items-center justify-center w-[52px] h-[42px] rounded-xl transition-all duration-200",
                  settingsOpen || isSettingsPage
                    ? "bg-white/25 shadow-sm"
                    : "hover:bg-white/15",
                ].join(" ")}
              >
                <Settings
                  size={22}
                  strokeWidth={settingsOpen || isSettingsPage ? 2.5 : 1.8}
                  className="text-white"
                />
              </button>
            </li>
          </ul>

          <button
            onClick={handleLogout}
            title="Logout"
            className="flex items-center justify-center w-[52px] h-[42px] rounded-xl hover:bg-white/15 transition-all duration-200"
          >
            <LogOut size={22} strokeWidth={1.8} className="text-white" />
          </button>
        </nav>
      </aside>

      {/* Settings slide-in panel */}
      <SettingsPanel
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
      />
    </>
  );
}
