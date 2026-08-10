import Link from "next/link";

import { JournalMoodBadge } from "@/components/features/journal/JournalMoodBadge";
import {
  formatJournalDate,
  getJournalPreview,
  getReadingValue,
  getSleepValue,
  getWorkoutValue,
} from "@/components/features/journal/journal.utils";
import type { JournalEntry } from "@/types/journal";

interface DailyJournalProps {
  journals: JournalEntry[];
}

export function DailyJournal({
  journals,
}: DailyJournalProps) {
  if (!journals.length) {
    return (
      <section className="border-t border-white/10 px-6 py-32 md:px-12 lg:px-16">
        <JournalHeader />
        <JournalEmptyState />
      </section>
    );
  }

  return (
    <section className="border-t border-white/10 px-6 py-32 md:px-12 lg:px-16">
      <JournalHeader />

      <div className="relative mt-24">
        <div
          aria-hidden
          className="absolute bottom-0 left-[7px] top-0 w-px bg-white/10 md:left-[155px]"
        />

        <div className="space-y-0">
          {journals.map((entry, index) => (
            <JournalTimelineEntry
              key={entry._id}
              entry={entry}
              isLatest={index === 0}
              isLast={index === journals.length - 1}
            />
          ))}
        </div>
      </div>

      <div className="mt-16 border-t border-white/10 pt-10 md:ml-[180px]">
        <Link
          href="/journal"
          className="group inline-flex items-center gap-3 text-sm font-black text-[#C6FF32]"
        >
          View the complete journal

          <span className="transition-transform duration-300 group-hover:translate-x-1">
            →
          </span>
        </Link>
      </div>
    </section>
  );
}

function JournalHeader() {
  return (
    <div className="max-w-6xl">
      <p className="text-xs font-black uppercase tracking-[0.35em] text-[#C6FF32]">
        Daily Journal
      </p>

      <h2 className="mt-6 text-6xl font-black tracking-[-0.06em] md:text-8xl">
        Every day teaches something.
      </h2>

      <p className="mt-8 max-w-3xl text-xl leading-9 text-white/55">
        Building companies is only half the journey. The other half is
        documenting what changes the way I think.
      </p>
    </div>
  );
}

