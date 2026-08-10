export type MediaPlatform =
  | "linkedin"
  | "instagram"
  | "youtube"
  | "x"
  | "facebook"
  | "threads";

export type MediaPostType =
  | "text"
  | "image"
  | "carousel"
  | "reel"
  | "video"
  | "short"
  | "story"
  | "article"
  | "poll";

export type MediaPostStatus =
  | "idea"
  | "draft"
  | "script_ready"
  | "assets_pending"
  | "ready"
  | "scheduled"
  | "posted"
  | "failed"
  | "cancelled";

export type MediaSourceType =
  | "real"
  | "ai_generated"
  | "designed_graphic"
  | "stock"
  | "screen_recording"
  | "none";

export type MediaGoal =
  | "awareness"
  | "engagement"
  | "education"
  | "lead_generation"
  | "authority"
  | "community"
  | "product_promotion"
  | "recruitment"
  | "personal_brand";

export type MediaOutcomeStatus =
  | "not_measured"
  | "below_expectation"
  | "met_expectation"
  | "above_expectation";

export interface MediaStrategy {
  primaryGoal: MediaGoal;
  secondaryGoals: MediaGoal[];
  whyChosen: string;
  targetAudience?: string;
  audienceProblem?: string;
  coreMessage?: string;
  contentPillar?: string;
  desiredAudienceAction?: string;
  hypothesis?: string;
}

export interface MediaContent {
  title: string;
  hook?: string;
  shortDescription?: string;
  detailedDescription?: string;
  caption?: string;
  textPostScript?: string;
  videoScript?: string;
  voiceOverScript?: string;
  carouselSlides: string[];
  shotList: string[];
  hashtags: string[];
  cta?: string;
}

export interface MediaCreative {
  imageSource: MediaSourceType;
  videoSource: MediaSourceType;
  designBrief?: string;
  imagePrompt?: string;
  thumbnailPrompt?: string;
  aiImagePrompt?: string;
  aiVideoPrompt?: string;
  realImageScript?: string;
  realVideoScript?: string;
  brollScript?: string;
  requiredAssets: string[];
  assetUrls: string[];
  equipmentRequired: string[];
  permissionRequired: boolean;
  permissionTaken: boolean;
  permissionNotes?: string;
}

export interface MediaPublishing {
  status: MediaPostStatus;
  scheduledAt?: string;
  publishedAt?: string;
  externalPostUrl?: string;
  platformPostId?: string;
  platformAccountId?: string;
  platformMediaId?: string;
  analyticsUrl?: string;
  errorMessage?: string;
}

export interface MediaExpectationMetric {
  metric: string;
  expectedValue: number;
  unit?: string;
}

export interface MediaExpectation {
  summary?: string;
  metrics: MediaExpectationMetric[];
  evaluationAfterHours: number;
}

export interface MediaOutcome {
  status: MediaOutcomeStatus;
  resultSummary?: string;
  expectationResult?: string;
  whatWorked?: string;
  whatDidNotWork?: string;
  lessonLearned?: string;
  nextAction?: string;
  contentScore?: number;
  evaluatedAt?: string;
}

export interface MediaAnalyticsSync {
  enabled: boolean;
  lastSyncedAt?: string;
  nextSyncAt?: string;
  lastSyncError?: string;
  syncAttempts: number;
}

export interface MediaPost {
  _id: string;
  userId: string;
  companyId?: string;
  date: string;
  platform: MediaPlatform;
  postType: MediaPostType;
  strategy: MediaStrategy;
  content: MediaContent;
  creative: MediaCreative;
  publishing: MediaPublishing;
  expectation: MediaExpectation;
  outcome: MediaOutcome;
  analyticsSync: MediaAnalyticsSync;
  memoryIds: string[];
  metadata: Record<string, unknown>;
  isArchived: boolean;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MediaPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface MediaListResponse {
  status?: number;
  statusCode?: number;
  message?: string;
  data: MediaPost[];
  pagination?: MediaPagination;
}

export interface MediaFilters {
  search?: string;
  platform?: MediaPlatform;
  status?: MediaPostStatus;
  postType?: MediaPostType;
  contentPillar?: string;
  page?: number;
  limit?: number;
}

export interface CreateMediaPostPayload {
  companyId?: string;

  date: string;
  platform: MediaPlatform;
  postType: MediaPostType;

  strategy: {
    primaryGoal: MediaGoal;
    secondaryGoals: MediaGoal[];
    whyChosen: string;

    targetAudience?: string;
    audienceProblem?: string;
    coreMessage?: string;
    contentPillar?: string;
    desiredAudienceAction?: string;
    hypothesis?: string;
  };

  content: {
    title: string;

    hook?: string;
    shortDescription?: string;
    detailedDescription?: string;

    caption?: string;
    textPostScript?: string;

    videoScript?: string;
    voiceOverScript?: string;

    carouselSlides: string[];
    shotList: string[];
    hashtags: string[];

    cta?: string;
  };

  creative: {
    imageSource: MediaSourceType;
    videoSource: MediaSourceType;

    designBrief?: string;
    imagePrompt?: string;
    thumbnailPrompt?: string;
    aiImagePrompt?: string;
    aiVideoPrompt?: string;

    realImageScript?: string;
    realVideoScript?: string;
    brollScript?: string;

    requiredAssets: string[];
    assetUrls: string[];
    equipmentRequired: string[];

    permissionRequired: boolean;
    permissionTaken: boolean;
    permissionNotes?: string;
  };

  publishing: {
    status: MediaPostStatus;

    scheduledAt?: string;
    publishedAt?: string;

    externalPostUrl?: string;
    platformPostId?: string;
    platformAccountId?: string;
    platformMediaId?: string;

    analyticsUrl?: string;
    errorMessage?: string;
  };

  expectation: {
    summary?: string;

    metrics: MediaExpectationMetric[];

    evaluationAfterHours: number;
  };

  outcome: {
    status: MediaOutcomeStatus;

    resultSummary?: string;
    expectationResult?: string;

    whatWorked?: string;
    whatDidNotWork?: string;

    lessonLearned?: string;
    nextAction?: string;

    contentScore?: number;
    evaluatedAt?: string;
  };

  analyticsSync: {
    enabled: boolean;

    lastSyncedAt?: string;
    nextSyncAt?: string;
    lastSyncError?: string;

    syncAttempts: number;
  };

  memoryIds?: string[];
  metadata?: Record<string, unknown>;

  isActive?: boolean;
  isArchived?: boolean;
}

export type UpdateMediaPostPayload =
  Partial<CreateMediaPostPayload>;