"use client";

import Image from "next/image";
import {
  useMemo,
  useState,
} from "react";
import {
  ArrowUpRight,
  CalendarDays,
  ExternalLink,
  ImageIcon,
  Layers3,
  Play,
  Radio,
  Sparkles,
} from "lucide-react";

import { BodyText } from "@/components/ui/BodyText";
import { Container } from "@/components/ui/Container";
import { DisplayTitle } from "@/components/ui/DisplayTitle";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SpotlightCard } from "@/components/ui/SpotlightCard";

import type {
  PublicMediaPlatform,
  PublicMediaPost,
} from "@/types/public-media";

interface MediaPageProps {
  posts: PublicMediaPost[];
}

interface PlatformOption {
  value: string;
  label: string;
}

const platformOrder = [
  "linkedin",
  "instagram",
  "youtube",
  "x",
  "threads",
  "facebook",
];

const platformDescriptions: Record<
  string,
  string
> = {
  linkedin:
    "Founder lessons, product strategy and ideas from building technology companies.",
  instagram:
    "Behind the scenes, fitness, travel, daily building and shorter visual stories.",
  youtube:
    "Product demonstrations, conversations, interviews and long-form thinking.",
  x: "Short observations, ideas, experiments and lessons shared in real time.",
  threads:
    "Informal founder notes, conversations and daily observations.",
  facebook:
    "Community updates, company stories and selected public posts.",
};

const platformFallbackLinks: Record<
  string,
  string
> = {
  linkedin:
    "https://www.linkedin.com/in/aakashvatsal",
  instagram:
    "https://www.instagram.com/",
  youtube: "https://www.youtube.com/",
  x: "https://x.com/",
  threads:
    "https://www.threads.net/",
  facebook:
    "https://www.facebook.com/",
};

function formatLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

function formatPlatform(
  platform: PublicMediaPlatform,
) {
  if (
    platform.toLowerCase() === "x"
  ) {
    return "X";
  }

  return formatLabel(platform);
}

