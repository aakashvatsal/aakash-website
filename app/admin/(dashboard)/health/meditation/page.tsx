import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { HealthAutonomousDomainWorkspace } from "@/components/admin/health-os/HealthAutonomousDomainWorkspace";
import { HealthOsNav } from "@/components/admin/health-os/HealthOsNav";
export const dynamic = "force-dynamic";
export default function MeditationPage() { return <main className="space-y-8"><AdminPageHeader eyebrow="Health OS" title="Meditation" description="HSAKAA chooses today’s meditation duration, timing and intention from your recovery and goals; you mainly complete it." /><HealthOsNav /><HealthAutonomousDomainWorkspace domain="meditation" title="Meditation" description="The routine adapts automatically instead of asking you to schedule every session manually." /></main>; }
