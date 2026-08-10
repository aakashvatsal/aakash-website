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
        description="Plan, produce, schedule, publish and evaluate content."
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