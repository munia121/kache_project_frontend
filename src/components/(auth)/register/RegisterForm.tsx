"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";
import {
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  KeyRound,
  RotateCcw,
  Loader2,
  CheckCircle2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";

  const { setAuth } = useAuthStore();

  // Step state: "form" or "otp"
  const [step, setStep] = React.useState<"form" | "otp">("form");

  // Registration form state
  const [fullName, setFullName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  // OTP state
  const [otpCode, setOtpCode] = React.useState("");
  const [devOtp, setDevOtp] = React.useState<string | null>(null);
  const [isOtpLoading, setIsOtpLoading] = React.useState(false);
  const [isResendLoading, setIsResendLoading] = React.useState(false);
  const [resendTimer, setResendTimer] = React.useState(0);

  // Countdown timer for OTP
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  // Handle registration
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanName = fullName.trim();
    const cleanPhone = phone.trim();
    const cleanEmail = email.trim().toLowerCase();

    if (!cleanName) {
      setError("আপনার পুরো নাম লিখুন");
      return;
    }
    if (!cleanPhone) {
      setError("মোবাইল নম্বর প্রদান করুন");
      return;
    }
    if (!cleanEmail || !cleanEmail.includes("@")) {
      setError("সঠিক ইমেইল ঠিকানা দিন");
      return;
    }
    if (password.length < 6) {
      setError("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে");
      return;
    }

    try {
      setIsLoading(true);
      const payload = {
        fullName: cleanName,
        phone: cleanPhone,
        email: cleanEmail,
        password,
      };

      const res = await authService.register(payload);

      if (res.success) {
        if (res.data?.devOtp) {
          setDevOtp(res.data.devOtp);
          setOtpCode(res.data.devOtp);
        }
        setResendTimer(60);
        setStep("otp");
        toast.success("রেজিস্ট্রেশন সফল হয়েছে!", {
          description: "আপনার ইমেইলে ৬ ডিজিটের ওটিপি কোড পাঠানো হয়েছে।",
        });
      } else {
        const msg =
          res?.message ||
          "রেজিস্ট্রেশন সম্পূর্ণ করা যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।";
        setError(msg);
      }
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } }; message?: string })
          ?.response?.data?.message ||
        (err as Error)?.message ||
        "রেজিস্ট্রেশন ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP verification
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanCode = otpCode.trim();
    if (!cleanCode || cleanCode.length < 4) {
      setError("সঠিক ওটিপি কোড লিখুন");
      return;
    }

    try {
      setIsOtpLoading(true);
      const res = await authService.verifyOtp({
        email: email.trim().toLowerCase(),
        code: cleanCode,
      });

      if (res.success && res.data) {
        const { user, accessToken, token } = res.data;
        const validToken = accessToken || token;

        if (validToken) {
          setAuth(user, validToken);
          toast.success("অভিনন্দন! আপনার অ্যাকাউন্ট যাচাই সম্পন্ন হয়েছে।", {
            description: "কাছে মার্কেটপ্লেসে আপনাকে স্বাগতম!",
          });
          router.push(redirectUrl);
          router.refresh();
        } else {
          toast.error("ভেরিফিকেশন সম্পন্ন হলেও টোকেন পাওয়া যায়নি।");
        }
      } else {
        setError(res?.message || "ভুল ওটিপি কোড। পুনরায় পরীক্ষা করে লিখুন।");
      }
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } }; message?: string })
          ?.response?.data?.message ||
        (err as Error)?.message ||
        "ওটিপি যাচাই করা যায়নি।";
      setError(errorMsg);
    } finally {
      setIsOtpLoading(false);
    }
  };

  // Handle Resend OTP
  const handleResendOtp = async () => {
    if (resendTimer > 0 || isResendLoading || !email) return;

    try {
      setIsResendLoading(true);
      setError(null);
      const res = await authService.resendOtp({
        email: email.trim().toLowerCase(),
      });

      if (res.success) {
        setResendTimer(60);
        if (res.data?.devOtp) {
          setDevOtp(res.data.devOtp);
          setOtpCode(res.data.devOtp);
        }
        toast.success("নতুন ওটিপি কোড পাঠানো হয়েছে!", {
          description: "অনুগ্রহ করে আপনার ইনবক্স চেক করুন।",
        });
      } else {
        setError(res?.message || "ওটিপি পাঠাতে সমস্যা হয়েছে।");
      }
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } }; message?: string })
          ?.response?.data?.message ||
        (err as Error)?.message ||
        "ওটিপি পুনরায় পাঠাতে সমস্যা হয়েছে।";
      setError(errorMsg);
    } finally {
      setIsResendLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* View 1: Main Register Form */}
      {step === "form" ? (
        <>
          <div className="space-y-1.5 text-left">
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              নতুন অ্যাকাউন্ট খুলুন
            </h1>
            <p className="text-sm text-slate-500">
              কাছে কমিউনিটিতে যোগ দিয়ে খুব সহজেই কেনাবেচা শুরু করুন।
            </p>
          </div>

          <form onSubmit={handleRegister} className="space-y-3.5">
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium animate-in fade-in-50">
                ⚠️ {error}
              </div>
            )}

            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">পুরো নাম</label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="উদা: সায়মা রহমান"
                  className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 text-sm focus:bg-white focus:border-[#FF6F0F] focus:ring-1 focus:ring-[#FF6F0F]"
                />
              </div>
            </div>

            {/* Mobile Number */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">মোবাইল নম্বর</label>
              <div className="relative">
                <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="017xxxxxxxx"
                  className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 text-sm focus:bg-white focus:border-[#FF6F0F] focus:ring-1 focus:ring-[#FF6F0F]"
                />
              </div>
            </div>

            {/* Email Address */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                ইমেইল ঠিকানা (যাচাইকরণ কোড পাঠানো হবে)
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 text-sm focus:bg-white focus:border-[#FF6F0F] focus:ring-1 focus:ring-[#FF6F0F]"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700">
                পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <Input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-11 rounded-xl bg-[#FF6F0F] hover:bg-[#F95738] active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-orange-500/20 transition-all cursor-pointer mt-2"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  অ্যাকাউন্ট তৈরি হচ্ছে...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <span>পরবর্তী ধাপ (ওটিপি যাচাই)</span>
                  <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>

            {/* Already registered prompt */}
            <div className="text-center pt-2">
              <p className="text-xs text-slate-500">
                ইতিমধ্যে কাছে-তে অ্যাকাউন্ট আছে?{" "}
                <Link
                  href="/login"
                  className="text-[#FF6F0F] font-bold hover:underline"
                >
                  লগইন করুন
                </Link>
              </p>
            </div>
          </form>
        </>
      ) : (
        /* View 2: OTP Verification Step */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setStep("form")}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-[#FF6F0F] cursor-pointer transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>ফর্ম পরিবর্তন করুন</span>
            </button>
            <span className="text-xs font-bold text-[#FF6F0F] bg-orange-100/80 px-2.5 py-0.5 rounded-full">
              ধাপ ২: ওটিপি কোড
            </span>
          </div>

          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center h-14 w-14 rounded-2xl bg-orange-100 text-[#FF6F0F] shadow-xs">
              <KeyRound className="h-7 w-7" />
            </div>
            <h2 className="text-xl font-black text-slate-900">
              ইমেইল যাচাই করুন
            </h2>
            <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
              <span className="font-bold text-slate-800">{email}</span> ঠিকানায় ৬
              সংখ্যার ওটিপি কোড পাঠানো হয়েছে। কোডটি নিচে লিখুন।
            </p>
          </div>

          {/* Dev OTP Helper Banner if available */}
          {devOtp && (
            <div
              onClick={() => setOtpCode(devOtp)}
              className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between cursor-pointer hover:bg-amber-100/70 transition-colors"
            >
              <span className="flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                <span>
                  টেস্টিং ওটিপি: <strong>{devOtp}</strong>
                </span>
              </span>
              <span className="text-[10px] font-bold text-amber-700 bg-white px-2 py-0.5 rounded border border-amber-300">
                অটো-ফিল করুন
              </span>
            </div>
          )}

          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium animate-in fade-in-50">
              ⚠️ {error}
            </div>
          )}

          <form onSubmit={handleVerifyOtp} className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-bold text-slate-700 block text-center">
                ৬ সংখ্যার ওটিপি কোড
              </label>
              <div className="max-w-[240px] mx-auto">
                <Input
                  type="text"
                  maxLength={6}
                  required
                  value={otpCode}
                  onChange={(e) => {
                    const val = e.target.value.replace(/\D/g, "");
                    setOtpCode(val);
                  }}
                  placeholder="123456"
                  className="h-12 text-center text-xl tracking-[0.4em] font-mono font-bold rounded-xl bg-slate-50 border-slate-300 focus:bg-white focus:border-[#FF6F0F] focus:ring-2 focus:ring-orange-500/20"
                />
              </div>
            </div>

            <Button
              type="submit"
              disabled={isOtpLoading || otpCode.trim().length < 4}
              className="w-full h-11 rounded-xl bg-[#FF6F0F] hover:bg-[#F95738] active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-orange-500/20 transition-all cursor-pointer"
            >
              {isOtpLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  যাচাই করা হচ্ছে...
                </span>
              ) : (
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4" />
                  যাচাই ও প্রবেশ করুন
                </span>
              )}
            </Button>

            {/* Resend OTP */}
            <div className="text-center pt-1">
              {resendTimer > 0 ? (
                <p className="text-xs text-slate-400">
                  পুনরায় কোড পাঠাতে অপেক্ষা করুন:{" "}
                  <span className="font-bold text-slate-700">{resendTimer}s</span>
                </p>
              ) : (
                <button
                  type="button"
                  disabled={isResendLoading}
                  onClick={handleResendOtp}
                  className="inline-flex items-center gap-1 text-xs text-[#FF6F0F] hover:text-[#F95738] font-bold cursor-pointer transition-colors"
                >
                  {isResendLoading ? (
                    <Loader2 className="h-3 w-3 animate-spin mr-1" />
                  ) : (
                    <RotateCcw className="h-3 w-3 mr-0.5" />
                  )}
                  কোড পাননি? পুনরায় ওটিপি পাঠান
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default RegisterForm;
