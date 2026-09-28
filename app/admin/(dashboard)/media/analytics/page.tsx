import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MediaContentAnalyticsManager } from "@/components/admin/media/MediaContentAnalyticsManager";
import {
  getMediaCoreAccounts,
  getMediaGrowthOverview,
  getMediaLearningOverview,
  getMediaManualAnalyticsQueue,
  getMediaSocialPresenceOverview,
} from "@/lib/api/media";

export default async function MediaAnalyticsPage() {
  const [accounts, growth, learning, analyticsQueue, socialPresence] = await Promise.all([
    getMediaCoreAccounts(),
    getMediaGrowthOverview(90),
    getMediaLearningOverview(90),
    getMediaManualAnalyticsQueue(200),
    getMediaSocialPresenceOverview(),
  ]);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="HSAKAA social media manager"
        title="Content Analytics"
        description="Your HSAKAA-generated content appears here automatically. Enter only the native platform analytics at 48 hours and 96 hours. HSAKAA learns what works and updates pin, change, repurpose and boost guidance."
      />
      <MediaContentAnalyticsManager
        accounts={accounts}
        growth={growth}
        learning={learning}
        analyticsQueue={analyticsQueue}
        socialPresence={socialPresence}
      />
    </div>
  );
}
