export type ReleaseCheckLevel = "pass" | "warning" | "fail";

export type ReleaseHardeningCheck = {
  id: string;
  label: string;
  level: ReleaseCheckLevel;
  detail: string;
};

export type ReleaseHardeningPolicy = {
  version: string;
  scope: string[];
  principles: string[];
  thresholds: {
    graphFreshMinutes: number;
    graphFailHours: number;
    semanticWarningCoverage: number;
    semanticFailCoverage: number;
  };
};

export type ReleaseHardeningStatus = {
  ready: boolean;
  score: number;
  summary: {
    passed: number;
    warnings: number;
    failures: number;
  };
  checks: ReleaseHardeningCheck[];
  runtime: {
    databaseReadyState: number;
    activeLeases: Array<{
      key: string;
      acquiredAt: string;
      expiresAt: string;
      metadata: Record<string, unknown>;
    }>;
  };
  graph: {
    activeNodes: number;
    activeEdges: number;
    publicSafeNodes: number;
    ownerOnlyNodes: number;
    latestSyncAt: string | null;
    ageMinutes: number | null;
  };
  search: {
    activeEmbeddings: number;
    inactiveEmbeddings: number;
    semanticCoverage: number;
    embeddingModels: string[];
  };
  proactive: {
    activeSignals: number;
    latestReview: {
      period: string;
      periodEnd: string;
      generatedAt: string;
      status: string;
    } | null;
  };
  policies: {
    context: Record<string, unknown>;
    proactive: Record<string, unknown>;
  };
  generatedAt: string;
};
