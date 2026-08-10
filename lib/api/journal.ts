import type {
  JournalEntry,
  JournalEntryType,
  JournalListResponse,
  JournalMood,
  JournalSource,
  JournalVisibility,
} from "@/types/journal";

const API_URL =
  process.env.BACKEND_API_URL ??
  "http://localhost:4000/api/v1";

const ADMIN_API_URL =
  "/api/admin/backend";

export type JournalEntryPayload = {
  date: string;

  dateKey?: string;

  slug?: string;

  type?: JournalEntryType;

  title: string;

  content?: string;

  highlight?: string;

  mood?: JournalMood;

  moodScore?: number;

  energyScore?: number;

  productivityScore?: number;

  stressScore?: number;

  tags?: string[];

  lessons?: string[];

  decisions?: string[];

  ideas?: string[];

  gratitude?: string[];

  challenges?: string[];

  wins?: string[];

  workout?: {
    completed?: boolean;

    type?: string;

    title?: string;

    durationMinutes?: number;

    strainScore?: number;

    notes?: string;
  };

  reading?: {
    completed?: boolean;

    libraryItemId?: string;

    title?: string;

    author?: string;

    pagesRead?: number;

    progressPercentage?: number;

    thought?: string;
  };

  sleep?: {
    durationHours?: number;

    performancePercentage?: number;

    quality?: number;

    recoveryScore?: number;
  };

  steps?: number;

  memoryIds?: string[];

  companyIds?: string[];

  libraryItemIds?: string[];

  visibility?: JournalVisibility;

  isPublished?: boolean;

  publishedAt?: string;

  isFavourite?: boolean;

  isArchived?: boolean;

  isActive?: boolean;

  source?: JournalSource;

  sourceExternalId?: string;

  metadata?: Record<
    string,
    unknown
  >;
};

type JournalItemResponse =
  | JournalEntry
  | {
      data: JournalEntry;
    };

async function parseResponse<T>(
  response: Response,
): Promise<T> {
  const contentType =
    response.headers.get(
      "content-type",
    );

  const data =
    contentType?.includes(
      "application/json",
    )
      ? await response.json()
      : await response.text();

  if (!response.ok) {
    const message =
      typeof data ===
        "object" &&
      data !== null &&
      "message" in data
        ? Array.isArray(
            data.message,
          )
          ? data.message.join(
              ", ",
            )
          : String(
              data.message,
            )
        : `Request failed with status ${response.status}`;

    throw new Error(
      message,
    );
  }

  return data as T;
}

function extractItem(
  response: JournalItemResponse,
): JournalEntry {
  return "data" in response
    ? response.data
    : response;
}

export async function getJournalEntries(): Promise<
  JournalEntry[]
> {
  const response =
    await fetch(
      `${API_URL}/journal?page=1&limit=100`,
      {
        cache: "no-store",

        credentials:
          "include",
      },
    );

  const result =
    await parseResponse<
      | JournalEntry[]
      | JournalListResponse
    >(response);

  return Array.isArray(
    result,
  )
    ? result
    : result.data;
}

export async function getJournalEntry(
  id: string,
): Promise<JournalEntry> {
  const response =
    await fetch(
      `${API_URL}/journal/${encodeURIComponent(
        id,
      )}`,
      {
        cache: "no-store",

        credentials:
          "include",
      },
    );

  const result =
    await parseResponse<JournalItemResponse>(
      response,
    );

  return extractItem(
    result,
  );
}

export async function createJournalEntry(
  payload: JournalEntryPayload,
): Promise<JournalEntry> {
  const response =
    await fetch(
      `${ADMIN_API_URL}/journal`,
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

  const result =
    await parseResponse<JournalItemResponse>(
      response,
    );

  return extractItem(
    result,
  );
}

export async function updateJournalEntry(
  id: string,
  payload: Partial<JournalEntryPayload>,
): Promise<JournalEntry> {
  const response =
    await fetch(
      `${ADMIN_API_URL}/journal/${encodeURIComponent(
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
          payload,
        ),
      },
    );

  const result =
    await parseResponse<JournalItemResponse>(
      response,
    );

  return extractItem(
    result,
  );
}

export async function deleteJournalEntry(
  id: string,
): Promise<void> {
  const response =
    await fetch(
      `${ADMIN_API_URL}/journal/${encodeURIComponent(
        id,
      )}`,
      {
        method: "DELETE",

        credentials:
          "include",
      },
    );

  if (!response.ok) {
    const result =
      await response
        .json()
        .catch(
          () => null,
        );

    throw new Error(
      result?.message ??
        `Delete failed with status ${response.status}`,
    );
  }
}