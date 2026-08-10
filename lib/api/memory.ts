import {
  ApiEnvelope,
  Memory,
  MemoryAccessLevel,
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

  isActive?: boolean;
};

export type CreateMemoryPayload = {
  personId?: string | null;

  content: string;

  type?: MemoryType;

  source?: MemorySource;

  sourceReference?:
    MemorySourceReference;

  tags?: string[];

  importance?: number;

  confidence?: number;

  verificationStatus?:
    MemoryVerificationStatus;

  accessLevel?:
    MemoryAccessLevel;

  sensitivity?:
    MemorySensitivity;

  expiresAt?: string | null;

  isArchived?: boolean;

  isActive?: boolean;
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
  return query
    ? `${ADMIN_API_URL}${path}?${query}`
    : `${ADMIN_API_URL}${path}`;
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

      isActive:
        query.isActive,
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