import {
  NextRequest,
  NextResponse,
} from "next/server";

export const runtime = "nodejs";

const BACKEND_URL =
  process.env.BACKEND_API_URL ??
  "http://localhost:4000/api/v1";


const WINDOW_MS = 60_000;
const MAX_REQUESTS_PER_WINDOW = 12;
const MAX_REQUESTS_PER_IP_WINDOW = 30;

const VALID_MODES = new Set([
  "Chat",
  "Companies",
  "Journal",
  "Library",
  "Health",
  "Media",
  "Memory",
]);

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

type HsakaaRateLimitGlobal = typeof globalThis & {
  __hsakaaRateLimitStore?: Map<
    string,
    RateLimitEntry
  >;
};

const globalStore =
  globalThis as HsakaaRateLimitGlobal;

const rateLimitStore =
  globalStore.__hsakaaRateLimitStore ??
  new Map<string, RateLimitEntry>();

globalStore.__hsakaaRateLimitStore =
  rateLimitStore;

function getClientAddress(
  request: NextRequest,
) {
  const forwardedFor =
    request.headers.get(
      "x-forwarded-for",
    );

  if (forwardedFor) {
    return (
      forwardedFor
        .split(",")[0]
        ?.trim() || "unknown"
    );
  }

  return (
    request.headers.get(
      "x-real-ip",
    ) || "unknown"
  );
}

function consumeRateLimit(
  key: string,
  maximumRequests =
    MAX_REQUESTS_PER_WINDOW,
) {
  const now = Date.now();

  if (rateLimitStore.size > 2000) {
    for (const [
      storedKey,
      entry,
    ] of rateLimitStore) {
      if (entry.resetAt <= now) {
        rateLimitStore.delete(
          storedKey,
        );
      }
    }
  }
  const current =
    rateLimitStore.get(key);

  if (
    !current ||
    current.resetAt <= now
  ) {
    const next = {
      count: 1,
      resetAt: now + WINDOW_MS,
    };

    rateLimitStore.set(
      key,
      next,
    );

    return {
      allowed: true,
      remaining:
        maximumRequests - 1,
      resetAt: next.resetAt,
    };
  }

  if (
    current.count >=
    maximumRequests
  ) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: current.resetAt,
    };
  }

  current.count += 1;

  return {
    allowed: true,
    remaining:
      maximumRequests -
      current.count,
    resetAt: current.resetAt,
  };
}

function isUuidV4(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  );
}

function isMongoId(value: string) {
  return /^[0-9a-f]{24}$/i.test(
    value,
  );
}

export async function POST(
  request: NextRequest,
) {
  try {
    const contentLength = Number(
      request.headers.get(
        "content-length",
      ) || 0,
    );

    if (contentLength > 20_000) {
      return NextResponse.json(
        {
          message:
            "HSAKAA request is too large.",
        },
        {
          status: 413,
        },
      );
    }

    const body =
      await request.json();

    const mode =
      typeof body?.mode === "string"
        ? body.mode
        : "";

    const message =
      typeof body?.message === "string"
        ? body.message.trim()
        : "";

    const sessionId =
      typeof body?.sessionId === "string"
        ? body.sessionId
        : "";

    const conversationId =
      typeof body?.conversationId ===
      "string"
        ? body.conversationId
        : undefined;

    if (!VALID_MODES.has(mode)) {
      return NextResponse.json(
        {
          message:
            "Invalid HSAKAA mode.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      message.length < 1 ||
      message.length > 4000
    ) {
      return NextResponse.json(
        {
          message:
            "Message must be between 1 and 4000 characters.",
        },
        {
          status: 400,
        },
      );
    }

    if (!isUuidV4(sessionId)) {
      return NextResponse.json(
        {
          message:
            "Invalid HSAKAA session.",
        },
        {
          status: 400,
        },
      );
    }

    if (
      conversationId &&
      !isMongoId(conversationId)
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid HSAKAA conversation.",
        },
        {
          status: 400,
        },
      );
    }

    const address =
      getClientAddress(request);

    const sessionRateLimit =
      consumeRateLimit(
        `session:${address}:${sessionId}`,
      );

    const ipRateLimit =
      consumeRateLimit(
        `ip:${address}`,
        MAX_REQUESTS_PER_IP_WINDOW,
      );

    const blockedRateLimit =
      !sessionRateLimit.allowed
        ? sessionRateLimit
        : !ipRateLimit.allowed
          ? ipRateLimit
          : null;

    if (blockedRateLimit) {
      const retryAfterSeconds =
        Math.max(
          1,
          Math.ceil(
            (blockedRateLimit.resetAt -
              Date.now()) /
              1000,
          ),
        );

      return NextResponse.json(
        {
          message:
            "Too many HSAKAA requests. Please try again shortly.",
        },
        {
          status: 429,
          headers: {
            "Retry-After": String(
              retryAfterSeconds,
            ),
            "X-RateLimit-Limit": String(
              MAX_REQUESTS_PER_WINDOW,
            ),
            "X-RateLimit-Remaining": "0",
          },
        },
      );
    }

    const backendResponse =
      await fetch(
        `${BACKEND_URL.replace(/\/$/, "")}/hsakaa/ask`,
        {
          method: "POST",
          headers: {
            Accept:
              "application/json",
            "Content-Type":
              "application/json",
          },
          body: JSON.stringify({
            mode,
            message,
            sessionId,
            ...(conversationId
              ? {
                  conversationId,
                }
              : {}),
          }),
          cache: "no-store",
        },
      );

    const responseBody =
      await backendResponse.text();

    return new NextResponse(
      responseBody,
      {
        status:
          backendResponse.status,
        headers: {
          "Content-Type":
            backendResponse.headers.get(
              "content-type",
            ) ||
            "application/json",
          "X-RateLimit-Limit": String(
            MAX_REQUESTS_PER_WINDOW,
          ),
          "X-RateLimit-Remaining": String(
            sessionRateLimit.remaining,
          ),
        },
      },
    );
  } catch (error) {
    console.error(
      "HSAKAA proxy error:",
      error,
    );

    return NextResponse.json(
      {
        message:
          "Unable to reach HSAKAA right now.",
      },
      {
        status: 500,
      },
    );
  }
}
