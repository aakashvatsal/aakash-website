import {
  CalendarClock,
  FileText,
  Globe2,
  Send,
  Sparkles,
  Workflow,
  type LucideIcon,
} from "lucide-react";

import type { MediaPost } from "@/types/media";

interface MediaStatsProps {
  posts: MediaPost[];
  totalPosts?: number;
}

interface StatCard {
  key: string;
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
}

function Card({
  title,
  value,
  description,
  icon: Icon,
}: Omit<StatCard, "key">) {
  return (
    <article className="group relative overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.025] p-5 transition hover:border-[#C6FF32]/20 hover:bg-white/[0.04]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      <div className="flex items-start justify-between">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">
          {title}
        </p>

        <div className="grid h-9 w-9 place-items-center rounded-xl border border-[#C6FF32]/10 bg-[#C6FF32]/[0.07] text-[#C6FF32]">
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <p className="mt-5 text-2xl font-black tracking-[-0.04em] text-white">
        {value}
      </p>

      <p className="mt-2 text-xs text-white/35">
        {description}
      </p>
    </article>
  );
}

export function MediaStats({
  posts,
  totalPosts,
}: MediaStatsProps) {
  const active = posts.filter(
    (p) =>
      p.isActive &&
      !p.isArchived,
  );

  const published = active.filter(
    (p) =>
      p.publishing.status ===
      "posted",
  ).length;

  const scheduled = active.filter(
    (p) =>
      p.publishing.status ===
      "scheduled",
  ).length;

  const pipeline = active.filter((p) =>
    [
      "idea",
      "draft",
      "script_ready",
      "assets_pending",
      "ready",
    ].includes(p.publishing.status),
  ).length;

  const uniquePlatforms = new Set(
    active.map((p) => p.platform),
  ).size;

  const scored = active.filter(
    (p) =>
      typeof p.outcome
        ?.contentScore === "number",
  );

  const averageScore =
    scored.length === 0
      ? null
      : scored.reduce(
          (sum, p) =>
            sum +
            (p.outcome
              ?.contentScore ?? 0),
          0,
        ) / scored.length;

  const cards: StatCard[] = [
    {
      key: "posts",
      title: "Posts",
      value: (
        totalPosts ??
        active.length
      ).toLocaleString("en-IN"),
      description:
        "Total content created",
      icon: FileText,
    },
    {
      key: "published",
      title: "Published",
      value:
        published.toLocaleString(
          "en-IN",
        ),
      description:
        "Live across platforms",
      icon: Send,
    },
    {
      key: "pipeline",
      title: "Pipeline",
      value:
        pipeline.toLocaleString(
          "en-IN",
        ),
      description:
        "Awaiting publishing",
      icon: Workflow,
    },
    {
      key: "scheduled",
      title: "Scheduled",
      value:
        scheduled.toLocaleString(
          "en-IN",
        ),
      description:
        "Upcoming posts",
      icon: CalendarClock,
    },
    {
      key: "platforms",
      title: "Platforms",
      value:
        uniquePlatforms.toLocaleString(
          "en-IN",
        ),
      description:
        "Publishing channels",
      icon: Globe2,
    },
    {
      key: "score",
      title: "Content Score",
      value:
        averageScore === null
          ? "—"
          : averageScore.toFixed(
              1,
            ),
      description:
        "Average evaluated score",
      icon: Sparkles,
    },
  ];

  return (
  <section aria-label="Media summary">
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map(
        ({
          key,
          title,
          value,
          description,
          icon,
        }) => (
          <Card
            key={key}
            title={title}
            value={value}
            description={description}
            icon={icon}
          />
        ),
      )}
    </div>
  </section>
);
}