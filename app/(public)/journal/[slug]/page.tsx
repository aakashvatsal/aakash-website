import {
  notFound,
} from "next/navigation";

import {
  getPublicJournalEntryBySlug,
} from "@/lib/journal";

import {
  JournalDetailPage,
} from "@/components/features/journal/JournalDetailPage";

interface PageProps {
  params:
    Promise<{
      slug: string;
    }>;
}

export default async function Page({
  params,
}: PageProps) {
  const {
    slug,
  } =
    await params;

  try {
    const entry =
      await getPublicJournalEntryBySlug(
        slug,
      );

    return (
      <JournalDetailPage
        entry={
          entry
        }
      />
    );
  } catch {
    notFound();
  }
}