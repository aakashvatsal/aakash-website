"use client";

import { Search, X } from "lucide-react";

type AdminSearchProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function AdminSearch({
  value,
  onChange,
  placeholder = "Search...",
}: AdminSearchProps) {
  return (
    <div className="flex min-h-12 items-center gap-3 rounded-[16px] border border-white/10 bg-white/[0.025] px-4 focus-within:border-[#C6FF32]/40">
      <Search className="h-4 w-4 shrink-0 text-[#C6FF32]" />

      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
        placeholder={placeholder}
        autoComplete="off"
        className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/25"
      />

      {value && (
        <button
          type="button"
          aria-label="Clear search"
          onClick={() => onChange("")}
          className="grid h-8 w-8 place-items-center rounded-lg text-white/35 transition hover:bg-white/[0.05] hover:text-white"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}