import Link from "next/link";
import { Clock3, RadioTower, UsersRound } from "lucide-react";

import type { PersonContactGapList } from "@/types/hsakaa";

type PeopleReconnectQueueProps = {
  initialContactGaps: PersonContactGapList;
};

function formatDate(value?: string | null) {
  if (!value) return "No recorded contact";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "No recorded contact";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function PeopleReconnectQueue({
  initialContactGaps,
}: PeopleReconnectQueueProps) {
  const visible = (initialContactGaps.data ?? []).slice(0, 20);
  const days = initialContactGaps.summary.dormantDays;

  return (
    <section className="rounded-[24px] border border-white/10 bg-white/[0.025]">
      <div className="border-b border-white/10 p-5 sm:p-6">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#C6FF32]">
          Phase 5D · Relationship context
        </p>
        <h2 className="mt-2 text-xl font-black tracking-[-0.03em] text-white">
          Relationships going quiet
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/40">
          Active saved relationships quiet for at least {days} days. Recorded
          contact gaps are kept separate from people who have never had a contact
          recorded, so HSAKAA does not invent a last-contact history.
        </p>
      </div>

      <div className="space-y-5 p-5 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard
            icon={<UsersRound className="h-4 w-4" />}
            label={`${days}+ day gaps`}
            value={initialContactGaps.summary.count}
          />
          <SummaryCard
            icon={<Clock3 className="h-4 w-4" />}
            label="Recorded gaps"
            value={initialContactGaps.summary.recordedContactGapCount}
          />
          <SummaryCard
            icon={<RadioTower className="h-4 w-4" />}
            label="Never contacted"
            value={initialContactGaps.summary.neverContactedCount}
          />
          <SummaryCard
            icon={<RadioTower className="h-4 w-4" />}
            label="Context filter"
            value={initialContactGaps.summary.context || "All"}
          />
        </div>

        {visible.length ? (
          <div className="grid gap-3 lg:grid-cols-2">
            {visible.map((item) => (
              <Link
                key={item.person.personId}
                href={`/admin/hsakaa/people/${item.person.personId}`}
                className="group rounded-[18px] border border-white/10 bg-black/10 p-4 transition hover:border-white/20"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <p className="text-sm font-black text-white">
                      {item.person.name}
                    </p>
                    <p className="mt-1 text-xs text-white/35">
                      {[item.person.roleTitle, item.person.organizationName]
                        .filter(Boolean)
                        .join(" · ") || item.person.relationship}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full border border-amber-300/20 bg-amber-300/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-amber-200">
                    {item.hasRecordedContact
                      ? `${item.daysSinceLastContact ?? 0} days`
                      : "Never contacted"}
                  </span>
                </div>

                <p className="mt-3 text-xs text-white/30">
                  {item.hasRecordedContact
                    ? `Last contact: ${formatDate(item.lastContactAt)}`
                    : `No recorded contact · known for ${item.daysSinceKnown ?? item.daysSinceGapReference ?? 0} days`}
                </p>

                {item.connectionContexts.length ? (
                  <div className="mt-3 flex flex-wrap gap-2">
                    {item.connectionContexts.slice(0, 5).map((context) => (
                      <span
                        key={context}
                        className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-bold text-white/45"
                      >
                        {context}
                      </span>
                    ))}
                  </div>
                ) : null}
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-[18px] border border-dashed border-white/10 p-7 text-center">
            <p className="font-black text-white/60">No dormant relationships.</p>
            <p className="mt-2 text-sm text-white/30">
              Nobody currently crosses the {days}-day threshold.
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function SummaryCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-[18px] border border-white/10 bg-black/10 p-4">
      <div className="flex items-center gap-2 text-white/30">
        {icon}
        <p className="text-[10px] font-black uppercase tracking-[0.15em]">
          {label}
        </p>
      </div>
      <p className="mt-2 text-2xl font-black text-white">{value}</p>
    </div>
  );
}
