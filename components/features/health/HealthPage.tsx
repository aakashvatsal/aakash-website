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
  HealthDashboard,
  HealthEntry,
  HealthTrendsResponse,
} from "@/types/health";

import {
  HabitStatus,
} from "./HabitStatus";

import {
  HealthEmptyState,
} from "./HealthEmptyState";

import {
  HealthSection,
} from "./HealthSection";

import {
  PainCard,
} from "./PainCard";

import {
  WorkoutCard,
} from "./WorkoutCard";

interface HealthPageProps {
  entry: HealthEntry | null;

  dashboard: HealthDashboard;

  trends: HealthTrendsResponse;
}

interface Metric {
  label: string;

  value: string;

  detail?: string;
}

type TrendDirection =
  | "higher"
  | "lower"
  | "neutral";

type TrendStatus =
  | "positive"
  | "negative"
  | "neutral";

export function HealthPage({
  entry,
  dashboard,
  trends,
}: HealthPageProps) {
  if (!entry) {
    return (
      <HealthEmptyState />
    );
  }

  const sources =
    dashboard.today
      ?.sources ??
    [];

  const bodyMetrics =
    getBodyMetrics(
      entry,
    );

  const recoveryMetrics =
    getRecoveryMetrics(
      entry,
    );

  const nutritionMetrics =
    getNutritionMetrics(
      entry,
    );

  const activePainEntries =
    (
      entry.painEntries ??
      []
    ).filter(
      (pain) =>
        pain.resolved !==
        true,
    );

  /**
   * WHOOP can occasionally result in the same
   * workout appearing more than once in the
   * health entry.
   *
   * externalId is the canonical WHOOP workout id,
   * so use it to deduplicate before rendering.
   *
   * For manually-created workouts without an
   * externalId, keep each item using its index.
   */
  const uniqueWorkouts =
    Array.from(
      new Map(
        (
          entry.workouts ??
          []
        ).map(
          (
            workout,
            index,
          ) => [
            workout.externalId ??
              `local-${workout.type}-${index}`,

            workout,
          ],
        ),
      ).values(),
    );

  const hasBodyMeasurements =
    Boolean(
      entry.bodyMeasurement,
    );

  const hasSleep =
    Boolean(
      entry.sleep,
    );

  const hasRecovery =
    Boolean(
      entry.recovery,
    );

  const hasNutrition =
    Boolean(
      entry.nutrition,
    );

  const hasWorkouts =
    uniqueWorkouts.length >
    0;

  const hasHabits =
    (
      entry.habits ??
      []
    ).length >
    0;

  const hasLifestyleData =
    (
      entry.goals ??
      []
    ).length >
      0 ||
    (
      entry.achievements ??
      []
    ).length >
      0 ||
    (
      entry.symptoms ??
      []
    ).length >
      0 ||
    Boolean(
      entry.notes,
    );

  const currentSignals =
    getCurrentSignals(
      dashboard,
    );

  return (
    <main className="min-h-screen bg-[#030608] text-white">
      <section className="pb-16 pt-28">
        <Container>
          <Eyebrow>
            Health
          </Eyebrow>

          <DisplayTitle className="mt-6 max-w-6xl">
            Health is a system,
            not a snapshot.
          </DisplayTitle>

          <BodyText className="mt-8 max-w-3xl">
            Sleep, recovery,
            training and
            consistency tracked
            over time — not to
            chase individual
            numbers, but to
            understand the patterns
            behind energy and
            performance.
          </BodyText>

          <div className="mt-10 flex flex-wrap items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-[#C6FF32]" />

            <p className="text-sm text-white/35">
              Latest health update
            </p>

            <p className="text-sm font-bold text-white/70">
              {formatDateKey(
                dashboard.today
                  .dateKey,
              )}
            </p>

            {sources.length >
              0 && (
              <>
                <span className="text-white/15">
                  ·
                </span>

                <div className="flex flex-wrap gap-2">
                  {sources.map(
                    (
                      source,
                    ) => (
                      <span
                        key={
                          source
                        }
                        className="rounded-full border border-white/10 bg-white/[0.02] px-3 py-1 text-[9px] font-black uppercase tracking-[0.2em] text-white/35"
                      >
                        {formatSource(
                          source,
                        )}
                      </span>
                    ),
                  )}
                </div>
              </>
            )}
          </div>
        </Container>
      </section>

      <section className="pb-32">
        <Container>
          <TodayCommandCenter
            dashboard={
              dashboard
            }
          />

          {currentSignals.length >
            0 && (
            <div className="mt-8">
              <CurrentSignal
                signals={
                  currentSignals
                }
              />
            </div>
          )}

          <div className="mt-28">
            <HealthSection
              eyebrow="Baseline"
              title="Seven days versus thirty."
              description="Short-term physiological changes compared with the longer baseline."
            >
              <BaselineTable
                dashboard={
                  dashboard
                }
              />
            </HealthSection>
          </div>

          <div className="mt-28">
            <HealthSection
              eyebrow="30-day trends"
              title="The direction matters."
              description="Daily variation becomes useful when it is seen as a pattern rather than a single score."
            >
              <div className="grid gap-5 xl:grid-cols-2">
                <LargeTrendCard
                  label="Recovery"
                  description="Daily readiness"
                  unit="%"
                  average={
                    trends.averages
                      .recovery
                  }
                  values={
                    trends.data.map(
                      (
                        point,
                      ) => ({
                        dateKey:
                          point.dateKey,

                        value:
                          point.recoveryScore,
                      }),
                    )
                  }
                />

                <LargeTrendCard
                  label="Sleep"
                  description="Hours asleep"
                  unit="h"
                  average={
                    trends.averages
                      .sleepHours
                  }
                  values={
                    trends.data.map(
                      (
                        point,
                      ) => ({
                        dateKey:
                          point.dateKey,

                        value:
                          point.sleepHours,
                      }),
                    )
                  }
                />
              </div>

              <div className="mt-5 grid gap-5 lg:grid-cols-3">
                <SmallTrendCard
                  label="HRV"
                  unit="ms"
                  average={
                    trends.averages
                      .hrvMs
                  }
                  values={
                    trends.data.map(
                      (
                        point,
                      ) => ({
                        dateKey:
                          point.dateKey,

                        value:
                          point.hrvMs,
                      }),
                    )
                  }
                />

                <SmallTrendCard
                  label="Resting HR"
                  unit="bpm"
                  average={
                    trends.averages
                      .restingHeartRateBpm
                  }
                  values={
                    trends.data.map(
                      (
                        point,
                      ) => ({
                        dateKey:
                          point.dateKey,

                        value:
                          point.restingHeartRateBpm,
                      }),
                    )
                  }
                />

                <SmallTrendCard
                  label="Strain"
                  average={
                    trends.averages
                      .strain
                  }
                  values={
                    trends.data.map(
                      (
                        point,
                      ) => ({
                        dateKey:
                          point.dateKey,

                        value:
                          point.strainScore,
                      }),
                    )
                  }
                />
              </div>
            </HealthSection>
          </div>

          {hasSleep && (
            <div className="mt-28">
              <HealthSection
                eyebrow="Sleep"
                title="Recovery starts at night."
                description="How the latest sleep was structured, and how it compared with physiological need."
              >
                <SleepArchitecture
                  entry={
                    entry
                  }
                />
              </HealthSection>
            </div>
          )}

          {hasRecovery && (
            <div className="mt-28">
              <HealthSection
                eyebrow="Recovery"
                title="The physiology behind readiness."
                description="The cardiovascular and respiratory signals contributing to the current recovery state."
              >
                <MetricGrid
                  metrics={
                    recoveryMetrics
                  }
                />
              </HealthSection>
            </div>
          )}

          <div className="mt-28">
            <HealthSection
              eyebrow="Training"
              title="Load over time."
              description="Training frequency and accumulated strain across the recent workload window."
            >
              <TrainingSummary
                dashboard={
                  dashboard
                }
              />

              {hasWorkouts && (
                <div className="mt-12">
                  <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/25">
                    Latest sessions
                  </p>

                  <div className="mt-5 grid gap-5 xl:grid-cols-2">
                    {uniqueWorkouts.map(
                      (
                        workout,
                        index,
                      ) => (
                        <WorkoutCard
                          key={
                            workout.externalId ??
                            `local-${workout.type}-${index}`
                          }
                          workout={
                            workout
                          }
                        />
                      ),
                    )}
                  </div>
                </div>
              )}
            </HealthSection>
          </div>

          {hasBodyMeasurements && (
            <div className="mt-28">
              <HealthSection
                eyebrow="Body"
                title="Current measurements."
                description="Latest physical measurements recorded in the health system."
              >
                <MetricGrid
                  metrics={
                    bodyMetrics
                  }
                />
              </HealthSection>
            </div>
          )}

          {hasNutrition && (
            <div className="mt-28">
              <HealthSection
                eyebrow="Nutrition"
                title="Fuel and consistency."
                description="Nutrition, hydration and lifestyle behaviour from the latest entry."
              >
                <MetricGrid
                  metrics={
                    nutritionMetrics
                  }
                />

                <div className="mt-10 grid gap-5 md:grid-cols-3">
                  <BooleanStatusCard
                    label="Meal plan"
                    value={
                      entry
                        .nutrition
                        ?.followedMealPlan ===
                      true
                    }
                    positiveText="Followed"
                    negativeText="Not followed"
                  />

                  <BooleanStatusCard
                    label="Smoking"
                    value={
                      entry
                        .nutrition
                        ?.smoked !==
                      true
                    }
                    positiveText="No smoking"
                    negativeText="Smoked"
                  />

                  <BooleanStatusCard
                    label="Alcohol"
                    value={
                      entry
                        .nutrition
                        ?.hadAlcohol !==
                      true
                    }
                    positiveText="No alcohol"
                    negativeText="Consumed"
                  />
                </div>

                {(
                  entry.nutrition
                    ?.supplements ??
                  []
                ).length >
                  0 && (
                  <ListBlock
                    title="Supplements"
                    items={
                      entry
                        .nutrition
                        ?.supplements ??
                      []
                    }
                  />
                )}

                {(
                  entry.nutrition
                    ?.meals ??
                  []
                ).length >
                  0 && (
                  <ListBlock
                    title="Meals"
                    items={
                      entry
                        .nutrition
                        ?.meals ??
                      []
                    }
                  />
                )}

                {entry.nutrition
                  ?.notes && (
                  <p className="mt-10 border-l-2 border-[#C6FF32] pl-6 text-base leading-8 text-white/50">
                    {
                      entry
                        .nutrition
                        .notes
                    }
                  </p>
                )}
              </HealthSection>
            </div>
          )}

          {hasHabits && (
            <div className="mt-28">
              <HealthSection
                eyebrow="Habits"
                title="Daily consistency."
                description="Small repeated behaviours recorded in the latest health entry."
              >
                <div className="grid gap-x-12 md:grid-cols-2">
                  {entry.habits.map(
                    (
                      habit,
                    ) => (
                      <HabitStatus
                        key={
                          habit.key
                        }
                        label={
                          habit.label
                        }
                        completed={
                          habit.completed
                        }
                      />
                    ),
                  )}
                </div>
              </HealthSection>
            </div>
          )}

          {activePainEntries.length >
            0 && (
            <div className="mt-28">
              <HealthSection
                eyebrow="Pain and recovery"
                title="Currently managing."
                description="Active pain areas and the current recovery approach."
              >
                <div className="grid gap-5 md:grid-cols-2">
                  {activePainEntries.map(
                    (
                      pain,
                      index,
                    ) => (
                      <PainCard
                        key={`${pain.bodyPart}-${index}`}
                        pain={
                          pain
                        }
                      />
                    ),
                  )}
                </div>
              </HealthSection>
            </div>
          )}

          {hasLifestyleData && (
            <div className="mt-28">
              <HealthSection
                eyebrow="Current focus"
                title="What I am working on."
                description="Goals, achievements, symptoms and notes from the latest health snapshot."
              >
                <div className="grid gap-5 md:grid-cols-3">
                  {entry.goals.length >
                    0 && (
                    <HealthListCard
                      label="Goals"
                      items={
                        entry.goals
                      }
                    />
                  )}

                  {entry.achievements.length >
                    0 && (
                    <HealthListCard
                      label="Achievements"
                      items={
                        entry.achievements
                      }
                    />
                  )}

                  {entry.symptoms.length >
                    0 && (
                    <HealthListCard
                      label="Symptoms"
                      items={
                        entry.symptoms
                      }
                    />
                  )}
                </div>

                {entry.notes && (
                  <div className="mt-10 border-t border-white/10 pt-10">
                    <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#C6FF32]">
                      Notes
                    </p>

                    <p className="mt-5 max-w-4xl whitespace-pre-line text-lg leading-9 text-white/55">
                      {
                        entry.notes
                      }
                    </p>
                  </div>
                )}
              </HealthSection>
            </div>
          )}
        </Container>
      </section>
    </main>
  );
}

