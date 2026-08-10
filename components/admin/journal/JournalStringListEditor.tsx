"use client";

import { Plus, X } from "lucide-react";
import { useState } from "react";

type JournalStringListEditorProps = {
  label: string;
  values: string[];
  placeholder?: string;
  multiline?: boolean;
  emptyText?: string;
  onChange: (values: string[]) => void;
};

export function JournalStringListEditor({
  label,
  values,
  placeholder = "Add item",
  multiline = false,
  emptyText = "Nothing added yet.",
  onChange,
}: JournalStringListEditorProps) {
  const [input, setInput] = useState("");

  function addItem() {
    const normalizedValue = input.trim();

    if (!normalizedValue) return;

    onChange([...values, normalizedValue]);
    setInput("");
  }

  function removeItem(index: number) {
    onChange(
      values.filter(
        (_, itemIndex) => itemIndex !== index,
      ),
    );
  }

  return (
    <div>
      <label className="text-sm font-bold text-white/70">
        {label}
      </label>

      <div className="mt-3 space-y-2">
        {values.length === 0 && (
          <div className="rounded-[14px] border border-dashed border-white/10 px-4 py-4 text-sm text-white/25">
            {emptyText}
          </div>
        )}

        {values.map((value, index) => (
          <div
            key={`${value}-${index}`}
            className="flex items-start gap-3 rounded-[14px] border border-white/10 bg-white/[0.025] px-4 py-3"
          >
            <p className="min-w-0 flex-1 whitespace-pre-wrap text-sm leading-6 text-white/60">
              {value}
            </p>

            <button
              type="button"
              onClick={() => removeItem(index)}
              aria-label={`Remove ${label} item`}
              className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white/30 transition hover:bg-red-400/10 hover:text-red-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>

      <div className="mt-3 flex items-start gap-2">
        {multiline ? (
          <textarea
            value={input}
            rows={3}
            placeholder={placeholder}
            onChange={(event) =>
              setInput(event.target.value)
            }
            onKeyDown={(event) => {
              if (
                event.key === "Enter" &&
                (event.metaKey || event.ctrlKey)
              ) {
                event.preventDefault();
                addItem();
              }
            }}
            className="min-h-24 flex-1 resize-y rounded-[14px] border border-white/10 bg-white/[0.025] px-4 py-3 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#C6FF32]/40"
          />
        ) : (
          <input
            value={input}
            placeholder={placeholder}
            onChange={(event) =>
              setInput(event.target.value)
            }
            onKeyDown={(event) => {
              if (event.key === "Enter") {
                event.preventDefault();
                addItem();
              }
            }}
            className="min-h-11 flex-1 rounded-[14px] border border-white/10 bg-white/[0.025] px-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#C6FF32]/40"
          />
        )}

        <button
          type="button"
          onClick={addItem}
          aria-label={`Add ${label} item`}
          className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-[#C6FF32] text-[#030608] transition hover:brightness-95"
        >
          <Plus className="h-4 w-4" />
        </button>
      </div>

      {multiline && (
        <p className="mt-2 text-xs text-white/20">
          Press Ctrl/Command + Enter to add.
        </p>
      )}
    </div>
  );
}