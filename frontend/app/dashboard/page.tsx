"use client";

import { useState } from "react";
import { CheckCircle, Clock, CircleX, Shirt } from "lucide-react";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";

const ANALYTICS_CARDS = [
  { label: "Orders Completed",     value: "300K", icon: CheckCircle, iconBg: "#dcfce7", iconColor: "#16a34a" },
  { label: "Orders Pending",       value: "10K",  icon: Clock,       iconBg: "#fef3c7", iconColor: "#d97706" },
  { label: "Orders Cancelled",     value: "100K", icon: CircleX,     iconBg: "#fee2e2", iconColor: "#dc2626" },
  { label: "Total Outfit Created", value: "350K", icon: Shirt,       iconBg: "#ede9fe", iconColor: "#7c3aed" },
];

const TOTAL_OUTFITS = 5;

export default function DashboardPage() {
  const [searchValue, setSearchValue]   = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  function goPrev() {
    setCurrentIndex((i) => (i - 1 + TOTAL_OUTFITS) % TOTAL_OUTFITS);
  }
  function goNext() {
    setCurrentIndex((i) => (i + 1) % TOTAL_OUTFITS);
  }

  return (
    <div className="flex h-screen bg-[#f4f5f8] overflow-hidden">
      <Sidebar />

      <main
        className="flex-1 flex flex-col min-h-0 overflow-y-auto"
        style={{ padding: "30px 30px 30px 54px" }}
      >
        <TopBar
          userName="Risyad"
          showGreeting
          searchValue={searchValue}
          onSearchChange={setSearchValue}
        />

        <div className="flex gap-5 mt-[26px] shrink-0">
          {ANALYTICS_CARDS.map(({ label, value, icon: Icon, iconBg, iconColor }) => (
            <div
              key={label}
              className="bg-white rounded-[14px] p-[30px] flex gap-[33px] items-center flex-1 min-w-0 hover:shadow-md transition-shadow duration-200 cursor-default"
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

        <div className="flex flex-col items-center mt-10 pb-8">
          <h2
            className="font-extrabold text-[#4361ee] whitespace-nowrap"
            style={{ fontSize: "60px", lineHeight: 1.6 }}
          >
            Your Outfit For Today !
          </h2>

          <div className="relative flex items-center justify-center w-full mt-6">

            <button
              onClick={goPrev}
              className="absolute left-0 z-20 flex items-center justify-center hover:opacity-70 active:scale-95 transition-all duration-150 select-none"
              title="Previous outfit"
            >
              <svg width="39" height="51" viewBox="0 0 39 51" xmlns="http://www.w3.org/2000/svg">
                <polygon points="39,0 0,25.5 39,51" fill="#4361ee" />
              </svg>
            </button>

            <div className="flex items-center">

              <div
                className="bg-[#ebebeb] shrink-0"
                style={{
                  width: 311,
                  height: 500,
                  borderRadius: 22,
                  marginRight: -28,
                  position: "relative",
                  zIndex: 0,
                  boxShadow: "0px 3.571px 12.321px 0px rgba(0,0,0,0.25)",
                }}
              />

              <div
                className="bg-[#ebebeb] shrink-0"
                style={{
                  width: 349,
                  height: 560,
                  borderRadius: 25,
                  position: "relative",
                  zIndex: 10,
                  boxShadow: "0px 4px 33.5px 0px rgba(0,0,0,0.25)",
                }}
              />

              <div
                className="bg-[#ebebeb] shrink-0"
                style={{
                  width: 311,
                  height: 500,
                  borderRadius: 22,
                  marginLeft: -28,
                  position: "relative",
                  zIndex: 0,
                  boxShadow: "0px 3.571px 12.321px 0px rgba(0,0,0,0.25)",
                }}
              />

            </div>

            <button
              onClick={goNext}
              className="absolute right-0 z-20 flex items-center justify-center hover:opacity-70 active:scale-95 transition-all duration-150 select-none"
              title="Next outfit"
            >
              <svg width="39" height="51" viewBox="0 0 39 51" xmlns="http://www.w3.org/2000/svg">
                <polygon points="0,0 39,25.5 0,51" fill="#4361ee" />
              </svg>
            </button>

          </div>

        </div>
      </main>
    </div>
  );
}
