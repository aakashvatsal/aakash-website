"use client";

import {
  FormEvent,
  useMemo,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  Activity,
  BedDouble,
  Brain,
  Check,
  Dumbbell,
  HeartPulse,
  Plus,
  Trash2,
  Utensils,
} from "lucide-react";

import {
  createHealthEntry,
  updateHealthEntry,
} from "@/lib/api/health";

import type {
  HealthEntryPayload,
} from "@/lib/api/health";

import type {
  BodyMeasurement,
  CardioData,
  Exercise,
  ExerciseSet,
  HabitEntry,
  HealthEntry,
  HealthMood,
  NutritionData,
  PainEntry,
  PainSeverity,
  RecoveryData,
  SleepData,
  WorkoutData,
  WorkoutIntensity,
  WorkoutType,
} from "@/types/health";

import { AdminFormFooter } from "../AdminFormFooter";

import { HealthMetricInput } from "./HealthMetricInput";
import { HealthMoodBadge } from "./HealthMoodBadge";
import { HealthStringListEditor } from "./HealthStringListEditor";

type HealthFormProps = {
  entry?: HealthEntry;
};

const inputClassName =
  "min-h-11 w-full rounded-[14px] border border-white/10 bg-[#05090b] px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#C6FF32]/40";

const textareaClassName =
  "min-h-28 w-full resize-y rounded-[14px] border border-white/10 bg-[#05090b] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/25 focus:border-[#C6FF32]/40";

const HEALTH_MOODS: HealthMood[] = [
  "excellent",
  "good",
  "neutral",
  "low",
  "poor",
];

const WORKOUT_TYPES: WorkoutType[] = [
  "push",
  "pull",
  "legs",
  "full_body",
  "walk",
  "run",
  "cycling",
  "swimming",
  "sports",
  "mobility",
  "yoga",
  "abs",
  "rest",
  "other",
];

const WORKOUT_INTENSITIES: WorkoutIntensity[] = [
  "low",
  "moderate",
  "high",
];

const PAIN_SEVERITIES: PainSeverity[] = [
  "none",
  "mild",
  "moderate",
  "severe",
];

const CARDIO_WORKOUT_TYPES: WorkoutType[] = [
  "walk",
  "run",
  "cycling",
  "swimming",
  "sports",
];

const DEFAULT_WORKOUT: WorkoutData = {
  type: "other",

  intensity: "moderate",

  source: "manual",

  exercises: [],

  completed: false,
};

const DEFAULT_EXERCISE: Exercise = {
  name: "",

  sets: [],
};

const DEFAULT_EXERCISE_SET: ExerciseSet = {
  setNumber: 1,

  completed: false,
};

const DEFAULT_PAIN_ENTRY: PainEntry = {
  bodyPart: "",

  severity: "none",

  resolved: false,
};

const DEFAULT_HABITS: Array<{
  key: string;
  label: string;
}> = [
  {
    key: "morning_walk",
    label: "Morning Walk",
  },
  {
    key: "evening_workout",
    label: "Evening Workout",
  },
  {
    key: "meditation",
    label: "Meditation",
  },
  {
    key: "stretching",
    label: "Stretching",
  },
  {
    key: "reading",
    label: "Reading",
  },
  {
    key: "no_smoking",
    label: "No Smoking",
  },
  {
    key: "no_alcohol",
    label: "No Alcohol",
  },
  {
    key: "supplements_taken",
    label: "Supplements Taken",
  },
];

function toDateInput(
  value?: string,
) {
  if (!value) {
    return new Date()
      .toISOString()
      .slice(0, 10);
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value.slice(
      0,
      10,
    );
  }

  return date
    .toISOString()
    .slice(0, 10);
}

function toDateTimeLocal(
  value?: string,
) {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "";
  }

  const timezoneOffset =
    date.getTimezoneOffset() *
    60_000;

  return new Date(
    date.getTime() -
      timezoneOffset,
  )
    .toISOString()
    .slice(0, 16);
}

