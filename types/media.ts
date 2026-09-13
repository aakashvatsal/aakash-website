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

export type UpdateMediaPostPayload = Partial<CreateMediaPostPayload>;

export type MediaAccountConnectionStatus =
  "not_connected" | "connected" | "needs_reauth" | "error";

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
  type:
    | "image"
    | "video"
    | "audio"
    | "document"
    | "thumbnail"
    | "carousel"
    | "broll"
    | "other";
  role?: string;
  productionRequirementKey?: string;
  required: boolean;
  generatedFromProduction: boolean;
  source: MediaSourceType;
  url?: string;
  storageKey?: string;
  originalName?: string;
  mimeType?: string;
  sizeBytes?: number;
  libraryReusable?: boolean;
  tags?: string[];
  accessUrl?: string;
  prompt?: string;
  notes?: string;
  status: "planned" | "ready" | "archived";
  isActive?: boolean;
}

export interface MediaAssetStorageStatus {
  provider: "s3";
  configured: boolean;
  bucket: string | null;
  region: string;
  prefix: string;
  privateObjects: boolean;
  browserDirectUploads: boolean;
  serverFilesystemStorage: boolean;
  serverSideEncryption: string;
  requiredCorsMethods: string[];
}

export interface MediaAssetUploadIntent {
  asset: MediaAsset;
  upload: {
    url: string;
    expiresSeconds: number;
    requiredHeaders: Record<string, string>;
  };
}

