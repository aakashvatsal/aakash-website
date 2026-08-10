"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Archive,
  Ban,
  CheckCircle2,
  CircleAlert,
  Mail,
  Pencil,
  Phone,
  RotateCcw,
  Search,
  ShieldCheck,
  ShieldQuestion,
  Trash2,
  UserRound,
  UsersRound,
} from "lucide-react";

import {
  archiveMemoryPerson,
  blockMemoryPerson,
  deleteMemoryPerson,
  restoreMemoryPerson,
  unblockMemoryPerson,
} from "@/lib/api/memory-people";

import {
  PersonIdentityStatus,
  PersonRelationshipType,
  type MemoryPerson,
} from "@/types/hsakaa";

type PeopleListProps = {
  initialPeople: MemoryPerson[];
  initialError?: string;
};

type RecordFilter =
  | "active"
  | "archived"
  | "all";

type BlockedFilter =
  | "all"
  | "blocked"
  | "unblocked";

type ConsentFilter =
  | "all"
  | "granted"
  | "not_granted";

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

function getPrimaryEmail(
  person: MemoryPerson,
) {
  return (
    person.emails?.find(
      (email) => email.isPrimary,
    ) ??
    person.emails?.[0] ??
    null
  );
}

function getPrimaryPhone(
  person: MemoryPerson,
) {
  return (
    person.phoneNumbers?.find(
      (phone) => phone.isPrimary,
    ) ??
    person.phoneNumbers?.[0] ??
    null
  );
}

function getPhoneLabel(
  person: MemoryPerson,
) {
  const phone = getPrimaryPhone(person);

  if (!phone?.phoneNumber) {
    return "No phone";
  }

  return [
    phone.countryCode,
    phone.phoneNumber,
  ]
    .filter(Boolean)
    .join(" ");
}

function matchesSearch(
  person: MemoryPerson,
  search: string,
) {
  const normalizedSearch = search
    .trim()
    .toLowerCase();

  if (!normalizedSearch) {
    return true;
  }

  const emails =
    person.emails?.map(
      (email) => email.email,
    ) ?? [];

  const phones =
    person.phoneNumbers?.flatMap(
      (phone) => [
        phone.phoneNumber,
        phone.countryCode,
        [
          phone.countryCode,
          phone.phoneNumber,
        ]
          .filter(Boolean)
          .join(" "),
      ],
    ) ?? [];

  const searchableValues = [
    person.name,
    person.preferredName,
    person.relationship,
    person.relationshipLabel,
    person.identityStatus,
    person.notes,
    person.blockedReason,
    ...emails,
    ...phones,
    ...(person.aliases ?? []),
    ...(person.tags ?? []),
  ];

  return searchableValues.some((value) =>
    value
      ?.toLowerCase()
      .includes(normalizedSearch),
  );
}

