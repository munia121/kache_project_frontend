/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useFilterStore } from "@/store/useFilterStore";
import { useAuthStore } from "@/store/useAuthStore";
import { authService } from "@/services/auth.service";
import {
  Search,
  MapPin,
  ChevronDown,
  Plus,
  User as UserIcon,
  X,
  ShoppingBag,
  LogOut,
  Store,
  Package,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AuthModal } from "@/components/modules/auth/AuthModal";
import { toast } from "sonner";

export function Navbar() {
  const router = useRouter();
  const [isMounted, setIsMounted] = React.useState(false);

  const {
    searchQuery,
    setSearchQuery,
    selectedArea,
    setIsLocationModalOpen,
  } = useFilterStore();

  const [searchInput, setSearchInput] = React.useState(searchQuery);

  // Sync search input if searchQuery changes from outside (e.g. filter reset)
  React.useEffect(() => {
    setSearchInput(searchQuery);
  }, [searchQuery]);

  // 300ms debounce before setting the search query in filter store
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== searchQuery) {
        setSearchQuery(searchInput);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [searchInput, searchQuery, setSearchQuery]);

  const handleSearchSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = searchInput.trim();
    setSearchQuery(trimmed);
    if (typeof window !== "undefined" && window.location.pathname !== "/" && window.location.pathname !== "/products") {
      router.push("/");
    }
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearchQuery("");
  };

  const {
    user,
    isAuthenticated,
    hasHydrated,
    openAuthModal,
    logout,
  } = useAuthStore();

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Extract primary neighborhood name (e.g. "ধানমন্ডি" from "ধানমন্ডি, ঢাকা")
  const areaLabel = (selectedArea || "ঢাকা").split(",")[0].trim();

  // Compute initials for avatar fallback safely
  const userInitials = React.useMemo(() => {
    if (!user?.fullName || !user.fullName.trim()) return "U";
    const parts = user.fullName.trim().split(/\s+/).filter(Boolean);
    if (parts.length > 1) {
      const first = parts[0]?.[0] || "";
      const last = parts[parts.length - 1]?.[0] || "";
      return (first + last).toUpperCase() || "U";
    }
    return user.fullName.trim().slice(0, 2).toUpperCase() || "U";
  }, [user]);

  // Logout functionality:
  // 1. Clear tokens from localStorage
  // 2. Reset Zustand auth store
  // 3. Show Sonner success toast
  // 4. Redirect to home (/)
  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("kache_access_token");
    }
    logout();
    authService.logout();
    toast.success("সফলভাবে লগআউট হয়েছে");
    router.push("/");
  };

  const handlePostAdClick = () => {
    if (!isAuthenticated) {
      toast.info("বিজ্ঞাপন দিতে প্রথমে লগইন বা রেজিস্টার করুন");
      openAuthModal("login");
    }
  };

  // Safe first name extraction
  const userFirstName = React.useMemo(() => {
    if (!user?.fullName || !user.fullName.trim()) return "প্রোফাইল";
    return user.fullName.trim().split(/\s+/)[0];
  }, [user]);

  return (
    <>
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-slate-200/80 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 gap-2 sm:gap-4">
            {/* Brand Logo & Neighborhood Selector */}
            <div className="flex items-center gap-2 sm:gap-4 shrink-0">
              <Link
                href="/"
                className="flex items-center gap-2 group transition-transform active:scale-95"
              >
                {/* Karrot-inspired Brand Icon */}
                <div className="h-10 w-10 rounded-2xl bg-gradient-to-br from-[#FF6F0F] to-[#F95738] flex items-center justify-center text-white shadow-sm shadow-orange-500/25 group-hover:scale-105 transition-transform duration-200">
                  <ShoppingBag className="h-5 w-5 stroke-[2.2]" />
                </div>
                <div className="flex flex-col">
                  <span className="text-2xl font-black tracking-tight text-slate-900 group-hover:text-[#FF6F0F] transition-colors leading-none">
                    কাছে
                  </span>
                  <span className="text-[10px] font-semibold text-[#FF6F0F] tracking-wide uppercase">
                    KACHE • লোকাল
                  </span>
                </div>
              </Link>

              {/* Active Location Badge (Desktop & Tablet) */}
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(true)}
                className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50/70 hover:bg-orange-100/80 text-slate-800 border border-orange-200/60 transition-all text-xs font-medium cursor-pointer"
              >
                <MapPin className="h-3.5 w-3.5 text-[#FF6F0F] shrink-0" />
                <span className="max-w-[120px] truncate">{areaLabel}</span>
                <ChevronDown className="h-3 w-3 text-slate-400" />
              </button>
            </div>

            {/* Desktop Search Bar */}
            <div className="hidden md:flex flex-1 max-w-lg mx-2">
              <form onSubmit={handleSearchSubmit} className="relative w-full">
                <button
                  type="submit"
                  aria-label="Search"
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#FF6F0F] transition-colors cursor-pointer"
                >
                  <Search className="h-4 w-4" />
                </button>
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder={`${areaLabel} ও আশেপাশে যেকোনো পণ্য খুঁজুন...`}
                  className="w-full pl-10 pr-9 py-2 text-sm bg-slate-100 hover:bg-slate-200/70 focus:bg-white border border-transparent focus:border-orange-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-slate-800 placeholder-slate-400 transition-all"
                />
                {searchInput && (
                  <button
                    type="button"
                    onClick={handleClearSearch}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-200 text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </form>
            </div>

            {/* Right Navigation Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Mobile Location Badge button */}
              <button
                type="button"
                onClick={() => setIsLocationModalOpen(true)}
                className="sm:hidden inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-orange-50 text-slate-800 border border-orange-200 text-xs font-medium cursor-pointer"
              >
                <MapPin className="h-3 w-3 text-[#FF6F0F]" />
                <span className="max-w-[70px] truncate">{areaLabel}</span>
                <ChevronDown className="h-2.5 w-2.5 text-slate-400" />
              </button>

              {/* Dynamic Auth State */}
              {isMounted && hasHydrated && isAuthenticated && user ? (
                <>
                  {/* If user is USER role: show "বিক্রেতা হন" banner/link */}
                  {user.role === "USER" && (
                    <Link
                      href="/become-seller"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-orange-50 hover:bg-orange-100/90 text-[#FF6F0F] border border-orange-200/80 text-xs font-bold transition-all shadow-2xs hover:shadow-xs"
                    >
                      <Store className="h-3.5 w-3.5 text-[#FF6F0F]" />
                      <span className="hidden xs:inline">বিক্রেতা হন</span>
                      <span className="xs:hidden">বিক্রেতা</span>
                    </Link>
                  )}

                  {/* Authenticated User Avatar Dropdown */}
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      data-slot="dropdown-menu-trigger"
                      className="flex items-center gap-2 p-1 pl-1.5 pr-2 rounded-full hover:bg-slate-100/80 border border-slate-200 transition-all cursor-pointer focus:outline-none focus:ring-2 focus:ring-orange-500/20"
                    >
                      <Avatar size="sm" className="ring-2 ring-orange-500/30">
                        {user.avatar && (
                          <AvatarImage src={user.avatar} alt={user.fullName || "User"} />
                        )}
                        <AvatarFallback className="bg-gradient-to-br from-[#FF6F0F] to-[#F95738] text-white font-bold text-xs">
                          {userInitials}
                        </AvatarFallback>
                      </Avatar>
                      <span className="hidden sm:inline-block max-w-[90px] truncate text-xs font-bold text-slate-800">
                        {userFirstName}
                      </span>
                      <ChevronDown className="h-3 w-3 text-slate-400" />
                    </DropdownMenuTrigger>

                    <DropdownMenuContent
                      align="end"
                      sideOffset={8}
                      className="w-60 p-2 rounded-2xl bg-white shadow-xl border border-slate-200/90 z-50"
                    >
                      {/* Dropdown Header: Full Name, Phone/Email, Subtle Role Badge */}
                      <DropdownMenuGroup>
                        <DropdownMenuLabel className="p-2.5">
                          <div className="flex flex-col space-y-1">
                            <div className="flex items-center justify-between gap-1.5">
                              <p className="text-sm font-bold text-slate-900 leading-none truncate">
                                {user.fullName || "ইউজার"}
                              </p>
                              <span
                                className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 border ${
                                  user.role === "SELLER"
                                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                    : user.role === "ADMIN" || user.role === "SUPER_ADMIN"
                                    ? "bg-purple-50 text-purple-700 border-purple-200"
                                    : "bg-orange-50 text-[#FF6F0F] border-orange-200"
                                }`}
                              >
                                {user.role}
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 leading-none truncate pt-0.5">
                              {user.phone || user.email}
                            </p>
                          </div>
                        </DropdownMenuLabel>
                      </DropdownMenuGroup>

                      <DropdownMenuSeparator className="my-1 bg-slate-100" />

                      <DropdownMenuGroup>
                        {/* "আমার প্রোফাইল" (/profile) with User icon */}
                        <DropdownMenuItem
                          onClick={() => router.push("/profile")}
                          className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-[#FF6F0F] hover:bg-orange-50/70 transition-colors cursor-pointer"
                        >
                          <UserIcon className="h-4 w-4 text-slate-400" />
                          <span>আমার প্রোফাইল</span>
                        </DropdownMenuItem>

                        {/* "আমার বিজ্ঞাপন" (/my-listings) with Package icon */}
                        <DropdownMenuItem
                          onClick={() => router.push("/my-listings")}
                          className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-[#FF6F0F] hover:bg-orange-50/70 transition-colors cursor-pointer"
                        >
                          <Package className="h-4 w-4 text-slate-400" />
                          <span>আমার বিজ্ঞাপন</span>
                        </DropdownMenuItem>

                        {/* If user.role === 'USER': "বিক্রেতা হন" (/become-seller) with Store icon */}
                        {user.role === "USER" && (
                          <DropdownMenuItem
                            onClick={() => router.push("/become-seller")}
                            className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-emerald-700 bg-emerald-50/60 hover:bg-emerald-100/70 transition-colors cursor-pointer"
                          >
                            <Store className="h-4 w-4 text-emerald-600" />
                            <span>বিক্রেতা হন</span>
                          </DropdownMenuItem>
                        )}
                      </DropdownMenuGroup>

                      <DropdownMenuSeparator className="my-1 bg-slate-100" />

                      <DropdownMenuGroup>
                        {/* "লগআউট" (Logout) with LogOut icon styled in destructive/red color */}
                        <DropdownMenuItem
                          onClick={handleLogout}
                          className="flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 hover:text-rose-700 focus:bg-rose-50 focus:text-rose-700 transition-colors cursor-pointer"
                        >
                          <LogOut className="h-4 w-4 text-rose-500" />
                          <span>লগআউট</span>
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </>
              ) : (
                /* Unauthenticated Login Button */
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => openAuthModal("login")}
                  className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-[#FF6F0F] hover:bg-orange-50/50 rounded-full px-3 h-9 cursor-pointer"
                >
                  <UserIcon className="h-4 w-4 mr-1 sm:mr-1.5" />
                  <span>লগইন</span>
                </Button>
              )}

              {/* Prominent Orange "বিজ্ঞাপন দিন" Button */}
              {isMounted && hasHydrated && isAuthenticated && user?.role === "SELLER" ? (
                <Link
                  href="/post-ad"
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full bg-[#FF6F0F] hover:bg-[#F95738] active:scale-95 text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow-md shadow-orange-500/30 transition-all duration-200 cursor-pointer"
                >
                  <Plus className="h-4 w-4 stroke-[3]" />
                  <span>বিজ্ঞাপন দিন</span>
                </Link>
              ) : isMounted && hasHydrated && isAuthenticated && user?.role === "USER" ? (
                <Link
                  href="/post-ad"
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full bg-[#FF6F0F] hover:bg-[#F95738] active:scale-95 text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow-md shadow-orange-500/30 transition-all duration-200 cursor-pointer"
                >
                  <Plus className="h-4 w-4 stroke-[3]" />
                  <span>বিজ্ঞাপন দিন</span>
                </Link>
              ) : (
                <button
                  type="button"
                  onClick={handlePostAdClick}
                  className="inline-flex items-center justify-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full bg-[#FF6F0F] hover:bg-[#F95738] active:scale-95 text-white font-bold text-xs sm:text-sm shadow-sm hover:shadow-md shadow-orange-500/30 transition-all duration-200 cursor-pointer"
                >
                  <Plus className="h-4 w-4 stroke-[3]" />
                  <span>বিজ্ঞাপন দিন</span>
                </button>
              )}
            </div>
          </div>

          {/* Mobile Search Bar Row */}
          <div className="md:hidden pb-3 pt-1">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <button
                type="submit"
                aria-label="Search"
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-[#FF6F0F] transition-colors cursor-pointer"
              >
                <Search className="h-4 w-4" />
              </button>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder={`${areaLabel} ও আশেপাশে পণ্য খুঁজুন...`}
                className="w-full pl-10 pr-9 py-2 text-xs bg-slate-100 focus:bg-white border border-transparent focus:border-orange-300 rounded-full focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-slate-800 placeholder-slate-400"
              />
              {searchInput && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-0.5 rounded-full hover:bg-slate-200 text-slate-400 cursor-pointer"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </form>
          </div>
        </div>
      </header>

      {/* Global Auth Modal */}
      <AuthModal />
    </>
  );
}
