import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MediaLaunchManager } from "@/components/admin/media/MediaLaunchManager";
import { getMediaLaunchOverview } from "@/lib/api/media";

export default async function MediaLaunchPage() {
  const overview = await getMediaLaunchOverview();
  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Media V3.6 · Day-1 Launch & Calibration"
        title="Launch Aakash, not a creator persona"
        description="Start the Presence Engine with deliberate exploration, platform-specific profile setup and enough evidence before HSAKAA begins leaning into winners. Planning can start before every connector is ready; publishing still follows approval and Operations safety."
        actions={
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/media/today" className="rounded-xl bg-[#C6FF32] px-4 py-2 text-sm font-black text-black">Today</Link>
            <Link href="/admin/media/plan" className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white/65">7-Day Plan</Link>
            <Link href="/admin/media/operations" className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white/65">Operations</Link>
          </div>
        }
      />
      <MediaLaunchManager initialOverview={overview} />
    </div>
  );
}
