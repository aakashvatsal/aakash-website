export type HealthGoalHorizonMode = "exact_date" | "relative" | "ongoing";
export type HealthGoalStatus = "active" | "achieved" | "paused";
export type HealthPhotoCategory = "body" | "skin" | "hair";
export type HealthPlanStatus = "planned" | "completed" | "skipped";

export type HealthBaseline = {
  _id?: string;
  key: string;
  currentLookSummary: string;
  expectationSummary: string;
  body: Record<string, unknown>;
  location: Record<string, unknown>;
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
  analysis?: {
    summary?: string;
    observations?: string[];
    improvementOpportunities?: string[];
    safetyFlags?: string[];
    comparisonGuidance?: string;
    comparison?: {
      hasPrevious?: boolean;
      comparedToPhotoId?: string;
      changeSummary?: string;
      visibleChanges?: string[];
      consistencyNotes?: string[];
      confidence?: 'low' | 'medium' | 'high';
    };
  };
  analyzedAt?: string | null;
};

export type HealthSourceReport = {
  _id: string;
  label: string;
  reportDate: string;
  mimeType: string;
  originalName: string;
  byteSize: number;
  analysis?: {
    summary?: string;
    findings?: string[];
    measurements?: string[];
    structuredMeasurements?: Array<{
      name: string;
      value: string;
      unit: string;
      referenceRange: string;
      flag: 'low' | 'normal' | 'high' | 'unknown';
    }>;
    planningImplications?: string[];
    professionalInstructions?: string[];
    safetyFlags?: string[];
    followUpTests?: Array<{
      testName: string;
      timingText: string;
      dueAt?: string | null;
      reason: string;
      source: "report_explicit" | "owner_confirmed";
      status: "scheduled" | "needs_confirmation" | "completed" | "dismissed";
      reminderEnabled: boolean;
    }>;
  };
  analyzedAt?: string | null;
};

export type HealthStrategy = {
  _id?: string;
  summary: string;
  priorities: string[];
  trainingStrategy: string;
  nutritionStrategy: string;
  recoveryStrategy: string;
  meditationStrategy: string;
  skinStrategy: string;
  hairStrategy: string;
  bodyCareStrategy: string;
  intimateCareStrategy: string;
  productRecommendations: Array<{
    domain: "skincare" | "haircare" | "bodycare";
    action: "keep" | "add" | "replace" | "review";
    slot: string;
    currentProduct: string;
    suggestedProductName: string;
    suggestedBrand: string;
    reason: string;
    usageGuidance: string;
    concerns: string[];
    availabilityStatus: "verified_local" | "verified_india" | "unverified" | "not_checked";
    availabilitySummary: string;
    availabilitySources: string[];
    requiresApproval: boolean;
  }>;
  supplementRecommendations: Array<{
    action: "keep" | "add" | "replace" | "review" | "review_stop";
    category: string;
    currentSupplement: string;
    suggestedProductName: string;
    suggestedBrand: string;
    reason: string;
    selectionCriteria: string[];
    availabilityStatus: "verified_local" | "verified_india" | "unverified" | "not_checked";
    availabilitySummary: string;
    availabilitySources: string[];
    requiresApproval: boolean;
    requiresProfessionalReview: boolean;
  }>;
  measurementPlan: string[];
  safetyEscalations: string[];
  generatedAt: string;
  version: number;
};

export type HealthPlannerReadiness = {
  baselineSaved: boolean;
  onboardingCompleted: boolean;
  activeGoalCount: number;
  planReady: boolean;
  photoCounts: Record<string, number>;
  sourceReportCount: number;
  prompts: string[];
};

export type HealthPlannerProductSummary = {
  total: number;
  products: Array<{
    _id: string;
    name: string;
    brand?: string;
    category: string;
    status: string;
    usage?: {
      remainingPercentage?: number;
      estimatedFinishAt?: string | null;
    };
    expiresAt?: string | null;
  }>;
  grouped: Record<string, unknown[]>;
  whatToBuyNext?: {
    summary?: {
      savedRecommendations?: number;
      lowProducts?: number;
      alternativesNeeded?: number;
      expiringSoon?: number;
      wishlistProducts?: number;
    };
    nextRecommendedAction?: unknown;
  };
};

