import Link from "next/link";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import type { MediaPost } from "@/types/media";

interface MediaCardProps {
  post: MediaPost;
}

function formatLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

function formatDate(value?: string) {
  if (!value) {
    return "Not set";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not set";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getDisplayDate(post: MediaPost) {
  if (
    post.publishing.status === "posted" &&
    post.publishing.publishedAt
  ) {
    return formatDate(
      post.publishing.publishedAt,
    );
  }

  if (
    post.publishing.status === "scheduled" &&
    post.publishing.scheduledAt
  ) {
    return formatDate(
      post.publishing.scheduledAt,
    );
  }

  return formatDate(post.date);
}

function getDisplayDateLabel(
  post: MediaPost,
) {
  if (post.publishing.status === "posted") {
    return "Published";
  }

  if (
    post.publishing.status === "scheduled"
  ) {
    return "Scheduled";
  }

  return "Content date";
}

export function MediaCard({
  post,
}: MediaCardProps) {
  return (
    <Link
      href={`/admin/media/${post._id}`}
      className="block h-full"
    >
      <SpotlightCard className="group h-full rounded-[28px] border border-white/10 bg-white/[0.025] p-6 transition hover:-translate-y-1 hover:border-[#C6FF32]/30">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-white/60">
            {post.platform === "linkedin"
              ? "LinkedIn"
              : post.platform === "youtube"
                ? "YouTube"
                : formatLabel(post.platform)}
          </span>

          <span className="rounded-full border border-[#C6FF32]/20 bg-[#C6FF32]/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-[#C6FF32]">
            {formatLabel(
              post.publishing.status,
            )}
          </span>

          <span className="rounded-full border border-white/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-white/35">
            {formatLabel(post.postType)}
          </span>
        </div>

        <h2 className="mt-6 text-2xl font-black leading-tight tracking-[-0.04em] transition group-hover:text-[#C6FF32]">
          {post.content.title}
        </h2>

        {post.content.hook && (
          <p className="mt-4 line-clamp-2 text-sm leading-7 text-white/45">
            {post.content.hook}
          </p>
        )}

        <div className="mt-7 grid grid-cols-2 gap-5 border-t border-white/10 pt-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/25">
              Primary goal
            </p>

            <p className="mt-2 text-sm font-bold text-white/65">
              {formatLabel(
                post.strategy.primaryGoal,
              )}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/25">
              Content pillar
            </p>

            <p className="mt-2 text-sm font-bold text-white/65">
              {post.strategy.contentPillar ??
                "Not set"}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/25">
              {getDisplayDateLabel(post)}
            </p>

            <p className="mt-2 text-sm font-bold text-white/65">
              {getDisplayDate(post)}
            </p>
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/25">
              Score
            </p>

            <p className="mt-2 text-sm font-bold text-white/65">
              {typeof post.outcome
                ?.contentScore === "number"
                ? `${post.outcome.contentScore}/10`
                : "Not measured"}
            </p>
          </div>
        </div>
      </SpotlightCard>
    </Link>
  );
}