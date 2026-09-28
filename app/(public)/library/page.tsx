import type { Metadata } from "next";

import { LibraryPage } from "@/components/features/library/LibraryPage";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  PERSON_ID,
  SITE_URL,
  buildPublicMetadata,
  breadcrumbJsonLd,
} from "@/lib/seo/site";

const title = "Library & Reading Notes";
const description =
  "Explore the books, highlights, notes and ideas that have shaped how Aakash Vatsal builds, decides, trains and lives.";

export const metadata: Metadata = buildPublicMetadata({
  title,
  description,
  path: "/library",
  imageAlt: "Aakash Vatsal library and reading notes",
});

export default function Page() {
  const collectionJsonLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    "@id": `${SITE_URL}/library#collection`,
    url: `${SITE_URL}/library`,
    name: `${title} | Aakash Vatsal`,
    description,
    inLanguage: "en-IN",
    author: {
      "@id": PERSON_ID,
    },
  };

  return (
    <>
      <JsonLd data={collectionJsonLd} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Aakash Vatsal", path: "/" },
          { name: "Library", path: "/library" },
        ])}
      />
      <LibraryPage />
    </>
  );
}
