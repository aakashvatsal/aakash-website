import {
  BookMarked,
  BookOpen,
  CheckCircle2,
  FileText,
  FolderOpen,
  Star,
  type LucideIcon,
} from "lucide-react";

import {
  LibraryItemStatus,
  type LibraryItem,
} from "@/types/library";

type LibraryStatsProps = {
  items: LibraryItem[];
};

type LibraryStatCardData = {
  key: string;
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
};

function LibraryStatCard({
  title,
  value,
  description,
  icon: Icon,
}: Omit<LibraryStatCardData, "key">) {
  return (
    <article className="group relative min-w-0 overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.025] p-5 transition duration-300 hover:border-[#C6FF32]/20 hover:bg-white/[0.04]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/15 to-transparent" />

      <div className="flex items-start justify-between gap-3">
        <p className="truncate text-xs font-black uppercase tracking-[0.18em] text-white/35">
          {title}
        </p>

        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-[12px] border border-[#C6FF32]/10 bg-[#C6FF32]/[0.07] text-[#C6FF32] transition group-hover:border-[#C6FF32]/20 group-hover:bg-[#C6FF32]/10">
          <Icon className="h-4 w-4" />
        </div>
      </div>

      <p className="mt-5 truncate text-2xl font-black tracking-[-0.04em] text-white 2xl:text-3xl">
        {value}
      </p>

      <p className="mt-2 truncate text-xs font-medium text-white/35">
        {description}
      </p>
    </article>
  );
}

export function LibraryStats({
  items,
}: LibraryStatsProps) {
  const activeItems = items.filter(
    (item) =>
      item.isActive === true &&
      item.isArchived !== true,
  );

  const readingItems = activeItems.filter(
    (item) =>
      item.status ===
      LibraryItemStatus.READING,
  ).length;

  const completedItems = activeItems.filter(
    (item) =>
      item.status ===
      LibraryItemStatus.COMPLETED,
  ).length;

  const totalPagesRead = activeItems.reduce(
    (total, item) =>
      total +
      Math.max(
        Number(item.currentPage) || 0,
        0,
      ),
    0,
  );

  const uniqueCategories = new Set(
    activeItems
      .map((item) =>
        item.category?.trim().toLowerCase(),
      )
      .filter(
        (category): category is string =>
          Boolean(category),
      ),
  ).size;

  const ratedItems = activeItems.filter(
    (item) =>
      typeof item.rating === "number" &&
      Number.isFinite(item.rating),
  );

  const averageRating =
    ratedItems.length === 0
      ? null
      : ratedItems.reduce(
          (total, item) =>
            total + (item.rating ?? 0),
          0,
        ) / ratedItems.length;

  const cards: LibraryStatCardData[] = [
    {
      key: "items",
      title: "Items",
      value: activeItems.length.toLocaleString(
        "en-IN",
      ),
      description: "Active library items",
      icon: BookOpen,
    },
    {
      key: "reading",
      title: "Reading",
      value: readingItems.toLocaleString(
        "en-IN",
      ),
      description: "Currently in progress",
      icon: BookMarked,
    },
    {
      key: "completed",
      title: "Completed",
      value: completedItems.toLocaleString(
        "en-IN",
      ),
      description: "Finished items",
      icon: CheckCircle2,
    },
    {
      key: "rating",
      title: "Avg Rating",
      value:
        averageRating === null
          ? "—"
          : `${averageRating.toFixed(1)}/5`,
      description: "Across rated items",
      icon: Star,
    },
    {
      key: "pages",
      title: "Pages Read",
      value: totalPagesRead.toLocaleString(
        "en-IN",
      ),
      description: "Current page progress",
      icon: FileText,
    },
    {
      key: "categories",
      title: "Categories",
      value: uniqueCategories.toLocaleString(
        "en-IN",
      ),
      description: "Unique knowledge areas",
      icon: FolderOpen,
    },
  ];

  return (
    <section
      aria-label="Library summary"
      className="mt-8"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map((card) => (
          <LibraryStatCard
            key={card.key}
            title={card.title}
            value={card.value}
            description={card.description}
            icon={card.icon}
          />
        ))}
      </div>
    </section>
  );
}