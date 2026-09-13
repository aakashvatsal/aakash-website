import Link from "next/link";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { getMediaPlanningArchive } from "@/lib/api/media";

const platformLabels: Record<string, string> = {
  linkedin: "LinkedIn",
  instagram: "Instagram",
  youtube: "YouTube",
  x: "X",
  whatsapp: "WhatsApp",
};

function labelPlatform(platform: string) {
  return platformLabels[platform] ?? platform;
}

export default async function MediaPlanningArchivePage() {
  const archive = await getMediaPlanningArchive(180);

  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Media · Rolling Plan History"
        title="Plan Archive"
        description="Past rolling-plan days from 7 September 2026 onward. Completion comes from Media daily execution tasks; publication status only counts an actual Media publication record."
        actions={
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/media/plan"
              className="rounded-xl bg-[#C6FF32] px-4 py-2 text-sm font-black text-black"
            >
              7-Day Plan
            </Link>
            <Link
              href="/admin/media/today"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white/65"
            >
              Today
            </Link>
          </div>
        }
      />

      <section className="rounded-[24px] border border-white/10 bg-white/[0.02] p-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.16em] text-[#C6FF32]">
              Historical execution record
            </div>
            <h2 className="mt-2 text-xl font-black text-white">
              Planned → completed → actually published
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">
              Marking a Media task done does not automatically mean it was
              published. This archive keeps those states separate so HSAKAA can
              learn from what was planned, what you completed and what really
              went live.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2 text-xs font-bold text-white/55">
            {archive.length} archived day{archive.length === 1 ? "" : "s"}
          </div>
        </div>
      </section>

      {archive.length ? (
        <div className="space-y-4">
          {archive.map((item) => {
            const planned = item.publication.plannedPlatforms;
            const published = new Set(item.publication.publishedPlatforms);
            return (
              <article
                key={`${item.date}:${item.planId}`}
                className="rounded-[24px] border border-white/10 bg-white/[0.02] p-5"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="text-xs font-black uppercase tracking-[0.14em] text-[#C6FF32]">
                      {item.date}
                    </div>
                    <h2 className="mt-2 text-lg font-black text-white">
                      {item.day.theme || "Archived Media day"}
                    </h2>
                    <p className="mt-1 text-sm text-white/45">
                      {item.day.workload || "No workload note"}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-center sm:grid-cols-3">
                    <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                      <div className="text-lg font-black text-white">
                        {item.completion.completionPercent}%
                      </div>
                      <div className="text-[10px] font-bold uppercase tracking-wide text-white/40">
                        task completion
                      </div>
                    </div>
                    <div className="rounded-xl border border-white/10 bg-black/20 px-3 py-2">
                      <div className="text-lg font-black text-white">
                        {item.completion.done}/{item.completion.actionable}
                      </div>
                      <div className="text-[10px] font-bold uppercase tracking-wide text-white/40">
                        tasks done
                      </div>
                    </div>
                    <div className="col-span-2 rounded-xl border border-white/10 bg-black/20 px-3 py-2 sm:col-span-1">
                      <div className="text-lg font-black text-white">
                        {item.publication.publishedCount}
                      </div>
                      <div className="text-[10px] font-bold uppercase tracking-wide text-white/40">
                        publications
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 grid gap-4 lg:grid-cols-[1.2fr_1fr]">
                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="text-xs font-black uppercase tracking-[0.12em] text-white/45">
                      Planned platform posts
                    </div>
                    {planned.length ? (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {planned.map((platform) => {
                          const didPublish = published.has(platform);
                          return (
                            <span
                              key={platform}
                              className={`rounded-full border px-3 py-1.5 text-xs font-bold ${
                                didPublish
                                  ? "border-[#C6FF32]/25 bg-[#C6FF32]/10 text-[#C6FF32]"
                                  : "border-white/10 bg-white/[0.03] text-white/45"
                              }`}
                            >
                              {labelPlatform(platform)} ·{" "}
                              {didPublish
                                ? "published"
                                : "not recorded as published"}
                            </span>
                          );
                        })}
                      </div>
                    ) : (
                      <p className="mt-3 text-sm text-white/40">
                        No feed publication was planned for this day.
                      </p>
                    )}
                  </div>

                  <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
                    <div className="text-xs font-black uppercase tracking-[0.12em] text-white/45">
                      Task-state record
                    </div>
                    <div className="mt-3 flex flex-wrap gap-2">
                      {Object.entries(item.completion.statuses)
                        .filter(([, count]) => count > 0)
                        .map(([status, count]) => (
                          <span
                            key={status}
                            className="rounded-full border border-white/10 bg-white/[0.03] px-3 py-1.5 text-xs font-bold text-white/55"
                          >
                            {status} · {count}
                          </span>
                        ))}
                      {!item.completion.total ? (
                        <span className="text-sm text-white/40">
                          No execution-task state was recorded.
                        </span>
                      ) : null}
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      ) : (
        <section className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.015] p-8 text-center">
          <h2 className="text-lg font-black text-white">
            No archived days yet
          </h2>
          <p className="mt-2 text-sm text-white/45">
            The archive begins with the fresh rolling plan on 7 September 2026.
            Once a day falls behind today, it will appear here automatically.
          </p>
        </section>
      )}
    </div>
  );
}
