"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  BellRing,
  BookOpen,
  Building2,
  Check,
  CheckCircle2,
  Clock3,
  HeartPulse,
  Loader2,
  MessageCircle,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Target,
  X,
} from "lucide-react";

import {
  decideProactiveAction,
  generateProactiveReview,
  getProactiveDashboard,
  getProactivePolicy,
  getProactiveReviews,
  getProactiveSignals,
  markProactiveReviewReviewed,
  runProactiveScan,
  updateProactiveSignalStatus,
} from "@/lib/api/proactive-os";
import type {
  ProactiveDashboard,
  ProactivePolicy,
  ProactiveReview,
  ProactiveReviewPeriod,
  ProactiveSignal,
  ProactiveSignalCategory,
  ProactiveSignalSeverity,
  ProactiveSignalStatus,
} from "@/types/proactive-os";

const CATEGORY_LABELS: Record<ProactiveSignalCategory, string> = {
  forgotten_commitment: "Forgotten commitment",
  quiet_relationship: "Quiet relationship",
  unresolved_decision: "Unresolved decision",
  repeatedly_deferred_task: "Repeatedly deferred task",
  health_trend: "Health trend",
  reading_resurface: "Reading resurfacing",
  company_risk: "Company risk",
  company_opportunity: "Company opportunity",
  journal_pattern: "Journal pattern",
  media_attention: "Media attention",
  general_attention: "General attention",
};

const SEVERITIES: ProactiveSignalSeverity[] = ["critical", "high", "medium", "low"];
const STATUSES: ProactiveSignalStatus[] = [
  "open",
  "acknowledged",
  "snoozed",
  "resolved",
  "dismissed",
];
const PERIODS: ProactiveReviewPeriod[] = ["daily", "weekly", "monthly"];

