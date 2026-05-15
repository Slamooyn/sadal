"use client";

import { useState, useEffect, useCallback } from "react";
import { Compass, Bookmark, BookmarkCheck, X, Shirt } from "lucide-react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import { createClient } from "@/lib/supabase/client";

// ─── Types ─────────────────────────────────────────────────────────────────────

interface OutfitImage {
  slot: string;
  processed_image_url: string | null;
}

interface ExplorePost {
  id: string;
  user_id: string;
  caption: string;
  theme: string;
  saves_count: number;
  posted_at: string;
  username: string;
  images: OutfitImage[];
  is_saved: boolean;
}

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

// ─── Outfit detail modal ───────────────────────────────────────────────────────

function OutfitDetailModal({
  post,
  onClose,
  onToggleSave,
}: {
  post: ExplorePost | null;
  onClose: () => void;
  onToggleSave: (postId: string) => void;
}) {
  useEffect(() => {
    if (!post) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [post, onClose]);

  if (!post) return null;

  const themeLabel = THEME_LABELS[post.theme] ?? post.theme;

  function getSlotImage(slot: string): string | null {
    return post!.images.find((img) => img.slot === slot)?.processed_image_url ?? null;
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
            <span className="text-[18px] font-semibold text-gray-900">@{post.username}</span>
            <span className="text-[11px] font-medium text-[#4361ee] bg-[#eef0fd] px-3 py-0.5 rounded-full self-start">
              {themeLabel}
            </span>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => onToggleSave(post.id)}
              className="size-10 rounded-full bg-[#f4f5f8] flex items-center justify-center hover:bg-gray-100 transition-colors active:scale-95"
            >
              {post.is_saved ? (
                <BookmarkCheck size={18} className="text-[#4361ee]" />
              ) : (
                <Bookmark size={18} className="text-gray-500" />
              )}
            </button>
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
          {post.caption && (
            <p className="text-[14px] text-gray-700 mb-3 leading-relaxed">{post.caption}</p>
          )}
          <p className="text-[12px] text-gray-400 flex items-center gap-1.5">
            <Bookmark size={12} className="shrink-0" />
            {post.saves_count} {post.saves_count === 1 ? "save" : "saves"}
          </p>
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

// ─── Post card ────────────────────────────────────────────────────────────────

function PostCard({
  post,
  onToggleSave,
  onClick,
}: {
  post: ExplorePost;
  onToggleSave: (postId: string) => void;
  onClick: () => void;
}) {
  const coverImage =
    post.images.find((img) => img.processed_image_url)?.processed_image_url ?? null;
  const themeLabel = THEME_LABELS[post.theme] ?? post.theme;

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
            alt={post.caption || "Outfit"}
            className="w-full h-full object-contain p-4"
          />
        ) : (
          <div className="flex flex-col items-center gap-2">
            <Compass size={40} strokeWidth={1} className="text-gray-300" />
            <span className="text-xs text-gray-400">No image</span>
          </div>
        )}

        {/* Bookmark button */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleSave(post.id); }}
          className="absolute top-3 right-3 size-9 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors duration-150 active:scale-95"
        >
          {post.is_saved ? (
            <BookmarkCheck size={18} className="text-[#4361ee]" />
          ) : (
            <Bookmark size={18} className="text-gray-500" />
          )}
        </button>
      </div>

      {/* Card body */}
      <div className="p-4 flex flex-col gap-1.5">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[13px] font-semibold text-gray-800 truncate">
            @{post.username}
          </span>
          <span className="text-[11px] font-medium text-[#4361ee] bg-[#eef0fd] px-2 py-0.5 rounded-full whitespace-nowrap shrink-0">
            {themeLabel}
          </span>
        </div>

        {post.caption ? (
          <p className="text-[13px] text-gray-600 line-clamp-2">{post.caption}</p>
        ) : null}

        <p className="text-[12px] text-gray-400 flex items-center gap-1 mt-0.5">
          <Bookmark size={11} className="shrink-0" />
          {post.saves_count} {post.saves_count === 1 ? "save" : "saves"}
        </p>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ExplorePage() {
  const [searchValue, setSearchValue]     = useState("");
  const [posts, setPosts]                 = useState<ExplorePost[]>([]);
  const [loading, setLoading]             = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);

  const supabase = createClient();

  const loadPosts = useCallback(async () => {
    setLoading(true);

    // Resolve current user
    const { data: sessionData } = await supabase.auth.getSession();
    const userId = sessionData.session?.user.id ?? null;
    setCurrentUserId(userId);

    // 1. Public wardrobes
    const { data: wardrobesData } = await supabase
      .from("wardrobes")
      .select("id")
      .eq("is_public", true);

    const publicWardrobeIds = (wardrobesData ?? []).map((w) => w.id);

    if (publicWardrobeIds.length === 0) {
      setPosts([]);
      setLoading(false);
      return;
    }

    // 2. Posts from those wardrobes
    const { data: postsData } = await supabase
      .from("wardrobe_posts")
      .select("id, user_id, caption, theme, saves_count, posted_at")
      .in("wardrobe_id", publicWardrobeIds)
      .order("posted_at", { ascending: false });

    if (!postsData || postsData.length === 0) {
      setPosts([]);
      setLoading(false);
      return;
    }

    const userIds = [...new Set(postsData.map((p) => p.user_id))];

    // 3. Parallel: profiles + outfit_sets (with created_at) + saved_posts
    const [profilesRes, outfitSetsRes, savedRes] = await Promise.all([
      supabase.from("profiles").select("id, username").in("id", userIds),
      supabase
        .from("outfit_sets")
        .select("id, user_id, theme, created_at")
        .in("user_id", userIds)
        .order("created_at", { ascending: false }),
      userId
        ? supabase.from("saved_posts").select("post_id").eq("user_id", userId)
        : Promise.resolve({ data: [] as { post_id: string }[], error: null }),
    ]);

    const outfitSets = outfitSetsRes.data ?? [];
    const savedPostIds = new Set((savedRes.data ?? []).map((s) => s.post_id));

    // 4. Group all outfit_sets by (user_id, theme), already sorted desc by created_at
    const setsByKey: Record<string, typeof outfitSets> = {};
    for (const os of outfitSets) {
      const key = `${os.user_id}__${os.theme}`;
      if (!setsByKey[key]) setsByKey[key] = [];
      setsByKey[key].push(os);
    }

    // 4b. Per post → find the most recent outfit_set created at or before posted_at
    const postToSetId: Record<number, number> = {};
    for (const p of postsData) {
      const key = `${p.user_id}__${p.theme}`;
      const candidates = setsByKey[key] ?? [];
      if (candidates.length === 0) continue;
      const postedAt = new Date(p.posted_at).getTime();
      // candidates sorted desc — first one at or before posted_at is the right match
      const match = candidates.find((os) => new Date(os.created_at).getTime() <= postedAt);
      // fallback: use earliest available (last in desc list) if all were created after posted_at
      postToSetId[p.id] = (match ?? candidates[candidates.length - 1]).id;
    }

    // 5. Outfit images via outfit_set_items → clothing_items
    const outfitSetIds = [...new Set(Object.values(postToSetId))];
    const itemsBySetId: Record<number, OutfitImage[]> = {};

    if (outfitSetIds.length > 0) {
      const { data: osItems } = await supabase
        .from("outfit_set_items")
        .select("outfit_set_id, slot, clothing_item_id")
        .in("outfit_set_id", outfitSetIds);

      if (osItems && osItems.length > 0) {
        const ciIds = [...new Set(osItems.map((i) => i.clothing_item_id))];
        const { data: ciData } = await supabase
          .from("clothing_items")
          .select("id, processed_image_url")
          .in("id", ciIds);

        const ciMap: Record<string, string | null> = {};
        for (const ci of ciData ?? []) ciMap[ci.id] = ci.processed_image_url;

        for (const item of osItems) {
          if (!itemsBySetId[item.outfit_set_id]) itemsBySetId[item.outfit_set_id] = [];
          itemsBySetId[item.outfit_set_id].push({
            slot: item.slot,
            processed_image_url: ciMap[item.clothing_item_id] ?? null,
          });
        }
      }
    }

    // 6. Profile map
    const profileMap: Record<string, string> = {};
    for (const p of profilesRes.data ?? []) profileMap[p.id] = p.username ?? "Unknown";

    // 7. Assemble
    const assembled: ExplorePost[] = postsData.map((p) => {
      const setId = postToSetId[p.id];
      return {
        id: p.id,
        user_id: p.user_id,
        caption: p.caption ?? "",
        theme: p.theme ?? "",
        saves_count: p.saves_count ?? 0,
        posted_at: p.posted_at,
        username: profileMap[p.user_id] ?? "Unknown",
        images: setId ? (itemsBySetId[setId] ?? []) : [],
        is_saved: savedPostIds.has(p.id),
      };
    });

    setPosts(assembled);
    setLoading(false);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    loadPosts();
  }, [loadPosts]);

  // ── Save / unsave ─────────────────────────────────────────────────────────────

  async function handleToggleSave(postId: string) {
    if (!currentUserId) return;

    const post = posts.find((p) => p.id === postId);
    if (!post) return;

    const wasSaved = post.is_saved;

    // Optimistic update — also updates the modal since it derives from posts state
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId
          ? {
              ...p,
              is_saved: !wasSaved,
              saves_count: Math.max(0, p.saves_count + (wasSaved ? -1 : 1)),
            }
          : p
      )
    );

    if (wasSaved) {
      await supabase
        .from("saved_posts")
        .delete()
        .eq("user_id", currentUserId)
        .eq("post_id", postId);
      await supabase
        .from("wardrobe_posts")
        .update({ saves_count: Math.max(0, post.saves_count - 1) })
        .eq("id", postId);
    } else {
      await supabase
        .from("saved_posts")
        .insert({ user_id: currentUserId, post_id: postId });
      await supabase
        .from("wardrobe_posts")
        .update({ saves_count: post.saves_count + 1 })
        .eq("id", postId);
    }
  }

  // ── Derived ───────────────────────────────────────────────────────────────────

  const filteredPosts = searchValue
    ? posts.filter(
        (p) =>
          p.username.toLowerCase().includes(searchValue.toLowerCase()) ||
          p.caption.toLowerCase().includes(searchValue.toLowerCase())
      )
    : posts;

  // Derive modal post from posts state so toggling save updates the modal too
  const selectedPost = posts.find((p) => p.id === selectedPostId) ?? null;

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

        <div className="bg-white rounded-[22px] mt-5 flex-1 min-h-0 flex flex-col overflow-hidden mb-[30px]">

          {/* Header */}
          <div className="px-[57px] pt-[28px] pb-5 border-b border-gray-50 shrink-0">
            <p className="text-[#b9b9b9] text-[32px] font-medium leading-tight">Community</p>
            <p className="text-black text-[44px] font-semibold leading-tight">Explore Outfits</p>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto px-[57px] py-6">
            {loading ? (
              <div className="grid grid-cols-3 gap-5">
                {Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : filteredPosts.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="size-20 rounded-full bg-[#f4f5f8] flex items-center justify-center">
                  <Compass size={40} strokeWidth={1} className="text-gray-300" />
                </div>
                <p className="text-[15px] font-semibold text-gray-500">
                  {searchValue ? "No outfits match your search" : "No public outfits yet"}
                </p>
                <p className="text-sm text-gray-400 text-center max-w-[280px]">
                  {searchValue
                    ? "Try a different search term"
                    : "Be the first to share an outfit from Mix & Match!"}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-5">
                {filteredPosts.map((post) => (
                  <PostCard
                    key={post.id}
                    post={post}
                    onToggleSave={handleToggleSave}
                    onClick={() => setSelectedPostId(post.id)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <OutfitDetailModal
        post={selectedPost}
        onClose={() => setSelectedPostId(null)}
        onToggleSave={handleToggleSave}
      />
    </div>
  );
}
