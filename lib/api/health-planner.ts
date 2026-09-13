import type {
  HealthBaselinePayload,
  HealthGoal,
  HealthGoalHorizonMode,
  HealthGoalStatus,
  HealthPhoto,
  HealthPhotoCategory,
  HealthPlannerSetup,
  HealthPlanStatus,
  HealthPlanWindow,
  HealthSourceReport,
  HealthStrategy,
  HealthDailyProgress,
  HealthOwnerUpdate,
  HealthOwnerUpdateDomain,
  HealthPlanReview,
  HealthProgressSummary,
  HealthIntelligence,
  HealthRoutineTaskStatus,
  HealthSubstanceUseStatus,
} from "@/types/health-planner";

const BASE = "/api/admin/backend/hsakaa/private/health-planner";

type ApiError = {
  message?: string | string[];
  error?: string;
  detail?: string;
  stage?: string;
};

async function readResponse<T>(
  response: Response,
  fallback: string,
): Promise<T> {
  const payload = (await response.json().catch(() => null)) as
    T | ApiError | null;
  if (!response.ok) {
    const apiError = payload as ApiError | null;
    const message = Array.isArray(apiError?.message)
      ? apiError.message.join(", ")
      : (apiError?.message ?? apiError?.error ?? fallback);
    const detail =
      process.env.NODE_ENV !== "production" && apiError?.detail
        ? `${apiError.stage ? `[${apiError.stage}] ` : ""}${apiError.detail}`
        : "";
    throw new Error(detail ? `${message} ${detail}` : message);
  }
  return payload as T;
}

async function request<T>(
  path: string,
  init: RequestInit = {},
  fallback = "Health Planner request failed.",
) {
  const response = await fetch(`${BASE}${path}`, {
    ...init,
    credentials: "include",
    cache: "no-store",
    headers: {
      ...(init.body && !(init.body instanceof FormData)
        ? { "Content-Type": "application/json" }
        : {}),
      ...(init.headers ?? {}),
    },
  });
  return readResponse<T>(response, fallback);
}

export function getHealthPlannerSetup() {
  return request<HealthPlannerSetup>(
    "/setup",
    {},
    "Unable to load Health setup.",
  );
}

export function getHealthStorageStatus() {
  return request<import("@/types/health-planner").HealthStorageStatus>(
    "/storage/status",
    {},
    "Unable to load Health storage status.",
  );
}

export function migrateLegacyHealthStorage() {
  return request<{
    migratedPhotos: number;
    migratedReports: number;
    storage: import("@/types/health-planner").HealthStorageStatus;
  }>(
    "/storage/migrate-legacy",
    { method: "POST" },
    "Unable to migrate Health uploads to S3.",
  );
}

export type ResolvedHealthLocation = {
  latitude: number;
  longitude: number;
  accuracyMeters: number | null;
  timezone: string;
  capturedAt: string;
  source: "browser_geolocation";
  city: string;
  region: string;
  country: string;
  countryCode: string;
};

export function resolveHealthLocation(payload: {
  latitude: number;
  longitude: number;
  accuracyMeters?: number;
  timezone?: string;
}) {
  return request<ResolvedHealthLocation>(
    "/location/resolve",
    { method: "POST", body: JSON.stringify(payload) },
    "Unable to resolve current Health location.",
  );
}

export function saveHealthBaseline(payload: HealthBaselinePayload) {
  return request<{
    baseline: unknown;
    readiness: HealthPlannerSetup["readiness"];
  }>(
    "/baseline",
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
    "Unable to save Health baseline.",
  );
}

export type HealthGoalPayload = {
  category: string;
  title: string;
  currentValue?: string;
  targetValue: string;
  unit?: string;
  horizonMode: HealthGoalHorizonMode;
  targetDate?: string;
  relativeMonths?: number;
  priority?: number;
  successCriteria?: string;
  notes?: string;
};

export function createHealthGoal(payload: HealthGoalPayload) {
  return request<HealthGoal>(
    "/goals",
    { method: "POST", body: JSON.stringify(payload) },
    "Unable to create Health target.",
  );
}

