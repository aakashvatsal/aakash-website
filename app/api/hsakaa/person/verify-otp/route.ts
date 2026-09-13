import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const BACKEND_URL = process.env.BACKEND_API_URL ?? "http://localhost:4000/api/v1";
const COOKIE_NAME = "hsakaa_person_session";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const verificationSessionId = typeof body?.verificationSessionId === "string" ? body.verificationSessionId : "";
    const otp = typeof body?.otp === "string" ? body.otp.trim() : "";

    if (!/^[0-9a-f]{24}$/i.test(verificationSessionId) || !/^\d{6}$/.test(otp)) {
      return NextResponse.json({ message: "Enter the 6-digit verification code." }, { status: 400 });
    }

    const backend = await fetch(`${BACKEND_URL.replace(/\/$/, "")}/memory-verification/verify-otp`, {
      method: "POST",
      headers: { Accept: "application/json", "Content-Type": "application/json" },
      body: JSON.stringify({ verificationSessionId, otp }),
      cache: "no-store",
    });

    const raw = await backend.text();
    if (!backend.ok) {
      return new NextResponse(raw, {
        status: backend.status,
        headers: { "Content-Type": backend.headers.get("content-type") || "application/json" },
      });
    }

    const payload = JSON.parse(raw) as {
      sessionToken?: string;
      sessionExpiresAt?: string;
      person?: { id?: string; name?: string; memoryAccessConsentGranted?: boolean };
    };

    if (!payload.sessionToken || !payload.person?.id || !payload.person.name) {
      return NextResponse.json({ message: "Verification returned an invalid response." }, { status: 502 });
    }

    const expiresAt = payload.sessionExpiresAt ? new Date(payload.sessionExpiresAt) : new Date(Date.now() + 60 * 60 * 1000);
    const maxAge = Math.max(1, Math.floor((expiresAt.getTime() - Date.now()) / 1000));
    const response = NextResponse.json({
      verified: true,
      person: {
        id: payload.person.id,
        name: payload.person.name,
        memoryAccessConsentGranted: payload.person.memoryAccessConsentGranted === true,
      },
      sessionExpiresAt: expiresAt.toISOString(),
    });

    response.cookies.set(COOKIE_NAME, payload.sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge,
    });

    return response;
  } catch (error) {
    console.error("HSAKAA verification error:", error);
    return NextResponse.json({ message: "Unable to verify right now." }, { status: 500 });
  }
}
