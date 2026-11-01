"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { productService } from "@/services/product.service";
import { IProduct } from "@/types/product.types";
import { ProductCard } from "@/components/modules/products/ProductCard";
import { ProductGridSkeleton } from "@/components/modules/products/ProductGridSkeleton";
import { toast } from "sonner";
import {
  Heart,
  Search,
  ChevronRight,
  AlertCircle,
  RefreshCw,
  Loader2,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function FavoritesPage() {
  const router = useRouter();
  const { user, isAuthenticated, hasHydrated, openAuthModal } = useAuthStore();
  const [isMounted, setIsMounted] = React.useState(false);

  const [favorites, setFavorites] = React.useState<IProduct[]>([]);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isError, setIsError] = React.useState(false);
  const [totalCount, setTotalCount] = React.useState(0);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auth Guard: Only trigger after client hydration is complete
  React.useEffect(() => {
    if (isMounted && hasHydrated) {
      if (!isAuthenticated) {
        toast.info("পছন্দের তালিকা দেখতে প্রথমে লগইন করুন");
        openAuthModal("login");
        router.push("/");
      }
    }
  }, [isMounted, hasHydrated, isAuthenticated, openAuthModal, router]);

  // Fetch favorite products
  const fetchFavorites = React.useCallback(async () => {
    if (!isAuthenticated) return;

    setIsLoading(true);
    setIsError(false);

    try {
      const res = await productService.getMyFavorites({ page: 1, limit: 50 });
      if (res?.success && Array.isArray(res.data)) {
        // Tag every item with isFavorited = true
        const items = res.data.map((item) => ({
          ...item,
          isFavorited: true,
          isFavorite: true,
        }));
        setFavorites(items);
        setTotalCount(res.meta?.total ?? items.length);
      } else {
        setIsError(true);
      }
    } catch (error) {
      console.error("Failed to load favorites:", error);
      setIsError(true);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  React.useEffect(() => {
    if (isMounted && hasHydrated && isAuthenticated) {
      fetchFavorites();
    }
  }, [isMounted, hasHydrated, isAuthenticated, fetchFavorites]);

  // Handle live removal when heart is un-toggled in this page
  const handleFavoriteToggle = React.useCallback(
    (productId: string, isFavorited: boolean) => {
      if (!isFavorited) {
        setFavorites((prev) => prev.filter((p) => p.id !== productId));
        setTotalCount((prev) => Math.max(0, prev - 1));
      }
    },
    []
  );

  // Show spinner while hydrating auth state
  if (!isMounted || !hasHydrated) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
        <Loader2 className="h-8 w-8 text-[#FF6F0F] animate-spin" />
        <p className="mt-3 text-sm text-slate-500 font-medium">লোড হচ্ছে...</p>
      </div>
    );
  }

  // If unauthenticated, guard will redirect to home
  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-4 sm:mb-6">
          <Link href="/" className="hover:text-[#FF6F0F] transition-colors">
            হোম
          </Link>
          <ChevronRight className="h-3.5 w-3.5 text-slate-400" />
          <span className="text-slate-800 font-semibold">আমার পছন্দ</span>
        </nav>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 gap-4 border-b border-slate-200/80 mb-6 sm:mb-8">
          <div>
            <div className="flex items-center gap-2.5 flex-wrap">
              <div className="h-9 w-9 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center shadow-2xs">
                <Heart className="h-5 w-5 fill-rose-500" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                আমার পছন্দসমূহ
              </h1>
              {!isLoading && (
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-50 text-rose-600 border border-rose-200/80">
                  {favorites.length} টি পণ্য
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm text-slate-500 mt-1.5">
              আপনার বুকমার্ক বা পছন্দের তালিকায় সংরক্ষিত সকল বিজ্ঞাপনের তালিকা
            </p>
          </div>

          <div className="flex items-center gap-2 self-start sm:self-auto">
            <Link
              href="/products"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-slate-100 hover:bg-slate-200/80 text-slate-700 text-xs font-bold transition-all cursor-pointer"
            >
              <Search className="h-3.5 w-3.5 text-[#FF6F0F]" />
              <span>আরও পণ্য খুঁজুন</span>
            </Link>
          </div>
        </div>

        {/* Content Section */}
        {isLoading ? (
          <div className="space-y-4">
            <ProductGridSkeleton count={10} />
          </div>
        ) : isError ? (
          /* Error State */
          <div className="flex flex-col items-center justify-center p-12 text-center rounded-3xl bg-white border border-rose-100 shadow-2xs my-6 space-y-3">
            <div className="h-12 w-12 rounded-full bg-rose-50 flex items-center justify-center text-rose-500">
              <AlertCircle className="h-6 w-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              পছন্দের পণ্যসমূহ লোড করা যায়নি
            </h3>
            <p className="text-xs text-slate-500 max-w-sm">
              ইন্টারনেট সংযোগ বা সার্ভার সমস্যার কারণে পছন্দের তালিকা প্রদর্শন করা সম্ভব হচ্ছে না।
            </p>
            <Button
              size="sm"
              onClick={() => fetchFavorites()}
              className="text-xs rounded-full bg-[#FF6F0F] hover:bg-[#F95738] text-white cursor-pointer mt-2 gap-1.5"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              <span>পুনরায় চেষ্টা করুন</span>
            </Button>
          </div>
        ) : favorites.length === 0 ? (
          /* Clean Empty State */
          <div className="bg-white rounded-3xl p-10 sm:p-16 border border-slate-200/80 text-center shadow-xs flex flex-col items-center justify-center my-6">
            <div className="h-20 w-20 rounded-3xl bg-rose-50 text-rose-500 flex items-center justify-center mb-5 shadow-inner">
              <Heart className="h-10 w-10 stroke-[1.75]" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              কোনো পছন্দের পণ্য যোগ করা হয়নি
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-2 mb-8 leading-relaxed">
              আপনার ভালো লাগা যেকোনো পণ্যের হার্ট (পছন্দ) আইকনে ক্লিক করে সংরক্ষণ করুন, যাতে পরে সহজেই তা খুঁজে পেতে ও কিনতে পারেন।
            </p>
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#FF6F0F] hover:bg-[#F95738] text-white text-xs sm:text-sm font-bold shadow-md shadow-orange-500/25 transition-all active:scale-95 cursor-pointer"
            >
              <Search className="h-4 w-4" />
              <span>পণ্য খুঁজুন</span>
            </Link>
          </div>
        ) : (
          /* Products Grid */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
            {favorites.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onFavoriteToggle={handleFavoriteToggle}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
