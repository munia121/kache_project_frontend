import { Metadata } from "next";
import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/(auth)/reset-password/ResetPasswordForm";
import { Loader2 } from "lucide-react";

export const metadata: Metadata = {
  title: "পাসওয়ার্ড রিসেট করুন | কাছে মার্কেটপ্লেস - Kache",
  description: "আপনার কাছে অ্যাকাউন্টের জন্য একটি নতুন ও নিরাপদ পাসওয়ার্ড সেট করুন।",
};

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex flex-col items-center justify-center py-16 space-y-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#FF6F0F]" />
          <p className="text-xs text-slate-400">লোড হচ্ছে...</p>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
