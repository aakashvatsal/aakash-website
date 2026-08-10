import Link from "next/link";
import {
  ArrowRight,
  Brain,
  CircleAlert,
  FlaskConical,
  Globe2,
  LockKeyhole,
  Plus,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import type {
  Memory,
  MemoryPerson,
} from "@/types/hsakaa";
import {
  MemoryAccessLevel,
  PersonIdentityStatus,
} from "@/types/hsakaa";

type HsakaaOverviewProps = {
  initialMemories: Memory[];
  initialPeople: MemoryPerson[];
  initialError?: string;
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
  }).format(date);
}

function getTimestamp(
  updatedAt?: string,
  createdAt?: string,
) {
  const value = updatedAt ?? createdAt;

  if (!value) {
    return 0;
  }

  const timestamp = new Date(value).getTime();

  return Number.isNaN(timestamp)
    ? 0
    : timestamp;
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

function getPrimaryIdentity(
  person: MemoryPerson,
) {
  const primaryEmail =
    person.emails?.find(
      (email) => email.isPrimary,
    ) ?? person.emails?.[0];

  if (primaryEmail?.email) {
    return primaryEmail.email;
  }

  const primaryPhone =
    person.phoneNumbers?.find(
      (phone) => phone.isPrimary,
    ) ?? person.phoneNumbers?.[0];

  if (primaryPhone?.phoneNumber) {
    return [
      primaryPhone.countryCode,
      primaryPhone.phoneNumber,
    ]
      .filter(Boolean)
      .join(" ");
  }

  return "No contact information";
}

export function HsakaaOverview({
  initialMemories,
  initialPeople,
  initialError = "",
}: HsakaaOverviewProps) {
  const memories = initialMemories ?? [];
  const people = initialPeople ?? [];

  const activeMemories = memories.filter(
    (memory) =>
      memory.isActive &&
      !memory.isArchived,
  );

  const activePeople = people.filter(
    (person) =>
      person.isActive &&
      !person.isArchived,
  );

  const verifiedPeople = activePeople.filter(
    (person) =>
      person.identityStatus ===
      PersonIdentityStatus.VERIFIED,
  );

  const publicMemories =
    activeMemories.filter(
      (memory) =>
        memory.accessLevel ===
        MemoryAccessLevel.PUBLIC,
    );

  const personMemories =
    activeMemories.filter(
      (memory) =>
        Boolean(memory.personId),
    );

  const disputedMemories =
    activeMemories.filter(
      (memory) => memory.isDisputed,
    );

  const recentMemories = [...memories]
    .sort(
      (first, second) =>
        getTimestamp(
          second.updatedAt,
          second.createdAt,
        ) -
        getTimestamp(
          first.updatedAt,
          first.createdAt,
        ),
    )
    .slice(0, 5);

  const recentPeople = [...people]
    .sort(
      (first, second) =>
        getTimestamp(
          second.updatedAt,
          second.createdAt,
        ) -
        getTimestamp(
          first.updatedAt,
          first.createdAt,
        ),
    )
    .slice(0, 5);

  const stats = [
    {
      label: "Memories",
      value: memories.length,
      description:
        "All memories currently stored inside HSAKAA.",
      icon: Brain,
    },
    {
      label: "People",
      value: people.length,
      description:
        "People HSAKAA can recognise and remember.",
      icon: UserRound,
    },
    {
      label: "Verified people",
      value: verifiedPeople.length,
      description:
        "People with a successfully verified identity.",
      icon: ShieldCheck,
    },
    {
      label: "Public memories",
      value: publicMemories.length,
      description:
        "Memories available during global conversations.",
      icon: Globe2,
    },
    {
      label: "Person memories",
      value: personMemories.length,
      description:
        "Memories connected to a specific person.",
      icon: LockKeyhole,
    },
    {
      label: "Disputed",
      value: disputedMemories.length,
      description:
        "Memories currently marked as disputed.",
      icon: CircleAlert,
    },
  ];

  const quickActions = [
    {
      title: "New memory",
      description:
        "Store a new global or person-specific memory.",
      href: "/admin/hsakaa/memory/new",
      icon: Brain,
    },
    {
      title: "New person",
      description:
        "Add someone HSAKAA should recognise.",
      href: "/admin/hsakaa/people/new",
      icon: UserRound,
    },
    {
      title: "Open playground",
      description:
        "Test HSAKAA responses and memory retrieval.",
      href: "/admin/hsakaa/playground",
      icon: FlaskConical,
    },
  ];

  return (
    <div className="space-y-8">
      {initialError ? (
        <section className="rounded-[24px] border border-red-400/20 bg-red-400/[0.06] p-5">
          <div className="flex items-start gap-3">
            <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-300" />

            <div>
              <p className="font-bold text-red-100">
                Unable to load HSAKAA data
              </p>

              <p className="mt-1 text-sm leading-6 text-red-100/60">
                {initialError}
              </p>
            </div>
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon;

          return (
            <article
              key={stat.label}
              className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-white/45">
                    {stat.label}
                  </p>

                  <p className="mt-3 text-3xl font-black tracking-[-0.05em] text-white">
                    {stat.value.toLocaleString()}
                  </p>
                </div>

                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-[#C6FF32]/20 bg-[#C6FF32]/10 text-[#C6FF32]">
                  <Icon className="h-5 w-5" />
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-white/35">
                {stat.description}
              </p>
            </article>
          );
        })}
      </section>

      <section>
        <div className="mb-4">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#C6FF32]">
            Quick actions
          </p>

          <h2 className="mt-2 text-2xl font-black tracking-[-0.04em] text-white">
            Manage HSAKAA
          </h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {quickActions.map((action) => {
            const Icon = action.icon;

            return (
              <Link
                key={action.href}
                href={action.href}
                className="group rounded-[24px] border border-white/10 bg-white/[0.025] p-5 transition hover:border-[#C6FF32]/30 hover:bg-white/[0.045]"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/50 transition group-hover:border-[#C6FF32]/20 group-hover:text-[#C6FF32]">
                    <Icon className="h-5 w-5" />
                  </div>

                  <ArrowRight className="h-5 w-5 text-white/20 transition group-hover:translate-x-1 group-hover:text-[#C6FF32]" />
                </div>

                <h3 className="mt-5 text-lg font-black tracking-[-0.03em] text-white">
                  {action.title}
                </h3>

                <p className="mt-2 text-sm leading-6 text-white/40">
                  {action.description}
                </p>
              </Link>
            );
          })}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.025]">
          <div className="flex items-center justify-between gap-4 border-b border-white/10 p-5">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#C6FF32]">
                Knowledge
              </p>

              <h2 className="mt-2 text-xl font-black tracking-[-0.04em] text-white">
                Recent memories
              </h2>
            </div>

            <Link
              href="/admin/hsakaa/memory"
              className="flex items-center gap-2 text-sm font-bold text-white/45 transition hover:text-[#C6FF32]"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {recentMemories.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/35">
                <Brain className="h-5 w-5" />
              </div>

              <h3 className="mt-4 font-bold text-white">
                No memories stored
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-white/40">
                Add the first memory HSAKAA
                should use while representing
                you.
              </p>

              <Link
                href="/admin/hsakaa/memory/new"
                className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] bg-[#C6FF32] px-5 text-sm font-black text-[#030608]"
              >
                <Plus className="h-4 w-4" />
                New memory
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {recentMemories.map((memory) => {
                const personName =
                  getMemoryPersonName(memory);

                return (
                  <Link
                    key={memory._id}
                    href={`/admin/hsakaa/memory/${memory._id}`}
                    className="block p-5 transition hover:bg-white/[0.025]"
                  >
                    <p className="line-clamp-2 font-semibold leading-6 text-white">
                      {memory.content}
                    </p>

                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white/45">
                        {formatEnum(memory.type)}
                      </span>

                      <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white/45">
                        {formatEnum(memory.source)}
                      </span>

                      <span
                        className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${
                          personName
                            ? "border-[#C6FF32]/20 bg-[#C6FF32]/10 text-[#C6FF32]"
                            : "border-white/10 bg-white/[0.04] text-white/45"
                        }`}
                      >
                        {personName ?? "Global"}
                      </span>
                    </div>

                    <p className="mt-3 text-xs text-white/25">
                      Updated{" "}
                      {formatDate(
                        memory.updatedAt ??
                          memory.createdAt,
                      )}
                    </p>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        <div className="overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.025]">
          <div className="flex items-center justify-between gap-4 border-b border-white/10 p-5">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#C6FF32]">
                Identity
              </p>

              <h2 className="mt-2 text-xl font-black tracking-[-0.04em] text-white">
                Recent people
              </h2>
            </div>

            <Link
              href="/admin/hsakaa/people"
              className="flex items-center gap-2 text-sm font-bold text-white/45 transition hover:text-[#C6FF32]"
            >
              View all
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          {recentPeople.length === 0 ? (
            <div className="px-5 py-10 text-center">
              <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/35">
                <UserRound className="h-5 w-5" />
              </div>

              <h3 className="mt-4 font-bold text-white">
                No people added
              </h3>

              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-white/40">
                Add someone HSAKAA should
                recognise and associate with
                person-specific memories.
              </p>

              <Link
                href="/admin/hsakaa/people/new"
                className="mt-5 inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] bg-[#C6FF32] px-5 text-sm font-black text-[#030608]"
              >
                <Plus className="h-4 w-4" />
                New person
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-white/10">
              {recentPeople.map((person) => {
                const verified =
                  person.identityStatus ===
                  PersonIdentityStatus.VERIFIED;

                return (
                  <Link
                    key={person._id}
                    href={`/admin/hsakaa/people/${person._id}`}
                    className="flex items-center gap-4 p-5 transition hover:bg-white/[0.025]"
                  >
                    <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-sm font-black text-white">
                      {(
                        person.preferredName ??
                        person.name
                      )
                        .charAt(0)
                        .toUpperCase()}
                    </div>

                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="truncate font-bold text-white">
                          {person.preferredName ??
                            person.name}
                        </p>

                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white/45">
                          {formatEnum(
                            person.relationship,
                          )}
                        </span>
                      </div>

                      <p className="mt-1 truncate text-sm text-white/35">
                        {getPrimaryIdentity(person)}
                      </p>
                    </div>

                    <span
                      className={`hidden shrink-0 rounded-full border px-3 py-1.5 text-xs font-bold sm:inline-flex ${
                        verified
                          ? "border-[#C6FF32]/20 bg-[#C6FF32]/10 text-[#C6FF32]"
                          : "border-white/10 bg-white/[0.04] text-white/40"
                      }`}
                    >
                      {formatEnum(
                        person.identityStatus,
                      )}
                    </span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}