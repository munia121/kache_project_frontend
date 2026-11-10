/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { DEMO_USERS, DemoUserAccount } from "@/constants/demo-users";
import { useAuthStore } from "@/store/useAuthStore";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";
import {
  Zap,
  X,
  ShieldAlert,
  ShieldCheck,
  Store,
  ShoppingBag,
  Loader2,
  CheckCircle2,
  LogOut,
  ChevronUp,
  ChevronDown,
  KeyRound,
  Copy,
  Check,
} from "lucide-react";

export function FastLoginWidget() {
  const router = useRouter();
  const { user, isAuthenticated, hasHydrated, setAuth, logout } = useAuthStore();
  const [isOpen, setIsOpen] = React.useState(false);
  const [loadingRoleId, setLoadingRoleId] = React.useState<string | null>(null);
  const [copiedAccount, setCopiedAccount] = React.useState<string | null>(null);

  // Avoid hydration mismatch
  const [isMounted, setIsMounted] = React.useState(false);
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || !hasHydrated) {
    return null;
  }

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

  const handle1ClickLogin = async (account: DemoUserAccount) => {
    try {
      setLoadingRoleId(account.id);
      const res = await authService.login({
        email: account.email,
        password: account.password,
      });

      if (res.success && res.data) {
        const { user: loggedInUser, accessToken, token } = res.data;
        const validToken = accessToken || token;

        if (validToken) {
          setAuth(loggedInUser, validToken);
          toast.success(`স্বাগতম, ${loggedInUser.fullName}!`, {
            description: `${account.roleTitle} (${account.shopOrDetails}) হিসেবে লগইন হয়েছে।`,
          });
          setIsOpen(false);
          router.refresh();
        } else {
          toast.error("লগইন টোকেন পাওয়া যায়নি");
        }
      } else {
        toast.error(res?.message || "লগইন সম্পন্ন করা যায়নি");
      }
    } catch (err: unknown) {
      const errorMsg =
        (err as { response?: { data?: { message?: string } }; message?: string })
          ?.response?.data?.message ||
        (err as Error)?.message ||
        "লগইন সমস্যা হয়েছে";
      toast.error(errorMsg);
    } finally {
      setLoadingRoleId(null);
    }
  };

  const handleLogout = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("kache_access_token");
    }
    logout();
    authService.logout();
    toast.success("সফলভাবে লগআউট হয়েছে");
    router.refresh();
  };

  const handleCopyCredentials = (account: DemoUserAccount, e: React.MouseEvent) => {
    e.stopPropagation();
    const text = `Email: ${account.email}\nPassword: ${account.password}`;
    navigator.clipboard.writeText(text);
    setCopiedAccount(account.id);
    toast.success(`${account.roleTitle} এর তথ্য কপি করা হয়েছে!`);
    setTimeout(() => setCopiedAccount(null), 2000);
  };

  return (
    <div className="fixed bottom-4 left-4 z-50 print:hidden font-sans">
      {/* Popover Card */}
      {isOpen && (
        <div className="mb-3 w-84 sm:w-96 rounded-2xl bg-white shadow-2xl border border-slate-200/90 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          {/* Header */}
          <div className="p-3.5 bg-linear-to-r from-slate-900 via-slate-800 to-slate-900 text-white flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 rounded-lg bg-linear-to-br from-[#FF6F0F] to-[#F95738] flex items-center justify-center text-white shadow-xs">
                <Zap className="h-4 w-4 fill-white" />
              </div>
              <div>
                <h4 className="text-xs font-bold leading-none flex items-center gap-1.5">
                  <span>ফাস্ট লগইন সিস্টেম</span>
                  <span className="text-[10px] bg-orange-500/20 text-orange-300 font-semibold px-1.5 py-0.2 rounded border border-orange-500/30">
                    DEMO
                  </span>
                </h4>
                <p className="text-[10px] text-slate-400 mt-0.5">
                  এক ক্লিকে যেকোনো টেস্ট রোলে সুইচ করুন
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="p-1 rounded-lg hover:bg-slate-700/80 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Current Auth Status Card */}
          <div className="p-3 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-2 w-2 rounded-full shrink-0 animate-pulse bg-emerald-500" />
              <div className="min-w-0">
                <p className="text-[11px] text-slate-500 leading-tight">বর্তমান অবস্থা:</p>
                {isAuthenticated && user ? (
                  <p className="text-xs font-bold text-slate-800 truncate">
                    {user.fullName} ({user.role})
                  </p>
                ) : (
                  <p className="text-xs font-bold text-amber-700">লগইন করা নেই</p>
                )}
              </div>
            </div>

            {isAuthenticated && (
              <button
                type="button"
                onClick={handleLogout}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors cursor-pointer"
              >
                <LogOut className="h-3 w-3" />
                <span>লগআউট</span>
              </button>
            )}
          </div>

          {/* User Account List */}
          <div className="p-2.5 max-h-85 overflow-y-auto space-y-1.5 divide-y divide-slate-100">
            {DEMO_USERS.map((acc) => {
              const isCurrent = user?.email === acc.email;
              const isLoading = loadingRoleId === acc.id;

              return (
                <div
                  key={acc.id}
                  onClick={() => !isLoading && handle1ClickLogin(acc)}
                  className={`pt-1.5 first:pt-0 group flex items-center justify-between p-2 rounded-xl transition-all cursor-pointer ${
                    isCurrent
                      ? "bg-orange-50/70 border border-orange-200 ring-1 ring-orange-300"
                      : "hover:bg-slate-50 border border-transparent hover:border-slate-200"
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 bg-linear-to-br ${acc.avatarBg} text-white shadow-2xs`}
                    >
                      {getRoleIcon(acc.role)}
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {acc.fullName}
                        </span>
                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.2 rounded border ${acc.badgeClass}`}
                        >
                          {acc.roleTitle}
                        </span>
                      </div>
                      <p className="text-[10px] text-slate-500 truncate">
                        {acc.shopOrDetails} • {acc.email}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0 ml-2">
                    <button
                      type="button"
                      title="তথ্য কপি করুন"
                      onClick={(e) => handleCopyCredentials(acc, e)}
                      className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
                    >
                      {copiedAccount === acc.id ? (
                        <Check className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <Copy className="h-3.5 w-3.5" />
                      )}
                    </button>

                    {isLoading ? (
                      <Loader2 className="h-4 w-4 animate-spin text-orange-500" />
                    ) : isCurrent ? (
                      <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        <CheckCircle2 className="h-3 w-3 mr-0.5" /> অ্যাক্টিভ
                      </span>
                    ) : (
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-[#FF6F0F] group-hover:bg-[#F95738] text-white shadow-2xs transition-all active:scale-95"
                      >
                        <Zap className="h-3 w-3 fill-current" />
                        <span>সুইচ</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer note */}
          <div className="px-3 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500">
            <span className="flex items-center gap-1">
              <KeyRound className="h-3 w-3 text-slate-400" />
              পাসওয়ার্ড: <strong className="text-slate-700 font-mono">Password123@</strong>
            </span>
            <span className="text-slate-400">কাছে মার্কেটপ্লেস</span>
          </div>
        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="group flex items-center gap-2 px-3 py-2 rounded-full bg-slate-900/90 hover:bg-slate-900 text-white shadow-xl hover:shadow-2xl border border-slate-700/80 backdrop-blur-md transition-all active:scale-95 cursor-pointer"
        aria-label="Fast Login Quick Switcher"
      >
        <div className="h-6 w-6 rounded-full bg-[#FF6F0F] flex items-center justify-center text-white shadow-2xs group-hover:rotate-12 transition-transform">
          <Zap className="h-3.5 w-3.5 fill-current" />
        </div>
        <div className="flex flex-col text-left pr-1">
          <span className="text-[11px] font-bold tracking-tight leading-none text-slate-100 flex items-center gap-1">
            <span>Fast Login</span>
            {isAuthenticated && user && (
              <span
                className={`text-[8px] font-bold px-1.5 py-0.2 rounded-full ${
                  user.role === "SELLER"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30"
                    : user.role === "ADMIN" || user.role === "SUPER_ADMIN"
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/30"
                    : "bg-orange-500/20 text-orange-300 border border-orange-500/30"
                }`}
              >
                {user.role}
              </span>
            )}
          </span>
          <span className="text-[9px] text-slate-400 leading-tight">
            {isAuthenticated && user ? user.fullName : "৪টি টেস্ট অ্যাকাউন্ট"}
          </span>
        </div>
        {isOpen ? (
          <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-hover:text-white transition-colors" />
        ) : (
          <ChevronUp className="h-3.5 w-3.5 text-slate-400 group-hover:text-white transition-colors" />
        )}
      </button>
    </div>
  );
}