function toIsoDate(
  value?: string,
) {
  if (!value) {
    return undefined;
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return undefined;
  }

  return date.toISOString();
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

function cleanObject<
  T extends Record<
    string,
    unknown
  >,
>(
  value: T,
): Partial<T> {
  return Object.fromEntries(
    Object.entries(
      value,
    ).filter(
      ([, item]) => {
        if (
          item ===
            undefined ||
          item === ""
        ) {
          return false;
        }

        if (
          Array.isArray(
            item,
          ) &&
          item.length === 0
        ) {
          return false;
        }

        return true;
      },
    ),
  ) as Partial<T>;
}

export function HealthForm({
  entry,
}: HealthFormProps) {
  const router =
    useRouter();

  const isEditMode =
    Boolean(entry?._id);

  const [date, setDate] =
    useState(
      toDateInput(
        entry?.date,
      ),
    );

  const [mood, setMood] =
    useState<HealthMood>(
      entry?.mood ??
        "neutral",
    );

  const [
    bodyMeasurement,
    setBodyMeasurement,
  ] =
    useState<BodyMeasurement>(
      entry?.bodyMeasurement ??
        {},
    );

  const [sleep, setSleep] =
    useState<SleepData>(
      entry?.sleep ?? {},
    );

  const [
    recovery,
    setRecovery,
  ] =
    useState<RecoveryData>(
      entry?.recovery ?? {},
    );

  const [
    workouts,
    setWorkouts,
  ] = useState<
    WorkoutData[]
  >(entry?.workouts ?? []);

  const [
    nutrition,
    setNutrition,
  ] =
    useState<NutritionData>({
      calories:
        entry?.nutrition
          ?.calories,

      proteinGrams:
        entry?.nutrition
          ?.proteinGrams,

      carbohydratesGrams:
        entry?.nutrition
          ?.carbohydratesGrams,

      fatGrams:
        entry?.nutrition
          ?.fatGrams,

      fibreGrams:
        entry?.nutrition
          ?.fibreGrams,

      sugarGrams:
        entry?.nutrition
          ?.sugarGrams,

      waterLitres:
        entry?.nutrition
          ?.waterLitres,

      caffeineMg:
        entry?.nutrition
          ?.caffeineMg,

      mealsCount:
        entry?.nutrition
          ?.mealsCount,

      followedMealPlan:
        entry?.nutrition
          ?.followedMealPlan ??
        false,

      hadAlcohol:
        entry?.nutrition
          ?.hadAlcohol ??
        false,

      smoked:
        entry?.nutrition
          ?.smoked ??
        false,

      supplements:
        entry?.nutrition
          ?.supplements ??
        [],

      meals:
        entry?.nutrition
          ?.meals ??
        [],

      notes:
        entry?.nutrition
          ?.notes ??
        "",
    });

  const [
    habits,
    setHabits,
  ] = useState<
    HabitEntry[]
  >(entry?.habits ?? []);

  const [
    painEntries,
    setPainEntries,
  ] = useState<
    PainEntry[]
  >(
    entry?.painEntries ??
      [],
  );

  const [steps, setSteps] =
    useState<
      number | undefined
    >(entry?.steps);

  const [
    activeMinutes,
    setActiveMinutes,
  ] = useState<
    number | undefined
  >(entry?.activeMinutes);

  const [
    standingHours,
    setStandingHours,
  ] = useState<
    number | undefined
  >(entry?.standingHours);

  const [
    totalCaloriesBurned,
    setTotalCaloriesBurned,
  ] = useState<
    number | undefined
  >(
    entry?.totalCaloriesBurned,
  );

  const [
    restingCaloriesBurned,
    setRestingCaloriesBurned,
  ] = useState<
    number | undefined
  >(
    entry?.restingCaloriesBurned,
  );

  const [
    energyScore,
    setEnergyScore,
  ] = useState<
    number | undefined
  >(entry?.energyScore);

  const [
    motivationScore,
    setMotivationScore,
  ] = useState<
    number | undefined
  >(entry?.motivationScore);

  const [
    symptoms,
    setSymptoms,
  ] = useState<
    string[]
  >(entry?.symptoms ?? []);

  const [
    achievements,
    setAchievements,
  ] = useState<
    string[]
  >(
    entry?.achievements ??
      [],
  );

  const [goals, setGoals] =
    useState<
      string[]
    >(entry?.goals ?? []);

  const [notes, setNotes] =
    useState(
      entry?.notes ?? "",
    );

  const [
    wearableDataText,
    setWearableDataText,
  ] = useState(
    JSON.stringify(
      entry?.wearableData ??
        {},
      null,
      2,
    ),
  );

  const [
    isArchived,
    setIsArchived,
  ] = useState(
    entry?.isArchived ??
      false,
  );

  const [
    isActive,
    setIsActive,
  ] = useState(
    entry?.isActive ??
      true,
  );

  const [saving, setSaving] =
    useState(false);

  const [error, setError] =
    useState("");

  const completedWorkouts =
    useMemo(
      () =>
        workouts.filter(
          (workout) =>
            workout.completed,
        ).length,
      [workouts],
    );

  function updateBodyMeasurement(
    field: keyof BodyMeasurement,
    value?: number,
  ) {
    setBodyMeasurement(
      (current) => ({
        ...current,
        [field]: value,
      }),
    );
  }

  function updateSleep(
    field: keyof SleepData,
    value:
      SleepData[keyof SleepData],
  ) {
    setSleep(
      (current) => ({
        ...current,
        [field]: value,
      }),
    );
  }

  function updateRecovery(
    field: keyof RecoveryData,
    value:
      RecoveryData[keyof RecoveryData],
  ) {
    setRecovery(
      (current) => ({
        ...current,
        [field]: value,
      }),
    );
  }

  function updateNutrition(
    field: keyof NutritionData,
    value:
      | NutritionData[keyof NutritionData]
      | undefined,
  ) {
    setNutrition(
      (current) => ({
        ...current,
        [field]: value,
      }),
    );
  }

  function toggleHabit(
    key: string,
    label: string,
  ) {
    setHabits(
      (current) => {
        const existing =
          current.find(
            (habit) =>
              habit.key ===
              key,
          );

        if (existing) {
          return current.map(
            (habit) =>
              habit.key ===
              key
                ? {
                    ...habit,

                    completed:
                      !habit.completed,
                  }
                : habit,
          );
        }

        return [
          ...current,

          {
            key,

            label,

            completed:
              true,
          },
        ];
      },
    );
  }

  function addWorkout() {
    setWorkouts(
      (current) => [
        ...current,

        {
          ...DEFAULT_WORKOUT,

          exercises: [],
        },
      ],
    );
  }

  function updateWorkout(
    workoutIndex: number,
    patch:
      Partial<WorkoutData>,
  ) {
    setWorkouts(
      (current) =>
        current.map(
          (
            workout,
            index,
          ) =>
            index ===
            workoutIndex
              ? {
                  ...workout,
                  ...patch,
                }
              : workout,
        ),
    );
  }

  function removeWorkout(
    index: number,
  ) {
    setWorkouts(
      (current) =>
        current.filter(
          (
            _,
            workoutIndex,
          ) =>
            workoutIndex !==
            index,
        ),
    );
  }

  function addExercise(
    workoutIndex: number,
  ) {
    setWorkouts(
      (current) =>
        current.map(
          (
            workout,
            index,
          ) => {
            if (
              index !==
              workoutIndex
            ) {
              return workout;
            }

            return {
              ...workout,

              exercises: [
                ...(workout.exercises ??
                  []),

                {
                  ...DEFAULT_EXERCISE,

                  sets: [],
                },
              ],
            };
          },
        ),
    );
  }

  function updateExercise(
    workoutIndex: number,
    exerciseIndex: number,
    patch:
      Partial<Exercise>,
  ) {
    setWorkouts(
      (current) =>
        current.map(
          (
            workout,
            index,
          ) => {
            if (
              index !==
              workoutIndex
            ) {
              return workout;
            }

            return {
              ...workout,

              exercises:
                (
                  workout.exercises ??
                  []
                ).map(
                  (
                    exercise,
                    currentExerciseIndex,
                  ) =>
                    currentExerciseIndex ===
                    exerciseIndex
                      ? {
                          ...exercise,
                          ...patch,
                        }
                      : exercise,
                ),
            };
          },
        ),
    );
  }

  function removeExercise(
    workoutIndex: number,
    exerciseIndex: number,
  ) {
    setWorkouts(
      (current) =>
        current.map(
          (
            workout,
            index,
          ) => {
            if (
              index !==
              workoutIndex
            ) {
              return workout;
            }

            return {
              ...workout,

              exercises:
                (
                  workout.exercises ??
                  []
                ).filter(
                  (
                    _,
                    currentExerciseIndex,
                  ) =>
                    currentExerciseIndex !==
                    exerciseIndex,
                ),
            };
          },
        ),
    );
  }

  function addExerciseSet(
    workoutIndex: number,
    exerciseIndex: number,
  ) {
    setWorkouts(
      (current) =>
        current.map(
          (
            workout,
            index,
          ) => {
            if (
              index !==
              workoutIndex
            ) {
              return workout;
            }

            return {
              ...workout,

              exercises:
                (
                  workout.exercises ??
                  []
                ).map(
                  (
                    exercise,
                    currentExerciseIndex,
                  ) => {
                    if (
                      currentExerciseIndex !==
                      exerciseIndex
                    ) {
                      return exercise;
                    }

                    const sets =
                      exercise.sets ??
                      [];

                    return {
                      ...exercise,

                      sets: [
                        ...sets,

                        {
                          ...DEFAULT_EXERCISE_SET,

                          setNumber:
                            sets.length +
                            1,
                        },
                      ],
                    };
                  },
                ),
            };
          },
        ),
    );
  }

  function updateExerciseSet(
    workoutIndex: number,
    exerciseIndex: number,
    setIndex: number,
    patch:
      Partial<ExerciseSet>,
  ) {
    setWorkouts(
      (current) =>
        current.map(
          (
            workout,
            index,
          ) => {
            if (
              index !==
              workoutIndex
            ) {
              return workout;
            }

            return {
              ...workout,

              exercises:
                (
                  workout.exercises ??
                  []
                ).map(
                  (
                    exercise,
                    currentExerciseIndex,
                  ) => {
                    if (
                      currentExerciseIndex !==
                      exerciseIndex
                    ) {
                      return exercise;
                    }

                    return {
                      ...exercise,

                      sets:
                        (
                          exercise.sets ??
                          []
                        ).map(
                          (
                            set,
                            currentSetIndex,
                          ) =>
                            currentSetIndex ===
                            setIndex
                              ? {
                                  ...set,
                                  ...patch,
                                }
                              : set,
                        ),
                    };
                  },
                ),
            };
          },
        ),
    );
  }

  function removeExerciseSet(
    workoutIndex: number,
    exerciseIndex: number,
    setIndex: number,
  ) {
    setWorkouts(
      (current) =>
        current.map(
          (
            workout,
            index,
          ) => {
            if (
              index !==
              workoutIndex
            ) {
              return workout;
            }

            return {
              ...workout,

              exercises:
                (
                  workout.exercises ??
                  []
                ).map(
                  (
                    exercise,
                    currentExerciseIndex,
                  ) => {
                    if (
                      currentExerciseIndex !==
                      exerciseIndex
                    ) {
                      return exercise;
                    }

                    return {
                      ...exercise,

                      sets:
                        (
                          exercise.sets ??
                          []
                        )
                          .filter(
                            (
                              _,
                              currentSetIndex,
                            ) =>
                              currentSetIndex !==
                              setIndex,
                          )
                          .map(
                            (
                              set,
                              newIndex,
                            ) => ({
                              ...set,

                              setNumber:
                                newIndex +
                                1,
                            }),
                          ),
                    };
                  },
                ),
            };
          },
        ),
    );
  }

  function updateCardio(
    workoutIndex: number,
    field:
      keyof CardioData,
    value?: number,
  ) {
    const workout =
      workouts[
        workoutIndex
      ];

    if (!workout) {
      return;
    }

    updateWorkout(
      workoutIndex,
      {
        cardio: {
          ...(workout.cardio ??
            {}),

          [field]: value,
        },
      },
    );
  }

  function addPainEntry() {
    setPainEntries(
      (current) => [
        ...current,

        {
          ...DEFAULT_PAIN_ENTRY,
        },
      ],
    );
  }

  function updatePainEntry(
    index: number,
    patch:
      Partial<PainEntry>,
  ) {
    setPainEntries(
      (current) =>
        current.map(
          (
            painEntry,
            currentIndex,
          ) =>
            currentIndex ===
            index
              ? {
                  ...painEntry,
                  ...patch,
                }
              : painEntry,
        ),
    );
  }

  function removePainEntry(
    index: number,
  ) {
    setPainEntries(
      (current) =>
        current.filter(
          (
            _,
            currentIndex,
          ) =>
            currentIndex !==
            index,
        ),
    );
  }

  function buildPayload(): HealthEntryPayload {
    let wearableData: Record<
      string,
      unknown
    > = {};

    if (
      wearableDataText.trim()
    ) {
      const parsed =
        JSON.parse(
          wearableDataText,
        );

      if (
        typeof parsed !==
          "object" ||
        parsed === null ||
        Array.isArray(
          parsed,
        )
      ) {
        throw new Error(
          "Wearable data must be a valid JSON object.",
        );
      }

      wearableData =
        parsed;
    }

    const parsedDate =
      new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime(),
      )
    ) {
      throw new Error(
        "Invalid health entry date.",
      );
    }

    return {
      date:
        parsedDate.toISOString(),

      mood,

      bodyMeasurement:
        cleanObject(
          bodyMeasurement as Record<
            string,
            unknown
          >,
        ) as BodyMeasurement,

      sleep:
        cleanObject({
          ...sleep,

          sleepAt:
            toIsoDate(
              sleep.sleepAt,
            ),

          wakeAt:
            toIsoDate(
              sleep.wakeAt,
            ),
        }) as SleepData,

      recovery:
        cleanObject(
          recovery as Record<
            string,
            unknown
          >,
        ) as RecoveryData,

      workouts:
        workouts.map(
          (workout) => ({
            ...workout,

            title:
              workout.title?.trim(),

            notes:
              workout.notes?.trim(),

            startedAt:
              toIsoDate(
                workout.startedAt,
              ),

            completedAt:
              toIsoDate(
                workout.completedAt,
              ),

            exercises:
              (
                workout.exercises ??
                []
              ).map(
                (
                  exercise,
                ) => ({
                  ...exercise,

                  name:
                    exercise.name.trim(),

                  muscleGroup:
                    exercise.muscleGroup?.trim(),

                  notes:
                    exercise.notes?.trim(),

                  sets:
                    exercise.sets ??
                    [],
                }),
              ),

            cardio:
              workout.cardio
                ? (cleanObject(
                    workout.cardio as Record<
                      string,
                      unknown
                    >,
                  ) as CardioData)
                : undefined,
          }),
        ),

      nutrition: {
        ...nutrition,

        notes:
          nutrition.notes?.trim(),

        supplements:
          nutrition.supplements ??
          [],

        meals:
          nutrition.meals ??
          [],
      },

      habits,

      painEntries:
        painEntries.map(
          (
            painEntry,
          ) => ({
            ...painEntry,

            bodyPart:
              painEntry.bodyPart.trim(),

            description:
              painEntry.description?.trim(),

            trigger:
              painEntry.trigger?.trim(),

            treatment:
              painEntry.treatment?.trim(),

            startedAt:
              toIsoDate(
                painEntry.startedAt,
              ),

            resolvedAt:
              toIsoDate(
                painEntry.resolvedAt,
              ),
          }),
        ),

      steps,

      activeMinutes,

      standingHours,

      totalCaloriesBurned,

      restingCaloriesBurned,

      energyScore,

      motivationScore,

      symptoms,

      achievements,

      goals,

      notes:
        notes.trim() ||
        undefined,

      wearableData,

      isArchived,

      isActive,
    };
  }

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!date) {
      setError(
        "Date is required.",
      );

      return;
    }

    const invalidWorkout =
      workouts.findIndex(
        (workout) =>
          !workout.type ||
          (
            workout.exercises ??
            []
          ).some(
            (exercise) =>
              !exercise.name.trim(),
          ),
      );

    if (
      invalidWorkout !==
      -1
    ) {
      setError(
        `Workout ${
          invalidWorkout +
          1
        } has an invalid or empty exercise name.`,
      );

      return;
    }

    const invalidPainEntry =
      painEntries.findIndex(
        (painEntry) =>
          !painEntry.bodyPart.trim(),
      );

    if (
      invalidPainEntry !==
      -1
    ) {
      setError(
        `Pain entry ${
          invalidPainEntry +
          1
        } requires a body part.`,
      );

      return;
    }

    try {
      setSaving(true);

      setError("");

      const payload =
        buildPayload();

      if (entry?._id) {
        await updateHealthEntry(
          entry._id,
          payload,
        );
      } else {
        await createHealthEntry(
          payload,
        );
      }

      router.push(
        "/admin/health",
      );

      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof
          Error
          ? caughtError.message
          : "Unable to save health entry.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={
        handleSubmit
      }
      className="space-y-8"
    >
      {error && (
        <div className="rounded-[16px] border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <HealthFormSection
        icon={Activity}
        eyebrow="Overview"
        title="Daily health entry"
        description="Capture the date, mood and daily activity totals."
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <Field
            label="Date"
            required
          >
            <input
              type="date"
              value={date}
              required
              onChange={(
                event,
              ) =>
                setDate(
                  event
                    .target
                    .value,
                )
              }
              className={
                inputClassName
              }
            />
          </Field>

          <Field label="Mood">
            <select
              value={mood}
              onChange={(
                event,
              ) =>
                setMood(
                  event
                    .target
                    .value as HealthMood,
                )
              }
              className={
                inputClassName
              }
            >
              {HEALTH_MOODS.map(
                (
                  value,
                ) => (
                  <option
                    key={
                      value
                    }
                    value={
                      value
                    }
                  >
                    {formatLabel(
                      value,
                    )}
                  </option>
                ),
              )}
            </select>

            <div className="mt-3">
              <HealthMoodBadge
                mood={mood}
              />
            </div>
          </Field>

          <HealthMetricInput
            label="Steps"
            value={steps}
            min={0}
            step={1}
            suffix="steps"
            onChange={
              setSteps
            }
          />

          <HealthMetricInput
            label="Active Minutes"
            value={
              activeMinutes
            }
            min={0}
            suffix="min"
            onChange={
              setActiveMinutes
            }
          />

          <HealthMetricInput
            label="Standing Hours"
            value={
              standingHours
            }
            min={0}
            suffix="hours"
            onChange={
              setStandingHours
            }
          />

          <HealthMetricInput
            label="Total Calories Burned"
            value={
              totalCaloriesBurned
            }
            min={0}
            suffix="kcal"
            onChange={
              setTotalCaloriesBurned
            }
          />

          <HealthMetricInput
            label="Resting Calories Burned"
            value={
              restingCaloriesBurned
            }
            min={0}
            suffix="kcal"
            onChange={
              setRestingCaloriesBurned
            }
          />

          <HealthMetricInput
            label="Energy Score"
            value={
              energyScore
            }
            min={0}
            max={10}
            suffix="/ 10"
            onChange={
              setEnergyScore
            }
          />

          <HealthMetricInput
            label="Motivation Score"
            value={
              motivationScore
            }
            min={0}
            max={10}
            suffix="/ 10"
            onChange={
              setMotivationScore
            }
          />
        </div>
      </HealthFormSection>

      <HealthFormSection
        icon={Activity}
        eyebrow="Body"
        title="Body measurements"
        description="Track weight, body composition and circumference measurements."
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <HealthMetricInput
            label="Weight"
            value={
              bodyMeasurement.weightKg
            }
            min={0}
            step={0.1}
            suffix="kg"
            onChange={(
              value,
            ) =>
              updateBodyMeasurement(
                "weightKg",
                value,
              )
            }
          />

          <HealthMetricInput
            label="Height"
            value={
              bodyMeasurement.heightCm
            }
            min={0}
            step={0.1}
            suffix="cm"
            onChange={(
              value,
            ) =>
              updateBodyMeasurement(
                "heightCm",
                value,
              )
            }
          />

          <HealthMetricInput
            label="Body Fat"
            value={
              bodyMeasurement.bodyFatPercentage
            }
            min={0}
            step={0.1}
            suffix="%"
            onChange={(
              value,
            ) =>
              updateBodyMeasurement(
                "bodyFatPercentage",
                value,
              )
            }
          />

          <HealthMetricInput
            label="Muscle Mass"
            value={
              bodyMeasurement.muscleMassKg
            }
            min={0}
            step={0.1}
            suffix="kg"
            onChange={(
              value,
            ) =>
              updateBodyMeasurement(
                "muscleMassKg",
                value,
              )
            }
          />

          {[
            [
              "Waist",
              "waistCm",
            ],
            [
              "Chest",
              "chestCm",
            ],
            [
              "Hips",
              "hipsCm",
            ],
            [
              "Left Arm",
              "leftArmCm",
            ],
            [
              "Right Arm",
              "rightArmCm",
            ],
            [
              "Left Thigh",
              "leftThighCm",
            ],
            [
              "Right Thigh",
              "rightThighCm",
            ],
          ].map(
            ([
              label,
              field,
            ]) => (
              <HealthMetricInput
                key={
                  field
                }
                label={
                  label
                }
                value={
                  bodyMeasurement[
                    field as keyof BodyMeasurement
                  ]
                }
                min={0}
                step={
                  0.1
                }
                suffix="cm"
                onChange={(
                  value,
                ) =>
                  updateBodyMeasurement(
                    field as keyof BodyMeasurement,
                    value,
                  )
                }
              />
            ),
          )}
        </div>
      </HealthFormSection>

      <HealthFormSection
        icon={BedDouble}
        eyebrow="Sleep"
        title="Sleep data"
        description="Record duration, sleep stages, quality and naps."
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <Field label="Sleep At">
            <input
              type="datetime-local"
              value={toDateTimeLocal(
                sleep.sleepAt,
              )}
              onChange={(
                event,
              ) =>
                updateSleep(
                  "sleepAt",
                  event
                    .target
                    .value,
                )
              }
              className={
                inputClassName
              }
            />
          </Field>

          <Field label="Wake At">
            <input
              type="datetime-local"
              value={toDateTimeLocal(
                sleep.wakeAt,
              )}
              onChange={(
                event,
              ) =>
                updateSleep(
                  "wakeAt",
                  event
                    .target
                    .value,
                )
              }
              className={
                inputClassName
              }
            />
          </Field>

          <HealthMetricInput
            label="Sleep Duration"
            value={
              sleep.durationHours
            }
            min={0}
            max={24}
            step={0.1}
            suffix="hours"
            onChange={(
              value,
            ) =>
              updateSleep(
                "durationHours",
                value,
              )
            }
          />

          <HealthMetricInput
            label="Time in Bed"
            value={
              sleep.timeInBedHours
            }
            min={0}
            max={24}
            step={0.1}
            suffix="hours"
            onChange={(
              value,
            ) =>
              updateSleep(
                "timeInBedHours",
                value,
              )
            }
          />

          <HealthMetricInput
            label="Sleep Score"
            value={
              sleep.sleepScore
            }
            min={0}
            max={100}
            suffix="/ 100"
            onChange={(
              value,
            ) =>
              updateSleep(
                "sleepScore",
                value,
              )
            }
          />

          <HealthMetricInput
            label="Sleep Quality"
            value={
              sleep.sleepQuality
            }
            min={0}
            max={10}
            suffix="/ 10"
            onChange={(
              value,
            ) =>
              updateSleep(
                "sleepQuality",
                value,
              )
            }
          />

          <HealthMetricInput
            label="Light Sleep"
            value={
              sleep.lightSleepMinutes
            }
            min={0}
            suffix="min"
            onChange={(
              value,
            ) =>
              updateSleep(
                "lightSleepMinutes",
                value,
              )
            }
          />

          <HealthMetricInput
            label="Deep Sleep"
            value={
              sleep.deepSleepMinutes
            }
            min={0}
            suffix="min"
            onChange={(
              value,
            ) =>
              updateSleep(
                "deepSleepMinutes",
                value,
              )
            }
          />

          <HealthMetricInput
            label="REM Sleep"
            value={
              sleep.remSleepMinutes
            }
            min={0}
            suffix="min"
            onChange={(
              value,
            ) =>
              updateSleep(
                "remSleepMinutes",
                value,
              )
            }
          />

          <HealthMetricInput
            label="Awake Time"
            value={
              sleep.awakeMinutes
            }
            min={0}
            suffix="min"
            onChange={(
              value,
            ) =>
              updateSleep(
                "awakeMinutes",
                value,
              )
            }
          />

          <HealthMetricInput
            label="Disturbances"
            value={
              sleep.disturbances
            }
            min={0}
            onChange={(
              value,
            ) =>
              updateSleep(
                "disturbances",
                value,
              )
            }
          />

          <HealthMetricInput
            label="Sleep Need"
            value={
              sleep.sleepNeedMinutes
            }
            min={0}
            suffix="min"
            onChange={(
              value,
            ) =>
              updateSleep(
                "sleepNeedMinutes",
                value,
              )
            }
          />

          <HealthMetricInput
            label="Sleep Debt"
            value={
              sleep.sleepDebtMinutes
            }
            min={0}
            suffix="min"
            onChange={(
              value,
            ) =>
              updateSleep(
                "sleepDebtMinutes",
                value,
              )
            }
          />

          <HealthMetricInput
            label="Sleep Performance"
            value={
              sleep.sleepPerformancePercentage
            }
            min={0}
            max={100}
            suffix="%"
            onChange={(
              value,
            ) =>
              updateSleep(
                "sleepPerformancePercentage",
                value,
              )
            }
          />

          <HealthMetricInput
            label="Sleep Efficiency"
            value={
              sleep.sleepEfficiencyPercentage
            }
            min={0}
            max={100}
            suffix="%"
            onChange={(
              value,
            ) =>
              updateSleep(
                "sleepEfficiencyPercentage",
                value,
              )
            }
          />

          <HealthMetricInput
            label="Sleep Consistency"
            value={
              sleep.sleepConsistencyPercentage
            }
            min={0}
            max={100}
            suffix="%"
            onChange={(
              value,
            ) =>
              updateSleep(
                "sleepConsistencyPercentage",
                value,
              )
            }
          />

          <ToggleField
            label="Nap Taken"
            checked={
              sleep.napTaken ??
              false
            }
            onChange={(
              checked,
            ) =>
              updateSleep(
                "napTaken",
                checked,
              )
            }
          />

          {sleep.napTaken && (
            <HealthMetricInput
              label="Nap Duration"
              value={
                sleep.napMinutes
              }
              min={0}
              suffix="min"
              onChange={(
                value,
              ) =>
                updateSleep(
                  "napMinutes",
                  value,
                )
              }
            />
          )}
        </div>
      </HealthFormSection>

      <HealthFormSection
        icon={HeartPulse}
        eyebrow="Recovery"
        title="Recovery and readiness"
        description="Track cardiovascular, recovery and fatigue indicators."
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <HealthMetricInput
            label="Recovery Score"
            value={
              recovery.recoveryScore
            }
            min={0}
            max={100}
            suffix="%"
            onChange={(
              value,
            ) =>
              updateRecovery(
                "recoveryScore",
                value,
              )
            }
          />

          <HealthMetricInput
            label="Resting Heart Rate"
            value={
              recovery.restingHeartRateBpm
            }
            min={0}
            suffix="bpm"
            onChange={(
              value,
            ) =>
              updateRecovery(
                "restingHeartRateBpm",
                value,
              )
            }
          />

          <HealthMetricInput
            label="Heart Rate Variability"
            value={
              recovery.heartRateVariabilityMs
            }
            min={0}
            suffix="ms"
            onChange={(
              value,
            ) =>
              updateRecovery(
                "heartRateVariabilityMs",
                value,
              )
            }
          />

          <HealthMetricInput
            label="Respiratory Rate"
            value={
              recovery.respiratoryRateBreathsPerMinute
            }
            min={0}
            step={0.1}
            suffix="/ min"
            onChange={(
              value,
            ) =>
              updateRecovery(
                "respiratoryRateBreathsPerMinute",
                value,
              )
            }
          />

          <HealthMetricInput
            label="Blood Oxygen"
            value={
              recovery.bloodOxygenPercentage
            }
            min={0}
            max={100}
            step={0.1}
            suffix="%"
            onChange={(
              value,
            ) =>
              updateRecovery(
                "bloodOxygenPercentage",
                value,
              )
            }
          />

          <HealthMetricInput
            label="Skin Temperature"
            value={
              recovery.skinTemperatureCelsius
            }
            step={0.1}
            suffix="°C"
            onChange={(
              value,
            ) =>
              updateRecovery(
                "skinTemperatureCelsius",
                value,
              )
            }
          />

          <HealthMetricInput
            label="Skin Temp Deviation"
            value={
              recovery.skinTemperatureDeviationCelsius
            }
            step={0.1}
            suffix="°C"
            onChange={(
              value,
            ) =>
              updateRecovery(
                "skinTemperatureDeviationCelsius",
                value,
              )
            }
          />

          <HealthMetricInput
            label="VO₂ Max"
            value={
              recovery.vo2Max
            }
            min={0}
            step={0.1}
            onChange={(
              value,
            ) =>
              updateRecovery(
                "vo2Max",
                value,
              )
            }
          />

          <HealthMetricInput
            label="Fatigue Score"
            value={
              recovery.fatigueScore
            }
            min={0}
            max={10}
            suffix="/ 10"
            onChange={(
              value,
            ) =>
              updateRecovery(
                "fatigueScore",
                value,
              )
            }
          />

          <HealthMetricInput
            label="Soreness Score"
            value={
              recovery.sorenessScore
            }
            min={0}
            max={10}
            suffix="/ 10"
            onChange={(
              value,
            ) =>
              updateRecovery(
                "sorenessScore",
                value,
              )
            }
          />

          <HealthMetricInput
            label="Stress Score"
            value={
              recovery.stressScore
            }
            min={0}
            max={10}
            suffix="/ 10"
            onChange={(
              value,
            ) =>
              updateRecovery(
                "stressScore",
                value,
              )
            }
          />
        </div>
      </HealthFormSection>

      <HealthFormSection
        icon={Dumbbell}
        eyebrow="Training"
        title="Workouts"
        description={`${completedWorkouts} of ${workouts.length} workouts completed.`}
        action={
          <button
            type="button"
            onClick={
              addWorkout
            }
            className="inline-flex min-h-10 items-center gap-2 rounded-[12px] bg-[#C6FF32] px-4 text-sm font-black text-[#030608]"
          >
            <Plus className="h-4 w-4" />

            Add workout
          </button>
        }
      >
        {workouts.length ===
        0 ? (
          <EmptyBlock
            title="No workouts added"
            description="Add strength, cardio, mobility or recovery workouts."
            onClick={
              addWorkout
            }
          />
        ) : (
          <div className="space-y-5">
            {workouts.map(
              (
                workout,
                workoutIndex,
              ) => (
                <WorkoutEditor
                  key={
                    workoutIndex
                  }
                  workout={
                    workout
                  }
                  workoutIndex={
                    workoutIndex
                  }
                  onUpdate={
                    updateWorkout
                  }
                  onRemove={
                    removeWorkout
                  }
                  onAddExercise={
                    addExercise
                  }
                  onUpdateExercise={
                    updateExercise
                  }
                  onRemoveExercise={
                    removeExercise
                  }
                  onAddSet={
                    addExerciseSet
                  }
                  onUpdateSet={
                    updateExerciseSet
                  }
                  onRemoveSet={
                    removeExerciseSet
                  }
                  onUpdateCardio={
                    updateCardio
                  }
                />
              ),
            )}
          </div>
        )}
      </HealthFormSection>

      <HealthFormSection
        icon={Utensils}
        eyebrow="Nutrition"
        title="Nutrition and hydration"
        description="Track calories, macronutrients, water, meals and supplements."
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <HealthMetricInput
            label="Calories"
            value={
              nutrition.calories
            }
            min={0}
            suffix="kcal"
            onChange={(
              value,
            ) =>
              updateNutrition(
                "calories",
                value,
              )
            }
          />

          <HealthMetricInput
            label="Protein"
            value={
              nutrition.proteinGrams
            }
            min={0}
            step={0.1}
            suffix="g"
            onChange={(
              value,
            ) =>
              updateNutrition(
                "proteinGrams",
                value,
              )
            }
          />

          <HealthMetricInput
            label="Carbohydrates"
            value={
              nutrition.carbohydratesGrams
            }
            min={0}
            step={0.1}
            suffix="g"
            onChange={(
              value,
            ) =>
              updateNutrition(
                "carbohydratesGrams",
                value,
              )
            }
          />

          <HealthMetricInput
            label="Fat"
            value={
              nutrition.fatGrams
            }
            min={0}
            step={0.1}
            suffix="g"
            onChange={(
              value,
            ) =>
              updateNutrition(
                "fatGrams",
                value,
              )
            }
          />

          <HealthMetricInput
            label="Fibre"
            value={
              nutrition.fibreGrams
            }
            min={0}
            step={0.1}
            suffix="g"
            onChange={(
              value,
            ) =>
              updateNutrition(
                "fibreGrams",
                value,
              )
            }
          />

          <HealthMetricInput
            label="Sugar"
            value={
              nutrition.sugarGrams
            }
            min={0}
            step={0.1}
            suffix="g"
            onChange={(
              value,
            ) =>
              updateNutrition(
                "sugarGrams",
                value,
              )
            }
          />

          <HealthMetricInput
            label="Water"
            value={
              nutrition.waterLitres
            }
            min={0}
            step={0.1}
            suffix="L"
            onChange={(
              value,
            ) =>
              updateNutrition(
                "waterLitres",
                value,
              )
            }
          />

          <HealthMetricInput
            label="Caffeine"
            value={
              nutrition.caffeineMg
            }
            min={0}
            suffix="mg"
            onChange={(
              value,
            ) =>
              updateNutrition(
                "caffeineMg",
                value,
              )
            }
          />

          <HealthMetricInput
            label="Meal Count"
            value={
              nutrition.mealsCount
            }
            min={0}
            onChange={(
              value,
            ) =>
              updateNutrition(
                "mealsCount",
                value,
              )
            }
          />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <ToggleField
            label="Followed Meal Plan"
            checked={
              nutrition.followedMealPlan ??
              false
            }
            onChange={(
              checked,
            ) =>
              updateNutrition(
                "followedMealPlan",
                checked,
              )
            }
          />

          <ToggleField
            label="Had Alcohol"
            checked={
              nutrition.hadAlcohol ??
              false
            }
            onChange={(
              checked,
            ) =>
              updateNutrition(
                "hadAlcohol",
                checked,
              )
            }
          />

          <ToggleField
            label="Smoked"
            checked={
              nutrition.smoked ??
              false
            }
            onChange={(
              checked,
            ) =>
              updateNutrition(
                "smoked",
                checked,
              )
            }
          />
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-2">
          <HealthStringListEditor
            title="Meals"
            description="Record meals consumed during the day."
            placeholder="Add meal..."
            values={
              nutrition.meals ??
              []
            }
            onChange={(
              values,
            ) =>
              updateNutrition(
                "meals",
                values,
              )
            }
          />

          <HealthStringListEditor
            title="Supplements"
            description="Record supplements taken."
            placeholder="Add supplement..."
            values={
              nutrition.supplements ??
              []
            }
            onChange={(
              values,
            ) =>
              updateNutrition(
                "supplements",
                values,
              )
            }
          />
        </div>

        <div className="mt-6">
          <Field label="Nutrition Notes">
            <textarea
              value={
                nutrition.notes ??
                ""
              }
              onChange={(
                event,
              ) =>
                updateNutrition(
                  "notes",
                  event
                    .target
                    .value,
                )
              }
              placeholder="Add nutrition notes..."
              className={
                textareaClassName
              }
            />
          </Field>
        </div>
      </HealthFormSection>

      <HealthFormSection
        icon={Check}
        eyebrow="Habits"
        title="Daily habits"
        description="Track daily habits using the current Health habit model."
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {DEFAULT_HABITS.map(
            ({
              key,
              label,
            }) => {
              const habit =
                habits.find(
                  (
                    item,
                  ) =>
                    item.key ===
                    key,
                );

              return (
                <ToggleField
                  key={
                    key
                  }
                  label={
                    label
                  }
                  checked={
                    habit?.completed ??
                    false
                  }
                  onChange={() =>
                    toggleHabit(
                      key,
                      label,
                    )
                  }
                />
              );
            },
          )}
        </div>

        {habits.length >
          0 && (
          <div className="mt-6 rounded-[18px] border border-white/[0.07] bg-[#05090b] p-5">
            <p className="text-xs font-black uppercase tracking-[0.18em] text-white/30">
              Tracked habits
            </p>

            <div className="mt-4 flex flex-wrap gap-2">
              {habits.map(
                (
                  habit,
                ) => (
                  <span
                    key={
                      habit.key
                    }
                    className={[
                      "rounded-full border px-3 py-1.5 text-xs font-bold",

                      habit.completed
                        ? "border-[#C6FF32]/20 bg-[#C6FF32]/10 text-[#C6FF32]"
                        : "border-white/10 bg-white/[0.03] text-white/35",
                    ].join(
                      " ",
                    )}
                  >
                    {
                      habit.label
                    }
                  </span>
                ),
              )}
            </div>
          </div>
        )}
      </HealthFormSection>

      <HealthFormSection
        icon={HeartPulse}
        eyebrow="Pain"
        title="Pain and injuries"
        description="Track pain location, severity, causes and treatment."
        action={
          <button
            type="button"
            onClick={
              addPainEntry
            }
            className="inline-flex min-h-10 items-center gap-2 rounded-[12px] bg-[#C6FF32] px-4 text-sm font-black text-[#030608]"
          >
            <Plus className="h-4 w-4" />

            Add pain entry
          </button>
        }
      >
        {painEntries.length ===
        0 ? (
          <EmptyBlock
            title="No pain entries"
            description="No pain or injury has been recorded for this day."
            onClick={
              addPainEntry
            }
          />
        ) : (
          <div className="space-y-5">
            {painEntries.map(
              (
                painEntry,
                index,
              ) => (
                <PainEntryEditor
                  key={
                    index
                  }
                  painEntry={
                    painEntry
                  }
                  index={
                    index
                  }
                  onUpdate={
                    updatePainEntry
                  }
                  onRemove={
                    removePainEntry
                  }
                />
              ),
            )}
          </div>
        )}
      </HealthFormSection>

      <HealthFormSection
        icon={Brain}
        eyebrow="Reflection"
        title="Symptoms, achievements and goals"
      >
        <div className="grid gap-5 xl:grid-cols-3">
          <HealthStringListEditor
            title="Symptoms"
            values={
              symptoms
            }
            onChange={
              setSymptoms
            }
          />

          <HealthStringListEditor
            title="Achievements"
            values={
              achievements
            }
            onChange={
              setAchievements
            }
          />

          <HealthStringListEditor
            title="Goals"
            values={goals}
            onChange={
              setGoals
            }
          />
        </div>
      </HealthFormSection>

      <HealthFormSection
        icon={Activity}
        eyebrow="Additional data"
        title="Notes and wearable data"
      >
        <div className="grid gap-6 xl:grid-cols-2">
          <Field label="Notes">
            <textarea
              value={notes}
              onChange={(
                event,
              ) =>
                setNotes(
                  event
                    .target
                    .value,
                )
              }
              placeholder="Add general health notes..."
              className="min-h-56 w-full resize-y rounded-[14px] border border-white/10 bg-[#05090b] px-4 py-3 font-sans text-sm leading-6 text-white outline-none transition placeholder:text-white/25 focus:border-[#C6FF32]/40"
            />
          </Field>

          <Field
            label="Wearable Data"
            description="Enter a valid JSON object."
          >
            <textarea
              value={
                wearableDataText
              }
              onChange={(
                event,
              ) =>
                setWearableDataText(
                  event
                    .target
                    .value,
                )
              }
              spellCheck={
                false
              }
              className="min-h-56 w-full resize-y rounded-[14px] border border-white/10 bg-[#05090b] px-4 py-3 font-mono text-xs leading-6 text-white outline-none transition focus:border-[#C6FF32]/40"
            />
          </Field>
        </div>
      </HealthFormSection>

      <HealthFormSection
        icon={Check}
        eyebrow="Entry state"
        title="Visibility and status"
      >
        <div className="grid gap-4 md:grid-cols-2">
          <ToggleField
            label="Active"
            description="Keep this health entry active."
            checked={
              isActive
            }
            onChange={
              setIsActive
            }
          />

          <ToggleField
            label="Archived"
            description="Hide this entry from the default active view."
            checked={
              isArchived
            }
            onChange={
              setIsArchived
            }
          />
        </div>
      </HealthFormSection>

      <AdminFormFooter
        saving={saving}
        isEditMode={
          isEditMode
        }
        createLabel="Create Record"
        updateLabel="Save Record"
      />
    </form>
  );
}