export type HealthStorageStatus = {
  provider: "s3";
  configured: boolean;
  bucket: string | null;
  region: string;
  prefix: string;
  privateObjects: boolean;
  serverSideEncryption: string;
  serverFilesystemStorage: boolean;
  legacyPhotos: number;
  legacyReports: number;
  migrationRequired: boolean;
};

export type HealthPlannerSetup = {
  policy: Record<string, unknown>;
  baseline: HealthBaseline | null;
  goals: HealthGoal[];
  photos: HealthPhoto[];
  sourceReports: HealthSourceReport[];
  strategy: HealthStrategy | null;
  products?: HealthPlannerProductSummary;
  storage?: HealthStorageStatus;
  readiness: HealthPlannerReadiness;
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

export type HealthPlanDay = {
  _id?: string;
  dateKey: string;
  status: HealthPlanStatus;
  lockedByOwner: boolean;
  ownerNotes: string;
  focus: string;
  rationale: string;
  recoveryMode: "recover" | "maintain" | "build";
  morningConditioning: {
    type: string;
    durationMinutes: number;
    intensity: string;
    when: string;
    notes: string;
  };
  training: {
    when: string;
    title: string;
    type: string;
    durationMinutes: number;
    intensity: "rest" | "easy" | "moderate" | "hard";
    warmup: string[];
    exercises: HealthPlanExercise[];
    cardio: { type: string; durationMinutes: number; intensity: string; notes: string };
    cooldown: string[];
    progressionRule: string;
    deloadNote: string;
  };
  normalWalk: {
    type: string;
    durationMinutes: number;
    intensity: string;
    when: string;
    notes: string;
  };
  nutrition: {
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
      items: Array<{
        name: string;
        category: "vegetable" | "fruit" | "grain_flour" | "rice" | "protein" | "dairy_alternative" | "nuts_seeds" | "fat" | "other";
        quantity: number;
        unit: string;
        preparation: string;
        reason: string;
        alternatives: string[];
      }>;
      proteinGrams: number;
    }>;
    performanceNutrition: Array<{
      category: "creatine" | "protein_powder" | "other";
      action: "keep" | "add" | "replace" | "review" | "review_stop" | "not_needed";
      status: "active" | "pending_approval" | "review_required" | "not_needed_today";
      item: string;
      when: string;
      guidance: string;
      approvalRequired: boolean;
    }>;
    notes: string[];
  };
  meditation: { type: string; durationMinutes: number; when: string; intention: string };
  sleep: { targetHours: number; bedtimeWindow: string; wakeWindow: string; notes: string[] };
  skincare: { morning: string[]; evening: string[]; other: string[]; improvementFocus: string };
  bodyCare: { morning: string[]; evening: string[]; other: string[]; improvementFocus: string };
  haircare: { routine: string[]; washDay: boolean; improvementFocus: string };
  intimateCare: { routine: string[]; improvementFocus: string };
  supplementSchedule: string[];
  labFollowUps: Array<{
    sourceReportId: string;
    testName: string;
    dueAt: string;
    reason: string;
  }>;
  stepsTarget: number;
  checkIns: string[];
  signals: string[];
  guardrails: string[];
  generatedAt: string;
  version: number;
};

export type HealthPlanWindow = {
  setup: HealthPlannerReadiness;
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
  latestGeneratedAt?: string | null;
  days: HealthPlanDay[];
  generation?: { generated: number; skipped?: string; reason?: string };
};

export type HealthBaselinePayload = Omit<HealthBaseline, "_id" | "key" | "onboardingCompletedAt">;

