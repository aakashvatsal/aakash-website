import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CompanyDetailPage } from "@/components/features/companies/CompanyDetailPage";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCompanyBySlug } from "@/lib/companies";
import {
  PERSON_ID,
  SITE_URL,
  buildPublicMetadata,
  breadcrumbJsonLd,
  cleanText,
} from "@/lib/seo/site";

export const dynamic = "force-dynamic";

interface CompanySlugPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: CompanySlugPageProps): Promise<Metadata> {
  const { slug } = await params;
  const company = await getCompanyBySlug(slug);

  if (!company) {
    return {
      title: "Company not found",
      robots: {
        index: false,
        follow: false,
      },
    };
  }

  const description = cleanText(
    company.description ||
      company.tagline ||
      `Learn about ${company.name}, its products, market and current focus.`,
  );

  return buildPublicMetadata({
    title: `${company.name} | Companies`,
    description,
    path: `/companies/${company.slug}`,
    image: company.coverImageUrl || company.logoUrl || undefined,
    imageAlt: `${company.name} by Aakash Vatsal`,
  });
}

export default async function CompanySlugPage({
  params,
}: CompanySlugPageProps) {
  const { slug } = await params;
  const company = await getCompanyBySlug(slug);

  if (!company) {
    notFound();
  }

  const canonicalUrl = `${SITE_URL}/companies/${encodeURIComponent(company.slug)}`;
  const companyJsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${canonicalUrl}#organization`,
    name: company.name,
    legalName: company.legalName || undefined,
    url: company.website || canonicalUrl,
    description: cleanText(company.description || company.tagline, 500),
    logo: company.logoUrl || undefined,
    image: company.coverImageUrl || company.logoUrl || undefined,
    foundingDate: company.foundedAt || undefined,
    address: company.headquarters
      ? {
          "@type": "PostalAddress",
          addressLocality: company.headquarters,
        }
      : undefined,
    founder: company.founders.map((founder) => ({
      "@type": "Person",
      name: founder.name,
    })),
    sameAs: [
      ...(company.website ? [company.website] : []),
      ...company.links.map((link) => link.url).filter(Boolean),
    ],
    knowsAbout: [...company.industries, ...company.products, ...company.markets],
  };

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${canonicalUrl}#webpage`,
    url: canonicalUrl,
    name: `${company.name} | Companies | Aakash Vatsal`,
    description: cleanText(company.description || company.tagline, 500),
    inLanguage: "en-IN",
    about: {
      "@id": `${canonicalUrl}#organization`,
    },
    author: {
      "@id": PERSON_ID,
    },
    dateModified: company.updatedAt || undefined,
  };

  return (
    <>
      <JsonLd data={companyJsonLd} />
      <JsonLd data={webPageJsonLd} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Aakash Vatsal", path: "/" },
          { name: "Companies", path: "/companies" },
          { name: company.name, path: `/companies/${company.slug}` },
        ])}
      />
      <CompanyDetailPage company={company} />
    </>
  );
}
