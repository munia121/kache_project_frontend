"use client";

import Link from "next/link";

const AuthLayoutFooter = () => {
  return (
    <footer className=" flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
      <p>© 2026 কাছে (Kache) মার্কেটপ্লেস। সর্বস্বত্ব সংরক্ষিত।</p>
      <div className="flex items-center gap-4">
        <Link href="/" className="hover:text-slate-700 transition-colors">
          শর্তাবলী
        </Link>
        <span>•</span>
        <Link href="/" className="hover:text-slate-700 transition-colors">
          গোপনীয়তা
        </Link>
        <span>•</span>
        <Link href="/" className="hover:text-slate-700 transition-colors">
          সহায়তা
        </Link>
      </div>
    </footer>
  );
};

export default AuthLayoutFooter;
