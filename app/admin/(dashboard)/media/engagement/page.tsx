import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MediaEngagementInbox } from "@/components/admin/media/MediaEngagementInbox";
import { getMediaEngagementItems, getMediaEngagementOverview } from "@/lib/api/media";

// Keep this explicit static segment registered independently of the legacy /media/[id] editor.
export const dynamic = "force-dynamic";

export default async function MediaEngagementPage() {
  const [overview, items] = await Promise.all([
    getMediaEngagementOverview(30),
    getMediaEngagementItems({ limit: 150 }),
  ]);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Phase 6G · Unified Engagement Inbox"
        title="Media Engagement"
        description="Bring comments, mentions, DMs and WhatsApp messages into one queue, let HSAKAA triage and draft responses, and keep every outbound reply explicitly approval-controlled."
        actions={
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/hsakaa/chat" className="rounded-xl bg-[#C6FF32] px-4 py-2 text-sm font-black text-black">Ask HSAKAA</Link>
            <Link href="/admin/media/growth" className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white/65">Growth Analytics</Link>
            <Link href="/admin/media/calendar" className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white/65">7-Day Calendar</Link>
          </div>
        }
      />
      <MediaEngagementInbox initialOverview={overview} initialItems={items} />
    </div>
  );
}
