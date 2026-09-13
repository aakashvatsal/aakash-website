"use client";

import { useState, useTransition, type ComponentType } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  BarChart3,
  Eye,
  Heart,
  MessageCircle,
  MousePointerClick,
  RefreshCw,
  Save,
  Share2,
  Sparkles,
  UserPlus,
} from "lucide-react";
import {
  recalibrateMediaFromBuffer,
  syncMediaBufferAccounts,
} from "@/lib/api/media";
import type {
  MediaBufferInsights,
  MediaBufferStatus,
} from "@/types/media";

const platformLabels: Record<string, string> = {
  linkedin: "LinkedIn",
  instagram: "Instagram",
  youtube: "YouTube",
  x: "X",
  whatsapp: "WhatsApp",
};

export function MediaBufferInsightsManager({
  initialStatus,
  initialInsights,
}: {
  initialStatus: MediaBufferStatus;
  initialInsights: MediaBufferInsights | null;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function run(action: "sync" | "recalibrate") {
    setMessage("");
    setError("");
    startTransition(async () => {
      try {
        if (action === "sync") {
          await syncMediaBufferAccounts();
          setMessage("Buffer channels synced with Media accounts.");
        } else {
          await recalibrateMediaFromBuffer();
          setMessage(
            "Buffer metrics synced into Personal OS and HSAKAA learning/strategy recalibrated.",
          );
        }
        router.refresh();
      } catch (value) {
        setError(
          value instanceof Error ? value.message : "Buffer operation failed.",
        );
      }
    });
  }

  if (!initialStatus.configured) {
    return (
      <section className="rounded-[26px] border border-amber-300/20 bg-amber-300/[0.04] p-6">
        <h2 className="text-xl font-black text-white">Buffer metrics are not configured</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/50">
          Configure <code className="text-amber-200">BUFFER_API_KEY</code> on the backend. The
          Personal OS remains the analytics source of truth; Buffer is used as an additional
          post-performance ingest source.
        </p>
      </section>
    );
  }

  const insights = initialInsights;
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

      <section className="rounded-[26px] border border-[#C6FF32]/20 bg-[#C6FF32]/[0.035] p-5 sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-4xl">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-[#C6FF32]">
              <BarChart3 className="h-4 w-4" /> Buffer → HSAKAA feedback loop
            </div>
            <h2 className="mt-3 text-2xl font-black tracking-[-0.04em] text-white">
              See what worked, then calibrate the next plan
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/50">
              Buffer performance is normalized into Personal OS snapshots. HSAKAA uses repeated
              evidence to adjust topic, hook, format, length and timing choices without copying
              successful wording or turning internal creator strategy into public content.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              disabled={isPending}
              onClick={() => run("sync")}
              className="rounded-xl border border-white/10 px-4 py-2.5 text-sm font-bold text-white/65 disabled:opacity-40"
            >
              <RefreshCw className="mr-2 inline h-4 w-4" /> Sync channels
            </button>
            <button
              disabled={isPending}
              onClick={() => run("recalibrate")}
              className="rounded-xl bg-[#C6FF32] px-4 py-2.5 text-sm font-black text-black disabled:opacity-40"
            >
              <Sparkles className="mr-2 inline h-4 w-4" />
              {isPending ? "Recalibrating…" : "Sync + recalibrate HSAKAA"}
            </button>
          </div>
        </div>
        <div className="mt-5 flex flex-wrap gap-2 text-[11px] text-white/35">
          <span className="rounded-full border border-white/10 px-3 py-1">
            {initialStatus.accounts.length} Media account{initialStatus.accounts.length === 1 ? "" : "s"}
          </span>
          <span className="rounded-full border border-white/10 px-3 py-1">
            Buffer reachable: {initialStatus.reachable ? "yes" : "no"}
          </span>
          <span className="rounded-full border border-white/10 px-3 py-1">
            Metrics refresh approximately daily
          </span>
          <span className="rounded-full border border-white/10 px-3 py-1">
            Comment text stays in Engagement Inbox
          </span>
        </div>
      </section>

      {insights ? (
        <>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <MetricCard icon={Eye} label="Impressions" value={insights.totals.impressions} />
            <MetricCard icon={Activity} label="Reach" value={insights.totals.reach} />
            <MetricCard icon={Heart} label="Reactions" value={insights.totals.reactions} />
            <MetricCard icon={MessageCircle} label="Comments" value={insights.totals.comments} />
            <MetricCard icon={Share2} label="Shares" value={insights.totals.shares} />
            <MetricCard icon={Save} label="Saves" value={insights.totals.saves} />
            <MetricCard icon={MousePointerClick} label="Clicks" value={insights.totals.clicks} />
            <MetricCard icon={UserPlus} label="Follows" value={insights.totals.followersGained} />
            <MetricCard icon={Eye} label="Views" value={insights.totals.views} />
            <MetricCard icon={BarChart3} label="Posts read" value={insights.totals.posts} />
          </div>

          <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-black text-white">Recent sent posts</h2>
                <p className="mt-1 text-xs text-white/35">
                  Normalized Buffer metrics by post. Availability varies by platform.
                </p>
              </div>
              <p className="text-[11px] text-white/25">
                Updated {new Date(insights.generatedAt).toLocaleString()}
              </p>
            </div>
            <div className="mt-4 space-y-3">
              {insights.posts.length ? (
                insights.posts.map((row) => <PostMetricRow key={`${row.accountId}-${row.post.id}`} row={row} />)
              ) : (
                <p className="rounded-xl border border-dashed border-white/10 p-6 text-center text-sm text-white/35">
                  Buffer has not returned sent-post metrics for the connected channels yet.
                </p>
              )}
            </div>
          </section>

          {insights.failures.length ? (
            <section className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.035] p-5">
              <h2 className="font-black text-amber-100">Channels needing attention</h2>
              <div className="mt-3 space-y-2">
                {insights.failures.map((failure) => (
                  <p key={`${failure.accountId}-${failure.error}`} className="text-xs leading-5 text-amber-100/60">
                    <span className="font-bold text-amber-100">
                      {platformLabels[failure.platform] ?? failure.platform} · {failure.displayName}:
                    </span>{" "}
                    {failure.error}
                  </p>
                ))}
              </div>
            </section>
          ) : null}
        </>
      ) : (
        <section className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-white/35">
          No Buffer insight snapshot yet. Use Sync + recalibrate HSAKAA.
        </section>
      )}
    </div>
  );
}

