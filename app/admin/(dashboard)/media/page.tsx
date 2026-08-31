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

export default async function MediaPage({
  searchParams,
}: MediaPageProps) {
  const params = await searchParams;

  const page = Math.max(
    Number(params.page) || 1,
    1,
  );

  const [postsResponse, statsResponse] =
    await Promise.all([
      getMediaPosts({
        search: params.search,

        platform: isMediaPlatform(
          params.platform,
        )
          ? params.platform
          : undefined,

        status: isMediaPostStatus(
          params.status,
        )
          ? params.status
          : undefined,

        postType: isMediaPostType(
          params.postType,
        )
          ? params.postType
          : undefined,

        contentPillar:
          params.contentPillar,

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
        eyebrow="Content operating system"
        title="Media"
        description="Historical Media records and editing. New content creation is owned by HSAKAA and Media Core."
        actions={<div className="flex flex-wrap gap-3"><Link href="/admin/media/director" className="rounded-xl bg-[#C6FF32] px-4 py-2 text-sm font-black text-black">Content Director</Link><Link href="/admin/media/production" className="rounded-xl border border-[#C6FF32]/30 px-4 py-2 text-sm font-bold text-[#C6FF32]">Production Studio</Link><Link href="/admin/media/calendar" className="rounded-xl border border-[#C6FF32]/30 px-4 py-2 text-sm font-bold text-[#C6FF32]">7-Day Calendar</Link><Link href="/admin/hsakaa/chat" className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white/70">HSAKAA chat</Link><Link href="/admin/media/core" className="rounded-xl border border-[#C6FF32]/30 px-4 py-2 text-sm font-bold text-[#C6FF32]">Media Core V2</Link></div>}
      />

      <MediaList
        posts={postsResponse.data}
        statsPosts={statsResponse.data}
        totalPosts={
          statsResponse.pagination
            ?.total ??
          statsResponse.data.length
        }
        pagination={
          postsResponse.pagination
        }
        search={params.search}
        platform={params.platform}
        status={params.status}
        postType={params.postType}
        contentPillar={
          params.contentPillar
        }
      />
    </div>
  );
}