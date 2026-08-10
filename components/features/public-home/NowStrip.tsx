"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useMemo, useState } from "react";

import type { NowStatus } from "@/types/now";

interface NowStripProps {
  now: NowStatus | null;
}

function formatLabel(value?: string | null) {
  if (!value) {
    return "";
  }

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function getRelativeTime(value?: string | Date | null) {
  if (!value) {
    return "Recently updated";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently updated";
  }

  const differenceInSeconds = Math.max(
    0,
    Math.floor((Date.now() - date.getTime()) / 1000),
  );

  if (differenceInSeconds < 60) {
    return "Updated just now";
  }

  const differenceInMinutes = Math.floor(differenceInSeconds / 60);

  if (differenceInMinutes < 60) {
    return `Updated ${differenceInMinutes} min ago`;
  }

  const differenceInHours = Math.floor(differenceInMinutes / 60);

  if (differenceInHours < 24) {
    return `Updated ${differenceInHours}h ago`;
  }

  const differenceInDays = Math.floor(differenceInHours / 24);

  if (differenceInDays === 1) {
    return "Updated yesterday";
  }

  if (differenceInDays < 7) {
    return `Updated ${differenceInDays} days ago`;
  }

  return `Updated ${date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
  })}`;
}

export function NowStrip({ now }: NowStripProps) {
  const pathname = usePathname();
  const [, setTimeTick] = useState(0);

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTimeTick((current) => current + 1);
    }, 60_000);

    return () => {
      window.clearInterval(interval);
    };
  }, []);

  const items = useMemo(() => {
    if (!now) {
      return [];
    }

    const result: Array<[string, string]> = [];

    if (now.activity) {
      result.push([
        formatLabel(now.activityType) || "Activity",
        now.activity,
      ]);
    }

    if (now.currentFocus) {
      result.push(["Focus", now.currentFocus]);
    }

    if (now.building?.projectName || now.building?.companyName) {
      result.push([
        "Building",
        now.building.projectName ||
          now.building.companyName ||
          "",
      ]);
    }

    if (now.reading?.title) {
      result.push(["Reading", now.reading.title]);
    }

    if (now.thinking) {
      result.push(["Thinking", now.thinking]);
    }

    if (now.showAvailability && now.availability) {
      result.push(["Availability", formatLabel(now.availability)]);
    }

    if (now.showMood && now.mood) {
      result.push(["Mood", formatLabel(now.mood)]);
    }

    if (now.showHealth && now.health?.activity) {
      result.push(["Health", now.health.activity]);
    }

    return result.slice(0, 6);
  }, [now]);

  if (pathname === "/search" ||
    pathname === "/now" ||
    pathname === "/hsakaa" ||
    pathname.startsWith("/hsakaa/")
  ) {
    return null;
  }

  const relativeTime = getRelativeTime(now?.updatedAt);

  const stripItems = (
    <>
      {items.map(([label, value], index) => (
        <span
          key={`${label}-${value}-${index}`}
          className="shrink-0 text-white/55"
        >
          <span className="font-semibold text-white">{label}:</span>{" "}
          {value}
        </span>
      ))}

      <span className="shrink-0 text-white/35">{relativeTime}</span>
    </>
  );

  console.log("NOW:", now);
console.log("ITEMS:", items);
console.log("ITEMS LENGTH:", items.length);

  return (
    <div className="fixed inset-x-0 bottom-[76px] z-[75] border-y border-white/10 bg-[#030608]/95 backdrop-blur-xl lg:bottom-0">
      {/* Mobile */}
      <div className="mx-auto flex h-10 max-w-[1720px] items-center lg:hidden">
        <Link
          href="/now"
          className="relative z-10 flex h-full shrink-0 items-center gap-2 bg-[#030608] pl-4 pr-5"
        >
          <span className="relative flex size-2">
            {now ? (
              <>
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#C6FF32] opacity-50" />
                <span className="relative inline-flex size-2 rounded-full bg-[#C6FF32]" />
              </>
            ) : (
              <span className="relative inline-flex size-2 rounded-full bg-white/25" />
            )}
          </span>

          <span className="font-black uppercase tracking-[0.25em] text-[#C6FF32]">
            Now
          </span>

          <div className="pointer-events-none absolute -right-8 top-0 h-full w-8 bg-gradient-to-r from-[#030608] to-transparent" />
        </Link>

        <div className="min-w-0 flex-1 overflow-hidden">
          {now && items.length ? (
            <div className="flex w-max animate-now-marquee items-center whitespace-nowrap text-[10px]">
              <div className="flex shrink-0 items-center gap-6 pr-6">
                {stripItems}
              </div>

              <div
                aria-hidden="true"
                className="flex shrink-0 items-center gap-6 pr-6"
              >
                {stripItems}
              </div>
            </div>
          ) : (
            <Link
              href="/now"
              className="block truncate px-3 text-[10px] text-white/35"
            >
              No public status available
            </Link>
          )}
        </div>
      </div>

      {/* Desktop */}
      <div className="mx-auto hidden h-11 max-w-[1720px] items-center gap-8 overflow-x-auto whitespace-nowrap px-5 text-xs [scrollbar-width:none] lg:flex [&::-webkit-scrollbar]:hidden">
        <Link
          href="/now"
          className="flex shrink-0 items-center gap-2"
        >
          <span className="relative flex size-2">
            {now ? (
              <>
                <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#C6FF32] opacity-50" />
                <span className="relative inline-flex size-2 rounded-full bg-[#C6FF32]" />
              </>
            ) : (
              <span className="relative inline-flex size-2 rounded-full bg-white/25" />
            )}
          </span>

          <span className="font-black uppercase tracking-[0.25em] text-[#C6FF32]">
            Now
          </span>
        </Link>

        {now && items.length ? (
          <>
            {stripItems}

            <Link
              href="/now"
              className="ml-auto shrink-0 font-bold text-[#C6FF32] transition-opacity hover:opacity-70"
            >
              View status →
            </Link>
          </>
        ) : (
          <>
            <span className="text-white/35">
              No public status available
            </span>

            <Link
              href="/now"
              className="ml-auto shrink-0 font-bold text-[#C6FF32]"
            >
              View Now →
            </Link>
          </>
        )}
      </div>
    </div>
  );
}