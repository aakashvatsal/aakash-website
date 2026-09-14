export type HsakaaMode =
  | "Chat"
  | "Companies"
  | "Journal"
  | "Library"
  | "Health"
  | "Media"
  | "Memory";

export type HsakaaChatRequest = {
  mode: HsakaaMode;
  message: string;
  conversationId?: string;
};

export type HsakaaActionStatus =
  | "pending"
  | "executing"
  | "executed"
  | "rejected"
  | "failed"
  | "expired";

export type HsakaaProposedAction = {
  id: string;
  type:
    | "task.create"
    | "task.update"
    | "task.status"
    | "task.complete"
    | "task.reopen"
    | "task.archive"
    | "brain_dump.create"
    | "brain_dump.process"
    | "brain_dump.discard"
    | "brain_dump.reopen"
    | "brain_dump.archive"
    | "journal.create"
    | "journal.update"
    | "journal.append"
    | "journal.archive"
    | "journal.restore"
    | "memory.create"
    | "memory.update"
    | "memory.archive"
    | "memory.restore"
    | "reminder.create"
    | "reminder.sync"
    | "reminder.snooze"
    | "reminder.acknowledge"
    | "reminder.dismiss"
    | "reminder.reopen"
    | "decision.experiment.create"
    | "decision.evidence.add"
    | "decision.experiment.complete"
    | "decision.reassess";
  status: HsakaaActionStatus;
  risk: "low" | "medium";
  summary: string;
  preview: Record<string, unknown>;
  expiresAt: string;
  confirmationToken: string;
  result?: Record<string, unknown> | null;
  error?: string | null;
};

export type HsakaaChatResponse = {
  answer: string;
  conversationId: string;
  messageId?: string;
  scope?: "private";
  ai?: {
    model: string;
    toolsUsed: string[];
    toolCallCount: number;
    usage: Record<string, number> | null;
    fallback: boolean;
  };
  proposedActions?: HsakaaProposedAction[];
};

export type HsakaaActionResponse = {
  action: Omit<HsakaaProposedAction, "confirmationToken">;
  message: string;
  alreadyExecuted?: boolean;
};

export type PrivateHsakaaConversationSummary = {
  _id: string;
  mode: string;
  title: string;
  isActive: boolean;
  lastMessageAt?: string;
  messageCount: number;
  createdAt?: string;
  updatedAt?: string;
};

export type PrivateHsakaaConversationMessage = {
  _id: string;
  role: "user" | "assistant";
  content: string;
  metadata?: Record<string, unknown>;
  createdAt?: string;
};

export type MyChatChannel =
  | "whatsapp"
  | "instagram"
  | "linkedin"
  | "x"
  | "slack"
  | "sms"
  | "other";

export type MyChatAuthor = "owner" | "person" | "other";

export type MyChatMessage = {
  _id?: string;
  author: MyChatAuthor;
  content: string;
  sentAt?: string;
};

export type MyChatThread = {
  _id: string;
  title: string;
  personId?:
    | string
    | {
        _id: string;
        name: string;
        preferredName?: string;
        relationship?: string;
        relationshipLabel?: string;
      }
    | null;
  channel: MyChatChannel;
  sourceLabel?: string;
  messageCount: number;
  ownerMessageCount: number;
  lastMessageAt?: string;
  createdAt?: string;
};

export type ImportMyChatRequest = {
  title: string;
  personId?: string;
  channel: MyChatChannel;
  sourceLabel?: string;
  messages: Array<{
    author: MyChatAuthor;
    content: string;
    sentAt?: string;
  }>;
};

const SESSION_STORAGE_KEY =
  "hsakaa_public_session_id";

function getOrCreateSessionId() {
  const existing =
    window.localStorage.getItem(
      SESSION_STORAGE_KEY,
    );

  if (existing) {
    return existing;
  }

  const sessionId =
    window.crypto.randomUUID();

  window.localStorage.setItem(
    SESSION_STORAGE_KEY,
    sessionId,
  );

  return sessionId;
}

async function readJson<T>(response: Response) {
  return (await response.json().catch(() => null)) as
    | (Partial<T> & { message?: string })
    | null;
}

export async function askHsakaa(
  data: HsakaaChatRequest,
) {
  const response = await fetch(
    "/api/hsakaa",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        ...data,
        sessionId:
          getOrCreateSessionId(),
      }),
    },
  );

  const payload =
    await readJson<HsakaaChatResponse>(response);

  if (!response.ok) {
    throw new Error(
      payload?.message ||
        "HSAKAA request failed.",
    );
  }

  if (
    !payload?.answer ||
    !payload.conversationId
  ) {
    throw new Error(
      "HSAKAA returned an invalid response.",
    );
  }

  return payload as HsakaaChatResponse;
}


async function readSpeechResponse(response: Response) {
  if (!response.ok) {
    const payload = await readJson<{ message: string }>(response);
    throw new Error(payload?.message || "Aakash voice is unavailable right now.");
  }

  return response.blob();
}

export async function getHsakaaSpeechAudio(data: {
  conversationId: string;
  messageId: string;
}) {
  const response = await fetch("/api/hsakaa/speech", {
    method: "POST",
    headers: {
      Accept: "audio/mpeg",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      ...data,
      sessionId: getOrCreateSessionId(),
    }),
  });

  return readSpeechResponse(response);
}

