"use client";

import {
  ArrowRight,
  BrainCircuit,
  Scale,
  CircleAlert,
  FlaskConical,
  Loader2,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
} from "lucide-react";
import { FormEvent, useCallback, useEffect, useMemo, useState } from "react";

import {
  analyzePrivateHsakaaDecision,
  getPrivateHsakaaDecision,
  getRecentPrivateHsakaaDecisions,
  reanalyzePrivateHsakaaDecision,
  type HsakaaDecisionHorizon,
  type HsakaaDecisionResponse,
} from "@/services/hsakaa.service";

import { HsakaaDecisionLearningLibrary } from "./HsakaaDecisionLearningLibrary";
import { HsakaaDecisionAnalyticsDashboard } from "./HsakaaDecisionAnalyticsDashboard";
import {
  HsakaaDecisionExperimentTracker,
  type HsakaaDecisionExperimentDraftSeed,
} from "./HsakaaDecisionExperimentTracker";
import { HsakaaDecisionOutcomeTracker } from "./HsakaaDecisionOutcomeTracker";
import { HsakaaDecisionReviewQueue } from "./HsakaaDecisionReviewQueue";

type DraftOption = {
  label: string;
  description: string;
};

const newOption = (): DraftOption => ({ label: "", description: "" });

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

function titleCase(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (item) => item.toUpperCase());
}

function Evidence({ items }: { items: HsakaaDecisionResponse["analysis"]["optionAssessments"][number]["evidence"] }) {
  if (!items.length) return null;
  return (
    <div className="mt-3 space-y-2">
      {items.map((item, index) => (
        <div key={`${item.source}-${item.label}-${index}`} className="rounded-xl border border-white/8 bg-black/15 px-3 py-2">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/25">{item.source}</p>
          <p className="mt-1 text-xs font-bold text-white/55">{item.label}</p>
          <p className="mt-1 text-xs leading-5 text-white/35">{item.detail}</p>
        </div>
      ))}
    </div>
  );
}

