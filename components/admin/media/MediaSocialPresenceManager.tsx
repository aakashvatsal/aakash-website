"use client";

import { useMemo, useState } from "react";

import {
  getMediaSocialPresenceOverviewClient,
  refreshMediaSocialRecommendations,
  runMediaSocialPresenceReview,
  syncMediaSocialPresence,
  syncMediaSocialPresenceAccount,
  updateMediaSocialRecommendation,
} from "@/lib/api/media";
import type {
  MediaPlatform,
  MediaSocialPresenceOverview,
  MediaSocialPresencePlatformReview,
  MediaSocialRecommendation,
  MediaSocialRecommendationStatus,
} from "@/types/media";

const PLATFORM_ORDER: MediaPlatform[] = [
  "linkedin",
  "instagram",
  "youtube",
  "x",
  "whatsapp",
];

const PLATFORM_LABEL: Record<MediaPlatform, string> = {
  linkedin: "LinkedIn",
  instagram: "Instagram",
  youtube: "YouTube",
  x: "X",
  facebook: "Facebook",
  threads: "Threads",
  whatsapp: "WhatsApp",
};

function count(value?: number) {
  if (value === undefined || value === null) return "—";
  return new Intl.NumberFormat("en", { notation: "compact" }).format(value);
}

function dateTime(value?: string) {
  if (!value) return "Never";
  return new Intl.DateTimeFormat("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Kolkata",
  }).format(new Date(value));
}

function verdictClass(value?: string) {
  if (value === "keep" || value === "verified" || value === "synced") {
    return "border-emerald-400/20 bg-emerald-400/10 text-emerald-200";
  }
  if (value === "change" || value === "unverified" || value === "error") {
    return "border-rose-400/20 bg-rose-400/10 text-rose-200";
  }
  return "border-amber-300/20 bg-amber-300/10 text-amber-100";
}

function Badge({ value }: { value?: string }) {
  return (
    <span
      className={`inline-flex rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${verdictClass(value)}`}
    >
      {(value ?? "unknown").replaceAll("_", " ")}
    </span>
  );
}

function FieldComparison({
  label,
  current,
  recommended,
  verdict,
}: {
  label: string;
  current?: string;
  recommended?: string;
  verdict?: string;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
          {label}
        </p>
        {verdict ? <Badge value={verdict} /> : null}
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        <div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-white/30">
            Current
          </p>
          <p className="whitespace-pre-wrap text-sm leading-6 text-white/70">
            {current?.trim() || "Not available from live sync"}
          </p>
        </div>
        <div>
          <p className="mb-1 text-[10px] font-bold uppercase tracking-[0.15em] text-[#C6FF32]/60">
            Recommended
          </p>
          <p className="whitespace-pre-wrap text-sm leading-6 text-white/85">
            {recommended?.trim() || "Keep current / no replacement proposed"}
          </p>
        </div>
      </div>
    </div>
  );
}

