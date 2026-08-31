import { getAdminBackendHeaders } from "@/lib/api/admin-backend-headers";
import type {
  BrainDumpItem,
  BrainDumpPayload,
  BrainDumpProcessPayload,
  BrainDumpSummary,
  PaginatedResponse,
  PersonalReminder,
  PersonalTask,
  ReminderSummary,
  ReminderToday,
  TaskPayload,
  TaskStatus,
  TaskSummary,
} from "@/types/personal-os";

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

export async function getTasks(): Promise<PaginatedResponse<PersonalTask>> {
  const response = await fetch(`${API_URL}/tasks?limit=100&sortBy=createdAt&sortOrder=desc`, {
    cache: "no-store",
    headers: getAdminBackendHeaders(),
  });
  return readResponse(response, "Unable to load tasks.");
}

export async function getTaskSummary(): Promise<TaskSummary> {
  const response = await fetch(`${API_URL}/tasks/summary`, {
    cache: "no-store",
    headers: getAdminBackendHeaders(),
  });
  return readResponse(response, "Unable to load task summary.");
}

export async function createTask(payload: TaskPayload): Promise<PersonalTask> {
  return readResponse(
    await adminFetch("/tasks", { method: "POST", body: JSON.stringify(payload) }),
    "Unable to create task.",
  );
}

export async function updateTask(taskId: string, payload: Partial<TaskPayload>): Promise<PersonalTask> {
  return readResponse(
    await adminFetch(`/tasks/${encodeURIComponent(taskId)}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
    "Unable to update task.",
  );
}

export async function updateTaskStatus(taskId: string, status: TaskStatus): Promise<PersonalTask> {
  return readResponse(
    await adminFetch(`/tasks/${encodeURIComponent(taskId)}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
    "Unable to update task status.",
  );
}

export async function completeTask(taskId: string): Promise<PersonalTask> {
  return readResponse(
    await adminFetch(`/tasks/${encodeURIComponent(taskId)}/complete`, { method: "PATCH" }),
    "Unable to complete task.",
  );
}

export async function reopenTask(taskId: string): Promise<PersonalTask> {
  return readResponse(
    await adminFetch(`/tasks/${encodeURIComponent(taskId)}/reopen`, { method: "PATCH" }),
    "Unable to reopen task.",
  );
}

export async function archiveTask(taskId: string): Promise<PersonalTask> {
  return readResponse(
    await adminFetch(`/tasks/${encodeURIComponent(taskId)}/archive`, { method: "PATCH" }),
    "Unable to archive task.",
  );
}

export async function deleteTask(taskId: string): Promise<void> {
  await readResponse(
    await adminFetch(`/tasks/${encodeURIComponent(taskId)}`, { method: "DELETE" }),
    "Unable to delete task.",
  );
}

export async function getReminderToday(): Promise<ReminderToday> {
  const response = await fetch(`${API_URL}/reminders/today`, {
    cache: "no-store",
    headers: getAdminBackendHeaders(),
  });
  return readResponse(response, "Unable to load reminders.");
}

export async function getReminderSummary(): Promise<ReminderSummary> {
  const response = await fetch(`${API_URL}/reminders/summary`, {
    cache: "no-store",
    headers: getAdminBackendHeaders(),
  });
  return readResponse(response, "Unable to load reminder summary.");
}

export async function acknowledgeReminder(reminderId: string): Promise<PersonalReminder> {
  return readResponse(
    await adminFetch(`/reminders/${encodeURIComponent(reminderId)}/acknowledge`, { method: "PATCH" }),
    "Unable to acknowledge reminder.",
  );
}

export async function snoozeReminder(reminderId: string, minutes: number): Promise<PersonalReminder> {
  return readResponse(
    await adminFetch(`/reminders/${encodeURIComponent(reminderId)}/snooze`, {
      method: "PATCH",
      body: JSON.stringify({ minutes }),
    }),
    "Unable to snooze reminder.",
  );
}

export async function dismissReminder(reminderId: string): Promise<PersonalReminder> {
  return readResponse(
    await adminFetch(`/reminders/${encodeURIComponent(reminderId)}/dismiss`, { method: "PATCH" }),
    "Unable to dismiss reminder.",
  );
}

export async function reopenReminder(reminderId: string): Promise<PersonalReminder> {
  return readResponse(
    await adminFetch(`/reminders/${encodeURIComponent(reminderId)}/reopen`, { method: "PATCH" }),
    "Unable to reopen reminder.",
  );
}

export async function syncReminders(days = 2): Promise<unknown> {
  return readResponse(
    await adminFetch(`/reminders/sync?days=${days}`, { method: "POST" }),
    "Unable to sync reminders.",
  );
}

export async function getBrainDump(): Promise<PaginatedResponse<BrainDumpItem>> {
  const response = await fetch(`${API_URL}/brain-dump?limit=100&sortBy=createdAt&sortOrder=desc`, {
    cache: "no-store",
    headers: getAdminBackendHeaders(),
  });
  return readResponse(response, "Unable to load Brain Dump.");
}

export async function getBrainDumpSummary(): Promise<BrainDumpSummary> {
  const response = await fetch(`${API_URL}/brain-dump/summary`, {
    cache: "no-store",
    headers: getAdminBackendHeaders(),
  });
  return readResponse(response, "Unable to load Brain Dump summary.");
}

export async function createBrainDump(payload: BrainDumpPayload): Promise<BrainDumpItem> {
  return readResponse(
    await adminFetch("/brain-dump", { method: "POST", body: JSON.stringify(payload) }),
    "Unable to capture thought.",
  );
}

export async function updateBrainDump(brainDumpId: string, payload: Partial<BrainDumpPayload>): Promise<BrainDumpItem> {
  return readResponse(
    await adminFetch(`/brain-dump/${encodeURIComponent(brainDumpId)}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
    "Unable to update Brain Dump item.",
  );
}

export async function processBrainDump(brainDumpId: string, payload: BrainDumpProcessPayload) {
  return readResponse<{ brainDump: BrainDumpItem; created: unknown }>(
    await adminFetch(`/brain-dump/${encodeURIComponent(brainDumpId)}/process`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),
    "Unable to process Brain Dump item.",
  );
}

export async function discardBrainDump(brainDumpId: string): Promise<BrainDumpItem> {
  return readResponse(
    await adminFetch(`/brain-dump/${encodeURIComponent(brainDumpId)}/discard`, { method: "PATCH" }),
    "Unable to discard Brain Dump item.",
  );
}

export async function reopenBrainDump(brainDumpId: string): Promise<BrainDumpItem> {
  return readResponse(
    await adminFetch(`/brain-dump/${encodeURIComponent(brainDumpId)}/reopen`, { method: "PATCH" }),
    "Unable to reopen Brain Dump item.",
  );
}

export async function archiveBrainDump(brainDumpId: string): Promise<BrainDumpItem> {
  return readResponse(
    await adminFetch(`/brain-dump/${encodeURIComponent(brainDumpId)}/archive`, { method: "PATCH" }),
    "Unable to archive Brain Dump item.",
  );
}

export async function deleteBrainDump(brainDumpId: string): Promise<void> {
  await readResponse(
    await adminFetch(`/brain-dump/${encodeURIComponent(brainDumpId)}`, { method: "DELETE" }),
    "Unable to delete Brain Dump item.",
  );
}
