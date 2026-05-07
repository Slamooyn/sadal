"use client";

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

const NAV_ITEMS = [
  { href: "/dashboard",               icon: Home,       label: "Home" },
  { href: "/dashboard/orders",        icon: Package,    label: "Orders" },
  { href: "/dashboard/wardrobe",      icon: BarChart,   label: "Wardrobe" },
  { href: "/dashboard/products",      icon: LayoutGrid, label: "Products" },
  { href: "/dashboard/notifications", icon: Bell,       label: "Notifications" },
  { href: "/dashboard/settings",      icon: Settings,   label: "Settings" },
];

export default function Sidebar() {
  const pathname = usePathname();

  function isActive(href: string) {
    if (href === "/dashboard") return pathname === "/dashboard";
    return pathname.startsWith(href);
  }

  return (
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
        </ul>

        <button
          title="Logout"
          className="flex items-center justify-center w-[52px] h-[42px] rounded-xl hover:bg-white/15 transition-all duration-200"
        >
          <LogOut size={22} strokeWidth={1.8} className="text-white" />
        </button>
      </nav>
    </aside>
  );
}
