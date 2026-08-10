import { SpotlightCard } from "@/components/ui/SpotlightCard";

interface HealthMetricCardProps {
  label: string;
  value: string;
  detail?: string;
  featured?: boolean;
}

export function HealthMetricCard({
  label,
  value,
  detail,
  featured = false,
}: HealthMetricCardProps) {
  return (
    <SpotlightCard
      className={`h-full p-7 ${
        featured ? "md:col-span-2" : ""
      }`}
    >
      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/30">
        {label}
      </p>

      <p
        className={`mt-5 font-black tracking-[-0.05em] text-[#C6FF32] ${
          featured
            ? "text-4xl md:text-6xl"
            : "text-3xl md:text-4xl"
        }`}
      >
        {value}
      </p>

      {detail && (
        <p className="mt-3 text-sm leading-6 text-white/40">
          {detail}
        </p>
      )}
    </SpotlightCard>
  );
}