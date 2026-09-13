import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { HealthAutonomousDomainWorkspace } from "@/components/admin/health-os/HealthAutonomousDomainWorkspace";
import { HealthOsNav } from "@/components/admin/health-os/HealthOsNav";
export const dynamic = "force-dynamic";
export default function SkincarePage() { return <main className="space-y-8"><AdminPageHeader eyebrow="Health OS" title="Skincare" description="Your AM/PM routine and improvement focus, generated around configured products, photos and your updates." /><HealthOsNav /><HealthAutonomousDomainWorkspace domain="skincare" title="Skincare" description="No normal add-product form: tell HSAKAA what changed and the next plan adapts." /></main>; }
