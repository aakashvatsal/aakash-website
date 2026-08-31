import {
  ApiEnvelope,
  Memory,
  MemoryAccessLevel,
  MemoryCaptureOrigin,
  MemoryDurability,
  MemoryEntityReference,
  MemoryInboxItem,
  MemoryInboxStatus,
  MemoryLifecycleStatus,
  MemoryPersonRelation,
  MemoryRecallIntent,
  MemoryRecallResponse,
  MemoryReviewQueue,
  MemoryScope,
  MemorySensitivity,
  MemorySource,
  MemorySourceReference,
  MemoryType,
  MemoryVerificationStatus,
  PaginatedResponse,
} from "@/types/hsakaa";

const API_URL =
  process.env.BACKEND_API_URL ??
  "http://localhost:4000/api/v1";

const ADMIN_API_URL =
  "/api/admin/backend";

export type MemoryQuery = {
  page?: number;
  limit?: number;
  search?: string;

  personId?: string;
  subjectPersonId?: string;
  scope?: MemoryScope | "";
  personRelation?: MemoryPersonRelation | "";

  type?: MemoryType | "";

  source?: MemorySource | "";

  accessLevel?:
    | MemoryAccessLevel
    | "";

  sensitivity?:
    | MemorySensitivity
    | "";

  verificationStatus?:
    | MemoryVerificationStatus
    | "";

  isDisputed?: boolean;

  isArchived?: boolean;

  category?: string;
  entity?: string;
  durability?: MemoryDurability | "";
  captureOrigin?: MemoryCaptureOrigin | "";
  lifecycleStatus?: MemoryLifecycleStatus | "";
  includeHistorical?: boolean;
};

export type CreateMemoryPayload = {
  personId?: string | null;
  scope?: MemoryScope;
  personLinks?: Array<{ personId: string; relation: MemoryPersonRelation }>;

  content: string;

  type?: MemoryType;

  source?: MemorySource;

  sourceReference?:
    MemorySourceReference;

  tags?: string[];

  categories?: string[];
  entities?: MemoryEntityReference[];

  importance?: number;

  confidence?: number;

  verificationStatus?:
    MemoryVerificationStatus;

  accessLevel?:
    MemoryAccessLevel;

  sensitivity?:
    MemorySensitivity;

  durability?: MemoryDurability;
  captureOrigin?: MemoryCaptureOrigin;
  capturedAt?: string;
  happenedAt?: string;
  inboxItemId?: string;

  expiresAt?: string | null;


};

export type MemoryRecallQuery = {
  query?: string;
  intent?: MemoryRecallIntent;
  type?: MemoryType | "";
  includeHistorical?: boolean;
  limit?: number;
};

export type MemoryInboxQuery = {
  page?: number;
  limit?: number;
  search?: string;
  status?: MemoryInboxStatus | "";
  captureOrigin?: MemoryCaptureOrigin | "";
  durability?: MemoryDurability | "";
  source?: MemorySource | "";
  sensitivity?: MemorySensitivity | "";
  scope?: MemoryScope | "";
};

export type CaptureMemoryInboxItemPayload = {
  personId?: string;
  scope?: MemoryScope;
  personLinks?: Array<{ personId: string; relation: MemoryPersonRelation }>;
  content: string;
  type?: MemoryType;
  source?: MemorySource;
  sourceReference?: MemorySourceReference;
  tags?: string[];
  categories?: string[];
  entities?: MemoryEntityReference[];
  importance?: number;
  confidence?: number;
  verificationStatus?: MemoryVerificationStatus;
  accessLevel?: MemoryAccessLevel;
  sensitivity?: MemorySensitivity;
  durability?: MemoryDurability;
  captureOrigin?: MemoryCaptureOrigin;
  capturedAt?: string;
  happenedAt?: string;
  expiresAt?: string;
  proposalReason?: string;
};

export type AcceptMemoryInboxItemPayload = Partial<
  Pick<
    CaptureMemoryInboxItemPayload,
    | "personId"
    | "scope"
    | "personLinks"
    | "content"
    | "type"
    | "tags"
    | "categories"
    | "entities"
    | "importance"
    | "confidence"
    | "verificationStatus"
    | "accessLevel"
    | "sensitivity"
    | "durability"
    | "happenedAt"
    | "expiresAt"
  >
