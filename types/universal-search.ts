import type { KnowledgeGraphNodeType } from "@/types/knowledge-graph";

export type UniversalSearchMode = "hybrid" | "exact" | "semantic";
export type UniversalSearchSort = "relevance" | "recent" | "importance";

export type UniversalSearchRelatedEntity = {
  nodeKey: string;
  type: KnowledgeGraphNodeType;
  label: string;
  relationship: string;
  strength: number;
};

export type UniversalSearchResult = {
  rank: number;
  nodeKey: string;
  type: KnowledgeGraphNodeType;
  label: string;
  summary: string | null;
  snippet: string;
  aliases: string[];
  tags: string[];
  importance: number;
  privacy: string;
  occurredAt: string | null;
  score: number;
  scoreBreakdown: {
    exact: number;
    lexical: number;
    semantic: number;
    importance: number;
    recency: number;
    relationship: number;
  };
  matchReasons: string[];
  source: {
    collection: string;
    id: string;
    createdAt: string | null;
    updatedAt: string | null;
    metadata: Record<string, unknown>;
  };
  relatedEntities: UniversalSearchRelatedEntity[];
};

export type UniversalSearchResponse = {
  query: string;
  mode: UniversalSearchMode;
  sort: UniversalSearchSort;
  total: number;
  offset: number;
  limit: number;
  semantic: {
    available: boolean;
    model: string | null;
    indexedCandidates: number;
    degradedReason: string | null;
  };
  filters: {
    types: KnowledgeGraphNodeType[];
    tags: string[];
    from: string | null;
    to: string | null;
    minImportance: number | null;
  };
  facets: {
    types: Partial<Record<KnowledgeGraphNodeType, number>>;
    tags: Array<{ tag: string; count: number }>;
  };
  results: UniversalSearchResult[];
};

export type UniversalSearchIndexStatus = {
  model: string;
  totalNodes: number;
  indexedNodes: number;
  pendingNodes: number;
  inactiveEmbeddings: number;
  semanticReady: boolean;
  coverage: number;
};

export type UniversalSearchSyncResult = {
  model: string;
  totalNodes: number;
  pendingBeforeSync: number;
  attempted: number;
  generated: number;
  failed: number;
  remaining: number;
  indexedNodes: number;
  coverage: number;
  semanticReady: boolean;
  errors: string[];
};

export type HsakaaSearchPacket = {
  question: string;
  evidenceCount: number;
  semantic: UniversalSearchResponse["semantic"];
  evidence: UniversalSearchResult[];
  context: string;
  instruction: string;
};
