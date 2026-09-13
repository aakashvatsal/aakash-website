import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { HealthOsNav } from "@/components/admin/health-os/HealthOsNav";
import { HealthPlannerWorkspace } from "@/components/admin/health-os/HealthPlannerWorkspace";

export const dynamic = "force-dynamic";

export default function HealthPlanPage() {
  return (
    <main className="space-y-8">
      <AdminPageHeader eyebrow="Health OS V2" title="AI Health Plan" description="Understand your current state first, define measurable targets, use private photo checkpoints and tracked reports, then let HSAKAA maintain a precise rolling Health plan." />
      <HealthOsNav />
      <HealthPlannerWorkspace />
    </main>
  );
}
