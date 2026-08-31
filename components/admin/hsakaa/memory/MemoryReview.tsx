"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { AlertTriangle, Check, Clock3, GitMerge, History, RefreshCw } from "lucide-react";

import {
  confirmMemoryReview,
  createMemoryMergeDraft,
  getMemoryReviewQueue,
  snoozeMemoryReview,
} from "@/lib/api/memory";
import type { MemoryReviewItem, MemoryReviewQueue } from "@/types/hsakaa";

const sectionMeta = [
  ["disputed", "Disputed", "Memories whose truth has been challenged."],
  ["contradictions", "Contradictions", "Explicit conflicts that should remain separated until resolved."],
  ["oldPreferences", "Old preferences", "Preferences old enough that they may have changed."],
  ["stale", "Stale", "Current memories that have not been reconfirmed for a long time."],
  ["uncertain", "Uncertain", "Low-confidence, inferred or unverified current memories."],
  ["duplicates", "Duplicates", "Likely duplicate current memories with the same semantic attribution."],
] as const;


function priorityClass(priority: MemoryReviewItem["priority"]) {
  if (priority === "high") return "border-rose-500/30 bg-rose-500/10 text-rose-100";
  if (priority === "medium") return "border-amber-500/30 bg-amber-500/10 text-amber-100";
  return "border-white/10 bg-white/[0.04] text-white/70";
}

