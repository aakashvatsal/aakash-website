import {
  HealthPage,
} from "@/components/features/health/HealthPage";

import {
  getHealthDashboard,
  getHealthTrends,
  getLatestHealthEntry,
} from "@/lib/health";

export default async function Page() {
  const [
    dashboard,
    trends,
    entry,
  ] =
    await Promise.all([
      getHealthDashboard(),

      getHealthTrends(
        30,
      ),

      getLatestHealthEntry(),
    ]);

  return (
    <HealthPage
      dashboard={
        dashboard
      }
      trends={
        trends
      }
      entry={
        entry
      }
    />
  );
}