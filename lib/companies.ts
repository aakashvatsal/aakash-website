import { getCompanies as getCompaniesApi } from "@/lib/api/companies";
import type { Company } from "@/types/company";

export async function getCompanies(): Promise<Company[]> {
  const response = await getCompaniesApi({
    page: 1,
    limit: 100,
    isActive: true,
  });

  return response.data ?? [];
}

export async function getCompanyBySlug(
  slug: string,
): Promise<Company | null> {
  const companies = await getCompanies();

  return (
    companies.find(
      (company) =>
        company.slug.toLowerCase() === slug.toLowerCase(),
    ) ?? null
  );
}