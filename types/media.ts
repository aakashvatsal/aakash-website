export type MediaPlatform =
  | "linkedin"
  | "instagram"
  | "youtube"
  | "x"
  | "facebook"
  | "threads"
  | "whatsapp";

export type MediaPostType =
  | "text"
  | "image"
  | "carousel"
  | "reel"
  | "video"
  | "short"
  | "story"
  | "article"
  | "poll"
  | "thread"
  | "whatsapp_message"
  | "whatsapp_status"
  | "whatsapp_template";

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

export type MediaAccountConnectionStatus =
  | "not_connected"
  | "connected"
  | "needs_reauth"
  | "error";

export type MediaDeliveryProvider = "auto" | "buffer" | "direct" | "manual";

export interface MediaBufferConnection {
  organizationId: string;
  channelId: string;
  service: string;
  name?: string;
  displayName?: string;
  externalLink?: string;
  isDisconnected: boolean;
  isLocked: boolean;
  isQueuePaused: boolean;
  lastSyncedAt?: string;
}

export interface MediaAccount {
  _id: string;
  platform: MediaPlatform;
  displayName: string;
  username?: string;
  externalAccountId?: string;
  connectionStatus: MediaAccountConnectionStatus;
  credentialRef?: string;
  deliveryProvider: MediaDeliveryProvider;
  buffer?: MediaBufferConnection;
  capabilities: {
    canPublish: boolean;
    canSchedule: boolean;
    canReadAnalytics: boolean;
    canReadEngagement: boolean;
    canUploadAssets: boolean;
    requiresManualPublish: boolean;
  };
  strategy: {
    goals: MediaGoal[];
    contentPillars: string[];
    audiences: string[];
    planningHorizonDays: number;
    desiredPublicationsPerWeek: number;
    timezone: string;
    preferredDaysOfWeek: number[];
    preferredPublishTimes: string[];
    positioning?: string;
    notes?: string;
  };
  isPrimary: boolean;
  isActive: boolean;
}

export interface MediaContentItem {
  _id: string;
  title: string;
  thesis?: string;
  whyNow?: string;
  canonicalBody?: string;
  story?: string;
  evidence: string[];
  contentPillars: string[];
  audiences: string[];
  goals: MediaGoal[];
  status: "idea" | "developing" | "ready" | "archived";
  origin: string;
  legacyMediaPostId?: string;
  createdAt?: string;
}

export type MediaProductionStatus =
  | "not_started"
  | "planning"
  | "plan_ready"
  | "assets_pending"
  | "ready"
  | "complete"
  | "blocked";

export interface MediaProductionPlan {
  finalScript?: string;
  teleprompterScript?: string;
  talkingPoints: string[];
  shotList: Array<{
    order: number;
    label: string;
    framing?: string;
    action?: string;
    dialogue?: string;
    durationSeconds?: number;
    location?: string;
    equipment: string[];
    notes?: string;
  }>;
  broll: Array<{
    order: number;
    description: string;
    purpose?: string;
    durationSeconds?: number;
    source: MediaSourceType;
    notes?: string;
  }>;
  carouselSlides: Array<{
    slideNumber: number;
    headline: string;
    body?: string;
    visualDirection?: string;
  }>;
  thumbnail?: {
    headline?: string;
    concept?: string;
    composition?: string;
    textOverlay?: string;
    imagePrompt?: string;
    notes?: string;
  };
  visualDirection?: {
    aspectRatio?: string;
    framing?: string;
    lighting?: string;
    background?: string;
    wardrobe?: string;
    props: string[];
    notes?: string;
  };
  cameraInstructions?: {
    orientation?: string;
    framing?: string;
    resolution?: string;
    fps?: string;
    audio?: string;
    lighting?: string;
    location?: string;
    notes?: string;
  };
  editInstructions?: {
    pacing?: string;
    cuts?: string;
    captions?: string;
    music?: string;
    soundEffects?: string;
    graphics?: string;
    notes?: string;
  };
  assetRequirements: Array<{
    key: string;
    type: MediaAsset["type"];
    role?: string;
    description: string;
    source: MediaSourceType;
    prompt?: string;
    required: boolean;
    notes?: string;
  }>;
  equipment: string[];
  publishChecklist: string[];
  risks: string[];
  notes?: string;
  origin: "manual" | "hsakaa";
  generatedAt?: string;
  aiModel?: string;
  responseId?: string;
  promptVersion?: string;
}

