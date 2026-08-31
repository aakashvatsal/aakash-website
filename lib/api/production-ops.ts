import type {
  ProductionOpsDashboard,
  ProductionOpsPolicy,
  ProductionOpsSmoke,
} from "@/types/production-ops";

const BASE = "/api/admin/backend/hsakaa/private/operations";

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
        : `Production operations request failed: ${response.status}`;
    throw new Error(message);
  }
  return payload as T;
}

export function getProductionOpsPolicy() {
  return request<ProductionOpsPolicy>("/policy");
}

export function getProductionOpsDashboard(days = 30) {
  return request<ProductionOpsDashboard>(`/dashboard?days=${days}`);
}

export function runProductionRcSmoke(days = 7) {
  return request<ProductionOpsSmoke>(`/smoke?days=${days}`, { method: "POST" });
}
