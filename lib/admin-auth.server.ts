import crypto from "crypto";

export const ADMIN_SESSION_COOKIE =
  "aakash_admin_session";

export const ADMIN_SESSION_MAX_AGE =
  60 * 60 * 24 * 7;

function getSessionSecret() {
  const secret =
    process.env.ADMIN_SESSION_SECRET;

  if (!secret) {
    throw new Error(
      "ADMIN_SESSION_SECRET is not configured.",
    );
  }

  return secret;
}

function getAdminPassword() {
  const password =
    process.env.ADMIN_PASSWORD;

  if (!password) {
    throw new Error(
      "ADMIN_PASSWORD is not configured.",
    );
  }

  return password;
}

function sign(value: string) {
  return crypto
    .createHmac(
      "sha256",
      getSessionSecret(),
    )
    .update(value)
    .digest("hex");
}

export function createAdminSessionToken() {
  const expiresAt =
    Math.floor(Date.now() / 1000) +
    ADMIN_SESSION_MAX_AGE;

  const payload =
    String(expiresAt);

  const signature =
    sign(payload);

  return `${payload}.${signature}`;
}

export function verifyAdminSessionToken(
  token?: string | null,
) {
  if (!token) {
    return false;
  }

  const [
    expiresAtRaw,
    signature,
  ] = token.split(".");

  if (
    !expiresAtRaw ||
    !signature
  ) {
    return false;
  }

  const expiresAt =
    Number(expiresAtRaw);

  if (
    !Number.isFinite(
      expiresAt,
    )
  ) {
    return false;
  }

  const now =
    Math.floor(
      Date.now() / 1000,
    );

  if (
    expiresAt <= now
  ) {
    return false;
  }

  const expectedSignature =
    sign(expiresAtRaw);

  const actualBuffer =
    Buffer.from(
      signature,
      "utf8",
    );

  const expectedBuffer =
    Buffer.from(
      expectedSignature,
      "utf8",
    );

  if (
    actualBuffer.length !==
    expectedBuffer.length
  ) {
    return false;
  }

  return crypto.timingSafeEqual(
    actualBuffer,
    expectedBuffer,
  );
}

export function verifyAdminPassword(
  password: string,
) {
  const expectedPassword =
    getAdminPassword();

  const passwordBuffer =
    Buffer.from(password);

  const expectedBuffer =
    Buffer.from(
      expectedPassword,
    );

  if (
    passwordBuffer.length !==
    expectedBuffer.length
  ) {
    return false;
  }

  return crypto.timingSafeEqual(
    passwordBuffer,
    expectedBuffer,
  );
}