import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { HealthOsNav } from "@/components/admin/health-os/HealthOsNav";
import { HealthTodayWorkspace } from "@/components/admin/health-os/HealthTodayWorkspace";

export const dynamic = "force-dynamic";

export default function HealthPage() {
  return <main className="space-y-8"><AdminPageHeader eyebrow="Personal Health System" title="Today" description="Your autonomous daily Health OS: automatic recovery/body signals, one readable routine, task completion and minimal manual input." /><HealthOsNav /><HealthTodayWorkspace /></main>;
}
