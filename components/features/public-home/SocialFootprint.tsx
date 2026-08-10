"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  ImageIcon,
  Layers3,
  Play,
  Radio,
  Sparkles,
} from "lucide-react";

import Reveal from "@/components/ui/Reveal";
import { SpotlightCard } from "@/components/ui/SpotlightCard";

import type { PublicMediaPost } from "@/types/public-media";

interface SocialFootprintProps {
  media: PublicMediaPost[];
}

const platformFallbackLinks: Record<string, string> = {
  linkedin: "https://www.linkedin.com/in/aakashvatsal",
  instagram: "https://www.instagram.com/",
  youtube: "https://www.youtube.com/",
  x: "https://x.com/",
  threads: "https://www.threads.net/",
  facebook: "https://www.facebook.com/",
};

function formatLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

function formatPlatform(platform: string) {
  if (platform.toLowerCase() === "x") {
    return "X";
  }

  return formatLabel(platform);
}

function formatDate(date?: string) {
  if (!date) {
    return "Recently";
  }

  const parsedDate = new Date(date);

  if (Number.isNaN(parsedDate.getTime())) {
    return "Recently";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(parsedDate);
}

function getPostDate(post: PublicMediaPost) {
  return (
    post.publishing?.publishedAt ??
    post.date ??
    post.createdAt ??
    ""
  );
}

function getPostLink(post: PublicMediaPost) {
  return (
    post.publishing?.externalPostUrl ??
    platformFallbackLinks[post.platform.toLowerCase()] ??
    "#"
  );
}

function getPostDescription(post: PublicMediaPost) {
  return (
    post.content.hook ??
    post.content.shortDescription ??
    post.content.detailedDescription ??
    post.content.caption ??
    post.strategy?.coreMessage ??
    "A new public update from Aakash."
  );
}

function getPostImage(post: PublicMediaPost) {
  const creative = post.creative;

  if (!creative) {
    return undefined;
  }

  return (
    creative.thumbnailUrl ??
    creative.coverImageUrl ??
    creative.imageUrl ??
    creative.assetUrls?.find((asset) =>
      /\.(png|jpg|jpeg|webp|gif|avif)(\?.*)?$/i.test(
        asset,
      ),
    )
  );
}

function getPostIcon(postType: string) {
  switch (postType.toLowerCase()) {
    case "video":
    case "reel":
    case "short":
      return Play;

    case "carousel":
      return Layers3;

    case "image":
      return ImageIcon;

    default:
      return Radio;
  }
}

function sortPosts(media: PublicMediaPost[]) {
  return [...media].sort((firstPost, secondPost) => {
    const firstDate = new Date(
      getPostDate(firstPost),
    ).getTime();

    const secondDate = new Date(
      getPostDate(secondPost),
    ).getTime();

    return secondDate - firstDate;
  });
}

export function SocialFootprint({
  media,
}: SocialFootprintProps) {
  const visiblePosts = sortPosts(media)
    .filter(
      (post) =>
        post.isActive !== false &&
        post.isArchived !== true &&
        post.isPrivate !== true,
    )
    .slice(0, 4);

  const featuredPost = visiblePosts[0];
  const secondaryPosts = visiblePosts.slice(1, 4);

  return (
    <Reveal>
      <section className="relative overflow-hidden border-t border-white/10 px-6 py-32 md:px-12 lg:px-16">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -right-40 top-20 h-[500px] w-[500px] rounded-full bg-[#C6FF32]/[0.06] blur-[140px]" />

          <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.018)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.018)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:linear-gradient(to_bottom,transparent,black_15%,black_80%,transparent)]" />
        </div>

        <div className="relative mx-auto max-w-[1600px]">
          <div className="flex flex-col justify-between gap-10 lg:flex-row lg:items-end">
            <div className="max-w-5xl">
              <div className="flex items-center gap-3">
                {/* <span className="flex h-8 w-8 items-center justify-center rounded-full border border-[#C6FF32]/20 bg-[#C6FF32]/10">
                  <Sparkles className="h-4 w-4 text-[#C6FF32]" />
                </span> */}

                <p className="text-xs font-black uppercase tracking-[0.35em] text-[#C6FF32]">
                  Building in public
                </p>
              </div>

              <h2 className="mt-7 text-5xl font-black leading-[0.94] tracking-[-0.06em] md:text-7xl lg:text-8xl">
                I document the journey while I build.
              </h2>
            </div>

            <div className="max-w-md">
              <p className="text-base leading-8 text-white/40">
                Founder thoughts, company updates, sports technology,
                product lessons, videos and the daily process behind
                building ambitious ideas.
              </p>

              <Link
                href="/media"
                className="group mt-7 inline-flex items-center gap-3 text-xs font-black uppercase tracking-[0.18em] text-[#C6FF32]"
              >
                Explore all media

                <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          {featuredPost ? (
            <>
              <div className="mt-16">
                <FeaturedPost post={featuredPost} />
              </div>

              {secondaryPosts.length > 0 && (
                <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                  {secondaryPosts.map((post, index) => (
                    <CompactPostCard
                      key={post._id}
                      post={post}
                      index={index}
                    />
                  ))}
                </div>
              )}

              <MediaFooter media={visiblePosts} />
            </>
          ) : (
            <EmptySocialFootprint />
          )}
        </div>
      </section>
    </Reveal>
  );
}

