import type {
  BodyMeasurement,
  HabitEntry,
  HealthDataSource,
  HealthEntry,
  HealthMood,
  NutritionData,
  PainEntry,
  RecoveryData,
  SleepData,
  WorkoutData,
} from "@/types/health";

const API_URL =
  process.env.BACKEND_API_URL ??
  "http://localhost:4000/api/v1";

const ADMIN_API_URL =
  "/api/admin/backend";

export type HealthEntryPayload = {
  date: string;

  bodyMeasurement?: BodyMeasurement;

  sleep?: SleepData;

  recovery?: RecoveryData;

  workouts?: WorkoutData[];

  nutrition?: NutritionData;

  habits?: HabitEntry[];

  painEntries?: PainEntry[];

  sources?: HealthDataSource[];

  steps?: number;

  activeMinutes?: number;

  standingHours?: number;

  totalCaloriesBurned?: number;

  restingCaloriesBurned?: number;

  strainScore?: number;

  energyScore?: number;

  motivationScore?: number;

  mood?: HealthMood;

  symptoms?: string[];

  achievements?: string[];

  goals?: string[];

  notes?: string;

  wearableData?: Record<
    string,
    unknown
  >;

  memoryIds?: string[];

  isArchived?: boolean;

  isActive?: boolean;
};

type HealthListResponse =
  | HealthEntry[]
  | {
      data: HealthEntry[];

      pagination?: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    };

type HealthItemResponse =
  | HealthEntry
  | {
      data: HealthEntry;
    };

type ApiErrorResponse = {
  message?: string | string[];

  error?: string;

  statusCode?: number;
};

function getErrorMessage(
  payload: ApiErrorResponse | null,
  fallback: string,
) {
  if (
    Array.isArray(
      payload?.message,
    )
  ) {
    return payload.message.join(
      ", ",
    );
  }

  return (
    payload?.message ??
    payload?.error ??
    fallback
  );
}

async function readResponse<T>(
  response: Response,
  fallbackMessage: string,
): Promise<T> {
  let payload:
    | T
    | ApiErrorResponse
    | null = null;

  try {
    payload =
      await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    throw new Error(
      getErrorMessage(
        payload as ApiErrorResponse | null,
        fallbackMessage,
      ),
    );
  }

  return payload as T;
}

function unwrapHealthList(
  response: HealthListResponse,
): HealthEntry[] {
  if (Array.isArray(response)) {
    return response;
  }

  return Array.isArray(
    response.data,
  )
    ? response.data
    : [];
}

function unwrapHealthItem(
  response: HealthItemResponse,
): HealthEntry {
  return "data" in response
    ? response.data
    : response;
}

export async function getHealthEntries(): Promise<
  HealthEntry[]
> {
  const response =
    await fetch(
      `${API_URL}/health`,
      {
        method: "GET",

        cache: "no-store",
      },
    );

  const payload =
    await readResponse<HealthListResponse>(
      response,
      "Unable to load health entries.",
    );

  return unwrapHealthList(
    payload,
  );
}

export async function getHealthEntry(
  id: string,
): Promise<HealthEntry> {
  const response =
    await fetch(
      `${API_URL}/health/${encodeURIComponent(
        id,
      )}`,
      {
        method: "GET",

        cache: "no-store",
      },
    );

  const payload =
    await readResponse<HealthItemResponse>(
      response,
      "Unable to load health entry.",
    );

  return unwrapHealthItem(
    payload,
  );
}

export async function createHealthEntry(
  data: HealthEntryPayload,
): Promise<HealthEntry> {
  const response =
    await fetch(
      `${ADMIN_API_URL}/health`,
      {
        method: "POST",

        credentials:
          "include",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify(
          data,
        ),
      },
    );

  const payload =
    await readResponse<HealthItemResponse>(
      response,
      "Unable to create health entry.",
    );

  return unwrapHealthItem(
    payload,
  );
}

export async function updateHealthEntry(
  id: string,
  data: Partial<HealthEntryPayload>,
): Promise<HealthEntry> {
  const response =
    await fetch(
      `${ADMIN_API_URL}/health/${encodeURIComponent(
        id,
      )}`,
      {
        method: "PATCH",

        credentials:
          "include",

        headers: {
          "Content-Type":
            "application/json",
        },

        body: JSON.stringify(
          data,
        ),
      },
    );

  const payload =
    await readResponse<HealthItemResponse>(
      response,
      "Unable to update health entry.",
    );

  return unwrapHealthItem(
    payload,
  );
}

export async function deleteHealthEntry(
  id: string,
): Promise<void> {
  const response =
    await fetch(
      `${ADMIN_API_URL}/health/${encodeURIComponent(
        id,
      )}`,
      {
        method: "DELETE",

        credentials:
          "include",
      },
    );

  if (!response.ok) {
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
      getErrorMessage(
        payload,
        "Unable to delete health entry.",
      ),
    );
  }
}