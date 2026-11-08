/* eslint-disable @typescript-eslint/no-unused-vars */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { productService } from "@/services/product.service";
import { categoryService } from "@/services/category.service";
import { userService } from "@/services/user.service";
import { chatService } from "@/services/chat.service";
import { IProduct } from "@/types/product.types";
import { Category } from "@/types/category.types";
import { ILocationArea } from "@/types/user.types";
import { useAuthStore } from "@/store/useAuthStore";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import {
  MapPin,
  Calendar,
  Eye,
  EyeOff,
  Store,
  Phone,
  MessageCircle,
  ShieldCheck,
  ChevronLeft,
  Share2,
  Heart,
  Copy,
  Check,
  AlertTriangle,
  Loader2,
  Sparkles,
  Edit3,
  Trash2,
  Camera,
  X,
  CheckCircle2,
  ShoppingBag,
} from "lucide-react";

interface ProductDetailsPageProps {
  params: Promise<{ slug: string }>;
}

function formatBengaliDate(dateString?: string): string {
  if (!dateString) return "সাম্প্রতিক";
  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return "সাম্প্রতিক";
    return d.toLocaleDateString("bn-BD", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  } catch {
    return "সাম্প্রতিক";
  }
}

function formatRelativeTime(dateString?: string): string {
  if (!dateString) return "আজ";
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "আজ";
    const now = new Date();
    const diffSecs = Math.floor((now.getTime() - date.getTime()) / 1000);
    if (diffSecs < 60) return "এইমাত্র";
    const diffMins = Math.floor(diffSecs / 60);
    if (diffMins < 60) return `${diffMins} মিনিট আগে`;
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} ঘণ্টা আগে`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} দিন আগে`;
    return formatBengaliDate(dateString);
  } catch {
    return "আজ";
  }
}