export type HealthRoutineTaskStatus = "pending" | "completed" | "skipped";
export type HealthSubstanceUseStatus = "untracked" | "no" | "yes";
export type HealthOwnerUpdateDomain =
  | "general"
  | "gym"
  | "diet"
  | "supplements"
  | "meditation"
  | "skincare"
  | "haircare"
  | "intimate_care"
  | "sleep_recovery";

export type HealthRoutineTask = {
  key: string;
  domain: string;
  label: string;
  detail: string;
  scheduledTime: string;
  status: HealthRoutineTaskStatus;
  source: string;
  globalTaskId: string;
  completedAt?: string | null;
  updatedAt?: string | null;
};

export type HealthAutomaticMetrics = {
  sources: string[];
  weightKg: number | null;
  heightCm: number | null;
  maximumHeartRateBpm: number | null;
  recoveryScore: number | null;
  strainScore: number | null;
  sleepHours: number | null;
  sleepNeedMinutes: number | null;
  sleepDebtMinutes: number | null;
  sleepPerformancePercentage: number | null;
  sleepEfficiencyPercentage: number | null;
  sleepConsistencyPercentage: number | null;
  restingHeartRateBpm: number | null;
  heartRateVariabilityMs: number | null;
  bloodOxygenPercentage: number | null;
  skinTemperatureCelsius: number | null;
  respiratoryRateBreathsPerMinute: number | null;
  steps: number | null;
  totalCaloriesBurned: number | null;
};

export type HealthExecutionFeedback = {
  energyScore?: number | null;
  fatigueScore?: number | null;
  sorenessScore?: number | null;
  stressScore?: number | null;
  hungerScore?: number | null;
  planDifficultyScore?: number | null;
  smoking: { status: HealthSubstanceUseStatus; quantity?: number | null; unit: string; type: string };
  alcohol: { status: HealthSubstanceUseStatus; quantity?: number | null; unit: string; type: string };
  whatWorked: string[];
  blockers: string[];
  requestedChanges: string[];
  notes: string;
  submittedAt?: string | null;
};

export type HealthDomainComparison = {
  score: number | null;
  status: "met" | "partial" | "missed" | "untracked" | "not_applicable";
  planned: unknown;
  actual: unknown;
  notes: string[];
};

export type HealthDailyProgress = {
  dateKey: string;
  planVersion: number;
  planStatus: string;
  isFinal: boolean;
  overallAdherencePercentage: number;
  trackingCoveragePercentage: number;
  taskCompletionPercentage: number;
  taskTrackingCoveragePercentage: number;
  domains: Record<string, HealthDomainComparison>;
  automaticMetrics: HealthAutomaticMetrics;
  tasks: HealthRoutineTask[];
  feedback: HealthExecutionFeedback;
  computedAt: string;
};

export type HealthPlanReview = {
  _id?: string;
  periodType: "weekly" | "monthly";
  periodKey: string;
  startDateKey: string;
  endDateKey: string;
  summary: string;
  wins: string[];
  misses: string[];
  blockers: string[];
  recommendedChanges: string[];
  targetProgress: string[];
  safetyFlags: string[];
  nextActions: string[];
  generatedAt: string;
  version: number;
};

export type HealthProgressSummary = {
  range: { startDateKey: string; endDateKey: string; days: number };
  totals: { plannedDays: number; finalizedDays: number; daysAtOrAbove80: number; adherenceStreak: number };
  averages: {
    adherencePercentage: number;
    trackingCoveragePercentage: number;
    domains: Record<string, number | null>;
  };
  executions: HealthDailyProgress[];
  reviews: HealthPlanReview[];
};

export type HealthOwnerUpdate = {
  _id: string;
  domain: HealthOwnerUpdateDomain;
  update: string;
  effectiveAt: string;
  isActive: boolean;
};

export type HealthIntelligenceStatus = "good" | "watch" | "attention";
export type HealthIntelligenceSeverity = "positive" | "info" | "watch" | "attention";
export type HealthGoalTrajectoryStatus =
  | "on_track"
  | "slightly_behind"
  | "off_track"
  | "insufficient_data"
  | "ongoing";

