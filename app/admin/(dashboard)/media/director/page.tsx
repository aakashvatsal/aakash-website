import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MediaContentDirectorManager } from "@/components/admin/media/MediaContentDirectorManager";
import {
  getMediaDirectorOverview,
  getMediaDirectorRuns,
} from "@/lib/api/media";

export default async function MediaContentDirectorPage() {
  const [overview, runs] = await Promise.all([
    getMediaDirectorOverview(),
    getMediaDirectorRuns(20),
  ]);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Phase 6C · HSAKAA Content Director"
        title="Content Director"
        description="Generate distinct growth ideas, test them against content memory, critique every platform execution, and promote only approved candidates into canonical Media."
        actions={
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/media/presence"
              className="rounded-xl bg-[#C6FF32] px-4 py-2 text-sm font-black text-black"
            >
              Presence Strategy
            </Link><Link href="/admin/media/plan" className="rounded-xl border border-[#C6FF32]/30 px-4 py-2 text-sm font-bold text-[#C6FF32]">7-Day Presence Plan</Link>
            <Link
              href="/admin/hsakaa/chat"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white/65"
            >
              Open HSAKAA chat
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
              href="/admin/media/intelligence"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white/65"
            >
              Content memory
            </Link>
            <Link
              href="/admin/media/core"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white/65"
            >
              Media Core
            </Link>
          </div>
        }
      />
      <MediaContentDirectorManager overview={overview} initialRuns={runs} />
    </div>
  );
}
