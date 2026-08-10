"use client";

import {
  useMemo,
  useState,
  type FormEvent,
} from "react";
import Link from "next/link";
import {
  ArrowRight,
  Brain,
  CheckCircle2,
  CircleAlert,
  Copy,
  Globe2,
  LockKeyhole,
  MessageSquareText,
  RefreshCcw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";

import {
  MemoryAccessLevel,
  PersonIdentityStatus,
  type Memory,
  type MemoryPerson,
} from "@/types/hsakaa";

type HsakaaPlaygroundProps = {
  initialMemories: Memory[];
  initialPeople: MemoryPerson[];
  initialError?: string;
};

type PlaygroundIdentity =
  | {
      type: "public";
      personId: "";
    }
  | {
      type: "person";
      personId: string;
    };

function formatEnum(value?: string) {
  if (!value) {
    return "Unknown";
  }

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

function getMemoryPersonId(
  memory: Memory,
) {
  if (!memory.personId) {
    return null;
  }

  if (typeof memory.personId === "string") {
    return memory.personId;
  }

  return memory.personId._id;
}

function getMemoryPersonName(
  memory: Memory,
) {
  if (
    memory.personId &&
    typeof memory.personId === "object"
  ) {
    return (
      memory.personId.preferredName ??
      memory.personId.name
    );
  }

  return null;
}

function tokenize(value: string) {
  return value
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, " ")
    .split(/\s+/)
    .map((token) => token.trim())
    .filter((token) => token.length > 2);
}

function calculateMemoryMatch(
  memory: Memory,
  query: string,
) {
  const queryTokens = tokenize(query);

  if (queryTokens.length === 0) {
    return 0;
  }

  const searchableText = [
    memory.content,
    memory.type,
    memory.source,
    memory.accessLevel,
    memory.sensitivity,
    memory.verificationStatus,
    ...(memory.tags ?? []),
  ]
    .join(" ")
    .toLowerCase();

  const matchedTokens = queryTokens.filter(
    (token) => searchableText.includes(token),
  );

  const keywordScore =
    matchedTokens.length / queryTokens.length;

  const importance =
    Number.isFinite(memory.importance)
      ? memory.importance
      : 0.5;

  const confidence =
    Number.isFinite(memory.confidence)
      ? memory.confidence
      : 0.5;

  return (
    keywordScore * 0.7 +
    importance * 0.2 +
    confidence * 0.1
  );
}

function isGlobalMemory(memory: Memory) {
  return !memory.personId;
}

function isPubliclyEligible(memory: Memory) {
  if (!isGlobalMemory(memory)) {
    return false;
  }

  return (
    memory.accessLevel ===
      MemoryAccessLevel.PUBLIC ||
    memory.accessLevel ===
      MemoryAccessLevel.OWNER_ONLY
  );
}

function isPersonEligible(
  memory: Memory,
  personId: string,
) {
  if (isGlobalMemory(memory)) {
    return isPubliclyEligible(memory);
  }

  if (
    getMemoryPersonId(memory) !== personId
  ) {
    return false;
  }

  return (
    memory.accessLevel ===
      MemoryAccessLevel.PERSON_PRIVATE ||
    memory.accessLevel ===
      MemoryAccessLevel.OWNER_AND_PERSON
  );
}

function MemoryMatchCard({
  memory,
  score,
}: {
  memory: Memory;
  score: number;
}) {
  const personName =
    getMemoryPersonName(memory);

  return (
    <article className="rounded-[20px] border border-white/10 bg-black/10 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-[#C6FF32]/20 bg-[#C6FF32]/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-[#C6FF32]">
            {formatEnum(memory.type)}
          </span>

          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white/45">
            {formatEnum(memory.source)}
          </span>

          <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white/45">
            {personName ?? "Global"}
          </span>
        </div>

        <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs font-black text-white/55">
          Match {Math.round(score * 100)}%
        </span>
      </div>

      <p className="mt-4 whitespace-pre-wrap text-sm font-semibold leading-6 text-white/75">
        {memory.content}
      </p>

      <div className="mt-4 grid grid-cols-2 gap-3">
        <div className="rounded-[14px] border border-white/10 bg-white/[0.025] p-3">
          <p className="text-[10px] font-black uppercase tracking-wider text-white/25">
            Importance
          </p>

          <p className="mt-1 text-sm font-black text-white">
            {Math.round(memory.importance * 100)}%
          </p>
        </div>

        <div className="rounded-[14px] border border-white/10 bg-white/[0.025] p-3">
          <p className="text-[10px] font-black uppercase tracking-wider text-white/25">
            Confidence
          </p>

          <p className="mt-1 text-sm font-black text-white">
            {Math.round(memory.confidence * 100)}%
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
        <span className="inline-flex items-center gap-2 text-xs font-bold text-white/35">
          <LockKeyhole className="h-3.5 w-3.5" />

          {formatEnum(memory.accessLevel)}
        </span>

        <Link
          href={`/admin/hsakaa/memory/${memory._id}`}
          className="inline-flex items-center gap-2 text-xs font-bold text-white/40 transition hover:text-[#C6FF32]"
        >
          View memory
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </article>
  );
}

export function HsakaaPlayground({
  initialMemories,
  initialPeople,
  initialError = "",
}: HsakaaPlaygroundProps) {
  const memories = initialMemories ?? [];
  const people = initialPeople ?? [];

  const [identity, setIdentity] =
    useState<PlaygroundIdentity>({
      type: "public",
      personId: "",
    });

  const [message, setMessage] = useState("");
  const [submittedMessage, setSubmittedMessage] =
    useState("");

  const [maximumMemories, setMaximumMemories] =
    useState(8);

  const [minimumMatch, setMinimumMatch] =
    useState(0);

  const [copied, setCopied] = useState(false);

  const selectedPerson = useMemo(
    () =>
      identity.type === "person"
        ? people.find(
            (person) =>
              person._id ===
              identity.personId,
          ) ?? null
        : null,
    [identity, people],
  );

  const eligibleMemories = useMemo(() => {
    return memories.filter((memory) => {
      if (
        memory.isArchived ||
        !memory.isActive
      ) {
        return false;
      }

      if (identity.type === "public") {
        return isPubliclyEligible(memory);
      }

      return isPersonEligible(
        memory,
        identity.personId,
      );
    });
  }, [identity, memories]);

  const matchedMemories = useMemo(() => {
    if (!submittedMessage.trim()) {
      return [];
    }

    return eligibleMemories
      .map((memory) => ({
        memory,
        score: calculateMemoryMatch(
          memory,
          submittedMessage,
        ),
      }))
      .filter(
        ({ score }) =>
          score >= minimumMatch,
      )
      .sort((first, second) => {
        if (second.score !== first.score) {
          return second.score - first.score;
        }

        if (
          second.memory.importance !==
          first.memory.importance
        ) {
          return (
            second.memory.importance -
            first.memory.importance
          );
        }

        return (
          second.memory.confidence -
          first.memory.confidence
        );
      })
      .slice(0, maximumMemories);
  }, [
    eligibleMemories,
    maximumMemories,
    minimumMatch,
    submittedMessage,
  ]);

  const contextPreview = useMemo(() => {
    if (!submittedMessage.trim()) {
      return "";
    }

    const identityDescription =
      identity.type === "public"
        ? "Public visitor"
        : `Verified person: ${
            selectedPerson?.preferredName ??
            selectedPerson?.name ??
            identity.personId
          }`;

    const memoryContext =
      matchedMemories.length > 0
        ? matchedMemories
            .map(
              ({ memory }, index) =>
                `${index + 1}. ${memory.content}`,
            )
            .join("\n")
        : "No matching memories were found.";

    return [
      "HSAKAA PLAYGROUND CONTEXT",
      "",
      `Identity: ${identityDescription}`,
      `Question: ${submittedMessage}`,
      "",
      "Retrieved memories:",
      memoryContext,
      "",
      "Instruction:",
      "Reply as Aakash using only relevant context. Never reveal whether person-specific memories exist or were unlocked.",
    ].join("\n");
  }, [
    identity,
    matchedMemories,
    selectedPerson,
    submittedMessage,
  ]);

  const globalEligibleCount =
    eligibleMemories.filter(
      (memory) => !memory.personId,
    ).length;

  const personEligibleCount =
    eligibleMemories.filter(
      (memory) => Boolean(memory.personId),
    ).length;

  function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const normalizedMessage =
      message.trim();

    if (!normalizedMessage) {
      return;
    }

    setSubmittedMessage(normalizedMessage);
    setCopied(false);
  }

  function clearPlayground() {
    setMessage("");
    setSubmittedMessage("");
    setCopied(false);
  }

  async function copyContext() {
    if (!contextPreview) {
      return;
    }

    await navigator.clipboard.writeText(
      contextPreview,
    );

    setCopied(true);

    window.setTimeout(() => {
      setCopied(false);
    }, 2000);
  }

  return (
    <div className="space-y-6">
      {initialError ? (
        <section className="rounded-[24px] border border-red-400/20 bg-red-400/[0.06] p-5">
          <div className="flex items-start gap-3">
            <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-300" />

            <div>
              <p className="font-bold text-red-100">
                Unable to load playground data
              </p>

              <p className="mt-1 text-sm leading-6 text-red-100/60">
                {initialError}
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <article className="rounded-[22px] border border-white/10 bg-white/[0.025] p-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-black uppercase tracking-wider text-white/30">
                Identity
              </p>

              <p className="mt-3 text-lg font-black text-white">
                {identity.type === "public"
                  ? "Public visitor"
                  : selectedPerson
                    ? selectedPerson.preferredName ??
                      selectedPerson.name
                    : "Selected person"}
              </p>
            </div>

            <div className="grid h-10 w-10 place-items-center rounded-xl border border-[#C6FF32]/20 bg-[#C6FF32]/10 text-[#C6FF32]">
              {identity.type === "public" ? (
                <Globe2 className="h-4 w-4" />
              ) : (
                <UserRound className="h-4 w-4" />
              )}
            </div>
          </div>
        </article>

        <article className="rounded-[22px] border border-white/10 bg-white/[0.025] p-4">
          <p className="text-xs font-black uppercase tracking-wider text-white/30">
            Eligible memories
          </p>

          <p className="mt-3 text-2xl font-black text-white">
            {eligibleMemories.length}
          </p>
        </article>

        <article className="rounded-[22px] border border-white/10 bg-white/[0.025] p-4">
          <p className="text-xs font-black uppercase tracking-wider text-white/30">
            Global context
          </p>

          <p className="mt-3 text-2xl font-black text-white">
            {globalEligibleCount}
          </p>
        </article>

        <article className="rounded-[22px] border border-white/10 bg-white/[0.025] p-4">
          <p className="text-xs font-black uppercase tracking-wider text-white/30">
            Person context
          </p>

          <p className="mt-3 text-2xl font-black text-white">
            {personEligibleCount}
          </p>
        </article>
      </section>

      <section className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
        <aside className="space-y-5">
          <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#C6FF32]">
              Simulation
            </p>

            <h2 className="mt-2 text-xl font-black tracking-[-0.03em] text-white">
              Test identity
            </h2>

            <p className="mt-2 text-sm leading-6 text-white/40">
              Select who is talking to HSAKAA.
              The playground bypasses OTP for
              admin testing only.
            </p>

            <div className="mt-5 space-y-3">
              <button
                type="button"
                onClick={() =>
                  setIdentity({
                    type: "public",
                    personId: "",
                  })
                }
                className={`flex w-full items-start gap-3 rounded-[18px] border p-4 text-left transition ${
                  identity.type === "public"
                    ? "border-[#C6FF32]/30 bg-[#C6FF32]/10"
                    : "border-white/10 bg-black/10 hover:border-white/20"
                }`}
              >
                <Globe2
                  className={`mt-0.5 h-5 w-5 shrink-0 ${
                    identity.type === "public"
                      ? "text-[#C6FF32]"
                      : "text-white/35"
                  }`}
                />

                <span>
                  <span className="block text-sm font-black text-white">
                    Public visitor
                  </span>

                  <span className="mt-1 block text-xs leading-5 text-white/35">
                    Test the normal global HSAKAA
                    experience.
                  </span>
                </span>
              </button>

              <div>
                <label className="mb-2 block text-sm font-bold text-white/60">
                  Simulate a verified person
                </label>

                <select
                  value={
                    identity.type === "person"
                      ? identity.personId
                      : ""
                  }
                  onChange={(event) => {
                    const personId =
                      event.target.value;

                    if (!personId) {
                      setIdentity({
                        type: "public",
                        personId: "",
                      });

                      return;
                    }

                    setIdentity({
                      type: "person",
                      personId,
                    });
                  }}
                  className="min-h-12 w-full rounded-[16px] border border-white/10 bg-[#030608] px-4 text-sm text-white/70 outline-none transition focus:border-[#C6FF32]/50"
                >
                  <option value="">
                    Select person
                  </option>

                  {people.map((person) => (
                    <option
                      key={person._id}
                      value={person._id}
                    >
                      {person.preferredName ??
                        person.name}
                      {" — "}
                      {formatEnum(
                        person.relationship,
                      )}
                    </option>
                  ))}
                </select>
              </div>

              {selectedPerson ? (
                <div className="rounded-[18px] border border-white/10 bg-black/10 p-4">
                  <div className="flex items-center gap-3">
                    <UserRound className="h-5 w-5 text-[#C6FF32]" />

                    <div>
                      <p className="font-bold text-white">
                        {selectedPerson.preferredName ??
                          selectedPerson.name}
                      </p>

                      <p className="mt-1 text-xs text-white/35">
                        {formatEnum(
                          selectedPerson.identityStatus,
                        )}
                      </p>
                    </div>
                  </div>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <span
                      className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                        selectedPerson.identityStatus ===
                        PersonIdentityStatus.VERIFIED
                          ? "border-[#C6FF32]/20 bg-[#C6FF32]/10 text-[#C6FF32]"
                          : "border-white/10 bg-white/[0.04] text-white/40"
                      }`}
                    >
                      {formatEnum(
                        selectedPerson.identityStatus,
                      )}
                    </span>

                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white/40">
                      {selectedPerson.memoryAccessConsentGranted
                        ? "Consent granted"
                        : "No consent"}
                    </span>

                    {selectedPerson.isBlocked ? (
                      <span className="rounded-full border border-red-300/20 bg-red-300/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-red-200">
                        Blocked
                      </span>
                    ) : null}
                  </div>
                </div>
              ) : null}
            </div>
          </section>

          <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#C6FF32]">
              Retrieval
            </p>

            <h2 className="mt-2 text-lg font-black text-white">
              Context controls
            </h2>

            <div className="mt-5 space-y-5">
              <div>
                <div className="flex items-center justify-between gap-4">
                  <label className="text-sm font-bold text-white/60">
                    Maximum memories
                  </label>

                  <span className="text-sm font-black text-[#C6FF32]">
                    {maximumMemories}
                  </span>
                </div>

                <input
                  type="range"
                  min="1"
                  max="20"
                  step="1"
                  value={maximumMemories}
                  onChange={(event) =>
                    setMaximumMemories(
                      Number(event.target.value),
                    )
                  }
                  className="mt-3 w-full accent-[#C6FF32]"
                />
              </div>

              <div>
                <div className="flex items-center justify-between gap-4">
                  <label className="text-sm font-bold text-white/60">
                    Minimum match
                  </label>

                  <span className="text-sm font-black text-[#C6FF32]">
                    {Math.round(
                      minimumMatch * 100,
                    )}
                    %
                  </span>
                </div>

                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.05"
                  value={minimumMatch}
                  onChange={(event) =>
                    setMinimumMatch(
                      Number(event.target.value),
                    )
                  }
                  className="mt-3 w-full accent-[#C6FF32]"
                />
              </div>
            </div>
          </section>
        </aside>

        <div className="space-y-6">
          <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5 sm:p-6">
            <div className="flex items-start gap-3">
              <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-[#C6FF32]/20 bg-[#C6FF32]/10 text-[#C6FF32]">
                <MessageSquareText className="h-5 w-5" />
              </div>

              <div>
                <p className="text-xs font-black uppercase tracking-[0.2em] text-[#C6FF32]">
                  Test prompt
                </p>

                <h2 className="mt-2 text-xl font-black tracking-[-0.03em] text-white">
                  Ask HSAKAA
                </h2>
              </div>
            </div>

            <form
              onSubmit={handleSubmit}
              className="mt-6"
            >
              <textarea
                value={message}
                onChange={(event) =>
                  setMessage(event.target.value)
                }
                rows={6}
                placeholder="Example: What does Aakash think about building products?"
                className="w-full resize-y rounded-[18px] border border-white/10 bg-[#030608] px-4 py-4 text-sm leading-7 text-white outline-none transition placeholder:text-white/25 focus:border-[#C6FF32]/50"
              />

              <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
                <p className="text-xs text-white/30">
                  This currently previews memory
                  retrieval. AI generation will be
                  connected to the chat API later.
                </p>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={clearPlayground}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] border border-white/10 bg-white/[0.04] px-4 text-sm font-bold text-white/50 transition hover:text-white"
                  >
                    <RefreshCcw className="h-4 w-4" />
                    Clear
                  </button>

                  <button
                    type="submit"
                    disabled={!message.trim()}
                    className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] bg-[#C6FF32] px-5 text-sm font-black text-[#030608] disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    <Search className="h-4 w-4" />
                    Retrieve context
                  </button>
                </div>
              </div>
            </form>
          </section>

          {submittedMessage ? (
            <>
              <section className="rounded-[24px] border border-white/10 bg-white/[0.025]">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 p-5">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[#C6FF32]">
                      Retrieved context
                    </p>

                    <h2 className="mt-2 text-xl font-black text-white">
                      {matchedMemories.length} memories
                    </h2>
                  </div>

                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-xs font-bold text-white/45">
                    {identity.type === "public"
                      ? "Public simulation"
                      : "Verified-person simulation"}
                  </span>
                </div>

                <div className="p-5 sm:p-6">
                  {matchedMemories.length ? (
                    <div className="space-y-4">
                      {matchedMemories.map(
                        ({ memory, score }) => (
                          <MemoryMatchCard
                            key={memory._id}
                            memory={memory}
                            score={score}
                          />
                        ),
                      )}
                    </div>
                  ) : (
                    <div className="rounded-[20px] border border-dashed border-white/10 px-5 py-12 text-center">
                      <Brain className="mx-auto h-6 w-6 text-white/30" />

                      <p className="mt-4 font-bold text-white">
                        No matching memories
                      </p>

                      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/35">
                        Lower the minimum match,
                        change the identity, or add
                        more relevant memories.
                      </p>
                    </div>
                  )}
                </div>
              </section>

              <section className="rounded-[24px] border border-white/10 bg-white/[0.025]">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 p-5">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.2em] text-[#C6FF32]">
                      Prompt preview
                    </p>

                    <h2 className="mt-2 text-xl font-black text-white">
                      AI context
                    </h2>
                  </div>

                  <button
                    type="button"
                    onClick={copyContext}
                    className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[14px] border border-white/10 bg-white/[0.04] px-4 text-sm font-bold text-white/50 transition hover:border-[#C6FF32]/30 hover:text-[#C6FF32]"
                  >
                    {copied ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}

                    {copied
                      ? "Copied"
                      : "Copy context"}
                  </button>
                </div>

                <div className="p-5 sm:p-6">
                  <pre className="max-h-[520px] overflow-auto whitespace-pre-wrap rounded-[18px] border border-white/10 bg-[#030608] p-4 font-mono text-xs leading-6 text-white/55">
                    {contextPreview}
                  </pre>
                </div>
              </section>

              <section className="rounded-[24px] border border-dashed border-[#C6FF32]/20 bg-[#C6FF32]/[0.035] p-6 text-center">
                <Sparkles className="mx-auto h-6 w-6 text-[#C6FF32]" />

                <h2 className="mt-4 text-lg font-black text-white">
                  AI response comes next
                </h2>

                <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-white/40">
                  Once the HSAKAA chat controller
                  is connected, this area will show
                  the generated answer, model,
                  latency, token usage and retrieved
                  memory references.
                </p>

                <button
                  type="button"
                  disabled
                  className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] bg-[#C6FF32] px-5 text-sm font-black text-[#030608] opacity-40"
                >
                  <Send className="h-4 w-4" />
                  Generate response
                </button>
              </section>
            </>
          ) : (
            <section className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.015] px-5 py-16 text-center">
              <Sparkles className="mx-auto h-7 w-7 text-white/25" />

              <h2 className="mt-5 text-xl font-black text-white">
                Ready to test HSAKAA
              </h2>

              <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-white/35">
                Select a public or person identity,
                enter a question and inspect the
                memories HSAKAA would receive.
              </p>
            </section>
          )}
        </div>
      </section>
    </div>
  );
}