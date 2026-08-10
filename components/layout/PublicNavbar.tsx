"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  Bot,
  BookOpen,
  Building2,
  Clock,
  HeartPulse,
  Home,
  Menu,
  Newspaper,
  Radio,
  Search,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/Button";
import { useCommandPalette } from "@/components/providers/CommandPaletteProvider";

const nav = [
  { title: "Home", href: "/", icon: Home },
  { title: "Companies", href: "/companies", icon: Building2 },
  { title: "Journal", href: "/journal", icon: Newspaper },
  { title: "Library", href: "/library", icon: BookOpen },
  { title: "Health", href: "/health", icon: HeartPulse },
  { title: "Media", href: "/media", icon: Radio },
  { title: "Now", href: "/now", icon: Clock },
];

export function PublicNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const mobileMenuRef = useRef<HTMLDetailsElement>(null);

  const pathname = usePathname();
  const router = useRouter();
  const { openCommandPalette } = useCommandPalette();

  const activeRoot = useMemo(() => {
    if (pathname === "/") {
      return "/";
    }

    return `/${pathname.split("/")[1]}`;
  }, [pathname]);

  useEffect(() => {
    function handleScroll() {
      setScrolled(window.scrollY > 24);
    }

    handleScroll();

    window.addEventListener("scroll", handleScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  useEffect(() => {
    const touchDevice =
      window.matchMedia("(pointer: coarse)").matches ||
      navigator.maxTouchPoints > 0 ||
      "ontouchstart" in window;

    setIsTouchDevice(touchDevice);
  }, []);

  useEffect(() => {
    closeMobileMenu();
  }, [pathname]);

  useEffect(() => {
    return () => {
      document.documentElement.style.overflow = "";
      document.body.style.overflow = "";
    };
  }, []);

  function closeMobileMenu() {
    if (mobileMenuRef.current) {
      mobileMenuRef.current.open = false;
    }

    document.documentElement.style.overflow = "";
    document.body.style.overflow = "";
  }

  function handleMobileToggle(
    event: React.SyntheticEvent<HTMLDetailsElement>
  ) {
    const isOpen = event.currentTarget.open;

    document.documentElement.style.overflow = isOpen ? "hidden" : "";
    document.body.style.overflow = isOpen ? "hidden" : "";
  }

  function handleDesktopSearch() {
    if (isTouchDevice) {
      router.push("/search");
      return;
    }

    openCommandPalette();
  }

  return (
    <>
      {/* Desktop and iPad landscape navbar */}
      <header className="fixed inset-x-0 top-0 z-[200] hidden px-4 py-4 lg:block">
        <div
          className={`mx-auto flex max-w-[1500px] items-center justify-between border border-white/10 px-5 backdrop-blur-xl transition-all duration-500 ${
            scrolled
              ? "h-14 rounded-full bg-[#030608]/90 shadow-[0_20px_80px_rgba(0,0,0,0.45)]"
              : "h-16 rounded-[28px] bg-[#030608]/70"
          }`}
        >
          <Brand />

          <nav className="flex items-center gap-1 rounded-full border border-white/10 bg-white/[0.03] p-1">
            {nav.map((item) => {
              const active = activeRoot === item.href;

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                    active
                      ? "bg-[#C6FF32] text-[#030608]"
                      : "text-white/50 hover:bg-white/[0.04] hover:text-white"
                  }`}
                >
                  {item.title}
                </Link>
              );
            })}
          </nav>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleDesktopSearch}
              className="flex items-center gap-2 rounded-full border border-white/10 px-4 py-2 text-sm text-white/45 transition hover:text-white"
            >
              <Search className="h-4 w-4" />
              <span>{isTouchDevice ? "Search" : "⌘K"}</span>
            </button>

            <Link href="/hsakaa">
              <Button>
                <Bot className="mr-2 h-4 w-4" />
                HSAKAA
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Mobile and iPad portrait navbar */}
      <header className="fixed inset-x-0 top-0 z-[700] px-3 py-3 lg:hidden">
        <div className="flex h-16 items-center justify-between rounded-[24px] border border-white/10 bg-[#070b0d] px-4 shadow-[0_14px_50px_rgba(0,0,0,0.35)]">
          <Brand />

          <div aria-hidden="true" className="h-12 w-12" />
        </div>
      </header>

      {/* Native mobile menu */}
      <details
        ref={mobileMenuRef}
        onToggle={handleMobileToggle}
        className="group lg:hidden"
      >
        <summary
          aria-label="Toggle navigation menu"
          className="fixed right-[18px] top-[18px] z-[900] grid h-12 w-12 cursor-pointer list-none place-items-center rounded-2xl border border-white/15 bg-[#111518] text-white [-webkit-tap-highlight-color:transparent] [&::-webkit-details-marker]:hidden"
        >
          <Menu className="h-6 w-6 group-open:hidden" />
          <X className="hidden h-6 w-6 group-open:block" />
        </summary>

        <div className="fixed inset-0 z-[600] bg-[#030608] pt-24">
          <div className="h-[calc(100dvh-6rem)] px-3 pb-[max(12px,env(safe-area-inset-bottom))]">
            <div className="grid h-full grid-rows-[minmax(0,1fr)_auto] rounded-[28px] border border-white/10 bg-[#05090b] p-3">
              <nav className="grid min-h-0 grid-rows-[repeat(7,minmax(0,1fr))] gap-2">
                {nav.map((item) => {
                  const Icon = item.icon;
                  const active = activeRoot === item.href;

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={closeMobileMenu}
                      className={`flex min-h-0 items-center gap-3 rounded-[18px] px-4 text-sm font-bold ${
                        active
                          ? "bg-[#C6FF32] text-[#030608]"
                          : "border border-white/10 bg-white/[0.025] text-white/65 active:bg-white/[0.07]"
                      }`}
                    >
                      <Icon className="h-[18px] w-[18px] shrink-0" />
                      <span>{item.title}</span>
                    </Link>
                  );
                })}
              </nav>

              <div className="grid grid-cols-2 gap-2 pt-3">
                <Link
                  href="/search"
                  onClick={closeMobileMenu}
                  className="flex min-h-12 items-center justify-center gap-2 rounded-[18px] border border-white/10 px-3 text-sm font-bold text-white/70 active:bg-white/[0.06]"
                >
                  <Search className="h-4 w-4" />
                  <span>Search</span>
                </Link>

                <Link
                  href="/hsakaa"
                  onClick={closeMobileMenu}
                  className="flex min-h-12 items-center justify-center gap-2 rounded-[18px] bg-[#C6FF32] px-3 text-sm font-black text-[#030608]"
                >
                  <Bot className="h-4 w-4" />
                  HSAKAA
                </Link>
              </div>
            </div>
          </div>
        </div>
      </details>
    </>
  );
}

function Brand() {
  return (
    <Link
      href="/"
      aria-label="Go to homepage"
      className="shrink-0 text-xl font-black tracking-[-0.04em]"
    >
      Aakash<span className="text-[#C6FF32]">.</span>
    </Link>
  );
}