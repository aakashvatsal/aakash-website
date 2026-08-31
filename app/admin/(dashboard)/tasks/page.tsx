import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { TaskManager } from "@/components/admin/tasks/TaskManager";
import { getTasks, getTaskSummary } from "@/lib/api/personal-os";

export const dynamic = "force-dynamic";

export default async function TasksPage() {
  try {
    const [tasks, summary] = await Promise.all([getTasks(), getTaskSummary()]);
    return (
      <main className="space-y-8">
        <AdminPageHeader eyebrow="Personal OS" title="Tasks" description="Turn intentions into clear next actions, keep due work visible, and close the loop without carrying it in your head." />
        <TaskManager initialTasks={tasks.data} initialSummary={summary} />
      </main>
    );
  } catch (error) {
    return (
      <main className="space-y-8">
        <AdminPageHeader eyebrow="Personal OS" title="Tasks" description="Your action layer." />
        <div className="rounded-[24px] border border-red-400/20 bg-red-400/10 p-6 text-sm text-red-200">{error instanceof Error ? error.message : "Unable to load Tasks."}</div>
      </main>
    );
  }
}
