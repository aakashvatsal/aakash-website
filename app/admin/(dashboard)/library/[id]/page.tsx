import { notFound } from "next/navigation";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { LibraryForm } from "@/components/admin/library/LibraryForm";
import { getLibraryItem } from "@/lib/api/library";

type EditLibraryItemPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export const dynamic = "force-dynamic";

export default async function EditLibraryItemPage({
  params,
}: EditLibraryItemPageProps) {
  const { id } = await params;

  let item;

  try {
    item = await getLibraryItem(id);
  } catch {
    notFound();
  }

  return (
    <div>
      <AdminPageHeader
        eyebrow="Library"
        title="Edit item"
        description="Update metadata, progress, notes, quotes and takeaways."
      />

      <div className="mt-8">
        <LibraryForm item={item} />
      </div>
    </div>
  );
}