import type { ReleaseHardeningStatus } from "@/types/release-hardening";

export type OpsCheckLevel = "pass" | "warning" | "fail";

export type AiUsageFeature =
  | "context_answer"
  | "proactive_scan"
  | "proactive_review"
  | "search_index_embedding"
  | "search_query_embedding";

export type AiUsageStatus = "success" | "fallback" | "error" | "blocked";

export type AiBudgetPolicy = {
  softDailyTokens: number | null;
  hardDailyTokens: number | null;
  softDailyUsd: number | null;
  hardDailyUsd: number | null;
};

export type AiBudgetStatus = {
  today: {
    totalTokens: number;
    estimatedCostUsd: number;
    requests: number;
  };
  softExceeded: boolean;
  hardExceeded: boolean;
  policy: AiBudgetPolicy;
};

export type AiUsageSummary = {
  days: number;
  from: string;
  totals: {
    totalTokens: number;
    inputTokens: number;
    outputTokens: number;
    estimatedCostUsd: number;
    requestUnits: number;
    success: number;
    fallback: number;
    errors: number;
    blocked: number;
    fallbackRate: number;
    errorRate: number;
  };
  byFeature: Array<{
    feature: AiUsageFeature;
    totalTokens: number;
    estimatedCostUsd: number;
    requestUnits: number;
  }>;
  recent: Array<{
    _id: string;
    feature: AiUsageFeature;
    status: AiUsageStatus;
    measurement: "provider" | "estimated" | "none";
    model: string | null;
    responseId: string | null;
    inputTokens: number;
    outputTokens: number;
    totalTokens: number;
    estimatedCostUsd: number | null;
    durationMs: number;
    requestUnits: number;
    metadata: Record<string, unknown>;
    error: string | null;
    occurredAt: string;
  }>;
  budget: AiBudgetStatus;
  generatedAt: string;
};

export type ProductionOpsDashboard = {
  environment: {
    nodeEnv: string | null;
    version: string | null;
    gitSha: string | null;
    timezone: string;
  };
  release: ReleaseHardeningStatus;
  ai: AiUsageSummary;
  backup: {
    strategy: string | null;
    lastVerifiedAt: string | null;
    ageDays: number | null;
    configured: boolean;
  };
  runtime: {
    activeLeases: Array<{
      key: string;
      acquiredAt: string;
      expiresAt: string;
      metadata: Record<string, unknown>;
    }>;
  };
  generatedAt: string;
};

export type ProductionOpsPolicy = {
  version: string;
  principles: string[];
  aiUsage: {
    version: string;
    retentionDays: number;
    budgets: AiBudgetPolicy;
    pricing: {
      inputUsdPerMillion: number | null;
      outputUsdPerMillion: number | null;
      embeddingUsdPerMillion: number | null;
      configured: boolean;
    };
    behavior: {
      softBudgetBlocksRequests: boolean;
      hardBudgetBlocksNewAiRequests: boolean;
      blockedStructuredRequestsFallBackToEvidenceOnly: boolean;
      blockedSemanticRequestsFallBackToLexicalSearch: boolean;
    };
  };
  smokeThresholds: {
    fallbackWarningRate: number;
    errorFailRate: number;
    backupWarningDays: number;
    backupFailDays: number;
  };
};

export type ProductionOpsSmoke = {
  readyForRc: boolean;
  score: number;
  summary: {
    passed: number;
    warnings: number;
    failures: number;
  };
  checks: Array<{
    id: string;
    label: string;
    level: OpsCheckLevel;
    detail: string;
  }>;
  releaseScore: number;
  ai: {
    days: number;
    totals: AiUsageSummary["totals"];
    budget: AiBudgetStatus;
  };
  backup: ProductionOpsDashboard["backup"];
  environment: ProductionOpsDashboard["environment"];
  generatedAt: string;
};
