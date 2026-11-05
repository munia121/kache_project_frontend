import { LocationPickerDialog } from "@/components/modules/locations/LocationPickerDialog";
import { FastLoginWidget } from "@/components/share/FastLoginWidget";
import { Footer } from "@/components/share/Footer";
import { Navbar } from "@/components/share/Navbar";
import { ReactNode } from "react";

const HomeLayout = ({ children }: { children: ReactNode }) => {
  return (
    <section className="space-y-6">
      <Navbar />
      <div className="flex-1">{children}</div>
      <Footer />
      <LocationPickerDialog />
      <FastLoginWidget />
    </section>
  );
};

export default HomeLayout;
