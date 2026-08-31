import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MediaIntelligenceManager } from "@/components/admin/media/MediaIntelligenceManager";
import {
  getMediaContentMemories,
  getMediaIntelligenceOverview,
} from "@/lib/api/media";

export default async function MediaIntelligencePage() {
  const [overview, memories] = await Promise.all([
    getMediaIntelligenceOverview(),
    getMediaContentMemories(50),
  ]);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Phase 6B · Content Intelligence"
        title="Content Memory"
        description="Semantic and structural anti-repetition memory for HSAKAA across ideas, executions and rejected candidates."
        actions={
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/media/director"
              className="rounded-xl bg-[#C6FF32] px-4 py-2 text-sm font-black text-black"
            >
              Content Director
            </Link>
            <Link
              href="/admin/media/production"
              className="rounded-xl border border-[#C6FF32]/30 px-4 py-2 text-sm font-bold text-[#C6FF32]"
            >
              Production Studio
            </Link>
            <Link
              href="/admin/media/calendar"
              className="rounded-xl border border-[#C6FF32]/30 px-4 py-2 text-sm font-bold text-[#C6FF32]"
            >
              7-Day Calendar
            </Link>
            <Link
              href="/admin/media/core"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white/70"
            >
              Media Core
            </Link>
          </div>
        }
      />
      <MediaIntelligenceManager overview={overview} memories={memories} />
    </div>
  );
}
