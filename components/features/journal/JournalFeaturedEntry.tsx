import Link from "next/link";

import { Container } from "@/components/ui/Container";

import type { JournalEntry } from "@/types/journal";

import { JournalMetric } from "./JournalMetric";
import { JournalMoodBadge } from "./JournalMoodBadge";
import { JournalTag } from "./JournalTag";
import {
  formatJournalDate,
  getJournalPreview,
  getReadingValue,
  getSleepValue,
  getTypeLabel,
  getWorkoutValue,
} from "./journal.utils";

type JournalFeaturedEntryProps = {
  entry: JournalEntry;
};

export function JournalFeaturedEntry({
  entry,
}: JournalFeaturedEntryProps) {
  const workout = getWorkoutValue(entry);
  const reading = getReadingValue(entry);
  const sleep = getSleepValue(entry);

  return (
    <section className="pb-32">
      <Container>
        <div className="grid gap-16 border-t border-white/10 pt-14 lg:grid-cols-[1fr_380px]">
          <div>
            <div className="flex flex-wrap items-center gap-4">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#C6FF32]">
                Latest entry
              </p>

              <p className="text-sm text-white/35">
                {formatJournalDate(entry.date)}
              </p>

              <JournalMoodBadge
                mood={entry.mood}
                score={entry.moodScore}
              />
            </div>

            <Link href={`/journal/${entry.slug}`}>
              <h2 className="mt-8 max-w-5xl text-5xl font-black leading-[0.98] tracking-[-0.06em] transition hover:text-[#C6FF32] sm:text-6xl lg:text-7xl">
                {entry.title}
              </h2>
            </Link>

            {getJournalPreview(entry) && (
              <p className="mt-8 max-w-3xl text-xl leading-9 text-white/60">
                {getJournalPreview(entry)}
              </p>
            )}

            {entry.tags.length > 0 && (
              <div className="mt-10 flex flex-wrap gap-2">
                {entry.tags.map((tag) => (
                  <JournalTag key={tag} value={tag} />
                ))}
              </div>
            )}

            <Link
              href={`/journal/${entry.slug}`}
              className="mt-12 inline-flex items-center gap-2 text-sm font-black text-[#C6FF32]"
            >
              Open full entry
              <span aria-hidden>→</span>
            </Link>
          </div>

          <aside className="grid gap-8 sm:grid-cols-2 lg:grid-cols-1">
            <JournalMetric
              label="Type"
              value={getTypeLabel(entry.type)}
            />

            <JournalMetric
              label="Workout"
              value={workout.value}
              detail={workout.detail}
            />

            <JournalMetric
              label="Reading"
              value={reading.value}
              detail={reading.detail}
            />

            <JournalMetric
              label="Sleep"
              value={sleep.value}
              detail={sleep.detail}
            />

            <div className="grid grid-cols-2 gap-6">
              <JournalMetric
                label="Energy"
                value={
                  typeof entry.energyScore === "number"
                    ? `${entry.energyScore}/10`
                    : "Not logged"
                }
              />

              <JournalMetric
                label="Steps"
                value={
                  entry.steps > 0
                    ? entry.steps.toLocaleString("en-IN")
                    : "Not logged"
                }
              />
            </div>
          </aside>
        </div>
      </Container>
    </section>
  );
}