>;

export type MemoryInboxResponse = {
  data: MemoryInboxItem[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  pendingCount: number;
};

export type UpdateMemoryPayload =
  Partial<CreateMemoryPayload>;

export type UpdateMemoryScorePayload = {
  importance?: number;

  confidence?: number;
};

export type CreateManyMemoryPayload = {
  memories:
    CreateMemoryPayload[];
};

type MemoryListPayload =
  | Memory[]
  | PaginatedResponse<Memory>
  | {
      items?: Memory[];

      results?: Memory[];

      docs?: Memory[];

      total?: number;

      totalCount?: number;

      count?: number;

      page?: number;

      limit?: number;

      totalPages?: number;
    };

type MemoryListResponse =
  | MemoryListPayload
  | ApiEnvelope<MemoryListPayload>;

function buildQuery(
  values: Record<
    string,
    | string
    | number
    | boolean
    | undefined
  >,
) {
  const params =
    new URLSearchParams();

  Object.entries(values).forEach(
    ([key, value]) => {
      if (
        value === undefined ||
        value === null ||
        value === ""
      ) {
        return;
      }

      params.set(
        key,
        String(value),
      );
    },
  );

  return params.toString();
}

function buildPublicUrl(
  path: string,
  query?: string,
) {
  return query
    ? `${API_URL}${path}?${query}`
    : `${API_URL}${path}`;
}

function buildAdminUrl(
  path: string,
  query?: string,
) {
  // Server Components cannot fetch relative URLs such as `/api/admin/backend/...`.
  // Use the Nest backend directly on the server, while keeping browser requests
  // behind the authenticated Next.js admin proxy.
  const baseUrl =
    typeof window === "undefined"
      ? API_URL
      : ADMIN_API_URL;

  return query
    ? `${baseUrl}${path}?${query}`
    : `${baseUrl}${path}`;
}

async function readResponse<T>(
  response: Response,
): Promise<T> {
  const text =
    await response.text();

  if (!text) {
    if (!response.ok) {
      throw new Error(
        `Request failed with status ${response.status}`,
      );
    }

    return undefined as T;
  }

  let result: unknown;

  try {
    result =
      JSON.parse(text);
  } catch {
    throw new Error(text);
  }

  if (!response.ok) {
    let message =
      `Request failed with status ${response.status}`;

    if (
      result &&
      typeof result ===
        "object" &&
      "message" in result
    ) {
      const responseMessage =
        (
          result as {
            message?:
              | string
              | string[];
          }
        ).message;

      message =
        Array.isArray(
          responseMessage,
        )
          ? responseMessage.join(
              ", ",
            )
          : responseMessage ??
            message;
    }

    throw new Error(message);
  }

  return result as T;
}

function unwrapResponse<T>(
  response:
    | T
    | ApiEnvelope<T>,
): T {
  if (
    response &&
    typeof response ===
      "object" &&
    "data" in response
  ) {
    return response.data;
  }

  return response as T;
}

function normalizeMemoryList(
  response:
    MemoryListResponse,
): PaginatedResponse<Memory> {
  const payload =
    unwrapResponse(response);

  if (
    Array.isArray(
      payload,
    )
  ) {
    return {
      data: payload,

      total:
        payload.length,

      page: 1,

      limit:
        payload.length,

      totalPages: 1,
    };
  }

  if (
    "data" in payload &&
    Array.isArray(
      payload.data,
    )
  ) {
    return {
      data:
        payload.data,

      total:
        typeof payload.total ===
        "number"
          ? payload.total
          : payload.data
              .length,

      page:
        typeof payload.page ===
        "number"
          ? payload.page
          : 1,

      limit:
        typeof payload.limit ===
        "number"
          ? payload.limit
          : payload.data
              .length,

      totalPages:
        typeof payload.totalPages ===
        "number"
          ? payload.totalPages
          : 1,
    };
  }

  let items: Memory[] = [];

  if (
    "items" in payload &&
    Array.isArray(
      payload.items,
    )
  ) {
    items =
      payload.items;
  } else if (
    "results" in payload &&
    Array.isArray(
      payload.results,
    )
  ) {
    items =
      payload.results;
  } else if (
    "docs" in payload &&
    Array.isArray(
      payload.docs,
    )
  ) {
    items =
      payload.docs;
  }

  const total =
    "total" in payload &&
    typeof payload.total ===
      "number"
      ? payload.total
      : "totalCount" in
            payload &&
          typeof payload.totalCount ===
            "number"
        ? payload.totalCount
        : "count" in
              payload &&
            typeof payload.count ===
              "number"
          ? payload.count
          : items.length;

  const page =
    "page" in payload &&
    typeof payload.page ===
      "number"
      ? payload.page
      : 1;

  const limit =
    "limit" in payload &&
    typeof payload.limit ===
      "number"
      ? payload.limit
      : items.length;

  const totalPages =
    "totalPages" in
      payload &&
    typeof payload.totalPages ===
      "number"
      ? payload.totalPages
      : limit > 0
        ? Math.max(
            1,
            Math.ceil(
              total / limit,
            ),
          )
        : 1;

  return {
    data: items,
    total,
    page,
    limit,
    totalPages,
  };
}

export async function getMemories(
  query: MemoryQuery = {},
): Promise<
  PaginatedResponse<Memory>
> {
  const queryString =
    buildQuery({
      page:
        query.page,

      limit:
        query.limit,

      search:
        query.search,

      personId:
        query.personId,

      subjectPersonId:
        query.subjectPersonId,

      scope:
        query.scope,

      personRelation:
        query.personRelation,

      type:
        query.type,

      source:
        query.source,

      accessLevel:
        query.accessLevel,

      sensitivity:
        query.sensitivity,

      verificationStatus:
        query.verificationStatus,

      isDisputed:
        query.isDisputed,

      isArchived:
        query.isArchived,

      category:
        query.category,

      entity:
        query.entity,

      durability:
        query.durability,

      captureOrigin:
        query.captureOrigin,

      lifecycleStatus:
        query.lifecycleStatus,

      includeHistorical:
        query.includeHistorical,
    });

  const response =
    await fetch(
      buildAdminUrl(
        "/memory",
        queryString,
      ),
      {
        credentials:
          "include",

        cache:
          "no-store",
      },
    );

  const result =
    await readResponse<MemoryListResponse>(
      response,
    );

  return normalizeMemoryList(
    result,
  );
}

export async function recallMemories(
  query: MemoryRecallQuery = {},
): Promise<MemoryRecallResponse> {
  const queryString = buildQuery({
    query: query.query,
    intent: query.intent,
    type: query.type,
    includeHistorical: query.includeHistorical,
    limit: query.limit,
  });

  const response = await fetch(buildAdminUrl("/memory/recall", queryString), {
    credentials: "include",
    cache: "no-store",
  });

  const result = await readResponse<
    MemoryRecallResponse | ApiEnvelope<MemoryRecallResponse>
  >(response);

  if (
    result &&
    typeof result === "object" &&
    "current" in result &&
    Array.isArray(result.current)
  ) {
    return result as MemoryRecallResponse;
  }

  return unwrapResponse(result as ApiEnvelope<MemoryRecallResponse>);
}

export async function getMemoryInbox(
  query: MemoryInboxQuery = {},
): Promise<MemoryInboxResponse> {
  const queryString = buildQuery({
    page: query.page,
    limit: query.limit,
    search: query.search,
    status: query.status,
    captureOrigin: query.captureOrigin,
    durability: query.durability,
    source: query.source,
    sensitivity: query.sensitivity,
  });

  const response = await fetch(buildAdminUrl("/memory/inbox", queryString), {
    credentials: "include",
    cache: "no-store",
  });

  const result = await readResponse<
    MemoryInboxResponse | ApiEnvelope<MemoryInboxResponse>
  >(response);

  const payload =
    result &&
    typeof result === "object" &&
    "data" in result &&
    !Array.isArray(result.data) &&
    result.data &&
    typeof result.data === "object" &&
    "pendingCount" in result.data
      ? result.data
      : result;

  if (!payload || typeof payload !== "object") {
    return {
      data: [],
      pagination: {
        page: query.page ?? 1,
        limit: query.limit ?? 20,
        total: 0,
        totalPages: 0,
      },
      pendingCount: 0,
    };
  }

  const candidate = payload as Partial<MemoryInboxResponse>;
  const data = Array.isArray(candidate.data) ? candidate.data : [];
  const pagination = candidate.pagination;

  return {
    data,
    pagination: {
      page:
        pagination && typeof pagination.page === "number"
          ? pagination.page
          : query.page ?? 1,
      limit:
        pagination && typeof pagination.limit === "number"
          ? pagination.limit
          : query.limit ?? data.length,
      total:
        pagination && typeof pagination.total === "number"
          ? pagination.total
          : data.length,
      totalPages:
        pagination && typeof pagination.totalPages === "number"
          ? pagination.totalPages
          : data.length > 0
            ? 1
            : 0,
    },
    pendingCount:
      typeof candidate.pendingCount === "number"
        ? candidate.pendingCount
        : data.filter((item) => item.status === MemoryInboxStatus.PENDING).length,
  };
}

export async function captureMemoryInboxItem(
  payload: CaptureMemoryInboxItemPayload,
): Promise<MemoryInboxItem> {
  const response = await fetch(`${ADMIN_API_URL}/memory/inbox`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  const result = await readResponse<
    MemoryInboxItem | ApiEnvelope<MemoryInboxItem>
  >(response);

  return unwrapResponse(result);
}

export async function acceptMemoryInboxItem(
  inboxItemId: string,
  payload: AcceptMemoryInboxItemPayload = {},
): Promise<{ inboxItem: MemoryInboxItem; memory: Memory }> {
  const response = await fetch(
    buildAdminUrl(`/memory/inbox/${encodeURIComponent(inboxItemId)}/accept`),
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );

  const result = await readResponse<
    | { inboxItem: MemoryInboxItem; memory: Memory }
    | ApiEnvelope<{ inboxItem: MemoryInboxItem; memory: Memory }>
  >(response);

  return unwrapResponse(result);
}

export async function rejectMemoryInboxItem(
  inboxItemId: string,
  reason?: string,
): Promise<MemoryInboxItem> {
  const response = await fetch(
    buildAdminUrl(`/memory/inbox/${encodeURIComponent(inboxItemId)}/reject`),
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reason?.trim() ? { reason: reason.trim() } : {}),
    },
  );

  const result = await readResponse<
    MemoryInboxItem | ApiEnvelope<MemoryInboxItem>
  >(response);

  return unwrapResponse(result);
}

