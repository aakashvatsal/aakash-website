import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { DietManager } from "@/components/admin/health-os/DietManager";
import { HealthOsNav } from "@/components/admin/health-os/HealthOsNav";
import { getDietEntries } from "@/lib/api/personal-health";

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

export default async function DietPage() {
  try {
    const entries = await getDietEntries(dateValue(60), dateValue());

    return (
      <main className="space-y-8">
        <AdminPageHeader
          eyebrow="Health OS"
          title="Diet"
          description="Plan daily nutrition targets, track meal completion and see adherence without mixing diet data into the general health log."
        />
        <HealthOsNav />
        <DietManager initialEntries={entries} />
      </main>
    );
  } catch (error) {
    return (
      <main className="space-y-8">
        <AdminPageHeader eyebrow="Health OS" title="Diet" description="Daily nutrition planning and adherence." />
        <HealthOsNav />
        <div className="rounded-[24px] border border-red-400/20 bg-red-400/10 p-6 text-sm leading-6 text-red-200">
          {error instanceof Error ? error.message : "Unable to load Diet OS."}
        </div>
      </main>
    );
  }
}
