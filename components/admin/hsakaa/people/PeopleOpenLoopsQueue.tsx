import Link from "next/link";
import { CalendarClock, ChevronRight } from "lucide-react";

import {
  PersonOpenLoopStatus,
  type PersonOpenLoop,
  type PersonOpenLoopList,
  type PersonOpenLoopPerson,
} from "@/types/hsakaa";

type PeopleOpenLoopsQueueProps = {
  initialOpenLoops: PersonOpenLoopList;
};

function formatEnum(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatDate(value?: string) {
  if (!value) {
    return "No due date";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "No due date";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function isPerson(value: PersonOpenLoop["personId"]): value is PersonOpenLoopPerson {
  return typeof value === "object" && value !== null && "_id" in value;
}

function isOverdue(loop: PersonOpenLoop) {
  if (loop.status !== PersonOpenLoopStatus.OPEN || !loop.dueAt) {
    return false;
  }

  const dueAt = new Date(loop.dueAt).getTime();
  return Number.isFinite(dueAt) && dueAt < Date.now();
}

export function PeopleOpenLoopsQueue({
  initialOpenLoops,
}: PeopleOpenLoopsQueueProps) {
  const visible = (initialOpenLoops.data ?? []).slice(0, 20);
  const summary = initialOpenLoops.summary;

  return (
    <section className="rounded-[24px] border border-white/10 bg-white/[0.025]">
      <div className="border-b border-white/10 p-5 sm:p-6">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#C6FF32]">
          Phase 5C · Open loops
        </p>
        <h2 className="mt-2 text-xl font-black tracking-[-0.03em] text-white">
          Who needs a follow-up?
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/40">
          The unresolved relationship queue HSAKAA can use when you ask who you
          are forgetting to follow up with.
        </p>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard label="Open" value={summary.open} />
          <SummaryCard label="Overdue" value={summary.overdue} attention />
          <SummaryCard label="Due in 7 days" value={summary.dueWithinSevenDays} />
          <SummaryCard label="No due date" value={summary.withoutDueDate} />
        </div>

        {visible.length ? (
          <div className="space-y-3">
            {visible.map((loop) => {
              const person = isPerson(loop.personId) ? loop.personId : null;
              const name = person?.preferredName ?? person?.name ?? "Unknown person";
              const overdue = isOverdue(loop);

              if (!person) {
                return null;
              }

              return (
                <Link
                  key={loop._id}
                  href={`/admin/hsakaa/people/${person._id}`}
                  className={`group flex flex-col gap-4 rounded-[18px] border p-4 transition hover:border-white/20 sm:flex-row sm:items-center sm:justify-between ${
                    overdue
                      ? "border-red-300/20 bg-red-300/[0.04]"
                      : "border-white/10 bg-black/10"
                  }`}
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-black text-white">{name}</p>
                      <span className="rounded-full border border-[#C6FF32]/20 bg-[#C6FF32]/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-[#C6FF32]">
                        {formatEnum(loop.kind)}
                      </span>
                      {overdue ? (
                        <span className="rounded-full border border-red-300/20 bg-red-300/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-red-200">
                          Overdue
                        </span>
                      ) : null}
                    </div>

                    <p className="mt-2 text-sm font-bold text-white/65">{loop.title}</p>

                    <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-white/30">
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarClock className="h-3.5 w-3.5" />
                        {formatDate(loop.dueAt)}
                      </span>
                      {person.organizationName ? <span>{person.organizationName}</span> : null}
                    </div>
                  </div>

                  <ChevronRight className="h-4 w-4 shrink-0 text-white/25 transition group-hover:text-[#C6FF32]" />
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[18px] border border-dashed border-white/10 p-7 text-center">
            <p className="font-black text-white/60">No relationship open loops.</p>
            <p className="mt-2 text-sm text-white/30">
              Open a person profile to capture the first pending follow-up or promise.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function SummaryCard({
  label,
  value,
  attention = false,
}: {
  label: string;
  value: number;
  attention?: boolean;
}) {
  return (
    <div className="rounded-[18px] border border-white/10 bg-black/10 p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white/25">
        {label}
      </p>
      <p
        className={`mt-2 text-2xl font-black ${
          attention && value > 0 ? "text-red-200" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
