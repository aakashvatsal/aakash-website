import Link from "next/link";
import { Plus } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PeopleList } from "@/components/admin/hsakaa/people/PeopleList";
import { getMemoryPeople } from "@/lib/api/memory-people";
import type { MemoryPerson } from "@/types/hsakaa";

export const dynamic = "force-dynamic";

export default async function PeoplePage() {
  let people: MemoryPerson[] = [];
  let error = "";

  try {
    const response = await getMemoryPeople({
      page: 1,
      limit: 500,
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
        eyebrow="HSAKAA Identity System"
        title="People"
        description="Manage the people HSAKAA can recognise, verify and associate with person-specific memories."
        actions={
          <Link
            href="/admin/hsakaa/people/new"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] bg-[#C6FF32] px-5 text-sm font-black text-[#030608]"
          >
            <Plus className="h-4 w-4" />
            New person
          </Link>
        }
      />

      <PeopleList
        initialPeople={people}
        initialError={error}
      />
    </main>
  );
}