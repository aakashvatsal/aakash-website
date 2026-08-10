import Link from "next/link";

import { SpotlightCard } from "@/components/ui/SpotlightCard";
import type { MediaPost } from "@/types/media";

interface MediaDetailsProps {
  post: MediaPost;
}

function formatLabel(value?: string) {
  if (!value) {
    return "Not set";
  }

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

function formatPlatform(value: string) {
  if (value === "linkedin") {
    return "LinkedIn";
  }

  if (value === "youtube") {
    return "YouTube";
  }

  return formatLabel(value);
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

function formatDateTime(value?: string) {
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
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function MediaDetails({
  post,
}: MediaDetailsProps) {
  return (
    <main className="min-h-screen bg-[#030608] px-6 py-12 text-white md:px-10 xl:px-14">
      <div className="mx-auto max-w-[1500px]">
        <header className="flex flex-col justify-between gap-8 lg:flex-row lg:items-start">
          <div className="max-w-4xl">
            <Link
              href="/admin/media"
              className="text-xs font-black uppercase tracking-[0.18em] text-white/40 transition hover:text-[#C6FF32]"
            >
              ← Back to media
            </Link>

            <div className="mt-8 flex flex-wrap gap-2">
              <Badge>
                {formatPlatform(post.platform)}
              </Badge>

              <Badge accent>
                {formatLabel(
                  post.publishing.status,
                )}
              </Badge>

              <Badge>
                {formatLabel(post.postType)}
              </Badge>

              {post.isArchived && (
                <span className="inline-flex rounded-full border border-red-400/20 bg-red-400/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-red-300">
                  Archived
                </span>
              )}

              {!post.isActive && (
                <span className="inline-flex rounded-full border border-orange-400/20 bg-orange-400/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-orange-300">
                  Inactive
                </span>
              )}
            </div>

            <h1 className="mt-7 text-4xl font-black leading-tight tracking-[-0.055em] md:text-6xl">
              {post.content.title}
            </h1>

            {post.content.hook && (
              <p className="mt-6 max-w-3xl text-lg leading-8 text-white/50">
                {post.content.hook}
              </p>
            )}
          </div>

          <div className="flex flex-wrap gap-3">
            {post.publishing.externalPostUrl && (
              <a
                href={
                  post.publishing
                    .externalPostUrl
                }
                target="_blank"
                rel="noreferrer"
                className="inline-flex h-12 items-center justify-center rounded-2xl border border-white/10 px-5 text-xs font-black uppercase tracking-[0.16em] text-white/60 transition hover:border-white/20 hover:text-white"
              >
                View post
              </a>
            )}

            <Link
              href={`/admin/media/${post._id}/edit`}
              className="inline-flex h-12 items-center justify-center rounded-2xl bg-[#C6FF32] px-6 text-xs font-black uppercase tracking-[0.16em] text-black transition hover:brightness-110"
            >
              Edit media
            </Link>
          </div>
        </header>

        <section className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <OverviewMetric
            label="Content date"
            value={formatDate(post.date)}
          />

          <OverviewMetric
            label="Scheduled"
            value={formatDateTime(
              post.publishing.scheduledAt,
            )}
          />

          <OverviewMetric
            label="Published"
            value={formatDateTime(
              post.publishing.publishedAt,
            )}
          />

          <OverviewMetric
            label="Content score"
            value={
              typeof post.outcome
                ?.contentScore === "number"
                ? `${post.outcome.contentScore}/10`
                : "Not measured"
            }
          />
        </section>

        <div className="mt-10 space-y-6">
          <Section title="Strategy">
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              <Detail
                label="Primary goal"
                value={formatLabel(
                  post.strategy.primaryGoal,
                )}
              />

              <Detail
                label="Secondary goals"
                value={
                  post.strategy.secondaryGoals
                    ?.length
                    ? post.strategy.secondaryGoals
                        .map(formatLabel)
                        .join(", ")
                    : "None"
                }
              />

              <Detail
                label="Content pillar"
                value={
                  post.strategy
                    .contentPillar
                }
              />

              <Detail
                label="Target audience"
                value={
                  post.strategy
                    .targetAudience
                }
              />

              <Detail
                label="Audience problem"
                value={
                  post.strategy
                    .audienceProblem
                }
              />

              <Detail
                label="Desired action"
                value={
                  post.strategy
                    .desiredAudienceAction
                }
              />
            </div>

            <LongDetail
              label="Why this content was chosen"
              value={post.strategy.whyChosen}
            />

            <LongDetail
              label="Core message"
              value={
                post.strategy.coreMessage
              }
            />

            <LongDetail
              label="Hypothesis"
              value={
                post.strategy.hypothesis
              }
            />
          </Section>

          <Section title="Content">
            <LongDetail
              label="Short description"
              value={
                post.content
                  .shortDescription
              }
            />

            <LongDetail
              label="Detailed description"
              value={
                post.content
                  .detailedDescription
              }
            />

            <LongDetail
              label="Caption"
              value={post.content.caption}
            />

            <LongDetail
              label="Text post script"
              value={
                post.content
                  .textPostScript
              }
            />

            <LongDetail
              label="Video script"
              value={
                post.content.videoScript
              }
            />

            <LongDetail
              label="Voice-over script"
              value={
                post.content
                  .voiceOverScript
              }
            />

            <ArraySection
              label="Carousel slides"
              items={
                post.content
                  .carouselSlides
              }
              numbered
            />

            <ArraySection
              label="Shot list"
              items={post.content.shotList}
              numbered
            />

            <ArraySection
              label="Hashtags"
              items={post.content.hashtags}
            />

            <LongDetail
              label="Call to action"
              value={post.content.cta}
            />
          </Section>

          <Section title="Creative">
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              <Detail
                label="Image source"
                value={formatLabel(
                  post.creative?.imageSource,
                )}
              />

              <Detail
                label="Video source"
                value={formatLabel(
                  post.creative?.videoSource,
                )}
              />

              <Detail
                label="Permission required"
                value={
                  post.creative
                    ?.permissionRequired
                    ? "Yes"
                    : "No"
                }
              />

              <Detail
                label="Permission taken"
                value={
                  post.creative
                    ?.permissionTaken
                    ? "Yes"
                    : "No"
                }
              />
            </div>

            <LongDetail
              label="Design brief"
              value={
                post.creative?.designBrief
              }
            />

            <LongDetail
              label="Image prompt"
              value={
                post.creative?.imagePrompt
              }
            />

            <LongDetail
              label="Thumbnail prompt"
              value={
                post.creative
                  ?.thumbnailPrompt
              }
            />

            <LongDetail
              label="AI image prompt"
              value={
                post.creative
                  ?.aiImagePrompt
              }
            />

            <LongDetail
              label="AI video prompt"
              value={
                post.creative
                  ?.aiVideoPrompt
              }
            />

            <LongDetail
              label="Real image script"
              value={
                post.creative
                  ?.realImageScript
              }
            />

            <LongDetail
              label="Real video script"
              value={
                post.creative
                  ?.realVideoScript
              }
            />

            <LongDetail
              label="B-roll script"
              value={
                post.creative?.brollScript
              }
            />

            <ArraySection
              label="Required assets"
              items={
                post.creative
                  ?.requiredAssets
              }
            />

            <AssetLinks
              items={
                post.creative?.assetUrls
              }
            />

            <ArraySection
              label="Equipment required"
              items={
                post.creative
                  ?.equipmentRequired
              }
            />

            <LongDetail
              label="Permission notes"
              value={
                post.creative
                  ?.permissionNotes
              }
            />
          </Section>

          <Section title="Publishing">
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              <Detail
                label="Status"
                value={formatLabel(
                  post.publishing.status,
                )}
              />

              <Detail
                label="Scheduled at"
                value={formatDateTime(
                  post.publishing
                    .scheduledAt,
                )}
              />

              <Detail
                label="Published at"
                value={formatDateTime(
                  post.publishing
                    .publishedAt,
                )}
              />

              <Detail
                label="Platform post ID"
                value={
                  post.publishing
                    .platformPostId
                }
              />

              <Detail
                label="Platform account ID"
                value={
                  post.publishing
                    .platformAccountId
                }
              />

              <Detail
                label="Platform media ID"
                value={
                  post.publishing
                    .platformMediaId
                }
              />
            </div>

            <LinkDetail
              label="External post URL"
              value={
                post.publishing
                  .externalPostUrl
              }
            />

            <LinkDetail
              label="Analytics URL"
              value={
                post.publishing.analyticsUrl
              }
            />

            {post.publishing
              .errorMessage && (
              <div className="mt-6 rounded-2xl border border-red-400/15 bg-red-400/10 p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-300">
                  Publishing error
                </p>

                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-red-200/75">
                  {
                    post.publishing
                      .errorMessage
                  }
                </p>
              </div>
            )}
          </Section>

          <Section title="Expectation">
            <LongDetail
              label="Summary"
              value={
                post.expectation?.summary
              }
            />

            <Detail
              label="Evaluation after"
              value={`${
                post.expectation
                  ?.evaluationAfterHours ??
                72
              } hours`}
            />

            <ExpectationMetrics
              metrics={
                post.expectation?.metrics
              }
            />
          </Section>

          <Section title="Outcome">
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
              <Detail
                label="Outcome status"
                value={formatLabel(
                  post.outcome?.status,
                )}
              />

              <Detail
                label="Content score"
                value={
                  typeof post.outcome
                    ?.contentScore ===
                  "number"
                    ? `${post.outcome.contentScore}/10`
                    : "Not measured"
                }
              />

              <Detail
                label="Evaluated at"
                value={formatDateTime(
                  post.outcome
                    ?.evaluatedAt,
                )}
              />
            </div>

            <LongDetail
              label="Result summary"
              value={
                post.outcome
                  ?.resultSummary
              }
            />

            <LongDetail
              label="Expectation result"
              value={
                post.outcome
                  ?.expectationResult
              }
            />

            <LongDetail
              label="What worked"
              value={
                post.outcome?.whatWorked
              }
            />

            <LongDetail
              label="What did not work"
              value={
                post.outcome
                  ?.whatDidNotWork
              }
            />

            <LongDetail
              label="Lesson learned"
              value={
                post.outcome
                  ?.lessonLearned
              }
            />

            <LongDetail
              label="Next action"
              value={
                post.outcome?.nextAction
              }
            />
          </Section>

          <Section title="Analytics sync">
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              <Detail
                label="Enabled"
                value={
                  post.analyticsSync?.enabled
                    ? "Yes"
                    : "No"
                }
              />

              <Detail
                label="Last synced"
                value={formatDateTime(
                  post.analyticsSync
                    ?.lastSyncedAt,
                )}
              />

              <Detail
                label="Next sync"
                value={formatDateTime(
                  post.analyticsSync
                    ?.nextSyncAt,
                )}
              />

              <Detail
                label="Sync attempts"
                value={String(
                  post.analyticsSync
                    ?.syncAttempts ?? 0,
                )}
              />
            </div>

            {post.analyticsSync
              ?.lastSyncError && (
              <div className="mt-6 rounded-2xl border border-red-400/15 bg-red-400/10 p-5">
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-red-300">
                  Last sync error
                </p>

                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-red-200/75">
                  {
                    post.analyticsSync
                      .lastSyncError
                  }
                </p>
              </div>
            )}
          </Section>

          <Section title="Record information">
            <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              <Detail
                label="Media ID"
                value={post._id}
              />

              <Detail
                label="User ID"
                value={post.userId}
              />

              <Detail
                label="Company ID"
                value={post.companyId}
              />

              <Detail
                label="Created"
                value={formatDateTime(
                  post.createdAt,
                )}
              />

              <Detail
                label="Updated"
                value={formatDateTime(
                  post.updatedAt,
                )}
              />

              <Detail
                label="Active"
                value={
                  post.isActive
                    ? "Yes"
                    : "No"
                }
              />

              <Detail
                label="Archived"
                value={
                  post.isArchived
                    ? "Yes"
                    : "No"
                }
              />

              <Detail
                label="Memories linked"
                value={String(
                  post.memoryIds?.length ??
                    0,
                )}
              />
            </div>
          </Section>
        </div>
      </div>
    </main>
  );
}

function Badge({
  children,
  accent = false,
}: {
  children: React.ReactNode;
  accent?: boolean;
}) {
  return (
    <span
      className={
        accent
          ? "inline-flex rounded-full border border-[#C6FF32]/20 bg-[#C6FF32]/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-[#C6FF32]"
          : "inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] text-white/55"
      }
    >
      {children}
    </span>
  );
}

function OverviewMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <SpotlightCard className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5">
      <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
        {label}
      </p>

      <p className="mt-4 text-lg font-black leading-7 text-white/80">
        {value}
      </p>
    </SpotlightCard>
  );
}

function Section({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <SpotlightCard className="rounded-[28px] border border-white/10 bg-white/[0.025] p-6 md:p-8">
      <h2 className="text-2xl font-black tracking-[-0.04em]">
        {title}
      </h2>

      <div className="mt-7">
        {children}
      </div>
    </SpotlightCard>
  );
}

function Detail({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/25">
        {label}
      </p>

      <p className="mt-2 break-words text-sm font-bold leading-7 text-white/65">
        {value || "Not set"}
      </p>
    </div>
  );
}

function LongDetail({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  if (!value) {
    return null;
  }

  return (
    <div className="mt-7 border-t border-white/10 pt-7">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/25">
        {label}
      </p>

      <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-white/60">
        {value}
      </p>
    </div>
  );
}

function LinkDetail({
  label,
  value,
}: {
  label: string;
  value?: string;
}) {
  if (!value) {
    return null;
  }

  return (
    <div className="mt-7 border-t border-white/10 pt-7">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/25">
        {label}
      </p>

      <a
        href={value}
        target="_blank"
        rel="noreferrer"
        className="mt-3 block break-all text-sm leading-7 text-[#C6FF32] hover:underline"
      >
        {value}
      </a>
    </div>
  );
}

function ArraySection({
  label,
  items,
  numbered = false,
}: {
  label: string;
  items?: string[];
  numbered?: boolean;
}) {
  if (!items?.length) {
    return null;
  }

  return (
    <div className="mt-7 border-t border-white/10 pt-7">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/25">
        {label}
      </p>

      <div className="mt-4 space-y-3">
        {items.map((item, index) => (
          <div
            key={`${item}-${index}`}
            className="rounded-2xl border border-white/10 bg-black/20 p-4"
          >
            <p className="whitespace-pre-wrap text-sm leading-7 text-white/60">
              {numbered
                ? `${index + 1}. ${item}`
                : item}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function AssetLinks({
  items,
}: {
  items?: string[];
}) {
  if (!items?.length) {
    return null;
  }

  return (
    <div className="mt-7 border-t border-white/10 pt-7">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/25">
        Asset URLs
      </p>

      <div className="mt-4 space-y-3">
        {items.map((item, index) => (
          <a
            key={`${item}-${index}`}
            href={item}
            target="_blank"
            rel="noreferrer"
            className="block break-all rounded-2xl border border-white/10 bg-black/20 p-4 text-sm leading-7 text-[#C6FF32] transition hover:border-[#C6FF32]/30"
          >
            {item}
          </a>
        ))}
      </div>
    </div>
  );
}

function ExpectationMetrics({
  metrics,
}: {
  metrics?: MediaPost["expectation"]["metrics"];
}) {
  if (!metrics?.length) {
    return null;
  }

  return (
    <div className="mt-7 border-t border-white/10 pt-7">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/25">
        Expected metrics
      </p>

      <div className="mt-4 overflow-hidden rounded-2xl border border-white/10">
        <div className="grid grid-cols-[1.5fr_1fr_1fr] border-b border-white/10 bg-white/[0.03] px-4 py-3">
          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/30">
            Metric
          </p>

          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/30">
            Expected
          </p>

          <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/30">
            Unit
          </p>
        </div>

        {metrics.map((metric, index) => (
          <div
            key={`${metric.metric}-${index}`}
            className="grid grid-cols-[1.5fr_1fr_1fr] border-b border-white/10 px-4 py-4 last:border-b-0"
          >
            <p className="text-sm font-bold text-white/65">
              {metric.metric}
            </p>

            <p className="text-sm text-white/55">
              {metric.expectedValue}
            </p>

            <p className="text-sm text-white/55">
              {metric.unit || "—"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}