import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { JournalForm } from "@/components/admin/journal/JournalForm";
import { getJournalEntry } from "@/lib/api/journal";
import type { JournalEntry } from "@/types/journal";

type EditJournalEntryPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function EditJournalEntryPage({
  params,
}: EditJournalEntryPageProps) {
  const { id } = await params;

  let entry: JournalEntry;

  try {
    entry = await getJournalEntry(id);
  } catch {
    notFound();
  }

  if (!entry?._id) {
    notFound();
  }

  return (
    <div>
      <AdminPageHeader
        eyebrow="Journal"
        title="Edit journal entry"
        description="Update the entry, mood, activity, reading, sleep and reflection details."
      />

      <div className="mt-8">
        <JournalForm entry={entry} />
      </div>
    </div>
  );
}