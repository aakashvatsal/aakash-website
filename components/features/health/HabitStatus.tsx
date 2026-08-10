interface HabitStatusProps {
  label: string;
  completed: boolean;
}

export function HabitStatus({
  label,
  completed,
}: HabitStatusProps) {
  return (
    <div className="flex items-center justify-between gap-6 border-b border-white/10 py-4">
      <p className="text-sm font-bold text-white/65">
        {label}
      </p>

      <span
        className={`rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] ${
          completed
            ? "bg-[#C6FF32]/10 text-[#C6FF32]"
            : "bg-white/5 text-white/30"
        }`}
      >
        {completed ? "Completed" : "Missed"}
      </span>
    </div>
  );
}