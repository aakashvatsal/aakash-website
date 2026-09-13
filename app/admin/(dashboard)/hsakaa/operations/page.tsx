import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PersonalOsClosedLoops } from "@/components/admin/hsakaa/operations/PersonalOsClosedLoops";
import { PersonalOsMorningLoop } from "@/components/admin/hsakaa/operations/PersonalOsMorningLoop";
import { PersonalOsRuntimeActivation } from "@/components/admin/hsakaa/operations/PersonalOsRuntimeActivation";
import { PersonalOsSystemHealth } from "@/components/admin/hsakaa/operations/PersonalOsSystemHealth";
import { ProductionOpsWorkspace } from "@/components/admin/hsakaa/operations/ProductionOpsWorkspace";

export const dynamic = "force-dynamic";

export default function ProductionOperationsPage() {
  return (
    <main className="space-y-8">
      <AdminPageHeader
        eyebrow="Production Operations · Personal OS"
        title="Operate the whole Personal OS without guessing."
        description="Inspect cross-module System Health, autonomous feedback loops, release readiness, AI usage and budgets, fallbacks, active jobs, backup verification and build identity. These inspections are non-destructive and do not call AI just to render status."
      />
      <PersonalOsRuntimeActivation />
      <PersonalOsMorningLoop />
      <PersonalOsSystemHealth />
      <PersonalOsClosedLoops />
      <ProductionOpsWorkspace />
    </main>
  );
}
