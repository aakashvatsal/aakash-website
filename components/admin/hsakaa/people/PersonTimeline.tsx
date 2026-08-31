"use client";

import Link from "next/link";
import {
  BookOpenText,
  Brain,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  MessageSquareText,
  Plus,
  Sparkles,
  Target,
  UserRound,
} from "lucide-react";
import { useMemo, useState } from "react";

import {
  getPersonTimeline,
  recordPersonInteraction,
} from "@/lib/api/memory-people";
import {
  PersonInteractionChannel,
  PersonInteractionDirection,
  PersonInteractionType,
  type Memory,
  type MemoryPerson,
  type PersonTimeline as PersonTimelineData,
  type PersonTimelineEventType,
} from "@/types/hsakaa";

type PersonTimelineProps = {
  personId: string;
  displayName: string;
  initialTimeline: PersonTimelineData;
  initialPeople: MemoryPerson[];
  initialMemories: Memory[];
};

const timelineTypes: Array<{
  value: PersonTimelineEventType;
  label: string;
}> = [
  { value: "interaction", label: "Interactions" },
  { value: "memory", label: "Memories" },
  { value: "commitment", label: "Commitments" },
  { value: "journal", label: "Journal" },
  { value: "task", label: "Tasks" },
  { value: "media", label: "Media" },
  { value: "decision", label: "Decisions" },
];

function enumLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function eventIcon(type: PersonTimelineEventType) {
  switch (type) {
    case "interaction":
      return MessageSquareText;
    case "commitment":
      return CheckCircle2;
    case "journal":
      return BookOpenText;
    case "task":
      return Target;
    case "media":
      return FileText;
    case "decision":
      return Sparkles;
    case "memory":
    default:
      return Brain;
  }
}

