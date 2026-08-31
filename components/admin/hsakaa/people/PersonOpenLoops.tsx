"use client";

import {
  CalendarClock,
  CheckCircle2,
  CircleAlert,
  Pencil,
  Plus,
  RotateCcw,
  XCircle,
} from "lucide-react";
import { FormEvent, useMemo, useState } from "react";

import {
  createPersonOpenLoop,
  dismissPersonOpenLoop,
  getPersonOpenLoops,
  reopenPersonOpenLoop,
  resolvePersonOpenLoop,
  updatePersonOpenLoop,
} from "@/lib/api/memory-people";
import {
  PersonOpenLoopKind,
  PersonOpenLoopStatus,
  type PersonOpenLoop,
  type PersonOpenLoopList,
} from "@/types/hsakaa";

type PersonOpenLoopsProps = {
  personId: string;
  displayName: string;
  initialOpenLoops: PersonOpenLoopList;
};

type StatusFilter = "all" | PersonOpenLoopStatus;

const kindOptions: Array<{
  value: PersonOpenLoopKind;
  label: string;
}> = [
  { value: PersonOpenLoopKind.FOLLOW_UP, label: "Follow-up" },
  { value: PersonOpenLoopKind.PROMISE_I_MADE, label: "Promise I made" },
  { value: PersonOpenLoopKind.PROMISE_THEY_MADE, label: "Promise they made" },
  { value: PersonOpenLoopKind.UNANSWERED_QUESTION, label: "Unanswered question" },
  { value: PersonOpenLoopKind.PENDING_INTRODUCTION, label: "Pending introduction" },
  { value: PersonOpenLoopKind.MEETING_TO_SCHEDULE, label: "Meeting to schedule" },
  { value: PersonOpenLoopKind.THING_TO_ASK, label: "Thing to ask" },
  { value: PersonOpenLoopKind.OTHER, label: "Other" },
];

