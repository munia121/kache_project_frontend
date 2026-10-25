"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { useFilterStore } from "@/store/useFilterStore";
import { productService } from "@/services/product.service";
import { ProductCard } from "@/components/modules/products/ProductCard";
import { ProductGridSkeleton } from "@/components/modules/products/ProductGridSkeleton";
import { SearchX, RotateCcw, SlidersHorizontal, MapPin, PlusCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ProductGrid() {
  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    selectedArea,
    selectedAreaId,
    resetFilters,
    setSelectedArea,
    setSelectedAreaId,
    setIsLocationModalOpen,
  } = useFilterStore();

  // Extract bare area name (e.g., "ধানমন্ডি" from "ধানমন্ডি, ঢাকা")
  const currentAreaName = selectedArea.split(",")[0].trim();
  const isAllAreas =
    !selectedAreaId ||
    selectedArea.includes("সব এলাকা") ||
    selectedArea.includes("সমগ্র ঢাকা") ||
    selectedArea === "ঢাকা";

  const categoryQuery =
    selectedCategory === "সকল" || selectedCategory === "all" || !selectedCategory
      ? undefined
      : selectedCategory;

  const areaParam = isAllAreas ? undefined : selectedAreaId;

  // Categories query to resolve friendly category label
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => productService.getCategories(),
    staleTime: 1000 * 60 * 10,
  });

  const selectedCategoryObj = categoriesData?.data?.find(
    (c) => c.slug === selectedCategory || c.name === selectedCategory
  );
  const categoryDisplayName = selectedCategoryObj?.name || selectedCategory;

  // Live TanStack Query
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: [
      "products",
      {
        search: searchQuery.trim(),
        category: categoryQuery,
        area: areaParam,
      },
    ],
    queryFn: () =>
      productService.getProducts({
        searchTerm: searchQuery.trim() || undefined,
        category: categoryQuery,
        area: areaParam,
        limit: 30,
      }),
  });

  const products = data?.data || [];

  const hasActiveFilters =
    searchQuery.trim() !== "" ||
    (selectedCategory !== "সকল" && selectedCategory !== "all") ||
    !isAllAreas ||
    !!selectedAreaId;

  const handleShowAllAreas = () => {
    setSelectedArea("সব এলাকা, ঢাকা");
    setSelectedAreaId(undefined);
  };

  return (
    <section className="w-full pb-16">
      {/* Grid Header & Filter Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5 pt-2">
        <div className="flex items-center gap-2 flex-wrap">
          <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>আজকের পণ্যসমূহ</span>
            {!isLoading && (
              <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-[#FF6F0F]">
                {products.length}টি
              </span>
            )}
          </h2>

          {!isAllAreas && (
            <div className="inline-flex items-center gap-1 text-xs font-medium bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200">
              <MapPin className="h-3 w-3 text-[#FF6F0F]" />
              <span>{currentAreaName} ও কাছাকাছি</span>
              <button
                type="button"
                onClick={handleShowAllAreas}
                className="ml-1 text-[11px] text-[#FF6F0F] hover:underline cursor-pointer"
              >
                (সব এলাকা দেখুন)
              </button>
            </div>
          )}

          {selectedCategory !== "সকল" && selectedCategory !== "all" && (
            <span className="text-xs font-medium bg-orange-50 text-[#FF6F0F] px-2.5 py-1 rounded-full border border-orange-200">
              ক্যাটাগরি: {categoryDisplayName}
            </span>
          )}

          {searchQuery && (
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold bg-orange-100/90 text-[#FF6F0F] border border-orange-200/80 px-3 py-1 rounded-full shadow-2xs">
              <span>সার্চ: &ldquo;{searchQuery}&rdquo;</span>
              <button
                type="button"
                onClick={() => setSearchQuery("")}
                className="hover:bg-orange-200/80 text-[#FF6F0F] rounded-full h-4 w-4 inline-flex items-center justify-center text-xs font-bold leading-none cursor-pointer"
                title="সার্চ মুছুন"
              >
                ×
              </button>
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
              className="text-xs text-slate-500 hover:text-slate-900 gap-1.5 h-8 px-2.5 cursor-pointer"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>ফিল্টার রিসেট</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsLocationModalOpen(true)}
            className="text-xs border-slate-200 hover:border-orange-300 hover:bg-orange-50/50 gap-1.5 h-8 px-3 rounded-full text-slate-700 cursor-pointer"
          >
            <SlidersHorizontal className="h-3.5 w-3.5 text-[#FF6F0F]" />
            <span>এলাকা ফিল্টার</span>
          </Button>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading ? (
        <ProductGridSkeleton count={10} />
      ) : isError ? (
        /* Error State */
        <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl bg-white border border-red-100 shadow-2xs my-4 space-y-3">
          <div className="h-12 w-12 rounded-full bg-red-50 flex items-center justify-center text-red-500">
            <AlertCircle className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900">
            পণ্য লোড করতে সমস্যা হয়েছে
          </h3>
          <p className="text-xs text-slate-500 max-w-sm">
            {(error as { message?: string })?.message || "ইন্টারনেট সংযোগ বা সার্ভার ত্রুটির কারণে পণ্য প্রদর্শন সম্ভব হচ্ছে না।"}
          </p>
          <Button
            size="sm"
            onClick={() => refetch()}
            className="text-xs rounded-full bg-[#FF6F0F] hover:bg-[#F95738] text-white cursor-pointer mt-2"
          >
            পুনরায় চেষ্টা করুন
          </Button>
        </div>
      ) : products.length > 0 ? (
        /* Products Grid */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
          {products.map((product) => (
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
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              {searchQuery
                ? `"${searchQuery}" এর সাথে মিলে এমন কোনো পণ্য খুঁজে পাওয়া যায়নি। ফিল্টার রিসেট করে অন্য শব্দ দিয়ে আবার চেষ্টা করুন।`
                : `আপনার ফিল্টারের সাথে মিলে এমন কোনো পণ্য ${currentAreaName} এলাকায় পাওয়া যায়নি।`}
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            {!isAllAreas && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleShowAllAreas}
                className="text-xs rounded-full border-[#FF6F0F] text-[#FF6F0F] hover:bg-orange-50 cursor-pointer"
              >
                ঢাকা সমগ্র দেখুন
              </Button>
            )}
            {searchQuery && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSearchQuery("")}
                className="text-xs rounded-full border-orange-200 text-[#FF6F0F] hover:bg-orange-50 cursor-pointer"
              >
                সার্চ মুছুন
              </Button>
            )}
            {hasActiveFilters && (
              <Button
                variant="outline"
                size="sm"
                onClick={resetFilters}
                className="text-xs rounded-full border-slate-300 text-slate-700 hover:bg-slate-50 cursor-pointer"
              >
                সব ফিল্টার রিসেট করুন
              </Button>
            )}
            <Link
              href="/post-ad"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#FF6F0F] hover:bg-[#F95738] text-white text-xs font-bold shadow-md shadow-orange-500/20 cursor-pointer"
            >
              <PlusCircle className="h-3.5 w-3.5" />
              <span>প্রথম বিজ্ঞাপন দিন</span>
            </Link>
          </div>
        </div>
      )}
    </section>
  );
}

export default ProductGrid;
