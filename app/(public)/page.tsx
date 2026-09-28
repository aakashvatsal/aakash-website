import type { Metadata } from "next";

import { PublicHome } from "@/components/features/public-home/PublicHome";
import { JsonLd } from "@/components/seo/JsonLd";

import { getBooks, type LibraryApiResponse } from "@/lib/library";
import { getPublicJournalEntries } from "@/lib/journal";
import { getLatestHealthEntry } from "@/lib/health";
import { getMediaPosts } from "@/lib/media";
import { getCompanies } from "@/lib/companies";
import type { JournalListResponse } from "@/types/journal";
import type { PublicMediaResponse } from "@/types/public-media";
import {
  DEFAULT_DESCRIPTION,
  DEFAULT_TITLE,
  PERSON_ID,
  SITE_URL,
  WEBSITE_ID,
  buildPublicMetadata,
} from "@/lib/seo/site";

export const metadata: Metadata = buildPublicMetadata({
  title: DEFAULT_TITLE,
  description: DEFAULT_DESCRIPTION,
  path: "/",
  imageAlt: "Aakash Vatsal, founder, builder and creator of HSAKAA",
  absoluteTitle: true,
});

export const dynamic = "force-dynamic";

const emptyBooks: LibraryApiResponse = {
  data: [],
  pagination: {
    page: 1,
    limit: 5,
    total: 0,
    totalPages: 0,
  },
};

const emptyJournals: JournalListResponse = {
  data: [],
  pagination: {
    page: 1,
    limit: 4,
    total: 0,
    totalPages: 0,
  },
};

const emptyMedia: PublicMediaResponse = {
  items: [],
  pagination: {
    page: 1,
    limit: 4,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPreviousPage: false,
  },
};

function settledValue<T>(
  result: PromiseSettledResult<T>,
  fallback: T,
  source: string,
): T {
  if (result.status === "fulfilled") {
    return result.value;
  }

  console.error(`[PublicHome] ${source} unavailable.`, result.reason);
  return fallback;
}

export default async function Page() {
  const [
    booksResult,
    journalsResult,
    healthResult,
    mediaResult,
    companiesResult,
  ] = await Promise.allSettled([
    getBooks({
      page: 1,
      limit: 5,
    }),
    getPublicJournalEntries({
      page: 1,
      limit: 4,
    }),
    getLatestHealthEntry(),
    getMediaPosts({
      limit: 4,
    }),
    getCompanies(),
  ]);

  const books = settledValue(booksResult, emptyBooks, "library");
  const journals = settledValue(journalsResult, emptyJournals, "journal");
  const health = settledValue(healthResult, null, "health");
  const media = settledValue(mediaResult, emptyMedia, "media");
  const companies = settledValue(companiesResult, [], "companies");

  const profileJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "@id": `${SITE_URL}/#profile`,
    url: SITE_URL,
    name: DEFAULT_TITLE,
    description: DEFAULT_DESCRIPTION,
    inLanguage: "en-IN",
    mainEntity: {
      "@type": "Person",
      "@id": PERSON_ID,
      name: "Aakash Vatsal",
      url: SITE_URL,
      jobTitle: "Founder and builder",
      description:
        "Founder and builder sharing the companies, systems, ideas and experiments behind his work and HSAKAA.",
      sameAs: ["https://www.linkedin.com/in/aakashvatsal"],
      knowsAbout: [
        "Entrepreneurship",
        "Product building",
        "Sports technology",
        "Logistics technology",
        "Personal AI",
      ],
    },
  };

  const websiteJsonLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: "Aakash Vatsal",
    description: DEFAULT_DESCRIPTION,
    inLanguage: "en-IN",
    publisher: {
      "@id": PERSON_ID,
    },
  };

  return (
    <>
      <JsonLd data={profileJsonLd} />
      <JsonLd data={websiteJsonLd} />
      <PublicHome
        books={books.data}
        journals={journals.data}
        health={health}
        media={media.items}
        companies={companies}
      />
    </>
  );
}