type HealthFormSectionProps = {
  icon: React.ComponentType<{
    className?: string;
  }>;

  eyebrow: string;

  title: string;

  description?: string;

  action?: React.ReactNode;

  children:
    React.ReactNode;
};

function HealthFormSection({
  icon: Icon,
  eyebrow,
  title,
  description,
  action,
  children,
}: HealthFormSectionProps) {
  return (
    <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5 sm:p-6">
      <div className="flex flex-col gap-4 border-b border-white/[0.07] pb-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-start gap-4">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[14px] bg-[#C6FF32]/10 text-[#C6FF32]">
            <Icon className="h-5 w-5" />
          </div>

          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C6FF32]">
              {eyebrow}
            </p>

            <h2 className="mt-1 text-xl font-black text-white">
              {title}
            </h2>

            {description && (
              <p className="mt-2 max-w-2xl text-sm leading-6 text-white/35">
                {
                  description
                }
              </p>
            )}
          </div>
        </div>

        {action}
      </div>

      <div className="mt-6">
        {children}
      </div>
    </section>
  );
}

type FieldProps = {
  label: string;

  description?: string;

  required?: boolean;

  children:
    React.ReactNode;
};

function Field({
  label,
  description,
  required,
  children,
}: FieldProps) {
  return (
    <label className="block">
      <span className="text-sm font-semibold text-white">
        {label}

        {required && (
          <span className="ml-1 text-red-300">
            *
          </span>
        )}
      </span>

      {description && (
        <span className="mt-1 block text-xs text-white/35">
          {description}
        </span>
      )}

      <div className="mt-2">
        {children}
      </div>
    </label>
  );
}

