"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Activity, Brain, MessageSquareText, RefreshCw, Sparkles, TrendingUp } from "lucide-react";

import {
  rebuildMediaAudienceLearning,
  rebuildMediaLearning,
  rebuildMediaPerformanceLearning,
  syncMediaLifecycleMetrics,
} from "@/lib/api/media";
import type { MediaLearningOverview, MediaPlatform } from "@/types/media";

const platformLabels: Record<MediaPlatform, string> = {
  linkedin: "LinkedIn",
  instagram: "Instagram",
  youtube: "YouTube",
  x: "X",
  facebook: "Facebook",
  threads: "Threads",
  whatsapp: "WhatsApp",
};

function Badge({ children }: { children: React.ReactNode }) {
  return <span className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.1em] text-white/45">{children}</span>;
}

export function MediaLearningManager({ initialOverview }: { initialOverview: MediaLearningOverview }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>();
  const [error, setError] = useState<string>();

  function run(action: () => Promise<unknown>, success: string) {
    setError(undefined);
    setMessage(undefined);
    startTransition(async () => {
      try {
        await action();
        setMessage(success);
        router.refresh();
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Media learning action failed.");
      }
    });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4">
        <div>
          <div className="font-bold text-white">Closed-loop learning</div>
          <div className="mt-1 text-xs text-white/40">1h → 24h → 72h → 7d → 30d, then performance + audience intelligence flows back into the next plan.</div>
        </div>
        <div className="flex flex-wrap gap-2">
          <button disabled={isPending} onClick={() => run(syncMediaLifecycleMetrics, "Due lifecycle metrics synced.")} className="rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-white/65 disabled:opacity-40"><RefreshCw className="mr-1.5 inline h-3.5 w-3.5" />Sync due metrics</button>
          <button disabled={isPending} onClick={() => run(() => rebuildMediaLearning(90), "Performance and audience intelligence rebuilt.")} className="rounded-xl bg-[#C6FF32] px-3 py-2 text-xs font-black text-black disabled:opacity-40"><Sparkles className="mr-1.5 inline h-3.5 w-3.5" />Rebuild all</button>
        </div>
      </div>

      {message ? <div className="rounded-xl border border-[#C6FF32]/20 bg-[#C6FF32]/5 px-4 py-3 text-sm text-[#C6FF32]">{message}</div> : null}
      {error ? <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">{error}</div> : null}

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"><Activity className="h-4 w-4 text-[#C6FF32]" /><div className="mt-3 text-2xl font-black text-white">{initialOverview.lifecycle.dueSnapshots}</div><div className="text-xs text-white/40">Lifecycle snapshots currently due</div></div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"><TrendingUp className="h-4 w-4 text-[#C6FF32]" /><div className="mt-3 text-2xl font-black text-white">{initialOverview.performance.length}</div><div className="text-xs text-white/40">Post analyses retained</div></div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"><MessageSquareText className="h-4 w-4 text-[#C6FF32]" /><div className="mt-3 text-2xl font-black text-white">{initialOverview.audience.length}</div><div className="text-xs text-white/40">Audience signal clusters</div></div>
      </div>

      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-black text-white">Performance intelligence</h2><p className="mt-1 text-xs text-white/40">Compared with Aakash&apos;s own platform + format + lifecycle baseline.</p></div><button disabled={isPending} onClick={() => run(() => rebuildMediaPerformanceLearning(90), "Performance intelligence rebuilt.")} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-bold text-white/55">Re-analyze</button></div>
        <div className="grid gap-3 lg:grid-cols-2">
          {initialOverview.performance.length ? initialOverview.performance.slice(0, 12).map((item) => (
            <article key={item._id ?? item.publicationId} className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="flex flex-wrap items-center gap-2"><Badge>{platformLabels[item.platform]}</Badge><Badge>{item.format.replaceAll("_", " ")}</Badge><Badge>{item.period.replaceAll("_", " ")}</Badge><span className="ml-auto text-xs font-black text-[#C6FF32]">{item.percentile}th percentile</span></div>
              <p className="mt-3 text-sm font-bold leading-6 text-white">{item.summary}</p>
              <div className="mt-3 grid gap-3 text-xs leading-5 text-white/50 sm:grid-cols-2"><div><div className="font-bold text-white/70">What worked</div>{item.whyItWorked}</div><div><div className="font-bold text-white/70">What limited it</div>{item.whatLimitedIt}</div></div>
              {item.doMore.length ? <div className="mt-3 text-xs text-[#C6FF32]/80">Do more: {item.doMore.join(" · ")}</div> : null}
              <div className="mt-2 rounded-lg bg-white/[0.035] p-2.5 text-xs text-white/45">Next experiment: {item.nextExperiment}</div>
            </article>
          )) : <div className="rounded-xl border border-dashed border-white/10 p-8 text-sm text-white/35 lg:col-span-2">Publish and sync measured content, then rebuild intelligence.</div>}
        </div>
      </section>

      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3"><div><h2 className="font-black text-white">Audience intelligence</h2><p className="mt-1 text-xs text-white/40">Recurring questions, objections, problems and high-intent signals become planning evidence.</p></div><button disabled={isPending} onClick={() => run(() => rebuildMediaAudienceLearning(60), "Audience intelligence rebuilt.")} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-bold text-white/55">Re-cluster</button></div>
        <div className="grid gap-3 lg:grid-cols-2">
          {initialOverview.audience.length ? initialOverview.audience.slice(0, 16).map((item) => (
            <article key={item._id ?? item.key} className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="flex flex-wrap items-center gap-2"><Badge>{item.type.replaceAll("_", " ")}</Badge>{item.platforms.map((platform) => <Badge key={platform}>{platformLabels[platform]}</Badge>)}{item.highIntent ? <span className="rounded-full bg-amber-400/10 px-2 py-1 text-[11px] font-black text-amber-200">HIGH INTENT</span> : null}</div>
              <h3 className="mt-3 font-black text-white">{item.topic}</h3>
              <p className="mt-2 text-sm leading-6 text-white/55">{item.summary}</p>
              <div className="mt-3 text-xs text-white/35">{item.occurrences} occurrence{item.occurrences === 1 ? "" : "s"} · confidence {item.confidence}%</div>
              <div className="mt-3 rounded-lg bg-[#C6FF32]/5 p-3 text-xs leading-5 text-[#C6FF32]/75">Content angle: {item.recommendedContentAngle}</div>
            </article>
          )) : <div className="rounded-xl border border-dashed border-white/10 p-8 text-sm text-white/35 lg:col-span-2">Sync engagement first. HSAKAA will cluster useful recurring signals once audience activity exists.</div>}
        </div>
      </section>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-sm leading-6 text-white/45"><Brain className="mr-2 inline h-4 w-4 text-[#C6FF32]" />Winning mechanisms may influence future strategy, but exact hooks, phrases, examples and structures remain protected by anti-repetition memory. Replies and publishing remain approval-controlled.</div>
    </div>
  );
}
