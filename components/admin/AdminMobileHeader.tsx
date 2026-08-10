"use client";

import { useState } from "react";
import Link from "next/link";
import {
  usePathname,
  useRouter,
} from "next/navigation";

import {
  Bot,
  BookOpen,
  Brain,
  Building2,
  ChevronDown,
  ChevronRight,
  Clock3,
  ExternalLink,
  FlaskConical,
  HeartPulse,
  LayoutDashboard,
  Loader2,
  LogOut,
  Menu,
  Newspaper,
  Radio,
  Settings,
  UserRound,
  X,
} from "lucide-react";

import {
  logoutAdmin,
} from "@/lib/api/admin-auth";

type NavigationItem = {
  title: string;

  href?: string;

  icon?: React.ComponentType<{
    className?: string;
  }>;

  children?: NavigationItem[];
};

const navigation: NavigationItem[] = [
  {
    title: "Dashboard",
    href: "/admin",
    icon: LayoutDashboard,
  },
  {
    title: "Companies",
    href: "/admin/companies",
    icon: Building2,
  },
  {
    title: "Journal",
    href: "/admin/journal",
    icon: Newspaper,
  },
  {
    title: "Library",
    href: "/admin/library",
    icon: BookOpen,
  },
  {
    title: "Health",
    href: "/admin/health",
    icon: HeartPulse,
  },
  {
    title: "Media",
    href: "/admin/media",
    icon: Radio,
  },
  {
    title: "Now",
    href: "/admin/now",
    icon: Clock3,
  },
  {
    title: "HSAKAA",
    icon: Bot,

    children: [
      {
        title: "Overview",
        href: "/admin/hsakaa",
        icon: LayoutDashboard,
      },
      {
        title: "People",
        href: "/admin/hsakaa/people",
        icon: UserRound,
      },
      {
        title: "Memory",
        href: "/admin/hsakaa/memory",
        icon: Brain,
      },
      {
        title: "Playground",
        href: "/admin/hsakaa/playground",
        icon: FlaskConical,
      },
    ],
  },
  {
    title: "Settings",
    href: "/admin/settings",
    icon: Settings,
  },
];

function isRouteActive(
  pathname: string,
  href?: string,
) {
  if (!href) {
    return false;
  }

  if (href === "/admin") {
    return pathname === "/admin";
  }

  if (href === "/admin/hsakaa") {
    return pathname === "/admin/hsakaa";
  }

  return (
    pathname === href ||
    pathname.startsWith(
      `${href}/`,
    )
  );
}

