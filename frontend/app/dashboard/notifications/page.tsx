"use client";

import { useState, useEffect } from "react";
import { Bell } from "lucide-react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import { createClient } from "@/lib/supabase/client";

interface Notification {
  id: number;
  user_id: string;
  title: string;
  message: string;
  read: boolean;
  created_at: string;
}

export default function NotificationsPage() {
  const [searchValue, setSearchValue]           = useState("");
  const [notifications, setNotifications]       = useState<Notification[]>([]);
  const [loading, setLoading]                   = useState(true);

  const supabase = createClient();

  useEffect(() => {
    async function load() {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) { setLoading(false); return; }

      const { data } = await supabase
        .from("notifications")
        .select("id, user_id, title, message, read, created_at")
        .eq("user_id", sessionData.session.user.id)
        .order("created_at", { ascending: false });

      setNotifications(data ?? []);
      setLoading(false);
    }
    load();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="flex h-screen bg-[#f4f5f8] overflow-hidden">
      <Sidebar />

      <main
        className="flex-1 flex flex-col min-h-0 overflow-y-auto"
        style={{ padding: "30px 30px 30px 54px" }}
      >
        <TopBar
          userName="Risyad"
          showGreeting={false}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
        />

        <div className="bg-white rounded-[22px] mt-5 flex-1 min-h-0 flex flex-col overflow-hidden mb-[30px]">

          {/* Header */}
          <div className="px-[57px] pt-[28px] shrink-0">
            <p className="text-[#b9b9b9] text-[32px] font-medium leading-tight">Recent</p>
            <p className="text-black text-[44px] font-semibold leading-tight">Notifications</p>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-[57px] pt-8 pb-8 min-h-0">
            {loading ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4361ee]" />
              </div>
            ) : notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-4">
                <div className="size-20 rounded-full bg-[#f4f5f8] flex items-center justify-center">
                  <Bell size={40} strokeWidth={1} className="text-gray-300" />
                </div>
                <p className="text-[15px] font-semibold text-gray-500">No notifications yet</p>
                <p className="text-sm text-gray-400 text-center max-w-[280px]">
                  You&apos;ll see notifications here when something happens
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-8">
                {notifications.map((notif) => (
                  <div key={notif.id} className="flex items-start gap-4">
                    {/* Unread dot */}
                    <div
                      className={[
                        "size-[22px] rounded-full shrink-0 mt-[3px]",
                        notif.read ? "bg-gray-300" : "bg-red-500",
                      ].join(" ")}
                    />
                    {/* Text */}
                    <div className="flex flex-col">
                      <span className="text-[22px] font-semibold text-black leading-tight">
                        {notif.title || "System"}
                      </span>
                      <span className="text-[22px] font-bold text-[#4361ee] leading-tight">
                        {notif.message}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
