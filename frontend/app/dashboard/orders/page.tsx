"use client";

import { useState, useRef, useEffect } from "react";
import { ChevronDown, CheckCircle, Clock, CircleX, Shirt } from "lucide-react";
import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";


type OrderStatus = "Paid" | "Not yet paid" | "Cancelled";

interface Order {
  id: number;
  total: string;
  status: OrderStatus;
  date: string;
  time: string;
}


const ANALYTICS_CARDS = [
  { label: "Orders Completed",     value: "300K", icon: CheckCircle, iconBg: "#dcfce7", iconColor: "#16a34a" },
  { label: "Orders Pending",       value: "10K",  icon: Clock,       iconBg: "#fef3c7", iconColor: "#d97706" },
  { label: "Orders Cancelled",     value: "100K", icon: CircleX,     iconBg: "#fee2e2", iconColor: "#dc2626" },
  { label: "Total Outfit Created", value: "350K", icon: Shirt,       iconBg: "#ede9fe", iconColor: "#7c3aed" },
];

const ORDERS: Order[] = [
  { id: 1, total: "1x", status: "Paid",         date: "01/01/20", time: "15:30" },
  { id: 2, total: "2x", status: "Not yet paid", date: "01/01/20", time: "15:30" },
  { id: 3, total: "4x", status: "Cancelled",    date: "01/01/20", time: "15:30" },
  { id: 4, total: "1x", status: "Paid",         date: "01/01/20", time: "15:30" },
  { id: 5, total: "1x", status: "Paid",         date: "01/01/20", time: "15:30" },
];

const SORT_OPTIONS = ["recent", "oldest", "price: high to low", "price: low to high"];

const STATUS_STYLE: Record<OrderStatus, { bg: string; color: string }> = {
  "Paid":         { bg: "#d1ffe1", color: "#1a9945" },
  "Not yet paid": { bg: "#defdff", color: "#20b0b9" },
  "Cancelled":    { bg: "#ffdede", color: "#d02323" },
};


function StatusBadge({ status }: { status: OrderStatus }) {
  const { bg, color } = STATUS_STYLE[status];
  return (
    <span
      className="text-[15px] font-medium whitespace-nowrap"
      style={{ backgroundColor: bg, color, padding: "9.5px", borderRadius: "3.8px" }}
    >
      {status}
    </span>
  );
}

function ProductPlaceholder() {
  return (
    <div
      className="shrink-0 rounded-lg"
      style={{ width: 70, height: 70, backgroundColor: "#d9d9d9" }}
    />
  );
}


export default function OrdersPage() {
  const [searchValue, setSearchValue] = useState("");
  const [sortBy, setSortBy]           = useState("recent");
  const [sortOpen, setSortOpen]       = useState(false);
  const sortRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
        setSortOpen(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

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

        <div className="flex flex-col gap-[19px] mt-5 flex-1 min-h-0 pb-[30px]">

          <div className="flex flex-col gap-1 shrink-0">
            <div className="flex items-center justify-between">
              <span className="text-black text-[23px] font-semibold leading-normal">Order Stats</span>

              <div className="relative" ref={sortRef}>
                <button
                  onClick={() => setSortOpen((v) => !v)}
                  className="flex items-center gap-4 border border-[#b9b9b9] rounded-[7.6px] px-[19px] py-[14px] bg-white hover:bg-gray-50 active:bg-gray-100 transition-colors"
                >
                  <span className="text-[15px] leading-none">
                    <span className="font-normal text-black">Sort by : </span>
                    <span className="font-bold text-black">{sortBy}</span>
                  </span>
                  <ChevronDown
                    size={16}
                    strokeWidth={2}
                    className={["text-gray-500 transition-transform duration-200", sortOpen ? "rotate-180" : ""].join(" ")}
                  />
                </button>

                {sortOpen && (
                  <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-xl shadow-xl py-1.5 z-20 min-w-[210px]">
                    {SORT_OPTIONS.map((option) => (
                      <button
                        key={option}
                        onClick={() => { setSortBy(option); setSortOpen(false); }}
                        className={[
                          "w-full text-left px-4 py-2.5 text-[14px] transition-colors",
                          sortBy === option
                            ? "text-[#4361ee] font-semibold bg-blue-50"
                            : "text-gray-700 font-normal hover:bg-gray-50",
                        ].join(" ")}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <span className="text-[#4361ee] text-[23px] font-bold leading-normal">
              25+ Orders Ready to be Shipped
            </span>
          </div>

          <div className="flex flex-col flex-1 min-h-0 overflow-hidden rounded-[7.6px] shadow-sm">

            <div className="bg-[#eeeeee] px-7 py-5 shrink-0 rounded-t-[7.6px]">
              <div className="flex items-center text-[15px] font-medium text-black">
                <span style={{ width: 80 }}>Product</span>
                <span className="flex-1 text-center">Total</span>
                <span className="flex-1 text-center">Status</span>
                <span className="flex-1 text-center">Date</span>
                <span className="flex-1 text-center">Time</span>
              </div>
            </div>

            <div className="bg-white flex-1 overflow-y-auto rounded-b-[7.6px]">
              {ORDERS.map((order, i) => (
                <div key={order.id}>
                  <div className="flex items-center px-7 py-5 hover:bg-gray-50 transition-colors">
                    <ProductPlaceholder />
                    <span className="flex-1 text-center text-[15px] font-medium text-black">{order.total}</span>
                    <div className="flex-1 flex justify-center">
                      <StatusBadge status={order.status} />
                    </div>
                    <span className="flex-1 text-center text-[15px] font-medium text-black">{order.date}</span>
                    <span className="flex-1 text-center text-[15px] font-medium text-black">{order.time}</span>
                  </div>
                  {i < ORDERS.length - 1 && <div className="h-px bg-[#f0f0f0] mx-7" />}
                </div>
              ))}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
