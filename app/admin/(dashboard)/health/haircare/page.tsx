import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { HealthAutonomousDomainWorkspace } from "@/components/admin/health-os/HealthAutonomousDomainWorkspace";
import { HealthOsNav } from "@/components/admin/health-os/HealthOsNav";
export const dynamic = "force-dynamic";
export default function HaircarePage() { return <main className="space-y-8"><AdminPageHeader eyebrow="Health OS" title="Haircare" description="Today’s hair/scalp routine, wash cadence and improvement focus, with private photo evidence where useful." /><HealthOsNav /><HealthAutonomousDomainWorkspace domain="haircare" title="Haircare" description="Send a short update when a product, symptom or routine changes instead of rebuilding records yourself." /></main>; }
