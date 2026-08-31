"use client";

import {
  Beaker,
  Check,
  ChevronRight,
  CircleAlert,
  ClipboardList,
  FlaskConical,
  History,
  Loader2,
  Plus,
  RefreshCw,
  Send,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import {
  addPrivateHsakaaDecisionEvidence,
  completePrivateHsakaaDecisionExperiment,
  createPrivateHsakaaDecisionExperiment,
  getPrivateHsakaaDecisionExperimentQueue,
  getPrivateHsakaaDecisionExperimentState,
  reassessPrivateHsakaaDecision,
  updatePrivateHsakaaDecisionAssumption,
  updatePrivateHsakaaDecisionExperimentStatus,
  type HsakaaDecisionAssumptionStatus,
  type HsakaaDecisionEvidenceKind,
  type HsakaaDecisionEvidenceStance,
  type HsakaaDecisionExperimentQueue,
  type HsakaaDecisionExperimentQueueItem,
  type HsakaaDecisionExperimentResult,
  type HsakaaDecisionExperimentState,
  type HsakaaDecisionExperimentStatus,
  type HsakaaDecisionResponse,
} from "@/services/hsakaa.service";

export type HsakaaDecisionExperimentDraftSeed = {
  title: string;
  description: string;
  supportsOptionIds: string[];
};

const ASSUMPTION_STATUSES: HsakaaDecisionAssumptionStatus[] = [
  "untested",
  "testing",
  "supported",
  "weakened",
  "invalidated",
];

const EXPERIMENT_STATUSES: HsakaaDecisionExperimentStatus[] = [
  "planned",
  "active",
  "awaiting_result",
  "cancelled",
];

function titleCase(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatDate(value?: string | null) {
  if (!value) return "Not scheduled";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown date";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function percent(value?: number | null) {
  if (value === null || value === undefined) return "Unrated";
  return `${Math.round(value * 100)}%`;
}

function optionLabel(decision: HsakaaDecisionResponse | null, optionId?: string | null) {
  if (!optionId) return "No clear option";
  return decision?.options.find((item) => item.id === optionId)?.label ?? optionId;
}

function QueueCard({
  item,
  onOpen,
}: {
  item: HsakaaDecisionExperimentQueueItem;
  onOpen: () => void;
}) {
  return (
    <article className="rounded-2xl border border-white/8 bg-white/[0.015] p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[9px] font-black uppercase tracking-[0.12em] text-white/20">
            {titleCase(item.experiment.status)} · {titleCase(item.horizon)} horizon
          </p>
          <p className="mt-1 text-sm font-black leading-5 text-white/60">
            {item.experiment.title}
          </p>
          <p className="mt-1 line-clamp-2 text-xs leading-5 text-white/30">
            {item.question}
          </p>
        </div>
        <button
          type="button"
          onClick={onOpen}
          className="inline-flex shrink-0 items-center gap-1 rounded-lg border border-white/8 px-2 py-1.5 text-[9px] font-black uppercase tracking-[0.1em] text-white/35 transition hover:border-[#C6FF32]/20 hover:text-[#C6FF32]"
        >
          Open <ChevronRight className="h-3 w-3" />
        </button>
      </div>
      <div className="mt-2 flex flex-wrap gap-2 text-[10px] text-white/25">
        <span>Review: {formatDate(item.experiment.targetReviewAt)}</span>
        {item.experiment.result ? <span>· {titleCase(item.experiment.result)}</span> : null}
      </div>
    </article>
  );
}

export function HsakaaDecisionExperimentTracker({
  decision,
  onOpenDecision,
  refreshKey = 0,
  draftSeed,
  draftSeedKey = 0,
}: {
  decision: HsakaaDecisionResponse | null;
  onOpenDecision: (decisionId: string) => void | Promise<void>;
  refreshKey?: number;
  draftSeed?: HsakaaDecisionExperimentDraftSeed | null;
  draftSeedKey?: number;
}) {
  const decisionId = decision?.id ?? "";
  const [queue, setQueue] = useState<HsakaaDecisionExperimentQueue | null>(null);
  const [state, setState] = useState<HsakaaDecisionExperimentState | null>(null);
  const [isQueueLoading, setIsQueueLoading] = useState(true);
  const [isStateLoading, setIsStateLoading] = useState(false);
  const [busyKey, setBusyKey] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [experimentTitle, setExperimentTitle] = useState("");
  const [experimentHypothesis, setExperimentHypothesis] = useState("");
  const [experimentDescription, setExperimentDescription] = useState("");
  const [successCriteria, setSuccessCriteria] = useState("");
  const [failureCriteria, setFailureCriteria] = useState("");
  const [targetReviewAt, setTargetReviewAt] = useState("");
  const [experimentAssumptionIds, setExperimentAssumptionIds] = useState<string[]>([]);
  const [experimentOptionIds, setExperimentOptionIds] = useState<string[]>([]);

  const [evidenceKind, setEvidenceKind] = useState<HsakaaDecisionEvidenceKind>("observation");
  const [evidenceStance, setEvidenceStance] = useState<HsakaaDecisionEvidenceStance>("neutral");
  const [evidenceDetail, setEvidenceDetail] = useState("");
  const [evidenceSource, setEvidenceSource] = useState("");
  const [metricLabel, setMetricLabel] = useState("");
  const [metricValue, setMetricValue] = useState("");
  const [evidenceExperimentId, setEvidenceExperimentId] = useState("");
  const [evidenceAssumptionIds, setEvidenceAssumptionIds] = useState<string[]>([]);

  const [completionDrafts, setCompletionDrafts] = useState<
    Record<string, { result: HsakaaDecisionExperimentResult; conclusion: string }>
  >({});
  const [assumptionDrafts, setAssumptionDrafts] = useState<
    Record<string, { status: HsakaaDecisionAssumptionStatus; confidence: string; note: string }>
  >({});
  const [reassessmentReason, setReassessmentReason] = useState("");
  const [forceReassessment, setForceReassessment] = useState(false);

  const loadQueue = useCallback(async () => {
    setIsQueueLoading(true);
    try {
      const response = await getPrivateHsakaaDecisionExperimentQueue();
      setQueue(response);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load experiment queue.");
    } finally {
      setIsQueueLoading(false);
    }
  }, []);

  const applyState = useCallback((response: HsakaaDecisionExperimentState) => {
    setState(response);
    setAssumptionDrafts(
      Object.fromEntries(
        response.assumptions.map((item) => [
          item.id,
          {
            status: item.status,
            confidence: item.confidence === null ? "" : String(Math.round(item.confidence * 100)),
            note: "",
          },
        ]),
      ),
    );
  }, []);

  const loadState = useCallback(async () => {
    if (!decisionId) {
      setState(null);
      return;
    }
    setIsStateLoading(true);
    try {
      const response = await getPrivateHsakaaDecisionExperimentState(decisionId);
      applyState(response);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load decision experiments.");
    } finally {
      setIsStateLoading(false);
    }
  }, [applyState, decisionId]);

  useEffect(() => {
    void loadQueue();
  }, [loadQueue, refreshKey]);

  useEffect(() => {
    void loadState();
  }, [loadState]);

  useEffect(() => {
    if (!draftSeed || !decisionId) return;
    setExperimentTitle(draftSeed.title);
    setExperimentHypothesis(draftSeed.description);
    setExperimentDescription(draftSeed.description);
    setExperimentOptionIds(draftSeed.supportsOptionIds);
    window.setTimeout(() => {
      document
        .getElementById("hsakaa-decision-experiment-create")
        ?.scrollIntoView({ behavior: "smooth", block: "center" });
    }, 0);
  }, [decisionId, draftSeed, draftSeedKey]);

  const queueGroups = useMemo(
    () =>
      [
        ["Due for review", queue?.dueForReview ?? []],
        ["Active", queue?.active ?? []],
        ["Awaiting result", queue?.awaitingResult ?? []],
        ["Completed", (queue?.completed ?? []).slice(0, 8)],
      ] as const,
    [queue],
  );

  async function mutate(
    key: string,
    operation: () => Promise<HsakaaDecisionExperimentState>,
    successMessage: string,
  ) {
    setBusyKey(key);
    setError("");
    setMessage("");
    try {
      const response = await operation();
      applyState(response);
      setMessage(successMessage);
      await loadQueue();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update Decision Lab.");
    } finally {
      setBusyKey("");
    }
  }

  function toggleId(id: string, setter: (value: string[]) => void, current: string[]) {
    setter(current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  }

  async function createExperiment(event: FormEvent) {
    event.preventDefault();
    if (!decisionId) return;
    if (!experimentTitle.trim() || !experimentHypothesis.trim() || !successCriteria.trim() || !failureCriteria.trim()) {
      setError("Add a title, hypothesis, success criteria and failure criteria.");
      return;
    }
    await mutate(
      "create-experiment",
      () =>
        createPrivateHsakaaDecisionExperiment(decisionId, {
          title: experimentTitle.trim(),
          hypothesis: experimentHypothesis.trim(),
          description: experimentDescription.trim() || undefined,
          successCriteria: successCriteria.trim(),
          failureCriteria: failureCriteria.trim(),
          assumptionIds: experimentAssumptionIds,
          supportsOptionIds: experimentOptionIds,
          targetReviewAt: targetReviewAt ? `${targetReviewAt}T12:00:00+05:30` : undefined,
        }),
      "Experiment added without changing the original decision analysis.",
    );
    setExperimentTitle("");
    setExperimentHypothesis("");
    setExperimentDescription("");
    setSuccessCriteria("");
    setFailureCriteria("");
    setTargetReviewAt("");
    setExperimentAssumptionIds([]);
    setExperimentOptionIds([]);
  }

  async function addEvidence(event: FormEvent) {
    event.preventDefault();
    if (!decisionId || !evidenceDetail.trim()) {
      setError("Add the evidence observation or result before saving it.");
      return;
    }
    await mutate(
      "add-evidence",
      () =>
        addPrivateHsakaaDecisionEvidence(decisionId, {
          kind: evidenceKind,
          stance: evidenceStance,
          detail: evidenceDetail.trim(),
          sourceReference: evidenceSource.trim() || undefined,
          metricLabel: metricLabel.trim() || undefined,
          metricValue: metricValue.trim() || undefined,
          experimentId: evidenceExperimentId || undefined,
          assumptionIds: evidenceAssumptionIds,
        }),
      "Evidence appended to the decision audit trail.",
    );
    setEvidenceDetail("");
    setEvidenceSource("");
    setMetricLabel("");
    setMetricValue("");
    setEvidenceExperimentId("");
    setEvidenceAssumptionIds([]);
  }

  async function saveAssumption(assumptionId: string) {
    if (!decisionId) return;
    const draft = assumptionDrafts[assumptionId];
    if (!draft) return;
    const numericConfidence = draft.confidence.trim() === "" ? null : Number(draft.confidence) / 100;
    if (numericConfidence !== null && (!Number.isFinite(numericConfidence) || numericConfidence < 0 || numericConfidence > 1)) {
      setError("Assumption confidence must be between 0 and 100.");
      return;
    }
    await mutate(
      `assumption-${assumptionId}`,
      () =>
        updatePrivateHsakaaDecisionAssumption(decisionId, assumptionId, {
          status: draft.status,
          confidence: numericConfidence,
          note: draft.note.trim() || undefined,
        }),
      "Assumption status updated. Historical status changes remain preserved.",
    );
  }

  async function completeExperiment(experimentId: string) {
    if (!decisionId) return;
    const draft = completionDrafts[experimentId] ?? { result: "inconclusive" as const, conclusion: "" };
    if (!draft.conclusion.trim()) {
      setError("Add an experiment conclusion before completing it.");
      return;
    }
    await mutate(
      `complete-${experimentId}`,
      () =>
        completePrivateHsakaaDecisionExperiment(decisionId, experimentId, {
          result: draft.result,
          conclusion: draft.conclusion.trim(),
        }),
      "Experiment completed and locked as historical evidence.",
    );
  }

  async function reassess(event: FormEvent) {
    event.preventDefault();
    if (!decisionId) return;
    await mutate(
      "reassess",
      () =>
        reassessPrivateHsakaaDecision(decisionId, {
          reason: reassessmentReason.trim() || undefined,
          force: forceReassessment || undefined,
        }),
      "New reassessment saved as a separate version. The original analysis remains frozen.",
    );
    setReassessmentReason("");
    setForceReassessment(false);
  }

  return (
    <section id="hsakaa-decision-experiments" className="scroll-mt-6 rounded-[24px] border border-white/10 bg-black/15 p-4 md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#C6FF32]">
            <FlaskConical className="h-4 w-4" />
            <p className="text-xs font-black uppercase tracking-[0.18em]">Experiments & Assumptions</p>
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/40">
            Turn uncertain assumptions into trackable tests, append factual evidence, and create versioned reassessments without rewriting the frozen Decision Lab baseline.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            void loadQueue();
            void loadState();
          }}
          disabled={isQueueLoading || isStateLoading}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-black text-white/45 transition hover:text-white disabled:opacity-50"
        >
          {isQueueLoading || isStateLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          Refresh
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-5">
        {[
          ["Active", queue?.counts.active ?? 0],
          ["Awaiting", queue?.counts.awaitingResult ?? 0],
          ["Due", queue?.counts.dueForReview ?? 0],
          ["Completed", queue?.counts.completed ?? 0],
          ["Invalidated", queue?.counts.invalidatedAssumptions ?? 0],
        ].map(([label, count]) => (
          <div key={label} className="rounded-2xl border border-white/8 bg-white/[0.015] p-3">
            <p className="text-xl font-black text-white/65">{count}</p>
            <p className="mt-1 text-[9px] font-black uppercase tracking-[0.12em] text-white/20">{label}</p>
          </div>
        ))}
      </div>

      {queueGroups.some(([, items]) => items.length) ? (
        <div className="mt-4 grid gap-4 xl:grid-cols-2">
          {queueGroups.map(([label, items]) =>
            items.length ? (
              <div key={label}>
                <p className="mb-2 text-[10px] font-black uppercase tracking-[0.14em] text-white/25">{label}</p>
                <div className="space-y-2">
                  {items.map((item) => (
                    <QueueCard key={`${item.decisionId}-${item.experiment.id}`} item={item} onOpen={() => void onOpenDecision(item.decisionId)} />
                  ))}
                </div>
              </div>
            ) : null,
          )}
        </div>
      ) : !isQueueLoading ? (
        <p className="mt-4 rounded-2xl border border-white/8 p-4 text-xs text-white/30">No tracked decision experiments yet.</p>
      ) : null}

      {queue?.invalidatedAssumptions.length ? (
        <div className="mt-4 rounded-2xl border border-rose-300/10 bg-rose-300/[0.015] p-4">
          <div className="flex items-center gap-2 text-rose-200/55">
            <CircleAlert className="h-4 w-4" />
            <p className="text-[10px] font-black uppercase tracking-[0.14em]">Invalidated assumptions</p>
          </div>
          <div className="mt-3 grid gap-2 lg:grid-cols-2">
            {queue.invalidatedAssumptions.map((item) => (
              <button
                key={`${item.decisionId}-${item.assumption.id}`}
                type="button"
                onClick={() => void onOpenDecision(item.decisionId)}
                className="rounded-xl border border-white/8 p-3 text-left transition hover:border-rose-300/20"
              >
                <p className="text-xs font-bold leading-5 text-white/50">{item.assumption.statement}</p>
                <p className="mt-1 line-clamp-1 text-[10px] text-white/20">{item.question}</p>
              </button>
            ))}
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-rose-300/15 bg-rose-300/[0.02] p-3 text-xs leading-5 text-rose-100/55">
          <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" /> {error}
        </div>
      ) : null}
      {message ? (
        <div className="mt-4 flex items-start gap-2 rounded-xl border border-[#C6FF32]/12 bg-[#C6FF32]/[0.02] p-3 text-xs leading-5 text-white/40">
          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#C6FF32]" /> {message}
        </div>
      ) : null}

      {!decisionId ? (
        <div className="mt-5 rounded-2xl border border-dashed border-white/10 p-5 text-sm text-white/30">
          Open or analyze a decision to manage its assumptions, experiments and evidence.
        </div>
      ) : isStateLoading && !state ? (
        <div className="mt-5 flex items-center gap-2 text-xs text-white/30"><Loader2 className="h-4 w-4 animate-spin" /> Loading experiment workspace…</div>
      ) : state ? (
        <div className="mt-5 space-y-5 border-t border-white/8 pt-5">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#C6FF32]/50">Current decision workspace</p>
              <h3 className="mt-1 text-base font-black text-white/70">{state.question}</h3>
            </div>
            <div className="rounded-xl border border-white/8 px-3 py-2 text-right">
              <p className="text-[9px] uppercase tracking-[0.12em] text-white/20">Frozen original recommendation</p>
              <p className="mt-1 text-xs font-black text-white/50">
                {optionLabel(decision, state.originalRecommendation.optionId)} · {percent(state.originalRecommendation.confidence)}
              </p>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2 text-white/45">
              <ClipboardList className="h-4 w-4" />
              <p className="text-xs font-black uppercase tracking-[0.14em]">Assumption Register</p>
            </div>
            {state.assumptions.length ? (
              <div className="mt-3 grid gap-3 lg:grid-cols-2">
                {state.assumptions.map((assumption) => {
                  const draft = assumptionDrafts[assumption.id] ?? {
                    status: assumption.status,
                    confidence: assumption.confidence === null ? "" : String(Math.round(assumption.confidence * 100)),
                    note: "",
                  };
                  const linkedEvidence = state.evidenceLog.filter((item) => item.assumptionIds.includes(assumption.id));
                  return (
                    <article key={assumption.id} className="rounded-2xl border border-white/8 bg-white/[0.012] p-4">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p className="text-[9px] font-black uppercase tracking-[0.12em] text-white/20">{titleCase(assumption.importance)} importance</p>
                          <p className="mt-1 text-sm font-bold leading-5 text-white/55">{assumption.statement}</p>
                        </div>
                        <span className="rounded-lg border border-white/8 px-2 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-white/35">{titleCase(assumption.status)}</span>
                      </div>
                      <div className="mt-3 grid gap-2 sm:grid-cols-[1fr_100px]">
                        <select
                          value={draft.status}
                          onChange={(event) => setAssumptionDrafts((current) => ({ ...current, [assumption.id]: { ...draft, status: event.target.value as HsakaaDecisionAssumptionStatus } }))}
                          className="rounded-xl border border-white/10 bg-[#070A0B] px-3 py-2 text-xs text-white/50 outline-none"
                        >
                          {ASSUMPTION_STATUSES.map((status) => <option key={status} value={status}>{titleCase(status)}</option>)}
                        </select>
                        <input
                          type="number"
                          min={0}
                          max={100}
                          value={draft.confidence}
                          onChange={(event) => setAssumptionDrafts((current) => ({ ...current, [assumption.id]: { ...draft, confidence: event.target.value } }))}
                          placeholder="Conf. %"
                          className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/50 outline-none"
                        />
                      </div>
                      <div className="mt-2 flex gap-2">
                        <input
                          value={draft.note}
                          onChange={(event) => setAssumptionDrafts((current) => ({ ...current, [assumption.id]: { ...draft, note: event.target.value } }))}
                          placeholder="Why did this status change?"
                          className="min-w-0 flex-1 rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/50 outline-none placeholder:text-white/18"
                        />
                        <button
                          type="button"
                          onClick={() => void saveAssumption(assumption.id)}
                          disabled={busyKey === `assumption-${assumption.id}`}
                          className="inline-flex items-center gap-1 rounded-xl border border-white/10 px-3 text-[9px] font-black uppercase tracking-[0.1em] text-white/40 transition hover:text-[#C6FF32] disabled:opacity-40"
                        >
                          {busyKey === `assumption-${assumption.id}` ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />} Save
                        </button>
                      </div>
                      <p className="mt-2 text-[10px] text-white/20">{linkedEvidence.length} linked evidence item{linkedEvidence.length === 1 ? "" : "s"} · current confidence {percent(assumption.confidence)}</p>
                    </article>
                  );
                })}
              </div>
            ) : (
              <p className="mt-3 text-xs text-white/30">No tracked assumptions were seeded for this decision.</p>
            )}
          </div>

          <form id="hsakaa-decision-experiment-create" onSubmit={createExperiment} className="rounded-2xl border border-[#C6FF32]/12 bg-[#C6FF32]/[0.018] p-4">
            <div className="flex items-center gap-2 text-[#C6FF32]">
              <Plus className="h-4 w-4" />
              <p className="text-xs font-black uppercase tracking-[0.14em]">Create experiment</p>
            </div>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <input value={experimentTitle} onChange={(event) => setExperimentTitle(event.target.value)} placeholder="Experiment title" className="rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-xs text-white/60 outline-none placeholder:text-white/20" />
              <input type="date" value={targetReviewAt} onChange={(event) => setTargetReviewAt(event.target.value)} className="rounded-xl border border-white/10 bg-[#070A0B] px-3 py-2.5 text-xs text-white/50 outline-none" />
              <textarea value={experimentHypothesis} onChange={(event) => setExperimentHypothesis(event.target.value)} rows={2} placeholder="Hypothesis — what must be true?" className="rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-xs leading-5 text-white/60 outline-none placeholder:text-white/20" />
              <textarea value={experimentDescription} onChange={(event) => setExperimentDescription(event.target.value)} rows={2} placeholder="How will you run the test?" className="rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-xs leading-5 text-white/60 outline-none placeholder:text-white/20" />
              <textarea value={successCriteria} onChange={(event) => setSuccessCriteria(event.target.value)} rows={2} placeholder="Success criteria" className="rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-xs leading-5 text-white/60 outline-none placeholder:text-white/20" />
              <textarea value={failureCriteria} onChange={(event) => setFailureCriteria(event.target.value)} rows={2} placeholder="Failure criteria" className="rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-xs leading-5 text-white/60 outline-none placeholder:text-white/20" />
            </div>
            {state.assumptions.length ? (
              <div className="mt-3">
                <p className="text-[9px] font-black uppercase tracking-[0.12em] text-white/20">Tests assumptions</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {state.assumptions.map((item) => (
                    <label key={item.id} className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/8 px-2.5 py-1.5 text-[10px] text-white/35">
                      <input type="checkbox" checked={experimentAssumptionIds.includes(item.id)} onChange={() => toggleId(item.id, setExperimentAssumptionIds, experimentAssumptionIds)} />
                      {item.statement}
                    </label>
                  ))}
                </div>
              </div>
            ) : null}
            {decision?.options.length ? (
              <div className="mt-3">
                <p className="text-[9px] font-black uppercase tracking-[0.12em] text-white/20">Could support options</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {decision.options.map((item) => (
                    <label key={item.id} className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/8 px-2.5 py-1.5 text-[10px] text-white/35">
                      <input type="checkbox" checked={experimentOptionIds.includes(item.id)} onChange={() => toggleId(item.id, setExperimentOptionIds, experimentOptionIds)} />
                      {item.label}
                    </label>
                  ))}
                </div>
              </div>
            ) : null}
            <button type="submit" disabled={busyKey === "create-experiment"} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#C6FF32] px-4 py-2.5 text-xs font-black text-black disabled:opacity-50">
              {busyKey === "create-experiment" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Beaker className="h-3.5 w-3.5" />} Track experiment
            </button>
          </form>

          {state.experiments.length ? (
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-white/35">Tracked experiments</p>
              <div className="mt-3 grid gap-3 lg:grid-cols-2">
                {state.experiments.map((experiment) => {
                  const completion = completionDrafts[experiment.id] ?? { result: "inconclusive" as HsakaaDecisionExperimentResult, conclusion: "" };
                  return (
                    <article key={experiment.id} className="rounded-2xl border border-white/8 bg-white/[0.012] p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <p className="text-sm font-black text-white/60">{experiment.title}</p>
                          <p className="mt-1 text-xs leading-5 text-white/30">{experiment.hypothesis}</p>
                        </div>
                        <span className="rounded-lg border border-white/8 px-2 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-white/35">{titleCase(experiment.status)}</span>
                      </div>
                      <div className="mt-3 grid gap-2 sm:grid-cols-2 text-xs leading-5 text-white/30">
                        <div className="rounded-xl bg-black/15 p-2.5"><span className="font-black text-white/40">Success:</span> {experiment.successCriteria}</div>
                        <div className="rounded-xl bg-black/15 p-2.5"><span className="font-black text-white/40">Failure:</span> {experiment.failureCriteria}</div>
                      </div>
                      <p className="mt-2 text-[10px] text-white/20">Target review {formatDate(experiment.targetReviewAt)}</p>
                      {experiment.status !== "completed" ? (
                        <div className="mt-3 flex gap-2">
                          <select
                            value={experiment.status}
                            onChange={(event) => void mutate(
                              `status-${experiment.id}`,
                              () => updatePrivateHsakaaDecisionExperimentStatus(decisionId, experiment.id, event.target.value as HsakaaDecisionExperimentStatus),
                              "Experiment status updated.",
                            )}
                            disabled={busyKey === `status-${experiment.id}`}
                            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#070A0B] px-3 py-2 text-xs text-white/50 outline-none disabled:opacity-40"
                          >
                            {EXPERIMENT_STATUSES.map((status) => <option key={status} value={status}>{titleCase(status)}</option>)}
                          </select>
                        </div>
                      ) : (
                        <div className="mt-3 rounded-xl border border-[#C6FF32]/10 bg-[#C6FF32]/[0.015] p-3">
                          <p className="text-[9px] font-black uppercase tracking-[0.12em] text-[#C6FF32]/45">Locked result · {titleCase(experiment.result ?? "inconclusive")}</p>
                          <p className="mt-1 text-xs leading-5 text-white/40">{experiment.conclusion}</p>
                        </div>
                      )}
                      {experiment.status !== "completed" && experiment.status !== "cancelled" ? (
                        <div className="mt-3 grid gap-2 sm:grid-cols-[140px_1fr_auto]">
                          <select value={completion.result} onChange={(event) => setCompletionDrafts((current) => ({ ...current, [experiment.id]: { ...completion, result: event.target.value as HsakaaDecisionExperimentResult } }))} className="rounded-xl border border-white/10 bg-[#070A0B] px-3 py-2 text-xs text-white/50 outline-none">
                            <option value="supported">Supported</option>
                            <option value="mixed">Mixed</option>
                            <option value="failed">Failed</option>
                            <option value="inconclusive">Inconclusive</option>
                          </select>
                          <input value={completion.conclusion} onChange={(event) => setCompletionDrafts((current) => ({ ...current, [experiment.id]: { ...completion, conclusion: event.target.value } }))} placeholder="Experiment conclusion" className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/50 outline-none placeholder:text-white/18" />
                          <button type="button" onClick={() => void completeExperiment(experiment.id)} disabled={busyKey === `complete-${experiment.id}`} className="inline-flex items-center justify-center gap-1 rounded-xl border border-[#C6FF32]/15 px-3 py-2 text-[9px] font-black uppercase tracking-[0.1em] text-[#C6FF32] disabled:opacity-40">
                            {busyKey === `complete-${experiment.id}` ? <Loader2 className="h-3 w-3 animate-spin" /> : <Check className="h-3 w-3" />} Complete
                          </button>
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </div>
          ) : null}

          <form onSubmit={addEvidence} className="rounded-2xl border border-white/8 p-4">
            <div className="flex items-center gap-2 text-white/45"><Send className="h-4 w-4" /><p className="text-xs font-black uppercase tracking-[0.14em]">Append evidence</p></div>
            <p className="mt-1 text-[10px] leading-4 text-white/20">Evidence is append-only factual history. Reassessments interpret it separately.</p>
            <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-4">
              <select value={evidenceKind} onChange={(event) => setEvidenceKind(event.target.value as HsakaaDecisionEvidenceKind)} className="rounded-xl border border-white/10 bg-[#070A0B] px-3 py-2.5 text-xs text-white/50 outline-none">
                <option value="observation">Observation</option><option value="metric">Metric</option><option value="note">Note</option><option value="source">Source</option>
              </select>
              <select value={evidenceStance} onChange={(event) => setEvidenceStance(event.target.value as HsakaaDecisionEvidenceStance)} className="rounded-xl border border-white/10 bg-[#070A0B] px-3 py-2.5 text-xs text-white/50 outline-none">
                <option value="supports">Supports</option><option value="contradicts">Contradicts</option><option value="neutral">Neutral</option>
              </select>
              <select value={evidenceExperimentId} onChange={(event) => setEvidenceExperimentId(event.target.value)} className="rounded-xl border border-white/10 bg-[#070A0B] px-3 py-2.5 text-xs text-white/50 outline-none">
                <option value="">No experiment link</option>{state.experiments.map((item) => <option key={item.id} value={item.id}>{item.title}</option>)}
              </select>
              <input value={evidenceSource} onChange={(event) => setEvidenceSource(event.target.value)} placeholder="Source/reference (optional)" className="rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-xs text-white/50 outline-none placeholder:text-white/18" />
            </div>
            <textarea value={evidenceDetail} onChange={(event) => setEvidenceDetail(event.target.value)} rows={3} placeholder="What actually happened? Record the observation without interpreting it." className="mt-2 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-xs leading-5 text-white/60 outline-none placeholder:text-white/18" />
            {evidenceKind === "metric" ? (
              <div className="mt-2 grid gap-2 sm:grid-cols-2"><input value={metricLabel} onChange={(event) => setMetricLabel(event.target.value)} placeholder="Metric name" className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/50 outline-none" /><input value={metricValue} onChange={(event) => setMetricValue(event.target.value)} placeholder="Measured result" className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs text-white/50 outline-none" /></div>
            ) : null}
            {state.assumptions.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {state.assumptions.map((item) => <label key={item.id} className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/8 px-2.5 py-1.5 text-[10px] text-white/35"><input type="checkbox" checked={evidenceAssumptionIds.includes(item.id)} onChange={() => toggleId(item.id, setEvidenceAssumptionIds, evidenceAssumptionIds)} />{item.statement}</label>)}
              </div>
            ) : null}
            <button type="submit" disabled={busyKey === "add-evidence"} className="mt-3 inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-[10px] font-black uppercase tracking-[0.1em] text-white/45 transition hover:text-[#C6FF32] disabled:opacity-40">{busyKey === "add-evidence" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />} Add evidence</button>
          </form>

          {state.evidenceLog.length ? (
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-white/35">Evidence log · append only</p>
              <div className="mt-3 space-y-2">
                {[...state.evidenceLog].reverse().slice(0, 12).map((item) => (
                  <div key={item.id} className="rounded-xl border border-white/8 bg-white/[0.01] p-3">
                    <div className="flex flex-wrap items-center gap-2 text-[9px] font-black uppercase tracking-[0.1em] text-white/20"><span>{titleCase(item.kind)}</span><span>·</span><span>{titleCase(item.stance)}</span><span>· {formatDate(item.occurredAt ?? item.recordedAt)}</span></div>
                    <p className="mt-1 text-xs leading-5 text-white/40">{item.detail}</p>
                    {item.metricLabel || item.sourceReference ? <p className="mt-1 text-[10px] text-white/20">{item.metricLabel ? `${item.metricLabel}: ${item.metricValue}` : ""}{item.metricLabel && item.sourceReference ? " · " : ""}{item.sourceReference}</p> : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <form onSubmit={reassess} className="rounded-2xl border border-[#C6FF32]/12 bg-[#C6FF32]/[0.015] p-4">
            <div className="flex items-center gap-2 text-[#C6FF32]"><History className="h-4 w-4" /><p className="text-xs font-black uppercase tracking-[0.14em]">Reassess with evidence</p></div>
            <p className="mt-1 text-[10px] leading-4 text-white/20">Creates a new recommendation version. It never changes the original analysis, commitment baseline or previous reassessments.</p>
            <textarea value={reassessmentReason} onChange={(event) => setReassessmentReason(event.target.value)} rows={2} placeholder="Why reassess now? (optional)" className="mt-3 w-full rounded-xl border border-white/10 bg-black/20 px-3 py-2.5 text-xs leading-5 text-white/60 outline-none placeholder:text-white/18" />
            <label className="mt-2 flex items-start gap-2 text-[10px] leading-4 text-white/30"><input type="checkbox" checked={forceReassessment} onChange={(event) => setForceReassessment(event.target.checked)} className="mt-0.5" /><span>Explicitly reassess even if no new evidence has been added since the previous version.</span></label>
            <button type="submit" disabled={busyKey === "reassess"} className="mt-3 inline-flex items-center gap-2 rounded-xl bg-[#C6FF32] px-4 py-2.5 text-xs font-black text-black disabled:opacity-50">{busyKey === "reassess" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <History className="h-3.5 w-3.5" />} Create reassessment</button>
          </form>

          {state.reassessments.length ? (
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-white/35">Reassessment history</p>
              <div className="mt-3 space-y-3">
                {[...state.reassessments].reverse().map((item) => (
                  <article key={item.version} className="rounded-2xl border border-white/8 bg-white/[0.012] p-4">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div><p className="text-sm font-black text-white/60">Reassessment #{item.version}</p><p className="mt-1 text-[10px] text-white/20">{formatDate(item.requestedAt)} · {item.newEvidenceIds.length} new evidence item{item.newEvidenceIds.length === 1 ? "" : "s"}</p></div>
                      <span className="rounded-lg border border-white/8 px-2 py-1 text-[9px] font-black uppercase tracking-[0.1em] text-white/35">{item.recommendationChanged ? "Recommendation changed" : "Recommendation held"}</span>
                    </div>
                    <div className="mt-3 grid gap-2 sm:grid-cols-2">
                      <div className="rounded-xl bg-black/15 p-3"><p className="text-[9px] font-black uppercase tracking-[0.1em] text-white/20">Before</p><p className="mt-1 text-xs font-bold text-white/45">{optionLabel(decision, item.priorRecommendation.optionId)} · {percent(item.priorRecommendation.confidence)}</p></div>
                      <div className="rounded-xl bg-black/15 p-3"><p className="text-[9px] font-black uppercase tracking-[0.1em] text-[#C6FF32]/35">Current</p><p className="mt-1 text-xs font-bold text-white/55">{optionLabel(decision, item.currentRecommendation.optionId)} · {percent(item.currentRecommendation.confidence)}</p></div>
                    </div>
                    <p className="mt-3 text-xs leading-5 text-white/40">{item.currentRecommendation.rationale}</p>
                    <p className="mt-2 text-xs leading-5 text-white/30"><span className="font-black text-white/40">Evidence:</span> {item.evidenceSummary}</p>
                    {item.whatChanged.length ? <ul className="mt-2 space-y-1 text-xs leading-5 text-white/35">{item.whatChanged.map((change) => <li key={change}>• {change}</li>)}</ul> : null}
                    {item.assumptionSuggestions.length ? <p className="mt-2 text-[10px] text-white/20">{item.assumptionSuggestions.length} assumption update suggestion{item.assumptionSuggestions.length === 1 ? "" : "s"} · suggestions do not mutate the register automatically.</p> : null}
                  </article>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
