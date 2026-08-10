type JournalDetailMetricProps = {
  label: string;
  value: string | number;
  detail?: string;
};

export function JournalDetailMetric({
  label,
  value,
  detail,
}: JournalDetailMetricProps) {
  return (
    <div className="border-t border-white/10 pt-5">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
        {label}
      </p>

      <p className="mt-3 text-xl font-black tracking-[-0.03em] text-white">
        {value}
      </p>

      {detail && (
        <p className="mt-2 text-sm leading-6 text-white/40">
          {detail}
        </p>
      )}
    </div>
  );
}