function JournalTimelineEntry({
  entry,
  isLatest,
  isLast,
}: {
  entry: JournalEntry;
  isLatest: boolean;
  isLast: boolean;
}) {
  const preview = getJournalPreview(entry);
  const workout = getWorkoutValue(entry);
  const reading = getReadingValue(entry);
  const sleep = getSleepValue(entry);

  return (
    <article
      className={`relative grid gap-8 pb-16 pl-10 md:grid-cols-[130px_minmax(0,1fr)] md:gap-12 md:pl-0 ${
        isLast ? "pb-0" : ""
      }`}
    >
      <div className="absolute left-0 top-1.5 z-10 md:left-[148px]">
        <span
          className={`block rounded-full border-4 border-[#030608] ${
            isLatest
              ? "h-4 w-4 bg-[#C6FF32]"
              : "h-3.5 w-3.5 bg-white/25"
          }`}
        />
      </div>

      <div className="md:pr-6 md:text-right">
        <p className="text-sm leading-6 text-white/35">
          {formatJournalDate(entry.date)}
        </p>

        {isLatest && (
          <p className="mt-3 text-[10px] font-black uppercase tracking-[0.25em] text-[#C6FF32]">
            Latest entry
          </p>
        )}

        {entry.mood && (
          <div className="mt-4 flex md:justify-end">
            <JournalMoodBadge
              mood={entry.mood}
              score={entry.moodScore}
            />
          </div>
        )}
      </div>

      <Link
        href={`/journal/${entry.slug}`}
        className="group block border-b border-white/10 pb-16"
      >
        <div className="grid gap-10 xl:grid-cols-[minmax(0,1fr)_300px] xl:gap-16">
          <div>
            <h3
              className={`font-black leading-[1.03] tracking-[-0.055em] transition-colors duration-300 group-hover:text-[#C6FF32] ${
                isLatest
                  ? "text-4xl md:text-6xl"
                  : "text-3xl md:text-5xl"
              }`}
            >
              {entry.title}
            </h3>

            {entry.highlight && (
              <p className="mt-6 text-lg font-semibold leading-8 text-white/70">
                {entry.highlight}
              </p>
            )}

            {preview && preview !== entry.highlight && (
              <p className="mt-5 max-w-3xl text-base leading-8 text-white/45">
                {preview}
              </p>
            )}

            {entry.tags?.length > 0 && (
              <div className="mt-7 flex flex-wrap gap-2">
                {entry.tags.slice(0, 6).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full border border-white/10 bg-white/[0.025] px-3 py-1.5 text-xs font-bold text-white/40"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            <div className="mt-8 flex flex-wrap gap-x-8 gap-y-4">
              {entry.wins?.length > 0 && (
                <EntryCount
                  label="Wins"
                  value={entry.wins.length}
                />
              )}

              {entry.lessons?.length > 0 && (
                <EntryCount
                  label="Lessons"
                  value={entry.lessons.length}
                />
              )}

              {entry.decisions?.length > 0 && (
                <EntryCount
                  label="Decisions"
                  value={entry.decisions.length}
                />
              )}

              {entry.ideas?.length > 0 && (
                <EntryCount
                  label="Ideas"
                  value={entry.ideas.length}
                />
              )}

              {entry.challenges?.length > 0 && (
                <EntryCount
                  label="Challenges"
                  value={entry.challenges.length}
                />
              )}
            </div>

            <p className="mt-9 inline-flex items-center gap-3 text-sm font-black text-[#C6FF32]">
              Read full journal

              <span className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </p>
          </div>

          <aside className="grid grid-cols-2 gap-x-6 gap-y-8 border-t border-white/10 pt-7 sm:grid-cols-3 xl:grid-cols-2 xl:border-l xl:border-t-0 xl:pl-8 xl:pt-0">
            <JournalSignal
              label="Workout"
              value={workout.value}
              detail={workout.detail}
            />

            <JournalSignal
              label="Reading"
              value={reading.value}
              detail={reading.detail}
            />

            <JournalSignal
              label="Sleep"
              value={sleep.value}
              detail={sleep.detail}
            />

            <JournalSignal
              label="Steps"
              value={formatSteps(entry.steps)}
            />

            <JournalSignal
              label="Energy"
              value={formatScore(entry.energyScore)}
            />

            <JournalSignal
              label="Productivity"
              value={formatScore(entry.productivityScore)}
            />
          </aside>
        </div>
      </Link>
    </article>
  );
}

function JournalSignal({
  label,
  value,
  detail,
}: {
  label: string;
  value: string;
  detail?: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/25">
        {label}
      </p>

      <p className="mt-2 text-sm font-black leading-6 text-white/70">
        {value}
      </p>

      {detail && (
        <p className="mt-1 text-xs leading-5 text-white/30">
          {detail}
        </p>
      )}
    </div>
  );
}

function EntryCount({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div className="flex items-center gap-2 text-xs font-bold text-white/35">
      <span className="text-[#C6FF32]">{value}</span>
      <span>{label}</span>
    </div>
  );
}

function JournalEmptyState() {
  return (
    <div className="mt-24 border-y border-white/10 py-20">
      <p className="text-xs font-black uppercase tracking-[0.3em] text-[#C6FF32]">
        Journal
      </p>

      <h3 className="mt-5 text-3xl font-black tracking-[-0.04em]">
        No public entries yet.
      </h3>

      <p className="mt-4 max-w-xl text-base leading-7 text-white/45">
        Reflections, lessons and daily operating notes will appear here once
        they are published.
      </p>
    </div>
  );
}

function formatScore(
  score?: number | null,
): string {
  return typeof score === "number"
    ? `${score}/10`
    : "Not logged";
}

function formatSteps(
  steps?: number | null,
): string {
  return typeof steps === "number" && steps > 0
    ? steps.toLocaleString("en-IN")
    : "Not logged";
}