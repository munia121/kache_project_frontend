/* eslint-disable react-hooks/set-state-in-effect */
"use client"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Edit3, Loader2, MapPin, Phone, Search, Store } from "lucide-react";
import { Input } from "../ui/input";
import { Button } from "../ui/button";
import { toast } from "sonner";
import { Dispatch, FormEvent, SetStateAction, useCallback, useEffect, useState } from "react";
import { ILocationArea, UpdateProfilePayload, User, UserRole } from "@/types/user.types";
import { userService } from "@/services/user.service";

type EditProfileProps = {
  isEditProfileOpen: boolean;
  setIsEditProfileOpen: Dispatch<SetStateAction<boolean>>;
  editAreaId: string;
  setEditAreaId: Dispatch<SetStateAction<string>>;
  editRole: UserRole;
  setEditRole: Dispatch<SetStateAction<UserRole>>;
  user: User | null;
  setUser: (user: User) => void;
  handleOpenAreaModal: () => Promise<void>;
  areasList: ILocationArea[];
  isLoadingAreas: boolean;
  isSwitchingRole: boolean;
  setIsConfirmSwitchOpen: Dispatch<SetStateAction<boolean>>;
};

const EditProfile = ({
  isEditProfileOpen,
  setIsEditProfileOpen,
  editAreaId,
  setEditAreaId,
  editRole,
  setEditRole,
  user,
  setUser,
  handleOpenAreaModal,
  areasList,
  isLoadingAreas,
  isSwitchingRole,
  setIsConfirmSwitchOpen,
}: EditProfileProps) => {
  const [editFullName, setEditFullName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editAddress, setEditAddress] = useState("");
  const [editShopName, setEditShopName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [isSavingProfile, setIsSavingProfile] = useState(false);
    

const handleSaveProfile = async (e: FormEvent) => {
    e.preventDefault();

    // 1. Full Name Validation
    if (!editFullName.trim()) {
      toast.error("নাম খালি রাখা যাবে না");
      return;
    }

    // 2. Phone Number 11-digit Validation
    const cleanedPhone = editPhone.trim().replace(/[\s-]/g, "");
    if (!cleanedPhone) {
      toast.error("ফোন নম্বর লিখুন");
      return;
    }
    if (!/^\d{11}$/.test(cleanedPhone)) {
      toast.error("ফোন নম্বর অবশ্যই ১১ ডিজিটের হতে হবে (যেমন: 01700000000)");
      return;
    }

    try {
      setIsSavingProfile(true);

      const isSeller = editRole === "SELLER";
      const payload: UpdateProfilePayload = {
        fullName: editFullName.trim(),
        phone: cleanedPhone,
        areaId: editAreaId || null,
        address: editAddress.trim() || null,
        role: editRole,
        shopName: isSeller ? (editShopName.trim() || null) : null,
        bio: isSeller ? (editBio.trim() || null) : null,
      };

      const res = await userService.updateProfile(payload);

      if (res.success && res.data) {
        setUser(res.data);

        // Refresh profile in background to get populated fields
        userService
          .getMyProfile()
          .then((fresh) => {
            if (fresh.success && fresh.data) {
              setUser(fresh.data);
            }
          })
          .catch(() => {});

        toast.success("তথ্য সফলভাবে আপডেট করা হয়েছে");
        setIsEditProfileOpen(false);
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      const msg =
        errorObj.response?.data?.message ||
        errorObj.message ||
        "প্রোফাইল আপডেট করতে ব্যর্থ হয়েছে।";
      toast.error(msg);
    } finally {
      setIsSavingProfile(false);
    }
  };

   const populateFormData = useCallback(() => {
      if (user) {
        setEditFullName(user.fullName || "");
        setEditPhone(user.phone || "");
        setEditAreaId(user.areaId || user.locationArea?.id || "");
        setEditAddress(user.address || "");
        setEditRole(user.role || "USER");
        setEditShopName(user.shopName || "");
        setEditBio(user.bio || "");
      }
    }, [user, setEditAreaId, setEditRole]);

  useEffect(() => {
    if (isEditProfileOpen && user) {
      populateFormData();
    }
  }, [isEditProfileOpen, user, populateFormData]);
  


    return (
       <Dialog open={isEditProfileOpen} onOpenChange={setIsEditProfileOpen}>
        <DialogContent className="w-full max-w-[calc(100%-2rem)] sm:max-w-lg max-h-[90vh] flex flex-col p-0 rounded-2xl sm:rounded-3xl bg-white shadow-2xl border-slate-200 overflow-hidden">
          <DialogHeader className="p-4 sm:p-6 pb-3 sm:pb-4 border-b border-slate-100 shrink-0">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-2xl bg-orange-100 text-[#FF6F0F] flex items-center justify-center shrink-0">
                <Edit3 className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-slate-900">
                  তথ্য পরিবর্তন করুন
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-500">
                  আপনার ব্যক্তিগত, যোগাযোগ ও অ্যাকাউন্টের বিবরণ আপডেট করুন
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>

          <form onSubmit={handleSaveProfile} className="flex-1 flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {/* Full Name */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                  <span>পুরো নাম</span>
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Edit3 className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="text"
                    required
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    placeholder="আপনার পুরো নাম"
                    className="pl-10 h-11 rounded-2xl bg-slate-50 border-slate-200 text-sm focus:bg-white focus:border-[#FF6F0F]"
                  />
                </div>
              </div>

              {/* Phone Number (11-digit validation) */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <span>ফোন নম্বর</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <span className="text-[11px] text-slate-400">১১ ডিজিট</span>
                </div>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <Input
                    type="tel"
                    required
                    maxLength={14}
                    value={editPhone}
                    onChange={(e) => setEditPhone(e.target.value)}
                    placeholder="01XXXXXXXXX"
                    className="pl-10 h-11 rounded-2xl bg-slate-50 border-slate-200 text-sm focus:bg-white focus:border-[#FF6F0F]"
                  />
                </div>
                <p className="text-[11px] text-slate-400">
                  বিজ্ঞাপন প্রকাশ ও যোগাযোগের জন্য সক্রিয় মোবাইল নম্বর দিন (যেমন: 01700000000)
                </p>
              </div>

              {/* Detailed Address & Area */}
              <div className="space-y-3 p-4 rounded-2xl bg-slate-50/80 border border-slate-200">
                {/* Area Selection Dropdown & Trigger */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                      <MapPin className="h-3.5 w-3.5 text-[#FF6F0F]" />
                      <span>এলাকা (Area)</span>
                    </label>
                    <button
                      type="button"
                      onClick={handleOpenAreaModal}
                      className="text-xs font-bold text-[#FF6F0F] hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Search className="h-3 w-3" />
                      <span>তালিকা থেকে খুঁজুন</span>
                    </button>
                  </div>
                  <div className="relative">
                    <select
                      value={editAreaId}
                      onChange={(e) => setEditAreaId(e.target.value)}
                      className="w-full h-11 px-3 rounded-xl bg-white border border-slate-200 text-sm focus:border-[#FF6F0F] focus:outline-none focus:ring-1 focus:ring-[#FF6F0F] text-slate-800"
                    >
                      <option value="">
                        {isLoadingAreas ? "এলাকা লোড হচ্ছে..." : "-- এলাকা নির্বাচন করুন --"}
                      </option>
                      {areasList.map((area) => (
                        <option key={area.id} value={area.id}>
                          {area.bnName || area.name}{" "}
                          {area.district?.bnName
                            ? `(${area.district.bnName})`
                            : area.district?.name
                            ? `(${area.district.name})`
                            : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Specific Address Textarea */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    নির্দিষ্ট ঠিকানা (House, Road, Block ইত্যাদি)
                  </label>
                  <textarea
                    rows={2}
                    value={editAddress}
                    onChange={(e) => setEditAddress(e.target.value)}
                    placeholder="বাড়ি নং, রোড নং, ফ্ল্যাট বা ব্লক..."
                    className="w-full p-3 rounded-xl bg-white border border-slate-200 text-sm focus:border-[#FF6F0F] focus:outline-none focus:ring-1 focus:ring-[#FF6F0F]"
                  />
                </div>
              </div>

              {/* Role Management (Seller to User switch) */}
              {user?.role === "SELLER" && (
                <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs font-bold text-slate-900 block">
                        রোল ব্যবস্থাপনা (Role Management)
                      </span>
                      <span className="text-[11px] text-slate-500">
                        বর্তমান রোল: ভেরিফাইড বিক্রেতা (SELLER)
                      </span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full border bg-emerald-50 text-emerald-700 border-emerald-300">
                      বিক্রেতা (SELLER)
                    </span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5 pr-2">
                      <span className="text-xs font-bold text-slate-800">
                        সাধারণ ক্রেতা (USER) মোডে ফিরুন
                      </span>
                      <p className="text-[11px] text-slate-500">
                        বিক্রেতা মোড বন্ধ করে সাধারণ ক্রেতা অ্যাকাউন্টে ফিরে যান
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={isSwitchingRole}
                      onClick={() => setIsConfirmSwitchOpen(true)}
                      className="rounded-xl text-xs font-bold border-amber-300 text-amber-800 hover:bg-amber-100 hover:text-amber-900 shrink-0 cursor-pointer"
                    >
                      {isSwitchingRole ? (
                        <span className="flex items-center gap-1.5">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> স্যুইচ হচ্ছে...
                        </span>
                      ) : (
                        "ক্রেতা মোডে স্যুইচ করুন"
                      )}
                    </Button>
                  </div>
                </div>
              )}

              {/* Shop Details (Conditional if user remains a SELLER) */}
              {user?.role === "SELLER" && editRole === "SELLER" && (
                <div className="space-y-3 p-4 rounded-2xl bg-slate-50 border border-slate-200">
                  <div className="flex items-center gap-2 pb-2 border-b border-slate-200">
                    <Store className="h-4 w-4 text-[#FF6F0F]" />
                    <h4 className="text-xs font-bold text-slate-800">
                      দোকানের বিবরণ (Shop Details)
                    </h4>
                  </div>

                  {/* Shop Name */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      দোকানের নাম (Shop Name)
                    </label>
                    <Input
                      type="text"
                      value={editShopName}
                      onChange={(e) => setEditShopName(e.target.value)}
                      placeholder="উদা: সায়মার ক্লোজেট বা টেক কর্নার"
                      className="h-10 rounded-xl bg-white border-slate-200 text-sm focus:border-[#FF6F0F]"
                    />
                  </div>

                  {/* Shop Bio */}
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-slate-700">
                      দোকান বা বিক্রেতা পরিচিতি (Bio)
                    </label>
                    <textarea
                      rows={3}
                      value={editBio}
                      onChange={(e) => setEditBio(e.target.value)}
                      placeholder="আপনার বা আপনার পণ্য সম্পর্কে দুই-এক লাইন লিখুন..."
                      className="w-full p-3 rounded-xl bg-white border border-slate-200 text-sm focus:border-[#FF6F0F] focus:outline-none focus:ring-1 focus:ring-[#FF6F0F]"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="p-4 px-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2 shrink-0">
              <Button
                type="button"
                variant="outline"
                disabled={isSavingProfile}
                onClick={() => setIsEditProfileOpen(false)}
                className="rounded-xl text-xs font-semibold cursor-pointer"
              >
                বাতিল
              </Button>
              <Button
                type="submit"
                disabled={isSavingProfile}
                className="rounded-xl text-xs font-bold bg-[#FF6F0F] hover:bg-[#F95738] text-white shadow-sm cursor-pointer"
              >
                {isSavingProfile ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> সংরক্ষণ হচ্ছে...
                  </span>
                ) : (
                  "সংরক্ষণ করুন"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    );
};

export default EditProfile;