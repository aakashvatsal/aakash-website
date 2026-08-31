import {
  ApiEnvelope,
  MemoryPerson,
  PaginatedResponse,
  PersonOpenLoop,
  PersonOpenLoopKind,
  PersonOpenLoopList,
  PersonOpenLoopStatus,
  PersonGraphDetail,
  PersonGraphEdge,
  PersonGraphMutuals,
  PersonGraphOverview,
  PersonGraphPath,
  CreatePersonGraphConnectionPayload,
  UpdatePersonGraphConnectionPayload,
  PersonContactGapList,
  PersonRelationshipContext,
  PeopleByRelationshipContext,
  UpdatePersonRelationshipContextPayload,
  PersonContactReference,
  PersonEmailIdentity,
  PersonIdentityStatus,
  PersonPhoneIdentity,
  PersonRelationshipType,
} from "@/types/hsakaa";

const API_URL =
  process.env.BACKEND_API_URL ??
  "http://localhost:4000/api/v1";

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

  organizationName?: string;
  tag?: string;
  minImportance?: number;

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

  emails?: Array<Pick<PersonEmailIdentity, "email" | "isPrimary">>;

  phoneNumbers?: Array<
    Pick<PersonPhoneIdentity, "phoneNumber" | "countryCode" | "isPrimary">
  >;


  aliases?: string[];

  tags?: string[];

  organizationName?: string;
  roleTitle?: string;
  department?: string;
  location?: string;
  importance?: number;
  firstMetAt?: string;
  lastInteractionAt?: string;
  contactReferences?: PersonContactReference[];

  notes?: string;


  metadata?: Record<
    string,
    unknown
  >;

};

export type UpdateMemoryPersonPayload =
  Partial<CreateMemoryPersonPayload>;

export type PersonOpenLoopQuery = {
  status?: PersonOpenLoopStatus;
  kind?: PersonOpenLoopKind;
  dueBefore?: string;
  dueAfter?: string;
  overdueOnly?: boolean;
  limit?: number;
};

export type CreatePersonOpenLoopPayload = {
  kind: PersonOpenLoopKind;
  title: string;
  details?: string;
  dueAt?: string;
  sourceInteractionId?: string;
  metadata?: Record<string, unknown>;
};

export type UpdatePersonOpenLoopPayload = Partial<
  Omit<CreatePersonOpenLoopPayload, "dueAt" | "sourceInteractionId">
> & {
  dueAt?: string | null;
  sourceInteractionId?: string | null;
};

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
  const baseUrl =
    typeof window === "undefined"
      ? API_URL
      : ADMIN_API_URL;

  return query
    ? `${baseUrl}${path}?${query}`
    : `${baseUrl}${path}`;
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

function normalizePersonOpenLoopList(
  response:
    | PersonOpenLoopList
    | ApiEnvelope<PersonOpenLoopList>,
): PersonOpenLoopList {
  const payload =
    response &&
    typeof response === "object" &&
    "data" in response &&
    "summary" in response
      ? response
      : unwrapResponse(response);

  if (
    !payload ||
    typeof payload !== "object" ||
    !("data" in payload) ||
    !Array.isArray(payload.data) ||
    !("summary" in payload) ||
    !payload.summary ||
    typeof payload.summary !== "object"
  ) {
    throw new Error("Invalid relationship open-loop response.");
  }

  return payload as PersonOpenLoopList;
}

function normalizePersonContactGapList(
  response: PersonContactGapList | ApiEnvelope<PersonContactGapList>,
): PersonContactGapList {
  const payload =
    response &&
    typeof response === "object" &&
    "data" in response &&
    "summary" in response
      ? response
      : unwrapResponse(response);

  if (
    !payload ||
    typeof payload !== "object" ||
    !("data" in payload) ||
    !Array.isArray(payload.data) ||
    !("summary" in payload) ||
    !payload.summary
  ) {
    throw new Error("Invalid relationship contact-gap response.");
  }

  return payload as PersonContactGapList;
}

