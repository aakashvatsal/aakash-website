import type {
  Company,
} from "@/types/company";

import {
  CompanyScene,
} from "./CompanyScene";

interface ProofCompaniesProps {
  companies?: Company[];
}

function formatMetricValue(
  value:
    | string
    | number
    | boolean,
  unit?: string,
) {
  if (
    typeof value ===
    "boolean"
  ) {
    return value
      ? "Yes"
      : "No";
  }

  const normalizedValue =
    String(
      value ?? "",
    ).trim();

  const normalizedUnit =
    String(
      unit ?? "",
    ).trim();

  if (!normalizedValue) {
    return "";
  }

  if (!normalizedUnit) {
    return normalizedValue;
  }

  const compactUnits = [
    "%",
    "°C",
    "°F",
    "/10",
  ];

  if (
    compactUnits.includes(
      normalizedUnit,
    )
  ) {
    return `${normalizedValue}${normalizedUnit}`;
  }

  return `${normalizedValue} ${normalizedUnit}`;
}

function getCompanyStats(
  company: Company,
) {
  return (
    company.metrics ??
    []
  )
    .map(
      (
        metric,
      ) => {
        const label =
          String(
            metric.label ??
              "",
          ).trim();

        const value =
          formatMetricValue(
            metric.value,
            metric.unit,
          );

        return {
          label,
          value,
        };
      },
    )
    .filter(
      (
        stat,
      ) =>
        Boolean(
          stat.label,
        ) &&
        Boolean(
          stat.value,
        ),
    )
    .slice(
      0,
      3,
    );
}

export function ProofCompanies({
  companies = [],
}: ProofCompaniesProps) {
  const activeCompanies =
    companies.filter(
      (
        company,
      ) =>
        company.isActive !==
          false &&
        company.isArchived !==
          true,
    );

  const featuredCompanies =
    activeCompanies.filter(
      (
        company,
      ) =>
        company.isFeatured ===
        true,
    );

  const homepageCompanies =
    (
      featuredCompanies.length >
      0
        ? featuredCompanies
        : activeCompanies
    ).slice(
      0,
      3,
    );

  if (
    homepageCompanies.length ===
    0
  ) {
    return null;
  }

  return (
    <>
      {homepageCompanies.map(
        (
          company,
          index,
        ) => (
          <CompanyScene
            key={
              company._id
            }
            eyebrow={`Proof #${index + 1}`}
            name={
              company.name
            }
            title={
              company.tagline ||
              company.currentFocus ||
              company.name
            }
            description={
              company.description ||
              ""
            }
            image={
              company.coverImageUrl ||
              company.logoUrl ||
              "/images/company-placeholder.jpg"
            }
            stats={
              getCompanyStats(
                company,
              )
            }
          />
        ),
      )}
    </>
  );
}