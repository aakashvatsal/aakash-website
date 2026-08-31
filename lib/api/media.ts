import { getAdminBackendHeaders } from "@/lib/api/admin-backend-headers";

import type {
  CreateMediaPostPayload,
  MediaFilters,
  MediaListResponse,
  MediaPlatform,
  MediaPost,
  MediaPostStatus,
  MediaPostType,
  UpdateMediaPostPayload,
} from "@/types/media";

const API_URL =
  process.env.BACKEND_API_URL ??
  "http://localhost:4000/api/v1";

const ADMIN_API_URL =
  "/api/admin/backend";

interface ApiErrorResponse {
  message?: string | string[];

  error?: string;
}

function getErrorMessage(
  payload: ApiErrorResponse,
): string {
  if (
    Array.isArray(
      payload.message,
    )
  ) {
    return payload.message.join(
      ", ",
    );
  }

  return (
    payload.message ??
    payload.error ??
    "Something went wrong."
  );
}

async function parseResponse<T>(
  response: Response,
): Promise<T> {
  let payload: unknown;

  try {
    payload =
      await response.json();
  } catch {
    throw new Error(
      `Invalid API response with status ${response.status}.`,
    );
  }

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        payload as ApiErrorResponse,
      ),
    );
  }

  return payload as T;
}

function buildQuery(
  filters: MediaFilters,
): string {
  const params =
    new URLSearchParams();

  if (
    filters.search?.trim()
  ) {
    params.set(
      "search",
      filters.search.trim(),
    );
  }

  if (
    filters.platform
  ) {
    params.set(
      "platform",
      filters.platform,
    );
  }

  if (
    filters.status
  ) {
    params.set(
      "status",
      filters.status,
    );
  }

  if (
    filters.postType
  ) {
    params.set(
      "postType",
      filters.postType,
    );
  }

  if (
    filters.contentPillar?.trim()
  ) {
    params.set(
      "contentPillar",
      filters.contentPillar.trim(),
    );
  }

  if (
    filters.page
  ) {
    params.set(
      "page",
      String(
        filters.page,
      ),
    );
  }

  if (
    filters.limit
  ) {
    params.set(
      "limit",
      String(
        filters.limit,
      ),
    );
  }

  return params.toString();
}

function unwrapMediaPost(
  result:
    | MediaPost
    | {
        status?: number;
        statusCode?: number;
        message?: string;
        data: MediaPost;
      },
): MediaPost {
  if (
    typeof result ===
      "object" &&
    result !== null &&
    "data" in result
  ) {
    return result.data;
  }

  return result as MediaPost;
}

export async function createMediaPost(
  payload: CreateMediaPostPayload,
): Promise<MediaPost> {
  const response =
    await fetch(
      `${ADMIN_API_URL}/media`,
      {
        method: "POST",

        credentials:
          "include",

        cache: "no-store",

        headers: {
          Accept:
            "application/json",

          "Content-Type":
            "application/json",
        },

        body: JSON.stringify(
          payload,
        ),
      },
    );

  const result =
    await parseResponse<
      | MediaPost
      | {
          status?: number;
          statusCode?: number;
          message?: string;
          data: MediaPost;
        }
    >(response);

  return unwrapMediaPost(
    result,
  );
}

export async function getMediaPosts(
  filters: MediaFilters = {},
): Promise<MediaListResponse> {
  const query =
    buildQuery(filters);

  const response =
    await fetch(
      `${API_URL}/media${
        query
          ? `?${query}`
          : ""
      }`,
      {
        method: "GET",

        cache: "no-store",

        headers: getAdminBackendHeaders(),
      },
    );

  const payload =
    await parseResponse<
      | MediaListResponse
      | MediaPost[]
    >(response);

  if (
    Array.isArray(
      payload,
    )
  ) {
    return {
      data: payload,

      pagination: {
        page: 1,
        limit:
          payload.length,
        total:
          payload.length,
        totalPages: 1,
      },
    };
  }

  return {
    ...payload,

    data: Array.isArray(
      payload.data,
    )
      ? payload.data
      : [],
  };
}

