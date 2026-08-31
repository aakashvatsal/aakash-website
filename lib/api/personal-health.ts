import { getAdminBackendHeaders } from "@/lib/api/admin-backend-headers";
import type {
  DailySupplementLog,
  DietEntry,
  DietEntryPayload,
  MealStatus,
  MeditationEntry,
  MeditationPayload,
  MeditationStatus,
  MeditationSummary,
  Supplement,
  SupplementLogStatus,
  SupplementPayload,
  SupplementStatus,
} from "@/types/health-os";

const API_URL =
  process.env.BACKEND_API_URL ??
  "http://localhost:4000/api/v1";

const ADMIN_API_URL = "/api/admin/backend";

type ApiError = {
  message?: string | string[];
  error?: string;
};

async function readResponse<T>(
  response: Response,
  fallback: string,
): Promise<T> {
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

function queryString(params: Record<string, string | undefined>) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      search.set(key, value);
    }
  });

  const value = search.toString();
  return value ? `?${value}` : "";
}

export async function getDietEntries(
  startDate?: string,
  endDate?: string,
): Promise<DietEntry[]> {
  const response = await fetch(
    `${API_URL}/diet${queryString({ startDate, endDate })}`,
    {
      cache: "no-store",
      headers: getAdminBackendHeaders(),
    },
  );

  return readResponse<DietEntry[]>(
    response,
    "Unable to load diet entries.",
  );
}

export async function createDietEntry(
  payload: DietEntryPayload,
): Promise<DietEntry> {
  const response = await fetch(`${ADMIN_API_URL}/diet`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return readResponse<DietEntry>(response, "Unable to create diet entry.");
}

export async function updateDietEntry(
  entryId: string,
  payload: Partial<DietEntryPayload>,
): Promise<DietEntry> {
  const response = await fetch(
    `${ADMIN_API_URL}/diet/${encodeURIComponent(entryId)}`,
    {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );

  return readResponse<DietEntry>(response, "Unable to update diet entry.");
}

export async function updateDietMealStatus(
  entryId: string,
  mealIndex: number,
  status: MealStatus,
): Promise<DietEntry> {
  const response = await fetch(
    `${ADMIN_API_URL}/diet/${encodeURIComponent(entryId)}/meals/${mealIndex}`,
    {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        status,
        ...(status === "completed" ? { consumedAt: new Date().toISOString() } : {}),
      }),
    },
  );

  return readResponse<DietEntry>(response, "Unable to update meal status.");
}

export async function deleteDietEntry(entryId: string) {
  const response = await fetch(
    `${ADMIN_API_URL}/diet/${encodeURIComponent(entryId)}`,
    { method: "DELETE", credentials: "include" },
  );

  await readResponse<Record<string, unknown>>(response, "Unable to delete diet entry.");
}

export async function getSupplements(
  status?: SupplementStatus,
): Promise<Supplement[]> {
  const response = await fetch(
    `${API_URL}/supplements${queryString({ status })}`,
    { cache: "no-store", headers: getAdminBackendHeaders() },
  );

  return readResponse<Supplement[]>(response, "Unable to load supplements.");
}

export async function getDailySupplementLog(
  date: string,
): Promise<DailySupplementLog | null> {
  const response = await fetch(
    `${API_URL}/supplements/logs/daily${queryString({ date })}`,
    { cache: "no-store", headers: getAdminBackendHeaders() },
  );

  if (response.status === 404) {
    return null;
  }

  return readResponse<DailySupplementLog>(response, "Unable to load supplement log.");
}

export async function createSupplement(payload: SupplementPayload): Promise<Supplement> {
  const response = await fetch(`${ADMIN_API_URL}/supplements`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return readResponse<Supplement>(response, "Unable to create supplement.");
}

export async function updateSupplement(
  supplementId: string,
  payload: Partial<SupplementPayload>,
): Promise<Supplement> {
  const response = await fetch(
    `${ADMIN_API_URL}/supplements/${encodeURIComponent(supplementId)}`,
    {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );

  return readResponse<Supplement>(response, "Unable to update supplement.");
}

export async function deleteSupplement(supplementId: string) {
  const response = await fetch(
    `${ADMIN_API_URL}/supplements/${encodeURIComponent(supplementId)}`,
    { method: "DELETE", credentials: "include" },
  );

  await readResponse<Record<string, unknown>>(response, "Unable to remove supplement.");
}

export async function generateDailySupplementLog(
  date: string,
): Promise<DailySupplementLog> {
  const response = await fetch(`${ADMIN_API_URL}/supplements/logs/generate`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ date }),
  });

  return readResponse<DailySupplementLog>(response, "Unable to generate supplement log.");
}