function FeaturedPost({
  post,
}: {
  post: PublicMediaPost;
}) {
  const image = getPostImage(post);
  const href = getPostLink(post);
  const PostIcon = getPostIcon(post.postType);

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{
        y: -4,
      }}
      whileTap={{
        scale: 0.995,
      }}
      transition={{
        duration: 0.25,
        ease: "easeOut",
      }}
      className="group block"
    >
      <SpotlightCard className="overflow-hidden rounded-[38px] border border-white/10 bg-white/[0.025] p-0 transition duration-500 group-hover:border-[#C6FF32]/35">
        <div className="grid min-h-[540px] lg:grid-cols-[1.1fr_0.9fr]">
          <div className="relative min-h-[340px] overflow-hidden border-b border-white/10 bg-[#080c0f] lg:min-h-full lg:border-b-0 lg:border-r">
            {image ? (
              <>
                <Image
                  src={image}
                  alt={post.content.title}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-cover transition duration-700 group-hover:scale-[1.04]"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />
              </>
            ) : (
              <PostPlaceholder
                platform={post.platform}
                featured
              />
            )}

            <div className="absolute left-6 top-6 flex flex-wrap gap-2">
              <MediaBadge>
                {formatPlatform(post.platform)}
              </MediaBadge>

              <MediaBadge>
                <PostIcon className="h-3.5 w-3.5" />
                {formatLabel(post.postType)}
              </MediaBadge>
            </div>

            <div className="absolute bottom-6 left-6">
              <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/40">
                Latest public signal
              </p>
            </div>
          </div>

          <div className="flex flex-col justify-between p-8 md:p-12 lg:p-14">
            <div>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#C6FF32]">
                <Sparkles className="h-4 w-4" />
                Featured post
              </div>

              <h3 className="mt-8 text-4xl font-black leading-[0.98] tracking-[-0.06em] transition duration-300 group-hover:text-[#C6FF32] md:text-6xl">
                {post.content.title}
              </h3>

              <p className="mt-7 line-clamp-4 text-base leading-8 text-white/45">
                {getPostDescription(post)}
              </p>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs font-bold text-white/30">
                <span className="flex items-center gap-2">
                  <CalendarDays className="h-4 w-4" />
                  {formatDate(getPostDate(post))}
                </span>

                {post.strategy?.contentPillar && (
                  <span>
                    {post.strategy.contentPillar}
                  </span>
                )}

                {post.strategy?.primaryGoal && (
                  <span>
                    {formatLabel(
                      post.strategy.primaryGoal,
                    )}
                  </span>
                )}
              </div>
            </div>

            <div className="mt-12 flex items-center justify-between border-t border-white/10 pt-7">
              <span className="text-xs font-black uppercase tracking-[0.18em] text-white/50">
                Open post
              </span>

              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#C6FF32] text-black transition duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
                <ArrowUpRight className="h-5 w-5" />
              </span>
            </div>
          </div>
        </div>
      </SpotlightCard>
    </motion.a>
  );
}

