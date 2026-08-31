"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import {
  ArrowRight,
  BrainCircuit,
  CircleAlert,
  HeartPulse,
  Lightbulb,
  ListChecks,
  LoaderCircle,
  RefreshCcw,
  Sparkles,
  TriangleAlert,
} from "lucide-react";

import {
  getPrivateHsakaaDailyBrief,
  refreshPrivateHsakaaDailyBrief,
  type HsakaaBriefSignal,
  type HsakaaDailyBriefResponse,
} from "@/services/hsakaa.service";

function signalClasses(status: HsakaaBriefSignal["status"]) {
  switch (status) {
    case "good":
      return "border-[#C6FF32]/20 bg-[#C6FF32]/[0.07] text-[#C6FF32]";
    case "attention":
      return "border-red-400/20 bg-red-400/[0.07] text-red-200";
    case "watch":
      return "border-amber-300/20 bg-amber-300/[0.06] text-amber-200";
    default:
      return "border-white/10 bg-white/[0.03] text-white/45";
  }
}

function signalLabel(status: HsakaaBriefSignal["status"]) {
  return status === "attention"
    ? "Attention"
    : status.charAt(0).toUpperCase() + status.slice(1);
}

export function HsakaaDailyBrief() {
  const [brief, setBrief] =
    useState<HsakaaDailyBriefResponse | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    let active = true;

    getPrivateHsakaaDailyBrief()
      .then((result) => {
        if (!active) return;
        setBrief(result);
        setError("");
      })
      .catch((caughtError: unknown) => {
        if (!active) return;
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Could not load today's HSAKAA brief.",
        );
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  async function handleRefresh() {
    setRefreshing(true);
    setError("");

    try {
      setBrief(await refreshPrivateHsakaaDailyBrief());
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Could not refresh today's HSAKAA brief.",
      );
    } finally {
      setRefreshing(false);
    }
  }

  if (loading) {
    return (
      <section className="rounded-[28px] border border-[#C6FF32]/15 bg-[#C6FF32]/[0.025] p-6">
        <div className="flex items-center gap-3 text-white/55">
          <LoaderCircle className="h-5 w-5 animate-spin text-[#C6FF32]" />
          <span className="text-sm font-bold">
            HSAKAA is preparing today&apos;s brief…
          </span>
        </div>
      </section>
    );
  }

  if (!brief) {
    return (
      <section className="rounded-[28px] border border-red-400/20 bg-red-400/[0.05] p-6">
        <div className="flex items-start gap-3">
          <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-300" />
          <div className="flex-1">
            <p className="font-bold text-red-100">
              Daily Brief unavailable
            </p>
            <p className="mt-1 text-sm leading-6 text-red-100/55">
              {error || "HSAKAA could not generate today's brief."}
            </p>
            <button
              type="button"
              onClick={handleRefresh}
              disabled={refreshing}
              className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl border border-red-300/20 px-4 text-sm font-bold text-red-100 transition hover:bg-red-300/10 disabled:opacity-50"
            >
              <RefreshCcw
                className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
              />
              Try again
            </button>
          </div>
        </div>
      </section>
    );
  }

  const content = brief.content;
  const signals = [
    ["Tasks", content.signals.tasks, ListChecks],
    ["Reminders", content.signals.reminders, Sparkles],
    ["Health", content.signals.health, HeartPulse],
    ["Mental load", content.signals.mentalLoad, BrainCircuit],
  ] as const;

  return (
    <section className="overflow-hidden rounded-[28px] border border-[#C6FF32]/15 bg-gradient-to-br from-[#C6FF32]/[0.055] via-white/[0.02] to-transparent">
      <div className="flex flex-col gap-5 border-b border-white/10 p-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-[#C6FF32]">
            <Sparkles className="h-4 w-4" />
            Today&apos;s HSAKAA brief
          </div>
          <p className="mt-4 text-sm font-bold text-white/45">
            {content.greeting}
          </p>
          <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-white sm:text-3xl">
            {content.headline}
          </h2>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-white/50">
            {content.summary}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-2">
          <span className="hidden text-xs text-white/25 sm:inline">
            {brief.cached ? "Cached today" : "Freshly generated"}
          </span>
          <button
            type="button"
            onClick={handleRefresh}
            disabled={refreshing}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 px-4 text-sm font-bold text-white/55 transition hover:border-[#C6FF32]/25 hover:text-[#C6FF32] disabled:opacity-50"
          >
            <RefreshCcw
              className={`h-4 w-4 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh
          </button>
        </div>
      </div>

      <div className="grid gap-3 border-b border-white/10 p-6 sm:grid-cols-2 xl:grid-cols-4">
        {signals.map(([label, signal, Icon]) => (
          <article
            key={label}
            className="rounded-2xl border border-white/[0.08] bg-black/15 p-4"
          >
            <div className="flex items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm font-black text-white">
                <Icon className="h-4 w-4 text-white/40" />
                {label}
              </div>
              <span
                className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${signalClasses(signal.status)}`}
              >
                {signalLabel(signal.status)}
              </span>
            </div>
            <p className="mt-3 text-xs leading-5 text-white/40">
              {signal.text}
            </p>
          </article>
        ))}
      </div>

      <div className="grid gap-6 p-6 xl:grid-cols-3">
        <div>
          <div className="flex items-center gap-2">
            <ListChecks className="h-4 w-4 text-[#C6FF32]" />
            <h3 className="font-black text-white">Priorities</h3>
          </div>
          <div className="mt-4 space-y-3">
            {content.priorities.length ? (
              content.priorities.map((item, index) => (
                <div
                  key={`${item.title}-${index}`}
                  className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <p className="font-bold text-white">{item.title}</p>
                    <span className="text-[10px] font-black uppercase tracking-wider text-white/30">
                      {item.urgency}
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-white/40">
                    {item.reason}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-white/35">No priority is clearly dominant.</p>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <TriangleAlert className="h-4 w-4 text-amber-200" />
            <h3 className="font-black text-white">Risks</h3>
          </div>
          <div className="mt-4 space-y-3">
            {content.risks.length ? (
              content.risks.map((item, index) => (
                <div
                  key={`${item.title}-${index}`}
                  className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4"
                >
                  <p className="font-bold text-white">{item.title}</p>
                  <p className="mt-2 text-xs leading-5 text-white/40">
                    {item.reason}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-white/35">No material risk is visible.</p>
            )}
          </div>
        </div>

        <div>
          <div className="flex items-center gap-2">
            <Lightbulb className="h-4 w-4 text-[#C6FF32]" />
            <h3 className="font-black text-white">Opportunities</h3>
          </div>
          <div className="mt-4 space-y-3">
            {content.opportunities.length ? (
              content.opportunities.map((item, index) => (
                <div
                  key={`${item.title}-${index}`}
                  className="rounded-2xl border border-white/[0.08] bg-white/[0.025] p-4"
                >
                  <p className="font-bold text-white">{item.title}</p>
                  <p className="mt-2 text-xs leading-5 text-white/40">
                    {item.reason}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-sm text-white/35">No clear opportunity surfaced.</p>
            )}
          </div>
        </div>
      </div>

      {content.suggestedActions.length ? (
        <div className="border-t border-white/10 p-6">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#C6FF32]">
                Suggested next actions
              </p>
              <p className="mt-2 text-sm text-white/40">
                Suggestions only. Any Personal OS write still requires Phase 2 confirmation.
              </p>
            </div>
            <Link
              href="/admin/hsakaa/chat"
              className="inline-flex items-center gap-2 text-sm font-black text-[#C6FF32]"
            >
              Open private chat
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {content.suggestedActions.map((action, index) => (
              <article
                key={`${action.title}-${index}`}
                className="rounded-2xl border border-white/[0.08] bg-black/15 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <p className="font-bold text-white">{action.title}</p>
                  <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] font-black uppercase tracking-wider text-white/30">
                    {action.kind}
                  </span>
                </div>
                <p className="mt-2 text-xs leading-5 text-white/40">
                  {action.reason}
                </p>
                <p className="mt-3 rounded-xl border border-white/[0.07] bg-white/[0.025] px-3 py-2 text-xs leading-5 text-white/55">
                  {action.prompt}
                </p>
              </article>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}
