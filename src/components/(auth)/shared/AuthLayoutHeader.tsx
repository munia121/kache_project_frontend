"use client";

import { ArrowLeft, ShoppingBag } from "lucide-react";
import Link from "next/link";

const AuthLayoutHeader = () => {
  return (
    <header className="flex items-center justify-between">
      <Link
        href="/"
        className="group inline-flex items-center gap-2.5 transition-transform hover:scale-[1.02] active:scale-[0.98]"
      >
        <div className="h-10 w-10 rounded-2xl bg-linear-to-br from-[#FF6F0F] to-[#F95738] flex items-center justify-center text-white shadow-md shadow-orange-500/25 group-hover:shadow-orange-500/40 transition-all">
          <ShoppingBag className="h-5 w-5 stroke-[2.2]" />
        </div>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-black tracking-tight text-slate-900 leading-none">
              কাছে
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#FF6F0F] bg-orange-50 px-1.5 py-0.5 rounded border border-orange-200/70">
              Kache
            </span>
          </div>
          <p className="hidden sm:block text-[11px] text-slate-500 font-medium leading-none mt-1">
            পাড়ার বিশ্বস্ত মার্কেটপ্লেস
          </p>
        </div>
      </Link>

      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#FF6F0F] bg-slate-100/80 hover:bg-orange-50/80 px-3 py-1.5 rounded-full transition-all border border-slate-200/60 hover:border-orange-200"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>হোমে ফিরুন</span>
      </Link>
    </header>
  );
};

export default AuthLayoutHeader;
