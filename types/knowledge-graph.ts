export enum KnowledgeGraphNodeType {
  PERSON = "person",
  COMPANY = "company",
  DECISION = "decision",
  JOURNAL = "journal",
  MEMORY = "memory",
  BOOK = "book",
  HIGHLIGHT = "highlight",
  HEALTH = "health",
  MEDIA = "media",
  TASK = "task",
}

export type KnowledgeGraphPrivacy = "owner_only" | "public_safe";

export type KnowledgeGraphNode = {
  _id?: string;
  nodeKey: string;
  type: KnowledgeGraphNodeType;
  sourceCollection: string;
  sourceId: string;
  label: string;
  summary?: string;
  aliases: string[];
  tags: string[];
  importance: number;
  privacy: KnowledgeGraphPrivacy;
  occurredAt?: string;
  validFrom?: string;
  validTo?: string;
  sourceCreatedAt?: string;
  sourceUpdatedAt?: string;
  metadata: Record<string, unknown>;
  lastSyncedAt: string;
  isActive: boolean;
};

export type KnowledgeGraphEvidence = {
  sourceNodeKey?: string;
  sourceCollection: string;
  sourceId: string;
  fieldPath?: string;
  note?: string;
  occurredAt?: string;
};

export type KnowledgeGraphEdge = {
  _id?: string;
  edgeKey: string;
  sourceNodeKey: string;
  targetNodeKey: string;
  type: string;
  label?: string;
  strength: number;
  direction: "directed" | "undirected";
  evidence: KnowledgeGraphEvidence[];
  occurredAt?: string;
  validFrom?: string;
  validTo?: string;
  metadata: Record<string, unknown>;
  isDerived: boolean;
  lastSyncedAt: string;
  isActive: boolean;
};

export type KnowledgeGraphOverview = {
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
  summary: {
    totalNodes: number;
    totalEdges: number;
    returnedNodes: number;
    returnedEdges: number;
    connectedDomains: number;
    countsByType: Partial<Record<KnowledgeGraphNodeType, number>>;
    query?: string | null;
  };
  generatedAt: string;
};

export type KnowledgeGraphTimeline = {
  nodes: KnowledgeGraphNode[];
  count: number;
  generatedAt: string;
};

export type KnowledgeGraphNodeDetail = {
  node: KnowledgeGraphNode;
  edges: KnowledgeGraphEdge[];
  neighbors: KnowledgeGraphNode[];
  generatedAt: string;
};

export type KnowledgeGraphPath = {
  found: boolean;
  nodes: KnowledgeGraphNode[];
  edges: KnowledgeGraphEdge[];
  hops: number | null;
  maxDepth: number;
  generatedAt: string;
};

export type KnowledgeGraphSyncResult = {
  syncedAt: string;
  nodes: number;
  edges: number;
  countsByType: Partial<Record<KnowledgeGraphNodeType, number>>;
};

export type KnowledgeGraphAnswer = {
  question: string;
  answer: string;
  findings: Array<{
    statement: string;
    confidence: "high" | "medium" | "low";
    nodeKeys: string[];
    edgeKeys: string[];
  }>;
  caveats: string[];
  followUps: string[];
  evidence: {
    timeWindow?: { from: string; to: string; label: string } | null;
    inferredTypes: KnowledgeGraphNodeType[];
    nodes: KnowledgeGraphNode[];
    edges: KnowledgeGraphEdge[];
  };
  signals?: Record<string, unknown>;
  ai: null | {
    model: string;
    responseId: string;
    usage: Record<string, number>;
  };
  generatedAt: string;
};
