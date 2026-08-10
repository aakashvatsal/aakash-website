import Link from "next/link";
import { Plus } from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { HealthList } from "@/components/admin/health/HealthList";
import { getHealthEntries } from "@/lib/api/health";

export const dynamic = "force-dynamic";

export default async function HealthPage() {
    let entries: any = [];
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
                title="Health"
                description="Track body measurements, sleep, recovery, workouts, nutrition and daily wellbeing."
                // actions={
                //     <Link
                //         href="/admin/health/new"
                //         className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] bg-[#C6FF32] px-5 text-sm font-black text-[#030608]"
                //     >
                //         <Plus className="h-4 w-4" />
                //         New entry
                //     </Link>
                // }
            />

            <HealthList initialEntries={entries} />
        </main>
    );
}