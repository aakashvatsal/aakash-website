import { SpotlightCard } from "@/components/ui/SpotlightCard";
import type { WorkoutData } from "@/types/health";

import {
  formatNumber,
  formatWorkoutIntensity,
  getCompletedSets,
  getTotalSets,
  getWorkoutTitle,
} from "./health.utils";

interface WorkoutCardProps {
  workout: WorkoutData;
}

export function WorkoutCard({
  workout,
}: WorkoutCardProps) {
  const completedSets =
    getCompletedSets(workout);

  const totalSets =
    getTotalSets(workout);

  const exerciseCount =
    workout.exercises?.length ?? 0;

  return (
    <SpotlightCard className="rounded-[24px] border border-white/10 bg-white/[0.025] p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/30">
            Training
          </p>

          <h3 className="mt-4 text-3xl font-black tracking-[-0.04em]">
            {getWorkoutTitle(workout)}
          </h3>
        </div>

        <span
          className={`rounded-full px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.16em] ${
            workout.completed
              ? "bg-[#C6FF32]/10 text-[#C6FF32]"
              : "bg-white/5 text-white/30"
          }`}
        >
          {workout.completed
            ? "Completed"
            : "Planned"}
        </span>
      </div>

      <p className="mt-4 text-sm text-white/40">
        {formatWorkoutIntensity(
          workout.intensity,
        )}
      </p>

      <div className="mt-8 grid grid-cols-2 gap-6">
        <WorkoutMetric
          label="Duration"
          value={formatNumber(
            workout.durationMinutes,
            "min",
          )}
        />

        <WorkoutMetric
          label="Calories"
          value={formatNumber(
            workout.caloriesBurned,
            "kcal",
          )}
        />

        <WorkoutMetric
          label="Exercises"
          value={String(exerciseCount)}
        />

        <WorkoutMetric
          label="Sets"
          value={
            totalSets > 0
              ? `${completedSets}/${totalSets}`
              : "—"
          }
        />

        <WorkoutMetric
          label="Average HR"
          value={formatNumber(
            workout.averageHeartRateBpm,
            "bpm",
          )}
        />

        <WorkoutMetric
          label="Maximum HR"
          value={formatNumber(
            workout.maximumHeartRateBpm,
            "bpm",
          )}
        />

        <WorkoutMetric
          label="Strain"
          value={formatNumber(
            workout.strainScore,
          )}
        />

        <WorkoutMetric
          label="Exertion"
          value={
            typeof workout.perceivedExertion ===
            "number"
              ? `${workout.perceivedExertion}/10`
              : "—"
          }
        />
      </div>

      {workout.cardio && (
        <div className="mt-8 border-t border-white/10 pt-7">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/30">
            Cardio
          </p>

          <div className="mt-5 grid grid-cols-2 gap-6">
            <WorkoutMetric
              label="Distance"
              value={formatNumber(
                workout.cardio.distanceKm,
                "km",
              )}
            />

            <WorkoutMetric
              label="Duration"
              value={formatNumber(
                workout.cardio.durationMinutes,
                "min",
              )}
            />

            <WorkoutMetric
              label="Average HR"
              value={formatNumber(
                workout.cardio
                  .averageHeartRateBpm,
                "bpm",
              )}
            />

            <WorkoutMetric
              label="Maximum HR"
              value={formatNumber(
                workout.cardio
                  .maximumHeartRateBpm,
                "bpm",
              )}
            />

            <WorkoutMetric
              label="Average Speed"
              value={formatNumber(
                workout.cardio
                  .averageSpeedKmph,
                "km/h",
              )}
            />

            <WorkoutMetric
              label="Average Pace"
              value={formatNumber(
                workout.cardio
                  .averagePaceMinutesPerKm,
                "min/km",
              )}
            />

            <WorkoutMetric
              label="Calories"
              value={formatNumber(
                workout.cardio
                  .caloriesBurned,
                "kcal",
              )}
            />

            <WorkoutMetric
              label="Elevation Gain"
              value={formatNumber(
                workout.cardio
                  .elevationGainMetres,
                "m",
              )}
            />
          </div>
        </div>
      )}

      {exerciseCount > 0 && (
        <div className="mt-8 border-t border-white/10 pt-7">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/30">
            Exercises
          </p>

          <div className="mt-5 space-y-4">
            {(workout.exercises ?? []).map(
              (exercise, exerciseIndex) => (
                <div
                  key={`${exercise.name}-${exerciseIndex}`}
                  className="rounded-[16px] border border-white/[0.07] bg-white/[0.02] p-4"
                >
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm font-bold text-white/80">
                        {exercise.name}
                      </p>

                      {exercise.muscleGroup && (
                        <p className="mt-1 text-xs text-white/30">
                          {
                            exercise.muscleGroup
                          }
                        </p>
                      )}
                    </div>

                    <p className="text-xs font-bold text-white/35">
                      {
                        exercise.sets?.length ??
                        0
                      }{" "}
                      sets
                    </p>
                  </div>

                  {(exercise.sets?.length ??
                    0) > 0 && (
                    <div className="mt-4 grid gap-2">
                      {(
                        exercise.sets ?? []
                      ).map(
                        (
                          set,
                          setIndex,
                        ) => (
                          <div
                            key={`${set.setNumber}-${setIndex}`}
                            className="flex flex-wrap items-center gap-x-4 gap-y-2 rounded-[12px] border border-white/[0.05] bg-[#030608]/40 px-3 py-2 text-xs text-white/40"
                          >
                            <span className="font-bold text-white/60">
                              Set{" "}
                              {
                                set.setNumber
                              }
                            </span>

                            {typeof set.repetitions ===
                              "number" && (
                              <span>
                                {
                                  set.repetitions
                                }{" "}
                                reps
                              </span>
                            )}

                            {typeof set.weightKg ===
                              "number" && (
                              <span>
                                {
                                  set.weightKg
                                }{" "}
                                kg
                              </span>
                            )}

                            {typeof set.durationSeconds ===
                              "number" && (
                              <span>
                                {
                                  set.durationSeconds
                                }{" "}
                                sec
                              </span>
                            )}

                            {typeof set.distanceMetres ===
                              "number" && (
                              <span>
                                {
                                  set.distanceMetres
                                }{" "}
                                m
                              </span>
                            )}

                            {typeof set.perceivedExertion ===
                              "number" && (
                              <span>
                                RPE{" "}
                                {
                                  set.perceivedExertion
                                }
                                /10
                              </span>
                            )}

                            {typeof set.completed ===
                              "boolean" && (
                              <span
                                className={
                                  set.completed
                                    ? "text-[#C6FF32]"
                                    : "text-white/25"
                                }
                              >
                                {set.completed
                                  ? "Completed"
                                  : "Pending"}
                              </span>
                            )}
                          </div>
                        ),
                      )}
                    </div>
                  )}

                  {exercise.notes && (
                    <p className="mt-4 text-xs leading-6 text-white/35">
                      {exercise.notes}
                    </p>
                  )}
                </div>
              ),
            )}
          </div>
        </div>
      )}

      {workout.notes && (
        <p className="mt-8 border-t border-white/10 pt-6 text-sm leading-7 text-white/45">
          {workout.notes}
        </p>
      )}
    </SpotlightCard>
  );
}

function WorkoutMetric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/25">
        {label}
      </p>

      <p className="mt-2 text-sm font-bold text-white/70">
        {value}
      </p>
    </div>
  );
}