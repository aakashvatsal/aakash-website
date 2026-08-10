import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpRight,
  Building2,
  CalendarDays,
  Check,
  Flag,
  Globe2,
  Layers3,
  MapPin,
  Target,
  Users,
} from "lucide-react";

import type { Company } from "@/types/company";

import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { BodyText } from "@/components/ui/BodyText";
import { Container } from "@/components/ui/Container";
import { DisplayTitle } from "@/components/ui/DisplayTitle";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SpotlightCard } from "@/components/ui/SpotlightCard";

interface CompanyDetailPageProps {
  company: Company;
}

function formatLabel(value?: string) {
  if (!value) {
    return "";
  }

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatDate(value?: string | Date) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
    month: "long",
  }).format(date);
}

function getHostName(value?: string) {
  if (!value) {
    return null;
  }

  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return value;
  }
}

function getRoleLabel(roles?: string[]) {
  if (!roles?.length) {
    return null;
  }

  return roles.map(formatLabel).join(" · ");
}

function getMetricValue(metric: {
  value: string | number | boolean;
  unit?: string;
}) {
  if (typeof metric.value === "boolean") {
    return metric.value ? "Yes" : "No";
  }

  if (typeof metric.value === "string") {
    return `${metric.value} ${metric.unit ?? ""}`;
  }

  return null;
}

