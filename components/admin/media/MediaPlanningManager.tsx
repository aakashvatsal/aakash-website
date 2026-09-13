"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Archive,
  CalendarDays,
  Check,
  Clipboard,
  Clock3,
  ImageIcon,
  MessageCircle,
  RefreshCw,
  Sparkles,
  Video,
} from "lucide-react";
import {
  getLatestMediaPlanningGeneration,
  getMediaPlanningGeneration,
  startMediaPlanningGeneration,
} from "@/lib/api/media";
import type {
  MediaPlanningCarouselSlide,
  MediaPlanningCycle,
  MediaPlanningDailyStory,
  MediaPlanningExecution,
  MediaPlanningGenerationJob,
  MediaPlanningOverview,
  MediaPlanningTimedDirection,
  MediaPlanningYoutubeCommunityPost,
  MediaPublicIdentityPillar,
} from "@/types/media";

const labels: Record<string, string> = {
  linkedin: "LinkedIn",
  instagram: "Instagram",
  youtube: "YouTube",
  x: "X",
  whatsapp: "WhatsApp",
};

const pillarLabels: Record<MediaPublicIdentityPillar, string> = {
  builder_operator: "Builder / operator",
  ideas_thinking: "Ideas / thinking",
  learning_experiments: "Learning / experiments",
  building_aakash: "Building Aakash",
  human_unfiltered: "Human / unfiltered",
};

function safeArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : [];
}

