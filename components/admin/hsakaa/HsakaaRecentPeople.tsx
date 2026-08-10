import Link from "next/link";
import {
  ArrowRight,
  ShieldCheck,
  ShieldQuestion,
  UserRound,
} from "lucide-react";

import type { MemoryPerson } from "@/types/hsakaa";

type HsakaaRecentPeopleProps = {
  people: MemoryPerson[];
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

function getPrimaryIdentity(
  person: MemoryPerson,
) {
  const email =
    person.emails.find(
      (item) => item.isPrimary,
    ) ?? person.emails[0];

  if (email?.email) {
    return email.email;
  }

  const phone =
    person.phoneNumbers.find(
      (item) => item.isPrimary,
    ) ?? person.phoneNumbers[0];

  if (phone?.phoneNumber) {
    return [
      phone.countryCode,
      phone.phoneNumber,
    ]
      .filter(Boolean)
      .join(" ");
  }

  return "No email or phone added";
}

export function HsakaaRecentPeople({
  people,
}: HsakaaRecentPeopleProps) {
  return (
    <section className="overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.025]">
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

      {people.length === 0 ? (
        <div className="px-5 py-10 text-center">
          <div className="mx-auto grid h-12 w-12 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/35">
            <UserRound className="h-5 w-5" />
          </div>

          <h3 className="mt-4 font-bold text-white">
            No people added
          </h3>

          <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-white/40">
            Add someone HSAKAA should recognise
            and associate with personal memories.
          </p>

          <Link
            href="/admin/hsakaa/people/new"
            className="mt-5 inline-flex min-h-11 items-center justify-center rounded-2xl bg-[#C6FF32] px-5 text-sm font-black text-[#030608]"
          >
            Add first person
          </Link>
        </div>
      ) : (
        <div className="divide-y divide-white/10">
          {people.map((person) => {
            const verified =
              person.identityStatus ===
              "verified";

            const StatusIcon = verified
              ? ShieldCheck
              : ShieldQuestion;

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

                <div
                  className={`hidden shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-bold sm:flex ${
                    verified
                      ? "border-[#C6FF32]/20 bg-[#C6FF32]/10 text-[#C6FF32]"
                      : "border-white/10 bg-white/[0.04] text-white/40"
                  }`}
                >
                  <StatusIcon className="h-3.5 w-3.5" />

                  {formatEnum(
                    person.identityStatus,
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}