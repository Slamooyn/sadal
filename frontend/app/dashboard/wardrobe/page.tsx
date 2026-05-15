"use client";

import { useState, useMemo, useEffect } from "react";
import {
  CheckCircle,
  Clock,
  CircleX,
  Shirt,
  Heart,
  Upload,
  MoreVertical,
  Trash2,
  X,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";
import UploadModal from "./components/UploadModal";
import { createClient } from "@/lib/supabase/client";


interface WardrobeItem {
  id: number;
  name: string;
  type: string;
  theme: string;
  color?: string;
  processed_image_url: string;
}


const ANALYTICS_CARDS = [
  { label: "Orders Completed",     value: "300K", icon: CheckCircle, iconBg: "#dcfce7", iconColor: "#16a34a" },
  { label: "Orders Pending",       value: "10K",  icon: Clock,       iconBg: "#fef3c7", iconColor: "#d97706" },
  { label: "Orders Cancelled",     value: "100K", icon: CircleX,     iconBg: "#fee2e2", iconColor: "#dc2626" },
  { label: "Total Outfit Created", value: "350K", icon: Shirt,       iconBg: "#ede9fe", iconColor: "#7c3aed" },
];

const CATEGORIES = [
  { label: "All",            value: "all"    },
  { label: "Winter Clothes", value: "winter" },
  { label: "Summer Clothes", value: "summer" },
  { label: "Sport Clothes",  value: "sporty" },
];

const THEME_LABELS: Record<string, string> = {
  winter: "Winter Clothes",
  summer: "Summer Clothes",
  sporty: "Sport Clothes",
};


// ─── Item detail modal ─────────────────────────────────────────────────────────

function ItemDetailModal({
  item,
  onClose,
}: {
  item: WardrobeItem | null;
  onClose: () => void;
}) {
  useEffect(() => {
    if (!item) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [item, onClose]);

  if (!item) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-[22px] w-[440px] overflow-hidden shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Image */}
        <div className="relative h-[280px] bg-[#f4f5f8] flex items-center justify-center">
          {item.processed_image_url ? (
            <img
              src={item.processed_image_url}
              alt={item.name}
              className="w-full h-full object-contain p-10"
            />
          ) : (
            <Shirt size={80} strokeWidth={0.8} className="text-gray-300" />
          )}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 size-9 rounded-full bg-white/85 backdrop-blur-sm flex items-center justify-center hover:bg-white shadow-sm transition-colors"
          >
            <X size={17} className="text-gray-600" />
          </button>
        </div>

        {/* Details */}
        <div className="px-6 py-5">
          <h2 className="text-[20px] font-semibold text-gray-900 mb-4">
            {item.name || "Unnamed Item"}
          </h2>
          <div className="flex flex-col gap-0">
            <div className="flex items-center justify-between py-3 border-b border-gray-50">
              <span className="text-[13px] text-gray-400">Type</span>
              <span className="text-[13px] font-medium text-gray-800 capitalize">{item.type}</span>
            </div>
            <div className="flex items-center justify-between py-3 border-b border-gray-50">
              <span className="text-[13px] text-gray-400">Theme</span>
              <span className="text-[11px] font-medium text-[#4361ee] bg-[#eef0fd] px-3 py-0.5 rounded-full capitalize">
                {THEME_LABELS[item.theme] ?? item.theme}
              </span>
            </div>
            {item.color && (
              <div className="flex items-center justify-between py-3">
                <span className="text-[13px] text-gray-400">Color</span>
                <span className="text-[13px] font-medium text-gray-800 capitalize">{item.color}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}


// ─── Product card ──────────────────────────────────────────────────────────────

function ProductCard({
  item,
  isFavorite,
  onToggleFavorite,
  onDelete,
  onClick,
  isMenuOpen,
  onMenuToggle,
}: {
  item: WardrobeItem;
  isFavorite: boolean;
  onToggleFavorite: () => void;
  onDelete: () => void;
  onClick: () => void;
  isMenuOpen: boolean;
  onMenuToggle: (e: React.MouseEvent) => void;
}) {
  return (
    <div
      onClick={onClick}
      className={[
        "group relative rounded-[18px] cursor-pointer shadow-sm hover:shadow-xl hover:-translate-y-0.5 transition-all duration-300",
        isMenuOpen ? "z-10" : "",
      ].join(" ")}
    >
      {/* Image area — overflow-hidden for scale clip */}
      <div className="h-[270px] rounded-t-[18px] flex items-center justify-center bg-gray-50 relative overflow-hidden">
        {item.processed_image_url ? (
          <img
            src={item.processed_image_url}
            alt={item.name}
            className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-300"
          />
        ) : (
          <Shirt
            size={72}
            strokeWidth={0.8}
            className="text-gray-300 group-hover:scale-110 transition-transform duration-300"
          />
        )}

        {/* Heart — top-left, shows on hover */}
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
          className="absolute top-3 left-3 size-8 rounded-full bg-white/85 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white shadow-sm"
        >
          <Heart
            size={15}
            strokeWidth={2}
            className={isFavorite ? "fill-red-500 text-red-500" : "text-gray-500"}
          />
        </button>
      </div>

      {/* 3-dot menu — outside overflow-hidden, always visible */}
      <div className="absolute top-3 right-3">
        <button
          onClick={onMenuToggle}
          className="size-8 rounded-full bg-white/85 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white transition-colors"
        >
          <MoreVertical size={15} strokeWidth={2} className="text-gray-500" />
        </button>

        {isMenuOpen && (
          <div className="absolute top-10 right-0 bg-white rounded-[12px] shadow-lg border border-gray-100 py-1.5 min-w-[120px]">
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(); }}
              className="w-full px-4 py-2 text-left text-[13px] text-red-500 hover:bg-red-50 flex items-center gap-2 transition-colors"
            >
              <Trash2 size={14} />
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Bottom bar — no + button */}
      <div className="bg-[#4361ee] h-[66px] rounded-b-[18px] flex items-center px-4">
        <div className="flex flex-col min-w-0">
          <span className="text-white text-[14px] font-semibold leading-tight truncate">
            {item.name || "Unnamed Item"}
          </span>
          <span className="text-white/70 text-[11px] font-medium capitalize">
            {item.theme} • {item.type}
          </span>
        </div>
      </div>
    </div>
  );
}


// ─── Page ─────────────────────────────────────────────────────────────────────

export default function WardrobePage() {
  const [searchValue, setSearchValue]       = useState("");
  const [activeCategory, setActiveCategory] = useState("all");
  const [favorites, setFavorites]           = useState<Set<number>>(new Set());
  const [items, setItems]                   = useState<WardrobeItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [isUploadOpen, setIsUploadOpen]     = useState(false);
  const [openMenuId, setOpenMenuId]         = useState<number | null>(null);
  const [selectedItem, setSelectedItem]     = useState<WardrobeItem | null>(null);

  const supabase = createClient();

  const fetchItems = async () => {
    setIsLoadingItems(true);
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) { setIsLoadingItems(false); return; }

    const { data, error } = await supabase
      .from("clothing_items")
      .select("*")
      .eq("user_id", sessionData.session.user.id)
      .order("created_at", { ascending: false });

    if (!error && data) setItems(data as WardrobeItem[]);
    setIsLoadingItems(false);
  };

  useEffect(() => { fetchItems(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Close dropdown when clicking anywhere outside
  useEffect(() => {
    if (openMenuId === null) return;
    function handle() { setOpenMenuId(null); }
    document.addEventListener("click", handle);
    return () => document.removeEventListener("click", handle);
  }, [openMenuId]);

  async function handleDelete(item: WardrobeItem) {
    setOpenMenuId(null);

    // Best-effort: delete from Supabase storage
    if (item.processed_image_url) {
      try {
        const marker = "/storage/v1/object/public/";
        const idx = item.processed_image_url.indexOf(marker);
        if (idx !== -1) {
          const rest = item.processed_image_url.slice(idx + marker.length);
          const slashIdx = rest.indexOf("/");
          if (slashIdx !== -1) {
            const bucket = rest.slice(0, slashIdx);
            const path   = rest.slice(slashIdx + 1);
            await supabase.storage.from(bucket).remove([path]);
          }
        }
      } catch {
        // Ignore storage errors — proceed with DB delete
      }
    }

    await supabase.from("clothing_items").delete().eq("id", item.id);
    fetchItems();
  }

  function toggleFavorite(id: number) {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const displayedItems = useMemo(() => {
    let filtered = items;
    if (activeCategory !== "all") {
      filtered = filtered.filter((i) => i.theme.toLowerCase() === activeCategory);
    }
    if (searchValue.trim()) {
      const q = searchValue.toLowerCase();
      filtered = filtered.filter(
        (i) => i.name?.toLowerCase().includes(q) || i.theme?.toLowerCase().includes(q)
      );
    }
    return filtered;
  }, [items, activeCategory, searchValue]);

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

        {/* Analytics cards */}
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

        <div className="bg-white rounded-[22px] mt-5 flex-1 min-h-0 flex flex-col overflow-hidden mb-[30px]">

          <div className="px-[57px] pt-[28px] shrink-0">
            <p className="text-[#b9b9b9] text-[32px] font-medium leading-tight">Wardrobe</p>
            <p className="text-black text-[44px] font-semibold leading-tight mt-1">
              {CATEGORIES.find((c) => c.value === activeCategory)?.label ?? "All"}
            </p>
          </div>

          <div className="flex items-center gap-2 px-[57px] mt-5 shrink-0 justify-between">
            <div className="flex items-center gap-2">
              {CATEGORIES.map(({ label, value }) => (
                <button
                  key={value}
                  onClick={() => setActiveCategory(value)}
                  className={[
                    "px-5 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 whitespace-nowrap",
                    activeCategory === value
                      ? "bg-[#4361ee] text-white shadow-sm"
                      : "bg-[#f4f5f8] text-gray-600 hover:bg-gray-200",
                  ].join(" ")}
                >
                  {label}
                </button>
              ))}
            </div>

            <button
              onClick={() => setIsUploadOpen(true)}
              className="px-5 py-2 rounded-xl bg-[#4361ee] text-white text-[13px] font-medium shadow-sm hover:bg-[#3451d6] transition-colors flex items-center gap-2"
            >
              <Upload size={16} />
              Want to upload your wardrobe
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-[57px] pt-5 pb-6 min-h-0">
            {isLoadingItems ? (
              <div className="flex items-center justify-center h-full">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#4361ee]" />
              </div>
            ) : displayedItems.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-400">
                <Shirt size={56} strokeWidth={1} />
                <span className="text-base font-medium">No items found</span>
              </div>
            ) : (
              <div className="grid grid-cols-4 gap-[18px]">
                {displayedItems.map((item) => (
                  <ProductCard
                    key={item.id}
                    item={item}
                    isFavorite={favorites.has(item.id)}
                    onToggleFavorite={() => toggleFavorite(item.id)}
                    onDelete={() => handleDelete(item)}
                    onClick={() => {
                      // Don't open modal if a menu was just closed
                      if (openMenuId !== null) { setOpenMenuId(null); return; }
                      setSelectedItem(item);
                    }}
                    isMenuOpen={openMenuId === item.id}
                    onMenuToggle={(e) => {
                      e.stopPropagation();
                      setOpenMenuId((prev) => (prev === item.id ? null : item.id));
                    }}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <UploadModal
        isOpen={isUploadOpen}
        onClose={() => setIsUploadOpen(false)}
        onSuccess={() => {
          setIsUploadOpen(false);
          fetchItems();
        }}
      />

      <ItemDetailModal item={selectedItem} onClose={() => setSelectedItem(null)} />
    </div>
  );
}
