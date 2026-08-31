import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MediaGrowthManager } from "@/components/admin/media/MediaGrowthManager";
import { getMediaGrowthOverview } from "@/lib/api/media";

export default async function MediaGrowthPage() {
  const overview = await getMediaGrowthOverview(30);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Phase 6F · Growth Analytics + Learning"
        title="Media Growth Engine"
        description="Measure publication performance and account growth, turn repeated evidence into learnings, and feed high-confidence insights back into HSAKAA Content Director without turning winning patterns into repetitive content."
        actions={
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/hsakaa/chat"
              className="rounded-xl bg-[#C6FF32] px-4 py-2 text-sm font-black text-black"
            >
              Ask HSAKAA
            </Link>
            <Link
              href="/admin/media/calendar"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white/65"
            >
              7-Day Calendar
            </Link>
            <Link
              href="/admin/media/director"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white/65"
            >
              Content Director
            </Link>
          </div>
        }
      />
      <MediaGrowthManager initialOverview={overview} />
    </div>
  );
}
