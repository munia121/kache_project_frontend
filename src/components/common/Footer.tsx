import * as React from "react";
import Link from "next/link";
import { ShoppingBag, ShieldCheck, HeartHandshake, MapPin } from "lucide-react";

export function Footer() {
  return (
    <footer className="w-full bg-white border-t border-slate-200/80 text-slate-600 mt-auto">
      {/* Community highlights banner */}
      <div className="border-b border-slate-100 bg-orange-50/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center md:text-left">
            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="p-2 rounded-xl bg-orange-100 text-[#FF6F0F] shrink-0">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">কাছের মানুষ, কাছের ডিল</p>
                <p className="text-[11px] text-slate-500">আপনার নিজস্ব এলাকাতেই নিরাপদে কেনাবেচা করুন</p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="p-2 rounded-xl bg-orange-100 text-[#FF6F0F] shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">যাচাইকৃত প্রোফাইল</p>
                <p className="text-[11px] text-slate-500">প্রতিবেশী ব্যবহারকারীদের সাথে সরাসরি যোগাযোগ</p>
              </div>
            </div>

            <div className="flex items-center justify-center md:justify-start gap-3">
              <div className="p-2 rounded-xl bg-orange-100 text-[#FF6F0F] shrink-0">
                <HeartHandshake className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">কোনো মধ্যস্বত্বভোগী নেই</p>
                <p className="text-[11px] text-slate-500">সরাসরি দেখা করে পণ্য যাচাই করে নিন</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Brand info */}
          <div className="flex flex-col items-center md:items-start space-y-1.5">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-[#FF6F0F] flex items-center justify-center text-white">
                <ShoppingBag className="h-4 w-4" />
              </div>
              <span className="text-lg font-black text-slate-900">কাছে (Kache)</span>
            </div>
            <p className="text-xs text-slate-500 text-center md:text-left">
              বাংলাদেশের সেরা ও আন্তরিক প্রতিবেশীদের লোকাল মার্কেটপ্লেস
            </p>
          </div>

          {/* Navigation Links */}
          <div className="flex flex-wrap justify-center gap-6 text-xs font-medium text-slate-600">
            <Link href="#" className="hover:text-[#FF6F0F] transition-colors">
              আমাদের সম্পর্কে
            </Link>
            <Link href="#" className="hover:text-[#FF6F0F] transition-colors">
              ব্যবহার নির্দেশিকা
            </Link>
            <Link href="#" className="hover:text-[#FF6F0F] transition-colors">
              নিরাপত্তা টিপস
            </Link>
            <Link href="#" className="hover:text-[#FF6F0F] transition-colors">
              শর্তাবলী ও নীতিমালা
            </Link>
            <Link href="#" className="hover:text-[#FF6F0F] transition-colors">
              যোগাযোগ ও সহায়তা
            </Link>
          </div>
        </div>

        {/* Copyright */}
        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <p>© 2026 Kache Marketplace Ltd. সর্বস্বত্ব সংরক্ষিত।</p>
          <p>Karrot-inspired Clean Local Commerce for Bangladesh</p>
        </div>
      </div>
    </footer>
  );
}