type ToggleFieldProps = {
  label: string;

  description?: string;

  checked: boolean;

  onChange: (
    checked: boolean,
  ) => void;
};

function ToggleField({
  label,
  description,
  checked,
  onChange,
}: ToggleFieldProps) {
  return (
    <button
      type="button"
      onClick={() =>
        onChange(
          !checked,
        )
      }
      aria-pressed={
        checked
      }
      className={[
        "flex min-h-16 w-full items-center justify-between gap-4 rounded-[16px] border p-4 text-left transition",

        checked
          ? "border-[#C6FF32]/30 bg-[#C6FF32]/10"
          : "border-white/10 bg-[#05090b] hover:border-white/20",
      ].join(" ")}
    >
      <span>
        <span
          className={[
            "block text-sm font-bold",

            checked
              ? "text-[#C6FF32]"
              : "text-white/65",
          ].join(" ")}
        >
          {label}
        </span>

        {description && (
          <span className="mt-1 block text-xs leading-5 text-white/30">
            {
              description
            }
          </span>
        )}
      </span>

      <span
        className={[
          "relative h-6 w-11 shrink-0 rounded-full transition",

          checked
            ? "bg-[#C6FF32]"
            : "bg-white/10",
        ].join(" ")}
      >
        <span
          className={[
            "absolute top-1 h-4 w-4 rounded-full bg-[#030608] transition",

            checked
              ? "left-6"
              : "left-1",
          ].join(" ")}
        />
      </span>
    </button>
  );
}

