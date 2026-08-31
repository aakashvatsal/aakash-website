import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { UniversalSearchWorkspace } from "@/components/admin/hsakaa/search/UniversalSearchWorkspace";

export const dynamic = "force-dynamic";

export default function UniversalSearchPage() {
  return (
    <main className="space-y-8">
      <AdminPageHeader
        eyebrow="Phase 9 · Universal Search"
        title="Search the entire Personal OS"
        description="One private search surface across Memory, People, Journal, Companies, Decisions, Library, Media, Health and Tasks — ranked by exact matches, semantics, importance, recency and graph relationships."
      />
      <UniversalSearchWorkspace />
    </main>
  );
}
