import type { JournalMood } from "@/types/journal";

type MoodBadgeProps = {
  mood: JournalMood;
  score?: number;
};

const moodStyles: Record<
  JournalMood,
  string
> = {
  focused:
    "border-[#C6FF32]/20 bg-[#C6FF32]/10 text-[#C6FF32]",
  calm:
    "border-cyan-400/20 bg-cyan-400/10 text-cyan-300",
  creative:
    "border-violet-400/20 bg-violet-400/10 text-violet-300",
  happy:
    "border-yellow-400/20 bg-yellow-400/10 text-yellow-300",
  energetic:
    "border-orange-400/20 bg-orange-400/10 text-orange-300",
  neutral:
    "border-white/10 bg-white/[0.04] text-white/50",
  tired:
    "border-slate-400/20 bg-slate-400/10 text-slate-300",
  stressed:
    "border-red-400/20 bg-red-400/10 text-red-300",
  anxious:
    "border-amber-400/20 bg-amber-400/10 text-amber-300",
  low:
    "border-blue-400/20 bg-blue-400/10 text-blue-300",
};

export function MoodBadge({
  mood,
  score,
}: MoodBadgeProps) {
  return (
    <span
      className={[
        "inline-flex min-h-7 items-center gap-1.5 rounded-full border px-3 text-xs font-bold capitalize",
        moodStyles[mood],
      ].join(" ")}
    >
      {mood.replaceAll("_", " ")}

      {typeof score === "number" && (
        <span className="opacity-60">
          {score}/10
        </span>
      )}
    </span>
  );
}