type EmptyBlockProps = {
  title: string;

  description: string;

  onClick: () => void;
};

function EmptyBlock({
  title,
  description,
  onClick,
}: EmptyBlockProps) {
  return (
    <div className="rounded-[18px] border border-dashed border-white/10 bg-[#05090b] px-6 py-12 text-center">
      <h3 className="text-base font-black text-white">
        {title}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/35">
        {description}
      </p>

      <button
        type="button"
        onClick={
          onClick
        }
        className="mt-5 inline-flex min-h-10 items-center gap-2 rounded-[12px] border border-white/10 px-4 text-sm font-bold text-white/60 transition hover:border-[#C6FF32]/30 hover:text-[#C6FF32]"
      >
        <Plus className="h-4 w-4" />

        Add item
      </button>
    </div>
  );
}

type WorkoutEditorProps = {
  workout:
    WorkoutData;

  workoutIndex:
    number;

  onUpdate: (
    index: number,
    patch:
      Partial<WorkoutData>,
  ) => void;

  onRemove: (
    index: number,
  ) => void;

  onAddExercise: (
    workoutIndex: number,
  ) => void;

  onUpdateExercise: (
    workoutIndex: number,
    exerciseIndex: number,
    patch:
      Partial<Exercise>,
  ) => void;

  onRemoveExercise: (
    workoutIndex: number,
    exerciseIndex: number,
  ) => void;

  onAddSet: (
    workoutIndex: number,
    exerciseIndex: number,
  ) => void;

  onUpdateSet: (
    workoutIndex: number,
    exerciseIndex: number,
    setIndex: number,
    patch:
      Partial<ExerciseSet>,
  ) => void;

  onRemoveSet: (
    workoutIndex: number,
    exerciseIndex: number,
    setIndex: number,
  ) => void;

  onUpdateCardio: (
    workoutIndex: number,
    field:
      keyof CardioData,
    value?: number,
  ) => void;
};