function TodayCommandCenter({
  dashboard,
}: {
  dashboard: HealthDashboard;
}) {
  return (
    <SpotlightCard className="overflow-hidden rounded-[40px] border border-white/10 bg-white/[0.025]">
      <div className="border-b border-white/10 px-7 py-6 md:px-10">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.28em] text-[#C6FF32]">
              Today
            </p>

            <p className="mt-2 text-sm text-white/35">
              {formatDateKey(
                dashboard.today
                  .dateKey,
              )}
            </p>
          </div>

          <p className="text-xs font-bold uppercase tracking-[0.2em] text-white/20">
            Current state
          </p>
        </div>
      </div>

      <div className="grid sm:grid-cols-2 xl:grid-cols-4">
        <TodayMetric
          label="Recovery"
          value={
            formatPercentage(
              dashboard.today
                .recoveryScore,
            )
          }
          change={
            dashboard.trends
              .recoveryChange
          }
          direction="higher"
        />

        <TodayMetric
          label="Sleep"
          value={
            formatPercentage(
              dashboard.today
                .sleepPerformance,
            )
          }
          secondary={
            dashboard.today
              .sleepHours !==
            null
              ? `${dashboard.today.sleepHours.toFixed(
                  1,
                )}h asleep`
              : undefined
          }
          change={
            dashboard.trends
              .sleepChange
          }
          direction="higher"
        />

        <TodayMetric
          label="Strain"
          value={
            formatNumber(
              dashboard.today
                .strainScore,
              1,
            )
          }
          change={
            dashboard.trends
              .strainChange
          }
          direction="neutral"
        />

        <TodayMetric
          label="HRV"
          value={
            dashboard.today
              .hrvMs !==
            null
              ? `${dashboard.today.hrvMs.toFixed(
                  1,
                )} ms`
              : "—"
          }
          change={
            dashboard.trends
              .hrvChange
          }
          direction="higher"
          last
        />
      </div>
    </SpotlightCard>
  );
}

