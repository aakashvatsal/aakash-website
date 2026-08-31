"use client";

import {
  Activity,
  BarChart3,
  BrainCircuit,
  CircleAlert,
  Clock3,
  FlaskConical,
  Gauge,
  Loader2,
  RefreshCw,
  Scale,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getPrivateHsakaaDecisionAnalytics,
  type HsakaaDecisionAnalytics,
  type HsakaaDecisionAnalyticsSegment,
} from "@/services/hsakaa.service";

function percent(value: number | null, digits = 0) {
  if (value === null || Number.isNaN(value)) return "—";
  return `${(value * 100).toFixed(digits)}%`;
}

function titleCase(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function compactDurationHours(value: number | null) {
  if (value === null || Number.isNaN(value)) return "—";
  if (value < 24) return `${value.toFixed(value < 10 ? 1 : 0)}h`;
  return `${(value / 24).toFixed(1)}d`;
}

function compactDurationDays(value: number | null) {
  if (value === null || Number.isNaN(value)) return "—";
  if (value < 1) return `${Math.round(value * 24)}h`;
  return `${value.toFixed(value < 10 ? 1 : 0)}d`;
}

function toneForGap(value: number | null) {
  if (value === null) return "text-white/30";
  if (value < -0.15) return "text-rose-300/75";
  if (value > 0.15) return "text-sky-300/75";
  return "text-emerald-300/70";
}

function MetricCard({
  label,
  value,
  detail,
}: {
  label: string;
  value: string | number;
  detail?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-black/15 p-3.5">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/28">
        {label}
      </p>
      <p className="mt-1.5 text-xl font-black text-white/70">{value}</p>
      {detail ? <p className="mt-1 text-[10px] leading-4 text-white/25">{detail}</p> : null}
    </div>
  );
}

function SegmentTable({
  title,
  items,
}: {
  title: string;
  items: HsakaaDecisionAnalyticsSegment[];
}) {
  const visible = items.filter((item) => item.count > 0);

  return (
    <div className="rounded-[22px] border border-white/8 bg-black/15 p-4">
      <p className="text-xs font-black uppercase tracking-[0.16em] text-white/35">{title}</p>
      {visible.length ? (
        <div className="mt-3 space-y-2.5">
          {visible.map((item) => (
            <div key={item.label} className="rounded-xl border border-white/6 bg-white/[0.012] p-3">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-xs font-black text-white/58">{titleCase(item.label)}</p>
                  <p className="mt-0.5 text-[10px] text-white/22">
                    {item.count} final review{item.count === 1 ? "" : "s"} · {item.sampleQuality} sample
                  </p>
                </div>
                <span className={`text-xs font-black ${toneForGap(item.calibrationGap)}`}>
                  gap {item.calibrationGap === null ? "—" : `${item.calibrationGap >= 0 ? "+" : ""}${percent(item.calibrationGap)}`}
                </span>
              </div>
              <div className="mt-3 grid grid-cols-3 gap-2 text-[10px]">
                <div>
                  <p className="text-white/20">Outcome</p>
                  <p className="mt-0.5 font-black text-white/50">{percent(item.weightedOutcomeScore)}</p>
                </div>
                <div>
                  <p className="text-white/20">HSAKAA</p>
                  <p className="mt-0.5 font-black text-white/50">{percent(item.recommendationSuccessRate)}</p>
                </div>
                <div>
                  <p className="text-white/20">Confidence</p>
                  <p className="mt-0.5 font-black text-white/50">{percent(item.averageConfidence)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-xs leading-5 text-white/28">No final reviews in this breakdown yet.</p>
      )}
    </div>
  );
}

export function HsakaaDecisionAnalyticsDashboard({ refreshKey = 0 }: { refreshKey?: number }) {
  const [analytics, setAnalytics] = useState<HsakaaDecisionAnalytics | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      setAnalytics(await getPrivateHsakaaDecisionAnalytics());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load decision analytics.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load, refreshKey]);

  const strongestSignal = useMemo(
    () => analytics?.lowerConfidenceSignals[0] ?? null,
    [analytics],
  );

  return (
    <section className="rounded-[26px] border border-[#C6FF32]/12 bg-black/15 p-4 md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-[#C6FF32]">
            <BarChart3 className="h-4 w-4" />
            <p className="text-xs font-black uppercase tracking-[0.16em]">Decision Analytics</p>
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/38">
            Historical performance, calibration, speed and experiment learning. Everything here is deterministic over stored Decision Lab records and never rewrites a frozen baseline.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.1em] text-white/35 transition hover:border-[#C6FF32]/25 hover:text-[#C6FF32] disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          Refresh
        </button>
      </div>

      {error ? (
        <div className="mt-4 rounded-2xl border border-rose-400/15 bg-rose-400/[0.035] p-3 text-xs text-rose-200/65">
          {error}
        </div>
      ) : null}

      {isLoading && !analytics ? (
        <div className="mt-4 flex items-center gap-2 text-xs text-white/30">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading deterministic analytics…
        </div>
      ) : null}

      {analytics ? (
        <div className="mt-5 space-y-4">
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.1em]">
            <span className="rounded-full border border-[#C6FF32]/12 bg-[#C6FF32]/[0.035] px-2.5 py-1 text-[#C6FF32]/65">
              {analytics.sampleQuality} sample
            </span>
            <span className="rounded-full border border-white/8 px-2.5 py-1 text-white/28">
              {analytics.overview.finalReviewedCount} final reviews
            </span>
            <span className="rounded-full border border-white/8 px-2.5 py-1 text-white/28">
              zero AI retrieval calls
            </span>
          </div>

          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6">
            <MetricCard label="Analyzed" value={analytics.overview.analyzedCount} />
            <MetricCard label="Committed" value={analytics.overview.committedCount} />
            <MetricCard label="Pending review" value={analytics.overview.pendingReviewCount} />
            <MetricCard
              label="Followed HSAKAA"
              value={percent(analytics.overview.recommendationFollowedRate)}
              detail={`${analytics.overview.recommendationFollowedCount} followed · ${analytics.overview.recommendationNotFollowedCount} not followed`}
            />
            <MetricCard
              label="Recommendation score"
              value={percent(analytics.overview.weightedRecommendationSuccessRate)}
              detail="Held = 1 · mixed = 0.5 · missed = 0"
            />
            <MetricCard
              label="Baseline confidence"
              value={percent(analytics.overview.averageBaselineConfidence)}
            />
          </div>

          {strongestSignal ? (
            <div className="rounded-2xl border border-amber-300/15 bg-amber-300/[0.035] p-4">
              <div className="flex items-start gap-3">
                <TrendingDown className="mt-0.5 h-4 w-4 shrink-0 text-amber-200/70" />
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-amber-200/55">Confidence caution</p>
                  <p className="mt-1 text-sm font-black text-white/60">
                    {titleCase(strongestSignal.label)} · {strongestSignal.reviewedCount} reviews
                  </p>
                  <p className="mt-1 text-xs leading-5 text-white/34">
                    Historical recommendation score {percent(strongestSignal.observedRecommendationSuccessRate)} versus average baseline confidence {percent(strongestSignal.averageConfidence)}. {strongestSignal.guidance}
                  </p>
                </div>
              </div>
            </div>
          ) : analytics.overview.finalReviewedCount ? (
            <div className="rounded-2xl border border-emerald-300/10 bg-emerald-300/[0.025] p-3.5 text-xs leading-5 text-white/32">
              No segment currently has enough evidence to justify a systematic lower-confidence caution.
            </div>
          ) : null}

          <div className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-[22px] border border-white/8 bg-black/15 p-4">
              <div className="flex items-center gap-2">
                <Gauge className="h-4 w-4 text-[#C6FF32]/65" />
                <p className="text-xs font-black uppercase tracking-[0.16em] text-white/35">Confidence calibration bands</p>
              </div>
              <div className="mt-4 space-y-3">
                {analytics.confidenceBands.map((band) => {
                  const width = Math.max(0, Math.min(100, (band.observedSuccessRate ?? 0) * 100));
                  return (
                    <div key={band.label}>
                      <div className="flex flex-wrap items-end justify-between gap-2 text-xs">
                        <div>
                          <span className="font-black text-white/55">{titleCase(band.label)}</span>
                          <span className="ml-2 text-[10px] text-white/22">n={band.count}</span>
                        </div>
                        <div className="text-right">
                          <span className="font-black text-white/48">{percent(band.observedSuccessRate)}</span>
                          <span className="ml-2 text-[10px] text-white/22">vs {percent(band.averageConfidence)} confidence</span>
                        </div>
                      </div>
                      <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/5">
                        <div className="h-full rounded-full bg-[#C6FF32]/55" style={{ width: `${width}%` }} />
                      </div>
                      <p className={`mt-1 text-[10px] ${toneForGap(band.calibrationGap)}`}>
                        {titleCase(band.calibration)}{band.calibrationGap === null ? "" : ` · gap ${band.calibrationGap >= 0 ? "+" : ""}${percent(band.calibrationGap)}`}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[22px] border border-white/8 bg-black/15 p-4">
              <div className="flex items-center gap-2">
                <Scale className="h-4 w-4 text-[#C6FF32]/65" />
                <p className="text-xs font-black uppercase tracking-[0.16em] text-white/35">You vs HSAKAA</p>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-white/6 p-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/25">When followed</p>
                  <p className="mt-1 text-lg font-black text-white/62">{analytics.choicesVsHsakaa.followed.count}</p>
                  <p className="mt-1 text-[10px] text-white/28">
                    {analytics.choicesVsHsakaa.followed.positive} positive · {analytics.choicesVsHsakaa.followed.mixed} mixed · {analytics.choicesVsHsakaa.followed.negative} negative
                  </p>
                </div>
                <div className="rounded-xl border border-white/6 p-3">
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/25">When not followed</p>
                  <p className="mt-1 text-lg font-black text-white/62">{analytics.choicesVsHsakaa.notFollowed.count}</p>
                  <p className="mt-1 text-[10px] text-white/28">
                    {analytics.choicesVsHsakaa.notFollowed.positive} positive · {analytics.choicesVsHsakaa.notFollowed.mixed} mixed · {analytics.choicesVsHsakaa.notFollowed.negative} negative
                  </p>
                </div>
              </div>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div className="rounded-xl border border-sky-300/10 bg-sky-300/[0.02] p-3">
                  <div className="flex items-center gap-2 text-sky-200/55"><TrendingUp className="h-3.5 w-3.5" /><span className="text-[10px] font-black uppercase tracking-[0.1em]">You beat HSAKAA</span></div>
                  <p className="mt-1 text-lg font-black text-white/60">{analytics.choicesVsHsakaa.userOutperformedCount}</p>
                </div>
                <div className="rounded-xl border border-amber-300/10 bg-amber-300/[0.02] p-3">
                  <div className="flex items-center gap-2 text-amber-200/55"><BrainCircuit className="h-3.5 w-3.5" /><span className="text-[10px] font-black uppercase tracking-[0.1em]">HSAKAA beat choice</span></div>
                  <p className="mt-1 text-lg font-black text-white/60">{analytics.choicesVsHsakaa.hsakaaOutperformedCount}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <SegmentTable title="Performance by horizon" items={analytics.performance.byHorizon} />
            <SegmentTable title="Performance by reversibility" items={analytics.performance.byReversibility} />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-[22px] border border-white/8 bg-black/15 p-4">
              <div className="flex items-center gap-2"><FlaskConical className="h-4 w-4 text-[#C6FF32]/60" /><p className="text-xs font-black uppercase tracking-[0.14em] text-white/35">Experiments</p></div>
              <p className="mt-3 text-2xl font-black text-white/65">{percent(analytics.experiments.winRate)}</p>
              <p className="mt-1 text-[10px] text-white/25">supported / conclusive experiments</p>
              <p className="mt-3 text-xs leading-5 text-white/32">
                {analytics.experiments.resultCounts.supported} supported · {analytics.experiments.resultCounts.mixed} mixed · {analytics.experiments.resultCounts.failed} failed · {analytics.experiments.resultCounts.inconclusive} inconclusive
              </p>
            </div>
            <div className="rounded-[22px] border border-white/8 bg-black/15 p-4">
              <div className="flex items-center gap-2"><Clock3 className="h-4 w-4 text-[#C6FF32]/60" /><p className="text-xs font-black uppercase tracking-[0.14em] text-white/35">Decision speed</p></div>
              <p className="mt-3 text-2xl font-black text-white/65">{compactDurationHours(analytics.timing.averageDecisionToCommitHours)}</p>
              <p className="mt-1 text-[10px] text-white/25">analysis → commitment · n={analytics.timing.samples.decisionToCommit}</p>
              <p className="mt-3 text-sm font-black text-white/48">{compactDurationDays(analytics.timing.averageCommitmentToReviewDays)}</p>
              <p className="mt-1 text-[10px] text-white/25">commitment → final review · n={analytics.timing.samples.commitmentToReview}</p>
            </div>
            <div className="rounded-[22px] border border-white/8 bg-black/15 p-4">
              <div className="flex items-center gap-2"><Target className="h-4 w-4 text-[#C6FF32]/60" /><p className="text-xs font-black uppercase tracking-[0.14em] text-white/35">Calibration labels</p></div>
              <div className="mt-3 space-y-1.5 text-xs text-white/38">
                <p>Well calibrated <span className="float-right font-black text-white/55">{analytics.calibrationCounts.well_calibrated}</span></p>
                <p>Overconfident <span className="float-right font-black text-rose-300/60">{analytics.calibrationCounts.overconfident}</span></p>
                <p>Underconfident <span className="float-right font-black text-sky-300/60">{analytics.calibrationCounts.underconfident}</span></p>
                <p>Not enough evidence <span className="float-right font-black text-white/45">{analytics.calibrationCounts.not_enough_evidence}</span></p>
              </div>
            </div>
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-[22px] border border-white/8 bg-black/15 p-4">
              <div className="flex items-center gap-2"><CircleAlert className="h-4 w-4 text-rose-300/55" /><p className="text-xs font-black uppercase tracking-[0.14em] text-white/35">Failed assumption patterns</p></div>
              {analytics.recurringFailedAssumptions.length ? (
                <div className="mt-3 space-y-2.5">
                  {analytics.recurringFailedAssumptions.slice(0, 6).map((item) => (
                    <div key={`${item.statement}-${item.occurrences}`} className="rounded-xl border border-white/6 p-3">
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-xs font-bold leading-5 text-white/48">{item.statement}</p>
                        <span className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-black uppercase ${item.recurring ? "border-rose-300/12 text-rose-200/55" : "border-white/8 text-white/25"}`}>
                          {item.occurrences}×
                        </span>
                      </div>
                      <p className="mt-1 text-[10px] text-white/22">
                        {item.invalidatedCount} invalidated · {item.weakenedCount} weakened · {item.failedExperimentCount} failed tests
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-xs leading-5 text-white/28">No weakened or invalidated assumption history yet.</p>
              )}
            </div>

            <div className="rounded-[22px] border border-white/8 bg-black/15 p-4">
              <div className="flex items-center gap-2"><Activity className="h-4 w-4 text-[#C6FF32]/60" /><p className="text-xs font-black uppercase tracking-[0.14em] text-white/35">Calibration trend</p></div>
              {analytics.calibrationTrend.length ? (
                <div className="mt-3 space-y-2.5">
                  {analytics.calibrationTrend.map((item) => (
                    <div key={item.month} className="grid grid-cols-[70px_1fr_auto] items-center gap-3 text-[10px]">
                      <span className="font-black text-white/35">{item.month}</span>
                      <div className="h-1.5 overflow-hidden rounded-full bg-white/5">
                        <div className="h-full rounded-full bg-[#C6FF32]/50" style={{ width: `${Math.max(0, Math.min(100, item.recommendationSuccessRate * 100))}%` }} />
                      </div>
                      <span className={toneForGap(item.calibrationGap)}>{percent(item.recommendationSuccessRate)} / {percent(item.averageConfidence)}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-xs leading-5 text-white/28">Trend appears after final outcome reviews are recorded.</p>
              )}
            </div>
          </div>

          <div className="flex items-start gap-2 rounded-xl border border-white/6 bg-white/[0.01] p-3 text-[10px] leading-4 text-white/22">
            <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            <p>{analytics.definitions.note} Confidence-band success uses: {analytics.definitions.recommendationScore}.</p>
          </div>
        </div>
      ) : null}
    </section>
  );
}
