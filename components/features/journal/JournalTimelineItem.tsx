import Link from "next/link";

import type { JournalEntry } from "@/types/journal";

import { JournalMoodBadge } from "./JournalMoodBadge";
import { JournalTag } from "./JournalTag";
import {
  formatJournalDate,
  getJournalPreview,
  getReadingValue,
  getSleepValue,
  getWorkoutValue,
} from "./journal.utils";

type JournalTimelineItemProps = {
  entry: JournalEntry;
};

export function JournalTimelineItem({
  entry,
}: JournalTimelineItemProps) {
  const workout = getWorkoutValue(entry);
  const reading = getReadingValue(entry);
  const sleep = getSleepValue(entry);

  return (
    <article className="relative grid gap-8 border-t border-white/10 py-14 lg:grid-cols-[220px_1fr]">
      <div>
        <div className="flex items-center gap-3">
          <span className="h-2.5 w-2.5 rounded-full bg-[#C6FF32]" />

          <p className="text-sm text-white/40">
            {formatJournalDate(entry.date)}
          </p>
        </div>

        <div className="mt-5">
          <JournalMoodBadge
            mood={entry.mood}
            score={entry.moodScore}
          />
        </div>
      </div>

      <div>
        <Link href={`/journal/${entry.slug}`}>
          <h3 className="max-w-4xl text-3xl font-black leading-tight tracking-[-0.05em] transition hover:text-[#C6FF32] sm:text-4xl">
            {entry.title}
          </h3>
        </Link>

        {getJournalPreview(entry) && (
          <p className="mt-6 max-w-3xl text-lg leading-8 text-white/55">
            {getJournalPreview(entry)}
          </p>
        )}

        <div className="mt-8 grid gap-5 sm:grid-cols-3">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/25">
              Workout
            </p>

            <p className="mt-2 text-sm font-bold text-white/65">
              {workout.value}
            </p>

            {workout.detail && (
              <p className="mt-1 text-xs text-white/30">
                {workout.detail}
              </p>
            )}
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/25">
              Reading
            </p>

            <p className="mt-2 text-sm font-bold text-white/65">
              {reading.value}
            </p>

            {reading.detail && (
              <p className="mt-1 text-xs text-white/30">
                {reading.detail}
              </p>
            )}
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/25">
              Sleep
            </p>

            <p className="mt-2 text-sm font-bold text-white/65">
              {sleep.value}
            </p>

            {sleep.detail && (
              <p className="mt-1 text-xs text-white/30">
                {sleep.detail}
              </p>
            )}
          </div>
        </div>

        {entry.wins.length > 0 && (
          <div className="mt-8 border-l border-[#C6FF32]/30 pl-5">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C6FF32]">
              Win
            </p>

            <p className="mt-2 text-sm leading-7 text-white/55">
              {entry.wins[0]}
            </p>
          </div>
        )}

        {entry.tags.length > 0 && (
          <div className="mt-8 flex flex-wrap gap-2">
            {entry.tags.map((tag) => (
              <JournalTag key={tag} value={tag} />
            ))}
          </div>
        )}

        <Link
          href={`/journal/${entry.slug}`}
          className="mt-8 inline-flex items-center gap-2 text-sm font-black text-[#C6FF32]"
        >
          Read entry
          <span aria-hidden>→</span>
        </Link>
      </div>
    </article>
  );
}