function TodayMetric({
  label,
  value,
  secondary,
  change,
  direction,
  last = false,
}: {
  label: string;

  value: string;

  secondary?: string;

  change:
    | number
    | null;

  direction:
    TrendDirection;

  last?: boolean;
}) {
  const status =
    getTrendStatus(
      change,
      direction,
    );

  return (
    <div
      className={`px-7 py-8 md:px-10 md:py-10 ${
        !last
          ? "border-b border-white/10 sm:border-r xl:border-b-0"
          : ""
      }`}
    >
      <p className="text-[10px] font-black uppercase tracking-[0.23em] text-white/25">
        {label}
      </p>

      <p className="mt-5 text-5xl font-black tracking-[-0.07em] md:text-6xl">
        {value}
      </p>

      {secondary && (
        <p className="mt-3 text-sm text-white/35">
          {secondary}
        </p>
      )}

      {change !==
        null && (
        <div
          className={`mt-5 inline-flex items-center gap-2 text-xs font-black ${getTrendClass(
            status,
          )}`}
        >
          <span>
            {getTrendArrow(
              change,
            )}
          </span>

          <span>
            {Math.abs(
              change,
            ).toFixed(
              1,
            )}
            % vs 30d
          </span>
        </div>
      )}
    </div>
  );
}

