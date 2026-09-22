export type HobbyStatus =
  | "active"
  | "maintenance"
  | "paused"
  | "backlog"
  | "completed";

export type HobbyCategory =
  | "music"
  | "creative"
  | "cognitive"
  | "physical"
  | "language"
  | "social"
  | "practical"
  | "other";

export type HobbyIntensity = "primary" | "secondary" | "maintenance";
export type HobbyPracticeTimeWindow = "morning" | "afternoon" | "evening" | "flexible";
export type HobbyReviewPeriod = "weekly" | "monthly";
export type HobbyStageStatus = "pending" | "current" | "completed";
export type HobbyPracticeStatus = "in_progress" | "completed" | "skipped";

export type CreateHobbyPayload = {
  name: string;
  status?: HobbyStatus;
  category?: HobbyCategory;
  intensity?: HobbyIntensity;
  goal?: string;
  currentSkillLevel?: string;
  weeklyTargetMinutes?: number;
  targetSessionsPerWeek?: number;
  recommendedSessionMinutes?: number;
  preferredPracticeTime?: HobbyPracticeTimeWindow;
  nextAction?: string;
  nextActionMinutes?: number;
};

export type UpdateHobbyPayload = Partial<CreateHobbyPayload>;

export type HobbyEditableDetails = {
  _id: string;
  name: string;
  status: HobbyStatus;
  category: HobbyCategory;
  intensity: HobbyIntensity;
  goal?: string;
  currentSkillLevel?: string;
  weeklyTargetMinutes: number;
  targetSessionsPerWeek: number;
  recommendedSessionMinutes: number;
  preferredPracticeTime: HobbyPracticeTimeWindow;
  nextAction?: string;
  nextActionMinutes?: number;
};

export type HobbyCurriculumStage = {
  key: string;
  title: string;
  order: number;
  objective?: string;
  focusAreas: string[];
  exercises: string[];
  completionCriteria: string[];
  status: HobbyStageStatus;
  targetWeeks?: number;
};

export type HobbyResource = {
  _id: string;
  title: string;
  type: string;
  status: string;
  author?: string;
  authors?: string[];
  progressPercentage?: number;
  coverImageUrl?: string;
};

export type HobbyPracticeSession = {
  _id: string;
  hobbyId: string;
  status: HobbyPracticeStatus;
  startedAt: string;
  endedAt?: string;
  durationMinutes: number;
  focus?: string;
  notes?: string;
  reflection?: string;
  difficulty?: number;
  enjoyment?: number;
  source: string;
  ownerConfirmed?: boolean;
  evidence?: Array<{
    type: string;
    url?: string;
    description?: string;
  }>;
};


export type HobbyReview = {
  _id?: string;
  hobbyId?: string;
  period: HobbyReviewPeriod;
  periodStart: string;
  periodEnd: string;
  stageKey?: string;
  metrics: {
    practiceMinutes: number;
    sessions: number;
    targetMinutes: number;
    targetSessions: number;
    minutesAdherence: number;
    sessionAdherence: number;
    averageDifficulty?: number;
    averageEnjoyment?: number;
    evidenceCount: number;
  };
  summary: string;
  wins: string[];
  stuckPoints: string[];
  coachingNotes: string[];
  nextFocus?: string;
  suggestedWeeklyMinutes?: number;
  suggestedSessions?: number;
  suggestedSessionMinutes?: number;
  curriculumRecommendation: "hold" | "advance" | "simplify" | "maintenance";
  nextPlan: Array<{ focus: string; minutes: number; reason?: string }>;
  resourceSearchTerms: string[];
  evidenceComparison?: {
    summary?: string;
    observedChanges: string[];
    evidenceTypes: string[];
    requiresMultimodalReview: boolean;
    limitation?: string;
  };
};

export type HobbyPracticePlan = {
  generatedAt: string;
  weekStart: string;
  weekEnd: string;
  source: "tasks_plus_hobby_preferences" | "six_month_season_plus_tasks";
  calendarIntegration: "not_connected_in_backend";
  note: string;
  slots: Array<{
    hobbyId: string;
    hobbyName: string;
    dateKey: string;
    startAt: string;
    timeWindow: HobbyPracticeTimeWindow;
    minutes: number;
    focus: string;
    reason: string;
    taskLoadMinutes: number;
  }>;
};


