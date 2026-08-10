"use client";

import Link from "next/link";
import {
  Activity,
  Archive,
  BedDouble,
  Dumbbell,
  Flame,
  Footprints,
  HeartPulse,
  Pencil,
  RotateCcw,
  Scale,
  ShieldCheck,
  Trash2,
  Utensils,
} from "lucide-react";

import type {
  HealthEntry,
} from "@/types/health";

import { HealthMoodBadge } from "./HealthMoodBadge";

type HealthCardProps = {
  entry: HealthEntry;

  deleting?: boolean;
  updating?: boolean;

  onDelete: (
    entry: HealthEntry,
  ) => void;

  onToggleArchive?: (
    entry: HealthEntry,
  ) => void;

  onToggleActive?: (
    entry: HealthEntry,
  ) => void;
};

function formatDate(
  value: string,
) {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value;
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(date);
}

function formatNumber(
  value: number,
) {
  return new Intl.NumberFormat(
    "en-IN",
  ).format(value);
}

function formatLabel(
  value: string,
) {
  return value
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase(),
    );
}

export function HealthCard({
  entry,
  deleting = false,
  updating = false,
  onDelete,
  onToggleArchive,
  onToggleActive,
}: HealthCardProps) {
  const workouts =
    entry.workouts ?? [];

  const painEntries =
    entry.painEntries ?? [];

  const habits =
    entry.habits ?? [];

  const symptoms =
    entry.symptoms ?? [];

  const achievements =
    entry.achievements ?? [];

  const goals =
    entry.goals ?? [];

  const completedWorkouts =
    workouts.filter(
      (workout) =>
        workout.completed,
    );

  const unresolvedPain =
    painEntries.filter(
      (pain) =>
        !pain.resolved,
    );

  const completedHabits =
    habits.filter(
      (habit) =>
        habit.completed,
    );

  const missedHabits =
    habits.filter(
      (habit) =>
        !habit.completed,
    );

  const completedHabitCount =
    completedHabits.length;

  const workoutDuration =
    workouts.reduce(
      (sum, workout) =>
        sum +
        (
          workout.durationMinutes ??
          0
        ),
      0,
    );

  const totalWorkoutCalories =
    workouts.reduce(
      (sum, workout) =>
        sum +
        (
          workout.caloriesBurned ??
          0
        ),
      0,
    );

  const primaryWorkout =
    workouts[0];

  return (
    <article
      className={[
        "group relative overflow-hidden rounded-[24px] border bg-white/[0.025] transition",

        entry.isArchived
          ? "border-orange-400/20 opacity-70"
          : "border-white/10 hover:border-white/20",

        !entry.isActive
          ? "opacity-50"
          : "",
      ].join(" ")}
    >
      {entry.recovery
        ?.recoveryScore !==
        undefined && (
        <div
          className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C6FF32] to-transparent"
          style={{
            opacity:
              Math.min(
                Math.max(
                  entry.recovery
                    .recoveryScore,
                  0,
                ),
                100,
              ) / 100,
          }}
        />
      )}

      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-black uppercase tracking-[0.15em] text-white/30">
                {formatDate(
                  entry.date,
                )}
              </span>

              <HealthMoodBadge
                mood={entry.mood}
              />

              {entry.isArchived && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-400/20 bg-orange-400/10 px-3 py-1 text-xs font-bold text-orange-300">
                  <Archive className="h-3.5 w-3.5" />

                  Archived
                </span>
              )}

              {!entry.isActive && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-red-400/20 bg-red-400/10 px-3 py-1 text-xs font-bold text-red-300">
                  Inactive
                </span>
              )}
            </div>

            <Link
              href={`/admin/health/${entry._id}`}
              className="mt-5 block"
            >
              <h2 className="text-xl font-black text-white transition group-hover:text-[#C6FF32] sm:text-2xl">
                Health entry for{" "}
                {formatDate(
                  entry.date,
                )}
              </h2>
            </Link>

            {entry.notes && (
              <p className="mt-3 line-clamp-2 max-w-4xl text-sm leading-7 text-white/40">
                {entry.notes}
              </p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {onToggleActive && (
              <button
                type="button"
                disabled={
                  updating
                }
                onClick={() =>
                  onToggleActive(
                    entry,
                  )
                }
                aria-label={
                  entry.isActive
                    ? "Deactivate health entry"
                    : "Activate health entry"
                }
                title={
                  entry.isActive
                    ? "Deactivate"
                    : "Activate"
                }
                className={[
                  "grid h-10 w-10 place-items-center rounded-xl transition disabled:cursor-not-allowed disabled:opacity-40",

                  entry.isActive
                    ? "text-[#C6FF32] hover:bg-[#C6FF32]/10"
                    : "text-white/30 hover:bg-white/[0.05] hover:text-white",
                ].join(" ")}
              >
                <ShieldCheck className="h-4 w-4" />
              </button>
            )}

            {onToggleArchive && (
              <button
                type="button"
                disabled={
                  updating
                }
                onClick={() =>
                  onToggleArchive(
                    entry,
                  )
                }
                aria-label={
                  entry.isArchived
                    ? "Restore health entry"
                    : "Archive health entry"
                }
                title={
                  entry.isArchived
                    ? "Restore"
                    : "Archive"
                }
                className="grid h-10 w-10 place-items-center rounded-xl text-white/30 transition hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                {entry.isArchived ? (
                  <RotateCcw className="h-4 w-4" />
                ) : (
                  <Archive className="h-4 w-4" />
                )}
              </button>
            )}

            <Link
              href={`/admin/health/${entry._id}`}
              aria-label="Edit health entry"
              title="Edit"
              className="grid h-10 w-10 place-items-center rounded-xl text-white/30 transition hover:bg-[#C6FF32]/10 hover:text-[#C6FF32]"
            >
              <Pencil className="h-4 w-4" />
            </Link>

            <button
              type="button"
              disabled={
                deleting
              }
              onClick={() =>
                onDelete(entry)
              }
              aria-label="Delete health entry"
              title="Delete"
              className="grid h-10 w-10 place-items-center rounded-xl text-white/30 transition hover:bg-red-400/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <MetricTile
            icon={Footprints}
            label="Steps"
            value={
              entry.steps !==
              undefined
                ? formatNumber(
                    entry.steps,
                  )
                : "—"
            }
          />

          <MetricTile
            icon={BedDouble}
            label="Sleep"
            value={
              entry.sleep
                ?.durationHours !==
              undefined
                ? `${entry.sleep.durationHours} h`
                : "—"
            }
            secondary={
              entry.sleep
                ?.sleepScore !==
              undefined
                ? `${entry.sleep.sleepScore}/100`
                : undefined
            }
          />

          <MetricTile
            icon={HeartPulse}
            label="Recovery"
            value={
              entry.recovery
                ?.recoveryScore !==
              undefined
                ? `${entry.recovery.recoveryScore}%`
                : "—"
            }
            secondary={
              entry.recovery
                ?.restingHeartRateBpm !==
              undefined
                ? `${entry.recovery.restingHeartRateBpm} bpm`
                : undefined
            }
          />

          <MetricTile
            icon={Scale}
            label="Weight"
            value={
              entry.bodyMeasurement
                ?.weightKg !==
              undefined
                ? `${entry.bodyMeasurement.weightKg} kg`
                : "—"
            }
            secondary={
              entry.bodyMeasurement
                ?.bodyFatPercentage !==
              undefined
                ? `${entry.bodyMeasurement.bodyFatPercentage}% fat`
                : undefined
            }
          />

          <MetricTile
            icon={Dumbbell}
            label="Workouts"
            value={`${completedWorkouts.length}/${workouts.length}`}
            secondary={
              workoutDuration >
              0
                ? `${workoutDuration} min`
                : undefined
            }
          />

          <MetricTile
            icon={Flame}
            label="Burned"
            value={
              entry.totalCaloriesBurned !==
              undefined
                ? `${formatNumber(
                    entry.totalCaloriesBurned,
                  )} kcal`
                : totalWorkoutCalories >
                    0
                  ? `${formatNumber(
                      totalWorkoutCalories,
                    )} kcal`
                  : "—"
            }
          />
        </div>

        {(primaryWorkout ||
          entry.nutrition ||
          unresolvedPain.length >
            0 ||
          habits.length > 0) && (
          <div className="mt-6 grid gap-4 border-t border-white/[0.07] pt-5 lg:grid-cols-2 xl:grid-cols-4">
            {primaryWorkout && (
              <SummaryBlock
                icon={Dumbbell}
                label="Training"
                title={
                  primaryWorkout.title ||
                  formatLabel(
                    primaryWorkout.type,
                  )
                }
                meta={[
                  formatLabel(
                    primaryWorkout.intensity,
                  ),

                  primaryWorkout.durationMinutes
                    ? `${primaryWorkout.durationMinutes} min`
                    : undefined,

                  (
                    primaryWorkout.exercises ??
                    []
                  ).length
                    ? `${
                        (
                          primaryWorkout.exercises ??
                          []
                        ).length
                      } exercises`
                    : undefined,
                ]}
              />
            )}

            {entry.nutrition && (
              <SummaryBlock
                icon={Utensils}
                label="Nutrition"
                title={
                  entry.nutrition
                    .calories !==
                  undefined
                    ? `${entry.nutrition.calories} kcal`
                    : "Nutrition logged"
                }
                meta={[
                  entry.nutrition
                    .proteinGrams !==
                  undefined
                    ? `${entry.nutrition.proteinGrams}g protein`
                    : undefined,

                  entry.nutrition
                    .waterLitres !==
                  undefined
                    ? `${entry.nutrition.waterLitres}L water`
                    : undefined,

                  entry.nutrition
                    .mealsCount !==
                  undefined
                    ? `${entry.nutrition.mealsCount} meals`
                    : undefined,
                ]}
              />
            )}

            {habits.length > 0 && (
              <SummaryBlock
                icon={Activity}
                label="Habits"
                title={`${completedHabitCount}/${habits.length} completed`}
                meta={[
                  completedHabits.length >
                  0
                    ? `${completedHabits.length} completed`
                    : undefined,

                  missedHabits.length >
                  0
                    ? `${missedHabits.length} missed`
                    : undefined,
                ]}
              />
            )}

            <SummaryBlock
              icon={HeartPulse}
              label="Pain"
              title={
                unresolvedPain.length >
                0
                  ? `${unresolvedPain.length} unresolved`
                  : "No active pain"
              }
              meta={unresolvedPain
                .slice(0, 2)
                .map(
                  (pain) =>
                    `${pain.bodyPart} · ${formatLabel(
                      pain.severity,
                    )}`,
                )}
            />
          </div>
        )}

        {(entry.energyScore !==
          undefined ||
          entry.motivationScore !==
            undefined ||
          entry.activeMinutes !==
            undefined ||
          entry.standingHours !==
            undefined) && (
          <div className="mt-5 flex flex-wrap gap-x-6 gap-y-2 text-xs font-bold text-white/30">
            {entry.energyScore !==
              undefined && (
              <span>
                Energy{" "}
                <strong className="text-white/65">
                  {
                    entry.energyScore
                  }
                  /10
                </strong>
              </span>
            )}

            {entry.motivationScore !==
              undefined && (
              <span>
                Motivation{" "}
                <strong className="text-white/65">
                  {
                    entry.motivationScore
                  }
                  /10
                </strong>
              </span>
            )}

            {entry.activeMinutes !==
              undefined && (
              <span>
                Active{" "}
                <strong className="text-white/65">
                  {
                    entry.activeMinutes
                  }{" "}
                  min
                </strong>
              </span>
            )}

            {entry.standingHours !==
              undefined && (
              <span>
                Standing{" "}
                <strong className="text-white/65">
                  {
                    entry.standingHours
                  }{" "}
                  h
                </strong>
              </span>
            )}
          </div>
        )}

        {(symptoms.length > 0 ||
          achievements.length >
            0 ||
          goals.length > 0) && (
          <div className="mt-5 flex flex-wrap gap-2">
            {symptoms
              .slice(0, 3)
              .map(
                (symptom) => (
                  <Tag
                    key={`symptom-${symptom}`}
                    label={
                      symptom
                    }
                    type="symptom"
                  />
                ),
              )}

            {achievements
              .slice(0, 3)
              .map(
                (
                  achievement,
                ) => (
                  <Tag
                    key={`achievement-${achievement}`}
                    label={
                      achievement
                    }
                    type="achievement"
                  />
                ),
              )}

            {goals
              .slice(0, 3)
              .map(
                (goal) => (
                  <Tag
                    key={`goal-${goal}`}
                    label={goal}
                    type="goal"
                  />
                ),
              )}
          </div>
        )}
      </div>
    </article>
  );
}

