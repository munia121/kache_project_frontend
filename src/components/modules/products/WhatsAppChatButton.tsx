"use client";

import * as React from "react";
import { toast } from "sonner";
import { cn } from "cn";

export interface WhatsAppChatButtonProps {
  sellerPhone?: string | null;
  sellerName?: string;
  productTitle: string;
  productPrice: number;
  className?: string;
}

function WhatsAppIcon({ className = "h-4 w-4" }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.455 5.711 1.456h.005c6.554 0 11.89-5.336 11.893-11.893a11.82 11.82 0 00-3.488-8.416" />
    </svg>
  );
}

export function WhatsAppChatButton({
  sellerPhone,
  sellerName,
  productTitle,
  productPrice,
  className,
}: WhatsAppChatButtonProps) {
  // Normalize phone number for Click-to-Chat schema: https://wa.me/<number>?text=<encoded_text>
  const cleanPhone = React.useMemo(() => {
    if (!sellerPhone) return null;
    let digits = sellerPhone.replace(/\D/g, "");
    if (!digits) return null;
    // Format Bangladesh local numbers (11 digits starting with 01...) to 8801...
    if (digits.startsWith("0") && digits.length === 11) {
      digits = "88" + digits;
    } else if (digits.length === 10 && digits.startsWith("1")) {
      digits = "880" + digits;
    }
    return digits;
  }, [sellerPhone]);

  const defaultMessage = React.useMemo(() => {
    const greeting = sellerName ? `আসসালামু আলাইকুম ${sellerName}, ` : "আসসালামু আলাইকুম, ";
    const priceFormatted = Number(productPrice || 0).toLocaleString("bn-BD");
    let text = `${greeting}আমি কাছে (Kache) মার্কেটপ্লেসে আপনার "${productTitle}" বিজ্ঞাপনটি দেখেছি (মূল্য: ৳${priceFormatted})। এটি কি এখনও বিক্রির জন্য আছে?`;
    if (typeof window !== "undefined" && window.location.href) {
      text += `\nবিজ্ঞাপন লিংক: ${window.location.href}`;
    }
    return text;
  }, [sellerName, productTitle, productPrice]);

  const whatsappUrl = cleanPhone
    ? `https://wa.me/${cleanPhone}?text=${encodeURIComponent(defaultMessage)}`
    : "#";

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (!cleanPhone) {
      e.preventDefault();
      toast.error("বিক্রেতার হোয়াটসঅ্যাপ নম্বর পাওয়া যায়নি");
    }
  };

  return (
    <a
      href={whatsappUrl}
      target={cleanPhone ? "_blank" : undefined}
      rel={cleanPhone ? "noopener noreferrer" : undefined}
      onClick={handleClick}
      aria-label="হোয়াটসঅ্যাপে বিক্রেতার সাথে চ্যাট করুন"
      className={cn(
        "w-full h-12 rounded-2xl bg-[#25D366] hover:bg-[#20bd5a] active:scale-98 text-white font-bold text-sm shadow-md shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-2 transition-all select-none",
        !cleanPhone && "opacity-80 hover:bg-[#25D366]",
        className
      )}
    >
      <WhatsAppIcon className="h-5 w-5 fill-current shrink-0" />
      <span>হোয়াটসঅ্যাপে চ্যাট করুন</span>
      <span className="hidden sm:inline">(WhatsApp)</span>
    </a>
  );
}

export default WhatsAppChatButton;
