import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MemoryPersonForm } from "@/components/admin/hsakaa/people/MemoryPersonForm";
import { getMemoryPerson } from "@/lib/api/memory-people";
import type { MemoryPerson } from "@/types/hsakaa";

export const dynamic = "force-dynamic";

type EditMemoryPersonPageProps = {
  params: Promise<{
    personId: string;
  }>;
};

export default async function EditMemoryPersonPage({
  params,
}: EditMemoryPersonPageProps) {
  const { personId } = await params;

  let person: MemoryPerson | null = null;
  let error = "";

  try {
    person =
      await getMemoryPerson(personId);
  } catch (caughtError) {
    error =
      caughtError instanceof Error
        ? caughtError.message
        : "Unable to load person.";
  }

  if (!person && !error) {
    notFound();
  }

  return (
    <main className="space-y-8">
      <AdminPageHeader
        eyebrow="HSAKAA Identity System"
        title="Edit Person"
        description="Update this person's identity, contact information, relationship and memory access settings."
      />

      {error || !person ? (
        <section className="rounded-[24px] border border-red-400/20 bg-red-400/[0.06] p-5">
          <p className="font-bold text-red-100">
            Unable to load person
          </p>

          <p className="mt-2 text-sm leading-6 text-red-100/60">
            {error ||
              "The requested person was not found."}
          </p>
        </section>
      ) : (
        <MemoryPersonForm
          mode="edit"
          initialData={person}
        />
      )}
    </main>
  );
}