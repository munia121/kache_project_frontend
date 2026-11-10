import { ReactNode } from "react";
import AuthLayoutComponent from "@/components/(auth)/shared/AuthLayoutComponent";
import AuthLayoutHeader from "@/components/(auth)/shared/AuthLayoutHeader";
import AuthLayoutFooter from "@/components/(auth)/shared/AuthLayoutFooter";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <section className="min-h-screen w-full grid grid-cols-1 lg:grid-cols-12 bg-white text-slate-800 antialiased selection:bg-orange-100 selection:text-orange-900">

      <div className="w-full lg:col-span-7 xl:col-span-6 flex flex-col justify-between p-4 sm:p-10 md:p-12 lg:p-14 min-h-screen overflow-y-auto">
        <AuthLayoutHeader />
        <main className="w-full max-w-md mx-auto my-auto py-8 ">{children}</main>
        <AuthLayoutFooter />
      </div>

      <AuthLayoutComponent />
    </section>
  );
}
