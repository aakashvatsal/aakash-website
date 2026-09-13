import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { HealthAutonomousDomainWorkspace } from "@/components/admin/health-os/HealthAutonomousDomainWorkspace";
import { HealthOsNav } from "@/components/admin/health-os/HealthOsNav";
export const dynamic = "force-dynamic";
export default function SupplementsPage() { return <main className="space-y-8"><AdminPageHeader eyebrow="Health OS" title="Supplements" description="A readable execution schedule from your configured stack. HSAKAA never silently changes doses or medically significant timing." /><HealthOsNav /><HealthAutonomousDomainWorkspace domain="supplements" title="Supplements" description="Configured supplements remain authoritative; this page is for execution and owner-provided changes." /></main>; }
