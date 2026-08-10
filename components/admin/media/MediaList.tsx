import Link from "next/link";
import {
  FileSearch,
  Plus,
} from "lucide-react";

import type {
  MediaPagination,
  MediaPost,
} from "@/types/media";

import { MediaCard } from "./MediaCard";
import { MediaFilters } from "./MediaFilters";
import { MediaStats } from "./MediaStats";

interface MediaListProps {
  posts: MediaPost[];
  statsPosts: MediaPost[];
  totalPosts: number;
  pagination?: MediaPagination;
  search?: string;
  platform?: string;
  status?: string;
  postType?: string;
  contentPillar?: string;
}

export function MediaList({
  posts,
  statsPosts,
  totalPosts,
  pagination,
  search,
  platform,
  status,
  postType,
  contentPillar,
}: MediaListProps) {
  const hasActiveFilters = Boolean(
    search?.trim() ||
      platform ||
      status ||
      postType ||
      contentPillar?.trim(),
  );

  const filteredTotal =
    pagination?.total ?? posts.length;

  return (
    <div className="space-y-8">
      <MediaStats
        posts={statsPosts}
        totalPosts={totalPosts}
      />

      <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-4 sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-start">
          <div className="min-w-0 flex-1">
            <MediaFilters
              initialSearch={search}
              initialPlatform={platform}
              initialStatus={status}
              initialPostType={postType}
              initialContentPillar={
                contentPillar
              }
            />
          </div>

          <Link
            href="/admin/media/new"
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-[16px] bg-[#C6FF32] px-5 text-sm font-black text-[#030608] transition hover:brightness-95"
          >
            <Plus className="h-4 w-4" />
            New media post
          </Link>
        </div>

        <div className="mt-4 flex flex-col gap-3 border-t border-white/[0.07] pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-white/30">
            Showing{" "}
            <span className="font-bold text-white">
              {posts.length}
            </span>{" "}
            of{" "}
            <span className="font-bold text-white">
              {filteredTotal}
            </span>{" "}
            posts
          </p>

          {hasActiveFilters && (
            <Link
              href="/admin/media"
              className="text-sm font-bold text-white/40 transition hover:text-white"
            >
              Clear filters
            </Link>
          )}
        </div>
      </section>

      {posts.length === 0 ? (
        <MediaEmptyState
          filtered={hasActiveFilters}
        />
      ) : (
        <div className="grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
          {posts.map((post) => (
            <MediaCard
              key={post._id}
              post={post}
            />
          ))}
        </div>
      )}

      {pagination &&
        pagination.totalPages > 1 && (
          <MediaPaginationControls
            pagination={pagination}
            search={search}
            platform={platform}
            status={status}
            postType={postType}
            contentPillar={
              contentPillar
            }
          />
        )}
    </div>
  );
}

interface MediaEmptyStateProps {
  filtered: boolean;
}

function MediaEmptyState({
  filtered,
}: MediaEmptyStateProps) {
  return (
    <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] px-6 py-20 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-[18px] bg-[#C6FF32]/10 text-[#C6FF32]">
        <FileSearch className="h-6 w-6" />
      </div>

      <h2 className="mt-5 text-xl font-black tracking-[-0.03em] text-white">
        {filtered
          ? "No matching media posts"
          : "No media posts yet"}
      </h2>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/35">
        {filtered
          ? "No posts match the current search and filter settings."
          : "Create your first media post to begin planning, publishing and evaluating content."}
      </p>

      {filtered ? (
        <Link
          href="/admin/media"
          className="mt-6 inline-flex min-h-11 items-center justify-center rounded-[14px] border border-white/10 px-5 text-sm font-bold text-white/60 transition hover:border-[#C6FF32]/30 hover:text-[#C6FF32]"
        >
          Clear filters
        </Link>
      ) : (
        <Link
          href="/admin/media/new"
          className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] bg-[#C6FF32] px-5 text-sm font-black text-[#030608] transition hover:brightness-95"
        >
          <Plus className="h-4 w-4" />
          Create media post
        </Link>
      )}
    </div>
  );
}

interface MediaPaginationControlsProps {
  pagination: MediaPagination;
  search?: string;
  platform?: string;
  status?: string;
  postType?: string;
  contentPillar?: string;
}

function MediaPaginationControls({
  pagination,
  search,
  platform,
  status,
  postType,
  contentPillar,
}: MediaPaginationControlsProps) {
  const currentPage = pagination.page;
  const totalPages =
    pagination.totalPages;

  const previousPage =
    currentPage > 1
      ? currentPage - 1
      : null;

  const nextPage =
    currentPage < totalPages
      ? currentPage + 1
      : null;

  function buildPageUrl(page: number) {
    const params = new URLSearchParams();

    params.set("page", String(page));

    if (pagination.limit) {
      params.set(
        "limit",
        String(pagination.limit),
      );
    }

    if (search?.trim()) {
      params.set(
        "search",
        search.trim(),
      );
    }

    if (platform) {
      params.set("platform", platform);
    }

    if (status) {
      params.set("status", status);
    }

    if (postType) {
      params.set("postType", postType);
    }

    if (contentPillar?.trim()) {
      params.set(
        "contentPillar",
        contentPillar.trim(),
      );
    }

    return `/admin/media?${params.toString()}`;
  }

  return (
    <div className="flex flex-col gap-4 rounded-[20px] border border-white/10 bg-white/[0.025] p-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-white/35">
        Page{" "}
        <span className="font-bold text-white">
          {currentPage}
        </span>{" "}
        of{" "}
        <span className="font-bold text-white">
          {totalPages}
        </span>
      </p>

      <div className="flex items-center gap-3">
        {previousPage ? (
          <Link
            href={buildPageUrl(
              previousPage,
            )}
            className="inline-flex min-h-11 items-center justify-center rounded-[14px] border border-white/10 px-4 text-sm font-bold text-white/60 transition hover:border-white/20 hover:text-white"
          >
            Previous
          </Link>
        ) : (
          <span className="inline-flex min-h-11 cursor-not-allowed items-center justify-center rounded-[14px] border border-white/[0.06] px-4 text-sm font-bold text-white/20">
            Previous
          </span>
        )}

        {nextPage ? (
          <Link
            href={buildPageUrl(nextPage)}
            className="inline-flex min-h-11 items-center justify-center rounded-[14px] bg-[#C6FF32] px-4 text-sm font-black text-[#030608] transition hover:brightness-95"
          >
            Next
          </Link>
        ) : (
          <span className="inline-flex min-h-11 cursor-not-allowed items-center justify-center rounded-[14px] bg-white/[0.06] px-4 text-sm font-black text-white/20">
            Next
          </span>
        )}
      </div>
    </div>
  );
}