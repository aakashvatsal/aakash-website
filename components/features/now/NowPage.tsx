import {
  Activity,
  BatteryCharging,
  BookOpen,
  Brain,
  BriefcaseBusiness,
  Clock3,
  Dumbbell,
  Eye,
  Focus,
  MapPin,
  PenLine,
  Sparkles,
} from "lucide-react";

import {
  BodyText,
} from "@/components/ui/BodyText";

import {
  Container,
} from "@/components/ui/Container";

import {
  DisplayTitle,
} from "@/components/ui/DisplayTitle";

import {
  Eyebrow,
} from "@/components/ui/Eyebrow";

import {
  SpotlightCard,
} from "@/components/ui/SpotlightCard";

import type {
  NowStatus,
} from "@/types/now";

interface NowPageProps {
  now: NowStatus | null;

  history?: NowStatus[];
}

export function NowPage({
  now,
  history = [],
}: NowPageProps) {
  if (!now) {
    return (
      <EmptyNowState />
    );
  }

  const activityType =
    formatLabel(
      now.activityType,
    );

  const availability =
    formatLabel(
      now.availability,
    );

  const mood =
    formatLabel(
      now.mood,
    );

  const startedAt =
    formatDate(
      now.startedAt,
    );

  const updatedAt =
    formatDate(
      now.updatedAt,
    );

  const relativeStartedAt =
    formatRelativeTime(
      now.startedAt,
    );

  const hasBuilding =
    Boolean(
      now.building
        ?.companyName ||
      now.building
        ?.projectName ||
      now.building
        ?.currentWork,
    );

  const hasReading =
    Boolean(
      now.reading?.title ||
      now.reading?.author ||
      now.reading
        ?.currentThought ||
      now.reading
        ?.progressPercentage !==
        undefined,
    );

  const hasHealth =
    Boolean(
      now.health?.activity ||
      now.health?.summary ||
      now.health
        ?.workoutDurationMinutes !==
        undefined ||
      now.health?.steps !==
        undefined ||
      now.health?.sleepHours !==
        undefined ||
      now.health
        ?.recoveryScore !==
        undefined ||
      now.health
        ?.strainScore !==
        undefined ||
      now.health
        ?.heartRateVariabilityMs !==
        undefined ||
      now.health
        ?.restingHeartRateBpm !==
        undefined ||
      now.health
        ?.energyScore !==
        undefined,
    );

  const hasCapacity =
    now.energyScore !==
      undefined ||
    now.focusScore !==
      undefined;

  const recentHistory =
    history
      .filter(
        (item) =>
          item._id !==
          now._id,
      )
      .slice(
        0,
        6,
      );

  return (
    <main className="min-h-screen bg-[#030608] text-white">
      <section className="relative overflow-hidden pb-16 pt-28">
        <div className="pointer-events-none absolute left-1/2 top-[-300px] h-[700px] w-[1100px] -translate-x-1/2 rounded-full bg-[#C6FF32]/[0.045] blur-[170px]" />

        <Container className="relative">
          <div className="flex flex-wrap items-center gap-3">
            <Eyebrow>
              Now
            </Eyebrow>

            <LiveBadge />
          </div>

          <DisplayTitle className="mt-6 max-w-6xl">
            What I&apos;m doing
            right now.
          </DisplayTitle>

          <BodyText className="mt-8 max-w-3xl">
            A live window into
            what I&apos;m building,
            thinking, reading and
            paying attention to.
          </BodyText>

          <div className="mt-10 flex flex-wrap items-center gap-x-4 gap-y-3 text-sm">
            {relativeStartedAt && (
              <div className="flex items-center gap-2 text-white/35">
                <Clock3 className="size-4" />

                <span>
                  Started{" "}
                  {
                    relativeStartedAt
                  }
                </span>
              </div>
            )}

            {now.showLocation &&
              now.locationName && (
                <>
                  <span className="hidden text-white/15 sm:inline">
                    ·
                  </span>

                  <div className="flex items-center gap-2 text-white/35">
                    <MapPin className="size-4" />

                    <span>
                      {
                        now.locationName
                      }
                    </span>
                  </div>
                </>
              )}

            {now.source && (
              <>
                <span className="hidden text-white/15 sm:inline">
                  ·
                </span>

                <span className="text-white/25">
                  via{" "}
                  {formatSource(
                    now.source,
                  )}
                </span>
              </>
            )}
          </div>
        </Container>
      </section>

      <section className="pb-32">
        <Container>
          <CurrentActivityPanel
            now={
              now
            }
            activityType={
              activityType
            }
            availability={
              availability
            }
            mood={
              mood
            }
            startedAt={
              startedAt
            }
          />

          {(hasBuilding ||
            now.thinking ||
            now.writing) && (
            <div className="mt-24">
              <SectionHeader
                eyebrow="In my head"
                title="What has my attention."
                description="The work, ideas and questions occupying the current window."
              />

              <div className="mt-10 grid gap-5 lg:grid-cols-12">
                {hasBuilding && (
                  <BuildingPanel
                    now={
                      now
                    }
                  />
                )}

                <div
                  className={
                    hasBuilding
                      ? "grid gap-5 lg:col-span-5"
                      : "grid gap-5 lg:col-span-12 lg:grid-cols-2"
                  }
                >
                  {now.thinking && (
                    <ThoughtPanel
                      text={
                        now.thinking
                      }
                    />
                  )}

                  {now.writing && (
                    <WritingPanel
                      text={
                        now.writing
                      }
                    />
                  )}
                </div>
              </div>
            </div>
          )}

          {(hasReading ||
            hasHealth ||
            hasCapacity) && (
            <div className="mt-24">
              <SectionHeader
                eyebrow="Current state"
                title="Inputs and capacity."
                description="What I am consuming and what the body and mind have available."
              />

              <div className="mt-10 grid gap-5 lg:grid-cols-12">
                {hasReading && (
                  <ReadingPanel
                    now={
                      now
                    }
                  />
                )}

                {hasHealth && (
                  <HealthPanel
                    now={
                      now
                    }
                  />
                )}

                {hasCapacity && (
                  <CapacityPanel
                    now={
                      now
                    }
                  />
                )}
              </div>
            </div>
          )}

          {now.tags?.length >
            0 && (
            <div className="mt-20 border-t border-white/10 pt-10">
              <div className="flex items-center gap-3">
                <Sparkles className="size-4 text-[#C6FF32]" />

                <p className="text-[10px] font-black uppercase tracking-[0.27em] text-white/30">
                  Current themes
                </p>
              </div>

              <div className="mt-6 flex flex-wrap gap-2">
                {now.tags.map(
                  (tag) => (
                    <span
                      key={
                        tag
                      }
                      className="rounded-full border border-white/10 bg-white/[0.025] px-4 py-2 text-xs font-bold text-white/45"
                    >
                      #
                      {
                        tag
                      }
                    </span>
                  ),
                )}
              </div>
            </div>
          )}

          {recentHistory.length >
            0 && (
            <div className="mt-24">
              <SectionHeader
                eyebrow="Recently"
                title="What came before."
                description="A short history of recent focus and activity."
              />

              <NowTimeline
                history={
                  recentHistory
                }
              />
            </div>
          )}

          <div className="mt-24 flex flex-col gap-4 border-t border-white/10 pt-8 text-sm text-white/30 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Eye className="size-4" />

              <span>
                This page reflects
                my current public
                context.
              </span>
            </div>

            {updatedAt && (
              <div className="flex items-center gap-2">
                <Clock3 className="size-4" />

                <span>
                  Updated{" "}
                  {
                    updatedAt
                  }
                </span>
              </div>
            )}
          </div>
        </Container>
      </section>
    </main>
  );
}

