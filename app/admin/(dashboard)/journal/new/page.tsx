import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { JournalForm } from "@/components/admin/journal/JournalForm";

export default function NewJournalEntryPage() {
  return (
    <div>
      <AdminPageHeader
        eyebrow="Journal"
        title="New entry"
        description="Capture your thoughts, decisions, mood, habits and daily progress."
      />

      <div className="mt-8">
        <JournalForm />
      </div>
    </div>
  );
}