import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PeopleGraphExplorer } from "@/components/admin/hsakaa/people/PeopleGraphExplorer";
import { getMemoryPeople, getPeopleGraphOverview } from "@/lib/api/memory-people";
import type { MemoryPerson, PersonGraphOverview } from "@/types/hsakaa";

export const dynamic = "force-dynamic";

export default async function PeopleGraphPage() {
  let overview: PersonGraphOverview | null = null;
  let people: MemoryPerson[] = [];
  let error = "";

  try {
    const [overviewResponse, peopleResponse] = await Promise.all([
      getPeopleGraphOverview({ limit: 150 }),
      getMemoryPeople({ page: 1, limit: 500, isActive: true }),
    ]);
    overview = overviewResponse;
    people = peopleResponse.data;
  } catch (caughtError) {
    error =
      caughtError instanceof Error
        ? caughtError.message
        : "Unable to load People Graph.";
  }

  return (
    <main className="space-y-8">
      <AdminPageHeader
        eyebrow="HSAKAA · Phase 5E"
        title="People Graph"
        description="Map explicit and deterministic relationships between saved people, inspect mutual connections, and trace how two people are connected."
        actions={
          <Link
            href="/admin/hsakaa/people"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] border border-white/10 px-5 text-sm font-black text-white/75"
          >
            <ArrowLeft className="h-4 w-4" />
            People
          </Link>
        }
      />

      {overview ? (
        <PeopleGraphExplorer initialOverview={overview} initialPeople={people} />
      ) : (
        <section className="rounded-[24px] border border-red-400/20 bg-red-400/[0.06] p-5">
          <p className="font-bold text-red-100">Unable to load People Graph</p>
          <p className="mt-2 text-sm leading-6 text-red-100/60">
            {error || "The People Graph response was unavailable."}
          </p>
        </section>
      )}
    </main>
  );
}
