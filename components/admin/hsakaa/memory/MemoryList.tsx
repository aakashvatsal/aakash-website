"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Archive,
  Brain,
  CircleAlert,
  Globe2,
  LockKeyhole,
  Pencil,
  RotateCcw,
  Search,
  ShieldAlert,
  Trash2,
  UserRound,
} from "lucide-react";

import {
  archiveMemory,
  deleteMemory,
  restoreMemory,
} from "@/lib/api/memory";

import {
  MemoryAccessLevel,
  MemorySensitivity,
  MemorySource,
  MemoryType,
  MemoryVerificationStatus,
  type Memory,
} from "@/types/hsakaa";

type MemoryListProps = {
  initialMemories: Memory[];
  initialError?: string;
};

type ArchivedFilter =
  | "all"
  | "active"
  | "archived";

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

function formatDate(value?: string) {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getPersonName(memory: Memory) {
  if (
    memory.personId &&
    typeof memory.personId === "object"
  ) {
    return (
      memory.personId.preferredName ??
      memory.personId.name
    );
  }

  if (typeof memory.personId === "string") {
    return "Linked person";
  }

  return null;
}

function matchesSearch(
  memory: Memory,
  search: string,
) {
  if (!search.trim()) {
    return true;
  }

  const normalizedSearch = search
    .trim()
    .toLowerCase();

  const personName =
    getPersonName(memory)?.toLowerCase() ?? "";

  return [
    memory.content,
    memory.type,
    memory.source,
    memory.accessLevel,
    memory.sensitivity,
    memory.verificationStatus,
    personName,
    ...(memory.tags ?? []),
  ].some((value) =>
    value
      ?.toString()
      .toLowerCase()
      .includes(normalizedSearch),
  );
}

export function MemoryList({
  initialMemories,
  initialError = "",
}: MemoryListProps) {
  const [memories, setMemories] = useState(
    initialMemories ?? [],
  );

  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [source, setSource] = useState("");
  const [accessLevel, setAccessLevel] =
    useState("");
  const [sensitivity, setSensitivity] =
    useState("");
  const [
    verificationStatus,
    setVerificationStatus,
  ] = useState("");
  const [archived, setArchived] =
    useState<ArchivedFilter>("active");

  const [actionMemoryId, setActionMemoryId] =
    useState<string | null>(null);

  const [actionError, setActionError] =
    useState("");

  const filteredMemories = useMemo(() => {
    return memories.filter((memory) => {
      if (!matchesSearch(memory, search)) {
        return false;
      }

      if (type && memory.type !== type) {
        return false;
      }

      if (
        source &&
        memory.source !== source
      ) {
        return false;
      }

      if (
        accessLevel &&
        memory.accessLevel !== accessLevel
      ) {
        return false;
      }

      if (
        sensitivity &&
        memory.sensitivity !== sensitivity
      ) {
        return false;
      }

      if (
        verificationStatus &&
        memory.verificationStatus !==
          verificationStatus
      ) {
        return false;
      }

      if (
        archived === "active" &&
        memory.isArchived
      ) {
        return false;
      }

      if (
        archived === "archived" &&
        !memory.isArchived
      ) {
        return false;
      }

      return true;
    });
  }, [
    memories,
    search,
    type,
    source,
    accessLevel,
    sensitivity,
    verificationStatus,
    archived,
  ]);

  const stats = useMemo(() => {
    const activeMemories = memories.filter(
      (memory) => !memory.isArchived,
    );

    return {
      total: memories.length,

      public: activeMemories.filter(
        (memory) =>
          memory.accessLevel ===
          MemoryAccessLevel.PUBLIC,
      ).length,

      ownerOnly: activeMemories.filter(
        (memory) =>
          memory.accessLevel ===
          MemoryAccessLevel.OWNER_ONLY,
      ).length,

      personSpecific: activeMemories.filter(
        (memory) =>
          Boolean(memory.personId),
      ).length,

      disputed: activeMemories.filter(
        (memory) => memory.isDisputed,
      ).length,

      archived: memories.filter(
        (memory) => memory.isArchived,
      ).length,
    };
  }, [memories]);

  const statCards = [
    {
      label: "Total",
      value: stats.total,
      icon: Brain,
    },
    {
      label: "Public",
      value: stats.public,
      icon: Globe2,
    },
    {
      label: "Owner only",
      value: stats.ownerOnly,
      icon: LockKeyhole,
    },
    {
      label: "Person memories",
      value: stats.personSpecific,
      icon: UserRound,
    },
    {
      label: "Disputed",
      value: stats.disputed,
      icon: ShieldAlert,
    },
    {
      label: "Archived",
      value: stats.archived,
      icon: Archive,
    },
  ];

  async function handleArchive(
    memory: Memory,
  ) {
    setActionError("");
    setActionMemoryId(memory._id);

    try {
      const updatedMemory =
        await archiveMemory(memory._id);

      setMemories((current) =>
        current.map((item) =>
          item._id === memory._id
            ? {
                ...item,
                ...updatedMemory,
                isArchived: true,
              }
            : item,
        ),
      );
    } catch (caughtError) {
      setActionError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to archive memory.",
      );
    } finally {
      setActionMemoryId(null);
    }
  }

  async function handleRestore(
    memory: Memory,
  ) {
    setActionError("");
    setActionMemoryId(memory._id);

    try {
      const updatedMemory =
        await restoreMemory(memory._id);

      setMemories((current) =>
        current.map((item) =>
          item._id === memory._id
            ? {
                ...item,
                ...updatedMemory,
                isArchived: false,
              }
            : item,
        ),
      );
    } catch (caughtError) {
      setActionError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to restore memory.",
      );
    } finally {
      setActionMemoryId(null);
    }
  }

  async function handleDelete(
    memory: Memory,
  ) {
    const confirmed = window.confirm(
      "Delete this memory permanently? This action cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    setActionError("");
    setActionMemoryId(memory._id);

    try {
      await deleteMemory(memory._id);

      setMemories((current) =>
        current.filter(
          (item) => item._id !== memory._id,
        ),
      );
    } catch (caughtError) {
      setActionError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to delete memory.",
      );
    } finally {
      setActionMemoryId(null);
    }
  }

  return (
    <div className="space-y-6">
      {initialError ? (
        <section className="rounded-[24px] border border-red-400/20 bg-red-400/[0.06] p-5">
          <div className="flex items-start gap-3">
            <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-300" />

            <div>
              <p className="font-bold text-red-100">
                Unable to load memories
              </p>

              <p className="mt-1 text-sm leading-6 text-red-100/60">
                {initialError}
              </p>
            </div>
          </div>
        </section>
      ) : null}

      {actionError ? (
        <section className="rounded-[20px] border border-red-400/20 bg-red-400/[0.06] px-4 py-3 text-sm text-red-100">
          {actionError}
        </section>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {statCards.map((stat) => {
          const Icon = stat.icon;

          return (
            <article
              key={stat.label}
              className="rounded-[22px] border border-white/10 bg-white/[0.025] p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/35">
                    {stat.label}
                  </p>

                  <p className="mt-3 text-2xl font-black tracking-[-0.04em] text-white">
                    {stat.value.toLocaleString()}
                  </p>
                </div>

                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-[#C6FF32]/20 bg-[#C6FF32]/10 text-[#C6FF32]">
                  <Icon className="h-4 w-4" />
                </div>
              </div>
            </article>
          );
        })}
      </section>

      <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-4 sm:p-5">
        <div className="flex flex-col gap-4">
          <div className="flex flex-col gap-3 lg:flex-row">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />

              <input
                value={search}
                onChange={(event) =>
                  setSearch(event.target.value)
                }
                placeholder="Search memories, people or tags..."
                className="min-h-12 w-full rounded-[16px] border border-white/10 bg-[#030608] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#C6FF32]/50"
              />
            </div>

            <Link
              href="/admin/hsakaa/memory/new"
              className="inline-flex min-h-12 items-center justify-center rounded-[16px] bg-[#C6FF32] px-5 text-sm font-black text-[#030608]"
            >
              New memory
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
            <select
              value={type}
              onChange={(event) =>
                setType(event.target.value)
              }
              className="min-h-11 rounded-[14px] border border-white/10 bg-[#030608] px-3 text-sm text-white/70 outline-none focus:border-[#C6FF32]/50"
            >
              <option value="">
                All types
              </option>

              {Object.values(MemoryType).map(
                (value) => (
                  <option
                    key={value}
                    value={value}
                  >
                    {formatEnum(value)}
                  </option>
                ),
              )}
            </select>

            <select
              value={source}
              onChange={(event) =>
                setSource(event.target.value)
              }
              className="min-h-11 rounded-[14px] border border-white/10 bg-[#030608] px-3 text-sm text-white/70 outline-none focus:border-[#C6FF32]/50"
            >
              <option value="">
                All sources
              </option>

              {Object.values(MemorySource).map(
                (value) => (
                  <option
                    key={value}
                    value={value}
                  >
                    {formatEnum(value)}
                  </option>
                ),
              )}
            </select>

            <select
              value={accessLevel}
              onChange={(event) =>
                setAccessLevel(
                  event.target.value,
                )
              }
              className="min-h-11 rounded-[14px] border border-white/10 bg-[#030608] px-3 text-sm text-white/70 outline-none focus:border-[#C6FF32]/50"
            >
              <option value="">
                All access
              </option>

              {Object.values(
                MemoryAccessLevel,
              ).map((value) => (
                <option
                  key={value}
                  value={value}
                >
                  {formatEnum(value)}
                </option>
              ))}
            </select>

            <select
              value={sensitivity}
              onChange={(event) =>
                setSensitivity(
                  event.target.value,
                )
              }
              className="min-h-11 rounded-[14px] border border-white/10 bg-[#030608] px-3 text-sm text-white/70 outline-none focus:border-[#C6FF32]/50"
            >
              <option value="">
                All sensitivity
              </option>

              {Object.values(
                MemorySensitivity,
              ).map((value) => (
                <option
                  key={value}
                  value={value}
                >
                  {formatEnum(value)}
                </option>
              ))}
            </select>

            <select
              value={verificationStatus}
              onChange={(event) =>
                setVerificationStatus(
                  event.target.value,
                )
              }
              className="min-h-11 rounded-[14px] border border-white/10 bg-[#030608] px-3 text-sm text-white/70 outline-none focus:border-[#C6FF32]/50"
            >
              <option value="">
                All verification
              </option>

              {Object.values(
                MemoryVerificationStatus,
              ).map((value) => (
                <option
                  key={value}
                  value={value}
                >
                  {formatEnum(value)}
                </option>
              ))}
            </select>

            <select
              value={archived}
              onChange={(event) =>
                setArchived(
                  event.target
                    .value as ArchivedFilter,
                )
              }
              className="min-h-11 rounded-[14px] border border-white/10 bg-[#030608] px-3 text-sm text-white/70 outline-none focus:border-[#C6FF32]/50"
            >
              <option value="active">
                Active
              </option>
              <option value="archived">
                Archived
              </option>
              <option value="all">
                All records
              </option>
            </select>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4">
            <p className="text-sm text-white/35">
              Showing{" "}
              <span className="font-bold text-white">
                {filteredMemories.length}
              </span>{" "}
              of{" "}
              <span className="font-bold text-white">
                {memories.length}
              </span>{" "}
              memories
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setType("");
                setSource("");
                setAccessLevel("");
                setSensitivity("");
                setVerificationStatus("");
                setArchived("active");
              }}
              className="text-sm font-bold text-white/40 transition hover:text-[#C6FF32]"
            >
              Clear filters
            </button>
          </div>
        </div>
      </section>

      {filteredMemories.length === 0 ? (
        <section className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.015] px-5 py-16 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/35">
            <Brain className="h-6 w-6" />
          </div>

          <h2 className="mt-5 text-xl font-black text-white">
            No memories found
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/40">
            Adjust your filters or create a new
            memory for HSAKAA.
          </p>

          <Link
            href="/admin/hsakaa/memory/new"
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-[14px] bg-[#C6FF32] px-5 text-sm font-black text-[#030608]"
          >
            Create memory
          </Link>
        </section>
      ) : (
        <section className="grid gap-4 xl:grid-cols-2">
          {filteredMemories.map((memory) => {
            const personName =
              getPersonName(memory);

            const processing =
              actionMemoryId === memory._id;

            return (
              <article
                key={memory._id}
                className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex flex-wrap gap-2">
                    <span className="rounded-full border border-[#C6FF32]/20 bg-[#C6FF32]/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-[#C6FF32]">
                      {formatEnum(memory.type)}
                    </span>

                    <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white/45">
                      {formatEnum(memory.source)}
                    </span>

                    {memory.isArchived ? (
                      <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-200">
                        Archived
                      </span>
                    ) : null}

                    {memory.isDisputed ? (
                      <span className="rounded-full border border-red-300/20 bg-red-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-red-200">
                        Disputed
                      </span>
                    ) : null}
                  </div>
                </div>

                <Link
                  href={`/admin/hsakaa/memory/${memory._id}`}
                  className="mt-5 block"
                >
                  <p className="line-clamp-4 text-lg font-bold leading-7 tracking-[-0.02em] text-white transition hover:text-[#C6FF32]">
                    {memory.content}
                  </p>
                </Link>

                <div className="mt-5 flex flex-wrap gap-2">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-bold text-white/45">
                    {personName ? (
                      <UserRound className="h-3.5 w-3.5" />
                    ) : (
                      <Globe2 className="h-3.5 w-3.5" />
                    )}

                    {personName ?? "Global"}
                  </span>

                  <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-bold text-white/45">
                    {formatEnum(
                      memory.accessLevel,
                    )}
                  </span>

                  <span className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-bold text-white/45">
                    {formatEnum(
                      memory.sensitivity,
                    )}
                  </span>
                </div>

                {memory.tags?.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {memory.tags
                      .slice(0, 6)
                      .map((tag) => (
                        <span
                          key={tag}
                          className="rounded-lg bg-white/[0.04] px-2.5 py-1 text-xs text-white/35"
                        >
                          #{tag}
                        </span>
                      ))}
                  </div>
                ) : null}

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <div className="rounded-[16px] border border-white/10 bg-black/10 p-3">
                    <p className="text-[10px] font-black uppercase tracking-wider text-white/25">
                      Importance
                    </p>

                    <p className="mt-1 font-black text-white">
                      {Math.round(
                        memory.importance * 100,
                      )}
                      %
                    </p>
                  </div>

                  <div className="rounded-[16px] border border-white/10 bg-black/10 p-3">
                    <p className="text-[10px] font-black uppercase tracking-wider text-white/25">
                      Confidence
                    </p>

                    <p className="mt-1 font-black text-white">
                      {Math.round(
                        memory.confidence * 100,
                      )}
                      %
                    </p>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4">
                  <p className="text-xs text-white/25">
                    Updated{" "}
                    {formatDate(
                      memory.updatedAt ??
                        memory.createdAt,
                    )}
                  </p>

                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/hsakaa/memory/${memory._id}/edit`}
                      aria-label="Edit memory"
                      className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-white/45 transition hover:border-[#C6FF32]/30 hover:text-[#C6FF32]"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>

                    {memory.isArchived ? (
                      <button
                        type="button"
                        disabled={processing}
                        onClick={() =>
                          handleRestore(memory)
                        }
                        aria-label="Restore memory"
                        className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-white/45 transition hover:border-[#C6FF32]/30 hover:text-[#C6FF32] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={processing}
                        onClick={() =>
                          handleArchive(memory)
                        }
                        aria-label="Archive memory"
                        className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-white/45 transition hover:border-amber-300/30 hover:text-amber-200 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Archive className="h-4 w-4" />
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={processing}
                      onClick={() =>
                        handleDelete(memory)
                      }
                      aria-label="Delete memory"
                      className="grid h-10 w-10 place-items-center rounded-xl border border-red-300/10 bg-red-300/[0.04] text-red-200/50 transition hover:border-red-300/30 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
}