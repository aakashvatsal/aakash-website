export type WorkoutType =
  | "push"
  | "pull"
  | "legs"
  | "full_body"
  | "walk"
  | "run"
  | "cycling"
  | "swimming"
  | "sports"
  | "mobility"
  | "yoga"
  | "abs"
  | "rest"
  | "other";

export type WorkoutIntensity =
  | "low"
  | "moderate"
  | "high";

export type HealthMood =
  | "excellent"
  | "good"
  | "neutral"
  | "low"
  | "poor";

export type PainSeverity =
  | "none"
  | "mild"
  | "moderate"
  | "severe";

export type HealthDataSource =
  | "manual"
  | "whoop"
  | "apple_health"
  | "strava";

export interface BodyMeasurement {
  weightKg?: number;

  heightCm?: number;

  bodyFatPercentage?: number;

  muscleMassKg?: number;

  waistCm?: number;

  chestCm?: number;

  hipsCm?: number;

  leftArmCm?: number;

  rightArmCm?: number;

  leftThighCm?: number;

  rightThighCm?: number;
}

export interface SleepData {
  sleepAt?: string;

  wakeAt?: string;

  durationHours?: number;

  timeInBedHours?: number;

  sleepScore?: number;

  sleepQuality?: number;

  lightSleepMinutes?: number;

  deepSleepMinutes?: number;

  remSleepMinutes?: number;

  awakeMinutes?: number;

  disturbances?: number;

  sleepNeedMinutes?: number;

  sleepDebtMinutes?: number;

  sleepPerformancePercentage?: number;

  sleepEfficiencyPercentage?: number;

  sleepConsistencyPercentage?: number;

  napTaken?: boolean;

  napMinutes?: number;
}

export interface RecoveryData {
  recoveryScore?: number;

  restingHeartRateBpm?: number;

  heartRateVariabilityMs?: number;

  respiratoryRateBreathsPerMinute?: number;

  bloodOxygenPercentage?: number;

  skinTemperatureCelsius?: number;

  skinTemperatureDeviationCelsius?: number;

  vo2Max?: number;

  fatigueScore?: number;

  sorenessScore?: number;

  stressScore?: number;
}

export interface CardioData {
  distanceKm?: number;

  durationMinutes?: number;

  averageHeartRateBpm?: number;

  maximumHeartRateBpm?: number;

  averageSpeedKmph?: number;

  averagePaceMinutesPerKm?: number;

  caloriesBurned?: number;

  elevationGainMetres?: number;
}

export interface ExerciseSet {
  setNumber: number;

  repetitions?: number;

  weightKg?: number;

  durationSeconds?: number;

  distanceMetres?: number;

  perceivedExertion?: number;

  completed?: boolean;
}

export interface Exercise {
  name: string;

  muscleGroup?: string;

  sets: ExerciseSet[];

  notes?: string;
}

export interface WorkoutData {
  type: WorkoutType;

  title?: string;

  intensity: WorkoutIntensity;

  source: HealthDataSource;

  externalId?: string;

  durationMinutes?: number;

  caloriesBurned?: number;

  averageHeartRateBpm?: number;

  maximumHeartRateBpm?: number;

  strainScore?: number;

  perceivedExertion?: number;

  exercises: Exercise[];

  cardio?: CardioData;

  notes?: string;

  completed: boolean;

  startedAt?: string;

  completedAt?: string;
}

export interface NutritionData {
  calories?: number;

  proteinGrams?: number;

  carbohydratesGrams?: number;

  fatGrams?: number;

  fibreGrams?: number;

  sugarGrams?: number;

  waterLitres?: number;

  caffeineMg?: number;

  mealsCount?: number;

  followedMealPlan?: boolean;

  hadAlcohol?: boolean;

  smoked?: boolean;

  supplements: string[];

  meals: string[];

  notes?: string;
}

export interface PainEntry {
  bodyPart: string;

