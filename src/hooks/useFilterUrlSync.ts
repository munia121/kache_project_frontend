"use client";

import * as React from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {
  useFilterStore,
  ProductConditionFilter,
  ProductSortOption,
} from "@/store/useFilterStore";

/**
 * Bidirectional URL Synchronization Hook for Kache Product Filters.
 * Synchronizes URL query parameters with Zustand `useFilterStore`
 * so filter states are bookmarkable, shareable, and responsive to browser navigation.
 */
export function useFilterUrlSync() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const {
    searchQuery,
    selectedCategory,
    selectedArea,
    selectedAreaId,
    minPrice,
    maxPrice,
    condition,
    isNegotiable,
    sortBy,
    setSearchQuery,
    setSelectedCategory,
    setSelectedArea,
    setSelectedAreaId,
    setMinPrice,
    setMaxPrice,
    setCondition,
    setIsNegotiable,
    setSortBy,
    resetFilters,
  } = useFilterStore();

  const isInitialMount = React.useRef(true);
  const isUpdatingFromUrl = React.useRef(false);

  // 1. Initial Mount: Read URL Search Params and populate Zustand store
  React.useEffect(() => {
    isUpdatingFromUrl.current = true;

    const urlSearch = searchParams.get("search") || searchParams.get("q") || searchParams.get("searchTerm");
    if (urlSearch !== null && urlSearch !== searchQuery) {
      setSearchQuery(urlSearch);
    }

    const urlCategory = searchParams.get("category") || searchParams.get("categoryId");
    if (urlCategory !== null && urlCategory !== selectedCategory) {
      setSelectedCategory(urlCategory);
    }

    const urlArea = searchParams.get("area");
    const urlAreaId = searchParams.get("areaId");
    if (urlArea !== null && urlArea !== selectedArea) {
      setSelectedArea(urlArea, urlAreaId || undefined);
    } else if (urlAreaId !== null && urlAreaId !== selectedAreaId) {
      setSelectedAreaId(urlAreaId);
    }

    const urlMinPrice = searchParams.get("minPrice");
    if (urlMinPrice !== null) {
      setMinPrice(urlMinPrice);
    }

    const urlMaxPrice = searchParams.get("maxPrice");
    if (urlMaxPrice !== null) {
      setMaxPrice(urlMaxPrice);
    }

    const urlCondition = searchParams.get("condition") as ProductConditionFilter | null;
    if (urlCondition && ["ALL", "NEW", "USED"].includes(urlCondition)) {
      setCondition(urlCondition);
    }

    const urlNegotiable = searchParams.get("isNegotiable");
    if (urlNegotiable !== null) {
      setIsNegotiable(urlNegotiable === "true");
    }

    const urlSort = (searchParams.get("sort") || searchParams.get("sortBy")) as ProductSortOption | null;
    if (urlSort && ["newest", "price_asc", "price_desc"].includes(urlSort)) {
      setSortBy(urlSort);
    }

    // Small timeout to release the URL sync lock
    const timer = setTimeout(() => {
      isUpdatingFromUrl.current = false;
      isInitialMount.current = false;
    }, 50);

    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  // 2. React to Store Changes: Serialize active filters into URL search parameters
  React.useEffect(() => {
    if (isInitialMount.current || isUpdatingFromUrl.current) {
      return;
    }

    const params = new URLSearchParams();

    if (searchQuery.trim()) {
      params.set("search", searchQuery.trim());
    }

    if (selectedCategory && selectedCategory !== "সকল" && selectedCategory !== "all") {
      params.set("category", selectedCategory);
    }

    if (selectedAreaId) {
      params.set("areaId", selectedAreaId);
    }

    if (
      selectedArea &&
      !selectedArea.includes("সব এলাকা") &&
      !selectedArea.includes("সমগ্র") &&
      selectedArea !== "ঢাকা"
    ) {
      params.set("area", selectedArea);
    }

    if (minPrice !== undefined && minPrice !== "") {
      params.set("minPrice", String(minPrice));
    }

    if (maxPrice !== undefined && maxPrice !== "") {
      params.set("maxPrice", String(maxPrice));
    }

    if (condition && condition !== "ALL") {
      params.set("condition", condition);
    }

    if (isNegotiable) {
      params.set("isNegotiable", "true");
    }

    if (sortBy && sortBy !== "newest") {
      params.set("sort", sortBy);
    }

    const newQueryString = params.toString();
    const currentQueryString = searchParams.toString();

    // Only update route if the query actually changed
    if (newQueryString !== currentQueryString) {
      const targetPath = newQueryString ? `${pathname}?${newQueryString}` : pathname;
      router.replace(targetPath, { scroll: false });
    }
  }, [
    searchQuery,
    selectedCategory,
    selectedArea,
    selectedAreaId,
    minPrice,
    maxPrice,
    condition,
    isNegotiable,
    sortBy,
    pathname,
    router,
    searchParams,
  ]);

  const handleClearAll = React.useCallback(() => {
    resetFilters();
    router.replace(pathname, { scroll: false });
  }, [resetFilters, router, pathname]);

  return {
    handleClearAll,
  };
}
