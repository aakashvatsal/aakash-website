"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
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

type CommandPaletteProps = {
  controlledOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function CommandPalette({
  controlledOpen,
  onOpenChange,
}: CommandPaletteProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const [query, setQuery] = useState("");

  const inputRef = useRef<HTMLInputElement>(null);

  const open = controlledOpen ?? internalOpen;

  const setOpen = useCallback(
    (value: boolean) => {
      if (onOpenChange) {
        onOpenChange(value);
      } else {
        setInternalOpen(value);
      }

      if (!value) {
        setQuery("");
      }
    },
    [onOpenChange]
  );

  const closePalette = useCallback(() => {
    setOpen(false);
  }, [setOpen]);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    if (!normalizedQuery) {
      return items;
    }

    return items.filter((item) => {
      return (
        item.title.toLowerCase().includes(normalizedQuery) ||
        item.subtitle.toLowerCase().includes(normalizedQuery)
      );
    });
  }, [query]);

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (
        (event.metaKey || event.ctrlKey) &&
        event.key.toLowerCase() === "k"
      ) {
        event.preventDefault();
        setOpen(!open);
        return;
      }

      if (open && event.key === "Escape") {
        event.preventDefault();
        closePalette();
      }
    }

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [closePalette, open, setOpen]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const previousBodyOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    const timer = window.setTimeout(() => {
      inputRef.current?.focus({
        preventScroll: true,
      });
    }, 100);

    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previousBodyOverflow;
    };
  }, [open]);

  if (!open) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-[5000] bg-black/90 px-3 pb-[max(16px,env(safe-area-inset-bottom))] pt-[max(16px,env(safe-area-inset-top))] sm:p-4"
      role="presentation"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          closePalette();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Search website"
        className="mx-auto flex h-full w-full max-w-2xl flex-col overflow-hidden rounded-[24px] border border-white/10 bg-[#070b0d] shadow-[0_30px_120px_rgba(0,0,0,0.65)] sm:mt-20 sm:h-auto sm:max-h-[70vh] sm:rounded-[32px]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center gap-3 border-b border-white/10 p-4">
          <Search className="h-5 w-5 shrink-0 text-[#C6FF32]" />

          <input
            ref={inputRef}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search pages..."
            autoComplete="off"
            inputMode="search"
            className="min-w-0 flex-1 bg-transparent text-base text-white outline-none placeholder:text-white/25"
          />

          <button
            type="button"
            aria-label="Close search"
            onClick={closePalette}
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 text-white/50 active:bg-white/10"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain p-3"
          style={{
            WebkitOverflowScrolling: "touch",
          }}
        >
          {filtered.map((item) => {
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={closePalette}
                className="flex min-h-16 items-center gap-4 rounded-2xl px-4 py-3 text-white/65 active:bg-white/[0.08]"
              >
                <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl border border-white/10 bg-white/[0.035]">
                  <Icon className="h-5 w-5 text-[#C6FF32]" />
                </div>

                <div className="min-w-0">
                  <p className="truncate font-bold text-white">
                    {item.title}
                  </p>

                  <p className="mt-1 truncate text-xs text-white/35">
                    {item.subtitle}
                  </p>
                </div>
              </Link>
            );
          })}

          {filtered.length === 0 && (
            <div className="grid min-h-48 place-items-center px-6 text-center">
              <div>
                <p className="text-lg font-bold text-white">
                  No results found
                </p>

                <p className="mt-2 text-sm text-white/40">
                  Try another page, company, journal entry, or book.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}