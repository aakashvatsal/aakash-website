import type { LucideIcon } from "lucide-react";

type HsakaaStatCardProps = {
  label: string;
  value: number;
  description: string;
  icon: LucideIcon;
};

export function HsakaaStatCard({
  label,
  value,
  description,
  icon: Icon,
}: HsakaaStatCardProps) {
  return (
    <article className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-bold text-white/45">
            {label}
          </p>

          <p className="mt-3 text-3xl font-black tracking-[-0.05em] text-white">
            {value.toLocaleString()}
          </p>
        </div>

        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-[#C6FF32]/20 bg-[#C6FF32]/10 text-[#C6FF32]">
          <Icon className="h-5 w-5" />
        </div>
      </div>

      <p className="mt-4 text-sm leading-6 text-white/35">
        {description}
      </p>
    </article>
  );
}