import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

type AdminEmptyStateProps = {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
};

export function AdminEmptyState({
  icon: Icon,
  title,
  description,
  action,
}: AdminEmptyStateProps) {
  return (
    <div className="grid min-h-[360px] place-items-center rounded-[24px] border border-dashed border-white/10 bg-white/[0.015] px-6 py-12 text-center">
      <div>
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-[18px] border border-[#C6FF32]/20 bg-[#C6FF32]/10 text-[#C6FF32]">
          <Icon className="h-6 w-6" />
        </div>

        <h3 className="mt-5 text-xl font-black">{title}</h3>

        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/40">
          {description}
        </p>

        {action && <div className="mt-6 flex justify-center">{action}</div>}
      </div>
    </div>
  );
}