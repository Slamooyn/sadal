"use client";

import { useState, useMemo, useEffect } from "react";
import {
  CheckCircle,
  Clock,
  CircleX,
  Shirt,
  Heart,
  Plus,
  Upload,
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
  processed_image_url: string;
}


const ANALYTICS_CARDS = [
  { label: "Orders Completed",     value: "300K", icon: CheckCircle, iconBg: "#dcfce7", iconColor: "#16a34a" },
  { label: "Orders Pending",       value: "10K",  icon: Clock,       iconBg: "#fef3c7", iconColor: "#d97706" },
  { label: "Orders Cancelled",     value: "100K", icon: CircleX,     iconBg: "#fee2e2", iconColor: "#dc2626" },
  { label: "Total Outfit Created", value: "350K", icon: Shirt,       iconBg: "#ede9fe", iconColor: "#7c3aed" },
];

const CATEGORIES = ["All", "Shirt", "Pants", "Shoes"];


function ProductCard({
  item,
  isFavorite,
  onToggleFavorite,
}: {
  item: WardrobeItem;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}) {
  return (
    <div className="group relative rounded-[18px] overflow-hidden cursor-pointer shadow-sm hover:shadow-xl transition-all duration-300 hover:-translate-y-0.5">
      <div
        className="h-[270px] flex items-center justify-center bg-gray-50 relative"
      >
        {item.processed_image_url ? (
          <img src={item.processed_image_url} alt={item.name} className="w-full h-full object-contain p-4 group-hover:scale-110 transition-transform duration-300" />
        ) : (
          <Shirt
            size={72}
            strokeWidth={0.8}
            className="text-gray-300 group-hover:scale-110 transition-transform duration-300"
          />
        )}
      </div>

      <button
        onClick={(e) => { e.stopPropagation(); onToggleFavorite(); }}
        className="absolute top-3 right-3 size-8 rounded-full bg-white/85 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-white shadow-sm"
      >
        <Heart
          size={15}
          strokeWidth={2}
          className={isFavorite ? "fill-red-500 text-red-500" : "text-gray-500"}
        />
      </button>

      <div className="bg-[#4361ee] h-[66px] flex items-center justify-between px-4">
        <div className="flex flex-col min-w-0">
          <span className="text-white text-[14px] font-semibold leading-tight truncate">
            {item.name || "Unnamed Item"}
          </span>
          <span className="text-white/70 text-[11px] font-medium capitalize">{item.theme} • {item.type}</span>
        </div>
        <button
          onClick={(e) => e.stopPropagation()}
          className="size-8 rounded-full bg-white/20 hover:bg-white/35 active:bg-white/50 flex items-center justify-center transition-colors shrink-0 ml-2"
          title="Add to outfit"
        >
          <Plus size={15} strokeWidth={2.5} className="text-white" />
        </button>
      </div>
    </div>
  );
}


export default function WardrobePage() {
  const [searchValue, setSearchValue]       = useState("");
  const [activeCategory, setActiveCategory] = useState("All");
  const [favorites, setFavorites]           = useState<Set<number>>(new Set());
  const [items, setItems]                   = useState<WardrobeItem[]>([]);
  const [isLoadingItems, setIsLoadingItems] = useState(true);
  const [isUploadOpen, setIsUploadOpen]     = useState(false);
  
  const supabase = createClient();

  const fetchItems = async () => {
    setIsLoadingItems(true);
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) return;
    
    const { data, error } = await supabase
      .from('clothing_items')
      .select('*')
      .eq('user_id', sessionData.session.user.id)
      .order('created_at', { ascending: false });
      
    if (!error && data) {
      setItems(data);
    }
    setIsLoadingItems(false);
  };

  useEffect(() => {
    fetchItems();
  }, []);

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
    if (activeCategory !== "All") {
      filtered = filtered.filter((i) => i.type.toLowerCase() === activeCategory.toLowerCase());
    }
    if (searchValue.trim()) {
      const q = searchValue.toLowerCase();
      filtered = filtered.filter(
        (item) =>
          item.name?.toLowerCase().includes(q) ||
          item.theme?.toLowerCase().includes(q)
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
            <p className="text-[#b9b9b9] text-[32px] font-medium leading-tight">
              Wardrobe
            </p>
            <p className="text-black text-[44px] font-semibold leading-tight mt-1">
              {activeCategory}
            </p>
          </div>

          <div className="flex items-center gap-2 px-[57px] mt-5 shrink-0 justify-between">
            <div className="flex items-center gap-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={[
                    "px-5 py-2 rounded-xl text-[13px] font-medium transition-all duration-150 whitespace-nowrap",
                    activeCategory === cat
                      ? "bg-[#4361ee] text-white shadow-sm"
                      : "bg-[#f4f5f8] text-gray-600 hover:bg-gray-200",
                  ].join(" ")}
                >
                  {cat}
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
    </div>
  );
}
