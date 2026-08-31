import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MediaProductionStudioManager } from "@/components/admin/media/MediaProductionStudioManager";
import {
  getMediaProductionOverview,
  getMediaProductionStudio,
} from "@/lib/api/media";

export default async function MediaProductionStudioPage() {
  const [overview, items] = await Promise.all([
    getMediaProductionOverview(),
    getMediaProductionStudio(),
  ]);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Phase 6D · Production Studio"
        title="Production Studio"
        description="Turn approved HSAKAA content into production-ready scripts, shots, B-roll, carousel direction, thumbnails, asset requirements and review-ready executions without scheduling or publishing."
        actions={
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/hsakaa/chat"
              className="rounded-xl bg-[#C6FF32] px-4 py-2 text-sm font-black text-black"
            >
              Direct in HSAKAA
            </Link>
            <Link
              href="/admin/media/calendar"
              className="rounded-xl border border-[#C6FF32]/30 px-4 py-2 text-sm font-bold text-[#C6FF32]"
            >
              7-Day Calendar
            </Link>
            <Link
              href="/admin/media/director"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white/65"
            >
              Content Director
            </Link>
            <Link
              href="/admin/media/core"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white/65"
            >
              Media Core
            </Link>
          </div>
        }
      />
      <MediaProductionStudioManager overview={overview} initialItems={items} />
    </div>
  );
}
