import {
  ApiEnvelope,
  MemoryPerson,
  PaginatedResponse,
  PersonEmailIdentity,
  PersonIdentityStatus,
  PersonPhoneIdentity,
  PersonRelationshipType,
} from "@/types/hsakaa";

const ADMIN_API_URL =
  "/api/admin/backend";

export type MemoryPeopleQuery = {
  page?: number;

  limit?: number;

  search?: string;

  relationship?:
    | PersonRelationshipType
    | "";

  identityStatus?:
    | PersonIdentityStatus
    | "";

  isBlocked?: boolean;

  isArchived?: boolean;

  isActive?: boolean;
};

export type CreateMemoryPersonPayload = {
  linkedUserId?:
    | string
    | null;

  name: string;

  preferredName?: string;

  relationship?:
    PersonRelationshipType;

  relationshipLabel?: string;

  emails?: Array<
    Pick<
      PersonEmailIdentity,
      | "email"
      | "isVerified"
      | "isPrimary"
    >
  >;

  phoneNumbers?: Array<
    Pick<
      PersonPhoneIdentity,
      | "phoneNumber"
      | "countryCode"
      | "isVerified"
      | "isPrimary"
    >
  >;

  identityStatus?:
    PersonIdentityStatus;

  aliases?: string[];

  tags?: string[];

  notes?: string;

  memoryAccessConsentGranted?: boolean;

  metadata?: Record<
    string,
    unknown
  >;

  isBlocked?: boolean;

  blockedReason?: string;

  isArchived?: boolean;

  isActive?: boolean;
};

export type UpdateMemoryPersonPayload =
  Partial<CreateMemoryPersonPayload>;

type MemoryPeopleListPayload =
  | MemoryPerson[]
  | PaginatedResponse<MemoryPerson>
  | {
      items?: MemoryPerson[];

      results?: MemoryPerson[];

      docs?: MemoryPerson[];

      total?: number;

      totalCount?: number;

      count?: number;

      page?: number;

      limit?: number;

      totalPages?: number;
    };

type MemoryPeopleListResponse =
  | MemoryPeopleListPayload
  | ApiEnvelope<MemoryPeopleListPayload>;

function buildQuery(
  values: Record<
    string,
    | string
    | number
    | boolean
    | undefined
  >,
) {
  const params =
    new URLSearchParams();

  Object.entries(values).forEach(
    ([key, value]) => {
      if (
        value === undefined ||
        value === null ||
        value === ""
      ) {
        return;
      }

      params.set(
        key,
        String(value),
      );
    },
  );

  return params.toString();
}

function buildUrl(
  path: string,
  query?: string,
) {
  return query
    ? `${ADMIN_API_URL}${path}?${query}`
    : `${ADMIN_API_URL}${path}`;
}

async function readResponse<T>(
  response: Response,
): Promise<T> {
  const text =
    await response.text();

  if (!text) {
    if (!response.ok) {
      throw new Error(
        `Request failed with status ${response.status}`,
      );
    }

    return undefined as T;
  }

  let result: unknown;

  try {
    result =
      JSON.parse(text);
  } catch {
    throw new Error(text);
  }

  if (!response.ok) {
    let message =
      `Request failed with status ${response.status}`;

    if (
      result &&
      typeof result ===
        "object" &&
      "message" in result
    ) {
      const responseMessage =
        (
          result as {
            message?:
              | string
              | string[];
          }
        ).message;

      message =
        Array.isArray(
          responseMessage,
        )
          ? responseMessage.join(
              ", ",
            )
          : responseMessage ??
            message;
    }

    throw new Error(message);
  }

  return result as T;
}

function unwrapResponse<T>(
  response:
    | T
    | ApiEnvelope<T>,
): T {
  if (
    response &&
    typeof response ===
      "object" &&
    "data" in response
  ) {
    return response.data;
  }

  return response as T;
}

function normalizePeopleList(
  response:
    MemoryPeopleListResponse,
): PaginatedResponse<MemoryPerson> {
  const payload =
    unwrapResponse(response);

  if (
    Array.isArray(
      payload,
    )
  ) {
    return {
      data: payload,

      total:
        payload.length,

      page: 1,

      limit:
        payload.length,

      totalPages: 1,
    };
  }

  if (
    "data" in payload &&
    Array.isArray(
      payload.data,
    )
  ) {
    return {
      data:
        payload.data,

      total:
        typeof payload.total ===
        "number"
          ? payload.total
          : payload.data
              .length,

      page:
        typeof payload.page ===
        "number"
          ? payload.page
          : 1,

      limit:
        typeof payload.limit ===
        "number"
          ? payload.limit
          : payload.data
              .length,

      totalPages:
        typeof payload.totalPages ===
        "number"
          ? payload.totalPages
          : 1,
    };
  }

  let items:
    MemoryPerson[] = [];

  if (
    "items" in payload &&
    Array.isArray(
      payload.items,
    )
  ) {
    items =
      payload.items;
  } else if (
    "results" in payload &&
    Array.isArray(
      payload.results,
    )
  ) {
    items =
      payload.results;
  } else if (
    "docs" in payload &&
    Array.isArray(
      payload.docs,
    )
  ) {
    items =
      payload.docs;
  }

  const total =
    "total" in payload &&
    typeof payload.total ===
      "number"
      ? payload.total
      : "totalCount" in
            payload &&
          typeof payload.totalCount ===
            "number"
        ? payload.totalCount
        : "count" in
              payload &&
            typeof payload.count ===
              "number"
          ? payload.count
          : items.length;

  const page =
    "page" in payload &&
    typeof payload.page ===
      "number"
      ? payload.page
      : 1;

  const limit =
    "limit" in payload &&
    typeof payload.limit ===
      "number"
      ? payload.limit
      : items.length;

  const totalPages =
    "totalPages" in
      payload &&
    typeof payload.totalPages ===
      "number"
      ? payload.totalPages
      : limit > 0
        ? Math.max(
            1,
            Math.ceil(
              total / limit,
            ),
          )
        : 1;

  return {
    data: items,
    total,
    page,
    limit,
    totalPages,
  };
}

