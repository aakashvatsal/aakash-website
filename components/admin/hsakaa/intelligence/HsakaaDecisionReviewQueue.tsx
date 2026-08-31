"use client";

import {
  CalendarClock,
  Check,
  ChevronRight,
  CircleAlert,
  Clock3,
  Loader2,
  RefreshCw,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";

import {
  getPrivateHsakaaDecisionReviewQueue,
  reschedulePrivateHsakaaDecisionReview,
  type HsakaaDecisionReviewQueue,
  type HsakaaDecisionReviewQueueItem,
} from "@/services/hsakaa.service";

const TIMEZONE = "Asia/Kolkata";

function formatDate(value?: string | null) {
  if (!value) return "Unscheduled";
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

function percent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function titleCase(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (item) => item.toUpperCase());
}

const GROUPS: Array<{
  key: keyof Pick<
    HsakaaDecisionReviewQueue,
    "overdue" | "dueToday" | "upcoming" | "unscheduled"
  >;
  label: string;
  helper: string;
}> = [
  {
    key: "overdue",
    label: "Overdue",
    helper: "Review date has passed.",
  },
  {
    key: "dueToday",
    label: "Due today",
    helper: "Enough time may have passed to inspect the outcome.",
  },
  {
    key: "upcoming",
    label: "Upcoming",
    helper: "Scheduled follow-ups that are not due yet.",
  },
  {
    key: "unscheduled",
    label: "Unscheduled",
    helper: "Committed decisions without a review date.",
  },
];

function ReviewCard({
  item,
  draftDate,
  isSaving,
  onDateChange,
  onSaveDate,
  onOpen,
}: {
  item: HsakaaDecisionReviewQueueItem;
  draftDate: string;
  isSaving: boolean;
  onDateChange: (value: string) => void;
  onSaveDate: () => void;
  onOpen: () => void;
}) {
  return (
    <article className="rounded-2xl border border-white/8 bg-black/15 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-lg border border-white/8 px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-white/30">
              {titleCase(item.horizon)} horizon
            </span>
            {item.adaptiveFollowUp ? (
              <span className="rounded-lg border border-amber-300/15 bg-amber-300/[0.05] px-2 py-1 text-[9px] font-black uppercase tracking-[0.12em] text-amber-200/60">
                Too early · follow up again
              </span>
            ) : null}
          </div>
          <h4 className="mt-2 text-sm font-black leading-5 text-white/70">
            {item.question}
          </h4>
          <p className="mt-1 text-xs text-white/35">
            Chosen: <span className="font-bold text-white/50">{item.selectedOptionLabel}</span>
          </p>
        </div>

        <button
          type="button"
          onClick={onOpen}
          className="inline-flex items-center gap-1.5 rounded-xl border border-[#C6FF32]/20 bg-[#C6FF32]/[0.05] px-3 py-2 text-[10px] font-black uppercase tracking-[0.1em] text-[#C6FF32] transition hover:bg-[#C6FF32]/10"
        >
          Open review
          <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <div className="rounded-xl border border-white/6 bg-white/[0.015] p-3 text-xs text-white/30">
          <p className="text-[9px] font-black uppercase tracking-[0.12em] text-white/20">
            Current review date
          </p>
          <p className="mt-1 font-bold text-white/45">{formatDate(item.reviewAt)}</p>
        </div>
        <div className="rounded-xl border border-[#C6FF32]/8 bg-[#C6FF32]/[0.02] p-3 text-xs text-white/30">
          <p className="text-[9px] font-black uppercase tracking-[0.12em] text-[#C6FF32]/40">
            Horizon suggestion
          </p>
          <p className="mt-1 font-bold text-white/45">{formatDate(item.suggestedReviewAt)}</p>
        </div>
      </div>

      {item.evidencePrompts.length ? (
        <div className="mt-3 rounded-xl border border-white/6 bg-white/[0.01] p-3">
          <p className="text-[9px] font-black uppercase tracking-[0.12em] text-white/20">
            Evidence to bring back
          </p>
          <ul className="mt-2 space-y-1.5 text-xs leading-5 text-white/35">
            {item.evidencePrompts.slice(0, 2).map((prompt) => (
              <li key={prompt}>• {prompt}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-end">
        <label className="grid flex-1 gap-1.5">
          <span className="text-[9px] font-black uppercase tracking-[0.12em] text-white/20">
            Schedule / reschedule
          </span>
          <input
            type="date"
            value={draftDate}
            onChange={(event) => onDateChange(event.target.value)}
            className="h-10 rounded-xl border border-white/10 bg-[#080b0d] px-3 text-xs text-white/60 outline-none focus:border-[#C6FF32]/30"
          />
        </label>
        <button
          type="button"
          onClick={onSaveDate}
          disabled={isSaving || !draftDate}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-white/10 px-3 text-[10px] font-black uppercase tracking-[0.1em] text-white/45 transition hover:border-[#C6FF32]/20 hover:text-[#C6FF32] disabled:opacity-40"
        >
          {isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Check className="h-3.5 w-3.5" />}
          Save date
        </button>
      </div>

      <p className="mt-2 text-[9px] leading-4 text-white/18">
        Frozen baseline: {item.baseline.recommendationOptionLabel ?? "No clear recommendation"} · {percent(item.baseline.confidence)} confidence. Rescheduling changes only the review date.
      </p>
    </article>
  );
}

export function HsakaaDecisionReviewQueue({
  onOpenDecision,
  refreshKey = 0,
}: {
  onOpenDecision: (decisionId: string) => void | Promise<void>;
  refreshKey?: number;
}) {
  const [queue, setQueue] = useState<HsakaaDecisionReviewQueue | null>(null);
  const [dates, setDates] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadQueue = useCallback(async () => {
    setIsLoading(true);
    setError("");
    try {
      const response = await getPrivateHsakaaDecisionReviewQueue();
      setQueue(response);
      const nextDates: Record<string, string> = {};
      for (const item of [
        ...response.overdue,
        ...response.dueToday,
        ...response.upcoming,
        ...response.unscheduled,
      ]) {
        if (!item.id) continue;
        nextDates[item.id] = dateInputValue(item.reviewAt ?? item.suggestedReviewAt);
      }
      setDates(nextDates);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load decision reviews.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadQueue();
  }, [loadQueue, refreshKey]);

  const total = queue?.counts.total ?? 0;
  const countCards = useMemo(
    () => [
      ["Overdue", queue?.counts.overdue ?? 0],
      ["Due today", queue?.counts.dueToday ?? 0],
      ["Upcoming", queue?.counts.upcoming ?? 0],
      ["Unscheduled", queue?.counts.unscheduled ?? 0],
    ] as const,
    [queue],
  );

  async function saveDate(item: HsakaaDecisionReviewQueueItem) {
    if (!item.id || !dates[item.id]) return;
    setSavingId(item.id);
    setError("");
    setMessage("");
    try {
      await reschedulePrivateHsakaaDecisionReview(item.id, toApiDate(dates[item.id]));
      setMessage("Review date updated without changing the frozen decision baseline.");
      await loadQueue();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not update the review date.");
    } finally {
      setSavingId("");
    }
  }

  return (
    <section className="rounded-[24px] border border-white/10 bg-black/15 p-4 md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#C6FF32]">
            <CalendarClock className="h-4 w-4" />
            <p className="text-xs font-black uppercase tracking-[0.18em]">Decision Review Queue</p>
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/40">
            Pending decision follow-ups grouped by timing, with evidence prompts pulled from the original frozen Decision Lab analysis. Queue calculation is deterministic and uses zero OpenAI calls.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void loadQueue()}
          disabled={isLoading}
          className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs font-black text-white/45 transition hover:text-white disabled:opacity-50"
        >
          {isLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
          Refresh
        </button>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 md:grid-cols-4">
        {countCards.map(([label, value]) => (
          <div key={label} className="rounded-2xl border border-white/8 bg-white/[0.015] p-3">
            <p className="text-[9px] font-black uppercase tracking-[0.12em] text-white/20">{label}</p>
            <p className="mt-1 text-xl font-black text-white/65">{isLoading ? "—" : value}</p>
          </div>
        ))}
      </div>

      {error ? (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-rose-400/15 bg-rose-400/5 px-3 py-2 text-xs text-rose-200/70">
          <CircleAlert className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          {error}
        </div>
      ) : null}

      {message ? (
        <div className="mt-3 flex items-start gap-2 rounded-xl border border-[#C6FF32]/15 bg-[#C6FF32]/[0.04] px-3 py-2 text-xs text-[#E9FFC0]/70">
          <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#C6FF32]" />
          {message}
        </div>
      ) : null}

      {!isLoading && total === 0 ? (
        <div className="mt-4 flex items-center gap-3 rounded-2xl border border-white/8 bg-white/[0.01] p-4 text-sm text-white/35">
          <Clock3 className="h-4 w-4 text-[#C6FF32]/55" />
          No pending decision reviews. New recorded choices will appear here automatically.
        </div>
      ) : null}

      {queue && total > 0 ? (
        <div className="mt-5 space-y-5">
          {GROUPS.map((group) => {
            const items = queue[group.key];
            if (!items.length) return null;
            return (
              <div key={group.key}>
                <div className="mb-2 flex flex-wrap items-end justify-between gap-2">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-white/40">{group.label}</p>
                    <p className="mt-1 text-[10px] text-white/20">{group.helper}</p>
                  </div>
                  <span className="text-[10px] font-bold text-white/20">{items.length} decision{items.length === 1 ? "" : "s"}</span>
                </div>
                <div className="grid gap-3 xl:grid-cols-2">
                  {items.map((item) => (
                    <ReviewCard
                      key={item.id ?? `${item.question}-${item.committedAt}`}
                      item={item}
                      draftDate={item.id ? dates[item.id] ?? "" : ""}
                      isSaving={savingId === item.id}
                      onDateChange={(value) => {
                        if (!item.id) return;
                        setDates((current) => ({ ...current, [item.id as string]: value }));
                      }}
                      onSaveDate={() => void saveDate(item)}
                      onOpen={() => {
                        if (item.id) void onOpenDecision(item.id);
                      }}
                    />
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}
    </section>
  );
}
