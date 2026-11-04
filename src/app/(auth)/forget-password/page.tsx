import { Metadata } from "next";
import { Suspense } from "react";
import { ForgetPasswordForm } from "@/components/(auth)/forget-password/ForgetPasswordForm";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "পাসওয়ার্ড ভুলে গেছেন? | কাছে মার্কেটপ্লেস - Kache",
  description: "আপনার কাছে অ্যাকাউন্টের পাসওয়ার্ড রিসেট করতে ওটিপি কোড পান।",
};

export default function ForgetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-16 space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#FF6F0F]" />
          <p className="text-xs text-slate-400">লোড হচ্ছে...</p>
        </div>
      }
    >
      <ForgetPasswordForm />
    </Suspense>
  );
}
