import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DailyJournalWorkspace } from "@/components/admin/journal/DailyJournalWorkspace";
import {
  getDailyContextWorkspaceServer,
  getJournalIntelligenceServer,
} from "@/lib/api/daily-context.server";

export const dynamic = "force-dynamic";

function previousDayInIndia() {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const todayKey = formatter.format(new Date());
  const previous = new Date(
    new Date(`${todayKey}T00:00:00+05:30`).getTime() - 24 * 60 * 60 * 1000,
  );
  return formatter.format(previous);
}

export default async function DailyJournalPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  const dateKey = params.date ?? previousDayInIndia();
  const [workspace, weekly, monthly] = await Promise.all([
    getDailyContextWorkspaceServer(dateKey),
    getJournalIntelligenceServer("week", dateKey),
    getJournalIntelligenceServer("month", dateKey),
  ]);

  return (
    <div>
      <AdminPageHeader
        eyebrow="Previous-day journal"
        title="Review yesterday, then publish once"
        description="HSAKAA prepares yesterday from Personal OS activity. Add anything software missed, review the private and public-safe drafts, then one approval publishes both copies."
      />
      <div className="mt-8">
        <DailyJournalWorkspace
          initialWorkspace={workspace}
          initialWeekly={weekly}
          initialMonthly={monthly}
        />
      </div>
    </div>
  );
}
