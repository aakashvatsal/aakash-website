import {
  getPublicJournalEntries,
} from "@/lib/journal";

import {
  JournalPage,
} from "@/components/features/journal/JournalPage";

export default async function Page() {
  const journal =
    await getPublicJournalEntries({
      page: 1,
      limit: 20,
    });

  return (
    <JournalPage
      entries={
        journal.data
      }
      pagination={
        journal.pagination
      }
    />
  );
}