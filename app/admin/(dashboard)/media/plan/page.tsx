import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { MediaPlanningPageClient } from "@/components/admin/media/MediaPlanningPageClient";

export default function MediaPlanningPage() {
  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Media V3.11 · Publish-Ready Planning"
        title="7-Day Plan"
        description="Today + the next 6 days in one execution-ready Media workspace. Today uses the same full plan as day 1, while the Today screen remains the focused operating checklist; advanced engines work underneath rather than becoming extra manual steps."
        actions={
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/media/today"
              className="rounded-xl bg-[#C6FF32] px-4 py-2 text-sm font-black text-black"
            >
              Today
            </Link>
            <Link
              href="/admin/media/production"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white/65"
            >
              Create / Production
            </Link>
            <Link
              href="/admin/media/system"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white/65"
            >
              Advanced
            </Link>
          </div>
        }
      />
      <MediaPlanningPageClient />
    </div>
  );
}
