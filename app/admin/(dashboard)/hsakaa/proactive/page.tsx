import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ProactiveOsWorkspace } from "@/components/admin/hsakaa/proactive/ProactiveOsWorkspace";

export const dynamic = "force-dynamic";

export default function ProactiveOsPage() {
  return (
    <main className="space-y-8">
      <AdminPageHeader
        eyebrow="Phase 11 · Proactive HSAKAA / Personal OS"
        title="What deserves your attention before you ask?"
        description="Detect forgotten commitments, quiet relationships, unresolved decisions, repeated deferrals, health and journal patterns, reading ideas, company risks or opportunities, and other cross-domain signals—while keeping consequential actions confirmation-controlled."
      />
      <ProactiveOsWorkspace />
    </main>
  );
}
