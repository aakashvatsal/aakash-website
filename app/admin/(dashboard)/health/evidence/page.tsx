import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { HealthEvidenceWorkspace } from "@/components/admin/health-os/HealthEvidenceWorkspace";
import { HealthOsNav } from "@/components/admin/health-os/HealthOsNav";

export const dynamic = "force-dynamic";

export default function HealthEvidencePage() {
  return (
    <main className="space-y-8">
      <AdminPageHeader
        eyebrow="Health OS V2.4"
        title="Evidence"
        description="Data quality, source precedence, autonomy controls, baseline freshness, same-angle photo progress and longitudinal report comparison."
      />
      <HealthOsNav />
      <HealthEvidenceWorkspace />
    </main>
  );
}
