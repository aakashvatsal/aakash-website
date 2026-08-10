import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

export default async function AdminSettingsPage() {
  let error: string | null = null;

  try {
    // Load settings here later when required.
  } catch (err) {
    error =
      err instanceof Error
        ? err.message
        : "Failed to load settings.";
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        eyebrow="Admin"
        title="Settings"
        description="Manage application and personal system settings."
      />

      {error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-300">
          {error}
        </div>
      ) : (
        <div className="rounded-[24px] border border-white/10 bg-white/[0.025] p-6">
          <p className="text-sm text-white/45">
            Settings will be available here.
          </p>
        </div>
      )}
    </div>
  );
}