export function AdminMobileHeader() {
  const pathname =
    usePathname();

  const router =
    useRouter();

  const [
    open,
    setOpen,
  ] = useState(false);

  const [
    openSections,
    setOpenSections,
  ] = useState<
    Record<string, boolean>
  >({
    HSAKAA:
      pathname.startsWith(
        "/admin/hsakaa",
      ),
  });

  const [
    isLoggingOut,
    setIsLoggingOut,
  ] = useState(false);

  const [
    logoutError,
    setLogoutError,
  ] = useState<
    string | null
  >(null);

  function toggleSection(
    title: string,
  ) {
    setOpenSections(
      (current) => ({
        ...current,

        [title]:
          !current[title],
      }),
    );
  }

  function closeMenu() {
    setOpen(false);
  }

  async function handleLogout() {
    if (isLoggingOut) {
      return;
    }

    try {
      setIsLoggingOut(true);
      setLogoutError(null);

      await logoutAdmin();

      setOpen(false);

      router.replace(
        "/admin/login",
      );

      router.refresh();
    } catch (error) {
      setLogoutError(
        error instanceof Error
          ? error.message
          : "Unable to logout.",
      );
    } finally {
      setIsLoggingOut(false);
    }
  }

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-white/10 bg-[#030608]/90 backdrop-blur-xl lg:hidden">
        <div className="flex h-16 items-center justify-between px-4">
          <Link
            href="/admin"
            onClick={closeMenu}
            className="flex items-center"
          >
            <span className="text-lg font-black tracking-[-0.04em] text-white">
              Aakash
            </span>

            <span className="mx-1 text-[#C6FF32]">
              .
            </span>

            <span className="ml-2 text-xs text-white/35">
              Admin
            </span>
          </Link>

          <button
            type="button"
            aria-label={
              open
                ? "Close admin navigation"
                : "Open admin navigation"
            }
            aria-expanded={open}
            onClick={() =>
              setOpen(
                (current) =>
                  !current,
              )
            }
            className="grid h-11 w-11 place-items-center rounded-2xl border border-white/10 bg-white/[0.04]"
          >
            {open ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </header>

      {open ? (
        <div className="fixed inset-0 z-40 overflow-y-auto bg-[#030608] px-4 pb-8 pt-20 lg:hidden">
          <nav className="space-y-2">
            {navigation.map(
              (item) => {
                const Icon =
                  item.icon;

                if (
                  item.children
                    ?.length
                ) {
                  const sectionActive =
                    item.children.some(
                      (child) =>
                        isRouteActive(
                          pathname,
                          child.href,
                        ),
                    );

                  const sectionOpen =
                    openSections[
                      item.title
                    ] ??
                    sectionActive;

                  return (
                    <div
                      key={
                        item.title
                      }
                    >
                      <button
                        type="button"
                        onClick={() =>
                          toggleSection(
                            item.title,
                          )
                        }
                        aria-expanded={
                          sectionOpen
                        }
                        className={`flex min-h-14 w-full items-center justify-between rounded-[18px] px-4 font-bold transition ${
                          sectionActive
                            ? "bg-[#C6FF32] text-[#030608]"
                            : "border border-white/10 bg-white/[0.025] text-white/60"
                        }`}
                      >
                        <span className="flex items-center gap-4">
                          {Icon ? (
                            <Icon className="h-5 w-5 shrink-0" />
                          ) : null}

                          <span>
                            {
                              item.title
                            }
                          </span>
                        </span>

                        {sectionOpen ? (
                          <ChevronDown className="h-5 w-5 shrink-0" />
                        ) : (
                          <ChevronRight className="h-5 w-5 shrink-0" />
                        )}
                      </button>

                      {sectionOpen ? (
                        <div className="ml-6 mt-2 space-y-2 border-l border-white/10 pl-4">
                          {item.children.map(
                            (
                              child,
                            ) => {
                              const ChildIcon =
                                child.icon;

                              const childActive =
                                isRouteActive(
                                  pathname,
                                  child.href,
                                );

                              return (
                                <Link
                                  key={
                                    child.href
                                  }
                                  href={
                                    child.href!
                                  }
                                  onClick={
                                    closeMenu
                                  }
                                  className={`flex min-h-12 items-center gap-3 rounded-xl px-3 text-sm font-medium transition ${
                                    childActive
                                      ? "bg-[#C6FF32]/15 text-[#C6FF32]"
                                      : "text-white/60 hover:bg-white/[0.04] hover:text-white"
                                  }`}
                                >
                                  {ChildIcon ? (
                                    <ChildIcon className="h-4 w-4 shrink-0" />
                                  ) : null}

                                  <span>
                                    {
                                      child.title
                                    }
                                  </span>
                                </Link>
                              );
                            },
                          )}
                        </div>
                      ) : null}
                    </div>
                  );
                }

                const active =
                  isRouteActive(
                    pathname,
                    item.href,
                  );

                return (
                  <Link
                    key={
                      item.href
                    }
                    href={
                      item.href!
                    }
                    onClick={
                      closeMenu
                    }
                    className={`flex min-h-14 items-center gap-4 rounded-[18px] px-4 font-bold transition ${
                      active
                        ? "bg-[#C6FF32] text-[#030608]"
                        : "border border-white/10 bg-white/[0.025] text-white/60"
                    }`}
                  >
                    {Icon ? (
                      <Icon className="h-5 w-5 shrink-0" />
                    ) : null}

                    <span>
                      {
                        item.title
                      }
                    </span>
                  </Link>
                );
              },
            )}
          </nav>

          <div className="mt-6 border-t border-white/10 pt-6">
            {logoutError ? (
              <div className="mb-3 rounded-[16px] border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
                {logoutError}
              </div>
            ) : null}

            <div className="space-y-2">
              <Link
                href="/"
                onClick={
                  closeMenu
                }
                className="flex min-h-14 items-center gap-4 rounded-[18px] border border-white/10 bg-white/[0.025] px-4 font-bold text-white/60 transition hover:bg-white/[0.05] hover:text-white"
              >
                <ExternalLink className="h-5 w-5 shrink-0" />

                <span>
                  View public website
                </span>
              </Link>

              <button
                type="button"
                disabled={
                  isLoggingOut
                }
                onClick={
                  handleLogout
                }
                className="flex min-h-14 w-full items-center gap-4 rounded-[18px] border border-red-400/10 bg-red-400/[0.04] px-4 text-left font-bold text-red-300/70 transition hover:border-red-400/20 hover:bg-red-400/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isLoggingOut ? (
                  <Loader2 className="h-5 w-5 shrink-0 animate-spin" />
                ) : (
                  <LogOut className="h-5 w-5 shrink-0" />
                )}

                <span>
                  {isLoggingOut
                    ? "Logging out..."
                    : "Logout"}
                </span>
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}