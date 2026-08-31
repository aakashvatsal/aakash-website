import type {
  ContextAnswerResponse,
  ContextAssemblyResponse,
  ContextEnginePolicy,
  ContextRequest,
} from "@/types/context-engine";

const BASE = "/api/admin/backend/hsakaa/private/context";

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
    const raw =
      payload && typeof payload === "object" && "message" in payload
        ? payload.message
        : null;
    const message = Array.isArray(raw)
      ? raw.join(", ")
      : raw
        ? String(raw)
        : `Context Engine request failed: ${response.status}`;
    throw new Error(message);
  }

  return payload as T;
}

export function getContextEnginePolicy() {
  return request<ContextEnginePolicy>("/policy");
}

export function assembleHsakaaContext(input: ContextRequest) {
  return request<ContextAssemblyResponse>("/assemble", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function answerWithHsakaaContext(input: ContextRequest) {
  return request<ContextAnswerResponse>("/answer", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
