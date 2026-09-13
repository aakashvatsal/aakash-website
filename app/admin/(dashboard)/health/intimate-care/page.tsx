import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { HealthAutonomousDomainWorkspace } from "@/components/admin/health-os/HealthAutonomousDomainWorkspace";
import { HealthOsNav } from "@/components/admin/health-os/HealthOsNav";
export const dynamic = "force-dynamic";
export default function IntimateCarePage() { return <main className="space-y-8"><AdminPageHeader eyebrow="Health OS" title="Intimate Care" description="Private text/routine-based care planning with minimal manual input and no intimate-area photo analysis." /><HealthOsNav /><HealthAutonomousDomainWorkspace domain="intimate_care" title="Intimate Care" description="Follow today’s private routine or tell HSAKAA what changed; clinician instructions remain authoritative." /></main>; }
