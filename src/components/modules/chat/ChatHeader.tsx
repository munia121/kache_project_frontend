"use client";

import React from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { IParticipant, IProductSummary } from "@/services/chat.service";

interface ChatHeaderProps {
  counterpart?: IParticipant;
  product?: IProductSummary;
  isTyping?: boolean;
  onBack?: () => void;
}

const toBengaliNumber = (num: number | string): string => {
  return num
    .toString()
    .replace(/\d/g, (d) => "০১২৩৪৫৬৭৮৯"[parseInt(d, 10)] || d);
};

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  counterpart,
  product,
  isTyping = false,
  onBack,
}) => {
  const productHref = product
    ? `/products/${product.slug || product.id}`
    : null;
  const productImg = product?.imageUrl || product?.images?.[0];

  return (
    <div className="h-16 px-4 bg-white border-b border-slate-200 flex items-center justify-between shrink-0 gap-2 shadow-xs">
      {/* Left: Mobile Back Button & Counterpart Details */}
      <div className="flex items-center gap-3 min-w-0">
        {onBack && (
          <button
            onClick={onBack}
            className="md:hidden p-1.5 -ml-1 text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-100 transition-colors"
            aria-label="ফিরে যান"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
        )}

        <div className="relative shrink-0">
          <Avatar className="h-10 w-10 border border-slate-200">
            <AvatarImage
              src={counterpart?.avatar || undefined}
              alt={counterpart?.fullName || "ব্যবহারকারী"}
            />
            <AvatarFallback className="bg-orange-100 text-[#FF6F0F] font-bold text-sm">
              {counterpart?.fullName?.slice(0, 2).toUpperCase() || "ইউ"}
            </AvatarFallback>
          </Avatar>
          {counterpart?.isOnline && (
            <span className="absolute bottom-0 right-0 h-2.5 w-2.5 rounded-full bg-emerald-500 ring-2 ring-white" />
          )}
        </div>

        <div className="min-w-0">
          <h2 className="text-sm font-bold text-slate-900 truncate">
            {counterpart?.fullName || "ব্যবহারকারী"}
          </h2>
          <div className="flex items-center gap-1.5 text-xs">
            {isTyping ? (
              <span className="text-[#FF6F0F] font-semibold flex items-center gap-1 animate-pulse">
                <span>টাইপ করছেন...</span>
              </span>
            ) : counterpart?.isOnline ? (
              <span className="text-emerald-600 font-medium flex items-center gap-1">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                অনলাইন
              </span>
            ) : (
              <span className="text-slate-400">অফলাইন</span>
            )}
          </div>
        </div>
      </div>

      {/* Right: Compact Product Card */}
      {product && productHref && (
        <Link
          href={productHref}
          target="_blank"
          className="group flex items-center gap-2 p-1.5 pr-2.5 rounded-xl border border-slate-200 bg-slate-50 hover:bg-orange-50/50 hover:border-orange-200 transition-all max-w-[200px] sm:max-w-[260px] shrink-0"
        >
          {productImg && (
            <div className="relative h-9 w-9 rounded-lg overflow-hidden border border-slate-200 shrink-0 bg-white">
              <Image
                src={productImg}
                alt={product.title}
                fill
                className="object-cover"
                sizes="36px"
              />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-slate-800 truncate group-hover:text-[#FF6F0F] transition-colors">
              {product.title}
            </p>
            <p className="text-[11px] font-bold text-[#FF6F0F]">
              ৳{toBengaliNumber(product.price || 0)}
            </p>
          </div>
          <ExternalLink className="h-3.5 w-3.5 text-slate-400 group-hover:text-[#FF6F0F] shrink-0 transition-colors" />
        </Link>
      )}
    </div>
  );
};

export default ChatHeader;
