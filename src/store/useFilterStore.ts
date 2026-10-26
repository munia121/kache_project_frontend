import { create } from "zustand";

export type ProductConditionFilter = "ALL" | "NEW" | "USED";
export type ProductSortOption = "newest" | "price_asc" | "price_desc";

export interface FilterState {
  searchQuery: string;
  selectedCategory: string;
  selectedArea: string;
  selectedAreaId?: string;
  minPrice?: number | string;
  maxPrice?: number | string;
  condition: ProductConditionFilter;
  isNegotiable: boolean;
  sortBy: ProductSortOption;
  isLocationModalOpen: boolean;
  isFilterDrawerOpen: boolean;

  // Actions
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  setSelectedArea: (area: string, areaId?: string) => void;
  setSelectedAreaId: (areaId?: string) => void;
  setMinPrice: (min?: number | string) => void;
  setMaxPrice: (max?: number | string) => void;
  setPriceRange: (min?: number | string, max?: number | string) => void;
  setCondition: (condition: ProductConditionFilter) => void;
  setIsNegotiable: (negotiable: boolean) => void;
  setSortBy: (sort: ProductSortOption) => void;
  setIsLocationModalOpen: (isOpen: boolean) => void;
  setIsFilterDrawerOpen: (isOpen: boolean) => void;
  resetFilters: () => void;
  getActiveFiltersCount: () => number;
}

export const useFilterStore = create<FilterState>((set, get) => ({
  searchQuery: "",
  selectedCategory: "সকল",
  selectedArea: "সব এলাকা, ঢাকা",
  selectedAreaId: undefined,
  minPrice: undefined,
  maxPrice: undefined,
  condition: "ALL",
  isNegotiable: false,
  sortBy: "newest",
  isLocationModalOpen: false,
  isFilterDrawerOpen: false,

  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setSelectedArea: (selectedArea, selectedAreaId) =>
    set({
      selectedArea,
      selectedAreaId: selectedAreaId !== undefined ? selectedAreaId : get().selectedAreaId,
    }),
  setSelectedAreaId: (selectedAreaId) => set({ selectedAreaId }),
  setMinPrice: (minPrice) => set({ minPrice }),
  setMaxPrice: (maxPrice) => set({ maxPrice }),
  setPriceRange: (minPrice, maxPrice) => set({ minPrice, maxPrice }),
  setCondition: (condition) => set({ condition }),
  setIsNegotiable: (isNegotiable) => set({ isNegotiable }),
  setSortBy: (sortBy) => set({ sortBy }),
  setIsLocationModalOpen: (isLocationModalOpen) => set({ isLocationModalOpen }),
  setIsFilterDrawerOpen: (isFilterDrawerOpen) => set({ isFilterDrawerOpen }),

  resetFilters: () =>
    set({
      searchQuery: "",
      selectedCategory: "সকল",
      selectedArea: "সব এলাকা, ঢাকা",
      selectedAreaId: undefined,
      minPrice: undefined,
      maxPrice: undefined,
      condition: "ALL",
      isNegotiable: false,
      sortBy: "newest",
    }),

  getActiveFiltersCount: () => {
    const state = get();
    let count = 0;
    if (state.selectedCategory && state.selectedCategory !== "সকল" && state.selectedCategory !== "all") {
      count++;
    }
    if (
      (state.selectedArea &&
        !state.selectedArea.includes("সব এলাকা") &&
        !state.selectedArea.includes("সমগ্র") &&
        state.selectedArea !== "ঢাকা") ||
      state.selectedAreaId
    ) {
      count++;
    }
    if (
      (state.minPrice !== undefined && state.minPrice !== "") ||
      (state.maxPrice !== undefined && state.maxPrice !== "")
    ) {
      count++;
    }
    if (state.condition && state.condition !== "ALL") {
      count++;
    }
    if (state.isNegotiable) {
      count++;
    }
    if (state.sortBy && state.sortBy !== "newest") {
      count++;
    }
    return count;
  },
}));