function ProductDetailsContent({ params }: ProductDetailsPageProps) {
  const router = useRouter();
  const { slug } = React.use(params);
  const { user, isAuthenticated, token, openAuthModal } = useAuthStore();
  const { addToCart } = useCart();
  const [isAddingToCart, setIsAddingToCart] = React.useState(false);

  const handleAddToCart = async () => {
    if (!product) return;
    setIsAddingToCart(true);
    try {
      await addToCart(product, 1);
    } finally {
      setIsAddingToCart(false);
    }
  };

  const [selectedImageIndex, setSelectedImageIndex] = React.useState(0);
  const [showPhoneNumber, setShowPhoneNumber] = React.useState(false);
  const [isCopiedPhone, setIsCopiedPhone] = React.useState(false);
  const [isLiked, setIsLiked] = React.useState(false);
  const [isPendingFavorite, setIsPendingFavorite] = React.useState(false);

  // Fetch product details via server action
  const [product, setProduct] = React.useState<IProduct | null>(null);
  const [isLoading, setIsLoading] = React.useState(true);
  const [isError, setIsError] = React.useState(false);

  // ==========================================
  // Post Management State (Update / Hide / Delete)
  // ==========================================
  const [isEditModalOpen, setIsEditModalOpen] = React.useState(false);
  const [editTitle, setEditTitle] = React.useState("");
  const [editPrice, setEditPrice] = React.useState<number | string>("");
  const [editCondition, setEditCondition] = React.useState<string>("USED");
  const [editCategoryId, setEditCategoryId] = React.useState<string>("");
  const [editAreaId, setEditAreaId] = React.useState<string>("");
  const [editIsNegotiable, setEditIsNegotiable] = React.useState<boolean>(false);
  const [editStatus, setEditStatus] = React.useState<string>("AVAILABLE");
  const [editDescription, setEditDescription] = React.useState<string>("");

  // Existing & New Images
  const [existingImages, setExistingImages] = React.useState<string[]>([]);
  const [newImages, setNewImages] = React.useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = React.useState<string[]>([]);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  // Loading States for Actions
  const [isSavingProduct, setIsSavingProduct] = React.useState(false);
  const [isTogglingStatus, setIsTogglingStatus] = React.useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = React.useState(false);
  const [isDeleting, setIsDeleting] = React.useState(false);
  const [isStartingChat, setIsStartingChat] = React.useState(false);

  // Categories & Areas for Edit Form
  const [categoriesList, setCategoriesList] = React.useState<Category[]>([]);
  const [areasList, setAreasList] = React.useState<ILocationArea[]>([]);

  React.useEffect(() => {
    if (!slug) return;
    let isMounted = true;
    setIsLoading(true);
    setIsError(false);

    productService
      .getProductBySlug(slug)
      .then((res) => {
        if (isMounted) {
          if (res?.success && res.data) {
            setProduct(res.data);
            setIsLiked(Boolean(res.data.isFavorited || res.data.isFavorite));
          } else {
            setIsError(true);
          }
        }
      })
      .catch(() => {
        if (isMounted) setIsError(true);
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [slug]);

  // Clean up object URLs on component unmount
  React.useEffect(() => {
    return () => {
      newImagePreviews.forEach((preview) => {
        URL.revokeObjectURL(preview);
      });
    };
  }, [newImagePreviews]);

  // ==========================================
  // Permissions & Ownership Check
  // "ei kaj gulo shadharon user ra korte parbe na just seller ,admin superadmin era korte parbe akjoner kora post onno jon hide/delete korte parbe na"
  // ==========================================
  const isOwner =
    Boolean(user?.id) &&
    Boolean(product?.sellerId || product?.seller?.id) &&
    (user?.id === product?.sellerId || user?.id === product?.seller?.id);

  const isSeller = user?.role === "SELLER";
  const isAdmin = user?.role === "ADMIN" || user?.role === "SUPER_ADMIN";

  // Ordinary users (role: 'USER') can NEVER edit/hide/delete.
  // Only SELLER, ADMIN, SUPER_ADMIN can.
  // One seller CANNOT edit/hide/delete another seller's post.
  const canManage =
    isAuthenticated &&
    Boolean(user) &&
    (isAdmin || (isSeller && isOwner));

  const handleCopyPhone = () => {
    if (product?.seller?.phone) {
      navigator.clipboard.writeText(product.seller.phone);
      setIsCopiedPhone(true);
      toast.success("ফোন নম্বর কপি করা হয়েছে");
      setTimeout(() => setIsCopiedPhone(false), 2000);
    }
  };

  const handleShare = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      toast.success("বিজ্ঞাপনের লিংক কপি করা হয়েছে");
    }
  };

  const handleToggleFavorite = async () => {
    if (!isAuthenticated) {
      toast.warning("পছন্দের তালিকায় যুক্ত করতে অনুগ্রহ করে প্রথমে লগইন করুন");
      openAuthModal("login");
      return;
    }

    if (!product?.id || isPendingFavorite) return;

    const previousLiked = isLiked;
    const nextLiked = !previousLiked;

    // Optimistic toggle
    setIsLiked(nextLiked);
    setIsPendingFavorite(true);

    try {
      const res = await productService.toggleFavorite(product.id);
      if (res?.success) {
        const finalFavorited = res.data?.isFavorited ?? nextLiked;
        setIsLiked(finalFavorited);
        toast.success(
          finalFavorited
            ? "পণ্যটি পছন্দের তালিকায় যুক্ত করা হয়েছে"
            : "পণ্যটি পছন্দের তালিকা থেকে সরানো হয়েছে"
        );
      } else {
        // Revert on failure
        setIsLiked(previousLiked);
        toast.error(res?.message || "পছন্দ আপডেট করতে সমস্যা হয়েছে");
      }
    } catch (err: any) {
      // Revert on exception
      setIsLiked(previousLiked);
      toast.error(err?.message || "পছন্দ আপডেট করতে ব্যর্থ হয়েছে");
    } finally {
      setIsPendingFavorite(false);
    }
  };

  // ==========================================
  // Handle Initiate Chat
  // ==========================================
  const handleInitiateChat = async () => {
    if (!isAuthenticated) {
      openAuthModal("login");
      return;
    }

    const sellerId = product?.sellerId || product?.seller?.id;
    if (!product?.id || !sellerId) {
      toast.error("বিক্রেতার তথ্য পাওয়া যায়নি");
      return;
    }

    if (
      user?.id &&
      (user.id === product?.sellerId ||
        user.id === product?.seller?.id ||
        isOwner)
    ) {
      toast.info("এটি আপনার নিজের পোস্ট করা বিজ্ঞাপন");
      return;
    }

    try {
      setIsStartingChat(true);
      const res = await chatService.initiateConversation(product.id, sellerId);
      const conversation =
        (res as { data?: { id?: string } })?.data ||
        (res as unknown as { id?: string });
      if (conversation?.id) {
        router.push(`/chat?id=${conversation.id}`);
      } else {
        toast.error("চ্যাট শুরু করা সম্ভব হয়নি");
      }
    } catch (error: unknown) {
      const err = error as {
        response?: { data?: { message?: string } };
        message?: string;
      };
      toast.error(
        err?.response?.data?.message ||
          err?.message ||
          "চ্যাট শুরু করতে সমস্যা হয়েছে"
      );
    } finally {
      setIsStartingChat(false);
    }
  };

  // ==========================================
  // Handle Open Edit Modal
  // ==========================================
  const handleOpenEditModal = () => {
    if (!product) return;
    setEditTitle(product.title || "");
    setEditPrice(product.price !== undefined ? product.price : "");
    setEditCondition(product.condition || "USED");
    setEditCategoryId(
      product.categoryId ||
      (typeof product.category === "object" && product.category?.id ? product.category.id : "")
    );
    setEditAreaId(
      product.areaId ||
      (typeof product.area === "object" && product.area?.id ? product.area.id : "")
    );
    setEditIsNegotiable(Boolean(product.isNegotiable));
    setEditStatus(product.status || "AVAILABLE");
    setEditDescription(product.description || "");

    const baseImgs =
      product.images && product.images.length > 0
        ? [...product.images]
        : product.imageUrl
        ? [product.imageUrl]
        : [];
    setExistingImages(baseImgs);
    setNewImages([]);
    setNewImagePreviews([]);
    setIsEditModalOpen(true);

    // Load categories & areas if not yet loaded
    if (categoriesList.length === 0) {
      categoryService.getCategories().then((res) => {
        if (res?.success && Array.isArray(res.data)) {
          setCategoriesList(res.data);
        }
      });
    }
    if (areasList.length === 0) {
      userService.getAreas().then((res) => {
        if (res?.success && Array.isArray(res.data)) {
          setAreasList(res.data);
        }
      });
    }
  };

  // Handle Remove an existing image
  const handleRemoveExistingImage = (index: number) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  // Handle Adding New Image Files
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const filesArray = Array.from(e.target.files);

    const validFiles: File[] = [];
    const validPreviews: string[] = [];

    filesArray.forEach((file) => {
      if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
        toast.error(`"${file.name}" সমর্থিত নয়। কেবল JPG, PNG, WEBP দিন।`);
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`"${file.name}" ৫MB এর চেয়ে বড়।`);
        return;
      }
      validFiles.push(file);
      validPreviews.push(URL.createObjectURL(file));
    });

    setNewImages((prev) => [...prev, ...validFiles]);
    setNewImagePreviews((prev) => [...prev, ...validPreviews]);

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Handle Remove a newly selected image
  const handleRemoveNewImage = (index: number) => {
    if (newImagePreviews[index]) {
      URL.revokeObjectURL(newImagePreviews[index]);
    }
    setNewImages((prev) => prev.filter((_, i) => i !== index));
    setNewImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // ==========================================
  // Save Updated Product
  // ==========================================
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product) return;

    if (!editTitle.trim()) {
      toast.error("বিজ্ঞাপনের শিরোনাম খালি রাখা যাবে না");
      return;
    }
    if (editPrice === "" || isNaN(Number(editPrice)) || Number(editPrice) < 0) {
      toast.error("সঠিক সংখ্যাসূচক মূল্য উল্লেখ করুন");
      return;
    }
    if (!editDescription.trim()) {
      toast.error("পণ্যের বিবরণ খালি রাখা যাবে না");
      return;
    }
    if (existingImages.length === 0 && newImages.length === 0) {
      toast.error("বিজ্ঞাপনে অন্তত ১টি ছবি থাকা আবশ্যক");
      return;
    }

    try {
      setIsSavingProduct(true);

      const formData = new FormData();
      formData.append("title", editTitle.trim());
      formData.append("description", editDescription.trim());
      formData.append("price", String(Number(editPrice)));
      formData.append("condition", editCondition);
      formData.append("isNegotiable", String(editIsNegotiable));
      formData.append("status", editStatus);
      if (editCategoryId) formData.append("categoryId", editCategoryId);
      if (editAreaId) formData.append("areaId", editAreaId);

      // Instruct backend to replace images with remaining existing images + newly uploaded files
      formData.append("replaceImages", "true");
      existingImages.forEach((imgUrl) => {
        formData.append("images", imgUrl);
      });
      newImages.forEach((file) => {
        formData.append("images", file);
      });

      const authToken =
        token ||
        (typeof window !== "undefined"
          ? localStorage.getItem("accessToken") || localStorage.getItem("kache_access_token")
          : undefined);

      const res = await productService.updateProduct(product.id, formData, authToken || undefined);

      if (res?.success && res.data) {
        setProduct((prev) => {
          if (!prev) return res.data;
          return {
            ...prev,
            ...res.data,
            title: editTitle.trim(),
            description: editDescription.trim(),
            price: Number(editPrice),
            condition: editCondition,
            isNegotiable: editIsNegotiable,
            status: editStatus,
            images: res.data.images || (newImages.length === 0 ? existingImages : res.data.images),
          };
        });
        toast.success("বিজ্ঞাপন সফলভাবে আপডেট করা হয়েছে!");
        setIsEditModalOpen(false);
      } else {
        toast.error(res?.message || "বিজ্ঞাপন আপডেট করতে ব্যর্থ হয়েছে");
      }
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      toast.error(errorObj?.message || "বিজ্ঞাপন আপডেট করতে সমস্যা হয়েছে");
    } finally {
      setIsSavingProduct(false);
    }
  };

  // ==========================================
  // Toggle Hide / Archive Product
  // ==========================================
  const handleToggleHide = async () => {
    if (!product) return;
    const isCurrentlyHidden = product.status === "ARCHIVED";
    const targetStatus = isCurrentlyHidden ? "AVAILABLE" : "ARCHIVED";

    try {
      setIsTogglingStatus(true);
      const authToken =
        token ||
        (typeof window !== "undefined"
          ? localStorage.getItem("accessToken") || localStorage.getItem("kache_access_token")
          : undefined);

      const res = await productService.updateProductStatus(
        product.id,
        targetStatus,
        authToken || undefined
      );

      if (res?.success) {
        setProduct((prev) => (prev ? { ...prev, status: targetStatus } : null));
        if (targetStatus === "ARCHIVED") {
          toast.success(
            "বিজ্ঞাপনটি লুকানো (আর্কাইভ) হয়েছে। সাধারণ ক্রেতারা এটি ফিডে দেখতে পাবে না।"
          );
        } else {
          toast.success("বিজ্ঞাপনটি পুনরায় সক্রিয় ও প্রকাশিত করা হয়েছে!");
        }
      } else {
        toast.error(res?.message || "স্ট্যাটাস পরিবর্তন করতে ব্যর্থ হয়েছে");
      }
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      toast.error(errorObj?.message || "স্ট্যাটাস পরিবর্তন করতে সমস্যা হয়েছে");
    } finally {
      setIsTogglingStatus(false);
    }
  };

  // ==========================================
  // Delete / Archive Product Action
  // ==========================================
  const handleDeleteProduct = async (permanent: boolean) => {
    if (!product) return;

    try {
      setIsDeleting(true);
      const authToken =
        token ||
        (typeof window !== "undefined"
          ? localStorage.getItem("accessToken") || localStorage.getItem("kache_access_token")
          : undefined);

      const res = await productService.deleteProduct(
        product.id,
        permanent,
        authToken || undefined
      );

      if (res?.success) {
        if (permanent) {
          toast.success("বিজ্ঞাপনটি স্থায়ীভাবে মুছে ফেলা হয়েছে!");
          router.push("/my-listings");
        } else {
          setProduct((prev) => (prev ? { ...prev, status: "ARCHIVED" } : null));
          toast.success("বিজ্ঞাপনটি সফলভাবে লুকানো (আর্কাইভ) হয়েছে!");
          setIsDeleteDialogOpen(false);
        }
      } else {
        toast.error(res?.message || "বিজ্ঞাপন ডিলিট করতে ব্যর্থ হয়েছে");
      }
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      toast.error(errorObj?.message || "বিজ্ঞাপন ডিলিট করতে সমস্যা হয়েছে");
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-6">
          <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
          <span>/</span>
          <div className="h-4 w-24 bg-slate-200 rounded animate-pulse" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          <div className="lg:col-span-7 space-y-4">
            <div className="aspect-4/3 w-full bg-slate-200 rounded-3xl animate-pulse" />
            <div className="flex gap-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="h-16 w-16 bg-slate-200 rounded-2xl animate-pulse" />
              ))}
            </div>
          </div>
          <div className="lg:col-span-5 space-y-4">
            <div className="h-8 bg-slate-200 rounded-xl w-3/4 animate-pulse" />
            <div className="h-10 bg-slate-200 rounded-xl w-1/2 animate-pulse" />
            <div className="h-28 bg-slate-200 rounded-3xl animate-pulse" />
            <div className="h-40 bg-slate-200 rounded-3xl animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <div className="h-16 w-16 rounded-full bg-orange-100 text-[#FF6F0F] flex items-center justify-center mb-4">
          <AlertTriangle className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">বিজ্ঞাপনটি পাওয়া যায়নি</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 mb-6 leading-relaxed">
          বিজ্ঞাপনটি হয়তো মুছে ফেলা হয়েছে বা লিংকটি ভুল। অনুগ্রহ করে কাছে হোমপেজে ফিরে গিয়ে অনুসন্ধান করুন।
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#FF6F0F] hover:bg-[#F95738] text-white font-bold text-xs sm:text-sm shadow-md"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>হোমপেজে ফিরুন</span>
        </Link>
      </div>
    );
  }

  // If product is archived and user cannot manage it, show restricted message
  if (product.status === "ARCHIVED" && !canManage) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-6 text-center max-w-md mx-auto">
        <div className="h-16 w-16 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-4">
          <EyeOff className="h-8 w-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">বিজ্ঞাপনটি বর্তমানে লুকানো রয়েছে</h2>
        <p className="text-xs sm:text-sm text-slate-500 mt-2 mb-6 leading-relaxed">
          বিজ্ঞাপনের বিক্রেতা বা প্রশাসক এটি সাময়িকভাবে লুকিয়ে রেখেছেন। অনুগ্রহ করে হোমপেজ থেকে অন্যান্য পণ্য দেখুন।
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#FF6F0F] hover:bg-[#F95738] text-white font-bold text-xs sm:text-sm shadow-md"
        >
          <ChevronLeft className="h-4 w-4" />
          <span>অন্যান্য বিজ্ঞাপন দেখুন</span>
        </Link>
      </div>
    );
  }

  const images =
    product.images && product.images.length > 0
      ? product.images
      : [
          product.imageUrl ||
            "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=800&auto=format&fit=crop&q=80",
        ];

  const currentImage = images[selectedImageIndex] || images[0];

  // Full location path
  const areaObj = typeof product.area === "object" && product.area !== null ? product.area : null;
  const areaName =
    areaObj?.bnName ||
    areaObj?.name ||
    (typeof product.area === "string" ? product.area : product.location || "ঢাকা");
  const districtName = areaObj?.district?.bnName || areaObj?.district?.name;
  const divisionName = areaObj?.district?.division?.bnName || areaObj?.district?.division?.name;

  const fullLocation = [areaName, districtName, divisionName].filter(Boolean).join(", ");

  const categoryObj =
    typeof product.category === "object" && product.category !== null ? product.category : null;
  const categoryName =
    categoryObj?.name || (typeof product.category === "string" ? product.category : "সাধারণ");
  const categorySlug =
    categoryObj?.slug || (typeof product.category === "string" ? product.category : "");

  // Formatted price
  const formattedPrice = `৳ ${Number(product.price).toLocaleString("en-IN")}`;

  // Seller initials
  const sellerName = product.seller?.fullName || "বিক্রেতা";
  const sellerInitials =
    sellerName
      .split(/\s+/)
      .slice(0, 2)
      .map((s) => s[0])
      .join("")
      .toUpperCase() || "S";

  const conditionLabel =
    product.condition === "NEW"
      ? "নতুন (New)"
      : product.condition === "REFURBISHED"
      ? "রিফার্বিশড (Refurbished)"
      : "ব্যবহৃত (Used)";

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-200/60 text-xs text-slate-500">
        <div className="flex items-center gap-1.5 truncate">
          <Link href="/" className="hover:text-[#FF6F0F] transition-colors flex items-center gap-1">
            <ChevronLeft className="h-3.5 w-3.5" />
            <span>হোম</span>
          </Link>
          <span>/</span>
          {categorySlug && (
            <>
              <Link href={`/?category=${categorySlug}`} className="hover:text-[#FF6F0F] truncate">
                {categoryName}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-slate-800 font-semibold truncate max-w-50 sm:max-w-xs">
            {product.title}
          </span>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={handleShare}
            className="h-8 px-3 rounded-full text-xs font-semibold border-slate-200 hover:border-orange-300 gap-1.5 cursor-pointer text-slate-700"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">শেয়ার করুন</span>
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={handleToggleFavorite}
            disabled={isPendingFavorite}
            className={`h-8 px-3 rounded-full text-xs font-semibold border-slate-200 gap-1.5 cursor-pointer transition-colors ${
              isLiked
                ? "text-rose-500 border-rose-200 bg-rose-50 hover:bg-rose-100/70"
                : "text-slate-700 hover:border-orange-300"
            }`}
          >
            <Heart
              className={`h-3.5 w-3.5 transition-transform active:scale-125 ${
                isLiked ? "fill-rose-500 text-rose-500" : ""
              }`}
            />
            <span className="hidden sm:inline">{isLiked ? "সংরক্ষিত" : "পছন্দ"}</span>
          </Button>
        </div>
      </div>

      {/* ========================================================= */}
      {/* SELLER / ADMIN POST MANAGEMENT BAR */}
      {/* Strictly restricted to Owner (with SELLER role) or ADMIN */}
      {/* ========================================================= */}
      {canManage && (
        <div className="mb-6 p-4 sm:p-5 rounded-3xl bg-linear-to-r from-orange-50 via-amber-50/70 to-orange-50 border border-orange-200/90 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-[#FF6F0F] text-white flex items-center justify-center shrink-0 shadow-sm shadow-orange-500/20">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">
                  বিজ্ঞাপন পরিচালনা (Manage Your Post)
                </h3>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                    product.status === "ARCHIVED"
                      ? "bg-purple-100 text-purple-700 border border-purple-200"
                      : product.status === "SOLD"
                      ? "bg-slate-200 text-slate-700"
                      : "bg-emerald-100 text-emerald-700 border border-emerald-200"
                  }`}
                >
                  {product.status === "ARCHIVED"
                    ? "লুকানো (Hidden / Archived)"
                    : product.status === "SOLD"
                    ? "বিক্রিত (Sold)"
                    : "সক্রিয় (Active)"}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-0.5">
                {isAdmin
                  ? "অ্যাডমিন হিসেবে আপনি এই বিজ্ঞাপনটির সকল তথ্য আপডেট, লুকানো বা ডিলিট করতে পারেন"
                  : "আপনার পোস্ট করা এই বিজ্ঞাপনের তথ্য আপডেট, সাময়িক লুকানো বা ডিলিট করতে পারবেন"}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap shrink-0">
            {/* Update Post Button */}
            <Button
              onClick={handleOpenEditModal}
              className="rounded-full bg-[#FF6F0F] hover:bg-[#F95738] text-white text-xs font-bold px-4 h-9 shadow-sm shadow-orange-500/25 cursor-pointer flex items-center gap-1.5"
            >
              <Edit3 className="h-3.5 w-3.5" />
              <span>বিজ্ঞাপন আপডেট করুন (Update Post)</span>
            </Button>

            {/* Hide / Unhide Button */}
            <Button
              variant="outline"
              disabled={isTogglingStatus}
              onClick={handleToggleHide}
              className="rounded-full border-slate-300 hover:border-orange-300 text-slate-700 text-xs font-bold px-3.5 h-9 cursor-pointer flex items-center gap-1.5"
            >
              {isTogglingStatus ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-[#FF6F0F]" />
              ) : product.status === "ARCHIVED" ? (
                <>
                  <Eye className="h-3.5 w-3.5 text-emerald-600" />
                  <span>প্রকাশ করুন (Unhide)</span>
                </>
              ) : (
                <>
                  <EyeOff className="h-3.5 w-3.5 text-amber-600" />
                  <span>বিজ্ঞাপন লুকান (Hide)</span>
                </>
              )}
            </Button>

            {/* Delete Button */}
            <Button
              variant="outline"
              onClick={() => setIsDeleteDialogOpen(true)}
              className="rounded-full border-rose-200 text-rose-600 hover:bg-rose-50 hover:border-rose-300 text-xs font-bold px-3.5 h-9 cursor-pointer flex items-center gap-1.5"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>মুছে ফেলুন</span>
            </Button>
          </div>
        </div>
      )}

      {/* Hidden/Archived Warning Banner for Owner/Admin */}
      {product.status === "ARCHIVED" && canManage && (
        <div className="mb-6 p-4 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
          <div className="flex items-center gap-2.5">
            <EyeOff className="h-4 w-4 text-purple-600 shrink-0" />
            <span>
              <strong>বিজ্ঞাপনটি বর্তমানে লুকানো রয়েছে:</strong> এটি পাবলিক মার্কেটপ্লেসে বা হোমপেজে প্রদর্শিত হচ্ছে না। আপনি চাইলে যেকোনো সময় এটি পুনরায় সবার জন্য দৃশ্যমান করতে পারেন।
            </span>
          </div>
          <button
            type="button"
            disabled={isTogglingStatus}
            onClick={handleToggleHide}
            className="text-purple-700 font-bold hover:underline shrink-0 cursor-pointer self-start sm:self-center"
          >
            {isTogglingStatus ? "পরিবর্তন হচ্ছে..." : "পুনরায় প্রকাশ করতে ক্লিক করুন"}
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* ========================================================= */}
        {/* LEFT COLUMN: IMAGE GALLERY (7 Cols) */}
        {/* ========================================================= */}
        <div className="lg:col-span-7 space-y-4">
          {/* Main Large Image Display */}
          <div className="relative aspect-4/3 sm:aspect-16/10 w-full overflow-hidden rounded-3xl bg-slate-900 border border-slate-200 shadow-sm group">
            <Image
              src={currentImage}
              alt={product.title}
              fill
              sizes="(max-width: 1024px) 100vw, 60vw"
              className="object-contain sm:object-cover scale-100 transition-all duration-300"
              priority
            />

            {/* Condition Badge */}
            <div className="absolute top-3 left-3 z-10">
              <span className="inline-block px-3 py-1 text-xs font-bold bg-black/60 backdrop-blur-md text-white rounded-full">
                {conditionLabel}
              </span>
            </div>

            {/* Image Counter */}
            {images.length > 1 && (
              <div className="absolute bottom-3 right-3 z-10">
                <span className="px-2.5 py-1 text-xs font-bold bg-black/60 backdrop-blur-md text-white rounded-full">
                  {selectedImageIndex + 1} / {images.length}
                </span>
              </div>
            )}
          </div>

          {/* Thumbnails Row */}
          {images.length > 1 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 pt-1 no-scrollbar">
              {images.map((img, index) => {
                const isActive = selectedImageIndex === index;
                return (
                  <button
                    key={img + index}
                    type="button"
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative h-18 w-18 sm:h-20 sm:w-20 rounded-2xl overflow-hidden shrink-0 border-2 transition-all cursor-pointer ${
                      isActive
                        ? "border-[#FF6F0F] ring-2 ring-orange-500/30 scale-105"
                        : "border-slate-200 hover:border-orange-300 opacity-70 hover:opacity-100"
                    }`}
                  >
                    <Image
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                );
              })}
            </div>
          )}

          {/* Detailed Description Block */}
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/90 shadow-sm space-y-4 mt-6">
            <h3 className="text-base sm:text-lg font-bold text-slate-900 border-b border-slate-100 pb-3">
              পণ্যের বিবরণ (Description)
            </h3>

            <div className="text-xs sm:text-sm text-slate-700 leading-relaxed whitespace-pre-line font-normal">
              {product.description}
            </div>

            {/* Specs Summary Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 block">ক্যাটাগরি</span>
                <span className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5 block truncate">
                  {categoryName}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 block">অবস্থা</span>
                <span className="text-xs sm:text-sm font-bold text-slate-800 mt-0.5 block">
                  {conditionLabel}
                </span>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-[11px] font-semibold text-slate-400 block">বিজ্ঞাপন আইডি</span>
                <span className="text-xs sm:text-sm font-mono font-bold text-slate-800 mt-0.5 block">
                  #{product.id.slice(0, 8)}
                </span>
              </div>
            </div>
          </div>

          {/* Safety Tips Card */}
          <div className="p-5 rounded-3xl bg-amber-50/70 border border-amber-200/80 space-y-2">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-xs sm:text-sm">
              <ShieldCheck className="h-4 w-4 text-amber-600" />
              <span>কাছে নিরাপদ কেনাবেচার পরামর্শ</span>
            </div>
            <ul className="text-xs text-amber-800/90 space-y-1 list-disc list-inside">
              <li>পণ্য সরাসরি সামনাসামনি দেখে মূল্য পরিশোধ করুন।</li>
              <li>কোনো অবস্থাতেই বিকাশে বা অন্য মাধ্যমে অগ্রিম টাকা পাঠাবেন না।</li>
              <li>দিনের আলোতে এবং জনবহুল নিরাপদ স্থানে দেখা করুন।</li>
            </ul>
          </div>
        </div>

        {/* ========================================================= */}
        {/* RIGHT COLUMN: PRICING & SELLER PROFILE (5 Cols) */}
        {/* ========================================================= */}
        <div className="lg:col-span-5 space-y-6">
          {/* Main Price & Title Card */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-4">
            {/* Title */}
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
              {product.title}
            </h1>

            {/* Price & Negotiation Badge */}
            <div className="flex items-baseline gap-3 pt-1">
              <span className="text-3xl sm:text-4xl font-black text-[#FF6F0F] tracking-tight">
                {formattedPrice}
              </span>
              {product.isNegotiable ? (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                  <Sparkles className="h-3 w-3 text-emerald-600" />
                  আলোচনা সাপেক্ষ
                </span>
              ) : (
                <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2.5 py-1 rounded-full">
                  ফিক্সড প্রাইস
                </span>
              )}
            </div>

            {/* Location & Time info */}
            <div className="space-y-2 pt-3 border-t border-slate-100 text-xs sm:text-sm text-slate-600">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4 text-[#FF6F0F] shrink-0" />
                <span className="font-semibold text-slate-800">{fullLocation}</span>
              </div>

              <div className="flex items-center justify-between text-xs text-slate-400 pt-1">
                <div className="flex items-center gap-1.5">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>পোস্ট করা হয়েছে {formatRelativeTime(product.createdAt)}</span>
                </div>

                <div className="flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" />
                  <span>{product.viewsCount || 0} বার দেখা হয়েছে</span>
                </div>
              </div>
            </div>

            {/* Add to Cart CTA */}
            <div className="pt-2">
              <Button
                type="button"
                onClick={handleAddToCart}
                disabled={isAddingToCart || product.status === "SOLD"}
                className="w-full h-12 rounded-2xl bg-[#FF6F0F] hover:bg-[#F95738] active:scale-98 text-white font-bold text-sm shadow-md shadow-orange-500/25 cursor-pointer flex items-center justify-center gap-2 transition-all"
              >
                {isAddingToCart ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>কার্টে যোগ হচ্ছে...</span>
                  </>
                ) : (
                  <>
                    <ShoppingBag className="h-4 w-4 stroke-[2.2]" />
                    <span>
                      {product.status === "SOLD" ? "পণ্যটি বিক্রি হয়ে গেছে" : "কার্টে যোগ করুন"}
                    </span>
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* ========================================================= */}
          {/* SELLER PROFILE CARD */}
          {/* ========================================================= */}
          <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-5">
            <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              <Store className="h-4 w-4 text-[#FF6F0F]" />
              <span>বিক্রেতা পরিচিতি (Seller Profile)</span>
            </div>

            {/* Seller Info Row */}
            <div className="flex items-center gap-3.5">
              <Avatar size="lg" className="h-14 w-14 ring-2 ring-orange-200">
                {product.seller?.avatar && (
                  <AvatarImage src={product.seller.avatar} alt={sellerName} />
                )}
                <AvatarFallback className="bg-linear-to-br from-[#FF6F0F] to-[#F95738] text-white font-bold text-lg">
                  {sellerInitials}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-base font-bold text-slate-900 truncate">
                    {sellerName}
                  </h4>
                  <span title="যাচাইকৃত বিক্রেতা" className="inline-flex">
                    <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
                  </span>
                </div>

                <p className="text-xs text-slate-500 font-medium truncate">
                  {product.seller?.shopName || "ব্যক্তিগত বিক্রেতা"}
                </p>

                <p className="text-[11px] text-slate-400 mt-0.5">
                  যোগ দিয়েছেন: {formatBengaliDate(product.seller?.createdAt)}
                </p>
              </div>
            </div>

            {product.seller?.bio && (
              <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-2xl border border-slate-100 italic leading-relaxed">
                &ldquo;{product.seller.bio}&rdquo;
              </p>
            )}

            {/* Call Seller & Chat Actions */}
            <div className="space-y-2.5 pt-2">
              {/* Call Seller Button */}
              {showPhoneNumber ? (
                <div className="flex items-center justify-between p-3.5 rounded-2xl bg-orange-50 border border-orange-200 text-[#FF6F0F]">
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <a
                      href={`tel:${product.seller?.phone}`}
                      className="text-base font-extrabold tracking-wider hover:underline"
                    >
                      {product.seller?.phone || "নম্বর পাওয়া যায়নি"}
                    </a>
                  </div>

                  <button
                    type="button"
                    onClick={handleCopyPhone}
                    className="p-1.5 rounded-xl hover:bg-orange-100 text-slate-600 transition-colors cursor-pointer"
                    title="কপি করুন"
                  >
                    {isCopiedPhone ? (
                      <Check className="h-4 w-4 text-emerald-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </button>
                </div>
              ) : (
                <Button
                  onClick={() => setShowPhoneNumber(true)}
                  className="w-full h-12 rounded-2xl bg-[#FF6F0F] hover:bg-[#F95738] text-white font-bold text-sm shadow-md shadow-orange-500/20 cursor-pointer flex items-center justify-center gap-2"
                >
                  <Phone className="h-4 w-4" />
                  <span>কল করুন (নম্বর দেখুন)</span>
                </Button>
              )}

              {/* Chat Button */}
              <Button
                variant="outline"
                disabled={isStartingChat}
                onClick={handleInitiateChat}
                className="w-full h-12 rounded-2xl border-slate-200 hover:border-orange-300 hover:bg-orange-50/50 text-slate-700 font-bold text-sm cursor-pointer flex items-center justify-center gap-2"
              >
                {isStartingChat ? (
                  <Loader2 className="h-4 w-4 animate-spin text-[#FF6F0F]" />
                ) : (
                  <MessageCircle className="h-4 w-4 text-[#FF6F0F]" />
                )}
                <span>মেসেজ করুন (Chat)</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================= */}
      {/* UPDATE POST MODAL (Dialog) */}
      {/* Accessible only to Owner (SELLER) or ADMIN */}
      {/* ========================================================= */}
      {canManage && (
        <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
          <DialogContent className="sm:max-w-xl max-h-[90vh] flex flex-col p-0 rounded-3xl bg-white shadow-2xl border-slate-200 overflow-hidden">
            <DialogHeader className="p-6 pb-4 border-b border-slate-100 shrink-0">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-orange-100 text-[#FF6F0F] flex items-center justify-center shrink-0">
                  <Edit3 className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold text-slate-900">
                    বিজ্ঞাপন পরিবর্তন করুন (Update Your Post)
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500">
                    আপনার বিজ্ঞাপনের শিরোনাম, মূল্য, কন্ডিশন ও অন্যান্য তথ্য আপডেট করুন
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <form onSubmit={handleSaveProduct} className="flex-1 flex flex-col min-h-0">
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {/* Product Title */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <span>বিজ্ঞাপনের শিরোনাম</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    type="text"
                    required
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="যেমন: iPhone 13 Pro 128GB - ফুল বক্স..."
                    className="h-11 rounded-2xl bg-slate-50 border-slate-200 text-sm focus:bg-white focus:border-[#FF6F0F]"
                  />
                </div>

                {/* Price & Negotiable */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                      <span>মূল্য (টাকা ৳)</span>
                      <span className="text-red-500">*</span>
                    </label>
                    <Input
                      type="number"
                      min={0}
                      required
                      value={editPrice}
                      onChange={(e) => setEditPrice(e.target.value)}
                      placeholder="0"
                      className="h-11 rounded-2xl bg-slate-50 border-slate-200 text-sm focus:bg-white focus:border-[#FF6F0F]"
                    />
                  </div>

                  <div className="flex items-center pt-6">
                    <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700">
                      <input
                        type="checkbox"
                        checked={editIsNegotiable}
                        onChange={(e) => setEditIsNegotiable(e.target.checked)}
                        className="h-4 w-4 rounded text-[#FF6F0F] focus:ring-[#FF6F0F] border-slate-300"
                      />
                      <span>মূল্য আলোচনা সাপেক্ষ</span>
                    </label>
                  </div>
                </div>

                {/* Condition & Status */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">পণ্যের অবস্থা (Condition)</label>
                    <select
                      value={editCondition}
                      onChange={(e) => setEditCondition(e.target.value)}
                      className="w-full h-11 px-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:border-[#FF6F0F] focus:outline-none text-slate-800"
                    >
                      <option value="USED">ব্যবহৃত (Used)</option>
                      <option value="NEW">একদম নতুন (New)</option>
                      <option value="REFURBISHED">রিফার্বিশড (Refurbished)</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">বিজ্ঞাপনের স্ট্যাটাস</label>
                    <select
                      value={editStatus}
                      onChange={(e) => setEditStatus(e.target.value)}
                      className="w-full h-11 px-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:border-[#FF6F0F] focus:outline-none text-slate-800"
                    >
                      <option value="AVAILABLE">সক্রিয় ও দৃশ্যমান (Available)</option>
                      <option value="SOLD">বিক্রিত (Sold)</option>
                      <option value="ARCHIVED">লুকানো (Archived / Hidden)</option>
                    </select>
                  </div>
                </div>

                {/* Category & Area */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">ক্যাটাগরি</label>
                    <select
                      value={editCategoryId}
                      onChange={(e) => setEditCategoryId(e.target.value)}
                      className="w-full h-11 px-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:border-[#FF6F0F] focus:outline-none text-slate-800"
                    >
                      <option value="">-- ক্যাটাগরি নির্বাচন করুন --</option>
                      {categoriesList.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-slate-700">এলাকা (Location Area)</label>
                    <select
                      value={editAreaId}
                      onChange={(e) => setEditAreaId(e.target.value)}
                      className="w-full h-11 px-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:border-[#FF6F0F] focus:outline-none text-slate-800"
                    >
                      <option value="">-- এলাকা নির্বাচন করুন --</option>
                      {areasList.map((a) => (
                        <option key={a.id} value={a.id}>
                          {a.bnName || a.name}{" "}
                          {a.district?.bnName
                            ? `(${a.district.bnName})`
                            : a.district?.name
                            ? `(${a.district.name})`
                            : ""}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Description */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 flex items-center gap-1">
                    <span>পণ্যের বিস্তারিত বিবরণ</span>
                    <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    required
                    value={editDescription}
                    onChange={(e) => setEditDescription(e.target.value)}
                    placeholder="পণ্যটি কতদিন ব্যবহার করেছেন, কোনো সমস্যা আছে কিনা বিস্তারিত লিখুন..."
                    className="w-full p-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:border-[#FF6F0F] focus:outline-none focus:bg-white"
                  />
                </div>

                {/* Images Section */}
                <div className="space-y-2 pt-2 border-t border-slate-100">
                  <label className="text-xs font-bold text-slate-700 block">
                    পণ্যের ছবিসমূহ (Photos)
                  </label>

                  {/* Existing Images Thumbnails */}
                  {existingImages.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[11px] text-slate-400 font-medium">বর্তমান ছবি:</span>
                      <div className="flex items-center gap-2 flex-wrap">
                        {existingImages.map((imgUrl, i) => (
                          <div
                            key={imgUrl + i}
                            className="relative h-16 w-16 rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group"
                          >
                            <Image
                              src={imgUrl}
                              alt={`Existing ${i + 1}`}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveExistingImage(i)}
                              className="absolute top-1 right-1 h-5 w-5 rounded-full bg-red-600 text-white flex items-center justify-center opacity-90 hover:opacity-100 cursor-pointer shadow-sm"
                              title="ছবি মুছুন"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* New Upload Previews */}
                  {newImagePreviews.length > 0 && (
                    <div className="space-y-1 pt-1">
                      <span className="text-[11px] text-emerald-600 font-medium">নতুন যুক্ত ছবি:</span>
                      <div className="flex items-center gap-2 flex-wrap">
                        {newImagePreviews.map((preview, i) => (
                          <div
                            key={preview + i}
                            className="relative h-16 w-16 rounded-xl overflow-hidden border-2 border-emerald-400 bg-slate-100"
                          >
                            <Image
                              src={preview}
                              alt={`New ${i + 1}`}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                            <button
                              type="button"
                              onClick={() => handleRemoveNewImage(i)}
                              className="absolute top-1 right-1 h-5 w-5 rounded-full bg-red-600 text-white flex items-center justify-center opacity-90 hover:opacity-100 cursor-pointer shadow-sm"
                              title="বাদ দিন"
                            >
                              <X className="h-3 w-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* File Upload Input Trigger */}
                  <div className="pt-1">
                    <input
                      ref={fileInputRef}
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp"
                      onChange={handleFileChange}
                      className="hidden"
                      id="update-product-file-input"
                    />
                    <label
                      htmlFor="update-product-file-input"
                      className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-dashed border-orange-300 bg-orange-50/50 hover:bg-orange-100/50 text-[#FF6F0F] text-xs font-bold cursor-pointer transition-colors"
                    >
                      <Camera className="h-4 w-4" />
                      <span>নতুন ছবি যুক্ত করুন</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Modal Action Buttons */}
              <div className="p-4 px-6 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-2 shrink-0">
                <Button
                  type="button"
                  variant="outline"
                  disabled={isSavingProduct}
                  onClick={() => setIsEditModalOpen(false)}
                  className="rounded-xl text-xs font-semibold cursor-pointer"
                >
                  বাতিল
                </Button>
                <Button
                  type="submit"
                  disabled={isSavingProduct}
                  className="rounded-xl text-xs font-bold bg-[#FF6F0F] hover:bg-[#F95738] text-white shadow-sm cursor-pointer"
                >
                  {isSavingProduct ? (
                    <span className="flex items-center gap-1.5">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> সংরক্ষণ হচ্ছে...
                    </span>
                  ) : (
                    "আপডেট সংরক্ষণ করুন"
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      )}

      {/* ========================================================= */}
      {/* DELETE / ARCHIVE CONFIRMATION DIALOG */}
      {/* Accessible only to Owner (SELLER) or ADMIN */}
      {/* ========================================================= */}
      {canManage && (
        <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
          <DialogContent className="sm:max-w-md p-6 rounded-3xl bg-white shadow-2xl border-slate-200 z-60">
            <DialogHeader className="space-y-2 pb-2">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center shrink-0">
                  <Trash2 className="h-5 w-5" />
                </div>
                <div>
                  <DialogTitle className="text-lg font-bold text-slate-900">
                    বিজ্ঞাপন ব্যবস্থাপনা
                  </DialogTitle>
                  <DialogDescription className="text-xs text-slate-500">
                    বিজ্ঞাপন লুকানো বা স্থায়ীভাবে মুছে ফেলার বিকল্প
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <div className="py-3 space-y-3">
              <p className="text-sm font-semibold text-slate-800">
                আপনি এই বিজ্ঞাপনটির বিষয়ে কী করতে চান?
              </p>
              <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-xs text-amber-900 space-y-1">
                <span className="font-bold flex items-center gap-1">
                  <ShieldCheck className="h-4 w-4 text-amber-600" />
                  সুপারিশ: সাময়িকভাবে লুকান (Archive)
                </span>
                <p className="text-[11px] text-amber-800">
                  লুকিয়ে রাখলে গ্রাহকরা এটি দেখতে পাবে না কিন্তু আপনার প্রোফাইলে তথ্য সংরক্ষিত থাকবে এবং যেকোনো সময় পুনরায় প্রকাশ করতে পারবেন।
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-end gap-2 pt-3 border-t border-slate-100">
              <Button
                type="button"
                variant="outline"
                disabled={isDeleting}
                onClick={() => setIsDeleteDialogOpen(false)}
                className="w-full sm:w-auto rounded-xl text-xs font-semibold cursor-pointer"
              >
                বাতিল
              </Button>

              <Button
                type="button"
                disabled={isDeleting}
                onClick={() => handleDeleteProduct(false)}
                className="w-full sm:w-auto rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white shadow-sm cursor-pointer"
              >
                {isDeleting ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> প্রক্রিয়াকরণ...
                  </span>
                ) : (
                  "বিজ্ঞাপন লুকান (Hide)"
                )}
              </Button>

              <Button
                type="button"
                disabled={isDeleting}
                onClick={() => handleDeleteProduct(true)}
                className="w-full sm:w-auto rounded-xl text-xs font-bold bg-rose-600 hover:bg-rose-700 text-white shadow-sm cursor-pointer"
              >
                {isDeleting ? (
                  <span className="flex items-center gap-1.5">
                    <Loader2 className="h-3.5 w-3.5 animate-spin" /> মুছছে...
                  </span>
                ) : (
                  "স্থায়ীভাবে ডিলিট"
                )}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}

export default function ProductDetailsPage(props: ProductDetailsPageProps) {
  return (
    <React.Suspense
      fallback={
        <div className="min-h-[60vh] flex flex-col items-center justify-center">
          <Loader2 className="h-8 w-8 text-[#FF6F0F] animate-spin" />
          <p className="mt-3 text-xs text-slate-500 font-medium">বিজ্ঞাপন লোড হচ্ছে...</p>
        </div>
      }
    >
      <ProductDetailsContent {...props} />
    </React.Suspense>
  );
}