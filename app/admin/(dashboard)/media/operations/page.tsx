import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MediaOperationsManager } from "@/components/admin/media/MediaOperationsManager";
import { getMediaOperationsOverview } from "@/lib/api/media";

export default async function MediaOperationsPage() {
  const overview = await getMediaOperationsOverview();
  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Media V3.5 · Production Hardening"
        title="Platform Operations"
        description="Verify delivery, Buffer, analytics, engagement and publishing-queue readiness across LinkedIn, Instagram, YouTube, X and WhatsApp before relying on the Presence Engine in production."
        actions={
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/media/launch"
              className="rounded-xl border border-[#C6FF32]/30 px-4 py-2 text-sm font-bold text-[#C6FF32]"
            >
              Launch
            </Link>
            <Link
              href="/admin/media/today"
              className="rounded-xl bg-[#C6FF32] px-4 py-2 text-sm font-black text-black"
            >
              Today
            </Link>
            <Link
              href="/admin/media/release"
              className="rounded-xl border border-[#C6FF32]/30 px-4 py-2 text-sm font-bold text-[#C6FF32]"
            >
              Release Audit
            </Link>
            <Link
              href="/admin/media/calendar"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white/65"
            >
              Publishing queue
            </Link>
            <Link
              href="/admin/media/learning"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white/65"
            >
              Learning
            </Link>
          </div>
        }
      />
      <MediaOperationsManager initialOverview={overview} />
    </div>
  );
}