function CompactPostCard({
  post,
  index,
}: {
  post: PublicMediaPost;
  index: number;
}) {
  const image = getPostImage(post);
  const href = getPostLink(post);
  const PostIcon = getPostIcon(post.postType);

  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      initial={{
        opacity: 0,
        y: 24,
      }}
      whileInView={{
        opacity: 1,
        y: 0,
      }}
      viewport={{
        once: true,
        margin: "-80px",
      }}
      transition={{
        duration: 0.5,
        delay: index * 0.08,
      }}
      whileHover={{
        y: -6,
      }}
      className="group block h-full"
    >
      <SpotlightCard className="flex h-full flex-col overflow-hidden rounded-[32px] border border-white/10 bg-white/[0.025] p-0 transition duration-500 group-hover:border-[#C6FF32]/35">
        <div className="relative aspect-[16/10] overflow-hidden border-b border-white/10 bg-[#080c0f]">
          {image ? (
            <>
              <Image
                src={image}
                alt={post.content.title}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover transition duration-700 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            </>
          ) : (
            <PostPlaceholder platform={post.platform} />
          )}

          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <MediaBadge>
              {formatPlatform(post.platform)}
            </MediaBadge>

            <MediaBadge>
              <PostIcon className="h-3.5 w-3.5" />
              {formatLabel(post.postType)}
            </MediaBadge>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-7">
          <h3 className="text-2xl font-black leading-tight tracking-[-0.045em] transition duration-300 group-hover:text-[#C6FF32]">
            {post.content.title}
          </h3>

          <p className="mt-4 line-clamp-3 text-sm leading-7 text-white/40">
            {getPostDescription(post)}
          </p>

          <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-6">
            <span className="flex items-center gap-2 text-xs font-bold text-white/30">
              <CalendarDays className="h-4 w-4" />
              {formatDate(getPostDate(post))}
            </span>

            <ArrowUpRight className="h-5 w-5 text-[#C6FF32] transition duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
          </div>
        </div>
      </SpotlightCard>
    </motion.a>
  );
}

function MediaFooter({
  media,
}: {
  media: PublicMediaPost[];
}) {
  const platformCount = new Set(
    media.map((post) => post.platform.toLowerCase()),
  ).size;

  return (
    <div className="mt-12 flex flex-col justify-between gap-7 rounded-[30px] border border-white/10 bg-white/[0.02] px-7 py-7 md:flex-row md:items-center md:px-9">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#C6FF32]">
          Public archive
        </p>

        <p className="mt-3 max-w-2xl text-sm leading-7 text-white/40">
          Recent posts from {platformCount}{" "}
          {platformCount === 1 ? "platform" : "platforms"},
          covering the companies, ideas and systems I am building.
        </p>
      </div>

      <Link
        href="/media"
        className="group inline-flex shrink-0 items-center justify-center gap-3 rounded-full bg-[#C6FF32] px-6 py-4 text-xs font-black uppercase tracking-[0.16em] text-black transition hover:scale-[1.02]"
      >
        View all media

        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
      </Link>
    </div>
  );
}

function MediaBadge({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-black/60 px-3 py-2 text-[10px] font-black uppercase tracking-[0.16em] text-white/70 backdrop-blur-md">
      {children}
    </span>
  );
}

function PostPlaceholder({
  platform,
  featured = false,
}: {
  platform: string;
  featured?: boolean;
}) {
  return (
    <div className="absolute inset-0 flex items-end overflow-hidden bg-[radial-gradient(circle_at_top_left,rgba(198,255,50,0.20),transparent_38%),linear-gradient(145deg,#0d1417,#050708)] p-7">
      <div className="absolute right-[-20%] top-[-25%] h-[70%] w-[70%] rounded-full border border-white/[0.04]" />
      <div className="absolute right-[-5%] top-[-10%] h-[45%] w-[45%] rounded-full border border-[#C6FF32]/[0.08]" />

      <div className="relative">
        <p
          className={
            featured
              ? "text-6xl font-black uppercase tracking-[-0.08em] text-white/[0.07] md:text-8xl"
              : "text-4xl font-black uppercase tracking-[-0.07em] text-white/[0.08]"
          }
        >
          {formatPlatform(platform)}
        </p>

        {/* <p className="mt-3 text-[10px] font-black uppercase tracking-[0.28em] text-[#C6FF32]/50">
          Building in public
        </p> */}
      </div>
    </div>
  );
}

function EmptySocialFootprint() {
  return (
    <div className="mt-16">
      <SpotlightCard className="relative overflow-hidden rounded-[38px] border border-white/10 bg-white/[0.025] p-10 md:p-16">
        <div className="absolute -right-20 -top-20 h-72 w-72 rounded-full bg-[#C6FF32]/10 blur-[100px]" />

        <div className="relative max-w-3xl">
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#C6FF32]">
            Publishing soon
          </p>

          <h3 className="mt-6 text-4xl font-black tracking-[-0.055em] md:text-6xl">
            The next public signal is being prepared.
          </h3>

          <p className="mt-6 max-w-2xl text-base leading-8 text-white/40">
            Founder notes, product updates, videos and lessons from
            building 8lete, Frayto and the wider personal operating
            system will appear here.
          </p>

          <Link
            href="/media"
            className="group mt-8 inline-flex items-center gap-3 text-xs font-black uppercase tracking-[0.18em] text-[#C6FF32]"
          >
            Open media archive

            <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </SpotlightCard>
    </div>
  );
}