import type {
  NowActivityType,
  NowAvailability,
  NowCompanyReference,
  NowHealthReference,
  NowMood,
  NowReadingReference,
  NowSource,
  NowStatus,
  NowVisibility,
} from "@/types/now";

const API_BASE =
  process.env.BACKEND_API_URL ??
  "http://localhost:4000/api/v1";

const ADMIN_API_BASE =
  "/api/admin/backend";

export type CreateNowStatusPayload = {
  activityType: NowActivityType;

  activity: string;

  headline?: string;

  description?: string;

  currentFocus?: string;

  availability?: NowAvailability;

  mood?: NowMood;

  energyScore?: number;

  focusScore?: number;

  locationName?: string;

  locationType?: string;

  building?: NowCompanyReference;

  reading?: NowReadingReference;

  thinking?: string;

  writing?: string;

  health?: NowHealthReference;

  tags?: string[];

  visibility?: NowVisibility;

  showLocation?: boolean;

  showAvailability?: boolean;

  showMood?: boolean;

  showHealth?: boolean;

  startedAt?: string;

  expiresAt?: string;

  source?: NowSource;

  sourceExternalId?: string;

  metadata?: Record<
    string,
    unknown
  >;

  isArchived?: boolean;

  isActive?: boolean;
};

type NowItemResponse =
  | NowStatus
  | {
      data: NowStatus;
    };

async function parseError(
  response: Response,
) {
  try {
    const body =
      await response.json();

    if (
      typeof body?.message ===
      "string"
    ) {
      return body.message;
    }

    if (
      Array.isArray(
        body?.message,
      )
    ) {
      return body.message.join(
        ", ",
      );
    }

    if (
      typeof body?.error ===
      "string"
    ) {
      return body.error;
    }
  } catch {
    // Ignore response parsing errors.
  }

  return "Something went wrong.";
}

async function parseNowResponse(
  response: Response,
): Promise<NowStatus> {
  const result =
    (await response.json()) as NowItemResponse;

  return "data" in result
    ? result.data
    : result;
}

export async function getNowStatus(): Promise<
  NowStatus | null
> {
  const response =
    await fetch(
      `${API_BASE}/now/public`,
      {
        method: "GET",

        cache: "no-store",
      },
    );

  if (
    response.status === 404
  ) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      await parseError(
        response,
      ),
    );
  }

  return parseNowResponse(
    response,
  );
}

export async function createNowStatus(
  payload: CreateNowStatusPayload,
): Promise<NowStatus> {
  const response =
    await fetch(
      `${ADMIN_API_BASE}/now`,
      {
        method: "POST",

        credentials:
          "include",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify(
          payload,
        ),
      },
    );

  if (!response.ok) {
    throw new Error(
      await parseError(
        response,
      ),
    );
  }

  return parseNowResponse(
    response,
  );
}

export async function deleteNowStatus(
  statusId: string,
): Promise<void> {
  const response =
    await fetch(
      `${ADMIN_API_BASE}/now/${encodeURIComponent(
        statusId,
      )}`,
      {
        method: "DELETE",

        credentials:
          "include",
      },
    );

  if (!response.ok) {
    throw new Error(
      await parseError(
        response,
      ),
    );
  }
}