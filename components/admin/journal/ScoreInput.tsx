"use client";

type ScoreInputProps = {
  label: string;
  value?: number;
  min?: number;
  max?: number;
  optional?: boolean;
  description?: string;
  onChange: (value?: number) => void;
};

export function ScoreInput({
  label,
  value,
  min = 0,
  max = 10,
  optional = true,
  description,
  onChange,
}: ScoreInputProps) {
  const displayValue =
    typeof value === "number" ? value : min;

  return (
    <div className="rounded-[18px] border border-white/10 bg-white/[0.025] p-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-white/70">
            {label}
          </p>

          {description && (
            <p className="mt-1 text-xs leading-5 text-white/30">
              {description}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2">
          {optional && typeof value === "number" && (
            <button
              type="button"
              onClick={() => onChange(undefined)}
              className="text-xs font-bold text-white/30 transition hover:text-white"
            >
              Clear
            </button>
          )}

          <span className="min-w-12 text-right text-lg font-black text-[#C6FF32]">
            {typeof value === "number"
              ? `${value}/${max}`
              : "—"}
          </span>
        </div>
      </div>

      <input
        type="range"
        min={min}
        max={max}
        step={1}
        value={displayValue}
        onChange={(event) =>
          onChange(Number(event.target.value))
        }
        className="mt-5 w-full accent-[#C6FF32]"
      />

      <div className="mt-2 flex justify-between text-[10px] font-bold text-white/20">
        <span>{min}</span>
        <span>{max}</span>
      </div>
    </div>
  );
}