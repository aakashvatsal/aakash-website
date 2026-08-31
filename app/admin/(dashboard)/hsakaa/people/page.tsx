import Link from "next/link";
import { Network, Plus } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PeopleOpenLoopsQueue } from "@/components/admin/hsakaa/people/PeopleOpenLoopsQueue";
import { PeopleReconnectQueue } from "@/components/admin/hsakaa/people/PeopleReconnectQueue";
import { PeopleList } from "@/components/admin/hsakaa/people/PeopleList";
import {
  getMemoryPeople,
  getPeopleContactGaps,
  getPeopleOpenLoops,
} from "@/lib/api/memory-people";
import type { MemoryPerson, PersonContactGapList, PersonOpenLoopList } from "@/types/hsakaa";

export const dynamic = "force-dynamic";

export default async function PeoplePage() {
  let people: MemoryPerson[] = [];
  let openLoops: PersonOpenLoopList | null = null;
  let contactGaps: PersonContactGapList | null = null;
  let error = "";

  try {
    const [peopleResponse, openLoopsResponse, contactGapsResponse] = await Promise.all([
      getMemoryPeople({
        page: 1,
        limit: 500,
      }),
      getPeopleOpenLoops({ limit: 100 }),
      getPeopleContactGaps({ days: 60, limit: 100 }),
    ]);

    people = peopleResponse.data;
    openLoops = openLoopsResponse;
    contactGaps = contactGapsResponse;
  } catch (caughtError) {
    error =
      caughtError instanceof Error
        ? caughtError.message
        : "Unable to load people.";
  }

  return (
    <main className="space-y-8">
      <AdminPageHeader
        eyebrow="HSAKAA Identity System"
        title="People"
        description="Manage the people HSAKAA can recognise, verify and associate with person-specific memories."
        actions={
          <div className="flex flex-wrap gap-2">
            <Link
              href="/admin/hsakaa/people/graph"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] border border-white/10 px-5 text-sm font-black text-white/75 transition hover:border-[#C6FF32]/40 hover:text-white"
            >
              <Network className="h-4 w-4" />
              People graph
            </Link>
            <Link
              href="/admin/hsakaa/people/new"
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] bg-[#C6FF32] px-5 text-sm font-black text-[#030608]"
            >
              <Plus className="h-4 w-4" />
              New person
            </Link>
          </div>
        }
      />

      {openLoops ? <PeopleOpenLoopsQueue initialOpenLoops={openLoops} /> : null}

      {contactGaps ? <PeopleReconnectQueue initialContactGaps={contactGaps} /> : null}

      <PeopleList
        initialPeople={people}
        initialError={error}
      />
    </main>
  );
}