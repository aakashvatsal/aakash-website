import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { BrainDumpManager } from "@/components/admin/brain-dump/BrainDumpManager";
import { getBrainDump, getBrainDumpSummary } from "@/lib/api/personal-os";

export const dynamic = "force-dynamic";

export default async function BrainDumpPage() {
  try {
    const [items, summary] = await Promise.all([getBrainDump(), getBrainDumpSummary()]);
    return (
      <main className="space-y-8">
        <AdminPageHeader eyebrow="Personal OS" title="Brain Dump" description="Capture thoughts with zero friction, then turn the useful ones into tasks, journal entries or memory when you are ready." />
        <BrainDumpManager initialItems={items.data} initialSummary={summary} />
      </main>
    );
  } catch (error) {
    return <main className="space-y-8"><AdminPageHeader eyebrow="Personal OS" title="Brain Dump" description="Your capture inbox." /><div className="rounded-[24px] border border-red-400/20 bg-red-400/10 p-6 text-sm text-red-200">{error instanceof Error ? error.message : "Unable to load Brain Dump."}</div></main>;
  }
}