function CurrentActivityPanel({
  now,
  activityType,
  availability,
  mood,
  startedAt,
}: {
  now: NowStatus;

  activityType: string;

  availability: string;

  mood: string;

  startedAt: string | null;
}) {
  return (
    <SpotlightCard className="overflow-hidden rounded-[42px] border border-white/10 bg-white/[0.02]">
      <div className="grid lg:grid-cols-[1fr_320px]">
        <div className="relative px-7 py-10 sm:px-10 lg:px-12 lg:py-14">
          <div className="absolute bottom-0 left-0 top-0 w-px bg-gradient-to-b from-transparent via-[#C6FF32]/50 to-transparent" />

          <div className="flex flex-wrap items-center gap-3">
            {activityType && (
              <span className="rounded-full border border-[#C6FF32]/20 bg-[#C6FF32]/[0.06] px-4 py-2 text-[10px] font-black uppercase tracking-[0.22em] text-[#C6FF32]">
                {
                  activityType
                }
              </span>
            )}

            {startedAt && (
              <span className="text-xs text-white/25">
                {
                  startedAt
                }
              </span>
            )}
          </div>

          <h1 className="mt-8 max-w-4xl text-4xl font-black leading-[1.02] tracking-[-0.055em] sm:text-5xl lg:text-6xl">
            {now.headline ||
              now.activity}
          </h1>

          {now.headline &&
            now.activity !==
              now.headline && (
              <p className="mt-6 max-w-3xl text-xl font-semibold leading-8 text-white/65">
                {
                  now.activity
                }
              </p>
            )}

          {now.description && (
            <p className="mt-7 max-w-3xl text-base leading-8 text-white/40">
              {
                now.description
              }
            </p>
          )}

          {now.currentFocus && (
            <div className="mt-10 max-w-3xl border-l-2 border-[#C6FF32] pl-5">
              <p className="text-[9px] font-black uppercase tracking-[0.24em] text-white/25">
                Current focus
              </p>

              <p className="mt-3 text-lg font-bold leading-7 text-white/80">
                {
                  now.currentFocus
                }
              </p>
            </div>
          )}
        </div>

        <div className="border-t border-white/10 bg-white/[0.012] p-7 lg:border-l lg:border-t-0 lg:p-9">
          <div className="flex size-10 items-center justify-center rounded-xl border border-white/10 bg-white/[0.035] text-white/55">
            <Focus className="size-4" />
          </div>

          <p className="mt-8 text-[9px] font-black uppercase tracking-[0.25em] text-white/25">
            State
          </p>

          <div className="mt-6 space-y-7">
            {availability && (
              <StateValue
                label="Availability"
                value={
                  availability
                }
              />
            )}

            {now.showMood &&
              mood && (
                <StateValue
                  label="Mood"
                  value={
                    mood
                  }
                />
              )}

            {now.showLocation &&
              now.locationName && (
                <StateValue
                  label="Location"
                  value={
                    now.locationName
                  }
                  detail={
                    now.locationType
                      ? formatLabel(
                          now.locationType,
                        )
                      : undefined
                  }
                />
              )}
          </div>
        </div>
      </div>
    </SpotlightCard>
  );
}

