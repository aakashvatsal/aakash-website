import { Container } from "@/components/ui/Container";

import type { JournalEntry } from "@/types/journal";

import { calculateWritingStreak } from "./journal.utils";

type JournalStatsProps = {
  entries: JournalEntry[];
};

export function JournalStats({
  entries,
}: JournalStatsProps) {
  const workouts = entries.filter(
    (entry) => entry.workout?.completed,
  ).length;

  const readingSessions = entries.filter(
    (entry) => entry.reading?.completed,
  ).length;

  const totalPages = entries.reduce(
    (total, entry) =>
      total + (entry.reading?.pagesRead || 0),
    0,
  );

  const streak = calculateWritingStreak(entries);

  const stats = [
    {
      label: "Entries",
      value: entries.length,
    },
    {
      label: "Workouts",
      value: workouts,
    },
    {
      label: "Reading",
      value: `${totalPages} pages`,
      detail: `${readingSessions} sessions`,
    },
    {
      label: "Writing streak",
      value: `${streak} ${streak === 1 ? "day" : "days"}`,
    },
  ];

  return (
    <section className="pb-24">
      <Container>
        <div className="grid border-y border-white/10 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div
              key={stat.label}
              className={[
                "py-8",
                index > 0
                  ? "border-t border-white/10 sm:border-t-0 sm:border-l"
                  : "",
                index === 2
                  ? "sm:border-l-0 sm:border-t lg:border-l lg:border-t-0"
                  : "",
              ].join(" ")}
            >
              <div className="px-0 sm:px-8">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                  {stat.label}
                </p>

                <p className="mt-3 text-3xl font-black tracking-[-0.05em] text-white">
                  {stat.value}
                </p>

                {stat.detail && (
                  <p className="mt-1 text-sm text-white/35">
                    {stat.detail}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}