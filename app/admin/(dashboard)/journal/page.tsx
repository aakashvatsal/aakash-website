import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { JournalList } from "@/components/admin/journal/JournalList";
import { DailyJournalApprovalBanner } from "@/components/admin/journal/DailyJournalApprovalBanner";
import { getJournalEntries } from "@/lib/api/journal";
import type { JournalEntry } from "@/types/journal";

export const dynamic = "force-dynamic";

export default async function AdminJournalPage() {
  let entries: JournalEntry[] = [];
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

      <div className="mt-6 flex flex-wrap gap-2">
        <Link
          href="/admin/journal/daily"
          className="inline-flex min-h-10 items-center rounded-xl bg-[#C6FF32] px-4 text-sm font-black text-[#030608]"
        >
          Daily Journal & Privacy Firewall
        </Link>
      </div>

      <DailyJournalApprovalBanner />

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