  severity: PainSeverity;

  painScore?: number;

  description?: string;

  trigger?: string;

  treatment?: string;

  startedAt?: string;

  resolvedAt?: string;

  resolved?: boolean;
}

export interface HabitEntry {
  key: string;

  label: string;

  completed: boolean;
}

export interface HealthEntry {
  _id: string;

  date: string;

  dateKey: string;

  slug: string;

  bodyMeasurement?: BodyMeasurement;

  sleep?: SleepData;

  recovery?: RecoveryData;

  workouts: WorkoutData[];

  nutrition?: NutritionData;

  habits: HabitEntry[];

  painEntries: PainEntry[];

  sources: HealthDataSource[];

  steps?: number;

  activeMinutes?: number;

  standingHours?: number;

  totalCaloriesBurned?: number;

  restingCaloriesBurned?: number;

  strainScore?: number;

  energyScore?: number;

  motivationScore?: number;

  mood: HealthMood;

  symptoms: string[];

  achievements: string[];

  goals: string[];

  notes?: string;

  wearableData?: Record<
    string,
    unknown
  >;

  memoryIds: string[];

  isArchived: boolean;

  isActive: boolean;

  createdAt?: string;

  updatedAt?: string;
}

export interface HealthDashboardToday {
  dateKey: string;

  recoveryScore: number | null;

  strainScore: number | null;

  sleepPerformance: number | null;

  sleepHours: number | null;

  hrvMs: number | null;

  restingHeartRateBpm: number | null;

  bloodOxygenPercentage: number | null;

  respiratoryRate: number | null;

  skinTemperatureCelsius: number | null;

  sleepConsistencyPercentage:
    number | null;

  sleepEfficiencyPercentage:
    number | null;

  sleepNeedMinutes: number | null;

  sleepDebtMinutes: number | null;

  workouts: number;

  sources: HealthDataSource[];
}

export interface HealthDashboardTrends {
  recovery7DayAverage: number | null;

  recovery30DayAverage: number | null;

  sleep7DayAverageHours: number | null;

  sleep30DayAverageHours: number | null;

  strain7DayAverage: number | null;

  strain30DayAverage: number | null;

  hrv7DayAverage: number | null;

  hrv30DayAverage: number | null;

  restingHeartRate7DayAverage:
    number | null;

  restingHeartRate30DayAverage:
    number | null;

  recoveryChange: number | null;

  sleepChange: number | null;

  hrvChange: number | null;

  restingHeartRateChange:
    number | null;

  strainChange: number | null;
}

export interface HealthDashboard {
  today: HealthDashboardToday;

  trends: HealthDashboardTrends;

  body: {
    latestWeightKg: number | null;

    latestBodyFatPercentage:
      number | null;

    latestWaistCm: number | null;

    measuredAt: string | null;
  };

  workouts: {
    last7Days: number;

    last30Days: number;

    strainLast7Days: number | null;

    strainLast30Days: number | null;
  };

  consistency: {
    trackedDays7: number;

    trackedDays30: number;
  };
}

export interface HealthTrendPoint {
  dateKey: string;

  recoveryScore: number | null;

  strainScore: number | null;

  sleepHours: number | null;

  sleepPerformance: number | null;

  sleepEfficiency: number | null;

  hrvMs: number | null;

  restingHeartRateBpm: number | null;

  bloodOxygenPercentage:
    number | null;

  respiratoryRate: number | null;

  weightKg: number | null;

  workouts: number;

  activeMinutes: number | null;

  steps: number | null;
}

export interface HealthTrendsResponse {
  period: {
    startDate: string;

    endDate: string;

    days: number;
  };

  data: HealthTrendPoint[];

  averages: {
    recovery: number | null;

    strain: number | null;

    sleepHours: number | null;

    sleepPerformance: number | null;

    hrvMs: number | null;

    restingHeartRateBpm:
      number | null;
  };
}