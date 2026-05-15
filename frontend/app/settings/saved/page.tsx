"use client";

import { useState, useEffect, useCallback } from "react";
import { Bookmark, BookmarkCheck, X, Shirt, Sparkles } from "lucide-react";
import Sidebar from "../../dashboard/components/Sidebar";
import TopBar from "../../dashboard/components/TopBar";
import { createClient } from "@/lib/supabase/client";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface OutfitImage {
  slot: string;
  processed_image_url: string | null;
}

interface OutfitCard {
  id: string;             // "mine_<set_id>" or "saved_<post_id>"
  source: "mine" | "saved";
  sourceId: string;       // outfit_set.id for mine, wardrobe_post.id for saved
  username: string;
  theme: string;
  caption: string;
  saves_count: number;
  images: OutfitImage[];
  sortDate: string;
}

type WardrobePost = {
  id: string;
  user_id: string;
  caption: string;
  theme: string;
  saves_count: number;
  posted_at: string;
};

// ─── Constants ─────────────────────────────────────────────────────────────────

const THEME_LABELS: Record<string, string> = {
  winter: "Winter Clothes",
  summer: "Summer Clothes",
  sporty: "Sport Clothes",
};

const SLOTS = [
  { key: "shirt", label: "Top"    },
  { key: "pants", label: "Bottom" },
  { key: "shoes", label: "Shoes"  },
];

// ─── Helper: bulk-fetch images for a list of outfit_set_ids ───────────────────

async function fetchImagesForSets(
  supabase: ReturnType<typeof createClient>,
  outfitSetIds: string[]
): Promise<Record<string, OutfitImage[]>> {
  if (outfitSetIds.length === 0) return {};

  const { data: osItems } = await supabase
    .from("outfit_set_items")
    .select("outfit_set_id, slot, clothing_item_id")
    .in("outfit_set_id", outfitSetIds);

  if (!osItems || osItems.length === 0) return {};

  const ciIds = [...new Set(osItems.map((i) => i.clothing_item_id))];
  const { data: ciData } = await supabase
    .from("clothing_items")
    .select("id, processed_image_url")
    .in("id", ciIds);

  const ciMap: Record<string, string | null> = {};
  for (const ci of ciData ?? []) ciMap[ci.id] = ci.processed_image_url;

  const result: Record<string, OutfitImage[]> = {};
  for (const item of osItems) {
    if (!result[item.outfit_set_id]) result[item.outfit_set_id] = [];
    result[item.outfit_set_id].push({
      slot: item.slot,
      processed_image_url: ciMap[item.clothing_item_id] ?? null,
    });
  }
  return result;
}

// ─── Outfit detail modal ───────────────────────────────────────────────────────

