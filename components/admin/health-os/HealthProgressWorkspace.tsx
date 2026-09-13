"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  AlertTriangle,
  Brain,
  Dumbbell,
  Loader2,
  RefreshCw,
  Sparkles,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";

import {
  generateHealthProgressReview,
  getHealthIntelligence,
  getHealthProgressSummary,
} from "@/lib/api/health-planner";
import type {
  HealthGoalTrajectoryStatus,
  HealthIntelligence,
  HealthIntelligenceSeverity,
  HealthIntelligenceTrend,
  HealthProgressSummary,
} from "@/types/health-planner";

export function HealthProgressWorkspace() {
  const [data, setData] = useState<HealthProgressSummary | null>(null);
  const [intelligence, setIntelligence] = useState<HealthIntelligence | null>(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const [progress, insight] = await Promise.all([
      getHealthProgressSummary(30),
      getHealthIntelligence(30),
    ]);
    setData(progress);
    setIntelligence(insight);
  }, []);

  useEffect(() => {
    load().catch((value) =>
      setError(value instanceof Error ? value.message : "Unable to load Health progress."),
    );
  }, [load]);

  async function review(period: "weekly" | "monthly") {
    setBusy(period);
    setError("");
    try {
      await generateHealthProgressReview(period, true);
      await load();
    } catch (value) {
      setError(value instanceof Error ? value.message : "Unable to generate review.");
    } finally {
      setBusy("");
    }
  }

  const trackedTrends = useMemo(
    () => intelligence?.trends.filter((trend) => trend.points.length > 0) ?? [],
    [intelligence],
  );

  return (
    <div className="space-y-5">
      {error ? (
        <div className="rounded-[18px] border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <section className="rounded-[26px] border border-[#C6FF32]/20 bg-[#C6FF32]/[0.035] p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#C6FF32]">
                Health Intelligence
              </p>
              {intelligence ? <StatusBadge status={intelligence.status} /> : null}
            </div>
            <h2 className="mt-2 text-2xl font-black">{intelligence?.headline ?? "Building your evidence baseline"}</h2>
            <p className="mt-2 text-sm leading-6 text-white/40">
              Deterministic trends and correlations are calculated from your automatic Health/WHOOP data and execution history, then passed back into HSAKAA when the rolling plan regenerates.
            </p>
          </div>
          <button
            onClick={() => {
              setBusy("load");
              load()
                .catch((value) =>
                  setError(value instanceof Error ? value.message : "Unable to refresh."),
                )
                .finally(() => setBusy(""));
            }}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-white/[0.06] px-3 text-xs font-black text-white/60"
          >
            <RefreshCw className={`h-4 w-4 ${busy === "load" ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Kpi
          label="30-day adherence"
          value={data ? `${Math.round(data.averages.adherencePercentage)}%` : "—"}
        />
        <Kpi
          label="Tracking coverage"
          value={data ? `${Math.round(data.averages.trackingCoveragePercentage)}%` : "—"}
        />
        <Kpi label="80%+ days" value={data ? String(data.totals.daysAtOrAbove80) : "—"} />
        <Kpi
          label="Current streak"
          value={data ? `${data.totals.adherenceStreak} days` : "—"}
        />
      </section>

      {intelligence?.cards.length ? (
        <section className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {intelligence.cards.map((card) => (
            <article
              key={card.key}
              className={`rounded-[22px] border p-5 ${severityClass(card.severity)}`}
            >
              <div className="flex items-center justify-between gap-3">
                <p className="text-xs font-black uppercase tracking-[0.14em] opacity-70">
                  {severityLabel(card.severity)}
                </p>
                <span className="text-[11px] opacity-50">{card.evidenceDays} evidence days</span>
              </div>
              <h3 className="mt-2 font-black">{card.title}</h3>
              <p className="mt-2 text-sm leading-6 opacity-70">{card.message}</p>
            </article>
          ))}
        </section>
      ) : null}

      <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <Activity className="h-5 w-5 text-[#C6FF32]" />
          <div>
            <h3 className="text-xl font-black">Automatic trends</h3>
            <p className="mt-1 text-sm text-white/35">
              Latest value versus your recent baseline. Missing data stays missing instead of being guessed.
            </p>
          </div>
        </div>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {trackedTrends.length ? (
            trackedTrends.map((trend) => <TrendCard key={trend.key} trend={trend} />)
          ) : (
            <Empty text="Trend cards appear as automatic Health/WHOOP history accumulates." />
          )}
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <Target className="h-5 w-5 text-[#C6FF32]" />
            <div>
              <h3 className="text-xl font-black">Goal trajectory</h3>
              <p className="mt-1 text-sm text-white/35">
                Current → target with pace against the target date when enough evidence exists.
              </p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {intelligence?.goals.length ? (
              intelligence.goals.map((goal) => (
                <article key={goal.id} className="rounded-[18px] border border-white/10 bg-black/20 p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="font-black text-white/80">{goal.title}</p>
                      <p className="mt-1 text-xs text-white/30">{goal.category}</p>
                    </div>
                    <GoalStatus status={goal.status} />
                  </div>
                  <div className="mt-4 grid grid-cols-3 gap-2 text-sm">
                    <Value label="Current" value={formatGoalValue(goal.currentValue, goal.unit)} />
                    <Value label="Target" value={formatGoalValue(goal.targetValue, goal.unit)} />
                    <Value
                      label="Progress"
                      value={goal.progressPercentage == null ? "—" : `${Math.round(goal.progressPercentage)}%`}
                    />
                  </div>
                  {goal.progressPercentage != null ? (
                    <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                      <div
                        className="h-full rounded-full bg-[#C6FF32]"
                        style={{ width: `${Math.min(100, Math.max(0, goal.progressPercentage))}%` }}
                      />
                    </div>
                  ) : null}
                  <p className="mt-3 text-xs leading-5 text-white/30">{goal.evidence}</p>
                </article>
              ))
            ) : (
              <Empty text="Add an active target in AI Plan to enable trajectory tracking." />
            )}
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <Brain className="h-5 w-5 text-[#C6FF32]" />
            <div>
              <h3 className="text-xl font-black">Observed correlations</h3>
              <p className="mt-1 text-sm text-white/35">
                Associations in your own data. They are evidence for planning, not medical diagnosis or proof of causation.
              </p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {intelligence?.correlations.length ? (
              intelligence.correlations.map((item) => (
                <article key={item.key} className="rounded-[18px] border border-white/10 bg-black/20 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-black text-white/75">
                      {item.factor} → {item.outcome}
                    </p>
                    <span className="rounded-lg bg-white/[0.06] px-2 py-1 text-[11px] font-black uppercase text-white/40">
                      {item.confidence} confidence
                    </span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-white/45">{item.interpretation}</p>
                  <p className="mt-2 text-xs text-white/25">
                    {item.sampleSize} comparison days · {item.exposedDays} exposed / {item.comparisonDays} comparison
                  </p>
                </article>
              ))
            ) : (
              <Empty text="Correlations appear after enough exposed and comparison days exist." />
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <Dumbbell className="h-5 w-5 text-[#C6FF32]" />
            <div>
              <h3 className="text-xl font-black">Training progression</h3>
              <p className="mt-1 text-sm text-white/35">
                Exercise-level progress / hold / reduce / review signals from actual sets and RPE.
              </p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {intelligence?.trainingProgression.length ? (
              intelligence.trainingProgression.map((item) => (
                <article key={item.exercise} className="rounded-[18px] border border-white/10 bg-black/20 p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-black text-white/80">{item.exercise}</p>
                    <Recommendation value={item.recommendation} />
                  </div>
                  <p className="mt-2 text-sm leading-6 text-white/45">{item.rationale}</p>
                  <p className="mt-2 text-xs text-white/25">
                    {item.sessionsObserved} sessions · {Math.round(item.averageSetCompletionPercentage)}% sets completed
                    {item.latestAverageRpe != null ? ` · latest RPE ${item.latestAverageRpe}` : ""}
                  </p>
                </article>
              ))
            ) : (
              <Empty text="Progression recommendations appear after at least two matching logged exercise sessions." />
            )}
          </div>
        </div>

        <div className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-200" />
            <div>
              <h3 className="text-xl font-black">Needs attention</h3>
              <p className="mt-1 text-sm text-white/35">
                HSAKAA uses these as conservative planning constraints or review prompts.
              </p>
            </div>
          </div>
          <div className="mt-5 space-y-3">
            {intelligence?.attention.length ? (
              intelligence.attention.map((item) => (
                <article key={item.key} className="rounded-[18px] border border-amber-300/15 bg-amber-300/[0.04] p-4">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-black text-amber-100/85">{item.title}</p>
                    <span className="text-[11px] font-black uppercase text-amber-200/50">{item.severity}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-white/45">{item.message}</p>
                  <p className="mt-3 text-xs leading-5 text-amber-100/45">Next: {item.action}</p>
                </article>
              ))
            ) : (
              <Empty text="No current attention items from the available evidence." />
            )}
          </div>
        </div>
      </section>

      <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5 sm:p-6">
        <div className="flex items-center gap-3">
          <Brain className="h-5 w-5 text-[#C6FF32]" />
          <div>
            <h3 className="text-xl font-black">Health memory</h3>
            <p className="mt-1 text-sm text-white/35">
              What repeatedly worked, failed or was explicitly changed is retained as planning evidence so HSAKAA does not keep repeating bad recommendations.
            </p>
          </div>
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-3">
          <MemoryCard title="What works" items={intelligence?.memory.successfulPatterns ?? []} />
          <MemoryCard title="What failed" items={intelligence?.memory.failedPatterns ?? []} />
          <MemoryCard title="Avoid / review" items={intelligence?.memory.avoidOrReview ?? []} />
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <TimelineCard
          title="Photo checkpoints"
          subtitle="Body, skin and hair observations stay private and are compared as historical checkpoints."
          items={(intelligence?.photoTimeline ?? []).slice(0, 8).map((item) => ({
            key: item.id,
            eyebrow: `${item.category} · ${item.angle} · ${formatDate(item.takenAt)}`,
            title: item.summary || "Checkpoint saved",
            details: [...item.observations, ...item.improvementOpportunities].slice(0, 3),
          }))}
        />
        <TimelineCard
          title="Report history"
          subtitle="Uploaded report findings remain evidence for trend/review; clinically significant items stay review-only."
          items={(intelligence?.reportTimeline ?? []).slice(0, 8).map((item) => ({
            key: item.id,
            eyebrow: formatDate(item.reportDate),
            title: item.label,
            details: [item.summary, ...item.measurements, ...item.planningImplications].filter(Boolean).slice(0, 3),
          }))}
        />
      </section>

      <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-black">Plan vs actual</h3>
            <p className="mt-1 text-sm text-white/35">
              Structured logs are used first; routine-task completion is the fallback when a domain does not need separate manual logging.
            </p>
          </div>
        </div>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[720px] text-left text-sm">
            <thead className="text-xs uppercase tracking-[0.12em] text-white/25">
              <tr>
                <th className="pb-3">Date</th>
                <th className="pb-3">Adherence</th>
                <th className="pb-3">Coverage</th>
                <th className="pb-3">Tasks</th>
                <th className="pb-3">Recovery</th>
                <th className="pb-3">Sleep</th>
                <th className="pb-3">Strain</th>
              </tr>
            </thead>
            <tbody>
              {data?.executions.map((item) => (
                <tr key={item.dateKey} className="border-t border-white/5">
                  <td className="py-3 font-bold text-white/65">{item.dateKey}</td>
                  <td className="py-3 text-white/50">{Math.round(item.overallAdherencePercentage)}%</td>
                  <td className="py-3 text-white/50">{Math.round(item.trackingCoveragePercentage)}%</td>
                  <td className="py-3 text-white/50">{Math.round(item.taskCompletionPercentage)}%</td>
                  <td className="py-3 text-white/50">{item.automaticMetrics.recoveryScore ?? "—"}</td>
                  <td className="py-3 text-white/50">
                    {item.automaticMetrics.sleepHours != null
                      ? `${item.automaticMetrics.sleepHours.toFixed(1)}h`
                      : "—"}
                  </td>
                  <td className="py-3 text-white/50">{item.automaticMetrics.strainScore ?? "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-xl font-black">AI reviews</h3>
            <p className="mt-1 text-sm text-white/35">
              Weekly and monthly reviews feed recommendations back into the rolling planner automatically; these buttons let you force a review now.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              disabled={!!busy}
              onClick={() => review("weekly")}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#C6FF32] px-3 text-xs font-black text-[#030608]"
            >
              {busy === "weekly" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Weekly
            </button>
            <button
              disabled={!!busy}
              onClick={() => review("monthly")}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-white/[0.07] px-3 text-xs font-black text-white/60"
            >
              {busy === "monthly" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              Monthly
            </button>
          </div>
        </div>
        <div className="mt-5 space-y-3">
          {data?.reviews.length ? (
            data.reviews.map((review) => (
              <article key={`${review.periodType}-${review.periodKey}`} className="rounded-[18px] border border-white/10 bg-black/20 p-4">
                <div className="flex flex-wrap justify-between gap-2">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-[#C6FF32]">
                    {review.periodType} · {review.periodKey}
                  </p>
                  <span className="text-xs text-white/25">v{review.version}</span>
                </div>
                <p className="mt-3 text-sm leading-6 text-white/60">{review.summary}</p>
                {review.recommendedChanges.length ? (
                  <div className="mt-3">
                    <p className="text-xs font-black uppercase tracking-[0.12em] text-white/25">Recommended changes</p>
                    <ul className="mt-2 space-y-1 text-sm text-white/45">
                      {review.recommendedChanges.map((item, index) => (
                        <li key={`${item}-${index}`}>• {item}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </article>
            ))
          ) : (
            <p className="text-sm text-white/35">
              No review yet. Weekly/monthly automation will generate them as execution evidence accumulates.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}

function Kpi({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/[0.025] p-5">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-white/25">{label}</p>
      <p className="mt-2 text-2xl font-black text-white/85">{value}</p>
    </div>
  );
}

function TrendCard({ trend }: { trend: HealthIntelligenceTrend }) {
  const isUp = trend.direction === "up";
  const isDown = trend.direction === "down";
  return (
    <article className="rounded-[18px] border border-white/10 bg-black/20 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.12em] text-white/25">{trend.label}</p>
          <p className="mt-2 text-xl font-black text-white/80">
            {trend.current == null ? "—" : `${trend.current}${trend.unit ? ` ${trend.unit}` : ""}`}
          </p>
        </div>
        {isUp ? <TrendingUp className="h-4 w-4 text-white/35" /> : isDown ? <TrendingDown className="h-4 w-4 text-white/35" /> : null}
      </div>
      <Sparkline points={trend.points.map((point) => point.value)} />
      <p className="mt-2 text-xs text-white/25">
        baseline {trend.baseline == null ? "—" : `${trend.baseline}${trend.unit ? ` ${trend.unit}` : ""}`}
        {trend.delta != null ? ` · ${trend.delta > 0 ? "+" : ""}${trend.delta}` : ""}
      </p>
    </article>
  );
}

function Sparkline({ points }: { points: number[] }) {
  if (points.length < 2) return <div className="mt-4 h-10 rounded-lg bg-white/[0.025]" />;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const path = points
    .map((value, index) => {
      const x = (index / (points.length - 1)) * 100;
      const y = 36 - ((value - min) / range) * 30;
      return `${index === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
  return (
    <svg viewBox="0 0 100 40" className="mt-3 h-10 w-full" preserveAspectRatio="none" aria-hidden="true">
      <path d={path} fill="none" stroke="currentColor" strokeWidth="2" className="text-[#C6FF32]/70" vectorEffect="non-scaling-stroke" />
    </svg>
  );
}

function StatusBadge({ status }: { status: HealthIntelligence["status"] }) {
  const className =
    status === "attention"
      ? "bg-red-400/10 text-red-200"
      : status === "watch"
        ? "bg-amber-300/10 text-amber-200"
        : "bg-[#C6FF32]/10 text-[#C6FF32]";
  return <span className={`rounded-lg px-2 py-1 text-[10px] font-black uppercase ${className}`}>{status}</span>;
}

function GoalStatus({ status }: { status: HealthGoalTrajectoryStatus }) {
  const label = status.replaceAll("_", " ");
  const className =
    status === "off_track"
      ? "bg-red-400/10 text-red-200"
      : status === "slightly_behind"
        ? "bg-amber-300/10 text-amber-200"
        : status === "on_track"
          ? "bg-[#C6FF32]/10 text-[#C6FF32]"
          : "bg-white/[0.06] text-white/35";
  return <span className={`rounded-lg px-2 py-1 text-[10px] font-black uppercase ${className}`}>{label}</span>;
}

function Recommendation({ value }: { value: "progress" | "hold" | "reduce" | "review" }) {
  const className =
    value === "progress"
      ? "bg-[#C6FF32]/10 text-[#C6FF32]"
      : value === "reduce" || value === "review"
        ? "bg-amber-300/10 text-amber-200"
        : "bg-white/[0.06] text-white/40";
  return <span className={`rounded-lg px-2 py-1 text-[10px] font-black uppercase ${className}`}>{value}</span>;
}

function severityClass(severity: HealthIntelligenceSeverity) {
  if (severity === "attention") return "border-red-400/15 bg-red-400/[0.04] text-red-100";
  if (severity === "watch") return "border-amber-300/15 bg-amber-300/[0.04] text-amber-100";
  if (severity === "positive") return "border-[#C6FF32]/15 bg-[#C6FF32]/[0.035] text-white";
  return "border-white/10 bg-white/[0.025] text-white";
}

function severityLabel(severity: HealthIntelligenceSeverity) {
  return severity === "positive" ? "positive signal" : severity;
}

function MemoryCard({ title, items }: { title: string; items: string[] }) {
  return (
    <article className="rounded-[18px] border border-white/10 bg-black/20 p-4">
      <p className="text-xs font-black uppercase tracking-[0.12em] text-white/30">{title}</p>
      {items.length ? (
        <ul className="mt-3 space-y-2 text-sm leading-6 text-white/45">
          {items.map((item) => <li key={item}>• {item}</li>)}
        </ul>
      ) : (
        <p className="mt-3 text-sm text-white/25">No repeated pattern yet.</p>
      )}
    </article>
  );
}

function TimelineCard({
  title,
  subtitle,
  items,
}: {
  title: string;
  subtitle: string;
  items: Array<{ key: string; eyebrow: string; title: string; details: string[] }>;
}) {
  return (
    <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5 sm:p-6">
      <h3 className="text-xl font-black">{title}</h3>
      <p className="mt-1 text-sm text-white/35">{subtitle}</p>
      <div className="mt-5 space-y-3">
        {items.length ? items.map((item) => (
          <article key={item.key} className="rounded-[18px] border border-white/10 bg-black/20 p-4">
            <p className="text-[11px] font-black uppercase tracking-[0.12em] text-[#C6FF32]/70">{item.eyebrow}</p>
            <p className="mt-2 font-bold text-white/70">{item.title}</p>
            {item.details.length ? (
              <ul className="mt-2 space-y-1 text-xs leading-5 text-white/35">
                {item.details.map((detail, index) => <li key={`${detail}-${index}`}>• {detail}</li>)}
              </ul>
            ) : null}
          </article>
        )) : <Empty text="No checkpoints yet." />}
      </div>
    </section>
  );
}

function Value({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/20">{label}</p>
      <p className="mt-1 font-black text-white/65">{value}</p>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return <p className="rounded-[16px] border border-dashed border-white/10 p-4 text-sm text-white/30">{text}</p>;
}

function formatGoalValue(value: number | null, unit: string) {
  return value == null ? "—" : `${value}${unit ? ` ${unit}` : ""}`;
}

function formatDate(value: string) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}
