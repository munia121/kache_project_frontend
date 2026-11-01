import { UserRole } from "@/types/user.types";

export interface DemoUserAccount {
  id: string;
  role: UserRole;
  roleTitle: string;
  bnRoleTitle: string;
  fullName: string;
  email: string;
  phone: string;
  shopOrDetails: string;
  password: string;
  badgeClass: string;
  accentColor: string;
  avatarBg: string;
  description: string;
}

export const DEMO_USERS: DemoUserAccount[] = [
  {
    id: "super-admin",
    role: "SUPER_ADMIN",
    roleTitle: "Super Admin",
    bnRoleTitle: "সুপার এডমিন",
    fullName: "Super Administrator",
    email: "superadmin@kache.com",
    phone: "01700000000",
    shopOrDetails: "Full System Access",
    password: "Password123@",
    badgeClass: "bg-purple-100 text-purple-800 border-purple-300",
    accentColor: "#7C3AED",
    avatarBg: "from-purple-600 to-indigo-700",
    description: "পূর্ণ সিস্টেম ও ডেটাবেজ ম্যানেজমেন্ট কন্ট্রোল",
  },
  {
    id: "admin",
    role: "ADMIN",
    roleTitle: "Admin",
    bnRoleTitle: "প্ল্যাটফর্ম এডমিন",
    fullName: "System Admin",
    email: "admin@kache.com",
    phone: "01700000001",
    shopOrDetails: "Platform Admin",
    password: "Password123@",
    badgeClass: "bg-indigo-100 text-indigo-800 border-indigo-300",
    accentColor: "#4F46E5",
    avatarBg: "from-indigo-600 to-blue-700",
    description: "লিস্টিং ও ইউজার মডারেশন অ্যাক্সেস",
  },
  {
    id: "seller",
    role: "SELLER",
    roleTitle: "Seller",
    bnRoleTitle: "ভেরিফায়েড বিক্রেতা",
    fullName: "Rahim Electronics",
    email: "seller@kache.com",
    phone: "01700000002",
    shopOrDetails: "Rahim Gadget Point",
    password: "Password123@",
    badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-300",
    accentColor: "#059669",
    avatarBg: "from-emerald-600 to-teal-700",
    description: "শপ ম্যানেজার ও আনলিমিটেড প্রোডাক্ট লিস্টিং",
  },
  {
    id: "buyer",
    role: "USER",
    roleTitle: "Buyer (User)",
    bnRoleTitle: "সাধারণ ক্রেতা",
    fullName: "Karim Ahmed",
    email: "buyer@kache.com",
    phone: "01700000003",
    shopOrDetails: "Verified Buyer",
    password: "Password123@",
    badgeClass: "bg-orange-100 text-orange-800 border-orange-300",
    accentColor: "#FF6F0F",
    avatarBg: "from-orange-500 to-[#F95738]",
    description: "মার্কেটপ্লেস ব্রাউজিং ও বিক্রেতা হওয়ার সুবিধা",
  },
];
