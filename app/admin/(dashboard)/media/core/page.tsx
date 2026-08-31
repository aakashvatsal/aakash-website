import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MediaCoreManager } from "@/components/admin/media/MediaCoreManager";
import { getMediaCoreAccounts, getMediaCoreContent, getMediaCoreOverview, getMediaCorePublications, getMediaMigrationStatus } from "@/lib/api/media";

export default async function MediaCorePage() {
  const [overview, accounts, content, publications, migration] = await Promise.all([getMediaCoreOverview(), getMediaCoreAccounts(), getMediaCoreContent(), getMediaCorePublications(), getMediaMigrationStatus()]);
  return <div className="space-y-8"><AdminPageHeader eyebrow="Phase 6A · Media Core V2" title="Media Core" description="Canonical ideas, platform accounts, publication lineage and the seven-day planning foundation." actions={<div className="flex flex-wrap gap-3"><Link href="/admin/media/director" className="rounded-xl bg-[#C6FF32] px-4 py-2 text-sm font-black text-black">Content Director</Link><Link href="/admin/media/production" className="rounded-xl border border-[#C6FF32]/30 px-4 py-2 text-sm font-bold text-[#C6FF32]">Production Studio</Link><Link href="/admin/media/calendar" className="rounded-xl border border-[#C6FF32]/30 px-4 py-2 text-sm font-bold text-[#C6FF32]">7-Day Calendar</Link><Link href="/admin/media/intelligence" className="rounded-xl border border-[#C6FF32]/30 px-4 py-2 text-sm font-bold text-[#C6FF32]">Content memory</Link><Link href="/admin/media" className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white/70">Legacy media</Link></div>} /><MediaCoreManager overview={overview} accounts={accounts} content={content} publications={publications} migration={migration} /></div>;
}
