import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  createAdminSessionToken,
  verifyAdminPassword,
} from "@/lib/admin-auth.server";

export async function POST(
  request: NextRequest,
) {
  try {
    const body =
      await request.json();

    const password =
      typeof body?.password === "string"
        ? body.password
        : "";

    if (
      !password ||
      !verifyAdminPassword(password)
    ) {
      return NextResponse.json(
        {
          message:
            "Invalid admin password.",
        },
        {
          status: 401,
        },
      );
    }

    const response =
      NextResponse.json({
        message:
          "Login successful.",
      });

    response.cookies.set({
      name:
        ADMIN_SESSION_COOKIE,

      value:
        createAdminSessionToken(),

      httpOnly: true,

      secure:
        process.env.NODE_ENV ===
        "production",

      sameSite: "lax",

      path: "/",

      maxAge:
        ADMIN_SESSION_MAX_AGE,
    });

    return response;
  } catch (error) {
    console.error(
      "Admin login error:",
      error,
    );

    return NextResponse.json(
      {
        message:
          "Unable to login.",
      },
      {
        status: 500,
      },
    );
  }
}