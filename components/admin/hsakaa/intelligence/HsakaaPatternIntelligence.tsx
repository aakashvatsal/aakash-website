"use client";

import Link from "next/link";
import {
  BrainCircuit,
  CircleAlert,
  Clock3,
  Loader2,
  RefreshCw,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import {
  getPrivateHsakaaPatterns,
  type HsakaaPatternInsight,
  type HsakaaPatternResponse,
} from "@/services/hsakaa.service";

function formatDate(value?: string) {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatCategory(value: HsakaaPatternInsight["category"]) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function confidencePercent(value: number) {
  return Math.max(0, Math.min(100, Math.round(value * 100)));
}

export function HsakaaPatternIntelligence() {
  const [report, setReport] = useState<HsakaaPatternResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");
      setReport(await getPrivateHsakaaPatterns());
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to load Pattern Intelligence.",
      );
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    load().catch(() => undefined);
  }, [load]);

  async function refresh() {
    if (isRefreshing) return;

    try {
      setIsRefreshing(true);
      setError("");
      setReport(await getPrivateHsakaaPatterns({ refresh: true }));
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to refresh Pattern Intelligence.",
      );
    } finally {
      setIsRefreshing(false);
    }
  }

  if (isLoading && !report) {
    return (
      <section className="grid min-h-64 place-items-center rounded-[28px] border border-white/10 bg-white/[0.025]">
        <div className="flex items-center gap-3 text-sm text-white/40">
          <Loader2 className="h-5 w-5 animate-spin text-[#C6FF32]" />
          Analysing recurring Personal OS patterns…
        </div>
      </section>
    );
  }

  return (
    <section className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.025]">
      <div className="border-b border-white/10 p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-[#C6FF32]">
              <BrainCircuit className="h-4 w-4" />
              <p className="text-xs font-black uppercase tracking-[0.18em]">
                Pattern Intelligence
              </p>
            </div>

            <h2 className="mt-3 text-2xl font-black tracking-[-0.04em] text-white sm:text-3xl">
              {report?.content.headline ?? "Recurring patterns across your OS"}
            </h2>

            <p className="mt-3 text-sm leading-7 text-white/45">
              {report?.content.overview ??
                "HSAKAA compares recent Personal OS records to find repeated blockers, recurring themes and cross-domain relationships."}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {report ? (
              <div className="inline-flex h-10 items-center gap-2 rounded-2xl border border-white/10 px-3 text-xs font-bold text-white/45">
                <Clock3 className="h-4 w-4" />
                {report.windowDays} days · {report.cached ? "Cached" : "Fresh"}
              </div>
            ) : null}

            <button
              type="button"
              onClick={refresh}
              disabled={isRefreshing}
              className="inline-flex h-10 items-center gap-2 rounded-2xl bg-[#C6FF32] px-4 text-xs font-black text-[#081000] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isRefreshing ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Refresh patterns
            </button>
          </div>
        </div>

        {report ? (
          <p className="mt-4 text-xs text-white/25">
            Generated {formatDate(report.generatedAt)} · Evidence window {formatDate(report.windowStart)} to {formatDate(report.windowEnd)}
          </p>
        ) : null}
      </div>

      {error ? (
        <div className="m-5 flex items-start gap-3 rounded-2xl border border-red-400/20 bg-red-400/[0.06] p-4 text-sm text-red-100/80">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      {report ? (
        <div className="space-y-6 p-5 sm:p-6">
          <div className="grid gap-4 xl:grid-cols-2">
            {report.content.patterns.map((pattern, index) => {
              const confidence = confidencePercent(pattern.confidence);

              return (
                <article
                  key={`${pattern.title}-${index}`}
                  className="rounded-[24px] border border-white/10 bg-black/15 p-5"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-[#C6FF32]/20 bg-[#C6FF32]/[0.06] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#C6FF32]">
                          {formatCategory(pattern.category)}
                        </span>
                        <span className="text-[10px] font-black uppercase tracking-[0.14em] text-white/30">
                          {pattern.significance} significance
                        </span>
                      </div>

                      <h3 className="mt-3 text-lg font-black tracking-[-0.03em] text-white">
                        {pattern.title}
                      </h3>
                    </div>

                    <div className="shrink-0 text-right">
                      <p className="text-lg font-black text-[#C6FF32]">
                        {confidence}%
                      </p>
                      <p className="text-[10px] uppercase tracking-[0.12em] text-white/25">
                        confidence
                      </p>
                    </div>
                  </div>

                  <p className="mt-4 text-sm leading-6 text-white/55">
                    {pattern.observation}
                  </p>
                  <p className="mt-3 text-sm leading-6 text-white/35">
                    <span className="font-bold text-white/55">Why it matters:</span>{" "}
                    {pattern.implication}
                  </p>

                  <div className="mt-5 space-y-2">
                    {pattern.evidence.map((evidence, evidenceIndex) => (
                      <div
                        key={`${evidence.label}-${evidenceIndex}`}
                        className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="text-xs font-black text-white/65">
                            {evidence.label}
                          </p>
                          <p className="text-[10px] uppercase tracking-[0.12em] text-white/25">
                            {evidence.source}
                            {evidence.occurredAt
                              ? ` · ${formatDate(evidence.occurredAt)}`
                              : ""}
                          </p>
                        </div>
                        <p className="mt-1.5 text-xs leading-5 text-white/35">
                          {evidence.detail}
                        </p>
                      </div>
                    ))}
                  </div>

                  <Link
                    href="/admin/hsakaa/chat"
                    className="mt-4 inline-flex items-center gap-2 text-xs font-black text-[#C6FF32] transition hover:brightness-110"
                  >
                    <Sparkles className="h-3.5 w-3.5" />
                    Ask HSAKAA about this
                  </Link>
                  <p className="mt-2 text-xs leading-5 text-white/25">
                    Suggested: “{pattern.suggestedPrompt}”
                  </p>
                </article>
              );
            })}
          </div>

          {report.content.correlations.length ? (
            <div>
              <div className="mb-3 flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-[#C6FF32]" />
                <h3 className="text-sm font-black uppercase tracking-[0.15em] text-white/55">
                  Cross-signals
                </h3>
              </div>

              <div className="grid gap-3 lg:grid-cols-2">
                {report.content.correlations.map((correlation, index) => (
                  <article
                    key={`${correlation.title}-${index}`}
                    className="rounded-[22px] border border-white/10 bg-white/[0.02] p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <h4 className="font-black text-white/80">
                        {correlation.title}
                      </h4>
                      <span className="text-xs font-black text-[#C6FF32]">
                        {confidencePercent(correlation.confidence)}%
                      </span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-white/45">
                      {correlation.relationship}
                    </p>
                    <p className="mt-2 text-xs leading-5 text-white/25">
                      {correlation.caution}
                    </p>
                  </article>
                ))}
              </div>
            </div>
          ) : null}

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-[22px] border border-white/10 bg-white/[0.02] p-4">
              <p className="text-xs font-black uppercase tracking-[0.15em] text-white/35">
                Recurring themes
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {report.content.recurringThemes.length ? (
                  report.content.recurringThemes.map((theme) => (
                    <span
                      key={theme}
                      className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-bold text-white/55"
                    >
                      {theme}
                    </span>
                  ))
                ) : (
                  <p className="text-sm text-white/30">No strong recurring themes yet.</p>
                )}
              </div>
            </div>

            <div className="rounded-[22px] border border-white/10 bg-white/[0.02] p-4">
              <p className="text-xs font-black uppercase tracking-[0.15em] text-white/35">
                Questions worth asking
              </p>
              <div className="mt-3 space-y-2">
                {report.content.suggestedPrompts.map((prompt) => (
                  <p key={prompt} className="text-sm leading-6 text-white/50">
                    • {prompt}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}
