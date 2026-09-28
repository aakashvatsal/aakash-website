import type { Metadata } from "next";

import { HealthPage } from "@/components/features/health/HealthPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  getHealthDashboard,
  getHealthTrends,
  getLatestHealthEntry,
} from "@/lib/health";
import {
  PERSON_ID,
  SITE_URL,
  buildPublicMetadata,
  breadcrumbJsonLd,
} from "@/lib/seo/site";

const title = "Health System & Performance";
const description =
  "A public view of Aakash Vatsal's health system, including recovery, sleep, training, body measurements, habits and long-term performance trends.";

export const metadata: Metadata = buildPublicMetadata({
  title,
  description,
  path: "/health",
  imageAlt: "Aakash Vatsal health system and performance tracking",
});

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function Page() {
  const [dashboard, trends, entry] = await Promise.all([
    getHealthDashboard(),
    getHealthTrends(30),
    getLatestHealthEntry(),
  ]);

  const webPageJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebPage",
    "@id": `${SITE_URL}/health#webpage`,
    url: `${SITE_URL}/health`,
    name: `${title} | Aakash Vatsal`,
    description,
    inLanguage: "en-IN",
    about: {
      "@id": PERSON_ID,
    },
    author: {
      "@id": PERSON_ID,
    },
    dateModified: entry?.updatedAt || undefined,
  };

  return (
    <>
      <JsonLd data={webPageJsonLd} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Aakash Vatsal", path: "/" },
          { name: "Health", path: "/health" },
        ])}
      />
      <HealthPage dashboard={dashboard} trends={trends} entry={entry} />
    </>
  );
}