export async function getVerifiedPersonHsakaaSpeechAudio(data: {
  conversationId: string;
  messageId: string;
}) {
  const response = await fetch("/api/hsakaa/person/speech", {
    method: "POST",
    headers: {
      Accept: "audio/mpeg",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  return readSpeechResponse(response);
}

export async function askPrivateHsakaa(
  data: HsakaaChatRequest,
) {
  const response = await fetch(
    "/api/admin/backend/hsakaa/private/ask",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    },
  );

  const payload =
    await readJson<HsakaaChatResponse>(response);

  if (!response.ok) {
    throw new Error(
      payload?.message ||
        "Private HSAKAA request failed.",
    );
  }

  if (
    !payload?.answer ||
    !payload.conversationId
  ) {
    throw new Error(
      "Private HSAKAA returned an invalid response.",
    );
  }

  return payload as HsakaaChatResponse;
}

async function respondToPrivateAction(
  actionId: string,
  confirmationToken: string,
  decision: "confirm" | "reject",
) {
  const response = await fetch(
    `/api/admin/backend/hsakaa/private/actions/${actionId}/${decision}`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ confirmationToken }),
    },
  );

  const payload =
    await readJson<HsakaaActionResponse>(response);

  if (!response.ok) {
    throw new Error(
      payload?.message ||
        `Could not ${decision} the HSAKAA action.`,
    );
  }

  if (!payload?.action || !payload.message) {
    throw new Error(
      "HSAKAA returned an invalid action response.",
    );
  }

  return payload as HsakaaActionResponse;
}

export function confirmPrivateHsakaaAction(
  actionId: string,
  confirmationToken: string,
) {
  return respondToPrivateAction(
    actionId,
    confirmationToken,
    "confirm",
  );
}

export function rejectPrivateHsakaaAction(
  actionId: string,
  confirmationToken: string,
) {
  return respondToPrivateAction(
    actionId,
    confirmationToken,
    "reject",
  );
}


