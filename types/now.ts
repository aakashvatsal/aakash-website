export type NowActivityType =
  | "working"
  | "building"
  | "coding"
  | "designing"
  | "meeting"
  | "reading"
  | "writing"
  | "learning"
  | "researching"
  | "exercising"
  | "walking"
  | "meditating"
  | "eating"
  | "commuting"
  | "travelling"
  | "resting"
  | "sleeping"
  | "offline"
  | "other";

export type NowAvailability =
  | "available"
  | "focused"
  | "busy"
  | "in_meeting"
  | "do_not_disturb"
  | "away"
  | "offline";

export type NowVisibility =
  | "private"
  | "shared"
  | "public";

export type NowMood =
  | "focused"
  | "calm"
  | "creative"
  | "energetic"
  | "happy"
  | "neutral"
  | "tired"
  | "stressed"
  | "low";

export type NowSource =
  | "manual"
  | "hsakaa"
  | "health"
  | "whoop"
  | "library"
  | "company"
  | "calendar"
  | "system"
  | "other";

export interface NowCompanyReference {
  companyId?: string;

  companyName?: string;

  projectName?: string;

  currentWork?: string;
}

export interface NowReadingReference {
  libraryItemId?: string;

  title?: string;

  author?: string;

  progressPercentage?: number;

  currentThought?: string;
}

export interface NowHealthReference {
  activity?: string;

  workoutDurationMinutes?: number;

  steps?: number;

  sleepHours?: number;

  recoveryScore?: number;

  strainScore?: number;

  heartRateVariabilityMs?: number;

  restingHeartRateBpm?: number;

  energyScore?: number;

  summary?: string;
}

export interface NowStatus {
  _id: string;

  isCurrent: boolean;

  activityType:
    NowActivityType;

  activity: string;

  headline?: string;

  description?: string;

  currentFocus?: string;

  availability:
    NowAvailability;

  mood?: NowMood;

  energyScore?: number;

  focusScore?: number;

  locationName?: string;

  locationType?: string;

  building?:
    NowCompanyReference;

  reading?:
    NowReadingReference;

  thinking?: string;

  writing?: string;

  health?:
    NowHealthReference;

  tags: string[];

  visibility:
    NowVisibility;

  showLocation: boolean;

  showAvailability: boolean;

  showMood: boolean;

  showHealth: boolean;

  startedAt: string;

  endedAt?: string;

  expiresAt?: string;

  lastActivityAt?: string;

  source: NowSource;

  sourceExternalId?: string;

  metadata?: Record<
    string,
    unknown
  >;

  isArchived: boolean;

  isActive: boolean;

  createdAt?: string;

  updatedAt?: string;
}

export interface NowHistoryResponse {
  data: NowStatus[];

  pagination: {
    page: number;

    limit: number;

    total: number;

    totalPages: number;
  };
}