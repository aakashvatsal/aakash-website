import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { LibraryList } from "@/components/admin/library/LibraryList";
import { LibraryStats } from "@/components/admin/library/LibraryStats";
import { getLibraryItems } from "@/lib/api/library";

import type { LibraryItem } from "@/types/library";

export const dynamic = "force-dynamic";

export default async function AdminLibraryPage() {
  let items: LibraryItem[] = [];
  let error = "";

  try {
    items = await getLibraryItems();
  } catch (caughtError) {
    error =
      caughtError instanceof Error
        ? caughtError.message
        : "Unable to load library.";
  }

  return (
    <main className="space-y-8">
      <AdminPageHeader
        eyebrow="Learning Operating System"
        title="Library"
        description="Manage books, articles, papers, podcasts, courses, notes and reading progress."
      />

      {error ? (
        <div className="rounded-[18px] border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm text-red-300">
          {error}
        </div>
      ) : (
        <>
          <LibraryStats items={items} />

          <LibraryList initialItems={items} />
        </>
      )}
    </main>
  );
}