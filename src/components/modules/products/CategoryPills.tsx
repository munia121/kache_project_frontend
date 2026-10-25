"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import { useFilterStore } from "@/store/useFilterStore";
import { productService } from "@/services/product.service";
import { ChevronLeft, ChevronRight } from "lucide-react";

const CATEGORY_EMOJIS: Record<string, string> = {
  all: "🔥",
  "mobiles-gadgets": "📱",
  electronics: "💻",
  vehicles: "🛵",
  "property-rentals": "🏠",
  fashion: "👕",
  furniture: "🛋️",
  essentials: "🛒",
  services: "🔧",
  "বই-ও-স্টেশনারি": "📚",
};

export function CategoryPills() {
  const { selectedCategory, setSelectedCategory } = useFilterStore();
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => productService.getCategories(),
  });

  const categories = categoriesData?.data || [];

  const checkScroll = () => {
    const el = scrollContainerRef.current;
    if (el) {
      setCanScrollLeft(el.scrollLeft > 10);
      setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
    }
  };

  React.useEffect(() => {
    checkScroll();
    window.addEventListener("resize", checkScroll);
    return () => window.removeEventListener("resize", checkScroll);
  }, [categories.length]);

  const handleScroll = (direction: "left" | "right") => {
    const el = scrollContainerRef.current;
    if (el) {
      const scrollAmount = direction === "left" ? -240 : 240;
      el.scrollBy({ left: scrollAmount, behavior: "smooth" });
      setTimeout(checkScroll, 300);
    }
  };

  return (
    <div className="relative w-full py-2">
      {/* Scroll Left Button (desktop) */}
      {canScrollLeft && (
        <button
          type="button"
          aria-label="Scroll left"
          onClick={() => handleScroll("left")}
          className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow-md border border-slate-200 text-slate-600 hover:text-[#FF6F0F] hover:bg-orange-50 transition-all cursor-pointer"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
      )}

      {/* Categories Horizontal Track */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScroll}
        className="flex items-center gap-2 overflow-x-auto no-scrollbar scroll-smooth px-1 py-1"
      >
        {/* All Products Pill */}
        <button
          type="button"
          onClick={() => setSelectedCategory("সকল")}
          className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer select-none ${
            selectedCategory === "সকল" || selectedCategory === "all" || !selectedCategory
              ? "bg-[#FF6F0F] text-white shadow-sm shadow-orange-500/20 font-semibold scale-[1.02]"
              : "bg-white text-slate-700 border border-slate-200/90 hover:border-orange-300 hover:bg-orange-50/50 hover:text-slate-900 shadow-2xs"
          }`}
        >
          <span className="text-sm leading-none">🔥</span>
          <span>সকল</span>
        </button>

        {/* Dynamic Category Pills */}
        {categories.map((cat) => {
          const isSelected =
            selectedCategory === cat.slug ||
            selectedCategory === cat.name ||
            selectedCategory === cat.id;

          const emoji =
            cat.emoji ||
            CATEGORY_EMOJIS[cat.slug] ||
            CATEGORY_EMOJIS[cat.name] ||
            "📦";

          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.slug)}
              className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-full text-xs sm:text-sm font-medium transition-all duration-200 cursor-pointer select-none ${
                isSelected
                  ? "bg-[#FF6F0F] text-white shadow-sm shadow-orange-500/20 font-semibold scale-[1.02]"
                  : "bg-white text-slate-700 border border-slate-200/90 hover:border-orange-300 hover:bg-orange-50/50 hover:text-slate-900 shadow-2xs"
              }`}
            >
              <span className="text-sm leading-none">{emoji}</span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* Scroll Right Button (desktop) */}
      {canScrollRight && (
        <button
          type="button"
          aria-label="Scroll right"
          onClick={() => handleScroll("right")}
          className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow-md border border-slate-200 text-slate-600 hover:text-[#FF6F0F] hover:bg-orange-50 transition-all cursor-pointer"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

export default CategoryPills;
