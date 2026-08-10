import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CompanyDetailPage } from "@/components/features/companies/CompanyDetailPage";
import { getCompanyBySlug } from "@/lib/companies";

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
    };
  }

  return {
    title: `${company.name} | Aakash Vatsal`,
    description:
      company.description ||
      company.tagline ||
      `Learn more about ${company.name}.`,
    openGraph: {
      title: `${company.name} | Aakash Vatsal`,
      description:
        company.description ||
        company.tagline ||
        `Learn more about ${company.name}.`,
      images: company.coverImageUrl
        ? [
            {
              url: company.coverImageUrl,
              alt: company.name,
            },
          ]
        : [],
    },
  };
}

export default async function CompanySlugPage({
  params,
}: CompanySlugPageProps) {
  const { slug } = await params;

  const company = await getCompanyBySlug(slug);

  if (!company) {
    notFound();
  }

  return <CompanyDetailPage company={company} />;
}