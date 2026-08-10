export type PublicMediaPlatform =
  | "linkedin"
  | "instagram"
  | "youtube"
  | "x"
  | "facebook"
  | "threads"
  | string;

export type PublicMediaPostType =
  | "text"
  | "image"
  | "carousel"
  | "reel"
  | "video"
  | "short"
  | "story"
  | "article"
  | "poll"
  | string;

export type PublicMediaPostStatus =
  | "idea"
  | "draft"
  | "script_ready"
  | "assets_pending"
  | "ready"
  | "scheduled"
  | "posted"
  | "failed"
  | "cancelled"
  | string;

export interface PublicMediaStrategy {
  primaryGoal?: string;
  secondaryGoals?: string[];

  targetAudience?: string;
  audienceProblem?: string;
  coreMessage?: string;
  contentPillar?: string;
  desiredAudienceAction?: string;
}

export interface PublicMediaContent {
  title: string;

  hook?: string;
  shortDescription?: string;
  detailedDescription?: string;

  caption?: string;
  textPostScript?: string;

  videoScript?: string;
  voiceOverScript?: string;

  carouselSlides?: string[];
  shotList?: string[];
  hashtags?: string[];

  cta?: string;
}

export interface PublicMediaCreative {
  imageSource?: string;
  videoSource?: string;

  thumbnailUrl?: string;
  coverImageUrl?: string;
  imageUrl?: string;
  videoUrl?: string;

  assetUrls?: string[];

  designBrief?: string;
  imagePrompt?: string;
  thumbnailPrompt?: string;
}

export interface PublicMediaPublishing {
  status?: PublicMediaPostStatus;

  scheduledAt?: string;
  publishedAt?: string;

  externalPostUrl?: string;
  platformPostId?: string;
  platformAccountId?: string;
  platformMediaId?: string;

  analyticsUrl?: string;
}

export interface PublicMediaExpectationMetric {
  metric: string;
  expectedValue: number;
  unit?: string;
}

export interface PublicMediaExpectation {
  summary?: string;
  metrics?: PublicMediaExpectationMetric[];
  evaluationAfterHours?: number;
}

export interface PublicMediaOutcome {
  status?: string;

  resultSummary?: string;
  expectationResult?: string;

  whatWorked?: string;
  whatDidNotWork?: string;

  lessonLearned?: string;
  nextAction?: string;

  contentScore?: number;
  evaluatedAt?: string;
}

export interface PublicMediaPost {
  _id: string;

  date: string;
  platform: PublicMediaPlatform;
  postType: PublicMediaPostType;

  strategy?: PublicMediaStrategy;
  content: PublicMediaContent;
  creative?: PublicMediaCreative;
  publishing?: PublicMediaPublishing;
  expectation?: PublicMediaExpectation;
  outcome?: PublicMediaOutcome;

  isFeatured?: boolean;

  isActive?: boolean;
  isArchived?: boolean;
  isPrivate?: boolean;

  createdAt?: string;
  updatedAt?: string;
}

export interface PublicMediaResponse {
  items: PublicMediaPost[];

  pagination?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
  };
}

export interface PublicMediaQuery {
  platform?: string;
  postType?: string;
  status?: string;

  page?: number;
  limit?: number;
}