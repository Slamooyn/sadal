"use client";

import { useState, useMemo } from "react";
import {
  CheckCircle,
  Clock,
  CircleX,
  Shirt,
  Heart,
  Plus,
} from "lucide-react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";


interface WardrobeItem {
  id: number;
  name: string;
  brand: string;
  bg: string;
}


const ANALYTICS_CARDS = [
  { label: "Orders Completed",     value: "300K", icon: CheckCircle, iconBg: "#dcfce7", iconColor: "#16a34a" },
  { label: "Orders Pending",       value: "10K",  icon: Clock,       iconBg: "#fef3c7", iconColor: "#d97706" },
  { label: "Orders Cancelled",     value: "100K", icon: CircleX,     iconBg: "#fee2e2", iconColor: "#dc2626" },
  { label: "Total Outfit Created", value: "350K", icon: Shirt,       iconBg: "#ede9fe", iconColor: "#7c3aed" },
];

const CATEGORIES = ["Winter Clothes", "Summer Clothes", "Sport Clothes"] as const;
type Category = typeof CATEGORIES[number];

const WARDROBE_ITEMS: Record<Category, WardrobeItem[]> = {
  "Winter Clothes": [
    { id: 1,  name: "Wool Coat",      brand: "Zara",           bg: "#e0e7ff" },
    { id: 2,  name: "Puffer Jacket",  brand: "H&M",            bg: "#fce7f3" },
    { id: 3,  name: "Knit Sweater",   brand: "Uniqlo",         bg: "#fef3c7" },
    { id: 4,  name: "Thermal Set",    brand: "Nike",           bg: "#dcfce7" },
    { id: 5,  name: "Fleece Hoodie",  brand: "Adidas",         bg: "#dbeafe" },
    { id: 6,  name: "Wool Cardigan",  brand: "M&S",            bg: "#fce7f3" },
    { id: 7,  name: "Turtleneck",     brand: "COS",            bg: "#ede9fe" },
    { id: 8,  name: "Down Vest",      brand: "The North Face", bg: "#fef9c3" },
  ],
  "Summer Clothes": [
    { id: 9,  name: "Sundress",       brand: "Zara",           bg: "#fce7f3" },
    { id: 10, name: "Linen Shirt",    brand: "H&M",            bg: "#dbeafe" },
    { id: 11, name: "Shorts",         brand: "Nike",           bg: "#dcfce7" },
    { id: 12, name: "Bikini Set",     brand: "Roxy",           bg: "#ede9fe" },
    { id: 13, name: "Summer Blouse",  brand: "Mango",          bg: "#fef3c7" },
    { id: 14, name: "Slip Dress",     brand: "Zara",           bg: "#fce7f3" },
    { id: 15, name: "Tank Top",       brand: "Uniqlo",         bg: "#e0e7ff" },
    { id: 16, name: "Swim Trunks",    brand: "Quiksilver",     bg: "#dcfce7" },
  ],
  "Sport Clothes": [
    { id: 17, name: "Running Jacket", brand: "Nike",           bg: "#dbeafe" },
    { id: 18, name: "Leggings",       brand: "Adidas",         bg: "#e0e7ff" },
    { id: 19, name: "Sports Bra",     brand: "Under Armour",   bg: "#dcfce7" },
    { id: 20, name: "Track Pants",    brand: "Puma",           bg: "#ede9fe" },
    { id: 21, name: "Compression Top",brand: "Nike",           bg: "#fef3c7" },
    { id: 22, name: "Gym Shorts",     brand: "Adidas",         bg: "#fce7f3" },
    { id: 23, name: "Sports Hoodie",  brand: "Champion",       bg: "#dbeafe" },
    { id: 24, name: "Training Vest",  brand: "Puma",           bg: "#fef9c3" },
  ],
};


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
        className="h-[270px] flex items-center justify-center"
        style={{ backgroundColor: item.bg }}
      >
        <Shirt
          size={72}
          strokeWidth={0.8}
          className="text-gray-300 group-hover:scale-110 transition-transform duration-300"
        />
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
            {item.name}
          </span>
          <span className="text-white/70 text-[11px] font-medium">{item.brand}</span>
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
  const [activeCategory, setActiveCategory] = useState<Category>("Winter Clothes");
  const [favorites, setFavorites]           = useState<Set<number>>(new Set());

  function toggleFavorite(id: number) {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const displayedItems = useMemo(() => {
    const items = WARDROBE_ITEMS[activeCategory];
    if (!searchValue.trim()) return items;
    const q = searchValue.toLowerCase();
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.brand.toLowerCase().includes(q)
    );
  }, [activeCategory, searchValue]);

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

          <div className="flex items-center gap-2 px-[57px] mt-5 shrink-0">
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

          <div className="flex-1 overflow-y-auto px-[57px] pt-5 pb-6 min-h-0">
            {displayedItems.length === 0 ? (
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
    </div>
  );
}