function WorkoutEditor({
  workout,
  workoutIndex,
  onUpdate,
  onRemove,
  onAddExercise,
  onUpdateExercise,
  onRemoveExercise,
  onAddSet,
  onUpdateSet,
  onRemoveSet,
  onUpdateCardio,
}: WorkoutEditorProps) {
  const showCardio =
    CARDIO_WORKOUT_TYPES.includes(
      workout.type,
    ) ||
    Boolean(
      workout.cardio,
    );

  const exercises =
    workout.exercises ??
    [];

  return (
    <div className="rounded-[20px] border border-white/10 bg-[#05090b] p-5">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.16em] text-[#C6FF32]">
            Workout{" "}
            {workoutIndex +
              1}
          </p>

          <h3 className="mt-1 text-lg font-black text-white">
            {workout.title ||
              formatLabel(
                workout.type,
              )}
          </h3>
        </div>

        <button
          type="button"
          onClick={() =>
            onRemove(
              workoutIndex,
            )
          }
          className="grid h-10 w-10 place-items-center rounded-[12px] text-white/30 transition hover:bg-red-400/10 hover:text-red-300"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <Field
          label="Workout Type"
          required
        >
          <select
            value={
              workout.type
            }
            onChange={(
              event,
            ) =>
              onUpdate(
                workoutIndex,
                {
                  type: event
                    .target
                    .value as WorkoutType,
                },
              )
            }
            className={
              inputClassName
            }
          >
            {WORKOUT_TYPES.map(
              (
                value,
              ) => (
                <option
                  key={
                    value
                  }
                  value={
                    value
                  }
                >
                  {formatLabel(
                    value,
                  )}
                </option>
              ),
            )}
          </select>
        </Field>

        <Field label="Title">
          <input
            value={
              workout.title ??
              ""
            }
            onChange={(
              event,
            ) =>
              onUpdate(
                workoutIndex,
                {
                  title:
                    event
                      .target
                      .value,
                },
              )
            }
            className={
              inputClassName
            }
            placeholder="Push day..."
          />
        </Field>

        <Field label="Intensity">
          <select
            value={
              workout.intensity
            }
            onChange={(
              event,
            ) =>
              onUpdate(
                workoutIndex,
                {
                  intensity:
                    event
                      .target
                      .value as WorkoutIntensity,
                },
              )
            }
            className={
              inputClassName
            }
          >
            {WORKOUT_INTENSITIES.map(
              (
                value,
              ) => (
                <option
                  key={
                    value
                  }
                  value={
                    value
                  }
                >
                  {formatLabel(
                    value,
                  )}
                </option>
              ),
            )}
          </select>
        </Field>

        <ToggleField
          label="Completed"
          checked={
            workout.completed
          }
          onChange={(
            checked,
          ) =>
            onUpdate(
              workoutIndex,
              {
                completed:
                  checked,
              },
            )
          }
        />

        <HealthMetricInput
          label="Duration"
          value={
            workout.durationMinutes
          }
          min={0}
          suffix="min"
          onChange={(
            value,
          ) =>
            onUpdate(
              workoutIndex,
              {
                durationMinutes:
                  value,
              },
            )
          }
        />

        <HealthMetricInput
          label="Calories Burned"
          value={
            workout.caloriesBurned
          }
          min={0}
          suffix="kcal"
          onChange={(
            value,
          ) =>
            onUpdate(
              workoutIndex,
              {
                caloriesBurned:
                  value,
              },
            )
          }
        />

        <HealthMetricInput
          label="Average Heart Rate"
          value={
            workout.averageHeartRateBpm
          }
          min={0}
          suffix="bpm"
          onChange={(
            value,
          ) =>
            onUpdate(
              workoutIndex,
              {
                averageHeartRateBpm:
                  value,
              },
            )
          }
        />

        <HealthMetricInput
          label="Maximum Heart Rate"
          value={
            workout.maximumHeartRateBpm
          }
          min={0}
          suffix="bpm"
          onChange={(
            value,
          ) =>
            onUpdate(
              workoutIndex,
              {
                maximumHeartRateBpm:
                  value,
              },
            )
          }
        />

        <HealthMetricInput
          label="Strain Score"
          value={
            workout.strainScore
          }
          min={0}
          onChange={(
            value,
          ) =>
            onUpdate(
              workoutIndex,
              {
                strainScore:
                  value,
              },
            )
          }
        />

        <HealthMetricInput
          label="Perceived Exertion"
          value={
            workout.perceivedExertion
          }
          min={0}
          max={10}
          suffix="/ 10"
          onChange={(
            value,
          ) =>
            onUpdate(
              workoutIndex,
              {
                perceivedExertion:
                  value,
              },
            )
          }
        />

        <Field label="Started At">
          <input
            type="datetime-local"
            value={toDateTimeLocal(
              workout.startedAt,
            )}
            onChange={(
              event,
            ) =>
              onUpdate(
                workoutIndex,
                {
                  startedAt:
                    event
                      .target
                      .value,
                },
              )
            }
            className={
              inputClassName
            }
          />
        </Field>

        <Field label="Completed At">
          <input
            type="datetime-local"
            value={toDateTimeLocal(
              workout.completedAt,
            )}
            onChange={(
              event,
            ) =>
              onUpdate(
                workoutIndex,
                {
                  completedAt:
                    event
                      .target
                      .value,
                },
              )
            }
            className={
              inputClassName
            }
          />
        </Field>
      </div>

      {showCardio && (
        <div className="mt-6 rounded-[18px] border border-white/[0.07] p-5">
          <h4 className="text-sm font-black text-white">
            Cardio Data
          </h4>

          <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {[
              [
                "Distance",
                "distanceKm",
                "km",
              ],
              [
                "Duration",
                "durationMinutes",
                "min",
              ],
              [
                "Average Heart Rate",
                "averageHeartRateBpm",
                "bpm",
              ],
              [
                "Maximum Heart Rate",
                "maximumHeartRateBpm",
                "bpm",
              ],
              [
                "Average Speed",
                "averageSpeedKmph",
                "km/h",
              ],
              [
                "Average Pace",
                "averagePaceMinutesPerKm",
                "min/km",
              ],
              [
                "Calories Burned",
                "caloriesBurned",
                "kcal",
              ],
              [
                "Elevation Gain",
                "elevationGainMetres",
                "m",
              ],
            ].map(
              ([
                label,
                field,
                suffix,
              ]) => (
                <HealthMetricInput
                  key={
                    field
                  }
                  label={
                    label
                  }
                  value={
                    workout.cardio?.[
                      field as keyof CardioData
                    ]
                  }
                  min={0}
                  step={
                    0.1
                  }
                  suffix={
                    suffix
                  }
                  onChange={(
                    value,
                  ) =>
                    onUpdateCardio(
                      workoutIndex,
                      field as keyof CardioData,
                      value,
                    )
                  }
                />
              ),
            )}
          </div>
        </div>
      )}

      <div className="mt-6">
        <div className="flex items-center justify-between gap-4">
          <h4 className="text-sm font-black text-white">
            Exercises
          </h4>

          <button
            type="button"
            onClick={() =>
              onAddExercise(
                workoutIndex,
              )
            }
            className="inline-flex min-h-9 items-center gap-2 rounded-[11px] border border-white/10 px-3 text-xs font-bold text-white/60 transition hover:border-[#C6FF32]/30 hover:text-[#C6FF32]"
          >
            <Plus className="h-3.5 w-3.5" />

            Add exercise
          </button>
        </div>

        {exercises.length >
          0 && (
          <div className="mt-4 space-y-4">
            {exercises.map(
              (
                exercise,
                exerciseIndex,
              ) => (
                <ExerciseEditor
                  key={
                    exerciseIndex
                  }
                  exercise={
                    exercise
                  }
                  workoutIndex={
                    workoutIndex
                  }
                  exerciseIndex={
                    exerciseIndex
                  }
                  onUpdate={
                    onUpdateExercise
                  }
                  onRemove={
                    onRemoveExercise
                  }
                  onAddSet={
                    onAddSet
                  }
                  onUpdateSet={
                    onUpdateSet
                  }
                  onRemoveSet={
                    onRemoveSet
                  }
                />
              ),
            )}
          </div>
        )}
      </div>

      <div className="mt-6">
        <Field label="Workout Notes">
          <textarea
            value={
              workout.notes ??
              ""
            }
            onChange={(
              event,
            ) =>
              onUpdate(
                workoutIndex,
                {
                  notes:
                    event
                      .target
                      .value,
                },
              )
            }
            className={
              textareaClassName
            }
            placeholder="Workout notes..."
          />
        </Field>
      </div>
    </div>
  );
}

