"use client";

import * as React from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import {
  useFilterStore,
  ProductSortOption,
} from "@/store/useFilterStore";
import { productService } from "@/services/product.service";
import { ProductCard } from "@/components/modules/products/ProductCard";
import { ProductGridSkeleton } from "@/components/modules/products/ProductGridSkeleton";
import {
  SearchX,
  RotateCcw,
  SlidersHorizontal,
  MapPin,
  PlusCircle,
  AlertCircle,
  ArrowUpDown,
  Tag,
  Banknote,
  Sparkles,
  ChevronDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface ProductGridProps {
  showSidebarFilters?: boolean;
}

export function ProductGrid({ showSidebarFilters = false }: ProductGridProps) {
  const {
    searchQuery,
    setSearchQuery,
    selectedCategory,
    setSelectedCategory,
    selectedArea,
    selectedAreaId,
    setSelectedArea,
    setSelectedAreaId,
    minPrice,
    maxPrice,
    setPriceRange,
    condition,
    setCondition,
    isNegotiable,
    setIsNegotiable,
    sortBy,
    setSortBy,
    resetFilters,
    setIsLocationModalOpen,
    setIsFilterDrawerOpen,
    getActiveFiltersCount,
  } = useFilterStore();

  const activeCount = getActiveFiltersCount();

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

  const areaParam = isAllAreas ? undefined : (selectedAreaId || selectedArea);

  // Categories query to resolve friendly category label
  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => productService.getCategories(),
    staleTime: 1000 * 60 * 10,
  });

  const selectedCategoryObj = categoriesData?.data?.find(
    (c) => c.slug === selectedCategory || c.name === selectedCategory || c.id === selectedCategory
  );
  const categoryDisplayName = selectedCategoryObj?.name || selectedCategory;

  // Compute active query parameters:
  // On Home Page (showSidebarFilters === false): Strictly local products feed (0 category or sidebar filter bleed)
  // On Products Page (showSidebarFilters === true): Filter by all criteria including price, condition, negotiable, sort
  const queryParams = React.useMemo(() => {
    if (!showSidebarFilters) {
      return {
        searchTerm: searchQuery.trim() || undefined,
        area: areaParam,
        limit: 30,
      };
    }
    return {
      searchTerm: searchQuery.trim() || undefined,
      category: categoryQuery,
      area: areaParam,
      minPrice: minPrice !== undefined && minPrice !== "" ? Number(minPrice) : undefined,
      maxPrice: maxPrice !== undefined && maxPrice !== "" ? Number(maxPrice) : undefined,
      condition: condition !== "ALL" ? condition : undefined,
      isNegotiable: isNegotiable || undefined,
      sortBy,
      limit: 30,
    };
  }, [
    showSidebarFilters,
    searchQuery,
    categoryQuery,
    areaParam,
    minPrice,
    maxPrice,
    condition,
    isNegotiable,
    sortBy,
  ]);

  // Live TanStack Query
  const { data, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["products", queryParams],
    queryFn: () => productService.getProducts(queryParams),
  });

  const products = data?.data || [];

  const handleShowAllAreas = () => {
    setSelectedArea("সব এলাকা, ঢাকা", undefined);
    setSelectedAreaId(undefined);
  };

  const hasActiveHomeFilters =
    searchQuery.trim() !== "" ||
    !isAllAreas;

  // Format price range label (only used when showSidebarFilters is true)
  const priceRangeLabel = React.useMemo(() => {
    if (minPrice === 0 && maxPrice === 0) return "ফ্রি / দান";
    if (minPrice !== undefined && minPrice !== "" && maxPrice !== undefined && maxPrice !== "") {
      return `৳${minPrice} - ৳${maxPrice}`;
    }
    if (minPrice !== undefined && minPrice !== "") {
      return `৳${minPrice}+`;
    }
    if (maxPrice !== undefined && maxPrice !== "") {
      return `৳${maxPrice} এর নিচে`;
    }
    return null;
  }, [minPrice, maxPrice]);

  return (
    <section className="w-full pb-16">
      {/* ========================================================= */}
      {/* 1. GRID HEADER (Home Mode vs Products Mode) */}
      {/* ========================================================= */}
      {!showSidebarFilters ? (
        /* Home Mode Header: Clean, simple, strictly for neighborhood browsing */
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

            {/* Active Area Pill */}
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

            {/* Active Search Query Pill */}
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

          {/* Action Controls for Home */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            {hasActiveHomeFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSearchQuery("");
                  handleShowAllAreas();
                }}
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
      ) : (
        /* Products Mode Header: Includes mobile filter trigger, quick sort & active filter badges */
        <>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4 pt-1">
            <div className="flex items-center gap-2">
              <h2 className="text-lg sm:text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <span>পণ্যসমূহ</span>
                {!isLoading && (
                  <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-[#FF6F0F]">
                    {products.length}টি
                  </span>
                )}
              </h2>
            </div>

            <div className="flex items-center gap-2.5 self-start sm:self-auto w-full sm:w-auto justify-between sm:justify-end">
              {/* Mobile Filter Button */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsFilterDrawerOpen(true)}
                className="lg:hidden flex items-center gap-1.5 h-9 px-3.5 rounded-full border-orange-200 text-slate-800 hover:bg-orange-50 font-bold text-xs shadow-2xs cursor-pointer"
              >
                <SlidersHorizontal className="h-3.5 w-3.5 text-[#FF6F0F]" />
                <span>ফিল্টার</span>
                {activeCount > 0 && (
                  <span className="px-1.5 py-0.2 rounded-full text-[10px] font-bold bg-[#FF6F0F] text-white">
                    {activeCount}
                  </span>
                )}
              </Button>

              {/* Quick Sort Dropdown */}
              <div className="relative shrink-0">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as ProductSortOption)}
                  className="h-9 pl-8 pr-7 rounded-full bg-white hover:bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700 focus:border-orange-300 focus:outline-none transition-colors cursor-pointer appearance-none shadow-2xs"
                >
                  <option value="newest">নতুন বিজ্ঞাপন</option>
                  <option value="price_asc">দাম: কম থেকে বেশি</option>
                  <option value="price_desc">দাম: বেশি থেকে কম</option>
                </select>
                <ArrowUpDown className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Active Filter Pills Row */}
          {activeCount > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap pb-4 pt-0.5">
              <span className="text-[11px] font-bold text-slate-400 mr-1 uppercase tracking-wider">
                সক্রিয়:
              </span>

              {!isAllAreas && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold bg-slate-100 text-slate-700 px-2.5 py-1 rounded-full border border-slate-200">
                  <MapPin className="h-3 w-3 text-[#FF6F0F]" />
                  <span>{currentAreaName}</span>
                  <button
                    type="button"
                    onClick={handleShowAllAreas}
                    className="hover:bg-slate-200 text-slate-500 rounded-full h-4 w-4 inline-flex items-center justify-center text-xs font-bold leading-none cursor-pointer ml-0.5"
                    title="এলাকা ফিল্টার মুছুন"
                  >
                    ×
                  </button>
                </span>
              )}

              {selectedCategory !== "সকল" && selectedCategory !== "all" && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold bg-orange-50 text-[#FF6F0F] px-2.5 py-1 rounded-full border border-orange-200">
                  <Tag className="h-3 w-3 text-[#FF6F0F]" />
                  <span>{categoryDisplayName}</span>
                  <button
                    type="button"
                    onClick={() => setSelectedCategory("সকল")}
                    className="hover:bg-orange-100 text-[#FF6F0F] rounded-full h-4 w-4 inline-flex items-center justify-center text-xs font-bold leading-none cursor-pointer ml-0.5"
                    title="ক্যাটাগরি ফিল্টার মুছুন"
                  >
                    ×
                  </button>
                </span>
              )}

              {searchQuery && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold bg-orange-100/90 text-[#FF6F0F] border border-orange-200/80 px-2.5 py-1 rounded-full shadow-2xs">
                  <span>সার্চ: &ldquo;{searchQuery}&rdquo;</span>
                  <button
                    type="button"
                    onClick={() => setSearchQuery("")}
                    className="hover:bg-orange-200/80 text-[#FF6F0F] rounded-full h-4 w-4 inline-flex items-center justify-center text-xs font-bold leading-none cursor-pointer ml-0.5"
                    title="সার্চ মুছুন"
                  >
                    ×
                  </button>
                </span>
              )}

              {priceRangeLabel && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full">
                  <Banknote className="h-3 w-3 text-emerald-600" />
                  <span>{priceRangeLabel}</span>
                  <button
                    type="button"
                    onClick={() => setPriceRange(undefined, undefined)}
                    className="hover:bg-emerald-100 text-emerald-700 rounded-full h-4 w-4 inline-flex items-center justify-center text-xs font-bold leading-none cursor-pointer ml-0.5"
                    title="মূল্য ফিল্টার মুছুন"
                  >
                    ×
                  </button>
                </span>
              )}

              {condition && condition !== "ALL" && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200 px-2.5 py-1 rounded-full">
                  <Sparkles className="h-3 w-3 text-blue-600" />
                  <span>{condition === "NEW" ? "একদম নতুন" : "ব্যবহৃত"}</span>
                  <button
                    type="button"
                    onClick={() => setCondition("ALL")}
                    className="hover:bg-blue-100 text-blue-700 rounded-full h-4 w-4 inline-flex items-center justify-center text-xs font-bold leading-none cursor-pointer ml-0.5"
                    title="কন্ডিশন মুছুন"
                  >
                    ×
                  </button>
                </span>
              )}

              {isNegotiable && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-full">
                  <span>আলোচনা সাপেক্ষ</span>
                  <button
                    type="button"
                    onClick={() => setIsNegotiable(false)}
                    className="hover:bg-purple-100 text-purple-700 rounded-full h-4 w-4 inline-flex items-center justify-center text-xs font-bold leading-none cursor-pointer ml-0.5"
                    title="মুছুন"
                  >
                    ×
                  </button>
                </span>
              )}

              {sortBy && sortBy !== "newest" && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200 px-2.5 py-1 rounded-full">
                  <ArrowUpDown className="h-3 w-3 text-slate-500" />
                  <span>{sortBy === "price_asc" ? "কম দাম আগে" : "বেশি দাম আগে"}</span>
                  <button
                    type="button"
                    onClick={() => setSortBy("newest")}
                    className="hover:bg-slate-200 text-slate-600 rounded-full h-4 w-4 inline-flex items-center justify-center text-xs font-bold leading-none cursor-pointer ml-0.5"
                    title="ডিফল্ট সর্টিং"
                  >
                    ×
                  </button>
                </span>
              )}

              <button
                type="button"
                onClick={resetFilters}
                className="text-xs font-semibold text-[#FF6F0F] hover:underline inline-flex items-center gap-1 ml-1 cursor-pointer"
              >
                <RotateCcw className="h-3 w-3" />
                <span>সব মুছুন</span>
              </button>
            </div>
          )}
        </>
      )}

      {/* ========================================================= */}
      {/* 2. PRODUCTS GRID / SKELETON / EMPTY / ERROR */}
      {/* ========================================================= */}
      {isLoading ? (
        <ProductGridSkeleton count={showSidebarFilters ? 8 : 10} />
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
            {(error as { message?: string })?.message ||
              "ইন্টারনেট সংযোগ বা সার্ভার ত্রুটির কারণে পণ্য প্রদর্শন সম্ভব হচ্ছে না।"}
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
        /* Responsive Products Grid */
        <div
          className={
            showSidebarFilters
              ? "grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 sm:gap-4 md:gap-4"
              : "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5"
          }
        >
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center p-10 sm:p-14 text-center rounded-3xl bg-white border border-slate-100 shadow-2xs my-4 space-y-4">
          <div className="h-16 w-16 rounded-full bg-orange-50 flex items-center justify-center text-[#FF6F0F]">
            <SearchX className="h-8 w-8" />
          </div>
          <div className="space-y-1.5 max-w-md">
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              কোনো পণ্য পাওয়া যায়নি
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              {searchQuery
                ? `"${searchQuery}" এর সাথে মিলে এমন কোনো সক্রিয় বিজ্ঞাপন পাওয়া যায়নি। ফিল্টার পরিবর্তন করে পুনরায় চেষ্টা করুন।`
                : hasActiveHomeFilters
                ? "আপনার নির্বাচিত ফিল্টারের সাথে মিলে এমন কোনো পণ্য নেই। ফিল্টার রিসেট করে পুনরায় চেষ্টা করুন।"
                : `বর্তমানে ${currentAreaName} এলাকায় কোনো বিজ্ঞাপন নেই।`}
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
            {hasActiveHomeFilters && (
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
