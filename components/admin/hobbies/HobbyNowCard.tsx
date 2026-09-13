import Link from "next/link";
import { ArrowRight, Music2, Target } from "lucide-react";

import type { HobbiesOverview } from "@/types/hobbies";

export function HobbyNowCard({ overview }: { overview: HobbiesOverview | null }) {
  if (!overview) return null;

  return (
    <section className="rounded-[26px] border border-white/10 bg-white/[0.025] p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.16em] text-white/35">
            <Music2 className="h-4 w-4 text-[#C6FF32]" /> Deliberate practice
          </div>
          {overview.doNext ? (
            <>
              <h2 className="mt-3 text-xl font-semibold text-white">
                {overview.doNext.name} · {overview.doNext.recommendedMinutes} min
              </h2>
              <p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">
                {overview.doNext.action}
              </p>
              <p className="mt-2 flex items-center gap-1.5 text-xs text-white/30">
                <Target className="h-3.5 w-3.5" /> {overview.doNext.reason}
              </p>
            </>
          ) : (
            <>
              <h2 className="mt-3 text-xl font-semibold text-white">Practice load is covered for now.</h2>
              <p className="mt-2 text-sm text-white/45">HSAKAA does not need to force another hobby block into today.</p>
            </>
          )}
        </div>
        <Link
          href="/admin/hobbies"
          className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs text-white/60 transition hover:border-white/20 hover:text-white"
        >
          Hobbies <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </section>
  );
}
