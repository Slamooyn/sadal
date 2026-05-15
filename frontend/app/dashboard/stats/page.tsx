"use client";

import { useState, useEffect } from "react";
import { CheckCircle, Users, BarChart2 } from "lucide-react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import { createClient } from "@/lib/supabase/client";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function StatsPage() {
  const [searchValue, setSearchValue]     = useState("");
  const [loading, setLoading]             = useState(true);
  const [outfitsCreated, setOutfitsCreated] = useState(0);
  const [outfitsShared, setOutfitsShared]   = useState(0);
  const [dailyCounts, setDailyCounts]       = useState<number[]>([0, 0, 0, 0, 0, 0, 0]);

  const supabase = createClient();

  useEffect(() => {
    async function fetchStats() {
      setLoading(true);

      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) { setLoading(false); return; }
      const userId = sessionData.session.user.id;

      const now = new Date();
      const startOfWeek = new Date(now);
      startOfWeek.setDate(now.getDate() - now.getDay());
      startOfWeek.setHours(0, 0, 0, 0);
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 7);

      const [createdRes, sharedRes, weeklyRes] = await Promise.all([
        supabase
          .from("outfit_sets")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId),
        supabase
          .from("wardrobe_posts")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId),
        supabase
          .from("outfit_sets")
          .select("created_at")
          .eq("user_id", userId)
          .gte("created_at", startOfWeek.toISOString())
          .lt("created_at", endOfWeek.toISOString()),
      ]);

      setOutfitsCreated(createdRes.count ?? 0);
      setOutfitsShared(sharedRes.count ?? 0);

      const counts = [0, 0, 0, 0, 0, 0, 0];
      weeklyRes.data?.forEach((row) => {
        counts[new Date(row.created_at).getDay()]++;
      });
      setDailyCounts(counts);

      setLoading(false);
    }

    fetchStats();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const weeklyTotal = dailyCounts.reduce((a, b) => a + b, 0);
  const maxCount    = Math.max(...dailyCounts, 1);
  const hasData     = weeklyTotal > 0;

  const ANALYTICS_CARDS = [
    { label: "Outfits Created",      value: loading ? "—" : String(outfitsCreated), icon: CheckCircle, iconBg: "#dcfce7", iconColor: "#16a34a" },
    { label: "Total Outfits Shared", value: loading ? "—" : String(outfitsShared),  icon: Users,       iconBg: "#ede9fe", iconColor: "#7c3aed" },
  ];

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

        {/* Analytics Cards */}
        <div className="flex gap-5 mt-[26px] shrink-0">
          {ANALYTICS_CARDS.map(({ label, value, icon: Icon, iconBg, iconColor }) => (
            <div
              key={label}
              className="bg-white rounded-[14px] p-[30px] flex gap-[33px] items-center w-[290px] shrink-0 hover:shadow-md transition-shadow duration-200 cursor-default"
            >
              <div
                className="size-[54px] rounded-xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: iconBg }}
              >
                <Icon size={26} strokeWidth={2} style={{ color: iconColor }} />
              </div>
              <div className="flex flex-col leading-normal">
                <span className="text-[#b9b9b9] text-sm font-medium">{label}</span>
                <span className="text-black text-2xl font-semibold">{value}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Outfit Stats heading */}
        <div className="mt-[26px] shrink-0">
          <p className="text-black text-[22px] font-semibold leading-tight">Outfit Stats</p>
          <p className="text-[#4361ee] text-[22px] font-bold leading-tight mt-0.5">
            {loading
              ? "Loading..."
              : `${weeklyTotal} Outfit${weeklyTotal !== 1 ? "s" : ""} Made this Week`}
          </p>
        </div>

        {/* Chart area */}
        <div className="mt-5 flex-1 min-h-0 flex flex-col mb-[30px]">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4361ee]" />
            </div>
          ) : !hasData ? (
            <div className="flex-1 flex flex-col items-center justify-center gap-4">
              <BarChart2 size={64} strokeWidth={1} className="text-gray-300" />
              <div className="text-center">
                <p className="text-[15px] font-semibold text-gray-500">
                  You haven&apos;t created any outfits yet
                </p>
                <p className="text-[13px] text-gray-400 mt-1">
                  Start mixing and matching your wardrobe to see your stats here
                </p>
              </div>
            </div>
          ) : (
            <div className="flex-1 min-h-0 flex items-end px-0.5">
              <div className="w-full flex justify-between items-end h-full">
                {DAYS.map((day, i) => {
                  const count = dailyCounts[i];
                  const heightPct = (count / maxCount) * 100;
                  return (
                    <div key={day} className="w-[64px] flex flex-col items-center justify-end h-full">
                      {count > 0 && (
                        <span className="text-[11px] font-semibold text-[#4361ee] mb-1">{count}</span>
                      )}
                      <div
                        className="w-10 rounded-t-lg bg-[#4361ee] transition-all duration-700"
                        style={{ height: count > 0 ? `${Math.max(heightPct, 5)}%` : "0%" }}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* X-axis — always visible */}
          <div className="shrink-0">
            <div className="h-[3px] bg-black rounded-[39px]" />
            <div className="flex justify-between pt-3 px-0.5">
              {DAYS.map((day) => (
                <span key={day} className="text-[12.5px] font-semibold text-black w-[64px] text-center">
                  {day}
                </span>
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
