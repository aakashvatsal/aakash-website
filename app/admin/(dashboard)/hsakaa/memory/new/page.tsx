import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MemoryForm } from "@/components/admin/hsakaa/memory/MemoryForm";
import { getMemoryPeople } from "@/lib/api/memory-people";
import type { MemoryPerson } from "@/types/hsakaa";

export const dynamic = "force-dynamic";

export default async function NewMemoryPage() {
  let people: MemoryPerson[] = [];
  let error = "";

  try {
    const response =
      await getMemoryPeople({
        page: 1,
        limit: 500,
        isActive: true,
        isArchived: false,
      });

    people = response.data;
  } catch (caughtError) {
    error =
      caughtError instanceof Error
        ? caughtError.message
        : "Unable to load people.";
  }

  return (
    <main className="space-y-8">
      <AdminPageHeader
        eyebrow="HSAKAA Knowledge System"
        title="New Memory"
        description="Store a clear global or person-specific memory that HSAKAA can use while representing you."
      />

      {error ? (
        <section className="rounded-[20px] border border-amber-300/20 bg-amber-300/[0.06] p-4 text-sm leading-6 text-amber-100">
          People could not be loaded. You can
          still create a global memory.{" "}
          {error}
        </section>
      ) : null}

      <MemoryForm
        mode="create"
        people={people}
      />
    </main>
  );
}