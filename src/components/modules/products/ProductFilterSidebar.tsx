"use client";

import * as React from "react";
import {
  useFilterStore,
  ProductConditionFilter,
  ProductSortOption,
} from "@/store/useFilterStore";
import { categoryService } from "@/services/category.service";
import { locationService } from "@/services/location.service";
import { Category } from "@/types/category.types";
import { ILocationArea } from "@/types/user.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  SlidersHorizontal,
  RotateCcw,
  MapPin,
  Tag,
  Banknote,
  Sparkles,
  ArrowUpDown,
  X,
  Check,
  ChevronDown,
  Navigation,
} from "lucide-react";

interface AreaOption {
  id: string;
  name: string;
  bnName: string;
  slug: string;
}

const POPULAR_DHAKA_AREAS: AreaOption[] = [
  { id: "all", name: "All Areas", bnName: "সব এলাকা (সমগ্র ঢাকা)", slug: "all" },
  { id: "648b317c-d643-40eb-b33a-ae9eef360bff", name: "Dhanmondi", bnName: "ধানমন্ডি", slug: "dhanmondi" },
  { id: "f29b9ccb-123a-479b-a2f2-046ac12f79c9", name: "Gulshan", bnName: "গুলশান", slug: "gulshan" },
  { id: "484bd3cc-47af-4a28-85d5-7e0d58e3a6f4", name: "Banani", bnName: "বনানী", slug: "banani" },
  { id: "631b813b-96cc-4ca3-9a65-6e7babde86f0", name: "Mirpur", bnName: "মিরপুর", slug: "mirpur" },
  { id: "3fb30d5f-747f-4d3a-b399-71d27b91c0ec", name: "Uttara", bnName: "উত্তরা", slug: "uttara" },
  { id: "958dd86c-89f1-43fd-8156-f45d07218bae", name: "Mohammadpur", bnName: "মোহাম্মদপুর", slug: "mohammadpur" },
  { id: "5a8d51c7-99e2-47b5-a254-4eddd6b4e017", name: "Bashundhara R/A", bnName: "বসুন্ধরা আবাসিক এলাকা", slug: "bashundhara-ra" },
  { id: "02f91e34-1611-498a-aa93-f3402398b1c6", name: "Badda", bnName: "বাড্ডা", slug: "badda" },
  { id: "0e068acd-e156-4520-8e78-9a0dbb06d1f9", name: "Motijheel", bnName: "মতিঝিল", slug: "motijheel" },
  { id: "ea3cd1aa-4261-4175-a010-a0eb54b20c40", name: "Old Dhaka", bnName: "পুরান ঢাকা", slug: "old-dhaka" },
];

const PRICE_PRESETS = [
  { label: "ফ্রি / দান", min: 0, max: 0 },
  { label: "৫০০ এর নিচে", min: 0, max: 500 },
  { label: "১,০০০ - ৫,০০০", min: 1000, max: 5000 },
  { label: "১০,০০০+", min: 10000, max: undefined },
];

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

interface FilterContentProps {
  onCloseMobileDrawer?: () => void;
  initialCategories?: Category[];
  initialAreas?: ILocationArea[];
}

