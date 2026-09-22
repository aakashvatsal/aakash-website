import "server-only";

import { cookies } from "next/headers";

import { ADMIN_SESSION_COOKIE } from "@/lib/admin-auth.server";
import type {
  DailyContextWorkspace,
  JournalIntelligence,
} from "@/lib/api/daily-context";

const BACKEND_URL =
  process.env.BACKEND_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:4000/api/v1";

function normalizeBackendUrl(value: string) {
  const url = new URL(value);

  if (
    process.env.NODE_ENV !== "production" &&
    (url.hostname === "localhost" || url.hostname === "::1")
  ) {
    url.hostname = "127.0.0.1";
  }

  return url.toString().replace(/\/$/, "");
}

async function privateJournalRequest<T>(path: string): Promise<T> {
  const cookieStore = await cookies();
  const ownerSession = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;

  if (!ownerSession) {
    throw new Error("Admin authentication required.");
  }

  const response = await fetch(
    `${normalizeBackendUrl(BACKEND_URL)}/hsakaa/private${path}`,
    {
      headers: {
        Accept: "application/json",
        "x-owner-session": ownerSession,
      },
      cache: "no-store",
    },
  );

  const payload = (await response.json().catch(() => null)) as
    | { message?: string | string[] }
    | T
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
        : `Request failed: ${response.status}`;
    throw new Error(message);
  }

  return payload as T;
}

export function getDailyContextWorkspaceServer(dateKey: string) {
  return privateJournalRequest<DailyContextWorkspace>(
    `/daily-context?dateKey=${encodeURIComponent(dateKey)}`,
  );
}

export function getJournalIntelligenceServer(
  period: "week" | "month",
  dateKey?: string,
) {
  const query = new URLSearchParams({ period });
  if (dateKey) query.set("dateKey", dateKey);

  return privateJournalRequest<JournalIntelligence>(
    `/journal-intelligence?${query.toString()}`,
  );
}
