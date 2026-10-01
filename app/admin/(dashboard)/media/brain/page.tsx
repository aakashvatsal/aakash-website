import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MediaBrainManager } from "@/components/admin/media/MediaBrainManager";
import {
  getMediaGrowthOverview,
  getMediaIntelligenceOverview,
  getMediaLaunchOverview,
  getMediaLearningOverview,
  getMediaManualAnalyticsQueue,
  getMediaPlanningOverview,
  getMediaPresenceOsOverview,
  getMediaPresenceOverview,
  getMediaSocialPresenceOverview,
} from "@/lib/api/media";

export default async function MediaBrainPage() {
  const [
    presence,
    planning,
    learning,
    growth,
    launch,
    adaptation,
    intelligence,
    socialPresence,
    analyticsQueue,
  ] = await Promise.all([
    getMediaPresenceOverview().catch(() => null),
    getMediaPlanningOverview().catch(() => null),
    getMediaLearningOverview(90).catch(() => null),
    getMediaGrowthOverview(90).catch(() => null),
    getMediaLaunchOverview().catch(() => null),
    getMediaPresenceOsOverview().catch(() => null),
    getMediaIntelligenceOverview().catch(() => null),
    getMediaSocialPresenceOverview().catch(() => null),
    getMediaManualAnalyticsQueue(200).catch(() => null),
  ]);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="HSAKAA social media manager"
        title="Media Brain"
        description="Inspect what HSAKAA currently knows, believes, protects and is optimizing before it writes the next piece of content."
      />
      <MediaBrainManager
        presence={presence}
        planning={planning}
        learning={learning}
        growth={growth}
        launch={launch}
        adaptation={adaptation}
        intelligence={intelligence}
        socialPresence={socialPresence}
        analyticsQueue={analyticsQueue}
      />
    </div>
  );
}
