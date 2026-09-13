import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { HealthAttentionWorkspace } from "@/components/admin/health-os/HealthAttentionWorkspace";
import { HealthOsNav } from "@/components/admin/health-os/HealthOsNav";

export const dynamic = "force-dynamic";

export default function HealthAttentionPage() {
  return (
    <main className="space-y-8">
      <AdminPageHeader
        eyebrow="Health OS V2.3"
        title="Attention"
        description="Proactive coaching, Health interventions and reminder controls. HSAKAA handles routine adjustments automatically and surfaces only what deserves your decision."
      />
      <HealthOsNav />
      <HealthAttentionWorkspace />
    </main>
  );
}
