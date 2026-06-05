"use client";

import { useState, useEffect } from "react";
import { Shirt, Sparkles } from "lucide-react";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import { createClient } from "@/lib/supabase/client";


interface DBClothingItem {
  id: string;
  name: string;
  processed_image_url: string | null;
}

interface OutfitCard {
  name: string;
  description: string;
  shirt: DBClothingItem | null;
  pants: DBClothingItem | null;
  shoes: DBClothingItem | null;
  source: "wardrobe" | "ai";
}




// ─── Sub-components ─────────────────────────────────────────────────────────────


function CardShimmer() {
  return (
    <div className="w-full h-full flex flex-col p-6 justify-between animate-pulse bg-gray-50/50">
      <div className="flex flex-col gap-2 items-center">
        <div className="h-6 w-3/4 bg-gray-200 rounded-full" />
        <div className="h-4 w-1/2 bg-gray-200 rounded-full" />
      </div>
      <div className="flex flex-col gap-3 flex-1 justify-center">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center gap-3.5 bg-white rounded-[15px] p-2.5 border border-gray-100 h-[72px]">
            <div className="w-[55px] h-[55px] rounded-[10px] bg-gray-200 shrink-0" />
            <div className="flex flex-col gap-1.5 flex-1">
              <div className="h-3 w-1/4 bg-gray-200 rounded-full" />
              <div className="h-4 w-3/4 bg-gray-200 rounded-full" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}


function OutfitItemRow({
  item,
  label,
  height,
}: {
  item: DBClothingItem | null;
  label: string;
  height: number;
}) {
  return (
    <div 
      className="flex items-center gap-3.5 bg-white rounded-[15px] p-2.5 shadow-sm border border-gray-100 hover:shadow-md hover:border-blue-100 transition-all duration-200 select-none"
      style={{ height }}
    >
      {/* Small thumbnail container */}
      <div className="w-[55px] h-[55px] rounded-[10px] bg-[#f4f5f8] flex items-center justify-center overflow-hidden shrink-0 border border-gray-50">
        {item?.processed_image_url ? (
          <img
            src={item.processed_image_url}
            alt={item.name}
            className="w-full h-full object-contain p-1"
          />
        ) : (
          <Shirt size={22} className="text-gray-300" strokeWidth={1.5} />
        )}
      </div>

      {/* Item info */}
      <div className="flex flex-col min-w-0 justify-center">
        <span className="text-[10px] font-bold tracking-wider text-[#4361ee] uppercase">
          {label}
        </span>
        <span className="text-[14px] font-semibold text-gray-800 truncate">
          {item?.name || `No ${label.toLowerCase()}`}
        </span>
      </div>
    </div>
  );
}


function SourceBadge({ source, isSide }: { source: "wardrobe" | "ai"; isSide?: boolean }) {
  if (source === "wardrobe") {
    return (
      <div
        className="inline-flex items-center gap-1.5 rounded-full font-semibold select-none"
        style={{
          backgroundColor: "#dcfce7",
          color: "#16a34a",
          fontSize: isSide ? "9px" : "10px",
          padding: isSide ? "3px 8px" : "4px 10px",
        }}
      >
        <Shirt size={isSide ? 10 : 12} strokeWidth={2.5} />
        Your Wardrobe
      </div>
    );
  }
  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-full font-semibold select-none"
      style={{
        background: "linear-gradient(135deg, #eef0fd, #f3e8ff)",
        color: "#7c3aed",
        fontSize: isSide ? "9px" : "10px",
        padding: isSide ? "3px 8px" : "4px 10px",
      }}
    >
      <Sparkles size={isSide ? 10 : 12} strokeWidth={2.5} />
      AI Suggestion
    </div>
  );
}