function PostMetricRow({
  row,
}: {
  row: MediaBufferInsights["posts"][number];
}) {
  const metrics = row.normalized;
  return (
    <article className="rounded-xl border border-white/5 bg-black/20 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#C6FF32]">
            {platformLabels[row.platform] ?? row.platform} · {row.displayName}
          </p>
          <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm leading-6 text-white/65">
            {row.post.text || "Sent post"}
          </p>
        </div>
        {row.post.externalLink ? (
          <a
            href={row.post.externalLink}
            target="_blank"
            rel="noreferrer"
            className="rounded-lg border border-white/10 px-3 py-1.5 text-xs font-bold text-white/45 hover:text-[#C6FF32]"
          >
            Open post
          </a>
        ) : null}
      </div>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 xl:grid-cols-8">
        <TinyMetric label="Impressions" value={metrics.impressions} />
        <TinyMetric label="Reach" value={metrics.reach} />
        <TinyMetric label="Views" value={metrics.views} />
        <TinyMetric label="Reactions" value={metrics.likes} />
        <TinyMetric label="Comments" value={metrics.comments} />
        <TinyMetric label="Shares" value={metrics.shares} />
        <TinyMetric label="Saves" value={metrics.saves} />
        <TinyMetric label="Clicks" value={metrics.clicks} />
      </div>
      <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-[11px] text-white/30">
        {typeof metrics.engagementRate === "number" ? (
          <span>Engagement rate {formatPercent(metrics.engagementRate)}</span>
        ) : null}
        {typeof metrics.followersGained === "number" ? <span>Follows +{formatNumber(metrics.followersGained)}</span> : null}
        {typeof metrics.watchTimeSeconds === "number" && metrics.watchTimeSeconds > 0 ? (
          <span>Watch time {formatDuration(metrics.watchTimeSeconds)}</span>
        ) : null}
        {row.post.metricsUpdatedAt ? (
          <span>Metric refresh {new Date(row.post.metricsUpdatedAt).toLocaleString()}</span>
        ) : null}
      </div>
    </article>
  );
}

function MetricCard({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <Icon className="h-4 w-4 text-[#C6FF32]" />
      <p className="mt-3 text-2xl font-black text-white">{formatNumber(value)}</p>
      <p className="mt-1 text-[11px] uppercase tracking-[0.12em] text-white/30">{label}</p>
    </div>
  );
}

function TinyMetric({ label, value }: { label: string; value?: number }) {
  return (
    <div className="rounded-lg bg-white/[0.025] px-3 py-2">
      <p className="text-sm font-black text-white/75">{formatNumber(value ?? 0)}</p>
      <p className="mt-0.5 text-[9px] uppercase tracking-[0.12em] text-white/25">{label}</p>
    </div>
  );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN", { notation: value >= 10000 ? "compact" : "standard", maximumFractionDigits: 1 }).format(value);
}

function formatPercent(value: number) {
  return `${value.toFixed(value < 10 ? 2 : 1)}%`;
}

function formatDuration(seconds: number) {
  if (seconds < 60) return `${Math.round(seconds)}s`;
  if (seconds < 3600) return `${Math.round(seconds / 60)}m`;
  return `${(seconds / 3600).toFixed(1)}h`;
}
