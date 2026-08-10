"use client";

import { useMemo } from "react";
import {
  BookOpen,
  Brain,
  Dumbbell,
  Flame,
  NotebookPen,
  Smile,
  type LucideIcon,
} from "lucide-react";

import type {
  JournalEntry,
  JournalMood,
} from "@/types/journal";

type JournalStatsProps = {
  entries: JournalEntry[];
};

type JournalSummary = {
  totalEntries: number;
  currentStreak: number;
  averageMood: number;
  dominantMood: JournalMood | null;
  workoutPercentage: number;
  pagesRead: number;
  knowledgeCaptured: number;
};

type SummaryCard = {
  key: string;
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
};

function normalizeDate(date: string) {
  const value = new Date(date);

  if (Number.isNaN(value.getTime())) {
    return null;
  }

  return new Date(
    value.getFullYear(),
    value.getMonth(),
    value.getDate(),
  );
}

function getCurrentStreak(
  entries: JournalEntry[],
) {
  const uniqueDates = Array.from(
    new Set(
      entries
        .map((entry) =>
          normalizeDate(entry.date),
        )
        .filter(
          (
            date,
          ): date is Date => date !== null,
        )
        .map((date) => date.getTime()),
    ),
  ).sort((first, second) => second - first);

  if (uniqueDates.length === 0) {
    return 0;
  }

  let streak = 1;

  for (
    let index = 1;
    index < uniqueDates.length;
    index += 1
  ) {
    const previousDate = new Date(
      uniqueDates[index - 1],
    );

    const currentDate = new Date(
      uniqueDates[index],
    );

    const differenceInDays = Math.round(
      (previousDate.getTime() -
        currentDate.getTime()) /
        (1000 * 60 * 60 * 24),
    );

    if (differenceInDays === 1) {
      streak += 1;
      continue;
    }

    break;
  }

  return streak;
}

function getDominantMood(
  entries: JournalEntry[],
) {
  const moodCounts = new Map<
    JournalMood,
    number
  >();

  for (const entry of entries) {
    if (!entry.mood) {
      continue;
    }

    moodCounts.set(
      entry.mood,
      (moodCounts.get(entry.mood) ?? 0) +
        1,
    );
  }

  let dominantMood: JournalMood | null =
    null;

  let highestCount = 0;

  for (const [
    mood,
    count,
  ] of moodCounts.entries()) {
    if (count > highestCount) {
      dominantMood = mood;
      highestCount = count;
    }
  }

  return dominantMood;
}

function formatMood(mood: JournalMood | null) {
  if (!mood) {
    return "No data";
  }

  return mood
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

function getJournalSummary(
  entries: JournalEntry[],
): JournalSummary {
  const totalEntries = entries.length;

  if (totalEntries === 0) {
    return {
      totalEntries: 0,
      currentStreak: 0,
      averageMood: 0,
      dominantMood: null,
      workoutPercentage: 0,
      pagesRead: 0,
      knowledgeCaptured: 0,
    };
  }

  const entriesWithMoodScore =
    entries.filter(
      (entry) =>
        typeof entry.moodScore ===
          "number" &&
        Number.isFinite(entry.moodScore),
    );

  const totalMoodScore =
    entriesWithMoodScore.reduce(
      (total, entry) =>
        total + (entry.moodScore ?? 0),
      0,
    );

  const averageMood =
    entriesWithMoodScore.length > 0
      ? Number(
          (
            totalMoodScore /
            entriesWithMoodScore.length
          ).toFixed(1),
        )
      : 0;

  const completedWorkouts =
    entries.filter(
      (entry) =>
        entry.workout?.completed === true,
    ).length;

  const workoutPercentage = Math.round(
    (completedWorkouts / totalEntries) *
      100,
  );

  const pagesRead = entries.reduce(
    (total, entry) =>
      total +
      Math.max(
        Number(
          entry.reading?.pagesRead ?? 0,
        ),
        0,
      ),
    0,
  );

  const knowledgeCaptured =
    entries.reduce(
      (total, entry) =>
        total +
        (entry.ideas?.length ?? 0) +
        (entry.lessons?.length ?? 0) +
        (entry.decisions?.length ?? 0),
      0,
    );

  return {
    totalEntries,
    currentStreak:
      getCurrentStreak(entries),
    averageMood,
    dominantMood:
      getDominantMood(entries),
    workoutPercentage,
    pagesRead,
    knowledgeCaptured,
  };
}

function JournalStatCard({
  title,
  value,
  description,
  icon: Icon,
}: Omit<SummaryCard, "key">) {
  return (
    <article className="group relative min-w-0 overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.025] p-5 transition duration-300 hover:border-[#C6FF32]/20 hover:bg-white/[0.04]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      <div className="flex items-start justify-between gap-3">
        <p className="truncate text-xs font-black uppercase tracking-[0.18em] text-white/35">
          {title}
        </p>

        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] border border-[#C6FF32]/10 bg-[#C6FF32]/[0.07] text-[#C6FF32] transition group-hover:border-[#C6FF32]/20 group-hover:bg-[#C6FF32]/10">
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <p className="mt-5 truncate text-2xl font-black tracking-[-0.04em] text-white 2xl:text-3xl">
        {value}
      </p>

      <p className="mt-2 truncate text-xs font-medium text-white/35">
        {description}
      </p>
    </article>
  );
}

export function JournalStats({
  entries,
}: JournalStatsProps) {
  const summary = useMemo(
    () => getJournalSummary(entries),
    [entries],
  );

  const cards =
    useMemo<SummaryCard[]>(() => {
      return [
        {
          key: "entries",
          title: "Entries",
          value:
            summary.totalEntries.toLocaleString(
              "en-IN",
            ),
          description:
            "Total journal entries",
          icon: NotebookPen,
        },
        {
          key: "streak",
          title: "Streak",
          value: `${summary.currentStreak} ${
            summary.currentStreak === 1
              ? "Day"
              : "Days"
          }`,
          description:
            "Current writing streak",
          icon: Flame,
        },
        {
          key: "mood",
          title: "Mood",
          value: formatMood(
            summary.dominantMood,
          ),
          description:
            summary.averageMood > 0
              ? `Average ${summary.averageMood} / 10`
              : "No mood score available",
          icon: Smile,
        },
        {
          key: "workout",
          title: "Workout",
          value: `${summary.workoutPercentage}%`,
          description:
            "Entries with completed workout",
          icon: Dumbbell,
        },
        {
          key: "reading",
          title: "Reading",
          value:
            summary.pagesRead.toLocaleString(
              "en-IN",
            ),
          description: "Total pages read",
          icon: BookOpen,
        },
        {
          key: "knowledge",
          title: "Knowledge",
          value:
            summary.knowledgeCaptured.toLocaleString(
              "en-IN",
            ),
          description:
            "Ideas, lessons and decisions",
          icon: Brain,
        },
      ];
    }, [summary]);

  return (
    <section aria-label="Journal summary">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map((card) => (
          <JournalStatCard
            key={card.key}
            title={card.title}
            value={card.value}
            description={card.description}
            icon={card.icon}
          />
        ))}
      </div>
    </section>
  );
}