export interface MediaPublication {
  _id: string;
  contentItemId: string;
  accountId?: string;
  platform: MediaPlatform;
  format: MediaPostType;
  status: MediaPostStatus;
  title?: string;
  hook?: string;
  caption?: string;
  script?: string;
  description?: string;
  cta?: string;
  hashtags: string[];
  slides: string[];
  productionStatus: MediaProductionStatus;
  production?: MediaProductionPlan;
  productionVersion: number;
  productionRunId?: string;
  scheduledAt?: string;
  publishedAt?: string;
  deliveryStatus: MediaDeliveryStatus;
  autoPublish: boolean;
  scheduleApprovedAt?: string;
  publishAttempts: number;
  lastPublishAttemptAt?: string;
  nextPublishAttemptAt?: string;
  lastPublishError?: string;
  manualPublishCompletedAt?: string;
  externalPostUrl?: string;
  platformPostId?: string;
  intentionalRepurpose: boolean;
  legacyMediaPostId?: string;
}

export interface MediaAsset {
  _id: string;
  contentItemId?: string;
  publicationId?: string;
  type: "image" | "video" | "audio" | "document" | "thumbnail" | "carousel" | "broll" | "other";
  role?: string;
  productionRequirementKey?: string;
  required: boolean;
  generatedFromProduction: boolean;
  source: MediaSourceType;
  url?: string;
  storageKey?: string;
  prompt?: string;
  notes?: string;
  status: "planned" | "ready" | "archived";
  isActive?: boolean;
}

export interface MediaProductionReadiness {
  hasPlan: boolean;
  requiredAssets: number;
  readyAssets: number;
  remainingAssets: number;
  ready: boolean;
  complete: boolean;
}

export interface MediaProductionStudioItem {
  publication: MediaPublication;
  contentItem: MediaContentItem;
  assets: MediaAsset[];
  readiness: MediaProductionReadiness;
}

export interface MediaProductionOverview {
  totalPublications: number;
  counts: Record<MediaProductionStatus, number>;
  readyForCalendar: number;
  policy: {
    writesCanonicalPublicationSchema: boolean;
    generatedPlansNeverPublish: boolean;
    publishingOwnedByPhase6E: boolean;
    assetReadinessControlsPublicationReadiness: boolean;
  };
}

export interface MediaCoreOverview {
  planningHorizonDays: number;
  accounts: MediaAccount[];
  counts: { contentItems: number; publications: number; assets: number };
  missingGrowthPlatforms: MediaPlatform[];
}

export interface MediaMigrationStatus {
  legacyPosts: number;
  migratedPosts: number;
  remaining: number;
}

export type MediaContentMemoryScope =
  | "content"
  | "publication"
  | "rejected_candidate";

export type MediaContentMemoryStatus =
  | "active"
  | "rejected"
  | "archived";

export type MediaRepetitionRisk =
  | "low"
  | "medium"
  | "high"
  | "blocked";

export interface MediaContentSimilarityMatch {
  memoryId?: string;
  contentItemId?: string;
  publicationId?: string;
  score: number;
  semanticScore?: number;
  lexicalScore?: number;
  componentScore?: number;
  reasons: string[];
}

