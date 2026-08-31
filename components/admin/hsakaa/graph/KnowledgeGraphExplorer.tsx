"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
  ArrowRight,
  BookOpen,
  Bot,
  Brain,
  Building2,
  CalendarClock,
  CircleAlert,
  GitBranch,
  HeartPulse,
  Loader2,
  Network,
  RefreshCw,
  Search,
  Sparkles,
  UserRound,
  Video,
  Waypoints,
} from "lucide-react";

import {
  askKnowledgeGraph,
  findKnowledgeGraphPath,
  getKnowledgeGraphNode,
  getKnowledgeGraphOverview,
  getKnowledgeGraphTimeline,
  syncKnowledgeGraph,
} from "@/lib/api/knowledge-graph";
import {
  KnowledgeGraphNodeType,
  type KnowledgeGraphAnswer,
  type KnowledgeGraphEdge,
  type KnowledgeGraphNode,
  type KnowledgeGraphNodeDetail,
  type KnowledgeGraphOverview,
  type KnowledgeGraphPath,
  type KnowledgeGraphTimeline,
} from "@/types/knowledge-graph";

const TYPE_ORDER = Object.values(KnowledgeGraphNodeType);

const TYPE_LABELS: Record<KnowledgeGraphNodeType, string> = {
  [KnowledgeGraphNodeType.PERSON]: "People",
  [KnowledgeGraphNodeType.COMPANY]: "Companies",
  [KnowledgeGraphNodeType.DECISION]: "Decisions",
  [KnowledgeGraphNodeType.JOURNAL]: "Journal",
  [KnowledgeGraphNodeType.MEMORY]: "Memory",
  [KnowledgeGraphNodeType.BOOK]: "Books",
  [KnowledgeGraphNodeType.HIGHLIGHT]: "Highlights",
  [KnowledgeGraphNodeType.HEALTH]: "Health",
  [KnowledgeGraphNodeType.MEDIA]: "Media",
  [KnowledgeGraphNodeType.TASK]: "Tasks",
};

const EXAMPLE_QUESTIONS = [
  "What decisions over the last six months affected 8lete?",
  "Which people repeatedly appear around my important decisions?",
  "What books influenced ideas I eventually used?",
];