export type HobbyCoach = {
  hobbyId: string;
  hobbyName: string;
  nextAction?: string;
  nextActionMinutes: number;
  latestReview: HobbyReview | null;
  trend: {
    days: number;
    totalMinutes: number;
    totalSessions: number;
    weeks: Array<{ weekStart: string; minutes: number; sessions: number }>;
  };
  nextScheduledPractice: HobbyPracticePlan["slots"][number] | null;
  evidencePolicy: string;
};

export type HobbyPracticePlanSyncResult = {
  created: number;
  skipped: number;
  slots: number;
};

export type HobbyCard = {
  _id: string;
  name: string;
  slug: string;
  status: HobbyStatus;
  category: HobbyCategory;
  intensity: HobbyIntensity;
  goal?: string;
  why?: string;
  currentSkillLevel?: string;
  startedAt?: string;
  targetDate?: string;
  targetHorizonWeeks?: number;
  seasonKey?: string;
  seasonLabel?: string;
  seasonOrder?: number;
  ownerCompletionRequired?: boolean;
  weeklyTargetMinutes: number;
  targetSessionsPerWeek: number;
  recommendedSessionMinutes: number;
  preferredWeekdays?: number[];
  preferredPracticeTime?: HobbyPracticeTimeWindow;
  aiCoachingEnabled?: boolean;
  automaticReviewsEnabled?: boolean;
  currentStageKey?: string;
  nextAction?: string;
  nextActionMinutes?: number;
  curriculum: HobbyCurriculumStage[];
  resources: HobbyResource[];
  linkedLibraryItemIds: string[];
  tags: string[];
  mediaEligible: boolean;
  weekStart: string;
  weekEnd: string;
  weeklyMinutes: number;
  todayMinutes: number;
  sessionsThisWeek: number;
  expectedMinutesByToday: number;
  expectedSessionsByToday: number;
  remainingMinutes: number;
  recommendedTodayMinutes: number;
  pace: "maintenance" | "complete" | "behind" | "on_track";
  curriculumProgress: number;
  completedStages: number;
  totalStages: number;
  currentStage: Record<string, unknown> | null;
  activeSession: HobbyPracticeSession | null;
  priorityScore: number;
  latestReview?: HobbyReview | null;
};

export type HobbyBacklogItem = {
  _id: string;
  name: string;
  slug: string;
  status: "backlog";
  goal?: string;
  why?: string;
  weeklyTargetMinutes: number;
  targetSessionsPerWeek: number;
  recommendedSessionMinutes: number;
  candidateProfile?: {
    genuineCuriosity: number;
    lifestyleFit: number;
    novelty: number;
    strategicUsefulness: number;
    mediaUsefulness: number;
    weeklyMinutes: number;
    note?: string;
  };
};

export type HobbiesOverview = {
  generatedAt: string;
  trackingNote: string;
  season: {
    key: string;
    label: string;
    startDate: string;
    endDate: string;
    maxActiveHobbies: number;
    maxHobbiesPerDay: number;
    activeHobbies: number;
    ownerCompletionRequired: boolean;
    elapsedDays: number;
    totalDays: number;
    progressPercent: number;
  };
  active: HobbyCard[];
  backlog: HobbyBacklogItem[];
  doNext: null | {
    hobbyId: string;
    name: string;
    action: string;
    recommendedMinutes: number;
    reason: string;
  };
  learningLoad: {
    weeklyTargetMinutes: number;
    weeklyMinutes: number;
    sessionsThisWeek: number;
    load: "light" | "moderate" | "high";
    recommendation: string;
  };
  nextHobby: {
    ready: boolean;
    hobby: null | {
      id: string;
      name: string;
      score: number;
      expectedWeeklyMinutes: number;
      note?: string;
    };
    earliestStartDate?: string | null;
    reason: string;
  };
};

export type LogHobbySessionPayload = {
  durationMinutes: number;
  focus?: string;
  notes?: string;
  reflection?: string;
  difficulty?: number;
  enjoyment?: number;
};
