"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Beaker,
  Eye,
  RefreshCw,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react";

import {
  createMediaGrowthExperiment,
  rebuildMediaGrowthLearnings,
  syncMediaGrowthAccounts,
  syncMediaGrowthMetrics,
} from "@/lib/api/media";
import type {
  MediaGrowthExperimentStatus,
  MediaGrowthLearning,
  MediaGrowthOverview,
  MediaPlatform,
} from "@/types/media";

interface Props {
  initialOverview: MediaGrowthOverview;
}

const platformLabels: Record<MediaPlatform, string> = {
  linkedin: "LinkedIn",
  instagram: "Instagram",
  youtube: "YouTube",
  x: "X",
  facebook: "Facebook",
  threads: "Threads",
  whatsapp: "WhatsApp",
};

const compact = new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 });

function pct(value: number) {
  return `${value >= 0 ? "+" : ""}${value.toFixed(1)}%`;
}

function StatCard({ label, value, note }: { label: string; value: string; note?: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-white/35">{label}</div>
      <div className="mt-3 text-2xl font-black text-white">{value}</div>
      {note ? <div className="mt-1 text-xs text-white/40">{note}</div> : null}
    </div>
  );
}

function LearningCard({ learning }: { learning: MediaGrowthLearning }) {
  const positive = learning.direction === "positive";
  const negative = learning.direction === "negative";
  const Icon = positive ? ArrowUpRight : negative ? ArrowDownRight : Activity;
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-white/40">
            <span>{learning.platform ? platformLabels[learning.platform] : "All platforms"}</span>
            <span>·</span>
            <span>{learning.dimension.replaceAll("_", " ")}</span>
          </div>
          <div className="mt-2 font-bold text-white">{learning.value}</div>
        </div>
        <div className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-black ${positive ? "bg-[#C6FF32]/10 text-[#C6FF32]" : negative ? "bg-red-500/10 text-red-300" : "bg-white/5 text-white/50"}`}>
          <Icon className="h-3.5 w-3.5" /> {pct(learning.liftPercent)}
        </div>
      </div>
      <p className="mt-3 text-sm leading-6 text-white/55">{learning.summary}</p>
      {learning.recommendedAction ? (
        <p className="mt-3 rounded-xl bg-white/[0.035] p-3 text-xs leading-5 text-white/50">{learning.recommendedAction}</p>
      ) : null}
      <div className="mt-3 text-xs text-white/30">Confidence {learning.confidence}% · {learning.sampleSize} posts</div>
    </div>
  );
}

export function MediaGrowthManager({ initialOverview }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>();
  const [error, setError] = useState<string>();
  const [experimentOpen, setExperimentOpen] = useState(false);
  const [experiment, setExperiment] = useState({
    title: "",
    hypothesis: "",
    platform: "" as "" | MediaPlatform,
    variable: "hook",
    control: "",
    variant: "",
  });

  const positive = useMemo(
    () => initialOverview.learnings.filter((item) => item.direction === "positive").slice(0, 6),
    [initialOverview.learnings],
  );
  const negative = useMemo(
    () => initialOverview.learnings.filter((item) => item.direction === "negative").slice(0, 6),
    [initialOverview.learnings],
  );

  function run(action: () => Promise<unknown>, success: string) {
    setError(undefined);
    setMessage(undefined);
    startTransition(async () => {
      try {
        await action();
        setMessage(success);
        router.refresh();
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Growth action failed.");
      }
    });
  }

  function createExperiment() {
    if (!experiment.title.trim() || !experiment.hypothesis.trim() || !experiment.control.trim() || !experiment.variant.trim()) {
      setError("Title, hypothesis, control and variant are required.");
      return;
    }
    run(
      () => createMediaGrowthExperiment({
        title: experiment.title,
        hypothesis: experiment.hypothesis,
        variable: experiment.variable,
        control: experiment.control,
        variant: experiment.variant,
        ...(experiment.platform ? { platform: experiment.platform } : {}),
      }),
      "Growth experiment created.",
    );
    setExperimentOpen(false);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <div>
          <div className="text-sm font-bold text-white">Last {initialOverview.rangeDays} days</div>
          <div className="mt-1 text-xs text-white/40">Personal OS owns analytics history; Buffer remains delivery infrastructure.</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button disabled={isPending} onClick={() => run(() => Promise.all([syncMediaGrowthMetrics(100), syncMediaGrowthAccounts(50)]), "Publication and account metrics refreshed.")} className="rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-white/70 disabled:opacity-40">
            <RefreshCw className="mr-1.5 inline h-3.5 w-3.5" /> Sync analytics
          </button>
          <button disabled={isPending} onClick={() => run(() => rebuildMediaGrowthLearnings({ days: 90, minSampleSize: 3 }), "Growth learnings rebuilt.")} className="rounded-xl bg-[#C6FF32] px-3 py-2 text-xs font-black text-black disabled:opacity-40">
            <Sparkles className="mr-1.5 inline h-3.5 w-3.5" /> Rebuild learnings
          </button>
          <button onClick={() => setExperimentOpen((value) => !value)} className="rounded-xl border border-[#C6FF32]/25 px-3 py-2 text-xs font-bold text-[#C6FF32]">
            <Beaker className="mr-1.5 inline h-3.5 w-3.5" /> Experiment
          </button>
        </div>
      </div>

      {message ? <div className="rounded-xl border border-[#C6FF32]/20 bg-[#C6FF32]/5 px-4 py-3 text-sm text-[#C6FF32]">{message}</div> : null}
      {error ? <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">{error}</div> : null}

      {experimentOpen ? (
        <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-5 md:grid-cols-2">
          <input value={experiment.title} onChange={(event) => setExperiment({ ...experiment, title: event.target.value })} placeholder="Experiment title" className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none" />
          <select value={experiment.platform} onChange={(event) => setExperiment({ ...experiment, platform: event.target.value as "" | MediaPlatform })} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none">
            <option value="">All / cross-platform</option>
            {(["linkedin", "instagram", "youtube", "x"] as MediaPlatform[]).map((platform) => <option key={platform} value={platform}>{platformLabels[platform]}</option>)}
          </select>
          <textarea value={experiment.hypothesis} onChange={(event) => setExperiment({ ...experiment, hypothesis: event.target.value })} placeholder="Hypothesis" className="min-h-24 rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none md:col-span-2" />
          <input value={experiment.control} onChange={(event) => setExperiment({ ...experiment, control: event.target.value })} placeholder="Control" className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none" />
          <input value={experiment.variant} onChange={(event) => setExperiment({ ...experiment, variant: event.target.value })} placeholder="Variant" className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none" />
          <div className="md:col-span-2"><button disabled={isPending} onClick={createExperiment} className="rounded-xl bg-[#C6FF32] px-4 py-2 text-sm font-black text-black disabled:opacity-40">Create experiment</button></div>
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <StatCard label="Measured posts" value={compact.format(initialOverview.publicationsMeasured)} />
        <StatCard label="Performance" value={initialOverview.averagePerformanceScore.toFixed(1)} note="Normalized 0–100" />
        <StatCard label="Followers gained" value={compact.format(initialOverview.totalFollowersGained)} />
        <StatCard label="Reach" value={compact.format(initialOverview.totalReach)} />
        <StatCard label="Views" value={compact.format(initialOverview.totalViews)} />
      </div>

      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <div className="mb-4 flex items-center gap-2"><TrendingUp className="h-4 w-4 text-[#C6FF32]" /><h2 className="font-black text-white">Platform performance</h2></div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {initialOverview.platformSummaries.map((item) => (
            <div key={item.platform} className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="font-bold text-white">{platformLabels[item.platform]}</div>
              <div className="mt-3 text-2xl font-black text-[#C6FF32]">{item.averagePerformanceScore.toFixed(1)}</div>
              <div className="mt-1 text-xs text-white/35">{item.publications} measured · engagement {item.averageEngagementRate.toFixed(2)}%</div>
              <div className="mt-3 text-xs text-white/45">Reach {compact.format(item.reach)} · Views {compact.format(item.views)} · +{compact.format(item.followersGained)} followers</div>
            </div>
          ))}
          {!initialOverview.platformSummaries.length ? <div className="text-sm text-white/35">No publication analytics yet.</div> : null}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <div className="mb-4 flex items-center gap-2"><Users className="h-4 w-4 text-[#C6FF32]" /><h2 className="font-black text-white">Account growth</h2></div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {initialOverview.accountGrowth.map((item) => (
            <div key={item.accountId} className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="text-sm font-bold text-white">{item.displayName}</div>
              <div className="mt-1 text-xs text-white/35">{platformLabels[item.platform]} · {item.snapshots} snapshots</div>
              <div className="mt-4 text-xl font-black text-white">{compact.format(item.audience)}</div>
              <div className={`mt-1 text-xs font-bold ${item.netAudienceGrowth >= 0 ? "text-[#C6FF32]" : "text-red-300"}`}>{item.netAudienceGrowth >= 0 ? "+" : ""}{compact.format(item.netAudienceGrowth)} · {pct(item.growthPercent)}</div>
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-[#C6FF32]/15 bg-[#C6FF32]/[0.025] p-5">
          <h2 className="mb-4 font-black text-white">What is working</h2>
          <div className="space-y-3">{positive.length ? positive.map((item) => <LearningCard key={item._id} learning={item} />) : <p className="text-sm text-white/35">Need at least several measured publications before positive learnings become trustworthy.</p>}</div>
        </section>
        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <h2 className="mb-4 font-black text-white">What needs testing</h2>
          <div className="space-y-3">{negative.length ? negative.map((item) => <LearningCard key={item._id} learning={item} />) : <p className="text-sm text-white/35">No high-confidence negative patterns yet.</p>}</div>
        </section>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <div className="mb-4 flex items-center gap-2"><Eye className="h-4 w-4 text-[#C6FF32]" /><h2 className="font-black text-white">Top content</h2></div>
          <div className="space-y-2">{initialOverview.topContent.map((item, index) => <div key={item.publicationId} className="flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-black/20 p-3"><div className="min-w-0"><div className="truncate text-sm font-bold text-white">{index + 1}. {item.title}</div><div className="mt-1 text-xs text-white/35">{platformLabels[item.platform]} · {item.format.replaceAll("_", " ")}</div></div><div className="text-lg font-black text-[#C6FF32]">{item.performanceScore.toFixed(1)}</div></div>)}</div>
        </section>
        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <div className="mb-4 flex items-center gap-2"><Beaker className="h-4 w-4 text-[#C6FF32]" /><h2 className="font-black text-white">Growth experiments</h2></div>
          <div className="space-y-3">{initialOverview.experiments.length ? initialOverview.experiments.slice(0, 8).map((item) => <div key={item._id} className="rounded-xl border border-white/10 bg-black/20 p-3"><div className="flex items-center justify-between gap-2"><div className="text-sm font-bold text-white">{item.title}</div><Status value={item.status} /></div><p className="mt-2 text-xs leading-5 text-white/45">{item.hypothesis}</p>{item.winner ? <div className="mt-2 text-xs text-[#C6FF32]">Winner: {item.winner} {item.liftPercent !== undefined ? `· ${pct(item.liftPercent)}` : ""}</div> : null}</div>) : <p className="text-sm text-white/35">No experiments yet. Create one when you want to test a hook, format, CTA or timing hypothesis deliberately.</p>}</div>
        </section>
      </div>

      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <h2 className="font-black text-white">Analytics connections</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {Object.entries(initialOverview.analyticsProviders).filter(([platform]) => ["linkedin", "instagram", "youtube", "x"].includes(platform)).map(([platform, provider]) => (
            <div key={platform} className="rounded-xl border border-white/10 bg-black/20 p-3">
              <div className="text-sm font-bold text-white">{platformLabels[platform as MediaPlatform]}</div>
              <div className={`mt-2 text-xs font-bold ${provider.configured ? "text-[#C6FF32]" : "text-amber-300"}`}>{provider.configured ? "Configured" : "Needs analytics credentials"}</div>
              <div className="mt-1 text-xs text-white/30">{provider.mode.replaceAll("_", " ")}</div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Status({ value }: { value: MediaGrowthExperimentStatus }) {
  return <span className="rounded-full bg-white/5 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white/45">{value}</span>;
}