export async function getMemory(
  memoryId: string,
): Promise<Memory> {
  if (
    !memoryId.trim()
  ) {
    throw new Error(
      "Memory ID is required.",
    );
  }

  const response =
    await fetch(
      buildAdminUrl(
        `/memory/${encodeURIComponent(
          memoryId,
        )}`,
      ),
      {
        credentials:
          "include",

        cache:
          "no-store",
      },
    );

  const result =
    await readResponse<
      | Memory
      | ApiEnvelope<Memory>
    >(response);

  return unwrapResponse(
    result,
  );
}

export async function createMemory(
  payload:
    CreateMemoryPayload,
): Promise<Memory> {
  const response =
    await fetch(
      `${ADMIN_API_URL}/memory`,
      {
        method: "POST",

        credentials:
          "include",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify(
            payload,
          ),
      },
    );

  const result =
    await readResponse<
      | Memory
      | ApiEnvelope<Memory>
    >(response);

  return unwrapResponse(
    result,
  );
}

export async function createManyMemories(
  payload:
    CreateManyMemoryPayload,
): Promise<Memory[]> {
  const response =
    await fetch(
      `${ADMIN_API_URL}/memory/bulk`,
      {
        method: "POST",

        credentials:
          "include",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify(
            payload,
          ),
      },
    );

  const result =
    await readResponse<
      | Memory[]
      | ApiEnvelope<
          Memory[]
        >
    >(response);

  return unwrapResponse(
    result,
  );
}