export function updateHealthGoal(
  id: string,
  payload: Partial<HealthGoalPayload> & { status?: HealthGoalStatus },
) {
  return request<HealthGoal>(
    `/goals/${encodeURIComponent(id)}`,
    { method: "PATCH", body: JSON.stringify(payload) },
    "Unable to update Health target.",
  );
}

export function removeHealthGoal(id: string) {
  return request<{ removed: boolean }>(
    `/goals/${encodeURIComponent(id)}`,
    { method: "DELETE" },
    "Unable to remove Health target.",
  );
}

export function uploadHealthPhoto(input: {
  file: File;
  category: HealthPhotoCategory;
  angle: string;
  takenAt?: string;
}) {
  const query = new URLSearchParams({
    category: input.category,
    angle: input.angle,
  });
  if (input.takenAt) query.set("takenAt", input.takenAt);
  const body = new FormData();
  body.append("file", input.file);
  return request<HealthPhoto>(
    `/photos?${query}`,
    { method: "POST", body },
    "Unable to upload Health progress photo.",
  );
}

export function removeHealthPhoto(id: string) {
  return request<{ removed: boolean }>(
    `/photos/${encodeURIComponent(id)}`,
    { method: "DELETE" },
    "Unable to remove Health progress photo.",
  );
}

export function getHealthPhotoContentUrl(id: string) {
  return `${BASE}/photos/${encodeURIComponent(id)}/content`;
}

export function uploadHealthSourceReport(input: {
  file: File;
  label?: string;
  reportDate?: string;
}) {
  const query = new URLSearchParams();
  if (input.label?.trim()) query.set("label", input.label.trim());
  if (input.reportDate) query.set("reportDate", input.reportDate);
  const body = new FormData();
  body.append("file", input.file);
  const suffix = query.size ? `?${query}` : "";
  return request<HealthSourceReport>(
    `/reports${suffix}`,
    { method: "POST", body },
    "Unable to upload Health report.",
  );
}

export function removeHealthSourceReport(id: string) {
  return request<{ removed: boolean }>(
    `/reports/${encodeURIComponent(id)}`,
    { method: "DELETE" },
    "Unable to remove Health report.",
  );
}

export function reanalyzeHealthSourceReport(id: string) {
  return request<HealthSourceReport>(
    `/reports/${encodeURIComponent(id)}/reanalyze`,
    { method: "POST" },
    "Unable to re-analyze Health report.",
  );
}

export function updateHealthSourceReportFollowUp(
  id: string,
  index: number,
  payload: {
    dueAt?: string;
    status?: "scheduled" | "needs_confirmation" | "completed" | "dismissed";
    reminderEnabled?: boolean;
  },
) {
  return request<HealthSourceReport>(
    `/reports/${encodeURIComponent(id)}/follow-ups/${index}`,
    { method: "PATCH", body: JSON.stringify(payload) },
    "Unable to update Health report follow-up.",
  );
}

export function getHealthSourceReportContentUrl(id: string) {
  return `${BASE}/reports/${encodeURIComponent(id)}/content`;
}

export function generateHealthStrategy(force = false) {
  return request<HealthStrategy>(
    "/strategy/generate",
    { method: "POST", body: JSON.stringify({ force }) },
    "Unable to generate Health strategy.",
  );
}

export function getHealthPlanWindow(aheadDays = 7) {
  return request<HealthPlanWindow>(
    `/window?aheadDays=${aheadDays}`,
    {},
    "Unable to load the rolling Health plan.",
  );
}

export function ensureHealthPlan(forceRefresh = false, aheadDays = 7) {
  return request<HealthPlanWindow>(
    "/ensure",
    { method: "POST", body: JSON.stringify({ forceRefresh, aheadDays }) },
    "Unable to refresh the rolling Health plan.",
  );
}

