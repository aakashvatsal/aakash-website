import type { JournalMood } from "@/types/journal";

import { getMoodLabel } from "./journal.utils";

type JournalMoodBadgeProps = {
  mood: JournalMood;
  score?: number;
};

const moodStyles: Record<JournalMood, string> = {
  focused:
    "border-[#C6FF32]/25 bg-[#C6FF32]/10 text-[#C6FF32]",
  calm: "border-sky-300/20 bg-sky-300/10 text-sky-200",
  creative:
    "border-violet-300/20 bg-violet-300/10 text-violet-200",
  happy:
    "border-yellow-300/20 bg-yellow-300/10 text-yellow-200",
  energetic:
    "border-orange-300/20 bg-orange-300/10 text-orange-200",
  neutral:
    "border-white/10 bg-white/[0.05] text-white/60",
  tired:
    "border-slate-300/20 bg-slate-300/10 text-slate-300",
  stressed:
    "border-red-300/20 bg-red-300/10 text-red-200",
  anxious:
    "border-amber-300/20 bg-amber-300/10 text-amber-200",
  low: "border-blue-300/20 bg-blue-300/10 text-blue-200",
};

export function JournalMoodBadge({
  mood,
  score,
}: JournalMoodBadgeProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-2 rounded-full border px-3 py-1.5",
        "text-xs font-black",
        moodStyles[mood],
      ].join(" ")}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current" />

      {getMoodLabel(mood)}

      {typeof score === "number" && (
        <span className="opacity-50">{score}/10</span>
      )}
    </span>
  );
}