import Link from "next/link";
import { Plus } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MemoryList } from "@/components/admin/hsakaa/memory/MemoryList";
import { getMemories } from "@/lib/api/memory";
import type { Memory } from "@/types/hsakaa";

export const dynamic = "force-dynamic";

export default async function MemoryPage() {
  let memories: Memory[] = [];
  let error = "";

  try {
    const response = await getMemories({
      page: 1,
      limit: 100,
    });

    memories = response.data;
  } catch (caughtError) {
    error =
      caughtError instanceof Error
        ? caughtError.message
        : "Unable to load memories.";
  }

  return (
    <main className="space-y-8">
      <AdminPageHeader
        eyebrow="HSAKAA Knowledge System"
        title="Memory"
        description="Store and manage everything HSAKAA should remember while representing you."
        actions={
          <Link
            href="/admin/hsakaa/memory/new"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] bg-[#C6FF32] px-5 text-sm font-black text-[#030608]"
          >
            <Plus className="h-4 w-4" />
            New memory
          </Link>
        }
      />

      <MemoryList
        initialMemories={memories}
        initialError={error}
      />
    </main>
  );
}