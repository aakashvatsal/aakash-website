"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  Clock3,
  RotateCcw,
} from "lucide-react";

import { MediaPlanningDayCard } from "@/components/admin/media/MediaPlanningManager";
import { updateMediaExecution } from "@/lib/api/media";
import type {
  MediaDailyExecution,
  MediaExecutionKind,
  MediaPlatform,
  MediaTodayOverview,
} from "@/types/media";

const platformLabels: Record<MediaPlatform, string> = {
  linkedin: "LinkedIn",
  instagram: "Instagram",
  youtube: "YouTube",
  x: "X",
  facebook: "Facebook",
  threads: "Threads",
  whatsapp: "WhatsApp",
};

const completionLabels: Record<MediaExecutionKind, string> = {
  post: "Posted",
  production: "Done",
  engagement: "Done",
  manual_publish: "Published",
  analytics_review: "Reviewed",
  inbound_reply: "Handled",
};

function Pill({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-white/10 bg-white/[0.035] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white/45">
      {children}
    </span>
  );
}

function TaskMeta({ task }: { task: MediaDailyExecution }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Pill>{task.kind.replaceAll("_", " ")}</Pill>
      {task.platform ? <Pill>{platformLabels[task.platform]}</Pill> : null}
      {task.time ? (
        <span className="flex items-center gap-1 text-[11px] font-black text-[#C6FF32]">
          <Clock3 className="h-3 w-3" />
          {task.time}
        </span>
      ) : null}
    </div>
  );
}

