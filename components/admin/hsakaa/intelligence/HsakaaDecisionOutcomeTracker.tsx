"use client";

import {
  CheckCircle2,
  CircleAlert,
  Gauge,
  Loader2,
  RotateCcw,
  Target,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import {
  evaluatePrivateHsakaaDecisionOutcome,
  getPrivateHsakaaDecisionCalibration,
  recordPrivateHsakaaDecisionCommitment,
  reschedulePrivateHsakaaDecisionReview,
  type HsakaaDecisionCalibrationSummary,
  type HsakaaDecisionOutcomeStatus,
  type HsakaaDecisionResponse,
} from "@/services/hsakaa.service";

const TIMEZONE = "Asia/Kolkata";

function titleCase(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (item) => item.toUpperCase());
}

function formatDate(value?: string | null) {
  if (!value) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: TIMEZONE,
  }).format(new Date(value));
}

function dateInputValue(value?: string | null) {
  if (!value) return "";
  const parts = new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    timeZone: TIMEZONE,
  }).formatToParts(new Date(value));
  const get = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((part) => part.type === type)?.value ?? "";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function toApiDate(value: string) {
  return `${value}T00:00:00+05:30`;
}

function percent(value: number | null) {
  return value === null ? "—" : `${Math.round(value * 100)}%`;
}