export type HealthIntelligenceTrend = {
  key: keyof Pick<
    HealthAutomaticMetrics,
    | "weightKg"
    | "recoveryScore"
    | "strainScore"
    | "sleepHours"
    | "sleepPerformancePercentage"
    | "sleepDebtMinutes"
    | "restingHeartRateBpm"
    | "heartRateVariabilityMs"
    | "bloodOxygenPercentage"
    | "respiratoryRateBreathsPerMinute"
    | "steps"
    | "totalCaloriesBurned"
  >;
  label: string;
  unit: string;
  current: number | null;
  baseline: number | null;
  delta: number | null;
  deltaPercentage: number | null;
  direction: "up" | "down" | "flat" | "unknown";
  points: Array<{ dateKey: string; value: number }>;
};

export type HealthIntelligenceCard = {
  key: string;
  title: string;
  message: string;
  severity: HealthIntelligenceSeverity;
  metric?: string;
  current?: number | null;
  baseline?: number | null;
  delta?: number | null;
  evidenceDays: number;
};

export type HealthCorrelation = {
  key: string;
  factor: string;
  outcome: string;
  sampleSize: number;
  exposedDays: number;
  comparisonDays: number;
  effect: number;
  unit: string;
  confidence: "low" | "medium" | "high";
  interpretation: string;
};

export type HealthGoalTrajectory = {
  id: string;
  title: string;
  category: string;
  unit: string;
  currentValue: number | null;
  targetValue: number | null;
  startingValue: number | null;
  progressPercentage: number | null;
  expectedProgressPercentage: number | null;
  targetDate: string | null;
  status: HealthGoalTrajectoryStatus;
  evidence: string;
};

export type HealthTrainingProgression = {
  exercise: string;
  recommendation: "progress" | "hold" | "reduce" | "review";
  rationale: string;
  sessionsObserved: number;
  averageSetCompletionPercentage: number;
  latestAverageRpe: number | null;
};

export type HealthPlateauFlag = {
  key: string;
  domain: string;
  severity: "watch" | "attention";
  message: string;
  evidence: string;
};

export type HealthAttentionItem = {
  key: string;
  severity: "watch" | "attention";
  title: string;
  message: string;
  action: string;
};

export type HealthIntelligence = {
  range: { startDateKey: string; endDateKey: string; days: number };
  generatedAt: string;
  status: HealthIntelligenceStatus;
  headline: string;
  cards: HealthIntelligenceCard[];
  trends: HealthIntelligenceTrend[];
  correlations: HealthCorrelation[];
  goals: HealthGoalTrajectory[];
  trainingProgression: HealthTrainingProgression[];
  plateauFlags: HealthPlateauFlag[];
  attention: HealthAttentionItem[];
  memory: {
    successfulPatterns: string[];
    failedPatterns: string[];
    avoidOrReview: string[];
  };
  photoTimeline: Array<{
    id: string;
    category: string;
    angle: string;
    takenAt: string;
    summary: string;
    observations: string[];
    improvementOpportunities: string[];
    safetyFlags: string[];
  }>;
  reportTimeline: Array<{
    id: string;
    label: string;
    reportDate: string;
    summary: string;
    measurements: string[];
    findings: string[];
    planningImplications: string[];
    professionalInstructions: string[];
    safetyFlags: string[];
  }>;
};


export type HealthAttentionPriority =
  | "info"
  | "action"
  | "important"
  | "review"
  | "professional_review";
export type HealthAttentionStatus = "open" | "resolved" | "dismissed";

export type HealthNotificationPreferences = {
  _id?: string;
  ownerKey: string;
  morningBriefEnabled: boolean;
  morningBriefTime: string;
  workoutRemindersEnabled: boolean;
  defaultWorkoutTime: string;
  workoutLeadMinutes: number;
  mealRemindersEnabled: boolean;
  supplementRemindersEnabled: boolean;
  meditationRemindersEnabled: boolean;
  skincareRemindersEnabled: boolean;
  haircareRemindersEnabled: boolean;
  intimateCareRemindersEnabled: boolean;
  sleepRemindersEnabled: boolean;
  sleepLeadMinutes: number;
  importantAlertsEnabled: true;
  quietHoursStart: string;
  quietHoursEnd: string;
  isActive: boolean;
};

