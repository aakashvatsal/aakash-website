import type { LucideIcon } from "lucide-react";

type AdminStatCardProps = {
  label: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
};


export function AdminStatCard({
  label,
  value,
  description,
  icon: Icon,
}: AdminStatCardProps) {
  return (
    <article className="rounded-[24px] border border-white/10 bg-white/[0.025] p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-white/35">
            {label}
          </p>

          <p className="mt-5 text-4xl font-black tracking-[-0.05em]">
            {value}
          </p>

          {description && (
            <p className="mt-3 text-sm leading-6 text-white/40">
              {description}
            </p>
          )}
        </div>

        <div className="grid h-11 w-11 place-items-center rounded-2xl border border-[#C6FF32]/20 bg-[#C6FF32]/10 text-[#C6FF32]">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </article>
  );
}