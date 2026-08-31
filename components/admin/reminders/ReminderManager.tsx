"use client";

import { useMemo, useState } from "react";
import { BellRing, Check, Clock3, RefreshCcw, RotateCcw, X } from "lucide-react";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { acknowledgeReminder, dismissReminder, reopenReminder, snoozeReminder, syncReminders } from "@/lib/api/personal-os";
import type { PersonalReminder, ReminderSummary, ReminderToday } from "@/types/personal-os";

type Props = { initialToday: ReminderToday; initialSummary: ReminderSummary };

function when(value: string) {
  return new Intl.DateTimeFormat("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit", day: "2-digit", month: "short" }).format(new Date(value));
}

function sourceLabel(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function ReminderManager({ initialToday, initialSummary }: Props) {
  const [due, setDue] = useState(initialToday.due);
  const [upcoming, setUpcoming] = useState(initialToday.upcoming);
  const [acknowledged, setAcknowledged] = useState(initialToday.acknowledged);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const allActive = useMemo(() => [...due, ...upcoming], [due, upcoming]);

  function replaceActive(updated: PersonalReminder) {
    const remove = (items: PersonalReminder[]) => items.filter((item) => item._id !== updated._id);
    setDue(remove);
    setUpcoming(remove);
    if (["pending", "snoozed"].includes(updated.status)) {
      if (new Date(updated.scheduledFor).getTime() <= Date.now()) setDue((items) => [...items, updated].sort((a, b) => +new Date(a.scheduledFor) - +new Date(b.scheduledFor)));
      else setUpcoming((items) => [...items, updated].sort((a, b) => +new Date(a.scheduledFor) - +new Date(b.scheduledFor)));
    }
  }

  async function action(reminder: PersonalReminder, kind: "ack" | "snooze" | "dismiss" | "reopen") {
    try {
      setBusyId(reminder._id);
      setError("");
      const updated = kind === "ack"
        ? await acknowledgeReminder(reminder._id)
        : kind === "snooze"
          ? await snoozeReminder(reminder._id, 15)
          : kind === "dismiss"
            ? await dismissReminder(reminder._id)
            : await reopenReminder(reminder._id);
      replaceActive(updated);
      if (kind === "ack") setAcknowledged((items) => [updated, ...items.filter((item) => item._id !== updated._id)]);
      if (kind === "reopen") setAcknowledged((items) => items.filter((item) => item._id !== updated._id));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to update reminder.");
    } finally {
      setBusyId(null);
    }
  }

  async function sync() {
    try {
      setBusyId("sync");
      setError("");
      await syncReminders(2);
      window.location.reload();
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to sync reminders.");
      setBusyId(null);
    }
  }

  function ReminderCard({ reminder, acknowledgedCard = false }: { reminder: PersonalReminder; acknowledgedCard?: boolean }) {
    return (
      <article className="rounded-[20px] border border-white/10 bg-white/[0.025] p-5">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2 text-xs text-white/35">
              <span className="rounded-full bg-[#C6FF32]/10 px-2.5 py-1 font-black text-[#C6FF32]">{sourceLabel(reminder.sourceType)}</span>
              <span>{when(reminder.scheduledFor)}</span>
              {reminder.status === "snoozed" && <span className="text-amber-200">Snoozed</span>}
            </div>
            <h3 className="mt-3 text-lg font-black">{reminder.title}</h3>
            {reminder.message && <p className="mt-2 max-w-2xl text-sm leading-6 text-white/40">{reminder.message}</p>}
          </div>
          <div className="flex flex-wrap gap-2">
            {acknowledgedCard ? (
              <button type="button" disabled={busyId === reminder._id} onClick={() => action(reminder, "reopen")} className="inline-flex items-center gap-2 rounded-[12px] border border-white/10 px-3 py-2 text-xs font-bold text-white/55"><RotateCcw className="h-4 w-4" /> Reopen</button>
            ) : (
              <>
                <button type="button" disabled={busyId === reminder._id} onClick={() => action(reminder, "ack")} className="inline-flex items-center gap-2 rounded-[12px] bg-[#C6FF32] px-3 py-2 text-xs font-black text-[#030608]"><Check className="h-4 w-4" /> Done</button>
                <button type="button" disabled={busyId === reminder._id} onClick={() => action(reminder, "snooze")} className="inline-flex items-center gap-2 rounded-[12px] border border-white/10 px-3 py-2 text-xs font-bold text-white/55"><Clock3 className="h-4 w-4" /> 15 min</button>
                <button type="button" disabled={busyId === reminder._id} onClick={() => action(reminder, "dismiss")} className="rounded-[12px] border border-white/10 p-2 text-white/40"><X className="h-4 w-4" /></button>
              </>
            )}
          </div>
        </div>
      </article>
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <AdminStatCard label="Due now" value={due.length} description={`${initialSummary.overdue} overdue`} icon={BellRing} />
        <AdminStatCard label="Upcoming" value={upcoming.length} description="Later today" icon={Clock3} />
        <AdminStatCard label="Snoozed" value={allActive.filter((item) => item.status === "snoozed").length} description="Temporarily deferred" icon={Clock3} />
        <AdminStatCard label="Done today" value={acknowledged.length} description="Acknowledged reminders" icon={Check} />
        <AdminStatCard label="Total today" value={initialSummary.totalToday} description="Generated occurrences" icon={RefreshCcw} />
      </section>
      <div className="flex justify-end"><button type="button" disabled={busyId === "sync"} onClick={sync} className="inline-flex min-h-11 items-center gap-2 rounded-[14px] border border-white/10 px-4 text-sm font-bold text-white/60"><RefreshCcw className="h-4 w-4" /> {busyId === "sync" ? "Syncing…" : "Sync reminders"}</button></div>
      {error && <div className="rounded-[18px] border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">{error}</div>}

      <section className="space-y-3">
        <div><p className="text-xs font-black uppercase tracking-[0.22em] text-[#C6FF32]">Now</p><h2 className="mt-2 text-2xl font-black">Due reminders</h2></div>
        {due.length === 0 ? <AdminEmptyState icon={BellRing} title="Nothing due right now" description="Your due reminders will surface here automatically." /> : due.map((item) => <ReminderCard key={item._id} reminder={item} />)}
      </section>

      {upcoming.length > 0 && <section className="space-y-3"><div><p className="text-xs font-black uppercase tracking-[0.22em] text-white/35">Later today</p><h2 className="mt-2 text-2xl font-black">Upcoming</h2></div>{upcoming.map((item) => <ReminderCard key={item._id} reminder={item} />)}</section>}
      {acknowledged.length > 0 && <section className="space-y-3"><div><p className="text-xs font-black uppercase tracking-[0.22em] text-white/35">Completed</p><h2 className="mt-2 text-2xl font-black">Acknowledged today</h2></div>{acknowledged.slice(0, 10).map((item) => <ReminderCard key={item._id} reminder={item} acknowledgedCard />)}</section>}
    </div>
  );
}