function CurrentSignal({
  signals,
}: {
  signals: {
    text: string;

    status:
      TrendStatus;
  }[];
}) {
  return (
    <div className="rounded-[28px] border border-white/10 bg-white/[0.018] px-7 py-7 md:px-9">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start">
        <div className="shrink-0 lg:w-48">
          <p className="text-[10px] font-black uppercase tracking-[0.26em] text-[#C6FF32]">
            Current signal
          </p>
        </div>

        <div className="space-y-3">
          {signals.map(
            (
              signal,
              index,
            ) => (
              <p
                key={`${signal.text}-${index}`}
                className={`text-sm font-semibold leading-7 md:text-base ${getTrendClass(
                  signal.status,
                )}`}
              >
                {signal.text}
              </p>
            ),
          )}
        </div>
      </div>
    </div>
  );
}

function BaselineTable({
  dashboard,
}: {
  dashboard:
    HealthDashboard;
}) {
  const rows = [
    {
      label:
        "Recovery",

      current:
        dashboard.trends
          .recovery7DayAverage,

      baseline:
        dashboard.trends
          .recovery30DayAverage,

      change:
        dashboard.trends
          .recoveryChange,

      unit:
        "%",

      direction:
        "higher" as const,
    },

    {
      label:
        "HRV",

      current:
        dashboard.trends
          .hrv7DayAverage,

      baseline:
        dashboard.trends
          .hrv30DayAverage,

      change:
        dashboard.trends
          .hrvChange,

      unit:
        "ms",

      direction:
        "higher" as const,
    },

    {
      label:
        "Resting HR",

      current:
        dashboard.trends
          .restingHeartRate7DayAverage,

      baseline:
        dashboard.trends
          .restingHeartRate30DayAverage,

      change:
        dashboard.trends
          .restingHeartRateChange,

      unit:
        "bpm",

      direction:
        "lower" as const,
    },

    {
      label:
        "Sleep",

      current:
        dashboard.trends
          .sleep7DayAverageHours,

      baseline:
        dashboard.trends
          .sleep30DayAverageHours,

      change:
        dashboard.trends
          .sleepChange,

      unit:
        "h",

      direction:
        "higher" as const,
    },

    {
      label:
        "Strain",

      current:
        dashboard.trends
          .strain7DayAverage,

      baseline:
        dashboard.trends
          .strain30DayAverage,

      change:
        dashboard.trends
          .strainChange,

      unit:
        "",

      direction:
        "neutral" as const,
    },
  ];

  return (
    <div className="overflow-hidden rounded-[28px] border border-white/10">
      <div className="hidden grid-cols-[1.3fr_1fr_1fr_0.8fr] border-b border-white/10 px-7 py-4 md:grid">
        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">
          Metric
        </p>

        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">
          7 day
        </p>

        <p className="text-[9px] font-black uppercase tracking-[0.2em] text-white/20">
          30 day
        </p>

        <p className="text-right text-[9px] font-black uppercase tracking-[0.2em] text-white/20">
          Change
        </p>
      </div>

      {rows.map(
        (
          row,
          index,
        ) => {
          const status =
            getTrendStatus(
              row.change,
              row.direction,
            );

          return (
            <div
              key={
                row.label
              }
              className={`grid gap-5 px-7 py-6 md:grid-cols-[1.3fr_1fr_1fr_0.8fr] md:items-center ${
                index !==
                rows.length -
                  1
                  ? "border-b border-white/10"
                  : ""
              }`}
            >
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-white/70">
                  {row.label}
                </p>
              </div>

              <div>
                <p className="text-[9px] uppercase tracking-[0.15em] text-white/20 md:hidden">
                  7 day
                </p>

                <p className="mt-1 text-xl font-black tracking-[-0.04em] md:mt-0">
                  {formatMetricValue(
                    row.current,
                    row.unit,
                  )}
                </p>
              </div>

              <div>
                <p className="text-[9px] uppercase tracking-[0.15em] text-white/20 md:hidden">
                  30 day
                </p>

                <p className="mt-1 text-xl font-black tracking-[-0.04em] text-white/40 md:mt-0">
                  {formatMetricValue(
                    row.baseline,
                    row.unit,
                  )}
                </p>
              </div>

              <div className="md:text-right">
                {row.change !==
                null ? (
                  <p
                    className={`text-sm font-black ${getTrendClass(
                      status,
                    )}`}
                  >
                    {row.change >
                    0
                      ? "+"
                      : ""}
                    {row.change.toFixed(
                      1,
                    )}
                    %
                  </p>
                ) : (
                  <p className="text-white/25">
                    —
                  </p>
                )}
              </div>
            </div>
          );
        },
      )}
    </div>
  );
}

function LargeTrendCard({
  label,
  description,
  unit,
  average,
  values,
}: {
  label: string;

  description: string;

  unit?: string;

  average:
    | number
    | null;

  values: {
    dateKey: string;

    value:
      | number
      | null;
  }[];
}) {
  const chart =
    createChartPoints(
      values,
    );

  const valid =
    values.filter(
      (
        item,
      ) =>
        item.value !==
        null,
    );

  const latest =
    valid.length >
    0
      ? valid[
          valid.length -
            1
        ]
      : null;

  return (
    <SpotlightCard className="overflow-hidden rounded-[32px] p-7 md:p-9">
      <div className="flex items-start justify-between gap-8">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#C6FF32]">
            {label}
          </p>

          <p className="mt-3 text-sm text-white/30">
            {description}
          </p>
        </div>

        <div className="text-right">
          <p className="text-3xl font-black tracking-[-0.05em]">
            {formatMetricValue(
              average,
              unit,
            )}
          </p>

          <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-white/25">
            30d average
          </p>
        </div>
      </div>

      <div className="mt-12 h-56 md:h-64">
        {chart ? (
          <TrendSvg
            points={
              chart
            }
          />
        ) : (
          <EmptyChart />
        )}
      </div>

      <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
        <p className="text-xs text-white/25">
          {valid[0]
            ? formatShortDate(
                valid[0]
                  .dateKey,
              )
            : "—"}
        </p>

        <p className="text-xs font-bold text-white/45">
          Latest{" "}
          {latest
            ?.value !==
          null &&
          latest
            ?.value !==
            undefined
            ? formatMetricValue(
                latest.value,
                unit,
              )
            : "—"}
        </p>

        <p className="text-xs text-white/25">
          {latest
            ? formatShortDate(
                latest.dateKey,
              )
            : "—"}
        </p>
      </div>
    </SpotlightCard>
  );
}

