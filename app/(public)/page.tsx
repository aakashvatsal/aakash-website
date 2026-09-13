import { PublicHome } from "@/components/features/public-home/PublicHome";

import { getBooks, type LibraryApiResponse } from "@/lib/library";
import { getPublicJournalEntries } from "@/lib/journal";
import { getLatestHealthEntry } from "@/lib/health";
import { getMediaPosts } from "@/lib/media";
import { getCompanies } from "@/lib/companies";
import type { JournalListResponse } from "@/types/journal";
import type { PublicMediaResponse } from "@/types/public-media";

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

  return (
    <PublicHome
      books={books.data}
      journals={journals.data}
      health={health}
      media={media.items}
      companies={companies}
    />
  );
}