function nowForInput() {
  const date = new Date();
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

export function PersonTimeline({
  personId,
  displayName,
  initialTimeline,
  initialPeople,
  initialMemories,
}: PersonTimelineProps) {
  const [timeline, setTimeline] = useState(initialTimeline);
  const [activeTypes, setActiveTypes] = useState<Set<PersonTimelineEventType>>(
    new Set(timelineTypes.map((item) => item.value)),
  );
  const [showRecorder, setShowRecorder] = useState(false);
  const [type, setType] = useState(PersonInteractionType.MEETING);
  const [channel, setChannel] = useState(PersonInteractionChannel.IN_PERSON);
  const [direction, setDirection] = useState(PersonInteractionDirection.MUTUAL);
  const [occurredAt, setOccurredAt] = useState(nowForInput());
  const [durationMinutes, setDurationMinutes] = useState("");
  const [summary, setSummary] = useState("");
  const [tags, setTags] = useState("");
  const [participantIds, setParticipantIds] = useState<string[]>([]);
  const [linkedMemoryId, setLinkedMemoryId] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const events = useMemo(
    () => timeline.events.filter((event) => activeTypes.has(event.type)),
    [activeTypes, timeline.events],
  );

  const otherPeople = useMemo(
    () =>
      initialPeople
        .filter((person) => person._id !== personId && person.isActive)
        .sort((left, right) =>
          (left.preferredName ?? left.name).localeCompare(
            right.preferredName ?? right.name,
          ),
        ),
    [initialPeople, personId],
  );

  const linkableMemories = useMemo(
    () =>
      initialMemories.filter(
        (memory) => memory.isActive && memory.lifecycleStatus !== "forgotten",
      ),
    [initialMemories],
  );

  function toggleType(value: PersonTimelineEventType) {
    setActiveTypes((current) => {
      const next = new Set(current);
      if (next.has(value)) {
        next.delete(value);
      } else {
        next.add(value);
      }
      return next;
    });
  }

  function toggleParticipant(value: string) {
    setParticipantIds((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value],
    );
  }

  async function refreshTimeline() {
    const updated = await getPersonTimeline(personId, { limit: 200 });
    setTimeline(updated);
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!summary.trim()) {
      setError("Add a short interaction summary.");
      return;
    }

    setSaving(true);
    setError("");
    try {
      await recordPersonInteraction(personId, {
        type,
        channel,
        direction,
        occurredAt: new Date(occurredAt).toISOString(),
        ...(durationMinutes.trim()
          ? { durationMinutes: Number(durationMinutes) }
          : {}),
        summary: summary.trim(),
        participantIds,
        tags: tags
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
        ...(linkedMemoryId ? { linkedMemoryId } : {}),
      });
      await refreshTimeline();
      setSummary("");
      setDurationMinutes("");
      setTags("");
      setParticipantIds([]);
      setLinkedMemoryId("");
      setOccurredAt(nowForInput());
      setShowRecorder(false);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to record interaction.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <section className="rounded-[24px] border border-white/10 bg-white/[0.025]">
      <div className="flex flex-col gap-4 border-b border-white/10 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.2em] text-[#C6FF32]">
            Relationship history
          </p>
          <h2 className="mt-2 text-xl font-black tracking-[-0.03em] text-white">
            Timeline
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/40">
            Only events connected through exact Person IDs are shown. A name appearing
            in free text never attaches an event to {displayName}.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowRecorder((current) => !current)}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] bg-[#C6FF32] px-4 text-sm font-black text-[#030608]"
        >
          <Plus className="h-4 w-4" />
          Record interaction
        </button>
      </div>

      {showRecorder ? (
        <form onSubmit={handleSubmit} className="border-b border-white/10 p-5 sm:p-6">
          <div className="grid gap-4 md:grid-cols-3">
            <label className="space-y-2 text-sm font-bold text-white/60">
              Type
              <select
                value={type}
                onChange={(event) =>
                  setType(event.target.value as PersonInteractionType)
                }
                className="w-full rounded-[14px] border border-white/10 bg-[#080b0d] px-3 py-3 text-white"
              >
                {Object.values(PersonInteractionType).map((value) => (
                  <option key={value} value={value}>
                    {enumLabel(value)}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-sm font-bold text-white/60">
              Channel
              <select
                value={channel}
                onChange={(event) =>
                  setChannel(event.target.value as PersonInteractionChannel)
                }
                className="w-full rounded-[14px] border border-white/10 bg-[#080b0d] px-3 py-3 text-white"
              >
                {Object.values(PersonInteractionChannel).map((value) => (
                  <option key={value} value={value}>
                    {enumLabel(value)}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-sm font-bold text-white/60">
              Direction
              <select
                value={direction}
                onChange={(event) =>
                  setDirection(event.target.value as PersonInteractionDirection)
                }
                className="w-full rounded-[14px] border border-white/10 bg-[#080b0d] px-3 py-3 text-white"
              >
                {Object.values(PersonInteractionDirection).map((value) => (
                  <option key={value} value={value}>
                    {enumLabel(value)}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-sm font-bold text-white/60">
              When
              <input
                type="datetime-local"
                value={occurredAt}
                onChange={(event) => setOccurredAt(event.target.value)}
                className="w-full rounded-[14px] border border-white/10 bg-[#080b0d] px-3 py-3 text-white"
                required
              />
            </label>

            <label className="space-y-2 text-sm font-bold text-white/60">
              Duration (minutes)
              <input
                type="number"
                min={0}
                max={1440}
                value={durationMinutes}
                onChange={(event) => setDurationMinutes(event.target.value)}
                className="w-full rounded-[14px] border border-white/10 bg-[#080b0d] px-3 py-3 text-white"
              />
            </label>

            <label className="space-y-2 text-sm font-bold text-white/60">
              Linked memory
              <select
                value={linkedMemoryId}
                onChange={(event) => setLinkedMemoryId(event.target.value)}
                className="w-full rounded-[14px] border border-white/10 bg-[#080b0d] px-3 py-3 text-white"
              >
                <option value="">None</option>
                {linkableMemories.map((memory) => (
                  <option key={memory._id} value={memory._id}>
                    {memory.content.slice(0, 90)}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="mt-4 block space-y-2 text-sm font-bold text-white/60">
            Summary
            <textarea
              value={summary}
              onChange={(event) => setSummary(event.target.value)}
              rows={4}
              placeholder={`What happened with ${displayName}?`}
              className="w-full rounded-[14px] border border-white/10 bg-[#080b0d] px-3 py-3 text-white placeholder:text-white/20"
              required
            />
          </label>

          <div className="mt-4 grid gap-4 lg:grid-cols-2">
            <label className="space-y-2 text-sm font-bold text-white/60">
              Tags
              <input
                value={tags}
                onChange={(event) => setTags(event.target.value)}
                placeholder="follow-up, pricing, personal"
                className="w-full rounded-[14px] border border-white/10 bg-[#080b0d] px-3 py-3 text-white placeholder:text-white/20"
              />
            </label>

            <div>
              <p className="text-sm font-bold text-white/60">Other participants</p>
              <div className="mt-2 max-h-32 space-y-2 overflow-auto rounded-[14px] border border-white/10 bg-black/10 p-3">
                {otherPeople.length ? (
                  otherPeople.map((person) => {
                    const name = person.preferredName ?? person.name;
                    return (
                      <label
                        key={person._id}
                        className="flex cursor-pointer items-center gap-2 text-sm text-white/60"
                      >
                        <input
                          type="checkbox"
                          checked={participantIds.includes(person._id)}
                          onChange={() => toggleParticipant(person._id)}
                        />
                        {name}
                      </label>
                    );
                  })
                ) : (
                  <p className="text-sm text-white/30">No other saved people.</p>
                )}
              </div>
            </div>
          </div>

          {error ? (
            <p className="mt-4 text-sm font-bold text-red-200">{error}</p>
          ) : null}

          <div className="mt-5 flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="rounded-[14px] bg-[#C6FF32] px-5 py-3 text-sm font-black text-[#030608] disabled:opacity-50"
            >
              {saving ? "Saving…" : "Save interaction"}
            </button>
            <button
              type="button"
              onClick={() => setShowRecorder(false)}
              className="rounded-[14px] border border-white/10 px-5 py-3 text-sm font-black text-white/60"
            >
              Cancel
            </button>
          </div>
        </form>
      ) : null}

      <div className="p-5 sm:p-6">
        <div className="flex flex-wrap gap-2">
          {timelineTypes.map((item) => {
            const active = activeTypes.has(item.value);
            return (
              <button
                key={item.value}
                type="button"
                onClick={() => toggleType(item.value)}
                className={`rounded-full border px-3 py-2 text-xs font-black transition ${
                  active
                    ? "border-[#C6FF32]/30 bg-[#C6FF32]/10 text-[#C6FF32]"
                    : "border-white/10 text-white/30"
                }`}
              >
                {item.label} · {timeline.counts[item.value] ?? 0}
              </button>
            );
          })}
        </div>

        <div className="mt-6 space-y-3">
          {events.length ? (
            events.map((event) => {
              const Icon = eventIcon(event.type);
              const content = (
                <div className="rounded-[18px] border border-white/10 bg-black/10 p-4 transition hover:border-white/20">
                  <div className="flex items-start gap-3">
                    <div className="grid h-10 w-10 shrink-0 place-items-center rounded-[13px] border border-white/10 bg-white/[0.04]">
                      <Icon className="h-4 w-4 text-[#C6FF32]" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-[10px] font-black uppercase tracking-[0.14em] text-[#C6FF32]">
                          {enumLabel(event.type)}
                        </span>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-white/25">
                          {enumLabel(event.attribution)}
                        </span>
                      </div>
                      <h3 className="mt-1 font-black text-white">{event.title}</h3>
                      {event.summary ? (
                        <p className="mt-2 line-clamp-3 text-sm leading-6 text-white/45">
                          {event.summary}
                        </p>
                      ) : null}
                      <div className="mt-3 flex flex-wrap items-center gap-3 text-xs font-bold text-white/25">
                        <span className="inline-flex items-center gap-1.5">
                          <Clock3 className="h-3.5 w-3.5" />
                          {formatDate(event.occurredAt)}
                        </span>
                        {event.personRelation ? (
                          <span className="inline-flex items-center gap-1.5">
                            <UserRound className="h-3.5 w-3.5" />
                            {enumLabel(event.personRelation)}
                          </span>
                        ) : null}
                      </div>
                    </div>
                  </div>
                </div>
              );
              return event.href ? (
                <Link key={event.id} href={event.href}>
                  {content}
                </Link>
              ) : (
                <div key={event.id}>{content}</div>
              );
            })
          ) : (
            <div className="rounded-[18px] border border-dashed border-white/10 p-8 text-center">
              <CalendarDays className="mx-auto h-6 w-6 text-white/20" />
              <p className="mt-3 text-sm font-bold text-white/35">
                No relationship events match these filters yet.
              </p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
