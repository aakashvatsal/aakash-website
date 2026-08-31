import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MediaCalendarManager } from "@/components/admin/media/MediaCalendarManager";
import {
  getMediaCalendarOverview,
  getMediaCoreAccounts,
  getMediaCorePublications,
  getMediaBufferStatus,
} from "@/lib/api/media";

export default async function MediaCalendarPage() {
  const [overview, accounts, publications, bufferStatus] = await Promise.all([
    getMediaCalendarOverview(),
    getMediaCoreAccounts(),
    getMediaCorePublications(),
    getMediaBufferStatus(),
  ]);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Phase 6E · Calendar + Publishing"
        title="7-Day Media Calendar"
        description="Keep every active growth account planned at least seven days ahead, surface production gaps, approve schedules explicitly and manage automatic or manual delivery from one operating view."
        actions={
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/hsakaa/chat"
              className="rounded-xl bg-[#C6FF32] px-4 py-2 text-sm font-black text-black"
            >
              Plan with HSAKAA
            </Link>
            <Link
              href="/admin/media/production"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white/65"
            >
              Production Studio
            </Link>
            <Link
              href="/admin/media/director"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white/65"
            >
              Content Director
            </Link>
            <Link
              href="/admin/media/growth"
              className="rounded-xl border border-[#C6FF32]/25 px-4 py-2 text-sm font-bold text-[#C6FF32]"
            >
              Growth Analytics
            </Link>
          </div>
        }
      />
      <MediaCalendarManager
        initialOverview={overview}
        accounts={accounts}
        publications={publications}
        bufferStatus={bufferStatus}
      />
    </div>
  );
}
