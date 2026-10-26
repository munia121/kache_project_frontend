"use client";

import * as React from "react";
import { useFilterStore } from "@/store/useFilterStore";
import { Sparkles, ChevronLeft, ChevronRight, X } from "lucide-react";

interface KeywordItem {
  label: string;
  query: string;
  icon?: string;
  isFree?: boolean;
}

const POPULAR_KEYWORDS: KeywordItem[] = [
  { label: "আইফোন", query: "আইফোন", icon: "📱" },
  { label: "সোফা", query: "সোফা", icon: "🛋️" },
  { label: "বাইক", query: "বাইক", icon: "🛵" },
  { label: "ল্যাপটপ", query: "ল্যাপটপ", icon: "💻" },
  { label: "ফ্রি / দান", query: "ফ্রি", icon: "🎁", isFree: true },
  { label: "স্মার্টওয়াচ", query: "স্মার্টওয়াচ", icon: "⌚" },
  { label: "ফার্নিচার", query: "ফার্নিচার", icon: "🪑" },
  { label: "টিভি", query: "টিভি", icon: "📺" },
  { label: "ক্যামেরা", query: "ক্যামেরা", icon: "📷" },
  { label: "সাইকেল", query: "সাইকেল", icon: "🚲" },
  { label: "ফ্রিজ", query: "ফ্রিজ", icon: "🧊" },
  { label: "বই", query: "বই", icon: "📚" },
];

export function SuggestedKeywords() {
  const {
    searchQuery,
    setSearchQuery,
    minPrice,
    maxPrice,
    setPriceRange,
  } = useFilterStore();

  const scrollRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);

  const checkScroll = React.useCallback(() => {
    const el = scrollRef.current;
    if (el) {
      setCanScrollLeft(el.scrollLeft > 10);
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    }
  }, []);

  React.useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [checkScroll]);

  const handleScroll = (direction: "left" | "right") => {
    const el = scrollRef.current;
    if (el) {
      const scrollAmount = direction === "left" ? -200 : 200;
      el.scrollBy({ left: scrollAmount, behavior: "smooth" });
      setTimeout(checkScroll, 250);
    }
  };

  const handleKeywordClick = (item: KeywordItem) => {
    const isFreeActive = item.isFree && minPrice === 0 && maxPrice === 0;
    const isSearchActive = searchQuery.trim().toLowerCase() === item.query.toLowerCase();

    if (item.isFree) {
      if (isFreeActive) {
        // Toggle off free
        setPriceRange(undefined, undefined);
      } else {
        // Toggle on free
        setPriceRange(0, 0);
      }
      return;
    }

    if (isSearchActive) {
      // Toggle off search query
      setSearchQuery("");
    } else {
      // Set new search query
      setSearchQuery(item.query);
    }
  };

  return (
    <div className="relative w-full py-2 group">
      <div className="flex items-center gap-2">
        {/* Left Label */}
        <div className="shrink-0 flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-wider pl-1">
          <Sparkles className="h-3.5 w-3.5 text-[#FF6F0F]" />
          <span className="hidden xs:inline">জনপ্রিয়:</span>
        </div>

        {/* Scroll Left Button */}
        {canScrollLeft && (
          <button
            type="button"
            aria-label="Scroll left keywords"
            onClick={() => handleScroll("left")}
            className="hidden sm:flex absolute left-14 top-1/2 -translate-y-1/2 z-10 h-7 w-7 items-center justify-center rounded-full bg-white/95 shadow-md border border-slate-200 text-slate-600 hover:text-[#FF6F0F] transition-all cursor-pointer"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>
        )}

        {/* Scrollable Track */}
        <div
          ref={scrollRef}
          onScroll={checkScroll}
          className="flex-1 flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth py-1 px-0.5"
        >
          {POPULAR_KEYWORDS.map((item) => {
            const isFreeActive = item.isFree && minPrice === 0 && maxPrice === 0;
            const isSearchActive =
              !item.isFree && searchQuery.trim().toLowerCase() === item.query.toLowerCase();
            const isActive = isFreeActive || isSearchActive;

            return (
              <button
                key={item.label}
                type="button"
                onClick={() => handleKeywordClick(item)}
                className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all duration-200 cursor-pointer select-none border ${
                  isActive
                    ? "bg-[#FF6F0F] text-white border-[#FF6F0F] shadow-sm shadow-orange-500/25 scale-[1.02]"
                    : "bg-white text-slate-700 border-slate-200/90 hover:border-orange-300 hover:bg-orange-50/60 hover:text-[#FF6F0F] shadow-2xs"
                }`}
              >
                {item.icon && <span className="text-xs leading-none">{item.icon}</span>}
                <span>{item.label}</span>
                {isActive && (
                  <X className="h-3 w-3 ml-0.5 text-white/90 hover:text-white" />
                )}
              </button>
            );
          })}
        </div>

        {/* Scroll Right Button */}
        {canScrollRight && (
          <button
            type="button"
            aria-label="Scroll right keywords"
            onClick={() => handleScroll("right")}
            className="hidden sm:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 h-7 w-7 items-center justify-center rounded-full bg-white/95 shadow-md border border-slate-200 text-slate-600 hover:text-[#FF6F0F] transition-all cursor-pointer"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        )}
      </div>
    </div>
  );
}

export default SuggestedKeywords;