function ProfileReview({
  review,
}: {
  review?: MediaSocialPresencePlatformReview;
}) {
  if (!review) {
    return (
      <div className="rounded-2xl border border-dashed border-white/10 p-4 text-sm text-white/45">
        Run the Sunday-style review to get Current vs Recommended profile guidance.
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <Badge value={review.audit.verdict} />
        <span className="text-xs text-white/45">
          confidence: {review.audit.confidence}
        </span>
      </div>
      <FieldComparison
        label="Headline / name line"
        current={review.current?.headline}
        recommended={review.audit.recommendedHeadline}
        verdict={review.audit.headlineVerdict}
      />
      <FieldComparison
        label="Bio / description"
        current={review.current?.bio}
        recommended={review.audit.recommendedBio}
        verdict={review.audit.bioVerdict}
      />
      <FieldComparison
        label="Link strategy"
        current={review.current?.websiteUrl}
        recommended={review.audit.recommendedLink}
        verdict={review.audit.linkVerdict}
      />
      <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
        <div className="mb-2 flex items-center justify-between gap-3">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
            Profile picture
          </p>
          <Badge value={review.photoAudit.verdict} />
        </div>
        <p className="text-sm leading-6 text-white/75">
          {review.photoAudit.summary}
        </p>
        <p className="mt-2 text-xs text-white/40">
          {review.photoAudit.inspected
            ? "Image was inspected multimodally in this review."
            : "Image was not reliably inspected this run; HSAKAA does not pretend it saw it."}
        </p>
        {review.photoAudit.improvements.length ? (
          <ul className="mt-3 space-y-1 text-xs leading-5 text-white/55">
            {review.photoAudit.improvements.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        ) : null}
      </div>
      {review.audit.reasons.length ? (
        <div className="rounded-2xl border border-white/8 p-4">
          <p className="mb-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/40">
            Why
          </p>
          <ul className="space-y-1 text-sm leading-6 text-white/65">
            {review.audit.reasons.map((item) => (
              <li key={item}>• {item}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function RecommendationCard({
  item,
  busy,
  onStatus,
}: {
  item: MediaSocialRecommendation;
  busy: boolean;
  onStatus: (id: string, status: MediaSocialRecommendationStatus) => void;
}) {
  return (
    <article className="rounded-3xl border border-white/8 bg-white/[0.025] p-5">
      <div className="flex items-start gap-4">
        <div
          className="h-12 w-12 shrink-0 rounded-2xl border border-white/10 bg-white/5 bg-cover bg-center"
          style={
            item.profileImageUrl
              ? { backgroundImage: `url(${item.profileImageUrl})` }
              : undefined
          }
        />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-black text-white">{item.displayName}</h4>
            <Badge value={item.verification} />
            <Badge value={item.priority} />
          </div>
          <p className="mt-1 text-xs text-white/45">
            {PLATFORM_LABEL[item.platform]} · {item.category}
            {item.username ? ` · @${item.username}` : ""}
          </p>
        </div>
      </div>
      <div className="mt-4 space-y-3 text-sm leading-6">
        <p className="text-white/75">
          <span className="font-bold text-white/45">Why follow:</span>{" "}
          {item.whyFollow}
        </p>
        <p className="text-white/65">
          <span className="font-bold text-white/45">Learn:</span>{" "}
          {item.whatToLearn}
        </p>
        <p className="text-white/55">
          <span className="font-bold text-white/45">Do not imitate:</span>{" "}
          {item.doNotImitate}
        </p>
      </div>
      {item.verificationNote ? (
        <p className="mt-3 text-xs leading-5 text-white/35">
          {item.verificationNote}
        </p>
      ) : null}
      <div className="mt-4 flex flex-wrap gap-2">
        {item.profileUrl ? (
          <a
            href={item.profileUrl}
            target="_blank"
            rel="noreferrer"
            className="rounded-xl border border-white/10 px-3 py-2 text-xs font-black text-white/70"
          >
            Open profile
          </a>
        ) : null}
        {item.status !== "followed" ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => onStatus(item._id, "followed")}
            className="rounded-xl bg-[#C6FF32] px-3 py-2 text-xs font-black text-black disabled:opacity-40"
          >
            Mark followed
          </button>
        ) : null}
        {item.status !== "dismissed" ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => onStatus(item._id, "dismissed")}
            className="rounded-xl border border-white/10 px-3 py-2 text-xs font-black text-white/55 disabled:opacity-40"
          >
            Dismiss
          </button>
        ) : null}
        {item.status !== "recommended" ? (
          <button
            type="button"
            disabled={busy}
            onClick={() => onStatus(item._id, "recommended")}
            className="rounded-xl border border-[#C6FF32]/25 px-3 py-2 text-xs font-black text-[#C6FF32] disabled:opacity-40"
          >
            Restore
          </button>
        ) : null}
      </div>
    </article>
  );
}

export function MediaSocialPresenceManager({
  initialOverview,
}: {
  initialOverview: MediaSocialPresenceOverview;
}) {
  const [overview, setOverview] = useState(initialOverview);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [historyOpen, setHistoryOpen] = useState(false);

  const latestReviewByPlatform = useMemo(() => {
    const map = new Map<MediaPlatform, MediaSocialPresencePlatformReview>();
    for (const item of overview.latestReview?.platformReviews ?? []) {
      map.set(item.platform, item);
    }
    return map;
  }, [overview.latestReview]);

  const recommendations = overview.recommendations.filter(
    (item) => historyOpen || item.status === "recommended",
  );

  async function refresh() {
    setOverview(await getMediaSocialPresenceOverviewClient());
  }

  async function runAction(key: string, action: () => Promise<unknown>) {
    setBusyKey(key);
    setError(null);
    setNotice(null);
    try {
      await action();
      await refresh();
    } catch (actionError) {
      setError(
        actionError instanceof Error ? actionError.message : "Media action failed.",
      );
    } finally {
      setBusyKey(null);
    }
  }

  async function syncAll() {
    await runAction("sync-all", async () => {
      await syncMediaSocialPresence(true);
      setNotice("Live profiles and supported following/subscription graphs synced.");
    });
  }

  async function refreshRecommendations() {
    await runAction("recommend", async () => {
      await refreshMediaSocialRecommendations(true);
      setNotice("HSAKAA refreshed the deliberate follow list and verification state.");
    });
  }

  async function runReview() {
    await runAction("review", async () => {
      await runMediaSocialPresenceReview(true);
      setNotice("Sunday-style Social Presence review completed.");
    });
  }

  async function changeRecommendation(
    id: string,
    status: MediaSocialRecommendationStatus,
  ) {
    await runAction(`recommendation-${id}`, () =>
      updateMediaSocialRecommendation(id, status),
    );
  }

  return (
    <div className="space-y-8">
      <section className="rounded-[28px] border border-[#C6FF32]/15 bg-[#C6FF32]/[0.035] p-5 lg:p-7">
        <div className="grid gap-5 lg:grid-cols-[1fr_auto] lg:items-center">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#C6FF32]">
              Weekly identity rule
            </p>
            <h2 className="mt-2 text-2xl font-black text-white">
              Audit weekly. Change rarely.
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">
              HSAKAA can inspect and recommend; it cannot silently change a profile
              or follow an account. Sunday review runs at 7:05 AM IST after the
              existing Media learning/adaptation loop.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={Boolean(busyKey)}
              onClick={syncAll}
              className="rounded-xl bg-[#C6FF32] px-4 py-3 text-sm font-black text-black disabled:opacity-40"
            >
              {busyKey === "sync-all" ? "Syncing…" : "Sync live accounts"}
            </button>
            <button
              type="button"
              disabled={Boolean(busyKey)}
              onClick={runReview}
              className="rounded-xl border border-[#C6FF32]/30 px-4 py-3 text-sm font-black text-[#C6FF32] disabled:opacity-40"
            >
              {busyKey === "review" ? "Reviewing…" : "Run Sunday review"}
            </button>
          </div>
        </div>
        {error ? (
          <p className="mt-4 rounded-xl border border-rose-400/20 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </p>
        ) : null}
        {notice ? (
          <p className="mt-4 rounded-xl border border-emerald-400/20 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-200">
            {notice}
          </p>
        ) : null}
      </section>

      {overview.latestReview ? (
        <section className="rounded-[28px] border border-white/8 bg-white/[0.025] p-5 lg:p-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/35">
                Latest Sunday review
              </p>
              <h3 className="mt-2 text-xl font-black text-white">
                {overview.latestReview.summary}
              </h3>
              <p className="mt-2 text-sm text-white/45">
                {overview.latestReview.profilesKept} profiles kept ·{" "}
                {overview.latestReview.profileChangesRecommended} meaningful
                changes/reviews · {overview.latestReview.recommendationsActive}{" "}
                active follow recommendations
              </p>
            </div>
            <p className="text-xs text-white/35">
              {dateTime(overview.latestReview.generatedAt)}
            </p>
          </div>
        </section>
      ) : null}

      <section className="space-y-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/35">
            Live identity
          </p>
          <h3 className="mt-1 text-xl font-black text-white">
            Current profile vs HSAKAA recommendation
          </h3>
        </div>
        <div className="grid gap-5 xl:grid-cols-2">
          {PLATFORM_ORDER.map((platform) => {
            const accountEntry = overview.accounts.find(
              (item) => item.account.platform === platform,
            );
            const profile = accountEntry?.profile;
            const review = latestReviewByPlatform.get(platform);
            return (
              <article
                key={platform}
                className="rounded-[28px] border border-white/8 bg-white/[0.025] p-5 lg:p-6"
              >
                <div className="flex items-start gap-4">
                  <div
                    className="h-16 w-16 shrink-0 rounded-2xl border border-white/10 bg-white/5 bg-cover bg-center"
                    style={
                      profile?.profileImageUrl
                        ? { backgroundImage: `url(${profile.profileImageUrl})` }
                        : undefined
                    }
                  />
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-lg font-black text-white">
                        {PLATFORM_LABEL[platform]}
                      </h3>
                      <Badge value={profile?.syncStatus ?? "not_configured"} />
                    </div>
                    <p className="mt-1 truncate text-sm text-white/55">
                      {profile?.displayName ?? accountEntry?.account.displayName ?? "No account"}
                      {profile?.username ? ` · @${profile.username}` : ""}
                    </p>
                    <p className="mt-1 text-xs text-white/35">
                      Last sync: {dateTime(profile?.syncedAt)}
                    </p>
                  </div>
                  {accountEntry ? (
                    <button
                      type="button"
                      disabled={Boolean(busyKey)}
                      onClick={() =>
                        runAction(`sync-${accountEntry.account._id}`, () =>
                          syncMediaSocialPresenceAccount(
                            accountEntry.account._id,
                            true,
                          ),
                        )
                      }
                      className="rounded-xl border border-white/10 px-3 py-2 text-xs font-black text-white/60 disabled:opacity-40"
                    >
                      Sync
                    </button>
                  ) : null}
                </div>

                <div className="mt-5 grid grid-cols-3 gap-2">
                  <div className="rounded-2xl border border-white/8 p-3">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-white/30">
                      Followers
                    </p>
                    <p className="mt-1 font-black text-white">
                      {count(profile?.followerCount)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/8 p-3">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-white/30">
                      Following
                    </p>
                    <p className="mt-1 font-black text-white">
                      {count(profile?.followingCount)}
                    </p>
                  </div>
                  <div className="rounded-2xl border border-white/8 p-3">
                    <p className="text-[10px] uppercase tracking-[0.15em] text-white/30">
                      Observed
                    </p>
                    <p className="mt-1 font-black text-white">
                      {accountEntry?.observedFollowingCount ?? 0}
                    </p>
                  </div>
                </div>

                {profile?.syncNote ? (
                  <p className="mt-4 rounded-xl border border-white/8 px-3 py-2 text-xs leading-5 text-white/40">
                    {profile.syncNote}
                  </p>
                ) : null}
                {accountEntry?.nativeSync.note ? (
                  <p className="mt-3 text-xs leading-5 text-white/35">
                    {accountEntry.nativeSync.note}
                  </p>
                ) : null}
                {profile?.profileUrl ? (
                  <a
                    href={profile.profileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 inline-block text-xs font-black text-[#C6FF32]"
                  >
                    Open live profile ↗
                  </a>
                ) : null}

                <div className="mt-5">
                  <ProfileReview review={review} />
                </div>
              </article>
            );
          })}
        </div>
      </section>

      <section className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/35">
              Deliberate network
            </p>
            <h3 className="mt-1 text-xl font-black text-white">
              Accounts HSAKAA thinks are worth following
            </h3>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/45">
              Recommendations are remembered. Followed and dismissed accounts do
              not get endlessly rediscovered. Verified means the native API could
              confirm the exact account; manual required means you should verify it
              on-platform first.
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              disabled={Boolean(busyKey)}
              onClick={refreshRecommendations}
              className="rounded-xl bg-[#C6FF32] px-4 py-2.5 text-xs font-black text-black disabled:opacity-40"
            >
              {busyKey === "recommend" ? "Researching…" : "Refresh suggestions"}
            </button>
            <button
              type="button"
              onClick={() => setHistoryOpen((value) => !value)}
              className="rounded-xl border border-white/10 px-4 py-2.5 text-xs font-black text-white/60"
            >
              {historyOpen ? "Active only" : "Show history"}
            </button>
          </div>
        </div>
        <div className="grid gap-4 lg:grid-cols-2">
          {recommendations.map((item) => (
            <RecommendationCard
              key={item._id}
              item={item}
              busy={Boolean(busyKey)}
              onStatus={changeRecommendation}
            />
          ))}
        </div>
        {!recommendations.length ? (
          <div className="rounded-3xl border border-dashed border-white/10 p-8 text-center text-sm text-white/45">
            No active recommendations yet. Refresh suggestions after your live
            accounts are synced.
          </div>
        ) : null}
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        <div className="rounded-[28px] border border-white/8 bg-white/[0.025] p-5 lg:p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/35">
            Observed network
          </p>
          <h3 className="mt-1 text-lg font-black text-white">
            Following / subscriptions HSAKAA can actually see
          </h3>
          <div className="mt-4 max-h-[420px] space-y-2 overflow-auto pr-1">
            {overview.following.slice(0, 100).map((item) => (
              <div
                key={item._id}
                className="flex items-center justify-between gap-3 rounded-2xl border border-white/8 px-3 py-3"
              >
                <div className="min-w-0">
                  <p className="truncate text-sm font-bold text-white/75">
                    {item.displayName ?? item.username ?? item.externalProfileId}
                  </p>
                  <p className="text-xs text-white/35">
                    {PLATFORM_LABEL[item.platform]}
                    {item.username ? ` · @${item.username}` : ""}
                  </p>
                </div>
                {item.profileUrl ? (
                  <a
                    href={item.profileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-black text-[#C6FF32]"
                  >
                    Open
                  </a>
                ) : null}
              </div>
            ))}
            {!overview.following.length ? (
              <p className="text-sm leading-6 text-white/40">
                No supported following graph has been synced yet. YouTube OAuth
                subscriptions and X following are the primary native reads in this
                phase.
              </p>
            ) : null}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/8 bg-white/[0.025] p-5 lg:p-6">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/35">
            Sunday history
          </p>
          <h3 className="mt-1 text-lg font-black text-white">
            Weekly identity decisions
          </h3>
          <div className="mt-4 space-y-3">
            {overview.reviews.slice(0, 8).map((review) => (
              <div
                key={review._id}
                className="rounded-2xl border border-white/8 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <p className="text-sm font-black text-white/75">
                    Week of {new Date(review.weekOf).toLocaleDateString("en-IN")}
                  </p>
                  <span className="text-xs text-white/35">
                    {review.profileChangesRecommended} change
                    {review.profileChangesRecommended === 1 ? "" : "s"}
                  </span>
                </div>
                <p className="mt-2 text-sm leading-6 text-white/50">
                  {review.summary}
                </p>
              </div>
            ))}
            {!overview.reviews.length ? (
              <p className="text-sm text-white/40">
                No Sunday Social Presence review has run yet.
              </p>
            ) : null}
          </div>
        </div>
      </section>
    </div>
  );
}
