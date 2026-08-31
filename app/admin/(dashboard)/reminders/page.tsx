import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ReminderManager } from "@/components/admin/reminders/ReminderManager";
import { getReminderSummary, getReminderToday } from "@/lib/api/personal-os";

export const dynamic = "force-dynamic";

export default async function RemindersPage() {
  try {
    const [today, summary] = await Promise.all([getReminderToday(), getReminderSummary()]);
    return (
      <main className="space-y-8">
        <AdminPageHeader eyebrow="Personal OS" title="Reminders" description="One place for due tasks, supplements and care routines—acknowledge, snooze or dismiss without hunting across modules." />
        <ReminderManager initialToday={today} initialSummary={summary} />
      </main>
    );
  } catch (error) {
    return <main className="space-y-8"><AdminPageHeader eyebrow="Personal OS" title="Reminders" description="Your unified reminder layer." /><div className="rounded-[24px] border border-red-400/20 bg-red-400/10 p-6 text-sm text-red-200">{error instanceof Error ? error.message : "Unable to load reminders."}</div></main>;
  }
}
