"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { CheckCircle, Clock, CircleX, Shirt } from "lucide-react";
import Sidebar from "./components/Sidebar";
import TopBar from "./components/TopBar";
import { createClient } from "@/lib/supabase/client";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface OutfitCard {
  name: string;
  description: string;
  items: string[];
  imageQuery: string;
  imageUrl: string | null; // null = photo still loading or unavailable
}

// ─── Data ──────────────────────────────────────────────────────────────────────

const ANALYTICS_CARDS = [
  { label: "Orders Completed",     value: "300K", icon: CheckCircle, iconBg: "#dcfce7", iconColor: "#16a34a" },
  { label: "Orders Pending",       value: "10K",  icon: Clock,       iconBg: "#fef3c7", iconColor: "#d97706" },
  { label: "Orders Cancelled",     value: "100K", icon: CircleX,     iconBg: "#fee2e2", iconColor: "#dc2626" },
  { label: "Total Outfit Created", value: "350K", icon: Shirt,       iconBg: "#ede9fe", iconColor: "#7c3aed" },
];

// ─── Sub-components ─────────────────────────────────────────────────────────────

// Full-card shimmer shown while Gemini is loading
function CardShimmer() {
  return (
    <div className="w-full h-full flex flex-col animate-pulse">
      <div className="bg-gray-300" style={{ flex: "0 0 75%", width: "100%" }} />
      <div className="flex items-center justify-center px-5" style={{ flex: "0 0 25%" }}>
        <div className="h-5 w-32 bg-gray-300 rounded-full" />
      </div>
    </div>
  );
}

// Photo + title card (used for all 3 positions)
function OutfitCardView({
  outfit,
  cardHeight,
  titleFontSize,
  isSide = false,
}: {
  outfit: OutfitCard;
  cardHeight: number;
  titleFontSize: number;
  isSide?: boolean;
}) {
  const photoHeight = Math.round(cardHeight * 0.75);

  return (
    <div
      className="w-full h-full flex flex-col"
      style={{ opacity: isSide ? 0.85 : 1 }}
    >
      {/* Photo — 75% of card height */}
      <div
        style={{
          position: "relative",
          width: "100%",
          height: photoHeight,
          flexShrink: 0,
          backgroundColor: "#d9d9d9",
        }}
      >
        {outfit.imageUrl ? (
          <Image
            src={outfit.imageUrl}
            alt={outfit.name}
            fill
            style={{ objectFit: "cover" }}
            sizes={isSide ? "311px" : "349px"}
            priority={!isSide}
          />
        ) : (
          <div className="w-full h-full animate-pulse bg-gray-300" />
        )}
      </div>

      {/* Title — 25% of card height */}
      <div
        className="flex items-center justify-center px-5"
        style={{ flex: 1 }}
      >
        <h3
          className="font-bold text-center text-gray-800 leading-tight"
          style={{ fontSize: titleFontSize }}
        >
          {outfit.name}
        </h3>
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

    async function loadOutfits() {
      const mood  = localStorage.getItem("fashai_mood")  ?? "";
      const style = localStorage.getItem("fashai_style") ?? "";

      async function fetchAndSetPhotos(base: OutfitCard[]) {
        const urls = await Promise.all(
          base.map((outfit) =>
            fetch("/api/photos", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ query: outfit.imageQuery }),
            })
              .then((r) => r.json())
              .then((d) => (typeof d.url === "string" ? d.url : null))
              .catch(() => null)
          )
        );
        if (!cancelled) {
          setOutfits((prev) => prev.map((o, i) => ({ ...o, imageUrl: urls[i] ?? null })));
        }
      }

      // Fix 2: check sessionStorage before calling Gemini
      const cached = sessionStorage.getItem("fashai_outfits");
      if (cached) {
        try {
          const saved = JSON.parse(cached) as Array<{ name: string; description: string; items: string[]; imageQuery: string }>;
          if (Array.isArray(saved) && saved.length > 0) {
            const base: OutfitCard[] = saved.map((o) => ({ ...o, imageUrl: null }));
            if (!cancelled) { setOutfits(base); setLoading(false); }
            fetchAndSetPhotos(base);
            return;
          }
        } catch { /* corrupt cache — fall through to fresh fetch */ }
      }

      // Fix 3: query user's wardrobe from Supabase
      const supabase = createClient();
      type WardrobeDetail = { name: string; type: string; theme: string; color: string };
      let wardrobeItems: WardrobeDetail[] = [];

      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) {
          const userId = sessionData.session.user.id;

          const { data: wardrobes } = await supabase
            .from("wardrobes")
            .select("id")
            .eq("user_id", userId);

          if (wardrobes && wardrobes.length > 0) {
            const wardrobeIds = wardrobes.map((w: { id: number }) => w.id);

            const { data: wardrobeItemsData } = await supabase
              .from("wardrobe_items")
              .select("clothing_item_id")
              .in("wardrobe_id", wardrobeIds);

            if (wardrobeItemsData && wardrobeItemsData.length > 0) {
              const clothingIds = wardrobeItemsData.map((wi: { clothing_item_id: number }) => wi.clothing_item_id);

              const { data: clothingItems } = await supabase
                .from("clothing_items")
                .select("name, type, theme, color")
                .in("id", clothingIds);

              if (clothingItems) wardrobeItems = clothingItems as WardrobeDetail[];
            }
          }
        }
      } catch { /* wardrobe query failed — proceed without it */ }

      // Fetch from Gemini
      try {
        const res = await fetch("/api/recommendation", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ mood, style, wardrobeItems }),
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();

        if (!Array.isArray(data.outfits) || data.outfits.length === 0) {
          throw new Error("Empty outfits");
        }

        // Fix 2: cache result so re-visiting the page skips Gemini
        sessionStorage.setItem("fashai_outfits", JSON.stringify(data.outfits));

        const base: OutfitCard[] = data.outfits.map(
          (o: { name: string; description: string; items: string[]; imageQuery: string }) => ({
            ...o,
            imageUrl: null,
          })
        );
        if (!cancelled) { setOutfits(base); setLoading(false); }
        fetchAndSetPhotos(base);
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

        {/* Analytics Cards */}
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
                    cardHeight={500}
                    titleFontSize={16}
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
                    cardHeight={560}
                    titleFontSize={22}
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
                    cardHeight={500}
                    titleFontSize={16}
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
