"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Network, Search, Users } from "lucide-react";

import {
  findPersonGraphPath,
  getPeopleGraphOverview,
  getPersonGraphMutuals,
} from "@/lib/api/memory-people";
import {
  MemoryPerson,
  PersonGraphMutuals,
  PersonGraphOverview,
  PersonGraphPath,
  PersonGraphRelationshipKind,
} from "@/types/hsakaa";

function displayName(person: MemoryPerson) {
  return person.preferredName || person.name;
}

function relationshipLabel(value: PersonGraphRelationshipKind) {
  return value.replaceAll("_", " ");
}

export function PeopleGraphExplorer({
  initialOverview,
  initialPeople,
}: {
  initialOverview: PersonGraphOverview;
  initialPeople: MemoryPerson[];
}) {
  const [overview, setOverview] = useState(initialOverview);
  const [context, setContext] = useState("");
  const [fromPersonId, setFromPersonId] = useState("");
  const [toPersonId, setToPersonId] = useState("");
  const [path, setPath] = useState<PersonGraphPath | null>(null);
  const [mutuals, setMutuals] = useState<PersonGraphMutuals | null>(null);
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const people = useMemo(
    () => [...initialPeople].sort((a, b) => displayName(a).localeCompare(displayName(b))),
    [initialPeople],
  );

  function filterGraph() {
    setError("");
    startTransition(async () => {
      try {
        setOverview(
          await getPeopleGraphOverview({ context: context.trim(), limit: 150 }),
        );
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to filter People Graph.",
        );
      }
    });
  }

  function inspectPath() {
    if (!fromPersonId || !toPersonId || fromPersonId === toPersonId) {
      setError("Choose two different people.");
      return;
    }
    setError("");
    startTransition(async () => {
      try {
        const [nextPath, nextMutuals] = await Promise.all([
          findPersonGraphPath(fromPersonId, toPersonId, 6),
          getPersonGraphMutuals(fromPersonId, toPersonId),
        ]);
        setPath(nextPath);
        setMutuals(nextMutuals);
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to inspect graph path.",
        );
      }
    });
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[26px] border border-white/10 bg-white/[0.025] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#C6FF32]">
              <Network className="h-4 w-4" />
              Evidence-backed network
            </div>
            <h2 className="mt-2 text-xl font-black text-white">Graph overview</h2>
          </div>
          <div className="flex w-full gap-2 sm:w-auto">
            <input
              value={context}
              onChange={(event) => setContext(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") filterGraph();
              }}
              placeholder="Filter context e.g. 8lete"
              className="min-h-11 min-w-0 flex-1 rounded-xl border border-white/10 bg-[#080c0e] px-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#C6FF32]/60 sm:w-64"
            />
            <button
              type="button"
              disabled={isPending}
              onClick={filterGraph}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 text-sm font-black text-white transition hover:border-[#C6FF32]/40"
            >
              <Search className="h-4 w-4" />
              Filter
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <Metric label="People" value={overview.summary.people} />
          <Metric label="Connections" value={overview.summary.connections} />
          <Metric label="Explicit" value={overview.summary.explicitConnections} />
          <Metric label="Derived" value={overview.summary.derivedConnections} />
          <Metric label="Isolated" value={overview.summary.isolatedPeople} />
          <Metric label="Clusters" value={overview.summary.components} />
        </div>

        {error ? (
          <p className="mt-4 rounded-xl border border-red-400/20 bg-red-400/[0.06] px-3 py-2 text-sm text-red-100">
            {error}
          </p>
        ) : null}
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.5fr_0.8fr]">
        <div className="overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.025]">
          <div className="border-b border-white/10 px-5 py-4 sm:px-6">
            <p className="font-black text-white">Network map</p>
            <p className="mt-1 text-sm text-white/40">
              Showing up to 24 of the most-connected people in the current view.
            </p>
          </div>
          <GraphMap overview={overview} />
        </div>

        <div className="rounded-[26px] border border-white/10 bg-white/[0.025] p-5 sm:p-6">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-[#C6FF32]" />
            <p className="font-black text-white">Most connected</p>
          </div>
          <div className="mt-4 space-y-2">
            {overview.topConnected.length ? (
              overview.topConnected.map(({ person, degree }, index) => (
                <Link
                  key={person.personId}
                  href={`/admin/hsakaa/people/${person.personId}`}
                  className="flex items-center justify-between rounded-xl border border-white/10 bg-black/20 px-3 py-3 transition hover:border-[#C6FF32]/30"
                >
                  <div className="min-w-0">
                    <p className="truncate text-sm font-black text-white">
                      {index + 1}. {person.name}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-white/35">
                      {person.organizationName || person.relationship}
                    </p>
                  </div>
                  <span className="ml-3 rounded-full bg-[#C6FF32]/10 px-2.5 py-1 text-xs font-black text-[#C6FF32]">
                    {degree}
                  </span>
                </Link>
              ))
            ) : (
              <p className="text-sm leading-6 text-white/40">
                Add Person-to-Person connections to build the graph.
              </p>
            )}
          </div>
        </div>
      </section>

      <section className="rounded-[26px] border border-white/10 bg-white/[0.025] p-5 sm:p-6">
        <p className="font-black text-white">Connection path</p>
        <p className="mt-1 text-sm text-white/40">
          Find the shortest saved path and direct mutual connections between two
          people.
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <PersonSelect
            value={fromPersonId}
            onChange={setFromPersonId}
            people={people}
            placeholder="From person"
          />
          <PersonSelect
            value={toPersonId}
            onChange={setToPersonId}
            people={people}
            placeholder="To person"
          />
          <button
            type="button"
            disabled={isPending}
            onClick={inspectPath}
            className="min-h-11 rounded-xl bg-[#C6FF32] px-5 text-sm font-black text-[#030608] disabled:opacity-50"
          >
            Find path
          </button>
        </div>

        {path ? (
          <div className="mt-5 grid gap-4 lg:grid-cols-[1.4fr_0.8fr]">
            <div className="rounded-[20px] border border-white/10 bg-black/20 p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-white/35">
                Shortest path
              </p>
              {path.found ? (
                <div className="mt-4 flex flex-wrap items-center gap-2">
                  {path.nodes.map((node, index) => (
                    <div key={`${node.personId}-${index}`} className="contents">
                      {index > 0 ? (
                        <span className="text-xs font-black text-white/25">→</span>
                      ) : null}
                      <Link
                        href={`/admin/hsakaa/people/${node.personId}`}
                        className="rounded-xl border border-white/10 px-3 py-2 text-sm font-black text-white hover:border-[#C6FF32]/30"
                      >
                        {node.name}
                        {index > 0 && path.edges[index - 1] ? (
                          <span className="ml-2 text-[10px] font-bold uppercase text-white/30">
                            {relationshipLabel(path.edges[index - 1].kind)}
                          </span>
                        ) : null}
                      </Link>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-white/45">
                  No saved connection path found within {path.maxDepth} hops.
                </p>
              )}
            </div>

            <div className="rounded-[20px] border border-white/10 bg-black/20 p-4">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-white/35">
                Mutual connections
              </p>
              {mutuals?.data.length ? (
                <div className="mt-3 flex flex-wrap gap-2">
                  {mutuals.data.map((person) => (
                    <Link
                      key={person.personId}
                      href={`/admin/hsakaa/people/${person.personId}`}
                      className="rounded-xl border border-white/10 px-3 py-2 text-sm font-bold text-white/75 hover:border-[#C6FF32]/30"
                    >
                      {person.name}
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="mt-3 text-sm text-white/45">No direct mutuals.</p>
              )}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[16px] border border-white/10 bg-black/20 px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/35">
        {label}
      </p>
      <p className="mt-1 text-2xl font-black text-white">{value}</p>
    </div>
  );
}

function PersonSelect({
  value,
  onChange,
  people,
  placeholder,
}: {
  value: string;
  onChange: (value: string) => void;
  people: MemoryPerson[];
  placeholder: string;
}) {
  return (
    <select
      value={value}
      onChange={(event) => onChange(event.target.value)}
      className="min-h-11 rounded-xl border border-white/10 bg-[#080c0e] px-3 text-sm font-semibold text-white outline-none focus:border-[#C6FF32]/60"
    >
      <option value="">{placeholder}</option>
      {people.map((person) => (
        <option key={person._id} value={person._id}>
          {displayName(person)}
          {person.organizationName ? ` · ${person.organizationName}` : ""}
        </option>
      ))}
    </select>
  );
}

function GraphMap({ overview }: { overview: PersonGraphOverview }) {
  const nodes = useMemo(
    () =>
      [...overview.nodes]
        .sort((a, b) => b.degree - a.degree || b.importance - a.importance)
        .slice(0, 24),
    [overview.nodes],
  );
  const nodeIds = useMemo(
    () => new Set(nodes.map((node) => node.personId)),
    [nodes],
  );
  const edges = overview.edges.filter(
    (edge) => nodeIds.has(edge.sourcePersonId) && nodeIds.has(edge.targetPersonId),
  );
  const width = 760;
  const height = 500;
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = 185;
  const positions = new Map(
    nodes.map((node, index) => {
      const angle = (Math.PI * 2 * index) / Math.max(nodes.length, 1) - Math.PI / 2;
      const degreePull = Math.min(node.degree, 8) * 7;
      const nodeRadius = Math.max(90, radius - degreePull);
      return [
        node.personId,
        {
          x: centerX + Math.cos(angle) * nodeRadius,
          y: centerY + Math.sin(angle) * nodeRadius,
        },
      ] as const;
    }),
  );

  if (!nodes.length) {
    return (
      <div className="flex min-h-[360px] items-center justify-center p-6 text-center text-sm text-white/40">
        No active People found for this graph view.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto p-4">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="mx-auto min-h-[420px] min-w-[680px]"
        role="img"
        aria-label="People Graph network map"
      >
        {edges.map((edge) => {
          const source = positions.get(edge.sourcePersonId);
          const target = positions.get(edge.targetPersonId);
          if (!source || !target) return null;
          return (
            <line
              key={edge.edgeId}
              x1={source.x}
              y1={source.y}
              x2={target.x}
              y2={target.y}
              stroke="rgba(255,255,255,0.14)"
              strokeWidth={edge.isDerived ? 1.2 : 1.8}
              strokeDasharray={edge.isDerived ? "5 5" : undefined}
            />
          );
        })}

        {nodes.map((node) => {
          const position = positions.get(node.personId);
          if (!position) return null;
          const nodeRadius = 18 + Math.min(node.degree, 6) * 1.8;
          return (
            <g key={node.personId}>
              <circle
                cx={position.x}
                cy={position.y}
                r={nodeRadius}
                fill="#0b1012"
                stroke={node.degree ? "#C6FF32" : "rgba(255,255,255,0.2)"}
                strokeWidth={node.degree ? 2 : 1}
              />
              <text
                x={position.x}
                y={position.y + nodeRadius + 17}
                textAnchor="middle"
                fill="rgba(255,255,255,0.78)"
                fontSize="11"
                fontWeight="700"
              >
                {node.name.length > 18 ? `${node.name.slice(0, 16)}…` : node.name}
              </text>
              <text
                x={position.x}
                y={position.y + 4}
                textAnchor="middle"
                fill="#C6FF32"
                fontSize="10"
                fontWeight="900"
              >
                {node.degree}
              </text>
            </g>
          );
        })}
      </svg>
    </div>
  );
}
