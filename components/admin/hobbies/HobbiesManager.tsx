"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import type { ReactNode } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  BarChart3,
  BookOpen,
  Brain,
  CalendarDays,
  Check,
  Clock3,
  Gauge,
  ListChecks,
  Music2,
  Pencil,
  Play,
  Plus,
  RefreshCw,
  Save,
  Search,
  ShieldCheck,
  Square,
  Target,
  Trash2,
  X,
} from "lucide-react";

import {
  advanceHobby,
  archiveHobby,
  completePlannedHobbySession,
  createHobby,
  finishHobbySession,
  generateHobbyReview,
  getHobbyForEdit,
  linkHobbyResource,
  logHobbySession,
  startHobbySession,
  syncHobbyPracticePlanTasks,
  syncHobbyPracticeTasks,
  updateHobby,
} from "@/lib/api/hobbies";
import type { LibraryItem } from "@/types/library";
import type {
  CreateHobbyPayload,
  HobbiesOverview,
  HobbyCard,
  HobbyPracticePlan,
  UpdateHobbyPayload,
} from "@/types/hobbies";

type Props = {
  initialOverview: HobbiesOverview;
  initialPracticePlan: HobbyPracticePlan;
  libraryItems: LibraryItem[];
};

function minutesLabel(minutes: number) {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const rest = minutes % 60;
  return rest ? `${hours}h ${rest}m` : `${hours}h`;
}

function formatSlotTime(value: string) {
  return new Date(value).toLocaleTimeString("en-IN", {
    hour: "numeric",
    minute: "2-digit",
    timeZone: "Asia/Kolkata",
  });
}

function formatSlotDay(dateKey: string) {
  return new Date(`${dateKey}T12:00:00+05:30`).toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "short",
    timeZone: "Asia/Kolkata",
  });
}

function paceLabel(pace: HobbyCard["pace"]) {
  if (pace === "complete") return "Target complete";
  if (pace === "behind") return "Needs attention";
  if (pace === "maintenance") return "Maintenance";
  return "On track";
}

function Progress({ value }: { value: number }) {
  return (
    <div className="h-2 overflow-hidden rounded-full bg-white/[0.07]">
      <div
        className="h-full rounded-full bg-[#C6FF32] transition-[width]"
        style={{ width: `${Math.max(0, Math.min(value, 100))}%` }}
      />
    </div>
  );
}

function RunningTimer({ startedAt }: { startedAt: string }) {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const update = () => {
      setSeconds(Math.max(0, Math.floor((Date.now() - new Date(startedAt).getTime()) / 1000)));
    };
    update();
    const timer = window.setInterval(update, 1000);
    return () => window.clearInterval(timer);
  }, [startedAt]);

  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return (
    <span className="font-mono text-sm text-[#C6FF32]">
      {hours > 0 ? `${String(hours).padStart(2, "0")}:` : ""}
      {String(minutes).padStart(2, "0")}:{String(secs).padStart(2, "0")}
    </span>
  );
}

