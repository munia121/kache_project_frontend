import * as React from "react";

export function ProductGridSkeleton({ count = 10 }: { count?: number }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 sm:gap-4 md:gap-5">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="flex flex-col bg-white rounded-2xl border border-slate-100 p-2.5 sm:p-3 shadow-2xs animate-pulse"
        >
          {/* 1:1 Aspect Ratio Image placeholder */}
          <div className="relative aspect-square w-full rounded-xl bg-slate-200 mb-2.5" />

          {/* Title lines */}
          <div className="space-y-1.5 flex-1">
            <div className="h-3.5 bg-slate-200 rounded-md w-11/12" />
            <div className="h-3.5 bg-slate-200 rounded-md w-3/4" />
          </div>

          {/* Location & Time */}
          <div className="flex items-center gap-1.5 mt-2.5">
            <div className="h-3 w-3 bg-slate-200 rounded-full" />
            <div className="h-2.5 bg-slate-200 rounded w-16" />
            <div className="h-2.5 bg-slate-200 rounded w-8" />
          </div>

          {/* Price & Action */}
          <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between">
            <div className="h-4 bg-slate-200 rounded-md w-20" />
            <div className="h-3 w-3 bg-slate-200 rounded-full" />
          </div>
        </div>
      ))}
    </div>
  );
}

export default ProductGridSkeleton;