function SmallTrendCard({
  label,
  unit,
  average,
  values,
}: {
  label: string;

  unit?: string;

  average:
    | number
    | null;

  values: {
    dateKey: string;

    value:
      | number
      | null;
  }[];
}) {
  const chart =
    createChartPoints(
      values,
    );

  return (
    <SpotlightCard className="rounded-[28px] p-7">
      <div className="flex items-end justify-between gap-5">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.23em] text-white/30">
            {label}
          </p>

          <p className="mt-3 text-3xl font-black tracking-[-0.05em]">
            {formatMetricValue(
              average,
              unit,
            )}
          </p>
        </div>

        <p className="text-[9px] font-black uppercase tracking-[0.17em] text-white/20">
          30d avg
        </p>
      </div>

      <div className="mt-8 h-28">
        {chart ? (
          <TrendSvg
            points={
              chart
            }
          />
        ) : (
          <EmptyChart />
        )}
      </div>
    </SpotlightCard>
  );
}

function TrendSvg({
  points,
}: {
  points: string;
}) {
  return (
    <svg
      viewBox="0 0 100 40"
      preserveAspectRatio="none"
      className="h-full w-full overflow-visible"
      aria-hidden="true"
    >
      <line
        x1="0"
        y1="39"
        x2="100"
        y2="39"
        stroke="rgba(255,255,255,0.08)"
        strokeWidth="0.4"
      />

      <line
        x1="0"
        y1="20"
        x2="100"
        y2="20"
        stroke="rgba(255,255,255,0.045)"
        strokeWidth="0.3"
      />

      <polyline
        fill="none"
        stroke="#C6FF32"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        vectorEffect="non-scaling-stroke"
        points={
          points
        }
      />
    </svg>
  );
}

function EmptyChart() {
  return (
    <div className="flex h-full items-center justify-center border-t border-white/10 text-sm text-white/20">
      No trend data
    </div>
  );
}

function SleepArchitecture({
  entry,
}: {
  entry: HealthEntry;
}) {
  const sleep =
    entry.sleep;

  if (!sleep) {
    return null;
  }

  const stages = [
    {
      label:
        "Light",

      value:
        sleep.lightSleepMinutes ??
        0,

      className:
        "bg-white/30",
    },

    {
      label:
        "Deep",

      value:
        sleep.deepSleepMinutes ??
        0,

      className:
        "bg-[#C6FF32]",
    },

    {
      label:
        "REM",

      value:
        sleep.remSleepMinutes ??
        0,

      className:
        "bg-white/70",
    },

    {
      label:
        "Awake",

      value:
        sleep.awakeMinutes ??
        0,

      className:
        "bg-red-500",
    },
  ];

  const total =
    stages.reduce(
      (
        sum,
        stage,
      ) =>
        sum +
        stage.value,
      0,
    );

  return (
    <>
      <SpotlightCard className="rounded-[32px] p-7 md:p-9">
        <div className="flex flex-col gap-7 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.24em] text-white/25">
              Total sleep
            </p>

            <p className="mt-3 text-5xl font-black tracking-[-0.06em]">
              {formatHours(
                sleep.durationHours,
              )}
            </p>
          </div>

          <div className="grid grid-cols-3 gap-8">
            <CompactMetric
              label="Performance"
              value={
                formatPercentageValue(
                  sleep.sleepPerformancePercentage,
                )
              }
            />

            <CompactMetric
              label="Efficiency"
              value={
                formatPercentageValue(
                  sleep.sleepEfficiencyPercentage,
                )
              }
            />

            <CompactMetric
              label="Consistency"
              value={
                formatPercentageValue(
                  sleep.sleepConsistencyPercentage,
                )
              }
            />
          </div>
        </div>

        <div className="mt-10">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-white/25">
            Sleep architecture
          </p>

          <div className="mt-5 flex h-4 overflow-hidden rounded-full bg-white/5">
            {stages.map(
              (
                stage,
              ) => {
                const percentage =
                  total >
                  0
                    ? (stage.value /
                        total) *
                      100
                    : 0;

                return (
                  <div
                    key={
                      stage.label
                    }
                    className={
                      stage.className
                    }
                    style={{
                      width:
                        `${percentage}%`,
                    }}
                  />
                );
              },
            )}
          </div>

          <div className="mt-7 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">
            {stages.map(
              (
                stage,
              ) => (
                <div
                  key={
                    stage.label
                  }
                >
                  <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/25">
                    {
                      stage.label
                    }
                  </p>

                  <p className="mt-2 text-xl font-black">
                    {formatMinutes(
                      stage.value,
                    )}
                  </p>
                </div>
              ),
            )}
          </div>
        </div>
      </SpotlightCard>

      <div className="mt-5 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Sleep need"
          value={
            formatMinutesAsHours(
              sleep.sleepNeedMinutes,
            )
          }
          detail="Calculated requirement"
        />

        <SummaryCard
          label="Sleep debt"
          value={
            formatMinutesAsHours(
              sleep.sleepDebtMinutes,
            )
          }
          detail="Accumulated deficit"
        />

        <SummaryCard
          label="Time in bed"
          value={
            formatHours(
              sleep.timeInBedHours,
            )
          }
          detail="Total sleep opportunity"
        />

        <SummaryCard
          label="Disturbances"
          value={
            typeof sleep.disturbances ===
            "number"
              ? sleep.disturbances.toString()
              : "—"
          }
          detail="Recorded overnight"
        />
      </div>

      {sleep.napTaken && (
        <div className="mt-6 border-l-2 border-[#C6FF32] pl-5">
          <p className="text-sm font-bold text-white/55">
            Nap recorded
            {typeof sleep.napMinutes ===
            "number"
              ? ` · ${formatMinutes(
                  sleep.napMinutes,
                )}`
              : ""}
          </p>
        </div>
      )}
    </>
  );
}

