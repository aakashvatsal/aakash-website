"use client";

import type {
  HealthMood,
} from "@/types/health";

type HealthMoodBadgeProps = {
  mood: HealthMood;
};

const moodStyles: Record<
  HealthMood,
  {
    label: string;
    className: string;
  }
> = {
  excellent: {
    label: "Excellent",
    className:
      "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
  },

  good: {
    label: "Good",
    className:
      "border-lime-500/20 bg-lime-500/10 text-lime-300",
  },

  neutral: {
    label: "Neutral",
    className:
      "border-zinc-500/20 bg-zinc-500/10 text-zinc-300",
  },

  low: {
    label: "Low",
    className:
      "border-amber-500/20 bg-amber-500/10 text-amber-300",
  },

  poor: {
    label: "Poor",
    className:
      "border-red-500/20 bg-red-500/10 text-red-300",
  },
};

export function HealthMoodBadge({
  mood,
}: HealthMoodBadgeProps) {
  const config =
    moodStyles[mood] ??
    moodStyles.neutral;

  return (
    <span
      className={[
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold",
        config.className,
      ].join(" ")}
    >
      {config.label}
    </span>
  );
}