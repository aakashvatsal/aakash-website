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

  notes?: string;

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
  "http://localhost:4000/api/v1";

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

  const response =
    await fetch(
      `${API_URL}/library?${query.toString()}`,
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

  if (!response.ok) {
    throw new Error(
      `Failed to fetch books: ${response.status}`,
    );
  }

  return response.json();
}

export async function getBookBySlug(
  slug: string,
): Promise<Book | null> {
  const response =
    await fetch(
      `${API_URL}/library/slug/${encodeURIComponent(
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
    throw new Error(
      `Failed to fetch book: ${response.status}`,
    );
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
      `${API_URL}/library/${encodeURIComponent(
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