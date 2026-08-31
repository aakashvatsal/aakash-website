"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { Link2, Plus, Trash2 } from "lucide-react";

import {
  createPersonGraphConnection,
  deletePersonGraphConnection,
  getPersonGraph,
} from "@/lib/api/memory-people";
import {
  MemoryPerson,
  PersonGraphDetail,
  PersonGraphRelationshipKind,
} from "@/types/hsakaa";

const RELATIONSHIP_OPTIONS: Array<{
  value: PersonGraphRelationshipKind;
  label: string;
}> = [
  { value: PersonGraphRelationshipKind.KNOWS, label: "Knows" },
  { value: PersonGraphRelationshipKind.FRIEND, label: "Friend" },
  { value: PersonGraphRelationshipKind.FAMILY, label: "Family" },
  { value: PersonGraphRelationshipKind.COLLEAGUE, label: "Colleague" },
  { value: PersonGraphRelationshipKind.WORKS_WITH, label: "Works with" },
  { value: PersonGraphRelationshipKind.COFOUNDER, label: "Co-founder" },
  { value: PersonGraphRelationshipKind.REPORTS_TO, label: "Reports to" },
  { value: PersonGraphRelationshipKind.MANAGES, label: "Manages" },
  { value: PersonGraphRelationshipKind.ADVISOR_TO, label: "Advisor to" },
  { value: PersonGraphRelationshipKind.INVESTOR_IN, label: "Investor in" },
  { value: PersonGraphRelationshipKind.CLIENT_OF, label: "Client of" },
  { value: PersonGraphRelationshipKind.INTRODUCED, label: "Introduced" },
  { value: PersonGraphRelationshipKind.OTHER, label: "Other" },
];

function relationshipLabel(value: PersonGraphRelationshipKind) {
  return (
    RELATIONSHIP_OPTIONS.find((option) => option.value === value)?.label ??
    value.replaceAll("_", " ")
  );
}

function personName(person: MemoryPerson) {
  return person.preferredName || person.name;
}

