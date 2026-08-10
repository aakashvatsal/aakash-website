"use client";

import type {
  JournalEntryType,
  JournalMood,
} from "@/types/journal";

type JournalFiltersProps = {
  type: string;
  mood: string;

  favouriteOnly: boolean;
  privateOnly: boolean;
  archivedOnly: boolean;

  onTypeChange: (value: string) => void;
  onMoodChange: (value: string) => void;

  onFavouriteChange: (value: boolean) => void;
  onPrivateChange: (value: boolean) => void;
  onArchivedChange: (value: boolean) => void;
};

const entryTypes: {
  label: string;
  value: JournalEntryType;
}[] = [
  {
    label: "Daily",
    value: "daily",
  },
  {
    label: "Reflection",
    value: "reflection",
  },
  {
    label: "Decision",
    value: "decision",
  },
  {
    label: "Idea",
    value: "idea",
  },
  {
    label: "Gratitude",
    value: "gratitude",
  },
  {
    label: "Lesson",
    value: "lesson",
  },
  {
    label: "Meeting Note",
    value: "meeting_note",
  },
];

const moods: {
  label: string;
  value: JournalMood;
}[] = [
  {
    label: "Focused",
    value: "focused",
  },
  {
    label: "Calm",
    value: "calm",
  },
  {
    label: "Creative",
    value: "creative",
  },
  {
    label: "Happy",
    value: "happy",
  },
  {
    label: "Energetic",
    value: "energetic",
  },
  {
    label: "Neutral",
    value: "neutral",
  },
  {
    label: "Tired",
    value: "tired",
  },
  {
    label: "Stressed",
    value: "stressed",
  },
  {
    label: "Anxious",
    value: "anxious",
  },
  {
    label: "Low",
    value: "low",
  },
];

const selectClassName =
  "min-h-11 rounded-[14px] border border-white/10 bg-[#070b0d] px-3 text-sm capitalize text-white outline-none focus:border-[#C6FF32]/40";

const checkboxClassName =
  "flex min-h-11 items-center gap-3 rounded-[14px] border border-white/10 bg-white/[0.025] px-4 text-sm text-white/55";

export function JournalFilters({
  type,
  mood,
  favouriteOnly,
  privateOnly,
  archivedOnly,
  onTypeChange,
  onMoodChange,
  onFavouriteChange,
  onPrivateChange,
  onArchivedChange,
}: JournalFiltersProps) {
  return (
    <div className="flex flex-wrap gap-3">
      <select
        value={type}
        onChange={(event) =>
          onTypeChange(event.target.value)
        }
        className={selectClassName}
      >
        <option value="">
          All entry types
        </option>

        {entryTypes.map((entryType) => (
          <option
            key={entryType.value}
            value={entryType.value}
          >
            {entryType.label}
          </option>
        ))}
      </select>

      <select
        value={mood}
        onChange={(event) =>
          onMoodChange(event.target.value)
        }
        className={selectClassName}
      >
        <option value="">
          All moods
        </option>

        {moods.map((entryMood) => (
          <option
            key={entryMood.value}
            value={entryMood.value}
          >
            {entryMood.label}
          </option>
        ))}
      </select>

      <label className={checkboxClassName}>
        <input
          type="checkbox"
          checked={favouriteOnly}
          onChange={(event) =>
            onFavouriteChange(
              event.target.checked,
            )
          }
          className="h-4 w-4 accent-[#C6FF32]"
        />

        Favourites only
      </label>

      <label className={checkboxClassName}>
        <input
          type="checkbox"
          checked={privateOnly}
          onChange={(event) =>
            onPrivateChange(
              event.target.checked,
            )
          }
          className="h-4 w-4 accent-[#C6FF32]"
        />

        Private only
      </label>

      <label className={checkboxClassName}>
        <input
          type="checkbox"
          checked={archivedOnly}
          onChange={(event) =>
            onArchivedChange(
              event.target.checked,
            )
          }
          className="h-4 w-4 accent-[#C6FF32]"
        />

        Archived only
      </label>
    </div>
  );
}