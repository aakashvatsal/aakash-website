"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  CircleDashed,
  Clock3,
  GitBranch,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react";

type LoopStatus = "healthy" | "active" | "warning" | "broken" | "idle";
type StageStatus = "complete" | "waiting" | "missing" | "not_applicable";

type ClosedLoops = {
  status: "healthy" | "active" | "warning" | "broken";
  score: number;
  summary: {
    healthy: number;
    active: number;
    warnings: number;
    broken: number;
    idle: number;
  };
  loops: Array<{
    id: string;
    label: string;
    route: string;
    status: LoopStatus;
    summary: string;
    stages: Array<{
      id: string;
      label: string;
      status: StageStatus;
      detail: string;
      occurredAt?: string | null;
    }>;
    evidence: Record<string, unknown>;
    startedAt?: string | null;
    updatedAt?: string | null;
  }>;
  generatedAt: string;
};

type DashboardResponse = {
  closedLoops?: ClosedLoops;
};

export function PersonalOsClosedLoops() {
  const [loops, setLoops] = useState<ClosedLoops | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(
        "/api/admin/backend/hsakaa/private/operations/dashboard?days=30",
        { cache: "no-store" },
      );
      const payload = (await response.json().catch(() => null)) as
        | DashboardResponse
        | { message?: string | string[] }
        | null;
      if (!response.ok) {
        const raw =
          payload && typeof payload === "object" && "message" in payload
            ? payload.message
            : null;
        throw new Error(
          Array.isArray(raw)
            ? raw.join(", ")
            : raw
              ? String(raw)
              : `Closed-loop request failed: ${response.status}`,
        );
      }
      const next = payload && "closedLoops" in payload ? payload.closedLoops : null;
      if (!next) {
        throw new Error(
          "Closed-loop telemetry is not available yet. Apply the matching backend patch and restart the backend.",
        );
      }
      setLoops(next);
    } catch (cause) {
      setError(
        cause instanceof Error
          ? cause.message
          : "Could not load Personal OS closed-loop telemetry.",
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  return (
    <section className="rounded-[28px] border border-white/10 bg-white/[0.025] p-6 md:p-8">
      <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-white/35">
            <GitBranch className="h-4 w-4 text-[#C6FF32]" />
            Autonomous feedback loops
          </div>
          <div className="mt-4 flex items-end gap-4">
            <span className="text-5xl font-black tracking-[-0.07em] text-white">
              {loops?.score ?? "—"}
            </span>
            <span className="pb-1 text-sm font-bold text-white/35">/ 100</span>
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/45">
            Verifies that Personal OS evidence does not stop at detection. A healthy loop carries evidence through an intervention or review, operational tasks, execution/follow-up, Knowledge Graph memory and future planning or proactive action.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 text-xs font-black uppercase tracking-[0.13em] text-white/70 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          Refresh loops
        </button>
      </div>

      {error ? (
        <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      {loops ? (
        <>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <SummaryCard label="Healthy" value={loops.summary.healthy} status="healthy" />
            <SummaryCard label="Active" value={loops.summary.active} status="active" />
            <SummaryCard label="Warnings" value={loops.summary.warnings} status="warning" />
            <SummaryCard label="Broken" value={loops.summary.broken} status="broken" />
            <SummaryCard label="Idle" value={loops.summary.idle} status="idle" />
          </div>

          <div className="mt-6 grid gap-4 xl:grid-cols-2">
            {loops.loops.map((loop) => (
              <div key={loop.id} className="rounded-2xl border border-white/10 bg-black/20 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <Link
                      href={loop.route}
                      className="text-base font-black text-white/90 transition hover:text-[#C6FF32]"
                    >
                      {loop.label}
                    </Link>
                    <p className="mt-2 text-xs leading-5 text-white/35">{loop.summary}</p>
                  </div>
                  <LoopStatusIcon status={loop.status} />
                </div>

                {loop.stages.length ? (
                  <div className="mt-5 space-y-2">
                    {loop.stages.map((stage, index) => (
                      <div
                        key={stage.id}
                        className="grid grid-cols-[24px_1fr] gap-3 rounded-xl border border-white/[0.06] bg-white/[0.018] p-3"
                      >
                        <div className="flex flex-col items-center">
                          <StageStatusIcon status={stage.status} />
                          {index < loop.stages.length - 1 ? (
                            <div className="mt-1 h-full min-h-3 w-px bg-white/10" />
                          ) : null}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center justify-between gap-2">
                            <span className="text-xs font-black text-white/75">{stage.label}</span>
                            <span className="text-[10px] font-black uppercase tracking-[0.12em] text-white/25">
                              {stage.status.replace("_", " ")}
                            </span>
                          </div>
                          <p className="mt-1 text-[11px] leading-5 text-white/30">{stage.detail}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="mt-5 rounded-xl border border-dashed border-white/10 px-4 py-5 text-xs leading-5 text-white/30">
                    This loop is wired but dormant because no qualifying live evidence exists yet.
                  </div>
                )}
              </div>
            ))}
          </div>

          <p className="mt-5 text-xs text-white/25">
            Snapshot generated {new Date(loops.generatedAt).toLocaleString()}. “Run RC smoke” below includes these loop checks in the release gate.
          </p>
        </>
      ) : loading ? (
        <div className="mt-6 flex items-center gap-3 text-sm font-bold text-white/40">
          <Loader2 className="h-4 w-4 animate-spin text-[#C6FF32]" />
          Tracing Personal OS feedback loops…
        </div>
      ) : null}
    </section>
  );
}

function SummaryCard({
  label,
  value,
  status,
}: {
  label: string;
  value: number;
  status: LoopStatus;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[11px] font-black uppercase tracking-[0.13em] text-white/30">
          {label}
        </div>
        <LoopStatusIcon status={status} />
      </div>
      <div className="mt-3 text-2xl font-black tracking-[-0.04em] text-white/85">{value}</div>
    </div>
  );
}

function LoopStatusIcon({ status }: { status: LoopStatus }) {
  if (status === "healthy") return <CheckCircle2 className="h-5 w-5 text-[#C6FF32]" />;
  if (status === "active") return <Clock3 className="h-5 w-5 text-sky-300" />;
  if (status === "warning") return <AlertTriangle className="h-5 w-5 text-amber-300" />;
  if (status === "broken") return <XCircle className="h-5 w-5 text-red-300" />;
  return <CircleDashed className="h-5 w-5 text-white/25" />;
}

function StageStatusIcon({ status }: { status: StageStatus }) {
  if (status === "complete") return <CheckCircle2 className="h-4 w-4 text-[#C6FF32]" />;
  if (status === "waiting") return <Clock3 className="h-4 w-4 text-sky-300" />;
  if (status === "missing") return <XCircle className="h-4 w-4 text-red-300" />;
  return <CircleDashed className="h-4 w-4 text-white/25" />;
}
