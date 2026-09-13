import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MediaSocialPresenceManager } from "@/components/admin/media/MediaSocialPresenceManager";
import { getMediaSocialPresenceOverview } from "@/lib/api/media";

export default async function MediaSocialPresencePage() {
  const overview = await getMediaSocialPresenceOverview();

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Media V4 · Social Presence & Network"
        title="Network & Profiles"
        description="Sync live profiles, review whether bios/photos truly need changing, and manage the accounts HSAKAA recommends following. Audit weekly; change identity rarely."
        actions={
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/media/today"
              className="rounded-xl bg-[#C6FF32] px-4 py-2 text-sm font-black text-black"
            >
              Today
            </Link>
            <Link
              href="/admin/media/plan"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white/65"
            >
              7-Day Plan
            </Link>
            <Link
              href="/admin/media/system"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white/65"
            >
              Advanced
            </Link>
          </div>
        }
      />
      <MediaSocialPresenceManager initialOverview={overview} />
    </div>
  );
}
