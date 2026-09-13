import type {
  PersonalOsMorningRun,
  PersonalOsMorningStatus,
  PersonalOsRuntimeRun,
  PersonalOsRuntimeStatus,
  RunPersonalOsInput,
  RunPersonalOsMorningInput,
  RunPersonalOsMorningResponse,
  RunPersonalOsResponse,
} from "@/types/personal-os-runtime";

const BASE = "/api/admin/backend/hsakaa/private/runtime-activation";

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
        : `Runtime Activation request failed: ${response.status}`;
    throw new Error(message);
  }
  return payload as T;
}

export function getPersonalOsRuntimeStatus() {
  return request<PersonalOsRuntimeStatus>("/status");
}

export function getPersonalOsRuntimeRuns(limit = 8) {
  return request<{ runs: PersonalOsRuntimeRun[]; count: number }>(
    `/runs?limit=${limit}`,
  );
}

export function runPersonalOs(input: RunPersonalOsInput) {
  return request<RunPersonalOsResponse>("/run", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getPersonalOsMorningStatus() {
  return request<PersonalOsMorningStatus>("/morning/status");
}

export function getPersonalOsMorningRuns(limit = 8) {
  return request<{ runs: PersonalOsMorningRun[]; count: number }>(
    `/morning/runs?limit=${limit}`,
  );
}

export function runPersonalOsMorning(input: RunPersonalOsMorningInput) {
  return request<RunPersonalOsMorningResponse>("/morning/run", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
