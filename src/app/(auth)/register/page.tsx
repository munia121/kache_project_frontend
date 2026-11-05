import { Metadata } from "next";
import { Suspense } from "react";
import { RegisterForm } from "@/components/(auth)/register/RegisterForm";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "নতুন অ্যাকাউন্ট | কাছে মার্কেটপ্লেস - Kache",
  description: "কাছে মার্কেটপ্লেসে নতুন অ্যাকাউন্ট তৈরি করুন এবং কেনাবেচা শুরু করুন।",
};

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-16 space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#FF6F0F]" />
          <p className="text-xs text-slate-400">লোড হচ্ছে...</p>
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  );
}
