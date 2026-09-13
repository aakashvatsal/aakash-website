import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { HealthAutonomousDomainWorkspace } from "@/components/admin/health-os/HealthAutonomousDomainWorkspace";
import { HealthOsNav } from "@/components/admin/health-os/HealthOsNav";
export const dynamic = "force-dynamic";
export default function HealthGymPage() { return <main className="space-y-8"><AdminPageHeader eyebrow="Health OS" title="Gym" description="Exact exercises, sets, reps, RIR, RPE, rest, tempo, cardio and progression—with execution tasks and automatic adaptation." /><HealthOsNav /><HealthAutonomousDomainWorkspace domain="gym" title="Gym" description="HSAKAA owns the program unless your baseline says to follow a trainer programme." /></main>; }
