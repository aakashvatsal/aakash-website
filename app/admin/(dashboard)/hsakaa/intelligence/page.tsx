import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { HsakaaIntelligence } from "@/components/admin/hsakaa/intelligence/HsakaaIntelligence";

export const dynamic = "force-dynamic";

export default function HsakaaIntelligencePage() {
  return (
    <main className="space-y-8">
      <AdminPageHeader
        eyebrow="HSAKAA Observability"
        title="Intelligence"
        description="Detect recurring Personal OS patterns, inspect HSAKAA conversations, trace grounding and keep semantic retrieval healthy."
      />

      <HsakaaIntelligence />
    </main>
  );
}
