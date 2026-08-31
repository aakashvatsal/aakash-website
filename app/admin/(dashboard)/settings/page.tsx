import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { IntegrationsStatus } from "@/components/admin/settings/IntegrationsStatus";
import { getIntegrationsOverview } from "@/lib/api/health-extended";

export const dynamic = "force-dynamic";

export default async function AdminSettingsPage() {
  try {
    const overview = await getIntegrationsOverview();
    return (
      <div className="space-y-6">
        <AdminPageHeader eyebrow="Personal OS" title="Settings & Integrations" description="Check connected health and media providers without exposing server credentials." />
        <IntegrationsStatus overview={overview} />
      </div>
    );
  } catch (error) {
    return (
      <div className="space-y-6">
        <AdminPageHeader eyebrow="Personal OS" title="Settings & Integrations" description="Integration configuration and connection status." />
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">{error instanceof Error ? error.message : "Failed to load integrations."}</div>
      </div>
    );
  }
}
