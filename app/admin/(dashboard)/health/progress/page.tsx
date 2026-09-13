import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { HealthOsNav } from "@/components/admin/health-os/HealthOsNav";
import { HealthProgressWorkspace } from "@/components/admin/health-os/HealthProgressWorkspace";

export const dynamic = "force-dynamic";

export default function HealthProgressPage() {
  return <main className="space-y-8"><AdminPageHeader eyebrow="Health OS V2.1" title="Progress" description="Plan vs actual, task adherence, automatic WHOOP/tracked metrics and the weekly/monthly AI feedback loop." /><HealthOsNav /><HealthProgressWorkspace /></main>;
}
