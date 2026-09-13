import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MediaTodayManager } from "@/components/admin/media/MediaTodayManager";
import { getMediaTodayOverview } from "@/lib/api/media";

export default async function MediaTodayPage() {
  const overview = await getMediaTodayOverview();
  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Media V3.4 · Autopilot Presence OS"
        title="Today"
        description="Everything HSAKAA wants you to publish, capture or complete today—using the exact execution-ready detail from the rolling 7-day plan."
      />
      <MediaTodayManager initialOverview={overview} />
    </div>
  );
}
