import Link from "next/link";
import {
  ArrowUpRight,
  BookOpen,
  Building2,
  HeartPulse,
  Newspaper,
  Radio,
} from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { getAdminDashboard } from "@/lib/api/admin-dashboard";

export const dynamic = "force-dynamic";

const moduleLabels = {
  companies: "Companies",
  journal: "Journal",
  library: "Library",
  health: "Health",
  media: "Media",
  now: "Now",
} as const;

export default async function AdminDashboardPage() {
  const dashboard =
    await getAdminDashboard();

  const {
    stats,
    recentActivity,
    publishingProgress,
  } = dashboard;

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Personal operating system"
        title="Dashboard"
        description="Manage companies, knowledge, health, media and your public presence from one connected control centre."
      />

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <AdminStatCard
          label="Companies"
          value={stats.companies.total}
          description={`${stats.companies.active} active companies`}
          icon={Building2}
        />

        <AdminStatCard
          label="Journal"
          value={stats.journal.total}
          description={`${stats.journal.published} published · ${stats.journal.drafts} drafts`}
          icon={Newspaper}
        />

        <AdminStatCard
          label="Library"
          value={stats.library.total}
          description={`${stats.library.reading} reading · ${stats.library.completed} completed`}
          icon={BookOpen}
        />

        <AdminStatCard
          label="Health logs"
          value={stats.health.total}
          description={`${stats.health.workouts} workouts recorded`}
          icon={HeartPulse}
        />

        <AdminStatCard
          label="Media"
          value={stats.media.total}
          description={`${stats.media.published} published · ${stats.media.scheduled} scheduled`}
          icon={Radio}
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-[1.4fr_0.6fr]">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.025] p-5 sm:p-7">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.25em] text-[#C6FF32]">
              Activity
            </p>

            <h2 className="mt-3 text-2xl font-black tracking-[-0.03em] text-white">
              Recent changes
            </h2>

            <p className="mt-2 text-sm leading-6 text-white/35">
              Latest updates across your
              operating system.
            </p>
          </div>

          {recentActivity.length === 0 ? (
            <div className="mt-6 rounded-[20px] border border-dashed border-white/10 px-6 py-14 text-center">
              <p className="text-sm font-bold text-white/50">
                No recent activity yet.
              </p>

              <p className="mt-2 text-sm text-white/30">
                Updates from your admin
                modules will appear here.
              </p>
            </div>
          ) : (
            <div className="mt-6 divide-y divide-white/10">
              {recentActivity.map(
                (activity) => (
                  <Link
                    key={`${activity.module}-${activity.id}`}
                    href={activity.href}
                    className="group flex items-center justify-between gap-4 py-5 text-white/60 transition hover:text-white"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-bold text-white">
                        {activity.title}
                      </p>

                      <p className="mt-1 text-sm text-white/35">
                        {
                          moduleLabels[
                            activity.module
                          ]
                        }{" "}
                        ·{" "}
                        {formatRelativeTime(
                          activity.createdAt,
                        )}
                      </p>
                    </div>

                    <ArrowUpRight className="h-5 w-5 shrink-0 text-[#C6FF32] transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                  </Link>
                ),
              )}
            </div>
          )}
        </div>

        <div className="flex flex-col rounded-[28px] border border-[#C6FF32]/25 bg-[#C6FF32] p-6 text-[#030608] sm:p-7">
          <p className="text-xs font-black uppercase tracking-[0.25em]">
            Publishing status
          </p>

          <p className="mt-6 text-5xl font-black tracking-[-0.06em]">
            {publishingProgress}%
          </p>

          <div className="mt-5 h-2 overflow-hidden rounded-full bg-[#030608]/15">
            <div
              className="h-full rounded-full bg-[#030608] transition-[width]"
              style={{
                width: `${Math.min(
                  Math.max(
                    publishingProgress,
                    0,
                  ),
                  100,
                )}%`,
              }}
            />
          </div>

          <p className="mt-5 text-sm font-medium leading-6 text-[#030608]/65">
            Based on published companies,
            journal entries, library items and
            media posts currently available on
            the public website.
          </p>

          <Link
            href="/"
            className="mt-auto flex min-h-12 items-center justify-center gap-2 rounded-[16px] bg-[#030608] px-5 pt-0 text-sm font-black text-white transition hover:bg-[#101517]"
          >
            View public website
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}

function formatRelativeTime(
  value: string,
) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Recently";
  }

  const difference =
    Date.now() - date.getTime();

  const minutes = Math.floor(
    difference / 60_000,
  );

  if (minutes < 1) {
    return "Just now";
  }

  if (minutes < 60) {
    return `${minutes} minute${
      minutes === 1 ? "" : "s"
    } ago`;
  }

  const hours = Math.floor(
    minutes / 60,
  );

  if (hours < 24) {
    return `${hours} hour${
      hours === 1 ? "" : "s"
    } ago`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days} day${
      days === 1 ? "" : "s"
    } ago`;
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(date);
}