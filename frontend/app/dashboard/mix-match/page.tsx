"use client";

import { useState, useEffect, useRef } from "react";
import { Shirt, CheckCircle, Share2, ChevronLeft, ChevronRight } from "lucide-react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import { createClient } from "@/lib/supabase/client";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface ClothingItem {
  id: number;
  name: string;
  type: string;
  theme: string;
  color?: string;
  processed_image_url: string | null;
}

type Slot = "shirt" | "pants" | "shoes";

// ─── Constants ─────────────────────────────────────────────────────────────────

const THEMES = [
  { value: "winter" as const, label: "Winter Clothes" },
  { value: "summer" as const, label: "Summer Clothes" },
  { value: "sporty" as const, label: "Sport Clothes"  },
];

const SLOTS: { slot: Slot; label: string; type: string }[] = [
  { slot: "shirt", label: "Top",    type: "shirt" },
  { slot: "pants", label: "Bottom", type: "pants" },
  { slot: "shoes", label: "Shoes",  type: "shoes" },
];

// ─── Carousel sub-component ────────────────────────────────────────────────────

function SlotCarousel({
  label,
  items,
  index,
  onPrev,
  onNext,
}: {
  label: string;
  items: ClothingItem[];
  index: number;
  onPrev: () => void;
  onNext: () => void;
}) {
  const item        = items[index] ?? null;
  const canNavigate = items.length > 1;
  const isEmpty     = items.length === 0;

  return (
    <div>
      <p className="text-[14px] font-semibold text-gray-700 mb-3">{label}</p>

      <div className="flex items-center gap-4">
        {/* Prev arrow */}
        <button
          onClick={onPrev}
          disabled={!canNavigate}
          className="size-10 rounded-full bg-[#f4f5f8] flex items-center justify-center shrink-0 hover:bg-gray-200 active:scale-95 transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft size={20} strokeWidth={2} className="text-gray-600" />
        </button>

        {/* Item image area */}
        <div className="flex-1 h-[220px] rounded-[18px] bg-[#f4f5f8] flex items-center justify-center overflow-hidden">
          {isEmpty ? (
            <div className="flex flex-col items-center gap-2">
              <Shirt size={40} strokeWidth={1} className="text-gray-300" />
              <span className="text-xs text-gray-400">No {label.toLowerCase()} items</span>
            </div>
          ) : item?.processed_image_url ? (
            <img
              src={item.processed_image_url}
              alt={item.name}
              className="w-full h-full object-contain p-5"
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-gray-400">
              <Shirt size={48} strokeWidth={1} />
              <span className="text-xs text-center px-4">{item?.name}</span>
            </div>
          )}
        </div>

        {/* Next arrow */}
        <button
          onClick={onNext}
          disabled={!canNavigate}
          className="size-10 rounded-full bg-[#f4f5f8] flex items-center justify-center shrink-0 hover:bg-gray-200 active:scale-95 transition-all duration-150 disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronRight size={20} strokeWidth={2} className="text-gray-600" />
        </button>
      </div>

      {items.length > 1 && (
        <p className="text-xs text-gray-400 text-center mt-2">
          {index + 1} / {items.length}
        </p>
      )}
    </div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────────

export default function MixMatchPage() {
  const [searchValue, setSearchValue] = useState("");
  const [activeTheme, setActiveTheme] = useState<"winter" | "summer" | "sporty">("winter");
  const [items, setItems]             = useState<ClothingItem[]>([]);
  const [loading, setLoading]         = useState(true);
  const [indexes, setIndexes]         = useState<Record<Slot, number>>({ shirt: 0, pants: 0, shoes: 0 });
  const [outfitName, setOutfitName]   = useState("");
  const [isSaving, setIsSaving]       = useState(false);
  const [savedId, setSavedId]         = useState<number | null>(null);
  const [isPosting, setIsPosting]     = useState(false);
  const [posted, setPosted]           = useState(false);
  const [error, setError]             = useState<string | null>(null);

  const supabase   = createClient();
  const savingRef  = useRef(false);

  useEffect(() => {
    let cancelled = false;

    async function load() {
      setLoading(true);
      setItems([]);
      setIndexes({ shirt: 0, pants: 0, shoes: 0 });
      setSavedId(null);
      setPosted(false);
      setError(null);

      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session || cancelled) { setLoading(false); return; }

      const { data, error: err } = await supabase
        .from("clothing_items")
        .select("id, name, type, theme, color, processed_image_url")
        .eq("user_id", sessionData.session.user.id)
        .eq("theme", activeTheme)
        .order("created_at", { ascending: false });

      if (!cancelled) {
        if (!err && data) setItems(data as ClothingItem[]);
        setLoading(false);
      }
    }

    load();
    return () => { cancelled = true; };
  }, [activeTheme]); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Derived state ─────────────────────────────────────────────────────────────

  const grouped = {
    shirt: items.filter((i) => i.type === "shirt"),
    pants: items.filter((i) => i.type === "pants"),
    shoes: items.filter((i) => i.type === "shoes"),
  };

  const currentItems = {
    shirt: grouped.shirt[indexes.shirt] ?? null,
    pants: grouped.pants[indexes.pants] ?? null,
    shoes: grouped.shoes[indexes.shoes] ?? null,
  };

  const hasItems     = items.length > 0;
  const hasSelection = !!(currentItems.shirt || currentItems.pants || currentItems.shoes);
  const activeLabel   = THEMES.find((t) => t.value === activeTheme)?.label ?? "Winter Clothes";

  // ── Carousel navigation ───────────────────────────────────────────────────────

  function advance(slot: Slot, dir: 1 | -1) {
    const count = grouped[slot].length;
    if (count <= 1) return;
    setIndexes((prev) => ({
      ...prev,
      [slot]: (prev[slot] + dir + count) % count,
    }));
  }

  // ── Supabase actions ──────────────────────────────────────────────────────────

  async function handleSave() {
    if (savingRef.current || !hasSelection) {
      if (!hasSelection) setError("Add items to your wardrobe first.");
      return;
    }
    savingRef.current = true;
    setError(null);
    setIsSaving(true);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) throw new Error("Not logged in");
      const userId = sessionData.session.user.id;

      const { data: outfit, error: e1 } = await supabase
        .from("outfit_sets")
        .insert({
          user_id: userId,
          name:    outfitName.trim() || `${activeLabel} Outfit`,
          theme:   activeTheme,
        })
        .select("id")
        .single();
      if (e1) throw e1;

      const entries = (["shirt", "pants", "shoes"] as Slot[])
        .filter((s) => currentItems[s] !== null)
        .map((s) => ({
          outfit_set_id:    outfit.id,
          clothing_item_id: currentItems[s]!.id,
          slot:             s,
        }));

      if (entries.length > 0) {
        const { error: e2 } = await supabase.from("outfit_set_items").insert(entries);
        if (e2) throw e2;
      }

      setSavedId(outfit.id);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to save outfit.");
    } finally {
      savingRef.current = false;
      setIsSaving(false);
    }
  }

  async function handlePost() {
    if (!savedId) return;
    setIsPosting(true);
    setError(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      if (!sessionData.session) throw new Error("Not logged in");
      const userId = sessionData.session.user.id;

      const { data: newWard, error: eW } = await supabase
        .from("wardrobes")
        .insert({ user_id: userId, name: outfitName.trim() || `${activeLabel} Outfit`, theme: activeTheme, is_public: true })
        .select("id")
        .single();
      if (eW) throw eW;
      const wardrobeId = newWard.id;

      const { error: eP } = await supabase.from("wardrobe_posts").insert({
        user_id:     userId,
        wardrobe_id: wardrobeId,
        caption:     outfitName.trim() || `${activeLabel} Outfit`,
        theme:       activeTheme,
        saves_count: 0,
      });
      if (eP) throw eP;

      setPosted(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Failed to post outfit.");
    } finally {
      setIsPosting(false);
    }
  }

  function resetAll() {
    setIndexes({ shirt: 0, pants: 0, shoes: 0 });
    setOutfitName("");
    setSavedId(null);
    setPosted(false);
    setError(null);
  }

  // ── Render ────────────────────────────────────────────────────────────────────

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

        {/* ── Main white card ── */}
        <div className="bg-white rounded-[22px] mt-5 flex-1 min-h-0 flex overflow-hidden mb-[30px]">

          {/* ─── Left column: title + filter + carousels ─── */}
          <div className="flex-1 flex flex-col overflow-hidden border-r border-gray-100">

            {/* Header */}
            <div className="px-[57px] pt-[28px] shrink-0">
              <p className="text-[#b9b9b9] text-[32px] font-medium leading-tight">Costumizer</p>
              <p className="text-black text-[44px] font-semibold leading-tight">{activeLabel}</p>
            </div>

            {/* Theme filter pills */}
            <div className="px-[57px] mt-5 flex gap-2 flex-wrap shrink-0">
              {THEMES.map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => setActiveTheme(value)}
                  className={[
                    "px-5 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 whitespace-nowrap",
                    activeTheme === value
                      ? "bg-[#4361ee] text-white shadow-sm"
                      : "bg-[#f4f5f8] text-gray-600 hover:bg-gray-200",
                  ].join(" ")}
                >
                  {label}
                </button>
              ))}
            </div>

            {/* Carousel rows */}
            <div className="flex-1 overflow-y-auto px-[57px] pt-6 pb-6 min-h-0">
              {loading ? (
                <div className="flex items-center justify-center h-full">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4361ee]" />
                </div>
              ) : !hasItems ? (
                <div className="flex flex-col items-center justify-center h-full gap-3">
                  <Shirt size={56} strokeWidth={1} className="text-gray-300" />
                  <p className="text-[15px] font-semibold text-gray-500 text-center">
                    No items in {activeLabel}
                  </p>
                  <p className="text-sm text-gray-400 text-center">
                    Upload clothes with this theme from Wardrobe to start mixing
                  </p>
                </div>
              ) : (
                <div className="flex flex-col gap-8">
                  {SLOTS.map(({ slot, label }) => (
                    <SlotCarousel
                      key={slot}
                      label={label}
                      items={grouped[slot]}
                      index={indexes[slot]}
                      onPrev={() => advance(slot, -1)}
                      onNext={() => advance(slot,  1)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* ─── Right column: preview + save ─── */}
          <div className="w-[340px] shrink-0 flex flex-col px-7 py-[28px] overflow-y-auto">

            <p className="text-[14px] font-semibold text-[#b9b9b9] mb-5">Outfit Preview</p>

            {/* 3 preview cards */}
            <div className="flex flex-col gap-3 flex-1">
              {SLOTS.map(({ slot, label }) => {
                const item = currentItems[slot];
                return (
                  <div
                    key={slot}
                    className={[
                      "w-full h-[140px] rounded-[16px] flex items-center justify-center overflow-hidden transition-all duration-200",
                      item
                        ? "bg-gray-50 shadow-sm"
                        : "bg-[#f4f5f8] border-2 border-dashed border-gray-200",
                    ].join(" ")}
                  >
                    {item ? (
                      item.processed_image_url ? (
                        <img
                          src={item.processed_image_url}
                          alt={item.name}
                          className="w-full h-full object-contain p-3"
                        />
                      ) : (
                        <div className="flex flex-col items-center gap-1 text-gray-400">
                          <Shirt size={32} strokeWidth={1} />
                          <span className="text-xs text-center px-3">{item.name}</span>
                        </div>
                      )
                    ) : (
                      <div className="flex flex-col items-center gap-1 text-gray-300">
                        <Shirt size={28} strokeWidth={1} />
                        <span className="text-xs text-gray-400">{label}</span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Actions */}
            <div className="mt-5 flex flex-col gap-3 shrink-0">
              {error && <p className="text-sm text-red-500 text-center">{error}</p>}

              {/* Not yet saved */}
              {!savedId && (
                <>
                  <input
                    type="text"
                    value={outfitName}
                    onChange={(e) => setOutfitName(e.target.value)}
                    placeholder="Outfit name (optional)"
                    className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm outline-none focus:border-[#4361ee] focus:ring-1 focus:ring-[#4361ee]"
                  />
                  <button
                    onClick={handleSave}
                    disabled={isSaving || !hasSelection}
                    className="w-full py-3 rounded-xl bg-[#4361ee] text-white text-[14px] font-semibold hover:bg-[#3451d6] transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                  >
                    {isSaving ? (
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                    ) : (
                      <><CheckCircle size={16} /> Save Outfit</>
                    )}
                  </button>
                </>
              )}

              {/* Saved — offer post to public */}
              {savedId !== null && !posted && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <CheckCircle size={18} />
                    <span className="text-sm font-semibold">Outfit saved!</span>
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    Would you like to share this outfit publicly?
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={handlePost}
                      disabled={isPosting}
                      className="flex-1 py-2.5 rounded-xl bg-[#4361ee] text-white text-sm font-medium hover:bg-[#3451d6] transition-colors disabled:opacity-40 flex items-center justify-center gap-2"
                    >
                      {isPosting ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" />
                      ) : (
                        <><Share2 size={14} /> Post to Public</>
                      )}
                    </button>
                    <button
                      onClick={resetAll}
                      className="flex-1 py-2.5 rounded-xl border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50 transition-colors"
                    >
                      Skip
                    </button>
                  </div>
                </div>
              )}

              {/* Posted */}
              {posted && (
                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-center gap-2 text-green-600">
                    <CheckCircle size={18} />
                    <span className="text-sm font-semibold">Posted publicly!</span>
                  </div>
                  <button
                    onClick={resetAll}
                    className="w-full py-3 rounded-xl bg-[#4361ee] text-white text-[14px] font-semibold hover:bg-[#3451d6] transition-colors"
                  >
                    Create Another
                  </button>
                </div>
              )}
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}
