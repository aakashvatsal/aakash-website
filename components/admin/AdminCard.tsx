import type { ReactNode } from "react";

type AdminCardProps = {
  children: ReactNode;
  className?: string;
};

export function AdminCard({
  children,
  className = "",
}: AdminCardProps) {
  return (
    <div
      className={`rounded-[24px] border border-white/10 bg-white/[0.025] ${className}`}
    >
      {children}
    </div>
  );
}