"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  BrainCircuit,
  ChevronRight,
  Clock3,
  History,
  Search,
  ShieldCheck,
} from "lucide-react";

import { recallMemories } from "@/lib/api/memory";
import { MEMORY_TYPE_OPTIONS } from "@/lib/memory-types";
import {
  MemoryRecallIntent,
  type MemoryRecallResponse,
  type MemoryRecallResult,
  type MemoryType,
} from "@/types/hsakaa";

const intentOptions = [
  { value: MemoryRecallIntent.RELEVANT, label: "Relevant" },
  { value: MemoryRecallIntent.RECENT, label: "Recent" },
  { value: MemoryRecallIntent.CURRENT_STATE, label: "Current state" },
  { value: MemoryRecallIntent.IMPORTANT, label: "Important" },
  { value: MemoryRecallIntent.HISTORICAL, label: "Historical" },
];

function formatLabel(value?: string) {
  if (!value) return "—";
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatDate(value?: string) {
  if (!value) return "No effective date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No effective date";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function percentage(value: number) {
  return `${Math.round(Math.min(Math.max(value, 0), 1) * 100)}%`;
}

function ResultCard({ result }: { result: MemoryRecallResult }) {
  const breakdown = result.scoreBreakdown;
  const scoreRows = [
    ["Text", breakdown.lexical],
    ["Phrase", breakdown.phrase],
    ["Metadata", breakdown.metadata],
    ["Type", breakdown.type],
    ["Recency", breakdown.recency],
    ["Importance", breakdown.importance],
    ["Confidence", breakdown.confidence],
    ["Verification", breakdown.verification],
  ] as const;

  return (
    <article className="rounded-[18px] border border-white/10 bg-white/[0.025] p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-white/45">
            <span>{formatLabel(result.memory.type)}</span>
            <span>•</span>
            <span>{formatLabel(result.memory.scope)}</span>
            <span>•</span>
            <span>{formatDate(result.effectiveDate)}</span>
          </div>
          <p className="text-sm leading-6 text-white/85">{result.memory.content}</p>
        </div>

        <div className="rounded-[14px] border border-[#C6FF32]/25 bg-[#C6FF32]/10 px-3 py-2 text-right">
          <div className="text-[10px] font-black uppercase tracking-[0.16em] text-[#C6FF32]/70">
            Recall score
          </div>
          <div className="mt-0.5 text-lg font-black text-[#C6FF32]">
            {percentage(result.retrievalScore)}
          </div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {result.matchedFields.length ? (
          result.matchedFields.map((field) => (
            <span
              key={field}
              className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[11px] font-semibold text-white/55"
            >
              {formatLabel(field)}
            </span>
          ))
        ) : (
          <span className="text-xs text-white/35">No direct field match.</span>
        )}
      </div>

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4 lg:grid-cols-8">
        {scoreRows.map(([label, value]) => (
          <div key={label} className="rounded-[12px] bg-black/20 px-2.5 py-2">
            <div className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/35">
              {label}
            </div>
            <div className="mt-1 text-xs font-black text-white/75">
              {percentage(value)}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 flex justify-end">
        <Link
          href={`/admin/hsakaa/memory/${result.memory._id}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-[#C6FF32] hover:underline"
        >
          Open memory
          <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}

export function MemoryRecallInspector() {
  const [query, setQuery] = useState("");
  const [intent, setIntent] = useState<MemoryRecallIntent>(
    MemoryRecallIntent.RELEVANT,
  );
  const [type, setType] = useState<MemoryType | "">("");
  const [includeHistorical, setIncludeHistorical] = useState(false);
  const [limit, setLimit] = useState(8);
  const [result, setResult] = useState<MemoryRecallResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await recallMemories({
        query: query.trim() || undefined,
        intent,
        type: type || undefined,
        includeHistorical,
        limit,
      });
      setResult(response);
    } catch (cause) {
      setError(
        cause instanceof Error ? cause.message : "Unable to inspect memory recall.",
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="overflow-hidden rounded-[24px] border border-white/10 bg-[#080C0F]">
      <div className="border-b border-white/10 px-5 py-5 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-[#C6FF32]">
              <BrainCircuit className="h-4 w-4" />
              <span className="text-xs font-black uppercase tracking-[0.18em]">
                Deterministic Recall
              </span>
            </div>
            <h2 className="mt-2 text-xl font-black tracking-tight text-white">
              Memory Recall Inspector
            </h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-white/50">
              Test exactly what HSAKAA would retrieve and inspect why each memory
              ranked. Recall uses stored memory data only—no OpenAI call is made to
              search.
            </p>
          </div>

          <div className="inline-flex items-center gap-2 rounded-full border border-[#C6FF32]/20 bg-[#C6FF32]/10 px-3 py-1.5 text-[11px] font-bold text-[#C6FF32]">
            <ShieldCheck className="h-3.5 w-3.5" />
            Auditable ranking
          </div>
        </div>
      </div>

      <form onSubmit={submit} className="space-y-4 p-5 sm:p-6">
        <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_180px_210px_100px]">
          <label className="relative block">
            <Search className="pointer-events-none absolute left-3.5 top-3.5 h-4 w-4 text-white/30" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="e.g. What commitments do I currently have about 8lete?"
              className="min-h-11 w-full rounded-[14px] border border-white/10 bg-black/20 pl-10 pr-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#C6FF32]/40"
            />
          </label>

          <select
            value={intent}
            onChange={(event) => setIntent(event.target.value as MemoryRecallIntent)}
            className="min-h-11 rounded-[14px] border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-[#C6FF32]/40"
          >
            {intentOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={type}
            onChange={(event) => setType(event.target.value as MemoryType | "")}
            className="min-h-11 rounded-[14px] border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-[#C6FF32]/40"
          >
            <option value="">Auto-detect memory type</option>
            {MEMORY_TYPE_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <select
            value={limit}
            onChange={(event) => setLimit(Number(event.target.value))}
            className="min-h-11 rounded-[14px] border border-white/10 bg-black/20 px-3 text-sm text-white outline-none focus:border-[#C6FF32]/40"
          >
            {[5, 8, 12, 20].map((value) => (
              <option key={value} value={value}>
                Top {value}
              </option>
            ))}
          </select>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <label className="inline-flex cursor-pointer items-center gap-2 text-sm text-white/60">
            <input
              type="checkbox"
              checked={includeHistorical}
              onChange={(event) => setIncludeHistorical(event.target.checked)}
              className="h-4 w-4 accent-[#C6FF32]"
            />
            Include historical truth states
          </label>

          <button
            type="submit"
            disabled={loading}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[13px] bg-[#C6FF32] px-5 text-sm font-black text-[#030608] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Search className="h-4 w-4" />
            {loading ? "Inspecting…" : "Inspect recall"}
          </button>
        </div>

        {error ? (
          <div className="rounded-[14px] border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}
      </form>

      {result ? (
        <div className="border-t border-white/10 px-5 py-5 sm:px-6">
          <div className="grid gap-3 md:grid-cols-4">
            <div className="rounded-[16px] border border-white/10 bg-white/[0.025] p-3.5">
              <div className="text-[10px] font-black uppercase tracking-[0.14em] text-white/35">
                Intent
              </div>
              <div className="mt-1 text-sm font-bold text-white/80">
                {formatLabel(result.plan.intent)}
              </div>
            </div>
            <div className="rounded-[16px] border border-white/10 bg-white/[0.025] p-3.5">
              <div className="text-[10px] font-black uppercase tracking-[0.14em] text-white/35">
                Memory type
              </div>
              <div className="mt-1 text-sm font-bold text-white/80">
                {formatLabel(result.plan.explicitType ?? result.plan.inferredType) || "Any"}
              </div>
            </div>
            <div className="rounded-[16px] border border-white/10 bg-white/[0.025] p-3.5">
              <div className="text-[10px] font-black uppercase tracking-[0.14em] text-white/35">
                Current truth
              </div>
              <div className="mt-1 text-sm font-bold text-white/80">
                {result.currentCount} recalled
              </div>
            </div>
            <div className="rounded-[16px] border border-white/10 bg-white/[0.025] p-3.5">
              <div className="text-[10px] font-black uppercase tracking-[0.14em] text-white/35">
                Historical
              </div>
              <div className="mt-1 text-sm font-bold text-white/80">
                {result.historicalCount} recalled
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {result.plan.tokens.map((token) => (
              <span
                key={token}
                className="rounded-full border border-white/10 px-2.5 py-1 text-[11px] text-white/45"
              >
                {token}
              </span>
            ))}
          </div>

          <div className="mt-6 space-y-4">
            <div className="flex items-center gap-2">
              <Clock3 className="h-4 w-4 text-[#C6FF32]" />
              <h3 className="text-sm font-black uppercase tracking-[0.12em] text-white/75">
                Current truth
              </h3>
            </div>
            {result.current.length ? (
              result.current.map((item) => (
                <ResultCard key={`current-${item.memory._id}`} result={item} />
              ))
            ) : (
              <div className="rounded-[16px] border border-dashed border-white/10 px-4 py-6 text-sm text-white/35">
                No current memories matched this recall plan.
              </div>
            )}
          </div>

          {result.plan.includeHistorical ? (
            <div className="mt-7 space-y-4">
              <div className="flex items-center gap-2">
                <History className="h-4 w-4 text-white/45" />
                <h3 className="text-sm font-black uppercase tracking-[0.12em] text-white/60">
                  Historical context
                </h3>
              </div>
              {result.historical.length ? (
                result.historical.map((item) => (
                  <ResultCard key={`historical-${item.memory._id}`} result={item} />
                ))
              ) : (
                <div className="rounded-[16px] border border-dashed border-white/10 px-4 py-6 text-sm text-white/35">
                  No historical memories matched this recall plan.
                </div>
              )}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}