function BuildingPanel({
  now,
}: {
  now: NowStatus;
}) {
  const building =
    now.building;

  return (
    <SpotlightCard className="relative overflow-hidden rounded-[34px] p-8 lg:col-span-7 lg:min-h-[440px] lg:p-10">
      <div className="pointer-events-none absolute -right-24 -top-24 size-72 rounded-full bg-[#C6FF32]/[0.045] blur-[90px]" />

      <div className="relative flex h-full flex-col">
        <div className="flex items-center justify-between">
          <IconBox>
            <BriefcaseBusiness className="size-5" />
          </IconBox>

          <p className="text-[9px] font-black uppercase tracking-[0.24em] text-[#C6FF32]">
            Building
          </p>
        </div>

        <div className="mt-auto pt-20">
          {building
            ?.companyName && (
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#C6FF32]">
              {
                building.companyName
              }
            </p>
          )}

          <h2 className="mt-4 max-w-2xl text-4xl font-black tracking-[-0.05em] sm:text-5xl">
            {building
              ?.projectName ||
              building
                ?.companyName ||
              "Current project"}
          </h2>

          {building
            ?.currentWork && (
            <p className="mt-7 max-w-2xl text-base leading-8 text-white/45">
              {
                building.currentWork
              }
            </p>
          )}
        </div>
      </div>
    </SpotlightCard>
  );
}

