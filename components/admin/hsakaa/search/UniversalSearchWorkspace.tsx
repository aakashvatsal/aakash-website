"use client";

import {
  Activity,
  BookOpen,
  Bot,
  Brain,
  Building2,
  CalendarDays,
  CheckSquare2,
  Database,
  HeartPulse,
  Loader2,
  Network,
  RefreshCw,
  Search,
  Sparkles,
  UserRound,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

import {
  buildHsakaaSearchPacket,
  getUniversalSearchIndexStatus,
  syncUniversalSearchIndex,
  universalSearch,
} from "@/lib/api/universal-search";
import {
  KnowledgeGraphNodeType,
} from "@/types/knowledge-graph";
import type {
  HsakaaSearchPacket,
  UniversalSearchIndexStatus,
  UniversalSearchMode,
  UniversalSearchResponse,
  UniversalSearchSort,
} from "@/types/universal-search";

const DOMAIN_OPTIONS = [
  { type: KnowledgeGraphNodeType.PERSON, label: "People", icon: UserRound },
  { type: KnowledgeGraphNodeType.COMPANY, label: "Companies", icon: Building2 },
  { type: KnowledgeGraphNodeType.DECISION, label: "Decisions", icon: Brain },
  { type: KnowledgeGraphNodeType.JOURNAL, label: "Journal", icon: CalendarDays },
  { type: KnowledgeGraphNodeType.MEMORY, label: "Memory", icon: Database },
  { type: KnowledgeGraphNodeType.BOOK, label: "Books", icon: BookOpen },
  { type: KnowledgeGraphNodeType.HIGHLIGHT, label: "Highlights", icon: Sparkles },
  { type: KnowledgeGraphNodeType.HEALTH, label: "Health", icon: HeartPulse },
  { type: KnowledgeGraphNodeType.MEDIA, label: "Media", icon: Activity },
  { type: KnowledgeGraphNodeType.TASK, label: "Tasks", icon: CheckSquare2 },
] as const;

const EXAMPLES = [
  "8lete decisions from the last six months",
  "people involved in important company decisions",
  "books and highlights that influenced product ideas",
  "health patterns around demanding work periods",
];

function formatDate(value: string | null | undefined) {
  if (!value) return "Undated";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Undated";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function percent(value: number) {
  return `${Math.round(value * 100)}%`;
}

export function UniversalSearchWorkspace() {
  const [query, setQuery] = useState("");
  const [mode, setMode] = useState<UniversalSearchMode>("hybrid");
  const [sort, setSort] = useState<UniversalSearchSort>("relevance");
  const [selectedTypes, setSelectedTypes] = useState<KnowledgeGraphNodeType[]>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [minImportance, setMinImportance] = useState(0);
  const [result, setResult] = useState<UniversalSearchResponse | null>(null);
  const [status, setStatus] = useState<UniversalSearchIndexStatus | null>(null);
  const [packet, setPacket] = useState<HsakaaSearchPacket | null>(null);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [packetLoading, setPacketLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void refreshStatus();
  }, []);

  async function refreshStatus() {
    try {
      const next = await getUniversalSearchIndexStatus();
      setStatus(next);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not load search index status.");
    }
  }

  function toggleType(type: KnowledgeGraphNodeType) {
    setSelectedTypes((current) =>
      current.includes(type)
        ? current.filter((item) => item !== type)
        : [...current, type],
    );
  }

  async function runSearch(nextQuery = query) {
    const trimmed = nextQuery.trim();
    if (!trimmed) return;
    setLoading(true);
    setError(null);
    setPacket(null);
    try {
      const next = await universalSearch({
        q: trimmed,
        mode,
        sort,
        types: selectedTypes,
        from: from || undefined,
        to: to || undefined,
        minImportance: minImportance || undefined,
        limit: 50,
      });
      setResult(next);
      setQuery(trimmed);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Universal Search failed.");
    } finally {
      setLoading(false);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void runSearch();
  }

  async function syncIndex() {
    setSyncing(true);
    setError(null);
    try {
      await syncUniversalSearchIndex({ maxEmbeddings: 1000 });
      await refreshStatus();
      if (query.trim()) await runSearch();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Semantic index sync failed.");
    } finally {
      setSyncing(false);
    }
  }

  async function createPacket() {
    if (!query.trim()) return;
    setPacketLoading(true);
    setError(null);
    try {
      setPacket(
        await buildHsakaaSearchPacket({
          question: query.trim(),
          types: selectedTypes,
          from: from || undefined,
          to: to || undefined,
          maxEvidence: 20,
        }),
      );
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Could not build HSAKAA evidence packet.");
    } finally {
      setPacketLoading(false);
    }
  }

  const coverageLabel = useMemo(() => {
    if (!status) return "Checking…";
    return `${percent(status.coverage)} semantic coverage`;
  }, [status]);

  return (
    <section className="space-y-5">
      <div className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-[#C6FF32]/20 bg-[#C6FF32]/10">
              <Network className="h-5 w-5 text-[#C6FF32]" />
            </div>
            <div>
              <p className="font-bold text-white">Semantic index</p>
              <p className="mt-1 text-sm text-white/45">
                {status
                  ? `${status.indexedNodes}/${status.totalNodes} graph nodes indexed · ${coverageLabel}`
                  : coverageLabel}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => void syncIndex()}
            disabled={syncing}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-4 text-sm font-bold text-white transition hover:border-[#C6FF32]/30 disabled:opacity-50"
          >
            {syncing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            {syncing ? "Indexing…" : status?.semanticReady ? "Refresh index" : "Build semantic index"}
          </button>
        </div>
        {status && !status.semanticReady && (
          <p className="mt-4 rounded-xl border border-amber-300/15 bg-amber-300/[0.04] px-4 py-3 text-xs leading-5 text-amber-100/70">
            Hybrid search still works with exact, lexical, importance, recency and graph signals. Build the semantic index to enable meaning-based retrieval across all domains.
          </p>
        )}
      </div>

      <form onSubmit={submit} className="rounded-[28px] border border-white/10 bg-white/[0.025] p-5">
        <div className="flex flex-col gap-3 lg:flex-row">
          <label className="flex min-h-14 flex-1 items-center gap-3 rounded-2xl border border-white/10 bg-black/20 px-4 focus-within:border-[#C6FF32]/40">
            <Search className="h-5 w-5 shrink-0 text-[#C6FF32]" />
            <input
              value={query}
              onChange={(event) => setQuery(event.currentTarget.value)}
              placeholder="Search people, decisions, journal, memory, books, health, media, tasks…"
              className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/25"
            />
          </label>
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl bg-[#C6FF32] px-6 text-sm font-black text-black disabled:opacity-50"
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
            Search Personal OS
          </button>
        </div>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <select
            value={mode}
            onChange={(event) => setMode(event.currentTarget.value as UniversalSearchMode)}
            className="min-h-11 rounded-xl border border-white/10 bg-[#090d0f] px-3 text-sm text-white outline-none"
          >
            <option value="hybrid">Hybrid ranking</option>
            <option value="exact">Exact + lexical</option>
            <option value="semantic">Semantic-first</option>
          </select>
          <select
            value={sort}
            onChange={(event) => setSort(event.currentTarget.value as UniversalSearchSort)}
            className="min-h-11 rounded-xl border border-white/10 bg-[#090d0f] px-3 text-sm text-white outline-none"
          >
            <option value="relevance">Sort: relevance</option>
            <option value="recent">Sort: recent</option>
            <option value="importance">Sort: importance</option>
          </select>
          <input
            type="date"
            value={from}
            onChange={(event) => setFrom(event.currentTarget.value)}
            aria-label="From date"
            className="min-h-11 rounded-xl border border-white/10 bg-[#090d0f] px-3 text-sm text-white outline-none"
          />
          <input
            type="date"
            value={to}
            onChange={(event) => setTo(event.currentTarget.value)}
            aria-label="To date"
            className="min-h-11 rounded-xl border border-white/10 bg-[#090d0f] px-3 text-sm text-white outline-none"
          />
          <select
            value={String(minImportance)}
            onChange={(event) => setMinImportance(Number(event.currentTarget.value))}
            className="min-h-11 rounded-xl border border-white/10 bg-[#090d0f] px-3 text-sm text-white outline-none"
          >
            <option value="0">Any importance</option>
            <option value="0.5">Importance ≥ 50%</option>
            <option value="0.7">Importance ≥ 70%</option>
            <option value="0.85">Importance ≥ 85%</option>
          </select>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {DOMAIN_OPTIONS.map(({ type, label, icon: Icon }) => {
            const active = selectedTypes.includes(type);
            return (
              <button
                key={type}
                type="button"
                onClick={() => toggleType(type)}
                className={`inline-flex min-h-9 items-center gap-2 rounded-xl border px-3 text-xs font-bold transition ${
                  active
                    ? "border-[#C6FF32]/40 bg-[#C6FF32]/10 text-[#C6FF32]"
                    : "border-white/10 bg-white/[0.02] text-white/45 hover:text-white"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {label}
              </button>
            );
          })}
          {selectedTypes.length > 0 && (
            <button
              type="button"
              onClick={() => setSelectedTypes([])}
              className="min-h-9 rounded-xl px-3 text-xs font-bold text-white/35 hover:text-white"
            >
              Clear domains
            </button>
          )}
        </div>

        <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-4">
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => {
                setQuery(example);
                void runSearch(example);
              }}
              className="rounded-xl border border-white/10 bg-white/[0.02] px-3 py-2 text-left text-xs text-white/45 transition hover:border-white/20 hover:text-white"
            >
              {example}
            </button>
          ))}
        </div>
      </form>

      {error && (
        <div className="rounded-2xl border border-red-400/20 bg-red-400/[0.05] px-4 py-3 text-sm text-red-100/80">
          {error}
        </div>
      )}

      {result && (
        <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 px-1">
              <div>
                <p className="text-sm font-bold text-white">{result.total} results for “{result.query}”</p>
                <p className="mt-1 text-xs text-white/35">
                  {result.semantic.available
                    ? `Semantic ranking active · ${result.semantic.indexedCandidates} indexed candidates`
                    : result.semantic.degradedReason || "Exact and lexical ranking active"}
                </p>
              </div>
              <button
                type="button"
                onClick={() => void createPacket()}
                disabled={packetLoading}
                className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-[#C6FF32]/20 bg-[#C6FF32]/[0.06] px-3 text-xs font-black text-[#C6FF32] disabled:opacity-50"
              >
                {packetLoading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Bot className="h-3.5 w-3.5" />}
                Build HSAKAA evidence packet
              </button>
            </div>

            {result.results.map((item) => (
              <article key={item.nodeKey} className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="rounded-lg border border-white/10 bg-white/[0.04] px-2 py-1 text-[10px] font-black uppercase tracking-[0.15em] text-[#C6FF32]">
                        {item.type}
                      </span>
                      <span className="text-xs text-white/30">#{item.rank}</span>
                    </div>
                    <h3 className="mt-3 text-xl font-black tracking-[-0.025em] text-white">{item.label}</h3>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-lg font-black text-[#C6FF32]">{percent(item.score)}</p>
                    <p className="text-[10px] uppercase tracking-[0.15em] text-white/25">rank score</p>
                  </div>
                </div>

                <p className="mt-3 text-sm leading-6 text-white/55">{item.snippet}</p>

                <div className="mt-4 flex flex-wrap gap-2">
                  {item.matchReasons.map((reason) => (
                    <span key={reason} className="rounded-lg bg-white/[0.04] px-2 py-1 text-[11px] text-white/45">
                      {reason}
                    </span>
                  ))}
                </div>

                {item.relatedEntities.length > 0 && (
                  <div className="mt-4 border-t border-white/10 pt-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/25">Related entities</p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {item.relatedEntities.map((entity) => (
                        <span key={`${item.nodeKey}:${entity.nodeKey}`} className="rounded-lg border border-white/10 px-2 py-1 text-xs text-white/45">
                          {entity.label} · {entity.relationship}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="mt-4 grid gap-3 border-t border-white/10 pt-4 sm:grid-cols-3">
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.14em] text-white/25">When</p>
                    <p className="mt-1 text-xs text-white/55">{formatDate(item.occurredAt)}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.14em] text-white/25">Source</p>
                    <p className="mt-1 break-all text-xs text-white/55">{item.source.collection}/{item.source.id}</p>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.14em] text-white/25">Importance</p>
                    <p className="mt-1 text-xs text-white/55">{percent(item.importance)}</p>
                  </div>
                </div>
              </article>
            ))}

            {result.results.length === 0 && (
              <div className="rounded-[24px] border border-white/10 bg-white/[0.025] px-6 py-16 text-center">
                <Search className="mx-auto h-6 w-6 text-white/20" />
                <p className="mt-4 font-bold text-white">No matching Personal OS evidence</p>
                <p className="mt-2 text-sm text-white/35">Try fewer filters, another phrase, or Hybrid mode.</p>
              </div>
            )}
          </div>

          <aside className="space-y-4">
            <div className="rounded-[22px] border border-white/10 bg-white/[0.025] p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-white/30">Domain facets</p>
              <div className="mt-3 space-y-2">
                {DOMAIN_OPTIONS.map(({ type, label }) => {
                  const count = result.facets.types[type] ?? 0;
                  if (!count) return null;
                  return (
                    <div key={type} className="flex items-center justify-between gap-3 text-sm">
                      <span className="text-white/55">{label}</span>
                      <span className="font-bold text-white">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="rounded-[22px] border border-white/10 bg-white/[0.025] p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-white/30">Top tags</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {result.facets.tags.slice(0, 15).map(({ tag, count }) => (
                  <span key={tag} className="rounded-lg border border-white/10 px-2 py-1 text-xs text-white/45">
                    {tag} · {count}
                  </span>
                ))}
                {result.facets.tags.length === 0 && <span className="text-xs text-white/25">No tag facets</span>}
              </div>
            </div>

            <div className="rounded-[22px] border border-white/10 bg-white/[0.025] p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-white/30">Ranking model</p>
              <p className="mt-3 text-xs leading-5 text-white/40">
                Hybrid ranking combines exact phrase matches, lexical coverage, semantic similarity, graph relationships, importance and recency. Semantic failure degrades safely instead of blocking search.
              </p>
            </div>
          </aside>
        </div>
      )}

      {packet && (
        <div className="rounded-[26px] border border-[#C6FF32]/20 bg-[#C6FF32]/[0.035] p-5">
          <div className="flex items-center gap-3">
            <Bot className="h-5 w-5 text-[#C6FF32]" />
            <div>
              <p className="font-black text-white">HSAKAA-readable evidence packet</p>
              <p className="mt-1 text-xs text-white/40">{packet.evidenceCount} grounded results · ready for Phase 10 context assembly</p>
            </div>
          </div>
          <pre className="mt-4 max-h-[420px] overflow-auto whitespace-pre-wrap rounded-2xl border border-white/10 bg-black/25 p-4 text-xs leading-6 text-white/55">
            {packet.context || "No evidence context was produced."}
          </pre>
        </div>
      )}
    </section>
  );
}
