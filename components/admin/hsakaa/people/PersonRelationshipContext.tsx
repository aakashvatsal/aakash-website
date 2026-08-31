"use client";

import {
  CircleAlert,
  Clock3,
  Link2,
  MessageSquareText,
  Save,
  UserRoundSearch,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

import { updatePersonRelationshipContext } from "@/lib/api/memory-people";
import type {
  MemoryPerson,
  PersonRelationshipContext as PersonRelationshipContextData,
} from "@/types/hsakaa";

type PersonRelationshipContextProps = {
  personId: string;
  displayName: string;
  initialContext: PersonRelationshipContextData;
  initialPeople: MemoryPerson[];
};

const inputClassName =
  "min-h-11 w-full rounded-[14px] border border-white/10 bg-black/20 px-4 text-sm font-bold text-white outline-none transition placeholder:text-white/20 focus:border-[#C6FF32]/40";
const textareaClassName = `${inputClassName} py-3`;

function formatDate(value?: string | null) {
  if (!value) return "Not recorded";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not recorded";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatEnum(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export function PersonRelationshipContext({
  personId,
  displayName,
  initialContext,
  initialPeople,
}: PersonRelationshipContextProps) {
  const [context, setContext] = useState(initialContext);
  const [introducedByPersonId, setIntroducedByPersonId] = useState(
    initialContext.explicitContext.introducedBy?.personId ?? "",
  );
  const [howWeMet, setHowWeMet] = useState(
    initialContext.explicitContext.howWeMet ?? "",
  );
  const [connectionContexts, setConnectionContexts] = useState(
    initialContext.explicitContext.connectionContexts.join(", "),
  );
  const [cadenceDays, setCadenceDays] = useState(
    initialContext.explicitContext.preferredContactCadenceDays?.toString() ?? "",
  );
  const [relationshipNotes, setRelationshipNotes] = useState(
    initialContext.explicitContext.relationshipNotes ?? "",
  );
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const introducerOptions = useMemo(
    () =>
      initialPeople
        .filter((person) => person._id !== personId && !person.isArchived && person.isActive)
        .sort((a, b) =>
          (a.preferredName ?? a.name).localeCompare(b.preferredName ?? b.name),
        ),
    [initialPeople, personId],
  );

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setSaved(false);
    setError("");

    const parsedCadence = cadenceDays.trim() ? Number(cadenceDays) : null;
    if (
      parsedCadence !== null &&
      (!Number.isInteger(parsedCadence) || parsedCadence < 1 || parsedCadence > 3650)
    ) {
      setError("Contact cadence must be a whole number between 1 and 3650 days.");
      setSaving(false);
      return;
    }

    try {
      const updated = await updatePersonRelationshipContext(personId, {
        introducedByPersonId: introducedByPersonId || null,
        howWeMet: howWeMet.trim() || null,
        connectionContexts: connectionContexts
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
        preferredContactCadenceDays: parsedCadence,
        relationshipNotes: relationshipNotes.trim() || null,
      });
      setContext(updated);
      setConnectionContexts(updated.explicitContext.connectionContexts.join(", "));
      setSaved(true);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to save relationship context.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-[24px] border border-white/10 bg-white/[0.025]">
      <div className="border-b border-white/10 p-5 sm:p-6">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#C6FF32]">
          Phase 5D · Relationship context
        </p>
        <h2 className="mt-2 text-xl font-black tracking-[-0.03em] text-white">
          Context with {displayName}
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/40">
          Explicit relationship facts stay editable; last contact, recent discussions
          and commitments are derived from the timeline and open loops instead of being
          guessed or duplicated.
        </p>
      </div>

      <div className="space-y-6 p-5 sm:p-6">
        {error ? (
          <div className="flex items-start gap-3 rounded-[18px] border border-red-300/20 bg-red-300/[0.06] p-4 text-sm text-red-100">
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            label="Last contact"
            value={formatDate(context.contact.lastContactAt)}
          />
          <SummaryCard
            label="Contact gap"
            value={
              context.contact.hasRecordedContact
                ? `${context.contact.daysSinceLastContact ?? 0} days`
                : "Never recorded"
            }
            attention={context.contact.isDormant}
          />
          <SummaryCard
            label="Open commitments"
            value={context.commitments.length}
          />
          <SummaryCard
            label="Cadence"
            value={
              context.contact.preferredContactCadenceDays
                ? `${context.contact.preferredContactCadenceDays} days`
                : "Not set"
            }
            attention={context.contact.isCadenceOverdue}
          />
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 rounded-[20px] border border-white/10 bg-black/10 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="font-black text-white">Explicit relationship context</h3>
              <p className="mt-1 text-xs leading-5 text-white/30">
                These are stable facts you control and HSAKAA can cite deterministically.
              </p>
            </div>
            {saved ? (
              <span className="rounded-full border border-[#C6FF32]/20 bg-[#C6FF32]/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#C6FF32]">
                Saved
              </span>
            ) : null}
          </div>

          <div className="grid gap-5 lg:grid-cols-2">
            <div>
              <FieldLabel>Introduced by</FieldLabel>
              <select
                value={introducedByPersonId}
                onChange={(event) => setIntroducedByPersonId(event.target.value)}
                className={inputClassName}
              >
                <option value="">No introducer recorded</option>
                {introducerOptions.map((person) => (
                  <option key={person._id} value={person._id}>
                    {person.preferredName ?? person.name}
                    {person.organizationName ? ` · ${person.organizationName}` : ""}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <FieldLabel>Preferred contact cadence</FieldLabel>
              <input
                type="number"
                min={1}
                max={3650}
                value={cadenceDays}
                onChange={(event) => setCadenceDays(event.target.value)}
                placeholder="e.g. 30 days"
                className={inputClassName}
              />
            </div>
          </div>

          <div>
            <FieldLabel>Connection contexts</FieldLabel>
            <input
              value={connectionContexts}
              onChange={(event) => setConnectionContexts(event.target.value)}
              placeholder="8lete, Frayto, school, family friends"
              className={inputClassName}
            />
            <p className="mt-2 text-xs text-white/25">Comma-separated stable contexts.</p>
          </div>

          <div>
            <FieldLabel>How we met</FieldLabel>
            <textarea
              value={howWeMet}
              onChange={(event) => setHowWeMet(event.target.value)}
              rows={3}
              placeholder="How this relationship started..."
              className={textareaClassName}
            />
          </div>

          <div>
            <FieldLabel>Relationship notes</FieldLabel>
            <textarea
              value={relationshipNotes}
              onChange={(event) => setRelationshipNotes(event.target.value)}
              rows={4}
              placeholder="Stable context worth remembering about the relationship itself..."
              className={textareaClassName}
            />
          </div>

          <button
            type="submit"
            disabled={saving}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] bg-[#C6FF32] px-5 text-sm font-black text-[#030608] disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save relationship context"}
          </button>
        </form>

        <div className="grid gap-5 xl:grid-cols-2">
          <div className="rounded-[20px] border border-white/10 bg-black/10 p-5">
            <div className="flex items-center gap-2">
              <MessageSquareText className="h-4 w-4 text-[#C6FF32]" />
              <h3 className="font-black text-white">Recent discussions</h3>
            </div>
            <p className="mt-1 text-xs text-white/30">
              Latest three explicitly recorded interactions.
            </p>

            {context.recentDiscussions.length ? (
              <div className="mt-4 space-y-3">
                {context.recentDiscussions.map((discussion) => (
                  <article
                    key={discussion.interactionId}
                    className="rounded-[16px] border border-white/10 bg-white/[0.025] p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-wider text-white/30">
                      <span>{formatEnum(discussion.type)}</span>
                      <span>·</span>
                      <span>{formatDate(discussion.occurredAt)}</span>
                    </div>
                    <p className="mt-2 text-sm leading-6 text-white/65">
                      {discussion.summary}
                    </p>
                    {discussion.topics.length ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {discussion.topics.map((topic) => (
                          <span
                            key={topic}
                            className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-bold text-white/45"
                          >
                            {topic}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            ) : (
              <p className="mt-4 rounded-[16px] border border-dashed border-white/10 p-5 text-sm text-white/30">
                No interactions recorded yet.
              </p>
            )}
          </div>

          <div className="space-y-5">
            <div className="rounded-[20px] border border-white/10 bg-black/10 p-5">
              <div className="flex items-center gap-2">
                <UserRoundSearch className="h-4 w-4 text-[#C6FF32]" />
                <h3 className="font-black text-white">Relationship provenance</h3>
              </div>
              <div className="mt-4 grid gap-3 sm:grid-cols-2">
                <MiniFact
                  label="Introduced by"
                  value={context.explicitContext.introducedBy?.name ?? "Not recorded"}
                />
                <MiniFact
                  label="Contact source"
                  value={formatEnum(context.contact.lastContactSource)}
                />
                <MiniFact
                  label="Known since"
                  value={formatDate(context.contact.knownSinceAt)}
                />
                <MiniFact
                  label="Known for"
                  value={
                    context.contact.daysSinceKnown === null
                      ? "Unknown"
                      : `${context.contact.daysSinceKnown} days`
                  }
                />
              </div>
              {context.explicitContext.howWeMet ? (
                <p className="mt-4 text-sm leading-6 text-white/55">
                  {context.explicitContext.howWeMet}
                </p>
              ) : null}
            </div>

            <div className="rounded-[20px] border border-white/10 bg-black/10 p-5">
              <div className="flex items-center gap-2">
                <Link2 className="h-4 w-4 text-[#C6FF32]" />
                <h3 className="font-black text-white">Open commitments</h3>
              </div>
              {context.commitments.length ? (
                <div className="mt-4 space-y-3">
                  {context.commitments.map((commitment) => (
                    <div
                      key={commitment._id}
                      className="rounded-[16px] border border-white/10 bg-white/[0.025] p-4"
                    >
                      <p className="text-[10px] font-black uppercase tracking-wider text-[#C6FF32]">
                        {formatEnum(commitment.kind)}
                      </p>
                      <p className="mt-2 text-sm font-bold text-white/65">
                        {commitment.title}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-4 text-sm text-white/30">No open promises recorded.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 text-[10px] font-black uppercase tracking-[0.14em] text-white/30">
      {children}
    </p>
  );
}

function SummaryCard({
  label,
  value,
  attention = false,
}: {
  label: string;
  value: React.ReactNode;
  attention?: boolean;
}) {
  return (
    <div className="rounded-[18px] border border-white/10 bg-black/10 p-4">
      <div className="flex items-center gap-2 text-white/25">
        <Clock3 className="h-3.5 w-3.5" />
        <p className="text-[10px] font-black uppercase tracking-[0.15em]">{label}</p>
      </div>
      <div className={`mt-2 text-sm font-black ${attention ? "text-amber-200" : "text-white"}`}>
        {value}
      </div>
    </div>
  );
}

function MiniFact({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[16px] border border-white/10 bg-white/[0.025] p-4">
      <p className="text-[10px] font-black uppercase tracking-wider text-white/25">
        {label}
      </p>
      <p className="mt-2 text-sm font-bold text-white/60">{value}</p>
    </div>
  );
}
