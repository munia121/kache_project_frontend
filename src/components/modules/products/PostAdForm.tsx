"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/store/useAuthStore";
import { productService } from "@/services/product.service";
import { userService } from "@/services/user.service";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Camera,
  X,
  MapPin,
  Tag,
  Loader2,
  Sparkles,
  Info,
} from "lucide-react";

const postAdSchema = z.object({
  title: z
    .string()
    .min(3, "শিরোনাম কমপক্ষে ৩ অক্ষরের হতে হবে")
    .max(70, "শিরোনাম সর্বোচ্চ ৭০ অক্ষরের হতে পারে"),
  categoryId: z.string().min(1, "একটি ক্যাটাগরি নির্বাচন করুন"),
  price: z.coerce
    .number()
    .min(0, "মূল্য ০ বা তার বেশি হতে হবে"),
  isNegotiable: z.boolean(),
  condition: z.enum(["NEW", "USED"]),
  divisionId: z.string().optional(),
  districtId: z.string().optional(),
  areaId: z.string().min(1, "এলাকা নির্বাচন জরুরি"),
  description: z
    .string()
    .min(10, "পণ্যের বিবরণ কমপক্ষে ১০ অক্ষরের হতে হবে"),
});

export type PostAdFormData = z.infer<typeof postAdSchema>;

