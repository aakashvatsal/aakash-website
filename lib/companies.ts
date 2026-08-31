import type {
  Company,
  CompanyListApiResponse,
} from "@/types/company";

const API_URL =
  process.env.BACKEND_API_URL ??
  "http://localhost:4000/api/v1";

export async function getCompanies(): Promise<Company[]> {
  const query = new URLSearchParams({
    page: "1",
    limit: "100",
    isActive: "true",
  });

  const response = await fetch(
    `${API_URL}/companies/public?${query.toString()}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );

  if (!response.ok) {
    throw new Error(
      `Unable to fetch public companies (${response.status}).`,
    );
  }

  const result =
    (await response.json()) as CompanyListApiResponse;

  return Array.isArray(result.data)
    ? result.data
    : [];
}

export async function getCompanyBySlug(
  slug: string,
): Promise<Company | null> {
  if (!slug.trim()) {
    return null;
  }

  const response = await fetch(
    `${API_URL}/companies/public/${encodeURIComponent(slug)}`,
    {
      method: "GET",
      headers: {
        Accept: "application/json",
      },
      cache: "no-store",
    },
  );

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    throw new Error(
      `Unable to fetch public company (${response.status}).`,
    );
  }

  const result = await response.json();

  return result?.data ?? result ?? null;
}