export function MediaPlanningManager({
  initialOverview,
}: {
  initialOverview: MediaPlanningOverview;
}) {
  const router = useRouter();
  const [notes, setNotes] = useState("");
  const [outingStatus, setOutingStatus] = useState<
    "yes" | "no" | "maybe" | "unknown"
  >(initialOverview.rolling?.weekContext?.outingStatus ?? "unknown");
  const [outingDetails, setOutingDetails] = useState(
    initialOverview.rolling?.weekContext?.outingDetails ?? "",
  );
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [generationJob, setGenerationJob] =
    useState<MediaPlanningGenerationJob | null>(null);
  const [refreshingDate, setRefreshingDate] = useState<string | null>(null);
  const plan = initialOverview.latest;
  const isGenerating = generationJob?.status === "generating";
  const generationJobId = generationJob?.jobId;
  const generationJobStatus = generationJob?.status;

  useEffect(() => {
    let cancelled = false;
    void getLatestMediaPlanningGeneration()
      .then((job) => {
        if (
          !cancelled &&
          job &&
          (job.status === "generating" ||
            (job.status === "failed" && (job.completedDays || 0) > 0))
        ) {
          setGenerationJob(job);
        }
      })
      .catch(() => undefined);
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (!generationJobId || generationJobStatus !== "generating") return;
    let cancelled = false;
    let timer: ReturnType<typeof setTimeout> | undefined;

    const poll = async () => {
      try {
        const next = await getMediaPlanningGeneration(generationJobId);
        if (cancelled) return;
        setGenerationJob(next);
        if (next.status === "generated") {
          setError("");
          setRefreshingDate(null);
          setMessage("HSAKAA completed the rolling execution-ready plan.");
          router.refresh();
          return;
        }
        if (next.status === "failed") {
          setRefreshingDate(null);
          setError(
            next.error || "HSAKAA could not generate the Presence plan.",
          );
          return;
        }
        timer = setTimeout(poll, 2500);
      } catch (value) {
        if (cancelled) return;
        setError(
          value instanceof Error
            ? value.message
            : "Unable to read Media planning progress.",
        );
        timer = setTimeout(poll, 5000);
      }
    };

    timer = setTimeout(poll, 1200);
    return () => {
      cancelled = true;
      if (timer) clearTimeout(timer);
    };
  }, [generationJobId, generationJobStatus, router]);

  const startGeneration = useCallback(
    async (payload: Parameters<typeof startMediaPlanningGeneration>[0]) => {
      setError("");
      setMessage("");
      try {
        const job = await startMediaPlanningGeneration(payload);
        setGenerationJob(job);
        setMessage(
          job.status === "generated"
            ? "HSAKAA already completed this planning job."
            : "HSAKAA is updating the rolling plan in the background.",
        );
        if (job.status === "generated") {
          setRefreshingDate(null);
          router.refresh();
        }
        if (job.status === "failed") {
          setRefreshingDate(null);
          setError(job.error || "HSAKAA could not generate the Presence plan.");
        }
      } catch (value) {
        setRefreshingDate(null);
        setError(
          value instanceof Error
            ? value.message
            : "HSAKAA could not start the Presence plan.",
        );
      }
    },
    [router],
  );

  async function generate() {
    if (outingStatus === "unknown") {
      setError(
        "Tell HSAKAA whether you are going out / travelling this week before rebuilding the seven-day window.",
      );
      return;
    }
    await startGeneration({
      force: false,
      mode: "roll",
      notes: notes.trim() ? notes : undefined,
      outingStatus,
      outingDetails,
    });
  }

  async function refreshDay(date: string) {
    setRefreshingDate(date);
    await startGeneration({
      force: true,
      mode: "day",
      targetDate: date,
      notes: notes.trim() ? notes : undefined,
      outingStatus,
      outingDetails,
    });
  }

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">
          {error}
        </div>
      ) : null}
      {message ? (
        <div className="rounded-2xl border border-[#C6FF32]/20 bg-[#C6FF32]/[0.05] p-4 text-sm text-[#C6FF32]">
          {message}
        </div>
      ) : null}

      <section className="rounded-[24px] border border-white/10 bg-white/[0.02] p-5">
        <div className="grid gap-4 xl:grid-cols-[1fr_auto] xl:items-center">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.16em] text-[#C6FF32]">
              This is the weekly control surface
            </div>
            <h2 className="mt-2 text-lg font-black text-white">
              You should not need Director, Intelligence or Review for every
              post.
            </h2>
            <p className="mt-2 max-w-4xl text-sm leading-6 text-white/45">
              HSAKAA already applies Presence strategy, whole-OS context,
              historical anti-repetition memory and learning signals while
              generating this plan. Use the full execution packs below. Open
              Production only for complex shoots, and Advanced only when you
              want to inspect or override an underlying engine.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/media/production"
              className="rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-white/65"
            >
              Complex production
            </Link>
            <Link
              href="/admin/media/system"
              className="rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-white/65"
            >
              Advanced engines
            </Link>
            <Link
              href="/admin/media/plan/archive"
              className="rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-white/65"
            >
              <Archive className="mr-1 inline h-3.5 w-3.5" /> Plan archive
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-[26px] border border-[#C6FF32]/20 bg-[#C6FF32]/[0.035] p-5 sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-4xl">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-[#C6FF32]">
              <Sparkles className="h-4 w-4" /> Media V3.14
            </div>
            <h2 className="mt-3 text-2xl font-black tracking-[-0.04em] text-white">
              HSAKAA builds a sustainable public-figure system
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/50">
              The week is designed for recognisability, authority and
              familiarity—not content spam. Feed posts stay execution-ready,
              while daily Instagram Stories use routine/current context as a
              lightweight human-presence layer. Skips remain healthy when no
              feed asset is needed.
            </p>
          </div>
          <button
            disabled={
              isGenerating ||
              !initialOverview.presenceReady ||
              !initialOverview.rolling?.missingDates?.length
            }
            onClick={generate}
            className="rounded-xl bg-[#C6FF32] px-4 py-2.5 text-sm font-black text-black disabled:opacity-40"
          >
            <RefreshCw className="mr-2 inline h-4 w-4" />
            {isGenerating
              ? "Planning in background…"
              : initialOverview.rolling?.missingDates?.length
                ? `Generate ${initialOverview.rolling.missingDates.length} missing day${initialOverview.rolling.missingDates.length === 1 ? "" : "s"}`
                : "7-day plan complete"}
          </button>
        </div>
        <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_1.2fr]">
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/30">
              Rolling window
            </p>
            <p className="mt-1 text-sm font-black text-white">
              {initialOverview.rolling?.startDate ?? plan?.startDate ?? "—"} →{" "}
              {initialOverview.rolling?.endDate ?? plan?.endDate ?? "—"}
            </p>
            <p className="mt-2 text-xs leading-5 text-white/40">
              Fresh history starts 7 September 2026. When you click Generate, HSAKAA keeps the existing days and creates only the missing date(s). Past days move to Plan Archive.
            </p>
            {initialOverview.rolling?.missingDates?.length ? (
              <p className="mt-2 text-[11px] text-amber-200/80">
                Missing: {initialOverview.rolling.missingDates.join(", ")}
                {initialOverview.rolling.canAutoRoll
                  ? " · click Generate to fill only the missing day(s)."
                  : ""}
              </p>
            ) : null}
          </div>
          <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/30">
              Are you going out / travelling this week?
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {(["yes", "no", "maybe"] as const).map((value) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setOutingStatus(value)}
                  className={`rounded-xl border px-3 py-2 text-xs font-black capitalize ${
                    outingStatus === value
                      ? "border-[#C6FF32]/40 bg-[#C6FF32]/10 text-[#C6FF32]"
                      : "border-white/10 text-white/45"
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
            <input
              value={outingDetails}
              onChange={(event) => setOutingDetails(event.target.value)}
              placeholder="Optional: dinner, outdoor meeting, Pune trip, event, family outing…"
              className="mt-3 w-full rounded-xl border border-white/10 bg-black/25 px-3 py-2.5 text-xs text-white outline-none placeholder:text-white/20"
            />
            <p className="mt-2 text-[10px] leading-4 text-white/25">
              HSAKAA uses this only to adapt capture opportunities and Stories.
              It must not invent an outing.
            </p>
          </div>
        </div>

        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder="Optional direction for this rolling window — e.g. lighter workload, avoid company promotion, batch-record Saturday."
          className="mt-5 min-h-24 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25"
        />
        {generationJob ? (
          <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.14em] text-white/35">
                  Planning job
                </p>
                <p className="mt-1 text-sm font-bold text-white">
                  {generationJob.status === "generating"
                    ? "HSAKAA is building the week without holding the browser connection open."
                    : generationJob.status === "generated"
                      ? "Planning completed."
                      : "Planning failed."}
                </p>
              </div>
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/45">
                {generationJob.stage.replaceAll("_", " ")}
              </span>
            </div>
            <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-white/5">
              <div
                className="h-full rounded-full bg-[#C6FF32] transition-[width] duration-500"
                style={{
                  width: `${Math.min(100, Math.max(4, generationJob.progress || 0))}%`,
                }}
              />
            </div>
            <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
              <JobStat
                label="Days checkpointed"
                value={`${generationJob.completedDays || 0} / ${generationJob.totalDays || 7}`}
              />
              <JobStat
                label="AI calls"
                value={String(generationJob.usage?.calls || 0)}
              />
              <JobStat
                label="Tokens observed"
                value={formatNumber(generationJob.usage?.totalTokens || 0)}
              />
              <JobStat
                label="Retries / failed calls"
                value={`${generationJob.usage?.retriedCalls || 0} / ${generationJob.usage?.failedCalls || 0}`}
              />
            </div>
            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-[10px] text-white/25">
              <span>
                Input {formatNumber(generationJob.usage?.inputTokens || 0)}
              </span>
              <span>
                Cached{" "}
                {formatNumber(generationJob.usage?.cachedInputTokens || 0)}
              </span>
              <span>
                Output {formatNumber(generationJob.usage?.outputTokens || 0)}
              </span>
              <span>
                Reasoning{" "}
                {formatNumber(generationJob.usage?.reasoningTokens || 0)}
              </span>
            </div>
            <p className="mt-2 text-xs leading-5 text-white/35">
              The request is persisted in the backend. Refreshing or leaving
              this page will not cancel generation. Completed days are
              checkpointed instead of being discarded if a later asset fails.
            </p>
          </div>
        ) : null}
        {!initialOverview.presenceReady ? (
          <p className="mt-3 text-xs text-amber-200/70">
            Build the Presence Strategy + Voice Profile first.
          </p>
        ) : null}
      </section>

      {generationJob?.status !== "generated" &&
      generationJob?.partialPlan &&
      safeArray(generationJob.partialPlan.days).length ? (
        <RecoveredPartialPlan job={generationJob} />
      ) : null}

      {initialOverview.stalePlanDetected ? (
        <div className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.05] p-4 text-sm text-amber-100/80">
          The stored week belongs to an older Presence Strategy version, so
          HSAKAA is intentionally not treating it as the active plan. Generate /
          refresh the week to use the latest strategy.
        </div>
      ) : null}

      {plan ? (
        <>
          <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h2 className="font-black text-white">
                  {plan.startDate} → {plan.endDate}
                </h2>
                <p className="mt-1 max-w-4xl text-sm leading-6 text-white/45">
                  {plan.summary}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/35">
                  {plan.learningStage?.replaceAll("_", " ") || "unknown"}
                </span>
                <span className="rounded-full border border-[#C6FF32]/20 bg-[#C6FF32]/[0.05] px-3 py-1 text-xs font-bold text-[#C6FF32]">
                  execution-ready contract
                </span>
              </div>
            </div>
          </section>

          <CadenceSummary plan={plan} policy={initialOverview.policy} />

          <div className="grid gap-4 xl:grid-cols-2">
            <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <h2 className="font-black text-white">
                Evidence-backed opportunities
              </h2>
              <div className="mt-4 space-y-3">
                {safeArray(plan.opportunities)
                  .slice(0, 8)
                  .map((item) => (
                    <div
                      key={item.key}
                      className="rounded-xl border border-white/5 bg-black/20 p-4"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-bold text-white">{item.title}</p>
                          <p className="mt-1 text-xs leading-5 text-white/40">
                            {item.whyNow}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-2 py-1 text-[10px] font-black uppercase ${
                            item.privacy === "needs_review"
                              ? "bg-amber-300/10 text-amber-200"
                              : "bg-[#C6FF32]/10 text-[#C6FF32]"
                          }`}
                        >
                          {item.privacy?.replace("_", " ") || "unknown"}
                        </span>
                      </div>
                      <p className="mt-3 text-xs leading-5 text-white/45">
                        {item.thesis}
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2 text-[10px]">
                        <span className="rounded-full border border-fuchsia-300/15 bg-fuchsia-300/[0.04] px-2 py-1 font-bold text-fuchsia-100/70">
                          {initialOverview.policy.strategyNarratives?.find(
                            (narrative) =>
                              narrative.key === item.strategyNarrativeKey,
                          )?.title ||
                            pillarLabels[item.identityPillar] ||
                            item.strategyNarrativeKey}
                        </span>
                        <span className="rounded-full border border-sky-300/15 bg-sky-300/[0.04] px-2 py-1 font-bold text-sky-100/70">
                          {item.growthIntent} · {item.topicClusterKey}
                        </span>
                        <span className="rounded-full border border-white/10 px-2 py-1 text-white/30">
                          Fit {item.strategicFit} · Novelty {item.novelty} ·
                          Evidence {item.evidenceStrength}
                        </span>
                      </div>
                      {safeArray(item.evidenceIds).length ? (
                        <details className="mt-3 text-[11px] text-white/30">
                          <summary className="cursor-pointer select-none hover:text-white/50">
                            Why HSAKAA chose this
                          </summary>
                          <div className="mt-2 flex flex-wrap gap-2">
                            {safeArray(item.evidenceIds).map((id) => (
                              <span
                                key={id}
                                className="rounded-md border border-white/10 px-2 py-1"
                              >
                                {id}
                              </span>
                            ))}
                          </div>
                        </details>
                      ) : null}
                    </div>
                  ))}
              </div>
            </section>
            <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
              <h2 className="font-black text-white">Story arcs</h2>
              <div className="mt-4 space-y-3">
                {safeArray(plan.storyArcs).length ? (
                  safeArray(plan.storyArcs).map((arc) => (
                    <div
                      key={arc.key}
                      className="rounded-xl border border-white/5 bg-black/20 p-4"
                    >
                      <p className="font-bold text-white">{arc.title}</p>
                      <p className="mt-1 text-xs leading-5 text-white/40">
                        {arc.purpose}
                      </p>
                      <div className="mt-3 space-y-2">
                        {safeArray(arc.beats).map((beat) => (
                          <div
                            key={`${arc.key}-${beat.order}`}
                            className="text-xs text-white/45"
                          >
                            <span className="mr-2 font-black text-[#C6FF32]">
                              {beat.order}
                            </span>
                            {beat.title}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-white/35">
                    No story arc forced this week.
                  </p>
                )}
              </div>
            </section>
          </div>

          <div className="space-y-4">
            {safeArray(plan.days).map((day) => (
              <MediaPlanningDayCard
                key={day.date}
                day={day}
                onRefresh={refreshDay}
                refreshing={refreshingDate === day.date || isGenerating}
              />
            ))}
          </div>
        </>
      ) : (
        <section className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-white/35">
          No current-strategy plan yet. Generate / refresh seven days to build a
          plan from the latest Presence strategy and Personal OS context.
        </section>
      )}
    </div>
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN").format(
    Math.max(0, Math.trunc(value || 0)),
  );
}

function JobStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/5 bg-black/20 p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.1em] text-white/25">
        {label}
      </p>
      <p className="mt-1 text-sm font-black text-white/70">{value}</p>
    </div>
  );
}