export async function getPrivateHsakaaConversations(params?: {
  page?: number;
  limit?: number;
  search?: string;
}) {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.search?.trim()) query.set("search", params.search.trim());

  const response = await fetch(
    `/api/admin/backend/hsakaa/private/conversations${query.size ? `?${query.toString()}` : ""}`,
    { credentials: "include", cache: "no-store" },
  );
  const payload = await readJson<{
    data: PrivateHsakaaConversationSummary[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>(response);

  if (!response.ok || !payload?.data) {
    throw new Error(payload?.message || "Could not load private conversations.");
  }
  return payload as {
    data: PrivateHsakaaConversationSummary[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export async function getPrivateHsakaaConversation(conversationId: string) {
  const response = await fetch(
    `/api/admin/backend/hsakaa/private/conversations/${encodeURIComponent(conversationId)}`,
    { credentials: "include", cache: "no-store" },
  );
  const payload = await readJson<{
    conversation: PrivateHsakaaConversationSummary;
    messages: PrivateHsakaaConversationMessage[];
  }>(response);

  if (!response.ok || !payload?.conversation || !payload.messages) {
    throw new Error(payload?.message || "Could not load that conversation.");
  }
  return payload as {
    conversation: PrivateHsakaaConversationSummary;
    messages: PrivateHsakaaConversationMessage[];
  };
}

export async function getMyChats(params?: {
  page?: number;
  limit?: number;
  search?: string;
  personId?: string;
}) {
  const query = new URLSearchParams();
  if (params?.page) query.set("page", String(params.page));
  if (params?.limit) query.set("limit", String(params.limit));
  if (params?.search?.trim()) query.set("search", params.search.trim());
  if (params?.personId) query.set("personId", params.personId);

  const response = await fetch(
    `/api/admin/backend/hsakaa/private/my-chats${query.size ? `?${query.toString()}` : ""}`,
    { credentials: "include", cache: "no-store" },
  );
  const payload = await readJson<{
    data: MyChatThread[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }>(response);

  if (!response.ok || !payload?.data) {
    throw new Error(payload?.message || "Could not load My Chats.");
  }
  return payload as {
    data: MyChatThread[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export async function getMyChat(threadId: string) {
  const response = await fetch(
    `/api/admin/backend/hsakaa/private/my-chats/${encodeURIComponent(threadId)}`,
    { credentials: "include", cache: "no-store" },
  );
  const payload = await readJson<{
    thread: MyChatThread;
    messages: MyChatMessage[];
  }>(response);

  if (!response.ok || !payload?.thread || !payload.messages) {
    throw new Error(payload?.message || "Could not load imported chat.");
  }
  return payload as { thread: MyChatThread; messages: MyChatMessage[] };
}

export async function importMyChat(data: ImportMyChatRequest) {
  const response = await fetch(
    "/api/admin/backend/hsakaa/private/my-chats/import",
    {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(data),
    },
  );
  const payload = await readJson<{
    thread: MyChatThread;
    importedMessages: number;
    ownerMessagesAvailableForLearning: number;
    learning?: Record<string, unknown>;
  }>(response);

  if (!response.ok || !payload?.thread) {
    throw new Error(payload?.message || "Could not import chat.");
  }
  return payload as {
    thread: MyChatThread;
    importedMessages: number;
    ownerMessagesAvailableForLearning: number;
    learning?: Record<string, unknown>;
  };
}

export async function archiveMyChat(threadId: string) {
  const response = await fetch(
    `/api/admin/backend/hsakaa/private/my-chats/${encodeURIComponent(threadId)}`,
    { method: "DELETE", credentials: "include" },
  );
  const payload = await readJson<{ archived: boolean; id: string }>(response);
  if (!response.ok || !payload?.archived) {
    throw new Error(payload?.message || "Could not archive imported chat.");
  }
  return payload as { archived: boolean; id: string };
}

export async function refreshMyChatLearning(personId?: string) {
  const response = await fetch(
    "/api/admin/backend/hsakaa/private/my-chats/refresh-learning",
    {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(personId ? { personId } : {}),
    },
  );
  const payload = await readJson<Record<string, unknown>>(response);
  if (!response.ok) {
    throw new Error(payload?.message || "Could not refresh communication learning.");
  }
  return payload as Record<string, unknown>;
}


export type HsakaaBriefSignal = {
  status: "good" | "watch" | "attention" | "unknown";
  text: string;
};

export type HsakaaDailyBriefResponse = {
  id?: string;
  dateKey: string;
  timezone: string;
  content: {
    greeting: string;
    headline: string;
    summary: string;
    signals: {
      tasks: HsakaaBriefSignal;
      reminders: HsakaaBriefSignal;
      health: HsakaaBriefSignal;
      mentalLoad: HsakaaBriefSignal;
    };
    priorities: Array<{
      title: string;
      reason: string;
      urgency: "high" | "medium" | "low";
      source: string;
    }>;
    risks: Array<{
      title: string;
      reason: string;
      severity: "high" | "medium" | "low";
      source: string;
    }>;
    opportunities: Array<{
      title: string;
      reason: string;
      source: string;
    }>;
    suggestedActions: Array<{
      title: string;
      reason: string;
      kind:
        | "task"
        | "brain_dump"
        | "journal"
        | "memory"
        | "reminder"
        | "none";
      prompt: string;
    }>;
  };
  generatedAt: string;
  generationSource: "manual" | "scheduled";
  cached: boolean;
  ai: {
    model: string;
    responseId?: string;
    usage: Record<string, number> | null;
    sources: string[];
  };
};

async function loadPrivateBrief(
  method: "GET" | "POST",
) {
  const response = await fetch(
    `/api/admin/backend/hsakaa/private/brief/today${
      method === "POST" ? "/refresh" : ""
    }`,
    {
      method,
      headers: { Accept: "application/json" },
      credentials: "include",
      cache: "no-store",
    },
  );

  const payload =
    await readJson<HsakaaDailyBriefResponse>(response);

  if (!response.ok) {
    throw new Error(
      payload?.message ||
        "Could not load the HSAKAA Daily Brief.",
    );
  }

  if (!payload?.content || !payload.dateKey) {
    throw new Error(
      "HSAKAA returned an invalid Daily Brief.",
    );
  }

  return payload as HsakaaDailyBriefResponse;
}

export function getPrivateHsakaaDailyBrief() {
  return loadPrivateBrief("GET");
}

export function refreshPrivateHsakaaDailyBrief() {
  return loadPrivateBrief("POST");
}

export type HsakaaPatternEvidence = {
  source: string;
  label: string;
  detail: string;
  occurredAt?: string | null;
};

export type HsakaaPatternInsight = {
  title: string;
  category:
    | "tasks"
    | "journal"
    | "memory"
    | "health"
    | "brain_dump"
    | "now"
    | "reminders"
    | "cross_domain";
  confidence: number;
  significance: "high" | "medium" | "low";
  observation: string;
  implication: string;
  evidence: HsakaaPatternEvidence[];
  suggestedPrompt: string;
};

export type HsakaaPatternResponse = {
  id?: string;
  dateKey: string;
  timezone: string;
  windowDays: number;
  windowStart: string;
  windowEnd: string;
  content: {
    headline: string;
    overview: string;
    patterns: HsakaaPatternInsight[];
    correlations: Array<{
      title: string;
      confidence: number;
      relationship: string;
      caution: string;
      evidence: HsakaaPatternEvidence[];
    }>;
    recurringThemes: string[];
    suggestedPrompts: string[];
  };
  generatedAt: string;
  cached: boolean;
  ai: {
    model: string;
    responseId?: string;
    usage: Record<string, number> | null;
    sources: string[];
  };
};

async function loadPrivatePatterns(method: "GET" | "POST") {
  const response = await fetch(
    `/api/admin/backend/hsakaa/private/patterns/current${
      method === "POST" ? "/refresh" : ""
    }`,
    {
      method,
      headers: { Accept: "application/json" },
      credentials: "include",
      cache: "no-store",
    },
  );

  const payload = await readJson<HsakaaPatternResponse>(response);

  if (!response.ok) {
    throw new Error(
      payload?.message || "Could not load HSAKAA Pattern Intelligence.",
    );
  }

  if (!payload?.content || !payload.dateKey) {
    throw new Error("HSAKAA returned invalid Pattern Intelligence.");
  }

  return payload as HsakaaPatternResponse;
}

export function getPrivateHsakaaPatterns(options?: { refresh?: boolean }) {
  return loadPrivatePatterns(options?.refresh ? "POST" : "GET");
}

export type HsakaaWeeklyEvidence = {
  source: string;
  label: string;
  detail: string;
  occurredAt?: string | null;
};

export type HsakaaWeeklyReviewItem = {
  title: string;
  detail: string;
  significance: "high" | "medium" | "low";
  evidence: HsakaaWeeklyEvidence[];
};

export type HsakaaWeeklyReviewResponse = {
  id?: string;
  weekKey: string;
  timezone: string;
  weekStart: string;
  weekEnd: string;
  content: {
    headline: string;
    summary: string;
    wins: HsakaaWeeklyReviewItem[];
    misses: HsakaaWeeklyReviewItem[];
    decisions: Array<{
      title: string;
      decision: string;
      status: "made" | "pending" | "revisit";
      rationale: string;
      evidence: HsakaaWeeklyEvidence[];
    }>;
    lessons: Array<{
      title: string;
      lesson: string;
      evidence: HsakaaWeeklyEvidence[];
    }>;
    unresolved: Array<{
      title: string;
      reason: string;
      urgency: "high" | "medium" | "low";
      evidence: HsakaaWeeklyEvidence[];
    }>;
    nextWeekPriorities: Array<{
      title: string;
      reason: string;
      urgency: "high" | "medium" | "low";
      source: string;
      prompt: string;
      evidence: HsakaaWeeklyEvidence[];
    }>;
    questions: string[];
  };
  generatedAt: string;
  cached: boolean;
  ai: {
    model: string;
    responseId?: string;
    usage: Record<string, number> | null;
    sources: string[];
  };
};

async function loadPrivateWeeklyReview(method: "GET" | "POST") {
  const response = await fetch(
    `/api/admin/backend/hsakaa/private/review/week/current${
      method === "POST" ? "/refresh" : ""
    }`,
    {
      method,
      headers: { Accept: "application/json" },
      credentials: "include",
      cache: "no-store",
    },
  );

  const payload = await readJson<HsakaaWeeklyReviewResponse>(response);

  if (!response.ok) {
    throw new Error(
      payload?.message || "Could not load the HSAKAA Weekly Review.",
    );
  }

  if (!payload?.content || !payload.weekKey) {
    throw new Error("HSAKAA returned an invalid Weekly Review.");
  }

  return payload as HsakaaWeeklyReviewResponse;
}

export function getPrivateHsakaaWeeklyReview(options?: { refresh?: boolean }) {
  return loadPrivateWeeklyReview(options?.refresh ? "POST" : "GET");
}

export type HsakaaDecisionHorizon =
  | "today"
  | "weeks"
  | "months"
  | "years";

export type HsakaaDecisionOptionInput = {
  label: string;
  description?: string;
};

export type HsakaaDecisionEvidence = {
  source: string;
  label: string;
  detail: string;
  occurredAt?: string | null;
};

export type HsakaaDecisionOutcomeStatus =
  | "positive"
  | "mixed"
  | "negative"
  | "too_early"
  | "abandoned";

export type HsakaaDecisionCalibrationLabel =
  | "well_calibrated"
  | "overconfident"
  | "underconfident"
  | "not_enough_evidence";

export type HsakaaDecisionOutcomeVerdict =
  | "recommendation_held"
  | "recommendation_mixed"
  | "recommendation_missed"
  | "too_early"
  | "abandoned";

export type HsakaaDecisionType =
  | "reversible"
  | "partially_reversible"
  | "hard_to_reverse";

export type HsakaaDecisionLearningStatus =
  | "positive"
  | "mixed"
  | "negative";

export type HsakaaDecisionLearningReference = {
  id?: string;
  question: string;
  horizon: HsakaaDecisionHorizon;
  decisionType: HsakaaDecisionType;
  selectedOptionLabel: string;
  recommendationOptionLabel: string | null;
  recommendationFollowed: boolean | null;
  status: HsakaaDecisionLearningStatus;
  verdict: HsakaaDecisionOutcomeVerdict;
  calibration: HsakaaDecisionCalibrationLabel;
  baselineConfidence: number;
  summary: string;
  lessons: string[];
  surprises: string[];
  futureAdjustments: string[];
  recordedAt: string;
  similarityScore: number;
};

export type HsakaaDecisionLearningContext = {
  generatedAt: string;
  eligibleReviewedCount: number;
  similarReviewedCount: number;
  sampleQuality: "insufficient" | "emerging" | "useful";
  warnings: Array<{
    kind: "sample_size" | "calibration" | "outcome_pattern";
    message: string;
    sampleSize: number;
  }>;
  similarDecisions: HsakaaDecisionLearningReference[];
};

export type HsakaaDecisionLearningLibraryResponse = {
  generatedAt: string;
  counts: {
    eligible: number;
    matched: number;
    returned: number;
  };
  sampleQuality: "insufficient" | "emerging" | "useful";
  filters: {
    search: string | null;
    horizon: HsakaaDecisionHorizon | null;
    status: HsakaaDecisionLearningStatus | null;
    calibration: HsakaaDecisionCalibrationLabel | null;
    recommendationFollowed: boolean | null;
  };
  data: HsakaaDecisionLearningReference[];
};

export type HsakaaDecisionAssumptionStatus =
  | "untested"
  | "testing"
  | "supported"
  | "weakened"
  | "invalidated";

export type HsakaaDecisionAssumptionImportance = "high" | "medium" | "low";
export type HsakaaDecisionExperimentStatus =
  | "planned"
  | "active"
  | "awaiting_result"
  | "completed"
  | "cancelled";
export type HsakaaDecisionExperimentResult =
  | "supported"
  | "mixed"
  | "failed"
  | "inconclusive";
export type HsakaaDecisionEvidenceKind = "observation" | "metric" | "note" | "source";
export type HsakaaDecisionEvidenceStance = "supports" | "contradicts" | "neutral";

export type HsakaaDecisionTrackedAssumption = {
  id: string;
  statement: string;
  importance: HsakaaDecisionAssumptionImportance;
  status: HsakaaDecisionAssumptionStatus;
  confidence: number | null;
  createdAt: string;
  updatedAt: string;
  statusHistory: Array<{
    status: HsakaaDecisionAssumptionStatus;
    confidence: number | null;
    note: string;
    changedAt: string;
  }>;
};

export type HsakaaDecisionTrackedExperiment = {
  id: string;
  title: string;
  hypothesis: string;
  description: string;
  successCriteria: string;
  failureCriteria: string;
  assumptionIds: string[];
  supportsOptionIds: string[];
  status: HsakaaDecisionExperimentStatus;
  startAt: string | null;
  targetReviewAt: string | null;
  result: HsakaaDecisionExperimentResult | null;
  conclusion: string;
  createdAt: string;
  completedAt: string | null;
};

export type HsakaaDecisionTrackedEvidence = {
  id: string;
  kind: HsakaaDecisionEvidenceKind;
  stance: HsakaaDecisionEvidenceStance;
  detail: string;
  sourceReference: string;
  metricLabel: string;
  metricValue: string;
  occurredAt: string | null;
  experimentId: string | null;
  assumptionIds: string[];
  recordedAt: string;
};

export type HsakaaDecisionReassessment = {
  version: number;
  reason: string;
  requestedAt: string;
  evidenceIdsConsidered: string[];
  newEvidenceIds: string[];
  priorRecommendation: { optionId: string | null; confidence: number };
  currentRecommendation: {
    optionId: string | null;
    confidence: number;
    rationale: string;
  };
  recommendationChanged: boolean;
  whatChanged: string[];
  whatStillUnknown: string[];
  assumptionSuggestions: Array<{
    assumptionId: string;
    suggestedStatus: HsakaaDecisionAssumptionStatus;
    suggestedConfidence: number | null;
    rationale: string;
  }>;
  evidenceSummary: string;
  nextPrompt: string;
  aiModel: string;
  aiResponseId?: string;
  usage?: Record<string, number> | null;
};

export type HsakaaDecisionExperimentState = {
  decisionId: string;
  question: string;
  horizon: HsakaaDecisionHorizon;
  originalRecommendation: {
    optionId: string | null;
    confidence: number;
    generatedAt: string;
  };
  commitment: HsakaaDecisionResponse["commitment"];
  outcome: HsakaaDecisionResponse["outcome"];
  assumptions: HsakaaDecisionTrackedAssumption[];
  experiments: HsakaaDecisionTrackedExperiment[];
  evidenceLog: HsakaaDecisionTrackedEvidence[];
  reassessments: HsakaaDecisionReassessment[];
};

export type HsakaaDecisionResponse = {
  id?: string;
  question: string;
  options: Array<{
    id: string;
    label: string;
    description?: string;
  }>;
  context: string;
  constraints: string[];
  horizon: HsakaaDecisionHorizon;
  analysis: {
    summary: string;
    decisionType:
      | "reversible"
      | "partially_reversible"
      | "hard_to_reverse";
    recommendation: {
      optionId?: string | null;
      confidence: number;
      rationale: string;
      whyNow: string;
      caution: string;
    };
    criteria: Array<{
      name: string;
      weight: number;
      rationale: string;
    }>;
    optionAssessments: Array<{
      optionId: string;
      score: number;
      summary: string;
      advantages: string[];
      disadvantages: string[];
      risks: string[];
      opportunityCost: string;
      evidence: HsakaaDecisionEvidence[];
    }>;
    keyTradeoffs: Array<{
      title: string;
      description: string;
      favoredOptionId?: string | null;
    }>;
    risks: Array<{
      title: string;
      severity: "high" | "medium" | "low";
      likelihood: "high" | "medium" | "low";
      detail: string;
      appliesToOptionIds: string[];
    }>;
    assumptions: string[];
    unknowns: string[];
    whatWouldChangeRecommendation: string[];
    suggestedExperiments: Array<{
      title: string;
      description: string;
      duration: string;
      supportsOptionIds: string[];
    }>;
    nextPrompt: string;
  };
  learningContext: HsakaaDecisionLearningContext | null;
  commitment: {
    optionId: string;
    rationale: string;
    committedAt: string;
    reviewAt?: string | null;
    baselineRecommendationOptionId?: string | null;
    baselineRecommendationConfidence: number;
    baselineGeneratedAt: string;
  } | null;
  outcome: {
    status: HsakaaDecisionOutcomeStatus;
    summary: string;
    evidenceNotes: string[];
    recordedAt: string;
    recommendationFollowed: boolean | null;
    evaluation: {
      verdict: HsakaaDecisionOutcomeVerdict;
      calibration: HsakaaDecisionCalibrationLabel;
      summary: string;
      whatWorked: string[];
      whatDidnt: string[];
      surprises: string[];
      lessons: string[];
      futureAdjustments: string[];
      evidence: HsakaaDecisionEvidence[];
      nextPrompt: string;
    };
    aiModel: string;
    aiResponseId?: string;
    usage: Record<string, number> | null;
    sources: string[];
  } | null;
  assumptionRegister: HsakaaDecisionTrackedAssumption[];
  experiments: HsakaaDecisionTrackedExperiment[];
  evidenceLog: HsakaaDecisionTrackedEvidence[];
  reassessments: HsakaaDecisionReassessment[];
  generatedAt: string;
  ai: {
    model: string;
    responseId?: string;
    usage: Record<string, number> | null;
    sources: string[];
  };
};

export type AnalyzeHsakaaDecisionRequest = {
  question: string;
  options: HsakaaDecisionOptionInput[];
  context?: string;
  constraints?: string[];
  horizon?: HsakaaDecisionHorizon;
};

export async function analyzePrivateHsakaaDecision(
  data: AnalyzeHsakaaDecisionRequest,
) {
  const response = await fetch(
    "/api/admin/backend/hsakaa/private/decisions/analyze",
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    },
  );

  const payload = await readJson<HsakaaDecisionResponse>(response);

  if (!response.ok) {
    throw new Error(
      payload?.message || "HSAKAA could not analyze this decision.",
    );
  }

  if (!payload?.analysis || !payload.question) {
    throw new Error("HSAKAA returned an invalid decision analysis.");
  }

  return payload as HsakaaDecisionResponse;
}

export async function getRecentPrivateHsakaaDecisions(limit = 6) {
  const response = await fetch(
    `/api/admin/backend/hsakaa/private/decisions/recent?limit=${limit}`,
    {
      headers: { Accept: "application/json" },
      credentials: "include",
      cache: "no-store",
    },
  );

  const payload = await readJson<{
    data: HsakaaDecisionResponse[];
    count: number;
  }>(response);

  if (!response.ok) {
    throw new Error(
      payload?.message || "Could not load recent decision analyses.",
    );
  }

  return {
    data: payload?.data ?? [],
    count: payload?.count ?? 0,
  };
}

export async function getPrivateHsakaaDecision(decisionId: string) {
  const response = await fetch(
    `/api/admin/backend/hsakaa/private/decisions/${decisionId}`,
    {
      headers: { Accept: "application/json" },
      credentials: "include",
      cache: "no-store",
    },
  );

  const payload = await readJson<HsakaaDecisionResponse>(response);
  if (!response.ok) {
    throw new Error(payload?.message || "Could not load this decision analysis.");
  }
  if (!payload?.analysis || !payload.question) {
    throw new Error("HSAKAA returned an invalid decision analysis.");
  }
  return payload as HsakaaDecisionResponse;
}

export async function reanalyzePrivateHsakaaDecision(decisionId: string) {
  const response = await fetch(
    `/api/admin/backend/hsakaa/private/decisions/${decisionId}/reanalyze`,
    {
      method: "POST",
      headers: { Accept: "application/json" },
      credentials: "include",
    },
  );

  const payload = await readJson<HsakaaDecisionResponse>(response);

  if (!response.ok) {
    throw new Error(
      payload?.message || "HSAKAA could not reanalyze this decision.",
    );
  }

  if (!payload?.analysis || !payload.question) {
    throw new Error("HSAKAA returned an invalid decision analysis.");
  }

  return payload as HsakaaDecisionResponse;
}

export type HsakaaDecisionCalibrationSummary = {
  committedCount: number;
  reviewedCount: number;
  pendingReviewCount: number;
  recommendationFollowedCount: number;
  recommendationFollowedRate: number | null;
  averageBaselineConfidence: number | null;
  outcomeStatusCounts: Record<HsakaaDecisionOutcomeStatus, number>;
  calibrationCounts: Record<HsakaaDecisionCalibrationLabel, number>;
  sampleQuality: "insufficient" | "emerging" | "useful";
  recentReviews: Array<{
    id?: string;
    question: string;
    selectedOptionLabel: string;
    status?: HsakaaDecisionOutcomeStatus;
    verdict?: HsakaaDecisionOutcomeVerdict;
    calibration?: HsakaaDecisionCalibrationLabel;
    baselineConfidence: number | null;
    recordedAt?: string | null;
  }>;
};

export type HsakaaDecisionAnalyticsSegment = {
  label: string;
  count: number;
  sampleQuality: "insufficient" | "emerging" | "useful";
  positiveRate: number | null;
  negativeRate: number | null;
  weightedOutcomeScore: number | null;
  recommendationSuccessRate: number | null;
  averageConfidence: number | null;
  calibrationGap: number | null;
};

export type HsakaaDecisionAnalytics = {
  generatedAt: string;
  deterministic: true;
  definitions: {
    finalReviewStatuses: string[];
    recommendationScore: string;
    confidenceWarningThreshold: number;
    note: string;
  };
  sampleQuality: "insufficient" | "emerging" | "useful";
  overview: {
    analyzedCount: number;
    committedCount: number;
    reviewedCount: number;
    finalReviewedCount: number;
    pendingReviewCount: number;
    recommendationFollowedCount: number;
    recommendationNotFollowedCount: number;
    recommendationFollowedRate: number | null;
    averageBaselineConfidence: number | null;
    strictRecommendationSuccessRate: number | null;
    weightedRecommendationSuccessRate: number | null;
  };
  outcomeCounts: Record<HsakaaDecisionOutcomeStatus, number>;
  verdictCounts: Record<HsakaaDecisionOutcomeVerdict, number>;
  calibrationCounts: Record<HsakaaDecisionCalibrationLabel, number>;
  confidenceBands: Array<{
    label: "low" | "medium" | "high" | "very_high";
    min: number;
    max: number;
    count: number;
    averageConfidence: number | null;
    observedSuccessRate: number | null;
    calibrationGap: number | null;
    calibration: "insufficient" | "overconfident" | "underconfident" | "well_calibrated";
  }>;
  choicesVsHsakaa: {
    followed: {
      count: number;
      positive: number;
      mixed: number;
      negative: number;
    };
    notFollowed: {
      count: number;
      positive: number;
      mixed: number;
      negative: number;
    };
    userOutperformedCount: number;
    hsakaaOutperformedCount: number;
    userOutperformed: Array<{
      id?: string;
      question: string;
      selectedOptionId: string | null;
      recommendationOptionId: string | null;
      baselineConfidence: number | null;
      status: HsakaaDecisionOutcomeStatus | null;
      verdict: HsakaaDecisionOutcomeVerdict | null;
      summary: string;
      recordedAt: string | null;
    }>;
    hsakaaOutperformed: Array<{
      id?: string;
      question: string;
      selectedOptionId: string | null;
      recommendationOptionId: string | null;
      baselineConfidence: number | null;
      status: HsakaaDecisionOutcomeStatus | null;
      verdict: HsakaaDecisionOutcomeVerdict | null;
      summary: string;
      recordedAt: string | null;
    }>;
  };
  performance: {
    byHorizon: HsakaaDecisionAnalyticsSegment[];
    byReversibility: HsakaaDecisionAnalyticsSegment[];
  };
  experiments: {
    completedCount: number;
    conclusiveCount: number;
    resultCounts: Record<HsakaaDecisionExperimentResult, number>;
    winRate: number | null;
  };
  timing: {
    averageDecisionToCommitHours: number | null;
    averageCommitmentToReviewDays: number | null;
    samples: {
      decisionToCommit: number;
      commitmentToReview: number;
    };
  };
  recurringFailedAssumptions: Array<{
    statement: string;
    occurrences: number;
    recurring: boolean;
    invalidatedCount: number;
    weakenedCount: number;
    failedExperimentCount: number;
    examples: Array<{
      question: string;
      horizon: HsakaaDecisionHorizon;
      decisionType: HsakaaDecisionType;
      status: "weakened" | "invalidated" | "failed_experiment";
    }>;
  }>;
  calibrationTrend: Array<{
    month: string;
    reviewedCount: number;
    averageConfidence: number;
    recommendationSuccessRate: number;
    calibrationGap: number;
    overconfidentCount: number;
    underconfidentCount: number;
  }>;
  lowerConfidenceSignals: Array<{
    dimension: string;
    label: string;
    reviewedCount: number;
    averageConfidence: number | null;
    observedRecommendationSuccessRate: number | null;
    gap: number | null;
    sampleQuality: "insufficient" | "emerging" | "useful";
    guidance: string;
  }>;
};

export type HsakaaDecisionReviewBucket =
  | "overdue"
  | "due_today"
  | "upcoming"
  | "unscheduled";

export type HsakaaDecisionReviewQueueItem = {
  id?: string;
  question: string;
  horizon: HsakaaDecisionHorizon;
  bucket: HsakaaDecisionReviewBucket;
  selectedOptionId: string;
  selectedOptionLabel: string;
  committedAt: string;
  reviewAt: string | null;
  suggestedReviewAt: string;
  adaptiveFollowUp: boolean;
  lastOutcome: {
    status: HsakaaDecisionOutcomeStatus;
    summary: string;
    recordedAt: string;
  } | null;
  baseline: {
    recommendationOptionId: string | null;
    recommendationOptionLabel: string | null;
    confidence: number;
    generatedAt: string;
  };
  evidencePrompts: string[];
};

export type HsakaaDecisionReviewQueue = {
  generatedAt: string;
  timezone: string;
  counts: {
    overdue: number;
    dueToday: number;
    upcoming: number;
    unscheduled: number;
    total: number;
  };
  overdue: HsakaaDecisionReviewQueueItem[];
  dueToday: HsakaaDecisionReviewQueueItem[];
  upcoming: HsakaaDecisionReviewQueueItem[];
  unscheduled: HsakaaDecisionReviewQueueItem[];
};

export async function recordPrivateHsakaaDecisionCommitment(
  decisionId: string,
  data: { optionId: string; rationale?: string; reviewAt?: string },
) {
  const response = await fetch(
    `/api/admin/backend/hsakaa/private/decisions/${decisionId}/commitment`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    },
  );

  const payload = await readJson<HsakaaDecisionResponse>(response);
  if (!response.ok) {
    throw new Error(payload?.message || "Could not record this decision choice.");
  }
  return payload as HsakaaDecisionResponse;
}

export async function evaluatePrivateHsakaaDecisionOutcome(
  decisionId: string,
  data: {
    status: HsakaaDecisionOutcomeStatus;
    summary: string;
    evidenceNotes?: string[];
  },
) {
  const response = await fetch(
    `/api/admin/backend/hsakaa/private/decisions/${decisionId}/outcome/evaluate`,
    {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify(data),
    },
  );

  const payload = await readJson<HsakaaDecisionResponse>(response);
  if (!response.ok) {
    throw new Error(
      payload?.message || "HSAKAA could not evaluate this decision outcome.",
    );
  }
  return payload as HsakaaDecisionResponse;
}

export async function getPrivateHsakaaDecisionCalibration() {
  const response = await fetch(
    "/api/admin/backend/hsakaa/private/decisions/calibration/summary",
    {
      headers: { Accept: "application/json" },
      credentials: "include",
      cache: "no-store",
    },
  );

  const payload = await readJson<HsakaaDecisionCalibrationSummary>(response);
  if (!response.ok) {
    throw new Error(payload?.message || "Could not load decision calibration.");
  }
  return payload as HsakaaDecisionCalibrationSummary;
}

export async function getPrivateHsakaaDecisionAnalytics() {
  const response = await fetch(
    "/api/admin/backend/hsakaa/private/decisions/analytics",
    {
      headers: { Accept: "application/json" },
      credentials: "include",
      cache: "no-store",
    },
  );

  const payload = await readJson<HsakaaDecisionAnalytics>(response);
  if (!response.ok) {
    throw new Error(payload?.message || "Could not load decision analytics.");
  }
  return payload as HsakaaDecisionAnalytics;
}

export async function getPrivateHsakaaDecisionReviewQueue() {
  const response = await fetch(
    "/api/admin/backend/hsakaa/private/decisions/review-queue",
    {
      headers: { Accept: "application/json" },
      credentials: "include",
      cache: "no-store",
    },
  );

  const payload = await readJson<HsakaaDecisionReviewQueue>(response);
  if (!response.ok) {
    throw new Error(payload?.message || "Could not load decision review queue.");
  }
  return payload as HsakaaDecisionReviewQueue;
}

export async function getPrivateHsakaaDecisionLearnings(filters?: {
  search?: string;
  horizon?: HsakaaDecisionHorizon;
  status?: HsakaaDecisionLearningStatus;
  calibration?: HsakaaDecisionCalibrationLabel;
  recommendationFollowed?: boolean;
  limit?: number;
}) {
  const params = new URLSearchParams();
  if (filters?.search?.trim()) params.set("search", filters.search.trim());
  if (filters?.horizon) params.set("horizon", filters.horizon);
  if (filters?.status) params.set("status", filters.status);
  if (filters?.calibration) params.set("calibration", filters.calibration);
  if (filters?.recommendationFollowed !== undefined) {
    params.set(
      "recommendationFollowed",
      String(filters.recommendationFollowed),
    );
  }
  if (filters?.limit) params.set("limit", String(filters.limit));

  const suffix = params.size ? `?${params.toString()}` : "";
  const response = await fetch(
    `/api/admin/backend/hsakaa/private/decisions/learnings${suffix}`,
    {
      headers: { Accept: "application/json" },
      credentials: "include",
      cache: "no-store",
    },
  );

  const payload =
    await readJson<HsakaaDecisionLearningLibraryResponse>(response);
  if (!response.ok) {
    throw new Error(payload?.message || "Could not load decision learnings.");
  }

  return payload as HsakaaDecisionLearningLibraryResponse;
}

export async function reschedulePrivateHsakaaDecisionReview(
  decisionId: string,
  reviewAt: string,
) {
  const response = await fetch(
    `/api/admin/backend/hsakaa/private/decisions/${decisionId}/review-date`,
    {
      method: "PATCH",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      credentials: "include",
      body: JSON.stringify({ reviewAt }),
    },
  );

  const payload = await readJson<HsakaaDecisionResponse>(response);
  if (!response.ok) {
    throw new Error(payload?.message || "Could not reschedule this decision review.");
  }
  return payload as HsakaaDecisionResponse;
}

export type HsakaaDecisionExperimentQueueItem = {
  decisionId: string;
  question: string;
  horizon: HsakaaDecisionHorizon;
  experiment: HsakaaDecisionTrackedExperiment;
};

export type HsakaaDecisionInvalidatedAssumptionItem = {
  decisionId: string;
  question: string;
  horizon: HsakaaDecisionHorizon;
  assumption: HsakaaDecisionTrackedAssumption;
};

export type HsakaaDecisionExperimentQueue = {
  generatedAt: string;
  counts: {
    active: number;
    awaitingResult: number;
    dueForReview: number;
    completed: number;
    invalidatedAssumptions: number;
  };
  active: HsakaaDecisionExperimentQueueItem[];
  awaitingResult: HsakaaDecisionExperimentQueueItem[];
  dueForReview: HsakaaDecisionExperimentQueueItem[];
  completed: HsakaaDecisionExperimentQueueItem[];
  invalidatedAssumptions: HsakaaDecisionInvalidatedAssumptionItem[];
};

async function decisionExperimentRequest<T>(
  path: string,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`/api/admin/backend/hsakaa/private/decisions${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(init?.headers ?? {}),
    },
    credentials: "include",
    cache: init?.method && init.method !== "GET" ? undefined : "no-store",
  });
  const payload = await readJson<T>(response);
  if (!response.ok) {
    const errorPayload = payload as { message?: string } | null;
    throw new Error(errorPayload?.message || "Decision experiment request failed.");
  }
  return payload as T;
}

export function getPrivateHsakaaDecisionExperimentQueue() {
  return decisionExperimentRequest<HsakaaDecisionExperimentQueue>(
    "/experiments/queue",
  );
}

export function getPrivateHsakaaDecisionExperimentState(decisionId: string) {
  return decisionExperimentRequest<HsakaaDecisionExperimentState>(
    `/${decisionId}/experiments`,
  );
}

export function createPrivateHsakaaDecisionExperiment(
  decisionId: string,
  data: {
    title: string;
    hypothesis: string;
    description?: string;
    successCriteria: string;
    failureCriteria: string;
    assumptionIds?: string[];
    supportsOptionIds?: string[];
    startAt?: string;
    targetReviewAt?: string;
  },
) {
  return decisionExperimentRequest<HsakaaDecisionExperimentState>(
    `/${decisionId}/experiments`,
    { method: "POST", body: JSON.stringify(data) },
  );
}

export function updatePrivateHsakaaDecisionExperimentStatus(
  decisionId: string,
  experimentId: string,
  status: HsakaaDecisionExperimentStatus,
) {
  return decisionExperimentRequest<HsakaaDecisionExperimentState>(
    `/${decisionId}/experiments/${experimentId}/status`,
    { method: "PATCH", body: JSON.stringify({ status }) },
  );
}

export function addPrivateHsakaaDecisionEvidence(
  decisionId: string,
  data: {
    kind: HsakaaDecisionEvidenceKind;
    stance: HsakaaDecisionEvidenceStance;
    detail: string;
    sourceReference?: string;
    metricLabel?: string;
    metricValue?: string;
    occurredAt?: string;
    experimentId?: string;
    assumptionIds?: string[];
  },
) {
  return decisionExperimentRequest<HsakaaDecisionExperimentState>(
    `/${decisionId}/evidence`,
    { method: "POST", body: JSON.stringify(data) },
  );
}

export function updatePrivateHsakaaDecisionAssumption(
  decisionId: string,
  assumptionId: string,
  data: {
    status: HsakaaDecisionAssumptionStatus;
    confidence?: number | null;
    note?: string;
  },
) {
  return decisionExperimentRequest<HsakaaDecisionExperimentState>(
    `/${decisionId}/assumptions/${assumptionId}`,
    { method: "PATCH", body: JSON.stringify(data) },
  );
}

export function completePrivateHsakaaDecisionExperiment(
  decisionId: string,
  experimentId: string,
  data: {
    result: HsakaaDecisionExperimentResult;
    conclusion: string;
    completedAt?: string;
  },
) {
  return decisionExperimentRequest<HsakaaDecisionExperimentState>(
    `/${decisionId}/experiments/${experimentId}/complete`,
    { method: "POST", body: JSON.stringify(data) },
  );
}

export function reassessPrivateHsakaaDecision(
  decisionId: string,
  data: { reason?: string; force?: boolean } = {},
) {
  return decisionExperimentRequest<HsakaaDecisionExperimentState>(
    `/${decisionId}/reassess`,
    { method: "POST", body: JSON.stringify(data) },
  );
}


export type HsakaaVerifiedPerson = {
  id: string;
  name: string;
  memoryAccessConsentGranted: boolean;
};

export type HsakaaPersonSessionResponse = {
  verified: true;
  person: HsakaaVerifiedPerson;
  sessionExpiresAt?: string;
};

export async function requestHsakaaPersonOtp(identifier: string) {
  const response = await fetch("/api/hsakaa/person/request-otp", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ identifier }),
  });

  const payload = await readJson<{
    message: string;
    verificationSessionId: string;
  }>(response);

  if (!response.ok) {
    throw new Error(payload?.message || "Could not start verification.");
  }

  if (!payload?.verificationSessionId) {
    throw new Error("Verification returned an invalid response.");
  }

  return payload as {
    message: string;
    verificationSessionId: string;
  };
}

export async function verifyHsakaaPersonOtp(
  verificationSessionId: string,
  otp: string,
) {
  const response = await fetch("/api/hsakaa/person/verify-otp", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ verificationSessionId, otp }),
  });

  const payload = await readJson<HsakaaPersonSessionResponse>(response);

  if (!response.ok) {
    throw new Error(payload?.message || "Verification failed.");
  }

  if (!payload?.verified || !payload.person?.id || !payload.person.name) {
    throw new Error("Verification returned an invalid response.");
  }

  return payload as HsakaaPersonSessionResponse;
}

export async function getHsakaaPersonSession() {
  const response = await fetch("/api/hsakaa/person/session", {
    method: "GET",
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (response.status === 401) {
    return null;
  }

  const payload = await readJson<HsakaaPersonSessionResponse>(response);

  if (!response.ok) {
    throw new Error(payload?.message || "Could not restore verification.");
  }

  return payload?.verified ? (payload as HsakaaPersonSessionResponse) : null;
}

export async function logoutHsakaaPerson() {
  await fetch("/api/hsakaa/person/logout", {
    method: "POST",
    headers: { Accept: "application/json" },
  });
}

export async function askVerifiedPersonHsakaa(data: HsakaaChatRequest) {
  const response = await fetch("/api/hsakaa/person/ask", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });

  const payload = await readJson<HsakaaChatResponse>(response);

  if (!response.ok) {
    throw new Error(payload?.message || "Aakash request failed.");
  }

  if (!payload?.answer || !payload.conversationId) {
    throw new Error("Aakash returned an invalid response.");
  }

  return payload as HsakaaChatResponse;
}
