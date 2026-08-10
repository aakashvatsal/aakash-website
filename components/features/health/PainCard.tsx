import { SpotlightCard } from "@/components/ui/SpotlightCard";
import type { PainEntry } from "@/types/health";

import { formatPainSeverity } from "./health.utils";

interface PainCardProps {
  pain: PainEntry;
}

export function PainCard({
  pain,
}: PainCardProps) {
  return (
    <SpotlightCard className="h-full p-7">
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/30">
            Area
          </p>

          <h3 className="mt-3 text-2xl font-black tracking-[-0.04em]">
            {pain.bodyPart}
          </h3>

          <p className="mt-2 text-sm font-bold text-white/45">
            {formatPainSeverity(
              pain.severity,
            )}
          </p>
        </div>

        {typeof pain.painScore ===
          "number" && (
          <div className="text-right">
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/25">
              Pain
            </p>

            <p className="mt-2 text-3xl font-black text-[#C6FF32]">
              {pain.painScore}/10
            </p>
          </div>
        )}
      </div>

      <div className="mt-7 space-y-5">
        {pain.description && (
          <PainDetail
            label="Description"
            value={pain.description}
          />
        )}

        {pain.trigger && (
          <PainDetail
            label="Trigger"
            value={pain.trigger}
          />
        )}

        {pain.treatment && (
          <PainDetail
            label="Treatment"
            value={pain.treatment}
          />
        )}
      </div>
    </SpotlightCard>
  );
}

function PainDetail({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="border-t border-white/10 pt-4">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/25">
        {label}
      </p>

      <p className="mt-2 text-sm leading-7 text-white/50">
        {value}
      </p>
    </div>
  );
}