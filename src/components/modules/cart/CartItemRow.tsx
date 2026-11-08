"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { Minus, Plus, Trash2, Store, Package } from "lucide-react";
import { ICartItem } from "@/types/cart.types";

interface CartItemRowProps {
  item: ICartItem;
  onUpdateQuantity?: (id: string, quantity: number) => void;
  onRemove?: (id: string) => void;
  compact?: boolean;
}

export function CartItemRow({
  item,
  onUpdateQuantity,
  onRemove,
  compact = false,
}: CartItemRowProps) {
  const [imageError, setImageError] = React.useState(false);

  const product = item.product;
  const imageSrc =
    !imageError && product?.images && product.images.length > 0
      ? product.images[0]
      : !imageError && product?.imageUrl
      ? product.imageUrl
      : null;

  const productUrl = `/products/${product?.slug || item.productId || item.id}`;
  const sellerName =
    product?.seller?.shopName ||
    product?.seller?.fullName ||
    product?.sellerName ||
    "ব্যক্তিগত বিক্রেতা";

  const unitPriceFormatted = `৳${(item.unitPrice || product?.price || 0).toLocaleString("bn-BD")}`;
  const subtotalFormatted = `৳${(
    item.itemSubtotal ||
    (item.unitPrice || product?.price || 0) * (item.quantity || 1)
  ).toLocaleString("bn-BD")}`;

  const handleDecrease = () => {
    if (!onUpdateQuantity) return;
    if (item.quantity > 1) {
      onUpdateQuantity(item.id, item.quantity - 1);
    } else if (onRemove) {
      onRemove(item.id);
    }
  };

  const handleIncrease = () => {
    if (!onUpdateQuantity) return;
    onUpdateQuantity(item.id, (item.quantity || 1) + 1);
  };

  const handleRemove = () => {
    if (onRemove) {
      onRemove(item.id);
    }
  };

  return (
    <div
      className={`group flex items-center gap-3 sm:gap-4 p-3 sm:p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-orange-200 transition-all ${
        compact ? "p-2.5" : ""
      }`}
    >
      {/* Product Thumbnail */}
      <Link
        href={productUrl}
        className="relative h-16 w-16 sm:h-20 sm:w-20 rounded-xl overflow-hidden bg-slate-100 shrink-0 border border-slate-100"
      >
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={product?.title || "Product image"}
            fill
            sizes="80px"
            className="object-cover group-hover:scale-105 transition-transform duration-200"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center text-slate-400 bg-slate-50">
            <Package className="h-6 w-6 stroke-1" />
          </div>
        )}
      </Link>

      {/* Item Details */}
      <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
        <div>
          <Link
            href={productUrl}
            className="text-xs sm:text-sm font-bold text-slate-800 hover:text-[#FF6F0F] transition-colors line-clamp-1 leading-snug"
            title={product?.title}
          >
            {product?.title || "পণ্য"}
          </Link>

          {/* Seller / Shop Tag */}
          <div className="flex items-center gap-1 text-[11px] text-slate-500 mt-0.5 truncate">
            <Store className="h-3 w-3 text-slate-400 shrink-0" />
            <span className="truncate">{sellerName}</span>
          </div>
        </div>

        {/* Pricing & Quantity Row */}
        <div className="flex items-center justify-between gap-2 mt-2 pt-1 border-t border-slate-50">
          <div className="flex flex-col">
            <span className="text-xs sm:text-sm font-extrabold text-[#FF6F0F]">
              {subtotalFormatted}
            </span>
            {item.quantity > 1 && (
              <span className="text-[10px] text-slate-400">
                ({unitPriceFormatted} × {item.quantity})
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Quantity Stepper */}
            <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50/80 p-0.5">
              <button
                type="button"
                onClick={handleDecrease}
                className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg flex items-center justify-center text-slate-600 hover:bg-white hover:text-slate-900 transition-colors cursor-pointer"
                aria-label="Decrease quantity"
              >
                <Minus className="h-3 w-3" />
              </button>

              <span className="w-7 sm:w-8 text-center text-xs sm:text-sm font-bold text-slate-800 select-none">
                {item.quantity}
              </span>

              <button
                type="button"
                onClick={handleIncrease}
                className="h-6 w-6 sm:h-7 sm:w-7 rounded-lg flex items-center justify-center text-slate-600 hover:bg-white hover:text-slate-900 transition-colors cursor-pointer"
                aria-label="Increase quantity"
              >
                <Plus className="h-3 w-3" />
              </button>
            </div>

            {/* Remove Action */}
            {onRemove && (
              <button
                type="button"
                onClick={handleRemove}
                title="কার্ট থেকে মুছুন"
                className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
                aria-label="Remove item"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default CartItemRow;
