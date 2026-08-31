import type {
  MemoryAccessLevel,
  MemorySensitivity,
  MemorySource,
  MemoryType,
  MemoryVerificationStatus,
} from "@/types/hsakaa";

export type HsakaaInsightStats = {
  totalConversations: number;
  conversationsLast24Hours: number;
  conversationsLast7Days: number;
  totalMessages: number;
  userMessages: number;
  assistantMessages: number;
  groundedAssistantMessages: number;
  groundingRate: number;
  averageMessagesPerConversation: number;
};

export type HsakaaConversationSummary = {
  _id: string;
  channel: "public" | "admin" | "verified_person";
  mode: string;
  title: string;
  isActive: boolean;
  lastMessageAt?: string;
  messageCount: number;
  createdAt?: string;
  updatedAt?: string;
};

export type HsakaaConversationListResponse = {
  data: HsakaaConversationSummary[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};

export type HsakaaReferencedMemory = {
  _id: string;
  content: string;
  type: MemoryType;
  source: MemorySource;
  tags: string[];
  accessLevel: MemoryAccessLevel;
  sensitivity: MemorySensitivity;
  importance: number;
  confidence: number;
  verificationStatus: MemoryVerificationStatus;
  isDisputed: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type HsakaaAdminMessage = {
  _id: string;
  conversationId: string;
  role: "user" | "assistant";
  content: string;
  metadata?: {
    mode?: string;
    retrievedMemoryCount?: number;
    [key: string]: unknown;
  };
  memoryIds: HsakaaReferencedMemory[];
  createdAt?: string;
  updatedAt?: string;
};

export type HsakaaConversationDetail = {
  conversation: HsakaaConversationSummary;
  messages: HsakaaAdminMessage[];
};

export type EmbeddingStatus = {
  model: string;
  eligibleTotal: number;
  generatedCurrentModel: number;
  missingOrStale: number;
};

export type EmbeddingBackfillResult = {
  model: string;
  requested: number;
  generated: number;
  failed: number;
  force: boolean;
};
