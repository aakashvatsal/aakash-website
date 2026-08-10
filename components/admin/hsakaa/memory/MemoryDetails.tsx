"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, type ReactNode } from "react";
import {
  Archive,
  Brain,
  CalendarDays,
  CircleAlert,
  Database,
  ExternalLink,
  FileText,
  Fingerprint,
  Globe2,
  Hash,
  Link2,
  LockKeyhole,
  Pencil,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Sparkles,
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
  type Memory,
} from "@/types/hsakaa";

type MemoryDetailsProps = {
  initialMemory: Memory;
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
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getPerson(memory: Memory) {
  if (
    memory.personId &&
    typeof memory.personId === "object"
  ) {
    return memory.personId;
  }

  return null;
}

function DetailItem({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: ReactNode;
  icon?: React.ComponentType<{
    className?: string;
  }>;
}) {
  return (
    <div className="rounded-[18px] border border-white/10 bg-black/10 p-4">
      <div className="flex items-center gap-2">
        {Icon ? (
          <Icon className="h-3.5 w-3.5 text-white/25" />
        ) : null}

        <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white/25">
          {label}
        </p>
      </div>

      <div className="mt-2 break-words text-sm font-bold text-white/70">
        {value}
      </div>
    </div>
  );
}

function Section({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-[24px] border border-white/10 bg-white/[0.025]">
      <div className="border-b border-white/10 p-5 sm:p-6">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#C6FF32]">
          {eyebrow}
        </p>

        <h2 className="mt-2 text-xl font-black tracking-[-0.03em] text-white">
          {title}
        </h2>

        {description ? (
          <p className="mt-2 max-w-2xl text-sm leading-6 text-white/40">
            {description}
          </p>
        ) : null}
      </div>

      <div className="p-5 sm:p-6">
        {children}
      </div>
    </section>
  );
}

function ScoreCard({
  label,
  value,
  description,
}: {
  label: string;
  value: number;
  description: string;
}) {
  const percentage = Math.round(
    Math.min(1, Math.max(0, value)) * 100,
  );

  return (
    <article className="rounded-[20px] border border-white/10 bg-black/10 p-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-sm font-bold text-white/60">
          {label}
        </p>

        <span className="text-lg font-black text-[#C6FF32]">
          {percentage}%
        </span>
      </div>

      <div className="mt-4 h-2 overflow-hidden rounded-full bg-white/[0.06]">
        <div
          className="h-full rounded-full bg-[#C6FF32]"
          style={{
            width: `${percentage}%`,
          }}
        />
      </div>

      <p className="mt-3 text-xs leading-5 text-white/30">
        {description}
      </p>
    </article>
  );
}

export function MemoryDetails({
  initialMemory,
}: MemoryDetailsProps) {
  const router = useRouter();

  const [memory, setMemory] =
    useState(initialMemory);

  const [processing, setProcessing] =
    useState(false);

  const [error, setError] = useState("");

  const person = getPerson(memory);

  const personName = person
    ? person.preferredName ?? person.name
    : null;

  const isGlobalMemory = !memory.personId;

  const isPublic =
    memory.accessLevel ===
    MemoryAccessLevel.PUBLIC;

  async function handleArchive() {
    const actionLabel = memory.isArchived
      ? "restore"
      : "archive";

    const confirmed = window.confirm(
      `${
        memory.isArchived
          ? "Restore"
          : "Archive"
      } this memory?`,
    );

    if (!confirmed) {
      return;
    }

    setProcessing(true);
    setError("");

    try {
      const updatedMemory =
        memory.isArchived
          ? await restoreMemory(memory._id)
          : await archiveMemory(memory._id);

      setMemory((current) => ({
        ...current,
        ...updatedMemory,
        isArchived: !current.isArchived,
      }));

      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : `Unable to ${actionLabel} memory.`,
      );
    } finally {
      setProcessing(false);
    }
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      "Delete this memory permanently? This action cannot be undone.",
    );

    if (!confirmed) {
      return;
    }

    setProcessing(true);
    setError("");

    try {
      await deleteMemory(memory._id);

      router.push(
        "/admin/hsakaa/memory",
      );

      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to delete memory.",
      );

      setProcessing(false);
    }
  }

  return (
    <div className="space-y-6">
      {error ? (
        <section className="rounded-[20px] border border-red-400/20 bg-red-400/[0.06] p-4">
          <div className="flex items-start gap-3">
            <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-300" />

            <p className="text-sm leading-6 text-red-100">
              {error}
            </p>
          </div>
        </section>
      ) : null}

      <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5 sm:p-6">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="grid h-14 w-14 shrink-0 place-items-center rounded-[18px] border border-[#C6FF32]/20 bg-[#C6FF32]/10 text-[#C6FF32]">
              <Brain className="h-6 w-6" />
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
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

                {!memory.isActive ? (
                  <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white/40">
                    Inactive
                  </span>
                ) : null}

                {memory.isDisputed ? (
                  <span className="rounded-full border border-red-300/20 bg-red-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-red-200">
                    Disputed
                  </span>
                ) : null}
              </div>

              <p className="mt-4 max-w-4xl whitespace-pre-wrap text-xl font-bold leading-8 tracking-[-0.02em] text-white">
                {memory.content}
              </p>
            </div>
          </div>

          <div
            className={`inline-flex w-fit shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${
              isPublic
                ? "border-[#C6FF32]/20 bg-[#C6FF32]/10 text-[#C6FF32]"
                : "border-white/10 bg-white/[0.04] text-white/45"
            }`}
          >
            {isPublic ? (
              <Globe2 className="h-4 w-4" />
            ) : (
              <LockKeyhole className="h-4 w-4" />
            )}

            {formatEnum(
              memory.accessLevel,
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <DetailItem
            label="Scope"
            icon={
              isGlobalMemory
                ? Globe2
                : UserRound
            }
            value={
              personName ??
              (memory.personId
                ? "Linked person"
                : "Global memory")
            }
          />

          <DetailItem
            label="Sensitivity"
            icon={ShieldAlert}
            value={formatEnum(
              memory.sensitivity,
            )}
          />

          <DetailItem
            label="Verification"
            icon={ShieldCheck}
            value={formatEnum(
              memory.verificationStatus,
            )}
          />

          <DetailItem
            label="Access count"
            icon={Database}
            value={memory.accessCount ?? 0}
          />
        </div>
      </section>

      <Section
        eyebrow="Context"
        title="Memory scope and access"
        description="Review who this memory belongs to and when HSAKAA may use it."
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DetailItem
            label="Access level"
            icon={LockKeyhole}
            value={formatEnum(
              memory.accessLevel,
            )}
          />

          <DetailItem
            label="Memory type"
            icon={Brain}
            value={formatEnum(memory.type)}
          />

          <DetailItem
            label="Source"
            icon={FileText}
            value={formatEnum(memory.source)}
          />

          <DetailItem
            label="Sensitivity"
            icon={ShieldAlert}
            value={formatEnum(
              memory.sensitivity,
            )}
          />
        </div>

        {memory.personId ? (
          <div className="mt-5 rounded-[20px] border border-[#C6FF32]/15 bg-[#C6FF32]/[0.04] p-4">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-[#C6FF32]/20 bg-[#C6FF32]/10 text-[#C6FF32]">
                  <UserRound className="h-5 w-5" />
                </div>

                <div>
                  <p className="text-xs font-bold uppercase tracking-wider text-white/30">
                    Linked person
                  </p>

                  <p className="mt-1 font-black text-white">
                    {personName ??
                      "Linked person"}
                  </p>
                </div>
              </div>

              {typeof memory.personId ===
              "string" ? null : (
                <Link
                  href={`/admin/hsakaa/people/${memory.personId._id}`}
                  className="inline-flex min-h-10 items-center justify-center gap-2 rounded-[14px] border border-white/10 bg-white/[0.04] px-4 text-sm font-bold text-white/55 transition hover:border-[#C6FF32]/30 hover:text-[#C6FF32]"
                >
                  View person
                  <ExternalLink className="h-4 w-4" />
                </Link>
              )}
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-[20px] border border-white/10 bg-black/10 p-4">
            <div className="flex items-center gap-3">
              <div className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/40">
                <Globe2 className="h-5 w-5" />
              </div>

              <div>
                <p className="font-bold text-white">
                  Global memory
                </p>

                <p className="mt-1 text-sm text-white/35">
                  This memory is not attached to a
                  specific person.
                </p>
              </div>
            </div>
          </div>
        )}
      </Section>

      <Section
        eyebrow="Retrieval"
        title="Importance and confidence"
        description="These scores influence how strongly HSAKAA prioritizes this memory during retrieval."
      >
        <div className="grid gap-4 lg:grid-cols-2">
          <ScoreCard
            label="Importance"
            value={memory.importance}
            description="How important this memory is when choosing context for a response."
          />

          <ScoreCard
            label="Confidence"
            value={memory.confidence}
            description="How certain HSAKAA should be that the memory is accurate."
          />
        </div>
      </Section>

      <Section
        eyebrow="Search"
        title="Tags"
        description="Keywords used for filtering and keyword-based retrieval."
      >
        {memory.tags?.length ? (
          <div className="flex flex-wrap gap-2">
            {memory.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/60"
              >
                <Hash className="h-3.5 w-3.5 text-white/25" />
                {tag}
              </span>
            ))}
          </div>
        ) : (
          <p className="text-sm text-white/30">
            No tags added.
          </p>
        )}
      </Section>

      <Section
        eyebrow="Source"
        title="Source reference"
        description="Information connecting this memory to its originating record or external source."
      >
        {memory.sourceReference ? (
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            <DetailItem
              label="Entity ID"
              icon={Fingerprint}
              value={
                memory.sourceReference.entityId ??
                "Not available"
              }
            />

            <DetailItem
              label="Entity type"
              icon={Database}
              value={
                memory.sourceReference
                  .entityType ??
                "Not available"
              }
            />

            <DetailItem
              label="External ID"
              icon={Link2}
              value={
                memory.sourceReference
                  .externalId ??
                "Not available"
              }
            />

            <DetailItem
              label="Source created"
              icon={CalendarDays}
              value={formatDate(
                memory.sourceReference
                  .sourceCreatedAt,
              )}
            />

            <DetailItem
              label="Source URL"
              icon={ExternalLink}
              value={
                memory.sourceReference
                  .sourceUrl ? (
                  <a
                    href={
                      memory.sourceReference
                        .sourceUrl
                    }
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 break-all text-[#C6FF32] hover:underline"
                  >
                    Open source
                    <ExternalLink className="h-3.5 w-3.5 shrink-0" />
                  </a>
                ) : (
                  "Not available"
                )
              }
            />
          </div>
        ) : (
          <p className="rounded-[18px] border border-dashed border-white/10 p-5 text-sm text-white/35">
            No source reference has been attached
            to this memory.
          </p>
        )}
      </Section>

      <Section
        eyebrow="AI"
        title="Embedding status"
        description="Embedding information used for future semantic memory retrieval."
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DetailItem
            label="Embedding generated"
            icon={Sparkles}
            value={
              memory.embeddingGenerated
                ? "Yes"
                : "No"
            }
          />

          <DetailItem
            label="Generated at"
            icon={CalendarDays}
            value={formatDate(
              memory.embeddingGeneratedAt,
            )}
          />

          <DetailItem
            label="Last accessed"
            icon={Database}
            value={formatDate(
              memory.lastAccessedAt,
            )}
          />

          <DetailItem
            label="Access count"
            icon={Database}
            value={memory.accessCount ?? 0}
          />
        </div>
      </Section>

      {memory.isDisputed ? (
        <Section
          eyebrow="Dispute"
          title="Dispute information"
          description="This memory has been challenged by a verified person."
        >
          <div className="rounded-[20px] border border-red-300/15 bg-red-300/[0.04] p-5">
            <div className="flex items-start gap-3">
              <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-200" />

              <div>
                <p className="font-bold text-red-100">
                  Memory disputed
                </p>

                <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-red-100/65">
                  {memory.disputeReason ||
                    "No dispute reason was provided."}
                </p>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              <DetailItem
                label="Disputed at"
                value={formatDate(
                  memory.disputedAt,
                )}
              />

              <DetailItem
                label="Disputed by person"
                value={
                  memory.disputedByPersonId ??
                  "Not available"
                }
              />
            </div>
          </div>
        </Section>
      ) : null}

      <Section
        eyebrow="Lifecycle"
        title="Record information"
        description="Creation, update, expiration and activity state for this memory."
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DetailItem
            label="Created"
            icon={CalendarDays}
            value={formatDate(
              memory.createdAt,
            )}
          />

          <DetailItem
            label="Updated"
            icon={CalendarDays}
            value={formatDate(
              memory.updatedAt,
            )}
          />

          <DetailItem
            label="Expires"
            icon={CalendarDays}
            value={formatDate(
              memory.expiresAt,
            )}
          />

          <DetailItem
            label="Active"
            value={
              memory.isActive ? "Yes" : "No"
            }
          />

          <DetailItem
            label="Archived"
            value={
              memory.isArchived
                ? "Yes"
                : "No"
            }
          />

          <DetailItem
            label="Disputed"
            value={
              memory.isDisputed
                ? "Yes"
                : "No"
            }
          />
        </div>

        {memory.expiresAt ? (
          <div className="mt-5 rounded-[18px] border border-amber-300/20 bg-amber-300/[0.06] p-4 text-sm leading-6 text-amber-100/70">
            This memory has a MongoDB TTL expiry
            date. Once expired, the database may
            permanently remove the document.
          </div>
        ) : null}
      </Section>

      <Section
        eyebrow="Administration"
        title="Memory actions"
        description="Edit, archive, restore or permanently delete this memory."
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <Link
            href={`/admin/hsakaa/memory/${memory._id}/edit`}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[16px] border border-[#C6FF32]/20 bg-[#C6FF32]/[0.06] px-4 text-sm font-bold text-[#C6FF32] transition hover:bg-[#C6FF32]/10"
          >
            <Pencil className="h-4 w-4" />
            Edit memory
          </Link>

          <button
            type="button"
            disabled={processing}
            onClick={handleArchive}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[16px] border border-white/10 bg-white/[0.04] px-4 text-sm font-bold text-white/55 transition hover:border-amber-300/30 hover:text-amber-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {memory.isArchived ? (
              <RotateCcw className="h-4 w-4" />
            ) : (
              <Archive className="h-4 w-4" />
            )}

            {memory.isArchived
              ? "Restore memory"
              : "Archive memory"}
          </button>

          <button
            type="button"
            disabled={processing}
            onClick={handleDelete}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[16px] border border-red-300/15 bg-red-300/[0.04] px-4 text-sm font-bold text-red-200/70 transition hover:border-red-300/30 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 className="h-4 w-4" />
            Delete memory
          </button>
        </div>
      </Section>
    </div>
  );
}