export function KnowledgeGraphExplorer() {
  const [overview, setOverview] = useState<KnowledgeGraphOverview | null>(null);
  const [timeline, setTimeline] = useState<KnowledgeGraphTimeline | null>(null);
  const [selected, setSelected] = useState<KnowledgeGraphNodeDetail | null>(null);
  const [path, setPath] = useState<KnowledgeGraphPath | null>(null);
  const [answer, setAnswer] = useState<KnowledgeGraphAnswer | null>(null);
  const [query, setQuery] = useState("");
  const [types, setTypes] = useState<KnowledgeGraphNodeType[]>([]);
  const [fromNode, setFromNode] = useState("");
  const [toNode, setToNode] = useState("");
  const [question, setQuestion] = useState(EXAMPLE_QUESTIONS[0]);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      getKnowledgeGraphOverview({ limit: 220 }),
      getKnowledgeGraphTimeline({ limit: 80 }),
    ])
      .then(([graph, graphTimeline]) => {
        if (cancelled) return;
        setOverview(graph);
        setTimeline(graphTimeline);
      })
      .catch((caught) => {
        if (cancelled) return;
        setError(caught instanceof Error ? caught.message : "Unable to load the Knowledge Graph.");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const nodeByKey = useMemo(
    () => new Map((overview?.nodes ?? []).map((node) => [node.nodeKey, node])),
    [overview],
  );

  function reloadGraph(nextTypes = types, nextQuery = query) {
    setError("");
    startTransition(async () => {
      try {
        const [graph, graphTimeline] = await Promise.all([
          getKnowledgeGraphOverview({ q: nextQuery, types: nextTypes, limit: 220 }),
          getKnowledgeGraphTimeline({ types: nextTypes, limit: 80 }),
        ]);
        setOverview(graph);
        setTimeline(graphTimeline);
        setSelected(null);
        setPath(null);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Unable to refresh the Knowledge Graph.");
      }
    });
  }

  function toggleType(type: KnowledgeGraphNodeType) {
    const next = types.includes(type) ? types.filter((item) => item !== type) : [...types, type];
    setTypes(next);
    reloadGraph(next, query);
  }

  function sync() {
    setError("");
    startTransition(async () => {
      try {
        await syncKnowledgeGraph();
        const [graph, graphTimeline] = await Promise.all([
          getKnowledgeGraphOverview({ q: query, types, limit: 220 }),
          getKnowledgeGraphTimeline({ types, limit: 80 }),
        ]);
        setOverview(graph);
        setTimeline(graphTimeline);
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Knowledge Graph sync failed.");
      }
    });
  }

  function inspectNode(nodeKey: string) {
    setError("");
    startTransition(async () => {
      try {
        setSelected(await getKnowledgeGraphNode(nodeKey));
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Unable to load graph evidence.");
      }
    });
  }

  function inspectPath() {
    if (!fromNode || !toNode) return;
    setError("");
    startTransition(async () => {
      try {
        setPath(await findKnowledgeGraphPath(fromNode, toNode, 5));
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Unable to find a graph path.");
      }
    });
  }

  function ask(questionOverride?: string) {
    const value = (questionOverride ?? question).trim();
    if (!value) return;
    setQuestion(value);
    setError("");
    startTransition(async () => {
      try {
        setAnswer(await askKnowledgeGraph(value, 36));
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "HSAKAA could not reason over the graph.");
      }
    });
  }

  if (!overview && !error) {
    return (
      <div className="flex min-h-[420px] items-center justify-center rounded-[28px] border border-white/10 bg-white/[0.025]">
        <div className="flex items-center gap-3 text-sm font-bold text-white/45">
          <Loader2 className="h-5 w-5 animate-spin text-[#C6FF32]" />
          Building the graph view…
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {error ? (
        <div className="flex items-start gap-3 rounded-[20px] border border-red-400/20 bg-red-400/[0.06] p-4 text-sm text-red-100">
          <CircleAlert className="mt-0.5 h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      <section className="rounded-[28px] border border-white/10 bg-white/[0.025] p-5 sm:p-6">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#C6FF32]">Cross-domain map</p>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-white">Personal OS relationships</h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-white/40">
              Materialized from source-of-truth records. Every connection retains evidence and time context instead of becoming an untraceable AI inference.
            </p>
          </div>
          <button
            type="button"
            onClick={sync}
            disabled={isPending}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-[#C6FF32]/30 bg-[#C6FF32]/10 px-4 text-sm font-black text-[#C6FF32] transition hover:bg-[#C6FF32]/15 disabled:opacity-50"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
            Sync graph
          </button>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
          <Metric label="Nodes" value={overview?.summary.totalNodes ?? 0} />
          <Metric label="Relationships" value={overview?.summary.totalEdges ?? 0} />
          <Metric label="Domains" value={overview?.summary.connectedDomains ?? 0} />
          <Metric label="In view" value={overview?.summary.returnedNodes ?? 0} />
          <Metric label="Visible edges" value={overview?.summary.returnedEdges ?? 0} />
        </div>

        <div className="mt-6 flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="flex min-w-0 flex-1 gap-2">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") reloadGraph();
              }}
              placeholder="Search the graph — 8lete, decision, book, person…"
              className="min-h-11 min-w-0 flex-1 rounded-xl border border-white/10 bg-[#080c0e] px-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#C6FF32]/60"
            />
            <button
              type="button"
              onClick={() => reloadGraph()}
              disabled={isPending}
              className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-white/10 px-4 text-sm font-black text-white transition hover:border-[#C6FF32]/35"
            >
              <Search className="h-4 w-4" /> Search
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {TYPE_ORDER.map((type) => {
            const active = types.includes(type);
            const count = overview?.summary.countsByType[type] ?? 0;
            return (
              <button
                key={type}
                type="button"
                onClick={() => toggleType(type)}
                className={`rounded-full border px-3 py-1.5 text-xs font-black transition ${
                  active
                    ? "border-[#C6FF32]/45 bg-[#C6FF32]/12 text-[#C6FF32]"
                    : "border-white/10 bg-black/20 text-white/45 hover:border-white/20 hover:text-white/70"
                }`}
              >
                {TYPE_LABELS[type]} · {count}
              </button>
            );
          })}
          {types.length ? (
            <button
              type="button"
              onClick={() => {
                setTypes([]);
                reloadGraph([], query);
              }}
              className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-black text-white/35 hover:text-white"
            >
              Clear domains
            </button>
          ) : null}
        </div>
      </section>

      <section className="grid gap-6 2xl:grid-cols-[1.65fr_0.85fr]">
        <div className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.025]">
          <div className="border-b border-white/10 px-5 py-4 sm:px-6">
            <div className="flex items-center gap-2">
              <Network className="h-4 w-4 text-[#C6FF32]" />
              <p className="font-black text-white">Graph explorer</p>
            </div>
            <p className="mt-1 text-sm text-white/35">Click a node to inspect its source evidence and relationships.</p>
          </div>
          <GraphCanvas
            nodes={overview?.nodes ?? []}
            edges={overview?.edges ?? []}
            selectedKey={selected?.node.nodeKey}
            onSelect={inspectNode}
          />
        </div>

        <EvidencePanel detail={selected} nodeByKey={nodeByKey} onSelect={inspectNode} />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.025] p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <CalendarClock className="h-4 w-4 text-[#C6FF32]" />
            <p className="font-black text-white">Temporal relationships</p>
          </div>
          <p className="mt-1 text-sm text-white/35">Recent events across the selected graph domains.</p>
          <div className="mt-5 max-h-[520px] space-y-2 overflow-y-auto pr-1">
            {timeline?.nodes.length ? (
              timeline.nodes.map((node) => (
                <button
                  key={node.nodeKey}
                  type="button"
                  onClick={() => inspectNode(node.nodeKey)}
                  className="flex w-full items-start gap-3 rounded-[18px] border border-white/10 bg-black/20 p-3 text-left transition hover:border-[#C6FF32]/25"
                >
                  <TypeIcon type={node.type} />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <p className="line-clamp-2 text-sm font-black text-white">{node.label}</p>
                      <span className="shrink-0 text-[11px] font-bold text-white/30">{formatDate(node.occurredAt)}</span>
                    </div>
                    <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-white/30">{TYPE_LABELS[node.type]}</p>
                  </div>
                </button>
              ))
            ) : (
              <p className="rounded-[18px] border border-dashed border-white/10 p-5 text-sm text-white/35">No dated graph nodes in this view.</p>
            )}
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.025] p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <Waypoints className="h-4 w-4 text-[#C6FF32]" />
            <p className="font-black text-white">Connection path</p>
          </div>
          <p className="mt-1 text-sm text-white/35">Find the shortest evidence-backed route between two Personal OS entities.</p>

          <div className="mt-5 grid gap-3">
            <GraphNodeSelect value={fromNode} onChange={setFromNode} nodes={overview?.nodes ?? []} placeholder="From entity" />
            <GraphNodeSelect value={toNode} onChange={setToNode} nodes={overview?.nodes ?? []} placeholder="To entity" />
            <button
              type="button"
              disabled={!fromNode || !toNode || isPending}
              onClick={inspectPath}
              className="min-h-11 rounded-xl bg-[#C6FF32] px-4 text-sm font-black text-[#030608] disabled:opacity-40"
            >
              Find path
            </button>
          </div>

          {path ? (
            <div className="mt-5 rounded-[20px] border border-white/10 bg-black/20 p-4">
              {path.found ? (
                <>
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-white/30">{path.hops} hop{path.hops === 1 ? "" : "s"}</p>
                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    {path.nodes.map((node, index) => (
                      <div key={node.nodeKey} className="contents">
                        {index ? <ArrowRight className="h-3.5 w-3.5 text-white/20" /> : null}
                        <button
                          type="button"
                          onClick={() => inspectNode(node.nodeKey)}
                          className="rounded-xl border border-white/10 px-3 py-2 text-left text-xs font-black text-white hover:border-[#C6FF32]/30"
                        >
                          <span className="block text-[10px] uppercase tracking-[0.12em] text-white/30">{node.type}</span>
                          {node.label}
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 space-y-2 border-t border-white/10 pt-4">
                    {path.edges.map((edge) => (
                      <p key={edge.edgeKey} className="text-xs leading-5 text-white/40">
                        <span className="font-black text-white/65">{pretty(edge.type)}</span>
                        {edge.label ? ` · ${edge.label}` : ""}
                      </p>
                    ))}
                  </div>
                </>
              ) : (
                <p className="text-sm text-white/40">No path found within {path.maxDepth} hops.</p>
              )}
            </div>
          ) : null}
        </div>
      </section>

      <section className="rounded-[28px] border border-[#C6FF32]/20 bg-[#C6FF32]/[0.035] p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-[#C6FF32]" />
              <p className="font-black text-white">HSAKAA cross-domain reasoning</p>
            </div>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/40">
              HSAKAA receives only the graph evidence selected for this question and must cite the node/edge keys behind material conclusions.
            </p>
          </div>
          <span className="rounded-full border border-[#C6FF32]/20 bg-[#C6FF32]/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-[#C6FF32]">Owner only</span>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {EXAMPLE_QUESTIONS.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => ask(example)}
              disabled={isPending}
              className="rounded-full border border-white/10 bg-black/20 px-3 py-2 text-xs font-bold text-white/55 transition hover:border-[#C6FF32]/30 hover:text-white"
            >
              {example}
            </button>
          ))}
        </div>

        <div className="mt-4 flex flex-col gap-3 lg:flex-row">
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            rows={3}
            className="min-h-24 flex-1 resize-none rounded-[18px] border border-white/10 bg-[#05090a] px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/25 focus:border-[#C6FF32]/50"
            placeholder="Ask a question that crosses Personal OS domains…"
          />
          <button
            type="button"
            onClick={() => ask()}
            disabled={isPending || !question.trim()}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[18px] bg-[#C6FF32] px-6 text-sm font-black text-[#030608] disabled:opacity-40 lg:self-stretch"
          >
            {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
            Ask graph
          </button>
        </div>

        {answer ? <ReasoningAnswer answer={answer} onSelect={inspectNode} /> : null}
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[18px] border border-white/10 bg-black/20 px-4 py-3">
      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-white/30">{label}</p>
      <p className="mt-1 text-2xl font-black text-white">{value.toLocaleString()}</p>
    </div>
  );
}

function GraphCanvas({
  nodes,
  edges,
  selectedKey,
  onSelect,
}: {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
  selectedKey?: string;
  onSelect: (nodeKey: string) => void;
}) {
  const visibleNodes = useMemo(
    () => [...nodes].sort((a, b) => b.importance - a.importance).slice(0, 54),
    [nodes],
  );
  const nodeKeys = useMemo(() => new Set(visibleNodes.map((node) => node.nodeKey)), [visibleNodes]);
  const visibleEdges = edges.filter((edge) => nodeKeys.has(edge.sourceNodeKey) && nodeKeys.has(edge.targetNodeKey)).slice(0, 140);
  const width = 1040;
  const height = 620;
  const columns = Math.max(5, Math.ceil(Math.sqrt(visibleNodes.length * 1.7)));
  const rows = Math.max(1, Math.ceil(visibleNodes.length / columns));
  const xGap = width / (columns + 1);
  const yGap = height / (rows + 1);
  const positions = new Map(
    visibleNodes.map((node, index) => {
      const column = index % columns;
      const row = Math.floor(index / columns);
      const stagger = row % 2 ? xGap * 0.35 : 0;
      return [
        node.nodeKey,
        {
          x: Math.min(width - 55, xGap * (column + 1) + stagger),
          y: yGap * (row + 1),
        },
      ] as const;
    }),
  );

  if (!visibleNodes.length) {
    return <div className="flex min-h-[420px] items-center justify-center p-6 text-sm text-white/35">No nodes match the current graph filters.</div>;
  }

  return (
    <div className="overflow-x-auto p-3 sm:p-4">
      <svg viewBox={`0 0 ${width} ${height}`} className="min-h-[470px] min-w-[760px] w-full">
        {visibleEdges.map((edge) => {
          const source = positions.get(edge.sourceNodeKey);
          const target = positions.get(edge.targetNodeKey);
          if (!source || !target) return null;
          return (
            <line
              key={edge.edgeKey}
              x1={source.x}
              y1={source.y}
              x2={target.x}
              y2={target.y}
              stroke="currentColor"
              strokeWidth={Math.max(1, edge.strength * 2.1)}
              className="text-white/[0.12]"
            />
          );
        })}
        {visibleNodes.map((node) => {
          const point = positions.get(node.nodeKey)!;
          const selected = selectedKey === node.nodeKey;
          const radius = 10 + node.importance * 9 + (selected ? 4 : 0);
          return (
            <g key={node.nodeKey} onClick={() => onSelect(node.nodeKey)} className="cursor-pointer">
              <circle
                cx={point.x}
                cy={point.y}
                r={radius + 5}
                fill="transparent"
                stroke="currentColor"
                strokeWidth={selected ? 2 : 1}
                className={selected ? "text-[#C6FF32]/80" : "text-white/10"}
              />
              <circle cx={point.x} cy={point.y} r={radius} fill="currentColor" className={selected ? "text-[#C6FF32]" : "text-white/75"} />
              <text
                x={point.x}
                y={point.y + radius + 17}
                textAnchor="middle"
                fill="currentColor"
                className="text-[10px] font-black text-white/70"
              >
                {truncate(node.label, 22)}
              </text>
              <text
                x={point.x}
                y={point.y + radius + 29}
                textAnchor="middle"
                fill="currentColor"
                className="text-[8px] font-bold uppercase text-white/25"
              >
                {node.type}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}

function EvidencePanel({
  detail,
  nodeByKey,
  onSelect,
}: {
  detail: KnowledgeGraphNodeDetail | null;
  nodeByKey: Map<string, KnowledgeGraphNode>;
  onSelect: (nodeKey: string) => void;
}) {
  if (!detail) {
    return (
      <div className="rounded-[28px] border border-white/10 bg-white/[0.025] p-6">
        <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/35">
          <GitBranch className="h-5 w-5" />
        </div>
        <h3 className="mt-5 text-xl font-black text-white">Inspect evidence</h3>
        <p className="mt-2 text-sm leading-6 text-white/40">Select any node to see source collection, temporal metadata, neighboring entities and why each relationship exists.</p>
      </div>
    );
  }

  const neighbors = new Map(detail.neighbors.map((node) => [node.nodeKey, node]));
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.025] p-5 sm:p-6">
      <div className="flex items-start gap-3">
        <TypeIcon type={detail.node.type} large />
        <div className="min-w-0">
          <p className="text-[11px] font-black uppercase tracking-[0.16em] text-[#C6FF32]">{TYPE_LABELS[detail.node.type]}</p>
          <h3 className="mt-1 text-xl font-black leading-tight text-white">{detail.node.label}</h3>
        </div>
      </div>

      {detail.node.summary ? <p className="mt-4 line-clamp-6 text-sm leading-6 text-white/45">{detail.node.summary}</p> : null}

      <div className="mt-5 grid gap-2 text-xs sm:grid-cols-2">
        <Meta label="Source" value={detail.node.sourceCollection} />
        <Meta label="Occurred" value={formatDate(detail.node.occurredAt)} />
        <Meta label="Privacy" value={pretty(detail.node.privacy)} />
        <Meta label="Importance" value={`${Math.round(detail.node.importance * 100)}%`} />
      </div>

      <div className="mt-6 border-t border-white/10 pt-5">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-white/30">Relationships · {detail.edges.length}</p>
        <div className="mt-3 max-h-[390px] space-y-2 overflow-y-auto pr-1">
          {detail.edges.map((edge) => {
            const otherKey = edge.sourceNodeKey === detail.node.nodeKey ? edge.targetNodeKey : edge.sourceNodeKey;
            const other = neighbors.get(otherKey) ?? nodeByKey.get(otherKey);
            return (
              <div key={edge.edgeKey} className="rounded-[18px] border border-white/10 bg-black/20 p-3">
                <button type="button" onClick={() => onSelect(otherKey)} className="w-full text-left">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-white/30">{pretty(edge.type)}</p>
                  <p className="mt-1 text-sm font-black text-white">{other?.label ?? otherKey}</p>
                  {edge.label ? <p className="mt-1 text-xs text-white/40">{edge.label}</p> : null}
                </button>
                {edge.evidence.length ? (
                  <div className="mt-3 border-t border-white/10 pt-3">
                    {edge.evidence.slice(0, 3).map((evidence, index) => (
                      <p key={`${edge.edgeKey}-${index}`} className="text-[11px] leading-5 text-white/35">
                        <span className="font-black text-white/50">{evidence.sourceCollection}</span>
                        {evidence.fieldPath ? ` · ${evidence.fieldPath}` : ""}
                        {evidence.note ? ` — ${evidence.note}` : ""}
                      </p>
                    ))}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function ReasoningAnswer({ answer, onSelect }: { answer: KnowledgeGraphAnswer; onSelect: (nodeKey: string) => void }) {
  const evidenceByKey = new Map(answer.evidence.nodes.map((node) => [node.nodeKey, node]));
  return (
    <div className="mt-6 rounded-[24px] border border-white/10 bg-black/25 p-5">
      <div className="flex items-center justify-between gap-3">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#C6FF32]">Graph-grounded answer</p>
        <span className="text-[11px] font-bold text-white/25">{answer.ai?.model ?? "deterministic fallback"}</span>
      </div>
      <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-white/75">{answer.answer}</p>

      {answer.findings.length ? (
        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {answer.findings.map((finding, index) => (
            <div key={`${finding.statement}-${index}`} className="rounded-[18px] border border-white/10 bg-white/[0.025] p-4">
              <div className="flex items-center justify-between gap-3">
                <span className="text-[10px] font-black uppercase tracking-[0.14em] text-white/30">Finding {index + 1}</span>
                <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-black uppercase text-white/40">{finding.confidence}</span>
              </div>
              <p className="mt-2 text-sm leading-6 text-white/65">{finding.statement}</p>
              {finding.nodeKeys.length ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {finding.nodeKeys.slice(0, 8).map((nodeKey) => {
                    const node = evidenceByKey.get(nodeKey);
                    return (
                      <button
                        key={nodeKey}
                        type="button"
                        onClick={() => onSelect(nodeKey)}
                        className="rounded-lg border border-[#C6FF32]/15 bg-[#C6FF32]/[0.06] px-2 py-1 text-[10px] font-black text-[#C6FF32]/80 hover:border-[#C6FF32]/35"
                      >
                        {node?.label ?? nodeKey}
                      </button>
                    );
                  })}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      ) : null}

      {answer.caveats.length ? (
        <div className="mt-5 border-t border-white/10 pt-4">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/30">Caveats</p>
          <ul className="mt-2 space-y-1.5 text-xs leading-5 text-white/40">
            {answer.caveats.map((item) => <li key={item}>• {item}</li>)}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

function GraphNodeSelect({
  value,
  onChange,
  nodes,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  nodes: KnowledgeGraphNode[];
  placeholder: string;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="min-h-11 rounded-xl border border-white/10 bg-[#080c0e] px-3 text-sm font-semibold text-white outline-none focus:border-[#C6FF32]/50"
    >
      <option value="">{placeholder}</option>
      {[...nodes]
        .sort((a, b) => a.type.localeCompare(b.type) || a.label.localeCompare(b.label))
        .map((node) => (
          <option key={node.nodeKey} value={node.nodeKey}>
            {TYPE_LABELS[node.type]} · {node.label}
          </option>
        ))}
    </select>
  );
}

function TypeIcon({ type, large = false }: { type: KnowledgeGraphNodeType; large?: boolean }) {
  const Icon = type === KnowledgeGraphNodeType.PERSON
    ? UserRound
    : type === KnowledgeGraphNodeType.COMPANY
      ? Building2
      : type === KnowledgeGraphNodeType.DECISION
        ? GitBranch
        : type === KnowledgeGraphNodeType.BOOK || type === KnowledgeGraphNodeType.HIGHLIGHT
          ? BookOpen
          : type === KnowledgeGraphNodeType.HEALTH
            ? HeartPulse
            : type === KnowledgeGraphNodeType.MEDIA
              ? Video
              : type === KnowledgeGraphNodeType.TASK
                ? Sparkles
                : Brain;
  return (
    <div className={`grid shrink-0 place-items-center rounded-xl border border-[#C6FF32]/15 bg-[#C6FF32]/[0.07] text-[#C6FF32] ${large ? "h-11 w-11" : "h-9 w-9"}`}>
      <Icon className={large ? "h-5 w-5" : "h-4 w-4"} />
    </div>
  );
}

function Meta({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2.5">
      <p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/25">{label}</p>
      <p className="mt-1 truncate font-bold text-white/60">{value}</p>
    </div>
  );
}

function pretty(value?: string) {
  if (!value) return "Unknown";
  return value.replaceAll("_", " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatDate(value?: string) {
  if (!value) return "Undated";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Undated";
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

function truncate(value: string, max: number) {
  return value.length <= max ? value : `${value.slice(0, max - 1)}…`;
}
