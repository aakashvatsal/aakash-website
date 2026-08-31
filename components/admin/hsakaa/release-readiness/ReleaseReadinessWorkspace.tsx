"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Database,
  Loader2,
  Network,
  RefreshCw,
  Search,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import {
  getReleaseHardeningPolicy,
  getReleaseHardeningStatus,
  runReleaseHardeningChecks,
} from "@/lib/api/release-hardening";
import type {
  ReleaseCheckLevel,
  ReleaseHardeningPolicy,
  ReleaseHardeningStatus,
} from "@/types/release-hardening";

export function ReleaseReadinessWorkspace() {
  const [policy, setPolicy] = useState<ReleaseHardeningPolicy | null>(null);
  const [status, setStatus] = useState<ReleaseHardeningStatus | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [nextPolicy, nextStatus] = await Promise.all([
        getReleaseHardeningPolicy(),
        getReleaseHardeningStatus(),
      ]);
      setPolicy(nextPolicy);
      setStatus(nextStatus);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load release readiness.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function runChecks() {
    setChecking(true);
    setError(null);
    try {
      setStatus(await runReleaseHardeningChecks());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Release checks failed.");
    } finally {
      setChecking(false);
    }
  }

  if (loading && !status) {
    return (
      <div className="grid min-h-[300px] place-items-center rounded-[28px] border border-white/10 bg-white/[0.025]">
        <div className="flex items-center gap-3 text-sm font-bold text-white/50">
          <Loader2 className="h-5 w-5 animate-spin text-[#C6FF32]" />
          Inspecting runtime readiness…
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.025] p-6 md:p-8">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-start">
            <div>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-white/35">
                <ShieldCheck className="h-4 w-4 text-[#C6FF32]" />
                Release gate
              </div>
              <div className="mt-4 flex items-end gap-4">
                <span className="text-6xl font-black tracking-[-0.07em] text-white">
                  {status?.score ?? 0}
                </span>
                <span className="pb-2 text-sm font-bold text-white/35">/ 100</span>
              </div>
              <p className="mt-3 max-w-2xl text-sm leading-7 text-white/45">
                {status?.ready
                  ? "No release blockers are currently detected. Review warnings before shipping."
                  : "At least one release blocker is present. Resolve failures and rerun this gate before shipping."}
              </p>
            </div>

            <button
              type="button"
              onClick={() => void runChecks()}
              disabled={checking}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#C6FF32] px-5 text-xs font-black uppercase tracking-[0.14em] text-black disabled:opacity-50"
            >
              {checking ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              {checking ? "Checking…" : "Run checks"}
            </button>
          </div>

          <div className="mt-8 grid gap-3 sm:grid-cols-3">
            <SummaryCard label="Passed" value={status?.summary.passed ?? 0} level="pass" />
            <SummaryCard label="Warnings" value={status?.summary.warnings ?? 0} level="warning" />
            <SummaryCard label="Blockers" value={status?.summary.failures ?? 0} level="fail" />
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.025] p-6">
          <div className="text-xs font-black uppercase tracking-[0.16em] text-white/35">
            Runtime snapshot
          </div>
          <div className="mt-5 space-y-4">
            <Metric icon={Database} label="Graph nodes" value={status?.graph.activeNodes ?? 0} />
            <Metric icon={Network} label="Graph edges" value={status?.graph.activeEdges ?? 0} />
            <Metric
              icon={Search}
              label="Semantic coverage"
              value={`${Math.round((status?.search.semanticCoverage ?? 0) * 100)}%`}
            />
            <Metric
              icon={Clock3}
              label="Active runtime leases"
              value={status?.runtime.activeLeases.length ?? 0}
            />
          </div>
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-white/[0.025] p-6 md:p-8">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black tracking-[-0.03em]">Integration checks</h2>
            <p className="mt-2 text-sm text-white/35">
              Database/index checks are runtime-backed. Policy checks verify privacy and autonomy guardrails without invoking AI.
            </p>
          </div>
          {status?.generatedAt ? (
            <span className="hidden text-xs text-white/25 md:block">
              {new Date(status.generatedAt).toLocaleString()}
            </span>
          ) : null}
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-2">
          {(status?.checks ?? []).map((check) => (
            <div
              key={check.id}
              className="rounded-2xl border border-white/10 bg-black/20 p-4"
            >
              <div className="flex items-start gap-3">
                <CheckIcon level={check.level} />
                <div>
                  <div className="text-sm font-black text-white/85">{check.label}</div>
                  <div className="mt-1 text-xs leading-5 text-white/35">{check.detail}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.025] p-6">
          <h2 className="text-lg font-black">Concurrency protection</h2>
          <p className="mt-2 text-sm leading-6 text-white/35">
            Active leases represent graph syncs, semantic-index builds, proactive scans or proactive reviews currently holding the distributed runtime lock.
          </p>
          <div className="mt-5 space-y-3">
            {status?.runtime.activeLeases.length ? (
              status.runtime.activeLeases.map((lease) => (
                <div key={`${lease.key}-${lease.acquiredAt}`} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-sm font-black text-white/80">{lease.key}</div>
                  <div className="mt-1 text-xs text-white/30">
                    Expires {new Date(lease.expiresAt).toLocaleString()}
                  </div>
                </div>
              ))
            ) : (
              <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm text-white/35">
                No expensive Personal OS job is currently holding a runtime lease.
              </div>
            )}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.025] p-6">
          <h2 className="text-lg font-black">Release policy</h2>
          <div className="mt-5 space-y-3">
            {(policy?.principles ?? []).map((principle) => (
              <div key={principle} className="flex gap-3 text-sm leading-6 text-white/45">
                <CheckCircle2 className="mt-1 h-4 w-4 shrink-0 text-[#C6FF32]" />
                {principle}
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  level,
}: {
  label: string;
  value: number;
  level: ReleaseCheckLevel;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="flex items-center gap-2">
        <CheckIcon level={level} />
        <span className="text-xs font-black uppercase tracking-[0.14em] text-white/35">{label}</span>
      </div>
      <div className="mt-3 text-3xl font-black tracking-[-0.04em]">{value}</div>
    </div>
  );
}

function CheckIcon({ level }: { level: ReleaseCheckLevel }) {
  if (level === "fail") return <XCircle className="h-5 w-5 shrink-0 text-red-300" />;
  if (level === "warning") {
    return <AlertTriangle className="h-5 w-5 shrink-0 text-amber-300" />;
  }
  return <CheckCircle2 className="h-5 w-5 shrink-0 text-[#C6FF32]" />;
}

function Metric({
  icon: Icon,
  label,
  value,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  value: number | string;
}) {
  return (
    <div className="flex items-center justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
      <div className="flex items-center gap-3 text-sm text-white/45">
        <Icon className="h-4 w-4 text-[#C6FF32]" />
        {label}
      </div>
      <span className="text-sm font-black text-white/80">{value}</span>
    </div>
  );
}