export function CompanyDetailPage({
  company,
}: CompanyDetailPageProps) {
  const foundedAt = formatDate(company.foundedAt);
  const lastReviewedAt = formatDate(company.lastReviewedAt);

  const image =
    company.coverImageUrl ||
    company.logoUrl ||
    "/images/company-placeholder.jpg";

  const metrics = company.metrics?.slice(0, 4) ?? [];
  const founders = company.founders ?? [];
  const goals = company.goals ?? [];
  const links = company.links ?? [];
  const products = company.products ?? [];
  const principles = company.principles ?? [];
  const priorities = company.currentPriorities ?? [];
  const challenges = company.challenges ?? [];
  const industries = company.industries ?? [];
  const markets = company.markets ?? [];
  const roleLabel = getRoleLabel(company.roles);
  const websiteHost = getHostName(company.website);

  const activeGoals = goals.filter((goal) => !goal.completed);
  const completedGoals = goals.filter((goal) => goal.completed);

  const companyFacts = [
    foundedAt
      ? {
          icon: <CalendarDays className="h-5 w-5" />,
          label: "Founded",
          value: foundedAt,
        }
      : null,
    company.headquarters
      ? {
          icon: <MapPin className="h-5 w-5" />,
          label: "Headquarters",
          value: company.headquarters,
        }
      : null,
    company.stage
      ? {
          icon: <Flag className="h-5 w-5" />,
          label: "Stage",
          value: formatLabel(company.stage),
        }
      : null,
    industries[0]
      ? {
          icon: <Globe2 className="h-5 w-5" />,
          label: "Primary industry",
          value: industries[0],
        }
      : null,
  ].filter(Boolean) as Array<{
    icon: React.ReactNode;
    label: string;
    value: string;
  }>;

  return (
    <main className="min-h-screen overflow-hidden bg-[#030608] text-white">
      <section className="relative border-b border-white/[0.06]">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[720px] w-[720px] -translate-x-1/2 rounded-full bg-[#C6FF32]/[0.045] blur-[150px]" />
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:72px_72px]" />
        </div>

        <Container>
          <div className="relative pt-8 md:pt-10">
            <Link
              href="/companies"
              className="inline-flex items-center gap-2 text-sm font-bold text-white/45 transition hover:text-[#C6FF32]"
            >
              <ArrowLeft className="h-4 w-4" />
              All companies
            </Link>
          </div>

          <div className="relative grid gap-12 py-14 md:py-20 lg:grid-cols-[1.03fr_0.97fr] lg:items-center lg:py-24">
            <div>
              <div className="flex flex-wrap items-center gap-3">
                <Eyebrow>{industries[0] ?? "Company"}</Eyebrow>

                {company.status ? (
                  <span className="inline-flex items-center gap-2 rounded-full border border-[#C6FF32]/20 bg-[#C6FF32]/[0.08] px-3 py-1.5 text-[11px] font-black uppercase tracking-[0.18em] text-[#C6FF32]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#C6FF32]" />
                    {formatLabel(company.status)}
                  </span>
                ) : null}
              </div>

              <DisplayTitle className="mt-7">
                {company.name}
              </DisplayTitle>

              {company.tagline ? (
                <h1 className="mt-7 max-w-3xl text-3xl font-black leading-[1.02] tracking-[-0.05em] text-white md:text-5xl lg:text-[3.5rem]">
                  {company.tagline}
                </h1>
              ) : null}

              {company.description ? (
                <BodyText className="mt-7 max-w-2xl text-white/55">
                  {company.description}
                </BodyText>
              ) : null}

              <div className="mt-8 flex flex-wrap items-center gap-x-5 gap-y-3 text-sm">
                {roleLabel ? (
                  <span className="font-black text-white">
                    {roleLabel}
                  </span>
                ) : null}

                {company.stage ? (
                  <span className="text-white/35">
                    {formatLabel(company.stage)}
                  </span>
                ) : null}

                {company.headquarters ? (
                  <span className="inline-flex items-center gap-2 text-white/35">
                    <MapPin className="h-4 w-4" />
                    {company.headquarters}
                  </span>
                ) : null}
              </div>

              <div className="mt-10 flex flex-wrap gap-3">
                {company.website ? (
                  <a
                    href={company.website}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[14px] bg-[#C6FF32] px-6 text-sm font-black text-[#030608] transition hover:scale-[1.02]"
                  >
                    Visit {websiteHost ?? "website"}
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                ) : null}

                {links[0] ? (
                  <a
                    href={links[0].url}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[14px] border border-white/10 bg-white/[0.035] px-6 text-sm font-black text-white transition hover:border-[#C6FF32]/35 hover:text-[#C6FF32]"
                  >
                    {links[0].label || "Explore company"}
                    <ArrowUpRight className="h-4 w-4" />
                  </a>
                ) : null}
              </div>

              {company.legalName ? (
                <p className="mt-8 text-xs font-medium text-white/25">
                  Legal entity · {company.legalName}
                </p>
              ) : null}
            </div>

            <SpotlightCard className="relative overflow-hidden rounded-[36px] border border-white/10 bg-white/[0.025]">
              <div className="relative min-h-[420px] md:min-h-[560px]">
                <Image
                  src={image}
                  alt={company.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-[#030608] via-[#030608]/5 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-6 md:p-8">
                  <div className="flex items-end justify-between gap-5">
                    <div className="flex items-center gap-4">
                      {company.logoUrl ? (
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-[18px] border border-white/15 bg-white p-2.5 shadow-2xl">
                          <Image
                            src={company.logoUrl}
                            alt={`${company.name} logo`}
                            width={64}
                            height={64}
                            className="h-full w-full object-contain"
                          />
                        </div>
                      ) : null}

                      <div>
                        <p className="text-lg font-black">
                          {company.name}
                        </p>
                        {industries[0] ? (
                          <p className="mt-1 text-sm text-white/45">
                            {industries[0]}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    {company.website ? (
                      <a
                        href={company.website}
                        target="_blank"
                        rel="noreferrer"
                        aria-label={`Visit ${company.name}`}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/15 bg-black/25 text-white backdrop-blur transition hover:border-[#C6FF32]/50 hover:text-[#C6FF32]"
                      >
                        <ArrowUpRight className="h-5 w-5" />
                      </a>
                    ) : null}
                  </div>
                </div>
              </div>
            </SpotlightCard>
          </div>
        </Container>
      </section>

      {companyFacts.length ? (
        <section className="py-8 md:py-10">
          <Container>
            <div className="grid overflow-hidden rounded-[28px] border border-white/[0.08] bg-white/[0.018] sm:grid-cols-2 lg:grid-cols-4">
              {companyFacts.map((fact, index) => (
                <div
                  key={fact.label}
                  className={`p-6 md:p-7 ${
                    index > 0
                      ? "border-t border-white/[0.08] sm:border-l sm:border-t-0"
                      : ""
                  } ${
                    index === 2
                      ? "sm:border-l-0 sm:border-t lg:border-l lg:border-t-0"
                      : ""
                  }`}
                >
                  <div className="text-[#C6FF32]">
                    {fact.icon}
                  </div>
                  <p className="mt-5 text-[11px] font-black uppercase tracking-[0.19em] text-white/30">
                    {fact.label}
                  </p>
                  <p className="mt-2 text-lg font-black tracking-[-0.025em] text-white/85">
                    {fact.value}
                  </p>
                </div>
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {(company.businessModel || company.targetCustomer) ? (
        <section className="py-20 md:py-28">
          <Container>
            <div className="grid gap-12 lg:grid-cols-[0.72fr_1.28fr]">
              <div>
                <Eyebrow>Company overview</Eyebrow>
                <h2 className="mt-6 text-4xl font-black tracking-[-0.05em] md:text-6xl">
                  What it is built to change.
                </h2>
              </div>

              <div className="grid gap-px overflow-hidden rounded-[32px] border border-white/[0.08] bg-white/[0.08] md:grid-cols-2">
                {company.targetCustomer ? (
                  <NarrativeCard
                    icon={<Users className="h-5 w-5" />}
                    eyebrow="Built for"
                    title="The customer"
                    description={company.targetCustomer}
                  />
                ) : null}

                {company.businessModel ? (
                  <NarrativeCard
                    icon={<Building2 className="h-5 w-5" />}
                    eyebrow="Business model"
                    title="How value is delivered"
                    description={company.businessModel}
                  />
                ) : null}
              </div>
            </div>
          </Container>
        </section>
      ) : null}

      {products.length ? (
        <section className="border-y border-white/[0.06] bg-white/[0.012] py-20 md:py-28">
          <Container>
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <Eyebrow>Products</Eyebrow>
                <h2 className="mt-6 max-w-4xl text-4xl font-black tracking-[-0.05em] md:text-6xl">
                  What the company is building.
                </h2>
              </div>

              <p className="max-w-md text-base leading-7 text-white/38">
                The products and platform capabilities that make up the company.
              </p>
            </div>

            <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {products.map((product, index) => (
                <SpotlightCard
                  key={product}
                  className="group min-h-48 rounded-[26px] border border-white/[0.08] bg-[#030608] p-7 transition hover:border-[#C6FF32]/30"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black tracking-[0.18em] text-white/25">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <Layers3 className="h-5 w-5 text-white/20 transition group-hover:text-[#C6FF32]" />
                  </div>

                  <div className="mt-16">
                    <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#C6FF32]">
                      Product
                    </p>
                    <h3 className="mt-3 text-2xl font-black tracking-[-0.035em]">
                      {product}
                    </h3>
                  </div>
                </SpotlightCard>
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {(company.currentFocus || priorities.length) ? (
        <section className="py-20 md:py-28">
          <Container>
            <SpotlightCard className="overflow-hidden rounded-[36px] border border-[#C6FF32]/15 bg-[#C6FF32]/[0.035]">
              <div className="grid gap-12 p-8 md:p-12 lg:grid-cols-[0.95fr_1.05fr] lg:p-14">
                <div>
                  <Eyebrow>Now at {company.name}</Eyebrow>
                  <h2 className="mt-6 text-4xl font-black tracking-[-0.05em] md:text-6xl">
                    What matters now.
                  </h2>

                  {company.currentFocus ? (
                    <p className="mt-7 max-w-xl text-xl leading-8 text-white/65">
                      {company.currentFocus}
                    </p>
                  ) : null}

                  {lastReviewedAt ? (
                    <p className="mt-8 text-xs font-black uppercase tracking-[0.18em] text-white/25">
                      Last reviewed {lastReviewedAt}
                    </p>
                  ) : null}
                </div>

                {priorities.length ? (
                  <div className="space-y-3">
                    {priorities.map((priority, index) => (
                      <div
                        key={`${priority}-${index}`}
                        className="flex gap-4 rounded-[20px] border border-white/[0.08] bg-[#030608]/55 p-5"
                      >
                        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#C6FF32]/10 text-xs font-black text-[#C6FF32]">
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <p className="pt-1 text-base font-bold leading-7 text-white/70">
                          {priority}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            </SpotlightCard>
          </Container>
        </section>
      ) : null}

      {metrics.length ? (
        <section className="pb-20 md:pb-28">
          <Container>
            <div className="mb-10 flex items-end justify-between gap-6">
              <div>
                <Eyebrow>Highlights</Eyebrow>
                <h2 className="mt-5 text-3xl font-black tracking-[-0.045em] md:text-5xl">
                  A snapshot of the company.
                </h2>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {metrics.map((metric) => {
                const staticValue = getMetricValue(metric);

                return (
                  <SpotlightCard
                    key={`${metric.key}-${metric.label}`}
                    className="rounded-[26px] border border-white/[0.08] bg-white/[0.02] p-7"
                  >
                    <div className="min-h-12 text-4xl font-black tracking-[-0.055em] text-[#C6FF32]">
                      {typeof metric.value === "number" ? (
                        <AnimatedCounter
                          value={metric.value}
                          suffix={metric.unit ? ` ${metric.unit}` : ""}
                        />
                      ) : (
                        staticValue
                      )}
                    </div>

                    <p className="mt-4 text-sm font-bold leading-6 text-white/45">
                      {metric.label}
                    </p>

                    {metric.measuredAt ? (
                      <p className="mt-5 text-[10px] font-black uppercase tracking-[0.16em] text-white/20">
                        As of {formatDate(metric.measuredAt)}
                      </p>
                    ) : null}
                  </SpotlightCard>
                );
              })}
            </div>
          </Container>
        </section>
      ) : null}

      {principles.length ? (
        <section className="border-y border-white/[0.06] py-20 md:py-28">
          <Container>
            <div className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr]">
              <div>
                <Eyebrow>Principles</Eyebrow>
                <h2 className="mt-6 text-4xl font-black tracking-[-0.05em] md:text-6xl">
                  How the company thinks.
                </h2>
              </div>

              <div>
                {principles.map((principle, index) => (
                  <div
                    key={`${principle}-${index}`}
                    className="grid gap-4 border-b border-white/[0.08] py-7 first:pt-0 md:grid-cols-[72px_1fr] md:items-start"
                  >
                    <p className="text-sm font-black text-[#C6FF32]">
                      {String(index + 1).padStart(2, "0")}
                    </p>
                    <p className="text-2xl font-black leading-tight tracking-[-0.035em] text-white/82 md:text-3xl">
                      {principle}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>
      ) : null}

      {activeGoals.length ? (
        <section className="py-20 md:py-28">
          <Container>
            <Eyebrow>Goals</Eyebrow>
            <h2 className="mt-6 max-w-4xl text-4xl font-black tracking-[-0.05em] md:text-6xl">
              Outcomes currently being pursued.
            </h2>

            <div className="mt-12 grid gap-5 md:grid-cols-2">
              {activeGoals.map((goal, index) => {
                const progress = Math.min(
                  Math.max(goal.progressPercentage ?? 0, 0),
                  100,
                );
                const showProgress = progress > 0;

                return (
                  <SpotlightCard
                    key={`${goal.title}-${index}`}
                    className="rounded-[28px] border border-white/[0.08] bg-white/[0.02] p-7 md:p-8"
                  >
                    <div className="flex items-start justify-between gap-6">
                      <p className="text-xs font-black uppercase tracking-[0.19em] text-[#C6FF32]">
                        Goal {String(index + 1).padStart(2, "0")}
                      </p>

                      {showProgress ? (
                        <p className="text-sm font-black text-white/65">
                          {progress}%
                        </p>
                      ) : (
                        <p className="rounded-full border border-white/10 px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-white/35">
                          In progress
                        </p>
                      )}
                    </div>

                    <h3 className="mt-8 text-2xl font-black tracking-[-0.035em]">
                      {goal.title}
                    </h3>

                    {goal.description ? (
                      <p className="mt-4 leading-7 text-white/45">
                        {goal.description}
                      </p>
                    ) : null}

                    {goal.targetDate ? (
                      <p className="mt-6 text-xs font-bold text-white/28">
                        Target · {formatDate(goal.targetDate)}
                      </p>
                    ) : null}

                    {showProgress ? (
                      <div className="mt-7 h-1.5 overflow-hidden rounded-full bg-white/[0.08]">
                        <div
                          className="h-full rounded-full bg-[#C6FF32]"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    ) : null}
                  </SpotlightCard>
                );
              })}
            </div>

            {completedGoals.length ? (
              <div className="mt-8 rounded-[26px] border border-white/[0.08] bg-white/[0.015] p-7">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-white/30">
                  Completed
                </p>

                <div className="mt-5 grid gap-4 md:grid-cols-2">
                  {completedGoals.map((goal) => (
                    <div
                      key={goal.title}
                      className="flex items-start gap-3"
                    >
                      <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#C6FF32]/10 text-[#C6FF32]">
                        <Check className="h-3.5 w-3.5" />
                      </span>
                      <p className="font-bold text-white/55">
                        {goal.title}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </Container>
        </section>
      ) : null}

      {challenges.length ? (
        <section className="pb-20 md:pb-28">
          <Container>
            <div className="grid gap-10 rounded-[34px] border border-white/[0.08] bg-white/[0.018] p-8 md:p-12 lg:grid-cols-[0.72fr_1.28fr]">
              <div>
                <Eyebrow>The work ahead</Eyebrow>
                <h2 className="mt-6 text-4xl font-black tracking-[-0.05em] md:text-5xl">
                  Hard problems worth solving.
                </h2>
              </div>

              <div className="space-y-3">
                {challenges.map((challenge, index) => (
                  <div
                    key={`${challenge}-${index}`}
                    className="flex items-start gap-4 border-b border-white/[0.07] py-5 first:pt-0 last:border-b-0 last:pb-0"
                  >
                    <span className="pt-1 text-xs font-black text-[#C6FF32]">
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <p className="text-lg font-bold leading-8 text-white/62">
                      {challenge}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </Container>
        </section>
      ) : null}

      {founders.length ? (
        <section className="border-t border-white/[0.06] py-20 md:py-28">
          <Container>
            <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
              <div>
                <Eyebrow>Founders</Eyebrow>
                <h2 className="mt-6 text-4xl font-black tracking-[-0.05em] md:text-6xl">
                  The people behind it.
                </h2>
              </div>

              <p className="max-w-md leading-7 text-white/38">
                The founding team responsible for the company’s direction and execution.
              </p>
            </div>

            <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {founders.map((founder) => (
                <SpotlightCard
                  key={`${founder.name}-${founder.designation ?? ""}`}
                  className="rounded-[28px] border border-white/[0.08] bg-white/[0.02] p-8"
                >
                  <div className="flex items-start justify-between gap-5">
                    <div className="flex h-12 w-12 items-center justify-center rounded-[16px] bg-[#C6FF32]/10 text-lg font-black text-[#C6FF32]">
                      {founder.name
                        .split(" ")
                        .map((part) => part[0])
                        .join("")
                        .slice(0, 2)
                        .toUpperCase()}
                    </div>

                    {founder.isPrimary ? (
                      <span className="rounded-full border border-[#C6FF32]/15 bg-[#C6FF32]/[0.06] px-3 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#C6FF32]">
                        Primary
                      </span>
                    ) : null}
                  </div>

                  <h3 className="mt-8 text-2xl font-black tracking-[-0.035em]">
                    {founder.name}
                  </h3>

                  {founder.designation ? (
                    <p className="mt-2 text-sm font-bold text-white/42">
                      {founder.designation}
                    </p>
                  ) : null}
                </SpotlightCard>
              ))}
            </div>
          </Container>
        </section>
      ) : null}

      {(industries.length || markets.length) ? (
        <section className="pb-20 md:pb-28">
          <Container>
            <div className="grid gap-5 md:grid-cols-2">
              {industries.length ? (
                <TagSection
                  eyebrow="Industries"
                  title="The space it operates in"
                  values={industries}
                  icon={<Building2 className="h-5 w-5" />}
                />
              ) : null}

              {markets.length ? (
                <TagSection
                  eyebrow="Markets"
                  title="Where the company is building"
                  values={markets}
                  icon={<Globe2 className="h-5 w-5" />}
                />
              ) : null}
            </div>
          </Container>
        </section>
      ) : null}

      {(company.website || links.length > 1) ? (
        <section className="pb-12 md:pb-16">
          <Container>
            <div className="relative overflow-hidden rounded-[36px] border border-[#C6FF32]/15 bg-[#C6FF32] px-8 py-12 text-[#030608] md:px-12 md:py-16">
              <div className="absolute right-0 top-0 h-64 w-64 translate-x-1/3 -translate-y-1/3 rounded-full border-[48px] border-[#030608]/[0.06]" />

              <div className="relative flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] opacity-55">
                    Explore {company.name}
                  </p>
                  <h2 className="mt-5 max-w-3xl text-4xl font-black tracking-[-0.055em] md:text-6xl">
                    See what the company is building.
                  </h2>
                </div>

                <div className="flex flex-wrap gap-3">
                  {company.website ? (
                    <a
                      href={company.website}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[14px] bg-[#030608] px-6 text-sm font-black text-white transition hover:scale-[1.02]"
                    >
                      Visit website
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  ) : null}

                  {links.slice(1, 3).map((link) => (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-12 items-center justify-center gap-2 rounded-[14px] border border-[#030608]/15 bg-[#030608]/[0.06] px-6 text-sm font-black transition hover:bg-[#030608]/10"
                    >
                      {link.label || "Open link"}
                      <ArrowUpRight className="h-4 w-4" />
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </Container>
        </section>
      ) : null}
    </main>
  );
}

interface NarrativeCardProps {
  icon: React.ReactNode;
  eyebrow: string;
  title: string;
  description: string;
}

function NarrativeCard({
  icon,
  eyebrow,
  title,
  description,
}: NarrativeCardProps) {
  return (
    <div className="bg-[#030608] p-8 md:p-10">
      <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#C6FF32]/10 text-[#C6FF32]">
        {icon}
      </div>

      <p className="mt-10 text-[11px] font-black uppercase tracking-[0.2em] text-[#C6FF32]">
        {eyebrow}
      </p>

      <h3 className="mt-4 text-2xl font-black tracking-[-0.035em]">
        {title}
      </h3>

      <p className="mt-5 leading-7 text-white/48">
        {description}
      </p>
    </div>
  );
}

interface TagSectionProps {
  eyebrow: string;
  title: string;
  values: string[];
  icon: React.ReactNode;
}

function TagSection({
  eyebrow,
  title,
  values,
  icon,
}: TagSectionProps) {
  return (
    <SpotlightCard className="h-full rounded-[30px] border border-white/[0.08] bg-white/[0.018] p-8">
      <div className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[#C6FF32]/10 text-[#C6FF32]">
        {icon}
      </div>

      <p className="mt-8 text-[11px] font-black uppercase tracking-[0.2em] text-[#C6FF32]">
        {eyebrow}
      </p>

      <h3 className="mt-4 text-2xl font-black tracking-[-0.035em]">
        {title}
      </h3>

      <div className="mt-7 flex flex-wrap gap-3">
        {values.map((value) => (
          <span
            key={value}
            className="rounded-full border border-white/[0.08] bg-white/[0.035] px-4 py-2 text-sm font-bold text-white/55"
          >
            {value}
          </span>
        ))}
      </div>
    </SpotlightCard>
  );
}