"use client";

import { X } from "lucide-react";

type HealthMetricInputProps = {
  label: string;
  value?: number;
  onChange: (value?: number) => void;

  min?: number;
  max?: number;
  step?: number;

  suffix?: string;
  placeholder?: string;
  description?: string;

  disabled?: boolean;
};

export function HealthMetricInput({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  suffix,
  placeholder,
  description,
  disabled = false,
}: HealthMetricInputProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between gap-4">
        <label className="text-sm font-semibold text-white">
          {label}
        </label>

        {value !== undefined && (
          <button
            type="button"
            onClick={() => onChange(undefined)}
            disabled={disabled}
            className="text-white/30 transition hover:text-white"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      <div className="relative">
        <input
          type="number"
          value={value ?? ""}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          placeholder={placeholder}
          onChange={(event) => {
            const input = event.target.value;

            if (input === "") {
              onChange(undefined);
              return;
            }

            onChange(Number(input));
          }}
          className="h-11 w-full rounded-xl border border-white/10 bg-[#05090b] px-4 pr-16 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#C6FF32]/40 disabled:opacity-50"
        />

        {suffix && (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-white/40">
            {suffix}
          </span>
        )}
      </div>

      {description && (
        <p className="text-xs text-white/35">
          {description}
        </p>
      )}
    </div>
  );
}