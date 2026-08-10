import type {
  HealthEntry,
  HealthMood,
  PainSeverity,
  WorkoutData,
  WorkoutIntensity,
  WorkoutType,
} from "@/types/health";

export interface HealthMetric {
  label: string;
  value: string;
  detail?: string;
}

export interface HabitItem {
  label: string;
  completed: boolean;
}

export function formatHealthDate(
  value?: string,
): string {
  if (!value) {
    return "Not available";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Not available";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatTime(
  value?: string,
): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function formatNumber(
  value?: number,
  unit = "",
): string {
  if (typeof value !== "number") {
    return "—";
  }

  return unit
    ? `${value} ${unit}`
    : String(value);
}

export function formatScore(
  value?: number,
  maximum = 10,
): string {
  return typeof value === "number"
    ? `${value}/${maximum}`
    : "—";
}

export function formatPercentage(
  value?: number,
): string {
  return typeof value === "number"
    ? `${value}%`
    : "—";
}

export function formatSteps(
  value?: number,
): string {
  return typeof value === "number"
    ? value.toLocaleString("en-IN")
    : "—";
}

export function formatDuration(
  value?: number,
): string {
  return typeof value === "number"
    ? `${value} min`
    : "—";
}

export function formatHours(
  value?: number,
): string {
  return typeof value === "number"
    ? `${value} hrs`
    : "—";
}

export function formatMood(
  mood: HealthMood,
): string {
  const labels: Record<
    HealthMood,
    string
  > = {
    excellent: "Excellent",
    good: "Good",
    neutral: "Neutral",
    low: "Low",
    poor: "Poor",
  };

  return labels[mood];
}

export function formatWorkoutType(
  type: WorkoutType,
): string {
  const labels: Record<
    WorkoutType,
    string
  > = {
    push: "Push",
    pull: "Pull",
    legs: "Legs",
    full_body: "Full Body",
    walk: "Walk",
    run: "Run",
    cycling: "Cycling",
    swimming: "Swimming",
    sports: "Sports",
    mobility: "Mobility",
    yoga: "Yoga",
    abs: "Abs",
    rest: "Rest",
    other: "Other",
  };

  return labels[type];
}

export function formatWorkoutIntensity(
  intensity: WorkoutIntensity,
): string {
  const labels: Record<
    WorkoutIntensity,
    string
  > = {
    low: "Low intensity",
    moderate: "Moderate intensity",
    high: "High intensity",
  };

  return labels[intensity];
}

export function formatPainSeverity(
  severity: PainSeverity,
): string {
  const labels: Record<
    PainSeverity,
    string
  > = {
    none: "None",
    mild: "Mild",
    moderate: "Moderate",
    severe: "Severe",
  };

  return labels[severity];
}

export function getWorkoutTitle(
  workout: WorkoutData,
): string {
  return workout.title?.trim()
    ? workout.title
    : formatWorkoutType(
        workout.type,
      );
}

export function getCompletedSets(
  workout: WorkoutData,
): number {
  return (
    workout.exercises ?? []
  ).reduce(
    (total, exercise) =>
      total +
      (
        exercise.sets ?? []
      ).filter(
        (set) =>
          set.completed === true,
      ).length,
    0,
  );
}

export function getTotalSets(
  workout: WorkoutData,
): number {
  return (
    workout.exercises ?? []
  ).reduce(
    (total, exercise) =>
      total +
      (
        exercise.sets ?? []
      ).length,
    0,
  );
}

export function getHabitItems(
  entry: HealthEntry,
): HabitItem[] {
  return (
    entry.habits ?? []
  ).map((habit) => ({
    label: habit.label,
    completed:
      habit.completed,
  }));
}

export function getActivePainEntries(
  entry: HealthEntry,
) {
  return (
    entry.painEntries ?? []
  ).filter(
    (pain) =>
      pain.resolved !== true,
  );
}

export function getPrimaryMetrics(
  entry: HealthEntry,
): HealthMetric[] {
  return [
    {
      label: "Mood",
      value: formatMood(
        entry.mood,
      ),
    },
    {
      label: "Recovery",
      value: formatPercentage(
        entry.recovery
          ?.recoveryScore,
      ),
    },
    {
      label: "Energy",
      value: formatScore(
        entry.energyScore,
      ),
    },
    {
      label: "Motivation",
      value: formatScore(
        entry.motivationScore,
      ),
    },
    {
      label: "Sleep",
      value: formatHours(
        entry.sleep
          ?.durationHours,
      ),
      detail:
        typeof entry.sleep
          ?.sleepScore ===
        "number"
          ? `Sleep score ${entry.sleep.sleepScore}/100`
          : undefined,
    },
    {
      label: "Steps",
      value: formatSteps(
        entry.steps,
      ),
    },
    {
      label: "Active minutes",
      value: formatDuration(
        entry.activeMinutes,
      ),
    },
    {
      label: "Calories burned",
      value:
        typeof entry
          .totalCaloriesBurned ===
        "number"
          ? `${entry.totalCaloriesBurned.toLocaleString(
              "en-IN",
            )} kcal`
          : "—",
    },
  ];
}

export function getBodyMetrics(
  entry: HealthEntry,
): HealthMetric[] {
  const body =
    entry.bodyMeasurement;

  return [
    {
      label: "Weight",
      value: formatNumber(
        body?.weightKg,
        "kg",
      ),
    },
    {
      label: "Height",
      value: formatNumber(
        body?.heightCm,
        "cm",
      ),
    },
    {
      label: "Body fat",
      value: formatPercentage(
        body?.bodyFatPercentage,
      ),
    },
    {
      label: "Muscle mass",
      value: formatNumber(
        body?.muscleMassKg,
        "kg",
      ),
    },
    {
      label: "Waist",
      value: formatNumber(
        body?.waistCm,
        "cm",
      ),
    },
    {
      label: "Chest",
      value: formatNumber(
        body?.chestCm,
        "cm",
      ),
    },
    {
      label: "Hips",
      value: formatNumber(
        body?.hipsCm,
        "cm",
      ),
    },
    {
      label: "VO₂ max",
      value: formatNumber(
        entry.recovery
          ?.vo2Max,
      ),
      detail:
        typeof entry
          .recovery
          ?.vo2Max ===
        "number"
          ? "ml/kg/min"
          : undefined,
    },
  ];
}

export function getSleepMetrics(
  entry: HealthEntry,
): HealthMetric[] {
  const sleep =
    entry.sleep;

  return [
    {
      label: "Duration",
      value: formatHours(
        sleep?.durationHours,
      ),
    },
    {
      label: "Time in bed",
      value: formatHours(
        sleep?.timeInBedHours,
      ),
    },
    {
      label: "Sleep score",
      value: formatScore(
        sleep?.sleepScore,
        100,
      ),
    },
    {
      label: "Sleep quality",
      value: formatScore(
        sleep?.sleepQuality,
      ),
    },
    {
      label: "Deep sleep",
      value: formatDuration(
        sleep?.deepSleepMinutes,
      ),
    },
    {
      label: "REM sleep",
      value: formatDuration(
        sleep?.remSleepMinutes,
      ),
    },
    {
      label: "Awake",
      value: formatDuration(
        sleep?.awakeMinutes,
      ),
    },
    {
      label: "Disturbances",
      value:
        typeof sleep?.disturbances ===
        "number"
          ? String(
              sleep.disturbances,
            )
          : "—",
    },
  ];
}

export function getRecoveryMetrics(
  entry: HealthEntry,
): HealthMetric[] {
  const recovery =
    entry.recovery;

  return [
    {
      label: "Recovery",
      value: formatPercentage(
        recovery?.recoveryScore,
      ),
    },
    {
      label:
        "Resting heart rate",
      value: formatNumber(
        recovery
          ?.restingHeartRateBpm,
        "bpm",
      ),
    },
    {
      label: "HRV",
      value: formatNumber(
        recovery
          ?.heartRateVariabilityMs,
        "ms",
      ),
    },
    {
      label:
        "Respiratory rate",
      value: formatNumber(
        recovery
          ?.respiratoryRateBreathsPerMinute,
        "rpm",
      ),
    },
    {
      label: "Blood oxygen",
      value: formatPercentage(
        recovery
          ?.bloodOxygenPercentage,
      ),
    },
    {
      label:
        "Skin temperature",
      value: formatNumber(
        recovery
          ?.skinTemperatureCelsius,
        "°C",
      ),
    },
    {
      label: "Fatigue",
      value: formatScore(
        recovery?.fatigueScore,
      ),
    },
    {
      label: "Soreness",
      value: formatScore(
        recovery?.sorenessScore,
      ),
    },
    {
      label: "Stress",
      value: formatScore(
        recovery?.stressScore,
      ),
    },
  ];
}

export function getNutritionMetrics(
  entry: HealthEntry,
): HealthMetric[] {
  const nutrition =
    entry.nutrition;

  return [
    {
      label: "Calories",
      value:
        typeof nutrition
          ?.calories ===
        "number"
          ? `${nutrition.calories.toLocaleString(
              "en-IN",
            )} kcal`
          : "—",
    },
    {
      label: "Protein",
      value: formatNumber(
        nutrition
          ?.proteinGrams,
        "g",
      ),
    },
    {
      label:
        "Carbohydrates",
      value: formatNumber(
        nutrition
          ?.carbohydratesGrams,
        "g",
      ),
    },
    {
      label: "Fat",
      value: formatNumber(
        nutrition?.fatGrams,
        "g",
      ),
    },
    {
      label: "Fibre",
      value: formatNumber(
        nutrition
          ?.fibreGrams,
        "g",
      ),
    },
    {
      label: "Water",
      value: formatNumber(
        nutrition
          ?.waterLitres,
        "L",
      ),
    },
    {
      label: "Meals",
      value:
        typeof nutrition
          ?.mealsCount ===
        "number"
          ? String(
              nutrition.mealsCount,
            )
          : "—",
    },
    {
      label: "Caffeine",
      value: formatNumber(
        nutrition
          ?.caffeineMg,
        "mg",
      ),
    },
  ];
}