import type { ReactNode } from "react";
import { AdminMobileHeader } from "@/components/admin/AdminMobileHeader";
import { AdminSidebar } from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: ReactNode;
}) {
  return (
    <div className="min-h-dvh bg-[#030608] text-white">
      <AdminSidebar />
      <AdminMobileHeader />

      <main className="min-h-dvh pb-10 pt-20 lg:ml-[280px] lg:pt-0">
        <div className="mx-auto w-full max-w-[1600px] px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          {children}
        </div>
      </main>
    </div>
  );
}