import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ReleaseReadinessWorkspace } from "@/components/admin/hsakaa/release-readiness/ReleaseReadinessWorkspace";

export const dynamic = "force-dynamic";

export default function ReleaseReadinessPage() {
  return (
    <main className="space-y-8">
      <AdminPageHeader
        eyebrow="Final Integration · Release Hardening"
        title="Is the Personal OS safe to release?"
        description="Run non-destructive readiness checks across the Phase 8–11 graph, search, context, proactive and scheduler layers. The checker never calls AI or executes consequential actions."
      />
      <ReleaseReadinessWorkspace />
    </main>
  );
}