type MetricTileProps = {
  icon: React.ComponentType<{
    className?: string;
  }>;

  label: string;
  value: string;

  secondary?: string;
};

function MetricTile({
  icon: Icon,
  label,
  value,
  secondary,
}: MetricTileProps) {
  return (
    <div className="rounded-[16px] border border-white/[0.07] bg-[#05090b] p-4">
      <div className="flex items-center gap-2 text-white/30">
        <Icon className="h-4 w-4 text-[#C6FF32]" />

        <span className="text-[10px] font-black uppercase tracking-[0.16em]">
          {label}
        </span>
      </div>

      <p className="mt-3 text-lg font-black text-white">
        {value}
      </p>

      {secondary && (
        <p className="mt-1 text-xs font-medium text-white/35">
          {secondary}
        </p>
      )}
    </div>
  );
}

type SummaryBlockProps = {
  icon: React.ComponentType<{
    className?: string;
  }>;

  label: string;
  title: string;

  meta: Array<
    string | undefined
  >;
};

function SummaryBlock({
  icon: Icon,
  label,
  title,
  meta,
}: SummaryBlockProps) {
  const cleanMeta =
    meta.filter(
      (
        value,
      ): value is string =>
        Boolean(value),
    );

  return (
    <div className="rounded-[16px] border border-white/[0.07] bg-[#05090b] p-4">
      <div className="flex items-center gap-2">
        <Icon className="h-4 w-4 text-[#C6FF32]" />

        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/25">
          {label}
        </p>
      </div>

      <p className="mt-3 line-clamp-1 text-sm font-black text-white/75">
        {title}
      </p>

      {cleanMeta.length >
        0 && (
        <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/35">
          {cleanMeta.join(
            " · ",
          )}
        </p>
      )}
    </div>
  );
}

type TagProps = {
  label: string;

  type:
    | "symptom"
    | "achievement"
    | "goal";
};

function Tag({
  label,
  type,
}: TagProps) {
  const className = {
    symptom:
      "border-red-400/15 bg-red-400/5 text-red-200/70",

    achievement:
      "border-[#C6FF32]/15 bg-[#C6FF32]/5 text-[#C6FF32]/70",

    goal:
      "border-sky-400/15 bg-sky-400/5 text-sky-200/70",
  }[type];

  return (
    <span
      className={[
        "rounded-full border px-3 py-1 text-xs font-medium",
        className,
      ].join(" ")}
    >
      {label}
    </span>
  );
}