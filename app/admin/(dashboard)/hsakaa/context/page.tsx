import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ContextEngineWorkspace } from "@/components/admin/hsakaa/context/ContextEngineWorkspace";

export const dynamic = "force-dynamic";

export default function ContextEnginePage() {
  return (
    <main className="space-y-8">
      <AdminPageHeader
        eyebrow="Phase 10 · Unified HSAKAA Context Engine"
        title="One context layer for every HSAKAA question"
        description="Route each question to the right Personal OS domains, assemble only relevant evidence, enforce privacy boundaries and hard context budgets, surface contradictions, and give HSAKAA citation-ready grounded context."
      />
      <ContextEngineWorkspace />
    </main>
  );
}
