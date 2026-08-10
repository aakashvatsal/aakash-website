import Image from "next/image";
import Link from "next/link";

interface CompanyStat {
  label: string;
  value: string;
}

interface CompanySceneProps {
  eyebrow: string;
  name: string;
  slug: string;
  title: string;
  description: string;
  image: string;
  stats: CompanyStat[];
}

export function CompanyScene({
  eyebrow,
  name,
  slug,
  title,
  description,
  image,
  stats,
}: CompanySceneProps) {
  return (
    <section className="relative overflow-hidden border-t border-white/10 bg-[#030608] text-white">
      <div className="mx-auto grid max-w-[1720px] lg:min-h-[900px] lg:grid-cols-[1.08fr_0.92fr]">
        <div className="relative z-10 flex flex-col px-6 py-24 sm:px-10 md:px-16 lg:px-20 xl:px-24 xl:py-28">
          <div className="max-w-4xl">
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#C6FF32]">
              {eyebrow}
            </p>

            <p className="mt-5 text-sm font-black uppercase tracking-[0.18em] text-white/35">
              {name}
            </p>

            <h2 className="mt-8 max-w-4xl text-[44px] font-black leading-[0.96] tracking-[-0.06em] sm:text-[58px] md:text-[68px] xl:text-[82px]">
              {title}
            </h2>

            {description && (
              <p className="mt-8 max-w-3xl text-lg leading-9 text-white/45 md:text-xl">
                {description}
              </p>
            )}
          </div>

          {stats.length > 0 && (
            <div className="mt-16 grid gap-4 md:grid-cols-2 xl:grid-cols-[1.25fr_0.85fr_0.85fr]">
              {stats.map((stat, index) => (
                <CompanyMetricCard
                  key={`${stat.label}-${stat.value}-${index}`}
                  stat={stat}
                  index={index}
                />
              ))}
            </div>
          )}

          <div className="mt-14">
            <Link
              href={`/companies/${slug}`}
              className="group inline-flex items-center gap-3 rounded-full border border-[#C6FF32]/20 bg-[#C6FF32]/[0.06] px-5 py-3 text-sm font-black text-[#C6FF32] transition duration-300 hover:border-[#C6FF32]/50 hover:bg-[#C6FF32]/10"
            >
              <span>View case study</span>

              <span className="text-lg leading-none transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </Link>
          </div>
        </div>

        <div className="relative min-h-[500px] overflow-hidden border-t border-white/10 lg:min-h-full lg:border-l lg:border-t-0">
          <Image
            src={image}
            alt={name}
            fill
            sizes="(max-width: 1024px) 100vw, 46vw"
            className="object-cover"
          />

          <div className="absolute inset-0 bg-gradient-to-t from-[#030608] via-[#030608]/20 to-transparent lg:bg-gradient-to-r lg:from-[#030608]/65 lg:via-transparent lg:to-transparent" />

          <div className="absolute inset-0 bg-black/10" />

          <div className="absolute bottom-7 left-7 right-7 md:bottom-10 md:left-10 md:right-10">
            <div className="inline-flex items-center gap-3 rounded-full border border-white/10 bg-black/40 px-4 py-2 backdrop-blur-xl">
              <span className="h-1.5 w-1.5 rounded-full bg-[#C6FF32]" />

              <span className="text-[10px] font-black uppercase tracking-[0.18em] text-white/60">
                {name}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function CompanyMetricCard({
  stat,
  index,
}: {
  stat: CompanyStat;
  index: number;
}) {
  const value = stat.value.trim();

  const firstSpaceIndex =
    value.indexOf(" ");

  const primaryValue =
    firstSpaceIndex === -1
      ? value
      : value.slice(
          0,
          firstSpaceIndex,
        );

  const secondaryValue =
    firstSpaceIndex === -1
      ? ""
      : value
          .slice(
            firstSpaceIndex + 1,
          )
          .trim();

  const isNumericMetric =
    /^[-+]?\d+([.,]\d+)?[%°]?$/.test(
      primaryValue,
    );

  const isVeryLongText =
    !isNumericMetric &&
    value.length > 26;

  const isLongText =
    !isNumericMetric &&
    value.length > 15;

  return (
    <div
      className={[
        "group relative min-h-[240px] overflow-hidden rounded-[28px]",
        "border border-white/10 bg-white/[0.025]",
        "px-7 py-7 md:px-8 md:py-8",
        "transition duration-300",
        "hover:border-[#C6FF32]/30 hover:bg-white/[0.04]",
        index === 0
          ? "md:col-span-2 xl:col-span-1"
          : "",
      ].join(" ")}
    >
      <div className="flex h-full flex-col justify-between">
        <div className="min-w-0">
          {isNumericMetric ? (
            <>
              <p className="text-[58px] font-black leading-none tracking-[-0.075em] text-[#C6FF32] md:text-[68px]">
                {primaryValue}
              </p>

              {secondaryValue && (
                <p className="mt-4 max-w-[240px] text-base font-black leading-6 text-[#C6FF32]/65 md:text-lg">
                  {secondaryValue}
                </p>
              )}
            </>
          ) : (
            <p
              className={[
                "max-w-full break-words font-black text-[#C6FF32]",
                "tracking-[-0.045em]",
                isVeryLongText
                  ? "text-[28px] leading-[1.02] md:text-[32px] xl:text-[36px]"
                  : isLongText
                    ? "text-[32px] leading-[1.02] md:text-[36px] xl:text-[40px]"
                    : "text-[42px] leading-[1] md:text-[48px]",
              ].join(" ")}
            >
              {value}
            </p>
          )}
        </div>

        <div className="mt-10">
          <div className="mb-4 h-px w-8 bg-[#C6FF32]/35 transition-all duration-300 group-hover:w-14" />

          <p className="text-[10px] font-black uppercase leading-5 tracking-[0.22em] text-white/30">
            {stat.label}
          </p>
        </div>
      </div>
    </div>
  );
}