function ThoughtPanel({
  text,
}: {
  text: string;
}) {
  return (
    <SpotlightCard className="rounded-[30px] p-7 lg:min-h-[210px]">
      <div className="flex items-center gap-3">
        <IconBox>
          <Brain className="size-4" />
        </IconBox>

        <p className="text-[9px] font-black uppercase tracking-[0.24em] text-white/25">
          Thinking
        </p>
      </div>

      <p className="mt-8 text-xl font-black leading-8 tracking-[-0.025em] text-white/85 sm:text-2xl">
        {text}
      </p>
    </SpotlightCard>
  );
}

function WritingPanel({
  text,
}: {
  text: string;
}) {
  return (
    <SpotlightCard className="rounded-[30px] p-7 lg:min-h-[210px]">
      <div className="flex items-center gap-3">
        <IconBox>
          <PenLine className="size-4" />
        </IconBox>

        <p className="text-[9px] font-black uppercase tracking-[0.24em] text-white/25">
          Writing
        </p>
      </div>

      <p className="mt-8 text-xl font-black leading-8 tracking-[-0.025em] text-white/85 sm:text-2xl">
        {text}
      </p>
    </SpotlightCard>
  );
}

function ReadingPanel({
  now,
}: {
  now: NowStatus;
}) {
  const reading =
    now.reading;

  const progress =
    reading
      ?.progressPercentage;

  return (
    <SpotlightCard className="rounded-[32px] p-8 lg:col-span-5">
      <div className="flex items-center justify-between gap-5">
        <IconBox>
          <BookOpen className="size-5" />
        </IconBox>

        <p className="text-[9px] font-black uppercase tracking-[0.24em] text-white/25">
          Reading now
        </p>
      </div>

      <h3 className="mt-10 text-3xl font-black leading-tight tracking-[-0.045em]">
        {reading?.title ||
          "Current reading"}
      </h3>

      {reading?.author && (
        <p className="mt-3 text-sm text-white/35">
          by{" "}
          {
            reading.author
          }
        </p>
      )}

      {typeof progress ===
        "number" && (
        <div className="mt-10">
          <div className="flex items-center justify-between">
            <p className="text-xs text-white/30">
              Progress
            </p>

            <p className="text-sm font-black">
              {progress.toFixed(
                progress %
                  1 ===
                  0
                  ? 0
                  : 1,
              )}
              %
            </p>
          </div>

          <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-[#C6FF32]"
              style={{
                width: `${clamp(
                  progress,
                  0,
                  100,
                )}%`,
              }}
            />
          </div>
        </div>
      )}

      {reading
        ?.currentThought && (
        <div className="mt-9 border-t border-white/10 pt-7">
          <p className="text-[9px] font-black uppercase tracking-[0.21em] text-white/20">
            Current thought
          </p>

          <p className="mt-4 text-sm leading-7 text-white/50">
            {
              reading.currentThought
            }
          </p>
        </div>
      )}
    </SpotlightCard>
  );
}

function HealthPanel({
  now,
}: {
  now: NowStatus;
}) {
  const health =
    now.health;

  const metrics = [
    typeof health
      ?.recoveryScore ===
    "number"
      ? {
          label:
            "Recovery",

          value:
            `${Math.round(
              health.recoveryScore,
            )}%`,

          status:
            getRecoveryStatus(
              health.recoveryScore,
            ),
        }
      : null,

    typeof health
      ?.sleepHours ===
    "number"
      ? {
          label:
            "Sleep",

          value:
            formatHours(
              health.sleepHours,
            ),

          status:
            "neutral" as const,
        }
      : null,

    typeof health
      ?.strainScore ===
    "number"
      ? {
          label:
            "Strain",

          value:
            health.strainScore.toFixed(
              1,
            ),

          status:
            "neutral" as const,
        }
      : null,

    typeof health
      ?.heartRateVariabilityMs ===
    "number"
      ? {
          label:
            "HRV",

          value:
            `${health.heartRateVariabilityMs.toFixed(
              1,
            )} ms`,

          status:
            "neutral" as const,
        }
      : null,

    typeof health
      ?.restingHeartRateBpm ===
    "number"
      ? {
          label:
            "Resting HR",

          value:
            `${Math.round(
              health.restingHeartRateBpm,
            )} bpm`,

          status:
            "neutral" as const,
        }
      : null,

    typeof health
      ?.steps ===
    "number"
      ? {
          label:
            "Steps",

          value:
            health.steps.toLocaleString(
              "en-IN",
            ),

          status:
            "neutral" as const,
        }
      : null,
  ].filter(
    Boolean,
  ) as {
    label: string;

    value: string;

    status:
      | "positive"
      | "negative"
      | "neutral";
  }[];

  return (
    <SpotlightCard className="rounded-[32px] p-8 lg:col-span-7">
      <div className="flex flex-wrap items-center justify-between gap-5">
        <div className="flex items-center gap-3">
          <IconBox>
            <Dumbbell className="size-5" />
          </IconBox>

          <div>
            <p className="text-[9px] font-black uppercase tracking-[0.24em] text-white/25">
              Health
            </p>

            {health
              ?.activity && (
              <p className="mt-1 text-sm font-bold text-white/60">
                {
                  health.activity
                }
              </p>
            )}
          </div>
        </div>

        <span className="rounded-full border border-white/10 px-3 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-white/25">
          Snapshot
        </span>
      </div>

      {metrics.length >
        0 && (
        <div className="mt-10 grid grid-cols-2 gap-x-7 gap-y-8 md:grid-cols-3">
          {metrics.map(
            (metric) => (
              <div
                key={
                  metric.label
                }
                className="border-t border-white/10 pt-4"
              >
                <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/20">
                  {
                    metric.label
                  }
                </p>

                <p
                  className={`mt-2 text-xl font-black tracking-[-0.04em] ${getHealthMetricClass(
                    metric.status,
                  )}`}
                >
                  {
                    metric.value
                  }
                </p>
              </div>
            ),
          )}
        </div>
      )}

      {health?.summary && (
        <p className="mt-9 border-t border-white/10 pt-7 text-sm leading-7 text-white/45">
          {
            health.summary
          }
        </p>
      )}
    </SpotlightCard>
  );
}

function CapacityPanel({
  now,
}: {
  now: NowStatus;
}) {
  return (
    <SpotlightCard className="rounded-[32px] p-8 lg:col-span-12">
      <div className="grid gap-8 lg:grid-cols-[220px_1fr_1fr] lg:items-center">
        <div>
          <div className="flex items-center gap-3">
            <IconBox>
              <BatteryCharging className="size-5" />
            </IconBox>

            <div>
              <p className="text-[9px] font-black uppercase tracking-[0.24em] text-white/25">
                Capacity
              </p>

              <p className="mt-1 text-sm text-white/35">
                Mental bandwidth
              </p>
            </div>
          </div>
        </div>

        <ScoreBar
          label="Energy"
          value={
            now.energyScore
          }
        />

        <ScoreBar
          label="Focus"
          value={
            now.focusScore
          }
        />
      </div>
    </SpotlightCard>
  );
}

function ScoreBar({
  label,
  value,
}: {
  label: string;

  value?:
    | number
    | null;
}) {
  if (
    value ===
      undefined ||
    value ===
      null
  ) {
    return null;
  }

  const score =
    clamp(
      value,
      0,
      10,
    );

  return (
    <div>
      <div className="flex items-end justify-between gap-5">
        <div>
          <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/25">
            {label}
          </p>

          <p className="mt-2 text-3xl font-black tracking-[-0.05em]">
            {score.toFixed(
              score %
                1 ===
                0
                ? 0
                : 1,
            )}
            <span className="ml-1 text-base text-white/25">
              /10
            </span>
          </p>
        </div>
      </div>

      <div className="mt-4 flex gap-1.5">
        {Array.from({
          length: 10,
        }).map(
          (
            _,
            index,
          ) => {
            const active =
              index <
              Math.round(
                score,
              );

            return (
              <span
                key={
                  index
                }
                className={`h-1.5 flex-1 rounded-full ${
                  active
                    ? "bg-[#C6FF32]"
                    : "bg-white/10"
                }`}
              />
            );
          },
        )}
      </div>
    </div>
  );
}

function NowTimeline({
  history,
}: {
  history: NowStatus[];
}) {
  return (
    <div className="mt-10">
      {history.map(
        (
          item,
          index,
        ) => (
          <div
            key={
              item._id
            }
            className="grid grid-cols-[28px_1fr] gap-5 md:grid-cols-[130px_28px_1fr]"
          >
            <div className="hidden pt-1 text-right md:block">
              <p className="text-xs font-bold text-white/30">
                {formatTimelineDate(
                  item.startedAt,
                )}
              </p>

              <p className="mt-1 text-[10px] text-white/15">
                {formatTimelineTime(
                  item.startedAt,
                )}
              </p>
            </div>

            <div className="relative flex justify-center">
              <span
                className={`mt-1.5 size-2 rounded-full ${
                  index ===
                  0
                    ? "bg-[#C6FF32]"
                    : "bg-white/25"
                }`}
              />

              {index !==
                history.length -
                  1 && (
                <span className="absolute bottom-0 top-5 w-px bg-white/10" />
              )}
            </div>

            <div className="pb-10">
              <div className="flex flex-wrap items-center gap-3 md:hidden">
                <p className="text-xs font-bold text-white/30">
                  {formatTimelineDate(
                    item.startedAt,
                  )}
                </p>

                <span className="text-white/15">
                  ·
                </span>

                <p className="text-xs text-white/20">
                  {formatTimelineTime(
                    item.startedAt,
                  )}
                </p>
              </div>

              <p className="mt-2 text-[9px] font-black uppercase tracking-[0.2em] text-white/25 md:mt-0">
                {formatLabel(
                  item.activityType,
                )}
              </p>

              <p className="mt-2 text-lg font-black tracking-[-0.025em] text-white/70">
                {item.headline ||
                  item.activity}
              </p>

              {item.currentFocus && (
                <p className="mt-2 text-sm text-white/35">
                  {
                    item.currentFocus
                  }
                </p>
              )}
            </div>
          </div>
        ),
      )}
    </div>
  );
}

function SectionHeader({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string;

  title: string;

  description?: string;
}) {
  return (
    <div className="max-w-3xl">
      <p className="text-[10px] font-black uppercase tracking-[0.27em] text-[#C6FF32]">
        {eyebrow}
      </p>

      <h2 className="mt-4 text-3xl font-black tracking-[-0.045em] sm:text-4xl">
        {title}
      </h2>

      {description && (
        <p className="mt-4 max-w-2xl text-sm leading-7 text-white/35">
          {
            description
          }
        </p>
      )}
    </div>
  );
}

function StateValue({
  label,
  value,
  detail,
}: {
  label: string;

  value: string;

  detail?: string;
}) {
  return (
    <div>
      <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">
        {label}
      </p>

      <p className="mt-2 text-xl font-black tracking-[-0.03em] text-white/80">
        {value}
      </p>

      {detail && (
        <p className="mt-1 text-xs text-white/25">
          {detail}
        </p>
      )}
    </div>
  );
}

function IconBox({
  children,
}: {
  children:
    React.ReactNode;
}) {
  return (
    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.035] text-white/55">
      {children}
    </div>
  );
}

