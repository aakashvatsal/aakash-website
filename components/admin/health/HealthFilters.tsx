"use client";

import {
  Archive,
  Dumbbell,
  HeartPulse,
  ShieldCheck,
} from "lucide-react";

import type {
  HealthMood,
  WorkoutType,
} from "@/types/health";

type HealthFiltersProps = {
  mood: string;
  workoutType: string;

  archivedOnly: boolean;
  activeOnly: boolean;
  painOnly: boolean;
  workoutOnly: boolean;

  onMoodChange: (value: string) => void;
  onWorkoutTypeChange: (value: string) => void;

  onArchivedChange: (value: boolean) => void;
  onActiveChange: (value: boolean) => void;
  onPainChange: (value: boolean) => void;
  onWorkoutChange: (value: boolean) => void;
};

const healthMoods: {
  label: string;
  value: HealthMood;
}[] = [
  {
    label: "Excellent",
    value: "excellent",
  },
  {
    label: "Good",
    value: "good",
  },
  {
    label: "Neutral",
    value: "neutral",
  },
  {
    label: "Low",
    value: "low",
  },
  {
    label: "Poor",
    value: "poor",
  },
];

const workoutTypes: {
  label: string;
  value: WorkoutType;
}[] = [
  {
    label: "Push",
    value: "push",
  },
  {
    label: "Pull",
    value: "pull",
  },
  {
    label: "Legs",
    value: "legs",
  },
  {
    label: "Full Body",
    value: "full_body",
  },
  {
    label: "Walk",
    value: "walk",
  },
  {
    label: "Run",
    value: "run",
  },
  {
    label: "Cycling",
    value: "cycling",
  },
  {
    label: "Swimming",
    value: "swimming",
  },
  {
    label: "Sports",
    value: "sports",
  },
  {
    label: "Mobility",
    value: "mobility",
  },
  {
    label: "Yoga",
    value: "yoga",
  },
  {
    label: "Abs",
    value: "abs",
  },
  {
    label: "Rest",
    value: "rest",
  },
  {
    label: "Other",
    value: "other",
  },
];

const fieldClassName =
  "min-h-11 rounded-[14px] border border-white/10 bg-[#05090b] px-4 text-sm text-white outline-none transition focus:border-[#C6FF32]/40";

export function HealthFilters({
  mood,
  workoutType,
  archivedOnly,
  activeOnly,
  painOnly,
  workoutOnly,
  onMoodChange,
  onWorkoutTypeChange,
  onArchivedChange,
  onActiveChange,
  onPainChange,
  onWorkoutChange,
}: HealthFiltersProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap gap-3">
        <select
          value={mood}
          onChange={(event) =>
            onMoodChange(event.target.value)
          }
          className={fieldClassName}
        >
          <option value="">
            All moods
          </option>

          {healthMoods.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>

        <select
          value={workoutType}
          onChange={(event) =>
            onWorkoutTypeChange(
              event.target.value,
            )
          }
          className={fieldClassName}
        >
          <option value="">
            All workout types
          </option>

          {workoutTypes.map((option) => (
            <option
              key={option.value}
              value={option.value}
            >
              {option.label}
            </option>
          ))}
        </select>

        <FilterToggle
          active={workoutOnly}
          label="Has workout"
          icon={Dumbbell}
          onClick={() =>
            onWorkoutChange(!workoutOnly)
          }
        />

        <FilterToggle
          active={painOnly}
          label="Has pain"
          icon={HeartPulse}
          onClick={() =>
            onPainChange(!painOnly)
          }
        />
      </div>

      <div className="flex flex-wrap gap-3">
        <FilterToggle
          active={activeOnly}
          label="Active only"
          icon={ShieldCheck}
          onClick={() =>
            onActiveChange(!activeOnly)
          }
        />

        <FilterToggle
          active={archivedOnly}
          label="Archived only"
          icon={Archive}
          onClick={() =>
            onArchivedChange(!archivedOnly)
          }
        />
      </div>
    </div>
  );
}

type FilterToggleProps = {
  active: boolean;
  label: string;
  icon: React.ComponentType<{
    className?: string;
  }>;
  onClick: () => void;
};

function FilterToggle({
  active,
  label,
  icon: Icon,
  onClick,
}: FilterToggleProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={[
        "inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] border px-4 text-sm font-bold transition",
        active
          ? "border-[#C6FF32]/30 bg-[#C6FF32]/10 text-[#C6FF32]"
          : "border-white/10 bg-[#05090b] text-white/40 hover:border-white/20 hover:text-white/70",
      ].join(" ")}
    >
      <Icon className="h-4 w-4" />

      {label}
    </button>
  );
}