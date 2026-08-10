import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { NowForm } from "@/components/admin/now/NowForm";
import { getNowStatus } from "@/lib/api/now";

export default async function AdminNowPage() {
  let status = null;
  let error: string | null = null;

  try {
    status = await getNowStatus();
  } catch (err) {
    error =
      err instanceof Error
        ? err.message
        : "Failed to load current status.";
  }

  console.log("status", status);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Live Status Dashboard"
        title="Now"
        description="Manage your current public status."
      />

      {error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      ) : (
        <NowForm status={status} />
      )}
    </div>
  );
}