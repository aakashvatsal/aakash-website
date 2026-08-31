"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

import { backfillMediaIntelligence } from "@/lib/api/media";
import type {
  MediaContentMemory,
  MediaIntelligenceOverview,
} from "@/types/media";

interface MediaIntelligenceManagerProps {
  overview: MediaIntelligenceOverview;
  memories: MediaContentMemory[];
}

export function MediaIntelligenceManager({
  overview,
  memories,
}: MediaIntelligenceManagerProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function runBackfill(refresh = false) {
    setBusy(true);
    setError("");
    setMessage("");

    try {
      const result = await backfillMediaIntelligence({
        limit: 100,
        refresh,
        includePublications: true,
      });

      setMessage(
        `Indexed ${result.indexedContent} ideas and ${result.indexedPublications} publications${result.failures.length ? ` · ${result.failures.length} failed` : ""}.`,
      );
      router.refresh();
    } catch (value) {
      setError(
        value instanceof Error
          ? value.message
          : "Media intelligence backfill failed.",
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      {message ? (
        <div className="rounded-2xl border border-[#C6FF32]/20 bg-[#C6FF32]/5 p-4 text-sm text-[#C6FF32]">
          {message}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="Idea memory"
          value={`${overview.contentCoveragePercent}%`}
          detail={`${overview.indexedContent}/${overview.contentItems} indexed`}
        />
        <Stat
          label="Publication memory"
          value={`${overview.publicationCoveragePercent}%`}
          detail={`${overview.indexedPublications}/${overview.publications} indexed`}
        />
        <Stat
          label="Rejected remembered"
          value={overview.rejectedCandidatesRemembered}
          detail="Rejected ideas remain searchable"
        />
        <Stat
          label="High repetition risk"
          value={overview.highRiskMemories}
          detail="High + blocked memories"
        />
      </div>

      <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#C6FF32]">
              Anti-repetition policy
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.04em]">
              HSAKAA must check memory before calling content new
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/40">
              The index compares semantic meaning plus topic, angle, hook pattern,
              story/example reuse, structure and CTA. Intentional repurposing is
              allowed only when it is explicitly marked as repurposing.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              disabled={busy}
              onClick={() => runBackfill(false)}
              className="rounded-xl bg-[#C6FF32] px-4 py-3 text-sm font-black text-black disabled:opacity-50"
            >
              Index missing content
            </button>
            <button
              disabled={busy}
              onClick={() => runBackfill(true)}
              className="rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-white/65 disabled:opacity-50"
            >
              Refresh first 100
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <PolicyCard
            label="Medium"
            value={`${Math.round(overview.policy.mediumSimilarity * 100)}%+ similarity`}
          />
          <PolicyCard
            label="High"
            value={`${Math.round(overview.policy.highSimilarity * 100)}%+ similarity`}
          />
          <PolicyCard
            label="Blocked"
            value={`${Math.round(overview.policy.blockedSimilarity * 100)}%+ similarity`}
          />
        </div>

        <p className="mt-4 text-xs text-white/30">
          Embeddings: {overview.embeddingModel}
        </p>
      </section>

      <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5 sm:p-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black">Recent content memory</h2>
            <p className="mt-1 text-sm text-white/40">
              This is memory about content, not a second copy of the content itself.
            </p>
          </div>
          <span className="text-sm text-white/35">{memories.length} loaded</span>
        </div>

        <div className="mt-5 space-y-3">
          {memories.length ? (
            memories.map((memory) => (
              <div
                key={memory._id}
                className="rounded-2xl border border-white/[0.07] p-4"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-bold text-white">
                        {memory.title || memory.topic || "Untitled content memory"}
                      </span>
                      <Badge>{memory.scope.replaceAll("_", " ")}</Badge>
                      {memory.platform ? <Badge>{memory.platform}</Badge> : null}
                      {memory.status === "rejected" ? <Badge>rejected</Badge> : null}
                    </div>
                    <p className="mt-2 text-sm text-white/40">
                      {memory.angle || memory.thesis || "No extracted angle yet."}
                    </p>
                    {memory.similarMatches?.[0] ? (
                      <p className="mt-2 text-xs text-white/30">
                        Closest historical similarity: {Math.round(memory.similarMatches[0].score * 100)}%
                        {memory.similarMatches[0].reasons.length
                          ? ` · ${memory.similarMatches[0].reasons.join(", ")}`
                          : ""}
                      </p>
                    ) : null}
                  </div>

                  <div className="shrink-0 text-right">
                    <div className="text-2xl font-black">{memory.noveltyScore}</div>
                    <div className="text-xs uppercase tracking-[0.14em] text-white/30">
                      novelty · {memory.repetitionRisk}
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-white/35">
              No Media content memory yet. Index existing content to build HSAKAA&apos;s anti-repetition history.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}

function Stat({
  label,
  value,
  detail,
}: {
  label: string;
  value: number | string;
  detail: string;
}) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/[0.025] p-5">
      <div className="text-xs font-bold uppercase tracking-[0.16em] text-white/35">
        {label}
      </div>
      <div className="mt-3 text-3xl font-black">{value}</div>
      <div className="mt-2 text-xs text-white/30">{detail}</div>
    </div>
  );
}

function PolicyCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] p-4">
      <div className="text-xs font-black uppercase tracking-[0.14em] text-white/30">
        {label}
      </div>
      <div className="mt-2 font-bold">{value}</div>
    </div>
  );
}

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white/40">
      {children}
    </span>
  );
}