function OutfitCardView({
  outfit,
  isSide = false,
}: {
  outfit: OutfitCard;
  isSide?: boolean;
}) {
  const rowHeight = isSide ? 72 : 82;

  return (
    <div
      className="w-full h-full flex flex-col p-6 justify-between bg-gradient-to-b from-[#fbfbfe] to-[#f4f5f8]"
      style={{ opacity: isSide ? 0.75 : 1, transition: "all 0.3s ease" }}
    >
      {/* Title & Vibe Section */}
      <div className="flex flex-col gap-1.5 text-center select-none items-center">
        <SourceBadge source={outfit.source} isSide={isSide} />
        <h3
          className="font-extrabold text-gray-800 leading-snug tracking-tight text-ellipsis overflow-hidden whitespace-nowrap"
          style={{ fontSize: isSide ? "20px" : "24px" }}
        >
          {outfit.name}
        </h3>
        <p 
          className="text-gray-400 font-medium tracking-wide text-ellipsis overflow-hidden whitespace-nowrap"
          style={{ fontSize: isSide ? "11px" : "13px" }}
        >
          {outfit.description}
        </p>
      </div>

      {/* Item list */}
      <div className="flex flex-col gap-3 mt-4 flex-1 justify-center">
        <OutfitItemRow item={outfit.shirt} label="Top" height={rowHeight} />
        <OutfitItemRow item={outfit.pants} label="Bottom" height={rowHeight} />
        <OutfitItemRow item={outfit.shoes} label="Shoes" height={rowHeight} />
      </div>
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const [searchValue, setSearchValue]   = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [outfits, setOutfits]           = useState<OutfitCard[]>([]);
  const [loading, setLoading]           = useState(true);  // true while Gemini responds
  const [error, setError]               = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const supabase = createClient();

    async function loadOutfits() {
      const mood  = localStorage.getItem("fashai_mood")  ?? "";
      const style = localStorage.getItem("fashai_style") ?? "";

      // Get user session to pass userId
      let userId: string | undefined;
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        userId = sessionData.session?.user?.id;
      } catch {
        console.warn("[dashboard] Could not get user session");
      }

      const cached = sessionStorage.getItem("fashai_outfits");
      if (cached) {
        try {
          const saved = JSON.parse(cached) as Array<OutfitCard>;
          if (Array.isArray(saved) && saved.length > 0 && "shirt" in saved[0]) {
            if (!cancelled) { 
              setOutfits(saved); 
              setLoading(false); 
            }
            return;
          }
        } catch { /* corrupt cache — fall through to fresh fetch */ }
      }

      try {
        const res = await fetch("/api/recommendation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mood, style, userId }),
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (!Array.isArray(data.outfits) || data.outfits.length === 0) {
          throw new Error("Empty outfits");
        }

        sessionStorage.setItem("fashai_outfits", JSON.stringify(data.outfits));

        if (!cancelled) {
          setOutfits(data.outfits);
          setLoading(false);
        }
      } catch {
        if (!cancelled) {
          setError("Tidak dapat memuat rekomendasi outfit.");
          setLoading(false);
        }
      }
    }

    loadOutfits();
    return () => { cancelled = true; };
  }, []);

  const total = outfits.length;

  function goPrev() {
    if (total > 0) setCurrentIndex((i) => (i - 1 + total) % total);
  }
  function goNext() {
    if (total > 0) setCurrentIndex((i) => (i + 1) % total);
  }

  const prevOutfit    = total > 0 ? outfits[(currentIndex - 1 + total) % total] : null;
  const currentOutfit = total > 0 ? outfits[currentIndex]                        : null;
  const nextOutfit    = total > 0 ? outfits[(currentIndex + 1) % total]          : null;

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

        {/* Your Outfit For Today section */}
        <div className="flex flex-col items-center mt-10 pb-8">
          <h2
            className="font-extrabold text-[#4361ee] whitespace-nowrap"
            style={{ fontSize: "60px", lineHeight: 1.6 }}
          >
            Your Outfit For Today !
          </h2>

          {error && (
            <p className="mt-3 text-sm text-red-500">{error}</p>
          )}

          {/* Carousel */}
          <div className="relative flex items-center justify-center w-full mt-6">

            {/* Left (prev) arrow */}
            <button
              onClick={goPrev}
              disabled={loading}
              className="absolute left-0 z-20 flex items-center justify-center hover:opacity-70 active:scale-95 transition-all duration-150 select-none disabled:opacity-30"
              title="Previous outfit"
            >
              <svg width="39" height="51" viewBox="0 0 39 51" xmlns="http://www.w3.org/2000/svg">
                <polygon points="39,0 0,25.5 39,51" fill="#4361ee" />
              </svg>
            </button>

            {/* Three outfit cards */}
            <div className="flex items-center">

              {/* Left side card (previous) */}
              <div
                className="bg-[#ebebeb] shrink-0 overflow-hidden"
                style={{
                  width: 311,
                  height: 500,
                  borderRadius: 22,
                  marginRight: -28,
                  position: "relative",
                  zIndex: 0,
                  boxShadow: "0px 3.571px 12.321px 0px rgba(0,0,0,0.25)",
                }}
              >
                {loading ? (
                  <CardShimmer />
                ) : prevOutfit ? (
                  <OutfitCardView
                    outfit={prevOutfit}
                    isSide
                  />
                ) : null}
              </div>

              {/* Center card (current — larger & in front) */}
              <div
                className="bg-[#ebebeb] shrink-0 overflow-hidden"
                style={{
                  width: 349,
                  height: 560,
                  borderRadius: 25,
                  position: "relative",
                  zIndex: 10,
                  boxShadow: "0px 4px 33.5px 0px rgba(0,0,0,0.25)",
                }}
              >
                {loading ? (
                  <CardShimmer />
                ) : currentOutfit ? (
                  <OutfitCardView
                    outfit={currentOutfit}
                  />
                ) : null}
              </div>

              {/* Right side card (next) */}
              <div
                className="bg-[#ebebeb] shrink-0 overflow-hidden"
                style={{
                  width: 311,
                  height: 500,
                  borderRadius: 22,
                  marginLeft: -28,
                  position: "relative",
                  zIndex: 0,
                  boxShadow: "0px 3.571px 12.321px 0px rgba(0,0,0,0.25)",
                }}
              >
                {loading ? (
                  <CardShimmer />
                ) : nextOutfit ? (
                  <OutfitCardView
                    outfit={nextOutfit}
                    isSide
                  />
                ) : null}
              </div>

            </div>

            {/* Right (next) arrow */}
            <button
              onClick={goNext}
              disabled={loading}
              className="absolute right-0 z-20 flex items-center justify-center hover:opacity-70 active:scale-95 transition-all duration-150 select-none disabled:opacity-30"
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
