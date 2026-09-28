import type { Metadata } from "next";

import { JournalPage } from "@/components/features/journal/JournalPage";
import { JsonLd } from "@/components/seo/JsonLd";
import { getPublicJournalEntries } from "@/lib/journal";
import {
  PERSON_ID,
  SITE_URL,
  buildPublicMetadata,
  breadcrumbJsonLd,
  cleanText,
} from "@/lib/seo/site";

const title = "Journal";
const description =
  "Read Aakash Vatsal's public journal: decisions, lessons, ideas and observations from building companies, systems and HSAKAA.";

export const metadata: Metadata = buildPublicMetadata({
  title,
  description,
  path: "/journal",
  imageAlt: "Aakash Vatsal public journal",
});

export default async function Page() {
  const journal = await getPublicJournalEntries({
    page: 1,
    limit: 20,
  });

  const blogJsonLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": `${SITE_URL}/journal#blog`,
    url: `${SITE_URL}/journal`,
    name: "Aakash Vatsal Journal",
    description,
    inLanguage: "en-IN",
    author: {
      "@id": PERSON_ID,
    },
    blogPost: journal.data.map((entry) => ({
      "@type": "BlogPosting",
      headline: entry.title,
      url: `${SITE_URL}/journal/${encodeURIComponent(entry.slug)}`,
      datePublished: entry.publishedAt || entry.createdAt,
      dateModified: entry.updatedAt,
      description: cleanText(entry.highlight || entry.content, 220),
      author: {
        "@id": PERSON_ID,
      },
    })),
  };

  return (
    <>
      <JsonLd data={blogJsonLd} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Aakash Vatsal", path: "/" },
          { name: "Journal", path: "/journal" },
        ])}
      />
      <JournalPage entries={journal.data} pagination={journal.pagination} />
    </>
  );
}
