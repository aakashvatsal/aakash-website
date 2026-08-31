import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { HealthList } from "@/components/admin/health/HealthList";
import { HealthOsNav } from "@/components/admin/health-os/HealthOsNav";
import { getHealthEntries } from "@/lib/api/health";
import type { HealthEntry } from "@/types/health";

export const dynamic = "force-dynamic";

export default async function HealthPage() {
    let entries: HealthEntry[] = [];
    let error = "";

    try {
        entries = await getHealthEntries();
    } catch (caughtError) {
        error =
            caughtError instanceof Error
                ? caughtError.message
                : "Unable to load health entries.";
    }

    return (
        <main className="space-y-8">
            <AdminPageHeader
                eyebrow="Personal Health System"
                title="Health Overview"
                description="Track body measurements, sleep, recovery, workouts and daily wellbeing, with dedicated systems for diet, supplements and meditation."
            />

            <HealthOsNav />

            {error ? (
                <div className="rounded-[20px] border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm text-red-300">
                    {error}
                </div>
            ) : (
                <HealthList initialEntries={entries} />
            )}
        </main>
    );
}