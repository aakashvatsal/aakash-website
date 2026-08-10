import type { ReactNode } from "react";

interface HealthSectionProps {
  eyebrow: string;
  title: string;
  description?: string;
  children: ReactNode;
}

export function HealthSection({
  eyebrow,
  title,
  description,
  children,
}: HealthSectionProps) {
  return (
    <section className="border-t border-white/10 pt-14">
      <div className="grid gap-12 lg:grid-cols-[300px_minmax(0,1fr)] lg:gap-20">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.3em] text-[#C6FF32]">
            {eyebrow}
          </p>

          <h2 className="mt-5 text-4xl font-black tracking-[-0.05em] md:text-5xl">
            {title}
          </h2>

          {description && (
            <p className="mt-5 text-base leading-8 text-white/45">
              {description}
            </p>
          )}
        </div>

        <div>{children}</div>
      </div>
    </section>
  );
}