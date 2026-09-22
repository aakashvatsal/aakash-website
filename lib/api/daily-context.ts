
export type DailyJournalPointerCategory =
  | "work"
  | "offline_reading"
  | "conversation"
  | "decision"
  | "personal";

export type DailyJournalPointerInput = {
  dateKey: string;
  category: DailyJournalPointerCategory;
  note: string;
  privacy?: "private_only" | "public_safe";
};

export type DailyContextPrivacy =
  | "private_only"
  | "internal_safe"
  | "public_safe"
  | "needs_review";

export type DailyPrivacyOverride = {
  privacy: DailyContextPrivacy;
  reason: string;
  reviewedAt: string;
};

export type DailyContextItem = {
  id: string;
  source: string;
  kind: string;
  title: string;
  summary: string;
  occurredAt: string;
  sourceId: string;
  privacy: DailyContextPrivacy;
  defaultPrivacy: DailyContextPrivacy;
  privacyOverride?: DailyPrivacyOverride;
  significantChange: boolean;
  metadata: Record<string, unknown>;
};

export type DailyContext = {
  _id?: string;
  dateKey: string;
  dayStart: string;
  dayEnd: string;
  version: number;
  capturedAt: string;
  items: DailyContextItem[];
  changes: DailyContextItem[];
  sourceCounts: Record<string, number>;
  privacyCounts: Record<string, number>;
  privacyOverrides: Record<string, DailyPrivacyOverride>;
  privacyVersion: number;
  privacyReviewStatus: "clear" | "needs_review";
  publicSourceFingerprint: string;
};

export type DailyJournalDraft = {
  _id: string;
  dateKey: string;
  title: string;
  content?: string;
  highlight?: string;
  tags?: string[];
  wins?: string[];
  lessons?: string[];
  decisions?: string[];
  ideas?: string[];
  gratitude?: string[];
  challenges?: string[];
  mood?: string;
  energyScore?: number;
  stressScore?: number;
  steps?: number;
  workout?: Record<string, unknown>;
  reading?: Record<string, unknown>;
  sleep?: Record<string, unknown>;
  visibility: "private" | "shared" | "public";
  isPublished: boolean;
  metadata?: {
    dailySynthesis?: boolean;
    dailyPublicDerivative?: boolean;
    dailyJournalKind?: "private" | "public";
    approvalStatus?: "pending_approval" | "approved";
    generatedAt?: string;
    approvedAt?: string | null;
    dailyContextVersion?: number;
    privacyVersion?: number;
    publicSourceFingerprint?: string;
    publicDraftStale?: boolean;
    staleReason?: string | null;
    model?: string;
    [key: string]: unknown;
  };
};

export type DailyContextWorkspace = {
  context: DailyContext;
  journal: DailyJournalDraft | null;
  publicJournal: DailyJournalDraft | null;
};

export type JournalIntelligence = {
  period: "week" | "month";
  dateRange: { from: string; to: string };
  daysExpected: number;
  daysCaptured: number;
  coveragePercentage: number;
  wins: string[];
  lessons: string[];
  decisions: string[];
  ideas: string[];
  challenges: string[];
  gratitude: string[];
  moodCounts: Record<string, number>;
  topTags: Array<{ tag: string; count: number }>;
  journals: Array<{
    id: string;
    dateKey: string;
    title: string;
    highlight?: string;
    approvalStatus?: string | null;
  }>;
};

const BASE = "/api/admin/backend/hsakaa/private";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });

  const payload = (await response.json().catch(() => null)) as
    | { message?: string | string[] }
    | T
    | null;

  if (!response.ok) {
    const raw =
      payload && typeof payload === "object" && "message" in payload
        ? payload.message
        : null;
    const message = Array.isArray(raw)
      ? raw.join(", ")
      : raw
        ? String(raw)
        : `Request failed: ${response.status}`;
    throw new Error(message);
  }

  return payload as T;
}

export function getDailyContextWorkspace(dateKey: string) {
  return request<DailyContextWorkspace>(
    `/daily-context?dateKey=${encodeURIComponent(dateKey)}`,
  );
}

export function refreshDailyContext(dateKey: string) {
  return request<DailyContext>("/daily-context/refresh", {
    method: "POST",
    body: JSON.stringify({ dateKey }),
  });
}

export function updateDailyContextPrivacy(
  dateKey: string,
  itemId: string,
  privacy: DailyContextPrivacy,
  reason?: string,
) {
  return request<DailyContext>("/daily-context/privacy", {
    method: "PATCH",
    body: JSON.stringify({ dateKey, itemId, privacy, reason }),
  });
}

export function clearDailyContextPrivacy(dateKey: string, itemId: string) {
  return request<DailyContext>("/daily-context/privacy/clear", {
    method: "POST",
    body: JSON.stringify({ dateKey, itemId }),
  });
}


export function upsertDailyJournalPointer(input: DailyJournalPointerInput) {
  return request<DailyContext>("/daily-journal/pointers", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function removeDailyJournalPointer(
  dateKey: string,
  category: DailyJournalPointerCategory,
) {
  return request<DailyContext>("/daily-journal/pointers", {
    method: "DELETE",
    body: JSON.stringify({ dateKey, category }),
  });
}

export function generateDailyJournal(dateKey: string, regenerate = false) {
  return request<DailyContextWorkspace & { generated?: boolean }>(
    "/daily-journal/generate",
    {
      method: "POST",
      body: JSON.stringify({ dateKey, regenerate }),
    },
  );
}

export function regeneratePublicDailyJournal(dateKey: string) {
  return request<DailyContextWorkspace & { publicGenerated?: boolean }>(
    "/daily-journal/public/regenerate",
    {
      method: "POST",
      body: JSON.stringify({ dateKey }),
    },
  );
}

export function updateDailyJournalDraft(
  journalEntryId: string,
  payload: { title?: string; content?: string; highlight?: string },
) {
  return request<DailyJournalDraft>(
    `/daily-journal/${encodeURIComponent(journalEntryId)}/draft`,
    {
      method: "PATCH",
      body: JSON.stringify(payload),
    },
  );
}

export function approveDailyJournal(journalEntryId: string) {
  return request<DailyJournalDraft>(
    `/daily-journal/${encodeURIComponent(journalEntryId)}/approve`,
    { method: "POST", body: "{}" },
  );
}

export function approvePublicDailyJournal(journalEntryId: string) {
  return request<DailyJournalDraft>(
    `/daily-journal/${encodeURIComponent(journalEntryId)}/public/approve`,
    { method: "POST", body: "{}" },
  );
}


export function approveAndPublishDailyJournalPair(dateKey: string) {
  return request<DailyContextWorkspace & { published?: boolean }>(
    "/daily-journal/publish-pair",
    {
      method: "POST",
      body: JSON.stringify({ dateKey }),
    },
  );
}

export function getJournalIntelligence(
  period: "week" | "month",
  dateKey?: string,
) {
  const query = new URLSearchParams({ period });
  if (dateKey) query.set("dateKey", dateKey);
  return request<JournalIntelligence>(`/journal-intelligence?${query}`);
}
