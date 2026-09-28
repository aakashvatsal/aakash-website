"use client";

import { useMemo, useState, useTransition } from "react";
import type { Dispatch, ReactNode, SetStateAction } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  BarChart3,
  Bookmark,
  Check,
  CircleDollarSign,
  Clock3,
  ExternalLink,
  RefreshCw,
  Save,
  Sparkles,
  TrendingUp,
} from "lucide-react";

import {
  rebuildMediaGrowthLearnings,
  rebuildMediaPerformanceLearning,
  recordManualMediaAccountMetrics,
  recordManualMediaPublicationMetrics,
} from "@/lib/api/media";
import type {
  MediaAccount,
  MediaGrowthOverview,
  MediaLearningOverview,
  MediaManualAnalyticsCheckpoint,
  MediaManualAnalyticsQueue,
  MediaManualAnalyticsQueueItem,
  MediaManualPublicationMetrics,
  MediaSocialPresenceOverview,
} from "@/types/media";

const metricFields: Array<{
  key: keyof MediaManualPublicationMetrics;
  label: string;
  step?: string;
}> = [
  { key: "impressions", label: "Impressions" },
  { key: "reach", label: "Reach" },
  { key: "views", label: "Views" },
  { key: "likes", label: "Likes" },
  { key: "comments", label: "Comments" },
  { key: "shares", label: "Shares" },
  { key: "saves", label: "Saves" },
  { key: "sends", label: "Sends" },
  { key: "clicks", label: "Clicks" },
  { key: "profileVisits", label: "Profile visits" },
  { key: "followersGained", label: "Followers gained" },
  { key: "watchTimeSeconds", label: "Watch time, sec" },
  {
    key: "averageWatchPercentage",
    label: "Average watched %",
    step: "0.1",
  },
];

type CheckpointPeriod = "48_hours" | "96_hours";
type Filter = "due" | "upcoming" | "complete" | "all";

function numberOrUndefined(value: string) {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
}

function compact(value: number) {
  return new Intl.NumberFormat("en-IN", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value || 0);
}

function formatDateTime(value?: string) {
  if (!value) return "Not scheduled";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(value));
}

function checkpointLabel(period: CheckpointPeriod) {
  return period === "48_hours" ? "48 hours" : "96 hours";
}

function insightPeriodLabel(period: string) {
  if (period === "48_hours") return "48 hours";
  if (period === "96_hours") return "96 hours";
  return period.replaceAll("_", " ");
}

