"use client";

import Link from "next/link";
import {
  usePathname,
  useRouter,
} from "next/navigation";
import { useState } from "react";

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
  Newspaper,
  Radio,
  Settings,
  UserRound,
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

  /*
   * Overview should only match exactly.
   * Otherwise HSAKAA child routes would
   * also highlight Overview.
   */
  if (href === "/admin/hsakaa") {
    return pathname === "/admin/hsakaa";
  }

  return (
    pathname === href ||
    pathname.startsWith(`${href}/`)
  );
}

export function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();

  const [
    openSections,
    setOpenSections,
  ] = useState<Record<string, boolean>>({
    HSAKAA: pathname.startsWith(
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
  ] = useState<string | null>(null);

  function toggleSection(
    title: string,
  ) {
    setOpenSections((current) => ({
      ...current,
      [title]: !current[title],
    }));
  }

  async function handleLogout() {
    if (isLoggingOut) {
      return;
    }

    try {
      setIsLoggingOut(true);
      setLogoutError(null);

      await logoutAdmin();

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
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-white/10 bg-[#030608] lg:flex">
      <div className="flex h-20 items-center border-b border-white/10 px-6">
        <Link
          href="/admin"
          className="flex items-center"
        >
          <span className="text-xl font-black tracking-[-0.04em] text-white">
            Aakash
          </span>

          <span className="mx-1 text-[#C6FF32]">
            .
          </span>

          <span className="ml-2 text-sm font-bold tracking-normal text-white/35">
            Admin
          </span>
        </Link>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-6">
        {navigation.map((item) => {
          const Icon = item.icon;

          if (item.children?.length) {
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
              ] ?? sectionActive;

            return (
              <div
                key={item.title}
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
                  className={`flex min-h-12 w-full items-center justify-between rounded-[16px] px-4 text-sm font-bold transition ${
                    sectionActive
                      ? "bg-[#C6FF32] text-[#030608]"
                      : "text-white/45 hover:bg-white/[0.05] hover:text-white"
                  }`}
                >
                  <span className="flex items-center gap-3">
                    {Icon ? (
                      <Icon className="h-[18px] w-[18px] shrink-0" />
                    ) : null}

                    <span>
                      {item.title}
                    </span>
                  </span>

                  {sectionOpen ? (
                    <ChevronDown className="h-4 w-4 shrink-0" />
                  ) : (
                    <ChevronRight className="h-4 w-4 shrink-0" />
                  )}
                </button>

                {sectionOpen ? (
                  <div className="ml-7 mt-1 space-y-1 border-l border-white/10 pl-4">
                    {item.children.map(
                      (child) => {
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
                            className={`flex min-h-10 items-center gap-2.5 rounded-xl px-3 text-sm font-medium transition ${
                              childActive
                                ? "bg-[#C6FF32]/15 text-[#C6FF32]"
                                : "text-white/45 hover:bg-white/[0.05] hover:text-white"
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
              key={item.href}
              href={item.href!}
              className={`flex min-h-12 items-center gap-3 rounded-[16px] px-4 text-sm font-bold transition ${
                active
                  ? "bg-[#C6FF32] text-[#030608]"
                  : "text-white/45 hover:bg-white/[0.05] hover:text-white"
              }`}
            >
              {Icon ? (
                <Icon className="h-[18px] w-[18px] shrink-0" />
              ) : null}

              <span>
                {item.title}
              </span>
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-white/10 p-4">
        {logoutError ? (
          <div className="mb-3 rounded-xl border border-red-400/20 bg-red-400/10 px-3 py-2 text-xs leading-5 text-red-300">
            {logoutError}
          </div>
        ) : null}

        <div className="space-y-1">
          <Link
            href="/"
            className="flex min-h-12 items-center gap-3 rounded-[16px] px-4 text-sm font-bold text-white/45 transition hover:bg-white/[0.05] hover:text-white"
          >
            <ExternalLink className="h-[18px] w-[18px] shrink-0" />

            <span>
              View public website
            </span>
          </Link>

          <button
            type="button"
            disabled={isLoggingOut}
            onClick={handleLogout}
            className="flex min-h-12 w-full items-center gap-3 rounded-[16px] px-4 text-left text-sm font-bold text-white/45 transition hover:bg-red-400/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isLoggingOut ? (
              <Loader2 className="h-[18px] w-[18px] shrink-0 animate-spin" />
            ) : (
              <LogOut className="h-[18px] w-[18px] shrink-0" />
            )}

            <span>
              {isLoggingOut
                ? "Logging out..."
                : "Logout"}
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
}