function RecoveredPartialPlan({ job }: { job: MediaPlanningGenerationJob }) {
  const partial = job.partialPlan;
  const days = safeArray(partial?.days);
  if (!partial || !days.length) return null;
  return (
    <section className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.035] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-amber-200">
            Recovered from current run
          </p>
          <h3 className="mt-1 font-black text-white">
            {days.length} completed day{days.length === 1 ? "" : "s"} preserved
          </h3>
          <p className="mt-1 max-w-3xl text-xs leading-5 text-white/40">
            These execution packs were checkpointed before the current run{" "}
            {job.status === "failed" ? "failed" : "finished"}. They remain
            visible and copyable; the last fully successful plan is shown
            separately below.
          </p>
        </div>
        <span className="rounded-full border border-amber-300/20 px-3 py-1 text-xs text-amber-100/70">
          {formatNumber(job.usage?.totalTokens || 0)} observed tokens
        </span>
      </div>
      <div className="mt-4 space-y-4">
        {days.map((day) => (
          <MediaPlanningDayCard key={`partial-${day.date}`} day={day} />
        ))}
      </div>
    </section>
  );
}

export function MediaPlanningDayCard({
  day,
  onRefresh,
  refreshing = false,
}: {
  day: MediaPlanningCycle["days"][number];
  onRefresh?: (date: string) => void | Promise<void>;
  refreshing?: boolean;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-[#C6FF32]" />
            <h3 className="font-black text-white">
              {day.date} · {day.theme}
            </h3>
          </div>
          <p className="mt-1 text-xs text-white/35">Workload: {day.workload}</p>
        </div>
        {onRefresh ? (
          <button
            type="button"
            disabled={refreshing}
            onClick={() => void onRefresh(day.date)}
            className="rounded-xl border border-white/10 px-3 py-2 text-xs font-black text-white/55 disabled:opacity-40"
          >
            <RefreshCw
              className={`mr-1.5 inline h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`}
            />
            Refresh this day
          </button>
        ) : null}
      </div>
      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        {day.instagramStory ? <DailyStory story={day.instagramStory} /> : null}
        {day.youtubeCommunity ? (
          <YoutubeCommunity post={day.youtubeCommunity} />
        ) : null}
      </div>
      <div className="mt-4 grid gap-3 xl:grid-cols-2">
        {safeArray(day.executions).map((item) => (
          <Execution key={`${day.date}-${item.platform}`} item={item} />
        ))}
      </div>
      {safeArray(day.engagement).length ? (
        <div className="mt-4 rounded-xl border border-white/5 bg-black/20 p-4">
          <div className="flex items-center gap-2 text-sm font-black text-white">
            <MessageCircle className="h-4 w-4 text-[#C6FF32]" /> Engagement
          </div>
          <div className="mt-3 grid gap-2 md:grid-cols-2">
            {safeArray(day.engagement).map((task, index) => (
              <div
                key={`${task.platform}-${task.time}-${index}`}
                className="text-xs leading-5 text-white/45"
              >
                <span className="font-bold text-white/70">
                  {labels[task.platform]} · {task.time}
                </span>{" "}
                · {task.count} meaningful interaction
                {task.count === 1 ? "" : "s"}
                <br />
                {task.guidance}
              </div>
            ))}
          </div>
        </div>
      ) : null}
    </section>
  );
}

function CadenceSummary({
  plan,
  policy,
}: {
  plan: MediaPlanningCycle;
  policy: MediaPlanningOverview["policy"];
}) {
  const posts = safeArray(plan.days)
    .flatMap((day) => safeArray(day.executions))
    .filter((item) => item.action === "post");
  const opportunityByKey = new Map(
    safeArray(plan.opportunities).map((item) => [item.key, item]),
  );
  const usedClustersByNarrative = new Map<string, Set<string>>();
  for (const post of posts) {
    const opportunity = opportunityByKey.get(post.opportunityKey || "");
    if (!opportunity) continue;
    const set =
      usedClustersByNarrative.get(opportunity.strategyNarrativeKey) ||
      new Set<string>();
    set.add(opportunity.topicClusterKey || opportunity.key);
    usedClustersByNarrative.set(opportunity.strategyNarrativeKey, set);
  }
  const longVideos = posts.filter(
    (item) => item.platform === "youtube" && item.format === "video",
  ).length;
  const shortAssets = posts.filter((item) =>
    ["reel", "short", "carousel"].includes(item.format),
  ).length;
  const stories = safeArray(plan.days).filter(
    (day) => day.instagramStory?.action === "post",
  ).length;
  const youtubeCommunity = safeArray(plan.days).filter(
    (day) => day.youtubeCommunity?.action === "post",
  ).length;
  const linkedin = posts.filter((item) => item.platform === "linkedin").length;
  const instagram = posts.filter(
    (item) => item.platform === "instagram",
  ).length;
  const youtube = posts.filter((item) => item.platform === "youtube").length;
  const x = posts.filter((item) => item.platform === "x").length;
  const whatsapp = posts.filter((item) => item.platform === "whatsapp").length;
  const cadence = policy.sustainableWeeklyCadence;

  const items = [
    ["Long videos", `${longVideos} / ${cadence?.longFormVideos ?? 2}`],
    [
      "Shorts + carousels",
      `${shortAssets} / ${cadence?.shortFormAndCarousels ?? "5-6"}`,
    ],
    ["Instagram Stories", `${stories} / ${cadence?.instagramStories ?? 7}`],
    [
      "YouTube Community",
      `${youtubeCommunity} / ${cadence?.youtubeCommunityPosts ?? "3-5"}`,
    ],
    ["LinkedIn", `${linkedin} / ${cadence?.linkedinFeedPosts ?? "strategy"}`],
    [
      "Instagram feed",
      `${instagram} / ${cadence?.instagramFeedPosts ?? "strategy"}`,
    ],
    ["YouTube feed", `${youtube} / ${cadence?.youtubeFeedPosts ?? "strategy"}`],
    ["X", `${x} / ${cadence?.xFeedPosts ?? "strategy"}`],
    ["WhatsApp", `${whatsapp} / ${cadence?.whatsappPresence ?? "strategy"}`],
  ];

  const growth = policy.growthObjective;
  const narratives = safeArray(policy.strategyNarratives);

  return (
    <section className="rounded-2xl border border-[#C6FF32]/15 bg-[#C6FF32]/[0.025] p-5">
      <div className="flex items-center gap-2 text-sm font-black text-white">
        <Sparkles className="h-4 w-4 text-[#C6FF32]" /> Public-figure growth
        system
      </div>
      <p className="mt-1 text-xs leading-5 text-white/40">
        Fastest sustainable path to 100K: discovery, follower conversion,
        recognizable series and authority—without using extra posting volume as
        a substitute for quality.
      </p>

      {growth ? (
        <div className="mt-4 rounded-xl border border-[#C6FF32]/15 bg-black/20 p-4">
          <div className="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/25">
                Growth target
              </p>
              <p className="mt-1 text-xl font-black text-[#C6FF32]">
                {formatNumber(growth.currentKnownFollowers)} known /{" "}
                {formatNumber(growth.targetFollowers)}
              </p>
              <p className="mt-1 text-[11px] text-white/35">
                {formatNumber(growth.remainingToTarget)} remaining · known
                native counts from{" "}
                {growth.knownPlatforms.join(", ") || "none yet"}
                {growth.unknownPlatforms.length
                  ? ` · unavailable counts: ${growth.unknownPlatforms.join(", ")}`
                  : ""}
              </p>
            </div>
            <span className="rounded-full border border-[#C6FF32]/20 px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#C6FF32]">
              fastest sustainable
            </span>
          </div>
        </div>
      ) : null}

      <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
        {items.map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl border border-white/5 bg-black/20 p-3"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/25">
              {label}
            </p>
            <p className="mt-1 text-sm font-black text-[#C6FF32]">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 border-t border-white/5 pt-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.12em] text-white/35">
              Presence narrative mix
            </p>
            <p className="mt-1 text-xs text-white/35">
              Counts distinct topic clusters, not cross-platform derivatives.
              One chess moment on two surfaces is still one idea.
            </p>
          </div>
          <span className="rounded-full border border-fuchsia-300/15 px-3 py-1 text-[10px] font-bold text-fuchsia-100/70">
            8-narrative strategy · anti-saturation
          </span>
        </div>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {(narratives.length
            ? narratives
            : Object.entries(pillarLabels).map(([key, title]) => ({
                key,
                title,
                targetSharePercent: 0,
              }))
          ).map((narrative) => (
            <div
              key={narrative.key}
              className="rounded-xl border border-white/5 bg-black/20 p-3"
            >
              <p className="text-[10px] text-white/30">{narrative.title}</p>
              <p className="mt-1 text-sm font-black text-white/70">
                {usedClustersByNarrative.get(narrative.key)?.size || 0} clusters
              </p>
              {narrative.targetSharePercent ? (
                <p className="mt-1 text-[10px] text-white/25">
                  Target ~{narrative.targetSharePercent}%
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DailyStory({ story }: { story: MediaPlanningDailyStory }) {
  const frames = safeArray(story.frames);
  const evidenceIds = safeArray(story.sourceEvidenceIds);
  const issues = safeArray(story.readinessIssues);
  if (story.action === "skip") return null;

  return (
    <div className="mt-4 rounded-xl border border-fuchsia-300/10 bg-fuchsia-300/[0.025] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-black text-white">
            <ImageIcon className="h-4 w-4 text-fuchsia-200" /> Daily Instagram
            Story
          </div>
          <p className="mt-1 text-xs text-white/35">
            {story.time || "Flexible"} ·{" "}
            {story.sourceType?.replaceAll("_", " ") || "context"}
          </p>
        </div>
        <span
          className={`rounded-full px-2 py-1 text-[10px] font-black uppercase ${story.executionReady && !issues.length ? "bg-[#C6FF32]/10 text-[#C6FF32]" : "bg-red-400/10 text-red-200"}`}
        >
          {story.executionReady && !issues.length ? "ready" : "blocked"}
        </span>
      </div>
      <p className="mt-3 text-xs leading-5 text-white/45">{story.reason}</p>
      <CopyField label="Capture brief" value={story.captureBrief} primary />
      <div className="mt-3 grid gap-3 lg:grid-cols-3">
        {frames.map((frame) => (
          <div
            key={frame.order}
            className="rounded-lg border border-white/5 bg-black/20 p-3"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-fuchsia-200">
              Frame {frame.order}
            </p>
            <CopyField label="Overlay text" value={frame.overlayText} />
            {frame.spokenText ? (
              <CopyField label="Spoken text" value={frame.spokenText} />
            ) : null}
            <SmallField label="Visual" value={frame.visualDescription} />
            <SmallField label="Capture" value={frame.captureInstruction} />
            {frame.interactiveElement ? (
              <SmallField
                label="Interactive"
                value={frame.interactiveElement}
              />
            ) : null}
          </div>
        ))}
      </div>
      {evidenceIds.length ? (
        <details className="mt-3 text-[10px] text-white/25">
          <summary className="cursor-pointer select-none hover:text-white/45">
            Why this Story
          </summary>
          <div className="mt-2 flex flex-wrap gap-2">
            {evidenceIds.map((id) => (
              <span
                key={id}
                className="rounded-md border border-white/10 px-2 py-1"
              >
                {id}
              </span>
            ))}
          </div>
        </details>
      ) : null}
    </div>
  );
}

function YoutubeCommunity({
  post,
}: {
  post: MediaPlanningYoutubeCommunityPost;
}) {
  const evidenceIds = safeArray(post.sourceEvidenceIds);
  const issues = safeArray(post.readinessIssues);
  const pollOptions = safeArray(post.pollOptions);
  if (post.action === "skip") return null;

  return (
    <div className="rounded-xl border border-red-300/10 bg-red-300/[0.025] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-black text-white">
            <Video className="h-4 w-4 text-red-200" /> YouTube Community
          </div>
          <p className="mt-1 text-xs text-white/35">
            {post.time || "Flexible"} · {post.format} · lightweight YouTube
            presence
          </p>
          <p className="mt-1 text-[10px] text-white/25">
            YouTube Stories was retired; Community posts are the native
            replacement.
          </p>
        </div>
        <span
          className={`rounded-full px-2 py-1 text-[10px] font-black uppercase ${post.executionReady && !issues.length ? "bg-[#C6FF32]/10 text-[#C6FF32]" : "bg-red-400/10 text-red-200"}`}
        >
          {post.executionReady && !issues.length ? "ready" : "blocked"}
        </span>
      </div>
      <p className="mt-3 text-xs leading-5 text-white/45">{post.reason}</p>
      <CopyField label="Publish copy" value={post.publishCopy} primary />
      {post.format === "poll" ? (
        <div className="mt-3 rounded-lg border border-white/5 bg-black/20 p-3">
          <CopyField label="Poll question" value={post.pollQuestion} />
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {pollOptions.map((option, index) => (
              <CopyField
                key={`${option}-${index}`}
                label={`Option ${index + 1}`}
                value={option}
              />
            ))}
          </div>
        </div>
      ) : null}
      {post.format === "image" && post.imageBrief ? (
        <ImagePack brief={post.imageBrief} />
      ) : null}
      {evidenceIds.length ? (
        <details className="mt-3 text-[10px] text-white/25">
          <summary className="cursor-pointer select-none hover:text-white/45">
            Why HSAKAA chose this
          </summary>
          <div className="mt-2 flex flex-wrap gap-2">
            {evidenceIds.map((id) => (
              <span
                key={id}
                className="rounded-md border border-white/10 px-2 py-1"
              >
                {id}
              </span>
            ))}
          </div>
        </details>
      ) : null}
    </div>
  );
}

function Execution({ item }: { item: MediaPlanningExecution }) {
  const isSkip = item.action === "skip";
  const readinessIssues = safeArray(item.readinessIssues);
  const hashtags = safeArray(item.hashtags);
  const carouselSlides = safeArray(item.carouselSlides);
  const xThread = safeArray(item.xThread);
  const whatsappSequence = safeArray(item.whatsappSequence);
  const evidenceIds = safeArray(item.evidenceIds);
  const imageBrief = item.imageBrief;
  const videoPack = item.videoPack;
  const publishCopy =
    item.publishCopy ||
    item.copyPasteCaption ||
    item.copyPasteText ||
    item.caption ||
    item.description ||
    "";
  const publishLabel =
    item.platform === "instagram"
      ? "Caption"
      : item.platform === "youtube"
        ? "Description"
        : item.platform === "x"
          ? "Post copy"
          : item.platform === "whatsapp"
            ? "Status / message copy"
            : "Publish copy";

  return (
    <article
      className={`rounded-xl border p-4 ${
        isSkip
          ? "border-white/5 bg-black/15"
          : "border-[#C6FF32]/10 bg-[#C6FF32]/[0.025]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.14em] text-white/35">
            {labels[item.platform] ?? item.platform}
          </p>
          <p className="mt-1 font-bold text-white">
            {isSkip ? "Skip today" : item.title || item.formatIntent}
          </p>
        </div>
        <div className="flex flex-wrap justify-end gap-2">
          {!isSkip ? (
            <span
              className={`rounded-full px-2 py-1 text-[10px] font-black uppercase ${
                item.executionReady && readinessIssues.length === 0
                  ? "bg-[#C6FF32]/10 text-[#C6FF32]"
                  : "bg-red-400/10 text-red-200"
              }`}
            >
              {item.executionReady && readinessIssues.length === 0
                ? "ready"
                : "blocked"}
            </span>
          ) : null}
          <span
            className={`rounded-full px-2 py-1 text-[10px] font-black uppercase ${
              isSkip
                ? "bg-white/5 text-white/35"
                : "bg-[#C6FF32]/10 text-[#C6FF32]"
            }`}
          >
            {item.action}
          </span>
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-white/35">
        <span className="flex items-center gap-1">
          <Clock3 className="h-3 w-3" /> {item.time}
        </span>
        <span>{item.format}</span>
        <span>{item.estimatedMinutes} min</span>
      </div>
      <p className="mt-3 text-xs leading-5 text-white/45">{item.reason}</p>

      {!isSkip ? (
        <div className="mt-4 space-y-4 border-t border-white/5 pt-4">
          {!xThread.length && !whatsappSequence.length ? (
            <CopyField label={publishLabel} value={publishCopy} primary />
          ) : null}

          {imageBrief?.mode && imageBrief.mode !== "none" ? (
            <ImagePack brief={imageBrief} />
          ) : null}
          {carouselSlides.length ? (
            <CarouselPack slides={carouselSlides} />
          ) : null}
          {videoPack?.fullScript ? <VideoPack pack={videoPack} /> : null}
          {xThread.length ? (
            <SequencePack title="X thread · every post" values={xThread} />
          ) : null}
          {whatsappSequence.length ? (
            <SequencePack
              title="WhatsApp · every message/status frame"
              values={whatsappSequence}
            />
          ) : null}

          {item.pinnedComment ? (
            <CopyField label="Pinned comment" value={item.pinnedComment} />
          ) : null}
          {item.storyFollowUp ? (
            <CopyField label="Story follow-up" value={item.storyFollowUp} />
          ) : null}
          {readinessIssues.length ? (
            <div className="rounded-lg border border-red-400/20 bg-red-400/10 p-3 text-xs text-red-200">
              {readinessIssues.join(" · ")}
            </div>
          ) : null}
          <details className="rounded-lg border border-white/5 bg-white/[0.02] p-3 text-xs text-white/35">
            <summary className="cursor-pointer select-none font-bold text-white/45">
              HSAKAA details
            </summary>
            <div className="mt-3 space-y-3">
              {item.hook ? <SmallField label="Hook" value={item.hook} /> : null}
              {item.cta ? <SmallField label="CTA" value={item.cta} /> : null}
              {hashtags.length ? (
                <SmallField label="Hashtags" value={hashtags.join(" ")} />
              ) : null}
              <SmallField label="Why this format" value={item.whyThisFormat} />
              <SmallField
                label="Production note"
                value={item.productionNotes || "—"}
              />
              {evidenceIds.length ? (
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/25">
                    Evidence
                  </p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {evidenceIds.map((id) => (
                      <span
                        key={id}
                        className="rounded-md border border-white/10 px-2 py-1 text-[10px] text-white/30"
                      >
                        {id}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </div>
          </details>
        </div>
      ) : null}
    </article>
  );
}

function ImagePack({
  brief,
}: {
  brief: NonNullable<MediaPlanningExecution["imageBrief"]>;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/25 p-4">
      <div className="flex items-center gap-2 text-sm font-black text-white">
        <ImageIcon className="h-4 w-4 text-[#C6FF32]" /> Image execution pack
      </div>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <SmallField
          label="Mode"
          value={brief.mode?.replaceAll("_", " ") || "—"}
        />
        <SmallField label="Aspect ratio" value={brief.aspectRatio || "—"} />
      </div>
      {brief.overlayText ? (
        <CopyField label="Overlay text" value={brief.overlayText} />
      ) : null}
      {brief.mode === "ai_generation" ? (
        <CopyField label="Exact AI image prompt" value={brief.prompt} primary />
      ) : (
        <CopyField
          label="Exact photo / design description"
          value={brief.description}
          primary
        />
      )}
      <CopyField
        label="Source / capture guidance"
        value={brief.sourceGuidance}
      />
    </div>
  );
}

function CarouselPack({ slides }: { slides: MediaPlanningCarouselSlide[] }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/25 p-4">
      <div className="flex items-center gap-2 text-sm font-black text-white">
        <ImageIcon className="h-4 w-4 text-[#C6FF32]" /> Carousel · complete
        slide pack
      </div>
      <div className="mt-3 space-y-3">
        {slides.map((slide) => (
          <div
            key={slide.slideNumber}
            className="rounded-lg border border-white/5 p-3"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#C6FF32]">
              Slide {slide.slideNumber} ·{" "}
              {slide.visualType?.replaceAll("_", " ") || "visual"}
            </p>
            <CopyField label="Final headline" value={slide.headline} />
            <CopyField label="Final body copy" value={slide.bodyCopy} />
            {slide.overlayText ? (
              <CopyField label="Overlay text" value={slide.overlayText} />
            ) : null}
            {slide.visualType === "ai_image" ? (
              <CopyField
                label="Exact AI image prompt"
                value={slide.imagePrompt}
                primary
              />
            ) : (
              <CopyField
                label="Full visual description"
                value={slide.visualDescription}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

function VideoPack({
  pack,
}: {
  pack: NonNullable<MediaPlanningExecution["videoPack"]>;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/25 p-4">
      <div className="flex items-center gap-2 text-sm font-black text-white">
        <Video className="h-4 w-4 text-[#C6FF32]" /> Full video production pack
        · {pack.targetDurationSeconds}s
      </div>
      <CopyField label="Word-for-word script" value={pack.fullScript} primary />
      <CopyField label="Delivery" value={pack.deliveryInstructions} />
      <CopyField label="Camera" value={pack.cameraInstructions} />
      <TimedDirections label="Punch-ins" values={pack.punchIns} />
      <TimedDirections label="B-roll" values={pack.broll} />
      <TimedDirections label="On-screen text" values={pack.onScreenText} />
      <CopyField label="Music direction" value={pack.musicDirection} />
      <CopyField label="Cover direction" value={pack.coverDirection} />
    </div>
  );
}

function TimedDirections({
  label,
  values,
}: {
  label: string;
  values: MediaPlanningTimedDirection[] | null | undefined;
}) {
  const safeValues = safeArray(values);
  if (!safeValues.length) return null;
  return (
    <div className="mt-3">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/25">
        {label}
      </p>
      <div className="mt-2 space-y-1.5">
        {safeValues.map((item, index) => (
          <p
            key={`${item.at}-${index}`}
            className="text-xs leading-5 text-white/55"
          >
            <span className="mr-2 font-bold text-[#C6FF32]">{item.at}</span>
            {item.instruction}
          </p>
        ))}
      </div>
    </div>
  );
}

function SequencePack({
  title,
  values,
}: {
  title: string;
  values: string[] | null | undefined;
}) {
  const safeValues = safeArray(values);
  if (!safeValues.length) return null;

  return (
    <div className="rounded-xl border border-white/10 bg-black/25 p-4">
      <div className="text-sm font-black text-white">{title}</div>
      <div className="mt-3 space-y-3">
        {safeValues.map((value, index) => (
          <CopyField
            key={`${title}-${index}`}
            label={`#${index + 1}`}
            value={value}
            primary
          />
        ))}
      </div>
    </div>
  );
}

function SmallField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/25">
        {label}
      </p>
      <p className="mt-1 text-xs leading-5 text-white/55">{value || "—"}</p>
    </div>
  );
}

function CopyField({
  label,
  value,
  primary = false,
}: {
  label: string;
  value: string;
  primary?: boolean;
}) {
  const [copied, setCopied] = useState(false);
  if (!value) return null;

  async function copy() {
    await navigator.clipboard.writeText(value);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1400);
  }

  return (
    <div
      className={
        primary
          ? "rounded-lg border border-[#C6FF32]/10 bg-[#C6FF32]/[0.025] p-3"
          : "mt-3"
      }
    >
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/25">
          {label}
        </p>
        <button
          type="button"
          onClick={copy}
          className="rounded-md border border-white/10 px-2 py-1 text-[10px] font-bold text-white/45 transition hover:border-[#C6FF32]/30 hover:text-[#C6FF32]"
        >
          {copied ? (
            <Check className="mr-1 inline h-3 w-3" />
          ) : (
            <Clipboard className="mr-1 inline h-3 w-3" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <p className="mt-2 whitespace-pre-wrap text-xs leading-5 text-white/65">
        {value}
      </p>
    </div>
  );
}
