"use client";

import { KeyboardEvent, useState } from "react";
import { Plus, Trash2 } from "lucide-react";

type HealthStringListEditorProps = {
  title: string;
  description?: string;
  placeholder?: string;

  values: string[];
  onChange: (values: string[]) => void;
};

export function HealthStringListEditor({
  title,
  description,
  placeholder = "Add item...",
  values,
  onChange,
}: HealthStringListEditorProps) {
  const [value, setValue] = useState("");

  function addValue() {
    const trimmed = value.trim();

    if (!trimmed) return;

    if (
      values.some(
        (item) =>
          item.toLowerCase() === trimmed.toLowerCase(),
      )
    ) {
      setValue("");
      return;
    }

    onChange([...values, trimmed]);
    setValue("");
  }

  function remove(index: number) {
    onChange(values.filter((_, i) => i !== index));
  }

  function onKeyDown(
    event: KeyboardEvent<HTMLInputElement>,
  ) {
    if (event.key !== "Enter") return;

    event.preventDefault();
    addValue();
  }

  return (
    <div className="rounded-2xl border border-white/10 bg-[#05090b] p-5">
      <div className="flex items-start justify-between gap-6">
        <div>
          <h3 className="text-sm font-bold text-white">
            {title}
          </h3>

          {description && (
            <p className="mt-1 text-xs leading-5 text-white/35">
              {description}
            </p>
          )}
        </div>

        <span className="rounded-full bg-white/5 px-3 py-1 text-xs font-semibold text-white/40">
          {values.length}
        </span>
      </div>

      <div className="mt-5 flex gap-3">
        <input
          value={value}
          onChange={(event) =>
            setValue(event.target.value)
          }
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          className="h-11 flex-1 rounded-xl border border-white/10 bg-[#030608] px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#C6FF32]/40"
        />

        <button
          type="button"
          onClick={addValue}
          className="inline-flex h-11 items-center gap-2 rounded-xl bg-[#C6FF32] px-4 text-sm font-bold text-black transition hover:brightness-95"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>

      {values.length === 0 ? (
        <div className="mt-5 rounded-xl border border-dashed border-white/10 py-8 text-center text-sm text-white/30">
          No items added yet.
        </div>
      ) : (
        <div className="mt-5 flex flex-wrap gap-2">
          {values.map((item, index) => (
            <div
              key={`${item}-${index}`}
              className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.03] px-3 py-2"
            >
              <span className="text-sm text-white/70">
                {item}
              </span>

              <button
                type="button"
                onClick={() => remove(index)}
                className="text-white/30 transition hover:text-red-400"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}