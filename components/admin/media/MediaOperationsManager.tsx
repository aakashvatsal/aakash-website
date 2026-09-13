"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Activity,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock3,
  PlugZap,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
} from "lucide-react";

import { repairMediaOperationsSafeState } from "@/lib/api/media";
import type {
  MediaOperationsOverview,
  MediaPlatform,
} from "@/types/media";

const platformLabels: Record<MediaPlatform, string> = {
  linkedin: "LinkedIn",
  instagram: "Instagram",
  youtube: "YouTube",
  x: "X",
  facebook: "Facebook",
  threads: "Threads",
  whatsapp: "WhatsApp",
};

function statusClass(status: "ready" | "partial" | "blocked") {
  if (status === "ready") return "border-[#C6FF32]/20 bg-[#C6FF32]/5 text-[#C6FF32]";
  if (status === "partial") return "border-amber-400/20 bg-amber-400/5 text-amber-200";
  return "border-red-400/20 bg-red-400/5 text-red-200";
}

function Bool({ value, label }: { value: boolean; label: string }) {
  return (
    <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.1em] ${value ? "border-[#C6FF32]/15 bg-[#C6FF32]/5 text-[#C6FF32]/75" : "border-white/10 bg-white/[0.025] text-white/30"}`}>
      {label}: {value ? "yes" : "no"}
    </span>
  );
}

export function MediaOperationsManager({
  initialOverview,
}: {
  initialOverview: MediaOperationsOverview;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>();
  const [error, setError] = useState<string>();

  function repair() {
    setMessage(undefined);
    setError(undefined);
    startTransition(async () => {
      try {
        const result = await repairMediaOperationsSafeState();
        setMessage(`Safe reconciliation complete. ${result.stuck.manualReview} ambiguous direct publish${result.stuck.manualReview === 1 ? "" : "es"} moved to manual review; ${result.buffer.checked} Buffer handoff${result.buffer.checked === 1 ? "" : "s"} reconciled.`);
        router.refresh();
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Media operations repair failed.");
      }
    });
  }

  const queue = initialOverview.queue;
  const overallStatus = initialOverview.status;

  return (
    <div className="space-y-6">
      <section className={`rounded-2xl border p-5 ${overallStatus === "ready" ? "border-[#C6FF32]/20 bg-[#C6FF32]/5" : overallStatus === "attention" ? "border-amber-400/20 bg-amber-400/5" : "border-red-400/20 bg-red-400/5"}`}>
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              {overallStatus === "ready" ? <CheckCircle2 className="h-5 w-5 text-[#C6FF32]" /> : <AlertTriangle className="h-5 w-5 text-amber-200" />}
              <h2 className="font-black text-white">Operations {overallStatus}</h2>
            </div>
            <p className="mt-2 max-w-3xl text-xs leading-5 text-white/45">
              This screen checks configuration and queue health without exposing credential values. Safe repair reconciles existing delivery state only; it never creates a new post or sends a reply.
            </p>
          </div>
          <div className="flex gap-2">
            <button disabled={isPending} onClick={() => router.refresh()} className="rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-white/60 disabled:opacity-40"><RefreshCw className="mr-1.5 inline h-3.5 w-3.5" />Refresh</button>
            <button disabled={isPending} onClick={repair} className="rounded-xl bg-[#C6FF32] px-3 py-2 text-xs font-black text-black disabled:opacity-40"><RotateCcw className="mr-1.5 inline h-3.5 w-3.5" />Repair safe state</button>
          </div>
        </div>
      </section>

      {message ? <div className="rounded-xl border border-[#C6FF32]/20 bg-[#C6FF32]/5 px-4 py-3 text-sm text-[#C6FF32]">{message}</div> : null}
      {error ? <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">{error}</div> : null}

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"><Clock3 className="h-4 w-4 text-[#C6FF32]" /><div className="mt-3 text-2xl font-black text-white">{queue.scheduled}</div><div className="text-xs text-white/40">Scheduled publications</div></div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"><RotateCcw className="h-4 w-4 text-[#C6FF32]" /><div className="mt-3 text-2xl font-black text-white">{queue.retryScheduled}</div><div className="text-xs text-white/40">Bounded retries queued</div></div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"><AlertTriangle className="h-4 w-4 text-amber-200" /><div className="mt-3 text-2xl font-black text-white">{queue.requiresAttention}</div><div className="text-xs text-white/40">Queue items needing attention</div></div>
        <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"><BarChart3 className="h-4 w-4 text-[#C6FF32]" /><div className="mt-3 text-2xl font-black text-white">{initialOverview.lifecycle.dueSnapshots}</div><div className="text-xs text-white/40">Analytics snapshots due</div></div>
      </div>

      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <div className="mb-4 flex items-center gap-2"><PlugZap className="h-4 w-4 text-[#C6FF32]" /><h2 className="font-black text-white">Platform readiness</h2></div>
        <div className="grid gap-4 xl:grid-cols-2">
          {initialOverview.platforms.map((item) => (
            <article key={item.platform} className="rounded-xl border border-white/10 bg-black/20 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="font-black text-white">{platformLabels[item.platform]}</h3>
                <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${statusClass(item.status)}`}>{item.status}</span>
                <span className="ml-auto text-[11px] text-white/30">{item.accountName ?? "No account"}</span>
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Bool value={item.automaticDeliveryReady} label="automatic delivery" />
                <Bool value={item.manualFallbackReady} label="manual fallback" />
                <Bool value={item.analytics.configured} label="analytics" />
                <Bool value={item.engagement.readConfigured} label="engagement read" />
                <Bool value={item.engagement.writeConfigured} label="engagement write" />
              </div>
              <div className="mt-3 grid gap-2 text-xs text-white/40 sm:grid-cols-2">
                <div>Provider: <span className="font-bold text-white/65">{item.deliveryProvider}</span></div>
                <div>Connection: <span className="font-bold text-white/65">{item.connectionStatus}</span></div>
                <div>Buffer: <span className="font-bold text-white/65">{item.buffer.healthy ? "healthy" : item.buffer.connected ? "connected, attention" : "not connected"}</span></div>
                <div>Analytics mode: <span className="font-bold text-white/65">{item.analytics.mode.replaceAll("_", " ")}</span></div>
              </div>
              {item.issues.length ? <div className="mt-4 rounded-lg border border-amber-400/10 bg-amber-400/[0.035] p-3"><div className="text-[10px] font-black uppercase tracking-[0.12em] text-amber-200/60">Issues</div><ul className="mt-2 space-y-1 text-xs leading-5 text-amber-100/65">{item.issues.map((issue) => <li key={issue}>• {issue}</li>)}</ul></div> : null}
              {item.actions.length ? <div className="mt-3"><div className="text-[10px] font-black uppercase tracking-[0.12em] text-white/25">Setup / next action</div><ul className="mt-2 space-y-1 text-xs leading-5 text-white/45">{item.actions.map((action) => <li key={action}>• {action}</li>)}</ul></div> : null}
            </article>
          ))}
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <div className="mb-3 flex items-center gap-2"><Activity className="h-4 w-4 text-[#C6FF32]" /><h2 className="font-black text-white">Publishing queue safety</h2></div>
          <div className="grid grid-cols-2 gap-3 text-xs sm:grid-cols-4">
            <div><div className="text-xl font-black text-white">{queue.publishing}</div><div className="text-white/35">Publishing</div></div>
            <div><div className="text-xl font-black text-white">{queue.manualRequired}</div><div className="text-white/35">Manual review</div></div>
            <div><div className="text-xl font-black text-white">{queue.exhausted}</div><div className="text-white/35">Retries exhausted</div></div>
            <div><div className="text-xl font-black text-white">{queue.stuckPublishing}</div><div className="text-white/35">Stuck &gt; {queue.retryPolicy.stuckPublishingMinutes}m</div></div>
          </div>
          <p className="mt-4 text-xs leading-5 text-white/35">Automatic retries are bounded to {queue.retryPolicy.maxAttempts} attempts with a {queue.retryPolicy.delayMinutes}-minute delay. An interrupted direct publish is never blindly retried because the platform may already have accepted it.</p>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <div className="mb-3 flex items-center gap-2"><ShieldCheck className="h-4 w-4 text-[#C6FF32]" /><h2 className="font-black text-white">Buffer & lifecycle</h2></div>
          <div className="text-sm text-white/55">Buffer: <span className="font-black text-white">{initialOverview.buffer.configured ? initialOverview.buffer.reachable ? "configured and reachable" : "configured but unreachable" : "not configured"}</span></div>
          {initialOverview.buffer.error ? <p className="mt-2 text-xs leading-5 text-amber-200/65">{initialOverview.buffer.error}</p> : null}
          <div className="mt-4 text-sm text-white/55">Measured publications: <span className="font-black text-white">{initialOverview.lifecycle.measuredPublications}</span></div>
          <div className="mt-2 flex flex-wrap gap-2">{Object.entries(initialOverview.lifecycle.coverage).map(([period, coverage]) => <span key={period} className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-bold text-white/40">{period.replaceAll("_", " ")} · {coverage}%</span>)}</div>
        </section>
      </div>
    </div>
  );
}
