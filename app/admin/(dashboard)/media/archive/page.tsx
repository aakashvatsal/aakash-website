import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MediaList } from "@/components/admin/media/MediaList";
import {
  getMediaPosts,
  isMediaPlatform,
  isMediaPostStatus,
  isMediaPostType,
} from "@/lib/api/media";

interface MediaPageProps {
  searchParams: Promise<{
    search?: string;
    platform?: string;
    status?: string;
    postType?: string;
    contentPillar?: string;
    page?: string;
  }>;
}

export default async function MediaArchivePage({ searchParams }: MediaPageProps) {
  const params = await searchParams;

  const page = Math.max(Number(params.page) || 1, 1);

  const [postsResponse, statsResponse] = await Promise.all([
    getMediaPosts({
      search: params.search,

      platform: isMediaPlatform(params.platform) ? params.platform : undefined,

      status: isMediaPostStatus(params.status) ? params.status : undefined,

      postType: isMediaPostType(params.postType) ? params.postType : undefined,

      contentPillar: params.contentPillar,

      page,
      limit: 24,
    }),

    getMediaPosts({
      page: 1,
      limit: 100,
    }),
  ]);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Media · Advanced"
        title="Media Archive"
        description="Historical Media records and legacy editing. The normal operating workflow now lives in Today and the 7-Day Plan."
        actions={
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/media/today"
              className="rounded-xl bg-[#C6FF32] px-4 py-2 text-sm font-black text-black"
            >
              Today
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

      <MediaList
        posts={postsResponse.data}
        statsPosts={statsResponse.data}
        totalPosts={
          statsResponse.pagination?.total ?? statsResponse.data.length
        }
        pagination={postsResponse.pagination}
        search={params.search}
        platform={params.platform}
        status={params.status}
        postType={params.postType}
        contentPillar={params.contentPillar}
      />
    </div>
  );
}
