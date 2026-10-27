"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { productService } from "@/services/product.service";
import { IProduct } from "@/types/product.types";
import { useAuthStore } from "@/store/useAuthStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  MapPin,
  Calendar,
  Eye,
  Store,
  Phone,
  MessageCircle,
  ShieldCheck,
  ChevronLeft,
  Share2,
  Heart,
  Copy,
  Check,
  AlertTriangle,
  Loader2,
  Sparkles,
} from "lucide-react";

interface ProductDetailsPageProps {
  params: Promise<{ slug: string }>;
}

function formatBengaliDate(dateString?: string): string {
  if (!dateString) return "সাম্প্রতিক";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "সাম্প্রতিক";
    return d.toLocaleDateString("bn-BD", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "সাম্প্রতিক";
  }
}

function formatRelativeTime(dateString?: string): string {
  if (!dateString) return "আজ";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "আজ";
    const now = new Date();
    const diffSecs = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffSecs < 60) return "এইমাত্র";
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins} মিনিট আগে`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} ঘণ্টা আগে`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} দিন আগে`;
    return formatBengaliDate(dateString);
  } catch {
    return "আজ";
  }
}

function ProductDetailsContent({ params }: ProductDetailsPageProps) {
  const { slug } = React.use(params);
  const { user } = useAuthStore();

  const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);
  const [showPhoneNumber, setShowPhoneNumber] = React.useState(false);
  const [isCopiedPhone, setIsCopiedPhone] = React.useState(false);
  const [isLiked, setIsLiked] = React.useState(false);

  // Fetch product details via server action
  const [product, setProduct] = React.useState<IProduct | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isError, setIsError] = React.useState(false);

  React.useEffect(() => {
    if (!slug) return;
    let isMounted = true;
    setIsLoading(true);
    setIsError(false);

    productService
      .getProductBySlug(slug)
      .then((res) => {
        if (isMounted) {
          if (res?.success && res.data) {
            setProduct(res.data);
          } else {
            setIsError(true);
          }
        }
      })
      .catch(() => {
        if (isMounted) setIsError(true);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  const handleCopyPhone = () => {
    if (product?.seller?.phone) {
      navigator.clipboard.writeText(product.seller.phone);
      setIsCopiedPhone(true);
      toast.success("ফোন নম্বর কপি করা হয়েছে");
      setTimeout(() => setIsCopiedPhone(false), 2000);
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("বিজ্ঞাপনের লিংক কপি করা হয়েছে");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
          <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
          <span>/</span>
          <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-4">
            <div className="aspect-4/3 w-full bg-slate-200 rounded-3xl animate-pulse" />
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 w-16 bg-slate-200 rounded-2xl animate-pulse" />
              ))}
            </div>
          </div>
          <div className="lg:col-span-5 space-y-4">
            <div className="h-8 bg-slate-200 rounded-xl w-3/4 animate-pulse" />
            <div className="h-10 bg-slate-200 rounded-xl w-1/2 animate-pulse" />
            <div className="h-28 bg-slate-200 rounded-3xl animate-pulse" />
            <div className="h-40 bg-slate-200 rounded-3xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <div className="h-16 w-16 rounded-full bg-orange-100 text-[#FF6F0F] flex items-center justify-center mb-4">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">বিজ্ঞাপনটি পাওয়া যায়নি</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 mb-6 leading-relaxed">
          বিজ্ঞাপনটি হয়তো মুছে ফেলা হয়েছে বা লিংকটি ভুল। অনুগ্রহ করে কাছে হোমপেজে ফিরে গিয়ে অনুসন্ধান করুন।
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#FF6F0F] hover:bg-[#F95738] text-white font-bold text-xs sm:text-sm shadow-md"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>হোমপেজে ফিরুন</span>
        </Link>
      </div>
    );
  }

  const images = product.images && product.images.length > 0 ? product.images : [
    product.imageUrl || "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80"
  ];

  const currentImage = images[selectedImageIndex] || images[0];

  // Full location path
  const areaObj = typeof product.area === "object" && product.area !== null ? product.area : null;
  const areaName =
    areaObj?.bnName ||
    areaObj?.name ||
    (typeof product.area === "string" ? product.area : product.location || "ঢাকা");
  const districtName = areaObj?.district?.bnName || areaObj?.district?.name;
  const divisionName = areaObj?.district?.division?.bnName || areaObj?.district?.division?.name;

  const fullLocation = [areaName, districtName, divisionName].filter(Boolean).join(", ");

  const categoryObj = typeof product.category === "object" && product.category !== null ? product.category : null;
  const categoryName = categoryObj?.name || (typeof product.category === "string" ? product.category : "সাধারণ");
  const categorySlug = categoryObj?.slug || (typeof product.category === "string" ? product.category : "");

  // Formatted price
  const formattedPrice = `৳ ${Number(product.price).toLocaleString("en-IN")}`;

  // Seller initials
  const sellerName = product.seller?.fullName || "বিক্রেতা";
  const sellerInitials = sellerName
    .split(/\s+/)
    .slice(0, 2)
    .map((s) => s[0])
    .join("")
    .toUpperCase() || "S";

  const conditionLabel =
    product.condition === "NEW"
      ? "নতুন (New)"
      : product.condition === "REFURBISHED"
      ? "রিফার্বিশড (Refurbished)"
      : "ব্যবহৃত (Used)";

  const isOwner = user?.id === product.sellerId;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200/60 text-xs text-slate-500">
        <div className="flex items-center gap-1.5 truncate">
          <Link href="/" className="hover:text-[#FF6F0F] transition-colors flex items-center gap-1">
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>হোম</span>
          </Link>
          <span>/</span>
          {categorySlug && (
            <>
              <Link href={`/?category=${categorySlug}`} className="hover:text-[#FF6F0F] truncate">
                {categoryName}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-slate-800 font-semibold truncate max-w-[200px] sm:max-w-xs">
            {product.title}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="h-8 px-3 rounded-full text-xs font-semibold border-slate-200 hover:border-orange-300 gap-1.5 cursor-pointer text-slate-700"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">শেয়ার করুন</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsLiked(!isLiked)}
            className={`h-8 px-3 rounded-full text-xs font-semibold border-slate-200 gap-1.5 cursor-pointer ${
              isLiked ? "text-rose-500 border-rose-200 bg-rose-50" : "text-slate-700 hover:border-orange-300"
            }`}
          >
            <Heart className={`h-3.5 w-3.5 ${isLiked ? "fill-rose-500 stroke-rose-500" : ""}`} />
            <span className="hidden sm:inline">{isLiked ? "সংরক্ষিত" : "পছন্দ"}</span>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ========================================================= */}
        {/* LEFT COLUMN: IMAGE GALLERY (7 Cols) */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Large Image Display */}
          <div className="relative aspect-4/3 sm:aspect-16/10 w-full overflow-hidden rounded-3xl bg-slate-900 border border-slate-200 shadow-sm group">
            <Image
              src={currentImage}
              alt={product.title}
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-contain sm:object-cover scale-100 transition-all duration-300"
              priority
            />

            {/* Condition Badge */}
            <div className="absolute top-3 left-3 z-10">
              <span className="inline-block px-3 py-1 text-xs font-bold bg-black/60 backdrop-blur-md text-white rounded-full">
                {conditionLabel}
              </span>
            </div>

            {/* Image Counter */}
            {images.length > 1 && (
              <div className="absolute bottom-3 right-3 z-10">
                <span className="px-2.5 py-1 text-xs font-bold bg-black/60 backdrop-blur-md text-white rounded-full">
                  {selectedImageIndex + 1} / {images.length}
                </span>
              </div>
            )}
          </div>

          {/* Thumbnails Row */}
          {images.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
              {images.map((img, index) => {
                const isActive = selectedImageIndex === index;
                return (
                  <button
                    key={img + index}
                    type="button"
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative h-18 w-18 sm:h-20 sm:w-20 rounded-2xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      isActive
                        ? "border-[#FF6F0F] ring-2 ring-orange-500/30 scale-105"
                        : "border-slate-200 hover:border-orange-300 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                );
              })}
            </div>
          )}

          {/* Detailed Description Block */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4 mt-6">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              পণ্যের বিবরণ (Description)
            </h3>

            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line font-normal">
              {product.description}
            </div>

            {/* Specs Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 block">ক্যাটাগরি</span>
                <span className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5 block truncate">
                  {categoryName}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 block">অবস্থা</span>
                <span className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5 block">
                  {conditionLabel}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 block">বিজ্ঞাপন আইডি</span>
                <span className="text-xs sm:text-sm font-mono font-bold text-slate-800 mt-0.5 block">
                  #{product.id.slice(0, 8)}
                </span>
              </div>
            </div>
          </div>

          {/* Safety Tips Card */}
          <div className="p-5 rounded-3xl bg-amber-50/70 border border-amber-200/80 space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs sm:text-sm">
              <ShieldCheck className="h-4 w-4 text-amber-600" />
              <span>কাছে নিরাপদ কেনাবেচার পরামর্শ</span>
            </div>
            <ul className="text-xs text-amber-800/90 space-y-1 list-disc list-inside">
              <li>পণ্য সরাসরি সামনাসামনি দেখে মূল্য পরিশোধ করুন।</li>
              <li>কোনো অবস্থাতেই বিকাশে বা অন্য মাধ্যমে অগ্রিম টাকা পাঠাবেন না।</li>
              <li>দিনের আলোতে এবং জনবহুল নিরাপদ স্থানে দেখা করুন।</li>
            </ul>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: PRICING & SELLER PROFILE (5 Cols) */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Price & Title Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-4">
            {/* Title */}
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
              {product.title}
            </h1>

            {/* Price & Negotiation Badge */}
            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-3xl sm:text-4xl font-black text-[#FF6F0F] tracking-tight">
                {formattedPrice}
              </span>
              {product.isNegotiable ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <Sparkles className="h-3 w-3 text-emerald-600" />
                  আলোচনা সাপেক্ষ
                </span>
              ) : (
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                  ফিক্সড প্রাইস
                </span>
              )}
            </div>

            {/* Location & Time info */}
            <div className="space-y-2 pt-3 border-t border-slate-100 text-xs sm:text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#FF6F0F] shrink-0" />
                <span className="font-semibold text-slate-800">{fullLocation}</span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>পোস্ট করা হয়েছে {formatRelativeTime(product.createdAt)}</span>
                </div>

                <div className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  <span>{product.viewsCount || 0} বার দেখা হয়েছে</span>
                </div>
              </div>
            </div>
          </div>

          {/* ========================================================= */}
          {/* SELLER PROFILE CARD */}
          {/* ========================================================= */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Store className="h-4 w-4 text-[#FF6F0F]" />
              <span>বিক্রেতা পরিচিতি (Seller Profile)</span>
            </div>

            {/* Seller Info Row */}
            <div className="flex items-center gap-3.5">
              <Avatar size="lg" className="h-14 w-14 ring-2 ring-orange-200">
                {product.seller?.avatar && (
                  <AvatarImage src={product.seller.avatar} alt={sellerName} />
                )}
                <AvatarFallback className="bg-gradient-to-br from-[#FF6F0F] to-[#F95738] text-white font-bold text-lg">
                  {sellerInitials}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-base font-bold text-slate-900 truncate">
                    {sellerName}
                  </h4>
                  <span title="যাচাইকৃত বিক্রেতা" className="inline-flex">
                    <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                  </span>
                </div>

                <p className="text-xs text-slate-500 font-medium truncate">
                  {product.seller?.shopName || "ব্যক্তিগত বিক্রেতা"}
                </p>

                <p className="text-[11px] text-slate-400 mt-0.5">
                  যোগ দিয়েছেন: {formatBengaliDate(product.seller?.createdAt)}
                </p>
              </div>
            </div>

            {product.seller?.bio && (
              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100 italic leading-relaxed">
                &ldquo;{product.seller.bio}&rdquo;
              </p>
            )}

            {/* Call Seller & Chat Actions */}
            <div className="space-y-2.5 pt-2">
              {/* Call Seller Button */}
              {showPhoneNumber ? (
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-orange-50 border border-orange-200 text-[#FF6F0F]">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <a
                      href={`tel:${product.seller?.phone}`}
                      className="text-base font-extrabold tracking-wider hover:underline"
                    >
                      {product.seller?.phone || "নম্বর পাওয়া যায়নি"}
                    </a>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyPhone}
                    className="p-1.5 rounded-xl hover:bg-orange-100 text-slate-600 transition-colors cursor-pointer"
                    title="কপি করুন"
                  >
                    {isCopiedPhone ? (
                      <Check className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              ) : (
                <Button
                  onClick={() => setShowPhoneNumber(true)}
                  className="w-full h-12 rounded-2xl bg-[#FF6F0F] hover:bg-[#F95738] text-white font-bold text-sm shadow-md shadow-orange-500/20 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Phone className="h-4 w-4" />
                  <span>কল করুন (নম্বর দেখুন)</span>
                </Button>
              )}

              {/* Chat Button */}
              <Button
                variant="outline"
                onClick={() => {
                  if (isOwner) {
                    toast.info("এটি আপনার নিজের পোস্ট করা বিজ্ঞাপন");
                  } else {
                    toast.success("চ্যাট ফিচার শীঘ্রই কাছে অ্যাপে চালু হচ্ছে!");
                  }
                }}
                className="w-full h-12 rounded-2xl border-slate-200 hover:border-orange-300 hover:bg-orange-50/50 text-slate-700 font-bold text-sm cursor-pointer flex items-center justify-center gap-2"
              >
                <MessageCircle className="h-4 w-4 text-[#FF6F0F]" />
                <span>মেসেজ করুন (Chat)</span>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProductDetailsPage(props: ProductDetailsPageProps) {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 text-[#FF6F0F] animate-spin" />
          <p className="mt-3 text-xs text-slate-500 font-medium">বিজ্ঞাপন লোড হচ্ছে...</p>
        </div>
      }
    >
      <ProductDetailsContent {...props} />
    </React.Suspense>
  );
}
