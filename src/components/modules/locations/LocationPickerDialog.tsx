"use client";

import * as React from "react";
import { useQuery } from "@tanstack/react-query";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { useFilterStore } from "@/store/useFilterStore";
import { productService } from "@/services/product.service";
import { MapPin, Search, Check, Navigation, Flame, Globe2 } from "lucide-react";
import { Input } from "@/components/ui/input";

interface AreaItem {
  id: string;
  name: string;
  bnName: string;
  slug: string;
  zone?: string;
  isHot?: boolean;
}

const DEFAULT_DHAKA_AREAS: AreaItem[] = [
  { id: "648b317c-d643-40eb-b33a-ae9eef360bff", name: "Dhanmondi", bnName: "ধানমন্ডি", slug: "dhanmondi", zone: "ধানমন্ডি লেক ও সংলগ্ন", isHot: true },
  { id: "631b813b-96cc-4ca3-9a65-6e7babde86f0", name: "Mirpur", bnName: "মিরপুর", slug: "mirpur", zone: "মিরপুর ১, ২, ১০, ১২", isHot: true },
  { id: "3fb30d5f-747f-4d3a-b399-71d27b91c0ec", name: "Uttara", bnName: "উত্তরা", slug: "uttara", zone: "সেক্টর ১-১৮", isHot: true },
  { id: "484bd3cc-47af-4a28-85d5-7e0d58e3a6f4", name: "Banani", bnName: "বনানী", slug: "banani", zone: "ব্লক এ-এফ", isHot: true },
  { id: "f29b9ccb-123a-479b-a2f2-046ac12f79c9", name: "Gulshan", bnName: "গুলশান", slug: "gulshan", zone: "গুলশান ১ ও ২", isHot: true },
  { id: "958dd86c-89f1-43fd-8156-f45d07218bae", name: "Mohammadpur", bnName: "মোহাম্মদপুর", slug: "mohammadpur", zone: "রিং রোড, ইকবাল রোড" },
  { id: "5a8d51c7-99e2-47b5-a254-4eddd6b4e017", name: "Bashundhara R/A", bnName: "বসুন্ধরা আবাসিক এলাকা", slug: "bashundhara-ra", zone: "ব্লক এ-আই" },
  { id: "02f91e34-1611-498a-aa93-f3402398b1c6", name: "Badda", bnName: "বাড্ডা", slug: "badda", zone: "মধ্য ও উত্তর বাড্ডা" },
  { id: "0e068acd-e156-4520-8e78-9a0dbb06d1f9", name: "Motijheel", bnName: "মতিঝিল", slug: "motijheel", zone: "বাণিজ্যিক এলাকা" },
  { id: "ea3cd1aa-4261-4175-a010-a0eb54b20c40", name: "Old Dhaka", bnName: "পুরান ঢাকা", slug: "old-dhaka", zone: "সদরঘাট, লালবাগ" },
];

export function LocationPickerDialog() {
  const {
    isLocationModalOpen,
    setIsLocationModalOpen,
    selectedArea,
    selectedAreaId,
    setSelectedArea,
    setSelectedAreaId,
  } = useFilterStore();
  const [searchTerm, setSearchTerm] = React.useState("");

  // Fetch areas from backend API with fallback
  const { data: areasData } = useQuery({
    queryKey: ["locations", "areas"],
    queryFn: () => productService.getAreas(),
    staleTime: 1000 * 60 * 30,
  });

  const availableAreas: AreaItem[] = React.useMemo(() => {
    if (areasData?.data && areasData.data.length > 0) {
      return areasData.data.map((item) => {
        const fallback = DEFAULT_DHAKA_AREAS.find(
          (d) =>
            d.id === item.id ||
            d.slug === item.slug ||
            d.name.toLowerCase() === item.name.toLowerCase()
        );
        return {
          id: item.id,
          name: item.name,
          bnName: item.bnName || item.name,
          slug: item.slug || item.name.toLowerCase().replace(/\s+/g, "-"),
          zone: fallback?.zone || "ঢাকা",
          isHot: fallback?.isHot,
        };
      });
    }
    return DEFAULT_DHAKA_AREAS;
  }, [areasData]);

  const filteredAreas = availableAreas.filter(
    (area) =>
      area.bnName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      area.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (area.zone && area.zone.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const isAllAreasSelected =
    !selectedAreaId ||
    selectedArea.includes("সব এলাকা") ||
    selectedArea.includes("সমগ্র ঢাকা") ||
    selectedArea === "ঢাকা";

  const handleSelectAllAreas = () => {
    setSelectedArea("সব এলাকা, ঢাকা");
    setSelectedAreaId(undefined);
    setIsLocationModalOpen(false);
  };

  const handleSelectArea = (area: AreaItem) => {
    setSelectedArea(`${area.bnName}, ঢাকা`);
    setSelectedAreaId(area.id);
    setIsLocationModalOpen(false);
  };

  const handleUseCurrentLocation = () => {
    const dhanmondi = availableAreas.find(
      (a) => a.slug === "dhanmondi" || a.name.toLowerCase() === "dhanmondi"
    );
    setSelectedArea("ধানমন্ডি, ঢাকা");
    setSelectedAreaId(dhanmondi?.id || "648b317c-d643-40eb-b33a-ae9eef360bff");
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

          {/* All Areas (সব এলাকা) Option */}
          <button
            type="button"
            onClick={handleSelectAllAreas}
            className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition-all cursor-pointer ${
              isAllAreasSelected
                ? "bg-orange-50 border border-orange-300 text-[#FF6F0F] font-semibold shadow-2xs"
                : "hover:bg-slate-50 text-slate-700 border border-transparent"
            }`}
          >
            <div className="flex items-center gap-2.5">
              <Globe2
                className={`h-4 w-4 ${
                  isAllAreasSelected ? "text-[#FF6F0F]" : "text-slate-400"
                }`}
              />
              <div>
                <div className="text-sm font-medium">সব এলাকা, ঢাকা</div>
                <div className="text-[11px] text-slate-400">সমগ্র ঢাকার সব পণ্য</div>
              </div>
            </div>
            {isAllAreasSelected && (
              <div className="h-5 w-5 rounded-full bg-[#FF6F0F] text-white flex items-center justify-center shrink-0">
                <Check className="h-3 w-3 stroke-[3]" />
              </div>
            )}
          </button>

          {filteredAreas.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              কোনো এলাকা খুঁজে পাওয়া যায়নি
            </div>
          ) : (
            filteredAreas.map((area) => {
              const isSelected =
                !isAllAreasSelected &&
                (selectedAreaId === area.id ||
                  selectedAreaId === area.slug ||
                  selectedArea.startsWith(area.bnName));

              return (
                <button
                  key={area.id}
                  type="button"
                  onClick={() => handleSelectArea(area)}
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
                        {area.bnName}
                        <span className="text-xs text-slate-400 font-normal">
                          ({area.name})
                        </span>
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
