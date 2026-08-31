"use client";

import { useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  Plus,
  Save,
  Trash2,
  Utensils,
  X,
} from "lucide-react";

import { AdminStatCard } from "@/components/admin/AdminStatCard";
import {
  createDietEntry,
  deleteDietEntry,
  updateDietEntry,
  updateDietMealStatus,
} from "@/lib/api/personal-health";
import type {
  DietEntry,
  DietEntryPayload,
  DietGoal,
  DietPreference,
  MealStatus,
  MealType,
} from "@/types/health-os";

type Props = {
  initialEntries: DietEntry[];
};

type MealDraft = {
  type: MealType;
  title: string;
  status: MealStatus;
  plannedAt?: string;
  consumedAt?: string;
  plannedItems?: DietEntry["meals"][number]["plannedItems"];
  consumedItems?: DietEntry["meals"][number]["consumedItems"];
  completionPercentage?: number;
  skipReason?: string;
  replacementReason?: string;
  notes?: string;
};

type FormState = {
  date: string;
  preference: DietPreference;
  goal: DietGoal;
  calories: string;
  protein: string;
  carbs: string;
  fat: string;
  water: string;
  notes: string;
  meals: MealDraft[];
};

const mealTypes: MealType[] = [
  "early_morning",
  "breakfast",
  "mid_morning",
  "lunch",
  "evening_snack",
  "pre_workout",
  "post_workout",
  "dinner",
  "bedtime",
  "other",
];

const preferences: DietPreference[] = [
  "vegetarian",
  "non_vegetarian",
  "vegan",
  "eggetarian",
  "pescatarian",
  "flexitarian",
];

const goals: DietGoal[] = [
  "fat_loss",
  "muscle_gain",
  "maintenance",
  "performance",
  "recovery",
  "general_health",
];

const inputClass =
  "min-h-11 w-full rounded-[14px] border border-white/10 bg-[#080b0d] px-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-[#C6FF32]/50";

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
    preference: "vegetarian",
    goal: "general_health",
    calories: "",
    protein: "",
    carbs: "",
    fat: "",
    water: "",
    notes: "",
    meals: [
      { type: "breakfast", title: "Breakfast", status: "planned" },
      { type: "lunch", title: "Lunch", status: "planned" },
      { type: "dinner", title: "Dinner", status: "planned" },
    ],
  };
}

function numberOrUndefined(value: string) {
  const parsed = Number(value);
  return value.trim() && Number.isFinite(parsed) ? parsed : undefined;
}

