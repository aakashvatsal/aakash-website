import { NowStrip } from "@/components/features/public-home/NowStrip";
import { PublicFooter } from "@/components/layout/PublicFooter";
import { PublicMobileNav } from "@/components/layout/PublicMobileNav";
import { PublicNavbar } from "@/components/layout/PublicNavbar";
import { CommandPaletteProvider } from "@/components/providers/CommandPaletteProvider";
import { getPublicNowStatus } from "@/lib/now";

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const now = await getPublicNowStatus();
  return (
    <div className="min-h-dvh overflow-x-clip bg-[#030608] pb-[132px] pt-16 text-white sm:pt-20 lg:pb-14 lg:pt-20">
      <CommandPaletteProvider>
        <PublicNavbar />

        <div className="[&>main>section:first-child]:pt-14 md:[&>main>section:first-child]:pt-16">
          {children}
          <PublicFooter />
        </div>

        <NowStrip now={now} />
        <PublicMobileNav />
      </CommandPaletteProvider>
    </div>
  );
}