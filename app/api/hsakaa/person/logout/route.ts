import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const BACKEND_URL = process.env.BACKEND_API_URL ?? "http://localhost:4000/api/v1";
const COOKIE_NAME = "hsakaa_person_session";

export async function POST(request: NextRequest) {
  const token = request.cookies.get(COOKIE_NAME)?.value;
  if (token) {
    try {
      await fetch(`${BACKEND_URL.replace(/\/$/, "")}/memory-verification/logout`, {
        method: "POST",
        headers: { Accept: "application/json", "x-memory-session": token },
        cache: "no-store",
      });
    } catch (error) {
      console.error("HSAKAA logout backend error:", error);
    }
  }

  const response = NextResponse.json({ revoked: true });
  response.cookies.set(COOKIE_NAME, "", { path: "/", maxAge: 0 });
  return response;
}
