import { create } from "zustand";

interface FilterState {
  searchQuery: string;
  selectedCategory: string;
  selectedArea: string;
  isLocationModalOpen: boolean;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  setSelectedArea: (area: string) => void;
  setIsLocationModalOpen: (isOpen: boolean) => void;
  resetFilters: () => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  searchQuery: "",
  selectedCategory: "সকল",
  selectedArea: "ধানমন্ডি, ঢাকা",
  isLocationModalOpen: false,
  setSearchQuery: (searchQuery) => set({ searchQuery }),
  setSelectedCategory: (selectedCategory) => set({ selectedCategory }),
  setSelectedArea: (selectedArea) => set({ selectedArea }),
  setIsLocationModalOpen: (isLocationModalOpen) => set({ isLocationModalOpen }),
  resetFilters: () =>
    set({
      searchQuery: "",
      selectedCategory: "সকল",
      selectedArea: "ধানমন্ডি, ঢাকা",
    }),
}));