export function regenerateHealthPlanDay(dateKey: string) {
  return request<HealthPlanWindow>(
    `/days/${encodeURIComponent(dateKey)}/regenerate`,
    { method: "POST" },
    "Unable to regenerate this Health day.",
  );
}

export function updateHealthPlanDay(
  dateKey: string,
  payload: {
    lockedByOwner?: boolean;
    status?: HealthPlanStatus;
    ownerNotes?: string;
  },
) {
  return request<unknown>(
    `/days/${encodeURIComponent(dateKey)}`,
    { method: "PATCH", body: JSON.stringify(payload) },
    "Unable to update this Health day.",
  );
}

export function getHealthDailyProgress(dateKey: string) {
  return request<HealthDailyProgress>(
    `/progress/daily/${encodeURIComponent(dateKey)}`,
    {},
    "Unable to load today's Health execution.",
  );
}

export function updateHealthRoutineTask(
  dateKey: string,
  taskKey: string,
  status: HealthRoutineTaskStatus,
) {
  return request<HealthDailyProgress>(
    `/progress/daily/${encodeURIComponent(dateKey)}/tasks/${encodeURIComponent(taskKey)}`,
    {
      method: "PATCH",
      body: JSON.stringify({ status }),
    },
    "Unable to update Health routine task.",
  );
}

export type HealthExecutionFeedbackPayload = {
  energyScore?: number;
  fatigueScore?: number;
  sorenessScore?: number;
  stressScore?: number;
  hungerScore?: number;
  planDifficultyScore?: number;
  smokingStatus?: HealthSubstanceUseStatus;
  smokingQuantity?: number;
  smokingUnit?: string;
  smokingType?: string;
  alcoholStatus?: HealthSubstanceUseStatus;
  alcoholQuantity?: number;
  alcoholUnit?: string;
  alcoholType?: string;
  whatWorked?: string[];
  blockers?: string[];
  requestedChanges?: string[];
  notes?: string;
};

export function saveHealthExecutionFeedback(
  dateKey: string,
  payload: HealthExecutionFeedbackPayload,
) {
  return request<HealthDailyProgress>(
    `/progress/daily/${encodeURIComponent(dateKey)}/feedback`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
    "Unable to save Health check-in.",
  );
}

export function getHealthProgressSummary(days = 30) {
  return request<HealthProgressSummary>(
    `/progress/summary?days=${days}`,
    {},
    "Unable to load Health progress.",
  );
}

export function getHealthIntelligence(days = 30) {
  return request<HealthIntelligence>(
    `/progress/intelligence?days=${days}`,
    {},
    "Unable to load Health intelligence.",
  );
}

export function getHealthProgressReviews(
  periodType?: "weekly" | "monthly",
  limit = 12,
) {
  const query = new URLSearchParams({ limit: String(limit) });
  if (periodType) query.set("periodType", periodType);
  return request<HealthPlanReview[]>(
    `/progress/reviews?${query}`,
    {},
    "Unable to load Health reviews.",
  );
}

export function generateHealthProgressReview(
  periodType: "weekly" | "monthly",
  force = false,
) {
  return request<HealthPlanReview>(
    `/progress/reviews/${periodType}/generate`,
    {
      method: "POST",
      body: JSON.stringify({ force }),
    },
    "Unable to generate Health review.",
  );
}

export function getHealthOwnerUpdates(
  domain?: HealthOwnerUpdateDomain,
  limit = 30,
) {
  const query = new URLSearchParams({ limit: String(limit) });
  if (domain) query.set("domain", domain);
  return request<HealthOwnerUpdate[]>(
    `/updates?${query}`,
    {},
    "Unable to load Health updates.",
  );
}

export function createHealthOwnerUpdate(
  domain: HealthOwnerUpdateDomain,
  update: string,
  refreshPlan = true,
) {
  return request<HealthOwnerUpdate>(
    "/updates",
    {
      method: "POST",
      body: JSON.stringify({ domain, update, refreshPlan }),
    },
    "Unable to apply Health update.",
  );
}

