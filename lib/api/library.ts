import type {
  LibraryItem,
  LibraryItemPayload,
  LibraryListResponse,
} from "@/types/library";

const API_URL =
  process.env.BACKEND_API_URL ??
  "http://localhost:4000/api/v1";

const ADMIN_API_URL =
  "/api/admin/backend";

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

export async function getLibraryItems(): Promise<
  LibraryItem[]
> {
  const response =
    await fetch(
      `${API_URL}/library`,
      {
        cache: "no-store",
      },
    );

  const result =
    await parseResponse<
      | LibraryListResponse
      | LibraryItem[]
    >(response);

  return Array.isArray(
    result,
  )
    ? result
    : result.data;
}

export async function getLibraryItem(
  id: string,
): Promise<LibraryItem> {
  const response =
    await fetch(
      `${API_URL}/library/${encodeURIComponent(
        id,
      )}`,
      {
        cache: "no-store",
      },
    );

  const result =
    await parseResponse<
      | LibraryItem
      | {
          data: LibraryItem;
        }
    >(response);

  return "data" in result
    ? result.data
    : result;
}

export async function createLibraryItem(
  payload: LibraryItemPayload,
): Promise<LibraryItem> {
  const response =
    await fetch(
      `${ADMIN_API_URL}/library`,
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
    await parseResponse<
      | LibraryItem
      | {
          data: LibraryItem;
        }
    >(response);

  return "data" in result
    ? result.data
    : result;
}

export async function updateLibraryItem(
  id: string,
  payload: Partial<LibraryItemPayload>,
): Promise<LibraryItem> {
  const response =
    await fetch(
      `${ADMIN_API_URL}/library/${encodeURIComponent(
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
    await parseResponse<
      | LibraryItem
      | {
          data: LibraryItem;
        }
    >(response);

  return "data" in result
    ? result.data
    : result;
}

export async function deleteLibraryItem(
  id: string,
): Promise<void> {
  const response =
    await fetch(
      `${ADMIN_API_URL}/library/${encodeURIComponent(
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