export async function updateMemory(
  memoryId: string,
  payload:
    UpdateMemoryPayload,
): Promise<Memory> {
  const response =
    await fetch(
      buildAdminUrl(
        `/memory/${encodeURIComponent(
          memoryId,
        )}`,
      ),
      {
        method: "PATCH",

        credentials:
          "include",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify(
            payload,
          ),
      },
    );

  const result =
    await readResponse<
      | Memory
      | ApiEnvelope<Memory>
    >(response);

  return unwrapResponse(
    result,
  );
}

export async function updateMemoryScore(
  memoryId: string,
  payload:
    UpdateMemoryScorePayload,
): Promise<Memory> {
  const response =
    await fetch(
      buildAdminUrl(
        `/memory/${encodeURIComponent(
          memoryId,
        )}/score`,
      ),
      {
        method: "PATCH",

        credentials:
          "include",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify(
            payload,
          ),
      },
    );

  const result =
    await readResponse<
      | Memory
      | ApiEnvelope<Memory>
    >(response);

  return unwrapResponse(
    result,
  );
}

export async function replaceMemoryTags(
  memoryId: string,
  tags: string[],
): Promise<Memory> {
  const response =
    await fetch(
      buildAdminUrl(
        `/memory/${encodeURIComponent(
          memoryId,
        )}/tags`,
      ),
      {
        method: "PATCH",

        credentials:
          "include",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify({
            tags,
          }),
      },
    );

  const result =
    await readResponse<
      | Memory
      | ApiEnvelope<Memory>
    >(response);

  return unwrapResponse(
    result,
  );
}

