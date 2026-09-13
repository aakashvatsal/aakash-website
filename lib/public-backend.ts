const LOCAL_BACKEND_CANDIDATES = [
  "http://127.0.0.1:4000/api/v1",
  "http://localhost:4000/api/v1",
];

function normalizeBaseUrl(value: string | undefined): string | null {
  const trimmed = value?.trim();

  if (!trimmed) {
    return null;
  }

  if (!/^https?:\/\//i.test(trimmed)) {
    return null;
  }

  return trimmed.replace(/\/+$/, "");
}

function getBackendCandidates(): string[] {
  const configured = [
    normalizeBaseUrl(process.env.BACKEND_API_URL),
    normalizeBaseUrl(process.env.NEXT_PUBLIC_API_URL),
  ].filter((value): value is string => Boolean(value));

  return Array.from(
    new Set([
      ...configured,
      ...LOCAL_BACKEND_CANDIDATES,
    ]),
  );
}

function normalizePath(path: string): string {
  return path.startsWith("/") ? path : `/${path}`;
}

export async function fetchPublicBackend(
  path: string,
  init?: RequestInit,
): Promise<Response> {
  const normalizedPath = normalizePath(path);
  const candidates = getBackendCandidates();
  let lastResponse: Response | null = null;
  let lastError: unknown;

  for (const [index, baseUrl] of candidates.entries()) {
    try {
      const response = await fetch(`${baseUrl}${normalizedPath}`, {
        ...init,
        signal: init?.signal ?? AbortSignal.timeout(4_000),
      });
      const hasFallback = index < candidates.length - 1;

      if (response.status >= 500 && hasFallback) {
        lastResponse = response;
        continue;
      }

      return response;
    } catch (error) {
      lastError = error;
    }
  }

  if (lastResponse) {
    return lastResponse;
  }

  throw new Error("Public backend is unavailable.", {
    cause: lastError,
  });
}
