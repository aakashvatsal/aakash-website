import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MediaReviewManager } from "@/components/admin/media/MediaReviewManager";
import { getMediaReviewOverview } from "@/lib/api/media";

export default async function MediaReviewPage() {
  const overview = await getMediaReviewOverview();
  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Media V3.9 · Preflight & Approval"
        title="Final Review Gate"
        description="Review the exact final publication after copy, production and assets are ready. Approval becomes stale automatically if anything changes afterward."
        actions={
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/media/production"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white/65"
            >
              Production
            </Link>
            <Link
              href="/admin/media/today"
              className="rounded-xl bg-[#C6FF32] px-4 py-2 text-sm font-black text-black"
            >
              Today
            </Link>
            <Link
              href="/admin/media/release"
              className="rounded-xl border border-[#C6FF32]/30 px-4 py-2 text-sm font-bold text-[#C6FF32]"
            >
              Release Audit
            </Link>
            <Link
              href="/admin/media/calendar"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white/65"
            >
              Calendar
            </Link>
          </div>
        }
      />
      <MediaReviewManager initialOverview={overview} />
    </div>
  );
}
