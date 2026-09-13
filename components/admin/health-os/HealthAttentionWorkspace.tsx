"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Bell,
  CheckCircle2,
  Clock3,
  Loader2,
  RefreshCw,
  ShieldAlert,
  Sparkles,
  X,
} from "lucide-react";

import {
  dismissHealthAttention,
  getHealthAttention,
  getHealthInterventions,
  getHealthNotificationPreferences,
  resolveHealthAttention,
  runHealthProactive,
  updateHealthNotificationPreferences,
} from "@/lib/api/health-planner";
import type {
  HealthAttentionPriority,
  HealthAttentionResponse,
  HealthAttentionStatus,
  HealthIntervention,
  HealthNotificationPreferences,
  HealthProactiveAttentionItem,
} from "@/types/health-planner";

const tabs: Array<{ value: HealthAttentionStatus; label: string }> = [
  { value: "open", label: "Needs attention" },
  { value: "resolved", label: "Resolved" },
  { value: "dismissed", label: "Dismissed" },
];

export function HealthAttentionWorkspace() {
  const [status, setStatus] = useState<HealthAttentionStatus>("open");
  const [attention, setAttention] = useState<HealthAttentionResponse | null>(null);
  const [preferences, setPreferences] = useState<HealthNotificationPreferences | null>(null);
  const [interventions, setInterventions] = useState<HealthIntervention[]>([]);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");

  const load = useCallback(async () => {
    const [items, prefs, history] = await Promise.all([
      getHealthAttention(status, 100),
      getHealthNotificationPreferences(),
      getHealthInterventions(30),
    ]);
    setAttention(items);
    setPreferences(prefs);
    setInterventions(history);
  }, [status]);

  useEffect(() => {
    load().catch((value) =>
      setError(value instanceof Error ? value.message : "Unable to load Health attention."),
    );
  }, [load]);

  async function act(id: string, action: "resolve" | "dismiss") {
    setBusy(`${action}:${id}`);
    setError("");
    try {
      if (action === "resolve") await resolveHealthAttention(id);
      else await dismissHealthAttention(id);
      await load();
    } catch (value) {
      setError(value instanceof Error ? value.message : "Unable to update the attention item.");
    } finally {
      setBusy("");
    }
  }

  async function savePreferences() {
    if (!preferences) return;
    setBusy("preferences");
    setSaved("");
    setError("");
    try {
      const updated = await updateHealthNotificationPreferences({
        morningBriefEnabled: preferences.morningBriefEnabled,
        morningBriefTime: preferences.morningBriefTime,
        workoutRemindersEnabled: preferences.workoutRemindersEnabled,
        defaultWorkoutTime: preferences.defaultWorkoutTime,
        workoutLeadMinutes: preferences.workoutLeadMinutes,
        mealRemindersEnabled: preferences.mealRemindersEnabled,
        supplementRemindersEnabled: preferences.supplementRemindersEnabled,
        meditationRemindersEnabled: preferences.meditationRemindersEnabled,
        skincareRemindersEnabled: preferences.skincareRemindersEnabled,
        haircareRemindersEnabled: preferences.haircareRemindersEnabled,
        intimateCareRemindersEnabled: preferences.intimateCareRemindersEnabled,
        sleepRemindersEnabled: preferences.sleepRemindersEnabled,
        sleepLeadMinutes: preferences.sleepLeadMinutes,
        quietHoursStart: preferences.quietHoursStart,
        quietHoursEnd: preferences.quietHoursEnd,
      });
      setPreferences(updated);
      setSaved("Preferences saved. Existing Health routine reminders were resynced.");
    } catch (value) {
      setError(value instanceof Error ? value.message : "Unable to save Health notification preferences.");
    } finally {
      setBusy("");
    }
  }

  async function runCoach() {
    setBusy("coach");
    setError("");
    setSaved("");
    try {
      await runHealthProactive(true);
      await load();
      setSaved("Proactive coaching refreshed from the latest Health evidence.");
    } catch (value) {
      setError(value instanceof Error ? value.message : "Unable to refresh proactive coaching.");
    } finally {
      setBusy("");
    }
  }

  const openCount = useMemo(
    () =>
      Object.values(attention?.counts ?? {}).reduce((sum, value) => sum + (Number(value) || 0), 0),
    [attention],
  );

  return (
    <div className="space-y-5">
      <section className="rounded-[26px] border border-[#C6FF32]/20 bg-[#C6FF32]/[0.035] p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-4xl">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#C6FF32]">Health OS · Proactive coaching</p>
            <h2 className="mt-2 text-2xl font-black">HSAKAA interrupts only when something deserves attention.</h2>
            <p className="mt-2 text-sm leading-6 text-white/45">
              Normal plan adjustments happen automatically within your safety boundaries. Important, review and professional-review signals stay visible here until they are resolved or dismissed.
            </p>
          </div>
          <button
            type="button"
            onClick={runCoach}
            disabled={!!busy}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-white/[0.06] px-3 text-xs font-black text-white/65 disabled:opacity-50"
          >
            {busy === "coach" ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Refresh coaching
          </button>
        </div>
      </section>

      {error ? <Notice tone="error">{error}</Notice> : null}
      {saved ? <Notice tone="success">{saved}</Notice> : null}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Count label="Open" value={openCount} />
        <Count label="Action" value={attention?.counts.action ?? 0} />
        <Count label="Important" value={attention?.counts.important ?? 0} />
        <Count label="Review" value={attention?.counts.review ?? 0} />
        <Count label="Professional" value={attention?.counts.professional_review ?? 0} />
      </section>

      <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-black">Attention inbox</h3>
            <p className="mt-1 text-sm text-white/35">A resolved signal stays closed while the same evidence persists. If it disappears and genuinely returns later, HSAKAA can reopen it.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {tabs.map((tab) => (
              <button
                key={tab.value}
                type="button"
                onClick={() => setStatus(tab.value)}
                className={`rounded-xl px-3 py-2 text-xs font-black ${status === tab.value ? "bg-[#C6FF32] text-[#030608]" : "bg-white/[0.06] text-white/45"}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {attention?.items.length ? (
            attention.items.map((item) => (
              <AttentionCard key={item._id} item={item} busy={busy} onAct={act} />
            ))
          ) : (
            <div className="rounded-[18px] border border-dashed border-white/10 p-6 text-sm text-white/35">
              {status === "open" ? "Nothing currently needs your attention." : `No ${status} Health attention items.`}
            </div>
          )}
        </div>
      </section>

      {preferences ? (
        <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <Bell className="h-5 w-5 text-[#C6FF32]" />
            <div>
              <h3 className="text-xl font-black">Reminder preferences</h3>
              <p className="mt-1 text-sm text-white/35">Health tasks use the existing Tasks + Reminders engine. Completing or skipping the task clears its routine reminder.</p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 xl:grid-cols-2">
            <PreferenceGroup title="Daily coaching">
              <Toggle label="Morning brief" checked={preferences.morningBriefEnabled} onChange={(value) => setPreferences({ ...preferences, morningBriefEnabled: value })} />
              <TimeField label="Morning brief time" value={preferences.morningBriefTime} onChange={(value) => setPreferences({ ...preferences, morningBriefTime: value })} />
              <Toggle label="Workout reminder" checked={preferences.workoutRemindersEnabled} onChange={(value) => setPreferences({ ...preferences, workoutRemindersEnabled: value })} />
              <TimeField label="Default workout time" value={preferences.defaultWorkoutTime} onChange={(value) => setPreferences({ ...preferences, defaultWorkoutTime: value })} />
              <NumberField label="Workout reminder lead (min)" value={preferences.workoutLeadMinutes} onChange={(value) => setPreferences({ ...preferences, workoutLeadMinutes: value })} />
            </PreferenceGroup>

            <PreferenceGroup title="Routine reminders">
              <Toggle label="Meals" checked={preferences.mealRemindersEnabled} onChange={(value) => setPreferences({ ...preferences, mealRemindersEnabled: value })} />
              <Toggle label="Supplements" checked={preferences.supplementRemindersEnabled} onChange={(value) => setPreferences({ ...preferences, supplementRemindersEnabled: value })} />
              <Toggle label="Meditation" checked={preferences.meditationRemindersEnabled} onChange={(value) => setPreferences({ ...preferences, meditationRemindersEnabled: value })} />
              <Toggle label="Skincare" checked={preferences.skincareRemindersEnabled} onChange={(value) => setPreferences({ ...preferences, skincareRemindersEnabled: value })} />
              <Toggle label="Haircare" checked={preferences.haircareRemindersEnabled} onChange={(value) => setPreferences({ ...preferences, haircareRemindersEnabled: value })} />
              <Toggle label="Intimate care" checked={preferences.intimateCareRemindersEnabled} onChange={(value) => setPreferences({ ...preferences, intimateCareRemindersEnabled: value })} />
              <Toggle label="Sleep / wind-down" checked={preferences.sleepRemindersEnabled} onChange={(value) => setPreferences({ ...preferences, sleepRemindersEnabled: value })} />
              <NumberField label="Sleep reminder lead (min)" value={preferences.sleepLeadMinutes} onChange={(value) => setPreferences({ ...preferences, sleepLeadMinutes: value })} />
            </PreferenceGroup>
          </div>

          <div className="mt-4 grid gap-4 xl:grid-cols-2">
            <PreferenceGroup title="Quiet hours">
              <TimeField label="Quiet from" value={preferences.quietHoursStart} onChange={(value) => setPreferences({ ...preferences, quietHoursStart: value })} />
              <TimeField label="Quiet until" value={preferences.quietHoursEnd} onChange={(value) => setPreferences({ ...preferences, quietHoursEnd: value })} />
              <p className="text-xs leading-5 text-white/30">Ordinary routine reminders are suppressed inside quiet hours. The underlying Health task still exists.</p>
            </PreferenceGroup>
            <PreferenceGroup title="Safety">
              <div className="rounded-[16px] border border-amber-300/15 bg-amber-300/[0.04] p-4">
                <div className="flex items-center gap-2 text-amber-100">
                  <ShieldAlert className="h-4 w-4" />
                  <p className="font-black">Important Health alerts always on</p>
                </div>
                <p className="mt-2 text-xs leading-5 text-white/35">Medication changes, medically meaningful supplement changes, persistent pain, concerning report/photo evidence and diagnosis/treatment decisions remain approval or professional-review items.</p>
              </div>
            </PreferenceGroup>
          </div>

          <button
            type="button"
            onClick={savePreferences}
            disabled={busy === "preferences"}
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-[14px] bg-[#C6FF32] px-4 text-sm font-black text-[#030608] disabled:opacity-50"
          >
            {busy === "preferences" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Bell className="h-4 w-4" />}
            Save reminder preferences
          </button>
        </section>
      ) : null}

      <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <Sparkles className="h-5 w-5 text-[#C6FF32]" />
          <div>
            <h3 className="text-xl font-black">Automatic interventions & follow-ups</h3>
            <p className="mt-1 text-sm text-white/35">HSAKAA records what it changed and later checks whether recovery improved rather than assuming the intervention worked.</p>
          </div>
        </div>
        <div className="mt-5 space-y-3">
          {interventions.length ? (
            interventions.map((item) => (
              <article key={item._id} className="rounded-[18px] border border-white/10 bg-black/20 p-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-[#C6FF32]">{item.dateKey} · {item.type.replaceAll("_", " ")}</p>
                    <p className="mt-1 font-black text-white/80">{item.changeSummary}</p>
                  </div>
                  <InterventionStatus value={item.status} />
                </div>
                <p className="mt-2 text-sm leading-6 text-white/40">{item.rationale}</p>
                {item.followUpSummary ? <p className="mt-3 rounded-xl bg-white/[0.04] p-3 text-xs leading-5 text-white/45">Follow-up: {item.followUpSummary}</p> : null}
              </article>
            ))
          ) : (
            <div className="rounded-[18px] border border-dashed border-white/10 p-6 text-sm text-white/35">No automatic Health interventions have been recorded yet.</div>
          )}
        </div>
      </section>
    </div>
  );
}

function AttentionCard({ item, busy, onAct }: { item: HealthProactiveAttentionItem; busy: string; onAct: (id: string, action: "resolve" | "dismiss") => void }) {
  return (
    <article className={`rounded-[18px] border p-4 ${priorityClass(item.priority)}`}>
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-4xl">
          <div className="flex flex-wrap items-center gap-2">
            <Priority value={item.priority} />
            {item.domain ? <span className="text-[11px] font-black uppercase text-white/25">{item.domain}</span> : null}
          </div>
          <h4 className="mt-2 font-black text-white/85">{item.title}</h4>
          <p className="mt-2 text-sm leading-6 text-white/45">{item.message}</p>
          <p className="mt-3 text-xs leading-5 text-white/35"><span className="font-black text-white/55">Next:</span> {item.action}</p>
        </div>
        {item.status === "open" ? (
          <div className="flex shrink-0 gap-2">
            <button type="button" disabled={!!busy} onClick={() => onAct(item._id, "resolve")} className="inline-flex min-h-9 items-center gap-2 rounded-xl bg-[#C6FF32] px-3 text-xs font-black text-[#030608] disabled:opacity-50">
              {busy === `resolve:${item._id}` ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Resolve
            </button>
            <button type="button" disabled={!!busy} onClick={() => onAct(item._id, "dismiss")} className="inline-flex min-h-9 items-center gap-2 rounded-xl bg-white/[0.06] px-3 text-xs font-black text-white/45 disabled:opacity-50">
              <X className="h-4 w-4" /> Dismiss
            </button>
          </div>
        ) : null}
      </div>
    </article>
  );
}

function PreferenceGroup({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="space-y-3 rounded-[18px] border border-white/10 bg-black/20 p-4"><p className="font-black text-white/75">{title}</p>{children}</div>;
}

function Toggle({ label, checked, onChange }: { label: string; checked: boolean; onChange: (value: boolean) => void }) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-4 rounded-xl bg-white/[0.025] px-3 py-2.5 text-sm text-white/55">
      <span>{label}</span>
      <button type="button" role="switch" aria-checked={checked} onClick={() => onChange(!checked)} className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-[#C6FF32]" : "bg-white/10"}`}>
        <span className={`absolute top-1 h-4 w-4 rounded-full bg-[#030608] transition ${checked ? "left-6" : "left-1"}`} />
      </button>
    </label>
  );
}

function TimeField({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return <label className="grid gap-1.5 text-xs font-black uppercase tracking-[0.1em] text-white/25"><span>{label}</span><input type="time" value={value} onChange={(event) => onChange(event.target.value)} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm font-medium normal-case tracking-normal text-white/70 outline-none" /></label>;
}

function NumberField({ label, value, onChange }: { label: string; value: number; onChange: (value: number) => void }) {
  return <label className="grid gap-1.5 text-xs font-black uppercase tracking-[0.1em] text-white/25"><span>{label}</span><input type="number" min={0} max={180} value={value} onChange={(event) => onChange(Math.max(0, Math.min(180, Number(event.target.value) || 0)))} className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2.5 text-sm font-medium normal-case tracking-normal text-white/70 outline-none" /></label>;
}

function Count({ label, value }: { label: string; value: number }) {
  return <div className="rounded-[18px] border border-white/10 bg-white/[0.025] p-4"><p className="text-[11px] font-black uppercase tracking-[0.14em] text-white/25">{label}</p><p className="mt-2 text-2xl font-black text-white/85">{value}</p></div>;
}

function Notice({ tone, children }: { tone: "error" | "success"; children: React.ReactNode }) {
  return <div className={`rounded-[18px] border p-4 text-sm ${tone === "error" ? "border-red-400/20 bg-red-400/10 text-red-200" : "border-[#C6FF32]/15 bg-[#C6FF32]/[0.05] text-white/60"}`}>{children}</div>;
}

function Priority({ value }: { value: HealthAttentionPriority }) {
  const icon = value === "professional_review" ? <ShieldAlert className="h-3.5 w-3.5" /> : value === "important" || value === "review" ? <AlertTriangle className="h-3.5 w-3.5" /> : <Clock3 className="h-3.5 w-3.5" />;
  return <span className="inline-flex items-center gap-1.5 rounded-lg bg-black/20 px-2 py-1 text-[10px] font-black uppercase tracking-[0.08em]">{icon}{value.replaceAll("_", " ")}</span>;
}

function priorityClass(value: HealthAttentionPriority) {
  if (value === "professional_review") return "border-red-400/25 bg-red-400/[0.045]";
  if (value === "important") return "border-amber-300/20 bg-amber-300/[0.04]";
  if (value === "review") return "border-orange-300/15 bg-orange-300/[0.035]";
  return "border-white/10 bg-black/20";
}

function InterventionStatus({ value }: { value: HealthIntervention["status"] }) {
  const cls = value === "improved" ? "bg-[#C6FF32]/10 text-[#C6FF32]" : value === "not_improved" ? "bg-amber-300/10 text-amber-200" : "bg-white/[0.06] text-white/40";
  return <span className={`rounded-lg px-2 py-1 text-[10px] font-black uppercase ${cls}`}>{value.replaceAll("_", " ")}</span>;
}
