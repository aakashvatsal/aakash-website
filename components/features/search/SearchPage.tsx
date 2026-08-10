"use client";

import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import {
  ArrowLeft,
  Bot,
  BookOpen,
  Building2,
  Clock,
  HeartPulse,
  Home,
  Newspaper,
  Radio,
  Search,
  X,
} from "lucide-react";


const items = [
  {
    title: "Home",
    subtitle: "Main landing page",
    href: "/",
    icon: Home,
  },
  {
    title: "Companies",
    subtitle: "All companies",
    href: "/companies",
    icon: Building2,
  },
  {
    title: "8lete",
    subtitle: "Sports technology case study",
    href: "/companies/8lete",
    icon: Building2,
  },
  {
    title: "Frayto",
    subtitle: "Logistics technology case study",
    href: "/companies/frayto",
    icon: Building2,
  },
  {
    title: "HSAKAA Company",
    subtitle: "AI twin case study",
    href: "/companies/hsakaa",
    icon: Bot,
  },
  {
    title: "Journal",
    subtitle: "Daily journal",
    href: "/journal",
    icon: Newspaper,
  },
  {
    title: "Distribution compounds faster than product",
    subtitle: "Journal entry",
    href: "/journal/distribution-compounds-faster-than-product",
    icon: Newspaper,
  },
  {
    title: "Library",
    subtitle: "Books and notes",
    href: "/library",
    icon: BookOpen,
  },
  {
    title: "The Pragmatic Programmer",
    subtitle: "Book detail",
    href: "/library/the-pragmatic-programmer",
    icon: BookOpen,
  },
  {
    title: "Bhagavad Gita",
    subtitle: "Book detail",
    href: "/library/bhagavad-gita",
    icon: BookOpen,
  },
  {
    title: "Health",
    subtitle: "Human operating system",
    href: "/health",
    icon: HeartPulse,
  },
  {
    title: "Media",
    subtitle: "Social footprint",
    href: "/media",
    icon: Radio,
  },
  {
    title: "Now",
    subtitle: "Current focus",
    href: "/now",
    icon: Clock,
  },
  {
    title: "HSAKAA",
    subtitle: "Talk to Aakash’s AI twin",
    href: "/hsakaa",
    icon: Bot,
  },
];

export function SearchPage() {
  const [query, setQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const normalizedQuery = query.trim().toLowerCase();

  const filtered = useMemo(() => {
    if (!normalizedQuery) {
      return items;
    }

    return items.filter((item) => {
      const searchableText =
        `${item.title} ${item.subtitle} ${item.href}`.toLowerCase();

      return searchableText.includes(normalizedQuery);
    });
  }, [normalizedQuery]);

  function updateQuery(value: string) {
    setQuery(value);
  }

  function clearSearch() {
    setQuery("");

    window.requestAnimationFrame(() => {
      inputRef.current?.focus();
    });
  }

  return (
    <main className="min-h-dvh bg-[#030608] px-4 pb-10 pt-6 text-white">
      <div className="mx-auto max-w-2xl">
        <div className="flex items-center justify-between">
          <Link
            href="/"
            className="flex h-11 items-center gap-2 rounded-xl border border-white/10 px-4 text-sm font-bold text-white/60"
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Link>

          <p className="text-xs font-black uppercase tracking-[0.3em] text-[#C6FF32]">
            Search
          </p>
        </div>

        <h1 className="mt-10 text-5xl font-black leading-[0.95] tracking-[-0.06em]">
          Find anything in my digital world.
        </h1>

        <label
          htmlFor="site-search"
          className="mt-10 flex items-center gap-3 rounded-[22px] border border-white/10 bg-white/[0.035] p-3 focus-within:border-[#C6FF32]/45"
        >
          <Search className="ml-1 h-5 w-5 shrink-0 text-[#C6FF32]" />

          <input
            id="site-search"
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => updateQuery(event.currentTarget.value)}
            onInput={(event) => updateQuery(event.currentTarget.value)}
            placeholder="Search pages, books, companies..."
            enterKeyHint="search"
            autoCapitalize="none"
            autoCorrect="off"
            autoComplete="off"
            spellCheck={false}
            className="min-w-0 flex-1 appearance-none bg-transparent px-1 py-2 text-base text-white outline-none placeholder:text-white/25 [&::-webkit-search-cancel-button]:hidden"
          />

          {query.length > 0 && (
            <button
              type="button"
              aria-label="Clear search"
              onClick={clearSearch}
              className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 text-white/45"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </label>

        <div className="mt-5 flex items-center justify-between text-xs text-white/35">
          <span>
            {filtered.length} {filtered.length === 1 ? "result" : "results"}
          </span>

          {query && <span>Searching for “{query}”</span>}
        </div>

        <div className="mt-3 space-y-2">
          {filtered.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex min-h-16 items-center gap-4 rounded-[20px] border border-white/10 bg-white/[0.025] px-4 py-3 transition active:bg-white/[0.08]"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.035]">
                  <Icon className="h-5 w-5 text-[#C6FF32]" />
                </div>

                <div className="min-w-0">
                  <p className="truncate font-bold text-white">{item.title}</p>
                  <p className="mt-1 truncate text-xs text-white/35">
                    {item.subtitle}
                  </p>
                </div>
              </Link>
            );
          })}

          {filtered.length === 0 && (
            <div className="rounded-[24px] border border-white/10 bg-white/[0.025] px-6 py-16 text-center">
              <p className="text-xl font-bold">No results found</p>
              <p className="mt-2 text-sm text-white/40">
                Try another company, book, journal entry, or page.
              </p>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}