function formatDate(date?: string) {
  if (!date) {
    return "Recently";
  }

  const parsedDate = new Date(date);

  if (
    Number.isNaN(parsedDate.getTime())
  ) {
    return "Recently";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(parsedDate);
}

function getPostDate(
  post: PublicMediaPost,
) {
  return (
    post.publishing?.publishedAt ??
    post.date ??
    post.createdAt
  );
}

function getPostDescription(
  post: PublicMediaPost,
) {
  return (
    post.content.hook ??
    post.content.shortDescription ??
    post.content.detailedDescription ??
    post.content.caption ??
    post.strategy?.coreMessage ??
    platformDescriptions[
      post.platform.toLowerCase()
    ] ??
    "A new public update from Aakash."
  );
}

function getPostImage(
  post: PublicMediaPost,
) {
  const creative = post.creative;

  if (!creative) {
    return undefined;
  }

  return (
    creative.thumbnailUrl ??
    creative.coverImageUrl ??
    creative.imageUrl ??
    creative.assetUrls?.find(
      (asset) =>
        /\.(png|jpg|jpeg|webp|gif|avif)(\?.*)?$/i.test(
          asset,
        ),
    )
  );
}

function getPostLink(
  post: PublicMediaPost,
) {
  return (
    post.publishing
      ?.externalPostUrl ??
    platformFallbackLinks[
      post.platform.toLowerCase()
    ] ??
    "#"
  );
}

function getContentScore(
  post: PublicMediaPost,
) {
  return (
    post.outcome?.contentScore ?? 0
  );
}

function getFeaturedPost(
  posts: PublicMediaPost[],
) {
  const explicitlyFeatured =
    posts.find(
      (post) => post.isFeatured,
    );

  if (explicitlyFeatured) {
    return explicitlyFeatured;
  }

  const postsWithScores = [...posts]
    .filter(
      (post) =>
        typeof post.outcome
          ?.contentScore === "number",
    )
    .sort(
      (firstPost, secondPost) =>
        getContentScore(secondPost) -
        getContentScore(firstPost),
    );

  return postsWithScores[0] ?? posts[0];
}

function getPostIcon(
  postType: string,
) {
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

export function MediaPage({
  posts,
}: MediaPageProps) {
  const [selectedPlatform, setSelectedPlatform] =
    useState("all");

  const platformOptions =
    useMemo<PlatformOption[]>(() => {
      const availablePlatforms =
        Array.from(
          new Set(
            posts.map((post) =>
              post.platform.toLowerCase(),
            ),
          ),
        ).sort((first, second) => {
          const firstIndex =
            platformOrder.indexOf(first);

          const secondIndex =
            platformOrder.indexOf(second);

          if (
            firstIndex === -1 &&
            secondIndex === -1
          ) {
            return first.localeCompare(
              second,
            );
          }

          if (firstIndex === -1) {
            return 1;
          }

          if (secondIndex === -1) {
            return -1;
          }

          return firstIndex - secondIndex;
        });

      return [
        {
          value: "all",
          label: "All",
        },
        ...availablePlatforms.map(
          (platform) => ({
            value: platform,
            label:
              formatPlatform(platform),
          }),
        ),
      ];
    }, [posts]);

  const filteredPosts = useMemo(() => {
    if (selectedPlatform === "all") {
      return posts;
    }

    return posts.filter(
      (post) =>
        post.platform.toLowerCase() ===
        selectedPlatform,
    );
  }, [posts, selectedPlatform]);

  const featuredPost = useMemo(
    () =>
      getFeaturedPost(
        selectedPlatform === "all"
          ? posts
          : filteredPosts,
      ),
    [
      filteredPosts,
      posts,
      selectedPlatform,
    ],
  );

  const remainingPosts =
    useMemo(() => {
      if (!featuredPost) {
        return filteredPosts;
      }

      return filteredPosts.filter(
        (post) =>
          post._id !== featuredPost._id,
      );
    }, [featuredPost, filteredPosts]);

  const publishedPosts =
    posts.filter(
      (post) =>
        post.publishing?.status ===
          "posted" ||
        post.publishing?.status ===
          "published" ||
        !post.publishing?.status,
    ).length;

  const latestPublishedDate =
    posts[0]
      ? getPostDate(posts[0])
      : undefined;

  const platformCount = new Set(
    posts.map((post) =>
      post.platform.toLowerCase(),
    ),
  ).size;

  return (
    <main className="min-h-screen overflow-hidden bg-[#030608] text-white">
      <MediaHero
        postCount={posts.length}
        platformCount={platformCount}
        publishedPosts={publishedPosts}
        latestPublishedDate={
          latestPublishedDate
        }
      />

      <section className="pb-32">
        <Container>
          {posts.length > 0 ? (
            <>
              <PlatformFilters
                options={platformOptions}
                selectedPlatform={
                  selectedPlatform
                }
                onChange={
                  setSelectedPlatform
                }
              />

              {featuredPost && (
                <div className="mt-10">
                  <FeaturedMedia
                    post={featuredPost}
                  />
                </div>
              )}

              <div className="mt-24">
                <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
                  <div>
                    <Eyebrow>
                      Latest posts
                    </Eyebrow>

                    <h2 className="mt-5 max-w-3xl text-4xl font-black tracking-[-0.055em] md:text-6xl">
                      Ideas, lessons and
                      the work behind the
                      work.
                    </h2>
                  </div>

                  <p className="max-w-sm text-sm leading-7 text-white/40">
                    {
                      filteredPosts.length
                    }{" "}
                    {filteredPosts.length ===
                    1
                      ? "post"
                      : "posts"}{" "}
                    in this view.
                  </p>
                </div>

                {remainingPosts.length >
                0 ? (
                  <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                    {remainingPosts.map(
                      (post) => (
                        <MediaCard
                          key={post._id}
                          post={post}
                        />
                      ),
                    )}
                  </div>
                ) : (
                  <div className="mt-10">
                    <EmptyFilteredState />
                  </div>
                )}
              </div>

              <PlatformDirectory
                posts={posts}
              />
            </>
          ) : (
            <EmptyMediaState />
          )}
        </Container>
      </section>
    </main>
  );
}

function MediaHero({
  postCount,
  platformCount,
  publishedPosts,
  latestPublishedDate,
}: {
  postCount: number;
  platformCount: number;
  publishedPosts: number;
  latestPublishedDate?: string;
}) {
  return (
    <section className="relative py-28 md:py-36">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute left-1/2 top-[-240px] h-[600px] w-[600px] -translate-x-1/2 rounded-full bg-[#C6FF32]/[0.08] blur-[140px]" />

        <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:72px_72px] [mask-image:linear-gradient(to_bottom,black,transparent_80%)]" />
      </div>

      <Container>
        <div className="relative">
          <div className="flex items-center gap-3">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-[#C6FF32]/20 bg-[#C6FF32]/10">
              <Sparkles className="h-4 w-4 text-[#C6FF32]" />
            </span>

            <Eyebrow>Media</Eyebrow>
          </div>

          <DisplayTitle className="mt-8 max-w-5xl">
            Building in public, across
            platforms.
          </DisplayTitle>

          <BodyText className="mt-8 max-w-3xl">
            Founder thoughts, product
            updates, sports technology,
            fitness, videos, experiments
            and the daily process of
            building ambitious companies.
          </BodyText>

          <div className="mt-14 grid max-w-5xl grid-cols-2 gap-px overflow-hidden rounded-[26px] border border-white/10 bg-white/10 md:grid-cols-4">
            <HeroStat
              value={String(postCount)}
              label="Public posts"
            />

            <HeroStat
              value={String(
                platformCount,
              )}
              label="Platforms"
            />

            <HeroStat
              value={String(
                publishedPosts,
              )}
              label="Published"
            />

            <HeroStat
              value={
                latestPublishedDate
                  ? formatDate(
                      latestPublishedDate,
                    )
                  : "Soon"
              }
              label="Latest update"
            />
          </div>
        </div>
      </Container>
    </section>
  );
}

function HeroStat({
  value,
  label,
}: {
  value: string;
  label: string;
}) {
  return (
    <div className="bg-[#070a0c] p-6 md:p-8">
      <p className="text-2xl font-black tracking-[-0.04em] md:text-3xl">
        {value}
      </p>

      <p className="mt-2 text-xs font-bold uppercase tracking-[0.16em] text-white/30">
        {label}
      </p>
    </div>
  );
}

function PlatformFilters({
  options,
  selectedPlatform,
  onChange,
}: {
  options: PlatformOption[];
  selectedPlatform: string;
  onChange: (platform: string) => void;
}) {
  return (
    <div className="flex flex-wrap gap-3">
      {options.map((option) => {
        const isSelected =
          selectedPlatform ===
          option.value;

        return (
          <button
            key={option.value}
            type="button"
            onClick={() =>
              onChange(option.value)
            }
            className={
              isSelected
                ? "rounded-full border border-[#C6FF32]/30 bg-[#C6FF32] px-5 py-3 text-xs font-black uppercase tracking-[0.15em] text-black transition"
                : "rounded-full border border-white/10 bg-white/[0.025] px-5 py-3 text-xs font-black uppercase tracking-[0.15em] text-white/45 transition hover:border-white/20 hover:text-white"
            }
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

function FeaturedMedia({
  post,
}: {
  post: PublicMediaPost;
}) {
  const image = getPostImage(post);
  const href = getPostLink(post);
  const PostIcon = getPostIcon(
    post.postType,
  );

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group block"
    >
      <SpotlightCard className="relative overflow-hidden p-0 transition duration-500 hover:border-[#C6FF32]/30">
        <div className="grid min-h-[520px] lg:grid-cols-[1.05fr_0.95fr]">
          <div className="relative min-h-[340px] overflow-hidden border-b border-white/10 bg-[#080c0f] lg:min-h-full lg:border-b-0 lg:border-r">
            {image ? (
              <>
                <Image
                  src={image}
                  alt={
                    post.content.title
                  }
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 55vw"
                  className="object-cover transition duration-700 group-hover:scale-[1.04]"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              </>
            ) : (
              <FeaturedPlaceholder
                platform={
                  post.platform
                }
              />
            )}

            <div className="absolute left-6 top-6 flex flex-wrap gap-3">
              <MediaBadge>
                {formatPlatform(
                  post.platform,
                )}
              </MediaBadge>

              <MediaBadge>
                <PostIcon className="h-3.5 w-3.5" />
                {formatLabel(
                  post.postType,
                )}
              </MediaBadge>
            </div>
          </div>

          <div className="flex flex-col justify-between p-8 md:p-12 lg:p-14">
            <div>
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#C6FF32]">
                <Sparkles className="h-4 w-4" />
                Featured post
              </div>

              <h2 className="mt-8 text-4xl font-black leading-[0.98] tracking-[-0.06em] transition group-hover:text-[#C6FF32] md:text-6xl">
                {post.content.title}
              </h2>

              <p className="mt-7 line-clamp-5 text-base leading-8 text-white/45">
                {getPostDescription(post)}
              </p>

              <PostMeta post={post} />
            </div>

            <div className="mt-12 flex items-center justify-between border-t border-white/10 pt-7">
              <span className="text-sm font-black uppercase tracking-[0.15em] text-white/50">
                Open post
              </span>

              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[#C6FF32] text-black transition duration-300 group-hover:translate-x-1 group-hover:-translate-y-1">
                <ArrowUpRight className="h-5 w-5" />
              </span>
            </div>
          </div>
        </div>
      </SpotlightCard>
    </a>
  );
}

function MediaCard({
  post,
}: {
  post: PublicMediaPost;
}) {
  const image = getPostImage(post);
  const href = getPostLink(post);
  const PostIcon = getPostIcon(
    post.postType,
  );

  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer"
      className="group block h-full"
    >
      <SpotlightCard className="flex h-full flex-col overflow-hidden p-0 transition duration-500 hover:-translate-y-1 hover:border-[#C6FF32]/30">
        <div className="relative aspect-[16/10] overflow-hidden border-b border-white/10 bg-[#080c0f]">
          {image ? (
            <>
              <Image
                src={image}
                alt={post.content.title}
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                className="object-cover transition duration-700 group-hover:scale-105"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
            </>
          ) : (
            <CardPlaceholder
              platform={post.platform}
              postType={post.postType}
            />
          )}

          <div className="absolute left-4 top-4 flex flex-wrap gap-2">
            <MediaBadge>
              {formatPlatform(
                post.platform,
              )}
            </MediaBadge>

            <MediaBadge>
              <PostIcon className="h-3.5 w-3.5" />
              {formatLabel(post.postType)}
            </MediaBadge>
          </div>
        </div>

        <div className="flex flex-1 flex-col p-7">
          <h3 className="text-2xl font-black leading-tight tracking-[-0.045em] transition group-hover:text-[#C6FF32]">
            {post.content.title}
          </h3>

          <p className="mt-4 line-clamp-3 text-sm leading-7 text-white/40">
            {getPostDescription(post)}
          </p>

          {post.strategy
            ?.contentPillar && (
            <p className="mt-5 text-xs font-black uppercase tracking-[0.16em] text-white/25">
              {
                post.strategy
                  .contentPillar
              }
            </p>
          )}

          <div className="mt-auto flex items-center justify-between border-t border-white/10 pt-6">
            <div className="flex items-center gap-2 text-xs font-bold text-white/30">
              <CalendarDays className="h-4 w-4" />

              {formatDate(
                getPostDate(post),
              )}
            </div>

            <ArrowUpRight className="h-5 w-5 text-[#C6FF32] transition duration-300 group-hover:translate-x-1 group-hover:-translate-y-1" />
          </div>
        </div>
      </SpotlightCard>
    </a>
  );
}

function PostMeta({
  post,
}: {
  post: PublicMediaPost;
}) {
  const metrics =
    post.expectation?.metrics?.slice(
      0,
      2,
    ) ?? [];

  return (
    <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 text-xs font-bold text-white/30">
      <span className="flex items-center gap-2">
        <CalendarDays className="h-4 w-4" />
        {formatDate(getPostDate(post))}
      </span>

      {post.strategy
        ?.contentPillar && (
        <span>
          {
            post.strategy
              .contentPillar
          }
        </span>
      )}

      {metrics.map((metric) => (
        <span key={metric.metric}>
          {metric.expectedValue}
          {metric.unit
            ? ` ${metric.unit}`
            : ""}{" "}
          {formatLabel(metric.metric)}
        </span>
      ))}
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

function FeaturedPlaceholder({
  platform,
}: {
  platform: string;
}) {
  return (
    <div className="absolute inset-0 flex items-end bg-[radial-gradient(circle_at_top_left,rgba(198,255,50,0.20),transparent_38%),linear-gradient(145deg,#0d1417,#050708)] p-10">
      <div>
        <p className="text-7xl font-black uppercase tracking-[-0.08em] text-white/[0.06] md:text-9xl">
          {formatPlatform(platform)}
        </p>

        <p className="mt-4 max-w-sm text-sm leading-7 text-white/30">
          Building, learning and sharing
          the process publicly.
        </p>
      </div>
    </div>
  );
}

function CardPlaceholder({
  platform,
  postType,
}: {
  platform: string;
  postType: string;
}) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-[radial-gradient(circle_at_top_left,rgba(198,255,50,0.16),transparent_38%),linear-gradient(145deg,#0d1417,#050708)]">
      <div className="text-center">
        <p className="text-4xl font-black uppercase tracking-[-0.06em] text-white/[0.08]">
          {formatPlatform(platform)}
        </p>

        <p className="mt-3 text-[10px] font-black uppercase tracking-[0.3em] text-[#C6FF32]/50">
          {formatLabel(postType)}
        </p>
      </div>
    </div>
  );
}

function PlatformDirectory({
  posts,
}: {
  posts: PublicMediaPost[];
}) {
  const platforms = Array.from(
    new Set(
      posts.map((post) =>
        post.platform.toLowerCase(),
      ),
    ),
  );

  if (!platforms.length) {
    return null;
  }

  return (
    <section className="mt-32 border-t border-white/10 pt-20">
      <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
        <div>
          <Eyebrow>
            Across the internet
          </Eyebrow>

          <h2 className="mt-5 text-4xl font-black tracking-[-0.055em] md:text-6xl">
            Find me everywhere.
          </h2>
        </div>

        <p className="max-w-md text-sm leading-7 text-white/35">
          Different platforms contain
          different parts of the journey:
          deeper thinking, visual stories,
          product demonstrations and daily
          observations.
        </p>
      </div>

      <div className="mt-10 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {platforms.map((platform) => {
          const platformPosts =
            posts.filter(
              (post) =>
                post.platform.toLowerCase() ===
                platform,
            );

          const externalUrl =
            platformPosts.find(
              (post) =>
                post.publishing
                  ?.externalPostUrl,
            )?.publishing
              ?.externalPostUrl ??
            platformFallbackLinks[
              platform
            ] ??
            "#";

          return (
            <a
              key={platform}
              href={externalUrl}
              target="_blank"
              rel="noreferrer"
              className="group"
            >
              <SpotlightCard className="flex h-full items-center justify-between gap-6 p-7 transition hover:border-[#C6FF32]/30">
                <div>
                  <Eyebrow>
                    {formatPlatform(
                      platform,
                    )}
                  </Eyebrow>

                  <p className="mt-4 text-sm leading-7 text-white/40">
                    {platformDescriptions[
                      platform
                    ] ??
                      `${platformPosts.length} public posts and updates.`}
                  </p>

                  <p className="mt-4 text-xs font-black uppercase tracking-[0.15em] text-white/25">
                    {
                      platformPosts.length
                    }{" "}
                    {platformPosts.length ===
                    1
                      ? "post"
                      : "posts"}
                  </p>
                </div>

                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-white/10 text-[#C6FF32] transition group-hover:border-[#C6FF32]/30 group-hover:bg-[#C6FF32] group-hover:text-black">
                  <ExternalLink className="h-4 w-4" />
                </span>
              </SpotlightCard>
            </a>
          );
        })}
      </div>
    </section>
  );
}

function EmptyFilteredState() {
  return (
    <SpotlightCard className="p-10 text-center">
      <p className="text-xl font-black tracking-[-0.03em]">
        No additional posts on this
        platform yet.
      </p>

      <p className="mt-3 text-sm text-white/35">
        The featured post is currently the
        only available post in this view.
      </p>
    </SpotlightCard>
  );
}

function EmptyMediaState() {
  return (
    <SpotlightCard className="relative overflow-hidden p-10 md:p-16">
      <div className="absolute right-[-80px] top-[-80px] h-64 w-64 rounded-full bg-[#C6FF32]/10 blur-3xl" />

      <div className="relative max-w-2xl">
        <Eyebrow>
          Publishing soon
        </Eyebrow>

        <h2 className="mt-6 text-4xl font-black tracking-[-0.055em] md:text-6xl">
          The public archive is being
          prepared.
        </h2>

        <p className="mt-6 text-base leading-8 text-white/40">
          Founder thoughts, product
          updates, sports technology
          lessons and behind-the-scenes
          content will appear here once
          published.
        </p>
      </div>
    </SpotlightCard>
  );
}