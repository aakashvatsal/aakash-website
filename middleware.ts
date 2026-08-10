import {
  NextRequest,
  NextResponse,
} from "next/server";

import {
  ADMIN_SESSION_COOKIE,
  verifyAdminSessionToken,
} from "@/lib/admin-auth.server";

export const runtime =
  "nodejs";

export function middleware(
  request: NextRequest,
) {
  const {
    pathname,
  } = request.nextUrl;

  const isAdminRoute =
    pathname === "/admin" ||
    pathname.startsWith(
      "/admin/",
    );

  if (!isAdminRoute) {
    return NextResponse.next();
  }

  const isLoginRoute =
    pathname ===
    "/admin/login";

  const token =
    request.cookies.get(
      ADMIN_SESSION_COOKIE,
    )?.value;

  const isAuthenticated =
    verifyAdminSessionToken(
      token,
    );

  if (
    isLoginRoute &&
    isAuthenticated
  ) {
    return NextResponse.redirect(
      new URL(
        "/admin",
        request.url,
      ),
    );
  }

  if (
    !isLoginRoute &&
    !isAuthenticated
  ) {
    const loginUrl =
      new URL(
        "/admin/login",
        request.url,
      );

    return NextResponse.redirect(
      loginUrl,
    );
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/admin/:path*",
  ],
};