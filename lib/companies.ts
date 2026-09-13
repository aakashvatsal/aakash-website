import { fetchPublicBackend } from "@/lib/public-backend";

import type {
  Company,
  CompanyListApiResponse,
} from "@/types/company";

export async function getCompanies(): Promise<Company[]> {
  const query = new URLSearchParams({
    page: "1",
    limit: "100",
    isActive: "true",
  });

  try {
    const response = await fetchPublicBackend(
      `/companies/public?${query.toString()}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
        cache: "no-store",
      },
    );

    if (!response.ok) {
      console.error("Unable to fetch public companies.", {
        status: response.status,
      });
      return [];
    }

    const result =
      (await response.json()) as CompanyListApiResponse;

    return Array.isArray(result.data)
      ? result.data
      : [];
  } catch (error) {
    console.error("Failed to fetch public companies.", error);
    return [];
  }
}

export async function getCompanyBySlug(
  slug: string,
): Promise<Company | null> {
  if (!slug.trim()) {
    return null;
  }

  try {
    const response = await fetchPublicBackend(
      `/companies/public/${encodeURIComponent(slug)}`,
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
      console.error("Unable to fetch public company.", {
        slug,
        status: response.status,
      });
      return null;
    }

    const result = await response.json();

    return result?.data ?? result ?? null;
  } catch (error) {
    console.error("Failed to fetch public company.", {
      slug,
      error,
    });
    return null;
  }
}
