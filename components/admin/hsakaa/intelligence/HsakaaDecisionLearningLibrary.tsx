"use client";

import {
  BookOpenCheck,
  BrainCircuit,
  CircleAlert,
  Filter,
  Loader2,
  Search,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import {
  getPrivateHsakaaDecisionLearnings,
  type HsakaaDecisionCalibrationLabel,
  type HsakaaDecisionHorizon,
  type HsakaaDecisionLearningLibraryResponse,
  type HsakaaDecisionLearningStatus,
} from "@/services/hsakaa.service";

type FollowedFilter = "all" | "followed" | "not_followed";

function titleCase(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
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

export function HsakaaDecisionLearningLibrary({
  refreshKey = 0,
  onOpenDecision,
}: {
  refreshKey?: number;
  onOpenDecision?: (decisionId: string) => void | Promise<void>;
}) {
  const [payload, setPayload] =
    useState<HsakaaDecisionLearningLibraryResponse | null>(null);
  const [search, setSearch] = useState("");
  const [horizon, setHorizon] = useState<"all" | HsakaaDecisionHorizon>("all");
  const [status, setStatus] = useState<"all" | HsakaaDecisionLearningStatus>(
    "all",
  );
  const [calibration, setCalibration] = useState<
    "all" | HsakaaDecisionCalibrationLabel
  >("all");
  const [followed, setFollowed] = useState<FollowedFilter>("all");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;

    async function load() {
      try {
        setIsLoading(true);
        setError("");
        const response = await getPrivateHsakaaDecisionLearnings({ limit: 100 });
        if (active) setPayload(response);
      } catch (cause) {
        if (!active) return;
        setError(
          cause instanceof Error
            ? cause.message
            : "Could not load the Decision Lessons Library.",
        );
      } finally {
        if (active) setIsLoading(false);
      }
    }

    void load();
    return () => {
      active = false;
    };
  }, [refreshKey]);

  const filtered = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    return (payload?.data ?? []).filter((item) => {
      if (horizon !== "all" && item.horizon !== horizon) return false;
      if (status !== "all" && item.status !== status) return false;
      if (calibration !== "all" && item.calibration !== calibration) return false;
      if (followed === "followed" && item.recommendationFollowed !== true) {
        return false;
      }
      if (
        followed === "not_followed" &&
        item.recommendationFollowed !== false
      ) {
        return false;
      }
      if (!normalizedSearch) return true;

      const searchable = [
        item.question,
        item.summary,
        item.selectedOptionLabel,
        item.recommendationOptionLabel ?? "",
        ...item.lessons,
        ...item.surprises,
        ...item.futureAdjustments,
      ]
        .join(" ")
        .toLowerCase();

      return searchable.includes(normalizedSearch);
    });
  }, [calibration, followed, horizon, payload, search, status]);

  return (
    <section className="rounded-[24px] border border-white/10 bg-black/15 p-4 md:p-5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#C6FF32]">
            <BookOpenCheck className="h-4 w-4" />
            <p className="text-xs font-black uppercase tracking-[0.16em]">
              Decision Lessons Library
            </p>
          </div>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/40">
            Reusable lessons come only from completed positive, mixed or negative
            outcome reviews. Too-early and abandoned reviews are deliberately
            excluded from the learning corpus.
          </p>
        </div>
        <div className="rounded-xl border border-white/8 bg-white/[0.02] px-3 py-2 text-right">
          <p className="text-lg font-black text-white/70">
            {payload?.counts.eligible ?? 0}
          </p>
          <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/25">
            reusable reviews
          </p>
        </div>
      </div>

      {(payload?.counts.eligible ?? 0) < 3 ? (
        <div className="mt-4 flex items-start gap-2 rounded-2xl border border-amber-300/15 bg-amber-300/[0.025] p-3 text-xs leading-5 text-amber-100/45">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          Sample size is still small. HSAKAA can recall individual lessons, but it
          should not treat them as a reliable personal decision pattern yet.
        </div>
      ) : null}

      <div className="mt-4 grid gap-2 md:grid-cols-2 xl:grid-cols-5">
        <label className="relative md:col-span-2 xl:col-span-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-white/20" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search lessons"
            className="w-full rounded-xl border border-white/10 bg-black/20 py-2.5 pl-9 pr-3 text-xs text-white/65 outline-none placeholder:text-white/20 focus:border-[#C6FF32]/25"
          />
        </label>
        <select
          value={horizon}
          onChange={(event) =>
            setHorizon(event.target.value as "all" | HsakaaDecisionHorizon)
          }
          className="rounded-xl border border-white/10 bg-[#070A0B] px-3 py-2.5 text-xs text-white/50 outline-none focus:border-[#C6FF32]/25"
        >
          <option value="all">All horizons</option>
          <option value="today">Today</option>
          <option value="weeks">Weeks</option>
          <option value="months">Months</option>
          <option value="years">Years</option>
        </select>
        <select
          value={status}
          onChange={(event) =>
            setStatus(event.target.value as "all" | HsakaaDecisionLearningStatus)
          }
          className="rounded-xl border border-white/10 bg-[#070A0B] px-3 py-2.5 text-xs text-white/50 outline-none focus:border-[#C6FF32]/25"
        >
          <option value="all">All outcomes</option>
          <option value="positive">Positive</option>
          <option value="mixed">Mixed</option>
          <option value="negative">Negative</option>
        </select>
        <select
          value={calibration}
          onChange={(event) =>
            setCalibration(
              event.target.value as "all" | HsakaaDecisionCalibrationLabel,
            )
          }
          className="rounded-xl border border-white/10 bg-[#070A0B] px-3 py-2.5 text-xs text-white/50 outline-none focus:border-[#C6FF32]/25"
        >
          <option value="all">All calibration</option>
          <option value="well_calibrated">Well calibrated</option>
          <option value="overconfident">Overconfident</option>
          <option value="underconfident">Underconfident</option>
          <option value="not_enough_evidence">Not enough evidence</option>
        </select>
        <select
          value={followed}
          onChange={(event) => setFollowed(event.target.value as FollowedFilter)}
          className="rounded-xl border border-white/10 bg-[#070A0B] px-3 py-2.5 text-xs text-white/50 outline-none focus:border-[#C6FF32]/25"
        >
          <option value="all">Recommendation: any</option>
          <option value="followed">Followed</option>
          <option value="not_followed">Not followed</option>
        </select>
      </div>

      <div className="mt-3 flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.12em] text-white/20">
        <Filter className="h-3 w-3" />
        {filtered.length} matching lesson{filtered.length === 1 ? "" : "s"}
      </div>

      {isLoading ? (
        <div className="mt-4 flex items-center gap-2 rounded-2xl border border-white/8 p-4 text-xs text-white/30">
          <Loader2 className="h-4 w-4 animate-spin" /> Loading reviewed decisions…
        </div>
      ) : error ? (
        <div className="mt-4 rounded-2xl border border-rose-300/15 bg-rose-300/[0.02] p-4 text-xs text-rose-100/45">
          {error}
        </div>
      ) : filtered.length ? (
        <div className="mt-4 grid gap-3 lg:grid-cols-2">
          {filtered.map((item) => (
            <article
              key={item.id ?? `${item.question}-${item.recordedAt}`}
              className="rounded-[20px] border border-white/8 bg-white/[0.015] p-4"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black leading-5 text-white/65">
                    {item.question}
                  </p>
                  <p className="mt-1 text-[10px] text-white/20">
                    {formatDate(item.recordedAt)} · {titleCase(item.horizon)} ·{" "}
                    {titleCase(item.decisionType)}
                  </p>
                </div>
                <span className="rounded-lg border border-white/8 px-2 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-white/35">
                  {titleCase(item.status)}
                </span>
              </div>

              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                <div className="rounded-xl bg-black/15 p-2.5">
                  <p className="text-[9px] font-black uppercase tracking-[0.12em] text-white/20">
                    Chosen
                  </p>
                  <p className="mt-1 text-xs font-bold text-white/50">
                    {item.selectedOptionLabel}
                  </p>
                </div>
                <div className="rounded-xl bg-black/15 p-2.5">
                  <p className="text-[9px] font-black uppercase tracking-[0.12em] text-white/20">
                    Original recommendation
                  </p>
                  <p className="mt-1 text-xs font-bold text-white/50">
                    {item.recommendationOptionLabel ?? "No clear recommendation"}
                  </p>
                </div>
              </div>

              <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-white/30">
                <span className="rounded-lg border border-white/8 px-2 py-1">
                  {titleCase(item.calibration)}
                </span>
                <span className="rounded-lg border border-white/8 px-2 py-1">
                  Baseline {Math.round(item.baselineConfidence * 100)}%
                </span>
                <span className="rounded-lg border border-white/8 px-2 py-1">
                  {item.recommendationFollowed === null
                    ? "No recommendation to follow"
                    : item.recommendationFollowed
                      ? "Recommendation followed"
                      : "Recommendation not followed"}
                </span>
              </div>

              <p className="mt-3 text-xs leading-5 text-white/35">{item.summary}</p>

              {item.lessons.length ? (
                <div className="mt-3">
                  <div className="flex items-center gap-1.5 text-[#C6FF32]/55">
                    <BrainCircuit className="h-3.5 w-3.5" />
                    <p className="text-[10px] font-black uppercase tracking-[0.12em]">
                      Reusable lessons
                    </p>
                  </div>
                  <ul className="mt-2 space-y-1.5 text-xs leading-5 text-white/40">
                    {item.lessons.slice(0, 4).map((lesson) => (
                      <li key={lesson}>• {lesson}</li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {item.surprises.length || item.futureAdjustments.length ? (
                <div className="mt-3 grid gap-2 sm:grid-cols-2">
                  {item.surprises.length ? (
                    <div className="rounded-xl border border-white/8 bg-black/10 p-2.5">
                      <p className="text-[9px] font-black uppercase tracking-[0.12em] text-white/20">
                        Surprises / failed assumptions
                      </p>
                      <p className="mt-1 text-xs leading-5 text-white/35">
                        {item.surprises[0]}
                      </p>
                    </div>
                  ) : null}
                  {item.futureAdjustments.length ? (
                    <div className="rounded-xl border border-white/8 bg-black/10 p-2.5">
                      <p className="text-[9px] font-black uppercase tracking-[0.12em] text-white/20">
                        Reuse next time
                      </p>
                      <p className="mt-1 text-xs leading-5 text-white/35">
                        {item.futureAdjustments[0]}
                      </p>
                    </div>
                  ) : null}
                </div>
              ) : null}

              {item.id && onOpenDecision ? (
                <button
                  type="button"
                  onClick={() => void onOpenDecision(item.id!)}
                  className="mt-4 text-[10px] font-black uppercase tracking-[0.12em] text-[#C6FF32]/55 transition hover:text-[#C6FF32]"
                >
                  Open reviewed decision →
                </button>
              ) : null}
            </article>
          ))}
        </div>
      ) : (
        <div className="mt-4 rounded-2xl border border-white/8 p-4 text-xs leading-5 text-white/30">
          No reviewed decisions match these filters yet.
        </div>
      )}
    </section>
  );
}
