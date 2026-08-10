import {
  NextRequest,
  NextResponse,
} from "next/server";

const API_URL =
  process.env.BACKEND_API_URL ??
  "http://localhost:4000/api/v1";

export async function GET(
  request: NextRequest,
) {
  try {
    const query =
      request.nextUrl.searchParams.toString();

    const response =
      await fetch(
        `${API_URL}/library?${query}`,
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