function normalizePeopleByRelationshipContext(
  response: PeopleByRelationshipContext | ApiEnvelope<PeopleByRelationshipContext>,
): PeopleByRelationshipContext {
  const payload =
    response &&
    typeof response === "object" &&
    "data" in response &&
    "query" in response
      ? response
      : unwrapResponse(response);

  if (
    !payload ||
    typeof payload !== "object" ||
    !("data" in payload) ||
    !Array.isArray(payload.data) ||
    !("query" in payload)
  ) {
    throw new Error("Invalid relationship-context search response.");
  }

  return payload as PeopleByRelationshipContext;
}

function normalizePersonGraphMutuals(
  response: PersonGraphMutuals | ApiEnvelope<PersonGraphMutuals>,
): PersonGraphMutuals {
  const payload =
    response &&
    typeof response === "object" &&
    "data" in response &&
    "firstPerson" in response &&
    "secondPerson" in response
      ? response
      : unwrapResponse(response);

  if (
    !payload ||
    typeof payload !== "object" ||
    !("data" in payload) ||
    !Array.isArray(payload.data) ||
    !("firstPerson" in payload) ||
    !("secondPerson" in payload)
  ) {
    throw new Error("Invalid People Graph mutual-connections response.");
  }

  return payload as PersonGraphMutuals;
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

      organizationName:
        query.organizationName,

      tag:
        query.tag,

      minImportance:
        query.minImportance,

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
export type CreatePersonInteractionPayload = {
  type: import("@/types/hsakaa").PersonInteractionType;
  channel?: import("@/types/hsakaa").PersonInteractionChannel;
  direction?: import("@/types/hsakaa").PersonInteractionDirection;
  occurredAt: string;
  durationMinutes?: number;
  summary: string;
  participantIds?: string[];
  tags?: string[];
  linkedMemoryId?: string;
  sourceLabel?: string;
  sourceUrl?: string;
  metadata?: Record<string, unknown>;
};

export async function getPersonTimeline(
  personId: string,
  options: {
    types?: import("@/types/hsakaa").PersonTimelineEventType[];
    limit?: number;
  } = {},
): Promise<import("@/types/hsakaa").PersonTimeline> {
  const query = buildQuery({
    types: options.types?.join(","),
    limit: options.limit,
  });
  const response = await fetch(
    buildUrl(
      `/memory-people/${encodeURIComponent(personId)}/timeline`,
      query,
    ),
    {
      credentials: "include",
      cache: "no-store",
    },
  );
  const result = await readResponse<
    | import("@/types/hsakaa").PersonTimeline
    | ApiEnvelope<import("@/types/hsakaa").PersonTimeline>
  >(response);
  return unwrapResponse(result);
}

export async function recordPersonInteraction(
  personId: string,
  payload: CreatePersonInteractionPayload,
): Promise<import("@/types/hsakaa").PersonInteraction> {
  const response = await fetch(
    buildUrl(`/memory-people/${encodeURIComponent(personId)}/interactions`),
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
  const result = await readResponse<
    | import("@/types/hsakaa").PersonInteraction
    | ApiEnvelope<import("@/types/hsakaa").PersonInteraction>
  >(response);
  return unwrapResponse(result);
}

export async function getPersonOpenLoops(
  personId: string,
  query: PersonOpenLoopQuery = {},
): Promise<PersonOpenLoopList> {
  const queryString = buildQuery({
    status: query.status,
    kind: query.kind,
    dueBefore: query.dueBefore,
    dueAfter: query.dueAfter,
    overdueOnly: query.overdueOnly,
    limit: query.limit,
  });
  const response = await fetch(
    buildUrl(
      `/memory-people/${encodeURIComponent(personId)}/open-loops`,
      queryString,
    ),
    {
      credentials: "include",
      cache: "no-store",
    },
  );
  const result = await readResponse<
    PersonOpenLoopList | ApiEnvelope<PersonOpenLoopList>
  >(response);
  return normalizePersonOpenLoopList(result);
}

export async function getPeopleOpenLoops(
  query: PersonOpenLoopQuery = {},
): Promise<PersonOpenLoopList> {
  const queryString = buildQuery({
    status: query.status,
    kind: query.kind,
    dueBefore: query.dueBefore,
    dueAfter: query.dueAfter,
    overdueOnly: query.overdueOnly,
    limit: query.limit,
  });
  const response = await fetch(
    buildUrl("/memory-people/open-loops", queryString),
    {
      credentials: "include",
      cache: "no-store",
    },
  );
  const result = await readResponse<
    PersonOpenLoopList | ApiEnvelope<PersonOpenLoopList>
  >(response);
  return normalizePersonOpenLoopList(result);
}

export async function createPersonOpenLoop(
  personId: string,
  payload: CreatePersonOpenLoopPayload,
): Promise<PersonOpenLoop> {
  const response = await fetch(
    buildUrl(`/memory-people/${encodeURIComponent(personId)}/open-loops`),
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
  const result = await readResponse<
    PersonOpenLoop | ApiEnvelope<PersonOpenLoop>
  >(response);
  return unwrapResponse(result);
}

export async function updatePersonOpenLoop(
  personId: string,
  openLoopId: string,
  payload: UpdatePersonOpenLoopPayload,
): Promise<PersonOpenLoop> {
  const response = await fetch(
    buildUrl(
      `/memory-people/${encodeURIComponent(personId)}/open-loops/${encodeURIComponent(
        openLoopId,
      )}`,
    ),
    {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
  const result = await readResponse<
    PersonOpenLoop | ApiEnvelope<PersonOpenLoop>
  >(response);
  return unwrapResponse(result);
}

async function patchPersonOpenLoopAction(
  personId: string,
  openLoopId: string,
  action: "resolve" | "dismiss" | "reopen",
  body?: Record<string, unknown>,
): Promise<PersonOpenLoop> {
  const response = await fetch(
    buildUrl(
      `/memory-people/${encodeURIComponent(personId)}/open-loops/${encodeURIComponent(
        openLoopId,
      )}/${action}`,
    ),
    {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body ?? {}),
    },
  );
  const result = await readResponse<
    PersonOpenLoop | ApiEnvelope<PersonOpenLoop>
  >(response);
  return unwrapResponse(result);
}

export function resolvePersonOpenLoop(
  personId: string,
  openLoopId: string,
  resolutionNote?: string,
) {
  return patchPersonOpenLoopAction(personId, openLoopId, "resolve", {
    resolutionNote: resolutionNote?.trim() || undefined,
  });
}

export function dismissPersonOpenLoop(
  personId: string,
  openLoopId: string,
  resolutionNote?: string,
) {
  return patchPersonOpenLoopAction(personId, openLoopId, "dismiss", {
    resolutionNote: resolutionNote?.trim() || undefined,
  });
}

export function reopenPersonOpenLoop(
  personId: string,
  openLoopId: string,
  dueAt?: string | null,
) {
  return patchPersonOpenLoopAction(personId, openLoopId, "reopen", {
    ...(dueAt !== undefined ? { dueAt } : {}),
  });
}

export async function getPersonRelationshipContext(
  personId: string,
): Promise<PersonRelationshipContext> {
  const response = await fetch(
    buildUrl(
      `/memory-people/${encodeURIComponent(personId)}/relationship-context`,
    ),
    { credentials: "include", cache: "no-store" },
  );
  const result = await readResponse<
    PersonRelationshipContext | ApiEnvelope<PersonRelationshipContext>
  >(response);
  return unwrapResponse(result);
}

export async function updatePersonRelationshipContext(
  personId: string,
  payload: UpdatePersonRelationshipContextPayload,
): Promise<PersonRelationshipContext> {
  const response = await fetch(
    buildUrl(
      `/memory-people/${encodeURIComponent(personId)}/relationship-context`,
    ),
    {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
  const result = await readResponse<
    PersonRelationshipContext | ApiEnvelope<PersonRelationshipContext>
  >(response);
  return unwrapResponse(result);
}

export async function getPeopleContactGaps(
  query: { days?: number; context?: string; limit?: number } = {},
): Promise<PersonContactGapList> {
  const queryString = buildQuery({
    days: query.days,
    context: query.context,
    limit: query.limit,
  });
  const response = await fetch(
    buildUrl("/memory-people/relationship-context/dormant", queryString),
    { credentials: "include", cache: "no-store" },
  );
  const result = await readResponse<
    PersonContactGapList | ApiEnvelope<PersonContactGapList>
  >(response);
  return normalizePersonContactGapList(result);
}

export async function findPeopleByRelationshipContext(
  context: string,
  limit = 50,
): Promise<PeopleByRelationshipContext> {
  const queryString = buildQuery({ context, limit });
  const response = await fetch(
    buildUrl("/memory-people/relationship-context/search", queryString),
    { credentials: "include", cache: "no-store" },
  );
  const result = await readResponse<
    PeopleByRelationshipContext | ApiEnvelope<PeopleByRelationshipContext>
  >(response);
  return normalizePeopleByRelationshipContext(result);
}
export async function getPeopleGraphOverview(
  query: { context?: string; limit?: number } = {},
): Promise<PersonGraphOverview> {
  const queryString = buildQuery({
    context: query.context,
    limit: query.limit,
  });
  const response = await fetch(
    buildUrl("/memory-people/graph/overview", queryString),
    { credentials: "include", cache: "no-store" },
  );
  const result = await readResponse<
    PersonGraphOverview | ApiEnvelope<PersonGraphOverview>
  >(response);
  return unwrapResponse(result);
}

export async function getPersonGraph(
  personId: string,
): Promise<PersonGraphDetail> {
  const response = await fetch(
    buildUrl(`/memory-people/${encodeURIComponent(personId)}/graph`),
    { credentials: "include", cache: "no-store" },
  );
  const result = await readResponse<
    PersonGraphDetail | ApiEnvelope<PersonGraphDetail>
  >(response);
  return unwrapResponse(result);
}

export async function createPersonGraphConnection(
  personId: string,
  payload: CreatePersonGraphConnectionPayload,
): Promise<PersonGraphEdge> {
  const response = await fetch(
    buildUrl(`/memory-people/${encodeURIComponent(personId)}/graph/connections`),
    {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
  const result = await readResponse<
    PersonGraphEdge | ApiEnvelope<PersonGraphEdge>
  >(response);
  return unwrapResponse(result);
}

export async function updatePersonGraphConnection(
  personId: string,
  edgeId: string,
  payload: UpdatePersonGraphConnectionPayload,
): Promise<PersonGraphEdge> {
  const response = await fetch(
    buildUrl(
      `/memory-people/${encodeURIComponent(personId)}/graph/connections/${encodeURIComponent(edgeId)}`,
    ),
    {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );
  const result = await readResponse<
    PersonGraphEdge | ApiEnvelope<PersonGraphEdge>
  >(response);
  return unwrapResponse(result);
}

export async function deletePersonGraphConnection(
  personId: string,
  edgeId: string,
): Promise<{ deleted: boolean; edgeId: string }> {
  const response = await fetch(
    buildUrl(
      `/memory-people/${encodeURIComponent(personId)}/graph/connections/${encodeURIComponent(edgeId)}`,
    ),
    { method: "DELETE", credentials: "include" },
  );
  const result = await readResponse<
    | { deleted: boolean; edgeId: string }
    | ApiEnvelope<{ deleted: boolean; edgeId: string }>
  >(response);
  return unwrapResponse(result);
}

export async function findPersonGraphPath(
  fromPersonId: string,
  toPersonId: string,
  maxDepth = 4,
): Promise<PersonGraphPath> {
  const queryString = buildQuery({ fromPersonId, toPersonId, maxDepth });
  const response = await fetch(
    buildUrl("/memory-people/graph/path", queryString),
    { credentials: "include", cache: "no-store" },
  );
  const result = await readResponse<
    PersonGraphPath | ApiEnvelope<PersonGraphPath>
  >(response);
  return unwrapResponse(result);
}

export async function getPersonGraphMutuals(
  firstPersonId: string,
  secondPersonId: string,
): Promise<PersonGraphMutuals> {
  const response = await fetch(
    buildUrl(
      `/memory-people/graph/mutuals/${encodeURIComponent(firstPersonId)}/${encodeURIComponent(secondPersonId)}`,
    ),
    { credentials: "include", cache: "no-store" },
  );
  const result = await readResponse<
    PersonGraphMutuals | ApiEnvelope<PersonGraphMutuals>
  >(response);
  return normalizePersonGraphMutuals(result);
}

