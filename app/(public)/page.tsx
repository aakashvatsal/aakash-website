import { PublicHome } from "@/components/features/public-home/PublicHome";

import { getBooks } from "@/lib/library";
import { getPublicJournalEntries } from "@/lib/journal";
import { getLatestHealthEntry } from "@/lib/health";
import { getMediaPosts } from "@/lib/media";
import { getCompanies } from "@/lib/companies";

export const dynamic = "force-dynamic";

export default async function Page() {
  const [
    booksResponse,
    journalsResponse,
    health,
    mediaResponse,
    companies,
  ] = await Promise.all([
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

  return (
    <PublicHome
      books={booksResponse.data}
      journals={journalsResponse.data}
      health={health}
      media={mediaResponse.items}
      companies={companies}
    />
  );
}