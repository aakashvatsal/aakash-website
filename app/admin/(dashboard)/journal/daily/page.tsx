import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DailyJournalWorkspace } from "@/components/admin/journal/DailyJournalWorkspace";
import {
  getDailyContextWorkspace,
  getJournalIntelligence,
} from "@/lib/api/daily-context";

export const dynamic = "force-dynamic";

function todayInIndia() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

export default async function DailyJournalPage({
  searchParams,
}: {
  searchParams: Promise<{ date?: string }>;
}) {
  const params = await searchParams;
  const dateKey = params.date ?? todayInIndia();
  const [workspace, weekly, monthly] = await Promise.all([
    getDailyContextWorkspace(dateKey),
    getJournalIntelligence("week", dateKey),
    getJournalIntelligence("month", dateKey),
  ]);

  return (
    <div>
      <AdminPageHeader
        eyebrow="Phase 7 · Daily Journal"
        title="Daily Journal & Privacy Firewall"
        description="Review the factual day HSAKAA captured, decide exactly what is private or public-safe, then approve separate private and public journal drafts."
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
