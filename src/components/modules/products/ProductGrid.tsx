"use client";

import * as React from "react";
import { useFilterStore } from "@/store/useFilterStore";
import { MOCK_PRODUCTS } from "@/constants/mock-products";
import { ProductCard } from "@/components/modules/products/ProductCard";
import { SearchX, RotateCcw, SlidersHorizontal, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ProductGrid() {
  const {
    searchQuery,
    selectedCategory,
    selectedArea,
    resetFilters,
    setSelectedArea,
    setIsLocationModalOpen,
  } = useFilterStore();

  // Extract bare area name (e.g., "ধানমন্ডি" from "ধানমন্ডি, ঢাকা")
  const currentAreaName = selectedArea.split(",")[0].trim();
  const isAllAreas =
    selectedArea.includes("সব এলাকা") || selectedArea.includes("সমগ্র ঢাকা");

  // Filtering products
  const filteredProducts = React.useMemo(() => {
    return MOCK_PRODUCTS.filter((product) => {
      // 1. Category Filter
      const matchesCategory =
        selectedCategory === "সকল" ||
        selectedCategory === "all" ||
        product.categoryName === selectedCategory ||
        product.category.toLowerCase() === selectedCategory.toLowerCase();

      // 2. Search Query Filter
      const query = searchQuery.trim().toLowerCase();
      const matchesSearch =
        query === "" ||
        product.title.toLowerCase().includes(query) ||
        product.categoryName.toLowerCase().includes(query) ||
        product.area.toLowerCase().includes(query) ||
        product.location.toLowerCase().includes(query);

      // 3. Location Filter (if not "সব এলাকা")
      const matchesLocation =
        isAllAreas ||
        product.area.toLowerCase().includes(currentAreaName.toLowerCase()) ||
        product.location.toLowerCase().includes(currentAreaName.toLowerCase());

      return matchesCategory && matchesSearch && matchesLocation;
    });
  }, [searchQuery, selectedCategory, isAllAreas, currentAreaName]);

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    selectedCategory !== "সকল" ||
    !isAllAreas;

  return (
    <section className="w-full pb-16">
      {/* Grid Header & Filter Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pt-2">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>আজকের পণ্যসমূহ</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-[#FF6F0F]">
              {filteredProducts.length}টি
            </span>
          </h2>

          {!isAllAreas && (
            <div className="inline-flex items-center gap-1 text-xs font-medium bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200">
              <MapPin className="h-3 w-3 text-[#FF6F0F]" />
              <span>{currentAreaName} ও কাছাকাছি</span>
              <button
                type="button"
                onClick={() => setSelectedArea("সব এলাকা, ঢাকা")}
                className="ml-1 text-[11px] text-[#FF6F0F] hover:underline cursor-pointer"
              >
                (সব এলাকা দেখুন)
              </button>
            </div>
          )}

          {selectedCategory !== "সকল" && (
            <span className="text-xs font-medium bg-orange-50 text-[#FF6F0F] px-2.5 py-1 rounded-full border border-orange-200">
              ক্যাটাগরি: {selectedCategory}
            </span>
          )}

          {searchQuery && (
            <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2.5 py-1 rounded-full">
              সার্চ: &ldquo;{searchQuery}&rdquo;
            </span>
          )}
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={resetFilters}
              className="text-xs text-slate-500 hover:text-slate-900 gap-1.5 h-8 px-2.5"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>ফিল্টার রিসেট</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsLocationModalOpen(true)}
            className="text-xs border-slate-200 hover:border-orange-300 hover:bg-orange-50/50 gap-1.5 h-8 px-3 rounded-full text-slate-700"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-[#FF6F0F]" />
            <span>এলাকা ফিল্টার</span>
          </Button>
        </div>
      </div>

      {/* Product Grid: 2 columns mobile, 3 tablet, 4 to 5 desktop */}
      {filteredProducts.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
          {filteredProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl bg-white border border-slate-100 shadow-2xs my-4 space-y-4">
          <div className="h-16 w-16 rounded-full bg-orange-50 flex items-center justify-center text-[#FF6F0F]">
            <SearchX className="h-8 w-8" />
          </div>
          <div className="space-y-1.5 max-w-sm">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              কোনো পণ্য পাওয়া যায়নি
            </h3>
            <p className="text-xs sm:text-sm text-slate-500">
              আপনার ফিল্টার বা সার্চ শব্দের সাথে মিলে এমন কোনো পণ্য {currentAreaName} এলাকায় নেই।
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {!isAllAreas && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedArea("সব এলাকা, ঢাকা")}
                className="text-xs rounded-full border-[#FF6F0F] text-[#FF6F0F] hover:bg-orange-50"
              >
                ঢাকা সমগ্র দেখুন
              </Button>
            )}
            <Button
              size="sm"
              onClick={resetFilters}
              className="text-xs rounded-full bg-[#FF6F0F] hover:bg-[#F95738] text-white"
            >
              সব ফিল্টার রিসেট করুন
            </Button>
          </div>
        </div>
      )}
    </section>
  );
}
