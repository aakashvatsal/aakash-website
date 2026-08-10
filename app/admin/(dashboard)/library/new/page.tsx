import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { LibraryForm } from "@/components/admin/library/LibraryForm";

export default function NewLibraryItemPage() {
  return (
    <div>
      <AdminPageHeader
        eyebrow="Library"
        title="Add item"
        description="Add a book, article, paper, podcast, video, course or personal note."
      />

      <div className="mt-8">
        <LibraryForm />
      </div>
    </div>
  );
}