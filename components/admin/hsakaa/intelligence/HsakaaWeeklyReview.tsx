"use client";

import {
  AlertTriangle,
  CheckCircle2,
  CircleHelp,
  Compass,
  Lightbulb,
  Loader2,
  RefreshCw,
  Scale,
  Sparkles,
  Target,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";

import {
  getPrivateHsakaaWeeklyReview,
  type HsakaaWeeklyEvidence,
  type HsakaaWeeklyReviewResponse,
} from "@/services/hsakaa.service";

function formatDate(value?: string) {
  if (!value) return "Unknown";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Unknown";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function Evidence({ items }: { items: HsakaaWeeklyEvidence[] }) {
  if (!items.length) return null;

  return (
    <div className="mt-3 space-y-2 border-t border-white/10 pt-3">
      {items.map((item, index) => (
        <div
          key={`${item.source}-${item.label}-${index}`}
          className="rounded-xl bg-black/20 px-3 py-2"
        >
          <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-white/25">
            <span>{item.source.replaceAll("_", " ")}</span>
            {item.occurredAt ? <span>· {formatDate(item.occurredAt)}</span> : null}
          </div>
          <p className="mt-1 text-xs font-bold text-white/60">{item.label}</p>
          <p className="mt-1 text-xs leading-5 text-white/35">{item.detail}</p>
        </div>
      ))}
    </div>
  );
}

function SectionCard({
  title,
  icon: Icon,
  children,
}: {
  title: string;
  icon: typeof CheckCircle2;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5">
      <div className="flex items-center gap-2 text-[#C6FF32]">
        <Icon className="h-4 w-4" />
        <p className="text-xs font-black uppercase tracking-[0.18em]">{title}</p>
      </div>
      <div className="mt-4 space-y-3">{children}</div>
    </section>
  );
}

export function HsakaaWeeklyReview() {
  const [review, setReview] = useState<HsakaaWeeklyReviewResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async (refresh = false) => {
    try {
      if (refresh) {
        setIsRefreshing(true);
      } else {
        setIsLoading(true);
      }
      setError("");
      const result = await getPrivateHsakaaWeeklyReview({ refresh });
      setReview(result);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to load the Weekly Review.",
      );
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, []);

  useEffect(() => {
    load().catch(() => undefined);
  }, [load]);

  if (isLoading) {
    return (
      <section className="grid min-h-56 place-items-center rounded-[26px] border border-white/10 bg-white/[0.02] text-white/30">
        <Loader2 className="h-5 w-5 animate-spin" />
      </section>
    );
  }

  if (error || !review) {
    return (
      <section className="rounded-[26px] border border-red-400/20 bg-red-400/[0.05] p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-red-200/60">
              Weekly Review
            </p>
            <p className="mt-2 text-sm text-red-100/70">
              {error || "HSAKAA could not load the weekly review."}
            </p>
          </div>
          <button
            type="button"
            onClick={() => load(true)}
            className="rounded-xl border border-white/10 px-3 py-2 text-xs font-black text-white/60"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  const content = review.content;

  return (
    <div className="space-y-4">
      <section className="rounded-[28px] border border-[#C6FF32]/15 bg-[#C6FF32]/[0.035] p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 text-[#C6FF32]">
              <Scale className="h-4 w-4" />
              <p className="text-xs font-black uppercase tracking-[0.18em]">
                Weekly Review · Decision Intelligence
              </p>
              <span className="rounded-full bg-white/[0.06] px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white/35">
                {review.cached ? "Cached" : "Fresh"}
              </span>
            </div>

            <h2 className="mt-3 text-2xl font-black tracking-[-0.045em] text-white sm:text-3xl">
              {content.headline}
            </h2>
            <p className="mt-3 text-sm leading-7 text-white/50">{content.summary}</p>
            <p className="mt-4 text-xs font-bold text-white/25">
              Week from {formatDate(review.weekStart)} · generated {formatDate(review.generatedAt)}
            </p>
          </div>

          <button
            type="button"
            onClick={() => load(true)}
            disabled={isRefreshing}
            className="inline-flex h-11 shrink-0 items-center justify-center gap-2 rounded-2xl border border-[#C6FF32]/20 bg-[#C6FF32]/10 px-4 text-sm font-black text-[#DFFF8E] transition hover:bg-[#C6FF32]/15 disabled:opacity-50"
          >
            {isRefreshing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            Refresh review
          </button>
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard title="Wins" icon={CheckCircle2}>
          {content.wins.length ? (
            content.wins.map((item) => (
              <article key={item.title} className="rounded-2xl border border-white/10 bg-black/15 p-4">
                <p className="font-black text-white/80">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-white/45">{item.detail}</p>
                <Evidence items={item.evidence} />
              </article>
            ))
          ) : (
            <p className="text-sm text-white/30">No evidence-backed wins identified yet.</p>
          )}
        </SectionCard>

        <SectionCard title="Misses / gaps" icon={AlertTriangle}>
          {content.misses.length ? (
            content.misses.map((item) => (
              <article key={item.title} className="rounded-2xl border border-white/10 bg-black/15 p-4">
                <p className="font-black text-white/80">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-white/45">{item.detail}</p>
                <Evidence items={item.evidence} />
              </article>
            ))
          ) : (
            <p className="text-sm text-white/30">No clear execution misses identified.</p>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard title="Decisions" icon={Compass}>
          {content.decisions.length ? (
            content.decisions.map((item) => (
              <article key={item.title} className="rounded-2xl border border-white/10 bg-black/15 p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-black text-white/80">{item.title}</p>
                  <span className="rounded-full bg-white/[0.06] px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white/40">
                    {item.status}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-white/60">{item.decision}</p>
                <p className="mt-2 text-xs leading-5 text-white/35">{item.rationale}</p>
                <Evidence items={item.evidence} />
              </article>
            ))
          ) : (
            <p className="text-sm text-white/30">No supported decisions identified in this week’s records.</p>
          )}
        </SectionCard>

        <SectionCard title="Lessons" icon={Lightbulb}>
          {content.lessons.length ? (
            content.lessons.map((item) => (
              <article key={item.title} className="rounded-2xl border border-white/10 bg-black/15 p-4">
                <p className="font-black text-white/80">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-white/50">{item.lesson}</p>
                <Evidence items={item.evidence} />
              </article>
            ))
          ) : (
            <p className="text-sm text-white/30">No strong evidence-backed lesson yet.</p>
          )}
        </SectionCard>
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <SectionCard title="Still unresolved" icon={CircleHelp}>
          {content.unresolved.length ? (
            content.unresolved.map((item) => (
              <article key={item.title} className="rounded-2xl border border-white/10 bg-black/15 p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-black text-white/80">{item.title}</p>
                  <span className="text-[10px] font-black uppercase tracking-[0.12em] text-white/30">
                    {item.urgency}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-white/45">{item.reason}</p>
                <Evidence items={item.evidence} />
              </article>
            ))
          ) : (
            <p className="text-sm text-white/30">Nothing clearly unresolved from the available evidence.</p>
          )}
        </SectionCard>

        <SectionCard title="Next-week priorities" icon={Target}>
          {content.nextWeekPriorities.length ? (
            content.nextWeekPriorities.map((item) => (
              <article key={item.title} className="rounded-2xl border border-[#C6FF32]/10 bg-[#C6FF32]/[0.025] p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-black text-white/85">{item.title}</p>
                  <span className="text-[10px] font-black uppercase tracking-[0.12em] text-[#C6FF32]/60">
                    {item.urgency}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-white/45">{item.reason}</p>
                <p className="mt-3 rounded-xl bg-black/20 px-3 py-2 text-xs leading-5 text-[#DFFF8E]/70">
                  Ask HSAKAA: {item.prompt}
                </p>
                <Evidence items={item.evidence} />
              </article>
            ))
          ) : (
            <p className="text-sm text-white/30">No next-week priorities are strongly supported yet.</p>
          )}
        </SectionCard>
      </div>

      {content.questions.length ? (
        <section className="rounded-[24px] border border-white/10 bg-white/[0.02] p-5">
          <div className="flex items-center gap-2 text-[#C6FF32]">
            <Sparkles className="h-4 w-4" />
            <p className="text-xs font-black uppercase tracking-[0.18em]">
              Questions worth asking
            </p>
          </div>
          <div className="mt-4 grid gap-2 md:grid-cols-2">
            {content.questions.map((question) => (
              <div
                key={question}
                className="rounded-2xl border border-white/10 bg-black/15 px-4 py-3 text-sm leading-6 text-white/50"
              >
                {question}
              </div>
            ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}
