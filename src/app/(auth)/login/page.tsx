import { Metadata } from "next";
import { LoginForm } from "@/components/(auth)/login/LoginForm";

export const metadata: Metadata = {
  title: "লগইন | কাছে মার্কেটপ্লেস - Kache",
  description: "আপনার কাছে অ্যাকাউন্টে লগইন করুন এবং কেনাবেচা শুরু করুন।",
};

export default function LoginPage() {
  return <LoginForm />;
}
