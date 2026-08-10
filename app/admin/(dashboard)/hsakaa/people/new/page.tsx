import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MemoryPersonForm } from "@/components/admin/hsakaa/people/MemoryPersonForm";

export const dynamic = "force-dynamic";

export default function NewMemoryPersonPage() {
  return (
    <main className="space-y-8">
      <AdminPageHeader
        eyebrow="HSAKAA Identity System"
        title="New Person"
        description="Create a person HSAKAA can recognise and associate with verified, person-specific memories."
      />

      <MemoryPersonForm mode="create" />
    </main>
  );
}