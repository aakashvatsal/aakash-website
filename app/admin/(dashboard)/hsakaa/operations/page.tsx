import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ProductionOpsWorkspace } from "@/components/admin/hsakaa/operations/ProductionOpsWorkspace";

export const dynamic = "force-dynamic";

export default function ProductionOperationsPage() {
  return (
    <main className="space-y-8">
      <AdminPageHeader
        eyebrow="Production Operations · Release Candidate"
        title="Operate HSAKAA without guessing."
        description="Inspect release readiness, AI usage and configurable cost budgets, fallbacks, active jobs, backup verification and build identity. This console is non-destructive and never calls AI just to render status."
      />
      <ProductionOpsWorkspace />
    </main>
  );
}
