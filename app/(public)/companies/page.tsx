import { CompaniesPage } from "@/components/features/companies/CompaniesPage";
import { getCompanies } from "@/lib/companies";

export default async function Page() {
  const companies = await getCompanies();

  return <CompaniesPage companies={companies} />;
}