function LiveBadge() {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-[#C6FF32]/20 bg-[#C6FF32]/[0.05] px-3 py-1.5 text-[9px] font-black uppercase tracking-[0.22em] text-[#C6FF32]">
      <span className="relative flex size-2">
        <span className="absolute inline-flex size-full animate-ping rounded-full bg-[#C6FF32] opacity-40" />

        <span className="relative inline-flex size-2 rounded-full bg-[#C6FF32]" />
      </span>

      Live
    </span>
  );
}

function EmptyNowState() {
  return (
    <main className="min-h-screen bg-[#030608] text-white">
      <section className="relative overflow-hidden py-28">
        <div className="pointer-events-none absolute left-1/2 top-[-200px] size-[600px] -translate-x-1/2 rounded-full bg-[#C6FF32]/[0.04] blur-[140px]" />

        <Container className="relative">
          <Eyebrow>
            Now
          </Eyebrow>

          <DisplayTitle className="mt-6 max-w-5xl">
            Offline for the
            moment.
          </DisplayTitle>

          <BodyText className="mt-8 max-w-2xl">
            This page updates as
            my current work,
            thoughts and attention
            change.
          </BodyText>

          <div className="mt-10 flex items-center gap-3 text-sm text-white/30">
            <span className="size-2 rounded-full bg-white/20" />

            No public status
            currently active
          </div>
        </Container>
      </section>
    </main>
  );
}

