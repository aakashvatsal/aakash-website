import type {
  NowHistoryResponse,
  NowStatus,
} from "@/types/now";

const API_URL =
  process.env.BACKEND_API_URL ??
  "http://localhost:4000/api/v1";

interface ApiErrorResponse {
  status?: number;

  statusCode?: number;

  message?: string | string[];

  error?: string;
}

interface ApiDataResponse<T> {
  status?: number;

  statusCode?: number;

  message?: string;

  data?: T;
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
      `Now API returned an invalid response with status ${response.status}.`,
    );
  }

  if (!response.ok) {
    const error =
      payload as ApiErrorResponse;

    const message =
      Array.isArray(
        error.message,
      )
        ? error.message.join(
            ", ",
          )
        : error.message;

    throw new Error(
      message ??
        error.error ??
        "Unable to fetch current status.",
    );
  }

  return payload as T;
}

function unwrapData<T>(
  payload:
    | T
    | ApiDataResponse<T>,
): T | null {
  if (
    payload &&
    typeof payload ===
      "object" &&
    "data" in payload
  ) {
    return (
      (
        payload as ApiDataResponse<T>
      ).data ??
      null
    );
  }

  return payload as T;
}

export async function getPublicNowStatus(): Promise<NowStatus | null> {
  const response =
    await fetch(
      `${API_URL}/now/public`,
      {
        next: {
          revalidate: 30,
        },
      },
    );

  if (
    response.status ===
    404
  ) {
    return null;
  }

  const payload =
    await parseResponse<
      | NowStatus
      | null
      | ApiDataResponse<
          NowStatus | null
        >
    >(response);

  const status =
    unwrapData<
      NowStatus | null
    >(payload);

  if (!status) {
    return null;
  }

  if (
    status.isActive ===
      false ||
    status.isArchived ===
      true ||
    status.isCurrent ===
      false
  ) {
    return null;
  }

  return status;
}

export async function getCurrentNowStatus(): Promise<NowStatus | null> {
  const response =
    await fetch(
      `${API_URL}/now/current`,
      {
        cache:
          "no-store",
      },
    );

  if (
    response.status ===
    404
  ) {
    return null;
  }

  const payload =
    await parseResponse<
      | NowStatus
      | null
      | ApiDataResponse<
          NowStatus | null
        >
    >(response);

  return unwrapData<
    NowStatus | null
  >(payload);
}

export async function getNowHistory(
  page = 1,
  limit = 20,
): Promise<NowHistoryResponse> {
  const response =
    await fetch(
      `${API_URL}/now/history?page=${page}&limit=${limit}`,
      {
        next: {
          revalidate: 60,
        },
      },
    );

  const payload =
    await parseResponse<
      | NowHistoryResponse
      | ApiDataResponse<NowHistoryResponse>
    >(response);

  const data =
    unwrapData<NowHistoryResponse>(
      payload,
    );

  return (
    data ?? {
      data: [],

      pagination: {
        page,

        limit,

        total: 0,

        totalPages: 0,
      },
    }
  );
}