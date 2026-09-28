import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 120;

const BACKEND_URL =
  process.env.BACKEND_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:4000/api/v1";

const WINDOW_MS = 60_000;
const MAX_REQUESTS = 24;

type RateEntry = { count: number; resetAt: number };
type FundGlobal = typeof globalThis & {
  __fundPublicRateLimit?: Map<string, RateEntry>;
};

const fundGlobal = globalThis as FundGlobal;
const rateStore = fundGlobal.__fundPublicRateLimit ?? new Map<string, RateEntry>();
fundGlobal.__fundPublicRateLimit = rateStore;

function clientAddress(request: NextRequest) {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

function consumeRateLimit(key: string) {
  const now = Date.now();
  if (rateStore.size > 3000) {
    for (const [storedKey, entry] of rateStore) {
      if (entry.resetAt <= now) rateStore.delete(storedKey);
    }
  }

  const current = rateStore.get(key);
  if (!current || current.resetAt <= now) {
    rateStore.set(key, { count: 1, resetAt: now + WINDOW_MS });
    return true;
  }
  if (current.count >= MAX_REQUESTS) return false;
  current.count += 1;
  return true;
}

function isAllowedPath(path: string[]) {
  if (path.length === 1 && ["status", "chat", "evidence"].includes(path[0])) {
    return true;
  }

  return (
    path.length === 2 &&
    path[0] === "cases" &&
    /^[0-9a-f]{24}$/i.test(path[1] || "")
  );
}

async function proxy(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  if (!consumeRateLimit(clientAddress(request))) {
    return NextResponse.json(
      { message: "Too many Fund requests. Please try again shortly." },
      { status: 429 },
    );
  }

  const { path } = await context.params;
  if (!isAllowedPath(path)) {
    return NextResponse.json({ message: "Invalid Fund request." }, { status: 404 });
  }

  const contentLength = Number(request.headers.get("content-length") || 0);
  if (contentLength > 24 * 1024 * 1024) {
    return NextResponse.json(
      { message: "The Fund request is too large." },
      { status: 413 },
    );
  }

  const target = new URL(`${BACKEND_URL.replace(/\/$/, "")}/fund/${path.join("/")}`);
  request.nextUrl.searchParams.forEach((value, key) => {
    target.searchParams.append(key, value);
  });

  const headers = new Headers();
  const contentType = request.headers.get("content-type");
  if (contentType) headers.set("content-type", contentType);
  headers.set("accept", "application/json");

  const method = request.method;
  const body = ["GET", "HEAD"].includes(method)
    ? undefined
    : await request.arrayBuffer();

  try {
    const backend = await fetch(target, {
      method,
      headers,
      body,
      cache: "no-store",
    });

    const responseHeaders = new Headers();
    const responseType = backend.headers.get("content-type");
    if (responseType) responseHeaders.set("content-type", responseType);
    responseHeaders.set("cache-control", "private, no-store");

    return new NextResponse(backend.body, {
      status: backend.status,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Fund public proxy error:", error);
    return NextResponse.json(
      { message: "HSAKAA Fund is temporarily unavailable." },
      { status: 502 },
    );
  }
}

export function GET(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return proxy(request, context);
}

export function POST(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> },
) {
  return proxy(request, context);
}