function getRecoveryStatus(
  score: number,
):
  | "positive"
  | "negative"
  | "neutral" {
  if (
    score >=
    67
  ) {
    return "positive";
  }

  if (
    score <=
    33
  ) {
    return "negative";
  }

  return "neutral";
}

function getHealthMetricClass(
  status:
    | "positive"
    | "negative"
    | "neutral",
) {
  if (
    status ===
    "positive"
  ) {
    return "text-[#C6FF32]";
  }

  if (
    status ===
    "negative"
  ) {
    return "text-red-500";
  }

  return "text-white/80";
}

function formatLabel(
  value?:
    | string
    | null,
) {
  if (!value) {
    return "";
  }

  return value
    .replaceAll(
      "_",
      " ",
    )
    .replace(
      /\b\w/g,
      (
        character,
      ) =>
        character.toUpperCase(),
    );
}

function formatSource(
  value: string,
) {
  if (
    value ===
    "hsakaa"
  ) {
    return "HSAKAA";
  }

  if (
    value ===
    "whoop"
  ) {
    return "WHOOP";
  }

  if (
    value ===
    "apple_health"
  ) {
    return "Apple Health";
  }

  return formatLabel(
    value,
  );
}

function formatDate(
  value?:
    | string
    | Date
    | null,
) {
  if (!value) {
    return null;
  }

  const date =
    new Date(
      value,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return null;
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day:
        "numeric",

      month:
        "short",

      hour:
        "numeric",

      minute:
        "2-digit",

      hour12:
        true,

      timeZone:
        "Asia/Kolkata",
    },
  ).format(
    date,
  );
}

