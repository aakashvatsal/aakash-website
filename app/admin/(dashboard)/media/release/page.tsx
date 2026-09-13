import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MediaReleaseManager } from "@/components/admin/media/MediaReleaseManager";
import { getMediaReleaseOverview } from "@/lib/api/media";

export default async function MediaReleasePage() {
  const overview = await getMediaReleaseOverview();
  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Media V3.10 · Release Candidate"
        title="End-to-End Launch Audit"
        description="One release gate across Presence, launch, seven-day planning, production/assets, final approval, delivery, analytics learning and Media data integrity."
        actions={
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/media/today"
              className="rounded-xl bg-[#C6FF32] px-4 py-2 text-sm font-black text-black"
            >
              Today
            </Link>
            <Link
              href="/admin/media/operations"
              className="rounded-xl border border-amber-300/20 px-4 py-2 text-sm font-bold text-amber-200"
            >
              Operations
            </Link>
            <Link
              href="/admin/media/review"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white/65"
            >
              Final Review
            </Link>
          </div>
        }
      />
      <MediaReleaseManager initialOverview={overview} />
    </div>
  );
}