function FilterContent({
  onCloseMobileDrawer,
  initialCategories = [],
  initialAreas = [],
}: FilterContentProps) {
  const {
    selectedCategory,
    setSelectedCategory,
    selectedArea,
    selectedAreaId,
    setSelectedArea,
    setSelectedAreaId,
    minPrice,
    maxPrice,
    setMinPrice,
    setMaxPrice,
    setPriceRange,
    condition,
    setCondition,
    isNegotiable,
    setIsNegotiable,
    sortBy,
    setSortBy,
    resetFilters,
    getActiveFiltersCount,
    setIsLocationModalOpen,
  } = useFilterStore();

  const activeCount = getActiveFiltersCount();

  // Custom Price local inputs
  const [localMinPrice, setLocalMinPrice] = React.useState<string>(
    minPrice !== undefined ? String(minPrice) : ""
  );
  const [localMaxPrice, setLocalMaxPrice] = React.useState<string>(
    maxPrice !== undefined ? String(maxPrice) : ""
  );

  // Sync local price inputs when store price changes
  React.useEffect(() => {
    setLocalMinPrice(minPrice !== undefined ? String(minPrice) : "");
  }, [minPrice]);

  React.useEffect(() => {
    setLocalMaxPrice(maxPrice !== undefined ? String(maxPrice) : "");
  }, [maxPrice]);

  // Server action state for categories and areas
  const [categories, setCategories] = React.useState<Category[]>(initialCategories);
  const [areas, setAreas] = React.useState<ILocationArea[]>(initialAreas);

  React.useEffect(() => {
    if (initialCategories.length > 0) {
      setCategories(initialCategories);
    } else {
      categoryService.getCategories().then((res) => {
        if (res?.success && Array.isArray(res.data)) {
          setCategories(res.data);
        }
      });
    }

    if (initialAreas.length > 0) {
      setAreas(initialAreas);
    } else {
      locationService.getAreas().then((res) => {
        if (res?.success && Array.isArray(res.data)) {
          setAreas(res.data);
        }
      });
    }
  }, [initialCategories, initialAreas]);

  const mergedAreas: AreaOption[] = React.useMemo(() => {
    const list: AreaOption[] = [...POPULAR_DHAKA_AREAS];
    if (areas && areas.length > 0) {
      areas.forEach((apiArea) => {
        const exists = list.some(
          (a) =>
            a.id === apiArea.id ||
            a.name.toLowerCase() === apiArea.name.toLowerCase() ||
            (apiArea.bnName && a.bnName === apiArea.bnName)
        );
        if (!exists) {
          list.push({
            id: apiArea.id,
            name: apiArea.name,
            bnName: apiArea.bnName || apiArea.name,
            slug: apiArea.slug || apiArea.name.toLowerCase(),
          });
        }
      });
    }
    return list;
  }, [areas]);

  // Handle Area Selection
  const handleAreaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedVal = e.target.value;
    if (selectedVal === "all" || !selectedVal) {
      setSelectedArea("সব এলাকা, ঢাকা", undefined);
      setSelectedAreaId(undefined);
    } else {
      const found = mergedAreas.find((a) => a.id === selectedVal || a.slug === selectedVal);
      if (found) {
        setSelectedArea(`${found.bnName}, ঢাকা`, found.id !== "all" ? found.id : undefined);
      }
    }
  };

  // Determine current area select value
  const currentAreaSelectValue = React.useMemo(() => {
    if (!selectedAreaId && (selectedArea.includes("সব এলাকা") || selectedArea === "ঢাকা")) {
      return "all";
    }
    if (selectedAreaId) {
      const matched = mergedAreas.find((a) => a.id === selectedAreaId);
      if (matched) return matched.id;
    }
    const cleanName = selectedArea.split(",")[0].trim();
    const matchedByName = mergedAreas.find(
      (a) => a.bnName === cleanName || a.name.toLowerCase() === cleanName.toLowerCase()
    );
    return matchedByName ? matchedByName.id : "all";
  }, [selectedArea, selectedAreaId, mergedAreas]);

  // Apply Custom Price Range
  const handleApplyCustomPrice = (e: React.FormEvent) => {
    e.preventDefault();
    const minVal = localMinPrice.trim() !== "" ? Number(localMinPrice.trim()) : undefined;
    const maxVal = localMaxPrice.trim() !== "" ? Number(localMaxPrice.trim()) : undefined;

    setPriceRange(
      minVal !== undefined && !isNaN(minVal) ? minVal : undefined,
      maxVal !== undefined && !isNaN(maxVal) ? maxVal : undefined
    );
  };

  // Quick Preset Click
  const handlePresetClick = (min?: number, max?: number) => {
    const isCurrentPreset = minPrice === min && maxPrice === max;
    if (isCurrentPreset) {
      // Toggle off
      setPriceRange(undefined, undefined);
    } else {
      setPriceRange(min, max);
    }
  };

  // Reset all handler
  const handleReset = () => {
    resetFilters();
    setLocalMinPrice("");
    setLocalMaxPrice("");
  };

  return (
    <div className="space-y-5">
      {/* 0. FILTER HEADER */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-200">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-xl bg-orange-100 text-[#FF6F0F] flex items-center justify-center">
            <SlidersHorizontal className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-slate-900 leading-tight">
              ফিল্টার
            </h3>
            <span className="text-[11px] text-slate-500">আপনার পছন্দ সেট করুন</span>
          </div>
          {activeCount > 0 && (
            <span className="ml-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-[#FF6F0F] text-white shadow-2xs">
              {activeCount}
            </span>
          )}
        </div>

        {activeCount > 0 && (
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-[#FF6F0F] transition-colors cursor-pointer"
          >
            <RotateCcw className="h-3 w-3" />
            <span>সব রিসেট</span>
          </button>
        )}
      </div>

      {/* 1. LOCATION & AREA SECTION */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
            <MapPin className="h-3.5 w-3.5 text-[#FF6F0F]" />
            <span>এলাকা ও অবস্থান</span>
          </label>
          <button
            type="button"
            onClick={() => {
              if (onCloseMobileDrawer) onCloseMobileDrawer();
              setIsLocationModalOpen(true);
            }}
            className="text-[11px] font-semibold text-[#FF6F0F] hover:underline cursor-pointer flex items-center gap-0.5"
          >
            <Navigation className="h-3 w-3" />
            <span>ম্যাপে খুঁজুন</span>
          </button>
        </div>

        <div className="relative">
          <select
            value={currentAreaSelectValue}
            onChange={handleAreaChange}
            className="w-full h-10 px-3 pr-8 rounded-xl bg-slate-50 hover:bg-white border border-slate-200 focus:bg-white focus:border-[#FF6F0F] text-xs font-medium text-slate-800 outline-none transition-colors cursor-pointer"
          >
            {mergedAreas.map((area) => (
              <option key={area.id} value={area.id}>
                {area.bnName}
              </option>
            ))}
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
        </div>
      </div>

      {/* 2. CATEGORY SELECTOR SECTION */}
      <div className="space-y-2.5 pt-1">
        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <Tag className="h-3.5 w-3.5 text-[#FF6F0F]" />
          <span>ক্যাটাগরি</span>
        </label>

        <div className="space-y-1 max-h-48 overflow-y-auto pr-1 no-scrollbar">
          {/* All Categories Radio */}
          <button
            type="button"
            onClick={() => setSelectedCategory("সকল")}
            className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-all cursor-pointer ${
              selectedCategory === "সকল" || selectedCategory === "all" || !selectedCategory
                ? "bg-orange-50 text-[#FF6F0F] font-bold border border-orange-200/80 shadow-2xs"
                : "text-slate-700 hover:bg-slate-50 border border-transparent"
            }`}
          >
            <div className="flex items-center gap-2">
              <span className="text-xs leading-none">🔥</span>
              <span>সকল ক্যাটাগরি</span>
            </div>
            {(selectedCategory === "সকল" || selectedCategory === "all" || !selectedCategory) && (
              <Check className="h-3.5 w-3.5 text-[#FF6F0F]" />
            )}
          </button>

          {/* Dynamic Category List */}
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
                className={`w-full flex items-center justify-between p-2 rounded-xl text-left text-xs transition-all cursor-pointer ${
                  isSelected
                    ? "bg-orange-50 text-[#FF6F0F] font-bold border border-orange-200/80 shadow-2xs"
                    : "text-slate-700 hover:bg-slate-50 border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2 truncate">
                  <span className="text-xs leading-none shrink-0">{emoji}</span>
                  <span className="truncate">{cat.name}</span>
                </div>
                {isSelected && (
                  <Check className="h-3.5 w-3.5 text-[#FF6F0F] shrink-0 ml-1" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. PRICE RANGE SECTION */}
      <div className="space-y-2.5 pt-1">
        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <Banknote className="h-3.5 w-3.5 text-[#FF6F0F]" />
          <span>মূল্য পরিসীমা (Price Range)</span>
        </label>

        {/* Quick Preset Chips */}
        <div className="grid grid-cols-2 gap-1.5">
          {PRICE_PRESETS.map((preset) => {
            const isSelected = minPrice === preset.min && maxPrice === preset.max;
            return (
              <button
                key={preset.label}
                type="button"
                onClick={() => handlePresetClick(preset.min, preset.max)}
                className={`px-2.5 py-1.5 rounded-xl text-[11px] font-semibold text-center transition-all cursor-pointer border ${
                  isSelected
                    ? "bg-[#FF6F0F] text-white border-[#FF6F0F] shadow-2xs font-bold"
                    : "bg-slate-50 hover:bg-orange-50/60 text-slate-700 border-slate-200 hover:border-orange-300"
                }`}
              >
                {preset.label}
              </button>
            );
          })}
        </div>

        {/* Custom Min/Max Inputs with Apply Button */}
        <form onSubmit={handleApplyCustomPrice} className="space-y-2 pt-1">
          <div className="grid grid-cols-2 gap-2">
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">
                ৳
              </span>
              <Input
                type="number"
                min="0"
                placeholder="সর্বনিম্ন"
                value={localMinPrice}
                onChange={(e) => setLocalMinPrice(e.target.value)}
                className="pl-6 h-9 rounded-xl bg-slate-50 border-slate-200 text-xs focus:bg-white focus:border-[#FF6F0F]"
              />
            </div>
            <div className="relative">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">
                ৳
              </span>
              <Input
                type="number"
                min="0"
                placeholder="সর্বোচ্চ"
                value={localMaxPrice}
                onChange={(e) => setLocalMaxPrice(e.target.value)}
                className="pl-6 h-9 rounded-xl bg-slate-50 border-slate-200 text-xs focus:bg-white focus:border-[#FF6F0F]"
              />
            </div>
          </div>
          <Button
            type="submit"
            size="sm"
            className="w-full h-8 rounded-xl bg-[#FF6F0F] hover:bg-[#F95738] text-white text-xs font-bold shadow-2xs cursor-pointer"
          >
            প্রয়োগ করুন
          </Button>
        </form>
      </div>

      {/* 4. CONDITION & NEGOTIABLE SECTION */}
      <div className="space-y-2.5 pt-1">
        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-[#FF6F0F]" />
          <span>পণ্যের অবস্থা ও শর্ত</span>
        </label>

        {/* Condition Segmented Control */}
        <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-xl text-center">
          <button
            type="button"
            onClick={() => setCondition("ALL")}
            className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              condition === "ALL"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            সব
          </button>
          <button
            type="button"
            onClick={() => setCondition("NEW")}
            className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              condition === "NEW"
                ? "bg-white text-[#FF6F0F] shadow-2xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            নতুন (NEW)
          </button>
          <button
            type="button"
            onClick={() => setCondition("USED")}
            className={`py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              condition === "USED"
                ? "bg-white text-slate-900 shadow-2xs"
                : "text-slate-500 hover:text-slate-900"
            }`}
          >
            ব্যবহৃত (USED)
          </button>
        </div>

        {/* Negotiable Toggle Checkbox */}
        <label className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 hover:bg-orange-50/50 border border-slate-200/90 cursor-pointer transition-colors select-none">
          <div className="space-y-0.5">
            <span className="text-xs font-semibold text-slate-800 block">
              আলোচনা সাপেক্ষ পণ্য
            </span>
            <span className="text-[10px] text-slate-500">শুধুমাত্র দামাদামি করা যায় এমন বিজ্ঞাপন</span>
          </div>
          <input
            type="checkbox"
            checked={isNegotiable}
            onChange={(e) => setIsNegotiable(e.target.checked)}
            className="h-4 w-4 rounded border-slate-300 text-[#FF6F0F] focus:ring-[#FF6F0F] cursor-pointer shrink-0"
          />
        </label>
      </div>

      {/* 5. SORTING DROPDOWN SECTION */}
      <div className="space-y-2 pt-1">
        <label className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
          <ArrowUpDown className="h-3.5 w-3.5 text-[#FF6F0F]" />
          <span>সর্টিং (Sorting)</span>
        </label>

        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as ProductSortOption)}
            className="w-full h-10 px-3 pr-8 rounded-xl bg-slate-50 hover:bg-white border border-slate-200 focus:bg-white focus:border-[#FF6F0F] text-xs font-medium text-slate-800 outline-none transition-colors cursor-pointer"
          >
            <option value="newest">নতুন বিজ্ঞাপন আগে</option>
            <option value="price_asc">কম দাম আগে (Low to High)</option>
            <option value="price_desc">বেশি দাম আগে (High to Low)</option>
          </select>
          <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400 pointer-events-none" />
        </div>
      </div>
    </div>
  );
}

interface ProductFilterSidebarProps {
  initialCategories?: Category[];
  initialAreas?: ILocationArea[];
}

export function ProductFilterSidebar({
  initialCategories = [],
  initialAreas = [],
}: ProductFilterSidebarProps = {}) {
  const { isFilterDrawerOpen, setIsFilterDrawerOpen, getActiveFiltersCount } = useFilterStore();
  const activeCount = getActiveFiltersCount();

  return (
    <>
      {/* ========================================================= */}
      {/* DESKTOP STICKY SIDEBAR (Hidden on Mobile) */}
      {/* ========================================================= */}
      <aside className="hidden lg:block w-72 shrink-0">
        <div className="sticky top-20 bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm max-h-[calc(100vh-6rem)] overflow-y-auto no-scrollbar">
          <FilterContent
            initialCategories={initialCategories}
            initialAreas={initialAreas}
          />
        </div>
      </aside>

      {/* ========================================================= */}
      {/* MOBILE BOTTOM SHEET / DRAWER (Triggered on mobile) */}
      {/* ========================================================= */}
      {isFilterDrawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          {/* Backdrop */}
          <div
            onClick={() => setIsFilterDrawerOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-xs transition-opacity duration-200"
          />

          {/* Slide-Up Bottom Drawer Sheet */}
          <div className="fixed inset-x-0 bottom-0 z-50 max-h-[85vh] rounded-t-3xl bg-white shadow-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom duration-250">
            {/* Drawer Pull Handle */}
            <div className="pt-2 pb-1 flex justify-center">
              <div className="w-12 h-1.5 rounded-full bg-slate-300" />
            </div>

            {/* Drawer Header */}
            <div className="flex items-center justify-between px-5 py-2.5 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="h-4 w-4 text-[#FF6F0F]" />
                <h3 className="text-base font-bold text-slate-900">ফিল্টার সমূহ</h3>
                {activeCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-[#FF6F0F] text-white">
                    {activeCount}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setIsFilterDrawerOpen(false)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Scrollable Filter Form Body */}
            <div className="flex-1 overflow-y-auto p-5">
              <FilterContent
                onCloseMobileDrawer={() => setIsFilterDrawerOpen(false)}
                initialCategories={initialCategories}
                initialAreas={initialAreas}
              />
            </div>

            {/* Sticky Bottom Confirmation Bar */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center gap-3">
              <Button
                onClick={() => setIsFilterDrawerOpen(false)}
                className="w-full h-11 rounded-full bg-[#FF6F0F] hover:bg-[#F95738] text-white text-xs sm:text-sm font-bold shadow-md shadow-orange-500/25 cursor-pointer"
              >
                বিজ্ঞাপন দেখুন {activeCount > 0 && `(${activeCount}টি ফিল্টার সক্রিয়)`}
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default ProductFilterSidebar;