function SmallList({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/25">{title}</p>
      <ul className="mt-2 space-y-1.5 text-xs leading-5 text-white/40">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}

export function HsakaaDecisionOutcomeTracker({
  decision,
  onUpdated,
}: {
  decision: HsakaaDecisionResponse | null;
  onUpdated: (decision: HsakaaDecisionResponse) => void | Promise<void>;
}) {
  const [calibration, setCalibration] = useState<HsakaaDecisionCalibrationSummary | null>(null);
  const [choice, setChoice] = useState("");
  const [rationale, setRationale] = useState("");
  const [reviewAt, setReviewAt] = useState("");
  const [outcomeStatus, setOutcomeStatus] = useState<HsakaaDecisionOutcomeStatus>("too_early");
  const [outcomeSummary, setOutcomeSummary] = useState("");
  const [evidenceNotes, setEvidenceNotes] = useState("");
  const [isCommitting, setIsCommitting] = useState(false);
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isRescheduling, setIsRescheduling] = useState(false);
  const [error, setError] = useState("");

  const loadCalibration = useCallback(async () => {
    try {
      setCalibration(await getPrivateHsakaaDecisionCalibration());
    } catch {
      // Calibration is supplemental; Decision Lab remains usable.
    }
  }, []);

  useEffect(() => {
    void loadCalibration();
  }, [loadCalibration]);

  useEffect(() => {
    if (!decision) return;
    setChoice(
      decision.commitment?.optionId ??
        decision.analysis.recommendation.optionId ??
        decision.options[0]?.id ??
        "",
    );
    setRationale(decision.commitment?.rationale ?? "");
    setReviewAt(dateInputValue(decision.commitment?.reviewAt));
    setOutcomeStatus(decision.outcome?.status ?? "too_early");
    setOutcomeSummary(decision.outcome?.summary ?? "");
    setEvidenceNotes(decision.outcome?.evidenceNotes.join("\n") ?? "");
    setError("");
  }, [decision]);

  const labels = useMemo(
    () => new Map(decision?.options.map((item) => [item.id, item.label]) ?? []),
    [decision],
  );

  async function recordChoice(event: FormEvent) {
    event.preventDefault();
    if (!decision?.id || !choice) return;
    setError("");
    setIsCommitting(true);
    try {
      const updated = await recordPrivateHsakaaDecisionCommitment(decision.id, {
        optionId: choice,
        rationale: rationale.trim() || undefined,
        reviewAt: reviewAt ? toApiDate(reviewAt) : undefined,
      });
      await onUpdated(updated);
      await loadCalibration();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not record the decision choice.");
    } finally {
      setIsCommitting(false);
    }
  }

  async function rescheduleReview(event: FormEvent) {
    event.preventDefault();
    if (!decision?.id || !decision.commitment) return;
    if (!reviewAt) {
      setError("Choose the next review date first.");
      return;
    }
    setError("");
    setIsRescheduling(true);
    try {
      const updated = await reschedulePrivateHsakaaDecisionReview(
        decision.id,
        toApiDate(reviewAt),
      );
      await onUpdated(updated);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not reschedule the review.");
    } finally {
      setIsRescheduling(false);
    }
  }

  async function evaluateOutcome(event: FormEvent) {
    event.preventDefault();
    if (!decision?.id || !decision.commitment) return;
    if (!outcomeSummary.trim()) {
      setError("Describe what actually happened before asking HSAKAA to evaluate it.");
      return;
    }
    setError("");
    setIsEvaluating(true);
    try {
      const updated = await evaluatePrivateHsakaaDecisionOutcome(decision.id, {
        status: outcomeStatus,
        summary: outcomeSummary.trim(),
        evidenceNotes: evidenceNotes
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
      });
      await onUpdated(updated);
      await loadCalibration();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not evaluate the outcome.");
    } finally {
      setIsEvaluating(false);
    }
  }

  return (
    <div className="space-y-4">
      {calibration && calibration.committedCount > 0 ? (
        <section className="rounded-[22px] border border-white/10 bg-black/15 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2 text-[#C6FF32]">
                <Gauge className="h-4 w-4" />
                <p className="text-xs font-black uppercase tracking-[0.16em]">Decision calibration</p>
              </div>
              <p className="mt-1 text-xs leading-5 text-white/35">
                Learning from recorded choices and reviewed outcomes. Sample quality: {calibration.sampleQuality}.
              </p>
            </div>
            <span className="rounded-xl border border-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white/35">
              {calibration.reviewedCount} reviewed
            </span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
            <div className="rounded-2xl border border-white/8 bg-white/[0.015] p-3">
              <p className="text-[10px] uppercase text-white/25">Committed</p>
              <p className="mt-1 text-xl font-black text-white/65">{calibration.committedCount}</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.015] p-3">
              <p className="text-[10px] uppercase text-white/25">Pending review</p>
              <p className="mt-1 text-xl font-black text-white/65">{calibration.pendingReviewCount}</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.015] p-3">
              <p className="text-[10px] uppercase text-white/25">Followed recommendation</p>
              <p className="mt-1 text-xl font-black text-white/65">{percent(calibration.recommendationFollowedRate)}</p>
            </div>
            <div className="rounded-2xl border border-white/8 bg-white/[0.015] p-3">
              <p className="text-[10px] uppercase text-white/25">Avg baseline confidence</p>
              <p className="mt-1 text-xl font-black text-white/65">{percent(calibration.averageBaselineConfidence)}</p>
            </div>
          </div>
          {calibration.reviewedCount < 4 ? (
            <p className="mt-3 text-[10px] leading-4 text-white/20">
              Too few reviewed decisions for strong statistical conclusions. Treat these numbers as a learning log, not a performance score.
            </p>
          ) : null}
        </section>
      ) : null}

      {decision?.id ? (
        <section className="rounded-[22px] border border-[#C6FF32]/12 bg-[#C6FF32]/[0.02] p-4 md:p-5">
          <div className="flex items-start gap-3">
            <Target className="mt-0.5 h-4 w-4 shrink-0 text-[#C6FF32]" />
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#C6FF32]/65">Close the decision loop</p>
              <p className="mt-1 text-sm leading-6 text-white/40">
                Record what you actually chose, then come back when enough happened to judge the outcome. This freezes the original recommendation as the calibration baseline.
              </p>
            </div>
          </div>

          {!decision.commitment ? (
            <form onSubmit={recordChoice} className="mt-4 grid gap-3 rounded-2xl border border-white/8 bg-black/15 p-4">
              <label className="grid gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.14em] text-white/30">What did you choose?</span>
                <select
                  value={choice}
                  onChange={(event) => setChoice(event.target.value)}
                  className="rounded-xl border border-white/10 bg-[#080b0d] px-3 py-2.5 text-sm text-white/70 outline-none"
                >
                  {decision.options.map((option) => (
                    <option key={option.id} value={option.id}>{option.label}</option>
                  ))}
                </select>
              </label>
              <label className="grid gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.14em] text-white/30">Why did you choose it? — optional</span>
                <textarea
                  value={rationale}
                  onChange={(event) => setRationale(event.target.value)}
                  rows={2}
                  placeholder="What tipped the decision in practice?"
                  className="rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm text-white/60 outline-none placeholder:text-white/20"
                />
              </label>
              <label className="grid max-w-xs gap-2">
                <span className="text-[10px] font-black uppercase tracking-[0.14em] text-white/30">Review on — optional</span>
                <input
                  type="date"
                  value={reviewAt}
                  onChange={(event) => setReviewAt(event.target.value)}
                  className="rounded-xl border border-white/10 bg-[#080b0d] px-3 py-2.5 text-sm text-white/60 outline-none"
                />
              </label>
              <button
                type="submit"
                disabled={isCommitting}
                className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#C6FF32] px-4 py-2.5 text-xs font-black text-black disabled:opacity-50"
              >
                {isCommitting ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <CheckCircle2 className="h-3.5 w-3.5" />}
                Record my choice
              </button>
            </form>
          ) : (
            <div className="mt-4 space-y-4">
              <div className="rounded-2xl border border-white/8 bg-black/15 p-4">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/25">Recorded choice</p>
                    <p className="mt-1 text-lg font-black text-white/70">{labels.get(decision.commitment.optionId) ?? decision.commitment.optionId}</p>
                    {decision.commitment.rationale ? <p className="mt-1 text-xs leading-5 text-white/35">{decision.commitment.rationale}</p> : null}
                  </div>
                  <div className="text-right text-[10px] leading-5 text-white/25">
                    <p>Chosen {formatDate(decision.commitment.committedAt)}</p>
                    {decision.commitment.reviewAt ? <p>Review {formatDate(decision.commitment.reviewAt)}</p> : null}
                  </div>
                </div>
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  <div className="rounded-xl bg-white/[0.015] p-3 text-xs text-white/35">
                    Baseline recommendation: <span className="font-bold text-white/55">{decision.commitment.baselineRecommendationOptionId ? labels.get(decision.commitment.baselineRecommendationOptionId) ?? decision.commitment.baselineRecommendationOptionId : "No clear winner"}</span>
                  </div>
                  <div className="rounded-xl bg-white/[0.015] p-3 text-xs text-white/35">
                    Baseline confidence: <span className="font-bold text-white/55">{percent(decision.commitment.baselineRecommendationConfidence)}</span>
                  </div>
                </div>
                <p className="mt-2 text-[10px] text-white/20">Original analysis is now locked so later learning cannot rewrite the prediction after the fact.</p>

                {!decision.outcome || decision.outcome.status === "too_early" ? (
                  <form onSubmit={rescheduleReview} className="mt-3 flex flex-col gap-2 border-t border-white/6 pt-3 sm:flex-row sm:items-end">
                    <label className="grid flex-1 gap-1.5">
                      <span className="text-[10px] font-black uppercase tracking-[0.12em] text-white/25">
                        {decision.outcome?.status === "too_early" ? "Next review date" : "Review date"}
                      </span>
                      <input
                        type="date"
                        value={reviewAt}
                        onChange={(event) => setReviewAt(event.target.value)}
                        className="h-10 rounded-xl border border-white/10 bg-[#080b0d] px-3 text-xs text-white/60 outline-none focus:border-[#C6FF32]/30"
                      />
                    </label>
                    <button
                      type="submit"
                      disabled={isRescheduling || !reviewAt}
                      className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 px-3 text-[10px] font-black uppercase tracking-[0.1em] text-white/45 transition hover:border-[#C6FF32]/20 hover:text-[#C6FF32] disabled:opacity-40"
                    >
                      {isRescheduling ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
                      {decision.commitment.reviewAt ? "Reschedule" : "Schedule review"}
                    </button>
                  </form>
                ) : null}
              </div>

              <form onSubmit={evaluateOutcome} className="grid gap-3 rounded-2xl border border-white/8 bg-black/15 p-4">
                <div className="flex items-center justify-between gap-3">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-white/35">{decision.outcome ? "Update outcome review" : "Review the outcome"}</p>
                  {decision.outcome ? <span className="text-[10px] text-white/20">Last reviewed {formatDate(decision.outcome.recordedAt)}</span> : null}
                </div>
                <label className="grid max-w-xs gap-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.14em] text-white/25">Your outcome status</span>
                  <select
                    value={outcomeStatus}
                    onChange={(event) => setOutcomeStatus(event.target.value as HsakaaDecisionOutcomeStatus)}
                    className="rounded-xl border border-white/10 bg-[#080b0d] px-3 py-2.5 text-sm text-white/65 outline-none"
                  >
                    <option value="positive">Positive</option>
                    <option value="mixed">Mixed</option>
                    <option value="negative">Negative</option>
                    <option value="too_early">Too early</option>
                    <option value="abandoned">Abandoned</option>
                  </select>
                </label>
                <label className="grid gap-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.14em] text-white/25">What actually happened?</span>
                  <textarea
                    value={outcomeSummary}
                    onChange={(event) => setOutcomeSummary(event.target.value)}
                    rows={3}
                    placeholder="Describe the result in concrete terms."
                    className="rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm text-white/60 outline-none placeholder:text-white/20"
                  />
                </label>
                <label className="grid gap-2">
                  <span className="text-[10px] font-black uppercase tracking-[0.14em] text-white/25">Evidence notes — optional, one per line</span>
                  <textarea
                    value={evidenceNotes}
                    onChange={(event) => setEvidenceNotes(event.target.value)}
                    rows={2}
                    placeholder={"Metric/result that changed\nWhat surprised you"}
                    className="rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-xs text-white/55 outline-none placeholder:text-white/20"
                  />
                </label>
                <button
                  type="submit"
                  disabled={isEvaluating}
                  className="inline-flex w-fit items-center gap-2 rounded-xl border border-[#C6FF32]/25 bg-[#C6FF32]/10 px-4 py-2.5 text-xs font-black text-[#C6FF32] disabled:opacity-50"
                >
                  {isEvaluating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RotateCcw className="h-3.5 w-3.5" />}
                  {decision.outcome ? "Re-evaluate outcome" : "Evaluate outcome"}
                </button>
              </form>

              {decision.outcome ? (
                <div className="rounded-2xl border border-white/8 bg-white/[0.015] p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#C6FF32]/55">HSAKAA outcome review</p>
                      <p className="mt-1 text-sm font-black text-white/65">{titleCase(decision.outcome.evaluation.verdict)}</p>
                    </div>
                    <span className="rounded-xl border border-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white/40">
                      {titleCase(decision.outcome.evaluation.calibration)}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-6 text-white/45">{decision.outcome.evaluation.summary}</p>
                  <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                    <SmallList title="What worked" items={decision.outcome.evaluation.whatWorked} />
                    <SmallList title="What didn't" items={decision.outcome.evaluation.whatDidnt} />
                    <SmallList title="Surprises" items={decision.outcome.evaluation.surprises} />
                    <SmallList title="Lessons" items={decision.outcome.evaluation.lessons} />
                    <SmallList title="Future adjustments" items={decision.outcome.evaluation.futureAdjustments} />
                  </div>
                  {decision.outcome.evaluation.evidence.length ? (
                    <div className="mt-4">
                      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/25">Evidence used</p>
                      <div className="mt-2 grid gap-2 md:grid-cols-2">
                        {decision.outcome.evaluation.evidence.map((item, index) => (
                          <div key={`${item.source}-${item.label}-${index}`} className="rounded-xl border border-white/8 bg-black/15 p-3">
                            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/20">{item.source}</p>
                            <p className="mt-1 text-xs font-bold text-white/50">{item.label}</p>
                            <p className="mt-1 text-xs leading-5 text-white/30">{item.detail}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  ) : null}
                  <p className="mt-4 rounded-xl border border-[#C6FF32]/10 bg-[#C6FF32]/[0.025] p-3 text-xs leading-5 text-white/40">
                    <span className="font-black text-[#C6FF32]/65">Ask next:</span> {decision.outcome.evaluation.nextPrompt}
                  </p>
                </div>
              ) : null}
            </div>
          )}

          {error ? (
            <div className="mt-3 flex items-start gap-2 rounded-xl border border-rose-400/15 bg-rose-400/5 px-3 py-2 text-xs text-rose-200/70">
              <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
              {error}
            </div>
          ) : null}
        </section>
      ) : null}
    </div>
  );
}