export function HsakaaDecisionLab() {
  const [question, setQuestion] = useState("");
  const [context, setContext] = useState("");
  const [constraints, setConstraints] = useState("");
  const [horizon, setHorizon] = useState<HsakaaDecisionHorizon>("months");
  const [options, setOptions] = useState<DraftOption[]>([newOption(), newOption()]);
  const [result, setResult] = useState<HsakaaDecisionResponse | null>(null);
  const [recent, setRecent] = useState<HsakaaDecisionResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isReanalyzing, setIsReanalyzing] = useState(false);
  const [queueRefreshKey, setQueueRefreshKey] = useState(0);
  const [experimentDraftSeed, setExperimentDraftSeed] =
    useState<HsakaaDecisionExperimentDraftSeed | null>(null);
  const [experimentDraftSeedKey, setExperimentDraftSeedKey] = useState(0);
  const [error, setError] = useState("");

  const loadRecent = useCallback(async () => {
    try {
      const response = await getRecentPrivateHsakaaDecisions(6);
      setRecent(response.data);
    } catch {
      // Recent history is supplemental; the Decision Lab can still be used.
    }
  }, []);

  useEffect(() => {
    void loadRecent();
  }, [loadRecent]);

  const optionLabels = useMemo(
    () => new Map(result?.options.map((item) => [item.id, item.label]) ?? []),
    [result],
  );

  async function submit(event: FormEvent) {
    event.preventDefault();
    const cleanedOptions = options
      .map((item) => ({
        label: item.label.trim(),
        description: item.description.trim() || undefined,
      }))
      .filter((item) => item.label);

    if (!question.trim() || cleanedOptions.length < 2) {
      setError("Add a decision question and at least two named options.");
      return;
    }

    setError("");
    setIsLoading(true);
    try {
      const response = await analyzePrivateHsakaaDecision({
        question: question.trim(),
        options: cleanedOptions,
        context: context.trim() || undefined,
        constraints: constraints
          .split("\n")
          .map((item) => item.trim())
          .filter(Boolean),
        horizon,
      });
      setResult(response);
      await loadRecent();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Decision analysis failed.");
    } finally {
      setIsLoading(false);
    }
  }

  async function reanalyze() {
    if (!result?.id) return;
    setError("");
    setIsReanalyzing(true);
    try {
      const response = await reanalyzePrivateHsakaaDecision(result.id);
      setResult(response);
      await loadRecent();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Decision reanalysis failed.");
    } finally {
      setIsReanalyzing(false);
    }
  }

  async function handleTrackedDecisionUpdate(updated: HsakaaDecisionResponse) {
    setResult(updated);
    setQueueRefreshKey((current) => current + 1);
    await loadRecent();
  }

  async function openQueuedDecision(decisionId: string) {
    setError("");
    try {
      const response = await getPrivateHsakaaDecision(decisionId);
      setResult(response);
      window.setTimeout(() => {
        document
          .getElementById("hsakaa-decision-outcome")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 0);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not open this decision review.");
    }
  }

  function updateOption(index: number, field: keyof DraftOption, value: string) {
    setOptions((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    );
  }

  function seedExperiment(seed: HsakaaDecisionExperimentDraftSeed) {
    setExperimentDraftSeed(seed);
    setExperimentDraftSeedKey((current) => current + 1);
  }

  const recommendationLabel = result?.analysis.recommendation.optionId
    ? optionLabels.get(result.analysis.recommendation.optionId) ?? "Unknown option"
    : "No clear winner yet";

  return (
    <section className="space-y-5 rounded-[28px] border border-[#C6FF32]/15 bg-[#C6FF32]/[0.025] p-5 md:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#C6FF32]">
            <Scale className="h-4 w-4" />
            <p className="text-xs font-black uppercase tracking-[0.18em]">Decision Lab</p>
          </div>
          <h2 className="mt-2 text-xl font-black text-white">Compare choices without manufacturing certainty.</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/40">
            HSAKAA uses your Personal OS as evidence, separates assumptions from facts, scores every option, and shows what could change the recommendation. Analysis is advisory and executes nothing.
          </p>
        </div>
        {result?.id && !result.commitment ? (
          <button
            type="button"
            onClick={() => void reanalyze()}
            disabled={isReanalyzing}
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-black text-white/55 transition hover:border-[#C6FF32]/30 hover:text-[#C6FF32] disabled:opacity-50"
          >
            {isReanalyzing ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
            Reanalyze current
          </button>
        ) : null}
      </div>

      <HsakaaDecisionAnalyticsDashboard refreshKey={queueRefreshKey} />

      <HsakaaDecisionReviewQueue
        onOpenDecision={openQueuedDecision}
        refreshKey={queueRefreshKey}
      />

      <HsakaaDecisionLearningLibrary
        onOpenDecision={openQueuedDecision}
        refreshKey={queueRefreshKey}
      />

      <HsakaaDecisionExperimentTracker
        decision={result}
        onOpenDecision={openQueuedDecision}
        refreshKey={queueRefreshKey}
        draftSeed={experimentDraftSeed}
        draftSeedKey={experimentDraftSeedKey}
      />

      <form onSubmit={submit} className="grid gap-4 rounded-[24px] border border-white/10 bg-black/15 p-4 md:p-5">
        <label className="grid gap-2">
          <span className="text-xs font-black uppercase tracking-[0.14em] text-white/35">Decision question</span>
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            rows={2}
            placeholder="Should I focus the next 90 days on A or B?"
            className="rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-[#C6FF32]/35"
          />
        </label>

        <div className="grid gap-3 md:grid-cols-2">
          {options.map((option, index) => (
            <div key={index} className="rounded-2xl border border-white/10 bg-white/[0.015] p-3">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#C6FF32]/60">Option {index + 1}</p>
                {options.length > 2 ? (
                  <button
                    type="button"
                    onClick={() => setOptions((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                    className="text-white/25 transition hover:text-rose-300"
                    aria-label={`Remove option ${index + 1}`}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                ) : null}
              </div>
              <input
                value={option.label}
                onChange={(event) => updateOption(index, "label", event.target.value)}
                placeholder="Name this option"
                className="mt-2 w-full rounded-xl border border-white/8 bg-black/25 px-3 py-2 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#C6FF32]/30"
              />
              <textarea
                value={option.description}
                onChange={(event) => updateOption(index, "description", event.target.value)}
                rows={2}
                placeholder="What would this option actually mean?"
                className="mt-2 w-full rounded-xl border border-white/8 bg-black/25 px-3 py-2 text-xs leading-5 text-white/70 outline-none placeholder:text-white/20 focus:border-[#C6FF32]/30"
              />
            </div>
          ))}
        </div>

        {options.length < 5 ? (
          <button
            type="button"
            onClick={() => setOptions((current) => [...current, newOption()])}
            className="inline-flex w-fit items-center gap-2 text-xs font-bold text-white/40 transition hover:text-[#C6FF32]"
          >
            <Plus className="h-3.5 w-3.5" /> Add option
          </button>
        ) : null}

        <div className="grid gap-4 md:grid-cols-[180px_1fr]">
          <label className="grid gap-2">
            <span className="text-xs font-black uppercase tracking-[0.14em] text-white/35">Horizon</span>
            <select
              value={horizon}
              onChange={(event) => setHorizon(event.target.value as HsakaaDecisionHorizon)}
              className="rounded-xl border border-white/10 bg-[#080b0d] px-3 py-2.5 text-sm text-white/70 outline-none"
            >
              <option value="today">Today</option>
              <option value="weeks">Weeks</option>
              <option value="months">Months</option>
              <option value="years">Years</option>
            </select>
          </label>
          <label className="grid gap-2">
            <span className="text-xs font-black uppercase tracking-[0.14em] text-white/35">Constraints — one per line</span>
            <textarea
              value={constraints}
              onChange={(event) => setConstraints(event.target.value)}
              rows={2}
              placeholder={"Must preserve runway\nCannot split attention across both"}
              className="rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm text-white/70 outline-none placeholder:text-white/20"
            />
          </label>
        </div>

        <label className="grid gap-2">
          <span className="text-xs font-black uppercase tracking-[0.14em] text-white/35">Extra context — optional</span>
          <textarea
            value={context}
            onChange={(event) => setContext(event.target.value)}
            rows={3}
            placeholder="Add facts that are not already in your Personal OS."
            className="rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-sm text-white/70 outline-none placeholder:text-white/20"
          />
        </label>

        {error ? (
          <div className="flex items-start gap-2 rounded-xl border border-rose-400/15 bg-rose-400/5 px-3 py-2 text-xs text-rose-200/70">
            <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
            {error}
          </div>
        ) : null}

        <button
          type="submit"
          disabled={isLoading}
          className="inline-flex w-fit items-center gap-2 rounded-xl bg-[#C6FF32] px-4 py-2.5 text-sm font-black text-black transition hover:brightness-105 disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
          Analyze decision
        </button>
      </form>

      {result ? (
        <div className="space-y-4">
          <div className="rounded-[24px] border border-[#C6FF32]/20 bg-[#C6FF32]/[0.04] p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#C6FF32]/55">Recommendation</p>
                <h3 className="mt-2 text-xl font-black text-white">{recommendationLabel}</h3>
                <p className="mt-2 max-w-4xl text-sm leading-6 text-white/50">{result.analysis.recommendation.rationale}</p>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-right">
                <p className="text-[10px] uppercase tracking-[0.14em] text-white/25">Confidence</p>
                <p className="mt-1 text-2xl font-black text-[#C6FF32]">{Math.round(result.analysis.recommendation.confidence * 100)}%</p>
                <p className="text-[10px] uppercase tracking-[0.12em] text-white/25">{titleCase(result.analysis.decisionType)}</p>
              </div>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="rounded-2xl bg-black/15 p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/25">Why now</p>
                <p className="mt-1 text-sm leading-6 text-white/45">{result.analysis.recommendation.whyNow}</p>
              </div>
              <div className="rounded-2xl bg-black/15 p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/25">Caution</p>
                <p className="mt-1 text-sm leading-6 text-white/45">{result.analysis.recommendation.caution}</p>
              </div>
            </div>
          </div>

          {result.learningContext ? (
            <div className="rounded-[22px] border border-white/10 bg-black/15 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="flex items-center gap-2 text-[#C6FF32]">
                  <BrainCircuit className="h-4 w-4" />
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.16em]">
                      Similar past decisions
                    </p>
                    <p className="mt-1 text-xs text-white/30">
                      Deterministic recall · historical evidence only · never a rule
                    </p>
                  </div>
                </div>
                <div className="rounded-xl border border-white/8 px-3 py-2 text-right">
                  <p className="text-sm font-black text-white/60">
                    {result.learningContext.similarReviewedCount}
                  </p>
                  <p className="text-[9px] font-black uppercase tracking-[0.12em] text-white/20">
                    similar · {titleCase(result.learningContext.sampleQuality)} sample
                  </p>
                </div>
              </div>

              {result.learningContext.warnings.length ? (
                <div className="mt-3 space-y-2">
                  {result.learningContext.warnings.map((warning, index) => (
                    <div
                      key={`${warning.kind}-${index}`}
                      className="flex items-start gap-2 rounded-xl border border-amber-300/10 bg-amber-300/[0.02] p-3 text-xs leading-5 text-amber-100/45"
                    >
                      <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                      {warning.message}
                    </div>
                  ))}
                </div>
              ) : null}

              {result.learningContext.similarDecisions.length ? (
                <div className="mt-4 grid gap-3 lg:grid-cols-2">
                  {result.learningContext.similarDecisions.map((item) => (
                    <div
                      key={item.id ?? `${item.question}-${item.recordedAt}`}
                      className="rounded-2xl border border-white/8 bg-white/[0.015] p-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <p className="text-sm font-bold leading-5 text-white/55">
                          {item.question}
                        </p>
                        <span className="shrink-0 rounded-lg border border-white/8 px-2 py-1 text-[9px] font-black text-white/25">
                          {Math.round(item.similarityScore * 100)}% match
                        </span>
                      </div>
                      <p className="mt-2 text-[10px] text-white/25">
                        Chose {item.selectedOptionLabel} · recommended {item.recommendationOptionLabel ?? "no clear option"}
                      </p>
                      <p className="mt-1 text-[10px] text-white/25">
                        {titleCase(item.status)} · {titleCase(item.calibration)} · {item.recommendationFollowed === null ? "no recommendation to follow" : item.recommendationFollowed ? "recommendation followed" : "recommendation not followed"}
                      </p>
                      <p className="mt-2 text-xs leading-5 text-white/35">
                        {item.summary}
                      </p>
                      {item.surprises.length ? (
                        <p className="mt-2 text-xs leading-5 text-white/30">
                          <span className="font-black text-white/40">Surprise:</span> {item.surprises[0]}
                        </p>
                      ) : null}
                      {item.lessons.length ? (
                        <ul className="mt-2 space-y-1 text-xs leading-5 text-white/40">
                          {item.lessons.slice(0, 2).map((lesson) => (
                            <li key={lesson}>• {lesson}</li>
                          ))}
                        </ul>
                      ) : null}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-xs leading-5 text-white/30">
                  No sufficiently similar completed decision review exists yet.
                </p>
              )}
            </div>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-2">
            {result.analysis.optionAssessments.map((assessment) => (
              <article key={assessment.optionId} className="rounded-[22px] border border-white/10 bg-black/15 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-black text-white/80">{optionLabels.get(assessment.optionId) ?? assessment.optionId}</p>
                    <p className="mt-1 text-sm leading-6 text-white/40">{assessment.summary}</p>
                  </div>
                  <span className="rounded-xl border border-white/10 px-3 py-1 text-sm font-black text-white/65">{Math.round(assessment.score)}/100</span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-emerald-300/50">Advantages</p>
                    <ul className="mt-2 space-y-1 text-xs leading-5 text-white/40">
                      {assessment.advantages.map((item) => <li key={item}>• {item}</li>)}
                    </ul>
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-rose-300/50">Disadvantages</p>
                    <ul className="mt-2 space-y-1 text-xs leading-5 text-white/40">
                      {assessment.disadvantages.map((item) => <li key={item}>• {item}</li>)}
                    </ul>
                  </div>
                </div>
                <p className="mt-4 text-xs leading-5 text-white/35"><span className="font-black text-white/45">Opportunity cost:</span> {assessment.opportunityCost}</p>
                <Evidence items={assessment.evidence} />
              </article>
            ))}
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-[22px] border border-white/10 bg-black/15 p-4 lg:col-span-2">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-white/35">Decision criteria</p>
              <div className="mt-3 space-y-3">
                {result.analysis.criteria.map((criterion) => (
                  <div key={criterion.name}>
                    <div className="flex items-center justify-between gap-3 text-xs">
                      <span className="font-bold text-white/60">{criterion.name}</span>
                      <span className="text-white/30">{Math.round(criterion.weight * 100)}%</span>
                    </div>
                    <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-white/5">
                      <div className="h-full rounded-full bg-[#C6FF32]/55" style={{ width: `${Math.min(100, criterion.weight * 100)}%` }} />
                    </div>
                    <p className="mt-1 text-xs leading-5 text-white/30">{criterion.rationale}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-black/15 p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-white/35">Key trade-offs</p>
              <div className="mt-3 space-y-3">
                {result.analysis.keyTradeoffs.map((item) => (
                  <div key={item.title}>
                    <p className="text-sm font-bold text-white/60">{item.title}</p>
                    <p className="mt-1 text-xs leading-5 text-white/35">{item.description}</p>
                    {item.favoredOptionId ? <p className="mt-1 text-[10px] text-[#C6FF32]/55">Leans: {optionLabels.get(item.favoredOptionId)}</p> : null}
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-[22px] border border-white/10 bg-black/15 p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-white/35">Assumptions & unknowns</p>
              <div className="mt-3 grid gap-4 md:grid-cols-2">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-amber-300/50">Assumptions</p>
                  <ul className="mt-2 space-y-2 text-xs leading-5 text-white/40">{result.analysis.assumptions.map((item) => <li key={item}>• {item}</li>)}</ul>
                </div>
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.14em] text-sky-300/50">Unknowns</p>
                  <ul className="mt-2 space-y-2 text-xs leading-5 text-white/40">{result.analysis.unknowns.map((item) => <li key={item}>• {item}</li>)}</ul>
                </div>
              </div>
            </div>
            <div className="rounded-[22px] border border-white/10 bg-black/15 p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-white/35">What would change the recommendation?</p>
              <div className="mt-3 space-y-2">
                {result.analysis.whatWouldChangeRecommendation.map((item) => (
                  <div key={item} className="flex items-start justify-between gap-3 rounded-xl border border-white/6 bg-white/[0.01] p-2.5">
                    <p className="text-xs leading-5 text-white/40">• {item}</p>
                    {result.id ? (
                      <button
                        type="button"
                        onClick={() =>
                          seedExperiment({
                            title: `Test recommendation trigger`,
                            description: item,
                            supportsOptionIds: result.analysis.recommendation.optionId
                              ? [result.analysis.recommendation.optionId]
                              : [],
                          })
                        }
                        className="shrink-0 rounded-lg border border-[#C6FF32]/12 px-2 py-1 text-[9px] font-black uppercase tracking-[0.08em] text-[#C6FF32]/60 transition hover:text-[#C6FF32]"
                      >
                        Test it
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {result.analysis.suggestedExperiments.length ? (
            <div className="rounded-[22px] border border-white/10 bg-black/15 p-4">
              <div className="flex items-center gap-2 text-[#C6FF32]">
                <FlaskConical className="h-4 w-4" />
                <p className="text-xs font-black uppercase tracking-[0.16em]">Experiments to reduce uncertainty</p>
              </div>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                {result.analysis.suggestedExperiments.map((experiment) => (
                  <div key={experiment.title} className="rounded-2xl border border-white/8 bg-white/[0.015] p-3">
                    <div className="flex items-start justify-between gap-3">
                      <p className="text-sm font-bold text-white/65">{experiment.title}</p>
                      <span className="text-[10px] text-white/25">{experiment.duration}</span>
                    </div>
                    <p className="mt-1 text-xs leading-5 text-white/35">{experiment.description}</p>
                    {result.id ? (
                      <button
                        type="button"
                        onClick={() =>
                          seedExperiment({
                            title: experiment.title,
                            description: experiment.description,
                            supportsOptionIds: experiment.supportsOptionIds,
                          })
                        }
                        className="mt-3 inline-flex items-center gap-1.5 rounded-lg border border-[#C6FF32]/12 px-2.5 py-1.5 text-[9px] font-black uppercase tracking-[0.08em] text-[#C6FF32]/60 transition hover:text-[#C6FF32]"
                      >
                        <FlaskConical className="h-3 w-3" /> Track experiment
                      </button>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          ) : null}

          <div className="rounded-2xl border border-[#C6FF32]/10 bg-[#C6FF32]/[0.025] p-4">
            <div className="flex items-start gap-3">
              <ArrowRight className="mt-0.5 h-4 w-4 shrink-0 text-[#C6FF32]" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#C6FF32]/55">Ask HSAKAA next</p>
                <p className="mt-1 text-sm leading-6 text-white/55">{result.analysis.nextPrompt}</p>
                <p className="mt-2 text-[10px] text-white/20">Generated {formatDate(result.generatedAt)} · analysis only · no action executed</p>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      <div id="hsakaa-decision-outcome" className="scroll-mt-6">
        <HsakaaDecisionOutcomeTracker
          decision={result}
          onUpdated={handleTrackedDecisionUpdate}
        />
      </div>

      {recent.length ? (
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-white/30">Recent Decision Lab analyses</p>
          <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
            {recent.map((item) => (
              <button
                key={item.id ?? `${item.question}-${item.generatedAt}`}
                type="button"
                onClick={() => setResult(item)}
                className="rounded-2xl border border-white/8 bg-black/10 p-3 text-left transition hover:border-[#C6FF32]/20"
              >
                <p className="line-clamp-2 text-sm font-bold leading-5 text-white/55">{item.question}</p>
                <p className="mt-2 text-[10px] text-white/20">{formatDate(item.generatedAt)}</p>
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
