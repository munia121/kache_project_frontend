"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useFilterStore } from "@/store/useFilterStore";
import { POPULAR_AREAS } from "@/constants/mock-products";
import { MapPin, Search, Check, Navigation, Flame } from "lucide-react";
import { Input } from "@/components/ui/input";

export function LocationPickerDialog() {
  const { isLocationModalOpen, setIsLocationModalOpen, selectedArea, setSelectedArea } =
    useFilterStore();
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredAreas = POPULAR_AREAS.filter((area) =>
    area.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    area.zone.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSelect = (areaName: string) => {
    setSelectedArea(areaName);
    setIsLocationModalOpen(false);
  };

  const handleUseCurrentLocation = () => {
    setSelectedArea("ধানমন্ডি, ঢাকা");
    setIsLocationModalOpen(false);
  };

  return (
    <Dialog open={isLocationModalOpen} onOpenChange={setIsLocationModalOpen}>
      <DialogContent className="sm:max-w-md p-5 rounded-3xl bg-white shadow-2xl border-slate-200">
        <DialogHeader className="space-y-1.5 pb-2">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-orange-50 text-[#FF6F0F]">
              <MapPin className="h-5 w-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold text-slate-900">
                আপনার এলাকা বেছে নিন
              </DialogTitle>
              <DialogDescription className="text-xs text-slate-500">
                কাছের সেরা কেনাবেচার ডিল দেখতে এলাকা নির্বাচন করুন
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Location Search Input */}
        <div className="relative my-2">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="এলাকা বা পাড়া দিয়ে খুঁজুন (উদা: ধানমন্ডি)..."
            className="pl-10 pr-4 py-2 h-10 rounded-xl bg-slate-50 border-slate-200 text-sm focus:bg-white focus:border-[#FF6F0F] focus:ring-1 focus:ring-[#FF6F0F]"
          />
        </div>

        {/* Quick Current Location Action */}
        <button
          type="button"
          onClick={handleUseCurrentLocation}
          className="flex items-center justify-between w-full p-3 rounded-xl bg-orange-50/80 hover:bg-orange-100/80 text-[#FF6F0F] transition-colors border border-orange-200/60 text-left text-xs sm:text-sm font-medium cursor-pointer"
        >
          <div className="flex items-center gap-2.5">
            <Navigation className="h-4 w-4 text-[#FF6F0F]" />
            <span>বর্তমান জিপিএস এলাকা ব্যবহার করুন (ধানমন্ডি)</span>
          </div>
          <span className="text-[11px] font-semibold bg-white px-2 py-0.5 rounded-full border border-orange-200 shadow-2xs">
            কাছে
          </span>
        </button>

        {/* Areas List */}
        <div className="mt-2 max-h-72 overflow-y-auto space-y-1 pr-1">
          <div className="text-[11px] font-semibold tracking-wider text-slate-400 uppercase px-2 py-1">
            জনপ্রিয় এলাকাসমূহ
          </div>
          {filteredAreas.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              কোনো এলাকা খুঁজে পাওয়া যায়নি
            </div>
          ) : (
            filteredAreas.map((area) => {
              const isSelected = selectedArea === area.name;
              return (
                <button
                  key={area.name}
                  type="button"
                  onClick={() => handleSelect(area.name)}
                  className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
                    isSelected
                      ? "bg-orange-50 border border-orange-300 text-[#FF6F0F] font-semibold shadow-2xs"
                      : "hover:bg-slate-50 text-slate-700 border border-transparent"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin
                      className={`h-4 w-4 ${
                        isSelected ? "text-[#FF6F0F]" : "text-slate-400"
                      }`}
                    />
                    <div>
                      <div className="text-sm font-medium flex items-center gap-1.5">
                        {area.name}
                        {area.isHot && (
                          <span className="inline-flex items-center text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.2 rounded-md font-normal border border-amber-200">
                            <Flame className="h-2.5 w-2.5 mr-0.5 text-amber-500" />
                            জনপ্রিয়
                          </span>
                        )}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {area.zone}
                      </div>
                    </div>
                  </div>
                  {isSelected && (
                    <div className="h-5 w-5 rounded-full bg-[#FF6F0F] text-white flex items-center justify-center shrink-0">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
