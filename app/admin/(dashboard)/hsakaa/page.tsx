import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { HsakaaOverview } from "@/components/admin/hsakaa/HsakaaOverview";
import { getMemories } from "@/lib/api/memory";
import { getMemoryPeople } from "@/lib/api/memory-people";
import type {
  Memory,
  MemoryPerson,
} from "@/types/hsakaa";

export const dynamic = "force-dynamic";

export default async function HsakaaPage() {
  let memories: Memory[] = [];
  let people: MemoryPerson[] = [];
  let error = "";

  try {
    const [
      memoryResponse,
      peopleResponse,
    ] = await Promise.all([
      getMemories(),
      getMemoryPeople(),
    ]);

    memories = memoryResponse.data;
    people = peopleResponse.data;
  } catch (caughtError) {
    error =
      caughtError instanceof Error
        ? caughtError.message
        : "Unable to load HSAKAA information.";
  }

  return (
    <main className="space-y-8">
      <AdminPageHeader
        eyebrow="AI Memory Operating System"
        title="HSAKAA"
        description="Manage the people and memories that shape how HSAKAA understands, represents and responds as you."
      />

      <HsakaaOverview
        initialMemories={memories}
        initialPeople={people}
        initialError={error}
      />
    </main>
  );
}