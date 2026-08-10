import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MemoryDetails } from "@/components/admin/hsakaa/memory/MemoryDetails";
import { getMemory } from "@/lib/api/memory";
import type { Memory } from "@/types/hsakaa";

export const dynamic = "force-dynamic";

type MemoryDetailsPageProps = {
  params: Promise<{
    memoryId: string;
  }>;
};

export default async function MemoryDetailsPage({
  params,
}: MemoryDetailsPageProps) {
  const { memoryId } = await params;

  let memory: Memory | null = null;
  let error = "";

  try {
    memory = await getMemory(memoryId);
  } catch (caughtError) {
    error =
      caughtError instanceof Error
        ? caughtError.message
        : "Unable to load memory.";
  }

  if (!memory && !error) {
    notFound();
  }

  if (error || !memory) {
    return (
      <main className="space-y-8">
        <AdminPageHeader
          eyebrow="HSAKAA Knowledge System"
          title="Memory Details"
          description="Review the complete memory record and retrieval configuration."
        />

        <section className="rounded-[24px] border border-red-400/20 bg-red-400/[0.06] p-5">
          <p className="font-bold text-red-100">
            Unable to load memory
          </p>

          <p className="mt-2 text-sm leading-6 text-red-100/60">
            {error ||
              "The requested memory was not found."}
          </p>
        </section>
      </main>
    );
  }

  return (
    <main className="space-y-8">
      <AdminPageHeader
        eyebrow="HSAKAA Knowledge System"
        title="Memory Details"
        description="Review this memory's content, scope, classification and retrieval settings."
        actions={
          <Link
            href={`/admin/hsakaa/memory/${memory._id}/edit`}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] bg-[#C6FF32] px-5 text-sm font-black text-[#030608]"
          >
            <Pencil className="h-4 w-4" />
            Edit memory
          </Link>
        }
      />

      <MemoryDetails initialMemory={memory} />
    </main>
  );
}