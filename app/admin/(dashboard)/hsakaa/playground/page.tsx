import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { HsakaaPlayground } from "@/components/admin/hsakaa/playground/HsakaaPlayground";
import { getMemories } from "@/lib/api/memory";
import { getMemoryPeople } from "@/lib/api/memory-people";
import type {
  Memory,
  MemoryPerson,
} from "@/types/hsakaa";

export const dynamic = "force-dynamic";

export default async function HsakaaPlaygroundPage() {
  let memories: Memory[] = [];
  let people: MemoryPerson[] = [];
  let error = "";

  try {
    const [
      memoriesResponse,
      peopleResponse,
    ] = await Promise.all([
      getMemories({
        page: 1,
        limit: 1000,
        isActive: true,
        isArchived: false,
      }),

      getMemoryPeople({
        page: 1,
        limit: 500,
        isActive: true,
        isArchived: false,
      }),
    ]);

    memories = memoriesResponse.data;
    people = peopleResponse.data;
  } catch (caughtError) {
    error =
      caughtError instanceof Error
        ? caughtError.message
        : "Unable to load HSAKAA playground.";
  }

  return (
    <main className="space-y-8">
      <AdminPageHeader
        eyebrow="HSAKAA Testing System"
        title="Playground"
        description="Simulate public and person-specific conversations, inspect eligible memories and validate the context HSAKAA will receive."
      />

      <HsakaaPlayground
        initialMemories={memories}
        initialPeople={people}
        initialError={error}
      />
    </main>
  );
}