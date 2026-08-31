"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock3,
  Coins,
  DatabaseBackup,
  Gauge,
  Loader2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";

import {
  getProductionOpsDashboard,
  getProductionOpsPolicy,
  runProductionRcSmoke,
} from "@/lib/api/production-ops";
import type {
  AiUsageFeature,
  AiUsageStatus,
  OpsCheckLevel,
  ProductionOpsDashboard,
  ProductionOpsPolicy,
  ProductionOpsSmoke,
} from "@/types/production-ops";

const featureLabels: Record<AiUsageFeature, string> = {
  context_answer: "Context answers",
  proactive_scan: "Proactive scans",
  proactive_review: "Proactive reviews",
  search_index_embedding: "Index embeddings",
  search_query_embedding: "Query embeddings",
};

export function ProductionOpsWorkspace() {
  const [dashboard, setDashboard] = useState<ProductionOpsDashboard | null>(null);
  const [policy, setPolicy] = useState<ProductionOpsPolicy | null>(null);
  const [smoke, setSmoke] = useState<ProductionOpsSmoke | null>(null);
  const [loading, setLoading] = useState(true);
  const [checking, setChecking] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const [nextDashboard, nextPolicy] = await Promise.all([
        getProductionOpsDashboard(30),
        getProductionOpsPolicy(),
      ]);
      setDashboard(nextDashboard);
      setPolicy(nextPolicy);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load production operations.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
  }, []);

  async function runSmoke() {
    setChecking(true);
    setError(null);
    try {
      const [nextSmoke, nextDashboard] = await Promise.all([
        runProductionRcSmoke(7),
        getProductionOpsDashboard(30),
      ]);
      setSmoke(nextSmoke);
      setDashboard(nextDashboard);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "RC smoke checks failed.");
    } finally {
      setChecking(false);
    }
  }

  const budgetLabel = useMemo(() => {
    if (dashboard?.ai.budget.hardExceeded) return "Hard limit reached";
    if (dashboard?.ai.budget.softExceeded) return "Soft limit reached";
    return "Within budget";
  }, [dashboard]);

  if (loading && !dashboard) {
    return (
      <div className="grid min-h-[300px] place-items-center rounded-[28px] border border-white/10 bg-white/[0.025]">
        <div className="flex items-center gap-3 text-sm font-bold text-white/50">
          <Loader2 className="h-5 w-5 animate-spin text-[#C6FF32]" />
          Loading production telemetry…
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

      <section className="rounded-[28px] border border-white/10 bg-white/[0.025] p-6 md:p-8">
        <div className="flex flex-col justify-between gap-5 lg:flex-row lg:items-start">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-white/35">
              <Gauge className="h-4 w-4 text-[#C6FF32]" />
              Release candidate operations
            </div>
            <div className="mt-4 flex items-end gap-4">
              <span className="text-6xl font-black tracking-[-0.07em] text-white">
                {smoke?.score ?? dashboard?.release.score ?? 0}
              </span>
              <span className="pb-2 text-sm font-bold text-white/35">/ 100</span>
            </div>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/45">
              {smoke
                ? smoke.readyForRc
                  ? "The RC smoke gate has no blockers. Review warnings before deployment."
                  : "The RC smoke gate found at least one blocker."
                : "Run the RC smoke gate after your graph/index jobs are idle to capture a production-oriented release snapshot."}
            </p>
          </div>
          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => void load()}
              disabled={loading || checking}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl border border-white/10 px-4 text-xs font-black uppercase tracking-[0.13em] text-white/70 disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
              Refresh
            </button>
            <button
              type="button"
              onClick={() => void runSmoke()}
              disabled={checking}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#C6FF32] px-5 text-xs font-black uppercase tracking-[0.13em] text-black disabled:opacity-50"
            >
              {checking ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
              {checking ? "Checking…" : "Run RC smoke"}
            </button>
          </div>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-5">
        <MetricCard icon={Sparkles} label="30d tokens" value={formatNumber(dashboard?.ai.totals.totalTokens ?? 0)} />
        <MetricCard icon={Coins} label="30d estimated cost" value={formatUsd(dashboard?.ai.totals.estimatedCostUsd ?? 0, policy?.aiUsage.pricing.configured ?? false)} />
        <MetricCard icon={AlertTriangle} label="Fallback rate" value={formatPercent(dashboard?.ai.totals.fallbackRate ?? 0)} />
        <MetricCard icon={XCircle} label="Error rate" value={formatPercent(dashboard?.ai.totals.errorRate ?? 0)} />
        <MetricCard icon={Clock3} label="Active jobs" value={dashboard?.runtime.activeLeases.length ?? 0} />
      </section>

      <section className="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.025] p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-black">AI usage by feature</h2>
              <p className="mt-1 text-xs leading-5 text-white/35">
                Structured AI uses provider token usage when available. Embedding usage is conservatively estimated from input text size.
              </p>
            </div>
            <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.12em] text-white/40">
              {budgetLabel}
            </span>
          </div>
          <div className="mt-5 space-y-3">
            {(dashboard?.ai.byFeature ?? []).length ? (
              dashboard?.ai.byFeature.map((item) => (
                <div key={item.feature} className="grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 sm:grid-cols-[1fr_auto_auto] sm:items-center">
                  <div>
                    <div className="text-sm font-black text-white/80">{featureLabels[item.feature]}</div>
                    <div className="mt-1 text-xs text-white/30">{formatNumber(item.requestUnits)} request unit(s)</div>
                  </div>
                  <div className="text-sm font-black text-white/60">{formatNumber(item.totalTokens)} tokens</div>
                  <div className="text-sm font-black text-white/60">{formatUsd(item.estimatedCostUsd, policy?.aiUsage.pricing.configured ?? false)}</div>
                </div>
              ))
            ) : (
              <EmptyText>No AI usage has been recorded since this operations patch was applied.</EmptyText>
            )}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.025] p-6">
          <h2 className="text-lg font-black">Cost & release identity</h2>
          <div className="mt-5 space-y-3">
            <KeyValue label="Today tokens" value={formatNumber(dashboard?.ai.budget.today.totalTokens ?? 0)} />
            <KeyValue label="Today estimated cost" value={formatUsd(dashboard?.ai.budget.today.estimatedCostUsd ?? 0, policy?.aiUsage.pricing.configured ?? false)} />
            <KeyValue label="Pricing configured" value={policy?.aiUsage.pricing.configured ? "Yes" : "No — costs hidden"} />
            <KeyValue label="NODE_ENV" value={dashboard?.environment.nodeEnv ?? "Unset"} />
            <KeyValue label="App version" value={dashboard?.environment.version ?? "Unset"} />
            <KeyValue label="Git SHA" value={dashboard?.environment.gitSha ?? "Unset"} mono />
          </div>
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.025] p-6">
          <div className="flex items-center gap-2">
            <DatabaseBackup className="h-5 w-5 text-[#C6FF32]" />
            <h2 className="text-lg font-black">Backup readiness</h2>
          </div>
          <div className="mt-5 space-y-3">
            <KeyValue label="Strategy" value={dashboard?.backup.strategy ?? "Not configured"} />
            <KeyValue
              label="Last verified"
              value={dashboard?.backup.lastVerifiedAt ? new Date(dashboard.backup.lastVerifiedAt).toLocaleString() : "Not recorded"}
            />
            <KeyValue label="Verification age" value={dashboard?.backup.ageDays === null || dashboard?.backup.ageDays === undefined ? "Unknown" : `${dashboard.backup.ageDays} day(s)`} />
          </div>
          <p className="mt-5 text-xs leading-5 text-white/30">
            Configure `PERSONAL_OS_BACKUP_STRATEGY` and `PERSONAL_OS_BACKUP_LAST_VERIFIED_AT`. Credentials are never returned to this UI.
          </p>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.025] p-6">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-[#C6FF32]" />
            <h2 className="text-lg font-black">Active distributed jobs</h2>
          </div>
          <div className="mt-5 space-y-3">
            {dashboard?.runtime.activeLeases.length ? (
              dashboard.runtime.activeLeases.map((lease) => (
                <div key={`${lease.key}-${lease.acquiredAt}`} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                  <div className="text-sm font-black text-white/80">{lease.key}</div>
                  <div className="mt-1 text-xs text-white/30">Expires {new Date(lease.expiresAt).toLocaleString()}</div>
                </div>
              ))
            ) : (
              <EmptyText>No graph, semantic-index or proactive job is currently holding a distributed lease.</EmptyText>
            )}
          </div>
        </div>
      </section>

      {smoke ? (
        <section className="rounded-[28px] border border-white/10 bg-white/[0.025] p-6 md:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black">RC smoke checks</h2>
              <p className="mt-2 text-sm text-white/35">Non-destructive checks only. No AI generation is performed by this gate.</p>
            </div>
            <span className="text-xs text-white/25">{new Date(smoke.generatedAt).toLocaleString()}</span>
          </div>
          <div className="mt-6 grid gap-3 lg:grid-cols-2">
            {smoke.checks.map((check) => (
              <div key={check.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
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
      ) : null}

      <section className="rounded-[28px] border border-white/10 bg-white/[0.025] p-6 md:p-8">
        <h2 className="text-xl font-black">Recent AI operations</h2>
        <div className="mt-5 overflow-x-auto">
          <table className="w-full min-w-[780px] text-left text-xs">
            <thead className="text-white/30">
              <tr>
                <th className="pb-3 pr-4 font-black uppercase tracking-[0.12em]">When</th>
                <th className="pb-3 pr-4 font-black uppercase tracking-[0.12em]">Feature</th>
                <th className="pb-3 pr-4 font-black uppercase tracking-[0.12em]">Status</th>
                <th className="pb-3 pr-4 font-black uppercase tracking-[0.12em]">Model</th>
                <th className="pb-3 pr-4 font-black uppercase tracking-[0.12em]">Tokens</th>
                <th className="pb-3 font-black uppercase tracking-[0.12em]">Duration</th>
              </tr>
            </thead>
            <tbody>
              {(dashboard?.ai.recent ?? []).map((item) => (
                <tr key={item._id} className="border-t border-white/5 text-white/55">
                  <td className="py-3 pr-4">{new Date(item.occurredAt).toLocaleString()}</td>
                  <td className="py-3 pr-4 font-bold text-white/70">{featureLabels[item.feature]}</td>
                  <td className="py-3 pr-4"><StatusBadge status={item.status} /></td>
                  <td className="py-3 pr-4">{item.model ?? "—"}</td>
                  <td className="py-3 pr-4">{formatNumber(item.totalTokens)}</td>
                  <td className="py-3">{item.durationMs} ms</td>
                </tr>
              ))}
            </tbody>
          </table>
          {!dashboard?.ai.recent.length ? <div className="py-6"><EmptyText>No operations recorded yet.</EmptyText></div> : null}
        </div>
      </section>
    </div>
  );
}

function MetricCard({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: number | string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-4">
      <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-[0.13em] text-white/30">
        <Icon className="h-4 w-4 text-[#C6FF32]" />
        {label}
      </div>
      <div className="mt-3 text-2xl font-black tracking-[-0.04em] text-white/85">{value}</div>
    </div>
  );
}

function KeyValue({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4 rounded-2xl border border-white/10 bg-black/20 px-4 py-3">
      <span className="text-xs font-bold text-white/35">{label}</span>
      <span className={`max-w-[60%] text-right text-xs font-black text-white/70 ${mono ? "font-mono" : ""}`}>{value}</span>
    </div>
  );
}

function CheckIcon({ level }: { level: OpsCheckLevel }) {
  if (level === "fail") return <XCircle className="h-5 w-5 shrink-0 text-red-300" />;
  if (level === "warning") return <AlertTriangle className="h-5 w-5 shrink-0 text-amber-300" />;
  return <CheckCircle2 className="h-5 w-5 shrink-0 text-[#C6FF32]" />;
}

function StatusBadge({ status }: { status: AiUsageStatus }) {
  const className =
    status === "success"
      ? "border-[#C6FF32]/20 bg-[#C6FF32]/10 text-[#C6FF32]"
      : status === "fallback"
        ? "border-amber-300/20 bg-amber-300/10 text-amber-200"
        : "border-red-300/20 bg-red-300/10 text-red-200";
  return <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.1em] ${className}`}>{status}</span>;
}

function EmptyText({ children }: { children: React.ReactNode }) {
  return <div className="rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-6 text-white/35">{children}</div>;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}

function formatPercent(value: number) {
  return `${(value * 100).toFixed(1)}%`;
}

function formatUsd(value: number, configured: boolean) {
  if (!configured) return "Not configured";
  return `$${value.toFixed(value < 1 ? 4 : 2)}`;
}