export function MediaTodayManager({
  initialOverview,
}: {
  initialOverview: MediaTodayOverview;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>();
  const [error, setError] = useState<string>();

  const execution = initialOverview.execution;
  const doneTasks = execution.tasks.filter((task) => task.status === "done");
  const remainingTasks = execution.tasks.filter(
    (task) => !["done", "skipped", "rescheduled"].includes(task.status),
  );
  const movedTasks = execution.tasks.filter((task) =>
    ["skipped", "rescheduled"].includes(task.status),
  );
  const tomorrow = new Date(`${initialOverview.date}T12:00:00.000Z`);
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
  const tomorrowDate = tomorrow.toISOString().slice(0, 10);

  function run(action: () => Promise<unknown>, success: string) {
    setMessage(undefined);
    setError(undefined);
    startTransition(async () => {
      try {
        await action();
        setMessage(success);
        router.refresh();
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : "Media Today action failed.",
        );
      }
    });
  }

  function markDone(task: MediaDailyExecution) {
    const label = completionLabels[task.kind];
    run(
      () =>
        updateMediaExecution(task.key, {
          status: "done",
          completedCount: task.plannedCount || undefined,
        }),
      `${task.title} marked ${label.toLowerCase()}.`,
    );
  }

  return (
    <div className="space-y-6">
      {message ? (
        <div className="rounded-xl border border-[#C6FF32]/20 bg-[#C6FF32]/5 px-4 py-3 text-sm text-[#C6FF32]">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      {initialOverview.health?.degraded ? (
        <div className="rounded-xl border border-amber-300/20 bg-amber-300/5 px-4 py-3">
          <div className="flex items-center gap-2 text-sm font-black text-amber-100">
            <AlertTriangle className="h-4 w-4" /> Today is running in degraded
            mode
          </div>
          <p className="mt-1 text-xs leading-5 text-amber-100/55">
            One or more supporting Media engines could not refresh. The current
            plan is still shown below instead of hiding your work.
          </p>
          <div className="mt-2 space-y-1">
            {initialOverview.health.issues.map((issue) => (
              <div key={issue} className="text-[11px] text-amber-100/45">
                • {issue}
              </div>
            ))}
          </div>
        </div>
      ) : null}

      {initialOverview.day ? (
        <MediaPlanningDayCard day={initialOverview.day} />
      ) : (
        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <div className="text-xs font-black uppercase tracking-[0.14em] text-[#C6FF32]">
            {initialOverview.date} · {initialOverview.timezone}
          </div>
          <h2 className="mt-2 text-xl font-black text-white">
            No plan covers today
          </h2>
          <p className="mt-2 text-sm leading-6 text-white/40">
            HSAKAA has no current rolling-plan day to execute for this date.
          </p>
        </section>
      )}

      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.14em] text-[#C6FF32]">
              Execution status
            </div>
            <h2 className="mt-1 text-lg font-black text-white">
              {execution.summary.done}/{execution.summary.actionable} completed ·{" "}
              {execution.summary.completionPercent}%
            </h2>
            <p className="mt-1 max-w-3xl text-xs leading-5 text-white/35">
              For posts, Stories and Community posts, use Posted only after the
              content is actually live. HSAKAA persists the completion time so
              the day history records what you really completed.
            </p>
          </div>
        </div>

        <div className="mt-5">
          <div className="text-xs font-black uppercase tracking-[0.12em] text-white/35">
            Still to do
          </div>
          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            {remainingTasks.length ? (
              remainingTasks.map((task) => (
                <article
                  key={task.key}
                  className="rounded-xl border border-white/10 bg-black/20 p-4"
                >
                  <TaskMeta task={task} />
                  <div className="mt-2 text-sm font-bold text-white/75">
                    {task.title}
                  </div>
                  {task.instruction ? (
                    <p className="mt-1 text-xs leading-5 text-white/40">
                      {task.instruction}
                    </p>
                  ) : null}
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      disabled={isPending}
                      onClick={() => markDone(task)}
                      className="rounded-lg bg-[#C6FF32] px-2.5 py-1.5 text-[11px] font-black text-black disabled:opacity-35"
                    >
                      {completionLabels[task.kind]}
                    </button>
                    <button
                      disabled={isPending}
                      onClick={() =>
                        run(
                          () =>
                            updateMediaExecution(task.key, {
                              status: "blocked",
                            }),
                          "Media task marked blocked.",
                        )
                      }
                      className="rounded-lg border border-white/10 px-2.5 py-1.5 text-[11px] font-bold text-white/55 disabled:opacity-35"
                    >
                      Blocked
                    </button>
                    <button
                      disabled={isPending}
                      onClick={() =>
                        run(
                          () =>
                            updateMediaExecution(task.key, {
                              status: "missed",
                            }),
                          "Media task marked missed.",
                        )
                      }
                      className="rounded-lg border border-white/10 px-2.5 py-1.5 text-[11px] font-bold text-white/55 disabled:opacity-35"
                    >
                      Missed
                    </button>
                    <button
                      disabled={isPending}
                      onClick={() =>
                        run(
                          () =>
                            updateMediaExecution(task.key, {
                              status: "rescheduled",
                              rescheduledTo: tomorrowDate,
                            }),
                          `Media task moved to ${tomorrowDate}.`,
                        )
                      }
                      className="rounded-lg border border-white/10 px-2.5 py-1.5 text-[11px] font-bold text-white/55 disabled:opacity-35"
                    >
                      Tomorrow
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-xl border border-[#C6FF32]/10 bg-[#C6FF32]/[0.025] p-4 text-sm text-[#C6FF32]/75">
                Nothing is waiting on you right now.
              </div>
            )}
          </div>
        </div>

        <div className="mt-6 border-t border-white/5 pt-5">
          <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.12em] text-[#C6FF32]">
            <CheckCircle2 className="h-4 w-4" /> Done
          </div>
          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            {doneTasks.length ? (
              doneTasks.map((task) => (
                <article
                  key={task.key}
                  className="rounded-xl border border-[#C6FF32]/10 bg-[#C6FF32]/[0.025] p-4"
                >
                  <TaskMeta task={task} />
                  <div className="mt-2 text-sm font-bold text-white/65 line-through decoration-white/20">
                    {task.title}
                  </div>
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-[#C6FF32]/60">
                    <span>{completionLabels[task.kind]}</span>
                    {task.completedAt ? (
                      <span>
                        {new Date(task.completedAt).toLocaleString("en-IN", {
                          timeZone: initialOverview.timezone,
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    ) : null}
                    <button
                      disabled={isPending}
                      onClick={() =>
                        run(
                          () =>
                            updateMediaExecution(task.key, {
                              status: "pending",
                            }),
                          "Media task reopened.",
                        )
                      }
                      className="ml-auto rounded-lg border border-white/10 px-2 py-1 text-[10px] font-bold text-white/45 disabled:opacity-35"
                    >
                      <RotateCcw className="mr-1 inline h-3 w-3" /> Reopen
                    </button>
                  </div>
                </article>
              ))
            ) : (
              <p className="text-sm text-white/30">
                Completed work will move here as you mark it done.
              </p>
            )}
          </div>
        </div>

        {movedTasks.length ? (
          <details className="mt-5 border-t border-white/5 pt-4 text-xs text-white/35">
            <summary className="cursor-pointer select-none font-bold text-white/45">
              Skipped / rescheduled ({movedTasks.length})
            </summary>
            <div className="mt-3 space-y-2">
              {movedTasks.map((task) => (
                <div key={task.key} className="rounded-lg bg-white/[0.02] p-3">
                  {task.title} · {task.status}
                  {task.rescheduledTo ? ` to ${task.rescheduledTo}` : ""}
                </div>
              ))}
            </div>
          </details>
        ) : null}

        {execution.carryForward.length ? (
          <div className="mt-5 border-t border-white/5 pt-4">
            <div className="text-xs font-black uppercase tracking-[0.12em] text-amber-200/70">
              Carry forward · unresolved recent work
            </div>
            <div className="mt-3 grid gap-2 md:grid-cols-2">
              {execution.carryForward.map((task) => (
                <div
                  key={task.key}
                  className="rounded-xl border border-amber-300/10 bg-amber-300/[0.035] p-3"
                >
                  <TaskMeta task={task} />
                  <div className="mt-2 text-xs font-bold text-amber-50/75">
                    {task.title}
                  </div>
                  <div className="mt-2 flex gap-2">
                    <button
                      disabled={isPending}
                      onClick={() => markDone(task)}
                      className="rounded-lg bg-amber-200 px-2 py-1 text-[10px] font-black text-black disabled:opacity-35"
                    >
                      {completionLabels[task.kind]}
                    </button>
                    <button
                      disabled={isPending}
                      onClick={() =>
                        run(
                          () =>
                            updateMediaExecution(task.key, {
                              status: "rescheduled",
                              rescheduledTo: tomorrowDate,
                            }),
                          `Carry-forward task moved to ${tomorrowDate}.`,
                        )
                      }
                      className="rounded-lg border border-amber-200/20 px-2 py-1 text-[10px] font-bold text-amber-100/65 disabled:opacity-35"
                    >
                      Tomorrow
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    </div>
  );
}
