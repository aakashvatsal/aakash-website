import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { KnowledgeGraphExplorer } from "@/components/admin/hsakaa/graph/KnowledgeGraphExplorer";

export const dynamic = "force-dynamic";

export default function KnowledgeGraphPage() {
  return (
    <main className="space-y-8">
      <AdminPageHeader
        eyebrow="Phase 8 · Personal Knowledge Graph"
        title="Knowledge Graph"
        description="Explore how People, Companies, Decisions, Journal, Memory, Books, Health, Media and Tasks connect — with temporal context and source evidence on every derived relationship."
      />
      <KnowledgeGraphExplorer />
    </main>
  );
}
