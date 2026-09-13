import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const BACKEND_URL = process.env.BACKEND_API_URL ?? "http://localhost:4000/api/v1";
const WINDOW_MS = 15 * 60_000;
const MAX_REQUESTS = 8;

type Entry = { count: number; resetAt: number };
type GlobalStore = typeof globalThis & { __hsakaaOtpRateLimit?: Map<string, Entry> };
const globalStore = globalThis as GlobalStore;
const store = globalStore.__hsakaaOtpRateLimit ?? new Map<string, Entry>();
globalStore.__hsakaaOtpRateLimit = store;

function address(request: NextRequest) {
  return request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") || "unknown";
}

function allowed(key: string) {
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
  try {
    if (!allowed(address(request))) {
      return NextResponse.json(
        { message: "Too many verification attempts. Please try again later." },
        { status: 429 },
      );
    }

    const body = await request.json();
    const identifier = typeof body?.identifier === "string" ? body.identifier.trim() : "";
    if (identifier.length < 3 || identifier.length > 254) {
      return NextResponse.json({ message: "Enter a valid email or phone number." }, { status: 400 });
    }

    const response = await fetch(`${BACKEND_URL.replace(/\/$/, "")}/memory-verification/request-otp`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ identifier }),
      cache: "no-store",
    });

    return new NextResponse(await response.text(), {
      status: response.status,
      headers: { "Content-Type": response.headers.get("content-type") || "application/json" },
    });
  } catch (error) {
    console.error("HSAKAA verification request error:", error);
    return NextResponse.json({ message: "Unable to start verification right now." }, { status: 500 });
  }
}
