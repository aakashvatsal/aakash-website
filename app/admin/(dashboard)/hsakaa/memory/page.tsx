import Link from "next/link";
import { Plus } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MemoryInbox } from "@/components/admin/hsakaa/memory/MemoryInbox";
import { MemoryList } from "@/components/admin/hsakaa/memory/MemoryList";
import { MemoryRecallInspector } from "@/components/admin/hsakaa/memory/MemoryRecallInspector";
import { MemoryReview } from "@/components/admin/hsakaa/memory/MemoryReview";
import { DailyContextWorkspace } from "@/components/admin/hsakaa/memory/DailyContextWorkspace";
import { getMemories, getMemoryInbox } from "@/lib/api/memory";
import { getMemoryPeople } from "@/lib/api/memory-people";
import {
  MemoryInboxStatus,
  type Memory,
  type MemoryInboxItem,
  type MemoryPerson,
} from "@/types/hsakaa";

export const dynamic = "force-dynamic";

type MemoryPageProps = {
  searchParams: Promise<{ personId?: string }>;
};

export default async function MemoryPage({ searchParams }: MemoryPageProps) {
  const { personId = "" } = await searchParams;
  let memories: Memory[] = [];
  let inboxItems: MemoryInboxItem[] = [];
  let people: MemoryPerson[] = [];
  let pendingInboxCount = 0;
  let error = "";
  let inboxError = "";

  const [memoryResult, inboxResult, peopleResult] = await Promise.allSettled([
    getMemories({
      page: 1,
      limit: 100,
      includeHistorical: true,
    }),
    getMemoryInbox({
      page: 1,
      limit: 50,
      status: MemoryInboxStatus.PENDING,
    }),
    getMemoryPeople({
      page: 1,
      limit: 100,
      isArchived: false,
    }),
  ]);

  if (memoryResult.status === "fulfilled") {
    memories = Array.isArray(memoryResult.value.data)
      ? memoryResult.value.data
      : [];
  } else {
    error =
      memoryResult.reason instanceof Error
        ? memoryResult.reason.message
        : "Unable to load memories.";
  }

  if (inboxResult.status === "fulfilled") {
    inboxItems = Array.isArray(inboxResult.value.data)
      ? inboxResult.value.data
      : [];
    pendingInboxCount =
      typeof inboxResult.value.pendingCount === "number"
        ? inboxResult.value.pendingCount
        : inboxItems.length;
  } else {
    inboxError =
      inboxResult.reason instanceof Error
        ? inboxResult.reason.message
        : "Unable to load the Memory Inbox.";
  }


  if (peopleResult.status === "fulfilled") {
    people = Array.isArray(peopleResult.value.data)
      ? peopleResult.value.data
      : [];
  }

  return (
    <main className="space-y-8">
      <AdminPageHeader
        eyebrow="HSAKAA Knowledge System"
        title="Memory"
        description="Store and manage everything HSAKAA should remember while representing you."
        actions={
          <Link
            href="/admin/hsakaa/memory#memory-inbox"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] bg-[#C6FF32] px-5 text-sm font-black text-[#030608]"
          >
            <Plus className="h-4 w-4" />
            Capture memory
          </Link>
        }
      />

      <MemoryInbox
        initialItems={inboxItems}
        initialPendingCount={pendingInboxCount}
        initialError={inboxError}
        people={people}
        initialPersonId={
          people.some((person) => person._id === personId) ? personId : ""
        }
      />

      <DailyContextWorkspace />

      <MemoryReview />

      <MemoryRecallInspector />

      <MemoryList
        initialMemories={memories}
        initialError={error}
      />
    </main>
  );
}