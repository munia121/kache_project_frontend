import { Loader2 } from "lucide-react";

const LoginLoadingPage = () => {
  return (
    <div className="flex flex-col items-center justify-center py-16 space-y-3">
      <Loader2 className="h-8 w-8 animate-spin text-[#FF6F0F]" />
      <p className="text-xs text-slate-400">লোড হচ্ছে...</p>
    </div>
  );
};

export default LoginLoadingPage;
