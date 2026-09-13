import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { HealthAutonomousDomainWorkspace } from "@/components/admin/health-os/HealthAutonomousDomainWorkspace";
import { HealthOsNav } from "@/components/admin/health-os/HealthOsNav";
export const dynamic = "force-dynamic";
export default function DietPage() { return <main className="space-y-8"><AdminPageHeader eyebrow="Health OS" title="Diet" description="HSAKAA gives you the readable meal/macronutrient/hydration plan; you follow it or send a short update instead of constructing diet records." /><HealthOsNav /><HealthAutonomousDomainWorkspace domain="diet" title="Diet" description="Your nutrition plan is generated from goals, recovery, progress and constraints." /></main>; }