function TrainingSummary({
  dashboard,
}: {
  dashboard:
    HealthDashboard;
}) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
      <SummaryCard
        label="7-day workouts"
        value={
          dashboard.workouts
            .last7Days.toString()
        }
        detail="Recent sessions"
      />

      <SummaryCard
        label="30-day workouts"
        value={
          dashboard.workouts
            .last30Days.toString()
        }
        detail="Monthly training volume"
      />

      <SummaryCard
        label="7-day strain"
        value={
          formatNumber(
            dashboard.workouts
              .strainLast7Days,
            1,
          )
        }
        detail="Average per workout"
      />

      <SummaryCard
        label="Consistency"
        value={`${dashboard.consistency.trackedDays30}/30`}
        detail="Tracked health days"
      />
    </div>
  );
}

function MetricGrid({
  metrics,
}: {
  metrics: Metric[];
}) {
  return (
    <div className="grid gap-x-8 gap-y-10 sm:grid-cols-2 xl:grid-cols-4">
      {metrics.map(
        (
          item,
        ) => (
          <div
            key={
              item.label
            }
            className="border-t border-white/10 pt-5"
          >
            <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/25">
              {item.label}
            </p>

            <p className="mt-3 text-2xl font-black tracking-[-0.04em]">
              {item.value}
            </p>

            {item.detail && (
              <p className="mt-2 text-sm leading-6 text-white/35">
                {
                  item.detail
                }
              </p>
            )}
          </div>
        ),
      )}
    </div>
  );
}

function CompactMetric({
  label,
  value,
}: {
  label: string;

  value: string;
}) {
  return (
    <div>
      <p className="text-[9px] font-black uppercase tracking-[0.18em] text-white/25">
        {label}
      </p>

      <p className="mt-2 text-lg font-black">
        {value}
      </p>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  detail,
}: {
  label: string;

  value: string;

  detail?: string;
}) {
  return (
    <SpotlightCard className="rounded-[26px] p-6">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/25">
        {label}
      </p>

      <p className="mt-4 text-3xl font-black tracking-[-0.05em]">
        {value}
      </p>

      {detail && (
        <p className="mt-2 text-sm text-white/30">
          {detail}
        </p>
      )}
    </SpotlightCard>
  );
}

function HealthListCard({
  label,
  items,
}: {
  label: string;

  items: string[];
}) {
  return (
    <SpotlightCard className="h-full rounded-[28px] p-7">
      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#C6FF32]">
        {label}
      </p>

      <div className="mt-6 space-y-4">
        {items.map(
          (
            item,
            index,
          ) => (
            <div
              key={`${item}-${index}`}
              className="flex gap-4"
            >
              <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white/30" />

              <p className="text-sm leading-7 text-white/55">
                {item}
              </p>
            </div>
          ),
        )}
      </div>
    </SpotlightCard>
  );
}

function ListBlock({
  title,
  items,
}: {
  title: string;

  items: string[];
}) {
  return (
    <div className="mt-10 border-t border-white/10 pt-8">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/30">
        {title}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {items.map(
          (
            item,
            index,
          ) => (
            <span
              key={`${item}-${index}`}
              className="rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-bold text-white/50"
            >
              {item}
            </span>
          ),
        )}
      </div>
    </div>
  );
}

function BooleanStatusCard({
  label,
  value,
  positiveText,
  negativeText,
}: {
  label: string;

  value: boolean;

  positiveText: string;

  negativeText: string;
}) {
  return (
    <SpotlightCard className="rounded-[26px] p-6">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/30">
        {label}
      </p>

      <p
        className={`mt-4 text-xl font-black ${
          value
            ? "text-[#C6FF32]"
            : "text-red-500"
        }`}
      >
        {value
          ? positiveText
          : negativeText}
      </p>
    </SpotlightCard>
  );
}

