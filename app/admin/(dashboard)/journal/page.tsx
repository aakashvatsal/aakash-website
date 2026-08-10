import Link from "next/link";
import { Plus } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { JournalList } from "@/components/admin/journal/JournalList";
import { getJournalEntries } from "@/lib/api/journal";

export const dynamic = "force-dynamic";

export default async function AdminJournalPage() {
  let entries: any = [];
  let error = "";

  try {
    entries = await getJournalEntries();
  } catch (caughtError) {
    error =
      caughtError instanceof Error
        ? caughtError.message
        : "Unable to load journal entries.";
  }

  return (
    <div>
      <AdminPageHeader
        eyebrow="Personal Knowledge System"
        title="Journal"
        description="Track daily journal, write what happen today"
      />

      {error ? (
        <div className="mt-8 rounded-[20px] border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm text-red-300">
          {error}
        </div>
      ) : (
        <div className="mt-8">
          <JournalList
            initialEntries={entries}
          />
        </div>
      )}
    </div>
  );
}