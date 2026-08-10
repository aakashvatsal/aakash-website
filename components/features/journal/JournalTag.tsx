type JournalTagProps = {
  value: string;
};

export function JournalTag({
  value,
}: JournalTagProps) {
  return (
    <span className="inline-flex rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-bold text-white/50">
      {value}
    </span>
  );
}