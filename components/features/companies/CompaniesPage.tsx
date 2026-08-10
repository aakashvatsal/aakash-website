import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpRight,
  Building2,
  Layers3,
  MapPin,
  Target,
} from "lucide-react";

import type { Company } from "@/types/company";

import { AnimatedCounter } from "@/components/ui/AnimatedCounter";
import { BodyText } from "@/components/ui/BodyText";
import { Container } from "@/components/ui/Container";
import { DisplayTitle } from "@/components/ui/DisplayTitle";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SpotlightCard } from "@/components/ui/SpotlightCard";

interface CompaniesPageProps {
  companies: Company[];
}

function formatLabel(value?: string) {
  if (!value) {
    return "";
  }

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

function getRoleLabel(roles?: string[]) {
  if (!roles?.length) {
    return null;
  }

  return roles
    .map((role) => formatLabel(role))
    .join(" · ");
}

function MetricValue({
  value,
}: {
  value: string | number | boolean;
}) {
  if (typeof value === "number") {
    return <AnimatedCounter value={value} />;
  }

  if (typeof value === "boolean") {
    return <>{value ? "Yes" : "No"}</>;
  }

  return <>{value}</>;
}

export function CompaniesPage({
  companies,
}: CompaniesPageProps) {
  const orderedCompanies = [...companies].sort(
    (firstCompany, secondCompany) =>
      Number(secondCompany.isFeatured) -
      Number(firstCompany.isFeatured),
  );

  const activeCompanies = companies.filter(
    (company) =>
      company.isActive &&
      !company.isArchived,
  ).length;

  return (
    <main className="min-h-screen overflow-hidden bg-[#030608] text-white">
      <section className="relative border-b border-white/[0.06] py-24 md:py-32">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute left-1/2 top-0 h-[650px] w-[650px] -translate-x-1/2 rounded-full bg-[#C6FF32]/[0.045] blur-[150px]" />

          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:72px_72px]" />
        </div>

        <Container>
          <div className="relative grid gap-12 lg:grid-cols-[1fr_0.55fr] lg:items-end">
            <div>
              <Eyebrow>Companies</Eyebrow>

              <DisplayTitle className="mt-6 max-w-5xl">
                The systems became companies.
              </DisplayTitle>

              <BodyText className="mt-8 max-w-3xl">
                I build companies around complex
                operating problems—turning fragmented
                processes into connected products,
                platforms, and systems.
              </BodyText>
            </div>

            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[24px] border border-white/[0.08] bg-white/[0.08]">
              <div className="bg-[#030608]/95 p-6">
                <p className="text-4xl font-black tracking-[-0.05em] text-[#C6FF32]">
                  {companies.length}
                </p>

                <p className="mt-2 text-xs font-black uppercase tracking-[0.17em] text-white/30">
                  Companies
                </p>
              </div>

              <div className="bg-[#030608]/95 p-6">
                <p className="text-4xl font-black tracking-[-0.05em] text-white">
                  {activeCompanies}
                </p>

                <p className="mt-2 text-xs font-black uppercase tracking-[0.17em] text-white/30">
                  Active
                </p>
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-20 md:py-28">
        <Container>
          {orderedCompanies.length ? (
            <div className="space-y-8 md:space-y-12">
              {orderedCompanies.map(
                (company, index) => {
                  const roleLabel = getRoleLabel(
                    company.roles,
                  );

                  const metrics =
                    company.metrics?.slice(0, 2) ??
                    [];

                  const products =
                    company.products?.slice(0, 3) ??
                    [];

                  const image =
                    company.coverImageUrl ||
                    company.logoUrl || '';

                  return (
                    <Link
                      key={company._id}
                      href={`/companies/${company.slug}`}
                      className="group block"
                    >
                      <SpotlightCard className="overflow-hidden rounded-[34px] border border-white/[0.08] bg-white/[0.018] transition duration-500 hover:-translate-y-1 hover:border-[#C6FF32]/30">
                        <article className="grid lg:grid-cols-[0.86fr_1.14fr]">
                          <div
                            className={`relative min-h-[340px] overflow-hidden md:min-h-[430px] ${
                              index % 2 === 1
                                ? "lg:order-2"
                                : ""
                            }`}
                          >
                            <Image
                              src={image}
                              alt={company.name}
                              fill
                              sizes="(max-width: 1024px) 100vw, 45vw"
                              className="object-cover transition duration-700 group-hover:scale-[1.035]"
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-[#030608]/90 via-[#030608]/10 to-transparent" />

                            <div className="absolute left-6 top-6 flex flex-wrap gap-2">
                              {company.status ? (
                                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-[#030608]/65 px-3 py-2 text-[10px] font-black uppercase tracking-[0.17em] text-[#C6FF32] backdrop-blur-md">
                                  <span className="h-1.5 w-1.5 rounded-full bg-[#C6FF32]" />

                                  {formatLabel(
                                    company.status,
                                  )}
                                </span>
                              ) : null}

                              {company.isFeatured ? (
                                <span className="rounded-full border border-white/15 bg-[#030608]/65 px-3 py-2 text-[10px] font-black uppercase tracking-[0.17em] text-white/65 backdrop-blur-md">
                                  Featured
                                </span>
                              ) : null}
                            </div>

                            <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-5 p-6 md:p-8">
                              <div className="flex items-center gap-4">
                                {company.logoUrl ? (
                                  <div className="flex h-14 w-14 shrink-0 items-center justify-center overflow-hidden rounded-[16px] border border-white/15 bg-white p-2">
                                    <Image
                                      src={
                                        company.logoUrl
                                      }
                                      alt={`${company.name} logo`}
                                      width={56}
                                      height={56}
                                      className="h-full w-full object-contain"
                                    />
                                  </div>
                                ) : null}

                                <div>
                                  <p className="text-sm font-black text-white">
                                    {company.name}
                                  </p>

                                  {company.industries?.[0] ? (
                                    <p className="mt-1 text-xs text-white/45">
                                      {
                                        company
                                          .industries[0]
                                      }
                                    </p>
                                  ) : null}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="flex flex-col justify-center p-7 md:p-10 lg:p-12">
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs font-bold">
                              {company.industries?.[0] ? (
                                <span className="uppercase tracking-[0.18em] text-[#C6FF32]">
                                  {
                                    company
                                      .industries[0]
                                  }
                                </span>
                              ) : null}

                              {company.stage ? (
                                <span className="text-white/28">
                                  {formatLabel(
                                    company.stage,
                                  )}
                                </span>
                              ) : null}

                              {company.headquarters ? (
                                <span className="inline-flex items-center gap-1.5 text-white/28">
                                  <MapPin className="h-3.5 w-3.5" />

                                  {
                                    company.headquarters
                                  }
                                </span>
                              ) : null}
                            </div>

                            <h2 className="mt-6 text-5xl font-black tracking-[-0.065em] md:text-7xl">
                              {company.name}
                            </h2>

                            {company.tagline ? (
                              <p className="mt-6 max-w-2xl text-2xl font-black leading-tight tracking-[-0.035em] text-white/88 md:text-3xl">
                                {company.tagline}
                              </p>
                            ) : null}

                            {company.description ? (
                              <p className="mt-6 max-w-2xl text-base leading-7 text-white/45 md:text-lg md:leading-8">
                                {company.description}
                              </p>
                            ) : null}

                            {(roleLabel ||
                              company.currentFocus) && (
                              <div className="mt-8 grid gap-px overflow-hidden rounded-[22px] border border-white/[0.08] bg-white/[0.08] md:grid-cols-2">
                                {roleLabel ? (
                                  <div className="bg-[#030608] p-5">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[#C6FF32]/10 text-[#C6FF32]">
                                      <Building2 className="h-4 w-4" />
                                    </div>

                                    <p className="mt-5 text-[10px] font-black uppercase tracking-[0.18em] text-white/25">
                                      My role
                                    </p>

                                    <p className="mt-2 text-sm font-black leading-6 text-white/70">
                                      {roleLabel}
                                    </p>
                                  </div>
                                ) : null}

                                {company.currentFocus ? (
                                  <div className="bg-[#030608] p-5">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-[12px] bg-[#C6FF32]/10 text-[#C6FF32]">
                                      <Target className="h-4 w-4" />
                                    </div>

                                    <p className="mt-5 text-[10px] font-black uppercase tracking-[0.18em] text-white/25">
                                      Current focus
                                    </p>

                                    <p className="mt-2 line-clamp-3 text-sm font-bold leading-6 text-white/60">
                                      {
                                        company.currentFocus
                                      }
                                    </p>
                                  </div>
                                ) : null}
                              </div>
                            )}

                            {metrics.length ? (
                              <div className="mt-8 grid grid-cols-2 gap-4">
                                {metrics.map(
                                  (metric) => (
                                    <div
                                      key={`${metric.key}-${metric.label}`}
                                      className="rounded-[18px] border border-white/[0.07] bg-white/[0.018] p-5"
                                    >
                                      <div className="text-3xl font-black tracking-[-0.05em] text-[#C6FF32]">
                                        <MetricValue
                                          value={
                                            metric.value
                                          }
                                        />
                                      </div>

                                      {metric.unit ? (
                                        <p className="mt-1 text-xs font-bold leading-5 text-[#C6FF32]/55">
                                          {metric.unit}
                                        </p>
                                      ) : null}

                                      <p className="mt-3 text-xs font-bold leading-5 text-white/32">
                                        {metric.label}
                                      </p>
                                    </div>
                                  ),
                                )}
                              </div>
                            ) : null}

                            {products.length ? (
                              <div className="mt-8">
                                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/25">
                                  <Layers3 className="h-3.5 w-3.5" />
                                  Products
                                </div>

                                <div className="mt-3 flex flex-wrap gap-2">
                                  {products.map(
                                    (product) => (
                                      <span
                                        key={product}
                                        className="rounded-full border border-white/[0.08] bg-white/[0.025] px-3 py-1.5 text-xs font-bold text-white/45"
                                      >
                                        {product}
                                      </span>
                                    ),
                                  )}

                                  {(company.products
                                    ?.length ?? 0) > 3 ? (
                                    <span className="rounded-full border border-white/[0.08] px-3 py-1.5 text-xs font-bold text-white/25">
                                      +
                                      {(company.products
                                        ?.length ?? 0) -
                                        3}{" "}
                                      more
                                    </span>
                                  ) : null}
                                </div>
                              </div>
                            ) : null}

                            <div className="mt-10 flex items-center justify-between border-t border-white/[0.07] pt-6">
                              <p className="text-sm font-black text-white/75 transition group-hover:text-[#C6FF32]">
                                Explore company
                              </p>

                              <span className="flex h-11 w-11 items-center justify-center rounded-full border border-white/[0.09] bg-white/[0.025] text-white/50 transition duration-300 group-hover:border-[#C6FF32]/30 group-hover:bg-[#C6FF32] group-hover:text-[#030608]">
                                <ArrowUpRight className="h-5 w-5" />
                              </span>
                            </div>
                          </div>
                        </article>
                      </SpotlightCard>
                    </Link>
                  );
                },
              )}
            </div>
          ) : (
            <SpotlightCard className="rounded-[30px] border border-white/[0.08] bg-white/[0.018] p-10 text-center md:p-16">
              <p className="text-2xl font-black">
                No companies available.
              </p>

              <p className="mt-3 text-white/40">
                Company profiles will appear here once
                published.
              </p>
            </SpotlightCard>
          )}
        </Container>
      </section>
    </main>
  );
}