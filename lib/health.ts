import { fetchPublicBackend } from "@/lib/public-backend";

import type {
  HealthDashboard,
  HealthEntry,
  HealthTrendsResponse,
} from "@/types/health";

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


function getDateKey(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function emptyHealthDashboard(): HealthDashboard {
  return {
    today: {
      dateKey: getDateKey(),
      recoveryScore: null,
      strainScore: null,
      sleepPerformance: null,
      sleepHours: null,
      hrvMs: null,
      restingHeartRateBpm: null,
      bloodOxygenPercentage: null,
      respiratoryRate: null,
      skinTemperatureCelsius: null,
      sleepConsistencyPercentage: null,
      sleepEfficiencyPercentage: null,
      sleepNeedMinutes: null,
      sleepDebtMinutes: null,
      workouts: 0,
      sources: [],
    },
    trends: {
      recovery7DayAverage: null,
      recovery30DayAverage: null,
      sleep7DayAverageHours: null,
      sleep30DayAverageHours: null,
      strain7DayAverage: null,
      strain30DayAverage: null,
      hrv7DayAverage: null,
      hrv30DayAverage: null,
      restingHeartRate7DayAverage: null,
      restingHeartRate30DayAverage: null,
      recoveryChange: null,
      sleepChange: null,
      hrvChange: null,
      restingHeartRateChange: null,
      strainChange: null,
    },
    body: {
      latestWeightKg: null,
      latestBodyFatPercentage: null,
      latestWaistCm: null,
      measuredAt: null,
    },
    workouts: {
      last7Days: 0,
      last30Days: 0,
      strainLast7Days: null,
      strainLast30Days: null,
    },
    consistency: {
      trackedDays7: 0,
      trackedDays30: 0,
    },
  };
}

function emptyHealthTrends(days: number): HealthTrendsResponse {
  const dateKey = getDateKey();

  return {
    period: {
      startDate: dateKey,
      endDate: dateKey,
      days,
    },
    data: [],
    averages: {
      recovery: null,
      strain: null,
      sleepHours: null,
      sleepPerformance: null,
      hrvMs: null,
      restingHeartRateBpm: null,
    },
  };
}

export async function getHealthDashboard(): Promise<HealthDashboard> {
  try {
    const response =
      await fetchPublicBackend(
        "/health/public/dashboard",
        {
          cache: "no-store",
        },
      );

    return await parseResponse<HealthDashboard>(
      response,
    );
  } catch (error) {
    console.error("Failed to fetch public health dashboard.", error);
    return emptyHealthDashboard();
  }
}

export async function getHealthTrends(
  days = 30,
): Promise<HealthTrendsResponse> {
  try {
    const response =
      await fetchPublicBackend(
        `/health/public/trends?days=${days}`,
        {
          next: {
            revalidate: 60,
          },
        },
      );

    return await parseResponse<HealthTrendsResponse>(
      response,
    );
  } catch (error) {
    console.error("Failed to fetch public health trends.", error);
    return emptyHealthTrends(days);
  }
}

export async function getLatestHealthEntry(): Promise<HealthEntry | null> {
  try {
    const response =
      await fetchPublicBackend(
        "/health/public/latest",
        {
          cache: "no-store",
        },
      );

    if (response.status === 404) {
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

    if ("data" in payload) {
      entry =
        payload.data ??
        null;
    } else {
      entry =
        payload as HealthEntry;
    }

    if (!entry?._id) {
      return null;
    }

    if (
      entry.isActive === false ||
      entry.isArchived === true
    ) {
      return null;
    }

    return entry;
  } catch (error) {
    console.error("Failed to fetch latest public health entry.", error);
    return null;
  }
}
