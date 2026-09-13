import { fetchPublicBackend } from "@/lib/public-backend";

import type {
  JournalEntry,
  JournalListResponse,
  JournalQuery,
} from "@/types/journal";

function buildQuery(
  query?: JournalQuery,
) {
  if (!query) {
    return "";
  }

  const params =
    new URLSearchParams();

  if (query.type) {
    params.set(
      "type",
      query.type,
    );
  }

  if (query.mood) {
    params.set(
      "mood",
      query.mood,
    );
  }

  if (query.visibility) {
    params.set(
      "visibility",
      query.visibility,
    );
  }

  if (query.source) {
    params.set(
      "source",
      query.source,
    );
  }

  if (
    query.isPublished !==
    undefined
  ) {
    params.set(
      "isPublished",
      String(
        query.isPublished,
      ),
    );
  }

  if (
    query.isFavourite !==
    undefined
  ) {
    params.set(
      "isFavourite",
      String(
        query.isFavourite,
      ),
    );
  }

  if (
    query.isArchived !==
    undefined
  ) {
    params.set(
      "isArchived",
      String(
        query.isArchived,
      ),
    );
  }

  if (
    query.isActive !==
    undefined
  ) {
    params.set(
      "isActive",
      String(
        query.isActive,
      ),
    );
  }

  if (query.tag) {
    params.set(
      "tag",
      query.tag,
    );
  }

  if (query.search) {
    params.set(
      "search",
      query.search,
    );
  }

  if (query.page) {
    params.set(
      "page",
      String(
        query.page,
      ),
    );
  }

  if (query.limit) {
    params.set(
      "limit",
      String(
        query.limit,
      ),
    );
  }

  const value =
    params.toString();

  return value
    ? `?${value}`
    : "";
}

export async function getJournalEntries(
  query?: JournalQuery,
): Promise<JournalListResponse> {
  const response =
    await fetchPublicBackend(
      `/journal${buildQuery(
        query,
      )}`,
      {
        cache:
          "no-store",
      },
    );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch journal entries.",
    );
  }

  return response.json();
}

export async function getPublicJournalEntries(
  query?: JournalQuery,
): Promise<JournalListResponse> {
  const page = query?.page ?? 1;
  const limit = query?.limit ?? 20;

  try {
    const response =
      await fetchPublicBackend(
        `/journal/public${buildQuery(
          query,
        )}`,
        {
          cache:
            "no-store",
        },
      );

    if (!response.ok) {
      console.error("Unable to fetch public journal entries.", {
        status: response.status,
      });

      return {
        data: [],
        pagination: {
          page,
          limit,
          total: 0,
          totalPages: 0,
        },
      };
    }

    return response.json();
  } catch (error) {
    console.error("Failed to fetch public journal entries.", error);

    return {
      data: [],
      pagination: {
        page,
        limit,
        total: 0,
        totalPages: 0,
      },
    };
  }
}

export async function getJournalEntryById(
  journalEntryId: string,
): Promise<JournalEntry> {
  const response =
    await fetchPublicBackend(
      `/journal/${journalEntryId}`,
      {
        cache:
          "no-store",
      },
    );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch journal entry.",
    );
  }

  return response.json();
}

export async function getJournalEntryBySlug(
  slug: string,
): Promise<JournalEntry> {
  const response =
    await fetchPublicBackend(
      `/journal/slug/${encodeURIComponent(
        slug,
      )}`,
      {
        cache:
          "no-store",
      },
    );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch journal entry.",
    );
  }

  return response.json();
}

export async function getPublicJournalEntryBySlug(
  slug: string,
): Promise<JournalEntry> {
  const response =
    await fetchPublicBackend(
      `/journal/public/${encodeURIComponent(
        slug,
      )}`,
      {
        cache:
          "no-store",
      },
    );

  if (!response.ok) {
    throw new Error(
      "Failed to fetch public journal entry.",
    );
  }

  return response.json();
}