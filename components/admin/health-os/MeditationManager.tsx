"use client";

import { useMemo, useState } from "react";
import {
  Brain,
  CheckCircle2,
  Clock3,
  Heart,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Square,
  Trash2,
  X,
} from "lucide-react";

import { AdminStatCard } from "@/components/admin/AdminStatCard";
import {
  createMeditationEntry,
  deleteMeditationEntry,
  toggleMeditationFavourite,
  transitionMeditation,
  updateMeditationEntry,
  updateMeditationReflection,
} from "@/lib/api/personal-health";
import type {
  MeditationEntry,
  MeditationEnvironment,
  MeditationMood,
  MeditationPayload,
  MeditationPosition,
  MeditationSummary,
  MeditationType,
} from "@/types/health-os";

type Props = {
  initialEntries: MeditationEntry[];
  initialSummary: MeditationSummary;
};

type FormState = {
  date: string;
  title: string;
  type: MeditationType;
  position: MeditationPosition;
  environment: MeditationEnvironment | "";
  plannedDurationMinutes: string;
  technique: string;
  guideName: string;
  appName: string;
  notes: string;
};

type ReflectionState = {
  focusScore: string;
  satisfactionScore: string;
  calmnessBefore: string;
  calmnessAfter: string;
  stressBefore: string;
  stressAfter: string;
  moodBefore: MeditationMood | "";
  moodAfter: MeditationMood | "";
  insights: string;
  benefits: string;
  notes: string;
};

const inputClass =
  "min-h-11 w-full rounded-[14px] border border-white/10 bg-[#080b0d] px-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-[#C6FF32]/50";

const types: MeditationType[] = [
  "mindfulness",
  "breathing",
  "body_scan",
  "guided",
  "mantra",
  "visualization",
  "loving_kindness",
  "walking",
  "sleep",
  "sound",
  "prayer",
  "other",
];

const positions: MeditationPosition[] = ["sitting", "lying", "standing", "walking", "other"];
const environments: MeditationEnvironment[] = ["indoor", "outdoor", "office", "home", "travel", "other"];
const moods: MeditationMood[] = ["very_calm", "calm", "neutral", "restless", "stressed", "anxious", "low", "energetic"];

