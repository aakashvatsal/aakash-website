"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useMemo, useState } from "react";
import {
  ArchiveRestore,
  BrainCircuit,
  Check,
  Clock3,
  Inbox,
  Loader2,
  Plus,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

import {
  acceptMemoryInboxItem,
  captureMemoryInboxItem,
  rejectMemoryInboxItem,
} from "@/lib/api/memory";
import {
  MEMORY_TYPE_OPTIONS,
  getMemoryTypeDescription,
  getMemoryTypeLabel,
} from "@/lib/memory-types";
import {
  MemoryAccessLevel,
  MemoryCaptureOrigin,
  MemoryDurability,
  MemoryEntityType,
  MemoryInboxStatus,
  MemoryPersonRelation,
  MemoryScope,
  MemorySensitivity,
  MemorySource,
  MemoryType,
  MemoryVerificationStatus,
  type MemoryInboxItem,
  type MemoryPerson,
} from "@/types/hsakaa";

type MemoryInboxProps = {
  initialItems: MemoryInboxItem[];
  initialPendingCount: number;
  initialError?: string;
  people?: MemoryPerson[];
  initialPersonId?: string;
};

function formatEnum(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatDate(value?: string) {
  if (!value) return "Not specified";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Not specified";

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function splitLabels(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

export function MemoryInbox({
  initialItems = [],
  initialPendingCount = 0,
  initialError = "",
  people = [],
  initialPersonId = "",
}: MemoryInboxProps) {
  const router = useRouter();
  const [items, setItems] = useState(
    initialItems.filter((item) => item.status === MemoryInboxStatus.PENDING),
  );
  const [pendingCount, setPendingCount] = useState(initialPendingCount);
  const [content, setContent] = useState("");
  const [scope, setScope] = useState<MemoryScope>(
    initialPersonId ? MemoryScope.INDIVIDUAL : MemoryScope.GENERAL,
  );
  const [individualPersonId, setIndividualPersonId] = useState(initialPersonId);
  const [groupPersonIds, setGroupPersonIds] = useState<string[]>([]);
  const [type, setType] = useState<MemoryType>(MemoryType.FACT);
  const [durability, setDurability] = useState<MemoryDurability>(
    MemoryDurability.DURABLE,
  );
  const [sensitivity, setSensitivity] = useState<MemorySensitivity>(
    MemorySensitivity.PERSONAL,
  );
  const [categories, setCategories] = useState("");
  const [tags, setTags] = useState("");
  const [entities, setEntities] = useState("");
  const [happenedAt, setHappenedAt] = useState("");
  const [proposalReason, setProposalReason] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [actionId, setActionId] = useState<string | null>(null);
  const [error, setError] = useState(initialError);

  const hsakaaCount = useMemo(
    () =>
      items.filter((item) => item.captureOrigin === MemoryCaptureOrigin.HSAKAA)
        .length,
    [items],
  );

  async function handleCapture(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!content.trim()) return;

    if (scope === MemoryScope.INDIVIDUAL && !individualPersonId) {
      setError("Choose the person this memory is about.");
      return;
    }

    if (scope === MemoryScope.GROUP && groupPersonIds.length < 2) {
      setError("Choose at least two people for a group memory.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const personLinks =
        scope === MemoryScope.INDIVIDUAL
          ? [
              {
                personId: individualPersonId,
                relation: MemoryPersonRelation.PRIMARY_SUBJECT,
              },
            ]
          : scope === MemoryScope.GROUP
            ? groupPersonIds.map((personId) => ({
                personId,
                relation: MemoryPersonRelation.PARTICIPANT,
              }))
            : [];

      const created = await captureMemoryInboxItem({
        content: content.trim(),
        scope,
        ...(scope === MemoryScope.INDIVIDUAL
          ? { personId: individualPersonId }
          : {}),
        personLinks,
        type,
        source: MemorySource.MANUAL,
        captureOrigin: MemoryCaptureOrigin.MANUAL,
        durability,
        sensitivity,
        accessLevel: MemoryAccessLevel.OWNER_ONLY,
        verificationStatus: MemoryVerificationStatus.UNVERIFIED,
        categories: splitLabels(categories),
        tags: splitLabels(tags),
        entities: splitLabels(entities).map((name) => ({
          type: MemoryEntityType.OTHER,
          name,
        })),
        ...(happenedAt
          ? { happenedAt: new Date(happenedAt).toISOString() }
          : {}),
        ...(proposalReason.trim()
          ? { proposalReason: proposalReason.trim() }
          : {}),
      });

      setItems((current) => {
        if (current.some((item) => item._id === created._id)) return current;
        return [created, ...current];
      });
      setPendingCount((current) => current + 1);
      setContent("");
      setScope(MemoryScope.GENERAL);
      setIndividualPersonId("");
      setGroupPersonIds([]);
      setCategories("");
      setTags("");
      setEntities("");
      setHappenedAt("");
      setProposalReason("");
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to capture memory candidate.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleAccept(item: MemoryInboxItem) {
    setActionId(item._id);
    setError("");

    try {
      await acceptMemoryInboxItem(item._id);
      setItems((current) =>
        current.filter((candidate) => candidate._id !== item._id),
      );
      setPendingCount((current) => Math.max(current - 1, 0));
      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to accept memory candidate.",
      );
    } finally {
      setActionId(null);
    }
  }

  async function handleReject(item: MemoryInboxItem) {
    setActionId(item._id);
    setError("");

    try {
      await rejectMemoryInboxItem(item._id);
      setItems((current) =>
        current.filter((candidate) => candidate._id !== item._id),
      );
      setPendingCount((current) => Math.max(current - 1, 0));
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to reject memory candidate.",
      );
    } finally {
      setActionId(null);
    }
  }

  return (
    <section
      id="memory-inbox"
      className="scroll-mt-24 overflow-hidden rounded-[28px] border border-white/10 bg-[#080d10]"
    >
      <div className="border-b border-white/10 px-5 py-5 sm:px-7">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.22em] text-[#C6FF32]">
              <Inbox className="h-4 w-4" />
              Phase 4A · Memory Inbox
            </div>
            <h2 className="mt-3 text-2xl font-black text-white">
              Capture first. Remember deliberately.
            </h2>
            <p className="mt-2 text-sm leading-6 text-white/55">
              Manual captures and HSAKAA suggestions stay outside active recall
              until you accept them. Sensitive or durable information only
              becomes memory after your explicit review.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-2 sm:min-w-[260px]">
            <div className="rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3">
              <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-white/40">
                Pending
              </div>
              <div className="mt-1 text-2xl font-black text-white">
                {pendingCount}
              </div>
            </div>
            <div className="rounded-2xl border border-[#C6FF32]/20 bg-[#C6FF32]/[0.04] px-4 py-3">
              <div className="text-[11px] font-bold uppercase tracking-[0.16em] text-[#C6FF32]/70">
                HSAKAA
              </div>
              <div className="mt-1 text-2xl font-black text-[#C6FF32]">
                {hsakaaCount}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-0 xl:grid-cols-[0.9fr_1.1fr]">
        <form
          onSubmit={handleCapture}
          className="border-b border-white/10 p-5 sm:p-7 xl:border-b-0 xl:border-r"
        >
          <div className="flex items-center gap-2 text-sm font-black text-white">
            <Plus className="h-4 w-4 text-[#C6FF32]" />
            Quick capture
          </div>

          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            rows={4}
            placeholder="What should HSAKAA potentially remember?"
            className="mt-4 w-full resize-none rounded-2xl border border-white/10 bg-[#030608] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#C6FF32]/40"
          />

          <div className="mt-4 rounded-2xl border border-white/10 bg-black/15 p-4">
            <div className="text-xs font-black uppercase tracking-[0.14em] text-white/40">
              About
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {[
                [MemoryScope.GENERAL, "General"],
                [MemoryScope.INDIVIDUAL, "Person"],
                [MemoryScope.GROUP, "Group"],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => {
                    setScope(value as MemoryScope);
                    setError("");
                  }}
                  className={`min-h-10 rounded-xl border px-3 text-xs font-black transition ${
                    scope === value
                      ? "border-[#C6FF32]/40 bg-[#C6FF32]/10 text-[#C6FF32]"
                      : "border-white/10 text-white/45 hover:bg-white/5"
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {scope === MemoryScope.INDIVIDUAL ? (
              <label className="mt-3 block space-y-1.5 text-xs font-bold text-white/50">
                Primary person
                <select
                  value={individualPersonId}
                  onChange={(event) =>
                    setIndividualPersonId(event.target.value)
                  }
                  className="w-full rounded-xl border border-white/10 bg-[#030608] px-3 py-2.5 text-sm text-white outline-none"
                >
                  <option value="">Select saved person</option>
                  {people.map((person) => (
                    <option key={person._id} value={person._id}>
                      {person.preferredName ?? person.name}
                    </option>
                  ))}
                </select>
              </label>
            ) : null}

            {scope === MemoryScope.GROUP ? (
              <div className="mt-3">
                <div className="text-xs font-bold text-white/50">
                  Participants · choose at least two
                </div>
                <div className="mt-2 flex max-h-36 flex-wrap gap-2 overflow-y-auto">
                  {people.map((person) => {
                    const selected = groupPersonIds.includes(person._id);
                    return (
                      <button
                        key={person._id}
                        type="button"
                        onClick={() =>
                          setGroupPersonIds((current) =>
                            selected
                              ? current.filter((id) => id !== person._id)
                              : [...current, person._id],
                          )
                        }
                        className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
                          selected
                            ? "border-[#C6FF32]/40 bg-[#C6FF32]/10 text-[#C6FF32]"
                            : "border-white/10 text-white/45"
                        }`}
                      >
                        {person.preferredName ?? person.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : null}

            {scope === MemoryScope.GENERAL ? (
              <p className="mt-3 text-xs leading-5 text-white/35">
                General memories are not attributed to any individual.
                Mention/source links can still be stored separately without
                turning them into that person&apos;s memory.
              </p>
            ) : null}
          </div>

          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            <label className="space-y-1.5 text-xs font-bold text-white/50">
              Type
              <select
                value={type}
                onChange={(event) => setType(event.target.value as MemoryType)}
                className="w-full rounded-xl border border-white/10 bg-[#030608] px-3 py-2.5 text-sm text-white outline-none"
              >
                {MEMORY_TYPE_OPTIONS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <span className="block text-[11px] font-medium leading-4 text-white/30">
                {getMemoryTypeDescription(type)}
              </span>
            </label>

            <label className="space-y-1.5 text-xs font-bold text-white/50">
              Durability
              <select
                value={durability}
                onChange={(event) =>
                  setDurability(event.target.value as MemoryDurability)
                }
                className="w-full rounded-xl border border-white/10 bg-[#030608] px-3 py-2.5 text-sm text-white outline-none"
              >
                <option value={MemoryDurability.DURABLE}>Durable</option>
                <option value={MemoryDurability.TEMPORARY}>
                  Temporary · 30 days
                </option>
              </select>
            </label>

            <label className="space-y-1.5 text-xs font-bold text-white/50">
              Sensitivity
              <select
                value={sensitivity}
                onChange={(event) =>
                  setSensitivity(event.target.value as MemorySensitivity)
                }
                className="w-full rounded-xl border border-white/10 bg-[#030608] px-3 py-2.5 text-sm text-white outline-none"
              >
                {Object.values(MemorySensitivity).map((value) => (
                  <option key={value} value={value}>
                    {formatEnum(value)}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-1.5 text-xs font-bold text-white/50">
              Happened at
              <input
                type="datetime-local"
                value={happenedAt}
                onChange={(event) => setHappenedAt(event.target.value)}
                className="w-full rounded-xl border border-white/10 bg-[#030608] px-3 py-2.5 text-sm text-white outline-none"
              />
            </label>
          </div>

          <div className="mt-3 grid gap-3">
            <input
              value={categories}
              onChange={(event) => setCategories(event.target.value)}
              placeholder="Categories · work, personal-os, learning"
              className="rounded-xl border border-white/10 bg-[#030608] px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/25"
            />
            <input
              value={tags}
              onChange={(event) => setTags(event.target.value)}
              placeholder="Tags · comma separated"
              className="rounded-xl border border-white/10 bg-[#030608] px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/25"
            />
            <input
              value={entities}
              onChange={(event) => setEntities(event.target.value)}
              placeholder="Entities · people, companies, projects"
              className="rounded-xl border border-white/10 bg-[#030608] px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/25"
            />
            <input
              value={proposalReason}
              onChange={(event) => setProposalReason(event.target.value)}
              placeholder="Why might this matter later? · optional"
              className="rounded-xl border border-white/10 bg-[#030608] px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/25"
            />
          </div>

          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="mt-4 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#C6FF32] px-4 text-sm font-black text-[#030608] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {submitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Inbox className="h-4 w-4" />
            )}
            Add to Memory Inbox
          </button>
        </form>

        <div className="p-5 sm:p-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 text-sm font-black text-white">
                <BrainCircuit className="h-4 w-4 text-[#C6FF32]" />
                Review queue
              </div>
              <p className="mt-1 text-xs text-white/40">
                Accept = confirmed active memory. Reject = preserved as
                reviewed, never recalled.
              </p>
            </div>
          </div>

          {error ? (
            <div className="mt-4 rounded-2xl border border-red-400/20 bg-red-400/[0.06] px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          <div className="mt-4 space-y-3">
            {items.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-white/10 px-5 py-10 text-center">
                <ShieldCheck className="mx-auto h-7 w-7 text-[#C6FF32]/70" />
                <div className="mt-3 text-sm font-black text-white">
                  Inbox clear
                </div>
                <p className="mt-1 text-xs leading-5 text-white/40">
                  Nothing enters durable HSAKAA recall without passing through
                  your review.
                </p>
              </div>
            ) : (
              items.map((item) => {
                const busy = actionId === item._id;
                const isHsakaa =
                  item.captureOrigin === MemoryCaptureOrigin.HSAKAA;

                return (
                  <article
                    key={item._id}
                    className="rounded-2xl border border-white/10 bg-white/[0.025] p-4"
                  >
                    <div className="flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.14em]">
                      <span
                        className={
                          isHsakaa
                            ? "rounded-full bg-[#C6FF32]/10 px-2 py-1 text-[#C6FF32]"
                            : "rounded-full bg-white/5 px-2 py-1 text-white/45"
                        }
                      >
                        {isHsakaa ? (
                          <span className="inline-flex items-center gap-1">
                            <Sparkles className="h-3 w-3" /> HSAKAA proposal
                          </span>
                        ) : (
                          "Manual capture"
                        )}
                      </span>
                      <span className="rounded-full bg-white/5 px-2 py-1 text-white/45">
                        {formatEnum(
                          item.scope ??
                            (item.personId
                              ? MemoryScope.INDIVIDUAL
                              : MemoryScope.GENERAL),
                        )}
                      </span>
                      <span className="rounded-full bg-white/5 px-2 py-1 text-white/45">
                        {getMemoryTypeLabel(item.type)}
                      </span>
                      <span className="rounded-full bg-white/5 px-2 py-1 text-white/45">
                        {formatEnum(item.durability)}
                      </span>
                      <span className="rounded-full bg-white/5 px-2 py-1 text-white/45">
                        {formatEnum(item.sensitivity)}
                      </span>
                    </div>

                    <p className="mt-3 text-sm font-semibold leading-6 text-white/85">
                      {item.content}
                    </p>

                    {item.proposalReason ? (
                      <p className="mt-2 rounded-xl bg-[#C6FF32]/[0.035] px-3 py-2 text-xs leading-5 text-white/50">
                        <span className="font-black text-[#C6FF32]/80">
                          Why keep it:
                        </span>{" "}
                        {item.proposalReason}
                      </p>
                    ) : null}

                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-[11px] text-white/35">
                      <span className="inline-flex items-center gap-1">
                        <Clock3 className="h-3 w-3" /> Captured{" "}
                        {formatDate(item.capturedAt)}
                      </span>
                      {item.happenedAt ? (
                        <span>Happened {formatDate(item.happenedAt)}</span>
                      ) : null}
                      <span>
                        Importance {Math.round(item.importance * 100)}%
                      </span>
                      <span>
                        Confidence {Math.round(item.confidence * 100)}%
                      </span>
                    </div>

                    {item.personLinks?.length ? (
                      <div className="mt-3 rounded-xl border border-white/10 bg-black/15 px-3 py-2 text-xs text-white/45">
                        {item.personLinks.map((link, index) => (
                          <span
                            key={`${typeof link.personId === "string" ? link.personId : link.personId._id}-${link.relation}-${index}`}
                            className="mr-3 inline-flex gap-1"
                          >
                            <span className="font-bold text-white/65">
                              {link.displayNameSnapshot ??
                                (typeof link.personId === "object"
                                  ? (link.personId.preferredName ??
                                    link.personId.name)
                                  : "Linked person")}
                            </span>
                            <span>· {formatEnum(link.relation)}</span>
                          </span>
                        ))}
                      </div>
                    ) : null}

                    {item.categories.length ||
                    item.tags.length ||
                    item.entities.length ? (
                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {item.categories.map((category) => (
                          <span
                            key={`category-${category}`}
                            className="rounded-full border border-[#C6FF32]/15 px-2 py-1 text-[10px] font-bold text-[#C6FF32]/70"
                          >
                            {category}
                          </span>
                        ))}
                        {item.tags.map((tag) => (
                          <span
                            key={`tag-${tag}`}
                            className="rounded-full border border-white/10 px-2 py-1 text-[10px] text-white/40"
                          >
                            #{tag}
                          </span>
                        ))}
                        {item.entities.map((entity, index) => (
                          <span
                            key={`${entity.type}-${entity.name}-${index}`}
                            className="rounded-full border border-white/10 px-2 py-1 text-[10px] text-white/40"
                          >
                            {entity.name}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    <div className="mt-4 grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleReject(item)}
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-black text-white/55 transition hover:bg-white/5 disabled:opacity-40"
                      >
                        {busy ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <X className="h-3.5 w-3.5" />
                        )}
                        Reject
                      </button>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() => handleAccept(item)}
                        className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl bg-[#C6FF32] px-3 text-xs font-black text-[#030608] disabled:opacity-40"
                      >
                        {busy ? (
                          <Loader2 className="h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <Check className="h-3.5 w-3.5" />
                        )}
                        Accept memory
                      </button>
                    </div>
                  </article>
                );
              })
            )}
          </div>

          <div className="mt-4 flex items-start gap-2 rounded-xl border border-white/10 bg-black/20 px-3 py-3 text-[11px] leading-5 text-white/35">
            <ArchiveRestore className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#C6FF32]/60" />
            Temporary memories default to a 30-day expiry after acceptance.
            Inbox proposals are staging records only and are excluded from
            HSAKAA memory search until accepted.
          </div>
        </div>
      </div>
    </section>
  );
}
