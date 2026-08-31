import type { KnowledgeGraphNodeType } from "@/types/knowledge-graph";

export type ContextPrivacyBoundary = "private" | "public";
export type ContextAssemblyMode =
  | "balanced"
  | "fresh"
  | "authoritative"
  | "compact";

export type ContextDomainRoute = {
  type: KnowledgeGraphNodeType;
  score: number;
  reason: string;
  explicit: boolean;
};

export type ContextEvidence = {
  citationId: string;
  nodeKey: string;
  type: KnowledgeGraphNodeType;
  label: string;
  summary: string | null;
  snippet: string;
  importance: number;
  privacy: string;
  occurredAt: string | null;
  contextScore: number;
  searchScore: number;
  matchReasons: string[];
  source: {
    collection: string;
    id: string;
    createdAt?: string | null;
    updatedAt?: string | null;
    metadata: Record<string, unknown>;
  };
  relatedEntities: Array<{
    nodeKey: string;
    type: KnowledgeGraphNodeType;
    label: string;
    relationship: string;
    strength: number;
  }>;
};

export type ContextContradiction = {
  id: string;
  severity: "low" | "medium";
  reason: string;
  citationIds: string[];
  labels: string[];
};

export type ContextAssemblyResponse = {
  question: string;
  boundary: ContextPrivacyBoundary;
  mode: ContextAssemblyMode;
  routing: {
    selectedTypes: KnowledgeGraphNodeType[];
    domains: ContextDomainRoute[];
    automatic: boolean;
  };
  retrieval: {
    semantic: {
      available: boolean;
      model: string | null;
      indexedCandidates: number;
      degradedReason: string | null;
    };
    candidates: number;
    privacyEligible: number;
    afterDeduplication: number;
    selectedEvidence: number;
    omittedByBudget: number;
    omittedByLimit: number;
  };
  budget: {
    maxChars: number;
    usedChars: number;
    remainingChars: number;
    estimatedTokens: number;
    utilization: number;
  };
  coverage: {
    requestedDomains: number;
    coveredDomains: number;
    ratio: number;
    missingDomains: KnowledgeGraphNodeType[];
  };
  confidence: "high" | "medium" | "low";
  contradictions: ContextContradiction[];
  evidence: ContextEvidence[];
  context: string;
  instruction: string;
  generatedAt: string;
};

export type ContextAnswerResponse = ContextAssemblyResponse & {
  answer: {
    answer: string;
    confidence: "high" | "medium" | "low";
    citations: string[];
    caveats: string[];
    contradictions: Array<{
      contradictionId: string;
      handling: string;
    }>;
    followUps: string[];
  };
  ai: null | {
    model: string;
    responseId: string;
    usage: Record<string, number>;
  };
  aiError?: string;
};

export type ContextEnginePolicy = {
  version: string;
  canonicalAssembler: boolean;
  boundaries: Record<string, string>;
  defaults: {
    mode: ContextAssemblyMode;
    boundary: ContextPrivacyBoundary;
    maxEvidence: number;
    contextBudgetChars: number;
  };
  scoring: Record<string, string>;
  safeguards: string[];
};

export type ContextRequest = {
  question: string;
  boundary?: ContextPrivacyBoundary;
  mode?: ContextAssemblyMode;
  types?: KnowledgeGraphNodeType[];
  from?: string;
  to?: string;
  maxEvidence?: number;
  contextBudgetChars?: number;
  answerStyle?: string;
};
