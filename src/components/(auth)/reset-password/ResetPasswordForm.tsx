"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";
import {
  Mail,
  Lock,
  KeyRound,
  Eye,
  EyeOff,
  Loader2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

export function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const queryEmail = searchParams.get("email") || "";
  const queryDevOtp = searchParams.get("devOtp") || "";

  const [email, setEmail] = React.useState(queryEmail);
  const [code, setCode] = React.useState(queryDevOtp);
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // Sync query params if they become available
  React.useEffect(() => {
    if (queryEmail && !email) {
      setEmail(queryEmail);
    }
    if (queryDevOtp && !code) {
      setCode(queryDevOtp);
    }
  }, [queryEmail, queryDevOtp, email, code]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    const cleanCode = code.trim();

    if (!cleanEmail || !cleanEmail.includes("@")) {
      setError("সঠিক ইমেইল ঠিকানা দিন");
      return;
    }
    if (!cleanCode || cleanCode.length < 4) {
      setError("আপনার ইমেইলে পাওয়া ওটিপি কোডটি লিখুন");
      return;
    }
    if (newPassword.length < 6) {
      setError("নতুন পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("দুটি পাসওয়ার্ড মেলেনি। পুনরায় পরীক্ষা করুন।");
      return;
    }

    try {
      setIsLoading(true);
      const res = await authService.resetPassword({
        email: cleanEmail,
        code: cleanCode,
        newPassword,
      });

      if (res.success) {
        toast.success("পাসওয়ার্ড সফলভাবে পরিবর্তন হয়েছে!", {
          description: "নতুন পাসওয়ার্ড দিয়ে আপনার অ্যাকাউন্টে লগইন করুন।",
        });
        router.push("/login");
      } else {
        const msg =
          res?.message ||
          "পাসওয়ার্ড রিসেট করা যায়নি। ওটিপি কোড সঠিক কিনা যাচাই করুন।";
        setError(msg);
      }
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } }; message?: string })
          ?.response?.data?.message ||
        (err as Error)?.message ||
        "পাসওয়ার্ড রিসেট করতে সমস্যা হয়েছে।";
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
          <ShieldCheck className="h-6 w-6" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          নতুন পাসওয়ার্ড সেট করুন
        </h1>
        <p className="text-sm text-slate-500 leading-relaxed">
          আপনার ইমেইলে প্রাপ্ত ৬-সংখ্যার ওটিপি কোডটি দিন এবং আপনার অ্যাকাউন্টের জন্য নতুন
          পাসওয়ার্ড নির্ধারণ করুন।
        </p>
      </div>

      {queryDevOtp && (
        <div
          onClick={() => setCode(queryDevOtp)}
          className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between cursor-pointer hover:bg-amber-100/70 transition-colors"
        >
          <span className="flex items-center gap-1.5">
            <Sparkles className="h-3.5 w-3.5 text-amber-600" />
            <span>
              টেস্টিং ওটিপি কোড: <strong>{queryDevOtp}</strong>
            </span>
          </span>
          <span className="text-[10px] font-bold text-amber-700 bg-white px-2 py-0.5 rounded border border-amber-300">
            অটো-ফিল
          </span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium animate-in fade-in-50">
            ⚠️ {error}
          </div>
        )}

        {/* Email Address */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">ইমেইল ঠিকানা</label>
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

        {/* OTP Code */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700">
              ৬-সংখ্যার ওটিপি কোড
            </label>
            <Link
              href="/forget-password"
              className="text-xs font-semibold text-[#FF6F0F] hover:underline"
            >
              কোড পাননি?
            </Link>
          </div>
          <div className="relative">
            <KeyRound className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              maxLength={6}
              required
              value={code}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, "");
                setCode(val);
              }}
              placeholder="123456"
              className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 text-sm font-mono tracking-widest focus:bg-white focus:border-[#FF6F0F] focus:ring-1 focus:ring-[#FF6F0F]"
            />
          </div>
        </div>

        {/* New Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">
            নতুন পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type={showPassword ? "text" : "password"}
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="••••••••"
              className="pl-10 pr-10 h-11 rounded-xl bg-slate-50 border-slate-200 text-sm focus:bg-white focus:border-[#FF6F0F] focus:ring-1 focus:ring-[#FF6F0F]"
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        {/* Confirm New Password */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">
            পাসওয়ার্ড নিশ্চিত করুন
          </label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type={showConfirmPassword ? "text" : "password"}
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
              className="pl-10 pr-10 h-11 rounded-xl bg-slate-50 border-slate-200 text-sm focus:bg-white focus:border-[#FF6F0F] focus:ring-1 focus:ring-[#FF6F0F]"
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
            >
              {showConfirmPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
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
              পাসওয়ার্ড আপডেট হচ্ছে...
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4" />
              <span>পাসওয়ার্ড পরিবর্তন ও নিশ্চিত করুন</span>
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
    </div>
  );
}

export default ResetPasswordForm;
