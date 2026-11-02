/**
 * Allowlist of admin-backend endpoints that validate an owner session.
 * Used only AFTER the Next.js admin cookie has been verified.
 *
 * Do not forward this credential to public or unrelated backend routes.
 */
export function requiresVerifiedOwnerSession(path: readonly string[]): boolean {
  return (
    (path[0] === "hsakaa" && path[1] === "private") ||
    (path[0] === "media" &&
      (path[1] === "studio" ||
        (path[1] === "core" && path[2] === "series")))
  );
}
