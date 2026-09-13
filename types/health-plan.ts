export type HealthGoalHorizonMode = "exact_date" | "relative" | "ongoing";
export type HealthGoalStatus = "active" | "achieved" | "paused";
export type HealthPlanStatus = "planned" | "completed" | "skipped";
export type HealthPlanRecoveryMode = "recover" | "maintain" | "build";
export type HealthPlanIntensity = "rest" | "easy" | "moderate" | "hard";
export type HealthPhotoCategory = "body" | "skin" | "hair";

export type HealthBaseline = {
  _id?: string;
  key: string;
  currentLookSummary: string;
  expectationSummary: string;
  body: Record<string, unknown>;
  lifestyle: Record<string, unknown>;
  constraints: Record<string, unknown>;
  gym: Record<string, unknown>;
  diet: Record<string, unknown>;
  meditation: Record<string, unknown>;
  skin: Record<string, unknown>;
  hair: Record<string, unknown>;
  intimateCare: Record<string, unknown>;
  reportNotes: string[];
  onboardingCompleted: boolean;
  onboardingCompletedAt?: string | null;
};

export type HealthGoal = {
  _id: string;
  category: string;
  title: string;
  currentValue: string;
  targetValue: string;
  unit: string;
  horizonMode: HealthGoalHorizonMode;
  targetDate?: string | null;
  relativeMonths?: number | null;
  priority: number;
  successCriteria: string;
  notes: string;
  status: HealthGoalStatus;
};

export type HealthPhoto = {
  _id: string;
  category: HealthPhotoCategory;
  angle: string;
  takenAt: string;
  mimeType: string;
  originalName: string;
  byteSize: number;
  analysis: {
    summary: string;
    observations: string[];
    improvementOpportunities: string[];
    safetyFlags: string[];
    comparisonGuidance: string;
  };
  aiModel: string;
  aiResponseId: string;
  analyzedAt?: string | null;
};

export type HealthStrategy = {
  summary: string;
  priorities: string[];
  trainingStrategy: string;
  nutritionStrategy: string;
  recoveryStrategy: string;
  meditationStrategy: string;
  skinStrategy: string;
  hairStrategy: string;
  intimateCareStrategy: string;
  measurementPlan: string[];
  safetyEscalations: string[];
  contextHash: string;
  generatedAt: string;
  version: number;
};

export type HealthSetup = {
  baseline: HealthBaseline | null;
  goals: HealthGoal[];
  photos: HealthPhoto[];
  strategy: HealthStrategy | null;
  readiness: {
    baselineSaved: boolean;
    onboardingCompleted: boolean;
    activeGoalCount: number;
    planReady: boolean;
    photoCounts: Record<string, number>;
    prompts: string[];
  };
};

export type HealthPlanExercise = {
  name: string;
  sets: number;
  reps: string;
  rir: number;
  rpe: number;
  restSeconds: number;
  tempo: string;
  notes: string;
};

export type HealthPlanTraining = {
  title: string;
  type: string;
  durationMinutes: number;
  intensity: HealthPlanIntensity;
  warmup: string[];
  exercises: HealthPlanExercise[];
  cardio: {
    type: string;
    durationMinutes: number;
    intensity: string;
    notes: string;
  };
  cooldown: string[];
  progressionRule: string;
  deloadNote: string;
};

export type HealthPlanNutrition = {
  focus: string;
  calorieTarget: number;
  proteinGrams: number;
  carbsGrams: number;
  fatGrams: number;
  hydrationLitres: number;
  meals: Array<{
    time: string;
    label: string;
    guidance: string;
    proteinGrams: number;
  }>;
  notes: string[];
};

export type HealthPlanDay = {
  _id?: string;
  dateKey: string;
  date: string;
  status: HealthPlanStatus;
  lockedByOwner: boolean;
  ownerNotes: string;
  focus: string;
  rationale: string;
  recoveryMode: HealthPlanRecoveryMode;
  training: HealthPlanTraining;
  nutrition: HealthPlanNutrition;
  meditation: {
    type: string;
    durationMinutes: number;
    when: string;
    intention: string;
  };
  sleep: {
    targetHours: number;
    bedtimeWindow: string;
    wakeWindow: string;
    notes: string[];
  };
  skincare: {
    morning: string[];
    evening: string[];
    other: string[];
    improvementFocus: string;
  };
  haircare: {
    routine: string[];
    washDay: boolean;
    improvementFocus: string;
  };
  intimateCare: {
    routine: string[];
    improvementFocus: string;
  };
  supplementSchedule: string[];
  stepsTarget: number;
  checkIns: string[];
  signals: string[];
  guardrails: string[];
  generatedAt: string;
  version: number;
};

export type HealthPlanWindow = {
  policy: {
    version: string;
    timezone: string;
    safeguards: string[];
  };
  setup: HealthSetup["readiness"];
  strategy: HealthStrategy | null;
  coverage: {
    today: string;
    throughDateKey: string;
    aheadDays: number;
    expectedDays: number;
    plannedDays: number;
    missingDays: number;
    missingDateKeys: string[];
    isCovered: boolean;
    futureCoverageDays: number;
  };
  latestGeneratedAt: string | null;
  days: HealthPlanDay[];
  generation?: {
    generated?: number;
    skipped?: string;
    reason?: string;
    dateKeys?: string[];
    aiModel?: string;
    responseId?: string;
  };
};