function getCurrentSignals(
  dashboard:
    HealthDashboard,
) {
  const signals: {
    text: string;

    status:
      TrendStatus;
  }[] = [];

  const recovery =
    dashboard.trends
      .recoveryChange;

  if (
    recovery !== null &&
    Math.abs(
      recovery,
    ) >= 5
  ) {
    signals.push({
      text:
        recovery <
        0
          ? `Recovery is ${Math.abs(
              recovery,
            ).toFixed(
              0,
            )}% below the 30-day baseline.`
          : `Recovery is ${recovery.toFixed(
              0,
            )}% above the 30-day baseline.`,

      status:
        recovery <
        0
          ? "negative"
          : "positive",
    });
  }

  const hrv =
    dashboard.trends
      .hrvChange;

  if (
    hrv !== null &&
    Math.abs(
      hrv,
    ) >= 5
  ) {
    signals.push({
      text:
        hrv <
        0
          ? `HRV is ${Math.abs(
              hrv,
            ).toFixed(
              0,
            )}% below baseline.`
          : `HRV is ${hrv.toFixed(
              0,
            )}% above baseline.`,

      status:
        hrv <
        0
          ? "negative"
          : "positive",
    });
  }

  const rhr =
    dashboard.trends
      .restingHeartRateChange;

  if (
    rhr !== null &&
    Math.abs(
      rhr,
    ) >= 5
  ) {
    signals.push({
      text:
        rhr >
        0
          ? `Resting heart rate is ${rhr.toFixed(
              0,
            )}% above baseline.`
          : `Resting heart rate is ${Math.abs(
              rhr,
            ).toFixed(
              0,
            )}% below baseline.`,

      status:
        rhr >
        0
          ? "negative"
          : "positive",
    });
  }

  const sleep =
    dashboard.trends
      .sleepChange;

  if (
    sleep !== null &&
    Math.abs(
      sleep,
    ) >= 2
  ) {
    signals.push({
      text:
        sleep >
        0
          ? `Recent sleep duration is ${sleep.toFixed(
              1,
            )}% above the 30-day average.`
          : `Recent sleep duration is ${Math.abs(
              sleep,
            ).toFixed(
              1,
            )}% below the 30-day average.`,

      status:
        sleep >
        0
          ? "positive"
          : "negative",
    });
  }

  if (
    dashboard.today
      .sleepPerformance !==
      null &&
    dashboard.today
      .sleepPerformance <
      60
  ) {
    signals.push({
      text: `Sleep performance is currently ${Math.round(
        dashboard.today
          .sleepPerformance,
      )}%.`,

      status:
        "negative",
    });
  }

  return signals.slice(
    0,
    4,
  );
}

function getTrendStatus(
  change:
    | number
    | null,
  direction:
    TrendDirection,
): TrendStatus {
  if (
    change ===
      null ||
    Math.abs(
      change,
    ) <
      0.5
  ) {
    return "neutral";
  }

  if (
    direction ===
    "neutral"
  ) {
    return "neutral";
  }

  if (
    direction ===
    "higher"
  ) {
    return change >
      0
      ? "positive"
      : "negative";
  }

  return change <
    0
    ? "positive"
    : "negative";
}

function getTrendClass(
  status:
    TrendStatus,
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

  return "text-white/35";
}

function getTrendArrow(
  change: number,
) {
  if (
    Math.abs(
      change,
    ) <
    0.5
  ) {
    return "→";
  }

  return change >
    0
    ? "↑"
    : "↓";
}

function getBodyMetrics(
  entry:
    HealthEntry,
): Metric[] {
  const body =
    entry.bodyMeasurement;

  if (!body) {
    return [];
  }

  return [
    metric(
      "Weight",
      body.weightKg,
      "kg",
      1,
    ),

    metric(
      "Body fat",
      body.bodyFatPercentage,
      "%",
      1,
    ),

    metric(
      "Muscle mass",
      body.muscleMassKg,
      "kg",
      1,
    ),

    metric(
      "Waist",
      body.waistCm,
      "cm",
      1,
    ),

    metric(
      "Chest",
      body.chestCm,
      "cm",
      1,
    ),

    metric(
      "Hips",
      body.hipsCm,
      "cm",
      1,
    ),

    metric(
      "Left arm",
      body.leftArmCm,
      "cm",
      1,
    ),

    metric(
      "Right arm",
      body.rightArmCm,
      "cm",
      1,
    ),

    metric(
      "Left thigh",
      body.leftThighCm,
      "cm",
      1,
    ),

    metric(
      "Right thigh",
      body.rightThighCm,
      "cm",
      1,
    ),
  ].filter(
    (
      item,
    ): item is Metric =>
      item !==
      null,
  );
}

function getRecoveryMetrics(
  entry:
    HealthEntry,
): Metric[] {
  const recovery =
    entry.recovery;

  if (!recovery) {
    return [];
  }

  return [
    metric(
      "Recovery",
      recovery.recoveryScore,
      "%",
      0,
    ),

    metric(
      "Resting HR",
      recovery.restingHeartRateBpm,
      "bpm",
      0,
    ),

    metric(
      "HRV",
      recovery.heartRateVariabilityMs,
      "ms",
      1,
    ),

    metric(
      "Blood oxygen",
      recovery.bloodOxygenPercentage,
      "%",
      1,
    ),

    metric(
      "Respiratory rate",
      recovery.respiratoryRateBreathsPerMinute,
      "breaths/min",
      1,
    ),

    metric(
      "Skin temperature",
      recovery.skinTemperatureCelsius,
      "°C",
      1,
    ),

    metric(
      "Temperature deviation",
      recovery.skinTemperatureDeviationCelsius,
      "°C",
      1,
    ),

    metric(
      "VO₂ max",
      recovery.vo2Max,
      "",
      1,
    ),

    metric(
      "Fatigue",
      recovery.fatigueScore,
      "/10",
      1,
    ),

    metric(
      "Soreness",
      recovery.sorenessScore,
      "/10",
      1,
    ),

    metric(
      "Stress",
      recovery.stressScore,
      "/10",
      1,
    ),
  ].filter(
    (
      item,
    ): item is Metric =>
      item !==
      null,
  );
}

