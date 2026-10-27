"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/useAuthStore";
import { authService } from "@/services/auth.service";
import { toast } from "sonner";
import {
  ShoppingBag,
  Mail,
  Lock,
  Phone,
  User,
  Eye,
  EyeOff,
  ArrowLeft,
  KeyRound,
  RotateCcw,
  Loader2,
  CheckCircle2,
  Sparkles,
} from "lucide-react";

export function AuthModal() {
  const {
    isAuthModalOpen,
    closeAuthModal,
    authModalView,
    setAuthModalView,
    setAuth,
    otpEmail,
    setOtpEmail,
    devOtp,
    setDevOtp,
  } = useAuthStore();

  // Login form state
  const [loginIdentifier, setLoginIdentifier] = React.useState("");
  const [loginPassword, setLoginPassword] = React.useState("");
  const [showLoginPassword, setShowLoginPassword] = React.useState(false);
  const [isLoginLoading, setIsLoginLoading] = React.useState(false);
  const [loginError, setLoginError] = React.useState<string | null>(null);

  // Register form state
  const [registerName, setRegisterName] = React.useState("");
  const [registerPhone, setRegisterPhone] = React.useState("");
  const [registerEmail, setRegisterEmail] = React.useState("");
  const [registerPassword, setRegisterPassword] = React.useState("");
  const [showRegisterPassword, setShowRegisterPassword] = React.useState(false);
  const [isRegisterLoading, setIsRegisterLoading] = React.useState(false);
  const [registerError, setRegisterError] = React.useState<string | null>(null);

  // OTP form state
  const [otpCode, setOtpCode] = React.useState("");
  const [isOtpLoading, setIsOtpLoading] = React.useState(false);
  const [isResendLoading, setIsResendLoading] = React.useState(false);
  const [otpError, setOtpError] = React.useState<string | null>(null);
  const [resendTimer, setResendTimer] = React.useState(0);

  // Countdown timer for OTP resend
  React.useEffect(() => {
    let timer: NodeJS.Timeout;
    if (resendTimer > 0) {
      timer = setTimeout(() => setResendTimer((prev) => prev - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendTimer]);

  // Reset errors on tab switch
  React.useEffect(() => {
    setLoginError(null);
    setRegisterError(null);
    setOtpError(null);
  }, [authModalView]);

  // Handle Login Submission
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError(null);

    const trimmedIdentifier = loginIdentifier.trim();
    if (!trimmedIdentifier) {
      setLoginError("ইমেইল অথবা ফোন নম্বর দিন");
      return;
    }
    if (!loginPassword) {
      setLoginError("পাসওয়ার্ড লিখুন");
      return;
    }

    try {
      setIsLoginLoading(true);
      const isEmail = trimmedIdentifier.includes("@");
      const payload = isEmail
        ? { email: trimmedIdentifier.toLowerCase(), password: loginPassword }
        : { phone: trimmedIdentifier, password: loginPassword };

      const response = await authService.login(payload);

      if (response.success && response.data) {
        const { user, accessToken, token } = response.data;
        const validToken = accessToken || token;

        if (validToken) {
          setAuth(user, validToken);
          toast.success(`স্বাগতম, ${user.fullName}!`, {
            description: "কাছে মার্কেটপ্লেসে সফলভাবে লগইন হয়েছেন।",
          });
          closeAuthModal();
        } else {
          toast.error("লগইন টোকেন পাওয়া যায়নি। অনুগ্রহ করে আবার চেষ্টা করুন।");
        }
      } else {
        const msg =
          response?.message ||
          "লগইন ব্যর্থ হয়েছে। মোবাইল/ইমেইল এবং পাসওয়ার্ড যাচাই করুন।";
        setLoginError(msg);

        // If email is not verified, offer direct switch to OTP
        if (
          msg.toLowerCase().includes("verify your email") ||
          msg.toLowerCase().includes("verified")
        ) {
          if (loginIdentifier.includes("@")) {
            setOtpEmail(loginIdentifier.trim().toLowerCase());
          }
        }
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err?.message ||
        "লগইন ব্যর্থ হয়েছে। মোবাইল/ইমেইল এবং পাসওয়ার্ড যাচাই করুন।";
      setLoginError(msg);

      // If email is not verified, offer direct switch to OTP
      if (
        msg.toLowerCase().includes("verify your email") ||
        msg.toLowerCase().includes("verified")
      ) {
        if (loginIdentifier.includes("@")) {
          setOtpEmail(loginIdentifier.trim().toLowerCase());
        }
      }
    } finally {
      setIsLoginLoading(false);
    }
  };

  // Handle Register Submission
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setRegisterError(null);

    if (!registerName.trim()) {
      setRegisterError("আপনার পুরো নাম লিখুন");
      return;
    }
    if (!registerPhone.trim()) {
      setRegisterError("মোবাইল নম্বর লিখুন");
      return;
    }
    if (!registerEmail.trim() || !registerEmail.includes("@")) {
      setRegisterError("সঠিক ইমেইল ঠিকানা দিন");
      return;
    }
    if (registerPassword.length < 6) {
      setRegisterError("পাসওয়ার্ড কমপক্ষে ৬ অক্ষরের হতে হবে");
      return;
    }

    try {
      setIsRegisterLoading(true);
      const cleanEmail = registerEmail.trim().toLowerCase();
      const payload = {
        fullName: registerName.trim(),
        phone: registerPhone.trim(),
        email: cleanEmail,
        password: registerPassword,
      };

      const response = await authService.register(payload);

      if (response.success) {
        setOtpEmail(cleanEmail);
        if (response.data?.devOtp) {
          setDevOtp(response.data.devOtp);
          setOtpCode(response.data.devOtp);
        }
        setResendTimer(60);
        setAuthModalView("otp");
        toast.success("নিবন্ধন সফল হয়েছে!", {
          description: "আপনার ইমেইলে ৬ ডিজিটের ভেরিফিকেশন কোড পাঠানো হয়েছে।",
        });
      } else {
        const msg =
          response?.message ||
          "রেজিস্ট্রেশন সম্পূর্ণ করা যায়নি। পুনরায় চেষ্টা করুন।";
        setRegisterError(msg);
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err?.message ||
        "রেজিস্ট্রেশন সম্পূর্ণ করা যায়নি। পুনরায় চেষ্টা করুন।";
      setRegisterError(msg);
    } finally {
      setIsRegisterLoading(false);
    }
  };

  // Handle OTP Verification Submission
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setOtpError(null);

    const cleanCode = otpCode.trim();
    if (!cleanCode || cleanCode.length < 4) {
      setOtpError("সঠিক ওটিপি কোড লিখুন");
      return;
    }

    try {
      setIsOtpLoading(true);
      const response = await authService.verifyOtp({
        email: otpEmail,
        code: cleanCode,
      });

      if (response.success && response.data) {
        const { user, accessToken, token } = response.data;
        const validToken = accessToken || token;

        if (validToken) {
          setAuth(user, validToken);
          toast.success("অভিনন্দন! আপনার অ্যাকাউন্ট যাচাই সম্পন্ন হয়েছে।", {
            description: "স্বাগতম কাছে মার্কেটপ্লেসে!",
          });
          closeAuthModal();
        } else {
          toast.error("ভেরিফিকেশন সম্পন্ন হলেও টোকেন পাওয়া যায়নি।");
        }
      } else {
        const msg =
          response?.message ||
          "ভুল ওটিপি কোড। অনুগ্রহ করে সঠিক কোড দিন অথবা নতুন ওটিপি চান।";
        setOtpError(msg);
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message ||
        err?.message ||
        "ভুল ওটিপি কোড। অনুগ্রহ করে সঠিক কোড দিন অথবা নতুন ওটিপি চান।";
      setOtpError(msg);
    } finally {
      setIsOtpLoading(false);
    }
  };

  // Handle Resend OTP
  const handleResendOtp = async () => {
    if (resendTimer > 0 || isResendLoading || !otpEmail) return;

    try {
      setIsResendLoading(true);
      setOtpError(null);
      const response = await authService.resendOtp({ email: otpEmail });

      if (response.success) {
        setResendTimer(60);
        if (response.data?.devOtp) {
          setDevOtp(response.data.devOtp);
          setOtpCode(response.data.devOtp);
        }
        toast.success("নতুন ওটিপি কোড পাঠানো হয়েছে!", {
          description: "অনুগ্রহ করে আপনার ইমেইল ইনবক্স চেক করুন।",
        });
      } else {
        const msg = response?.message || "ওটিপি পুনরায় পাঠাতে সমস্যা হয়েছে।";
        setOtpError(msg);
      }
    } catch (err: any) {
      const msg =
        err.response?.data?.message || err?.message || "ওটিপি পুনরায় পাঠাতে সমস্যা হয়েছে।";
      setOtpError(msg);
    } finally {
      setIsResendLoading(false);
    }
  };

  return (
    <Dialog open={isAuthModalOpen} onOpenChange={(open) => !open && closeAuthModal()}>
      <DialogContent className="sm:max-w-[420px] p-0 overflow-hidden rounded-3xl bg-white shadow-2xl border-slate-200/90 gap-0">
        {/* Karrot-inspired Header with Sunset Accent */}
        <div className="relative px-6 pt-6 pb-4 bg-gradient-to-b from-orange-50/80 via-orange-50/30 to-white border-b border-orange-100/50">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-[#FF6F0F] to-[#F95738] flex items-center justify-center text-white shadow-md shadow-orange-500/25">
              <ShoppingBag className="h-5 w-5 stroke-[2.2]" />
            </div>
            <div>
              <DialogTitle className="text-xl font-black tracking-tight text-slate-900 leading-none">
                কাছে <span className="text-[#FF6F0F] font-semibold text-xs tracking-wider uppercase ml-1">Kache</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500 mt-1">
                আপনার পাড়ার বিশ্বস্ত কমিউনিটি মার্কেটপ্লেস
              </DialogDescription>
            </div>
          </div>

          {/* Tab buttons for Login / Register (Only shown when not in OTP view) */}
          {authModalView !== "otp" ? (
            <div className="mt-4 flex p-1 rounded-xl bg-slate-100/90 border border-slate-200/60">
              <button
                type="button"
                onClick={() => setAuthModalView("login")}
                className={`flex-1 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                  authModalView === "login"
                    ? "bg-white text-[#FF6F0F] shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                লগইন
              </button>
              <button
                type="button"
                onClick={() => setAuthModalView("register")}
                className={`flex-1 py-1.5 text-xs sm:text-sm font-bold rounded-lg transition-all cursor-pointer ${
                  authModalView === "register"
                    ? "bg-white text-[#FF6F0F] shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                নতুন অ্যাকাউন্ট
              </button>
            </div>
          ) : (
            /* OTP View Header Back Action */
            <div className="mt-3 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setAuthModalView("register")}
                className="inline-flex items-center gap-1.5 text-xs text-slate-600 hover:text-[#FF6F0F] font-medium transition-colors cursor-pointer"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>পিছনে যান</span>
              </button>
              <span className="text-xs font-semibold text-[#FF6F0F] bg-orange-100/70 px-2.5 py-0.5 rounded-full">
                ওটিপি যাচাই
              </span>
            </div>
          )}
        </div>

        {/* Modal Body / Active View Form */}
        <div className="px-6 py-5">
          {/* ========================================================= */}
          {/* LOGIN VIEW */}
          {/* ========================================================= */}
          {authModalView === "login" && (
            <form onSubmit={handleLogin} className="space-y-4">
              {loginError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex flex-col gap-1.5 animate-in fade-in-50">
                  <div className="font-semibold flex items-center gap-1.5">
                    <span>⚠️ {loginError}</span>
                  </div>
                  {loginError.toLowerCase().includes("verify") && (
                    <button
                      type="button"
                      onClick={() => {
                        if (loginIdentifier.includes("@")) {
                          setOtpEmail(loginIdentifier.trim().toLowerCase());
                        }
                        setAuthModalView("otp");
                      }}
                      className="text-left text-[#FF6F0F] underline font-bold hover:text-[#F95738] mt-0.5"
                    >
                      এখনই ওটিপি ভেরিফাই করুন →
                    </button>
                  )}
                </div>
              )}

              {/* Email / Phone Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700">
                  ইমেইল অথবা মোবাইল নম্বর
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    required
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    placeholder="example@mail.com বা 017xxxxxxxx"
                    className="pl-10 h-10 rounded-xl bg-slate-50 border-slate-200 text-sm focus:bg-white focus:border-[#FF6F0F] focus:ring-1 focus:ring-[#FF6F0F]"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-700">
                    পাসওয়ার্ড
                  </label>
                  <span className="text-[11px] text-slate-400 hover:text-[#FF6F0F] cursor-pointer">
                    ভুলে গেছেন?
                  </span>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type={showLoginPassword ? "text" : "password"}
                    required
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 pr-10 h-10 rounded-xl bg-slate-50 border-slate-200 text-sm focus:bg-white focus:border-[#FF6F0F] focus:ring-1 focus:ring-[#FF6F0F]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword((prev) => !prev)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showLoginPassword ? (
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
                disabled={isLoginLoading}
                className="w-full h-11 rounded-xl bg-[#FF6F0F] hover:bg-[#F95738] active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-orange-500/20 transition-all cursor-pointer"
              >
                {isLoginLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    লগইন হচ্ছে...
                  </span>
                ) : (
                  "লগইন করুন"
                )}
              </Button>

              <div className="text-center pt-2">
                <p className="text-xs text-slate-500">
                  অ্যাকাউন্ট নেই?{" "}
                  <button
                    type="button"
                    onClick={() => setAuthModalView("register")}
                    className="text-[#FF6F0F] font-bold hover:underline cursor-pointer"
                  >
                    নতুন অ্যাকাউন্ট খুলুন
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* ========================================================= */}
          {/* REGISTER VIEW */}
          {/* ========================================================= */}
          {authModalView === "register" && (
            <form onSubmit={handleRegister} className="space-y-3.5">
              {registerError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium animate-in fade-in-50">
                  ⚠️ {registerError}
                </div>
              )}

              {/* Full Name */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  পুরো নাম
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    required
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    placeholder="উদা: সায়মা রহমান"
                    className="pl-10 h-10 rounded-xl bg-slate-50 border-slate-200 text-sm focus:bg-white focus:border-[#FF6F0F] focus:ring-1 focus:ring-[#FF6F0F]"
                  />
                </div>
              </div>

              {/* Phone Number */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  মোবাইল নম্বর
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="tel"
                    required
                    value={registerPhone}
                    onChange={(e) => setRegisterPhone(e.target.value)}
                    placeholder="017xxxxxxxx"
                    className="pl-10 h-10 rounded-xl bg-slate-50 border-slate-200 text-sm focus:bg-white focus:border-[#FF6F0F] focus:ring-1 focus:ring-[#FF6F0F]"
                  />
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  ইমেইল ঠিকানা (ওটিপি পাঠানো হবে)
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="email"
                    required
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="pl-10 h-10 rounded-xl bg-slate-50 border-slate-200 text-sm focus:bg-white focus:border-[#FF6F0F] focus:ring-1 focus:ring-[#FF6F0F]"
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-700">
                  পাসওয়ার্ড (কমপক্ষে ৬ অক্ষর)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type={showRegisterPassword ? "text" : "password"}
                    required
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    placeholder="••••••••"
                    className="pl-10 pr-10 h-10 rounded-xl bg-slate-50 border-slate-200 text-sm focus:bg-white focus:border-[#FF6F0F] focus:ring-1 focus:ring-[#FF6F0F]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowRegisterPassword((prev) => !prev)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  >
                    {showRegisterPassword ? (
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
                disabled={isRegisterLoading}
                className="w-full h-11 rounded-xl bg-[#FF6F0F] hover:bg-[#F95738] active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-orange-500/20 transition-all cursor-pointer mt-2"
              >
                {isRegisterLoading ? (
                  <span className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    অ্যাকাউন্ট তৈরি হচ্ছে...
                  </span>
                ) : (
                  "পরবর্তী ধাপ (ওটিপি পাঠান)"
                )}
              </Button>

              <div className="text-center pt-1">
                <p className="text-xs text-slate-500">
                  ইতিমধ্যে অ্যাকাউন্ট আছে?{" "}
                  <button
                    type="button"
                    onClick={() => setAuthModalView("login")}
                    className="text-[#FF6F0F] font-bold hover:underline cursor-pointer"
                  >
                    লগইন করুন
                  </button>
                </p>
              </div>
            </form>
          )}

          {/* ========================================================= */}
          {/* OTP VERIFICATION VIEW */}
          {/* ========================================================= */}
          {authModalView === "otp" && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div className="text-center space-y-1.5 pb-1">
                <div className="inline-flex items-center justify-center h-12 w-12 rounded-2xl bg-orange-100 text-[#FF6F0F] mb-1">
                  <KeyRound className="h-6 w-6" />
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  ইমেইল ভেরিফিকেশন কোড দিন
                </h3>
                <p className="text-xs text-slate-500 max-w-[280px] mx-auto leading-relaxed">
                  <span className="font-semibold text-slate-700">{otpEmail}</span> ঠিকানায় একটি ৬-সংখ্যার ওটিপি কোড পাঠানো হয়েছে।
                </p>
              </div>

              {/* Dev OTP Helper Banner (if available) */}
              {devOtp && (
                <div
                  onClick={() => setOtpCode(devOtp)}
                  className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-center justify-between cursor-pointer hover:bg-amber-100/70 transition-colors"
                >
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="h-3.5 w-3.5 text-amber-600" />
                    <span>টেস্টিং ওটিপি: <strong>{devOtp}</strong></span>
                  </span>
                  <span className="text-[10px] font-bold text-amber-700 bg-white px-2 py-0.5 rounded border border-amber-300">
                    অটো-ফিল
                  </span>
                </div>
              )}

              {otpError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium animate-in fade-in-50">
                  ⚠️ {otpError}
                </div>
              )}

              {/* OTP Code Input */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-700 block text-center">
                  ৬ সংখ্যার কোড
                </label>
                <div className="relative max-w-[240px] mx-auto">
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

              {/* Submit Verification Button */}
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
                    যাচাই ও লগইন করুন
                  </span>
                )}
              </Button>

              {/* Resend OTP button */}
              <div className="text-center pt-1">
                {resendTimer > 0 ? (
                  <p className="text-xs text-slate-400">
                    পুনরায় ওটিপি পাঠাতে অপেক্ষা করুন:{" "}
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
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default AuthModal;