export type HealthProactiveAttentionItem = {
  _id: string;
  key: string;
  priority: HealthAttentionPriority;
  status: HealthAttentionStatus;
  title: string;
  message: string;
  action: string;
  domain?: string;
  sourceType?: string;
  sourceKey?: string;
  evidence: Record<string, unknown>;
  firstSeenAt: string;
  lastSeenAt: string;
  resolvedAt?: string | null;
  dismissedAt?: string | null;
  isActive: boolean;
};

export type HealthAttentionResponse = {
  items: HealthProactiveAttentionItem[];
  counts: Record<HealthAttentionPriority, number>;
};

export type HealthInterventionStatus =
  | "applied"
  | "follow_up_pending"
  | "improved"
  | "not_improved"
  | "skipped";

export type HealthIntervention = {
  _id: string;
  key: string;
  type: string;
  dateKey: string;
  rationale: string;
  changeSummary: string;
  before: Record<string, unknown>;
  after: Record<string, unknown>;
  status: HealthInterventionStatus;
  appliedAt: string;
  followUpDueAt?: string | null;
  followedUpAt?: string | null;
  followUpSummary?: string;
  isActive: boolean;
};

export type HealthMorningBrief = {
  dateKey: string;
  generatedAt: string;
  preferences: HealthNotificationPreferences;
  automaticMetrics: HealthAutomaticMetrics | null;
  plan: HealthPlanDay | null;
  tasks: HealthRoutineTask[];
  taskCompletionPercentage: number;
  headline: string;
  observations: HealthIntelligenceCard[];
  goals: HealthGoalTrajectory[];
  attention: HealthProactiveAttentionItem[];
  interventions: HealthIntervention[];
  changedOvernight: string[];
};


export type HealthAutonomyMode = "autonomous" | "approval" | "never" | "locked";

export type HealthEvidenceSettings = {
  _id?: string;
  key: string;
  sourcePriority: string[];
  autonomy: Record<string, HealthAutonomyMode>;
  baselineRefreshDays: number;
  bodyPhotoRefreshDays: number;
  skinPhotoRefreshDays: number;
  hairPhotoRefreshDays: number;
  reportFreshnessDays: number;
  isActive: boolean;
};

export type HealthEvidenceOverview = {
  generatedAt: string;
  sourcePriority: string[];
  autonomy: Record<string, HealthAutonomyMode>;
  overallScore: number;
  quality: Array<{
    key: string;
    label: string;
    score: number;
    status: "excellent" | "good" | "limited" | "missing";
    lastObservedAt?: string | null;
    detail: string;
  }>;
  baseline: {
    exists: boolean;
    lastReviewedAt?: string | null;
    ageDays?: number | null;
    refreshAfterDays: number;
    refreshRecommended: boolean;
  };
  photoComparisons: Array<{
    key: string;
    category: HealthPhotoCategory;
    angle: string;
    latest: { id: string; takenAt: string; summary: string; observations: string[] };
    previous: { id: string; takenAt: string; summary: string; observations: string[] } | null;
    comparison?: {
      hasPrevious?: boolean;
      comparedToPhotoId?: string;
      changeSummary?: string;
      visibleChanges?: string[];
      consistencyNotes?: string[];
      confidence?: "low" | "medium" | "high";
    } | null;
  }>;
  reportComparison: {
    latest: { id: string; label: string; reportDate: string } | null;
    previous: { id: string; label: string; reportDate: string } | null;
    measurements: Array<{
      name: string;
      previousValue: string;
      currentValue: string;
      unit: string;
      referenceRange: string;
      flag: string;
    }>;
  };
};