export async function getMediaPostById(
  id: string,
): Promise<
  MediaPost | null
> {
  // The legacy editor only accepts Mongo ObjectIds. Static Media routes
  // (for example /media/engagement) must never be sent to the legacy API
  // as if their route segment were a MediaPost id.
  if (!/^[a-f\d]{24}$/i.test(id)) {
    return null;
  }

  const response =
    await fetch(
      `${API_URL}/media/${encodeURIComponent(
        id,
      )}`,
      {
        method: "GET",

        cache: "no-store",

        headers: getAdminBackendHeaders(),
      },
    );

  if (
    response.status === 404
  ) {
    return null;
  }

  const payload =
    await parseResponse<
      | MediaPost
      | {
          status?: number;
          statusCode?: number;
          message?: string;
          data: MediaPost;
        }
    >(response);

  return unwrapMediaPost(
    payload,
  );
}

export function isMediaPlatform(
  value?: string,
): value is MediaPlatform {
  return [
    "linkedin",
    "instagram",
    "youtube",
    "x",
    "facebook",
    "threads",
    "whatsapp",
  ].includes(
    value ?? "",
  );
}

export function isMediaPostStatus(
  value?: string,
): value is MediaPostStatus {
  return [
    "idea",
    "draft",
    "script_ready",
    "assets_pending",
    "ready",
    "scheduled",
    "posted",
    "failed",
    "cancelled",
  ].includes(
    value ?? "",
  );
}

export async function updateMediaPost(
  id: string,
  payload: UpdateMediaPostPayload,
): Promise<MediaPost> {
  const response =
    await fetch(
      `${ADMIN_API_URL}/media/${encodeURIComponent(
        id,
      )}`,
      {
        method: "PATCH",

        credentials:
          "include",

        cache: "no-store",

        headers: {
          Accept:
            "application/json",

          "Content-Type":
            "application/json",
        },

        body: JSON.stringify(
          payload,
        ),
      },
    );

  const result =
    await parseResponse<
      | MediaPost
      | {
          status?: number;
          statusCode?: number;
          message?: string;
          data: MediaPost;
        }
    >(response);

  return unwrapMediaPost(
    result,
  );
}

export async function deleteMediaPost(
  id: string,
): Promise<void> {
  const response =
    await fetch(
      `${ADMIN_API_URL}/media/${encodeURIComponent(
        id,
      )}`,
      {
        method:
          "DELETE",

        credentials:
          "include",

        cache:
          "no-store",
      },
    );

  if (
    !response.ok
  ) {
    let payload:
      | ApiErrorResponse
      | null = null;

    try {
      payload =
        await response.json();
    } catch {
      payload = null;
    }

    throw new Error(
      payload
        ? getErrorMessage(
            payload,
          )
        : `Delete failed with status ${response.status}`,
    );
  }
}

export function isMediaPostType(
  value?: string,
): value is MediaPostType {
  return [
    "text",
    "image",
    "carousel",
    "reel",
    "video",
    "short",
    "story",
    "article",
    "poll",
    "thread",
    "whatsapp_message",
    "whatsapp_status",
    "whatsapp_template",
  ].includes(
    value ?? "",
  );
}
export async function getMediaCoreOverview() {
  const response = await fetch(`${API_URL}/media/core/overview`, { cache: "no-store", headers: getAdminBackendHeaders() });
  return parseResponse<import("@/types/media").MediaCoreOverview>(response);
}

export async function getMediaCoreAccounts() {
  const response = await fetch(`${API_URL}/media/core/accounts`, { cache: "no-store", headers: getAdminBackendHeaders() });
  return parseResponse<import("@/types/media").MediaAccount[]>(response);
}

export async function getMediaCoreContent() {
  const response = await fetch(`${API_URL}/media/core/content`, { cache: "no-store", headers: getAdminBackendHeaders() });
  return parseResponse<import("@/types/media").MediaContentItem[]>(response);
}

export async function getMediaCorePublications() {
  const response = await fetch(`${API_URL}/media/core/publications`, { cache: "no-store", headers: getAdminBackendHeaders() });
  return parseResponse<import("@/types/media").MediaPublication[]>(response);
}

