import {
  ApiEnvelope,
  MemoryPerson,
  PersonVerificationSession,
  VerificationChannel,
} from "@/types/hsakaa";

const API_URL =
  process.env.BACKEND_API_URL ??
  "http://localhost:4000/api/v1";

export type RequestPersonOtpPayload = {
  // ownerUserId?: string;
  identifier: string;
};

export type RequestPersonOtpResponse = {
  verificationSessionId: string;
  channel?: VerificationChannel;
  destination?: string;
  otpExpiresAt?: string;
  message?: string;
};

export type VerifyPersonOtpPayload = {
  verificationSessionId: string;
  otp: string;
};

export type VerifyPersonOtpResponse = {
  sessionToken: string;
  sessionExpiresAt?: string;

  person?: Pick<
    MemoryPerson,
    "_id" | "name" | "preferredName"
  >;

  verificationSession?:
    PersonVerificationSession;

  message?: string;
};

export type LogoutMemorySessionResponse = {
  success?: boolean;
  message?: string;
};

async function readResponse<T>(
  response: Response,
): Promise<T> {
  const text = await response.text();

  if (!text) {
    if (!response.ok) {
      throw new Error(
        `Request failed with status ${response.status}`,
      );
    }

    return undefined as T;
  }

  let result: unknown;

  try {
    result = JSON.parse(text);
  } catch {
    throw new Error(text);
  }

  if (!response.ok) {
    let message = `Request failed with status ${response.status}`;

    if (
      result &&
      typeof result === "object" &&
      "message" in result
    ) {
      const responseMessage = (
        result as {
          message?: string | string[];
        }
      ).message;

      message = Array.isArray(responseMessage)
        ? responseMessage.join(", ")
        : responseMessage ?? message;
    }

    throw new Error(message);
  }

  return result as T;
}

function unwrapResponse<T>(
  response: T | ApiEnvelope<T>,
): T {
  if (
    response &&
    typeof response === "object" &&
    "data" in response
  ) {
    return response.data;
  }

  return response as T;
}

export async function requestPersonOtp(
  payload: RequestPersonOtpPayload,
): Promise<RequestPersonOtpResponse> {
  const response = await fetch(
    `${API_URL}/memory-verification/request-otp`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  const result = await readResponse<
    | RequestPersonOtpResponse
    | ApiEnvelope<RequestPersonOtpResponse>
  >(response);

  return unwrapResponse(result);
}

export async function verifyPersonOtp(
  payload: VerifyPersonOtpPayload,
): Promise<VerifyPersonOtpResponse> {
  const response = await fetch(
    `${API_URL}/memory-verification/verify-otp`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    },
  );

  const result = await readResponse<
    | VerifyPersonOtpResponse
    | ApiEnvelope<VerifyPersonOtpResponse>
  >(response);

  return unwrapResponse(result);
}

export async function logoutMemorySession(
  sessionToken: string,
): Promise<LogoutMemorySessionResponse> {
  if (!sessionToken.trim()) {
    throw new Error(
      "Memory session token is required.",
    );
  }

  const response = await fetch(
    `${API_URL}/memory-verification/logout`,
    {
      method: "POST",
      headers: {
        "x-memory-session": sessionToken,
      },
    },
  );

  const result = await readResponse<
    | LogoutMemorySessionResponse
    | ApiEnvelope<LogoutMemorySessionResponse>
  >(response);

  return unwrapResponse(result);
}