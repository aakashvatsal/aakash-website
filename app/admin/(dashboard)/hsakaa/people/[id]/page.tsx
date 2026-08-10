import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MemoryPersonDetails } from "@/components/admin/hsakaa/people/MemoryPersonDetails";
import { getMemories } from "@/lib/api/memory";
import { getMemoryPerson } from "@/lib/api/memory-people";
import type {
  Memory,
  MemoryPerson,
} from "@/types/hsakaa";

export const dynamic = "force-dynamic";

type MemoryPersonDetailsPageProps = {
  params: Promise<{
    personId: string;
  }>;
};

export default async function MemoryPersonDetailsPage({
  params,
}: MemoryPersonDetailsPageProps) {
  const { personId } = await params;

  let person: MemoryPerson | null = null;
  let memories: Memory[] = [];
  let error = "";

  try {
    const [
      personResponse,
      memoryResponse,
    ] = await Promise.all([
      getMemoryPerson(personId),

      getMemories({
        personId,
        page: 1,
        limit: 500,
      }),
    ]);

    person = personResponse;
    memories = memoryResponse.data;
  } catch (caughtError) {
    error =
      caughtError instanceof Error
        ? caughtError.message
        : "Unable to load person details.";
  }

  if (!person && !error) {
    notFound();
  }

  if (error || !person) {
    return (
      <main className="space-y-8">
        <AdminPageHeader
          eyebrow="HSAKAA Identity System"
          title="Person Details"
          description="Review identity information and person-specific memories."
        />

        <section className="rounded-[24px] border border-red-400/20 bg-red-400/[0.06] p-5">
          <p className="font-bold text-red-100">
            Unable to load person
          </p>

          <p className="mt-2 text-sm leading-6 text-red-100/60">
            {error ||
              "The requested person was not found."}
          </p>
        </section>
      </main>
    );
  }

  const displayName =
    person.preferredName ?? person.name;

  return (
    <main className="space-y-8">
      <AdminPageHeader
        eyebrow="HSAKAA Identity System"
        title={displayName}
        description="Review this person's identity, verification status, memory access and linked memories."
        actions={
          <Link
            href={`/admin/hsakaa/people/${person._id}/edit`}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] bg-[#C6FF32] px-5 text-sm font-black text-[#030608]"
          >
            <Pencil className="h-4 w-4" />
            Edit person
          </Link>
        }
      />

      <MemoryPersonDetails
        initialPerson={person}
        initialMemories={memories}
      />
    </main>
  );
}