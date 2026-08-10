import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { HealthForm } from "@/components/admin/health/HealthForm";

export default function NewHealthEntryPage() {
  return (
    <main className="space-y-8">
      <AdminPageHeader
        eyebrow="Admin"
        title="New Health Entry"
        description="Create a new daily health record."
      />

      <HealthForm />
    </main>
  );
}