function OutfitDetailModal({
  card,
  onClose,
  onUnsave,
}: {
  card: OutfitCard | null;
  onClose: () => void;
  onUnsave: (cardId: string) => void;
}) {
  useEffect(() => {
    if (!card) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [card, onClose]);

  if (!card) return null;

  const themeLabel = THEME_LABELS[card.theme] ?? card.theme;

  function getSlotImage(slot: string): string | null {
    return card!.images.find((img) => img.slot === slot)?.processed_image_url ?? null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[22px] w-[620px] max-h-[88vh] overflow-y-auto shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between px-7 pt-6 pb-5">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2">
              <span className="text-[18px] font-semibold text-gray-900">@{card.username}</span>
              {card.source === "mine" ? (
                <span className="text-[10px] font-semibold bg-[#4361ee] text-white px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Sparkles size={9} />Mine
                </span>
              ) : (
                <span className="text-[10px] font-semibold bg-[#f4f5f8] text-gray-500 px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Bookmark size={9} />Saved
                </span>
              )}
            </div>
            <span className="text-[11px] font-medium text-[#4361ee] bg-[#eef0fd] px-3 py-0.5 rounded-full self-start">
              {themeLabel}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {card.source === "saved" && (
              <button
                onClick={() => onUnsave(card.id)}
                title="Unsave outfit"
                className="size-10 rounded-full bg-[#f4f5f8] flex items-center justify-center hover:bg-gray-100 transition-colors active:scale-95"
              >
                <BookmarkCheck size={18} className="text-[#4361ee]" />
              </button>
            )}
            <button
              onClick={onClose}
              className="size-10 rounded-full bg-[#f4f5f8] flex items-center justify-center hover:bg-gray-100 transition-colors"
            >
              <X size={17} className="text-gray-600" />
            </button>
          </div>
        </div>

        {/* 3 outfit slot images */}
        <div className="grid grid-cols-3 gap-4 px-7">
          {SLOTS.map(({ key, label }) => {
            const imgUrl = getSlotImage(key);
            return (
              <div key={key} className="flex flex-col gap-2">
                <div className="h-[200px] rounded-[14px] bg-[#f4f5f8] flex items-center justify-center overflow-hidden">
                  {imgUrl ? (
                    <img
                      src={imgUrl}
                      alt={label}
                      className="w-full h-full object-contain p-4"
                    />
                  ) : (
                    <div className="flex flex-col items-center gap-1.5 text-gray-300">
                      <Shirt size={36} strokeWidth={1} />
                      <span className="text-xs text-gray-400">No {label.toLowerCase()}</span>
                    </div>
                  )}
                </div>
                <p className="text-[12px] text-center text-gray-400 font-medium">{label}</p>
              </div>
            );
          })}
        </div>

        {/* Caption + saves */}
        <div className="px-7 pt-5 pb-6">
          {card.caption && (
            <p className="text-[14px] text-gray-700 mb-3 leading-relaxed">{card.caption}</p>
          )}
          {card.source === "saved" && (
            <p className="text-[12px] text-gray-400 flex items-center gap-1.5">
              <Bookmark size={12} className="shrink-0" />
              {card.saves_count} {card.saves_count === 1 ? "save" : "saves"}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Skeleton card ─────────────────────────────────────────────────────────────

function SkeletonCard() {
  return (
    <div className="bg-white rounded-[16px] overflow-hidden animate-pulse">
      <div className="h-[220px] bg-gray-100" />
      <div className="p-4 flex flex-col gap-2">
        <div className="flex justify-between items-center gap-2">
          <div className="h-4 bg-gray-100 rounded w-2/5" />
          <div className="h-4 bg-gray-100 rounded w-1/4" />
        </div>
        <div className="h-3 bg-gray-100 rounded w-3/4" />
        <div className="h-3 bg-gray-100 rounded w-1/4 mt-1" />
      </div>
    </div>
  );
}

// ─── Outfit card ──────────────────────────────────────────────────────────────

function OutfitCardItem({
  card,
  onUnsave,
  onClick,
}: {
  card: OutfitCard;
  onUnsave: (cardId: string) => void;
  onClick: () => void;
}) {
  const coverImage =
    card.images.find((img) => img.processed_image_url)?.processed_image_url ?? null;
  const themeLabel = THEME_LABELS[card.theme] ?? card.theme;

  return (
    <div
      onClick={onClick}
      className="bg-white rounded-[16px] overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 cursor-pointer"
    >
      {/* Image area */}
      <div className="relative h-[220px] bg-[#f4f5f8] flex items-center justify-center">
        {coverImage ? (
          <img
            src={coverImage}
            alt={card.caption || "Outfit"}
            className="w-full h-full object-contain p-4"
          />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Shirt size={40} strokeWidth={1} className="text-gray-300" />
            <span className="text-xs text-gray-400">No image</span>
          </div>
        )}

        {/* Top-right badge/button */}
        {card.source === "mine" ? (
          <span className="absolute top-3 right-3 text-[11px] font-semibold bg-[#4361ee] text-white px-2.5 py-1 rounded-full shadow-sm flex items-center gap-1">
            <Sparkles size={10} />Mine
          </span>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); onUnsave(card.id); }}
            title="Unsave outfit"
            className="absolute top-3 right-3 size-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors duration-150 active:scale-95"
          >
            <BookmarkCheck size={18} className="text-[#4361ee]" />
          </button>
        )}
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[13px] font-semibold text-gray-800 truncate">
            @{card.username}
          </span>
          <span className="text-[11px] font-medium text-[#4361ee] bg-[#eef0fd] px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">
            {themeLabel}
          </span>
        </div>

        {card.caption ? (
          <p className="text-[13px] text-gray-600 line-clamp-2">{card.caption}</p>
        ) : null}

        {card.source === "saved" ? (
          <p className="text-[12px] text-gray-400 flex items-center gap-1 mt-0.5">
            <Bookmark size={11} className="shrink-0" />
            {card.saves_count} {card.saves_count === 1 ? "save" : "saves"}
          </p>
        ) : (
          <p className="text-[12px] text-gray-400 flex items-center gap-1 mt-0.5">
            <Sparkles size={11} className="shrink-0" />
            Created by you
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SavedOutfitsPage() {
  const [searchValue, setSearchValue]       = useState("");
  const [cards, setCards]                   = useState<OutfitCard[]>([]);
  const [loading, setLoading]               = useState(true);
  const [currentUserId, setCurrentUserId]   = useState<string | null>(null);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);

  const supabase = createClient();

  const loadCards = useCallback(async () => {
    setLoading(true);

    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id ?? null;
    setCurrentUserId(userId);

    if (!userId) {
      setCards([]);
      setLoading(false);
      return;
    }

    // ── Phase 1: own outfit_sets + saved_post_ids + own profile (parallel) ──────
    const [ownSetsRes, savedPostsRes, myProfileRes] = await Promise.all([
      supabase
        .from("outfit_sets")
        .select("id, theme, name, created_at")
        .eq("user_id", userId)
        .order("created_at", { ascending: false }),
      supabase
        .from("saved_posts")
        .select("post_id, saved_at")
        .eq("user_id", userId)
        .order("saved_at", { ascending: false }),
      supabase
        .from("profiles")
        .select("username")
        .eq("id", userId)
        .single(),
    ]);

    const myUsername  = myProfileRes.data?.username ?? "Me";
    const ownSets     = ownSetsRes.data ?? [];
    const ownSetIds   = ownSets.map((s) => s.id);

    const savedRows   = savedPostsRes.data ?? [];
    const savedPostIds = savedRows.map((s) => s.post_id);
    const savedAtMap: Record<string, string> = {};
    for (const s of savedRows) savedAtMap[s.post_id] = s.saved_at;

    // ── Phase 2: own set images + saved wardrobe_posts (parallel) ──────────────
    const [ownImagesById, savedPostsData] = await Promise.all([
      fetchImagesForSets(supabase, ownSetIds),
      savedPostIds.length > 0
        ? supabase
            .from("wardrobe_posts")
            .select("id, user_id, caption, theme, saves_count, posted_at")
            .in("id", savedPostIds)
            .then((r) => (r.data ?? []) as WardrobePost[])
        : Promise.resolve([] as WardrobePost[]),
    ]);

    // ── Phase 3: for saved posts, resolve outfit images ─────────────────────────
    const imagesByPostId: Record<string, OutfitImage[]> = {};
    const savedProfileMap: Record<string, string> = {};

    if (savedPostsData.length > 0) {
      const postUserIds = [...new Set(savedPostsData.map((p) => p.user_id))];

      const [profilesRes, outfitSetsRes] = await Promise.all([
        supabase.from("profiles").select("id, username").in("id", postUserIds),
        supabase
          .from("outfit_sets")
          .select("id, user_id, theme, created_at")
          .in("user_id", postUserIds)
          .order("created_at", { ascending: false }),
      ]);

      for (const p of profilesRes.data ?? []) savedProfileMap[p.id] = p.username ?? "Unknown";

      const outfitSets = outfitSetsRes.data ?? [];
      const setsByKey: Record<string, typeof outfitSets> = {};
      for (const os of outfitSets) {
        const key = `${os.user_id}__${os.theme}`;
        if (!setsByKey[key]) setsByKey[key] = [];
        setsByKey[key].push(os);
      }

      const postToSetId: Record<string, string> = {};
      for (const p of savedPostsData) {
        const key = `${p.user_id}__${p.theme}`;
        const candidates = setsByKey[key] ?? [];
        if (candidates.length === 0) continue;
        const postedAt = new Date(p.posted_at).getTime();
        const match = candidates.find((os) => new Date(os.created_at).getTime() <= postedAt);
        postToSetId[p.id] = (match ?? candidates[candidates.length - 1]).id;
      }

      const savedSetIds = [...new Set(Object.values(postToSetId))];
      const savedImagesById = await fetchImagesForSets(supabase, savedSetIds);

      for (const p of savedPostsData) {
        const setId = postToSetId[p.id];
        imagesByPostId[p.id] = setId ? (savedImagesById[setId] ?? []) : [];
      }
    }

    // ── Assemble ────────────────────────────────────────────────────────────────

    const ownCards: OutfitCard[] = ownSets.map((s) => ({
      id:         `mine_${s.id}`,
      source:     "mine" as const,
      sourceId:   s.id,
      username:   myUsername,
      theme:      s.theme ?? "",
      caption:    s.name ?? "",
      saves_count: 0,
      images:     ownImagesById[s.id] ?? [],
      sortDate:   s.created_at,
    }));

    const postMap = new Map(savedPostsData.map((p) => [p.id, p]));
    const savedCards: OutfitCard[] = savedPostIds
      .filter((id) => postMap.has(id))
      .map((id) => {
        const p = postMap.get(id)!;
        return {
          id:          `saved_${p.id}`,
          source:      "saved" as const,
          sourceId:    p.id,
          username:    savedProfileMap[p.user_id] ?? "Unknown",
          theme:       p.theme ?? "",
          caption:     p.caption ?? "",
          saves_count: p.saves_count ?? 0,
          images:      imagesByPostId[p.id] ?? [],
          sortDate:    savedAtMap[p.id] ?? p.posted_at,
        };
      });

    // Merge and sort newest first
    const allCards = [...ownCards, ...savedCards].sort(
      (a, b) => new Date(b.sortDate).getTime() - new Date(a.sortDate).getTime()
    );

    setCards(allCards);
    setLoading(false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadCards();
  }, [loadCards]);

  // ── Unsave (saved cards only) ─────────────────────────────────────────────────

  async function handleUnsave(cardId: string) {
    if (!currentUserId) return;

    const card = cards.find((c) => c.id === cardId);
    if (!card || card.source !== "saved") return;

    // Optimistic: remove card and close modal
    setCards((prev) => prev.filter((c) => c.id !== cardId));
    setSelectedCardId(null);

    await supabase
      .from("saved_posts")
      .delete()
      .eq("user_id", currentUserId)
      .eq("post_id", card.sourceId);

    await supabase
      .from("wardrobe_posts")
      .update({ saves_count: Math.max(0, card.saves_count - 1) })
      .eq("id", card.sourceId);
  }

  // ── Derived ───────────────────────────────────────────────────────────────────

  const filteredCards = searchValue
    ? cards.filter(
        (c) =>
          c.username.toLowerCase().includes(searchValue.toLowerCase()) ||
          c.caption.toLowerCase().includes(searchValue.toLowerCase())
      )
    : cards;

  const selectedCard = cards.find((c) => c.id === selectedCardId) ?? null;

  // ── Render ────────────────────────────────────────────────────────────────────

  return (
    <div className="flex h-screen bg-[#f4f5f8] overflow-hidden">
      <Sidebar />

      <main
        className="flex-1 flex flex-col min-h-0 overflow-y-auto"
        style={{ padding: "30px 30px 30px 54px" }}
      >
        <TopBar
          userName="User"
          showGreeting={false}
          searchValue={searchValue}
          onSearchChange={setSearchValue}
        />

        <div className="bg-white rounded-[22px] mt-5 flex-1 min-h-0 flex flex-col overflow-hidden mb-[30px]">

          {/* Header */}
          <div className="px-[57px] pt-[28px] pb-5 border-b border-gray-50 shrink-0">
            <p className="text-[#b9b9b9] text-[32px] font-medium leading-tight">My Collection</p>
            <p className="text-black text-[44px] font-semibold leading-tight">Saved Outfits</p>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-[57px] py-6">
            {loading ? (
              <div className="grid grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : filteredCards.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="size-20 rounded-full bg-[#f4f5f8] flex items-center justify-center">
                  <Bookmark size={40} strokeWidth={1} className="text-gray-300" />
                </div>
                <p className="text-[15px] font-semibold text-gray-500">
                  {searchValue
                    ? "No outfits match your search"
                    : "You haven't created or saved any outfits yet"}
                </p>
                <p className="text-sm text-gray-400 text-center max-w-[300px]">
                  {searchValue
                    ? "Try a different search term"
                    : "Create outfits in Mix & Match or save outfits from Explore"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-5">
                {filteredCards.map((card) => (
                  <OutfitCardItem
                    key={card.id}
                    card={card}
                    onUnsave={handleUnsave}
                    onClick={() => setSelectedCardId(card.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <OutfitDetailModal
        card={selectedCard}
        onClose={() => setSelectedCardId(null)}
        onUnsave={handleUnsave}
      />
    </div>
  );
}
