import type {
  KnowledgeGraphAnswer,
  KnowledgeGraphNodeDetail,
  KnowledgeGraphNodeType,
  KnowledgeGraphOverview,
  KnowledgeGraphPath,
  KnowledgeGraphSyncResult,
  KnowledgeGraphTimeline,
} from "@/types/knowledge-graph";

const BASE = "/api/admin/backend/hsakaa/private/knowledge-graph";

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
        : `Knowledge Graph request failed: ${response.status}`;
    throw new Error(message);
  }

  return payload as T;
}

export function getKnowledgeGraphOverview(input: {
  q?: string;
  types?: KnowledgeGraphNodeType[];
  limit?: number;
} = {}) {
  const query = new URLSearchParams();
  if (input.q?.trim()) query.set("q", input.q.trim());
  for (const type of input.types ?? []) query.append("types", type);
  if (input.limit) query.set("limit", String(input.limit));
  const suffix = query.toString() ? `?${query}` : "";
  return request<KnowledgeGraphOverview>(`/overview${suffix}`);
}

export function syncKnowledgeGraph() {
  return request<KnowledgeGraphSyncResult>("/sync", { method: "POST" });
}

export function getKnowledgeGraphNode(nodeKey: string) {
  return request<KnowledgeGraphNodeDetail>(`/nodes/${encodeURIComponent(nodeKey)}`);
}

export function getKnowledgeGraphTimeline(input: {
  types?: KnowledgeGraphNodeType[];
  from?: string;
  to?: string;
  limit?: number;
} = {}) {
  const query = new URLSearchParams();
  for (const type of input.types ?? []) query.append("types", type);
  if (input.from) query.set("from", input.from);
  if (input.to) query.set("to", input.to);
  if (input.limit) query.set("limit", String(input.limit));
  const suffix = query.toString() ? `?${query}` : "";
  return request<KnowledgeGraphTimeline>(`/timeline${suffix}`);
}

export function findKnowledgeGraphPath(from: string, to: string, maxDepth = 4) {
  const query = new URLSearchParams({ from, to, maxDepth: String(maxDepth) });
  return request<KnowledgeGraphPath>(`/path?${query}`);
}

export function askKnowledgeGraph(question: string, maxEvidence = 30) {
  return request<KnowledgeGraphAnswer>("/ask", {
    method: "POST",
    body: JSON.stringify({ question, maxEvidence }),
  });
}
