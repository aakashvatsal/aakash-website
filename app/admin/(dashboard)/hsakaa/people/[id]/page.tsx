import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MemoryPersonDetails } from "@/components/admin/hsakaa/people/MemoryPersonDetails";
import { PersonConnections } from "@/components/admin/hsakaa/people/PersonConnections";
import { PersonOpenLoops } from "@/components/admin/hsakaa/people/PersonOpenLoops";
import { PersonRelationshipContext } from "@/components/admin/hsakaa/people/PersonRelationshipContext";
import { PersonTimeline } from "@/components/admin/hsakaa/people/PersonTimeline";
import { getMemories } from "@/lib/api/memory";
import {
  getMemoryPeople,
  getMemoryPerson,
  getPersonGraph,
  getPersonOpenLoops,
  getPersonRelationshipContext,
  getPersonTimeline,
} from "@/lib/api/memory-people";
import type {
  Memory,
  MemoryPerson,
  PersonGraphDetail,
  PersonOpenLoopList,
  PersonRelationshipContext as PersonRelationshipContextData,
  PersonTimeline as PersonTimelineData,
} from "@/types/hsakaa";

export const dynamic = "force-dynamic";

type MemoryPersonDetailsPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function MemoryPersonDetailsPage({
  params,
}: MemoryPersonDetailsPageProps) {
  const { id: personId } = await params;

  let person: MemoryPerson | null = null;
  let memories: Memory[] = [];
  let people: MemoryPerson[] = [];
  let graph: PersonGraphDetail | null = null;
  let openLoops: PersonOpenLoopList | null = null;
  let relationshipContext: PersonRelationshipContextData | null = null;
  let timeline: PersonTimelineData | null = null;
  let error = "";

  try {
    const [
      personResponse,
      memoryResponse,
      peopleResponse,
      graphResponse,
      openLoopsResponse,
      relationshipContextResponse,
      timelineResponse,
    ] =
      await Promise.all([
        getMemoryPerson(personId),
        getMemories({
          subjectPersonId: personId,
          page: 1,
          limit: 100,
        }),
        getMemoryPeople({ page: 1, limit: 500, isActive: true }),
        getPersonGraph(personId),
        getPersonOpenLoops(personId, { limit: 200 }),
        getPersonRelationshipContext(personId),
        getPersonTimeline(personId, { limit: 200 }),
      ]);

    person = personResponse;
    memories = memoryResponse.data;
    people = peopleResponse.data;
    graph = graphResponse;
    openLoops = openLoopsResponse;
    relationshipContext = relationshipContextResponse;
    timeline = timelineResponse;
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

      {relationshipContext ? (
        <PersonRelationshipContext
          personId={person._id}
          displayName={displayName}
          initialContext={relationshipContext}
          initialPeople={people}
        />
      ) : null}

      {graph ? (
        <PersonConnections
          personId={person._id}
          displayName={displayName}
          initialGraph={graph}
          initialPeople={people}
        />
      ) : null}

      {openLoops ? (
        <PersonOpenLoops
          personId={person._id}
          displayName={displayName}
          initialOpenLoops={openLoops}
        />
      ) : null}

      {timeline ? (
        <PersonTimeline
          personId={person._id}
          displayName={displayName}
          initialTimeline={timeline}
          initialPeople={people}
          initialMemories={memories}
        />
      ) : null}
    </main>
  );
}