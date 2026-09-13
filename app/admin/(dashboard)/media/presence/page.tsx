import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MediaPresenceManager } from "@/components/admin/media/MediaPresenceManager";
import { getMediaPresenceOverview } from "@/lib/api/media";

export default async function MediaPresencePage() {
  const overview = await getMediaPresenceOverview();

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Media V3.1 · Intelligence Foundation"
        title="HSAKAA Presence Engine"
        description="See the wider Personal OS context Media can use, build Aakash's persistent 30/90-day presence strategy, and maintain an authenticity-first voice model that Content Director consumes automatically."
        actions={
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/media/today" className="rounded-xl bg-[#C6FF32] px-4 py-2 text-sm font-black text-black">Today</Link>
            <Link href="/admin/media/plan" className="rounded-xl border border-[#C6FF32]/30 px-4 py-2 text-sm font-bold text-[#C6FF32]">7-Day Presence Plan</Link>
            <Link href="/admin/media/director" className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white/65">
              Content Director
            </Link>
            <Link href="/admin/media/autopilot" className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white/65">
              Autopilot
            </Link>
            <Link href="/admin/hsakaa/context" className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white/65">
              HSAKAA Context
            </Link>
          </div>
        }
      />
      <MediaPresenceManager initialOverview={overview} />
    </div>
  );
}