export async function getMemoryPeople(
  query:
    MemoryPeopleQuery = {},
): Promise<
  PaginatedResponse<MemoryPerson>
> {
  const queryString =
    buildQuery({
      page:
        query.page,

      limit:
        query.limit,

      search:
        query.search,

      relationship:
        query.relationship,

      identityStatus:
        query.identityStatus,

      isBlocked:
        query.isBlocked,

      isArchived:
        query.isArchived,

      isActive:
        query.isActive,
    });

  const response =
    await fetch(
      buildUrl(
        "/memory-people",
        queryString,
      ),
      {
        credentials:
          "include",

        cache:
          "no-store",
      },
    );

  const result =
    await readResponse<MemoryPeopleListResponse>(
      response,
    );

  return normalizePeopleList(
    result,
  );
}

export async function getMemoryPerson(
  personId: string,
): Promise<MemoryPerson> {
  if (
    !personId.trim()
  ) {
    throw new Error(
      "Person ID is required.",
    );
  }

  const response =
    await fetch(
      buildUrl(
        `/memory-people/${encodeURIComponent(
          personId,
        )}`,
      ),
      {
        credentials:
          "include",

        cache:
          "no-store",
      },
    );

  const result =
    await readResponse<
      | MemoryPerson
      | ApiEnvelope<MemoryPerson>
    >(response);

  return unwrapResponse(
    result,
  );
}

export async function createMemoryPerson(
  payload:
    CreateMemoryPersonPayload,
): Promise<MemoryPerson> {
  const response =
    await fetch(
      `${ADMIN_API_URL}/memory-people`,
      {
        method: "POST",

        credentials:
          "include",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify(
            payload,
          ),
      },
    );

  const result =
    await readResponse<
      | MemoryPerson
      | ApiEnvelope<MemoryPerson>
    >(response);

  return unwrapResponse(
    result,
  );
}

export async function updateMemoryPerson(
  personId: string,
  payload:
    UpdateMemoryPersonPayload,
): Promise<MemoryPerson> {
  const response =
    await fetch(
      buildUrl(
        `/memory-people/${encodeURIComponent(
          personId,
        )}`,
      ),
      {
        method: "PATCH",

        credentials:
          "include",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify(
            payload,
          ),
      },
    );

  const result =
    await readResponse<
      | MemoryPerson
      | ApiEnvelope<MemoryPerson>
    >(response);

  return unwrapResponse(
    result,
  );
}

async function patchPersonAction(
  personId: string,
  action:
    | "consent/grant"
    | "consent/revoke"
    | "unblock"
    | "archive"
    | "restore",
): Promise<MemoryPerson> {
  const response =
    await fetch(
      buildUrl(
        `/memory-people/${encodeURIComponent(
          personId,
        )}/${action}`,
      ),
      {
        method: "PATCH",

        credentials:
          "include",
      },
    );

  const result =
    await readResponse<
      | MemoryPerson
      | ApiEnvelope<MemoryPerson>
    >(response);

  return unwrapResponse(
    result,
  );
}

export function grantMemoryPersonConsent(
  personId: string,
) {
  return patchPersonAction(
    personId,
    "consent/grant",
  );
}

export function revokeMemoryPersonConsent(
  personId: string,
) {
  return patchPersonAction(
    personId,
    "consent/revoke",
  );
}

export async function blockMemoryPerson(
  personId: string,
  reason?: string,
): Promise<MemoryPerson> {
  const response =
    await fetch(
      buildUrl(
        `/memory-people/${encodeURIComponent(
          personId,
        )}/block`,
      ),
      {
        method: "PATCH",

        credentials:
          "include",

        headers: {
          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify({
            reason:
              reason?.trim() ||
              undefined,
          }),
      },
    );

  const result =
    await readResponse<
      | MemoryPerson
      | ApiEnvelope<MemoryPerson>
    >(response);

  return unwrapResponse(
    result,
  );
}

export function unblockMemoryPerson(
  personId: string,
) {
  return patchPersonAction(
    personId,
    "unblock",
  );
}

export function archiveMemoryPerson(
  personId: string,
) {
  return patchPersonAction(
    personId,
    "archive",
  );
}

export function restoreMemoryPerson(
  personId: string,
) {
  return patchPersonAction(
    personId,
    "restore",
  );
}

export async function deleteMemoryPerson(
  personId: string,
): Promise<void> {
  const response =
    await fetch(
      buildUrl(
        `/memory-people/${encodeURIComponent(
          personId,
        )}`,
      ),
      {
        method:
          "DELETE",

        credentials:
          "include",
      },
    );

  await readResponse<unknown>(
    response,
  );
}