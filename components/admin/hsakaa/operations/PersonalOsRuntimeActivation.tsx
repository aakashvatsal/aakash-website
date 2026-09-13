"use client";

import { useEffect, useState } from "react";
import {
  Activity,
  Bot,
  CheckCircle2,
  CircleDot,
  Clock3,
  HeartPulse,
  Loader2,
  Play,
  RefreshCw,
  ShieldCheck,
  SkipForward,
  Sparkles,
  TriangleAlert,
  XCircle,
} from "lucide-react";

import {
  getPersonalOsRuntimeRuns,
  getPersonalOsRuntimeStatus,
  runPersonalOs,
} from "@/lib/api/personal-os-runtime";
import type {
  PersonalOsRuntimeRun,
  PersonalOsRuntimeStage,
  PersonalOsRuntimeStatus,
  RunPersonalOsInput,
} from "@/types/personal-os-runtime";

const defaultOptions: RunPersonalOsInput = {
  syncWhoop: true,
  allowHealthAdaptation: false,
  allowAi: false,
  maxEmbeddings: 100,
};

export function PersonalOsRuntimeActivation() {
  const [status, setStatus] = useState<PersonalOsRuntimeStatus | null>(null);
  const [runs, setRuns] = useState<PersonalOsRuntimeRun[]>([]);
  const [options, setOptions] = useState<RunPersonalOsInput>(defaultOptions);
  const [loading, setLoading] = useState(true);
  const [running, setRunning] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [nextStatus, history] = await Promise.all([
        getPersonalOsRuntimeStatus(),
        getPersonalOsRuntimeRuns(8),
      ]);
      setStatus(nextStatus);
      setRuns(history.runs);
      setOptions((current) => ({ ...nextStatus.defaults, ...current }));
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not load Personal OS runtime status.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function runNow() {
    setRunning(true);
    setError(null);
    try {
      const result = await runPersonalOs(options);
      if (!result.started && result.reason) {
        setError(`Run skipped: ${result.reason.replaceAll("_", " ")}.`);
      }
      await load();
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Personal OS runtime run failed.",
      );
    } finally {
      setRunning(false);
    }
  }

  const latest = status?.latestRun ?? runs[0] ?? null;

  return (
    <section className="rounded-[28px] border border-[#C6FF32]/20 bg-[#C6FF32]/[0.035] p-6 md:p-8">
      <div className="flex flex-col justify-between gap-6 xl:flex-row xl:items-start">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-[#C6FF32]">
            <Activity className="h-4 w-4" />
            Step 1 · Runtime Activation V1
          </div>
          <h2 className="mt-3 text-2xl font-black tracking-[-0.04em] text-white md:text-3xl">
            Run the Personal OS manually before scheduling it.
          </h2>
          <p className="mt-3 text-sm leading-7 text-white/45">
            One controlled run pulls connected Health data, checks current truth,
            refreshes deterministic Health intelligence, reconciles tasks and
            reminders, syncs the Knowledge Graph, inspects Search/Context, and
            only spends AI when you explicitly allow it and meaningful evidence
            changed.
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
            onClick={() => void runNow()}
            disabled={loading || running || status?.running}
            className="inline-flex h-11 items-center gap-2 rounded-2xl bg-[#C6FF32] px-5 text-xs font-black uppercase tracking-[0.12em] text-black disabled:opacity-50"
          >
            {running || status?.running ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Play className="h-4 w-4" />
            )}
            {running || status?.running ? "Running…" : "Run Personal OS"}
          </button>
        </div>
      </div>

      {error ? (
        <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <RuntimeMetric
          icon={ShieldCheck}
          label="Mode"
          value={status?.automationEnabled ? "Scheduled" : "Manual only"}
          detail={
            status?.automationEnabled
              ? "Automatic cron schedules are enabled."
              : `${status?.disabledCronJobs.length ?? 0} cron job(s) gated off.`
          }
        />
        <RuntimeMetric
          icon={Clock3}
          label="Last full run"
          value={latest ? formatWhen(latest.startedAt) : "Never"}
          detail={latest ? formatRunStatus(latest.status) : "Run Step 1 once."}
        />
        <RuntimeMetric
          icon={CircleDot}
          label="Recorded changes"
          value={latest?.summary.meaningfulChanges ?? 0}
          detail="Used to decide whether Proactive AI is worth running."
        />
        <RuntimeMetric
          icon={Bot}
          label="AI default"
          value={options.allowAi ? "Allowed" : "Off"}
          detail="Semantic generation and Proactive AI are opt-in in Step 1."
        />
      </div>

      <div className="mt-6 grid gap-4 xl:grid-cols-[0.82fr_1.18fr]">
        <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
          <div className="text-sm font-black text-white/85">Run controls</div>
          <p className="mt-1 text-xs leading-5 text-white/35">
            Start with the safe defaults. Enable adaptation or AI only after the
            basic run is clean.
          </p>
          <div className="mt-5 space-y-3">
            <RuntimeToggle
              icon={HeartPulse}
              label="Sync WHOOP"
              detail="Pull the latest three days when WHOOP is connected."
              checked={options.syncWhoop}
              onChange={(checked) =>
                setOptions((current) => ({ ...current, syncWhoop: checked }))
              }
            />
            <RuntimeToggle
              icon={Sparkles}
              label="Allow safe Health adaptation"
              detail="Lets deterministic Health proactive logic adjust only what its autonomy policy permits."
              checked={options.allowHealthAdaptation}
              onChange={(checked) =>
                setOptions((current) => ({
                  ...current,
                  allowHealthAdaptation: checked,
                }))
              }
            />
            <RuntimeToggle
              icon={Bot}
              label="Allow AI"
              detail="Allows semantic indexing and Proactive HSAKAA only when needed."
              checked={options.allowAi}
              onChange={(checked) =>
                setOptions((current) => ({ ...current, allowAi: checked }))
              }
            />
          </div>

          <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.025] p-4 text-xs leading-5 text-white/35">
            Automatic scheduling stays off until we intentionally move to Step
            7. Do not set <code>PERSONAL_OS_AUTOMATION_ENABLED=true</code> yet.
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-sm font-black text-white/85">
                Latest run trace
              </div>
              <p className="mt-1 text-xs text-white/35">
                Every stage is recorded so a bad activation never becomes a
                mystery.
              </p>
            </div>
            {latest ? <RunBadge status={latest.status} /> : null}
          </div>

          <div className="mt-5 space-y-3">
            {latest?.stages.length ? (
              latest.stages.map((stage) => (
                <StageRow key={stage.id} stage={stage} />
              ))
            ) : (
              <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-white/30">
                No runtime activation run has been recorded yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {runs.length ? (
        <div className="mt-6 rounded-2xl border border-white/10 bg-black/20 p-5">
          <div className="text-sm font-black text-white/85">Recent runs</div>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-xs">
              <thead className="text-white/25">
                <tr>
                  <th className="pb-3 pr-4 font-black uppercase tracking-[0.12em]">
                    Started
                  </th>
                  <th className="pb-3 pr-4 font-black uppercase tracking-[0.12em]">
                    Status
                  </th>
                  <th className="pb-3 pr-4 font-black uppercase tracking-[0.12em]">
                    Completed
                  </th>
                  <th className="pb-3 pr-4 font-black uppercase tracking-[0.12em]">
                    Warnings
                  </th>
                  <th className="pb-3 font-black uppercase tracking-[0.12em]">
                    Changes
                  </th>
                </tr>
              </thead>
              <tbody>
                {runs.map((run) => (
                  <tr key={run.runId} className="border-t border-white/5">
                    <td className="py-3 pr-4 text-white/55">
                      {new Date(run.startedAt).toLocaleString()}
                    </td>
                    <td className="py-3 pr-4">
                      <RunBadge status={run.status} />
                    </td>
                    <td className="py-3 pr-4 text-white/55">
                      {run.summary.completed ?? 0}
                    </td>
                    <td className="py-3 pr-4 text-white/55">
                      {run.summary.warnings ?? 0}
                    </td>
                    <td className="py-3 text-white/55">
                      {run.summary.meaningfulChanges ?? 0}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function RuntimeMetric({
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
        <Icon className="h-4 w-4 text-[#C6FF32]" />
        {label}
      </div>
      <div className="mt-3 text-xl font-black text-white/85">{value}</div>
      <div className="mt-1 text-xs leading-5 text-white/30">{detail}</div>
    </div>
  );
}

function RuntimeToggle({
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
        <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#C6FF32]" />
        <div>
          <div className="text-sm font-black text-white/75">{label}</div>
          <div className="mt-1 text-xs leading-5 text-white/30">{detail}</div>
        </div>
      </div>
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="mt-1 h-4 w-4 accent-[#C6FF32]"
      />
    </label>
  );
}

function StageRow({ stage }: { stage: PersonalOsRuntimeStage }) {
  const Icon =
    stage.status === "completed"
      ? CheckCircle2
      : stage.status === "skipped"
        ? SkipForward
        : stage.status === "warning"
          ? TriangleAlert
          : XCircle;
  const iconClass =
    stage.status === "completed"
      ? "text-[#C6FF32]"
      : stage.status === "warning"
        ? "text-amber-300"
        : stage.status === "failed"
          ? "text-red-300"
          : "text-white/30";

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
      <div className="flex items-start gap-3">
        <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${iconClass}`} />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="text-sm font-black text-white/75">{stage.label}</div>
            <div className="text-[11px] font-bold text-white/25">
              {stage.durationMs} ms
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

function RunBadge({ status }: { status: PersonalOsRuntimeRun["status"] }) {
  const label = formatRunStatus(status);
  const className =
    status === "completed"
      ? "border-[#C6FF32]/20 bg-[#C6FF32]/10 text-[#C6FF32]"
      : status === "running"
        ? "border-blue-400/20 bg-blue-400/10 text-blue-200"
        : status === "partial"
          ? "border-amber-400/20 bg-amber-400/10 text-amber-200"
          : "border-red-400/20 bg-red-400/10 text-red-200";
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${className}`}
    >
      {label}
    </span>
  );
}

function formatRunStatus(status: PersonalOsRuntimeRun["status"]) {
  return status === "partial" ? "Partial" : status[0].toUpperCase() + status.slice(1);
}

function formatWhen(value: string) {
  const date = new Date(value);
  const elapsed = Date.now() - date.getTime();
  if (!Number.isFinite(elapsed) || elapsed < 0) return date.toLocaleString();
  const minutes = Math.floor(elapsed / 60_000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
}
