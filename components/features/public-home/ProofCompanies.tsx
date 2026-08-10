import type { Company } from "@/types/company";

import { CompanyScene } from "./CompanyScene";

interface ProofCompaniesProps {
  companies?: Company[];
}

function formatMetricValue(
  value: string | number | boolean,
  unit?: string,
) {
  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  const normalizedValue = String(value ?? "").trim();
  const normalizedUnit = String(unit ?? "").trim();

  return `${normalizedValue}${normalizedUnit}`;
}

function getCompanyStats(company: Company) {
  return (company.metrics ?? [])
    .slice(0, 3)
    .map((metric) => ({
      label: metric.label,
      value: formatMetricValue(
        metric.value,
        metric.unit,
      ),
    }))
    .filter((stat) => stat.label && stat.value);
}

export function ProofCompanies({
  companies = [],
}: ProofCompaniesProps) {
  const activeCompanies = companies.filter(
    (company) =>
      company.isActive !== false &&
      company.isArchived !== true,
  );

  const featuredCompanies = activeCompanies.filter(
    (company) => company.isFeatured === true,
  );

  const homepageCompanies = (
    featuredCompanies.length > 0
      ? featuredCompanies
      : activeCompanies
  ).slice(0, 3);

  if (homepageCompanies.length === 0) {
    return null;
  }

  return (
    <>
      {homepageCompanies.map((company, index) => (
        <CompanyScene
          key={company._id}
          eyebrow={`Proof #${index + 1}`}
          name={company.name}
          title={
            company.tagline ||
            company.currentFocus ||
            company.name
          }
          description={company.description || ""}
          image={
            company.coverImageUrl ||
            company.logoUrl ||
            "/images/company-placeholder.jpg"
          }
          stats={getCompanyStats(company)}
        />
      ))}
    </>
  );
}