function label(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function todayInputValue() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function emptyForm(): FormState {
  return {
    date: todayInputValue(),
    title: "",
    type: "mindfulness",
    position: "sitting",
    environment: "home",
    plannedDurationMinutes: "10",
    technique: "",
    guideName: "",
    appName: "",
    notes: "",
  };
}

function emptyReflection(entry?: MeditationEntry): ReflectionState {
  return {
    focusScore: String(entry?.focusScore ?? ""),
    satisfactionScore: String(entry?.satisfactionScore ?? ""),
    calmnessBefore: String(entry?.calmnessBefore ?? ""),
    calmnessAfter: String(entry?.calmnessAfter ?? ""),
    stressBefore: String(entry?.stressBefore ?? ""),
    stressAfter: String(entry?.stressAfter ?? ""),
    moodBefore: entry?.moodBefore ?? "",
    moodAfter: entry?.moodAfter ?? "",
    insights: (entry?.insights ?? []).join(", "),
    benefits: (entry?.benefits ?? []).join(", "),
    notes: entry?.notes ?? "",
  };
}

function optionalScore(value: string) {
  if (!value.trim()) return undefined;
  const number = Number(value);
  return Number.isFinite(number) ? number : undefined;
}

function commaList(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

export function MeditationManager({ initialEntries, initialSummary }: Props) {
  const [entries, setEntries] = useState(initialEntries);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(initialEntries.length === 0);
  const [reflectionId, setReflectionId] = useState<string | null>(null);
  const [reflection, setReflection] = useState<ReflectionState>(emptyReflection());
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const liveSummary = useMemo(() => {
    const completed = entries.filter((entry) => entry.status === "completed");
    const finished = entries.filter((entry) =>
      ["completed", "skipped", "abandoned"].includes(entry.status),
    );
    const totalMinutes = completed.reduce(
      (sum, entry) => sum + (entry.actualDurationMinutes ?? 0),
      0,
    );
    const focusScores = completed
      .map((entry) => entry.focusScore)
      .filter((value): value is number => typeof value === "number");

    return {
      totalSessions: entries.length,
      completedSessions: completed.length,
      totalMinutes,
      completionRate: finished.length
        ? (completed.length / finished.length) * 100
        : 0,
      averageFocus: focusScores.length
        ? focusScores.reduce((sum, value) => sum + value, 0) / focusScores.length
        : initialSummary.averageFocusScore,
    };
  }, [entries, initialSummary.averageFocusScore]);

  function beginCreate() {
    setEditingId(null);
    setForm(emptyForm());
    setShowForm(true);
    setError("");
  }

  function beginEdit(entry: MeditationEntry) {
    setEditingId(entry._id);
    setForm({
      date: entry.date.slice(0, 10),
      title: entry.title,
      type: entry.type,
      position: entry.position,
      environment: entry.environment ?? "",
      plannedDurationMinutes: String(entry.plannedDurationMinutes ?? 0),
      technique: entry.technique ?? "",
      guideName: entry.guideName ?? "",
      appName: entry.appName ?? "",
      notes: entry.notes ?? "",
    });
    setShowForm(true);
    setError("");
  }

  function buildPayload(): MeditationPayload {
    return {
      date: form.date,
      title: form.title.trim(),
      type: form.type,
      position: form.position,
      environment: form.environment || undefined,
      plannedDurationMinutes: Number(form.plannedDurationMinutes || 0),
      technique: form.technique.trim() || undefined,
      guideName: form.guideName.trim() || undefined,
      appName: form.appName.trim() || undefined,
      notes: form.notes.trim() || undefined,
    };
  }

  async function saveSession() {
    if (!form.title.trim() || !form.date) {
      setError("Title and date are required.");
      return;
    }

    try {
      setBusyId("form");
      setError("");
      const payload = buildPayload();
      const saved = editingId
        ? await updateMeditationEntry(editingId, payload)
        : await createMeditationEntry(payload);
      setEntries((current) => [saved, ...current.filter((entry) => entry._id !== saved._id)].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
      setShowForm(false);
      setEditingId(null);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to save meditation session.");
    } finally {
      setBusyId(null);
    }
  }

  async function runAction(entry: MeditationEntry, action: "start" | "pause" | "resume" | "complete" | "skip" | "abandon") {
    try {
      setBusyId(entry._id);
      setError("");
      const body = action === "complete"
        ? { actualDurationMinutes: entry.actualDurationMinutes || entry.plannedDurationMinutes }
        : undefined;
      const updated = await transitionMeditation(entry._id, action, body);
      setEntries((current) => current.map((item) => item._id === updated._id ? updated : item));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : `Unable to ${action} session.`);
    } finally {
      setBusyId(null);
    }
  }

  async function toggleFavourite(entry: MeditationEntry) {
    try {
      setBusyId(entry._id);
      const updated = await toggleMeditationFavourite(entry._id);
      setEntries((current) => current.map((item) => item._id === updated._id ? updated : item));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to update favourite.");
    } finally {
      setBusyId(null);
    }
  }

  function beginReflection(entry: MeditationEntry) {
    setReflectionId(entry._id);
    setReflection(emptyReflection(entry));
    setError("");
  }

  async function saveReflection() {
    if (!reflectionId) return;

    try {
      setBusyId(reflectionId);
      setError("");
      const payload: Partial<MeditationPayload> = {
        focusScore: optionalScore(reflection.focusScore),
        satisfactionScore: optionalScore(reflection.satisfactionScore),
        calmnessBefore: optionalScore(reflection.calmnessBefore),
        calmnessAfter: optionalScore(reflection.calmnessAfter),
        stressBefore: optionalScore(reflection.stressBefore),
        stressAfter: optionalScore(reflection.stressAfter),
        moodBefore: reflection.moodBefore || undefined,
        moodAfter: reflection.moodAfter || undefined,
        insights: commaList(reflection.insights),
        benefits: commaList(reflection.benefits),
        notes: reflection.notes.trim() || undefined,
      };
      const updated = await updateMeditationReflection(reflectionId, payload);
      setEntries((current) => current.map((item) => item._id === updated._id ? updated : item));
      setReflectionId(null);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to save reflection.");
    } finally {
      setBusyId(null);
    }
  }

  async function remove(entry: MeditationEntry) {
    if (!window.confirm(`Delete meditation session “${entry.title}”?`)) return;

    try {
      setBusyId(entry._id);
      setError("");
      await deleteMeditationEntry(entry._id);
      setEntries((current) => current.filter((item) => item._id !== entry._id));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to delete meditation session.");
    } finally {
      setBusyId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-4">
        <AdminStatCard label="Sessions" value={liveSummary.totalSessions} description="Sessions in the current 30-day view" icon={Brain} />
        <AdminStatCard label="Completed" value={liveSummary.completedSessions} description={`${Math.round(liveSummary.completionRate)}% completion rate`} icon={CheckCircle2} />
        <AdminStatCard label="Minutes" value={liveSummary.totalMinutes} description="Completed meditation minutes" icon={Clock3} />
        <AdminStatCard label="Focus" value={liveSummary.averageFocus ? liveSummary.averageFocus.toFixed(1) : "—"} description="Average focus score on completed sessions" icon={Heart} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h2 className="text-xl font-black">Meditation sessions</h2><p className="mt-1 text-sm text-white/40">Plan, run and reflect on meditation without leaving the Personal OS.</p></div>
        <button type="button" onClick={beginCreate} className="inline-flex min-h-11 items-center gap-2 rounded-[14px] bg-[#C6FF32] px-4 text-sm font-black text-[#030608]"><Plus className="h-4 w-4" /> New session</button>
      </div>

      {error ? <div className="rounded-[16px] border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">{error}</div> : null}

      {showForm ? (
        <section className="rounded-[24px] border border-[#C6FF32]/20 bg-[#C6FF32]/[0.035] p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#C6FF32]">{editingId ? "Edit session" : "New session"}</p><h3 className="mt-2 text-2xl font-black">{editingId ? "Update meditation" : "Plan meditation"}</h3></div><button type="button" onClick={() => setShowForm(false)} className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-white/45"><X className="h-4 w-4" /></button></div>
          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <label className="space-y-2 text-sm text-white/55">Date<input type="date" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} className={inputClass} /></label>
            <label className="space-y-2 text-sm text-white/55 lg:col-span-2">Title<input value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} className={inputClass} placeholder="Morning reset" /></label>
            <label className="space-y-2 text-sm text-white/55">Minutes<input type="number" min="0" value={form.plannedDurationMinutes} onChange={(event) => setForm((current) => ({ ...current, plannedDurationMinutes: event.target.value }))} className={inputClass} /></label>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <label className="space-y-2 text-sm text-white/55">Type<select value={form.type} onChange={(event) => setForm((current) => ({ ...current, type: event.target.value as MeditationType }))} className={inputClass}>{types.map((value) => <option key={value} value={value}>{label(value)}</option>)}</select></label>
            <label className="space-y-2 text-sm text-white/55">Position<select value={form.position} onChange={(event) => setForm((current) => ({ ...current, position: event.target.value as MeditationPosition }))} className={inputClass}>{positions.map((value) => <option key={value} value={value}>{label(value)}</option>)}</select></label>
            <label className="space-y-2 text-sm text-white/55">Environment<select value={form.environment} onChange={(event) => setForm((current) => ({ ...current, environment: event.target.value as MeditationEnvironment }))} className={inputClass}><option value="">Not set</option>{environments.map((value) => <option key={value} value={value}>{label(value)}</option>)}</select></label>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <label className="space-y-2 text-sm text-white/55">Technique<input value={form.technique} onChange={(event) => setForm((current) => ({ ...current, technique: event.target.value }))} className={inputClass} placeholder="Box breathing" /></label>
            <label className="space-y-2 text-sm text-white/55">Guide<input value={form.guideName} onChange={(event) => setForm((current) => ({ ...current, guideName: event.target.value }))} className={inputClass} /></label>
            <label className="space-y-2 text-sm text-white/55">App<input value={form.appName} onChange={(event) => setForm((current) => ({ ...current, appName: event.target.value }))} className={inputClass} /></label>
          </div>
          <label className="mt-4 block space-y-2 text-sm text-white/55">Notes<textarea rows={3} value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} className={`${inputClass} py-3`} /></label>
          <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setShowForm(false)} className="min-h-11 rounded-[14px] border border-white/10 px-4 text-sm font-bold text-white/55">Cancel</button><button type="button" disabled={busyId === "form"} onClick={saveSession} className="min-h-11 rounded-[14px] bg-[#C6FF32] px-5 text-sm font-black text-[#030608] disabled:opacity-50">{busyId === "form" ? "Saving..." : editingId ? "Save changes" : "Create session"}</button></div>
        </section>
      ) : null}

      {reflectionId ? (
        <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5 sm:p-6">
          <div className="flex items-center justify-between"><div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#C6FF32]">Reflection</p><h3 className="mt-2 text-2xl font-black">Capture the effect</h3></div><button type="button" onClick={() => setReflectionId(null)} className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-white/45"><X className="h-4 w-4" /></button></div>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-6">
            {[ ["Focus", "focusScore"], ["Satisfaction", "satisfactionScore"], ["Calm before", "calmnessBefore"], ["Calm after", "calmnessAfter"], ["Stress before", "stressBefore"], ["Stress after", "stressAfter"] ].map(([title, key]) => <label key={key} className="space-y-2 text-sm text-white/55">{title}<input type="number" min="0" max="10" step="0.1" value={reflection[key as keyof Pick<ReflectionState, "focusScore" | "satisfactionScore" | "calmnessBefore" | "calmnessAfter" | "stressBefore" | "stressAfter">]} onChange={(event) => setReflection((current) => ({ ...current, [key]: event.target.value }))} className={inputClass} /></label>)}
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2"><label className="space-y-2 text-sm text-white/55">Mood before<select value={reflection.moodBefore} onChange={(event) => setReflection((current) => ({ ...current, moodBefore: event.target.value as MeditationMood }))} className={inputClass}><option value="">Not set</option>{moods.map((value) => <option key={value} value={value}>{label(value)}</option>)}</select></label><label className="space-y-2 text-sm text-white/55">Mood after<select value={reflection.moodAfter} onChange={(event) => setReflection((current) => ({ ...current, moodAfter: event.target.value as MeditationMood }))} className={inputClass}><option value="">Not set</option>{moods.map((value) => <option key={value} value={value}>{label(value)}</option>)}</select></label></div>
          <div className="mt-4 grid gap-4 md:grid-cols-2"><label className="space-y-2 text-sm text-white/55">Insights <span className="text-white/25">comma separated</span><input value={reflection.insights} onChange={(event) => setReflection((current) => ({ ...current, insights: event.target.value }))} className={inputClass} /></label><label className="space-y-2 text-sm text-white/55">Benefits <span className="text-white/25">comma separated</span><input value={reflection.benefits} onChange={(event) => setReflection((current) => ({ ...current, benefits: event.target.value }))} className={inputClass} /></label></div>
          <label className="mt-4 block space-y-2 text-sm text-white/55">Reflection notes<textarea rows={3} value={reflection.notes} onChange={(event) => setReflection((current) => ({ ...current, notes: event.target.value }))} className={`${inputClass} py-3`} /></label>
          <div className="mt-5 flex justify-end"><button type="button" disabled={busyId === reflectionId} onClick={saveReflection} className="min-h-11 rounded-[14px] bg-[#C6FF32] px-5 text-sm font-black text-[#030608] disabled:opacity-50">Save reflection</button></div>
        </section>
      ) : null}

      <div className="space-y-4">
        {entries.length === 0 ? <div className="rounded-[24px] border border-dashed border-white/10 p-10 text-center text-white/35">No meditation sessions yet.</div> : entries.map((entry) => (
          <article key={entry._id} className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5">
            <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex gap-4"><div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#C6FF32]/10 text-[#C6FF32]"><Brain className="h-5 w-5" /></div><div><div className="flex flex-wrap items-center gap-2"><h3 className="text-lg font-black">{entry.title}</h3>{entry.isFavourite ? <Heart className="h-4 w-4 fill-[#C6FF32] text-[#C6FF32]" /> : null}</div><p className="mt-1 text-sm text-white/35">{new Date(entry.date).toLocaleDateString("en-IN", { day: "numeric", month: "short" })} · {label(entry.type)} · {entry.actualDurationMinutes || entry.plannedDurationMinutes} min · {label(entry.status)}</p></div></div>
              <div className="flex flex-wrap gap-2">
                {entry.status === "planned" ? <button type="button" disabled={busyId === entry._id} onClick={() => runAction(entry, "start")} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#C6FF32] px-3 text-xs font-black text-[#030608]"><Play className="h-3.5 w-3.5" /> Start</button> : null}
                {entry.status === "in_progress" ? <button type="button" disabled={busyId === entry._id} onClick={() => runAction(entry, "pause")} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-black text-white/60"><Pause className="h-3.5 w-3.5" /> Pause</button> : null}
                {entry.status === "paused" ? <button type="button" disabled={busyId === entry._id} onClick={() => runAction(entry, "resume")} className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-black text-white/60"><RotateCcw className="h-3.5 w-3.5" /> Resume</button> : null}
                {["in_progress", "paused"].includes(entry.status) ? <button type="button" disabled={busyId === entry._id} onClick={() => runAction(entry, "complete")} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#C6FF32] px-3 text-xs font-black text-[#030608]"><Square className="h-3.5 w-3.5" /> Complete</button> : null}
                {entry.status === "planned" ? <button type="button" disabled={busyId === entry._id} onClick={() => runAction(entry, "skip")} className="min-h-10 rounded-xl border border-white/10 px-3 text-xs font-black text-white/45">Skip</button> : null}
                <button type="button" onClick={() => beginReflection(entry)} className="min-h-10 rounded-xl border border-white/10 px-3 text-xs font-black text-white/45">Reflection</button>
                <button type="button" disabled={busyId === entry._id} onClick={() => toggleFavourite(entry)} className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-white/40"><Heart className={`h-4 w-4 ${entry.isFavourite ? "fill-[#C6FF32] text-[#C6FF32]" : ""}`} /></button>
                <button type="button" onClick={() => beginEdit(entry)} className="min-h-10 rounded-xl border border-white/10 px-3 text-xs font-black text-white/45">Edit</button>
                <button type="button" disabled={busyId === entry._id} onClick={() => remove(entry)} className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-white/35 hover:text-red-300"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
            {(entry.focusScore !== undefined || entry.satisfactionScore !== undefined || entry.notes) ? <div className="mt-4 grid gap-3 border-t border-white/10 pt-4 sm:grid-cols-3"><div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/25">Focus</p><p className="mt-1 text-sm font-bold">{entry.focusScore ?? "—"}/10</p></div><div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/25">Satisfaction</p><p className="mt-1 text-sm font-bold">{entry.satisfactionScore ?? "—"}/10</p></div><div><p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/25">Notes</p><p className="mt-1 line-clamp-2 text-sm text-white/45">{entry.notes || "—"}</p></div></div> : null}
          </article>
        ))}
      </div>
    </div>
  );
}
