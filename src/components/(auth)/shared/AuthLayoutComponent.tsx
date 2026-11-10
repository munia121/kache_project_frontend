"use client"

import { BadgePercent, CheckCircle2, MapPin, ShieldCheck, ShoppingBag, Sparkles, Star, Store } from "lucide-react";

const AuthLayoutComponent = () => {
    return (
         <div className="hidden lg:flex lg:col-span-5 xl:col-span-6 relative flex-col justify-between p-10 xl:p-14 bg-linear-to-br from-amber-50/70 via-orange-50/50 to-orange-100/40 border-l border-orange-100/80 overflow-hidden">
        {/* Soft Ambient Background Glows */}
        <div
          aria-hidden="true"
          className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-linear-to-br from-orange-400/20 to-amber-300/20 blur-3xl pointer-events-none"
        />
        <div
          aria-hidden="true"
          className="absolute -bottom-24 -left-24 w-96 h-96 rounded-full bg-linear-to-tr from-orange-500/15 to-rose-400/15 blur-3xl pointer-events-none"
        />

        {/* Top Feature Tag & Headline */}
        <div className="relative z-10 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 border border-orange-200/80 shadow-xs text-xs font-bold text-[#FF6F0F]">
            <Sparkles className="h-3.5 w-3.5 text-[#FF6F0F]" />
            <span>স্মার্ট কেনাবেচার লোকাল মার্কেটপ্লেস</span>
          </div>

          <h2 className="text-3xl xl:text-4xl font-black text-slate-900 tracking-tight leading-snug">
            কাছের মানুষের সাথে <br />
            <span className="text-transparent bg-clip-text bg-linear-to-r from-[#FF6F0F] via-orange-600 to-[#F95738]">
              নিরাপদে সরাসরি কেনাবেচা
            </span>{" "}
            করুন
          </h2>

          <p className="text-sm xl:text-base text-slate-600 leading-relaxed max-w-lg">
            আপনার এলাকায় থাকা বিশ্বস্ত মানুষের কাছ থেকে গ্যাজেট, বাইক, হোম অ্যাপ্লায়েন্স কিংবা
            শখের পণ্য কিনুন যাচাই করে। কোনো মধ্যস্বত্বভোগী ছাড়া সহজে বিজ্ঞাপন দিন ও বিক্রি করুন।
          </p>
        </div>

        {/* Middle: Feature Highlights & Floating Live E-Commerce Card */}
        <div className="relative z-10 my-8 space-y-5">
          {/* E-Commerce Highlight Points */}
          <div className="grid grid-cols-1 gap-3.5 max-w-lg">
            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/80 backdrop-blur-xs border border-orange-100 shadow-xs">
              <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center text-[#FF6F0F] shrink-0">
                <MapPin className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">লোকাল মিটআপ ও যাচাই</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  অনলাইনে প্রি-পেমেন্টের ঝুঁকি ছাড়া সামনাসামনি পণ্য দেখে মূল্য পরিশোধের সুবিধা।
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/80 backdrop-blur-xs border border-orange-100 shadow-xs">
              <div className="h-10 w-10 rounded-xl bg-emerald-100 flex items-center justify-center text-emerald-600 shrink-0">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">ভেরিফায়েড সেলার ও রেটিং</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  প্রতিটি বিক্রেতার আসল পরিচয় ও অন্যান্য ক্রেতাদের রেটিং দেখে নিরাপদ সিদ্ধান্ত নিন।
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3.5 p-3.5 rounded-2xl bg-white/80 backdrop-blur-xs border border-orange-100 shadow-xs">
              <div className="h-10 w-10 rounded-xl bg-indigo-100 flex items-center justify-center text-indigo-600 shrink-0">
                <Store className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800">ফ্রি ও সহজ বিজ্ঞাপন</h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  কয়েকটি ক্লিকেই ছবি তুলে বিনামূল্যে লিস্টিং প্রকাশ করুন হাজারো সম্ভাব্য ক্রেতার কাছে।
                </p>
              </div>
            </div>
          </div>

          {/* Floating Realistic E-Commerce Product Card */}
          <div className="p-4 rounded-2xl bg-white shadow-lg shadow-orange-500/10 border border-orange-200/60 max-w-lg">
            <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-100">
              <span className="inline-flex items-center gap-1.5 text-[11px] font-bold text-[#FF6F0F] bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200/60">
                <BadgePercent className="h-3 w-3" />
                সদ্য লিস্টিং সম্পন্ন
              </span>
              <span className="text-[11px] text-slate-400">ধানমন্ডি, ঢাকা</span>
            </div>

            <div className="flex items-center justify-between gap-3">
              <div className="space-y-1">
                <h5 className="text-sm font-black text-slate-800 line-clamp-1">
                  Apple iPhone 14 Pro Max (128GB)
                </h5>
                <div className="flex items-center gap-2">
                  <span className="text-base font-extrabold text-[#FF6F0F]">৳ ৯২,০০০</span>
                  <span className="text-xs text-slate-400 line-through">৳ ১,০৫,০০০</span>
                </div>
              </div>
              <div className="h-12 w-12 rounded-xl bg-linear-to-br from-slate-100 to-orange-50 border border-slate-200 flex items-center justify-center text-slate-400 shrink-0">
                <ShoppingBag className="h-6 w-6 text-[#FF6F0F]" />
              </div>
            </div>

            <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span className="font-medium text-slate-700">ভেরিফায়েড বিক্রেতা</span>
              </div>
              <div className="flex items-center gap-1 text-amber-500 font-bold">
                <Star className="h-3.5 w-3.5 fill-current" />
                <span>৪.৯ (৩৮ রিভিউ)</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Social Proof & Trust Metric Stats */}
        <div className="relative z-10 pt-6 border-t border-orange-200/50 grid grid-cols-3 gap-4 max-w-lg text-center">
          <div>
            <div className="text-xl xl:text-2xl font-black text-slate-900 tracking-tight">
              ৫০,০০০+
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">সক্রিয় ব্যবহারকারী</p>
          </div>
          <div>
            <div className="text-xl xl:text-2xl font-black text-[#FF6F0F] tracking-tight">
              ১,২০,০০০+
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">সফল লেনদেন</p>
          </div>
          <div>
            <div className="text-xl xl:text-2xl font-black text-emerald-600 tracking-tight">
              ৯৯%
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">সন্তুষ্টি রেটিং</p>
          </div>
        </div>
      </div>
    );
};

export default AuthLayoutComponent;