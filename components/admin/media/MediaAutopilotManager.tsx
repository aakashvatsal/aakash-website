"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  CircleOff,
  Gauge,
  Play,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
  Zap,
} from "lucide-react";

import {
  runMediaAutopilot,
  updateMediaAutopilotRecommendation,
  updateMediaAutopilotSettings,
} from "@/lib/api/media";
import type {
  MediaAutopilotOverview,
  MediaAutopilotPriority,
  MediaAutopilotRecommendation,
  MediaAutopilotRun,
  MediaAutopilotRunType,
  MediaAutopilotSettings,
} from "@/types/media";

interface Props {
  initialOverview: MediaAutopilotOverview;
  initialRuns: MediaAutopilotRun[];
}

const platformLabels: Record<string, string> = {
  linkedin: "LinkedIn",
  instagram: "Instagram",
  youtube: "YouTube",
  x: "X",
  whatsapp: "WhatsApp",
  facebook: "Facebook",
  threads: "Threads",
};

const priorityClasses: Record<MediaAutopilotPriority, string> = {
  urgent: "border-red-500/25 bg-red-500/[0.06] text-red-200",
  high: "border-amber-400/25 bg-amber-400/[0.05] text-amber-200",
  normal: "border-white/10 bg-white/[0.025] text-white/70",
  low: "border-white/5 bg-black/20 text-white/45",
};

function recommendationHref(item: MediaAutopilotRecommendation) {
  switch (item.kind) {
    case "production_gap":
      return "/admin/media/production";
    case "engagement":
      return "/admin/media/engagement";
    case "growth_opportunity":
    case "growth_risk":
    case "experiment":
    case "analytics_gap":
      return "/admin/media/growth";
    case "content_candidate":
      return "/admin/media/director";
    case "calendar_gap":
    case "ready_unscheduled":
    case "publishing_failure":
    case "manual_publish":
    default:
      return "/admin/media/calendar";
  }
}

function formatDate(value?: string) {
  if (!value) return "Never";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(date);
}

function StatCard({ label, value, note }: { label: string; value: string | number; note?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-white/35">{label}</div>
      <div className="mt-3 text-2xl font-black text-white">{value}</div>
      {note ? <div className="mt-1 text-xs text-white/35">{note}</div> : null}
    </div>
  );
}

