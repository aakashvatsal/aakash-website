import { getAdminBackendHeaders } from "@/lib/api/admin-backend-headers";
import type {
  CreateHobbyPayload,
  HobbiesOverview,
  HobbyEditableDetails,
  HobbyPracticePlan,
  HobbyPracticePlanSyncResult,
  HobbyPracticeSession,
  HobbyReview,
  HobbyReviewPeriod,
  LogHobbySessionPayload,
  UpdateHobbyPayload,
} from "@/types/hobbies";

const API_URL = process.env.BACKEND_API_URL ?? "http://localhost:4000/api/v1";
const ADMIN_API_URL = "/api/admin/backend";

type ApiError = { message?: string | string[]; error?: string };

async function readResponse<T>(response: Response, fallback: string): Promise<T> {
  let payload: T | ApiError | null = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const apiError = payload as ApiError | null;
    const message = Array.isArray(apiError?.message)
      ? apiError.message.join(", ")
      : apiError?.message ?? apiError?.error ?? fallback;
    throw new Error(message);
  }

  return payload as T;
}

function adminFetch(path: string, init: RequestInit = {}) {
  return fetch(`${ADMIN_API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(init.headers ?? {}),
    },
  });
}

export async function getHobbiesOverview(): Promise<HobbiesOverview> {
  const response = await fetch(`${API_URL}/hobbies/overview`, {
    cache: "no-store",
    headers: getAdminBackendHeaders(),
  });
  return readResponse(response, "Unable to load Hobbies.");
}

export async function createHobby(payload: CreateHobbyPayload): Promise<unknown> {
  return readResponse(
    await adminFetch("/hobbies", {
      method: "POST",
      body: JSON.stringify(payload),
    }),
    "Unable to add the hobby.",
  );
}

export async function getHobbyForEdit(hobbyId: string): Promise<HobbyEditableDetails> {
  return readResponse(
    await adminFetch(`/hobbies/${encodeURIComponent(hobbyId)}`),
    "Unable to load the hobby for editing.",
  );
}

export async function updateHobby(
  hobbyId: string,
  payload: UpdateHobbyPayload,
): Promise<unknown> {
  return readResponse(
    await adminFetch(`/hobbies/${encodeURIComponent(hobbyId)}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
    "Unable to update the hobby.",
  );
}

export async function archiveHobby(hobbyId: string): Promise<unknown> {
  return readResponse(
    await adminFetch(`/hobbies/${encodeURIComponent(hobbyId)}`, {
      method: "DELETE",
    }),
    "Unable to remove the hobby.",
  );
}

export async function startHobbySession(
  hobbyId: string,
  focus?: string,
): Promise<HobbyPracticeSession> {
  return readResponse(
    await adminFetch(`/hobbies/${encodeURIComponent(hobbyId)}/start`, {
      method: "POST",
      body: JSON.stringify({ focus }),
    }),
    "Unable to start practice.",
  );
}

export async function finishHobbySession(
  sessionId: string,
  payload: { notes?: string; reflection?: string; difficulty?: number; enjoyment?: number } = {},
): Promise<HobbyPracticeSession> {
  return readResponse(
    await adminFetch(`/hobbies/sessions/${encodeURIComponent(sessionId)}/finish`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
    "Unable to finish practice.",
  );
}

export async function completePlannedHobbySession(
  hobbyId: string,
  dateKey: string,
): Promise<HobbyPracticeSession> {
  return readResponse(
    await adminFetch(`/hobbies/${encodeURIComponent(hobbyId)}/complete-planned`, {
      method: "POST",
      body: JSON.stringify({ dateKey }),
    }),
    "Unable to mark the planned hobby session complete.",
  );
}

export async function logHobbySession(
  hobbyId: string,
  payload: LogHobbySessionPayload,
): Promise<HobbyPracticeSession> {
  return readResponse(
    await adminFetch(`/hobbies/${encodeURIComponent(hobbyId)}/sessions`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
    "Unable to log practice.",
  );
}

export async function advanceHobby(hobbyId: string): Promise<unknown> {
  return readResponse(
    await adminFetch(`/hobbies/${encodeURIComponent(hobbyId)}/advance`, {
      method: "POST",
    }),
    "Unable to advance the hobby curriculum.",
  );
}

export async function syncHobbyPracticeTasks(): Promise<{
  dateKey: string;
  created: number;
  skipped: number;
}> {
  return readResponse(
    await adminFetch("/hobbies/sync-practice-tasks", { method: "POST" }),
    "Unable to sync hobby practice tasks.",
  );
}

export async function linkHobbyResource(
  hobbyId: string,
  libraryItemId: string,
): Promise<unknown> {
  return readResponse(
    await adminFetch(
      `/hobbies/${encodeURIComponent(hobbyId)}/resources/${encodeURIComponent(libraryItemId)}`,
      { method: "POST" },
    ),
    "Unable to link Library resource.",
  );
}

export async function getHobbyPracticePlan(): Promise<HobbyPracticePlan> {
  const response = await fetch(`${API_URL}/hobbies/practice-plan`, {
    cache: "no-store",
    headers: getAdminBackendHeaders(),
  });
  return readResponse(response, "Unable to load the hobby practice plan.");
}

export async function syncHobbyPracticePlanTasks(): Promise<HobbyPracticePlanSyncResult> {
  return readResponse(
    await adminFetch("/hobbies/practice-plan/sync-tasks", { method: "POST" }),
    "Unable to sync the weekly hobby practice plan.",
  );
}

export async function generateHobbyReview(
  hobbyId: string,
  period: HobbyReviewPeriod,
  force = true,
): Promise<HobbyReview> {
  return readResponse(
    await adminFetch(`/hobbies/${encodeURIComponent(hobbyId)}/reviews/generate`, {
      method: "POST",
      body: JSON.stringify({ period, force }),
    }),
    `Unable to generate the ${period} hobby review.`,
  );
}

export async function getHobbyReviews(
  hobbyId: string,
  period?: HobbyReviewPeriod,
): Promise<HobbyReview[]> {
  const suffix = period ? `?period=${encodeURIComponent(period)}` : "";
  const response = await fetch(
    `${API_URL}/hobbies/${encodeURIComponent(hobbyId)}/reviews${suffix}`,
    { cache: "no-store", headers: getAdminBackendHeaders() },
  );
  return readResponse(response, "Unable to load hobby reviews.");
}