export function ProactiveOsWorkspace() {
  const [policy, setPolicy] = useState<ProactivePolicy | null>(null);
  const [dashboard, setDashboard] = useState<ProactiveDashboard | null>(null);
  const [signals, setSignals] = useState<ProactiveSignal[]>([]);
  const [reviews, setReviews] = useState<ProactiveReview[]>([]);
  const [selectedReview, setSelectedReview] = useState<ProactiveReview | null>(null);
  const [status, setStatus] = useState<ProactiveSignalStatus | "all">("all");
  const [severity, setSeverity] = useState<ProactiveSignalSeverity | "all">("all");
  const [category, setCategory] = useState<ProactiveSignalCategory | "all">("all");
  const [reviewPeriod, setReviewPeriod] = useState<ProactiveReviewPeriod>("daily");
  const [lookbackDays, setLookbackDays] = useState(120);
  const [loading, setLoading] = useState<string | null>("initial");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const categoryOptions = useMemo(
    () => Object.keys(CATEGORY_LABELS) as ProactiveSignalCategory[],
    [],
  );

  const loadAll = useCallback(async () => {
    setLoading("initial");
    setError(null);
    try {
      const [nextPolicy, nextDashboard, signalList, reviewList] = await Promise.all([
        getProactivePolicy(),
        getProactiveDashboard(),
        getProactiveSignals({ limit: 120 }),
        getProactiveReviews({ limit: 30 }),
      ]);
      setPolicy(nextPolicy);
      setDashboard(nextDashboard);
      setSignals(signalList.items);
      setReviews(reviewList.items);
      setSelectedReview((current) => current ?? reviewList.items[0] ?? null);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load Proactive OS.");
    } finally {
      setLoading(null);
    }
  }, []);

  useEffect(() => {
    void loadAll();
  }, [loadAll]);

  const refreshSignals = useCallback(async () => {
    const result = await getProactiveSignals({
      status: status === "all" ? undefined : status,
      severity: severity === "all" ? undefined : severity,
      category: category === "all" ? undefined : category,
      limit: 120,
    });
    setSignals(result.items);
  }, [category, severity, status]);

  useEffect(() => {
    if (loading === "initial") return;
    void refreshSignals().catch((cause) => {
      setError(cause instanceof Error ? cause.message : "Could not filter signals.");
    });
  }, [loading, refreshSignals]);

  async function scan() {
    setLoading("scan");
    setError(null);
    setNotice(null);
    try {
      const result = await runProactiveScan({ lookbackDays, maxEvidence: 60 });
      setNotice(
        result.skipped
          ? result.scanSummary
          : `${result.detected} attention signal${result.detected === 1 ? "" : "s"} detected. ${result.scanSummary}`,
      );
      await loadAll();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Proactive scan failed.");
    } finally {
      setLoading(null);
    }
  }

  async function generateReview(period: ProactiveReviewPeriod) {
    setLoading(`review-${period}`);
    setError(null);
    setNotice(null);
    try {
      const result = await generateProactiveReview({ period, force: true });
      setSelectedReview(result);
      setReviewPeriod(period);
      const list = await getProactiveReviews({ limit: 30 });
      setReviews(list.items);
      setNotice(`${formatLabel(period)} review generated.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Review generation failed.");
    } finally {
      setLoading(null);
    }
  }

  async function setSignalStatus(
    signal: ProactiveSignal,
    nextStatus: ProactiveSignalStatus,
    snoozeDays?: number,
  ) {
    setLoading(`signal-${signal._id}`);
    setError(null);
    try {
      await updateProactiveSignalStatus(signal._id, {
        status: nextStatus,
        snoozeDays,
      });
      await loadAll();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Signal update failed.");
    } finally {
      setLoading(null);
    }
  }

  async function decideAction(signal: ProactiveSignal, decision: "approve" | "reject") {
    setLoading(`action-${signal._id}`);
    setError(null);
    setNotice(null);
    try {
      const result = await decideProactiveAction(signal._id, decision);
      setNotice(result.execution.reason);
      await loadAll();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Action decision failed.");
    } finally {
      setLoading(null);
    }
  }

  async function markReview(review: ProactiveReview) {
    setLoading(`mark-${review._id}`);
    setError(null);
    try {
      const next = await markProactiveReviewReviewed(review._id);
      setSelectedReview(next);
      setReviews((current) => current.map((item) => (item._id === next._id ? next : item)));
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not mark review as reviewed.");
    } finally {
      setLoading(null);
    }
  }

  if (loading === "initial" && !dashboard) {
    return (
      <div className="grid min-h-[320px] place-items-center rounded-[28px] border border-white/10 bg-white/[0.025]">
        <div className="flex items-center gap-3 text-sm font-bold text-white/50">
          <Loader2 className="h-5 w-5 animate-spin text-[#C6FF32]" />
          Loading Proactive OS…
        </div>
      </div>
    );
  }

  return (
    <section className="space-y-5">
      <div className="grid gap-4 xl:grid-cols-[1.3fr_1fr]">
        <div className="rounded-[28px] border border-[#C6FF32]/15 bg-[#C6FF32]/[0.035] p-5 md:p-6">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#C6FF32] text-black">
              <BellRing className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-black text-white">Proactive attention engine</p>
                <span className="rounded-full border border-[#C6FF32]/20 bg-[#C6FF32]/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#C6FF32]">
                  Phase 11
                </span>
              </div>
              <p className="mt-2 text-sm leading-6 text-white/45">
                HSAKAA scans the unified Personal OS context for meaningful changes, stale loops, risks, opportunities, repeated patterns, and things worth resurfacing before you explicitly ask.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.025] p-5 md:p-6">
          <div className="flex items-start gap-3">
            <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0 text-[#C6FF32]" />
            <div>
              <p className="font-bold text-white">Confirmation-controlled autonomy</p>
              <p className="mt-2 text-xs leading-5 text-white/40">
                Detection and briefings can run automatically. Consequential cross-domain actions are never executed by this engine without explicit owner confirmation.
              </p>
              {policy && (
                <p className="mt-2 text-[11px] font-bold text-white/25">
                  {policy.timezone} · {policy.schedules.scan}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-400/20 bg-red-400/5 px-4 py-3 text-sm text-red-200">
          {error}
        </div>
      )}
      {notice && (
        <div className="rounded-2xl border border-[#C6FF32]/20 bg-[#C6FF32]/5 px-4 py-3 text-sm text-[#C6FF32]">
          {notice}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Open signals" value={dashboard?.summary.totalOpen ?? 0} icon={BellRing} />
        <StatCard label="High priority" value={dashboard?.summary.highPriority ?? 0} icon={AlertTriangle} />
        <StatCard label="Attention now" value={dashboard?.summary.activeNow ?? 0} icon={Target} />
        <StatCard label="Reviews stored" value={reviews.length} icon={CheckCircle2} />
      </div>

      <div className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.025] p-5 md:p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-white/35">Run attention scan</p>
              <h2 className="mt-2 text-xl font-black tracking-[-0.03em] text-white">Refresh what deserves attention</h2>
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/40">
                Uses the Phase 10 Context Engine across all domains, then stores only grounded signals with valid evidence citations.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <select
                value={lookbackDays}
                onChange={(event: React.ChangeEvent<HTMLSelectElement>) => setLookbackDays(Number(event.currentTarget.value))}
                className="min-h-11 rounded-xl border border-white/10 bg-[#090d0f] px-3 text-sm text-white outline-none"
              >
                <option value={30}>Look back 30 days</option>
                <option value={60}>Look back 60 days</option>
                <option value={120}>Look back 120 days</option>
                <option value={180}>Look back 180 days</option>
                <option value={365}>Look back 1 year</option>
              </select>
              <button
                type="button"
                onClick={() => void scan()}
                disabled={loading !== null}
                className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#C6FF32] px-4 text-xs font-black uppercase tracking-[0.12em] text-black disabled:opacity-50"
              >
                {loading === "scan" ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                Scan now
              </button>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.025] p-5 md:p-6">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-white/35">Review cadence</p>
          <div className="mt-4 grid grid-cols-3 gap-2">
            {PERIODS.map((period) => (
              <button
                key={period}
                type="button"
                onClick={() => void generateReview(period)}
                disabled={loading !== null}
                className="rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-xs font-bold text-white/55 transition hover:border-[#C6FF32]/30 hover:text-white disabled:opacity-50"
              >
                {loading === `review-${period}` ? <Loader2 className="mx-auto h-4 w-4 animate-spin" /> : formatLabel(period)}
              </button>
            ))}
          </div>
          <p className="mt-3 text-xs leading-5 text-white/30">
            Daily, weekly, and monthly reviews are also materialised automatically on the owner timezone schedule.
          </p>
        </div>
      </div>

      <div className="rounded-[28px] border border-white/10 bg-white/[0.025] p-5 md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-white/35">Attention queue</p>
            <h2 className="mt-2 text-xl font-black tracking-[-0.03em] text-white">Signals across your whole OS</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <FilterSelect
              value={status}
              onChange={(value) => setStatus(value as ProactiveSignalStatus | "all")}
              options={["all", ...STATUSES]}
              prefix="Status"
            />
            <FilterSelect
              value={severity}
              onChange={(value) => setSeverity(value as ProactiveSignalSeverity | "all")}
              options={["all", ...SEVERITIES]}
              prefix="Severity"
            />
            <select
              value={category}
              onChange={(event: React.ChangeEvent<HTMLSelectElement>) => setCategory(event.currentTarget.value as ProactiveSignalCategory | "all")}
              className="min-h-10 rounded-xl border border-white/10 bg-[#090d0f] px-3 text-xs font-bold text-white/60 outline-none"
            >
              <option value="all">Category · All</option>
              {categoryOptions.map((item) => (
                <option key={item} value={item}>
                  {CATEGORY_LABELS[item]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-5 space-y-3">
          {signals.length === 0 ? (
            <EmptyState text="No signals match these filters." />
          ) : (
            signals.map((signal) => (
              <SignalCard
                key={signal._id}
                signal={signal}
                busy={loading === `signal-${signal._id}` || loading === `action-${signal._id}`}
                onStatus={setSignalStatus}
                onAction={decideAction}
              />
            ))
          )}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[0.75fr_1.25fr]">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.025] p-5 md:p-6">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-white/35">Review history</p>
              <h2 className="mt-2 text-xl font-black tracking-[-0.03em] text-white">Briefings & reviews</h2>
            </div>
            <select
              value={reviewPeriod}
              onChange={(event: React.ChangeEvent<HTMLSelectElement>) => setReviewPeriod(event.currentTarget.value as ProactiveReviewPeriod)}
              className="min-h-10 rounded-xl border border-white/10 bg-[#090d0f] px-3 text-xs font-bold text-white/60 outline-none"
            >
              {PERIODS.map((period) => (
                <option key={period} value={period}>
                  {formatLabel(period)}
                </option>
              ))}
            </select>
          </div>
          <div className="mt-4 space-y-2">
            {reviews.filter((review) => review.period === reviewPeriod).length === 0 ? (
              <EmptyState text={`No ${reviewPeriod} reviews yet.`} />
            ) : (
              reviews
                .filter((review) => review.period === reviewPeriod)
                .map((review) => (
                  <button
                    key={review._id}
                    type="button"
                    onClick={() => setSelectedReview(review)}
                    className={`w-full rounded-2xl border p-4 text-left transition ${
                      selectedReview?._id === review._id
                        ? "border-[#C6FF32]/30 bg-[#C6FF32]/5"
                        : "border-white/10 bg-black/15 hover:border-white/20"
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <p className="line-clamp-1 text-sm font-bold text-white">{review.title}</p>
                      <span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase ${review.status === "reviewed" ? "bg-white/5 text-white/35" : "bg-[#C6FF32]/10 text-[#C6FF32]"}`}>
                        {review.status}
                      </span>
                    </div>
                    <p className="mt-2 text-xs text-white/30">{formatDate(review.periodStart)}</p>
                  </button>
                ))
            )}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.025] p-5 md:p-6">
          {selectedReview ? (
            <ReviewDetail
              review={selectedReview}
              busy={loading === `mark-${selectedReview._id}`}
              onMark={() => void markReview(selectedReview)}
            />
          ) : (
            <EmptyState text="Generate or select a review to inspect the briefing." />
          )}
        </div>
      </div>
    </section>
  );
}

function SignalCard({
  signal,
  busy,
  onStatus,
  onAction,
}: {
  signal: ProactiveSignal;
  busy: boolean;
  onStatus: (
    signal: ProactiveSignal,
    status: ProactiveSignalStatus,
    snoozeDays?: number,
  ) => Promise<void>;
  onAction: (signal: ProactiveSignal, decision: "approve" | "reject") => Promise<void>;
}) {
  const Icon = categoryIcon(signal.category);
  return (
    <article className="rounded-[24px] border border-white/10 bg-black/15 p-5">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div className="flex min-w-0 gap-3">
          <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.035]">
            <Icon className="h-4.5 w-4.5 text-[#C6FF32]" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-full border border-white/10 bg-white/[0.035] px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white/45">
                {CATEGORY_LABELS[signal.category]}
              </span>
              <SeverityBadge severity={signal.severity} />
              <span className="text-[11px] font-bold text-white/25">Priority {Math.round(signal.priorityScore * 100)}</span>
            </div>
            <h3 className="mt-2 text-base font-black text-white">{signal.title}</h3>
            <p className="mt-2 text-sm leading-6 text-white/48">{signal.summary}</p>
            <div className="mt-3 rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2.5">
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/28">Why now</p>
              <p className="mt-1 text-xs leading-5 text-white/43">{signal.whyNow}</p>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap gap-2 lg:max-w-[270px] lg:justify-end">
          {signal.status !== "acknowledged" && signal.status !== "resolved" && signal.status !== "dismissed" && (
            <SmallButton disabled={busy} onClick={() => void onStatus(signal, "acknowledged")} icon={Check} label="Acknowledge" />
          )}
          {signal.status !== "resolved" && signal.status !== "dismissed" && (
            <SmallButton disabled={busy} onClick={() => void onStatus(signal, "snoozed", 3)} icon={Clock3} label="Snooze 3d" />
          )}
          {signal.status !== "resolved" && (
            <SmallButton disabled={busy} onClick={() => void onStatus(signal, "resolved")} icon={CheckCircle2} label="Resolve" />
          )}
          {signal.status !== "dismissed" && (
            <SmallButton disabled={busy} onClick={() => void onStatus(signal, "dismissed")} icon={X} label="Dismiss" />
          )}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {signal.evidence.slice(0, 6).map((evidence) => (
          <span key={`${signal._id}-${evidence.citationId}`} className="rounded-lg border border-white/8 bg-white/[0.025] px-2.5 py-1.5 text-[11px] text-white/35">
            {evidence.citationId} · {evidence.label}
          </span>
        ))}
      </div>

      {signal.proposedAction && (
        <div className="mt-4 rounded-2xl border border-[#C6FF32]/12 bg-[#C6FF32]/[0.025] p-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-[#C6FF32]">Proposed next action</p>
                <span className="rounded-full bg-white/5 px-2 py-1 text-[10px] font-black uppercase text-white/35">
                  {formatLabel(signal.proposedAction.status)}
                </span>
              </div>
              <p className="mt-2 text-sm font-bold text-white">{signal.proposedAction.label}</p>
              <p className="mt-1 text-xs leading-5 text-white/38">{signal.proposedAction.reason}</p>
              {signal.proposedAction.consequential && (
                <p className="mt-2 text-[11px] font-bold text-amber-200/60">
                  Consequential action · explicit confirmation required · approval does not auto-execute it.
                </p>
              )}
            </div>
            {signal.proposedAction.status === "pending_confirmation" && (
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void onAction(signal, "approve")}
                  className="rounded-lg bg-[#C6FF32] px-3 py-2 text-[11px] font-black uppercase text-black disabled:opacity-50"
                >
                  Approve
                </button>
                <button
                  type="button"
                  disabled={busy}
                  onClick={() => void onAction(signal, "reject")}
                  className="rounded-lg border border-white/10 px-3 py-2 text-[11px] font-black uppercase text-white/45 disabled:opacity-50"
                >
                  Reject
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-white/25">
        <span>First seen {formatDate(signal.firstDetectedAt)}</span>
        <span>Last seen {formatDate(signal.lastDetectedAt)}</span>
        <span>Detected {signal.timesDetected}×</span>
        <span>Confidence {Math.round(signal.confidence * 100)}%</span>
        <span>{signal.generatedBy === "ai" ? "AI + evidence" : "Fallback detector"}</span>
      </div>
    </article>
  );
}

function ReviewDetail({ review, busy, onMark }: { review: ProactiveReview; busy: boolean; onMark: () => void }) {
  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full border border-[#C6FF32]/20 bg-[#C6FF32]/5 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#C6FF32]">
              {formatLabel(review.period)} review
            </span>
            <span className="text-[11px] text-white/25">{formatDate(review.periodStart)} → {formatDate(review.periodEnd)}</span>
          </div>
          <h2 className="mt-3 text-2xl font-black tracking-[-0.04em] text-white">{review.title}</h2>
          <p className="mt-3 text-sm leading-7 text-white/48">{review.summary}</p>
        </div>
        {review.status !== "reviewed" && (
          <button
            type="button"
            disabled={busy}
            onClick={onMark}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-white/50 disabled:opacity-50"
          >
            {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Check className="h-4 w-4" />}
            Mark reviewed
          </button>
        )}
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <ReviewSection title="Priorities" icon={Target} items={review.priorities} />
        <ReviewSection title="Wins" icon={CheckCircle2} items={review.wins} />
        <ReviewSection title="Patterns" icon={Sparkles} items={review.patterns} />
        <ReviewSection title="Watchlist" icon={AlertTriangle} items={review.watchlist} />
      </div>
      <div className="mt-4">
        <ReviewSection title="Recommendations" icon={BellRing} items={review.recommendations} />
      </div>
    </div>
  );
}

function ReviewSection({ title, icon: Icon, items }: { title: string; icon: React.ComponentType<{ className?: string }>; items: ProactiveReview["priorities"] }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/15 p-4">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-[#C6FF32]" />
        <p className="text-xs font-black uppercase tracking-[0.14em] text-white/45">{title}</p>
      </div>
      <div className="mt-3 space-y-3">
        {items.length === 0 ? (
          <p className="text-xs text-white/25">Nothing material in this section.</p>
        ) : (
          items.map((item, index) => (
            <div key={`${title}-${index}-${item.title}`} className="border-t border-white/8 pt-3 first:border-t-0 first:pt-0">
              <p className="text-sm font-bold text-white">{item.title}</p>
              <p className="mt-1 text-xs leading-5 text-white/38">{item.detail}</p>
              {item.citations.length > 0 && (
                <p className="mt-2 text-[10px] font-black uppercase tracking-[0.12em] text-[#C6FF32]/55">
                  {item.citations.join(" · ")}
                </p>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon: Icon }: { label: string; value: number; icon: React.ComponentType<{ className?: string }> }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.025] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/30">{label}</p>
          <p className="mt-2 text-2xl font-black text-white">{value}</p>
        </div>
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/[0.04]">
          <Icon className="h-4 w-4 text-[#C6FF32]" />
        </div>
      </div>
    </div>
  );
}

function SeverityBadge({ severity }: { severity: ProactiveSignalSeverity }) {
  const className =
    severity === "critical"
      ? "border-red-400/25 bg-red-400/10 text-red-200"
      : severity === "high"
        ? "border-amber-300/25 bg-amber-300/10 text-amber-100"
        : severity === "medium"
          ? "border-white/12 bg-white/[0.04] text-white/55"
          : "border-white/8 bg-white/[0.025] text-white/35";
  return <span className={`rounded-full border px-2 py-1 text-[10px] font-black uppercase ${className}`}>{severity}</span>;
}

function SmallButton({ disabled, onClick, icon: Icon, label }: { disabled: boolean; onClick: () => void; icon: React.ComponentType<{ className?: string }>; label: string }) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/[0.025] px-2.5 py-2 text-[11px] font-bold text-white/45 transition hover:text-white disabled:opacity-40"
    >
      {disabled ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Icon className="h-3.5 w-3.5" />}
      {label}
    </button>
  );
}

function FilterSelect({ value, onChange, options, prefix }: { value: string; onChange: (value: string) => void; options: string[]; prefix: string }) {
  return (
    <select
      value={value}
      onChange={(event: React.ChangeEvent<HTMLSelectElement>) => onChange(event.currentTarget.value)}
      className="min-h-10 rounded-xl border border-white/10 bg-[#090d0f] px-3 text-xs font-bold text-white/60 outline-none"
    >
      {options.map((option) => (
        <option key={option} value={option}>
          {prefix} · {formatLabel(option)}
        </option>
      ))}
    </select>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="rounded-2xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-white/30">
      {text}
    </div>
  );
}

function categoryIcon(category: ProactiveSignalCategory) {
  if (category === "health_trend") return HeartPulse;
  if (category === "company_risk" || category === "company_opportunity") return Building2;
  if (category === "reading_resurface") return BookOpen;
  if (category === "quiet_relationship") return MessageCircle;
  if (category === "forgotten_commitment" || category === "repeatedly_deferred_task") return Clock3;
  if (category === "unresolved_decision") return Target;
  if (category === "journal_pattern") return Sparkles;
  return BellRing;
}

function formatLabel(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}
