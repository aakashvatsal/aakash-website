import { NextResponse } from "next/server";

const API_URL = process.env.BACKEND_API_URL ??
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:4000/api/v1";

function unwrapNow(payload: unknown) {
  if (payload && typeof payload === "object" && "data" in payload) {
    return (payload as { data?: unknown }).data ?? null;
  }

  return payload ?? null;
}

export async function GET() {
  try {
    const response = await fetch(`${API_URL}/now/public`, {
      method: "GET",
      cache: "no-store",
      headers: {
        Accept: "application/json",
      },
    });

    if (response.status === 404) {
      return NextResponse.json(null, {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      });
    }

    const body = await response.text();

    if (!response.ok) {
      return NextResponse.json(
        { message: "Unable to load current status." },
        {
          status: response.status,
          headers: {
            "Cache-Control": "no-store, max-age=0",
          },
        },
      );
    }

    if (!body.trim() || response.status === 204) {
      return NextResponse.json(null, {
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      });
    }

    let payload: unknown;

    try {
      payload = JSON.parse(body) as unknown;
    } catch {
      return NextResponse.json(
        { message: "Unable to load current status." },
        {
          status: 502,
          headers: {
            "Cache-Control": "no-store, max-age=0",
          },
        },
      );
    }

    return NextResponse.json(unwrapNow(payload), {
      headers: {
        "Cache-Control": "no-store, max-age=0",
      },
    });
  } catch {
    return NextResponse.json(
      { message: "Unable to load current status." },
      {
        status: 503,
        headers: {
          "Cache-Control": "no-store, max-age=0",
        },
      },
    );
  }
}
