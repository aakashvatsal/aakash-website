"use client";

import { useEffect, useState } from "react";
import {
  AlarmClock,
  Bot,
  CheckCircle2,
  CircleDot,
  HeartPulse,
  Loader2,
  Play,
  RefreshCw,
  Sparkles,
  Sunrise,
  TriangleAlert,
  XCircle,
} from "lucide-react";

import {
  getPersonalOsMorningRuns,
  getPersonalOsMorningStatus,
  runPersonalOsMorning,
} from "@/lib/api/personal-os-runtime";
import type {
  PersonalOsMorningRun,
  PersonalOsMorningStatus,
  PersonalOsRuntimeStage,
  RunPersonalOsMorningInput,
} from "@/types/personal-os-runtime";

const defaults: RunPersonalOsMorningInput = {
  syncWhoop: true,
  allowHealthAdaptation: true,
  allowAi: true,
  forceBrief: false,
  maxEmbeddings: 100,
};

export function PersonalOsMorningLoop() {
  const [status, setStatus] = useState<PersonalOsMorningStatus | null>(null);
  const [runs, setRuns] = useState<PersonalOsMorningRun[]>([]);
  const [options, setOptions] = useState<RunPersonalOsMorningInput>(defaults);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [nextStatus, history] = await Promise.all([
        getPersonalOsMorningStatus(),
        getPersonalOsMorningRuns(7),
      ]);
      setStatus(nextStatus);
      setRuns(history.runs);
      setOptions((current) => ({ ...nextStatus.defaults, ...current }));
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not load Morning Operating Loop status.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function runMorning() {
    setRunning(true);
    setError(null);
    try {
      const result = await runPersonalOsMorning(options);
      if (!result.started && result.reason) {
        setError(`Morning run skipped: ${result.reason.replaceAll("_", " ")}.`);
      }
      await load();
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Morning Operating Loop failed.",
      );
    } finally {
      setRunning(false);
    }
  }

  const latest = status?.latestRun ?? runs[0] ?? null;
  const morningPackage = latest?.snapshot.package;

  return (
    <section className="rounded-[28px] border border-sky-300/15 bg-sky-300/[0.035] p-6 md:p-8">
      <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-start">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-sky-200">
            <Sunrise className="h-4 w-4" />
            Step 2 · Morning Operating Loop V1
          </div>
          <h2 className="mt-3 text-2xl font-black tracking-[-0.04em] text-white md:text-3xl">
            Prepare the day from current Personal OS evidence.
          </h2>
          <p className="mt-3 text-sm leading-7 text-white/45">
            This manual morning sequence runs the proven Runtime Activation,
            assembles today&apos;s Health plan, tasks, reminders and attention,
            then generates or reuses the existing HSAKAA Daily Brief. Scheduling
            is still intentionally off.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading || running}
            className="inline-flex h-11 items-center gap-2 rounded-2xl border border-white/10 px-4 text-xs font-black uppercase tracking-[0.12em] text-white/65 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
          <button
            type="button"
            onClick={() => void runMorning()}
            disabled={loading || running || status?.running}
            className="inline-flex h-11 items-center gap-2 rounded-2xl bg-sky-200 px-5 text-xs font-black uppercase tracking-[0.12em] text-black disabled:opacity-50"
          >
            {running || status?.running ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {running || status?.running ? "Preparing…" : "Run Morning Loop"}
          </button>
        </div>
      </div>

      {error ? (
        <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <MorningMetric
          icon={HeartPulse}
          label="Health plan"
          value={morningPackage?.planReady ? "Ready" : "Not ready"}
          detail={`${morningPackage?.healthTasks ?? 0} Health task(s) today.`}
        />
        <MorningMetric
          icon={AlarmClock}
          label="Due reminders"
          value={morningPackage?.dueReminders ?? 0}
          detail="Due after reminder reconciliation."
        />
        <MorningMetric
          icon={CircleDot}
          label="Attention"
          value={morningPackage?.healthAttention ?? 0}
          detail={`${morningPackage?.proactiveHighPriority ?? 0} high-priority proactive item(s).`}
        />
        <MorningMetric
          icon={Bot}
          label="HSAKAA brief"
          value={morningPackage?.headline ? "Ready" : "Pending"}
          detail={morningPackage?.headline ?? "Run the morning loop once."}
        />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[0.76fr_1.24fr]">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
          <div className="text-sm font-black text-white/85">Morning controls</div>
          <p className="mt-1 text-xs leading-5 text-white/35">
            Defaults reflect the Step 1 validation you already completed.
          </p>
          <div className="mt-5 space-y-3">
            <MorningToggle
              icon={HeartPulse}
              label="Sync WHOOP"
              detail="Refresh connected Health evidence before preparing today."
              checked={options.syncWhoop}
              onChange={(checked) =>
                setOptions((current) => ({ ...current, syncWhoop: checked }))
              }
            />
            <MorningToggle
              icon={Sparkles}
              label="Safe Health adaptation"
              detail="Apply only changes permitted by Health autonomy policy."
              checked={options.allowHealthAdaptation}
              onChange={(checked) =>
                setOptions((current) => ({
                  ...current,
                  allowHealthAdaptation: checked,
                }))
              }
            />
            <MorningToggle
              icon={Bot}
              label="Allow AI morning brief"
              detail="Generate the Daily Brief when missing or stale after real changes."
              checked={options.allowAi}
              onChange={(checked) =>
                setOptions((current) => ({ ...current, allowAi: checked }))
              }
            />
            <MorningToggle
              icon={RefreshCw}
              label="Force brief refresh"
              detail="Off by default so repeated morning runs do not waste AI calls."
              checked={options.forceBrief}
              onChange={(checked) =>
                setOptions((current) => ({ ...current, forceBrief: checked }))
              }
            />
          </div>
          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-xs leading-5 text-white/35">
            Keep <code>PERSONAL_OS_AUTOMATION_ENABLED=false</code>. Step 2 is
            still a manual proof before any morning schedule is enabled.
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-black text-white/85">
                Latest morning trace
              </div>
              <p className="mt-1 text-xs text-white/35">
                Runtime refresh → morning state → HSAKAA brief → final package.
              </p>
            </div>
            {latest ? <MorningRunBadge status={latest.status} /> : null}
          </div>
          <div className="mt-5 space-y-3">
            {latest?.stages.length ? (
              latest.stages.map((stage) => (
                <MorningStageRow key={stage.id} stage={stage} />
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-white/30">
                No Morning Operating Loop run has been recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {morningPackage?.headline ? (
        <div className="mt-6 rounded-2xl border border-sky-200/15 bg-sky-200/[0.04] p-5">
          <div className="text-[11px] font-black uppercase tracking-[0.14em] text-sky-200/70">
            Today&apos;s HSAKAA headline
          </div>
          <div className="mt-2 text-lg font-black text-white/90">
            {morningPackage.headline}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function MorningMetric({
  icon: Icon,
  label,
  value,
  detail,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: string | number;
  detail: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.12em] text-white/30">
        <Icon className="h-4 w-4 text-sky-200" />
        {label}
      </div>
      <div className="mt-3 text-xl font-black text-white/85">{value}</div>
      <div className="mt-1 text-xs leading-5 text-white/30">{detail}</div>
    </div>
  );
}

function MorningToggle({
  icon: Icon,
  label,
  detail,
  checked,
  onChange,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  detail: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-start justify-between gap-4 rounded-2xl border border-white/10 p-4">
      <div className="flex gap-3">
        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-sky-200" />
        <div>
          <div className="text-sm font-black text-white/75">{label}</div>
          <div className="mt-1 text-xs leading-5 text-white/30">{detail}</div>
        </div>
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 accent-sky-200"
      />
    </label>
  );
}

function MorningStageRow({ stage }: { stage: PersonalOsRuntimeStage }) {
  const Icon =
    stage.status === "completed"
      ? CheckCircle2
      : stage.status === "warning"
        ? TriangleAlert
        : stage.status === "failed"
          ? XCircle
          : CircleDot;
  return (
    <div className="rounded-2xl border border-white/10 p-4">
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-sky-200" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm font-black text-white/80">{stage.label}</div>
            <div className="text-[11px] font-black uppercase tracking-[0.12em] text-white/30">
              {stage.status} · {stage.durationMs} ms
            </div>
          </div>
          <div className="mt-1 text-xs leading-5 text-white/35">
            {stage.message}
          </div>
        </div>
      </div>
    </div>
  );
}

function MorningRunBadge({ status }: { status: PersonalOsMorningRun["status"] }) {
  const tone =
    status === "completed"
      ? "border-emerald-400/20 bg-emerald-400/10 text-emerald-200"
      : status === "partial"
        ? "border-amber-400/20 bg-amber-400/10 text-amber-200"
        : status === "failed"
          ? "border-red-400/20 bg-red-400/10 text-red-200"
          : "border-sky-300/20 bg-sky-300/10 text-sky-200";
  return (
    <span
      className={`rounded-full border px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${tone}`}
    >
      {status}
    </span>
  );
}
