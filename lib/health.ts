import type {
  HealthDashboard,
  HealthEntry,
  HealthTrendsResponse,
} from "@/types/health";

const API_URL =
  process.env.BACKEND_API_URL ??
  "http://localhost:4000/api/v1";

interface ApiErrorResponse {
  status?: number;

  statusCode?: number;

  message?: string | string[];

  error?: string;
}

interface HealthItemResponse {
  status?: number;

  statusCode?: number;

  message?: string;

  data?: HealthEntry | null;
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
      `Health API returned an invalid response with status ${response.status}.`,
    );
  }

  if (!response.ok) {
    const errorPayload =
      payload as ApiErrorResponse;

    const message =
      Array.isArray(
        errorPayload.message,
      )
        ? errorPayload.message.join(
            ", ",
          )
        : errorPayload.message;

    throw new Error(
      message ??
        errorPayload.error ??
        "Unable to fetch health information.",
    );
  }

  return payload as T;
}

export async function getHealthDashboard(): Promise<HealthDashboard> {
  const response =
    await fetch(
      `${API_URL}/health/dashboard`,
      {
        next: {
          revalidate: 60,
        },
      },
    );

  return parseResponse<HealthDashboard>(
    response,
  );
}

export async function getHealthTrends(
  days = 30,
): Promise<HealthTrendsResponse> {
  const response =
    await fetch(
      `${API_URL}/health/trends?days=${days}`,
      {
        next: {
          revalidate: 60,
        },
      },
    );

  return parseResponse<HealthTrendsResponse>(
    response,
  );
}

export async function getLatestHealthEntry(): Promise<HealthEntry | null> {
  const response =
    await fetch(
      `${API_URL}/health/public/latest`,
      {
        next: {
          revalidate: 60,
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
      HealthEntry |
      HealthItemResponse
    >(response);

  let entry:
    | HealthEntry
    | null =
    null;

  if (
    "data" in payload
  ) {
    entry =
      payload.data ??
      null;
  } else {
    entry =
      payload as HealthEntry;
  }

  if (
    !entry?._id
  ) {
    return null;
  }

  if (
    entry.isActive ===
      false ||
    entry.isArchived ===
      true
  ) {
    return null;
  }

  return entry;
}