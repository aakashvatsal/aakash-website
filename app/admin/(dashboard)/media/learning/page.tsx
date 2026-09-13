import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MediaLearningManager } from "@/components/admin/media/MediaLearningManager";
import { getMediaLearningOverview } from "@/lib/api/media";

export default async function MediaLearningPage() {
  const overview = await getMediaLearningOverview(90);
  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Media V3.3 · Distribution & Learning"
        title="Presence Learning Engine"
        description="Track every post through its lifecycle, compare it to your own platform-format baseline, understand why it worked or stalled, cluster audience activity, and feed that evidence back into the next Presence Plan."
        actions={<div className="flex flex-wrap gap-3"><Link href="/admin/media/today" className="rounded-xl bg-[#C6FF32] px-4 py-2 text-sm font-black text-black">Today</Link><Link href="/admin/media/plan" className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white/65">7-Day Plan</Link><Link href="/admin/media/engagement" className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white/65">Engagement</Link><Link href="/admin/media/growth" className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white/65">Raw Growth</Link></div>}
      />
      <MediaLearningManager initialOverview={overview} />
    </div>
  );
}
