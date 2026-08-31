"use client";

import { useMemo, useState } from "react";
import {
  Archive,
  Check,
  CheckCircle2,
  Circle,
  Clock3,
  Pencil,
  Plus,
  RotateCcw,
  Trash2,
  X,
} from "lucide-react";

import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import {
  archiveTask,
  completeTask,
  createTask,
  deleteTask,
  reopenTask,
  updateTask,
  updateTaskStatus,
} from "@/lib/api/personal-os";
import type {
  PersonalTask,
  TaskPayload,
  TaskPriority,
  TaskStatus,
  TaskSummary,
} from "@/types/personal-os";

type Props = {
  initialTasks: PersonalTask[];
  initialSummary: TaskSummary;
};

type FormState = {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  area: string;
  dueAt: string;
  reminderAt: string;
  estimatedMinutes: string;
  tags: string;
  notes: string;
};

const inputClass =
  "min-h-11 w-full rounded-[14px] border border-white/10 bg-[#080b0d] px-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-[#C6FF32]/50";

const statuses: TaskStatus[] = [
  "inbox",
  "todo",
  "in_progress",
  "waiting",
  "blocked",
  "completed",
  "cancelled",
];

const priorities: TaskPriority[] = ["low", "medium", "high", "urgent"];

function label(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function toLocalInput(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return local.toISOString().slice(0, 16);
}

function emptyForm(): FormState {
  return {
    title: "",
    description: "",
    status: "todo",
    priority: "medium",
    area: "",
    dueAt: "",
    reminderAt: "",
    estimatedMinutes: "",
    tags: "",
    notes: "",
  };
}

function tags(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function dueLabel(value?: string) {
  if (!value) return "No due date";
  const date = new Date(value);
  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

export function TaskManager({ initialTasks, initialSummary }: Props) {
  const [tasks, setTasks] = useState(initialTasks);
  const [filter, setFilter] = useState<TaskStatus | "open" | "all">("open");
  const [query, setQuery] = useState("");
  const [showForm, setShowForm] = useState(initialTasks.length === 0);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm());
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase();
    return tasks.filter((task) => {
      const matchesStatus =
        filter === "all"
          ? true
          : filter === "open"
            ? !["completed", "cancelled"].includes(task.status)
            : task.status === filter;
      const matchesQuery = !normalized || [task.title, task.description, task.area, task.tags.join(" ")]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(normalized);
      return matchesStatus && matchesQuery;
    });
  }, [filter, query, tasks]);

  const liveSummary = useMemo(() => {
    const today = new Intl.DateTimeFormat("en-CA", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    }).format(new Date());
    const open = tasks.filter((task) => !["completed", "cancelled"].includes(task.status));
    return {
      totalOpen: open.length,
      dueToday: open.filter((task) => task.dueAt && new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date(task.dueAt)) === today).length,
      overdue: open.filter((task) => task.dueAt && new Date(task.dueAt).getTime() < Date.now()).length,
      completedToday: tasks.filter((task) => task.status === "completed" && task.completedAt && new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata" }).format(new Date(task.completedAt)) === today).length,
      highPriority: open.filter((task) => ["high", "urgent"].includes(task.priority)).length,
    };
  }, [tasks]);

  function beginCreate() {
    setEditingId(null);
    setForm(emptyForm());
    setShowForm(true);
    setError("");
  }

  function beginEdit(task: PersonalTask) {
    setEditingId(task._id);
    setForm({
      title: task.title,
      description: task.description ?? "",
      status: task.status,
      priority: task.priority,
      area: task.area ?? "",
      dueAt: toLocalInput(task.dueAt),
      reminderAt: toLocalInput(task.reminderAt),
      estimatedMinutes: task.estimatedMinutes != null ? String(task.estimatedMinutes) : "",
      tags: task.tags.join(", "),
      notes: task.notes ?? "",
    });
    setShowForm(true);
    setError("");
  }

  function buildPayload(): TaskPayload {
    return {
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      status: form.status,
      priority: form.priority,
      area: form.area.trim() || undefined,
      dueAt: form.dueAt ? new Date(form.dueAt).toISOString() : undefined,
      reminderAt: form.reminderAt ? new Date(form.reminderAt).toISOString() : undefined,
      estimatedMinutes: form.estimatedMinutes ? Number(form.estimatedMinutes) : undefined,
      tags: tags(form.tags),
      notes: form.notes.trim() || undefined,
    };
  }

  async function save() {
    if (!form.title.trim()) {
      setError("Task title is required.");
      return;
    }
    try {
      setBusyId("form");
      setError("");
      const saved = editingId
        ? await updateTask(editingId, buildPayload())
        : await createTask(buildPayload());
      setTasks((current) => [saved, ...current.filter((task) => task._id !== saved._id)]);
      setShowForm(false);
      setEditingId(null);
      setForm(emptyForm());
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save task.");
    } finally {
      setBusyId(null);
    }
  }

  async function run(task: PersonalTask, action: "complete" | "reopen" | "archive" | "delete") {
    try {
      setBusyId(task._id);
      setError("");
      if (action === "delete") {
        await deleteTask(task._id);
        setTasks((current) => current.filter((item) => item._id !== task._id));
        return;
      }
      const updated = action === "complete"
        ? await completeTask(task._id)
        : action === "reopen"
          ? await reopenTask(task._id)
          : await archiveTask(task._id);
      if (action === "archive") {
        setTasks((current) => current.filter((item) => item._id !== task._id));
      } else {
        setTasks((current) => current.map((item) => item._id === updated._id ? updated : item));
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : `Unable to ${action} task.`);
    } finally {
      setBusyId(null);
    }
  }

  async function changeStatus(task: PersonalTask, status: TaskStatus) {
    try {
      setBusyId(task._id);
      setError("");
      const updated = await updateTaskStatus(task._id, status);
      setTasks((current) => current.map((item) => item._id === updated._id ? updated : item));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to update task status.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <AdminStatCard label="Open" value={liveSummary.totalOpen} description={`${initialSummary.inbox} started in Inbox`} icon={Circle} />
        <AdminStatCard label="Due today" value={liveSummary.dueToday} description="Tasks scheduled for today" icon={Clock3} />
        <AdminStatCard label="Overdue" value={liveSummary.overdue} description="Needs a decision" icon={X} />
        <AdminStatCard label="Completed today" value={liveSummary.completedToday} description="Momentum today" icon={CheckCircle2} />
        <AdminStatCard label="High priority" value={liveSummary.highPriority} description="High + urgent open tasks" icon={Check} />
      </section>

      {error && <div className="rounded-[18px] border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">{error}</div>}

      <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5 sm:p-6">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex flex-wrap gap-2">
            {(["open", "all", ...statuses] as const).map((item) => (
              <button key={item} type="button" onClick={() => setFilter(item)} className={`rounded-full px-3 py-2 text-xs font-black transition ${filter === item ? "bg-[#C6FF32] text-[#030608]" : "bg-white/5 text-white/45 hover:text-white"}`}>
                {label(item)}
              </button>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search tasks" className={`${inputClass} min-w-0 lg:w-64`} />
            <button type="button" onClick={beginCreate} className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-[14px] bg-[#C6FF32] px-4 text-sm font-black text-[#030608]">
              <Plus className="h-4 w-4" /> New task
            </button>
          </div>
        </div>
      </section>

      {showForm && (
        <section className="rounded-[24px] border border-[#C6FF32]/20 bg-[#C6FF32]/[0.035] p-5 sm:p-6">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#C6FF32]">{editingId ? "Edit" : "Create"}</p>
              <h2 className="mt-2 text-xl font-black">{editingId ? "Update task" : "Add task"}</h2>
            </div>
            <button type="button" onClick={() => setShowForm(false)} className="rounded-full p-2 text-white/40 hover:bg-white/5 hover:text-white"><X className="h-5 w-5" /></button>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="Task title" className={`${inputClass} md:col-span-2`} />
            <textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Description" className={`${inputClass} min-h-24 py-3 md:col-span-2`} />
            <select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as TaskStatus }))} className={inputClass}>{statuses.map((item) => <option key={item} value={item}>{label(item)}</option>)}</select>
            <select value={form.priority} onChange={(event) => setForm((current) => ({ ...current, priority: event.target.value as TaskPriority }))} className={inputClass}>{priorities.map((item) => <option key={item} value={item}>{label(item)}</option>)}</select>
            <input value={form.area} onChange={(event) => setForm((current) => ({ ...current, area: event.target.value }))} placeholder="Area, e.g. Personal OS" className={inputClass} />
            <input type="number" min="0" value={form.estimatedMinutes} onChange={(event) => setForm((current) => ({ ...current, estimatedMinutes: event.target.value }))} placeholder="Estimated minutes" className={inputClass} />
            <label className="space-y-2 text-xs font-bold uppercase tracking-[0.16em] text-white/35">Due at<input type="datetime-local" value={form.dueAt} onChange={(event) => setForm((current) => ({ ...current, dueAt: event.target.value }))} className={`${inputClass} mt-2`} /></label>
            <label className="space-y-2 text-xs font-bold uppercase tracking-[0.16em] text-white/35">Reminder at<input type="datetime-local" value={form.reminderAt} onChange={(event) => setForm((current) => ({ ...current, reminderAt: event.target.value }))} className={`${inputClass} mt-2`} /></label>
            <input value={form.tags} onChange={(event) => setForm((current) => ({ ...current, tags: event.target.value }))} placeholder="Tags, comma separated" className={`${inputClass} md:col-span-2`} />
            <textarea value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} placeholder="Notes" className={`${inputClass} min-h-20 py-3 md:col-span-2`} />
          </div>
          <div className="mt-5 flex justify-end gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="min-h-11 rounded-[14px] border border-white/10 px-4 text-sm font-bold text-white/55">Cancel</button>
            <button type="button" disabled={busyId === "form"} onClick={save} className="min-h-11 rounded-[14px] bg-[#C6FF32] px-5 text-sm font-black text-[#030608] disabled:opacity-50">{busyId === "form" ? "Saving…" : "Save task"}</button>
          </div>
        </section>
      )}

      {filtered.length === 0 ? (
        <AdminEmptyState icon={CheckCircle2} title="No tasks here" description="Capture the next action instead of holding it in your head." action={<button type="button" onClick={beginCreate} className="rounded-[14px] bg-[#C6FF32] px-4 py-3 text-sm font-black text-[#030608]">Create task</button>} />
      ) : (
        <div className="space-y-3">
          {filtered.map((task) => (
            <article key={task._id} className="rounded-[22px] border border-white/10 bg-white/[0.025] p-5">
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.14em] ${task.priority === "urgent" ? "bg-red-400/15 text-red-200" : task.priority === "high" ? "bg-amber-400/15 text-amber-200" : "bg-white/5 text-white/45"}`}>{task.priority}</span>
                    {task.area && <span className="rounded-full bg-[#C6FF32]/10 px-2.5 py-1 text-[11px] font-black text-[#C6FF32]">{task.area}</span>}
                    <span className="text-xs text-white/30">{dueLabel(task.dueAt)}</span>
                  </div>
                  <h3 className={`mt-3 text-lg font-black ${task.status === "completed" ? "text-white/35 line-through" : "text-white"}`}>{task.title}</h3>
                  {task.description && <p className="mt-2 max-w-3xl text-sm leading-6 text-white/40">{task.description}</p>}
                  {task.tags.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{task.tags.map((tag) => <span key={tag} className="text-xs text-white/30">#{tag}</span>)}</div>}
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <select disabled={busyId === task._id} value={task.status} onChange={(event) => changeStatus(task, event.target.value as TaskStatus)} className="min-h-9 rounded-[12px] border border-white/10 bg-[#080b0d] px-3 text-xs font-bold text-white/60 outline-none">{statuses.map((item) => <option key={item} value={item}>{label(item)}</option>)}</select>
                  {task.status === "completed" ? (
                    <button type="button" disabled={busyId === task._id} onClick={() => run(task, "reopen")} title="Reopen" className="rounded-[12px] border border-white/10 p-2.5 text-white/45 hover:text-white"><RotateCcw className="h-4 w-4" /></button>
                  ) : (
                    <button type="button" disabled={busyId === task._id} onClick={() => run(task, "complete")} title="Complete" className="rounded-[12px] border border-[#C6FF32]/20 bg-[#C6FF32]/10 p-2.5 text-[#C6FF32]"><Check className="h-4 w-4" /></button>
                  )}
                  <button type="button" onClick={() => beginEdit(task)} title="Edit" className="rounded-[12px] border border-white/10 p-2.5 text-white/45 hover:text-white"><Pencil className="h-4 w-4" /></button>
                  <button type="button" disabled={busyId === task._id} onClick={() => run(task, "archive")} title="Archive" className="rounded-[12px] border border-white/10 p-2.5 text-white/45 hover:text-white"><Archive className="h-4 w-4" /></button>
                  <button type="button" disabled={busyId === task._id} onClick={() => { if (window.confirm("Delete this task permanently?")) run(task, "delete"); }} title="Delete" className="rounded-[12px] border border-red-400/15 p-2.5 text-red-300/70 hover:text-red-200"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
