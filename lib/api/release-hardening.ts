import type {
  ReleaseHardeningPolicy,
  ReleaseHardeningStatus,
} from "@/types/release-hardening";

const BASE = "/api/admin/backend/hsakaa/private/release-hardening";

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
        : `Release readiness request failed: ${response.status}`;
    throw new Error(message);
  }
  return payload as T;
}

export function getReleaseHardeningPolicy() {
  return request<ReleaseHardeningPolicy>("/policy");
}

export function getReleaseHardeningStatus() {
  return request<ReleaseHardeningStatus>("/status");
}

export function runReleaseHardeningChecks() {
  return request<ReleaseHardeningStatus>("/check", { method: "POST" });
}
