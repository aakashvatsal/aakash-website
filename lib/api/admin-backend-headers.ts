export function getAdminBackendHeaders(
  headers: Record<string, string> = {},
): Record<string, string> {
  return {
    Accept: "application/json",
    ...headers,
  };
}