export interface MediaContentMemory {
  _id: string;
  scope: MediaContentMemoryScope;
  contentItemId?: string;
  publicationId?: string;
  generationRunId?: string;
  platform?: MediaPlatform;
  format?: MediaPostType;
  title?: string;
  topic?: string;
  thesis?: string;
  angle?: string;
  hookArchetype?: string;
  openingPattern?: string;
  storyKeys: string[];
  exampleKeys: string[];
  structure: string[];
  ctaArchetype?: string;
  visualConcept?: string;
  keyPhrases: string[];
  entities: string[];
  emotionalTone?: string;
  noveltyScore: number;
  repetitionRisk: MediaRepetitionRisk;
  similarMatches: MediaContentSimilarityMatch[];
  status: MediaContentMemoryStatus;
  intentionalRepurpose: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MediaIntelligenceOverview {
  contentItems: number;
  publications: number;
  indexedContent: number;
  indexedPublications: number;
  contentCoveragePercent: number;
  publicationCoveragePercent: number;
  rejectedCandidatesRemembered: number;
  highRiskMemories: number;
  embeddingModel: string;
  policy: {
    blockedSimilarity: number;
    highSimilarity: number;
    mediumSimilarity: number;
    intentionalRepurposeCanOverride: boolean;
  };
}

export interface MediaIntelligenceBackfillResult {
  indexedContent: number;
  indexedPublications: number;
  failures: Array<{
    id: string;
    kind: string;
    error: string;
  }>;
  overview: MediaIntelligenceOverview;
}

export type MediaGenerationPurpose =
  | "ideation"
  | "repurpose"
  | "platform_adaptation"
  | "rewrite"
  | "calendar_fill"
  | "production";

export type MediaGenerationRunStatus =
  | "generating"
  | "generated"
  | "partially_accepted"
  | "accepted"
  | "rejected"
  | "failed";

export type MediaDirectorCandidateStatus =
  | "generated"
  | "blocked"
  | "accepted"
  | "rejected";

export interface MediaDirectorPublicationDraft {
  platform: MediaPlatform;
  format: MediaPostType;
  title?: string;
  hook?: string;
  caption?: string;
  script?: string;
  description?: string;
  cta?: string;
  hashtags: string[];
  slides: string[];
  rationale?: string;
  noveltyScore: number;
  repetitionRisk: MediaRepetitionRisk;
  allowed: boolean;
  closestSimilarity: number;
}

export interface MediaDirectorCandidate {
  key: string;
  title: string;
  thesis: string;
  whyNow: string;
  canonicalBody: string;
  story: string;
  evidence: string[];
  contentPillars: string[];
  audiences: string[];
  goals: MediaGoal[];
  rationale: string;
  publications: MediaDirectorPublicationDraft[];
  noveltyScore: number;
  repetitionRisk: MediaRepetitionRisk;
  closestSimilarity: number;
  internalSimilarity: number;
  status: MediaDirectorCandidateStatus;
  critic: {
    strategicFit: number;
    platformFit: number;
    specificity: number;
    strengths: string[];
    risks: string[];
    improvement: string;
  };
  finalScore: number;
  acceptedContentItemId?: string;
  rejectedMemoryId?: string;
}

export interface MediaGenerationRun {
  _id: string;
  purpose: MediaGenerationPurpose;
  status: MediaGenerationRunStatus;
  aiModel?: string;
  responseId?: string;
  promptVersion?: string;
  contextSummary?: string;
  brief?: string;
  requestedPlatforms: MediaPlatform[];
  strategySnapshot: Record<string, unknown>;
  candidates: MediaDirectorCandidate[];
  rankedCandidateKeys: string[];
  candidateCount: number;
  acceptedContentItemIds: string[];
  rejectedMemoryIds: string[];
  metadata: Record<string, unknown>;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MediaDirectorOverview {
  runs: number;
  pendingRuns: number;
  acceptedRuns: number;
  rejectedRuns: number;
  aiModel: string;
  configuredGrowthPlatforms: MediaPlatform[];
  requiredGrowthPlatforms: MediaPlatform[];
  policy: {
    candidateCountDefault: number;
    candidateCountRange: [number, number];
    requiresAntiRepetitionCheck: boolean;
    blockedCandidatesCannotBeAccepted: boolean;
    acceptanceWritesCanonicalSchemas: boolean;
    rejectionEntersContentMemory: boolean;
  };
}

export interface GenerateMediaDirectorPayload {
  brief: string;
  purpose?: MediaGenerationPurpose;
  platforms?: MediaPlatform[];
  candidateCount?: number;
  goals?: MediaGoal[];
  contentPillars?: string[];
  audiences?: string[];
  whyNow?: string;
  constraints?: string[];
  sourceContentItemId?: string;
  intentionalRepurpose?: boolean;
  contextSummary?: string;
}

export type MediaDeliveryStatus =
  | "not_scheduled"
  | "scheduled"
  | "publishing"
  | "published"
  | "manual_required"
  | "failed"
  | "cancelled";

export type MediaCalendarSlotStatus =
  | "open"
  | "reserved"
  | "scheduled"
  | "published"
  | "cancelled";

export interface MediaCalendarCoverage {
  accountId: string;
  platform: MediaPlatform;
  displayName: string;
  horizonDays: number;
  desiredPublicationsPerWeek: number;
  requiredSlots: number;
  assignedSlots: number;
  openSlots: number;
  productionGaps: number;
  coveragePercent: number;
  covered: boolean;
}

export interface MediaCalendarSlot {
  _id: string;
  accountId: string;
  platform: MediaPlatform;
  startsAt: string;
  localDate: string;
  slotKey: string;
  publicationId?: string;
  publication?: MediaPublication;
  status: MediaCalendarSlotStatus;
  autoPublish: boolean;
  scheduleApprovedAt?: string;
  notes?: string;
}

export interface MediaPublishingQueueItem extends MediaPublication {
  due: boolean;
}

export interface MediaCalendarOverview {
  generatedAt: string;
  minimumPlanningHorizonDays: number;
  horizonEnd: string;
  fullyCovered: boolean;
  coverage: MediaCalendarCoverage[];
  slots: MediaCalendarSlot[];
  readyUnscheduled: MediaPublication[];
  publishingQueue: MediaPublishingQueueItem[];
  policy: {
    minimumPlanningHorizonDays: number;
    productionReadinessGatesScheduling: boolean;
    hsakaaRequiresConfirmationToScheduleOrPublish: boolean;
    autoPublishRequiresExplicitApproval: boolean;
    maximumAutomaticPublishAttempts: number;
    whatsappStatusIsManual: boolean;
  };
}

export interface UpdateMediaAccountPayload {
  displayName?: string;
  username?: string;
  externalAccountId?: string;
  connectionStatus?: MediaAccountConnectionStatus;
  credentialRef?: string;
  deliveryProvider?: MediaDeliveryProvider;
  capabilities?: Partial<MediaAccount["capabilities"]>;
  strategy?: Partial<MediaAccount["strategy"]>;
  isPrimary?: boolean;
  isActive?: boolean;
  metadata?: Record<string, unknown>;
}


export interface BufferOrganization {
  id: string;
  name?: string | null;
}

export interface BufferChannel {
  id: string;
  organizationId: string;
  name: string;
  displayName?: string | null;
  service: string;
  avatar?: string | null;
  externalLink?: string | null;
  isQueuePaused?: boolean;
  isDisconnected?: boolean;
  isLocked?: boolean;
}

export interface MediaBufferStatus {
  configured: boolean;
  reachable: boolean;
  error?: string;
  endpoint: string;
  requiredEnvironmentVariable: string;
  organizations: BufferOrganization[];
  channels: BufferChannel[];
  accounts: MediaAccount[];
  supportedPlatforms: MediaPlatform[];
  policy: {
    personalOsRemainsCalendarSourceOfTruth: boolean;
    bufferOwnsTimedDeliveryAfterApprovedHandoff: boolean;
    directProviderFallbackRetained: boolean;
    whatsappUsesDirectOrManualDelivery: boolean;
    youtubeBufferSupportIsShortsOnly: boolean;
    stablePublicAssetUrlsRequired: boolean;
  };
}

export interface MediaBufferSyncResult {
  connected: number;
  created: number;
  needsMapping: Array<{
    channelId: string;
    platform: MediaPlatform;
    accountIds: string[];
  }>;
  status: MediaBufferStatus;
}

export type MediaGrowthDimension =
  | "platform"
  | "format"
  | "content_pillar"
  | "hook_archetype"
  | "cta_archetype"
  | "publish_hour"
  | "publish_weekday"
  | "origin";

export type MediaGrowthLearningDirection = "positive" | "neutral" | "negative";

export interface MediaGrowthLearning {
  _id: string;
  dimension: MediaGrowthDimension;
  value: string;
  platform?: MediaPlatform;
  sampleSize: number;
  confidence: number;
  liftPercent: number;
  averagePerformanceScore: number;
  baselinePerformanceScore: number;
  direction: MediaGrowthLearningDirection;
  summary: string;
  recommendedAction?: string;
  evidencePublicationIds: string[];
  generatedAt?: string;
}

export type MediaGrowthExperimentStatus =
  | "planned"
  | "running"
  | "completed"
  | "cancelled";

export interface MediaGrowthExperiment {
  _id: string;
  title: string;
  hypothesis: string;
  platform?: MediaPlatform;
  variable: string;
  control: string;
  variant: string;
  controlPublicationIds: string[];
  variantPublicationIds: string[];
  status: MediaGrowthExperimentStatus;
  startedAt?: string;
  completedAt?: string;
  winner?: "control" | "variant" | "inconclusive";
  liftPercent?: number;
  resultSummary?: string;
  nextAction?: string;
  metadata: Record<string, unknown>;
}

export interface MediaPublicationPerformance {
  publicationId: string;
  contentItemId: string;
  accountId?: string;
  platform: MediaPlatform;
  format: MediaPostType;
  title: string;
  publishedAt?: string;
  performanceScore: number;
  engagementRate: number;
  shareSaveRate: number;
  followerConversionRate: number;
  impressions: number;
  reach: number;
  views: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  clicks: number;
  profileVisits: number;
  followersGained: number;
  watchTimeSeconds: number;
  averageWatchPercentage?: number;
}

export interface MediaPlatformGrowthSummary {
  platform: MediaPlatform;
  publications: number;
  averagePerformanceScore: number;
  averageEngagementRate: number;
  followersGained: number;
  reach: number;
  views: number;
}

export interface MediaAccountGrowthSummary {
  accountId: string;
  platform: MediaPlatform;
  displayName: string;
  snapshots: number;
  audience: number;
  netAudienceGrowth: number;
  growthPercent: number;
  latestCapturedAt?: string;
}

export interface MediaGrowthOverview {
  generatedAt: string;
  rangeDays: number;
  publicationsMeasured: number;
  averagePerformanceScore: number;
  totalFollowersGained: number;
  totalReach: number;
  totalViews: number;
  platformSummaries: MediaPlatformGrowthSummary[];
  accountGrowth: MediaAccountGrowthSummary[];
  topContent: MediaPublicationPerformance[];
  needsLearning: MediaPublicationPerformance[];
  learnings: MediaGrowthLearning[];
  experiments: MediaGrowthExperiment[];
  analyticsProviders: Record<
    MediaPlatform,
    { configured: boolean; mode: string }
  >;
  policy: {
    personalOsOwnsAnalyticsHistory: boolean;
    bufferIsDeliveryNotAnalyticsSourceOfTruth: boolean;
    comparisonsUseNormalizedPerformanceScores: boolean;
    learningsRequireMultipleSamples: boolean;
    learningsAreEvidenceNotHardRules: boolean;
    directorConsumesHighConfidenceLearnings: boolean;
  };
}

export type MediaEngagementType =
  | "comment"
  | "comment_reply"
  | "mention"
  | "direct_message"
  | "private_reply"
  | "whatsapp_message";

export type MediaEngagementStatus =
  | "new"
  | "open"
  | "drafted"
  | "replied"
  | "ignored"
  | "archived"
  | "failed";

export type MediaEngagementPriority = "low" | "normal" | "high" | "urgent";
export type MediaEngagementSentiment = "positive" | "neutral" | "negative" | "mixed";
export type MediaEngagementIntent =
  | "appreciation"
  | "question"
  | "support"
  | "lead"
  | "collaboration"
  | "feedback"
  | "criticism"
  | "spam"
  | "other";
export type MediaEngagementSource = "api" | "webhook" | "manual";
export type MediaEngagementReplyMode =
  | "public"
  | "private"
  | "message"
  | "manual"
  | "unavailable";

export interface MediaEngagementItem {
  _id: string;
  accountId: string;
  publicationId?: string;
  platform: MediaPlatform;
  type: MediaEngagementType;
  status: MediaEngagementStatus;
  priority: MediaEngagementPriority;
  sentiment: MediaEngagementSentiment;
  intent: MediaEngagementIntent;
  source: MediaEngagementSource;
  platformEngagementId: string;
  platformParentId?: string;
  platformThreadId?: string;
  platformConversationId?: string;
  platformAuthorId?: string;
  authorUsername?: string;
  authorDisplayName?: string;
  authorProfileUrl?: string;
  text: string;
  receivedAt: string;
  permalink?: string;
  needsResponse: boolean;
  canReply: boolean;
  replyMode: MediaEngagementReplyMode;
  replyRestriction?: string;
  aiSummary?: string;
  suggestedReply?: string;
  suggestedReplyGeneratedAt?: string;
  replyText?: string;
  repliedAt?: string;
  replyExternalId?: string;
  replyProvider?: string;
  lastSyncedAt?: string;
  lastError?: string;
  metadata: Record<string, unknown>;
  isActive: boolean;
}

export interface MediaEngagementPlatformSummary {
  platform: MediaPlatform;
  total: number;
  needsResponse: number;
  replied: number;
}

export interface MediaEngagementAccountStatus {
  _id: string;
  platform: MediaPlatform;
  displayName: string;
  canReadEngagement: boolean;
  credentialConfigured: boolean;
  readCredentialConfigured: boolean;
  writeCredentialConfigured: boolean;
  syncMode: "webhook" | "polling_and_webhook";
}

export interface MediaEngagementOverview {
  rangeDays: number;
  total: number;
  new: number;
  open: number;
  drafted: number;
  replied: number;
  urgent: number;
  needsResponse: number;
  byPlatform: MediaEngagementPlatformSummary[];
  recent: MediaEngagementItem[];
  accounts: MediaEngagementAccountStatus[];
}

export interface MediaEngagementFilters {
  platform?: MediaPlatform;
  status?: MediaEngagementStatus;
  priority?: MediaEngagementPriority;
  intent?: MediaEngagementIntent;
  needsResponse?: boolean;
  search?: string;
  limit?: number;
}

export interface MediaEngagementSyncResult {
  attempted: number;
  synced: Array<{
    accountId: string;
    platform: MediaPlatform;
    fetched: number;
    upserted: number;
    note?: string;
  }>;
  failures: Array<{ accountId: string; platform: MediaPlatform; error: string }>;
}

export type MediaAutopilotRunType = "daily" | "weekly" | "manual";
export type MediaAutopilotRunStatus = "running" | "completed" | "partial" | "failed";
export type MediaAutopilotRecommendationKind =
  | "calendar_gap"
  | "production_gap"
  | "ready_unscheduled"
  | "publishing_failure"
  | "manual_publish"
  | "engagement"
  | "growth_opportunity"
  | "growth_risk"
  | "experiment"
  | "analytics_gap"
  | "content_candidate";
export type MediaAutopilotPriority = "urgent" | "high" | "normal" | "low";
export type MediaAutopilotRecommendationStatus = "open" | "dismissed" | "completed";

export interface MediaAutopilotSettings {
  _id?: string;
  key?: string;
  enabled: boolean;
  dailyEnabled: boolean;
  weeklyEnabled: boolean;
  autoDraftCalendarGaps: boolean;
  planningHorizonDays: number;
  maxDailyDraftRuns: number;
  candidateCount: number;
  timezone: string;
  isActive: boolean;
}

export interface MediaAutopilotRecommendation {
  key: string;
  kind: MediaAutopilotRecommendationKind;
  priority: MediaAutopilotPriority;
  platform?: MediaPlatform;
  accountId?: string;
  publicationId?: string;
  engagementId?: string;
  generationRunId?: string;
  title: string;
  summary: string;
  evidence: string[];
  recommendedAction?: string;
  actionLabel?: string;
  dueAt?: string;
  status: MediaAutopilotRecommendationStatus;
  metadata: Record<string, unknown>;
  runId?: string;
  runType?: MediaAutopilotRunType;
  runCreatedAt?: string;
}

export interface MediaAutopilotStrategyReview {
  summary?: string;
  focusThisWeek: string[];
  avoidThisWeek: string[];
  experimentsToConsider: string[];
  platformPriorities: Array<{
    platform: MediaPlatform;
    priority: string;
    reason: string;
  }>;
}

export interface MediaAutopilotRun {
  _id: string;
  type: MediaAutopilotRunType;
  status: MediaAutopilotRunStatus;
  startedAt: string;
  completedAt?: string;
  windowStart: string;
  windowEnd: string;
  signals: Record<string, unknown>;
  recommendations: MediaAutopilotRecommendation[];
  strategyReview?: MediaAutopilotStrategyReview;
  generatedDraftRunIds: string[];
  runErrors: string[];
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface MediaAutopilotOverview {
  generatedAt: string;
  settings: MediaAutopilotSettings;
  latestDaily?: MediaAutopilotRun | null;
  latestWeekly?: MediaAutopilotRun | null;
  openRecommendations: MediaAutopilotRecommendation[];
  summary: {
    open: number;
    urgent: number;
    high: number;
    contentDraftsReady: number;
  };
  policy: {
    minimumPlanningHorizonDays: number;
    autopilotMayGenerateDraftCandidates: boolean;
    autopilotMayAcceptCanonicalContent: boolean;
    autopilotMaySchedule: boolean;
    autopilotMayPublish: boolean;
    autopilotMaySendEngagementReplies: boolean;
    existingConfirmationActionsRemainAuthoritative: boolean;
    antiRepetitionRemainsMandatory: boolean;
    growthLearningsAreEvidenceNotHardRules: boolean;
  };
}
