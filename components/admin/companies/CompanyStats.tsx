import {
  Boxes,
  Building2,
  Globe2,
  Star,
  Users,
  Zap,
  type LucideIcon,
} from "lucide-react";

import type { Company } from "@/types/company";

type CompanyStatsProps = {
  companies: Company[];
  totalCompanies?: number;
};

type CompanyStatCardData = {
  key: string;
  title: string;
  value: string;
  description: string;
  icon: LucideIcon;
};

function CompanyStatCard({
  title,
  value,
  description,
  icon: Icon,
}: Omit<CompanyStatCardData, "key">) {
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

export function CompanyStats({
  companies,
  totalCompanies,
}: CompanyStatsProps) {
  const activeCompanies = companies.filter(
    (company) =>
      company.status === "active" &&
      company.isActive === true &&
      company.isArchived !== true,
  ).length;

  const totalProducts = companies.reduce(
    (total, company) =>
      total + (company.products?.length ?? 0),
    0,
  );

  const uniqueMarkets = new Set(
    companies.flatMap((company) =>
      (company.markets ?? [])
        .map((market) => market.trim())
        .filter(Boolean),
    ),
  ).size;

  const totalFounders = companies.reduce(
    (total, company) =>
      total + (company.founders?.length ?? 0),
    0,
  );

  const featuredCompanies = companies.filter(
    (company) =>
      company.isFeatured === true &&
      company.isArchived !== true,
  ).length;

  const cards: CompanyStatCardData[] = [
    {
      key: "companies",
      title: "Companies",
      value: (
        totalCompanies ?? companies.length
      ).toLocaleString("en-IN"),
      description: "Total company portfolio",
      icon: Building2,
    },
    {
      key: "active",
      title: "Active",
      value: activeCompanies.toLocaleString(
        "en-IN",
      ),
      description: "Currently operating",
      icon: Zap,
    },
    {
      key: "products",
      title: "Products",
      value: totalProducts.toLocaleString(
        "en-IN",
      ),
      description: "Products being built",
      icon: Boxes,
    },
    {
      key: "markets",
      title: "Markets",
      value: uniqueMarkets.toLocaleString(
        "en-IN",
      ),
      description: "Unique markets served",
      icon: Globe2,
    },
    {
      key: "founders",
      title: "Founders",
      value: totalFounders.toLocaleString(
        "en-IN",
      ),
      description: "Across all companies",
      icon: Users,
    },
    {
      key: "featured",
      title: "Featured",
      value:
        featuredCompanies.toLocaleString(
          "en-IN",
        ),
      description: "Publicly highlighted",
      icon: Star,
    },
  ];

  return (
    <section aria-label="Company summary">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
        {cards.map((card) => (
          <CompanyStatCard
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