function formatEnum(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatDate(value?: string) {
  if (!value) {
    return "No due date";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "No due date";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function toDateTimeLocal(value?: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset = date.getTimezoneOffset() * 60_000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 16);
}

function isOverdue(loop: PersonOpenLoop) {
  if (loop.status !== PersonOpenLoopStatus.OPEN || !loop.dueAt) {
    return false;
  }

  const dueAt = new Date(loop.dueAt).getTime();
  return Number.isFinite(dueAt) && dueAt < Date.now();
}

export function PersonOpenLoops({
  personId,
  displayName,
  initialOpenLoops,
}: PersonOpenLoopsProps) {
  const [openLoops, setOpenLoops] = useState(initialOpenLoops.data ?? []);
  const [summary, setSummary] = useState(initialOpenLoops.summary);
  const [filter, setFilter] = useState<StatusFilter>(PersonOpenLoopStatus.OPEN);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [kind, setKind] = useState<PersonOpenLoopKind>(PersonOpenLoopKind.FOLLOW_UP);
  const [title, setTitle] = useState("");
  const [details, setDetails] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [saving, setSaving] = useState(false);
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const visibleLoops = useMemo(
    () =>
      openLoops.filter((loop) =>
        filter === "all" ? true : loop.status === filter,
      ),
    [filter, openLoops],
  );

  function resetForm() {
    setEditingId(null);
    setKind(PersonOpenLoopKind.FOLLOW_UP);
    setTitle("");
    setDetails("");
    setDueAt("");
    setShowForm(false);
  }

  async function reload() {
    const result = await getPersonOpenLoops(personId, { limit: 200 });
    setOpenLoops(result.data);
    setSummary(result.summary);
  }

  function startEdit(loop: PersonOpenLoop) {
    setEditingId(loop._id);
    setKind(loop.kind);
    setTitle(loop.title);
    setDetails(loop.details ?? "");
    setDueAt(toDateTimeLocal(loop.dueAt));
    setShowForm(true);
    setError("");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      setError("Open-loop title is required.");
      return;
    }

    setSaving(true);
    setError("");

    try {
      const dueAtIso = dueAt ? new Date(dueAt).toISOString() : undefined;

      if (editingId) {
        await updatePersonOpenLoop(personId, editingId, {
          kind,
          title: title.trim(),
          details: details.trim(),
          dueAt: dueAtIso ?? null,
        });
      } else {
        await createPersonOpenLoop(personId, {
          kind,
          title: title.trim(),
          details: details.trim() || undefined,
          dueAt: dueAtIso,
        });
      }

      await reload();
      resetForm();
      setFilter(PersonOpenLoopStatus.OPEN);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to save relationship open loop.",
      );
    } finally {
      setSaving(false);
    }
  }

  async function runLoopAction(
    loop: PersonOpenLoop,
    action: "resolve" | "dismiss" | "reopen",
  ) {
    const actionLabel =
      action === "resolve"
        ? "resolve"
        : action === "dismiss"
          ? "dismiss"
          : "reopen";
    const confirmed = window.confirm(
      `${formatEnum(actionLabel)} “${loop.title}” for ${displayName}?`,
    );

    if (!confirmed) {
      return;
    }

    setProcessingId(loop._id);
    setError("");

    try {
      if (action === "resolve") {
        await resolvePersonOpenLoop(personId, loop._id);
      } else if (action === "dismiss") {
        await dismissPersonOpenLoop(personId, loop._id);
      } else {
        await reopenPersonOpenLoop(personId, loop._id);
      }

      await reload();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : `Unable to ${actionLabel} relationship open loop.`,
      );
    } finally {
      setProcessingId(null);
    }
  }

  return (
    <section className="rounded-[24px] border border-white/10 bg-white/[0.025]">
      <div className="border-b border-white/10 p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#C6FF32]">
              Phase 5C · Relationship intelligence
            </p>
            <h2 className="mt-2 text-xl font-black tracking-[-0.03em] text-white">
              Open loops with {displayName}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/40">
              Track unfinished relationship context: promises, unanswered questions,
              pending introductions, meetings to schedule and follow-ups HSAKAA should
              not forget.
            </p>
          </div>

          <button
            type="button"
            onClick={() => {
              if (showForm) {
                resetForm();
              } else {
                setShowForm(true);
              }
            }}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] bg-[#C6FF32] px-4 text-sm font-black text-[#030608]"
          >
            <Plus className="h-4 w-4" />
            {showForm ? "Close form" : "Add open loop"}
          </button>
        </div>
      </div>

      <div className="space-y-6 p-5 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <SummaryCard label="Open" value={summary.open} />
          <SummaryCard label="Overdue" value={summary.overdue} attention />
          <SummaryCard label="Due in 7 days" value={summary.dueWithinSevenDays} />
          <SummaryCard label="No due date" value={summary.withoutDueDate} />
        </div>

        {error ? (
          <div className="flex items-start gap-3 rounded-[18px] border border-red-400/20 bg-red-400/[0.06] p-4 text-sm text-red-100">
            <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
            <p>{error}</p>
          </div>
        ) : null}

        {showForm ? (
          <form
            onSubmit={handleSubmit}
            className="rounded-[20px] border border-[#C6FF32]/15 bg-[#C6FF32]/[0.035] p-4 sm:p-5"
          >
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-sm font-black text-white">
                  {editingId ? "Edit open loop" : "Capture an open loop"}
                </p>
                <p className="mt-1 text-xs text-white/35">
                  Keep the title concrete enough that HSAKAA can explain what is pending.
                </p>
              </div>

              {editingId ? (
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-xs font-bold text-white/45 hover:text-white"
                >
                  Cancel edit
                </button>
              ) : null}
            </div>

            <div className="mt-5 grid gap-4 lg:grid-cols-2">
              <label className="space-y-2 text-sm font-bold text-white/60">
                Type
                <select
                  value={kind}
                  onChange={(event) =>
                    setKind(event.target.value as PersonOpenLoopKind)
                  }
                  className="w-full rounded-[14px] border border-white/10 bg-[#080b0d] px-3 py-3 text-white"
                >
                  {kindOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>

              <label className="space-y-2 text-sm font-bold text-white/60">
                Due date
                <input
                  type="datetime-local"
                  value={dueAt}
                  onChange={(event) => setDueAt(event.target.value)}
                  className="w-full rounded-[14px] border border-white/10 bg-[#080b0d] px-3 py-3 text-white"
                />
              </label>
            </div>

            <label className="mt-4 block space-y-2 text-sm font-bold text-white/60">
              What is still open?
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder={`e.g. Send ${displayName} the proposal we discussed`}
                maxLength={500}
                className="w-full rounded-[14px] border border-white/10 bg-[#080b0d] px-3 py-3 text-white placeholder:text-white/20"
                required
              />
            </label>

            <label className="mt-4 block space-y-2 text-sm font-bold text-white/60">
              Context
              <textarea
                value={details}
                onChange={(event) => setDetails(event.target.value)}
                rows={3}
                maxLength={5000}
                placeholder="Optional context, what was promised, or what you need to ask."
                className="w-full rounded-[14px] border border-white/10 bg-[#080b0d] px-3 py-3 text-white placeholder:text-white/20"
              />
            </label>

            <div className="mt-5 flex flex-wrap gap-3">
              <button
                type="submit"
                disabled={saving}
                className="rounded-[14px] bg-[#C6FF32] px-5 py-3 text-sm font-black text-[#030608] disabled:opacity-50"
              >
                {saving ? "Saving…" : editingId ? "Save changes" : "Save open loop"}
              </button>

              <button
                type="button"
                onClick={resetForm}
                className="rounded-[14px] border border-white/10 px-5 py-3 text-sm font-black text-white/55"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : null}

        <div className="flex flex-wrap gap-2">
          {(
            [
              ["all", "All"],
              [PersonOpenLoopStatus.OPEN, `Open · ${summary.open}`],
              [PersonOpenLoopStatus.RESOLVED, `Resolved · ${summary.resolved}`],
              [PersonOpenLoopStatus.DISMISSED, `Dismissed · ${summary.dismissed}`],
            ] as Array<[StatusFilter, string]>
          ).map(([value, label]) => {
            const active = filter === value;
            return (
              <button
                key={value}
                type="button"
                onClick={() => setFilter(value)}
                className={`rounded-full border px-3 py-2 text-xs font-black ${
                  active
                    ? "border-[#C6FF32]/30 bg-[#C6FF32]/10 text-[#C6FF32]"
                    : "border-white/10 bg-white/[0.03] text-white/40"
                }`}
              >
                {label}
              </button>
            );
          })}
        </div>

        {visibleLoops.length ? (
          <div className="space-y-3">
            {visibleLoops.map((loop) => {
              const overdue = isOverdue(loop);
              const busy = processingId === loop._id;

              return (
                <article
                  key={loop._id}
                  className={`rounded-[20px] border p-4 sm:p-5 ${
                    overdue
                      ? "border-red-300/20 bg-red-300/[0.04]"
                      : "border-white/10 bg-black/10"
                  }`}
                >
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="rounded-full border border-[#C6FF32]/20 bg-[#C6FF32]/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-[#C6FF32]">
                          {formatEnum(loop.kind)}
                        </span>
                        <span className="rounded-full border border-white/10 bg-white/[0.04] px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-white/40">
                          {formatEnum(loop.status)}
                        </span>
                        {overdue ? (
                          <span className="rounded-full border border-red-300/20 bg-red-300/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-wider text-red-200">
                            Overdue
                          </span>
                        ) : null}
                      </div>

                      <h3 className="mt-3 text-base font-black text-white">
                        {loop.title}
                      </h3>

                      {loop.details ? (
                        <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-white/45">
                          {loop.details}
                        </p>
                      ) : null}

                      <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs text-white/30">
                        <span className="inline-flex items-center gap-1.5">
                          <CalendarClock className="h-3.5 w-3.5" />
                          {formatDate(loop.dueAt)}
                        </span>

                        {loop.resolutionNote ? (
                          <span>Closure note: {loop.resolutionNote}</span>
                        ) : null}
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 lg:max-w-[260px] lg:justify-end">
                      {loop.status === PersonOpenLoopStatus.OPEN ? (
                        <>
                          <button
                            type="button"
                            onClick={() => startEdit(loop)}
                            disabled={busy}
                            className="inline-flex items-center gap-1.5 rounded-[12px] border border-white/10 px-3 py-2 text-xs font-black text-white/55 disabled:opacity-50"
                          >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => void runLoopAction(loop, "resolve")}
                            disabled={busy}
                            className="inline-flex items-center gap-1.5 rounded-[12px] border border-[#C6FF32]/20 bg-[#C6FF32]/10 px-3 py-2 text-xs font-black text-[#C6FF32] disabled:opacity-50"
                          >
                            <CheckCircle2 className="h-3.5 w-3.5" />
                            Resolve
                          </button>
                          <button
                            type="button"
                            onClick={() => void runLoopAction(loop, "dismiss")}
                            disabled={busy}
                            className="inline-flex items-center gap-1.5 rounded-[12px] border border-white/10 px-3 py-2 text-xs font-black text-white/40 disabled:opacity-50"
                          >
                            <XCircle className="h-3.5 w-3.5" />
                            Dismiss
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={() => void runLoopAction(loop, "reopen")}
                          disabled={busy}
                          className="inline-flex items-center gap-1.5 rounded-[12px] border border-white/10 px-3 py-2 text-xs font-black text-white/55 disabled:opacity-50"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                          Reopen
                        </button>
                      )}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        ) : (
          <div className="rounded-[20px] border border-dashed border-white/10 p-8 text-center">
            <p className="font-black text-white/60">No matching open loops.</p>
            <p className="mt-2 text-sm text-white/30">
              {filter === PersonOpenLoopStatus.OPEN
                ? `Nothing is currently pending with ${displayName}.`
                : "Change the filter or capture a new relationship loop."}
            </p>
          </div>
        )}
      </div>
    </section>
  );
}

function SummaryCard({
  label,
  value,
  attention = false,
}: {
  label: string;
  value: number;
  attention?: boolean;
}) {
  return (
    <div className="rounded-[18px] border border-white/10 bg-black/10 p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white/25">
        {label}
      </p>
      <p
        className={`mt-2 text-2xl font-black ${
          attention && value > 0 ? "text-red-200" : "text-white"
        }`}
      >
        {value}
      </p>
    </div>
  );
}
