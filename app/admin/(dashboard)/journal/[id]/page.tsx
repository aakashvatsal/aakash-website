import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { JournalDetails } from "@/components/admin/journal/JournalDetails";
import { getJournalEntry } from "@/lib/api/journal";
import type { JournalEntry } from "@/types/journal";

type JournalEntryPageProps = {
  params: Promise<{ id: string }>;
};

export const dynamic = "force-dynamic";

export default async function JournalEntryPage({ params }: JournalEntryPageProps) {
  const { id } = await params;
  let entry: JournalEntry;

  try {
    entry = await getJournalEntry(id);
  } catch {
    notFound();
  }

  if (!entry?._id) notFound();

  return (
    <div>
      <AdminPageHeader
        eyebrow="Journal"
        title={entry.title}
        description="Read the journal exactly as it was captured and synthesized, with the structured signals that belong to the same day."
      />
      <div className="mt-8">
        <JournalDetails entry={entry} />
      </div>
    </div>
  );
}
