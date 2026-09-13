import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MediaBufferInsightsManager } from "@/components/admin/media/MediaBufferInsightsManager";
import { getMediaBufferInsights, getMediaBufferStatus } from "@/lib/api/media";

export default async function MediaBufferInsightsPage() {
  const status = await getMediaBufferStatus();
  const insights = status.configured && status.reachable ? await getMediaBufferInsights(25) : null;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Media V3.11 · Performance Feedback"
        title="Buffer Insights"
        description="Read sent-post impressions, reach, views, reactions, comments, shares, saves, clicks, follows and watch metrics where Buffer exposes them, normalize them into Personal OS, and recalibrate HSAKAA without overfitting small samples."
        actions={
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/media/plan"
              className="rounded-xl bg-[#C6FF32] px-4 py-2 text-sm font-black text-black"
            >
              7-Day Plan
            </Link>
            <Link
              href="/admin/media/growth"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white/65"
            >
              Growth Analytics
            </Link>
            <Link
              href="/admin/media/engagement"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white/65"
            >
              Engagement Inbox
            </Link>
          </div>
        }
      />
      <MediaBufferInsightsManager initialStatus={status} initialInsights={insights} />
    </div>
  );
}
