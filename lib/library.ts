export type BookStatus =
  | "want_to_read"
  | "reading"
  | "paused"
  | "completed"
  | "dropped";

export interface Book {
  _id: string;

  slug: string;

  title: string;

  author?: string;

  authors?: string[];

  category?: string;

  status: BookStatus;

  progressPercentage: number;

  currentPage?: number;

  totalPages?: number;

  rating?: number;

  coverImageUrl?: string;

  summary?: string;

  changed?: string;

  keyTakeaways?: string[];

  quotes?: string[];

  highlightsCount?: number;

  notesCount?: number;

  lastReadAt?: string;

  lastHighlightedAt?: string;

  isFavourite?: boolean;

  type: "book";
}

export interface LibraryHighlight {
  _id: string;

  libraryItemId: string;

  externalId: string;

  assetId?: string;

  text?: string;

  note?: string;

  location?: string;

  physicalLocation?: number;

  locationRangeStart?: number;

  locationRangeEnd?: number;

  style?: number;

  isUnderline?: boolean;

  highlightedAt?: string;

  sourceModifiedAt?: string;

  isFavourite?: boolean;
}

export interface LibraryPagination {
  page: number;

  limit: number;

  total: number;

  totalPages: number;
}

export interface LibraryApiResponse {
  status?: number;

  statusCode?: number;

  message?: string;

  data: Book[];

  pagination: LibraryPagination;
}

interface LibraryHighlightsApiResponse {
  status?: number;

  statusCode?: number;

  message?: string;

  data: LibraryHighlight[];
}

export interface GetBooksParams {
  page?: number;

  limit?: number;

  status?: BookStatus;

  search?: string;
}

const API_URL =
  process.env.BACKEND_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:4000/api/v1";

function emptyLibraryResponse(
  page: number,
  limit: number,
): LibraryApiResponse {
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

export async function getBooks({
  page = 1,
  limit = 12,
  status,
  search,
}: GetBooksParams = {}): Promise<LibraryApiResponse> {
  const query =
    new URLSearchParams();

  query.set(
    "type",
    "book",
  );

  query.set(
    "page",
    page.toString(),
  );

  query.set(
    "limit",
    limit.toString(),
  );

  if (status) {
    query.set(
      "status",
      status,
    );
  }

  if (search?.trim()) {
    query.set(
      "search",
      search.trim(),
    );
  }

  const endpoint =
    `${API_URL}/library/public?${query.toString()}`;

  try {
    const response =
      await fetch(
        endpoint,
        {
          method: "GET",

          headers: {
            Accept: "application/json",
          },

          cache: "no-store",
        },
      );

    if (!response.ok) {
      console.error(
        "Unable to fetch public library:",
        {
          endpoint,
          status: response.status,
        },
      );

      return emptyLibraryResponse(
        page,
        limit,
      );
    }

    return response.json();
  } catch (error) {
    console.error(
      "Failed to fetch public library:",
      error,
    );

    return emptyLibraryResponse(
      page,
      limit,
    );
  }
}

export async function getBookBySlug(
  slug: string,
): Promise<Book | null> {
  const response =
    await fetch(
      `${API_URL}/library/public/slug/${encodeURIComponent(
        slug,
      )}`,
      {
        method: "GET",

        headers: {
          "Content-Type":
            "application/json",
        },

        cache:
          "no-store",
      },
    );

  if (
    response.status === 404
  ) {
    return null;
  }

  if (!response.ok) {
    console.error(
      "Unable to fetch public book:",
      {
        slug,
        status: response.status,
      },
    );

    return null;
  }

  const result =
    await response.json();

  return result?.data ??
    result ??
    null;
}

export async function getBookHighlights(
  libraryItemId: string,
): Promise<LibraryHighlight[]> {
  const response =
    await fetch(
      `${API_URL}/library/public/${encodeURIComponent(
        libraryItemId,
      )}/highlights`,
      {
        method: "GET",

        headers: {
          "Content-Type":
            "application/json",
        },

        cache:
          "no-store",
      },
    );

  if (
    response.status === 404
  ) {
    return [];
  }

  if (!response.ok) {
    throw new Error(
      `Failed to fetch highlights: ${response.status}`,
    );
  }

  const result:
    | LibraryHighlightsApiResponse
    | LibraryHighlight[] =
      await response.json();

  if (
    Array.isArray(
      result,
    )
  ) {
    return result;
  }

  return result.data ?? [];
}