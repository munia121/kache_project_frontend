"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";
import {
  Mail,
  Loader2,
  ArrowRight,
  ArrowLeft,
  KeyRound,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export function ForgetPasswordForm() {
  const router = useRouter();

  const [email, setEmail] = React.useState("");
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [isSuccess, setIsSuccess] = React.useState(false);
  const [devOtp, setDevOtp] = React.useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setError("অনুগ্রহ করে একটি সঠিক ইমেইল ঠিকানা দিন");
      return;
    }

    try {
      setIsLoading(true);
      const res = await authService.forgotPassword({ email: cleanEmail });

      if (res.success) {
        setIsSuccess(true);
        if (res.data?.devOtp) {
          setDevOtp(res.data.devOtp);
        }
        toast.success("পাসওয়ার্ড রিসেট ওটিপি পাঠানো হয়েছে!", {
          description: "অনুগ্রহ করে আপনার ইমেইল ইনবক্স চেক করুন।",
        });
      } else {
        const msg =
          res?.message ||
          "এই ইমেইল ঠিকানায় কোনো অ্যাকাউন্ট খুঁজে পাওয়া যায়নি।";
        setError(msg);
      }
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } }; message?: string })
          ?.response?.data?.message ||
        (err as Error)?.message ||
        "পাসওয়ার্ড রিসেট ওটিপি পাঠাতে সমস্যা হয়েছে।";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="space-y-2 text-left">
        <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-orange-100 text-[#FF6F0F] mb-1">
          <KeyRound className="h-6 w-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          পাসওয়ার্ড ভুলে গেছেন?
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          আপনার অ্যাকাউন্টের সাথে যুক্ত ইমেইল ঠিকানাটি দিন। আমরা আপনাকে পাসওয়ার্ড
          রিসেট করার জন্য একটি ৬-সংখ্যার ওটিপি কোড পাঠাবো।
        </p>
      </div>

      {!isSuccess ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium animate-in fade-in-50">
              ⚠️ {error}
            </div>
          )}

          {/* Email input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-700">
              ইমেইল ঠিকানা
            </label>
            <div className="relative">
              <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="example@mail.com"
                className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 text-sm focus:bg-white focus:border-[#FF6F0F] focus:ring-1 focus:ring-[#FF6F0F]"
              />
            </div>
          </div>

          {/* Submit button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full h-11 rounded-xl bg-[#FF6F0F] hover:bg-[#F95738] active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-orange-500/20 transition-all cursor-pointer mt-2"
          >
            {isLoading ? (
              <span className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                কোড পাঠানো হচ্ছে...
              </span>
            ) : (
              <span className="flex items-center gap-1.5">
                <span>রিসেট কোড পাঠান</span>
                <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>

          {/* Back to login */}
          <div className="text-center pt-2">
            <Link
              href="/login"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-[#FF6F0F] transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>লগইন পেজে ফিরে যান</span>
            </Link>
          </div>
        </form>
      ) : (
        /* Success State View */
        <div className="space-y-5 p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200 text-left animate-in fade-in-50">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="h-6 w-6 text-emerald-600 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="text-base font-bold text-emerald-900">
                ওটিপি সফলভাবে পাঠানো হয়েছে!
              </h3>
              <p className="text-xs text-emerald-700 leading-relaxed">
                আমরা <span className="font-bold">{email}</span> ঠিকানায় পাসওয়ার্ড
                রিসেটের কোড পাঠিয়েছি। ওটিপি কোড ব্যবহার করে এখনই নতুন পাসওয়ার্ড
                সেট করুন।
              </p>
            </div>
          </div>

          {devOtp && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                <span>
                  টেস্টিং ওটিপি কোড: <strong>{devOtp}</strong>
                </span>
              </span>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row gap-2.5">
            <Button
              type="button"
              onClick={() =>
                router.push(
                  `/reset-password?email=${encodeURIComponent(
                    email.trim().toLowerCase()
                  )}${devOtp ? `&devOtp=${encodeURIComponent(devOtp)}` : ""}`
                )
              }
              className="flex-1 h-10 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs cursor-pointer"
            >
              নতুন পাসওয়ার্ড সেট করুন →
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsSuccess(false)}
              className="h-10 rounded-xl border-slate-300 text-slate-700 text-xs font-semibold cursor-pointer"
            >
              অন্য ইমেইল দিন
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export default ForgetPasswordForm;
