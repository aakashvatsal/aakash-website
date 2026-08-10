import { notFound } from "next/navigation";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MemoryForm } from "@/components/admin/hsakaa/memory/MemoryForm";
import { getMemory } from "@/lib/api/memory";
import { getMemoryPeople } from "@/lib/api/memory-people";
import type {
  Memory,
  MemoryPerson,
} from "@/types/hsakaa";

export const dynamic = "force-dynamic";

type EditMemoryPageProps = {
  params: Promise<{
    memoryId: string;
  }>;
};

export default async function EditMemoryPage({
  params,
}: EditMemoryPageProps) {
  const { memoryId } = await params;

  let memory: Memory | null = null;
  let people: MemoryPerson[] = [];
  let error = "";

  try {
    const [
      memoryResponse,
      peopleResponse,
    ] = await Promise.all([
      getMemory(memoryId),

      getMemoryPeople({
        page: 1,
        limit: 500,
      }),
    ]);

    memory = memoryResponse;
    people = peopleResponse.data;
  } catch (caughtError) {
    error =
      caughtError instanceof Error
        ? caughtError.message
        : "Unable to load memory.";
  }

  if (!memory && !error) {
    notFound();
  }

  return (
    <main className="space-y-8">
      <AdminPageHeader
        eyebrow="HSAKAA Knowledge System"
        title="Edit Memory"
        description="Update this memory's content, visibility, classification and retrieval settings."
      />

      {error || !memory ? (
        <section className="rounded-[24px] border border-red-400/20 bg-red-400/[0.06] p-5">
          <p className="font-bold text-red-100">
            Unable to load memory
          </p>

          <p className="mt-2 text-sm leading-6 text-red-100/60">
            {error ||
              "The requested memory was not found."}
          </p>
        </section>
      ) : (
        <MemoryForm
          mode="edit"
          initialData={memory}
          people={people}
        />
      )}
    </main>
  );
}