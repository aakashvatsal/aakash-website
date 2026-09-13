import Link from "next/link";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MediaAssetLibraryManager } from "@/components/admin/media/MediaAssetLibraryManager";
import { getMediaAssetLibrary, getMediaAssetStorageStatus } from "@/lib/api/media";

export default async function MediaLibraryPage() {
  const [storage, assets] = await Promise.all([
    getMediaAssetStorageStatus(),
    getMediaAssetLibrary({ limit: 150 }),
  ]);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Media V3.8 · Production Inputs"
        title="Media Library"
        description="Upload real photos, video, B-roll, audio and documents once, keep the originals private in S3, and let Production Studio reuse the best matching asset without uploading it again."
        actions={
          <div className="flex flex-wrap gap-3">
            <Link href="/admin/media/production" className="rounded-xl bg-[#C6FF32] px-4 py-2 text-sm font-black text-black">Production Studio</Link>
            <Link href="/admin/media/today" className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white/65">Today</Link>
          </div>
        }
      />
      <MediaAssetLibraryManager storage={storage} initialAssets={assets} />
    </div>
  );
}
