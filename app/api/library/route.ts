import {
  NextRequest,
  NextResponse,
} from "next/server";

import { fetchPublicBackend } from "@/lib/public-backend";

export async function GET(
  request: NextRequest,
) {
  try {
    const query =
      request.nextUrl.searchParams.toString();

    const response =
      await fetchPublicBackend(
        `/library/public?${query}`,
        {
          method: "GET",
          headers: {
            Accept:
              "application/json",
          },
          cache:
            "no-store",
        },
      );

    const data =
      await response.json();

    return NextResponse.json(
      data,
      {
        status:
          response.status,
      },
    );
  } catch (error) {
    console.error(
      "Library proxy error:",
      error,
    );

    return NextResponse.json(
      {
        message:
          "Unable to fetch library.",
      },
      {
        status: 500,
      },
    );
  }
}