export function PostAdForm() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  const [images, setImages] = React.useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = React.useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm<PostAdFormData>({
    resolver: zodResolver(postAdSchema) as Resolver<PostAdFormData>,
    defaultValues: {
      title: "",
      categoryId: "",
      price: 0,
      isNegotiable: false,
      condition: "USED",
      divisionId: "",
      districtId: "",
      areaId: user?.areaId || "",
      description: "",
    },
  });

  const watchTitle = watch("title");
  const watchCategoryId = watch("categoryId");
  const watchCondition = watch("condition");
  const watchDivisionId = watch("divisionId");
  const watchDistrictId = watch("districtId");

  // Fetch Categories
  const { data: categoriesData, isLoading: isLoadingCategories } = useQuery({
    queryKey: ["categories"],
    queryFn: () => productService.getCategories(),
  });

  // Fetch Divisions
  const { data: divisionsData } = useQuery({
    queryKey: ["divisions"],
    queryFn: () => productService.getDivisions(),
  });

  // Fetch Districts when division changes
  const { data: districtsData } = useQuery({
    queryKey: ["districts", watchDivisionId],
    queryFn: () => productService.getDistricts(watchDivisionId || undefined),
    enabled: !!watchDivisionId,
  });

  // Fetch Areas when district changes
  const { data: areasData } = useQuery({
    queryKey: ["areas", watchDistrictId],
    queryFn: () => productService.getAreas(watchDistrictId || undefined),
    enabled: !!watchDistrictId,
  });

  // Fallback: Fetch all areas if no cascading district is selected yet
  const { data: allAreasData } = useQuery({
    queryKey: ["all-areas"],
    queryFn: () => userService.getAreas(),
  });

  // Initialize seller's registered area if available
  React.useEffect(() => {
    if (user?.locationArea) {
      if (user.locationArea.district?.divisionId) {
        setValue("divisionId", user.locationArea.district.divisionId);
      }
      if (user.locationArea.districtId) {
        setValue("districtId", user.locationArea.districtId);
      }
      if (user.locationArea.id) {
        setValue("areaId", user.locationArea.id);
      }
    } else if (user?.areaId) {
      setValue("areaId", user.areaId);
    }
  }, [user, setValue]);

  // Handle Multi-Image Selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const fileList = Array.from(files);
    const availableSlots = 5 - images.length;

    if (availableSlots <= 0) {
      toast.error("সর্বোচ্চ ৫টি ছবি আপলোড করা যাবে");
      return;
    }

    if (fileList.length > availableSlots) {
      toast.warning(`কেবলমাত্র প্রথম ${availableSlots}টি ছবি নেওয়া হয়েছে (সর্বোচ্চ ৫টি)`);
    }

    const newFiles = fileList.slice(0, availableSlots);
    const validFiles: File[] = [];
    const newPreviews: string[] = [];

    newFiles.forEach((file) => {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        toast.error(`"${file.name}" সমর্থিত নয়। কেবল JPG, PNG, WEBP ছবি দিন।`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`"${file.name}" ৫MB এর বেশি বড়।`);
        return;
      }
      validFiles.push(file);
      newPreviews.push(URL.createObjectURL(file));
    });

    setImages((prev) => [...prev, ...validFiles]);
    setImagePreviews((prev) => [...prev, ...newPreviews]);

    // Reset input value so same files can be re-selected if removed
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleRemoveImage = (index: number) => {
    // Revoke object URL to prevent memory leaks
    if (imagePreviews[index]) {
      URL.revokeObjectURL(imagePreviews[index]);
    }
    setImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // Clean up object URLs on component unmount
  React.useEffect(() => {
    return () => {
      imagePreviews.forEach((preview) => {
        URL.revokeObjectURL(preview);
      });
    };
  }, [imagePreviews]);

  // Form Submission
  const onSubmit = async (data: PostAdFormData) => {
    if (images.length === 0) {
      toast.error("বিজ্ঞাপনের জন্য অন্তত ১টি ছবি আপলোড করুন");
      return;
    }

    try {
      setIsSubmitting(true);

      const formData = new FormData();
      formData.append("title", data.title.trim());
      formData.append("description", data.description.trim());
      formData.append("price", String(data.price));
      formData.append("isNegotiable", String(data.isNegotiable));
      formData.append("condition", data.condition);
      formData.append("categoryId", data.categoryId);
      formData.append("areaId", data.areaId);

      // Append up to 5 image files
      images.forEach((file) => {
        formData.append("images", file);
      });

      const response = await productService.createProduct(formData);

      if (response.success && response.data) {
        toast.success("বিজ্ঞাপন সফলভাবে পোস্ট করা হয়েছে!");

        // Immediately revoke and clear image previews and file input
        imagePreviews.forEach((preview) => {
          URL.revokeObjectURL(preview);
        });
        setImages([]);
        setImagePreviews([]);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        // Immediately reset form fields to clean state
        reset({
          title: "",
          categoryId: "",
          price: 0,
          isNegotiable: false,
          condition: "USED",
          divisionId: user?.locationArea?.district?.divisionId || "",
          districtId: user?.locationArea?.districtId || "",
          areaId: user?.locationArea?.id || user?.areaId || "",
          description: "",
        });

        // Invalidate active product queries so homepage refreshes immediately
        queryClient.invalidateQueries({ queryKey: ["products"] });
        queryClient.invalidateQueries({ queryKey: ["my-listings"] });

        // Redirect to new product details page
        router.push(`/products/${response.data.slug}`);
      }
    } catch (err: unknown) {
      const errorObj = err as { response?: { data?: { message?: string } }; message?: string };
      const msg = errorObj.response?.data?.message || errorObj.message || "বিজ্ঞাপন পোস্ট করতে ব্যর্থ হয়েছে।";
      toast.error(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const categories = categoriesData?.data || [];
  const divisions = divisionsData?.data || [];
  const districts = districtsData?.data || [];
  const areas = areasData?.data || allAreasData?.data || [];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* 1. IMAGES UPLOADER SECTION */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              <Camera className="h-5 w-5 text-[#FF6F0F]" />
              <span>পণ্যের ছবি</span>
              <span className="text-red-500">*</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              আকর্ষণীয় ও পরিষ্কার ছবি দিলে দ্রুত বিক্রি হয় (সর্বোচ্চ ৫টি ছবি)
            </p>
          </div>
          <span className="text-xs font-bold text-slate-400 bg-slate-100 px-2.5 py-1 rounded-full">
            {images.length}/5
          </span>
        </div>

        {/* Thumbnail Preview Grid */}
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 pt-1">
          {/* Add Image Trigger Button */}
          {images.length < 5 && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-orange-200 hover:border-[#FF6F0F] bg-orange-50/50 hover:bg-orange-50 text-slate-600 transition-all cursor-pointer group"
            >
              <div className="h-9 w-9 rounded-full bg-white shadow-xs flex items-center justify-center text-[#FF6F0F] group-hover:scale-110 transition-transform">
                <Camera className="h-5 w-5" />
              </div>
              <span className="text-[11px] font-bold text-slate-700 mt-1.5">
                ছবি যোগ করুন
              </span>
              <span className="text-[10px] text-slate-400">
                {images.length}/5
              </span>
            </button>
          )}

          {/* Hidden File Input */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            onChange={handleImageChange}
            className="hidden"
          />

          {/* Uploaded Images List */}
          {imagePreviews.map((preview, index) => (
            <div
              key={preview}
              className="relative aspect-square rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 group shadow-2xs"
            >
              <Image
                src={preview}
                alt={`Product Preview ${index + 1}`}
                fill
                className="object-cover"
                unoptimized
              />

              {/* Cover Photo Badge */}
              {index === 0 && (
                <div className="absolute top-1.5 left-1.5 z-10">
                  <span className="px-1.5 py-0.5 rounded-md bg-[#FF6F0F] text-white text-[9px] font-bold shadow-xs">
                    কভার ছবি
                  </span>
                </div>
              )}

              {/* Delete Button */}
              <button
                type="button"
                onClick={() => handleRemoveImage(index)}
                className="absolute top-1.5 right-1.5 z-10 h-6 w-6 rounded-full bg-black/60 hover:bg-black text-white flex items-center justify-center transition-all cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 2. TITLE & CATEGORY SECTION */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-sm space-y-5">
        {/* Title */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1">
              <span>বিজ্ঞাপনের শিরোনাম</span>
              <span className="text-red-500">*</span>
            </label>
            <span
              className={`text-[11px] font-medium ${
                (watchTitle?.length || 0) > 65
                  ? "text-red-500 font-bold"
                  : "text-slate-400"
              }`}
            >
              {watchTitle?.length || 0}/70
            </span>
          </div>
          <Input
            {...register("title")}
            maxLength={70}
            placeholder="উদা: iPhone 13 Pro 128GB - ফুল ফ্রেশ কন্ডিশন"
            className="h-11 rounded-2xl bg-slate-50 border-slate-200 text-sm focus:bg-white focus:border-[#FF6F0F]"
          />
          {errors.title && (
            <p className="text-xs text-red-500 font-medium">{errors.title.message}</p>
          )}
        </div>

        {/* Dynamic Category Selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1">
              <Tag className="h-4 w-4 text-[#FF6F0F]" />
              <span>ক্যাটাগরি বেছে নিন</span>
              <span className="text-red-500">*</span>
            </label>
            {isLoadingCategories && (
              <span className="text-xs text-slate-400 flex items-center gap-1">
                <Loader2 className="h-3 w-3 animate-spin text-[#FF6F0F]" />
                লোড হচ্ছে...
              </span>
            )}
          </div>

          {/* Visual Pills for Quick Category Selection */}
          <div className="flex flex-wrap gap-2 pt-1">
            {categories.map((cat) => {
              const isSelected = watchCategoryId === cat.id;
              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setValue("categoryId", cat.id, { shouldValidate: true })}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer ${
                    isSelected
                      ? "bg-[#FF6F0F] text-white shadow-sm shadow-orange-500/20 scale-[1.02]"
                      : "bg-slate-50 hover:bg-orange-50 text-slate-700 border border-slate-200 hover:border-orange-300"
                  }`}
                >
                  <span>{cat.name}</span>
                </button>
              );
            })}
          </div>

          {/* Fallback Dropdown */}
          <div className="pt-2">
            <select
              value={watchCategoryId}
              onChange={(e) => setValue("categoryId", e.target.value, { shouldValidate: true })}
              className="w-full h-11 px-3.5 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:border-[#FF6F0F] focus:outline-none focus:ring-1 focus:ring-[#FF6F0F] text-slate-800"
            >
              <option value="">-- অথবা ড্রপডাউন থেকে নির্বাচন করুন --</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          {errors.categoryId && (
            <p className="text-xs text-red-500 font-medium">
              {errors.categoryId.message}
            </p>
          )}
        </div>
      </div>

      {/* 3. PRICING & CONDITION SECTION */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-sm space-y-5">
        <h2 className="text-base sm:text-lg font-bold text-slate-900">
          মূল্য ও পণ্যের অবস্থা
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Price Input */}
          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1">
              <span>মূল্য (টাকা)</span>
              <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-bold text-slate-400">
                ৳
              </span>
              <Input
                type="number"
                min="0"
                step="1"
                {...register("price")}
                placeholder="0"
                className="pl-8 h-11 rounded-2xl bg-slate-50 border-slate-200 text-sm font-semibold focus:bg-white focus:border-[#FF6F0F]"
              />
            </div>
            {errors.price && (
              <p className="text-xs text-red-500 font-medium">{errors.price.message}</p>
            )}

            {/* Negotiable Checkbox */}
            <label className="inline-flex items-center gap-2 pt-1 cursor-pointer select-none">
              <input
                type="checkbox"
                {...register("isNegotiable")}
                className="h-4 w-4 rounded border-slate-300 text-[#FF6F0F] focus:ring-[#FF6F0F]"
              />
              <span className="text-xs font-medium text-slate-700">
                আলোচনা সাপেক্ষ (Negotiable)
              </span>
            </label>
          </div>

          {/* Condition Segmented Control */}
          <div className="space-y-1.5">
            <label className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1">
              <span>পণ্যের অবস্থা</span>
              <span className="text-red-500">*</span>
            </label>
            <div className="grid grid-cols-2 gap-2 h-11 p-1 bg-slate-100 rounded-2xl">
              <button
                type="button"
                onClick={() => setValue("condition", "USED")}
                className={`flex items-center justify-center rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  watchCondition === "USED"
                    ? "bg-white text-slate-900 shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                ব্যবহৃত (Used)
              </button>
              <button
                type="button"
                onClick={() => setValue("condition", "NEW")}
                className={`flex items-center justify-center rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  watchCondition === "NEW"
                    ? "bg-white text-[#FF6F0F] shadow-sm"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                নতুন (New)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 4. LOCATION & AREA HIERARCHY */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-sm space-y-4">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-[#FF6F0F]" />
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900">
              বিজ্ঞাপনের অবস্থান ও এলাকা
            </h2>
            <p className="text-xs text-slate-500">
              ক্রেতারা যাতে আপনার পাড়ায় সহজে পণ্য খুঁজে পেতে পারেন
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
          {/* Division Selector */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">
              বিভাগ (Division)
            </label>
            <select
              value={watchDivisionId}
              onChange={(e) => {
                setValue("divisionId", e.target.value);
                setValue("districtId", "");
                setValue("areaId", "");
              }}
              className="w-full h-11 px-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 focus:bg-white focus:border-[#FF6F0F]"
            >
              <option value="">বিভাগ নির্বাচন করুন</option>
              {divisions.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.bnName || d.name}
                </option>
              ))}
            </select>
          </div>

          {/* District Selector */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700">
              জেলা (District)
            </label>
            <select
              value={watchDistrictId}
              disabled={!watchDivisionId && districts.length === 0}
              onChange={(e) => {
                setValue("districtId", e.target.value);
                setValue("areaId", "");
              }}
              className="w-full h-11 px-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-slate-800 focus:bg-white focus:border-[#FF6F0F] disabled:opacity-50"
            >
              <option value="">জেলা নির্বাচন করুন</option>
              {districts.map((dst) => (
                <option key={dst.id} value={dst.id}>
                  {dst.bnName || dst.name}
                </option>
              ))}
            </select>
          </div>

          {/* Area Selector */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-1">
              <span>এলাকা (Area)</span>
              <span className="text-red-500">*</span>
            </label>
            <select
              {...register("areaId")}
              className="w-full h-11 px-3 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-medium text-slate-800 focus:bg-white focus:border-[#FF6F0F]"
            >
              <option value="">এলাকা নির্বাচন করুন</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.bnName || a.name} {a.district ? `(${a.district.bnName || a.district.name})` : ""}
                </option>
              ))}
            </select>
            {errors.areaId && (
              <p className="text-xs text-red-500 font-medium">{errors.areaId.message}</p>
            )}
          </div>
        </div>
      </div>

      {/* 5. DESCRIPTION */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-sm space-y-3">
        <label className="text-xs sm:text-sm font-bold text-slate-800 flex items-center gap-1">
          <span>পণ্যের বিবরণ</span>
          <span className="text-red-500">*</span>
        </label>
        <textarea
          rows={5}
          {...register("description")}
          placeholder="পণ্যটি কতদিন ব্যবহার করেছেন? আসল বক্স বা চার্জার আছে কি না? কোনো ত্রুটি আছে কি না? ক্রেতাকে পরিষ্কার ধারণা দিতে বিস্তারিত লিখুন..."
          className="w-full p-4 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:bg-white focus:border-[#FF6F0F] focus:outline-none focus:ring-1 focus:ring-[#FF6F0F] leading-relaxed"
        />
        {errors.description && (
          <p className="text-xs text-red-500 font-medium">
            {errors.description.message}
          </p>
        )}
      </div>

      {/* SUBMIT BUTTON */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <Info className="h-4 w-4 text-[#FF6F0F] shrink-0" />
          <span>পোস্ট করার পর আপনার বিজ্ঞাপনটি সঙ্গে সঙ্গে কাছে হোমপেজে প্রদর্শিত হবে।</span>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full sm:w-auto px-8 py-3 h-12 rounded-full bg-[#FF6F0F] hover:bg-[#F95738] text-white text-sm font-bold shadow-lg shadow-orange-500/25 transition-all cursor-pointer hover:scale-105 active:scale-95 disabled:opacity-50"
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <Loader2 className="h-4 w-4 animate-spin" />
              <span>বিজ্ঞাপন পোস্ট হচ্ছে...</span>
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4" />
              <span>বিজ্ঞাপন প্রকাশ করুন</span>
            </span>
          )}
        </Button>
      </div>
    </form>
  );
}

export default PostAdForm;
