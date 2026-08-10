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

        headers: {
          Accept:
            "application/json",
        },
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
  const response =
    await fetch(
      `${API_URL}/media/${encodeURIComponent(
        id,
      )}`,
      {
        method: "GET",

        cache: "no-store",

        headers: {
          Accept:
            "application/json",
        },
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
  ].includes(
    value ?? "",
  );
}