export function MediaAutopilotManager({ initialOverview, initialRuns }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [settings, setSettings] = useState<MediaAutopilotSettings>(initialOverview.settings);

  const weekly = initialOverview.latestWeekly?.strategyReview;
  const openByPriority = useMemo(
    () => ({
      urgent: initialOverview.openRecommendations.filter((item) => item.priority === "urgent").length,
      high: initialOverview.openRecommendations.filter((item) => item.priority === "high").length,
    }),
    [initialOverview.openRecommendations],
  );

  function run(action: () => Promise<unknown>, success: string) {
    setMessage("");
    setError("");
    startTransition(async () => {
      try {
        await action();
        setMessage(success);
        router.refresh();
      } catch (value) {
        setError(value instanceof Error ? value.message : "Growth Autopilot action failed.");
      }
    });
  }

  function trigger(type: MediaAutopilotRunType, generateDrafts: boolean) {
    run(
      () => runMediaAutopilot({ type, generateDrafts }),
      type === "weekly" ? "Weekly strategy review completed." : "Growth Autopilot scan completed.",
    );
  }

  function saveSettings() {
    run(
      () =>
        updateMediaAutopilotSettings({
          enabled: settings.enabled,
          dailyEnabled: settings.dailyEnabled,
          weeklyEnabled: settings.weeklyEnabled,
          autoDraftCalendarGaps: settings.autoDraftCalendarGaps,
          planningHorizonDays: Math.max(7, Math.min(30, Math.trunc(settings.planningHorizonDays))),
          maxDailyDraftRuns: Math.max(0, Math.min(10, Math.trunc(settings.maxDailyDraftRuns))),
          candidateCount: Math.max(2, Math.min(8, Math.trunc(settings.candidateCount))),
        }),
      "Autopilot settings saved.",
    );
  }

  function updateRecommendation(item: MediaAutopilotRecommendation, status: "dismissed" | "completed") {
    if (!item.runId) {
      setError("This recommendation is missing its originating run id.");
      return;
    }
    run(
      () => updateMediaAutopilotRecommendation(item.runId as string, item.key, status),
      status === "completed" ? "Recommendation marked complete." : "Recommendation dismissed.",
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[#C6FF32]/15 bg-[#C6FF32]/[0.025] p-4">
        <div>
          <div className="flex items-center gap-2 text-sm font-black text-white"><Zap className="h-4 w-4 text-[#C6FF32]" /> Growth Autopilot</div>
          <p className="mt-1 max-w-3xl text-xs leading-5 text-white/40">
            Daily monitoring can proactively create Content Director candidate batches for uncovered calendar gaps. It cannot accept canonical content, schedule, publish or send engagement replies.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button disabled={isPending} onClick={() => trigger("daily", settings.autoDraftCalendarGaps)} className="rounded-xl bg-[#C6FF32] px-3 py-2 text-xs font-black text-black disabled:opacity-40"><Play className="mr-1.5 inline h-3.5 w-3.5" /> Run daily scan</button>
          <button disabled={isPending} onClick={() => trigger("weekly", false)} className="rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-white/70 disabled:opacity-40"><RefreshCw className="mr-1.5 inline h-3.5 w-3.5" /> Weekly review</button>
        </div>
      </div>

      {message ? <div className="rounded-xl border border-[#C6FF32]/20 bg-[#C6FF32]/5 px-4 py-3 text-sm text-[#C6FF32]">{message}</div> : null}
      {error ? <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">{error}</div> : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Open actions" value={initialOverview.summary.open} />
        <StatCard label="Urgent" value={openByPriority.urgent} />
        <StatCard label="High priority" value={openByPriority.high} />
        <StatCard label="Draft batches ready" value={initialOverview.summary.contentDraftsReady} />
        <StatCard label="Planning horizon" value={`${Math.max(7, settings.planningHorizonDays)} days`} note="Hard minimum: 7" />
      </div>

      <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <div className="flex items-center gap-2"><Gauge className="h-4 w-4 text-[#C6FF32]" /><h2 className="font-black text-white">Autopilot settings</h2></div>
          <div className="mt-5 space-y-4 text-sm">
            {[
              ["enabled", "Enable Growth Autopilot", "Master switch for scheduled daily/weekly runs."],
              ["dailyEnabled", "Daily scan", "Runs each morning and watches calendar/production/publishing/engagement/growth."],
              ["weeklyEnabled", "Weekly strategy review", "Synthesizes evidence into an advisory strategy review."],
              ["autoDraftCalendarGaps", "Draft calendar gaps", "May create candidate batches only. Never accepts or schedules them."],
            ].map(([key, label, note]) => (
              <label key={key} className="flex items-start justify-between gap-4 rounded-xl border border-white/5 bg-black/20 p-3">
                <span><span className="block font-bold text-white">{label}</span><span className="mt-1 block text-xs leading-5 text-white/35">{note}</span></span>
                <input type="checkbox" checked={Boolean(settings[key as keyof MediaAutopilotSettings])} onChange={(event) => setSettings({ ...settings, [key]: event.target.checked })} className="mt-1 h-4 w-4 accent-[#C6FF32]" />
              </label>
            ))}
            <div className="grid gap-3 sm:grid-cols-3">
              <NumberField label="Horizon days" min={7} max={30} value={settings.planningHorizonDays} onChange={(value) => setSettings({ ...settings, planningHorizonDays: value })} />
              <NumberField label="Draft runs/day" min={0} max={10} value={settings.maxDailyDraftRuns} onChange={(value) => setSettings({ ...settings, maxDailyDraftRuns: value })} />
              <NumberField label="Candidates/run" min={2} max={8} value={settings.candidateCount} onChange={(value) => setSettings({ ...settings, candidateCount: value })} />
            </div>
            <button disabled={isPending} onClick={saveSettings} className="w-full rounded-xl border border-[#C6FF32]/25 bg-[#C6FF32]/5 px-4 py-2.5 text-sm font-black text-[#C6FF32] disabled:opacity-40">Save settings</button>
          </div>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <div className="flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#C6FF32]" /><h2 className="font-black text-white">Autonomy boundary</h2></div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            <Policy allowed label="Generate draft candidates" note="Only through the same 6C anti-repetition pipeline." />
            <Policy allowed={false} label="Accept canonical content" note="Requires your existing Content Director approval." />
            <Policy allowed={false} label="Schedule content" note="Uses the 6E confirmation path." />
            <Policy allowed={false} label="Publish publicly" note="Never autonomous." />
            <Policy allowed={false} label="Send engagement replies" note="6G confirmation remains mandatory." />
            <Policy allowed label="Use growth evidence" note="Evidence only; 6B anti-repeat stays authoritative." />
          </div>
        </section>
      </div>

      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div><h2 className="font-black text-white">What needs attention</h2><p className="mt-1 text-xs text-white/35">Ordered by urgency across the entire Media operating system.</p></div>
          <div className="text-xs text-white/30">Last daily: {formatDate(initialOverview.latestDaily?.completedAt ?? initialOverview.latestDaily?.createdAt)}</div>
        </div>
        <div className="mt-4 space-y-3">
          {initialOverview.openRecommendations.length ? initialOverview.openRecommendations.map((item) => (
            <div key={`${item.runId}-${item.key}`} className={`rounded-xl border p-4 ${priorityClasses[item.priority]}`}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2"><span className="rounded-full bg-black/20 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em]">{item.priority}</span>{item.platform ? <span className="text-xs text-white/35">{platformLabels[item.platform] ?? item.platform}</span> : null}<span className="text-xs text-white/25">{item.kind.replaceAll("_", " ")}</span></div>
                  <h3 className="mt-3 font-black text-white">{item.title}</h3>
                  <p className="mt-1 text-sm leading-6 text-white/55">{item.summary}</p>
                  {item.evidence?.length ? <ul className="mt-3 space-y-1 text-xs text-white/35">{item.evidence.slice(0, 4).map((evidence) => <li key={evidence}>• {evidence}</li>)}</ul> : null}
                  {item.recommendedAction ? <p className="mt-3 text-xs font-semibold text-[#C6FF32]/80">{item.recommendedAction}</p> : null}
                </div>
                <div className="flex shrink-0 flex-wrap gap-2">
                  <Link href={recommendationHref(item)} className="rounded-lg bg-white/10 px-3 py-2 text-xs font-bold text-white">{item.actionLabel || "Open"}</Link>
                  <button disabled={isPending} onClick={() => updateRecommendation(item, "completed")} className="rounded-lg border border-[#C6FF32]/20 px-3 py-2 text-xs font-bold text-[#C6FF32] disabled:opacity-40"><CheckCircle2 className="mr-1 inline h-3 w-3" />Done</button>
                  <button disabled={isPending} onClick={() => updateRecommendation(item, "dismissed")} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-bold text-white/45 disabled:opacity-40"><CircleOff className="mr-1 inline h-3 w-3" />Dismiss</button>
                </div>
              </div>
            </div>
          )) : <div className="rounded-xl border border-[#C6FF32]/15 bg-[#C6FF32]/[0.03] p-5 text-sm text-white/55"><CheckCircle2 className="mr-2 inline h-4 w-4 text-[#C6FF32]" />No open Growth Autopilot recommendations.</div>}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <div className="flex items-center gap-2"><Target className="h-4 w-4 text-[#C6FF32]" /><h2 className="font-black text-white">Latest weekly strategy</h2></div>
          {weekly ? <div className="mt-4 space-y-5"><p className="text-sm leading-6 text-white/55">{weekly.summary}</p><StrategyList title="Focus this week" values={weekly.focusThisWeek} /><StrategyList title="Avoid this week" values={weekly.avoidThisWeek} /><StrategyList title="Experiments to consider" values={weekly.experimentsToConsider} />{weekly.platformPriorities.length ? <div><div className="text-xs font-black uppercase tracking-[0.14em] text-white/35">Platform priorities</div><div className="mt-2 space-y-2">{weekly.platformPriorities.map((item) => <div key={`${item.platform}-${item.priority}`} className="rounded-xl border border-white/5 bg-black/20 p-3"><div className="text-sm font-bold text-white">{platformLabels[item.platform]} · {item.priority.replaceAll("_", " ")}</div><div className="mt-1 text-xs text-white/40">{item.reason}</div></div>)}</div></div> : null}</div> : <div className="mt-4 text-sm text-white/35">Run the weekly review to create the first evidence-based strategy synthesis.</div>}
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <div className="flex items-center gap-2"><Bot className="h-4 w-4 text-[#C6FF32]" /><h2 className="font-black text-white">Recent Autopilot runs</h2></div>
          <div className="mt-4 space-y-2">
            {initialRuns.slice(0, 12).map((runItem) => <div key={runItem._id} className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-black/20 p-3"><div><div className="text-sm font-bold text-white">{runItem.type} · {runItem.status}</div><div className="mt-1 text-xs text-white/30">{formatDate(runItem.completedAt ?? runItem.createdAt)} · {runItem.recommendations?.length ?? 0} recommendations · {runItem.generatedDraftRunIds?.length ?? 0} draft runs</div>{runItem.runErrors?.length ? <div className="mt-1 text-xs text-red-300">{runItem.runErrors[0]}</div> : null}</div>{runItem.status === "failed" || runItem.status === "partial" ? <AlertTriangle className="h-4 w-4 text-amber-300" /> : runItem.status === "completed" ? <CheckCircle2 className="h-4 w-4 text-[#C6FF32]" /> : <Sparkles className="h-4 w-4 text-white/40" />}</div>)}
            {!initialRuns.length ? <p className="text-sm text-white/35">No Autopilot runs yet.</p> : null}
          </div>
        </section>
      </div>
    </div>
  );
}

function NumberField({ label, min, max, value, onChange }: { label: string; min: number; max: number; value: number; onChange: (value: number) => void }) {
  return <label className="text-xs font-bold text-white/45">{label}<input type="number" min={min} max={max} value={value} onChange={(event) => onChange(Number(event.target.value))} className="mt-2 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none" /></label>;
}

function Policy({ allowed, label, note }: { allowed: boolean; label: string; note: string }) {
  return <div className="rounded-xl border border-white/5 bg-black/20 p-3"><div className="flex items-center gap-2 text-sm font-bold text-white">{allowed ? <CheckCircle2 className="h-4 w-4 text-[#C6FF32]" /> : <CircleOff className="h-4 w-4 text-white/30" />}{label}</div><p className="mt-1 text-xs leading-5 text-white/35">{note}</p></div>;
}

function StrategyList({ title, values }: { title: string; values: string[] }) {
  return <div><div className="text-xs font-black uppercase tracking-[0.14em] text-white/35">{title}</div>{values.length ? <ul className="mt-2 space-y-2 text-sm text-white/55">{values.map((value) => <li key={value} className="rounded-xl border border-white/5 bg-black/20 p-3">{value}</li>)}</ul> : <p className="mt-2 text-xs text-white/25">No strong evidence yet.</p>}</div>;
}
