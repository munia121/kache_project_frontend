import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/common/Navbar";
import { Footer } from "@/components/common/Footer";
import { LocationPickerDialog } from "@/components/modules/locations/LocationPickerDialog";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "কাছে (Kache) - আপনার পাড়ার বিশ্বস্ত লোকাল মার্কেটপ্লেস",
  description:
    "কাছে (Kache) হলো Karrot-অনুপ্রাণিত আধুনিক কমিউনিটি মার্কেটপ্লেস। আপনার আশেপাশের বিশ্বস্ত প্রতিবেশীদের সাথে সহজে ব্যবহৃত বা নতুন পণ্য কেনাবেচা করুন।",
  keywords: ["কাছে", "Kache", "Marketplace", "Dhaka", "Classifieds", "Buy and Sell"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="bn"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-[#F8FAFC] text-slate-900 font-sans selection:bg-orange-100 selection:text-[#FF6F0F]">
        <Navbar />
        <main className="flex-1">{children}</main>
        <Footer />
        <LocationPickerDialog />
      </body>
    </html>
  );
}
