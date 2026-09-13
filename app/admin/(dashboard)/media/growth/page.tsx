import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MediaGrowthManager } from "@/components/admin/media/MediaGrowthManager";
import { getMediaGrowthOverview } from "@/lib/api/media";

export default async function MediaGrowthPage() {
  const overview = await getMediaGrowthOverview(30);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Media · Performance"
        title="Performance"
        description="See results and HSAKAA interpretation together. Performance learnings feed the next seven-day plan automatically without asking you to repeat winning topics."
        actions={
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/media/plan"
              className="rounded-xl bg-[#C6FF32] px-4 py-2 text-sm font-black text-black"
            >
              7-Day Plan
            </Link>
            <Link
              href="/admin/media/system"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white/65"
            >
              Advanced
            </Link>
          </div>
        }
      />
      <MediaGrowthManager initialOverview={overview} />
    </div>
  );
}