export function getHealthNotificationPreferences() {
  return request<
    import("@/types/health-planner").HealthNotificationPreferences
  >(
    "/proactive/preferences",
    {},
    "Unable to load Health notification preferences.",
  );
}

export function updateHealthNotificationPreferences(
  payload: Partial<
    Omit<
      import("@/types/health-planner").HealthNotificationPreferences,
      "_id" | "ownerKey" | "importantAlertsEnabled" | "isActive"
    >
  >,
) {
  return request<
    import("@/types/health-planner").HealthNotificationPreferences
  >(
    "/proactive/preferences",
    { method: "PATCH", body: JSON.stringify(payload) },
    "Unable to update Health notification preferences.",
  );
}

export function getHealthMorningBrief() {
  return request<import("@/types/health-planner").HealthMorningBrief>(
    "/proactive/morning-brief",
    {},
    "Unable to load the Health morning brief.",
  );
}

export function getHealthAttention(
  status: import("@/types/health-planner").HealthAttentionStatus = "open",
  limit = 50,
) {
  const query = new URLSearchParams({ status, limit: String(limit) });
  return request<import("@/types/health-planner").HealthAttentionResponse>(
    `/proactive/attention?${query}`,
    {},
    "Unable to load Health attention items.",
  );
}

export function resolveHealthAttention(id: string) {
  return request<import("@/types/health-planner").HealthProactiveAttentionItem>(
    `/proactive/attention/${encodeURIComponent(id)}/resolve`,
    { method: "PATCH" },
    "Unable to resolve this Health attention item.",
  );
}

export function dismissHealthAttention(id: string) {
  return request<import("@/types/health-planner").HealthProactiveAttentionItem>(
    `/proactive/attention/${encodeURIComponent(id)}/dismiss`,
    { method: "PATCH" },
    "Unable to dismiss this Health attention item.",
  );
}

export function getHealthInterventions(limit = 50) {
  return request<import("@/types/health-planner").HealthIntervention[]>(
    `/proactive/interventions?limit=${Math.min(100, Math.max(1, limit))}`,
    {},
    "Unable to load Health interventions.",
  );
}

export function runHealthProactive(force = false) {
  return request<{
    dateKey: string;
    attention: { synced: number; counts: Record<string, number> };
    intervention: import("@/types/health-planner").HealthIntervention | null;
    followUps: unknown[];
  }>(
    "/proactive/run",
    { method: "POST", body: JSON.stringify({ force }) },
    "Unable to run proactive Health coaching.",
  );
}

export function getHealthEvidence() {
  return request<import("@/types/health-planner").HealthEvidenceOverview>(
    "/evidence",
    {},
    "Unable to load Health evidence.",
  );
}

export function getHealthEvidenceSettings() {
  return request<import("@/types/health-planner").HealthEvidenceSettings>(
    "/evidence/settings",
    {},
    "Unable to load Health evidence settings.",
  );
}

export function updateHealthEvidenceSettings(
  payload: Partial<
    Omit<
      import("@/types/health-planner").HealthEvidenceSettings,
      "_id" | "key" | "sourcePriority" | "isActive"
    >
  >,
) {
  return request<import("@/types/health-planner").HealthEvidenceSettings>(
    "/evidence/settings",
    { method: "PATCH", body: JSON.stringify(payload) },
    "Unable to update Health evidence settings.",
  );
}

export function markHealthBaselineReviewed() {
  return request<{
    reviewed: boolean;
    lastReviewedAt: string | null;
    reviewVersion: number;
  }>(
    "/evidence/baseline/review",
    { method: "POST" },
    "Unable to mark the Health baseline as reviewed.",
  );
}

export async function syncRecentWhoopHealth(days = 3) {
  const safeDays = Math.min(14, Math.max(1, Math.round(days || 3)));
  const response = await fetch(
    `/api/admin/backend/integrations/whoop/sync/recent?days=${safeDays}`,
    {
      method: "POST",
      credentials: "include",
      cache: "no-store",
    },
  );
  return readResponse<unknown>(response, "Unable to sync recent WHOOP health data.");
}
