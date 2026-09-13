"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  CircleDashed,
  Loader2,
  RefreshCw,
  XCircle,
} from "lucide-react";

type ModuleStatus = "healthy" | "warning" | "blocked" | "idle";

type SystemHealth = {
  status: "healthy" | "warning" | "blocked";
  score: number;
  summary: {
    healthy: number;
    warnings: number;
    blocked: number;
    idle: number;
  };
  modules: Array<{
    id: string;
    label: string;
    route: string;
    status: ModuleStatus;
    sourceRecords: number;
    graphNodes: number | null;
    missingGraphCollections: string[];
    detail: string;
  }>;
  graph: {
    activeNodes: number;
    activeEdges: number;
    indexedNodes: number;
    semanticCoverage: number;
  };
  generatedAt: string;
};

type DashboardResponse = {
  systemHealth?: SystemHealth;
};

export function PersonalOsSystemHealth() {
  const [health, setHealth] = useState<SystemHealth | null>(null);
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
        const message = Array.isArray(raw)
          ? raw.join(", ")
          : raw
            ? String(raw)
            : `System Health request failed: ${response.status}`;
        throw new Error(message);
      }
      const next = payload && "systemHealth" in payload ? payload.systemHealth : null;
      if (!next) {
        throw new Error(
          "System Health is not available yet. Apply the matching backend patch and restart the backend.",
        );
      }
      setHealth(next);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load Personal OS System Health.");
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
            <Activity className="h-4 w-4 text-[#C6FF32]" />
            Personal OS System Health
          </div>
          <div className="mt-4 flex items-end gap-4">
            <span className="text-5xl font-black tracking-[-0.07em] text-white">
              {health?.score ?? "—"}
            </span>
            <span className="pb-1 text-sm font-bold text-white/35">/ 100</span>
          </div>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-white/45">
            Verifies that source modules are actually connected to the Knowledge Graph and therefore available to Universal Search, Context Engine and Proactive HSAKAA. Empty modules are shown as idle rather than broken.
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
          Refresh system
        </button>
      </div>

      {error ? (
        <div className="mt-5 rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      {health ? (
        <>
          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <SummaryCard label="Healthy" value={health.summary.healthy} status="healthy" />
            <SummaryCard label="Warnings" value={health.summary.warnings} status="warning" />
            <SummaryCard label="Blocked" value={health.summary.blocked} status="blocked" />
            <SummaryCard label="Idle" value={health.summary.idle} status="idle" />
          </div>

          <div className="mt-6 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {health.modules.map((module) => (
              <Link
                key={module.id}
                href={module.route}
                className="rounded-2xl border border-white/10 bg-black/20 p-4 transition hover:border-white/20 hover:bg-white/[0.035]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="text-sm font-black text-white/85">{module.label}</div>
                    <div className="mt-1 text-[11px] font-bold uppercase tracking-[0.12em] text-white/25">
                      {module.sourceRecords} source record(s)
                      {module.graphNodes !== null ? ` · ${module.graphNodes} graph node(s)` : ""}
                    </div>
                  </div>
                  <StatusIcon status={module.status} />
                </div>
                <p className="mt-3 text-xs leading-5 text-white/35">{module.detail}</p>
              </Link>
            ))}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <GraphMetric label="Graph nodes" value={health.graph.activeNodes} />
            <GraphMetric label="Graph edges" value={health.graph.activeEdges} />
            <GraphMetric label="Search embeddings" value={health.graph.indexedNodes} />
            <GraphMetric
              label="Semantic coverage"
              value={`${(health.graph.semanticCoverage * 100).toFixed(1)}%`}
            />
          </div>

          <p className="mt-5 text-xs text-white/25">
            Snapshot generated {new Date(health.generatedAt).toLocaleString()}. Use “Run RC smoke” below for the complete release gate, including these module checks.
          </p>
        </>
      ) : loading ? (
        <div className="mt-6 flex items-center gap-3 text-sm font-bold text-white/40">
          <Loader2 className="h-4 w-4 animate-spin text-[#C6FF32]" />
          Inspecting Personal OS modules…
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
  status: ModuleStatus;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="flex items-center justify-between gap-3">
        <div className="text-[11px] font-black uppercase tracking-[0.13em] text-white/30">
          {label}
        </div>
        <StatusIcon status={status} />
      </div>
      <div className="mt-3 text-2xl font-black tracking-[-0.04em] text-white/85">{value}</div>
    </div>
  );
}

function GraphMetric({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="text-[11px] font-black uppercase tracking-[0.13em] text-white/30">{label}</div>
      <div className="mt-2 text-xl font-black text-white/80">{value}</div>
    </div>
  );
}

function StatusIcon({ status }: { status: ModuleStatus }) {
  if (status === "healthy") return <CheckCircle2 className="h-5 w-5 text-[#C6FF32]" />;
  if (status === "blocked") return <XCircle className="h-5 w-5 text-red-300" />;
  if (status === "warning") return <AlertTriangle className="h-5 w-5 text-amber-300" />;
  return <CircleDashed className="h-5 w-5 text-white/25" />;
}
