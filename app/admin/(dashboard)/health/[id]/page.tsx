import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { HealthForm } from "@/components/admin/health/HealthForm";

import { getHealthEntry } from "@/lib/api/health";

type Props = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditHealthEntryPage({
  params,
}: Props) {
  const { id } = await params;

  try {
    const entry = await getHealthEntry(id);

    if (!entry) {
      notFound();
    }

    return (
      <main className="space-y-8">
        <AdminPageHeader
          eyebrow="Admin"
          title="Edit Health Entry"
          description="Update your daily health record."
        />

        <HealthForm entry={entry} />
      </main>
    );
  } catch {
    notFound();
  }
}