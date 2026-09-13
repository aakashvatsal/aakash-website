import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MediaProductionStudioManager } from "@/components/admin/media/MediaProductionStudioManager";
import {
  getMediaProductionOverview,
  getMediaProductionStudio,
} from "@/lib/api/media";

export default async function MediaProductionStudioPage() {
  const [overview, items] = await Promise.all([
    getMediaProductionOverview(),
    getMediaProductionStudio(),
  ]);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Media · Create"
        title="Create / Production"
        description="Use this workspace when a planned item needs real production work: recording, shots, B-roll, carousel assets, thumbnails or final media. Simple text/copy items can stay entirely inside the 7-Day Plan."
        actions={
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/media/plan"
              className="rounded-xl bg-[#C6FF32] px-4 py-2 text-sm font-black text-black"
            >
              7-Day Plan
            </Link>
            <Link
              href="/admin/media/library"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white/65"
            >
              Library
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
      <MediaProductionStudioManager overview={overview} initialItems={items} />
    </div>
  );
}
