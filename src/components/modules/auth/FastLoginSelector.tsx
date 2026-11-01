"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { DEMO_USERS, DemoUserAccount } from "@/constants/demo-users";
import { useAuthStore } from "@/store/useAuthStore";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";
import {
  ShieldAlert,
  ShieldCheck,
  Store,
  ShoppingBag,
  Zap,
  Loader2,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

interface FastLoginSelectorProps {
  onFillCredentials?: (email: string, pass: string) => void;
  onSuccess?: () => void;
  variant?: "modal" | "widget" | "menu";
}

export function FastLoginSelector({
  onFillCredentials,
  onSuccess,
  variant = "modal",
}: FastLoginSelectorProps) {
  const router = useRouter();
  const { setAuth, user: currentUser } = useAuthStore();
  const [loadingRoleId, setLoadingRoleId] = React.useState<string | null>(null);

  const getRoleIcon = (role: DemoUserAccount["role"]) => {
    switch (role) {
      case "SUPER_ADMIN":
        return <ShieldAlert className="h-4 w-4 text-purple-600" />;
      case "ADMIN":
        return <ShieldCheck className="h-4 w-4 text-indigo-600" />;
      case "SELLER":
        return <Store className="h-4 w-4 text-emerald-600" />;
      case "USER":
      default:
        return <ShoppingBag className="h-4 w-4 text-orange-600" />;
    }
  };

  const handle1ClickLogin = async (
    account: DemoUserAccount,
    e?: React.MouseEvent
  ) => {
    if (e) e.stopPropagation();
    try {
      setLoadingRoleId(account.id);
      const res = await authService.login({
        email: account.email,
        password: account.password,
      });

      if (res.success && res.data) {
        const { user, accessToken, token } = res.data;
        const validToken = accessToken || token;

        if (validToken) {
          setAuth(user, validToken);
          toast.success(`স্বাগতম, ${user.fullName}!`, {
            description: `${account.roleTitle} (${account.shopOrDetails}) হিসেবে লগইন সম্পন্ন হয়েছে।`,
          });
          onSuccess?.();
          router.refresh();
        } else {
          toast.error("লগইন টোকেন পাওয়া যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।");
        }
      } else {
        toast.error(res?.message || "লগইন সম্পন্ন করা যায়নি।");
      }
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } }; message?: string })
          ?.response?.data?.message ||
        (err as Error)?.message ||
        "লগইন সমস্যা হয়েছে।";
      toast.error(errorMsg);
    } finally {
      setLoadingRoleId(null);
    }
  };

  if (variant === "widget") {
    return (
      <div className="flex flex-col gap-2 p-1">
        {DEMO_USERS.map((acc) => {
          const isCurrent = currentUser?.email === acc.email;
          const isLoading = loadingRoleId === acc.id;

          return (
            <div
              key={acc.id}
              onClick={() => handle1ClickLogin(acc)}
              className={`group flex items-center justify-between p-2.5 rounded-xl border transition-all cursor-pointer ${
                isCurrent
                  ? "bg-orange-50/70 border-orange-300 ring-1 ring-orange-400"
                  : "bg-white hover:bg-slate-50 border-slate-200/80 hover:border-slate-300 hover:shadow-xs"
              }`}
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div
                  className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 bg-gradient-to-br ${acc.avatarBg} text-white shadow-2xs`}
                >
                  {getRoleIcon(acc.role)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold text-slate-800 truncate">
                      {acc.fullName}
                    </span>
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${acc.badgeClass}`}
                    >
                      {acc.roleTitle}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">
                    {acc.shopOrDetails} • {acc.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1 shrink-0 ml-2">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                ) : isCurrent ? (
                  <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    <CheckCircle2 className="h-3 w-3 mr-0.5" /> অ্যাক্টিভ
                  </span>
                ) : (
                  <button
                    type="button"
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold bg-[#FF6F0F] group-hover:bg-[#F95738] text-white shadow-2xs transition-all active:scale-95"
                  >
                    <Zap className="h-3 w-3 fill-current" />
                    <span>লগইন</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  }

  // Default Modal Variant (Clean 2x2 grid with 1-click & auto-fill actions)
  return (
    <div className="space-y-2.5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-3.5 w-3.5 text-[#FF6F0F]" />
          <span className="text-xs font-bold text-slate-700">
            ১-ক্লিক ফাস্ট লগইন (টেস্টিং রোলসমূহ)
          </span>
        </div>
        <span className="text-[10px] text-slate-400">সরাসরি লগইন করুন</span>
      </div>

      <div className="grid grid-cols-2 gap-2">
        {DEMO_USERS.map((acc) => {
          const isLoading = loadingRoleId === acc.id;
          const isCurrent = currentUser?.email === acc.email;

          return (
            <div
              key={acc.id}
              className={`relative flex flex-col justify-between p-2.5 rounded-xl border text-left transition-all ${
                isCurrent
                  ? "bg-orange-50/80 border-orange-300 ring-1 ring-orange-400"
                  : "bg-slate-50/90 hover:bg-slate-100/80 border-slate-200/80 hover:border-slate-300"
              }`}
            >
              {/* Top Row: Role Badge & Icon */}
              <div className="flex items-center justify-between gap-1 mb-1.5">
                <span
                  className={`text-[9px] font-bold px-1.5 py-0.5 rounded-md border inline-flex items-center gap-1 truncate ${acc.badgeClass}`}
                >
                  {getRoleIcon(acc.role)}
                  <span>{acc.roleTitle}</span>
                </span>

                {onFillCredentials && (
                  <button
                    type="button"
                    title="ফর্ম অটো-ফিল করুন"
                    onClick={(e) => {
                      e.stopPropagation();
                      onFillCredentials(acc.email, acc.password);
                    }}
                    className="text-[10px] font-medium text-slate-400 hover:text-slate-700 underline px-1 py-0.5"
                  >
                    ফিল
                  </button>
                )}
              </div>

              {/* User details */}
              <div className="min-w-0 mb-2">
                <p className="text-xs font-bold text-slate-900 truncate leading-tight">
                  {acc.fullName}
                </p>
                <p className="text-[10px] text-slate-500 truncate leading-tight mt-0.5">
                  {acc.shopOrDetails}
                </p>
              </div>

              {/* 1-Click Login Action */}
              <button
                type="button"
                disabled={isLoading}
                onClick={(e) => handle1ClickLogin(acc, e)}
                className={`w-full py-1.5 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                  isCurrent
                    ? "bg-emerald-600 text-white"
                    : "bg-white hover:bg-slate-900 hover:text-white text-slate-800 border border-slate-200 shadow-2xs active:scale-[0.98]"
                }`}
              >
                {isLoading ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-orange-500" />
                ) : isCurrent ? (
                  <span className="flex items-center gap-1 text-[11px]">
                    <CheckCircle2 className="h-3 w-3" /> অ্যাক্টিভ
                  </span>
                ) : (
                  <>
                    <Zap className="h-3 w-3 text-[#FF6F0F] fill-[#FF6F0F]" />
                    <span className="text-[11px]">১-ক্লিক লগইন</span>
                  </>
                )}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
