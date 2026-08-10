"use client";

import Link from "next/link";
import {
  Archive,
  Ban,
  Brain,
  CheckCircle2,
  CircleAlert,
  Clock3,
  Globe2,
  Mail,
  Pencil,
  Phone,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShieldQuestion,
  Trash2,
  UserRound,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";

import {
  archiveMemoryPerson,
  blockMemoryPerson,
  deleteMemoryPerson,
  grantMemoryPersonConsent,
  restoreMemoryPerson,
  revokeMemoryPersonConsent,
  unblockMemoryPerson,
} from "@/lib/api/memory-people";

import {
  PersonIdentityStatus,
  type Memory,
  type MemoryPerson,
} from "@/types/hsakaa";

type MemoryPersonDetailsProps = {
  initialPerson: MemoryPerson;
  initialMemories: Memory[];
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

function DetailItem({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-[18px] border border-white/10 bg-black/10 p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white/25">
        {label}
      </p>

      <div className="mt-2 text-sm font-bold text-white/70">
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
  children: React.ReactNode;
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

export function MemoryPersonDetails({
  initialPerson,
  initialMemories,
}: MemoryPersonDetailsProps) {
  const router = useRouter();

  const [person, setPerson] =
    useState(initialPerson);

  const [memories] = useState(
    initialMemories ?? [],
  );

  const [processing, setProcessing] =
    useState(false);

  const [error, setError] = useState("");

  const displayName =
    person.preferredName ?? person.name;

  const activeMemories = useMemo(
    () =>
      memories.filter(
        (memory) =>
          memory.isActive &&
          !memory.isArchived,
      ),
    [memories],
  );

  const verifiedEmails =
    person.emails?.filter(
      (email) => email.isVerified,
    ).length ?? 0;

  const verifiedPhones =
    person.phoneNumbers?.filter(
      (phone) => phone.isVerified,
    ).length ?? 0;

  async function runAction(
    action: () => Promise<MemoryPerson>,
    fallbackMessage: string,
  ) {
    setProcessing(true);
    setError("");

    try {
      const updatedPerson = await action();

      setPerson((current) => ({
        ...current,
        ...updatedPerson,
      }));

      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : fallbackMessage,
      );
    } finally {
      setProcessing(false);
    }
  }

  async function handleConsent() {
    if (
      person.memoryAccessConsentGranted
    ) {
      const confirmed = window.confirm(
        `Revoke memory access consent for ${displayName}?`,
      );

      if (!confirmed) {
        return;
      }

      await runAction(
        () =>
          revokeMemoryPersonConsent(
            person._id,
          ),
        "Unable to revoke consent.",
      );

      return;
    }

    const confirmed = window.confirm(
      `Grant memory access consent for ${displayName}?`,
    );

    if (!confirmed) {
      return;
    }

    await runAction(
      () =>
        grantMemoryPersonConsent(
          person._id,
        ),
      "Unable to grant consent.",
    );
  }

  async function handleBlock() {
    if (person.isBlocked) {
      const confirmed = window.confirm(
        `Unblock ${displayName}?`,
      );

      if (!confirmed) {
        return;
      }

      await runAction(
        () =>
          unblockMemoryPerson(
            person._id,
          ),
        "Unable to unblock person.",
      );

      return;
    }

    const reason =
      window.prompt(
        `Why are you blocking ${displayName}?`,
        person.blockedReason ?? "",
      ) ?? "";

    if (!reason.trim()) {
      return;
    }

    await runAction(
      () =>
        blockMemoryPerson(
          person._id,
          reason,
        ),
      "Unable to block person.",
    );
  }

  async function handleArchive() {
    if (person.isArchived) {
      const confirmed = window.confirm(
        `Restore ${displayName}?`,
      );

      if (!confirmed) {
        return;
      }

      await runAction(
        () =>
          restoreMemoryPerson(
            person._id,
          ),
        "Unable to restore person.",
      );

      return;
    }

    const confirmed = window.confirm(
      `Archive ${displayName}?`,
    );

    if (!confirmed) {
      return;
    }

    await runAction(
      () =>
        archiveMemoryPerson(
          person._id,
        ),
      "Unable to archive person.",
    );
  }

  async function handleDelete() {
    const confirmed = window.confirm(
      `Delete ${displayName} permanently? This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    setProcessing(true);
    setError("");

    try {
      await deleteMemoryPerson(person._id);

      router.push(
        "/admin/hsakaa/people",
      );

      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to delete person.",
      );

      setProcessing(false);
    }
  }

  const verified =
    person.identityStatus ===
    PersonIdentityStatus.VERIFIED;

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
          <div className="flex items-start gap-4">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-[20px] border border-[#C6FF32]/20 bg-[#C6FF32]/10 text-2xl font-black text-[#C6FF32]">
              {displayName
                .charAt(0)
                .toUpperCase()}
            </div>

            <div>
              <div className="flex flex-wrap items-center gap-2">
                <h2 className="text-2xl font-black tracking-[-0.04em] text-white">
                  {displayName}
                </h2>

                <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-[10px] font-black uppercase tracking-wider text-white/45">
                  {formatEnum(
                    person.relationship,
                  )}
                </span>

                {person.isBlocked ? (
                  <span className="rounded-full border border-red-300/20 bg-red-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-red-200">
                    Blocked
                  </span>
                ) : null}

                {person.isArchived ? (
                  <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1 text-[10px] font-black uppercase tracking-wider text-amber-200">
                    Archived
                  </span>
                ) : null}
              </div>

              {person.preferredName ? (
                <p className="mt-2 text-sm text-white/40">
                  Full name: {person.name}
                </p>
              ) : null}

              {person.relationshipLabel ? (
                <p className="mt-1 text-sm text-white/40">
                  {person.relationshipLabel}
                </p>
              ) : null}
            </div>
          </div>

          <div
            className={`inline-flex w-fit items-center gap-2 rounded-full border px-4 py-2 text-sm font-bold ${
              verified
                ? "border-[#C6FF32]/20 bg-[#C6FF32]/10 text-[#C6FF32]"
                : "border-white/10 bg-white/[0.04] text-white/45"
            }`}
          >
            {verified ? (
              <ShieldCheck className="h-4 w-4" />
            ) : (
              <ShieldQuestion className="h-4 w-4" />
            )}

            {formatEnum(
              person.identityStatus,
            )}
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <DetailItem
            label="Linked memories"
            value={memories.length}
          />

          <DetailItem
            label="Active memories"
            value={activeMemories.length}
          />

          <DetailItem
            label="Verified identities"
            value={
              verifiedEmails +
              verifiedPhones
            }
          />

          <DetailItem
            label="Identity version"
            value={person.identityVersion}
          />
        </div>
      </section>

      <Section
        eyebrow="Identity"
        title="Contact identities"
        description="Email addresses and phone numbers HSAKAA may use to identify and verify this person."
      >
        <div className="grid gap-6 xl:grid-cols-2">
          <div>
            <div className="mb-4 flex items-center gap-2">
              <Mail className="h-4 w-4 text-[#C6FF32]" />

              <h3 className="font-black text-white">
                Email addresses
              </h3>
            </div>

            {person.emails?.length ? (
              <div className="space-y-3">
                {person.emails.map(
                  (email) => (
                    <article
                      key={email.email}
                      className="rounded-[18px] border border-white/10 bg-black/10 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="break-all text-sm font-bold text-white/75">
                          {email.email}
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {email.isPrimary ? (
                            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white/45">
                              Primary
                            </span>
                          ) : null}

                          <span
                            className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                              email.isVerified
                                ? "border-[#C6FF32]/20 bg-[#C6FF32]/10 text-[#C6FF32]"
                                : "border-white/10 bg-white/[0.04] text-white/40"
                            }`}
                          >
                            {email.isVerified
                              ? "Verified"
                              : "Unverified"}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 grid gap-2 text-xs text-white/30 sm:grid-cols-2">
                        <p>
                          Last OTP:{" "}
                          {formatDate(
                            email.lastOtpSentAt,
                          )}
                        </p>

                        <p>
                          Last verified:{" "}
                          {formatDate(
                            email.lastVerifiedAt ??
                              email.verifiedAt,
                          )}
                        </p>
                      </div>
                    </article>
                  ),
                )}
              </div>
            ) : (
              <p className="rounded-[18px] border border-dashed border-white/10 p-5 text-sm text-white/35">
                No email identities added.
              </p>
            )}
          </div>

          <div>
            <div className="mb-4 flex items-center gap-2">
              <Phone className="h-4 w-4 text-[#C6FF32]" />

              <h3 className="font-black text-white">
                Phone numbers
              </h3>
            </div>

            {person.phoneNumbers?.length ? (
              <div className="space-y-3">
                {person.phoneNumbers.map(
                  (phone, index) => (
                    <article
                      key={`${phone.countryCode}-${phone.phoneNumber}-${index}`}
                      className="rounded-[18px] border border-white/10 bg-black/10 p-4"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <p className="text-sm font-bold text-white/75">
                          {[
                            phone.countryCode,
                            phone.phoneNumber,
                          ]
                            .filter(Boolean)
                            .join(" ")}
                        </p>

                        <div className="flex flex-wrap gap-2">
                          {phone.isPrimary ? (
                            <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white/45">
                              Primary
                            </span>
                          ) : null}

                          <span
                            className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                              phone.isVerified
                                ? "border-[#C6FF32]/20 bg-[#C6FF32]/10 text-[#C6FF32]"
                                : "border-white/10 bg-white/[0.04] text-white/40"
                            }`}
                          >
                            {phone.isVerified
                              ? "Verified"
                              : "Unverified"}
                          </span>
                        </div>
                      </div>

                      <div className="mt-3 grid gap-2 text-xs text-white/30 sm:grid-cols-2">
                        <p>
                          Last OTP:{" "}
                          {formatDate(
                            phone.lastOtpSentAt,
                          )}
                        </p>

                        <p>
                          Last verified:{" "}
                          {formatDate(
                            phone.lastVerifiedAt ??
                              phone.verifiedAt,
                          )}
                        </p>
                      </div>
                    </article>
                  ),
                )}
              </div>
            ) : (
              <p className="rounded-[18px] border border-dashed border-white/10 p-5 text-sm text-white/35">
                No phone identities added.
              </p>
            )}
          </div>
        </div>
      </Section>

      <Section
        eyebrow="Access"
        title="Consent and activity"
        description="Review whether the person can access person-specific memories after successful verification."
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <DetailItem
            label="Memory consent"
            value={
              <span
                className={
                  person.memoryAccessConsentGranted
                    ? "text-[#C6FF32]"
                    : "text-white/45"
                }
              >
                {person.memoryAccessConsentGranted
                  ? "Granted"
                  : "Not granted"}
              </span>
            }
          />

          <DetailItem
            label="Consent granted"
            value={formatDate(
              person.memoryAccessConsentGrantedAt,
            )}
          />

          <DetailItem
            label="Last verified"
            value={formatDate(
              person.lastVerifiedAt,
            )}
          />

          <DetailItem
            label="Last accessed"
            value={formatDate(
              person.lastAccessedAt,
            )}
          />

          <DetailItem
            label="First verified"
            value={formatDate(
              person.firstVerifiedAt,
            )}
          />

          <DetailItem
            label="Consent revoked"
            value={formatDate(
              person.memoryAccessConsentRevokedAt,
            )}
          />

          <DetailItem
            label="Active"
            value={
              person.isActive
                ? "Yes"
                : "No"
            }
          />

          <DetailItem
            label="Deletion requested"
            value={
              person.deletionRequested
                ? formatDate(
                    person.deletionRequestedAt,
                  )
                : "No"
            }
          />
        </div>
      </Section>

      <Section
        eyebrow="Recognition"
        title="Aliases, tags and notes"
      >
        <div className="grid gap-6 xl:grid-cols-2">
          <div>
            <p className="mb-3 text-sm font-bold text-white/60">
              Aliases
            </p>

            {person.aliases?.length ? (
              <div className="flex flex-wrap gap-2">
                {person.aliases.map(
                  (alias) => (
                    <span
                      key={alias}
                      className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/60"
                    >
                      {alias}
                    </span>
                  ),
                )}
              </div>
            ) : (
              <p className="text-sm text-white/30">
                No aliases added.
              </p>
            )}
          </div>

          <div>
            <p className="mb-3 text-sm font-bold text-white/60">
              Tags
            </p>

            {person.tags?.length ? (
              <div className="flex flex-wrap gap-2">
                {person.tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/60"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-white/30">
                No tags added.
              </p>
            )}
          </div>
        </div>

        <div className="mt-6 rounded-[18px] border border-white/10 bg-black/10 p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white/25">
            Notes
          </p>

          <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-white/55">
            {person.notes ||
              "No notes added."}
          </p>
        </div>
      </Section>

      <Section
        eyebrow="Knowledge"
        title="Person-specific memories"
        description="Memories directly connected to this person."
      >
        <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-white/40">
            <span className="font-bold text-white">
              {memories.length}
            </span>{" "}
            linked memories
          </p>

          <Link
            href={`/admin/hsakaa/memory/new?personId=${person._id}`}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] bg-[#C6FF32] px-4 text-sm font-black text-[#030608]"
          >
            <Plus className="h-4 w-4" />
            Add memory
          </Link>
        </div>

        {memories.length ? (
          <div className="space-y-3">
            {memories.map((memory) => (
              <article
                key={memory._id}
                className="rounded-[20px] border border-white/10 bg-black/10 p-4"
              >
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap gap-2">
                      <span className="rounded-full border border-[#C6FF32]/20 bg-[#C6FF32]/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-[#C6FF32]">
                        {formatEnum(
                          memory.type,
                        )}
                      </span>

                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white/40">
                        {formatEnum(
                          memory.accessLevel,
                        )}
                      </span>

                      {memory.isArchived ? (
                        <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-200">
                          Archived
                        </span>
                      ) : null}
                    </div>

                    <Link
                      href={`/admin/hsakaa/memory/${memory._id}`}
                      className="mt-3 block line-clamp-3 font-bold leading-6 text-white transition hover:text-[#C6FF32]"
                    >
                      {memory.content}
                    </Link>

                    <div className="mt-3 flex flex-wrap gap-4 text-xs text-white/30">
                      <span>
                        Importance{" "}
                        {Math.round(
                          memory.importance *
                            100,
                        )}
                        %
                      </span>

                      <span>
                        Confidence{" "}
                        {Math.round(
                          memory.confidence *
                            100,
                        )}
                        %
                      </span>

                      <span>
                        Updated{" "}
                        {formatDate(
                          memory.updatedAt ??
                            memory.createdAt,
                        )}
                      </span>
                    </div>
                  </div>

                  <Link
                    href={`/admin/hsakaa/memory/${memory._id}/edit`}
                    aria-label="Edit memory"
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-white/45 transition hover:border-[#C6FF32]/30 hover:text-[#C6FF32]"
                  >
                    <Pencil className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <div className="rounded-[20px] border border-dashed border-white/10 px-5 py-12 text-center">
            <Brain className="mx-auto h-6 w-6 text-white/30" />

            <p className="mt-4 font-bold text-white">
              No linked memories
            </p>

            <p className="mt-2 text-sm text-white/35">
              Create a person-specific memory
              for {displayName}.
            </p>
          </div>
        )}
      </Section>

      <Section
        eyebrow="Administration"
        title="Person actions"
        description="Manage consent, access state and record lifecycle."
      >
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <button
            type="button"
            disabled={processing}
            onClick={handleConsent}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[16px] border border-[#C6FF32]/20 bg-[#C6FF32]/[0.06] px-4 text-sm font-bold text-[#C6FF32] transition hover:bg-[#C6FF32]/10 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <CheckCircle2 className="h-4 w-4" />

            {person.memoryAccessConsentGranted
              ? "Revoke consent"
              : "Grant consent"}
          </button>

          <button
            type="button"
            disabled={processing}
            onClick={handleBlock}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[16px] border border-red-300/15 bg-red-300/[0.04] px-4 text-sm font-bold text-red-200/70 transition hover:border-red-300/30 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {person.isBlocked ? (
              <ShieldCheck className="h-4 w-4" />
            ) : (
              <Ban className="h-4 w-4" />
            )}

            {person.isBlocked
              ? "Unblock person"
              : "Block person"}
          </button>

          <button
            type="button"
            disabled={processing}
            onClick={handleArchive}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[16px] border border-white/10 bg-white/[0.04] px-4 text-sm font-bold text-white/55 transition hover:border-amber-300/30 hover:text-amber-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            {person.isArchived ? (
              <RotateCcw className="h-4 w-4" />
            ) : (
              <Archive className="h-4 w-4" />
            )}

            {person.isArchived
              ? "Restore person"
              : "Archive person"}
          </button>

          <button
            type="button"
            disabled={processing}
            onClick={handleDelete}
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[16px] border border-red-300/15 bg-red-300/[0.04] px-4 text-sm font-bold text-red-200/70 transition hover:border-red-300/30 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Trash2 className="h-4 w-4" />
            Delete person
          </button>
        </div>

        {person.isBlocked &&
        person.blockedReason ? (
          <div className="mt-5 rounded-[18px] border border-red-300/15 bg-red-300/[0.04] p-4">
            <p className="text-[10px] font-black uppercase tracking-wider text-red-200/50">
              Blocked reason
            </p>

            <p className="mt-2 text-sm leading-6 text-red-100/70">
              {person.blockedReason}
            </p>
          </div>
        ) : null}
      </Section>
    </div>
  );
}