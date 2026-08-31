import type {
  ProactiveDashboard,
  ProactivePolicy,
  ProactiveReview,
  ProactiveReviewList,
  ProactiveReviewPeriod,
  ProactiveScanResponse,
  ProactiveSignal,
  ProactiveSignalCategory,
  ProactiveSignalList,
  ProactiveSignalSeverity,
  ProactiveSignalStatus,
} from "@/types/proactive-os";

const BASE = "/api/admin/backend/hsakaa/private/proactive";

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
        : `Proactive OS request failed: ${response.status}`;
    throw new Error(message);
  }
  return payload as T;
}

export function getProactivePolicy() {
  return request<ProactivePolicy>("/policy");
}

export function getProactiveDashboard() {
  return request<ProactiveDashboard>("/dashboard");
}

export function runProactiveScan(input: {
  lookbackDays?: number;
  maxEvidence?: number;
} = {}) {
  return request<ProactiveScanResponse>("/scan", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getProactiveSignals(input: {
  status?: ProactiveSignalStatus;
  category?: ProactiveSignalCategory;
  severity?: ProactiveSignalSeverity;
  limit?: number;
} = {}) {
  const query = new URLSearchParams();
  if (input.status) query.set("status", input.status);
  if (input.category) query.set("category", input.category);
  if (input.severity) query.set("severity", input.severity);
  if (input.limit) query.set("limit", String(input.limit));
  const suffix = query.size ? `?${query}` : "";
  return request<ProactiveSignalList>(`/signals${suffix}`);
}

export function updateProactiveSignalStatus(
  id: string,
  input: { status: ProactiveSignalStatus; snoozeDays?: number },
) {
  return request<ProactiveSignal>(`/signals/${id}/status`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}

export function decideProactiveAction(id: string, decision: "approve" | "reject") {
  return request<{
    signal: ProactiveSignal;
    execution: { executed: false; reason: string };
  }>(`/signals/${id}/action-decision`, {
    method: "POST",
    body: JSON.stringify({ decision }),
  });
}

export function generateProactiveReview(input: {
  period: ProactiveReviewPeriod;
  referenceDate?: string;
  force?: boolean;
}) {
  return request<ProactiveReview>("/reviews/generate", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getProactiveReviews(input: {
  period?: ProactiveReviewPeriod;
  limit?: number;
} = {}) {
  const query = new URLSearchParams();
  if (input.period) query.set("period", input.period);
  if (input.limit) query.set("limit", String(input.limit));
  const suffix = query.size ? `?${query}` : "";
  return request<ProactiveReviewList>(`/reviews${suffix}`);
}

export function markProactiveReviewReviewed(id: string) {
  return request<ProactiveReview>(`/reviews/${id}/reviewed`, {
    method: "PATCH",
  });
}
