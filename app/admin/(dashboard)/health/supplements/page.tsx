import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { HealthOsNav } from "@/components/admin/health-os/HealthOsNav";
import { SupplementsManager } from "@/components/admin/health-os/SupplementsManager";
import {
  getDailySupplementLog,
  getSupplements,
} from "@/lib/api/personal-health";

export const dynamic = "force-dynamic";

function todayInIndia() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

export default async function SupplementsPage() {
  try {
    const today = todayInIndia();
    const [supplements, dailyLog] = await Promise.all([
      getSupplements(),
      getDailySupplementLog(today),
    ]);

    return (
      <main className="space-y-8">
        <AdminPageHeader
          eyebrow="Health OS"
          title="Supplements"
          description="Maintain the supplement stack, schedule doses, track today’s adherence and keep an eye on stock."
        />
        <HealthOsNav />
        <SupplementsManager
          today={today}
          initialSupplements={supplements}
          initialDailyLog={dailyLog}
        />
      </main>
    );
  } catch (error) {
    return (
      <main className="space-y-8">
        <AdminPageHeader eyebrow="Health OS" title="Supplements" description="Supplement stack and adherence." />
        <HealthOsNav />
        <div className="rounded-[24px] border border-red-400/20 bg-red-400/10 p-6 text-sm leading-6 text-red-200">
          {error instanceof Error ? error.message : "Unable to load Supplements OS."}
        </div>
      </main>
    );
  }
}