export function PersonConnections({
  personId,
  displayName,
  initialGraph,
  initialPeople,
}: {
  personId: string;
  displayName: string;
  initialGraph: PersonGraphDetail;
  initialPeople: MemoryPerson[];
}) {
  const [graph, setGraph] = useState(initialGraph);
  const [targetPersonId, setTargetPersonId] = useState("");
  const [kind, setKind] = useState(PersonGraphRelationshipKind.KNOWS);
  const [label, setLabel] = useState("");
  const [contexts, setContexts] = useState("");
  const [strength, setStrength] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const availablePeople = useMemo(
    () =>
      initialPeople
        .filter((person) => person._id !== personId)
        .sort((a, b) => personName(a).localeCompare(personName(b))),
    [initialPeople, personId],
  );

  function refreshGraph() {
    return getPersonGraph(personId).then(setGraph);
  }

  function createConnection() {
    if (!targetPersonId) {
      setError("Choose a person to connect.");
      return;
    }

    setError("");
    startTransition(async () => {
      try {
        await createPersonGraphConnection(personId, {
          targetPersonId,
          kind,
          label: label.trim() || undefined,
          contexts: contexts
            .split(",")
            .map((value) => value.trim())
            .filter(Boolean),
          strength: strength ? Number(strength) : undefined,
          notes: notes.trim() || undefined,
        });
        await refreshGraph();
        setTargetPersonId("");
        setLabel("");
        setContexts("");
        setStrength("");
        setNotes("");
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to create connection.",
        );
      }
    });
  }

  function removeConnection(edgeId: string) {
    setError("");
    startTransition(async () => {
      try {
        await deletePersonGraphConnection(personId, edgeId);
        await refreshGraph();
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to remove connection.",
        );
      }
    });
  }

  return (
    <section className="overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.025]">
      <div className="border-b border-white/10 px-5 py-5 sm:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-[#C6FF32]">
              <Link2 className="h-4 w-4" />
              Phase 5E · People Graph
            </div>
            <h2 className="mt-2 text-xl font-black text-white">
              {displayName}&apos;s connections
            </h2>
            <p className="mt-1 max-w-2xl text-sm leading-6 text-white/50">
              Only saved graph edges and deterministic relationship-context
              links appear here. HSAKAA does not infer friendships from free
              text.
            </p>
          </div>

          <Link
            href="/admin/hsakaa/people/graph"
            className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white/70 transition hover:border-[#C6FF32]/40 hover:text-white"
          >
            Open full graph
          </Link>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          <SummaryCard label="Direct" value={graph.summary.directConnections} />
          <SummaryCard
            label="Explicit"
            value={graph.summary.explicitConnections}
          />
          <SummaryCard
            label="Derived"
            value={graph.summary.derivedConnections}
          />
        </div>
      </div>

      <div className="grid gap-6 p-5 sm:p-6 xl:grid-cols-[0.95fr_1.45fr]">
        <div className="rounded-[20px] border border-white/10 bg-black/20 p-4">
          <p className="text-sm font-black text-white">Add connection</p>
          <div className="mt-4 space-y-3">
            <label className="block text-xs font-bold uppercase tracking-[0.14em] text-white/40">
              Person
              <select
                value={targetPersonId}
                onChange={(event) => setTargetPersonId(event.target.value)}
                className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-[#080c0e] px-3 text-sm font-semibold normal-case tracking-normal text-white outline-none focus:border-[#C6FF32]/60"
              >
                <option value="">Choose person</option>
                {availablePeople.map((person) => (
                  <option key={person._id} value={person._id}>
                    {personName(person)}
                    {person.organizationName
                      ? ` · ${person.organizationName}`
                      : ""}
                  </option>
                ))}
              </select>
            </label>

            <label className="block text-xs font-bold uppercase tracking-[0.14em] text-white/40">
              Relationship
              <select
                value={kind}
                onChange={(event) =>
                  setKind(event.target.value as PersonGraphRelationshipKind)
                }
                className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-[#080c0e] px-3 text-sm font-semibold normal-case tracking-normal text-white outline-none focus:border-[#C6FF32]/60"
              >
                {RELATIONSHIP_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </label>

            <input
              value={label}
              onChange={(event) => setLabel(event.target.value)}
              placeholder="Optional label"
              className="min-h-11 w-full rounded-xl border border-white/10 bg-[#080c0e] px-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#C6FF32]/60"
            />

            <input
              value={contexts}
              onChange={(event) => setContexts(event.target.value)}
              placeholder="Contexts, comma separated (8lete, school)"
              className="min-h-11 w-full rounded-xl border border-white/10 bg-[#080c0e] px-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#C6FF32]/60"
            />

            <select
              value={strength}
              onChange={(event) => setStrength(event.target.value)}
              className="min-h-11 w-full rounded-xl border border-white/10 bg-[#080c0e] px-3 text-sm text-white outline-none focus:border-[#C6FF32]/60"
            >
              <option value="">No strength set</option>
              {[1, 2, 3, 4, 5].map((value) => (
                <option key={value} value={value}>
                  Explicit strength {value}/5
                </option>
              ))}
            </select>

            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              placeholder="Optional connection notes"
              rows={3}
              className="w-full rounded-xl border border-white/10 bg-[#080c0e] px-3 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#C6FF32]/60"
            />

            {error ? (
              <p className="rounded-xl border border-red-400/20 bg-red-400/[0.06] px-3 py-2 text-sm text-red-100">
                {error}
              </p>
            ) : null}

            <button
              type="button"
              disabled={isPending}
              onClick={createConnection}
              className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#C6FF32] px-4 text-sm font-black text-[#030608] disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Plus className="h-4 w-4" />
              {isPending ? "Saving…" : "Add connection"}
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {graph.connections.length ? (
            graph.connections.map((connection) => (
              <article
                key={connection.edge.edgeId}
                className="rounded-[20px] border border-white/10 bg-black/20 p-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/admin/hsakaa/people/${connection.person.personId}`}
                        className="font-black text-white hover:text-[#C6FF32]"
                      >
                        {connection.person.name}
                      </Link>
                      <span className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] font-bold text-white/45">
                        {relationshipLabel(connection.edge.kind)}
                      </span>
                      <span className="rounded-full border border-white/10 px-2 py-0.5 text-[11px] font-bold text-white/35">
                        {connection.direction}
                      </span>
                      {connection.edge.isDerived ? (
                        <span className="rounded-full border border-[#C6FF32]/25 bg-[#C6FF32]/[0.06] px-2 py-0.5 text-[11px] font-black text-[#C6FF32]">
                          Derived from 5D
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-1 text-sm text-white/45">
                      {[connection.person.roleTitle, connection.person.organizationName]
                        .filter(Boolean)
                        .join(" · ") || "Saved person"}
                    </p>

                    {connection.edge.label ? (
                      <p className="mt-3 text-sm font-semibold text-white/75">
                        {connection.edge.label}
                      </p>
                    ) : null}

                    {connection.edge.contexts.length ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {connection.edge.contexts.map((context) => (
                          <span
                            key={context}
                            className="rounded-full bg-white/[0.05] px-2.5 py-1 text-xs font-bold text-white/50"
                          >
                            {context}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>

                  {!connection.edge.isDerived ? (
                    <button
                      type="button"
                      disabled={isPending}
                      onClick={() => removeConnection(connection.edge.edgeId)}
                      className="rounded-xl border border-white/10 p-2 text-white/35 transition hover:border-red-400/30 hover:text-red-200 disabled:opacity-40"
                      aria-label="Remove connection"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              </article>
            ))
          ) : (
            <div className="rounded-[20px] border border-dashed border-white/10 p-8 text-center">
              <p className="font-black text-white">No graph connections yet</p>
              <p className="mt-2 text-sm leading-6 text-white/40">
                Add an explicit connection, or set an introducer in Relationship
                Context to create a deterministic derived edge.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

function SummaryCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-[16px] border border-white/10 bg-black/20 px-4 py-3">
      <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/35">
        {label}
      </p>
      <p className="mt-1 text-2xl font-black text-white">{value}</p>
    </div>
  );
}
