"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/useAuthStore";
import { authService } from "@/services/auth.service";
import { DEMO_USERS, DemoUserAccount } from "@/constants/demo-users";
import { toast } from "sonner";
import {
  User,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowRight,
} from "lucide-react";

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect") || "/";
  const { setAuth } = useAuthStore();
  const [identifier, setIdentifier] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [showPassword, setShowPassword] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [loadingDemoId, setLoadingDemoId] = React.useState<string | null>(null);
  const [error, setError] = React.useState<string | null>(null);

  // Fast 1-Click Login for Demo Accounts
  const handleFastLogin = async (account: DemoUserAccount) => {
    setError(null);
    try {
      setLoadingDemoId(account.id);
      const res = await authService.login({
        email: account.email,
        password: account.password,
      });

      if (res?.success) {
        const { user, accessToken, token } = res.data;
        const validToken = accessToken || token;
        if (validToken) {
          setAuth(user, validToken);
          toast.success(res.message, { duration: 3000 });
          router.push(redirectUrl);
        } else {
          toast.error("লগইন টোকেন পাওয়া যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।");
        }
      } else {
        setError(res?.message || "ফাস্ট লগইন ব্যর্থ হয়েছে।");
      }
    } catch (err: unknown) {
      const errorMsg =
        (
          err as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (err as Error)?.message ||
        "লগইন সমস্যা হয়েছে।";
      setError(errorMsg);
    } finally {
      setLoadingDemoId(null);
    }
  };

  // Standard Form Submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanIdentifier = identifier.trim();
    if (!cleanIdentifier) {
      setError("ইমেইল অথবা মোবাইল নম্বর প্রদান করুন");
      return;
    }
    if (!password) {
      setError("পাসওয়ার্ড প্রদান করুন");
      return;
    }

    try {
      setIsLoading(true);
      const isEmail = cleanIdentifier.includes("@");
      const payload = isEmail
        ? { email: cleanIdentifier.toLowerCase(), password }
        : { phone: cleanIdentifier, password };

      const res = await authService.login(payload);

      if (res.success && res.data) {
        const { user, accessToken, token } = res.data;
        const validToken = accessToken || token;

        if (validToken) {
          setAuth(user, validToken);
          toast.success(`স্বাগতম, ${user.fullName}!`, {
            description: "কাছে মার্কেটপ্লেসে সফলভাবে লগইন হয়েছেন।",
          });
          router.push(redirectUrl);
          router.refresh();
        } else {
          toast.error("লগইন টোকেন পাওয়া যায়নি। আবার চেষ্টা করুন।");
        }
      } else {
        const msg =
          res?.message ||
          "লগইন ব্যর্থ হয়েছে। মোবাইল/ইমেইল এবং পাসওয়ার্ড সঠিক কিনা পরীক্ষা করুন।";
        setError(msg);
      }
    } catch (err: unknown) {
      const errorMsg =
        (
          err as {
            response?: { data?: { message?: string } };
            message?: string;
          }
        )?.response?.data?.message ||
        (err as Error)?.message ||
        "লগইন ব্যর্থ হয়েছে। পুনরায় চেষ্টা করুন।";
      setError(errorMsg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Title & Subtitle */}
      <div className="space-y-1.5 text-left">
        <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
          স্বাগতম কাছে-তে!
        </h1>
        <p className="text-sm text-slate-500">
          আপনার অ্যাকাউন্টে লগইন করে মার্কেটপ্লেসে কেনাবেচা শুরু করুন।
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {DEMO_USERS.map((acc) => {
          return (
            <button
              key={acc.id}
              type="button"
              disabled={Boolean(loadingDemoId) || isLoading}
              onClick={() => handleFastLogin(acc)}
              className="group relative flex flex-col justify-between p-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-200/80 hover:border-orange-300 shadow-2xs hover:shadow-xs transition-all text-left cursor-pointer active:scale-[0.98]"
            >
              <div className="flex items-center justify-between w-full">
                <span className="text-xs font-bold text-slate-900 truncate">
                  {acc.role}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Standard Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium space-y-1 animate-in fade-in-50">
            <div className="flex items-center gap-1.5 font-bold">
              <span>⚠️ {error}</span>
            </div>
            {error.toLowerCase().includes("verify") && (
              <Link
                href="/register"
                className="inline-block text-[#FF6F0F] font-bold hover:underline"
              >
                রেজিস্ট্রেশন ওটিপি যাচাই পেজে যান →
              </Link>
            )}
          </div>
        )}

        {/* Identifier Field */}
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-slate-700">
            ইমেইল অথবা মোবাইল নম্বর
          </label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              type="text"
              required
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="example@mail.com বা 017xxxxxxxx"
              className="pl-10 h-11 rounded-xl bg-slate-50 border-slate-200 text-sm focus:bg-white focus:border-[#FF6F0F] focus:ring-1 focus:ring-[#FF6F0F]"
            />
          </div>
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-slate-700">
              পাসওয়ার্ড
            </label>
            <Link
              href="/forget-password"
              className="text-xs font-semibold text-[#FF6F0F] hover:text-[#F95738] hover:underline transition-colors"
            >
              পাসওয়ার্ড ভুলে গেছেন?
            </Link>
          </div>
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
          disabled={isLoading || Boolean(loadingDemoId)}
          className="w-full h-11 rounded-xl bg-[#FF6F0F] hover:bg-[#F95738] active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-orange-500/20 transition-all cursor-pointer mt-2"
        >
          {isLoading ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              লগইন হচ্ছে...
            </span>
          ) : (
            <span className="flex items-center gap-1.5">
              <span>লগইন করুন</span>
              <ArrowRight className="h-4 w-4" />
            </span>
          )}
        </Button>

        {/* Register prompt */}
        <div className="text-center pt-2">
          <p className="text-xs text-slate-500">
            কাছে-তে এখনো কোনো অ্যাকাউন্ট নেই?{" "}
            <Link
              href="/register"
              className="text-[#FF6F0F] font-bold hover:underline"
            >
              নতুন অ্যাকাউন্ট খুলুন
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
}

export default LoginForm;
