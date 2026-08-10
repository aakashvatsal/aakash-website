"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Bot,
  BookOpen,
  HeartPulse,
  Home,
  Newspaper,
} from "lucide-react";

const items = [
  {
    title: "Home",
    href: "/",
    icon: Home,
  },
  {
    title: "Journal",
    href: "/journal",
    icon: Newspaper,
  },
  {
    title: "HSAKAA",
    href: "/hsakaa",
    icon: Bot,
    primary: true,
  },
  {
    title: "Library",
    href: "/library",
    icon: BookOpen,
  },
  {
    title: "Health",
    href: "/health",
    icon: HeartPulse,
  },
];

export function PublicMobileNav() {
  const pathname = usePathname();

  if (pathname === "/search") {
    return null;
  }

  function isActive(href: string) {
    if (href === "/") {
      return pathname === "/";
    }

    return pathname.startsWith(href);
  }

  return (
    <nav
      aria-label="Mobile navigation"
      className="fixed inset-x-0 bottom-0 z-[85] border-t border-white/10 bg-[#030608]/95 px-3 pb-[max(10px,env(safe-area-inset-bottom))] pt-2 backdrop-blur-xl lg:hidden"
    >
      <div className="mx-auto flex max-w-lg items-end justify-between">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isActive(item.href);

          if (item.primary) {
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className="flex min-w-[64px] flex-col items-center gap-1 text-[10px] font-bold text-white"
              >
                <div
                  className={`grid h-12 w-12 -translate-y-2 place-items-center rounded-[18px] transition ${
                    active
                      ? "bg-white text-[#030608]"
                      : "bg-[#C6FF32] text-[#030608]"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <span className="-mt-1">{item.title}</span>
              </Link>
            );
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={active ? "page" : undefined}
              className={`flex min-w-[56px] flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-medium transition ${
                active ? "text-[#C6FF32]" : "text-white/40"
              }`}
            >
              <Icon className="h-[18px] w-[18px]" />
              <span>{item.title}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}