export function HobbiesManager({
  initialOverview,
  initialPracticePlan,
  libraryItems,
}: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [now, setNow] = useState(() => new Date());
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [quickMinutes, setQuickMinutes] = useState<Record<string, string>>({});
  const [resourceChoice, setResourceChoice] = useState<Record<string, string>>({});
  const [showAddHobby, setShowAddHobby] = useState(false);
  const [newHobby, setNewHobby] = useState({
    name: "",
    status: "backlog",
    category: "other",
    intensity: "secondary",
    currentSkillLevel: "",
    goal: "",
    weeklyTargetMinutes: "120",
    targetSessionsPerWeek: "3",
    recommendedSessionMinutes: "40",
    preferredPracticeTime: "flexible",
    nextAction: "",
  });
  const [editingHobbyId, setEditingHobbyId] = useState<string | null>(null);
  const [editHobby, setEditHobby] = useState({
    name: "",
    status: "active",
    category: "other",
    intensity: "secondary",
    currentSkillLevel: "",
    goal: "",
    weeklyTargetMinutes: "120",
    targetSessionsPerWeek: "3",
    recommendedSessionMinutes: "40",
    preferredPracticeTime: "flexible",
    nextAction: "",
  });

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 60_000);
    return () => window.clearInterval(timer);
  }, []);

  const linkedIds = useMemo(
    () => new Set(initialOverview.active.flatMap((hobby) => hobby.linkedLibraryItemIds ?? [])),
    [initialOverview.active],
  );
  const practiceDays = useMemo(() => {
    const grouped = new Map<string, HobbyPracticePlan["slots"]>();
    for (const slot of initialPracticePlan.slots) {
      const current = grouped.get(slot.dateKey) ?? [];
      current.push(slot);
      grouped.set(slot.dateKey, current);
    }
    return [...grouped.entries()]
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([dateKey, slots]) => ({
        dateKey,
        slots: [...slots].sort((a, b) => a.startAt.localeCompare(b.startAt)),
      }));
  }, [initialPracticePlan.slots]);
  const todayDateKey = now.toLocaleDateString("en-CA", {
    timeZone: "Asia/Kolkata",
  });
  const weeklyTargetSessions = useMemo(
    () => initialOverview.active.reduce((sum, hobby) => sum + hobby.targetSessionsPerWeek, 0),
    [initialOverview.active],
  );
  const weeklyCommitmentBreakdown = useMemo(
    () =>
      initialOverview.active
        .map((hobby) => `${hobby.name} ${minutesLabel(hobby.weeklyTargetMinutes)}`)
        .join(" · "),
    [initialOverview.active],
  );
  const scheduledAction = useMemo(() => {
    const slots = [...initialPracticePlan.slots].sort((a, b) => a.startAt.localeCompare(b.startAt));
    const todaySlots = slots.filter((slot) => slot.dateKey === todayDateKey);
    const nowMs = now.getTime();
    const dueToday = todaySlots.find((slot) => new Date(slot.startAt).getTime() <= nowMs);
    if (dueToday) {
      return {
        slot: dueToday,
        state: "due" as const,
        label: `Due now · planned ${formatSlotTime(dueToday.startAt)}`,
        isToday: true,
      };
    }
    const upcomingToday = todaySlots.find((slot) => new Date(slot.startAt).getTime() > nowMs);
    if (upcomingToday) {
      return {
        slot: upcomingToday,
        state: "upcoming" as const,
        label: `Today · ${formatSlotTime(upcomingToday.startAt)}`,
        isToday: true,
      };
    }
    const future = slots.find((slot) => slot.dateKey > todayDateKey);
    if (future) {
      return {
        slot: future,
        state: "future" as const,
        label: `${formatSlotDay(future.dateKey)} · ${formatSlotTime(future.startAt)}`,
        isToday: false,
      };
    }
    return null;
  }, [initialPracticePlan.slots, now, todayDateKey]);

  function run(action: () => Promise<unknown>, success: string) {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      try {
        await action();
        setMessage(success);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Something went wrong.");
      }
    });
  }

  function submitNewHobby() {
    const name = newHobby.name.trim();
    if (!name) {
      setError("Give the hobby a name first.");
      return;
    }

    const payload: CreateHobbyPayload = {
      name,
      status: newHobby.status as CreateHobbyPayload["status"],
      category: newHobby.category as CreateHobbyPayload["category"],
      intensity: newHobby.intensity as CreateHobbyPayload["intensity"],
      currentSkillLevel: newHobby.currentSkillLevel.trim() || undefined,
      goal: newHobby.goal.trim() || undefined,
      weeklyTargetMinutes: Math.max(0, Number(newHobby.weeklyTargetMinutes) || 0),
      targetSessionsPerWeek: Math.max(0, Number(newHobby.targetSessionsPerWeek) || 0),
      recommendedSessionMinutes: Math.max(0, Number(newHobby.recommendedSessionMinutes) || 0),
      preferredPracticeTime:
        newHobby.preferredPracticeTime as CreateHobbyPayload["preferredPracticeTime"],
      nextAction: newHobby.nextAction.trim() || undefined,
      nextActionMinutes: Math.max(0, Number(newHobby.recommendedSessionMinutes) || 0),
    };

    setError(null);
    setMessage(null);
    startTransition(async () => {
      try {
        await createHobby(payload);
        setMessage(`${name} added to Hobbies.`);
        setShowAddHobby(false);
        setNewHobby({
          name: "",
          status: "backlog",
          category: "other",
          intensity: "secondary",
          currentSkillLevel: "",
          goal: "",
          weeklyTargetMinutes: "120",
          targetSessionsPerWeek: "3",
          recommendedSessionMinutes: "40",
          preferredPracticeTime: "flexible",
          nextAction: "",
        });
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to add the hobby.");
      }
    });
  }

  function beginEditHobby(hobbyId: string) {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      try {
        const hobby = await getHobbyForEdit(hobbyId);
        setEditHobby({
          name: hobby.name ?? "",
          status: hobby.status ?? "active",
          category: hobby.category ?? "other",
          intensity: hobby.intensity ?? "secondary",
          currentSkillLevel: hobby.currentSkillLevel ?? "",
          goal: hobby.goal ?? "",
          weeklyTargetMinutes: String(hobby.weeklyTargetMinutes ?? 0),
          targetSessionsPerWeek: String(hobby.targetSessionsPerWeek ?? 0),
          recommendedSessionMinutes: String(hobby.recommendedSessionMinutes ?? 0),
          preferredPracticeTime: hobby.preferredPracticeTime ?? "flexible",
          nextAction: hobby.nextAction ?? "",
        });
        setEditingHobbyId(hobbyId);
        setShowAddHobby(false);
        window.requestAnimationFrame(() => {
          document.getElementById("hobby-edit-form")?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          });
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load the hobby for editing.");
      }
    });
  }

  function submitHobbyEdit() {
    if (!editingHobbyId) return;
    const name = editHobby.name.trim();
    if (!name) {
      setError("Give the hobby a name first.");
      return;
    }

    const payload: UpdateHobbyPayload = {
      name,
      status: editHobby.status as UpdateHobbyPayload["status"],
      category: editHobby.category as UpdateHobbyPayload["category"],
      intensity: editHobby.intensity as UpdateHobbyPayload["intensity"],
      // Empty strings are intentional here so an existing optional value can be cleared.
      currentSkillLevel: editHobby.currentSkillLevel.trim(),
      goal: editHobby.goal.trim(),
      weeklyTargetMinutes: Math.max(0, Number(editHobby.weeklyTargetMinutes) || 0),
      targetSessionsPerWeek: Math.max(0, Number(editHobby.targetSessionsPerWeek) || 0),
      recommendedSessionMinutes: Math.max(0, Number(editHobby.recommendedSessionMinutes) || 0),
      preferredPracticeTime:
        editHobby.preferredPracticeTime as UpdateHobbyPayload["preferredPracticeTime"],
      nextAction: editHobby.nextAction.trim(),
      nextActionMinutes: Math.max(0, Number(editHobby.recommendedSessionMinutes) || 0),
    };

    setError(null);
    setMessage(null);
    startTransition(async () => {
      try {
        await updateHobby(editingHobbyId, payload);
        setMessage(`${name} updated.`);
        setEditingHobbyId(null);
        router.refresh();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to update the hobby.");
      }
    });
  }

  function removeHobby(hobbyId: string, hobbyName: string) {
    if (
      !window.confirm(
        `Remove ${hobbyName} from Hobbies? Its practice history will be preserved.`,
      )
    ) {
      return;
    }
    run(() => archiveHobby(hobbyId), `${hobbyName} removed from Hobbies.`);
  }

  return (
    <div className="space-y-6">
      {(error || message) && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            error
              ? "border-red-400/20 bg-red-400/10 text-red-200"
              : "border-[#C6FF32]/20 bg-[#C6FF32]/10 text-[#DFFF87]"
          }`}
        >
          {error ?? message}
        </div>
      )}

      <section className="rounded-[28px] border border-white/10 bg-white/[0.025] p-5 md:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.17em] text-white/35">
              <Target className="h-4 w-4 text-[#C6FF32]" /> Hobby library
            </div>
            <h2 className="mt-2 text-xl font-semibold text-white">Add or remove what you are learning.</h2>
            <p className="mt-1 text-sm text-white/45">
              Removing a hobby archives it so HSAKAA keeps the practice history and past evidence.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setShowAddHobby((current) => !current)}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#C6FF32] px-4 py-2.5 text-sm font-semibold text-black"
          >
            {showAddHobby ? <X className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
            {showAddHobby ? "Close" : "Add hobby"}
          </button>
        </div>

        {showAddHobby && (
          <div className="mt-5 border-t border-white/[0.07] pt-5">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Field label="Hobby name" className="xl:col-span-2">
                <input
                  autoFocus
                  value={newHobby.name}
                  onChange={(event) => setNewHobby((current) => ({ ...current, name: event.target.value }))}
                  placeholder="e.g. Guitar, Spanish, Chess"
                  className="w-full rounded-xl border border-white/10 bg-[#090D0F] px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#C6FF32]/40"
                />
              </Field>
              <Field label="Start as">
                <select
                  value={newHobby.status}
                  onChange={(event) => setNewHobby((current) => ({ ...current, status: event.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-[#090D0F] px-3 py-2.5 text-sm text-white/75 outline-none"
                >
                  <option value="active">Active</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="paused">Paused</option>
                  <option value="backlog">Backlog</option>
                </select>
              </Field>
              <Field label="Category">
                <select
                  value={newHobby.category}
                  onChange={(event) => setNewHobby((current) => ({ ...current, category: event.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-[#090D0F] px-3 py-2.5 text-sm text-white/75 outline-none"
                >
                  <option value="music">Music</option>
                  <option value="creative">Creative</option>
                  <option value="cognitive">Cognitive</option>
                  <option value="physical">Physical</option>
                  <option value="language">Language</option>
                  <option value="social">Social</option>
                  <option value="practical">Practical</option>
                  <option value="other">Other</option>
                </select>
              </Field>
              <Field label="Intensity">
                <select
                  value={newHobby.intensity}
                  onChange={(event) => setNewHobby((current) => ({ ...current, intensity: event.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-[#090D0F] px-3 py-2.5 text-sm text-white/75 outline-none"
                >
                  <option value="primary">Primary</option>
                  <option value="secondary">Secondary</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </Field>
              <Field label="Current level">
                <input
                  value={newHobby.currentSkillLevel}
                  onChange={(event) => setNewHobby((current) => ({ ...current, currentSkillLevel: event.target.value }))}
                  placeholder="Beginner, intermediate…"
                  className="w-full rounded-xl border border-white/10 bg-[#090D0F] px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/25"
                />
              </Field>
              <Field label="Preferred time">
                <select
                  value={newHobby.preferredPracticeTime}
                  onChange={(event) => setNewHobby((current) => ({ ...current, preferredPracticeTime: event.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-[#090D0F] px-3 py-2.5 text-sm text-white/75 outline-none"
                >
                  <option value="flexible">Flexible</option>
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="evening">Evening</option>
                </select>
              </Field>
              <Field label="Weekly minutes">
                <input
                  type="number"
                  min={0}
                  max={5000}
                  value={newHobby.weeklyTargetMinutes}
                  onChange={(event) => setNewHobby((current) => ({ ...current, weeklyTargetMinutes: event.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-[#090D0F] px-3 py-2.5 text-sm text-white outline-none"
                />
              </Field>
              <Field label="Sessions / week">
                <input
                  type="number"
                  min={0}
                  max={14}
                  value={newHobby.targetSessionsPerWeek}
                  onChange={(event) => setNewHobby((current) => ({ ...current, targetSessionsPerWeek: event.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-[#090D0F] px-3 py-2.5 text-sm text-white outline-none"
                />
              </Field>
              <Field label="Session minutes">
                <input
                  type="number"
                  min={0}
                  max={600}
                  value={newHobby.recommendedSessionMinutes}
                  onChange={(event) => setNewHobby((current) => ({ ...current, recommendedSessionMinutes: event.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-[#090D0F] px-3 py-2.5 text-sm text-white outline-none"
                />
              </Field>
              <Field label="Goal" className="md:col-span-2">
                <input
                  value={newHobby.goal}
                  onChange={(event) => setNewHobby((current) => ({ ...current, goal: event.target.value }))}
                  placeholder="What do you want to become able to do?"
                  className="w-full rounded-xl border border-white/10 bg-[#090D0F] px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/25"
                />
              </Field>
              <Field label="Next practice focus" className="md:col-span-2">
                <input
                  value={newHobby.nextAction}
                  onChange={(event) => setNewHobby((current) => ({ ...current, nextAction: event.target.value }))}
                  placeholder="Optional — HSAKAA can refine this later"
                  className="w-full rounded-xl border border-white/10 bg-[#090D0F] px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/25"
                />
              </Field>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                disabled={pending || !newHobby.name.trim()}
                onClick={submitNewHobby}
                className="inline-flex items-center gap-2 rounded-xl bg-[#C6FF32] px-4 py-2.5 text-sm font-semibold text-black disabled:opacity-40"
              >
                <Plus className="h-4 w-4" /> Add hobby
              </button>
            </div>
          </div>
        )}

        {editingHobbyId && (
          <div id="hobby-edit-form" className="mt-5 border-t border-white/[0.07] pt-5">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.16em] text-[#C6FF32]/70">Edit hobby</p>
                <h3 className="mt-1 text-lg font-semibold text-white">Update {editHobby.name || "hobby"}</h3>
                <p className="mt-1 text-xs text-white/40">Changes are saved to the existing hobby and keep all practice history.</p>
              </div>
              <button
                type="button"
                disabled={pending}
                onClick={() => setEditingHobbyId(null)}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs text-white/60 disabled:opacity-40"
              >
                <X className="h-3.5 w-3.5" /> Cancel
              </button>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <Field label="Hobby name" className="xl:col-span-2">
                <input
                  autoFocus
                  value={editHobby.name}
                  onChange={(event) => setEditHobby((current) => ({ ...current, name: event.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-[#090D0F] px-3 py-2.5 text-sm text-white outline-none focus:border-[#C6FF32]/40"
                />
              </Field>
              <Field label="Status">
                <select
                  value={editHobby.status}
                  onChange={(event) => setEditHobby((current) => ({ ...current, status: event.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-[#090D0F] px-3 py-2.5 text-sm text-white/75 outline-none"
                >
                  <option value="active">Active</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="paused">Paused</option>
                  <option value="backlog">Backlog</option>
                  <option value="completed">Completed</option>
                </select>
              </Field>
              <Field label="Category">
                <select
                  value={editHobby.category}
                  onChange={(event) => setEditHobby((current) => ({ ...current, category: event.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-[#090D0F] px-3 py-2.5 text-sm text-white/75 outline-none"
                >
                  <option value="music">Music</option>
                  <option value="creative">Creative</option>
                  <option value="cognitive">Cognitive</option>
                  <option value="physical">Physical</option>
                  <option value="language">Language</option>
                  <option value="social">Social</option>
                  <option value="practical">Practical</option>
                  <option value="other">Other</option>
                </select>
              </Field>
              <Field label="Intensity">
                <select
                  value={editHobby.intensity}
                  onChange={(event) => setEditHobby((current) => ({ ...current, intensity: event.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-[#090D0F] px-3 py-2.5 text-sm text-white/75 outline-none"
                >
                  <option value="primary">Primary</option>
                  <option value="secondary">Secondary</option>
                  <option value="maintenance">Maintenance</option>
                </select>
              </Field>
              <Field label="Current level">
                <input
                  value={editHobby.currentSkillLevel}
                  onChange={(event) => setEditHobby((current) => ({ ...current, currentSkillLevel: event.target.value }))}
                  placeholder="Beginner, intermediate…"
                  className="w-full rounded-xl border border-white/10 bg-[#090D0F] px-3 py-2.5 text-sm text-white outline-none placeholder:text-white/25"
                />
              </Field>
              <Field label="Preferred time">
                <select
                  value={editHobby.preferredPracticeTime}
                  onChange={(event) => setEditHobby((current) => ({ ...current, preferredPracticeTime: event.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-[#090D0F] px-3 py-2.5 text-sm text-white/75 outline-none"
                >
                  <option value="flexible">Flexible</option>
                  <option value="morning">Morning</option>
                  <option value="afternoon">Afternoon</option>
                  <option value="evening">Evening</option>
                </select>
              </Field>
              <Field label="Weekly minutes">
                <input
                  type="number"
                  min={0}
                  max={5000}
                  value={editHobby.weeklyTargetMinutes}
                  onChange={(event) => setEditHobby((current) => ({ ...current, weeklyTargetMinutes: event.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-[#090D0F] px-3 py-2.5 text-sm text-white outline-none"
                />
              </Field>
              <Field label="Sessions / week">
                <input
                  type="number"
                  min={0}
                  max={14}
                  value={editHobby.targetSessionsPerWeek}
                  onChange={(event) => setEditHobby((current) => ({ ...current, targetSessionsPerWeek: event.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-[#090D0F] px-3 py-2.5 text-sm text-white outline-none"
                />
              </Field>
              <Field label="Session minutes">
                <input
                  type="number"
                  min={0}
                  max={600}
                  value={editHobby.recommendedSessionMinutes}
                  onChange={(event) => setEditHobby((current) => ({ ...current, recommendedSessionMinutes: event.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-[#090D0F] px-3 py-2.5 text-sm text-white outline-none"
                />
              </Field>
              <Field label="Goal" className="md:col-span-2">
                <input
                  value={editHobby.goal}
                  onChange={(event) => setEditHobby((current) => ({ ...current, goal: event.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-[#090D0F] px-3 py-2.5 text-sm text-white outline-none"
                />
              </Field>
              <Field label="Next practice focus" className="md:col-span-2">
                <input
                  value={editHobby.nextAction}
                  onChange={(event) => setEditHobby((current) => ({ ...current, nextAction: event.target.value }))}
                  className="w-full rounded-xl border border-white/10 bg-[#090D0F] px-3 py-2.5 text-sm text-white outline-none"
                />
              </Field>
            </div>
            <div className="mt-5 flex justify-end">
              <button
                type="button"
                disabled={pending || !editHobby.name.trim()}
                onClick={submitHobbyEdit}
                className="inline-flex items-center gap-2 rounded-xl bg-[#C6FF32] px-4 py-2.5 text-sm font-semibold text-black disabled:opacity-40"
              >
                <Save className="h-4 w-4" /> Save changes
              </button>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-[28px] border border-[#C6FF32]/15 bg-[#C6FF32]/[0.035] p-5 md:p-6">
        <div className="flex flex-col gap-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#C6FF32]/70">
              <CalendarDays className="h-4 w-4" /> Six-month growth season
            </div>
            <h2 className="mt-3 text-2xl font-semibold text-white">{initialOverview.season.label}</h2>
            <p className="mt-2 text-sm leading-6 text-white/55">
              Five active hobbies only. HSAKAA may plan and coach, but a session counts only when you explicitly finish it or press Mark complete. No more than {initialOverview.season.maxHobbiesPerDay} hobbies are scheduled on any day.
            </p>
          </div>
          <div className="min-w-[230px] rounded-2xl border border-white/10 bg-black/20 p-4">
            <div className="flex items-center justify-between text-xs text-white/45">
              <span>{initialOverview.season.startDate}</span>
              <span>{initialOverview.season.endDate}</span>
            </div>
            <div className="mt-3"><Progress value={initialOverview.season.progressPercent} /></div>
            <p className="mt-2 text-xs text-white/35">{initialOverview.season.progressPercent}% of the season elapsed · {initialOverview.season.activeHobbies}/{initialOverview.season.maxActiveHobbies} active</p>
          </div>
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-4">
        <Metric label="Season hobbies" value={`${initialOverview.active.length}/${initialOverview.season.maxActiveHobbies}`} hint="Five at a time for six months" />
        <Metric
          label="Completed this week"
          value={minutesLabel(initialOverview.learningLoad.weeklyMinutes)}
          hint="Only owner-confirmed practice counts"
        />
        <Metric
          label="Weekly plan"
          value={`${weeklyTargetSessions} sessions`}
          hint={`${minutesLabel(initialOverview.learningLoad.weeklyTargetMinutes)} total · max 2/day`}
        />
        <Metric
          label="Season ends"
          value={initialOverview.season.endDate}
          hint="Review all five before rotating the next season"
        />
      </section>

      <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] px-4 py-3 text-xs leading-5 text-white/35">
        <span className="font-medium text-white/55">Weekly commitment:</span> {weeklyCommitmentBreakdown}. This is the planned practice load, not a completion score.
      </div>

      <section className="rounded-[28px] border border-[#C6FF32]/15 bg-[#C6FF32]/[0.045] p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.18em] text-[#C6FF32]/70">
              <Clock3 className="h-4 w-4" /> What should I do now?
            </div>
            {scheduledAction ? (
              <>
                <p className="mt-3 text-xs font-medium uppercase tracking-[0.14em] text-[#C6FF32]/65">{scheduledAction.label}</p>
                <h2 className="mt-2 text-xl font-semibold text-white">
                  {scheduledAction.slot.hobbyName} · {scheduledAction.slot.minutes} min
                </h2>
                <p className="mt-2 max-w-3xl text-sm leading-6 text-white/65">
                  {scheduledAction.slot.focus}
                </p>
                <p className="mt-2 text-xs text-white/35">
                  {scheduledAction.isToday
                    ? scheduledAction.state === "due"
                      ? "This comes from today’s weekly schedule. It stays due until you explicitly complete the session."
                      : "This is the next hobby actually scheduled for today, based on its planned time."
                    : "No hobby session is scheduled for the rest of today. This is your next planned session."}
                </p>
              </>
            ) : (
              <>
                <h2 className="mt-3 text-xl font-semibold text-white">Nothing else is scheduled right now.</h2>
                <p className="mt-2 text-sm text-white/50">There is no remaining hobby slot in the current weekly plan. Refresh after the next planning window if needed.</p>
              </>
            )}
          </div>
          {scheduledAction?.isToday && (
            <button
              disabled={pending}
              onClick={() =>
                run(
                  () => startHobbySession(scheduledAction.slot.hobbyId, scheduledAction.slot.focus),
                  `${scheduledAction.slot.hobbyName} practice started.`,
                )
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#C6FF32] px-4 py-2.5 text-sm font-semibold text-black disabled:opacity-50"
            >
              <Play className="h-4 w-4" /> {scheduledAction.state === "due" ? "Start now" : "Start early"}
            </button>
          )}
        </div>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-white/[0.025] p-5 md:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.17em] text-white/35">
              <CalendarDays className="h-4 w-4 text-[#C6FF32]" /> Weekly practice plan
            </div>
            <h2 className="mt-3 text-xl font-semibold text-white">HSAKAA places practice around the Personal OS workload.</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/50">
              {initialPracticePlan.note}
            </p>
          </div>
          <button
            disabled={pending || initialPracticePlan.slots.length === 0}
            onClick={() =>
              run(
                syncHobbyPracticePlanTasks,
                "Weekly practice plan synced into Tasks + reminders.",
              )
            }
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-[#C6FF32]/20 px-3.5 py-2 text-xs text-[#DFFF87] disabled:opacity-35"
          >
            <ListChecks className="h-3.5 w-3.5" /> Sync weekly slots
          </button>
        </div>

        {initialPracticePlan.slots.length ? (
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            {practiceDays.map((day) => (
              <div key={day.dateKey} className="rounded-2xl border border-white/[0.08] bg-black/20 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-semibold text-white">
                      {new Date(`${day.dateKey}T12:00:00+05:30`).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short", timeZone: "Asia/Kolkata" })}
                    </p>
                    <p className="mt-1 text-[11px] text-white/30">{day.slots.length}/2 hobby slots</p>
                  </div>
                  <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] text-white/35">max 2/day</span>
                </div>
                <div className="mt-4 space-y-3">
                  {day.slots.map((slot) => {
                    const canComplete = slot.dateKey <= todayDateKey;
                    return (
                      <div key={`${slot.hobbyId}:${slot.startAt}`} className="rounded-xl border border-white/[0.07] bg-white/[0.025] p-3.5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-white">{slot.hobbyName}</p>
                            <p className="mt-1 text-xs text-white/35">
                              {new Date(slot.startAt).toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit", timeZone: "Asia/Kolkata" })} · {slot.minutes} min
                            </p>
                          </div>
                          <button
                            type="button"
                            disabled={pending || !canComplete}
                            onClick={() =>
                              run(
                                () => completePlannedHobbySession(slot.hobbyId, slot.dateKey),
                                `${slot.hobbyName} marked complete.`,
                              )
                            }
                            className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#C6FF32]/20 px-2.5 py-1.5 text-[11px] font-medium text-[#DFFF87] disabled:border-white/10 disabled:text-white/25"
                          >
                            <Check className="h-3.5 w-3.5" /> {canComplete ? "Mark complete" : "Upcoming"}
                          </button>
                        </div>
                        <p className="mt-3 text-sm leading-5 text-white/60">{slot.focus}</p>
                        <p className="mt-2 text-xs leading-5 text-white/30">{slot.reason}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-5 rounded-2xl bg-white/[0.03] p-4 text-sm text-white/40">
            No additional practice slots are required for the rest of this week.
          </p>
        )}

        <div className="mt-4 flex items-center gap-2 text-xs text-white/30">
          <ShieldCheck className="h-3.5 w-3.5" />
          Only your explicit Finish, Log actual min, or Mark complete action creates completed practice. HSAKAA suggestions, synced Tasks and elapsed schedule time never do. Google Calendar availability is not inferred.
        </div>
      </section>

      <section className="grid gap-5 xl:grid-cols-2">
        {initialOverview.active.map((hobby) => {
          const targetProgress = hobby.weeklyTargetMinutes
            ? Math.round((hobby.weeklyMinutes / hobby.weeklyTargetMinutes) * 100)
            : 0;
          const availableResources = libraryItems.filter(
            (item) => !linkedIds.has(item._id) || hobby.linkedLibraryItemIds.includes(item._id),
          );
          return (
            <article key={hobby._id} className="rounded-[28px] border border-white/10 bg-white/[0.025] p-5 md:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Music2 className="h-4 w-4 text-[#C6FF32]" />
                    <p className="text-xs uppercase tracking-[0.17em] text-white/35">{hobby.intensity} · {hobby.status}</p>
                  </div>
                  <h2 className="mt-2 text-2xl font-semibold text-white">{hobby.name}</h2>
                  <p className="mt-1 text-sm text-white/45">{hobby.currentSkillLevel}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs ${
                      hobby.pace === "behind"
                        ? "border-amber-400/25 bg-amber-400/10 text-amber-200"
                        : "border-white/10 bg-white/[0.04] text-white/55"
                    }`}
                  >
                    {paceLabel(hobby.pace)}
                  </span>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => beginEditHobby(hobby._id)}
                    title={`Edit ${hobby.name}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/45 transition hover:border-[#C6FF32]/30 hover:bg-[#C6FF32]/[0.06] hover:text-[#DFFF87] disabled:opacity-40"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => removeHobby(hobby._id, hobby.name)}
                    title={`Remove ${hobby.name}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-red-400/15 text-red-200/55 transition hover:border-red-400/30 hover:bg-red-400/10 hover:text-red-100 disabled:opacity-40"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-5 space-y-2">
                <div className="flex items-center justify-between text-xs text-white/45">
                  <span>{minutesLabel(hobby.weeklyMinutes)} practiced</span>
                  <span>{minutesLabel(hobby.weeklyTargetMinutes)} target</span>
                </div>
                <Progress value={targetProgress} />
                <div className="flex items-center justify-between text-[11px] text-white/30">
                  <span>{hobby.sessionsThisWeek}/{hobby.targetSessionsPerWeek} sessions</span>
                  <span>{minutesLabel(hobby.remainingMinutes)} remaining</span>
                </div>
              </div>

              <div className="mt-5 rounded-2xl border border-white/[0.08] bg-black/20 p-4">
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-white/35">
                  <Target className="h-4 w-4" /> Current focus
                </div>
                <p className="mt-2 text-sm leading-6 text-white/70">{hobby.nextAction || "No next action set."}</p>
                {hobby.currentStage && (
                  <p className="mt-2 text-xs text-white/35">
                    Stage: {String(hobby.currentStage.title ?? hobby.currentStageKey ?? "Current")}
                    {hobby.totalStages ? ` · ${hobby.curriculumProgress}% curriculum` : ""}
                  </p>
                )}
              </div>

              <CoachingPanel
                hobby={hobby}
                pending={pending}
                onGenerate={(period) =>
                  run(
                    () => generateHobbyReview(hobby._id, period, true),
                    `${hobby.name} ${period} coaching review refreshed.`,
                  )
                }
              />

              {hobby.activeSession ? (
                <div className="mt-4 flex items-center justify-between rounded-2xl border border-[#C6FF32]/20 bg-[#C6FF32]/[0.06] p-4">
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-[#C6FF32]/70">Practice running</p>
                    <div className="mt-1"><RunningTimer startedAt={hobby.activeSession.startedAt} /></div>
                  </div>
                  <button
                    disabled={pending}
                    onClick={() => run(() => finishHobbySession(hobby.activeSession!._id), `${hobby.name} practice saved.`)}
                    className="inline-flex items-center gap-2 rounded-xl border border-white/15 px-3 py-2 text-sm text-white/75 disabled:opacity-50"
                  >
                    <Square className="h-3.5 w-3.5" /> Finish
                  </button>
                </div>
              ) : (
                <div className="mt-4 flex flex-wrap gap-2">
                  <button
                    disabled={pending}
                    onClick={() => run(() => startHobbySession(hobby._id, hobby.nextAction), `${hobby.name} practice started.`)}
                    className="inline-flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-sm font-semibold text-black disabled:opacity-50"
                  >
                    <Play className="h-4 w-4" /> Start timer
                  </button>
                  <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.025] p-1">
                    <input
                      type="number"
                      min={1}
                      max={300}
                      placeholder={`${hobby.recommendedSessionMinutes}`}
                      value={quickMinutes[hobby._id] ?? ""}
                      onChange={(event) => setQuickMinutes((current) => ({ ...current, [hobby._id]: event.target.value }))}
                      className="w-20 bg-transparent px-2 py-1 text-sm text-white outline-none placeholder:text-white/25"
                    />
                    <button
                      disabled={pending}
                      onClick={() => {
                        const minutes = Number(quickMinutes[hobby._id]);
                        if (!Number.isFinite(minutes) || minutes <= 0) {
                          setError("Enter the actual minutes you practiced.");
                          return;
                        }
                        run(
                          () => logHobbySession(hobby._id, { durationMinutes: Math.round(minutes), focus: hobby.nextAction }),
                          `${hobby.name}: ${Math.round(minutes)} minutes logged.`,
                        );
                      }}
                      className="rounded-lg bg-white/[0.08] px-3 py-1.5 text-xs text-white/70 disabled:opacity-50"
                    >
                      Log actual min
                    </button>
                  </div>
                </div>
              )}

              <section className="mt-5 border-t border-white/[0.07] pt-5">
                <div className="flex items-end justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-white/30">26-week curriculum</p>
                    <h3 className="mt-1 text-base font-semibold text-white/75">Step-by-step progression</h3>
                  </div>
                  <span className="text-xs text-white/30">{hobby.completedStages}/{hobby.totalStages} stages completed</span>
                </div>

                <div className="mt-4 space-y-3">
                  {hobby.curriculum.map((stage, stageIndex) => {
                    const startWeek = hobby.curriculum
                      .slice(0, stageIndex)
                      .reduce((sum, item) => sum + (item.targetWeeks ?? 0), 1);
                    const endWeek = startWeek + Math.max(1, stage.targetWeeks ?? 1) - 1;
                    const isCurrent = stage.status === "current";
                    const isCompleted = stage.status === "completed";
                    return (
                      <div
                        key={stage.key}
                        className={`rounded-2xl border p-4 ${
                          isCurrent
                            ? "border-[#C6FF32]/25 bg-[#C6FF32]/[0.055]"
                            : isCompleted
                              ? "border-white/[0.09] bg-white/[0.025]"
                              : "border-white/[0.06] bg-black/15 opacity-70"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex gap-3">
                            <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full border text-xs font-semibold ${
                              isCompleted
                                ? "border-[#C6FF32]/30 bg-[#C6FF32]/10 text-[#DFFF87]"
                                : isCurrent
                                  ? "border-[#C6FF32]/35 text-[#C6FF32]"
                                  : "border-white/15 text-white/30"
                            }`}>
                              {isCompleted ? <Check className="h-3.5 w-3.5" /> : stage.order}
                            </div>
                            <div>
                              <p className="text-[10px] uppercase tracking-[0.13em] text-white/30">
                                Step {stage.order} · Weeks {startWeek}–{endWeek}
                              </p>
                              <p className="mt-1 text-sm font-semibold text-white/80">{stage.title}</p>
                            </div>
                          </div>
                          <span className={`rounded-full border px-2.5 py-1 text-[10px] uppercase tracking-[0.12em] ${
                            isCurrent
                              ? "border-[#C6FF32]/25 text-[#DFFF87]"
                              : isCompleted
                                ? "border-white/10 text-white/45"
                                : "border-white/[0.07] text-white/25"
                          }`}>
                            {isCurrent ? "Current" : isCompleted ? "Completed" : "Locked"}
                          </span>
                        </div>

                        {stage.objective && <p className="mt-3 text-sm leading-6 text-white/55">{stage.objective}</p>}

                        <div className="mt-4 grid gap-3 md:grid-cols-2">
                          <div className="rounded-xl border border-white/[0.06] bg-black/15 p-3">
                            <p className="text-[10px] uppercase tracking-[0.12em] text-white/25">What to practice</p>
                            <ol className="mt-2 space-y-1.5 text-xs leading-5 text-white/45">
                              {stage.exercises.map((exercise, index) => (
                                <li key={exercise}>{index + 1}. {exercise}</li>
                              ))}
                            </ol>
                          </div>
                          <div className="rounded-xl border border-white/[0.06] bg-black/15 p-3">
                            <p className="text-[10px] uppercase tracking-[0.12em] text-white/25">Complete this step only when</p>
                            <ul className="mt-2 space-y-1.5 text-xs leading-5 text-white/45">
                              {stage.completionCriteria.map((criterion) => (
                                <li key={criterion}>• {criterion}</li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        {stage.focusAreas?.length > 0 && (
                          <p className="mt-3 text-[11px] leading-5 text-white/30">Focus: {stage.focusAreas.join(" · ")}</p>
                        )}

                        {isCurrent && hobby.status === "active" && (
                          <button
                            disabled={pending}
                            onClick={() => run(() => advanceHobby(hobby._id), `${hobby.name} moved to the next curriculum stage.`)}
                            className="mt-4 inline-flex items-center gap-2 rounded-xl border border-[#C6FF32]/20 px-3 py-2 text-xs text-[#DFFF87] disabled:opacity-50"
                          >
                            I completed this step <ArrowRight className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </section>

              <details className="mt-4 border-t border-white/[0.07] pt-4">
                <summary className="cursor-pointer text-sm font-medium text-white/60">Library resources</summary>
                <div className="mt-4 space-y-3">
                  {hobby.resources.length ? (
                    hobby.resources.map((resource) => (
                      <div key={resource._id} className="flex items-center gap-3 rounded-xl bg-white/[0.03] px-3 py-2.5">
                        <BookOpen className="h-4 w-4 text-white/35" />
                        <div className="min-w-0">
                          <p className="truncate text-sm text-white/70">{resource.title}</p>
                          <p className="text-xs text-white/30">{resource.type} · {resource.status}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-white/35">No Library resources linked yet.</p>
                  )}
                  <div className="flex gap-2">
                    <select
                      value={resourceChoice[hobby._id] ?? ""}
                      onChange={(event) => setResourceChoice((current) => ({ ...current, [hobby._id]: event.target.value }))}
                      className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#090D0F] px-3 py-2 text-xs text-white/65 outline-none"
                    >
                      <option value="">Link a Library item…</option>
                      {availableResources.map((item) => (
                        <option key={item._id} value={item._id}>{item.title}</option>
                      ))}
                    </select>
                    <button
                      disabled={pending || !resourceChoice[hobby._id]}
                      onClick={() => run(() => linkHobbyResource(hobby._id, resourceChoice[hobby._id]), "Library resource linked.")}
                      className="rounded-xl border border-white/10 px-3 py-2 text-xs text-white/60 disabled:opacity-35"
                    >
                      Link
                    </button>
                  </div>
                </div>
              </details>
            </article>
          );
        })}
      </section>

      {initialOverview.backlog.length > 0 && (
        <section className="rounded-[28px] border border-white/10 bg-white/[0.025] p-5 md:p-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.17em] text-white/35">
            <Clock3 className="h-4 w-4" /> Hobby backlog
          </div>
          <p className="mt-2 text-sm text-white/45">
            Saved for later. These do not count as active practice tracks.
          </p>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {initialOverview.backlog.map((hobby) => (
              <div
                key={hobby._id}
                className="flex items-start justify-between gap-3 rounded-2xl border border-white/[0.07] bg-black/15 p-4"
              >
                <div className="min-w-0">
                  <p className="font-medium text-white/75">{hobby.name}</p>
                  <p className="mt-1 text-xs text-white/35">
                    {minutesLabel(hobby.weeklyTargetMinutes)} / week · {hobby.targetSessionsPerWeek} sessions
                  </p>
                  {hobby.goal && <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/40">{hobby.goal}</p>}
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => beginEditHobby(hobby._id)}
                    title={`Edit ${hobby.name}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-white/10 text-white/45 transition hover:border-[#C6FF32]/30 hover:bg-[#C6FF32]/[0.06] hover:text-[#DFFF87] disabled:opacity-40"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => removeHobby(hobby._id, hobby.name)}
                    title={`Remove ${hobby.name}`}
                    className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-red-400/15 text-red-200/55 transition hover:border-red-400/30 hover:bg-red-400/10 hover:text-red-100 disabled:opacity-40"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="grid gap-5 lg:grid-cols-[1.15fr_0.85fr]">
        <div className="rounded-[28px] border border-white/10 bg-white/[0.025] p-5 md:p-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.17em] text-white/35">
            <Gauge className="h-4 w-4" /> Learning load
          </div>
          <div className="mt-4 flex items-end gap-3">
            <p className="text-3xl font-semibold text-white">{initialOverview.learningLoad.load}</p>
            <p className="pb-1 text-sm text-white/35">{minutesLabel(initialOverview.learningLoad.weeklyTargetMinutes)} / week</p>
          </div>
          <p className="mt-3 text-sm leading-6 text-white/50">{initialOverview.learningLoad.recommendation}</p>
          <button
            disabled={pending}
            onClick={() => run(syncHobbyPracticeTasks, "Practice-task sync complete.")}
            className="mt-5 inline-flex items-center gap-2 rounded-xl border border-white/10 px-3 py-2 text-xs text-white/60 disabled:opacity-50"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Sync practice tasks
          </button>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.025] p-5 md:p-6">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.17em] text-white/35">
            <Clock3 className="h-4 w-4" /> Next hobby
          </div>
          <h3 className="mt-4 text-2xl font-semibold text-white">{initialOverview.nextHobby.hobby?.name ?? "No candidate yet"}</h3>
          {initialOverview.nextHobby.hobby && (
            <p className="mt-1 text-xs text-white/35">
              HSAKAA fit {initialOverview.nextHobby.hobby.score}/10 · ~{minutesLabel(initialOverview.nextHobby.hobby.expectedWeeklyMinutes)}/week
            </p>
          )}
          <p className="mt-3 text-sm leading-6 text-white/50">{initialOverview.nextHobby.reason}</p>
          {initialOverview.nextHobby.hobby?.note && (
            <p className="mt-3 rounded-xl bg-white/[0.03] p-3 text-xs leading-5 text-white/40">{initialOverview.nextHobby.hobby.note}</p>
          )}
        </div>
      </section>

      <p className="text-xs text-white/25">{initialOverview.trackingNote}</p>
    </div>
  );
}

function Field({
  label,
  className = "",
  children,
}: {
  label: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1.5 block text-[11px] uppercase tracking-[0.12em] text-white/35">{label}</span>
      {children}
    </label>
  );
}

function CoachingPanel({
  hobby,
  pending,
  onGenerate,
}: {
  hobby: HobbyCard;
  pending: boolean;
  onGenerate: (period: "weekly" | "monthly") => void;
}) {
  const review = hobby.latestReview;
  return (
    <details className="mt-4 rounded-2xl border border-[#C6FF32]/10 bg-[#C6FF32]/[0.025] p-4">
      <summary className="cursor-pointer list-none">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-[#C6FF32]/70">
            <Brain className="h-4 w-4" /> HSAKAA Coach
          </div>
          <span className="text-xs text-white/30">
            {review ? `${review.period} review` : "No review yet"}
          </span>
        </div>
        {review?.summary ? (
          <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/60">{review.summary}</p>
        ) : (
          <p className="mt-2 text-sm text-white/40">Generate a review after real practice to calibrate the next block.</p>
        )}
      </summary>

      <div className="mt-4 space-y-4 border-t border-white/[0.07] pt-4">
        <div className="flex flex-wrap gap-2">
          <button
            disabled={pending}
            onClick={() => onGenerate("weekly")}
            className="rounded-xl border border-white/10 px-3 py-2 text-xs text-white/60 disabled:opacity-40"
          >
            Refresh weekly review
          </button>
          <button
            disabled={pending}
            onClick={() => onGenerate("monthly")}
            className="rounded-xl border border-white/10 px-3 py-2 text-xs text-white/60 disabled:opacity-40"
          >
            Refresh monthly review
          </button>
        </div>

        {review && (
          <>
            <div className="grid gap-3 sm:grid-cols-3">
              <CoachMetric label="Practice" value={`${review.metrics.practiceMinutes}m`} hint={`${review.metrics.minutesAdherence}% of time target`} />
              <CoachMetric label="Sessions" value={String(review.metrics.sessions)} hint={`${review.metrics.sessionAdherence}% of session target`} />
              <CoachMetric label="Coach says" value={review.curriculumRecommendation} hint="curriculum recommendation" />
            </div>

            {review.nextFocus && (
              <div className="rounded-xl bg-white/[0.035] p-3.5">
                <p className="text-[10px] uppercase tracking-[0.14em] text-white/30">Next focus</p>
                <p className="mt-1 text-sm leading-6 text-white/70">{review.nextFocus}</p>
              </div>
            )}

            {(review.wins.length > 0 || review.stuckPoints.length > 0) && (
              <div className="grid gap-3 sm:grid-cols-2">
                <CoachList title="What improved" items={review.wins} />
                <CoachList title="What is stuck" items={review.stuckPoints} />
              </div>
            )}

            {review.nextPlan.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-white/35">
                  <BarChart3 className="h-3.5 w-3.5" /> Next practice blocks
                </div>
                <div className="mt-2 space-y-2">
                  {review.nextPlan.map((block, index) => (
                    <div key={`${block.focus}:${index}`} className="flex gap-3 rounded-xl bg-black/20 p-3">
                      <span className="shrink-0 text-xs font-semibold text-[#C6FF32]">{block.minutes}m</span>
                      <div>
                        <p className="text-sm text-white/65">{block.focus}</p>
                        {block.reason && <p className="mt-1 text-xs leading-5 text-white/30">{block.reason}</p>}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {review.resourceSearchTerms.length > 0 && (
              <div>
                <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-white/35">
                  <Search className="h-3.5 w-3.5" /> Resource topics to find next
                </div>
                <div className="mt-2 flex flex-wrap gap-2">
                  {review.resourceSearchTerms.map((term) => (
                    <span key={term} className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-white/45">{term}</span>
                  ))}
                </div>
              </div>
            )}

            {review.evidenceComparison && (
              <div className="rounded-xl border border-white/[0.07] p-3.5">
                <p className="text-[10px] uppercase tracking-[0.14em] text-white/30">Evidence comparison</p>
                {review.evidenceComparison.summary && (
                  <p className="mt-2 text-sm leading-6 text-white/55">{review.evidenceComparison.summary}</p>
                )}
                {review.evidenceComparison.observedChanges.length > 0 && (
                  <ul className="mt-2 space-y-1 text-xs leading-5 text-white/40">
                    {review.evidenceComparison.observedChanges.map((change) => <li key={change}>• {change}</li>)}
                  </ul>
                )}
                {review.evidenceComparison.requiresMultimodalReview && (
                  <p className="mt-3 rounded-lg bg-amber-400/[0.07] p-2.5 text-xs leading-5 text-amber-100/65">
                    Audio/video/photo evidence is attached, but this text review did not inspect the media itself. HSAKAA will not claim an improvement from that file until multimodal review is enabled.
                  </p>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </details>
  );
}

function CoachMetric({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-xl bg-white/[0.03] p-3">
      <p className="text-[10px] uppercase tracking-[0.12em] text-white/25">{label}</p>
      <p className="mt-1 text-lg font-semibold capitalize text-white/80">{value}</p>
      <p className="mt-0.5 text-[11px] text-white/30">{hint}</p>
    </div>
  );
}

function CoachList({ title, items }: { title: string; items: string[] }) {
  return (
    <div className="rounded-xl bg-white/[0.03] p-3.5">
      <p className="text-[10px] uppercase tracking-[0.12em] text-white/30">{title}</p>
      {items.length ? (
        <ul className="mt-2 space-y-1 text-xs leading-5 text-white/50">
          {items.map((item) => <li key={item}>• {item}</li>)}
        </ul>
      ) : (
        <p className="mt-2 text-xs text-white/25">Nothing reliable to report yet.</p>
      )}
    </div>
  );
}

function Metric({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.025] p-4">
      <p className="text-xs uppercase tracking-[0.14em] text-white/30">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      <p className="mt-1 text-xs leading-5 text-white/35">{hint}</p>
    </div>
  );
}