export async function updateSupplementLogItem(
  logId: string,
  itemIndex: number,
  status: SupplementLogStatus,
): Promise<DailySupplementLog> {
  const response = await fetch(
    `${ADMIN_API_URL}/supplements/logs/${encodeURIComponent(logId)}/items/${itemIndex}`,
    {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    },
  );

  return readResponse<DailySupplementLog>(response, "Unable to update supplement log.");
}

export async function markSupplementLogMissed(
  date: string,
): Promise<DailySupplementLog> {
  const response = await fetch(
    `${ADMIN_API_URL}/supplements/logs/mark-missed?date=${encodeURIComponent(date)}`,
    { method: "PATCH", credentials: "include" },
  );

  return readResponse<DailySupplementLog>(response, "Unable to mark supplements missed.");
}

export async function getMeditationEntries(
  startDate?: string,
  endDate?: string,
): Promise<MeditationEntry[]> {
  const response = await fetch(
    `${API_URL}/meditation${queryString({ startDate, endDate, limit: "100" })}`,
    { cache: "no-store", headers: getAdminBackendHeaders() },
  );

  const payload = await readResponse<
    MeditationEntry[] | { data: MeditationEntry[] }
  >(response, "Unable to load meditation sessions.");

  return Array.isArray(payload) ? payload : payload.data ?? [];
}

export async function getMeditationSummary(
  startDate: string,
  endDate: string,
): Promise<MeditationSummary> {
  const response = await fetch(
    `${API_URL}/meditation/summary${queryString({ startDate, endDate })}`,
    { cache: "no-store", headers: getAdminBackendHeaders() },
  );

  return readResponse<MeditationSummary>(response, "Unable to load meditation summary.");
}

export async function createMeditationEntry(
  payload: MeditationPayload,
): Promise<MeditationEntry> {
  const response = await fetch(`${ADMIN_API_URL}/meditation`, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });

  return readResponse<MeditationEntry>(response, "Unable to create meditation session.");
}

export async function updateMeditationEntry(
  entryId: string,
  payload: Partial<MeditationPayload>,
): Promise<MeditationEntry> {
  const response = await fetch(
    `${ADMIN_API_URL}/meditation/${encodeURIComponent(entryId)}`,
    {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );

  return readResponse<MeditationEntry>(response, "Unable to update meditation session.");
}

export async function transitionMeditation(
  entryId: string,
  action: "start" | "pause" | "resume" | "complete" | "skip" | "abandon",
  body?: Record<string, unknown>,
): Promise<MeditationEntry> {
  const response = await fetch(
    `${ADMIN_API_URL}/meditation/${encodeURIComponent(entryId)}/${action}`,
    {
      method: "PATCH",
      credentials: "include",
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    },
  );

  return readResponse<MeditationEntry>(response, `Unable to ${action} meditation session.`);
}

export async function updateMeditationReflection(
  entryId: string,
  payload: Partial<MeditationPayload>,
): Promise<MeditationEntry> {
  const response = await fetch(
    `${ADMIN_API_URL}/meditation/${encodeURIComponent(entryId)}/reflection`,
    {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    },
  );

  return readResponse<MeditationEntry>(response, "Unable to save meditation reflection.");
}

export async function toggleMeditationFavourite(entryId: string) {
  const response = await fetch(
    `${ADMIN_API_URL}/meditation/${encodeURIComponent(entryId)}/favourite/toggle`,
    { method: "PATCH", credentials: "include" },
  );

  return readResponse<MeditationEntry>(response, "Unable to update favourite.");
}

export async function deleteMeditationEntry(entryId: string) {
  const response = await fetch(
    `${ADMIN_API_URL}/meditation/${encodeURIComponent(entryId)}`,
    { method: "DELETE", credentials: "include" },
  );

  await readResponse<Record<string, unknown>>(response, "Unable to delete meditation session.");
}

export async function setMeditationStatus(
  entryId: string,
  status: MeditationStatus,
): Promise<MeditationEntry> {
  const response = await fetch(
    `${ADMIN_API_URL}/meditation/${encodeURIComponent(entryId)}/status`,
    {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    },
  );

  return readResponse<MeditationEntry>(response, "Unable to update meditation status.");
}
