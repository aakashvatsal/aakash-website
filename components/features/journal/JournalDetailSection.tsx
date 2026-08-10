import type { ReactNode } from "react";

type JournalDetailSectionProps = {
  eyebrow: string;
  title?: string;
  children: ReactNode;
};

export function JournalDetailSection({
  eyebrow,
  title,
  children,
}: JournalDetailSectionProps) {
  return (
    <section className="border-t border-white/10 py-12">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#C6FF32]">
        {eyebrow}
      </p>

      {title && (
        <h2 className="mt-4 text-3xl font-black tracking-[-0.04em] text-white">
          {title}
        </h2>
      )}

      <div className="mt-6">{children}</div>
    </section>
  );
}