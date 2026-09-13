import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from "@/lib/admin-auth.server";

export const maxDuration = 600;

const BACKEND_URL =
  process.env.BACKEND_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://127.0.0.1:4000/api/v1";

function normalizeLocalBackendUrl(value: string) {
  const url = new URL(value);

  // Nest binds to IPv4 (0.0.0.0). On macOS, Node may resolve localhost
  // to ::1 first, which can make an otherwise healthy local backend look
  // unavailable to the Next.js server-side proxy. Keep production URLs intact.
  if (
    process.env.NODE_ENV !== "production" &&
    (url.hostname === "localhost" || url.hostname === "::1")
  ) {
    url.hostname = "127.0.0.1";
  }

  return url.toString().replace(/\/$/, "");
}

function describeFetchFailure(error: unknown) {
  const baseDetail =
    error instanceof Error
      ? error.message
      : String(error);

  const cause =
    error instanceof Error &&
    "cause" in error
      ? (error as Error & { cause?: unknown }).cause
      : undefined;

  if (!cause || typeof cause !== "object") {
    return { detail: baseDetail };
  }

  const socketCause = cause as {
    code?: string;
    errno?: string | number;
    syscall?: string;
    address?: string;
    port?: number;
    message?: string;
  };

  return {
    detail: socketCause.message
      ? `${baseDetail}: ${socketCause.message}`
      : baseDetail,
    code: socketCause.code,
    errno: socketCause.errno,
    syscall: socketCause.syscall,
    address: socketCause.address,
    port: socketCause.port,
  };
}

function buildBackendUrl(
  request: NextRequest,
  path: string[],
) {
  if (!BACKEND_URL) {
    throw new Error(
      "BACKEND_API_URL is not configured.",
    );
  }

  const base = normalizeLocalBackendUrl(
    BACKEND_URL,
  );

  const target = new URL(
    `${base}/${path.join("/")}`,
  );

  request.nextUrl.searchParams.forEach(
    (value, key) => {
      target.searchParams.append(
        key,
        value,
      );
    },
  );

  return target;
}

async function proxyRequest(
  request: NextRequest,
  context: {
    params: Promise<{
      path: string[];
    }>;
  },
) {
  const token =
    request.cookies.get(
      ADMIN_SESSION_COOKIE,
    )?.value;

  if (
    !token ||
    !verifyAdminSessionToken(token)
  ) {
    return NextResponse.json(
      {
        message:
          "Admin authentication required.",
      },
      {
        status: 401,
      },
    );
  }

  const { path } =
    await context.params;

  const backendUrl =
    buildBackendUrl(
      request,
      path,
    );

  const headers =
    new Headers();

  const contentType =
    request.headers.get(
      "content-type",
    );

  if (contentType) {
    headers.set(
      "content-type",
      contentType,
    );
  }

  const accept =
    request.headers.get(
      "accept",
    );

  if (accept) {
    headers.set(
      "accept",
      accept,
    );
  }

  // The browser cookie is verified here and never forwarded directly.
  // Private HSAKAA receives only the already-verified signed session token
  // through this server-to-server header.
  if (path[0] === "hsakaa" && path[1] === "private") {
    headers.set("x-owner-session", token);
  }


  const method =
    request.method;

  const hasBody =
    ![
      "GET",
      "HEAD",
    ].includes(method);

  let body:
    | ArrayBuffer
    | undefined;

  if (hasBody) {
    body =
      await request.arrayBuffer();
  }

  let response: Response;
  try {
    response = await fetch(backendUrl, {
      method,
      headers,
      body,
      cache: "no-store",
    });
  } catch (error) {
    const failure =
      describeFetchFailure(error);

    console.error(
      "Admin backend proxy request failed:",
      {
        method,
        backendUrl:
          backendUrl.toString(),
        ...failure,
      },
    );

    return NextResponse.json(
      {
        message:
          "The backend connection failed while processing this request.",
        ...(process.env.NODE_ENV !==
        "production"
          ? {
              ...failure,
              backendTarget:
                backendUrl.origin,
            }
          : {}),
      },
      { status: 502 },
    );
  }

  const responseHeaders =
    new Headers();

  const responseContentType =
    response.headers.get(
      "content-type",
    );

  if (responseContentType) {
    responseHeaders.set(
      "content-type",
      responseContentType,
    );
  }

  return new NextResponse(
    response.body,
    {
      status:
        response.status,
      headers:
        responseHeaders,
    },
  );
}

export async function GET(
  request: NextRequest,
  context: {
    params: Promise<{
      path: string[];
    }>;
  },
) {
  return proxyRequest(
    request,
    context,
  );
}

export async function POST(
  request: NextRequest,
  context: {
    params: Promise<{
      path: string[];
    }>;
  },
) {
  return proxyRequest(
    request,
    context,
  );
}

export async function PATCH(
  request: NextRequest,
  context: {
    params: Promise<{
      path: string[];
    }>;
  },
) {
  return proxyRequest(
    request,
    context,
  );
}

export async function PUT(
  request: NextRequest,
  context: {
    params: Promise<{
      path: string[];
    }>;
  },
) {
  return proxyRequest(
    request,
    context,
  );
}

export async function DELETE(
  request: NextRequest,
  context: {
    params: Promise<{
      path: string[];
    }>;
  },
) {
  return proxyRequest(
    request,
    context,
  );
}