export async function addMemoryTags(
  memoryId: string,
  tags: string[],
): Promise<Memory> {
  const response =
    await fetch(
      buildAdminUrl(
        `/memory/${encodeURIComponent(
          memoryId,
        )}/tags`,
      ),
      {
        method: "POST",

        credentials:
          "include",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify({
            tags,
          }),
      },
    );

  const result =
    await readResponse<
      | Memory
      | ApiEnvelope<Memory>
    >(response);

  return unwrapResponse(
    result,
  );
}

export async function removeMemoryTag(
  memoryId: string,
  tag: string,
): Promise<Memory> {
  const response =
    await fetch(
      buildAdminUrl(
        `/memory/${encodeURIComponent(
          memoryId,
        )}/tags/${encodeURIComponent(
          tag,
        )}`,
      ),
      {
        method:
          "DELETE",

        credentials:
          "include",
      },
    );

  const result =
    await readResponse<
      | Memory
      | ApiEnvelope<Memory>
    >(response);

  return unwrapResponse(
    result,
  );
}

/**
 * Person-authenticated action.
 *
 * This must NOT use the admin proxy.
 */
export async function disputeMemory(
  memoryId: string,
  sessionToken: string,
  reason: string,
): Promise<Memory> {
  if (
    !sessionToken.trim()
  ) {
    throw new Error(
      "Memory session token is required.",
    );
  }

  const response =
    await fetch(
      `${API_URL}/memory/${encodeURIComponent(
        memoryId,
      )}/dispute`,
      {
        method: "PATCH",

        headers: {
          "Content-Type":
            "application/json",

          "x-memory-session":
            sessionToken,
        },

        body:
          JSON.stringify({
            reason,
          }),
      },
    );

  const result =
    await readResponse<
      | Memory
      | ApiEnvelope<Memory>
    >(response);

  return unwrapResponse(
    result,
  );
}

async function patchMemoryAction(
  memoryId: string,
  action:
    | "archive"
    | "restore",
): Promise<Memory> {
  const response =
    await fetch(
      buildAdminUrl(
        `/memory/${encodeURIComponent(
          memoryId,
        )}/${action}`,
      ),
      {
        method: "PATCH",

        credentials:
          "include",
      },
    );

  const result =
    await readResponse<
      | Memory
      | ApiEnvelope<Memory>
    >(response);

  return unwrapResponse(
    result,
  );
}

export function archiveMemory(
  memoryId: string,
) {
  return patchMemoryAction(
    memoryId,
    "archive",
  );
}

export function restoreMemory(
  memoryId: string,
) {
  return patchMemoryAction(
    memoryId,
    "restore",
  );
}

export async function deleteMemory(
  memoryId: string,
): Promise<void> {
  const response =
    await fetch(
      buildAdminUrl(
        `/memory/${encodeURIComponent(
          memoryId,
        )}`,
      ),
      {
        method:
          "DELETE",

        credentials:
          "include",
      },
    );

  await readResponse<unknown>(
    response,
  );
}

