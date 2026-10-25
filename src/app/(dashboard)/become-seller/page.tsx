"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "@/store/useAuthStore";
import { userService } from "@/services/user.service";
import { ILocationArea } from "@/types/user.types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Store,
  Sparkles,
  MapPin,
  Phone,
  ShieldCheck,
  Loader2,
} from "lucide-react";

export default function BecomeSellerPage() {
  const router = useRouter();
  const { user, isAuthenticated, hasHydrated, setUser, openAuthModal } = useAuthStore();
  const [isMounted, setIsMounted] = React.useState(false);

  const [shopName, setShopName] = React.useState("");
  const [bio, setBio] = React.useState("");
  const [termsAccepted, setTermsAccepted] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  // Quick area selection if area not set
  const [areas, setAreas] = React.useState<ILocationArea[]>([]);
  const [selectedAreaId, setSelectedAreaId] = React.useState<string>("");
  const [isUpdatingArea, setIsUpdatingArea] = React.useState(false);

  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Auth Guard: ONLY trigger AFTER hydration is complete
  React.useEffect(() => {
    if (isMounted && hasHydrated) {
      if (!isAuthenticated) {
        toast.info("সেলার অনবোর্ডিং করতে প্রথমে লগইন করুন");
        openAuthModal("login");
        router.push("/");
      }
    }
  }, [isMounted, hasHydrated, isAuthenticated, openAuthModal, router]);

  // Load areas if user has no area set
  React.useEffect(() => {
    if (isMounted && hasHydrated && isAuthenticated && !user?.areaId) {
      userService.getAreas().then((res) => {
        if (res.success && res.data) {
          setAreas(res.data);
          if (res.data.length > 0) {
            setSelectedAreaId(res.data[0].id);
          }
        }
      });
    }
  }, [isMounted, hasHydrated, isAuthenticated, user?.areaId]);

  const handleSetAreaQuickly = async () => {
    if (!selectedAreaId) return;
    try {
      setIsUpdatingArea(true);
      const res = await userService.updateProfile({ areaId: selectedAreaId });
      if (res.success && res.data) {
        setUser(res.data);
        toast.success("এলাকা সফলভাবে নির্ধারণ করা হয়েছে!");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "এলাকা সেট করা যায়নি।");
    } finally {
      setIsUpdatingArea(false);
    }
  };

  const handleOnboardSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!termsAccepted) {
      toast.error("সেলার হতে হলে আপনাকে শর্তাবলী মেনে নিতে হবে।");
      return;
    }

    if (!user?.areaId && !user?.phone) {
      toast.error("সেলার হওয়ার পূর্বে অনুগ্রহ করে একটি ডিফল্ট এলাকা বা ফোন নম্বর নিশ্চিত করুন।");
      return;
    }

    try {
      setIsLoading(true);
      const res = await userService.becomeSeller({
        termsAccepted: true,
        shopName: shopName.trim() || null,
        bio: bio.trim() || null,
      });

      if (res.success && res.data) {
        setUser(res.data);
        toast.success("অভিনন্দন! আপনি এখন কাছে মার্কেটপ্লেসের ভেরিফাইড বিক্রেতা।", {
          description: "এখনই আপনার প্রথম বিজ্ঞাপন পোস্ট করুন।",
        });
        router.push("/my-listings");
      }
    } catch (err: any) {
      const msg = err.response?.data?.message || "সেলার অনবোর্ডিং ব্যর্থ হয়েছে।";
      toast.error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isMounted || !hasHydrated) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Loader2 className="h-8 w-8 text-[#FF6F0F] animate-spin" />
        <p className="mt-3 text-sm text-slate-500 font-medium">লোড হচ্ছে...</p>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  // Already a Seller
  if (user.role === "SELLER") {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-slate-200 shadow-sm">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-3xl bg-emerald-100 text-emerald-700 mb-4">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h2 className="text-2xl font-black text-slate-900">
            আপনি ইতিমধ্যে একজন ভেরিফাইড বিক্রেতা!
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-md mx-auto">
            আপনার সেলার অ্যাকাউন্ট সক্রিয় রয়েছে। আপনি যেকোনো সময় বিজ্ঞাপন পোস্ট ও পরিচালনা করতে পারেন।
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/post-ad"
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-[#FF6F0F] hover:bg-[#F95738] text-white font-bold text-xs sm:text-sm shadow-md shadow-orange-500/25"
            >
              বিজ্ঞাপন দিন
            </Link>
            <Link
              href="/my-listings"
              className="w-full sm:w-auto px-6 py-3 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs sm:text-sm"
            >
              আমার বিজ্ঞাপন দেখুন
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Banner Header */}
        <div className="px-6 sm:px-10 py-8 bg-gradient-to-r from-orange-500 to-[#F95738] text-white">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold text-white mb-3">
            <Sparkles className="h-3.5 w-3.5" />
            <span>সেলার রেজিস্ট্রেশন</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            কাছে বিক্রেতা অনবোর্ডিং
          </h1>
          <p className="text-xs sm:text-sm text-orange-100 mt-1 max-w-xl">
            আপনার এলাকার ক্রেতাদের কাছে দ্রুত ও নিরাপদে পণ্য বিক্রি করতে আপনার বিক্রেতা প্রোফাইল সক্রিয় করুন।
          </p>
        </div>

        <form onSubmit={handleOnboardSubmit} className="p-6 sm:p-10 space-y-6">
          {/* Prerequisites Checklist */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
            <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
              প্রয়োজনীয় তথ্য যাচাই
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              {/* Phone Status */}
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-white border border-slate-200">
                <Phone className="h-4 w-4 text-[#FF6F0F]" />
                <div>
                  <p className="font-semibold text-slate-900">{user.phone}</p>
                  <p className="text-[10px] text-emerald-600 font-bold">✓ ফোন নম্বর যাচাইকৃত</p>
                </div>
              </div>

              {/* Area Status */}
              <div className="flex items-center justify-between p-2.5 rounded-xl bg-white border border-slate-200">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-[#FF6F0F]" />
                  <div>
                    <p className="font-semibold text-slate-900">
                      {user.locationArea?.bnName || user.area || "এলাকা সেট নেই"}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {user.areaId ? "✓ এলাকা নির্ধারিত" : "এলাকা নির্বাচন জরুরি"}
                    </p>
                  </div>
                </div>

                {!user.areaId && (
                  <Link
                    href="/profile"
                    className="text-[11px] font-bold text-[#FF6F0F] hover:underline"
                  >
                    সেট করুন
                  </Link>
                )}
              </div>
            </div>

            {/* Quick area assign if not set */}
            {!user.areaId && areas.length > 0 && (
              <div className="pt-2 flex flex-col sm:flex-row items-center gap-2">
                <select
                  value={selectedAreaId}
                  onChange={(e) => setSelectedAreaId(e.target.value)}
                  className="w-full sm:flex-1 h-9 px-3 rounded-xl bg-white border border-slate-300 text-xs font-medium text-slate-800"
                >
                  {areas.map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.bnName || a.name} {a.district ? `(${a.district.bnName || a.district.name})` : ""}
                    </option>
                  ))}
                </select>
                <Button
                  type="button"
                  size="sm"
                  disabled={isUpdatingArea}
                  onClick={handleSetAreaQuickly}
                  className="w-full sm:w-auto h-9 bg-[#FF6F0F] hover:bg-[#F95738] text-white text-xs font-bold rounded-xl"
                >
                  {isUpdatingArea ? "সেভ হচ্ছে..." : "এলাকা সেভ করুন"}
                </Button>
              </div>
            )}
          </div>

          {/* Shop Name */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">
              দোকান বা ব্র্যান্ডের নাম (ঐচ্ছিক)
            </label>
            <Input
              type="text"
              value={shopName}
              onChange={(e) => setShopName(e.target.value)}
              placeholder="উদা: সায়মার ক্লোজেট বা টেক কর্নার"
              className="h-11 rounded-2xl bg-slate-50 border-slate-200 text-sm focus:bg-white focus:border-[#FF6F0F]"
            />
            <p className="text-[11px] text-slate-400">
              ব্যক্তিগত পণ্য বিক্রির ক্ষেত্রে এটি খালি রাখতে পারেন। খালি রাখলে আপনার নিজের নাম প্রদর্শিত হবে।
            </p>
          </div>

          {/* Bio */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-800">
              বিক্রেতা পরিচিতি বা বায়ো (ঐচ্ছিক)
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="আপনার বা আপনার পণ্য সম্পর্কে দুই-এক লাইন লিখুন..."
              className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:border-[#FF6F0F] focus:outline-none focus:ring-1 focus:ring-[#FF6F0F]"
            />
          </div>

          {/* Terms and Conditions Checkbox */}
          <div className="p-4 rounded-2xl bg-orange-50/60 border border-orange-200">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                required
                checked={termsAccepted}
                onChange={(e) => setTermsAccepted(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#FF6F0F] focus:ring-[#FF6F0F]"
              />
              <span className="text-xs text-slate-700 leading-relaxed font-medium">
                আমি নিশ্চিত করছি যে আমি কোনো অবৈধ বা নকল পণ্য বিক্রি করব না এবং কাছে (Kache) প্ল্যাটফর্মের কমিউনিটি নীতি ও বিক্রেতা শর্তাবলী মেনে চলব।
              </span>
            </label>
          </div>

          {/* Submit Button */}
          <div className="pt-2">
            <Button
              type="submit"
              disabled={isLoading || !termsAccepted}
              className="w-full h-12 rounded-2xl bg-[#FF6F0F] hover:bg-[#F95738] active:scale-[0.99] text-white font-bold text-sm shadow-md shadow-orange-500/25 transition-all cursor-pointer"
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  অনবোর্ডিং সম্পন্ন হচ্ছে...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Store className="h-4 w-4" />
                  বিক্রেতা হিসেবে নিবন্ধন সম্পন্ন করুন
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