type ExerciseEditorProps = {
  exercise:
    Exercise;

  workoutIndex:
    number;

  exerciseIndex:
    number;

  onUpdate: (
    workoutIndex: number,
    exerciseIndex: number,
    patch:
      Partial<Exercise>,
  ) => void;

  onRemove: (
    workoutIndex: number,
    exerciseIndex: number,
  ) => void;

  onAddSet: (
    workoutIndex: number,
    exerciseIndex: number,
  ) => void;

  onUpdateSet: (
    workoutIndex: number,
    exerciseIndex: number,
    setIndex: number,
    patch:
      Partial<ExerciseSet>,
  ) => void;

  onRemoveSet: (
    workoutIndex: number,
    exerciseIndex: number,
    setIndex: number,
  ) => void;
};

function ExerciseEditor({
  exercise,
  workoutIndex,
  exerciseIndex,
  onUpdate,
  onRemove,
  onAddSet,
  onUpdateSet,
  onRemoveSet,
}: ExerciseEditorProps) {
  const sets =
    exercise.sets ?? [];

  return (
    <div className="rounded-[16px] border border-white/[0.07] bg-white/[0.02] p-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-black uppercase tracking-[0.15em] text-white/30">
          Exercise{" "}
          {exerciseIndex +
            1}
        </p>

        <button
          type="button"
          onClick={() =>
            onRemove(
              workoutIndex,
              exerciseIndex,
            )
          }
          className="text-white/25 transition hover:text-red-300"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-2">
        <Field
          label="Exercise Name"
          required
        >
          <input
            value={
              exercise.name
            }
            onChange={(
              event,
            ) =>
              onUpdate(
                workoutIndex,
                exerciseIndex,
                {
                  name:
                    event
                      .target
                      .value,
                },
              )
            }
            className={
              inputClassName
            }
            placeholder="Bench press"
          />
        </Field>

        <Field label="Muscle Group">
          <input
            value={
              exercise.muscleGroup ??
              ""
            }
            onChange={(
              event,
            ) =>
              onUpdate(
                workoutIndex,
                exerciseIndex,
                {
                  muscleGroup:
                    event
                      .target
                      .value,
                },
              )
            }
            className={
              inputClassName
            }
            placeholder="Chest"
          />
        </Field>
      </div>

      <div className="mt-5 flex items-center justify-between">
        <h5 className="text-sm font-bold text-white">
          Sets
        </h5>

        <button
          type="button"
          onClick={() =>
            onAddSet(
              workoutIndex,
              exerciseIndex,
            )
          }
          className="inline-flex items-center gap-2 text-xs font-bold text-[#C6FF32]"
        >
          <Plus className="h-3.5 w-3.5" />

          Add set
        </button>
      </div>

      {sets.length >
        0 && (
        <div className="mt-4 space-y-3">
          {sets.map(
            (
              set,
              setIndex,
            ) => (
              <ExerciseSetEditor
                key={
                  setIndex
                }
                set={
                  set
                }
                setIndex={
                  setIndex
                }
                onUpdate={(
                  patch,
                ) =>
                  onUpdateSet(
                    workoutIndex,
                    exerciseIndex,
                    setIndex,
                    patch,
                  )
                }
                onRemove={() =>
                  onRemoveSet(
                    workoutIndex,
                    exerciseIndex,
                    setIndex,
                  )
                }
              />
            ),
          )}
        </div>
      )}

      <div className="mt-4">
        <Field label="Exercise Notes">
          <textarea
            value={
              exercise.notes ??
              ""
            }
            onChange={(
              event,
            ) =>
              onUpdate(
                workoutIndex,
                exerciseIndex,
                {
                  notes:
                    event
                      .target
                      .value,
                },
              )
            }
            className={
              textareaClassName
            }
          />
        </Field>
      </div>
    </div>
  );
}

