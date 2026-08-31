export type ProactiveSignalCategory =
  | "forgotten_commitment"
  | "quiet_relationship"
  | "unresolved_decision"
  | "repeatedly_deferred_task"
  | "health_trend"
  | "reading_resurface"
  | "company_risk"
  | "company_opportunity"
  | "journal_pattern"
  | "media_attention"
  | "general_attention";

export type ProactiveSignalSeverity = "low" | "medium" | "high" | "critical";
export type ProactiveSignalStatus =
  | "open"
  | "acknowledged"
  | "snoozed"
  | "dismissed"
  | "resolved";
export type ProactiveReviewPeriod = "daily" | "weekly" | "monthly";

export type ProactiveSignalEvidence = {
  citationId: string;
  nodeKey: string;
  type: string;
  label: string;
  sourceCollection: string;
  sourceId: string;
  occurredAt?: string | null;
};

export type ProactiveProposedAction = {
  label: string;
  kind: string;
  targetDomain: string;
  targetNodeKey?: string;
  reason: string;
  consequential: boolean;
  requiresConfirmation: boolean;
  status: "pending_confirmation" | "approved" | "rejected" | "not_required";
  decidedAt?: string;
};

export type ProactiveSignal = {
  _id: string;
  fingerprint: string;
  category: ProactiveSignalCategory;
  title: string;
  summary: string;
  whyNow: string;
  severity: ProactiveSignalSeverity;
  status: ProactiveSignalStatus;
  confidence: number;
  priorityScore: number;
  evidence: ProactiveSignalEvidence[];
  proposedAction?: ProactiveProposedAction;
  firstDetectedAt: string;
  lastDetectedAt: string;
  timesDetected: number;
  snoozedUntil?: string;
  generatedBy: "ai" | "fallback";
  metadata: Record<string, unknown>;
  createdAt?: string;
  updatedAt?: string;
};

export type ProactiveReviewItem = {
  title: string;
  detail: string;
  signalId?: string;
  citations: string[];
};

export type ProactiveReview = {
  _id: string;
  periodKey: string;
  period: ProactiveReviewPeriod;
  periodStart: string;
  periodEnd: string;
  title: string;
  summary: string;
  priorities: ProactiveReviewItem[];
  wins: ProactiveReviewItem[];
  patterns: ProactiveReviewItem[];
  watchlist: ProactiveReviewItem[];
  recommendations: ProactiveReviewItem[];
  signalIds: string[];
  evidenceCitationIds: string[];
  status: "draft" | "reviewed";
  reviewedAt?: string;
  ai: Record<string, unknown>;
  generatedAt: string;
};

export type ProactivePolicy = {
  version: string;
  engine: string;
  timezone: string;
  scope: string[];
  categories: ProactiveSignalCategory[];
  schedules: Record<string, string>;
  autonomy: {
    detection: string;
    briefingGeneration: string;
    signalLifecycleWrites: string;
    consequentialCrossDomainActions: string;
    automaticExternalExecution: boolean;
  };
  safeguards: string[];
};

export type ProactiveDashboard = {
  summary: {
    totalOpen: number;
    highPriority: number;
    activeNow: number;
    categories: Partial<Record<ProactiveSignalCategory, number>>;
  };
  attention: ProactiveSignal[];
  reviews: ProactiveReview[];
  generatedAt: string;
};

export type ProactiveScanResponse = {
  detected: number;
  persisted: number;
  scanSummary: string;
  signals?: ProactiveSignal[];
  semantic: {
    available: boolean;
    model: string | null;
    indexedCandidates: number;
    degradedReason: string | null;
  } | null;
  contextConfidence?: "high" | "medium" | "low" | null;
  skipped?: boolean;
  skipReason?: string;
  ai?: Record<string, unknown> | null;
  generatedAt: string;
};

export type ProactiveSignalList = {
  items: ProactiveSignal[];
  count: number;
  generatedAt: string;
};

export type ProactiveReviewList = {
  items: ProactiveReview[];
  count: number;
  generatedAt: string;
};
