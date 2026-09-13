import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const BACKEND_URL = process.env.BACKEND_API_URL ?? "http://localhost:4000/api/v1";
const COOKIE_NAME = "hsakaa_person_session";
const VALID_MODES = new Set(["Chat", "Companies", "Journal", "Library", "Memory"]);
const WINDOW_MS = 60_000;
const MAX_REQUESTS = 12;

type Entry = { count: number; resetAt: number };
type GlobalStore = typeof globalThis & { __hsakaaPersonChatRateLimit?: Map<string, Entry> };
const globalStore = globalThis as GlobalStore;
const store = globalStore.__hsakaaPersonChatRateLimit ?? new Map<string, Entry>();
globalStore.__hsakaaPersonChatRateLimit = store;

function address(request: NextRequest) {
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

export async function POST(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.json({ message: "Verify your identity first." }, { status: 401 });
  if (!consume(address(request))) {
    return NextResponse.json({ message: "Too many requests. Please try again shortly." }, { status: 429 });
  }

  try {
    const body = await request.json();
    const mode = typeof body?.mode === "string" ? body.mode : "";
    const message = typeof body?.message === "string" ? body.message.trim() : "";
    const conversationId = typeof body?.conversationId === "string" ? body.conversationId : undefined;

    if (!VALID_MODES.has(mode)) return NextResponse.json({ message: "Invalid Aakash chat mode." }, { status: 400 });
    if (message.length < 1 || message.length > 4000) return NextResponse.json({ message: "Message must be between 1 and 4000 characters." }, { status: 400 });
    if (conversationId && !/^[0-9a-f]{24}$/i.test(conversationId)) return NextResponse.json({ message: "Invalid conversation." }, { status: 400 });

    const backend = await fetch(`${BACKEND_URL.replace(/\/$/, "")}/hsakaa/person/ask`, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
        "x-memory-session": token,
      },
      body: JSON.stringify({ mode, message, ...(conversationId ? { conversationId } : {}) }),
      cache: "no-store",
    });

    const response = new NextResponse(await backend.text(), {
      status: backend.status,
      headers: { "Content-Type": backend.headers.get("content-type") || "application/json" },
    });
    if (backend.status === 401) response.cookies.set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
    return response;
  } catch (error) {
    console.error("Verified Aakash proxy error:", error);
    return NextResponse.json({ message: "Unable to reach Aakash right now." }, { status: 500 });
  }
}