export async function supersedeMemory(
  memoryId: string,
  supersedingMemoryId: string,
  reason: string,
): Promise<{ superseded: Memory; authoritative: Memory }> {
  const response = await fetch(
    buildAdminUrl(`/memory/${encodeURIComponent(memoryId)}/supersede`),
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ supersedingMemoryId, reason }),
    },
  );

  const result = await readResponse<
    | { superseded: Memory; authoritative: Memory }
    | ApiEnvelope<{ superseded: Memory; authoritative: Memory }>
  >(response);

  return unwrapResponse(result);
}

export async function contradictMemory(
  memoryId: string,
  authoritativeMemoryId: string,
  reason: string,
): Promise<{ contradicted: Memory; authoritative: Memory }> {
  const response = await fetch(
    buildAdminUrl(`/memory/${encodeURIComponent(memoryId)}/contradict`),
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ authoritativeMemoryId, reason }),
    },
  );

  const result = await readResponse<
    | { contradicted: Memory; authoritative: Memory }
    | ApiEnvelope<{ contradicted: Memory; authoritative: Memory }>
  >(response);

  return unwrapResponse(result);
}

export async function resolveMemoryDispute(
  memoryId: string,
  resolution: "restore" | "archive" | "forget",
  reason: string,
): Promise<Memory> {
  const response = await fetch(
    buildAdminUrl(`/memory/${encodeURIComponent(memoryId)}/dispute/resolve`),
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ resolution, reason }),
    },
  );

  const result = await readResponse<Memory | ApiEnvelope<Memory>>(response);
  return unwrapResponse(result);
}

/**
 * Public-safe memories.
 *
 * Direct backend request.
 */
export async function getPublicMemories(
  search?: string,
): Promise<Memory[]> {
  const queryString =
    buildQuery({
      search,
    });

  const response =
    await fetch(
      buildPublicUrl(
        "/memory/public",
        queryString,
      ),
      {
        cache:
          "no-store",
      },
    );

  const result =
    await readResponse<
      | Memory[]
      | ApiEnvelope<
          Memory[]
        >
    >(response);

  return unwrapResponse(
    result,
  );
}

/**
 * Person-authenticated memories.
 *
 * Uses x-memory-session,
 * not the admin proxy.
 */
export async function getVerifiedPersonMemories(
  sessionToken: string,
): Promise<Memory[]> {
  if (
    !sessionToken.trim()
  ) {
    throw new Error(
      "Memory session token is required.",
    );
  }

  const response =
    await fetch(
      `${API_URL}/memory/person/me`,
      {
        headers: {
          "x-memory-session":
            sessionToken,
        },

        cache:
          "no-store",
      },
    );

  const result =
    await readResponse<
      | Memory[]
      | ApiEnvelope<
          Memory[]
        >
    >(response);

  return unwrapResponse(
    result,
  );
}
export async function getMemoryReviewQueue(): Promise<MemoryReviewQueue> {
  const response = await fetch(buildAdminUrl("/memory/review-queue"), {
    credentials: "include",
    cache: "no-store",
  });
  const result = await readResponse<MemoryReviewQueue | ApiEnvelope<MemoryReviewQueue>>(response);
  if (result && typeof result === "object" && "sections" in result) {
    return result as MemoryReviewQueue;
  }
  return unwrapResponse(result as ApiEnvelope<MemoryReviewQueue>);
}

export async function confirmMemoryReview(memoryId: string, note?: string): Promise<Memory> {
  const response = await fetch(buildAdminUrl(`/memory/${encodeURIComponent(memoryId)}/review/confirm`), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(note?.trim() ? { note: note.trim() } : {}),
  });
  return unwrapResponse(await readResponse<Memory | ApiEnvelope<Memory>>(response));
}

export async function snoozeMemoryReview(memoryId: string, until: string): Promise<Memory> {
  const response = await fetch(buildAdminUrl(`/memory/${encodeURIComponent(memoryId)}/review/snooze`), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ until }),
  });
  return unwrapResponse(await readResponse<Memory | ApiEnvelope<Memory>>(response));
}

export async function createMemoryMergeDraft(memoryId: string, otherMemoryId: string): Promise<MemoryInboxItem> {
  const response = await fetch(buildAdminUrl(`/memory/${encodeURIComponent(memoryId)}/review/merge-draft`), {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ otherMemoryId }),
  });
  return unwrapResponse(await readResponse<MemoryInboxItem | ApiEnvelope<MemoryInboxItem>>(response));
}