function formatRelativeTime(
  value?:
    | string
    | Date
    | null,
) {
  if (!value) {
    return null;
  }

  const date =
    new Date(
      value,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return null;
  }

  const difference =
    Date.now() -
    date.getTime();

  if (
    difference <
    0
  ) {
    return "just now";
  }

  const minutes =
    Math.floor(
      difference /
        60000,
    );

  if (
    minutes <
    1
  ) {
    return "just now";
  }

  if (
    minutes <
    60
  ) {
    return `${minutes}m ago`;
  }

  const hours =
    Math.floor(
      minutes /
        60,
    );

  if (
    hours <
    24
  ) {
    return `${hours}h ago`;
  }

  const days =
    Math.floor(
      hours /
        24,
    );

  return `${days}d ago`;
}

function formatTimelineDate(
  value: string,
) {
  const date =
    new Date(
      value,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day:
        "numeric",

      month:
        "short",

      timeZone:
        "Asia/Kolkata",
    },
  ).format(
    date,
  );
}

function formatTimelineTime(
  value: string,
) {
  const date =
    new Date(
      value,
    );

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      hour:
        "numeric",

      minute:
        "2-digit",

      hour12:
        true,

      timeZone:
        "Asia/Kolkata",
    },
  ).format(
    date,
  );
}

function formatHours(
  hours: number,
) {
  const totalMinutes =
    Math.round(
      hours *
        60,
    );

  const wholeHours =
    Math.floor(
      totalMinutes /
        60,
    );

  const minutes =
    totalMinutes %
    60;

  if (
    wholeHours ===
    0
  ) {
    return `${minutes}m`;
  }

  if (
    minutes ===
    0
  ) {
    return `${wholeHours}h`;
  }

  return `${wholeHours}h ${minutes}m`;
}

function clamp(
  value: number,
  minimum: number,
  maximum: number,
) {
  return Math.min(
    Math.max(
      value,
      minimum,
    ),
    maximum,
  );
}