function getNutritionMetrics(
  entry:
    HealthEntry,
): Metric[] {
  const nutrition =
    entry.nutrition;

  if (!nutrition) {
    return [];
  }

  return [
    metric(
      "Calories",
      nutrition.calories,
      "kcal",
      0,
    ),

    metric(
      "Protein",
      nutrition.proteinGrams,
      "g",
      0,
    ),

    metric(
      "Carbohydrates",
      nutrition.carbohydratesGrams,
      "g",
      0,
    ),

    metric(
      "Fat",
      nutrition.fatGrams,
      "g",
      0,
    ),

    metric(
      "Fibre",
      nutrition.fibreGrams,
      "g",
      0,
    ),

    metric(
      "Sugar",
      nutrition.sugarGrams,
      "g",
      0,
    ),

    metric(
      "Water",
      nutrition.waterLitres,
      "L",
      1,
    ),

    metric(
      "Caffeine",
      nutrition.caffeineMg,
      "mg",
      0,
    ),

    metric(
      "Meals",
      nutrition.mealsCount,
      "",
      0,
    ),
  ].filter(
    (
      item,
    ): item is Metric =>
      item !==
      null,
  );
}

function metric(
  label: string,
  value:
    | number
    | undefined,
  unit = "",
  decimals = 1,
): Metric | null {
  if (
    typeof value !==
      "number" ||
    !Number.isFinite(
      value,
    )
  ) {
    return null;
  }

  return {
    label,

    value: `${value.toFixed(
      decimals,
    )}${unit ? ` ${unit}` : ""}`,
  };
}

function createChartPoints(
  values: {
    dateKey: string;

    value:
      | number
      | null;
  }[],
) {
  const valid =
    values.filter(
      (
        point,
      ) =>
        typeof point.value ===
          "number" &&
        Number.isFinite(
          point.value,
        ),
    );

  if (
    valid.length <
    2
  ) {
    return null;
  }

  const numbers =
    valid.map(
      (
        point,
      ) =>
        point.value as number,
    );

  const min =
    Math.min(
      ...numbers,
    );

  const max =
    Math.max(
      ...numbers,
    );

  const range =
    max - min || 1;

  const padding =
    range *
      0.12 ||
    1;

  const paddedMin =
    min -
    padding;

  const paddedMax =
    max +
    padding;

  const paddedRange =
    paddedMax -
    paddedMin;

  return valid
    .map(
      (
        point,
        index,
      ) => {
        const x =
          (index /
            (valid.length -
              1)) *
          100;

        const normalized =
          ((point.value as number) -
            paddedMin) /
          paddedRange;

        const y =
          38 -
          normalized *
            36;

        return `${x.toFixed(
          2,
        )},${y.toFixed(
          2,
        )}`;
      },
    )
    .join(
      " ",
    );
}

function formatPercentage(
  value:
    | number
    | null,
) {
  if (
    value ===
    null
  ) {
    return "—";
  }

  return `${Math.round(
    value,
  )}%`;
}

function formatPercentageValue(
  value:
    | number
    | undefined,
) {
  if (
    typeof value !==
      "number"
  ) {
    return "—";
  }

  return `${Math.round(
    value,
  )}%`;
}

function formatNumber(
  value:
    | number
    | null,
  decimals = 1,
) {
  if (
    value ===
    null
  ) {
    return "—";
  }

  return value.toFixed(
    decimals,
  );
}

function formatMetricValue(
  value:
    | number
    | null,
  unit?: string,
) {
  if (
    value ===
    null
  ) {
    return "—";
  }

  return `${value.toFixed(
    1,
  )}${unit ? ` ${unit}` : ""}`;
}

function formatHours(
  value:
    | number
    | undefined,
) {
  if (
    typeof value !==
      "number"
  ) {
    return "—";
  }

  const totalMinutes =
    Math.round(
      value *
        60,
    );

  return formatMinutesAsHours(
    totalMinutes,
  );
}

function formatMinutesAsHours(
  minutes:
    | number
    | undefined,
) {
  if (
    typeof minutes !==
      "number" ||
    !Number.isFinite(
      minutes,
    )
  ) {
    return "—";
  }

  const totalMinutes =
    Math.max(
      0,
      Math.round(
        minutes,
      ),
    );

  const hours =
    Math.floor(
      totalMinutes /
        60,
    );

  const remainingMinutes =
    totalMinutes %
    60;

  if (
    hours ===
    0
  ) {
    return `${remainingMinutes}m`;
  }

  return `${hours}h ${remainingMinutes}m`;
}

function formatMinutes(
  minutes: number,
) {
  return formatMinutesAsHours(
    minutes,
  );
}

function formatDateKey(
  dateKey: string,
) {
  const [
    year,
    month,
    day,
  ] =
    dateKey
      .split("-")
      .map(
        Number,
      );

  const date =
    new Date(
      Date.UTC(
        year,
        month - 1,
        day,
      ),
    );

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day:
        "numeric",

      month:
        "short",

      year:
        "numeric",

      timeZone:
        "UTC",
    },
  ).format(
    date,
  );
}

function formatShortDate(
  dateKey: string,
) {
  const [
    year,
    month,
    day,
  ] =
    dateKey
      .split("-")
      .map(
        Number,
      );

  const date =
    new Date(
      Date.UTC(
        year,
        month - 1,
        day,
      ),
    );

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day:
        "numeric",

      month:
        "short",

      timeZone:
        "UTC",
    },
  ).format(
    date,
  );
}

function formatSource(
  source: string,
) {
  if (
    source ===
    "whoop"
  ) {
    return "WHOOP";
  }

  if (
    source ===
    "apple_health"
  ) {
    return "Apple Health";
  }

  return source
    .replace(
      /_/g,
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