export function MemoryReview() {
  const [queue, setQueue] = useState<MemoryReviewQueue | null>(null);
  const [error, setError] = useState("");
  const [busyId, setBusyId] = useState("");
  const [message, setMessage] = useState("");

  const load = useCallback(async () => {
    try {
      setError("");
      const next = await getMemoryReviewQueue();
      setQueue(next);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load Memory Review.");
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  const countLabel = useMemo(() => {
    if (!queue) return "Loading review queue…";
    return queue.total === 1 ? "1 review signal" : `${queue.total} review signals`;
  }, [queue]);

  async function confirm(item: MemoryReviewItem) {
    setBusyId(item.memory._id);
    setMessage("");
    try {
      await confirmMemoryReview(item.memory._id);
      setMessage("Memory confirmed as current.");
      await load();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Unable to confirm memory.");
    } finally {
      setBusyId("");
    }
  }

  async function snooze(item: MemoryReviewItem) {
    const until = new Date();
    until.setDate(until.getDate() + 30);
    setBusyId(item.memory._id);
    setMessage("");
    try {
      await snoozeMemoryReview(item.memory._id, until.toISOString());
      setMessage("Review snoozed for 30 days.");
      await load();
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Unable to snooze review.");
    } finally {
      setBusyId("");
    }
  }

  async function mergeDraft(item: MemoryReviewItem) {
    if (!item.relatedMemory) return;
    setBusyId(item.memory._id);
    setMessage("");
    try {
      await createMemoryMergeDraft(item.memory._id, item.relatedMemory._id);
      setMessage("Editable merge draft created in Memory Inbox. Source memories were not changed.");
    } catch (actionError) {
      setError(actionError instanceof Error ? actionError.message : "Unable to create merge draft.");
    } finally {
      setBusyId("");
    }
  }

  return (
    <section id="memory-review" className="rounded-[28px] border border-white/10 bg-white/[0.025] p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#C6FF32]">
            <History className="h-4 w-4" />
            Memory Review
          </div>
          <h2 className="mt-2 text-xl font-black text-white">Keep current truth clean</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">
            Deterministic maintenance signals only. Nothing here silently rewrites, merges, archives or deletes a memory.
          </p>
          <p className="mt-2 text-xs font-bold text-white/35">{countLabel}</p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-bold text-white/70 hover:bg-white/[0.05]"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Refresh
        </button>
      </div>

      {error ? <div className="mt-4 rounded-xl border border-rose-500/20 bg-rose-500/10 p-3 text-sm text-rose-100">{error}</div> : null}
      {message ? <div className="mt-4 rounded-xl border border-[#C6FF32]/20 bg-[#C6FF32]/10 p-3 text-sm text-[#E8FFB0]">{message}</div> : null}

      <div className="mt-6 space-y-5">
        {sectionMeta.map(([key, title, description]) => {
          const items = queue?.sections[key] ?? [];
          return (
            <div key={key} className="rounded-2xl border border-white/[0.07] bg-[#030608]/60 p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="text-sm font-black text-white">{title}</h3>
                  <p className="mt-1 text-xs text-white/40">{description}</p>
                </div>
                <span className="rounded-full border border-white/10 px-2.5 py-1 text-xs font-black text-white/55">{items.length}</span>
              </div>

              {items.length ? (
                <div className="mt-4 grid gap-3 xl:grid-cols-2">
                  {items.map((item, index) => {
                    const activeAction = key === "oldPreferences" || key === "stale" || key === "uncertain";
                    const itemKey = `${key}-${item.memory._id}-${item.relatedMemory?._id ?? index}`;
                    return (
                      <article key={itemKey} className={`rounded-2xl border p-4 ${priorityClass(item.priority)}`}>
                        <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em] opacity-70">
                          <span>{item.priority} priority</span>
                          {typeof item.ageDays === "number" ? <span>• {item.ageDays}d old</span> : null}
                          {typeof item.similarity === "number" ? <span>• {Math.round(item.similarity * 100)}% similar</span> : null}
                        </div>
                        <p className="mt-3 text-sm font-bold leading-6 text-white">{item.memory.content}</p>
                        {item.relatedMemory ? (
                          <div className="mt-3 rounded-xl border border-white/10 bg-black/20 p-3">
                            <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/35">Related memory</p>
                            <p className="mt-1 text-xs leading-5 text-white/65">{item.relatedMemory.content}</p>
                          </div>
                        ) : null}
                        <p className="mt-3 text-xs leading-5 text-white/55">{item.explanation}</p>

                        <div className="mt-4 flex flex-wrap gap-2">
                          <Link href={`/admin/hsakaa/memory/${item.memory._id}`} className="inline-flex min-h-9 items-center rounded-lg border border-white/10 px-3 text-xs font-bold text-white/70 hover:bg-white/[0.05]">
                            Inspect
                          </Link>
                          {item.relatedMemory ? (
                            <Link href={`/admin/hsakaa/memory/${item.relatedMemory._id}`} className="inline-flex min-h-9 items-center rounded-lg border border-white/10 px-3 text-xs font-bold text-white/70 hover:bg-white/[0.05]">
                              Inspect related
                            </Link>
                          ) : null}
                          {activeAction ? (
                            <>
                              <button disabled={busyId === item.memory._id} onClick={() => void confirm(item)} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-[#C6FF32] px-3 text-xs font-black text-[#030608] disabled:opacity-50">
                                <Check className="h-3.5 w-3.5" /> Confirm current
                              </button>
                              <button disabled={busyId === item.memory._id} onClick={() => void snooze(item)} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-white/10 px-3 text-xs font-bold text-white/70 disabled:opacity-50">
                                <Clock3 className="h-3.5 w-3.5" /> Snooze 30d
                              </button>
                            </>
                          ) : null}
                          {key === "duplicates" && item.relatedMemory ? (
                            <button disabled={busyId === item.memory._id} onClick={() => void mergeDraft(item)} className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-[#C6FF32] px-3 text-xs font-black text-[#030608] disabled:opacity-50">
                              <GitMerge className="h-3.5 w-3.5" /> Create merge draft
                            </button>
                          ) : null}
                          {(key === "disputed" || key === "contradictions") ? (
                            <span className="inline-flex min-h-9 items-center gap-1.5 rounded-lg border border-amber-500/20 px-3 text-xs font-bold text-amber-100/70">
                              <AlertTriangle className="h-3.5 w-3.5" /> Resolve through lifecycle controls
                            </span>
                          ) : null}
                        </div>
                      </article>
                    );
                  })}
                </div>
              ) : (
                <p className="mt-4 text-xs text-white/30">Nothing needs review here.</p>
              )}
            </div>
          );
        })}
      </div>

      {queue ? (
        <p className="mt-5 text-[11px] leading-5 text-white/30">
          Rules: old preferences ≥ {queue.rules.oldPreferenceDays}d · stale ≥ {queue.rules.staleDays}d · uncertain confidence &lt; {queue.rules.lowConfidenceBelow} · duplicates ≥ {Math.round(queue.rules.duplicateSimilarityAtLeast * 100)}% · OpenAI calls: {queue.rules.openAiCalls}
        </p>
      ) : null}
    </section>
  );
}
