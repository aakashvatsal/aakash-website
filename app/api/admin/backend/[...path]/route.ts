import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from "@/lib/admin-auth.server";

const BACKEND_URL =
  process.env.BACKEND_API_URL ??
  "http://localhost:4000/api/v1";

const ADMIN_API_SECRET =
  process.env.ADMIN_API_SECRET;

function buildBackendUrl(
  request: NextRequest,
  path: string[],
) {
  if (!BACKEND_URL) {
    throw new Error(
      "BACKEND_API_URL is not configured.",
    );
  }

  const base = BACKEND_URL.replace(
    /\/$/,
    "",
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

  if (!ADMIN_API_SECRET) {
    console.error(
      "ADMIN_API_SECRET is not configured.",
    );

    return NextResponse.json(
      {
        message:
          "Server configuration error.",
      },
      {
        status: 500,
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

  headers.set(
    "x-admin-secret",
    ADMIN_API_SECRET,
  );

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

  const response =
    await fetch(
      backendUrl,
      {
        method,
        headers,
        body,
        cache: "no-store",
      },
    );

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