function platformLabel(value: string) {
  if (value === "x") return "X";
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function decisionLabel(value?: string) {
  if (value === "pin") return "Pin";
  if (value === "do_not_pin") return "Do not pin";
  if (value === "boost") return "Boost test";
  if (value === "do_not_boost") return "Do not boost";
  return "Wait";
}

function decisionClass(value?: string) {
  if (value === "pin" || value === "boost") {
    return "border-[#C6FF32]/25 bg-[#C6FF32]/10 text-[#C6FF32]";
  }
  if (value === "do_not_pin" || value === "do_not_boost") {
    return "border-red-300/20 bg-red-400/5 text-red-200";
  }
  return "border-amber-300/20 bg-amber-300/5 text-amber-200";
}

function checkpointFor(
  item: MediaManualAnalyticsQueueItem,
  period: CheckpointPeriod,
) {
  return period === "48_hours" ? item.fortyEightHours : item.ninetySixHours;
}

function itemPriority(item: MediaManualAnalyticsQueueItem) {
  const checkpoints = [item.fortyEightHours, item.ninetySixHours];
  if (checkpoints.some((checkpoint) => checkpoint.state === "due")) return 0;
  if (checkpoints.every((checkpoint) => checkpoint.state === "complete")) return 2;
  return 1;
}

function itemMatchesFilter(item: MediaManualAnalyticsQueueItem, filter: Filter) {
  const checkpoints = [item.fortyEightHours, item.ninetySixHours];
  if (filter === "due") return checkpoints.some((checkpoint) => checkpoint.state === "due");
  if (filter === "complete") {
    return checkpoints.every((checkpoint) => checkpoint.state === "complete");
  }
  if (filter === "upcoming") {
    return (
      !checkpoints.some((checkpoint) => checkpoint.state === "due") &&
      !checkpoints.every((checkpoint) => checkpoint.state === "complete")
    );
  }
  return true;
}

function initialValues(checkpoint: MediaManualAnalyticsCheckpoint) {
  const metrics = checkpoint.metrics;
  if (!metrics) return {};
  const values: Record<string, string> = {};
  for (const field of metricFields) {
    const value = metrics[field.key as keyof typeof metrics];
    if (typeof value === "number") values[String(field.key)] = String(value);
  }
  return values;
}

export function MediaContentAnalyticsManager({
  accounts,
  growth,
  learning,
  analyticsQueue,
  socialPresence,
}: {
  accounts: MediaAccount[];
  growth: MediaGrowthOverview;
  learning: MediaLearningOverview;
  analyticsQueue: MediaManualAnalyticsQueue;
  socialPresence: MediaSocialPresenceOverview;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [filter, setFilter] = useState<Filter>("due");
  const [metricValues, setMetricValues] = useState<Record<string, Record<string, string>>>({});
  const [accountId, setAccountId] = useState(accounts[0]?._id ?? "");
  const [accountValues, setAccountValues] = useState<Record<string, string>>({});

  const insightMap = useMemo(
    () => new Map(learning.performance.map((item) => [item.publicationId, item])),
    [learning.performance],
  );

  const sortedItems = useMemo(
    () =>
      analyticsQueue.items
        .slice()
        .sort((a, b) => {
          const priority = itemPriority(a) - itemPriority(b);
          if (priority !== 0) return priority;
          const aDate = new Date(a.analyticsAnchorAt ?? a.scheduledAt ?? 0).getTime();
          const bDate = new Date(b.analyticsAnchorAt ?? b.scheduledAt ?? 0).getTime();
          return bDate - aDate;
        }),
    [analyticsQueue.items],
  );

  const filteredItems = useMemo(
    () => sortedItems.filter((item) => itemMatchesFilter(item, filter)),
    [filter, sortedItems],
  );

  const dueCount = analyticsQueue.items.filter((item) => itemMatchesFilter(item, "due")).length;
  const upcomingCount = analyticsQueue.items.filter((item) => itemMatchesFilter(item, "upcoming")).length;
  const completedCount = analyticsQueue.items.filter((item) => itemMatchesFilter(item, "complete")).length;

  function run(action: () => Promise<unknown>, success: string) {
    setError("");
    setMessage("");
    startTransition(async () => {
      try {
        await action();
        setMessage(success);
        router.refresh();
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Media analytics action failed.");
      }
    });
  }

  function valuesKey(publicationId: string, period: CheckpointPeriod) {
    return `${publicationId}:${period}`;
  }

  function getCheckpointValues(
    item: MediaManualAnalyticsQueueItem,
    period: CheckpointPeriod,
  ) {
    const key = valuesKey(item.publicationId, period);
    return metricValues[key] ?? initialValues(checkpointFor(item, period));
  }

  function updateCheckpointValues(
    publicationId: string,
    period: CheckpointPeriod,
    updater: SetStateAction<Record<string, string>>,
  ) {
    const key = valuesKey(publicationId, period);
    setMetricValues((current) => {
      const existing = current[key] ?? {};
      const next = typeof updater === "function" ? updater(existing) : updater;
      return { ...current, [key]: next };
    });
  }

  function submitCheckpoint(item: MediaManualAnalyticsQueueItem, period: CheckpointPeriod) {
    const values = getCheckpointValues(item, period);
    const payload: MediaManualPublicationMetrics = {
      period,
      capturedAt: new Date().toISOString(),
    };
    for (const field of metricFields) {
      const parsed = numberOrUndefined(values[String(field.key)] ?? "");
      if (parsed !== undefined) {
        (payload as Record<string, unknown>)[field.key] = parsed;
      }
    }
    if (Object.keys(payload).length <= 2) {
      setError(`Enter at least one ${checkpointLabel(period)} metric for this post.`);
      return;
    }
    run(async () => {
      await recordManualMediaPublicationMetrics(item.publicationId, payload);
      const key = valuesKey(item.publicationId, period);
      setMetricValues((current) => {
        const next = { ...current };
        delete next[key];
        return next;
      });
    }, `${checkpointLabel(period)} analytics saved. HSAKAA updated its performance learning.`);
  }

  function submitAccountSnapshot() {
    if (!accountId) {
      setError("Create or choose a Media account before adding an account baseline.");
      return;
    }
    const payload = {
      capturedAt: new Date().toISOString(),
      followers: numberOrUndefined(accountValues.followers ?? ""),
      subscribers: numberOrUndefined(accountValues.subscribers ?? ""),
      profileViews: numberOrUndefined(accountValues.profileViews ?? ""),
      impressions: numberOrUndefined(accountValues.impressions ?? ""),
      reach: numberOrUndefined(accountValues.reach ?? ""),
      views: numberOrUndefined(accountValues.views ?? ""),
      websiteClicks: numberOrUndefined(accountValues.websiteClicks ?? ""),
      leads: numberOrUndefined(accountValues.leads ?? ""),
      source: "manual",
    };
    run(async () => {
      await recordManualMediaAccountMetrics(accountId, payload);
      setAccountValues({});
    }, "Account baseline saved.");
  }

  function analyzeNow() {
    run(async () => {
      await rebuildMediaPerformanceLearning(90);
      await rebuildMediaGrowthLearnings({ days: 90, minSampleSize: 3 });
    }, "HSAKAA refreshed content performance and growth learnings.");
  }

  return (
    <div className="space-y-8">
      {(message || error) && (
        <div
          className={`rounded-2xl border p-4 text-sm ${
            error
              ? "border-red-300/20 bg-red-400/5 text-red-200"
              : "border-[#C6FF32]/20 bg-[#C6FF32]/5 text-[#C6FF32]"
          }`}
        >
          {error || message}
        </div>
      )}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Due now" value={String(dueCount)} />
        <MetricCard label="Upcoming" value={String(upcomingCount)} />
        <MetricCard label="96h complete" value={String(completedCount)} />
        <MetricCard label="Measured posts" value={String(growth.publicationsMeasured)} />
        <MetricCard label="Average score" value={growth.averagePerformanceScore.toFixed(1)} />
      </section>

      <ProfileManagerSummary overview={socialPresence} />

      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
          <div>
            <div className="flex items-center gap-2 text-lg font-black text-white">
              <BarChart3 className="h-5 w-5 text-[#C6FF32]" /> Analytics inbox
            </div>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-white/45">
              Content is already filled from HSAKAA. At 48 hours and 96 hours, copy the numbers from the native platform and save. Nothing else needs to be re-entered.
            </p>
          </div>
          <button
            type="button"
            disabled={pending}
            onClick={analyzeNow}
            className="inline-flex items-center justify-center gap-2 rounded-xl border border-[#C6FF32]/25 px-4 py-2.5 text-sm font-bold text-[#C6FF32] disabled:opacity-50"
          >
            <RefreshCw className="h-4 w-4" /> Analyze now
          </button>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {([
            ["due", `Due now · ${dueCount}`],
            ["upcoming", `Upcoming · ${upcomingCount}`],
            ["complete", `Complete · ${completedCount}`],
            ["all", `All · ${analyticsQueue.items.length}`],
          ] as Array<[Filter, string]>).map(([value, label]) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
                filter === value
                  ? "border-[#C6FF32]/35 bg-[#C6FF32]/10 text-[#C6FF32]"
                  : "border-white/10 text-white/45"
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="mt-5 space-y-4">
          {filteredItems.length ? (
            filteredItems.map((item) => (
              <ContentAnalyticsCard
                key={item.publicationId}
                item={item}
                insight={insightMap.get(item.publicationId)}
                pending={pending}
                getValues={(period) => getCheckpointValues(item, period)}
                setValues={(period, updater) =>
                  updateCheckpointValues(item.publicationId, period, updater)
                }
                onSave={(period) => submitCheckpoint(item, period)}
              />
            ))
          ) : (
            <div className="rounded-xl border border-dashed border-white/10 p-8 text-center text-sm text-white/35">
              {filter === "due"
                ? "Nothing is due right now. The next HSAKAA post will move here automatically at its 48h or 96h checkpoint."
                : "No content in this view yet."}
            </div>
          )}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <div className="flex items-center gap-2 text-lg font-black text-white">
            <TrendingUp className="h-5 w-5 text-[#C6FF32]" /> Weekly account baseline
          </div>
          <p className="mt-1 text-sm leading-6 text-white/40">
            Optional weekly account totals help HSAKAA understand follower and profile growth beyond individual posts.
          </p>
          <div className="mt-4 space-y-3">
            <SelectField
              label="Account"
              value={accountId}
              onChange={setAccountId}
              options={accounts.map((item) => ({
                value: item._id,
                label: `${item.displayName} · ${platformLabel(item.platform)}`,
              }))}
            />
            <div className="grid gap-3 sm:grid-cols-2">
              {[
                ["followers", "Followers"],
                ["subscribers", "Subscribers"],
                ["profileViews", "Profile views"],
                ["impressions", "Impressions"],
                ["reach", "Reach"],
                ["views", "Views"],
                ["websiteClicks", "Website clicks"],
                ["leads", "Leads"],
              ].map(([key, label]) => (
                <InputField
                  key={key}
                  label={label}
                  type="number"
                  value={accountValues[key] ?? ""}
                  onChange={(value) =>
                    setAccountValues((current) => ({ ...current, [key]: value }))
                  }
                />
              ))}
            </div>
            <button
              type="button"
              disabled={pending || !accountId}
              onClick={submitAccountSnapshot}
              className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-bold text-white/65 disabled:opacity-50"
            >
              Save weekly baseline
            </button>
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <div className="flex items-center gap-2 text-lg font-black text-white">
            <Sparkles className="h-5 w-5 text-[#C6FF32]" /> HSAKAA manager decisions
          </div>
          <p className="mt-1 text-sm leading-6 text-white/40">
            Decisions become stronger as 48h and 96h history grows. Paid boosting always remains a recommendation, never an automatic spend.
          </p>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {learning.performance.length ? (
              learning.performance.slice(0, 8).map((insight) => {
                const item = analyticsQueue.items.find(
                  (candidate) => candidate.publicationId === insight.publicationId,
                );
                const manager = insight.management;
                return (
                  <div
                    key={insight.publicationId}
                    className="rounded-xl border border-white/10 bg-black/20 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="truncate text-sm font-black text-white">
                          {item?.title || "Measured content"}
                        </div>
                        <div className="mt-1 text-xs text-white/35">
                          {platformLabel(insight.platform)} · {insight.format.replaceAll("_", " ")} · {insightPeriodLabel(insight.period)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-black text-[#C6FF32]">
                          {manager?.performanceScore?.toFixed(1) ?? insight.percentile}
                        </div>
                        <div className="text-[10px] uppercase tracking-[0.12em] text-white/30">
                          {manager ? "score" : "percentile"}
                        </div>
                      </div>
                    </div>

                    <p className="mt-3 text-sm leading-6 text-white/60">{insight.summary}</p>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <DecisionCard
                        icon={<Bookmark className="h-4 w-4" />}
                        label="Pinned / featured"
                        decision={manager?.pin.decision}
                        reason={manager?.pin.reason ?? "Need more measured data."}
                      />
                      <DecisionCard
                        icon={<CircleDollarSign className="h-4 w-4" />}
                        label="Paid boost"
                        decision={manager?.boost.decision}
                        reason={manager?.boost.reason ?? "Need more measured data."}
                        extra={
                          manager?.boost.suggestedTestBudgetInr
                            ? `Suggested first test: ₹${manager.boost.suggestedTestBudgetInr.toLocaleString("en-IN")}`
                            : undefined
                        }
                      />
                    </div>

                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      <SmallList title="Change next" items={manager?.changes ?? insight.doLess} />
                      <SmallList title="Repurpose" items={manager?.repurposeIdeas ?? []} />
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="rounded-xl border border-dashed border-white/10 p-6 text-sm text-white/35 lg:col-span-2">
                Enter the first 48h checkpoints. HSAKAA will start cautiously and become more decisive after comparable 96h samples accumulate.
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="grid gap-3 sm:grid-cols-3">
        <MetricCard label="Total reach" value={compact(growth.totalReach)} />
        <MetricCard label="Total views" value={compact(growth.totalViews)} />
        <MetricCard label="Followers gained" value={compact(growth.totalFollowersGained)} />
      </section>
    </div>
  );
}

function ProfileManagerSummary({
  overview,
}: {
  overview: MediaSocialPresenceOverview;
}) {
  const reviews = overview.latestReview?.platformReviews ?? [];
  const actionCount = reviews.reduce(
    (sum, review) =>
      sum +
      (review.profileManager?.actions ?? []).filter((action) =>
        ["pin", "unpin"].includes(action.action),
      ).length,
    0,
  );

  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div>
          <div className="flex items-center gap-2 text-lg font-black text-white">
            <Bookmark className="h-5 w-5 text-[#C6FF32]" /> Profile manager
          </div>
          <p className="mt-1 max-w-3xl text-sm leading-6 text-white/45">
            HSAKAA uses the same 48h/96h evidence to decide what should be pinned, kept pinned or unpinned, and whether your bio, profile photo, link or banner should change.
          </p>
        </div>
        <Link
          href="/admin/media/network"
          className="inline-flex items-center justify-center rounded-xl border border-[#C6FF32]/25 px-4 py-2.5 text-sm font-bold text-[#C6FF32]"
        >
          Open full profile manager
        </Link>
      </div>

      {reviews.length ? (
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {reviews
            .filter((review) => (review.profileManager?.pinnedCapacity ?? 0) > 0)
            .map((review) => {
              const manager = review.profileManager!;
              const actionable = manager.actions.filter((action) =>
                ["pin", "unpin"].includes(action.action),
              );
              return (
                <div
                  key={review.platform}
                  className="rounded-xl border border-white/10 bg-black/20 p-4"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="text-sm font-black text-white">
                      {platformLabel(review.platform)}
                    </div>
                    <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] font-black uppercase text-white/40">
                      {manager.confidence} confidence
                    </span>
                  </div>
                  <p className="mt-2 text-xs leading-5 text-white/45">
                    {actionable.length
                      ? `${actionable.length} profile action${actionable.length === 1 ? "" : "s"} ready.`
                      : "No pin/unpin change justified yet."}
                  </p>
                  <div className="mt-3 space-y-2">
                    {actionable.slice(0, 2).map((action) => (
                      <div
                        key={`${action.action}-${action.publicationId}`}
                        className="rounded-lg border border-white/8 px-3 py-2"
                      >
                        <div className="text-[10px] font-black uppercase tracking-[0.12em] text-[#C6FF32]">
                          {action.action === "pin" ? "Pin" : "Unpin"}
                        </div>
                        <div className="mt-1 line-clamp-1 text-xs font-bold text-white/70">
                          {action.title || action.hook || "Post"}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
        </div>
      ) : (
        <div className="mt-4 rounded-xl border border-dashed border-white/10 p-5 text-sm text-white/35">
          Run the profile review once your first 48h/96h analytics are available. HSAKAA will stay conservative until it has evidence.
        </div>
      )}

      <p className="mt-4 text-xs text-white/30">
        {actionCount
          ? `${actionCount} pin/unpin decision${actionCount === 1 ? "" : "s"} currently require your action.`
          : "No profile pin changes currently require action."}
      </p>
    </section>
  );
}

function ContentAnalyticsCard({
  item,
  insight,
  pending,
  getValues,
  setValues,
  onSave,
}: {
  item: MediaManualAnalyticsQueueItem;
  insight?: MediaLearningOverview["performance"][number];
  pending: boolean;
  getValues: (period: CheckpointPeriod) => Record<string, string>;
  setValues: (
    period: CheckpointPeriod,
    updater: SetStateAction<Record<string, string>>,
  ) => void;
  onSave: (period: CheckpointPeriod) => void;
}) {
  const anchor = item.publishedAt ?? item.manualPublishCompletedAt ?? item.scheduledAt;
  return (
    <article className="rounded-2xl border border-white/10 bg-black/20 p-4 lg:p-5">
      <div className="flex flex-col justify-between gap-4 lg:flex-row lg:items-start">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em] text-white/35">
            <span>{platformLabel(item.platform)}</span>
            <span>·</span>
            <span>{item.format.replaceAll("_", " ")}</span>
            <span>·</span>
            <span>{formatDateTime(anchor)}</span>
            {item.publishedAt ? (
              <span className="rounded-full border border-[#C6FF32]/20 bg-[#C6FF32]/5 px-2 py-0.5 text-[#C6FF32]">
                Published
              </span>
            ) : (
              <span className="rounded-full border border-white/10 px-2 py-0.5 text-white/40">
                Using scheduled time
              </span>
            )}
          </div>
          <h3 className="mt-2 text-base font-black text-white">{item.title}</h3>
          {item.hook ? (
            <p className="mt-2 text-sm font-semibold leading-6 text-white/70">
              Hook: {item.hook}
            </p>
          ) : null}
          {item.caption ? (
            <p className="mt-2 line-clamp-2 max-w-4xl text-sm leading-6 text-white/40">
              {item.caption}
            </p>
          ) : null}
          {item.cta ? (
            <p className="mt-2 text-xs text-white/35">CTA: {item.cta}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {insight?.management ? (
            <span className="rounded-full border border-[#C6FF32]/20 bg-[#C6FF32]/5 px-3 py-1.5 text-xs font-black text-[#C6FF32]">
              Score {insight.management.performanceScore.toFixed(1)}
            </span>
          ) : null}
          {item.externalPostUrl ? (
            <a
              href={item.externalPostUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-bold text-white/55"
            >
              Open post <ExternalLink className="h-3.5 w-3.5" />
            </a>
          ) : null}
        </div>
      </div>

      <div className="mt-5 grid gap-4 xl:grid-cols-2">
        {(["48_hours", "96_hours"] as CheckpointPeriod[]).map((period) => {
          const checkpoint = checkpointFor(item, period);
          return (
            <CheckpointEditor
              key={period}
              period={period}
              checkpoint={checkpoint}
              values={getValues(period)}
              onChange={(updater) => setValues(period, updater)}
              onSave={() => onSave(period)}
              pending={pending}
            />
          );
        })}
      </div>
    </article>
  );
}

function CheckpointEditor({
  period,
  checkpoint,
  values,
  onChange,
  onSave,
  pending,
}: {
  period: CheckpointPeriod;
  checkpoint: MediaManualAnalyticsCheckpoint;
  values: Record<string, string>;
  onChange: Dispatch<SetStateAction<Record<string, string>>>;
  onSave: () => void;
  pending: boolean;
}) {
  const isWaiting = checkpoint.state === "waiting";
  const isComplete = checkpoint.state === "complete";
  return (
    <div
      className={`rounded-xl border p-4 ${
        isComplete
          ? "border-[#C6FF32]/15 bg-[#C6FF32]/[0.035]"
          : checkpoint.state === "due"
            ? "border-amber-300/20 bg-amber-300/[0.035]"
            : "border-white/8 bg-white/[0.015]"
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex items-center gap-2 text-sm font-black text-white">
            {isComplete ? (
              <Check className="h-4 w-4 text-[#C6FF32]" />
            ) : (
              <Clock3 className="h-4 w-4 text-white/45" />
            )}
            {checkpointLabel(period)} analytics
          </div>
          <div className="mt-1 text-xs text-white/35">
            {isComplete
              ? `Saved ${formatDateTime(checkpoint.capturedAt)}`
              : isWaiting
                ? `Available ${formatDateTime(checkpoint.dueAt)}`
                : `Due since ${formatDateTime(checkpoint.dueAt)}`}
          </div>
        </div>
        <span
          className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.1em] ${
            isComplete
              ? "border-[#C6FF32]/20 text-[#C6FF32]"
              : checkpoint.state === "due"
                ? "border-amber-300/20 text-amber-200"
                : "border-white/10 text-white/35"
          }`}
        >
          {isComplete ? "Saved" : checkpoint.state === "due" ? "Enter now" : "Waiting"}
        </span>
      </div>

      {isWaiting ? (
        <p className="mt-4 text-sm leading-6 text-white/35">
          No action yet. HSAKAA will move this checkpoint into Due now after {checkpointLabel(period)}.
        </p>
      ) : (
        <>
          <div className="mt-4">
            <MetricInputs values={values} onChange={onChange} />
          </div>
          <button
            type="button"
            disabled={pending}
            onClick={onSave}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#C6FF32] px-4 py-2.5 text-sm font-black text-black disabled:opacity-50"
          >
            <Save className="h-4 w-4" /> {isComplete ? "Update analytics" : "Save analytics"}
          </button>
        </>
      )}
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <div className="text-xs uppercase tracking-[0.12em] text-white/35">{label}</div>
      <div className="mt-2 text-2xl font-black text-white">{value}</div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  type = "text",
  step,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  step?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[10px] font-bold uppercase tracking-[0.08em] text-white/35">
        {label}
      </span>
      <input
        type={type}
        value={value}
        step={step}
        min={type === "number" ? 0 : undefined}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-lg border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none focus:border-[#C6FF32]/35"
      />
    </label>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.1em] text-white/35">
        {label}
      </span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="w-full rounded-xl border border-white/10 bg-black/30 px-3 py-2.5 text-sm text-white outline-none focus:border-[#C6FF32]/35"
      >
        {options.map((option) => (
          <option key={`${label}-${option.value}`} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function MetricInputs({
  values,
  onChange,
}: {
  values: Record<string, string>;
  onChange: Dispatch<SetStateAction<Record<string, string>>>;
}) {
  return (
    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
      {metricFields.map((field) => (
        <InputField
          key={String(field.key)}
          label={field.label}
          type="number"
          step={field.step}
          value={values[String(field.key)] ?? ""}
          onChange={(value) =>
            onChange((current) => ({ ...current, [field.key]: value }))
          }
        />
      ))}
    </div>
  );
}

function DecisionCard({
  icon,
  label,
  decision,
  reason,
  extra,
}: {
  icon: ReactNode;
  label: string;
  decision?: string;
  reason: string;
  extra?: string;
}) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.02] p-3">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-xs font-bold text-white/50">
          {icon} {label}
        </div>
        <span
          className={`rounded-full border px-2 py-1 text-[10px] font-black uppercase tracking-[0.1em] ${decisionClass(decision)}`}
        >
          {decisionLabel(decision)}
        </span>
      </div>
      <p className="mt-2 text-xs leading-5 text-white/45">{reason}</p>
      {extra ? <p className="mt-2 text-xs font-bold text-[#C6FF32]">{extra}</p> : null}
    </div>
  );
}

function SmallList({ title, items }: { title: string; items: string[] }) {
  return (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-[0.12em] text-white/35">
        {title}
      </div>
      {items.length ? (
        <ul className="mt-2 space-y-1.5 text-sm leading-5 text-white/55">
          {items.slice(0, 4).map((item) => (
            <li key={item}>• {item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-white/25">No action yet.</p>
      )}
    </div>
  );
}
