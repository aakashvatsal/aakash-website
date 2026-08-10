import { MobileNav } from "./MobileNav";
import { Sidebar } from "./Sidebar";

export function MainShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#030608] text-white">
      <Sidebar />
      <MobileNav />

      <main className="pb-24 lg:ml-[260px] lg:pb-0">
        <div className="mx-auto w-full max-w-[1500px] px-4 py-6 md:px-6 lg:px-8">
          {children}
        </div>
      </main>
    </div>
  );
}