export interface MediaProductionAssetSuggestionGroup {
  requirement: MediaAsset;
  suggestions: Array<MediaAsset & { matchScore: number }>;
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
  "content" | "publication" | "rejected_candidate";

export type MediaContentMemoryStatus = "active" | "rejected" | "archived";

export type MediaRepetitionRisk = "low" | "medium" | "high" | "blocked";

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
  "generated" | "blocked" | "accepted" | "rejected";

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
  "open" | "reserved" | "scheduled" | "published" | "cancelled";

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

export interface MediaBufferNormalizedMetrics {
  impressions?: number;
  reach?: number;
  views?: number;
  engagedViews?: number;
  likes?: number;
  comments?: number;
  shares?: number;
  saves?: number;
  clicks?: number;
  followersGained?: number;
  watchTimeSeconds?: number;
  averageViewDurationSeconds?: number;
  engagementRate?: number;
}

export interface MediaBufferInsights {
  generatedAt: string;
  configured: boolean;
  accounts: number;
  posts: Array<{
    accountId: string;
    platform: MediaPlatform;
    displayName: string;
    post: {
      id: string;
      text?: string | null;
      channelId: string;
      dueAt?: string | null;
      sentAt?: string | null;
      externalLink?: string | null;
      metricsUpdatedAt?: string | null;
      metrics?: Array<{
        type: string;
        name: string;
        value: number;
        unit: string;
      }> | null;
    };
    normalized: MediaBufferNormalizedMetrics;
  }>;
  failures: Array<{
    accountId: string;
    platform: MediaPlatform;
    displayName: string;
    error: string;
  }>;
  totals: {
    posts: number;
    impressions: number;
    reach: number;
    views: number;
    reactions: number;
    comments: number;
    shares: number;
    saves: number;
    clicks: number;
    followersGained: number;
  };
  policy: {
    metricsRefreshApproximatelyDaily: boolean;
    commentsAreCountsOnly: boolean;
    commentBodiesRemainInEngagementInbox: boolean;
    personalApiKeyRequiredForMetrics: boolean;
  };
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
  "planned" | "running" | "completed" | "cancelled";

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
  "new" | "open" | "drafted" | "replied" | "ignored" | "archived" | "failed";

export type MediaEngagementPriority = "low" | "normal" | "high" | "urgent";
export type MediaEngagementSentiment =
  "positive" | "neutral" | "negative" | "mixed";
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
  "public" | "private" | "message" | "manual" | "unavailable";

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
  failures: Array<{
    accountId: string;
    platform: MediaPlatform;
    error: string;
  }>;
}

export type MediaAutopilotRunType = "daily" | "weekly" | "manual";
export type MediaAutopilotRunStatus =
  "running" | "completed" | "partial" | "failed";
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
export type MediaAutopilotRecommendationStatus =
  "open" | "dismissed" | "completed";

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

export type MediaContextPrivacy =
  "private_only" | "internal_safe" | "public_safe" | "needs_review";

export interface MediaWorldContextItem {
  id: string;
  source: string;
  kind: string;
  title: string;
  summary: string;
  occurredAt: string;
  privacy: MediaContextPrivacy;
  significantChange: boolean;
  publishable: boolean;
}

export interface MediaWorldCompanyContext {
  id: string;
  name: string;
  roles: string[];
  industries: string[];
  products: string[];
  markets: string[];
  currentFocus?: string;
  currentPriorities: string[];
  principles: string[];
  targetCustomer?: string;
  status?: string;
  stage?: string;
}

export interface MediaPresenceStrategy {
  _id?: string;
  key: string;
  version: number;
  northStar: string;
  positioning: string;
  knownFor: string[];
  audiences: Array<{
    name: string;
    need: string;
    desiredPerception: string;
  }>;
  narratives: Array<{
    key: string;
    title: string;
    role: string;
    targetSharePercent: number;
    companyName?: string;
    guardrails: string[];
  }>;
  platformRoles: Array<{
    platform: MediaPlatform;
    role: string;
    purpose: string;
    primaryFormats: MediaPostType[];
    minPostsPerWeek: number;
    preferredPostsPerWeek: number;
    maxPostsPerWeek: number;
    allowSkipDays: boolean;
  }>;
  companyBalance: Array<{
    companyName: string;
    narrativeRole: string;
    targetSharePercent: number;
    guardrails: string[];
  }>;
  thirtyDayObjectives: string[];
  ninetyDayObjectives: string[];
  reputationGoals: string[];
  neverBecome: string[];
  claimsRequiringReview: string[];
  privacyRules: string[];
  aiModel: string;
  aiResponseId?: string;
  sourceFingerprint: string;
  generatedAt: string;
}

export interface MediaVoiceProfile {
  _id?: string;
  key: string;
  version: number;
  summary: string;
  principles: string[];
  sentenceRhythm: string;
  vocabulary: string;
  humour: string;
  profanity: string;
  technicalDepth: string;
  emotionalOpenness: string;
  storytelling: string;
  doMore: string[];
  doNot: string[];
  avoidPhrases: string[];
  authenticityChecks: string[];
  confidence: number;
  sourceSampleCount: number;
  aiModel: string;
  aiResponseId?: string;
  sourceFingerprint: string;
  generatedAt: string;
}

export interface MediaPresenceContextOverview {
  generatedAt: string;
  windowDays: number;
  fingerprint: string;
  coverage: {
    capturedDays: number;
    totalItems: number;
    publicSafe: number;
    internalSafe: number;
    needsReview: number;
    privateOnly: number;
    sourceCounts: Record<string, number>;
    missingSources: string[];
  };
  companies: MediaWorldCompanyContext[];
  hsakaa: {
    latestBrief?: {
      headline: string;
      summary: string;
      opportunities: string[];
      generatedAt: string;
    };
    latestWeeklyReview?: {
      headline: string;
      summary: string;
      lessons: string[];
      nextWeekPriorities: string[];
      generatedAt: string;
    };
  };
  publicSafePreview: MediaWorldContextItem[];
  internalSafePreview: MediaWorldContextItem[];
  needsReviewPreview: MediaWorldContextItem[];
  policy: {
    privateOnlyDetailsExposedToMedia: false;
    internalSafeMayInspireButNotBePublishedAsFact: true;
    needsReviewRequiresOwnerApprovalBeforePublicUse: true;
    publicSafeMayBeUsedAsEvidence: true;
    companyMetricsExcludedUnlessSeparatelyVerifiedPublicSafe: true;
    wholeLifeSignalsAreSanitizedInternalSafeCues?: true;
    directHobbiesAreFirstClassContext?: true;
    personalOsSectionsAreInspectedWithoutPrivateDetails?: true;
  };
}

export interface MediaPresenceOverview {
  generatedAt: string;
  strategy: MediaPresenceStrategy | null;
  voice: MediaVoiceProfile | null;
  context: MediaPresenceContextOverview;
  policy: {
    wholeOsContextEnabled: boolean;
    privateOnlyDetailsSentToMediaGeneration: boolean;
    internalSafeCanShapeStrategy: boolean;
    needsReviewCannotBecomePublicFactWithoutApproval: boolean;
    publicSafeCanGroundContent: boolean;
    contentDirectorConsumesPresenceStrategy: boolean;
    contentDirectorConsumesVoiceProfile: boolean;
    autonomousPublishingEnabled: boolean;
  };
}

export interface MediaWorldContext extends Omit<
  MediaPresenceContextOverview,
  "publicSafePreview" | "internalSafePreview" | "needsReviewPreview"
> {
  publicSafe: MediaWorldContextItem[];
  internalSafe: MediaWorldContextItem[];
  needsReview: MediaWorldContextItem[];
  privateOnlyCount: number;
  hobbies?: Array<{
    id: string;
    name: string;
    status: string;
    intensity: string;
    currentStageKey?: string;
    currentStageTitle?: string;
    nextFocus?: string;
    weeklyTargetMinutes: number;
    weeklyMinutes: number;
    sessionsThisWeek: number;
    pace?: string;
    recommendedTodayMinutes: number;
    updatedAt?: string;
  }>;
  personalOsSections?: Array<{
    source: string;
    totalItems: number;
    publicSafe: number;
    internalSafe: number;
    needsReview: number;
    privateOnly: number;
    latestSafeItems: Array<{
      id: string;
      kind: string;
      title: string;
      occurredAt: string;
      privacy: string;
    }>;
  }>;
  recentMedia: Array<{
    id: string;
    title: string;
    thesis?: string;
    origin: string;
    contentPillars: string[];
    createdAt?: string;
  }>;
}

export type MediaPublicIdentityPillar =
  | "builder_operator"
  | "ideas_thinking"
  | "learning_experiments"
  | "building_aakash"
  | "human_unfiltered";

export interface MediaPlanningOpportunity {
  key: string;
  title: string;
  thesis: string;
  whyNow: string;
  sourceSummary: string;
  evidenceIds: string[];
  companyName?: string;
  narrative: string;
  strategyNarrativeKey: string;
  topicClusterKey: string;
  growthIntent:
    "authority" | "discovery" | "conversion" | "affinity" | "conversation";
  identityPillar: MediaPublicIdentityPillar;
  platforms: MediaPlatform[];
  formats: MediaPostType[];
  strategicFit: number;
  novelty: number;
  evidenceStrength: number;
  privacy: "public_safe" | "needs_review";
  usable: boolean;
}

export interface MediaPlanningStoryArc {
  key: string;
  title: string;
  purpose: string;
  narrative: string;
  companyName?: string;
  durationDays: number;
  beats: Array<{
    order: number;
    title: string;
    purpose: string;
    opportunityKey?: string;
    platforms: MediaPlatform[];
  }>;
}

export interface MediaPlanningImageBrief {
  mode: "none" | "ai_generation" | "real_photo" | "designed_graphic";
  aspectRatio: string;
  overlayText: string;
  prompt: string;
  description: string;
  sourceGuidance: string;
}

export interface MediaPlanningCarouselSlide {
  slideNumber: number;
  headline: string;
  bodyCopy: string;
  visualType: "ai_image" | "real_photo" | "designed_graphic" | "text_only";
  imagePrompt: string;
  visualDescription: string;
  overlayText: string;
}

export interface MediaPlanningTimedDirection {
  at: string;
  instruction: string;
}

export interface MediaPlanningVideoPack {
  fullScript: string;
  targetDurationSeconds: number;
  deliveryInstructions: string;
  cameraInstructions: string;
  punchIns: MediaPlanningTimedDirection[];
  broll: MediaPlanningTimedDirection[];
  onScreenText: MediaPlanningTimedDirection[];
  musicDirection: string;
  coverDirection: string;
}

export interface MediaPlanningStoryFrame {
  order: number;
  overlayText: string;
  spokenText: string;
  visualDescription: string;
  captureInstruction: string;
  interactiveElement: string;
}

export interface MediaPlanningDailyStory {
  action: "post" | "skip";
  time: string;
  sourceType:
    | "routine"
    | "current_work"
    | "learning"
    | "hobby"
    | "personal_growth"
    | "professional"
    | "human_moment";
  sourceEvidenceIds: string[];
  reason: string;
  captureBrief: string;
  frames: MediaPlanningStoryFrame[];
  executionReady: boolean;
  readinessIssues: string[];
}

export interface MediaPlanningYoutubeCommunityPost {
  action: "post" | "skip";
  time: string;
  format: "text" | "image" | "poll";
  sourceType:
    | "routine"
    | "current_work"
    | "learning"
    | "hobby"
    | "personal_growth"
    | "professional"
    | "human_moment";
  sourceEvidenceIds: string[];
  reason: string;
  publishCopy: string;
  imageBrief: MediaPlanningImageBrief;
  pollQuestion: string;
  pollOptions: string[];
  executionReady: boolean;
  readinessIssues: string[];
}

export interface MediaPlanningExecution {
  platform: MediaPlatform;
  action: "post" | "skip";
  time: string;
  format: MediaPostType;
  formatIntent: string;
  opportunityKey?: string;
  storyArcKey?: string;
  reason: string;
  whyThisFormat: string;
  whyThisTime: string;
  title: string;
  hook: string;
  caption: string;
  script: string;
  description: string;
  cta: string;
  hashtags: string[];
  slides: string[];
  coverText: string;
  thumbnailText: string;
  pinnedComment: string;
  storyFollowUp: string;
  productionNotes: string;
  publishCopy: string;
  copyPasteText: string;
  copyPasteCaption: string;
  evidenceIds: string[];
  imageBrief: MediaPlanningImageBrief;
  carouselSlides: MediaPlanningCarouselSlide[];
  videoPack: MediaPlanningVideoPack;
  xThread: string[];
  whatsappSequence: string[];
  executionReady: boolean;
  readinessIssues: string[];
  estimatedMinutes: number;
  requiresApproval: boolean;
}

export interface MediaPlanningEngagementTask {
  platform: MediaPlatform;
  time: string;
  count: number;
  purpose: string;
  guidance: string;
}

export interface MediaPlanningWeekContext {
  outingStatus: "yes" | "no" | "maybe" | "unknown";
  outingDetails: string;
  weekKey: string;
  capturedAt: string;
}

export interface MediaPlanningCycle {
  _id?: string;
  key: string;
  startDate: string;
  endDate: string;
  timezone: string;
  learningStage: string;
  summary: string;
  opportunities: MediaPlanningOpportunity[];
  storyArcs: MediaPlanningStoryArc[];
  weekContext?: MediaPlanningWeekContext;
  days: Array<{
    date: string;
    theme: string;
    workload: string;
    executions: MediaPlanningExecution[];
    instagramStory?: MediaPlanningDailyStory;
    youtubeCommunity?: MediaPlanningYoutubeCommunityPost;
    engagement: MediaPlanningEngagementTask[];
  }>;
  strategyFingerprint: string;
  contextFingerprint: string;
  aiModel: string;
  aiResponseId?: string;
  generatedAt: string;
}

export type MediaPlanningPartialPlan = Partial<
  Pick<
    MediaPlanningCycle,
    | "startDate"
    | "endDate"
    | "timezone"
    | "learningStage"
    | "summary"
    | "opportunities"
    | "storyArcs"
    | "days"
  >
>;

export interface MediaPlanningArchiveItem {
  date: string;
  planId: string;
  generatedAt: string;
  day: MediaPlanningCycle["days"][number];
  completion: {
    total: number;
    actionable: number;
    done: number;
    completionPercent: number;
    statuses: Record<string, number>;
  };
  publication: {
    plannedPlatforms: MediaPlatform[];
    publishedPlatforms: MediaPlatform[];
    publishedCount: number;
    allPlannedPlatformsPublished: boolean;
  };
}

export interface MediaPlanningGenerationJob {
  jobId: string;
  status: "generating" | "generated" | "failed";
  stage: string;
  progress: number;
  error: string | null;
  planId: string | null;
  planStartDate: string | null;
  planEndDate: string | null;
  queuedAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  completedDays: number;
  totalDays: number;
  usage: {
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    cachedInputTokens: number;
    reasoningTokens: number;
    calls: number;
    failedCalls: number;
    retriedCalls: number;
  };
  partialPlan: MediaPlanningPartialPlan | null;
}

export interface MediaPlanningOverview {
  generatedAt: string;
  latest: MediaPlanningCycle | null;
  stalePlanDetected?: boolean;
  rolling?: {
    epoch: string;
    startDate: string;
    endDate: string;
    expectedDates: string[];
    missingDates: string[];
    canAutoRoll: boolean;
    freshStartRequired: boolean;
    needsWeeklyContext: boolean;
    weekKey: string;
    weekContext: MediaPlanningWeekContext & { capturedAt: string | null };
  };
  presenceReady: boolean;
  calendarCoverage: Array<{
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
  }>;
  policy: {
    horizonDays: number;
    timezone: string;
    postingEveryDayRequired: boolean;
    exactPostingTimesRequired: boolean;
    version?: string;
    platformNativeCopyRequired: boolean;
    copyPasteTextRequired?: boolean;
    copyPasteCaptionRequired?: boolean;
    completeCarouselPackRequired?: boolean;
    completeVideoScriptRequired?: boolean;
    evidenceIdsRequiredForPublicSafeOpportunities?: boolean;
    unresolvedReadinessIssuesAllowed?: boolean;
    engagementTasksIncluded: boolean;
    approvalRequiredBeforeCanonicalAcceptanceOrPublishing: boolean;
    planningUsesHistoricalAntiRepetitionMemory?: boolean;
    planningUsesArchivedPlanAntiRepetitionMemory?: boolean;
    publicFigureGrowthObjective?: boolean;
    rollingWindow?: {
      epoch: string;
      todayPlusFutureDays: number;
      singleDayRefreshSupported: boolean;
      archiveRetainsCompletionAndPublicationSignals: boolean;
      weeklyOutingContextRequired: boolean;
    };
    growthObjective?: {
      targetFollowers: number;
      currentKnownFollowers: number;
      remainingToTarget: number;
      knownPlatforms: string[];
      unknownPlatforms: string[];
      mode: "fastest_sustainable";
      priorities: string[];
      guardrails: string[];
    };
    strategyNarratives?: Array<{
      key: string;
      title: string;
      targetSharePercent: number;
    }>;
    sustainableWeeklyCadence?: {
      longFormVideos: number;
      shortFormAndCarousels: string;
      instagramStories: number;
      youtubeCommunityPosts?: string;
      linkedinFeedPosts: string;
      instagramFeedPosts?: string;
      youtubeFeedPosts?: string;
      xFeedPosts: string;
      whatsappPresence: string;
    };
    planningUsesDirectHobbiesContext?: boolean;
    planningInspectsAllPersonalOsSections?: boolean;
    crossPlatformDerivativesCountAsOneTopicCluster?: boolean;
    hobbySignalSurfaceCap?: number;
  };
}

export type MediaAudienceSignalType =
  | "question"
  | "objection"
  | "agreement"
  | "problem"
  | "lead"
  | "collaboration"
  | "language"
  | "content_request";

export interface MediaPerformanceInsight {
  _id?: string;
  publicationId: string;
  contentItemId?: string;
  platform: MediaPlatform;
  format: MediaPostType;
  period: "1_hour" | "24_hours" | "72_hours" | "7_days" | "30_days" | "latest";
  percentile: number;
  confidence: number;
  identityPillar: MediaPublicIdentityPillar;
  publicFigureSignals: {
    reach: number;
    authority: number;
    affinity: number;
    engagement: number;
  };
  summary: string;
  whyItWorked: string;
  whatLimitedIt: string;
  doMore: string[];
  doLess: string[];
  nextExperiment: string;
  mechanisms: string[];
  evidence: Record<string, unknown>;
  generatedAt: string;
}

export interface MediaAudienceInsight {
  _id?: string;
  key: string;
  type: MediaAudienceSignalType;
  topic: string;
  summary: string;
  platforms: MediaPlatform[];
  occurrences: number;
  confidence: number;
  examples: string[];
  engagementIds: string[];
  recommendedContentAngle: string;
  recommendedPlatforms: string[];
  highIntent: boolean;
  generatedAt: string;
}

export interface MediaLifecycleDueItem {
  publicationId: string;
  platform: MediaPlatform;
  format: MediaPostType;
  title: string;
  publishedAt?: string;
  period: "1_hour" | "24_hours" | "72_hours" | "7_days" | "30_days";
}

export interface MediaLearningOverview {
  generatedAt: string;
  rangeDays: number;
  lifecycle: {
    publications: number;
    dueSnapshots: number;
    due: MediaLifecycleDueItem[];
    coverage: Record<string, number>;
  };
  performance: MediaPerformanceInsight[];
  audience: MediaAudienceInsight[];
  pillarSignals: Array<{
    pillar: MediaPublicIdentityPillar;
    samples: number;
    confidence: number;
    reach: number;
    authority: number;
    affinity: number;
    engagement: number;
  }>;
  policy: {
    lifecyclePeriods: string[];
    compareAgainstOwnPlatformFormatBaseline: boolean;
    learnMechanismNotExactWording: boolean;
    audienceQuestionsBecomePlanningEvidence: boolean;
    engagementSendingStillRequiresApproval: boolean;
    publicFigureLearningUsesReachAuthorityAffinityEngagement: boolean;
  };
}

export interface MediaPresencePlatformScore {
  platform: MediaPlatform;
  score: number;
  consistency: number;
  reachMomentum: number;
  contentQuality: number;
  audienceResponse: number;
  strategicFit: number;
  dataConfidence: number;
  rationale: string;
}

export interface MediaPresenceReview {
  _id?: string;
  key: string;
  windowStart: string;
  windowEnd: string;
  overallScore: number;
  previousScore?: number;
  scoreDelta: number;
  dataConfidence: number;
  platformScores: MediaPresencePlatformScore[];
  summary: string;
  wins: string[];
  risks: string[];
  focusThisWeek: string[];
  avoidThisWeek: string[];
  experiments: string[];
  planningGuidance: string[];
  cadenceAdjustments: Array<{
    platform: MediaPlatform;
    direction: "increase" | "hold" | "decrease";
    reason: string;
  }>;
  narrativeAdjustments: Array<{
    narrative: string;
    direction: "increase" | "hold" | "decrease";
    reason: string;
  }>;
  strategyChangeCandidates: Array<{
    field: string;
    proposedChange: string;
    reason: string;
    requiresApproval: true;
  }>;
  sourceFingerprint: string;
  aiModel: string;
  aiResponseId?: string;
  generatedAt: string;
}

export interface MediaPresenceOsOverview {
  generatedAt: string;
  latest: MediaPresenceReview | null;
  policy: {
    weeklyOverlayMayAdaptAutomatically: boolean;
    coreThirtyNinetyDayStrategyMutatesAutomatically: boolean;
    largeStrategyChangesRequireApproval: boolean;
    scoreUsesOwnMeasuredData: boolean;
    lowDataConfidenceIsShownExplicitly: boolean;
  };
}

export type MediaExecutionKind =
  | "post"
  | "production"
  | "engagement"
  | "manual_publish"
  | "analytics_review"
  | "inbound_reply";

export type MediaExecutionStatus =
  "pending" | "done" | "missed" | "blocked" | "rescheduled" | "skipped";

export interface MediaDailyExecution {
  _id?: string;
  key: string;
  date: string;
  kind: MediaExecutionKind;
  status: MediaExecutionStatus;
  platform?: MediaPlatform;
  title: string;
  time?: string;
  sourceKey?: string;
  sourceId?: string;
  plannedCount: number;
  completedCount: number;
  instruction?: string;
  notes?: string;
  blockedReason?: string;
  rescheduledTo?: string;
  completedAt?: string;
  isActive: boolean;
}

export interface MediaTodayOverview {
  generatedAt: string;
  date: string;
  timezone: string;
  presenceScore: {
    overall: number;
    delta: number;
    confidence: number;
    platforms: MediaPresencePlatformScore[];
  } | null;
  plan: { id: string; startDate: string; endDate: string } | null;
  day: MediaPlanningCycle["days"][number] | null;
  theme: string;
  workload: string;
  totalPlannedMinutes: number;
  posts: MediaPlanningExecution[];
  skips: MediaPlanningExecution[];
  production: Array<{
    platform: MediaPlatform;
    time: string;
    title: string;
    format: MediaPostType;
    estimatedMinutes: number;
    instruction: string;
  }>;
  engagement: MediaPlanningEngagementTask[];
  inboundReplies: MediaEngagementItem[];
  publishing: MediaPublication[];
  manualPublishing: MediaPublication[];
  analyticsDue: MediaLifecycleDueItem[];
  execution: {
    tasks: MediaDailyExecution[];
    carryForward: MediaDailyExecution[];
    summary: {
      total: number;
      actionable: number;
      done: number;
      completionPercent: number;
      counts: Record<string, number>;
    };
  };
  review: {
    weeklyFocus: string[];
    weeklyAvoid: string[];
    strategyChangeCandidates: MediaPresenceReview["strategyChangeCandidates"];
  };
  health: {
    degraded: boolean;
    issues: string[];
  };
  policy: {
    todayIsSingleOperatingView: boolean;
    skipIsAValidAction: boolean;
    exactPlatformCopyComesFromPresencePlan: boolean;
    outboundEngagementIsGuidanceUntilSpecificExternalTargetsAreAvailable: boolean;
    inboundRepliesStillRequireApproval: boolean;
    publishingStillRequiresExistingApprovalFlow: boolean;
    materialStrategyChangesRequireApproval: boolean;
    executionProgressIsPersisted: boolean;
    unfinishedRecentWorkIsCarriedForward: boolean;
  };
}

export interface MediaOperationsPlatformHealth {
  platform: MediaPlatform;
  status: "ready" | "partial" | "blocked";
  accountId?: string;
  accountName?: string;
  username?: string;
  connectionStatus: string;
  deliveryProvider: string;
  capabilities: Record<string, unknown> | null;
  automaticDeliveryReady: boolean;
  manualFallbackReady: boolean;
  directCredentialConfigured: boolean;
  buffer: {
    supported: boolean;
    connected: boolean;
    healthy: boolean;
  };
  analytics: {
    applicable: boolean;
    configured: boolean;
    mode: string;
  };
  engagement: {
    readConfigured: boolean;
    writeConfigured: boolean;
  };
  issues: string[];
  actions: string[];
}

export interface MediaOperationsOverview {
  generatedAt: string;
  status: "ready" | "attention" | "blocked";
  platforms: MediaOperationsPlatformHealth[];
  queue: {
    scheduled: number;
    publishing: number;
    manualRequired: number;
    failed: number;
    overdue: number;
    retryScheduled: number;
    exhausted: number;
    stuckPublishing: number;
    requiresAttention: number;
    retryPolicy: {
      maxAttempts: number;
      delayMinutes: number;
      stuckPublishingMinutes: number;
    };
  };
  lifecycle: {
    measuredPublications: number;
    dueSnapshots: number;
    coverage: Record<string, number>;
  };
  buffer: {
    configured: boolean;
    reachable: boolean;
    error?: string;
    supportedPlatforms: MediaPlatform[];
  };
  policy: {
    approvalRequiredBeforePublishing: boolean;
    approvalRequiredBeforeEngagementReply: boolean;
    automaticRetriesAreBounded: boolean;
    ambiguousDirectDeliveryNeverAutoRetries: boolean;
    bufferHandoffUsesAuthoritativeReconciliation: boolean;
    manualFallbackIsAllowed: boolean;
    whatsappStatusRemainsManual: boolean;
    operationsHealthNeverExposesCredentialValues: boolean;
  };
}

export interface MediaOperationsRepairResult {
  ranAt: string;
  stuck: {
    checked: number;
    bufferManaged: number;
    manualReview: number;
  };
  buffer: {
    checked: number;
    published: number;
    failed: number;
    pending: number;
  };
  policy: {
    doesNotPublishNewContent: boolean;
    doesNotSendEngagementReplies: boolean;
    doesNotBlindlyRetryAmbiguousDirectPublishes: boolean;
  };
}

export type MediaLaunchPhase =
  | "days_1_30_exploration"
  | "days_31_90_pattern_discovery"
  | "day_91_plus_compounding";

export interface MediaLaunchProfilePlan {
  platform: MediaPlatform;
  objective: string;
  headline: string;
  bio: string;
  linkStrategy: string;
  profileImageGuidance: string;
  bannerGuidance: string;
  pinnedOrFeatured: string[];
  setupChecklist: string[];
  applied: boolean;
  appliedAt?: string;
}

export interface MediaLaunchExperimentPolicy {
  experimentSharePercent: number;
  minimumSamplesBeforeConclusion: number;
  minimumDistinctFormatsPerWeek: number;
  minimumDistinctNarrativesPerWeek: number;
  preserveVoiceOverOptimization: boolean;
  avoidEarlyWinnerLockIn: boolean;
}

export interface MediaLaunchState {
  _id?: string;
  key: string;
  status: "draft" | "active" | "paused";
  startedAt: string;
  notes: string;
  profilePlans: MediaLaunchProfilePlan[];
  experimentPolicy: MediaLaunchExperimentPolicy;
  aiModel: string;
  aiResponseId?: string;
  strategyFingerprint: string;
  voiceFingerprint: string;
  generatedAt: string;
  isActive: boolean;
}

export interface MediaLaunchOverview {
  generatedAt: string;
  state: MediaLaunchState | null;
  phase: MediaLaunchPhase;
  dayNumber: number;
  launchStartedAt: string | null;
  readiness: {
    presenceStrategyReady: boolean;
    voiceProfileReady: boolean;
    profilePlanReady: boolean;
    profilesApplied: number;
    totalProfiles: number;
    publishingReadyPlatforms: number;
    blockedPlatforms: number;
    canPlan: boolean;
    canPublishEverywhere: boolean;
  };
  blockers: string[];
  policy: {
    firstThirtyDaysAreExploration: boolean;
    earlyPerformanceDoesNotRewriteIdentity: boolean;
    minimumEvidenceBeforeConclusion: number;
    preserveAakashVoiceOverOptimization: boolean;
    profileSetupCanBeAppliedManually: boolean;
    planningCanStartBeforeEveryConnectorIsReady: boolean;
    publishingStillRequiresExistingApprovalFlow: boolean;
  };
}

export interface MediaLaunchBootstrapResult {
  launch: MediaLaunchState;
  plan: MediaPlanningCycle;
}

export type MediaPublicationReviewStatus =
  "needs_review" | "changes_required" | "approved" | "stale";

export type MediaPreflightCheckStatus = "pass" | "warn" | "block";

export type MediaPreflightCheckCategory =
  | "completeness"
  | "production"
  | "authenticity"
  | "platform_fit"
  | "clarity"
  | "evidence"
  | "privacy"
  | "novelty";

export interface MediaPublicationReview {
  _id: string;
  publicationId: string;
  contentItemId: string;
  platform: MediaPlatform;
  format: MediaPostType;
  status: MediaPublicationReviewStatus;
  overallScore: number;
  authenticityScore: number;
  platformFitScore: number;
  clarityScore: number;
  evidenceScore: number;
  privacyScore: number;
  noveltyScore: number;
  productionScore: number;
  checks: Array<{
    category: MediaPreflightCheckCategory;
    status: MediaPreflightCheckStatus;
    title: string;
    message: string;
  }>;
  strengths: string[];
  changesRequired: string[];
  sourceFingerprint: string;
  reviewedProductionVersion: number;
  presenceStrategyVersion?: number;
  voiceProfileVersion?: number;
  generatedAt?: string;
  approvedAt?: string;
  ownerNote?: string;
}

export interface MediaReviewQueueItem {
  publication: MediaPublication;
  review: MediaPublicationReview | null;
  state: "not_reviewed" | MediaPublicationReviewStatus;
}

export interface MediaReviewOverview {
  generatedAt: string;
  items: MediaReviewQueueItem[];
  summary: {
    total: number;
    notReviewed: number;
    needsReview: number;
    changesRequired: number;
    approved: number;
    stale: number;
  };
  policy: {
    productionReadinessIsNecessaryButNotSufficient: boolean;
    ownerApprovalRequiredBeforeScheduleOrPublish: boolean;
    approvedReviewBecomesStaleWhenContentProductionOrAssetsChange: boolean;
    blockingPrivacyEvidenceNoveltyOrCompletenessChecksCannotBeOverriddenByScheduling: boolean;
    warningsMayBeApprovedByOwner: boolean;
  };
}

export type MediaReleaseCheckStatus = "pass" | "warn" | "block";
export type MediaReleaseStage =
  | "intelligence"
  | "launch"
  | "planning"
  | "production"
  | "review"
  | "delivery"
  | "learning"
  | "integrity";

export interface MediaReleaseCheck {
  key: string;
  stage: MediaReleaseStage;
  title: string;
  status: MediaReleaseCheckStatus;
  message: string;
  action?: string;
}

export interface MediaReleaseOverview {
  generatedAt: string;
  timezone: string;
  status: "ready" | "attention" | "blocked";
  releaseCandidateReady: boolean;
  score: number;
  blockers: Array<{
    key: string;
    title: string;
    message: string;
    action?: string;
  }>;
  warnings: Array<{
    key: string;
    title: string;
    message: string;
    action?: string;
  }>;
  checks: MediaReleaseCheck[];
  stages: Array<{
    stage: MediaReleaseStage;
    status: "ready" | "attention" | "blocked";
    passed: number;
    total: number;
  }>;
  snapshot: {
    today: string;
    plan: {
      id: string;
      startDate: string;
      endDate: string;
      days: number;
    } | null;
    launchDay: number;
    launchPhase: string;
    profilesApplied: number;
    reviewQueue: {
      total: number;
      notReviewed: number;
      needsReview: number;
      changesRequired: number;
      approved: number;
      stale: number;
    };
    operations: {
      status: "ready" | "attention" | "blocked";
      queueRequiresAttention: number;
      dueSnapshots: number;
    };
    integrity: {
      activePublicationsAudited: number;
      scheduledPublicationsAudited: number;
      scheduledOrphans: number;
      orphanedPublications: number;
      scheduledWithoutFreshApproval: number;
      scheduledWithPendingRequiredAssets: number;
      unverifiedLibraryAssets: number;
      auditCap: {
        activePublications: number;
        scheduledPublications: number;
      };
    };
  };
  policy: {
    thisAuditNeverPublishesContent: boolean;
    thisAuditNeverSendsEngagementReplies: boolean;
    ownerApprovedFreshPreflightIsRequiredForScheduledContent: boolean;
    everyPlanningDayMustExplicitlyPostOrSkipAllFivePrimaryPlatforms: boolean;
    safeRepairOnlyReconcilesExistingDeliveryState: boolean;
    releaseReadinessDoesNotOverridePrivacyOrEvidenceBlocks: boolean;
  };
}

export interface MediaReleaseRepairResult {
  ranAt: string;
  operations: MediaOperationsRepairResult;
  overview: MediaReleaseOverview;
  policy: {
    doesNotPublishNewContent: boolean;
    doesNotGenerateNewContent: boolean;
    doesNotSendEngagementReplies: boolean;
    doesNotApprovePreflight: boolean;
    doesNotBlindlyRetryAmbiguousDirectPublishes: boolean;
  };
}

export type MediaSocialProfileSyncStatus =
  "synced" | "not_configured" | "not_supported" | "error";

export type MediaSocialRecommendationStatus =
  "recommended" | "followed" | "dismissed";

export type MediaSocialRecommendationPriority = "high" | "medium" | "low";

export type MediaSocialRecommendationVerification =
  "verified" | "unverified" | "manual_required";

export interface MediaSocialProfile {
  _id: string;
  accountId: string;
  platform: MediaPlatform;
  externalAccountId?: string;
  displayName?: string;
  username?: string;
  headline?: string;
  bio?: string;
  profileUrl?: string;
  profileImageUrl?: string;
  bannerUrl?: string;
  websiteUrl?: string;
  followerCount?: number;
  followingCount?: number;
  mediaCount?: number;
  verified?: boolean;
  syncStatus: MediaSocialProfileSyncStatus;
  syncNote?: string;
  syncedAt?: string;
  metadata: Record<string, unknown>;
  isActive: boolean;
}

export interface MediaSocialFollowing {
  _id: string;
  accountId: string;
  platform: MediaPlatform;
  identityKey: string;
  externalProfileId?: string;
  username?: string;
  displayName?: string;
  profileUrl?: string;
  profileImageUrl?: string;
  source: string;
  observedAt: string;
  isActive: boolean;
  metadata: Record<string, unknown>;
}

export interface MediaSocialRecommendation {
  _id: string;
  platform: MediaPlatform;
  identityKey: string;
  externalProfileId?: string;
  username?: string;
  displayName: string;
  profileUrl?: string;
  profileImageUrl?: string;
  category: string;
  whyFollow: string;
  whatToLearn: string;
  doNotImitate: string;
  priority: MediaSocialRecommendationPriority;
  status: MediaSocialRecommendationStatus;
  verification: MediaSocialRecommendationVerification;
  verificationNote?: string;
  source?: string;
  firstRecommendedAt: string;
  lastRecommendedAt: string;
  actedAt?: string;
  metadata: Record<string, unknown>;
  isActive: boolean;
}

export interface MediaSocialProfileTextAudit {
  platform: MediaPlatform;
  verdict: "keep" | "change" | "review";
  headlineVerdict: "keep" | "change" | "not_applicable";
  bioVerdict: "keep" | "change" | "not_applicable";
  linkVerdict: "keep" | "change" | "review" | "not_applicable";
  bannerVerdict: "keep" | "change" | "review" | "not_applicable";
  recommendedHeadline: string;
  recommendedBio: string;
  recommendedLink: string;
  reasons: string[];
  confidence: "low" | "medium" | "high";
}

export interface MediaSocialProfileImageAudit {
  inspected: boolean;
  verdict: "keep" | "change" | "review";
  summary: string;
  strengths: string[];
  improvements: string[];
  confidence: "low" | "medium" | "high";
}

export interface MediaSocialPresencePlatformReview {
  platform: MediaPlatform;
  connected: boolean;
  syncStatus: MediaSocialProfileSyncStatus | "missing";
  current: {
    displayName: string;
    username: string;
    headline: string;
    bio: string;
    profileUrl: string;
    profileImageUrl: string;
    bannerUrl: string;
    websiteUrl: string;
    followerCount: number | null;
    followingCount: number | null;
  } | null;
  launchPlan: MediaLaunchProfilePlan | null;
  audit: MediaSocialProfileTextAudit;
  photoAudit: MediaSocialProfileImageAudit;
  changeRecommended: boolean;
}

export interface MediaSocialPresenceReview {
  _id: string;
  weekOf: string;
  generatedAt: string;
  summary: string;
  platformReviews: MediaSocialPresencePlatformReview[];
  wins: string[];
  changesRecommended: string[];
  networkActions: string[];
  profileChangesRecommended: number;
  profilesKept: number;
  recommendationsActive: number;
  metadata: Record<string, unknown>;
}

export interface MediaSocialPresenceAccountOverview {
  account: MediaAccount;
  profile: MediaSocialProfile | null;
  nativeSync: {
    profileReadConfigured: boolean;
    networkRead: string;
    profileWrite: string;
    followWrite: string;
    note: string;
  };
  observedFollowingCount: number;
}

export interface MediaSocialPresenceOverview {
  generatedAt: string;
  policy: {
    auditWeeklyChangeRarely: boolean;
    autoProfileChanges: boolean;
    autoFollow: boolean;
    recommendationsRequireHumanAction: boolean;
    sundayReview: string;
  };
  accounts: MediaSocialPresenceAccountOverview[];
  following: MediaSocialFollowing[];
  recommendations: MediaSocialRecommendation[];
  activeRecommendations: MediaSocialRecommendation[];
  latestReview: MediaSocialPresenceReview | null;
  reviews: MediaSocialPresenceReview[];
}