export async function getMediaMigrationStatus() {
  const response = await fetch(`${API_URL}/media/core/migration`, { cache: "no-store", headers: getAdminBackendHeaders() });
  return parseResponse<import("@/types/media").MediaMigrationStatus>(response);
}

export async function createMediaCoreResource<T>(path: string, payload: unknown): Promise<T> {
  const response = await fetch(`${ADMIN_API_URL}/media/core/${path}`, {
    method: "POST",
    credentials: "include",
    cache: "no-store",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseResponse<T>(response);
}

export async function migrateLegacyMedia() {
  return createMediaCoreResource<import("@/types/media").MediaMigrationStatus & { migrated: number }>("migration", {});
}

export async function getMediaIntelligenceOverview() {
  const response = await fetch(`${API_URL}/media/core/intelligence/overview`, {
    cache: "no-store",
    headers: getAdminBackendHeaders(),
  });
  return parseResponse<import("@/types/media").MediaIntelligenceOverview>(response);
}

export async function getMediaContentMemories(limit = 50) {
  const response = await fetch(
    `${API_URL}/media/core/intelligence/memories?limit=${encodeURIComponent(String(limit))}`,
    { cache: "no-store", headers: getAdminBackendHeaders() },
  );
  return parseResponse<import("@/types/media").MediaContentMemory[]>(response);
}

export async function backfillMediaIntelligence(payload?: {
  limit?: number;
  refresh?: boolean;
  includePublications?: boolean;
}) {
  return createMediaCoreResource<import("@/types/media").MediaIntelligenceBackfillResult>(
    "intelligence/backfill",
    {
      limit: payload?.limit ?? 100,
      refresh: payload?.refresh ?? false,
      includePublications: payload?.includePublications ?? true,
    },
  );
}

export async function getMediaDirectorOverview() {
  const response = await fetch(`${API_URL}/media/core/director/overview`, {
    cache: "no-store",
    headers: getAdminBackendHeaders(),
  });
  return parseResponse<import("@/types/media").MediaDirectorOverview>(response);
}

export async function getMediaDirectorRuns(limit = 20) {
  const response = await fetch(
    `${API_URL}/media/core/director/runs?limit=${encodeURIComponent(String(limit))}`,
    { cache: "no-store", headers: getAdminBackendHeaders() },
  );
  return parseResponse<import("@/types/media").MediaGenerationRun[]>(response);
}

export async function getMediaDirectorRun(runId: string) {
  const response = await fetch(
    `${API_URL}/media/core/director/runs/${encodeURIComponent(runId)}`,
    { cache: "no-store", headers: getAdminBackendHeaders() },
  );
  return parseResponse<import("@/types/media").MediaGenerationRun>(response);
}

export async function generateMediaDirectorBatch(
  payload: import("@/types/media").GenerateMediaDirectorPayload,
) {
  return createMediaCoreResource<import("@/types/media").MediaGenerationRun>(
    "director/generate",
    payload,
  );
}

export async function acceptMediaDirectorCandidate(
  runId: string,
  candidateKey: string,
  platforms?: import("@/types/media").MediaPlatform[],
) {
  return createMediaCoreResource<{
    contentItem: import("@/types/media").MediaContentItem;
    publications: import("@/types/media").MediaPublication[];
    run: import("@/types/media").MediaGenerationRun;
    alreadyAccepted: boolean;
  }>(
    `director/runs/${encodeURIComponent(runId)}/candidates/${encodeURIComponent(candidateKey)}/accept`,
    platforms?.length ? { platforms } : {},
  );
}

export async function rejectMediaDirectorCandidate(
  runId: string,
  candidateKey: string,
  reason?: string,
) {
  return createMediaCoreResource<{
    run: import("@/types/media").MediaGenerationRun;
    candidate?: import("@/types/media").MediaDirectorCandidate;
    alreadyRejected: boolean;
  }>(
    `director/runs/${encodeURIComponent(runId)}/candidates/${encodeURIComponent(candidateKey)}/reject`,
    reason?.trim() ? { reason: reason.trim() } : {},
  );
}

export async function getMediaProductionOverview() {
  const response = await fetch(`${API_URL}/media/core/production/overview`, {
    cache: "no-store",
    headers: getAdminBackendHeaders(),
  });
  return parseResponse<import("@/types/media").MediaProductionOverview>(response);
}

export async function getMediaProductionStudio() {
  const response = await fetch(`${API_URL}/media/core/production/publications`, {
    cache: "no-store",
    headers: getAdminBackendHeaders(),
  });
  return parseResponse<import("@/types/media").MediaProductionStudioItem[]>(response);
}

export async function getMediaProductionPack(publicationId: string) {
  const response = await fetch(
    `${API_URL}/media/core/production/publications/${encodeURIComponent(publicationId)}`,
    { cache: "no-store", headers: getAdminBackendHeaders() },
  );
  return parseResponse<import("@/types/media").MediaProductionStudioItem>(response);
}

export async function generateMediaProductionPack(
  publicationId: string,
  payload?: { force?: boolean; instructions?: string },
) {
  return createMediaCoreResource<
    import("@/types/media").MediaProductionStudioItem & { alreadyGenerated: boolean }
  >(
    `production/publications/${encodeURIComponent(publicationId)}/generate`,
    payload ?? {},
  );
}

export async function completeMediaProduction(publicationId: string) {
  return createMediaCoreResource<import("@/types/media").MediaProductionStudioItem>(
    `production/publications/${encodeURIComponent(publicationId)}/complete`,
    {},
  );
}

export async function updateMediaProductionAsset(
  assetId: string,
  payload: {
    status?: "planned" | "ready" | "archived";
    source?: import("@/types/media").MediaSourceType;
    url?: string;
    storageKey?: string;
    notes?: string;
  },
) {
  const response = await fetch(
    `${ADMIN_API_URL}/media/core/production/assets/${encodeURIComponent(assetId)}`,
    {
      method: "PATCH",
      credentials: "include",
      cache: "no-store",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
  return parseResponse<{
    asset: import("@/types/media").MediaAsset;
    publication?: import("@/types/media").MediaPublication;
    contentItem?: import("@/types/media").MediaContentItem;
    assets?: import("@/types/media").MediaAsset[];
    readiness?: import("@/types/media").MediaProductionReadiness;
  }>(response);
}

export async function getMediaCalendarOverview() {
  const response = await fetch(`${API_URL}/media/core/calendar/overview`, {
    cache: "no-store",
    headers: getAdminBackendHeaders(),
  });
  return parseResponse<import("@/types/media").MediaCalendarOverview>(response);
}

export async function ensureMediaCalendarHorizon() {
  return createMediaCoreResource<{ created: number; minimumPlanningHorizonDays: number }>(
    "calendar/ensure",
    {},
  );
}

export async function updateMediaCoreAccount(
  accountId: string,
  payload: import("@/types/media").UpdateMediaAccountPayload,
) {
  const response = await fetch(
    `${ADMIN_API_URL}/media/core/accounts/${encodeURIComponent(accountId)}`,
    {
      method: "PATCH",
      credentials: "include",
      cache: "no-store",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
  return parseResponse<import("@/types/media").MediaAccount>(response);
}

export async function reserveMediaCalendarSlot(
  slotId: string,
  publicationId: string,
  notes?: string,
) {
  return createMediaCoreResource<import("@/types/media").MediaCalendarSlot>(
    `calendar/slots/${encodeURIComponent(slotId)}/reserve`,
    { publicationId, ...(notes?.trim() ? { notes: notes.trim() } : {}) },
  );
}

export async function scheduleMediaPublication(
  publicationId: string,
  payload: { slotId?: string; scheduledAt?: string; autoPublish?: boolean },
) {
  return createMediaCoreResource<import("@/types/media").MediaPublication>(
    `calendar/publications/${encodeURIComponent(publicationId)}/schedule`,
    payload,
  );
}

export async function publishMediaPublicationNow(publicationId: string) {
  return createMediaCoreResource<import("@/types/media").MediaPublication>(
    `calendar/publications/${encodeURIComponent(publicationId)}/publish-now`,
    {},
  );
}

export async function retryMediaPublication(publicationId: string) {
  return createMediaCoreResource<import("@/types/media").MediaPublication>(
    `calendar/publications/${encodeURIComponent(publicationId)}/retry`,
    { publishNow: true },
  );
}

export async function completeManualMediaPublication(
  publicationId: string,
  payload?: { externalPostUrl?: string; platformPostId?: string },
) {
  return createMediaCoreResource<import("@/types/media").MediaPublication>(
    `calendar/publications/${encodeURIComponent(publicationId)}/manual-complete`,
    payload ?? {},
  );
}

export async function getMediaBufferStatus() {
  const response = await fetch(`${API_URL}/media/core/buffer/status`, {
    cache: "no-store",
    headers: getAdminBackendHeaders(),
  });
  return parseResponse<import("@/types/media").MediaBufferStatus>(response);
}

export async function syncMediaBufferAccounts() {
  return createMediaCoreResource<import("@/types/media").MediaBufferSyncResult>(
    "buffer/sync",
    {},
  );
}

export async function connectMediaAccountToBuffer(
  accountId: string,
  payload: { organizationId: string; channelId: string },
) {
  return createMediaCoreResource<import("@/types/media").MediaAccount>(
    `buffer/accounts/${encodeURIComponent(accountId)}/connect`,
    payload,
  );
}

export async function disconnectMediaAccountFromBuffer(accountId: string) {
  return createMediaCoreResource<import("@/types/media").MediaAccount>(
    `buffer/accounts/${encodeURIComponent(accountId)}/disconnect`,
    {},
  );
}

export async function reconcileMediaBufferPublications() {
  return createMediaCoreResource<{
    checked: number;
    published: number;
    failed: number;
    pending: number;
  }>("buffer/reconcile", {});
}

export async function getMediaGrowthOverview(days = 30) {
  const response = await fetch(
    `${API_URL}/media/core/growth/overview?days=${encodeURIComponent(String(days))}`,
    { cache: "no-store", headers: getAdminBackendHeaders() },
  );
  return parseResponse<import("@/types/media").MediaGrowthOverview>(response);
}

export async function syncMediaGrowthMetrics(limit = 50) {
  return createMediaCoreResource<{
    attempted: number;
    synced: string[];
    failures: Array<{ publicationId: string; error: string }>;
  }>("growth/sync", { limit });
}

export async function syncMediaGrowthAccounts(limit = 50) {
  return createMediaCoreResource<{
    attempted: number;
    synced: string[];
    failures: Array<{ accountId: string; error: string }>;
  }>("growth/accounts/sync", { limit });
}

export async function rebuildMediaGrowthLearnings(payload?: {
  days?: number;
  minSampleSize?: number;
}) {
  return createMediaCoreResource<{
    rangeDays: number;
    minSampleSize: number;
    measuredPublications: number;
    generatedLearnings: number;
    positive: number;
    negative: number;
    learnings: import("@/types/media").MediaGrowthLearning[];
  }>("growth/learnings/rebuild", payload ?? {});
}

export async function createMediaGrowthExperiment(payload: {
  title: string;
  hypothesis: string;
  platform?: import("@/types/media").MediaPlatform;
  variable: string;
  control: string;
  variant: string;
}) {
  return createMediaCoreResource<import("@/types/media").MediaGrowthExperiment>(
    "growth/experiments",
    payload,
  );
}

export async function getMediaEngagementOverview(days = 30) {
  const response = await fetch(
    `${API_URL}/media/core/engagement/overview?days=${encodeURIComponent(String(days))}`,
    { cache: "no-store", headers: getAdminBackendHeaders() },
  );
  return parseResponse<import("@/types/media").MediaEngagementOverview>(response);
}

export async function getMediaEngagementItems(
  filters: import("@/types/media").MediaEngagementFilters = {},
) {
  const params = new URLSearchParams();
  if (filters.platform) params.set("platform", filters.platform);
  if (filters.status) params.set("status", filters.status);
  if (filters.priority) params.set("priority", filters.priority);
  if (filters.intent) params.set("intent", filters.intent);
  if (filters.needsResponse !== undefined) {
    params.set("needsResponse", String(filters.needsResponse));
  }
  if (filters.search?.trim()) params.set("search", filters.search.trim());
  if (filters.limit !== undefined) {
    const normalizedLimit = Math.min(300, Math.max(1, Math.trunc(filters.limit)));
    params.set("limit", String(normalizedLimit));
  }
  const query = params.toString();
  const response = await fetch(
    `${API_URL}/media/core/engagement/items${query ? `?${query}` : ""}`,
    { cache: "no-store", headers: getAdminBackendHeaders() },
  );
  return parseResponse<import("@/types/media").MediaEngagementItem[]>(response);
}

export async function syncMediaEngagement(limitPerAccount = 100) {
  return createMediaCoreResource<import("@/types/media").MediaEngagementSyncResult>(
    "engagement/sync",
    { limitPerAccount },
  );
}

export async function draftMediaEngagementReply(
  engagementId: string,
  payload?: { force?: boolean; instructions?: string },
) {
  return createMediaCoreResource<import("@/types/media").MediaEngagementItem>(
    `engagement/items/${encodeURIComponent(engagementId)}/draft`,
    payload ?? {},
  );
}

export async function sendMediaEngagementReply(engagementId: string, text: string) {
  return createMediaCoreResource<import("@/types/media").MediaEngagementItem>(
    `engagement/items/${encodeURIComponent(engagementId)}/reply`,
    { text },
  );
}

export async function updateMediaEngagementStatus(
  engagementId: string,
  status: import("@/types/media").MediaEngagementStatus,
) {
  const response = await fetch(
    `${ADMIN_API_URL}/media/core/engagement/items/${encodeURIComponent(engagementId)}/status`,
    {
      method: "PATCH",
      credentials: "include",
      cache: "no-store",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    },
  );
  return parseResponse<import("@/types/media").MediaEngagementItem>(response);
}

export async function getMediaAutopilotOverview() {
  const response = await fetch(`${API_URL}/media/core/autopilot/overview`, {
    cache: "no-store",
    headers: getAdminBackendHeaders(),
  });
  return parseResponse<import("@/types/media").MediaAutopilotOverview>(response);
}

export async function getMediaAutopilotRuns(limit = 20) {
  const normalized = Math.min(100, Math.max(1, Math.trunc(limit)));
  const response = await fetch(
    `${API_URL}/media/core/autopilot/runs?limit=${encodeURIComponent(String(normalized))}`,
    { cache: "no-store", headers: getAdminBackendHeaders() },
  );
  return parseResponse<import("@/types/media").MediaAutopilotRun[]>(response);
}

export async function runMediaAutopilot(payload?: {
  type?: import("@/types/media").MediaAutopilotRunType;
  generateDrafts?: boolean;
}) {
  return createMediaCoreResource<import("@/types/media").MediaAutopilotRun>(
    "autopilot/run",
    payload ?? {},
  );
}

export async function updateMediaAutopilotSettings(
  payload: Partial<
    Pick<
      import("@/types/media").MediaAutopilotSettings,
      | "enabled"
      | "dailyEnabled"
      | "weeklyEnabled"
      | "autoDraftCalendarGaps"
      | "planningHorizonDays"
      | "maxDailyDraftRuns"
      | "candidateCount"
    >
  >,
) {
  const response = await fetch(`${ADMIN_API_URL}/media/core/autopilot/settings`, {
    method: "PATCH",
    credentials: "include",
    cache: "no-store",
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  return parseResponse<import("@/types/media").MediaAutopilotSettings>(response);
}

export async function updateMediaAutopilotRecommendation(
  runId: string,
  recommendationKey: string,
  status: import("@/types/media").MediaAutopilotRecommendationStatus,
) {
  const response = await fetch(
    `${ADMIN_API_URL}/media/core/autopilot/runs/${encodeURIComponent(runId)}/recommendations/${encodeURIComponent(recommendationKey)}`,
    {
      method: "PATCH",
      credentials: "include",
      cache: "no-store",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    },
  );
  return parseResponse<import("@/types/media").MediaAutopilotRun>(response);
}
