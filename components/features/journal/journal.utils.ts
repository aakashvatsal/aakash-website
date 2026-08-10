import type {
  JournalEntry,
  JournalEntryType,
  JournalMood,
} from "@/types/journal";

export function formatJournalDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatJournalMonth(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatJournalLabel(value?: string) {
  if (!value) {
    return "Not logged";
  }

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

export function getJournalPreview(
  entry: JournalEntry,
) {
  const value =
    entry.highlight?.trim() ||
    entry.content?.trim() ||
    entry.lessons?.[0]?.trim() ||
    entry.ideas?.[0]?.trim() ||
    entry.wins?.[0]?.trim() ||
    "";

  if (value.length <= 220) {
    return value;
  }

  return `${value.slice(0, 217).trim()}...`;
}

export function getWorkoutValue(
  entry: JournalEntry,
) {
  const workout = entry.workout;

  if (!workout?.completed) {
    return {
      value: "Rest day",
      detail: "No workout logged",
    };
  }

  const durationMinutes =
    workout.durationMinutes ?? 0;

  return {
    value: workout.type
      ? formatJournalLabel(workout.type)
      : workout.title || "Completed",

    detail:
      durationMinutes > 0
        ? `${durationMinutes} minutes`
        : undefined,
  };
}

export function getReadingValue(
  entry: JournalEntry,
) {
  const reading = entry.reading;

  if (!reading?.completed) {
    return {
      value: "Not logged",
      detail: "No reading recorded",
    };
  }

  const pagesRead =
    reading.pagesRead ?? 0;

  return {
    value:
      reading.title ||
      "Reading completed",

    detail:
      pagesRead > 0
        ? `${pagesRead} pages`
        : undefined,
  };
}

export function getSleepValue(
  entry: JournalEntry,
) {
  const sleep = entry.sleep;

  const durationHours =
    sleep?.durationHours ?? 0;

  if (durationHours <= 0) {
    return {
      value: "Not logged",
      detail: undefined,
    };
  }

  const quality =
    sleep?.quality;

  return {
    value: `${durationHours} hrs`,

    detail:
      typeof quality === "number"
        ? `Quality ${quality}/10`
        : undefined,
  };
}

export function getMoodLabel(
  mood: JournalMood,
) {
  return formatJournalLabel(mood);
}

export function getTypeLabel(
  type: JournalEntryType,
) {
  return formatJournalLabel(type);
}

export function calculateWritingStreak(
  entries: JournalEntry[],
) {
  if (!entries.length) {
    return 0;
  }

  const uniqueDays = Array.from(
    new Set(
      entries.map((entry) => {
        const date =
          new Date(entry.date);

        return new Date(
          date.getFullYear(),
          date.getMonth(),
          date.getDate(),
        ).getTime();
      }),
    ),
  ).sort(
    (first, second) =>
      second - first,
  );

  if (uniqueDays.length === 0) {
    return 0;
  }

  let streak = 1;

  for (
    let index = 1;
    index < uniqueDays.length;
    index += 1
  ) {
    const previous =
      uniqueDays[index - 1];

    const current =
      uniqueDays[index];

    const differenceInDays =
      Math.round(
        (previous - current) /
          86_400_000,
      );

    if (differenceInDays !== 1) {
      break;
    }

    streak += 1;
  }

  return streak;
}