type ExerciseSetEditorProps = {
  set: ExerciseSet;

  setIndex: number;

  onUpdate: (
    patch:
      Partial<ExerciseSet>,
  ) => void;

  onRemove:
    () => void;
};

function ExerciseSetEditor({
  set,
  setIndex,
  onUpdate,
  onRemove,
}: ExerciseSetEditorProps) {
  return (
    <div className="grid gap-3 rounded-[14px] border border-white/[0.06] p-3 sm:grid-cols-2 xl:grid-cols-7">
      <HealthMetricInput
        label="Set"
        value={
          set.setNumber
        }
        min={1}
        onChange={(
          value,
        ) =>
          onUpdate({
            setNumber:
              value ??
              setIndex +
                1,
          })
        }
      />

      <HealthMetricInput
        label="Reps"
        value={
          set.repetitions
        }
        min={0}
        onChange={(
          value,
        ) =>
          onUpdate({
            repetitions:
              value,
          })
        }
      />

      <HealthMetricInput
        label="Weight"
        value={
          set.weightKg
        }
        min={0}
        step={0.1}
        suffix="kg"
        onChange={(
          value,
        ) =>
          onUpdate({
            weightKg:
              value,
          })
        }
      />

      <HealthMetricInput
        label="Duration"
        value={
          set.durationSeconds
        }
        min={0}
        suffix="sec"
        onChange={(
          value,
        ) =>
          onUpdate({
            durationSeconds:
              value,
          })
        }
      />

      <HealthMetricInput
        label="Distance"
        value={
          set.distanceMetres
        }
        min={0}
        suffix="m"
        onChange={(
          value,
        ) =>
          onUpdate({
            distanceMetres:
              value,
          })
        }
      />

      <HealthMetricInput
        label="RPE"
        value={
          set.perceivedExertion
        }
        min={0}
        max={10}
        onChange={(
          value,
        ) =>
          onUpdate({
            perceivedExertion:
              value,
          })
        }
      />

      <div className="flex items-end gap-2">
        <button
          type="button"
          onClick={() =>
            onUpdate({
              completed:
                !set.completed,
            })
          }
          className={[
            "min-h-11 flex-1 rounded-[12px] border text-xs font-bold transition",

            set.completed
              ? "border-[#C6FF32]/30 bg-[#C6FF32]/10 text-[#C6FF32]"
              : "border-white/10 text-white/40",
          ].join(" ")}
        >
          {set.completed
            ? "Completed"
            : "Pending"}
        </button>

        <button
          type="button"
          onClick={
            onRemove
          }
          className="grid h-11 w-11 place-items-center rounded-[12px] border border-white/10 text-white/25 transition hover:border-red-400/20 hover:text-red-300"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

type PainEntryEditorProps = {
  painEntry:
    PainEntry;

  index: number;

  onUpdate: (
    index: number,
    patch:
      Partial<PainEntry>,
  ) => void;

  onRemove: (
    index: number,
  ) => void;
};

function PainEntryEditor({
  painEntry,
  index,
  onUpdate,
  onRemove,
}: PainEntryEditorProps) {
  return (
    <div className="rounded-[18px] border border-white/10 bg-[#05090b] p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-black uppercase tracking-[0.15em] text-red-300">
          Pain entry{" "}
          {index + 1}
        </p>

        <button
          type="button"
          onClick={() =>
            onRemove(
              index,
            )
          }
          className="text-white/25 transition hover:text-red-300"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        <Field
          label="Body Part"
          required
        >
          <input
            value={
              painEntry.bodyPart
            }
            onChange={(
              event,
            ) =>
              onUpdate(
                index,
                {
                  bodyPart:
                    event
                      .target
                      .value,
                },
              )
            }
            className={
              inputClassName
            }
            placeholder="Left knee"
          />
        </Field>

        <Field label="Severity">
          <select
            value={
              painEntry.severity
            }
            onChange={(
              event,
            ) =>
              onUpdate(
                index,
                {
                  severity:
                    event
                      .target
                      .value as PainSeverity,
                },
              )
            }
            className={
              inputClassName
            }
          >
            {PAIN_SEVERITIES.map(
              (
                value,
              ) => (
                <option
                  key={
                    value
                  }
                  value={
                    value
                  }
                >
                  {formatLabel(
                    value,
                  )}
                </option>
              ),
            )}
          </select>
        </Field>

        <HealthMetricInput
          label="Pain Score"
          value={
            painEntry.painScore
          }
          min={0}
          max={10}
          suffix="/ 10"
          onChange={(
            value,
          ) =>
            onUpdate(
              index,
              {
                painScore:
                  value,
              },
            )
          }
        />

        <ToggleField
          label="Resolved"
          checked={
            painEntry.resolved ??
            false
          }
          onChange={(
            checked,
          ) =>
            onUpdate(
              index,
              {
                resolved:
                  checked,
              },
            )
          }
        />
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <Field label="Started At">
          <input
            type="datetime-local"
            value={toDateTimeLocal(
              painEntry.startedAt,
            )}
            onChange={(
              event,
            ) =>
              onUpdate(
                index,
                {
                  startedAt:
                    event
                      .target
                      .value,
                },
              )
            }
            className={
              inputClassName
            }
          />
        </Field>

        <Field label="Resolved At">
          <input
            type="datetime-local"
            value={toDateTimeLocal(
              painEntry.resolvedAt,
            )}
            onChange={(
              event,
            ) =>
              onUpdate(
                index,
                {
                  resolvedAt:
                    event
                      .target
                      .value,
                },
              )
            }
            className={
              inputClassName
            }
          />
        </Field>

        <Field label="Description">
          <textarea
            value={
              painEntry.description ??
              ""
            }
            onChange={(
              event,
            ) =>
              onUpdate(
                index,
                {
                  description:
                    event
                      .target
                      .value,
                },
              )
            }
            className={
              textareaClassName
            }
          />
        </Field>

        <Field label="Trigger">
          <textarea
            value={
              painEntry.trigger ??
              ""
            }
            onChange={(
              event,
            ) =>
              onUpdate(
                index,
                {
                  trigger:
                    event
                      .target
                      .value,
                },
              )
            }
            className={
              textareaClassName
            }
          />
        </Field>

        <Field label="Treatment">
          <textarea
            value={
              painEntry.treatment ??
              ""
            }
            onChange={(
              event,
            ) =>
              onUpdate(
                index,
                {
                  treatment:
                    event
                      .target
                      .value,
                },
              )
            }
            className={
              textareaClassName
            }
          />
        </Field>
      </div>
    </div>
  );
}