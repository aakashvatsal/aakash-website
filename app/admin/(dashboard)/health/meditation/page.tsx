import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { HealthOsNav } from "@/components/admin/health-os/HealthOsNav";
import { MeditationManager } from "@/components/admin/health-os/MeditationManager";
import {
  getMeditationEntries,
  getMeditationSummary,
} from "@/lib/api/personal-health";

export const dynamic = "force-dynamic";

function dateValue(daysAgo = 0) {
  const today = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());

  const date = new Date(`${today}T12:00:00+05:30`);
  date.setDate(date.getDate() - daysAgo);

  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

export default async function MeditationPage() {
  try {
    const startDate = dateValue(30);
    const endDate = dateValue();
    const [entries, summary] = await Promise.all([
      getMeditationEntries(startDate, endDate),
      getMeditationSummary(startDate, endDate),
    ]);

    return (
      <main className="space-y-8">
        <AdminPageHeader
          eyebrow="Health OS"
          title="Meditation"
          description="Plan sessions, control live session state, capture reflections and measure how meditation changes focus, calmness and stress."
        />
        <HealthOsNav />
        <MeditationManager initialEntries={entries} initialSummary={summary} />
      </main>
    );
  } catch (error) {
    return (
      <main className="space-y-8">
        <AdminPageHeader eyebrow="Health OS" title="Meditation" description="Meditation planning, execution and reflection." />
        <HealthOsNav />
        <div className="rounded-[24px] border border-red-400/20 bg-red-400/10 p-6 text-sm leading-6 text-red-200">
          {error instanceof Error ? error.message : "Unable to load Meditation OS."}
        </div>
      </main>
    );
  }
}
