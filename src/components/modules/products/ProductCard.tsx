"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { IProduct } from "@/types/product.types";
import { MapPin, Heart, MessageCircle } from "lucide-react";

interface ProductCardProps {
  product: IProduct;
}

function formatTimeAgo(dateString?: string): string {
  if (!dateString) return "আজ";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "আজ";
    const now = new Date();
    const diffSecs = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffSecs < 60) return "এইমাত্র";
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins} মি. আগে`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} ঘণ্টা আগে`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} দিন আগে`;
    return date.toLocaleDateString("bn-BD", { month: "short", day: "numeric" });
  } catch {
    return "আজ";
  }
}

export function ProductCard({ product }: ProductCardProps) {
  const [isLiked, setIsLiked] = React.useState(false);
  const [likesCount, setLikesCount] = React.useState(product.likesCount ?? 0);

  const handleLikeClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    if (isLiked) {
      setIsLiked(false);
      setLikesCount((prev) => Math.max(0, prev - 1));
    } else {
      setIsLiked(true);
      setLikesCount((prev) => prev + 1);
    }
  };

  // Image resolution
  const displayImage =
    (product.images && product.images.length > 0 && product.images[0]) ||
    product.imageUrl ||
    "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop&q=80";

  // Format currency with standard commas: ৳ 68,000
  const formattedPrice = `৳ ${Number(product.price || 0).toLocaleString("en-IN")}`;

  // Area resolution
  const areaName =
    typeof product.area === "object" && product.area !== null
      ? product.area.bnName || product.area.name
      : typeof product.area === "string"
      ? product.area
      : product.location || "ঢাকা";

  // Category name resolution
  const categoryLabel =
    typeof product.category === "object" && product.category !== null
      ? product.category.name
      : typeof product.category === "string"
      ? product.category
      : product.categoryName || "সাধারণ";

  // Time label
  const timeLabel = product.timeAgo || formatTimeAgo(product.createdAt);

  // Condition in Bengali
  const conditionLabel =
    product.condition === "NEW"
      ? "নতুন"
      : product.condition === "REFURBISHED"
      ? "রিফার্বিশড"
      : product.condition === "USED"
      ? "ব্যবহৃত"
      : product.condition;

  const productSlug = product.slug || product.id;

  return (
    <Link
      href={`/products/${productSlug}`}
      className="group flex flex-col bg-white rounded-2xl border border-slate-100 hover:border-orange-200/80 p-2.5 sm:p-3 shadow-2xs hover:shadow-md transition-all duration-300 cursor-pointer overflow-hidden"
    >
      {/* 1:1 Aspect Ratio Image Container */}
      <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-slate-100 mb-2.5">
        <Image
          src={displayImage}
          alt={product.title}
          fill
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
          className="object-cover scale-100 group-hover:scale-105 transition-transform duration-300 ease-out"
          priority={false}
        />

        {/* Condition / Negotiable Badge */}
        {conditionLabel && (
          <div className="absolute top-2 left-2 z-10">
            <span className="inline-block px-2 py-0.5 text-[10px] font-semibold tracking-wide bg-black/60 backdrop-blur-xs text-white rounded-md">
              {conditionLabel}
            </span>
          </div>
        )}

        {/* Favorite Heart Button */}
        <button
          type="button"
          aria-label={isLiked ? "Remove favorite" : "Add to favorite"}
          onClick={handleLikeClick}
          className={`absolute top-2 right-2 z-10 h-7 w-7 rounded-full flex items-center justify-center backdrop-blur-xs transition-all duration-200 cursor-pointer ${
            isLiked
              ? "bg-rose-50 text-rose-500 shadow-sm"
              : "bg-black/30 hover:bg-black/50 text-white"
          }`}
        >
          <Heart
            className={`h-4 w-4 ${isLiked ? "fill-rose-500 stroke-rose-500" : ""}`}
          />
        </button>

        {/* Category Badge on Bottom Left of Image */}
        <div className="absolute bottom-2 left-2 z-10">
          <span className="px-1.5 py-0.5 text-[10px] font-medium bg-white/90 backdrop-blur-xs text-slate-700 rounded-md border border-slate-200/50 shadow-2xs">
            {categoryLabel}
          </span>
        </div>
      </div>

      {/* Card Content */}
      <div className="flex flex-col flex-1 justify-between gap-1.5">
        {/* Title */}
        <h3
          title={product.title}
          className="text-xs sm:text-sm font-medium text-slate-800 group-hover:text-[#FF6F0F] transition-colors line-clamp-2 leading-snug min-h-[2.5rem]"
        >
          {product.title}
        </h3>

        {/* Metadata: MapPin + Area Name + Time */}
        <div className="flex items-center text-[11px] sm:text-xs text-slate-500 gap-1 truncate">
          <MapPin className="h-3.5 w-3.5 text-[#FF6F0F] shrink-0" />
          <span className="font-medium text-slate-600 truncate">
            {areaName}
          </span>
          <span className="text-slate-300">•</span>
          <span className="text-slate-400 shrink-0">{timeLabel}</span>
        </div>

        {/* Price & Engagement Footer */}
        <div className="mt-1 pt-1.5 border-t border-slate-100 flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="text-sm sm:text-base font-bold text-slate-900 tracking-tight">
              {formattedPrice}
            </span>
            {product.isNegotiable && (
              <span className="text-[10px] text-emerald-600 font-medium">
                দরদামযোগ্য
              </span>
            )}
          </div>

          {/* Social Stats: Chats and Likes */}
          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            {(product.chatsCount ?? 0) > 0 && (
              <span className="inline-flex items-center gap-0.5 hover:text-slate-600">
                <MessageCircle className="h-3 w-3" />
                <span>{product.chatsCount}</span>
              </span>
            )}
            {likesCount > 0 && (
              <span
                className={`inline-flex items-center gap-0.5 ${
                  isLiked ? "text-rose-500 font-medium" : "hover:text-slate-600"
                }`}
              >
                <Heart
                  className={`h-3 w-3 ${isLiked ? "fill-rose-500" : ""}`}
                />
                <span>{likesCount}</span>
              </span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
}

export default ProductCard;