function label(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function DietManager({ initialEntries }: Props) {
  const [entries, setEntries] = useState(initialEntries);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(initialEntries.length === 0);
  const [expandedId, setExpandedId] = useState<string | null>(initialEntries[0]?._id ?? null);
  const [busy, setBusy] = useState(false);
  const [busyMeal, setBusyMeal] = useState<string | null>(null);
  const [error, setError] = useState("");

  const stats = useMemo(() => {
    const recent = entries.slice(0, 7);
    const adherenceValues = recent
      .map((entry) => entry.adherence?.overallPercentage)
      .filter((value): value is number => typeof value === "number");

    const completedMeals = recent.reduce(
      (total, entry) =>
        total + entry.meals.filter((meal) => meal.status === "completed").length,
      0,
    );
    const totalMeals = recent.reduce((total, entry) => total + entry.meals.length, 0);

    return {
      days: entries.length,
      adherence: adherenceValues.length
        ? Math.round(adherenceValues.reduce((sum, value) => sum + value, 0) / adherenceValues.length)
        : 0,
      meals: totalMeals ? Math.round((completedMeals / totalMeals) * 100) : 0,
    };
  }, [entries]);

  function beginCreate() {
    setEditingId(null);
    setForm(emptyForm());
    setShowForm(true);
    setError("");
  }

  function beginEdit(entry: DietEntry) {
    setEditingId(entry._id);
    setForm({
      date: entry.date.slice(0, 10),
      preference: entry.preference ?? "vegetarian",
      goal: entry.targets?.goal ?? "general_health",
      calories: String(entry.targets?.nutrition?.calories ?? ""),
      protein: String(entry.targets?.nutrition?.proteinGrams ?? ""),
      carbs: String(entry.targets?.nutrition?.carbohydratesGrams ?? ""),
      fat: String(entry.targets?.nutrition?.fatGrams ?? ""),
      water: String(entry.targets?.waterLitres ?? ""),
      notes: entry.notes ?? "",
      meals: entry.meals.map((meal) => ({
        type: meal.type,
        title: meal.title ?? label(meal.type),
        status: meal.status,
        plannedAt: meal.plannedAt,
        consumedAt: meal.consumedAt,
        plannedItems: meal.plannedItems,
        consumedItems: meal.consumedItems,
        completionPercentage: meal.completionPercentage,
        skipReason: meal.skipReason,
        replacementReason: meal.replacementReason,
        notes: meal.notes,
      })),
    });
    setShowForm(true);
    setError("");
  }

  function buildPayload(): DietEntryPayload {
    return {
      date: form.date,
      preference: form.preference,
      targets: {
        goal: form.goal,
        nutrition: {
          calories: numberOrUndefined(form.calories),
          proteinGrams: numberOrUndefined(form.protein),
          carbohydratesGrams: numberOrUndefined(form.carbs),
          fatGrams: numberOrUndefined(form.fat),
        },
        waterLitres: numberOrUndefined(form.water),
        mealsCount: form.meals.length,
      },
      meals: form.meals.map((meal) => ({
        type: meal.type,
        title: meal.title.trim() || undefined,
        status: meal.status,
        plannedAt: meal.plannedAt,
        consumedAt: meal.consumedAt,
        plannedItems: meal.plannedItems,
        consumedItems: meal.consumedItems,
        completionPercentage: meal.completionPercentage,
        skipReason: meal.skipReason,
        replacementReason: meal.replacementReason,
        notes: meal.notes,
      })),
      notes: form.notes.trim() || undefined,
    };
  }

  async function handleSave() {
    if (!form.date) {
      setError("Date is required.");
      return;
    }

    try {
      setBusy(true);
      setError("");
      const payload = buildPayload();
      const saved = editingId
        ? await updateDietEntry(editingId, payload)
        : await createDietEntry(payload);

      setEntries((current) =>
        [saved, ...current.filter((entry) => entry._id !== saved._id)].sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        ),
      );
      setExpandedId(saved._id);
      setShowForm(false);
      setEditingId(null);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to save diet entry.");
    } finally {
      setBusy(false);
    }
  }

  async function handleMealStatus(entry: DietEntry, index: number, status: MealStatus) {
    const key = `${entry._id}-${index}`;
    try {
      setBusyMeal(key);
      setError("");
      const updated = await updateDietMealStatus(entry._id, index, status);
      setEntries((current) => current.map((item) => (item._id === updated._id ? updated : item)));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to update meal.");
    } finally {
      setBusyMeal(null);
    }
  }

  async function handleDelete(entry: DietEntry) {
    if (!window.confirm(`Delete diet entry for ${new Date(entry.date).toLocaleDateString()}?`)) {
      return;
    }

    try {
      setBusy(true);
      setError("");
      await deleteDietEntry(entry._id);
      setEntries((current) => current.filter((item) => item._id !== entry._id));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to delete diet entry.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <AdminStatCard label="Tracked days" value={stats.days} description="Diet entries currently available" icon={Utensils} />
        <AdminStatCard label="7-day adherence" value={`${stats.adherence}%`} description="Average overall plan adherence" icon={Check} />
        <AdminStatCard label="Meal completion" value={`${stats.meals}%`} description="Completed meals across recent entries" icon={Save} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black">Daily plans</h2>
          <p className="mt-1 text-sm text-white/40">Set nutrition targets and update meal completion during the day.</p>
        </div>
        <button type="button" onClick={beginCreate} className="inline-flex min-h-11 items-center gap-2 rounded-[14px] bg-[#C6FF32] px-4 text-sm font-black text-[#030608]">
          <Plus className="h-4 w-4" /> New day
        </button>
      </div>

      {error ? <div className="rounded-[16px] border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">{error}</div> : null}

      {showForm ? (
        <section className="rounded-[24px] border border-[#C6FF32]/20 bg-[#C6FF32]/[0.035] p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#C6FF32]">{editingId ? "Edit plan" : "New plan"}</p>
              <h3 className="mt-2 text-2xl font-black">{editingId ? "Update diet day" : "Plan a diet day"}</h3>
            </div>
            <button type="button" onClick={() => setShowForm(false)} className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-white/45 hover:text-white"><X className="h-4 w-4" /></button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <label className="space-y-2 text-sm text-white/55">Date<input type="date" value={form.date} onChange={(event) => setForm((current) => ({ ...current, date: event.target.value }))} className={inputClass} /></label>
            <label className="space-y-2 text-sm text-white/55">Preference<select value={form.preference} onChange={(event) => setForm((current) => ({ ...current, preference: event.target.value as DietPreference }))} className={inputClass}>{preferences.map((value) => <option key={value} value={value}>{label(value)}</option>)}</select></label>
            <label className="space-y-2 text-sm text-white/55">Goal<select value={form.goal} onChange={(event) => setForm((current) => ({ ...current, goal: event.target.value as DietGoal }))} className={inputClass}>{goals.map((value) => <option key={value} value={value}>{label(value)}</option>)}</select></label>
          </div>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {[
              ["Calories", "calories"], ["Protein (g)", "protein"], ["Carbs (g)", "carbs"], ["Fat (g)", "fat"], ["Water (L)", "water"],
            ].map(([title, key]) => (
              <label key={key} className="space-y-2 text-sm text-white/55">{title}<input type="number" min="0" step="0.1" value={form[key as keyof Pick<FormState, "calories" | "protein" | "carbs" | "fat" | "water">]} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} className={inputClass} /></label>
            ))}
          </div>

          <div className="mt-6">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm font-black uppercase tracking-[0.18em] text-white/35">Meals</p>
              <button type="button" onClick={() => setForm((current) => ({ ...current, meals: [...current.meals, { type: "other", title: "", status: "planned" }] }))} className="text-sm font-bold text-[#C6FF32]">+ Add meal</button>
            </div>
            <div className="mt-3 space-y-3">
              {form.meals.map((meal, index) => (
                <div key={`${index}-${meal.type}`} className="grid gap-3 rounded-[16px] border border-white/10 bg-black/10 p-3 md:grid-cols-[180px_1fr_auto]">
                  <select value={meal.type} onChange={(event) => setForm((current) => ({ ...current, meals: current.meals.map((item, itemIndex) => itemIndex === index ? { ...item, type: event.target.value as MealType } : item) }))} className={inputClass}>{mealTypes.map((value) => <option key={value} value={value}>{label(value)}</option>)}</select>
                  <input value={meal.title} placeholder="Meal title" onChange={(event) => setForm((current) => ({ ...current, meals: current.meals.map((item, itemIndex) => itemIndex === index ? { ...item, title: event.target.value } : item) }))} className={inputClass} />
                  <button type="button" onClick={() => setForm((current) => ({ ...current, meals: current.meals.filter((_, itemIndex) => itemIndex !== index) }))} className="grid h-11 w-11 place-items-center rounded-[14px] border border-white/10 text-white/35 hover:text-red-300"><Trash2 className="h-4 w-4" /></button>
                </div>
              ))}
            </div>
          </div>

          <label className="mt-4 block space-y-2 text-sm text-white/55">Notes<textarea rows={3} value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} className={`${inputClass} py-3`} /></label>

          <div className="mt-6 flex justify-end gap-3">
            <button type="button" onClick={() => setShowForm(false)} className="min-h-11 rounded-[14px] border border-white/10 px-4 text-sm font-bold text-white/55">Cancel</button>
            <button type="button" disabled={busy} onClick={handleSave} className="min-h-11 rounded-[14px] bg-[#C6FF32] px-5 text-sm font-black text-[#030608] disabled:opacity-50">{busy ? "Saving..." : editingId ? "Save changes" : "Create plan"}</button>
          </div>
        </section>
      ) : null}

      <div className="space-y-4">
        {entries.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-white/10 p-10 text-center text-white/35">No diet days yet.</div>
        ) : entries.map((entry) => {
          const expanded = expandedId === entry._id;
          const target = entry.targets?.nutrition ?? {};
          const actual = entry.actuals?.nutrition ?? {};
          return (
            <article key={entry._id} className="overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.025]">
              <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:justify-between">
                <button type="button" onClick={() => setExpandedId(expanded ? null : entry._id)} className="flex flex-1 items-center gap-4 text-left">
                  <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#C6FF32]/10 text-[#C6FF32]"><Utensils className="h-5 w-5" /></div>
                  <div>
                    <h3 className="text-lg font-black">{new Date(entry.date).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" })}</h3>
                    <p className="mt-1 text-sm text-white/40">{label(entry.targets?.goal ?? "general_health")} · {entry.meals.length} meals · {Math.round(entry.adherence?.overallPercentage ?? 0)}% adherence</p>
                  </div>
                  {expanded ? <ChevronUp className="ml-auto h-4 w-4 text-white/30" /> : <ChevronDown className="ml-auto h-4 w-4 text-white/30" />}
                </button>
                <div className="flex gap-2">
                  <button type="button" onClick={() => beginEdit(entry)} className="min-h-10 rounded-xl border border-white/10 px-3 text-sm font-bold text-white/55 hover:text-white">Edit</button>
                  <button type="button" disabled={busy} onClick={() => handleDelete(entry)} className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-white/35 hover:text-red-300"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>

              {expanded ? (
                <div className="border-t border-white/10 p-5">
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
                    {[
                      ["Calories", actual.calories, target.calories, "kcal"],
                      ["Protein", actual.proteinGrams, target.proteinGrams, "g"],
                      ["Carbs", actual.carbohydratesGrams, target.carbohydratesGrams, "g"],
                      ["Fat", actual.fatGrams, target.fatGrams, "g"],
                      ["Water", entry.actuals?.waterLitres, entry.targets?.waterLitres, "L"],
                    ].map(([title, actualValue, targetValue, unit]) => (
                      <div key={String(title)} className="rounded-[16px] border border-white/10 bg-black/10 p-3">
                        <p className="text-[11px] font-black uppercase tracking-[0.16em] text-white/30">{title}</p>
                        <p className="mt-2 text-lg font-black">{Number(actualValue ?? 0)} <span className="text-xs text-white/30">/ {Number(targetValue ?? 0)} {unit}</span></p>
                      </div>
                    ))}
                  </div>

                  <div className="mt-5 space-y-3">
                    {entry.meals.map((meal, index) => {
                      const key = `${entry._id}-${index}`;
                      return (
                        <div key={key} className="flex flex-col gap-3 rounded-[16px] border border-white/10 p-4 sm:flex-row sm:items-center sm:justify-between">
                          <div>
                            <p className="font-bold">{meal.title || label(meal.type)}</p>
                            <p className="mt-1 text-xs uppercase tracking-[0.15em] text-white/30">{label(meal.status)} · {Math.round(meal.completionPercentage ?? 0)}%</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {(["completed", "partial", "skipped", "planned"] as MealStatus[]).map((status) => (
                              <button key={status} type="button" disabled={busyMeal === key} onClick={() => handleMealStatus(entry, index, status)} className={`min-h-9 rounded-xl px-3 text-xs font-black ${meal.status === status ? "bg-[#C6FF32] text-[#030608]" : "border border-white/10 text-white/45 hover:text-white"}`}>{label(status)}</button>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  {entry.notes ? <p className="mt-4 text-sm leading-6 text-white/45">{entry.notes}</p> : null}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}
