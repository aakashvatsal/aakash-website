import type { Metadata } from "next";

import { CompaniesPage } from "@/components/features/companies/CompaniesPage";
import { JsonLd } from "@/components/seo/JsonLd";
import { getCompanies } from "@/lib/companies";
import {
  PERSON_ID,
  SITE_URL,
  buildPublicMetadata,
  breadcrumbJsonLd,
} from "@/lib/seo/site";

const title = "Companies & Products";
const description =
  "Explore the companies, products and operating systems Aakash Vatsal is building across sports technology, logistics and personal AI.";

export const metadata: Metadata = buildPublicMetadata({
  title,
  description,
  path: "/companies",
  imageAlt: "Companies and products built by Aakash Vatsal",
});

export default async function Page() {
  const companies = await getCompanies();

  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${SITE_URL}/companies#collection`,
    url: `${SITE_URL}/companies`,
    name: `${title} | Aakash Vatsal`,
    description,
    inLanguage: "en-IN",
    author: {
      "@id": PERSON_ID,
    },
    mainEntity: {
      "@type": "ItemList",
      itemListElement: companies.map((company, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${SITE_URL}/companies/${encodeURIComponent(company.slug)}`,
        name: company.name,
      })),
    },
  };

  return (
    <>
      <JsonLd data={collectionJsonLd} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Aakash Vatsal", path: "/" },
          { name: "Companies", path: "/companies" },
        ])}
      />
      <CompaniesPage companies={companies} />
    </>
  );
}
