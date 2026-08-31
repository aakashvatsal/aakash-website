import type { KnowledgeGraphNodeType } from "@/types/knowledge-graph";
import type {
  HsakaaSearchPacket,
  UniversalSearchIndexStatus,
  UniversalSearchMode,
  UniversalSearchResponse,
  UniversalSearchSort,
  UniversalSearchSyncResult,
} from "@/types/universal-search";

const BASE = "/api/admin/backend/hsakaa/private/search";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...(init?.headers ?? {}),
    },
    cache: "no-store",
  });
  const payload = (await response.json().catch(() => null)) as
    | T
    | { message?: string | string[] }
    | null;
  if (!response.ok) {
    const raw = payload && typeof payload === "object" && "message" in payload
      ? payload.message
      : null;
    const message = Array.isArray(raw)
      ? raw.join(", ")
      : raw
        ? String(raw)
        : `Universal Search request failed: ${response.status}`;
    throw new Error(message);
  }
  return payload as T;
}

export function universalSearch(input: {
  q: string;
  mode?: UniversalSearchMode;
  sort?: UniversalSearchSort;
  types?: KnowledgeGraphNodeType[];
  tags?: string[];
  from?: string;
  to?: string;
  minImportance?: number;
  limit?: number;
  offset?: number;
}) {
  const query = new URLSearchParams({ q: input.q });
  if (input.mode) query.set("mode", input.mode);
  if (input.sort) query.set("sort", input.sort);
  for (const type of input.types ?? []) query.append("types", type);
  for (const tag of input.tags ?? []) query.append("tags", tag);
  if (input.from) query.set("from", input.from);
  if (input.to) query.set("to", input.to);
  if (input.minImportance !== undefined) {
    query.set("minImportance", String(input.minImportance));
  }
  if (input.limit) query.set("limit", String(input.limit));
  if (input.offset) query.set("offset", String(input.offset));
  return request<UniversalSearchResponse>(`?${query}`);
}

export function getUniversalSearchIndexStatus() {
  return request<UniversalSearchIndexStatus>("/index-status");
}

export function syncUniversalSearchIndex(input: {
  force?: boolean;
  maxEmbeddings?: number;
} = {}) {
  return request<UniversalSearchSyncResult>("/sync", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function buildHsakaaSearchPacket(input: {
  question: string;
  types?: KnowledgeGraphNodeType[];
  from?: string;
  to?: string;
  maxEvidence?: number;
}) {
  return request<HsakaaSearchPacket>("/hsakaa", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
