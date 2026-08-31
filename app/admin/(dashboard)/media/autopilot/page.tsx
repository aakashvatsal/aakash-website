import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MediaAutopilotManager } from "@/components/admin/media/MediaAutopilotManager";
import { getMediaAutopilotOverview, getMediaAutopilotRuns } from "@/lib/api/media";

export default async function MediaAutopilotPage() {
  const [overview, runs] = await Promise.all([
    getMediaAutopilotOverview(),
    getMediaAutopilotRuns(20),
  ]);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Phase 6H · Growth Autopilot"
        title="Proactive HSAKAA"
        description="Keep the rolling calendar ahead, surface production and publishing blockers, turn growth evidence and audience signals into next actions, and proactively draft gap-filling candidates without allowing autonomous acceptance, scheduling, publishing or replies."
        actions={
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/hsakaa/chat" className="rounded-xl bg-[#C6FF32] px-4 py-2 text-sm font-black text-black">
              Ask HSAKAA
            </Link>
            <Link href="/admin/media/calendar" className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white/65">
              7-Day Calendar
            </Link>
            <Link href="/admin/media/growth" className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white/65">
              Growth Analytics
            </Link>
          </div>
        }
      />
      <MediaAutopilotManager initialOverview={overview} initialRuns={runs} />
    </div>
  );
}
