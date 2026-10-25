export interface Category {
  id: string;
  name: string; // e.g., "সকল", "স্মার্টফোন", "ইলেকট্রনিক্স", "ফার্নিচার", "ফ্যাশন", "যানবাহন", "অন্যান্য"
  slug: string;
  emoji: string;
}

export interface Product {
  id: string;
  title: string;
  price: number;
  currency?: string;
  category: string;
  categoryName: string;
  location: string;
  area: string;
  imageUrl: string;
  timeAgo: string;
  likesCount?: number;
  chatsCount?: number;
  isNegotiable?: boolean;
  condition?: "নতুনের মতো" | "ব্যবহৃত" | "একেবারে নতুন";
  sellerName?: string;
}