export function PeopleList({
  initialPeople,
  initialError = "",
}: PeopleListProps) {
  const [people, setPeople] = useState(
    initialPeople ?? [],
  );

  const [search, setSearch] = useState("");
  const [relationship, setRelationship] =
    useState("");
  const [
    identityStatus,
    setIdentityStatus,
  ] = useState("");
  const [recordFilter, setRecordFilter] =
    useState<RecordFilter>("active");
  const [blockedFilter, setBlockedFilter] =
    useState<BlockedFilter>("all");
  const [consentFilter, setConsentFilter] =
    useState<ConsentFilter>("all");

  const [actionPersonId, setActionPersonId] =
    useState<string | null>(null);

  const [actionError, setActionError] =
    useState("");

  const filteredPeople = useMemo(() => {
    return people.filter((person) => {
      if (!matchesSearch(person, search)) {
        return false;
      }

      if (
        relationship &&
        person.relationship !== relationship
      ) {
        return false;
      }

      if (
        identityStatus &&
        person.identityStatus !== identityStatus
      ) {
        return false;
      }

      if (
        recordFilter === "active" &&
        person.isArchived
      ) {
        return false;
      }

      if (
        recordFilter === "archived" &&
        !person.isArchived
      ) {
        return false;
      }

      if (
        blockedFilter === "blocked" &&
        !person.isBlocked
      ) {
        return false;
      }

      if (
        blockedFilter === "unblocked" &&
        person.isBlocked
      ) {
        return false;
      }

      if (
        consentFilter === "granted" &&
        !person.memoryAccessConsentGranted
      ) {
        return false;
      }

      if (
        consentFilter ===
          "not_granted" &&
        person.memoryAccessConsentGranted
      ) {
        return false;
      }

      return true;
    });
  }, [
    people,
    search,
    relationship,
    identityStatus,
    recordFilter,
    blockedFilter,
    consentFilter,
  ]);

  const stats = useMemo(() => {
    const activePeople = people.filter(
      (person) =>
        person.isActive &&
        !person.isArchived,
    );

    return {
      total: people.length,

      verified: activePeople.filter(
        (person) =>
          person.identityStatus ===
          PersonIdentityStatus.VERIFIED,
      ).length,

      unverified: activePeople.filter(
        (person) =>
          person.identityStatus ===
            PersonIdentityStatus.UNVERIFIED ||
          person.identityStatus ===
            PersonIdentityStatus.PARTIALLY_VERIFIED,
      ).length,

      consentGranted: activePeople.filter(
        (person) =>
          person.memoryAccessConsentGranted,
      ).length,

      blocked: people.filter(
        (person) => person.isBlocked,
      ).length,

      archived: people.filter(
        (person) => person.isArchived,
      ).length,
    };
  }, [people]);

  const statCards = [
    {
      label: "People",
      value: stats.total,
      icon: UsersRound,
    },
    {
      label: "Verified",
      value: stats.verified,
      icon: ShieldCheck,
    },
    {
      label: "Unverified",
      value: stats.unverified,
      icon: ShieldQuestion,
    },
    {
      label: "Consent",
      value: stats.consentGranted,
      icon: CheckCircle2,
    },
    {
      label: "Blocked",
      value: stats.blocked,
      icon: Ban,
    },
    {
      label: "Archived",
      value: stats.archived,
      icon: Archive,
    },
  ];

  async function handleArchive(
    person: MemoryPerson,
  ) {
    setActionError("");
    setActionPersonId(person._id);

    try {
      const updatedPerson =
        await archiveMemoryPerson(
          person._id,
        );

      setPeople((current) =>
        current.map((item) =>
          item._id === person._id
            ? {
                ...item,
                ...updatedPerson,
                isArchived: true,
              }
            : item,
        ),
      );
    } catch (caughtError) {
      setActionError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to archive person.",
      );
    } finally {
      setActionPersonId(null);
    }
  }

  async function handleRestore(
    person: MemoryPerson,
  ) {
    setActionError("");
    setActionPersonId(person._id);

    try {
      const updatedPerson =
        await restoreMemoryPerson(
          person._id,
        );

      setPeople((current) =>
        current.map((item) =>
          item._id === person._id
            ? {
                ...item,
                ...updatedPerson,
                isArchived: false,
              }
            : item,
        ),
      );
    } catch (caughtError) {
      setActionError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to restore person.",
      );
    } finally {
      setActionPersonId(null);
    }
  }

  async function handleBlock(
    person: MemoryPerson,
  ) {
    const reason =
      window.prompt(
        "Why are you blocking this person?",
        person.blockedReason ?? "",
      ) ?? "";

    if (!reason.trim()) {
      return;
    }

    setActionError("");
    setActionPersonId(person._id);

    try {
      const updatedPerson =
        await blockMemoryPerson(
          person._id,
          reason,
        );

      setPeople((current) =>
        current.map((item) =>
          item._id === person._id
            ? {
                ...item,
                ...updatedPerson,
                isBlocked: true,
                blockedReason: reason,
                identityStatus:
                  PersonIdentityStatus.BLOCKED,
              }
            : item,
        ),
      );
    } catch (caughtError) {
      setActionError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to block person.",
      );
    } finally {
      setActionPersonId(null);
    }
  }

  async function handleUnblock(
    person: MemoryPerson,
  ) {
    const confirmed = window.confirm(
      `Unblock ${person.preferredName ?? person.name}?`,
    );

    if (!confirmed) {
      return;
    }

    setActionError("");
    setActionPersonId(person._id);

    try {
      const updatedPerson =
        await unblockMemoryPerson(
          person._id,
        );

      setPeople((current) =>
        current.map((item) =>
          item._id === person._id
            ? {
                ...item,
                ...updatedPerson,
                isBlocked: false,
                blockedReason: undefined,
              }
            : item,
        ),
      );
    } catch (caughtError) {
      setActionError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to unblock person.",
      );
    } finally {
      setActionPersonId(null);
    }
  }

  async function handleDelete(
    person: MemoryPerson,
  ) {
    const confirmed = window.confirm(
      `Delete ${person.preferredName ?? person.name} permanently? This action cannot be undone.`,
    );

    if (!confirmed) {
      return;
    }

    setActionError("");
    setActionPersonId(person._id);

    try {
      await deleteMemoryPerson(person._id);

      setPeople((current) =>
        current.filter(
          (item) =>
            item._id !== person._id,
        ),
      );
    } catch (caughtError) {
      setActionError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to delete person.",
      );
    } finally {
      setActionPersonId(null);
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
                Unable to load people
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
                  setSearch(
                    event.target.value,
                  )
                }
                placeholder="Search names, emails, phones, aliases or tags..."
                className="min-h-12 w-full rounded-[16px] border border-white/10 bg-[#030608] pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#C6FF32]/50"
              />
            </div>

            <Link
              href="/admin/hsakaa/people/new"
              className="inline-flex min-h-12 items-center justify-center rounded-[16px] bg-[#C6FF32] px-5 text-sm font-black text-[#030608]"
            >
              New person
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            <select
              value={relationship}
              onChange={(event) =>
                setRelationship(
                  event.target.value,
                )
              }
              className="min-h-11 rounded-[14px] border border-white/10 bg-[#030608] px-3 text-sm text-white/70 outline-none focus:border-[#C6FF32]/50"
            >
              <option value="">
                All relationships
              </option>

              {Object.values(
                PersonRelationshipType,
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
              value={identityStatus}
              onChange={(event) =>
                setIdentityStatus(
                  event.target.value,
                )
              }
              className="min-h-11 rounded-[14px] border border-white/10 bg-[#030608] px-3 text-sm text-white/70 outline-none focus:border-[#C6FF32]/50"
            >
              <option value="">
                All identity statuses
              </option>

              {Object.values(
                PersonIdentityStatus,
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
              value={consentFilter}
              onChange={(event) =>
                setConsentFilter(
                  event.target
                    .value as ConsentFilter,
                )
              }
              className="min-h-11 rounded-[14px] border border-white/10 bg-[#030608] px-3 text-sm text-white/70 outline-none focus:border-[#C6FF32]/50"
            >
              <option value="all">
                All consent
              </option>

              <option value="granted">
                Consent granted
              </option>

              <option value="not_granted">
                Consent not granted
              </option>
            </select>

            <select
              value={blockedFilter}
              onChange={(event) =>
                setBlockedFilter(
                  event.target
                    .value as BlockedFilter,
                )
              }
              className="min-h-11 rounded-[14px] border border-white/10 bg-[#030608] px-3 text-sm text-white/70 outline-none focus:border-[#C6FF32]/50"
            >
              <option value="all">
                All access states
              </option>

              <option value="unblocked">
                Not blocked
              </option>

              <option value="blocked">
                Blocked
              </option>
            </select>

            <select
              value={recordFilter}
              onChange={(event) =>
                setRecordFilter(
                  event.target
                    .value as RecordFilter,
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
                {filteredPeople.length}
              </span>{" "}
              of{" "}
              <span className="font-bold text-white">
                {people.length}
              </span>{" "}
              people
            </p>

            <button
              type="button"
              onClick={() => {
                setSearch("");
                setRelationship("");
                setIdentityStatus("");
                setConsentFilter("all");
                setBlockedFilter("all");
                setRecordFilter("active");
              }}
              className="text-sm font-bold text-white/40 transition hover:text-[#C6FF32]"
            >
              Clear filters
            </button>
          </div>
        </div>
      </section>

      {filteredPeople.length === 0 ? (
        <section className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.015] px-5 py-16 text-center">
          <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/35">
            <UsersRound className="h-6 w-6" />
          </div>

          <h2 className="mt-5 text-xl font-black text-white">
            No people found
          </h2>

          <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/40">
            Adjust the filters or add someone
            HSAKAA should recognise.
          </p>

          <Link
            href="/admin/hsakaa/people/new"
            className="mt-6 inline-flex min-h-11 items-center justify-center rounded-[14px] bg-[#C6FF32] px-5 text-sm font-black text-[#030608]"
          >
            Create person
          </Link>
        </section>
      ) : (
        <section className="grid gap-4 xl:grid-cols-2">
          {filteredPeople.map((person) => {
            const primaryEmail =
              getPrimaryEmail(person);

            const primaryPhone =
              getPrimaryPhone(person);

            const verified =
              person.identityStatus ===
              PersonIdentityStatus.VERIFIED;

            const processing =
              actionPersonId === person._id;

            return (
              <article
                key={person._id}
                className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5"
              >
                <div className="flex items-start gap-4">
                  <div className="grid h-14 w-14 shrink-0 place-items-center rounded-[18px] border border-[#C6FF32]/20 bg-[#C6FF32]/10 text-lg font-black text-[#C6FF32]">
                    {(
                      person.preferredName ??
                      person.name
                    )
                      .charAt(0)
                      .toUpperCase()}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <Link
                        href={`/admin/hsakaa/people/${person._id}`}
                        className="truncate text-lg font-black tracking-[-0.03em] text-white transition hover:text-[#C6FF32]"
                      >
                        {person.preferredName ??
                          person.name}
                      </Link>

                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white/45">
                        {formatEnum(
                          person.relationship,
                        )}
                      </span>

                      {person.isArchived ? (
                        <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-200">
                          Archived
                        </span>
                      ) : null}

                      {person.isBlocked ? (
                        <span className="rounded-full border border-red-300/20 bg-red-300/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-red-200">
                          Blocked
                        </span>
                      ) : null}
                    </div>

                    {person.preferredName ? (
                      <p className="mt-1 truncate text-sm text-white/35">
                        Full name: {person.name}
                      </p>
                    ) : person.relationshipLabel ? (
                      <p className="mt-1 truncate text-sm text-white/35">
                        {person.relationshipLabel}
                      </p>
                    ) : null}
                  </div>

                  <span
                    className={`hidden shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold sm:flex ${
                      verified
                        ? "border-[#C6FF32]/20 bg-[#C6FF32]/10 text-[#C6FF32]"
                        : "border-white/10 bg-white/[0.04] text-white/40"
                    }`}
                  >
                    {verified ? (
                      <ShieldCheck className="h-3.5 w-3.5" />
                    ) : (
                      <ShieldQuestion className="h-3.5 w-3.5" />
                    )}

                    {formatEnum(
                      person.identityStatus,
                    )}
                  </span>
                </div>

                <div className="mt-5 grid gap-3 md:grid-cols-2">
                  <div className="rounded-[16px] border border-white/10 bg-black/10 p-3">
                    <div className="flex items-center gap-2 text-white/30">
                      <Mail className="h-4 w-4" />

                      <p className="text-[10px] font-black uppercase tracking-wider">
                        Primary email
                      </p>
                    </div>

                    <p className="mt-2 truncate text-sm font-bold text-white/70">
                      {primaryEmail?.email ??
                        "No email"}
                    </p>

                    {primaryEmail ? (
                      <p className="mt-1 text-xs text-white/30">
                        {primaryEmail.isVerified
                          ? "Verified email"
                          : "Not verified"}
                      </p>
                    ) : null}
                  </div>

                  <div className="rounded-[16px] border border-white/10 bg-black/10 p-3">
                    <div className="flex items-center gap-2 text-white/30">
                      <Phone className="h-4 w-4" />

                      <p className="text-[10px] font-black uppercase tracking-wider">
                        Primary phone
                      </p>
                    </div>

                    <p className="mt-2 truncate text-sm font-bold text-white/70">
                      {getPhoneLabel(person)}
                    </p>

                    {primaryPhone ? (
                      <p className="mt-1 text-xs text-white/30">
                        {primaryPhone.isVerified
                          ? "Verified phone"
                          : "Not verified"}
                      </p>
                    ) : null}
                  </div>
                </div>

                <div className="mt-4 grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[16px] border border-white/10 bg-black/10 p-3">
                    <p className="text-[10px] font-black uppercase tracking-wider text-white/25">
                      Identities
                    </p>

                    <p className="mt-1 font-black text-white">
                      {(person.emails?.length ??
                        0) +
                        (person.phoneNumbers
                          ?.length ?? 0)}
                    </p>
                  </div>

                  <div className="rounded-[16px] border border-white/10 bg-black/10 p-3">
                    <p className="text-[10px] font-black uppercase tracking-wider text-white/25">
                      Consent
                    </p>

                    <p
                      className={`mt-1 font-black ${
                        person.memoryAccessConsentGranted
                          ? "text-[#C6FF32]"
                          : "text-white/45"
                      }`}
                    >
                      {person.memoryAccessConsentGranted
                        ? "Granted"
                        : "Not granted"}
                    </p>
                  </div>

                  <div className="rounded-[16px] border border-white/10 bg-black/10 p-3">
                    <p className="text-[10px] font-black uppercase tracking-wider text-white/25">
                      Identity version
                    </p>

                    <p className="mt-1 font-black text-white">
                      {person.identityVersion}
                    </p>
                  </div>
                </div>

                {person.tags?.length ? (
                  <div className="mt-4 flex flex-wrap gap-2">
                    {person.tags
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

                <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4">
                  <div className="space-y-1">
                    <p className="text-xs text-white/25">
                      Last verified:{" "}
                      {formatDate(
                        person.lastVerifiedAt,
                      )}
                    </p>

                    <p className="text-xs text-white/25">
                      Last accessed:{" "}
                      {formatDate(
                        person.lastAccessedAt,
                      )}
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <Link
                      href={`/admin/hsakaa/people/${person._id}/edit`}
                      aria-label="Edit person"
                      className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-white/45 transition hover:border-[#C6FF32]/30 hover:text-[#C6FF32]"
                    >
                      <Pencil className="h-4 w-4" />
                    </Link>

                    {person.isBlocked ? (
                      <button
                        type="button"
                        disabled={processing}
                        onClick={() =>
                          handleUnblock(person)
                        }
                        aria-label="Unblock person"
                        className="grid h-10 w-10 place-items-center rounded-xl border border-[#C6FF32]/15 bg-[#C6FF32]/[0.05] text-[#C6FF32]/60 transition hover:border-[#C6FF32]/35 hover:text-[#C6FF32] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <ShieldCheck className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={processing}
                        onClick={() =>
                          handleBlock(person)
                        }
                        aria-label="Block person"
                        className="grid h-10 w-10 place-items-center rounded-xl border border-red-300/10 bg-red-300/[0.04] text-red-200/50 transition hover:border-red-300/30 hover:text-red-200 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Ban className="h-4 w-4" />
                      </button>
                    )}

                    {person.isArchived ? (
                      <button
                        type="button"
                        disabled={processing}
                        onClick={() =>
                          handleRestore(person)
                        }
                        aria-label="Restore person"
                        className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-white/45 transition hover:border-[#C6FF32]/30 hover:text-[#C6FF32] disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </button>
                    ) : (
                      <button
                        type="button"
                        disabled={processing}
                        onClick={() =>
                          handleArchive(person)
                        }
                        aria-label="Archive person"
                        className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 bg-white/[0.03] text-white/45 transition hover:border-amber-300/30 hover:text-amber-200 disabled:cursor-not-allowed disabled:opacity-40"
                      >
                        <Archive className="h-4 w-4" />
                      </button>
                    )}

                    <button
                      type="button"
                      disabled={processing}
                      onClick={() =>
                        handleDelete(person)
                      }
                      aria-label="Delete person"
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