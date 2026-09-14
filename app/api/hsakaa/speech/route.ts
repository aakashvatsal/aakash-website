import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const BACKEND_URL = process.env.BACKEND_API_URL ?? "http://localhost:4000/api/v1";
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 20;

type Entry = { count: number; resetAt: number };
type GlobalStore = typeof globalThis & { __hsakaaSpeechRateLimit?: Map<string, Entry> };
const globalStore = globalThis as GlobalStore;
const store = globalStore.__hsakaaSpeechRateLimit ?? new Map<string, Entry>();
globalStore.__hsakaaSpeechRateLimit = store;

function clientAddress(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") || "unknown";
}

function consume(key: string) {
  const now = Date.now();
  const current = store.get(key);
  if (!current || current.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (current.count >= MAX_REQUESTS) return false;
  current.count += 1;
  return true;
}

function isUuidV4(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value);
}

function isMongoId(value: string) {
  return /^[0-9a-f]{24}$/i.test(value);
}

export async function POST(request: NextRequest) {
  if (!consume(clientAddress(request))) {
    return NextResponse.json({ message: "Too many voice requests. Please try again shortly." }, { status: 429 });
  }

  try {
    const body = await request.json();
    const conversationId = typeof body?.conversationId === "string" ? body.conversationId : "";
    const messageId = typeof body?.messageId === "string" ? body.messageId : "";
    const sessionId = typeof body?.sessionId === "string" ? body.sessionId : "";

    if (!isMongoId(conversationId) || !isMongoId(messageId) || !isUuidV4(sessionId)) {
      return NextResponse.json({ message: "Invalid voice request." }, { status: 400 });
    }

    const backend = await fetch(`${BACKEND_URL.replace(/\/$/, "")}/hsakaa/speech`, {
      method: "POST",
      headers: {
        Accept: "audio/mpeg",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ conversationId, messageId, sessionId }),
      cache: "no-store",
    });

    if (!backend.ok) {
      const payload = await backend.json().catch(() => null) as { message?: string } | null;
      return NextResponse.json(
        { message: payload?.message || "Aakash voice is unavailable right now." },
        { status: backend.status },
      );
    }

    return new NextResponse(backend.body, {
      status: 200,
      headers: {
        "Content-Type": backend.headers.get("content-type") || "audio/mpeg",
        "Cache-Control": "private, no-store",
      },
    });
  } catch (error) {
    console.error("HSAKAA speech proxy error:", error);
    return NextResponse.json({ message: "Aakash voice is unavailable right now." }, { status: 500 });
  }
}
