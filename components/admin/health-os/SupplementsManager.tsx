"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Package,
  Pill,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import { AdminStatCard } from "@/components/admin/AdminStatCard";
import {
  createSupplement,
  deleteSupplement,
  generateDailySupplementLog,
  markSupplementLogMissed,
  updateSupplement,
  updateSupplementLogItem,
} from "@/lib/api/personal-health";
import type {
  DailySupplementLog,
  Supplement,
  SupplementFrequency,
  SupplementLogStatus,
  SupplementPayload,
  SupplementStatus,
  SupplementTimingRelation,
} from "@/types/health-os";

type Props = {
  initialSupplements: Supplement[];
  initialDailyLog: DailySupplementLog | null;
  today: string;
};

type FormState = {
  name: string;
  brand: string;
  category: string;
  form: string;
  amount: string;
  unit: string;
  quantity: string;
  frequency: SupplementFrequency;
  times: string;
  timingRelation: SupplementTimingRelation;
  status: SupplementStatus;
  purposes: string;
  reminderEnabled: boolean;
  stockQuantity: string;
  lowStockThreshold: string;
  stockUnit: string;
  notes: string;
};

const inputClass =
  "min-h-11 w-full rounded-[14px] border border-white/10 bg-[#080b0d] px-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-[#C6FF32]/50";

const frequencies: SupplementFrequency[] = [
  "daily",
  "alternate_days",
  "weekly",
  "custom",
  "as_needed",
];

const timingRelations: SupplementTimingRelation[] = [
  "anytime",
  "before_meal",
  "with_meal",
  "after_meal",
  "empty_stomach",
  "before_workout",
  "after_workout",
  "before_sleep",
];

const statuses: SupplementStatus[] = ["active", "paused", "completed", "stopped"];

function emptyForm(): FormState {
  return {
    name: "",
    brand: "",
    category: "",
    form: "",
    amount: "",
    unit: "",
    quantity: "1",
    frequency: "daily",
    times: "",
    timingRelation: "anytime",
    status: "active",
    purposes: "",
    reminderEnabled: false,
    stockQuantity: "",
    lowStockThreshold: "",
    stockUnit: "",
    notes: "",
  };
}

function label(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function list(value: string) {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function optionalNumber(value: string) {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

export function SupplementsManager({
  initialSupplements,
  initialDailyLog,
  today,
}: Props) {
  const [supplements, setSupplements] = useState(initialSupplements);
  const [dailyLog, setDailyLog] = useState(initialDailyLog);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(initialSupplements.length === 0);
  const [busy, setBusy] = useState(false);
  const [busyItem, setBusyItem] = useState<number | null>(null);
  const [error, setError] = useState("");

  const stats = useMemo(() => {
    const active = supplements.filter((item) => item.status === "active" && item.isActive !== false).length;
    const lowStock = supplements.filter((item) =>
      typeof item.stockQuantity === "number" &&
      typeof item.lowStockThreshold === "number" &&
      item.stockQuantity <= item.lowStockThreshold,
    ).length;

    return {
      active,
      lowStock,
      adherence: Math.round(dailyLog?.adherencePercentage ?? 0),
    };
  }, [supplements, dailyLog]);

  function beginCreate() {
    setEditingId(null);
    setForm(emptyForm());
    setShowForm(true);
    setError("");
  }

  function beginEdit(item: Supplement) {
    setEditingId(item._id);
    setForm({
      name: item.name,
      brand: item.brand ?? "",
      category: item.category ?? "",
      form: item.form ?? "",
      amount: String(item.dose.amount ?? ""),
      unit: item.dose.unit ?? "",
      quantity: String(item.dose.quantity ?? 1),
      frequency: item.schedule.frequency ?? "daily",
      times: (item.schedule.times ?? []).join(", "),
      timingRelation: item.schedule.timingRelation ?? "anytime",
      status: item.status,
      purposes: (item.purposes ?? []).join(", "),
      reminderEnabled: Boolean(item.reminderEnabled),
      stockQuantity: String(item.stockQuantity ?? ""),
      lowStockThreshold: String(item.lowStockThreshold ?? ""),
      stockUnit: item.stockUnit ?? "",
      notes: item.notes ?? "",
    });
    setShowForm(true);
    setError("");
  }

  function buildPayload(): SupplementPayload {
    return {
          name: form.name.trim(),
      brand: form.brand.trim() || undefined,
      category: form.category.trim() || undefined,
      form: form.form.trim() || undefined,
      dose: {
        amount: Number(form.amount),
        unit: form.unit.trim(),
        quantity: optionalNumber(form.quantity),
      },
      schedule: {
        frequency: form.frequency,
        times: list(form.times),
        timingRelation: form.timingRelation,
      },
      status: form.status,
      purposes: list(form.purposes),
      reminderEnabled: form.reminderEnabled,
      stockQuantity: optionalNumber(form.stockQuantity),
      lowStockThreshold: optionalNumber(form.lowStockThreshold),
      stockUnit: form.stockUnit.trim() || undefined,
      notes: form.notes.trim() || undefined,
    };
  }

  async function handleSave() {
    if (!form.name.trim() || !form.amount.trim() || !form.unit.trim()) {
      setError("Name, dose amount and dose unit are required.");
      return;
    }

    try {
      setBusy(true);
      setError("");
      const payload = buildPayload();
      const saved = editingId
        ? await updateSupplement(editingId, payload)
        : await createSupplement(payload);

      setSupplements((current) => [
        saved,
        ...current.filter((item) => item._id !== saved._id),
      ]);
      setShowForm(false);
      setEditingId(null);
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to save supplement.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete(item: Supplement) {
    if (!window.confirm(`Remove ${item.name}?`)) return;

    try {
      setBusy(true);
      setError("");
      await deleteSupplement(item._id);
      setSupplements((current) => current.filter((currentItem) => currentItem._id !== item._id));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to remove supplement.");
    } finally {
      setBusy(false);
    }
  }

  async function handleGenerateLog() {
    try {
      setBusy(true);
      setError("");
      setDailyLog(await generateDailySupplementLog(today));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to generate daily log.");
    } finally {
      setBusy(false);
    }
  }

  async function handleLogStatus(index: number, status: SupplementLogStatus) {
    if (!dailyLog) return;

    try {
      setBusyItem(index);
      setError("");
      setDailyLog(await updateSupplementLogItem(dailyLog._id, index, status));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to update supplement log.");
    } finally {
      setBusyItem(null);
    }
  }

  async function handleMarkMissed() {
    try {
      setBusy(true);
      setError("");
      setDailyLog(await markSupplementLogMissed(today));
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Unable to mark pending supplements missed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <AdminStatCard label="Active stack" value={stats.active} description="Supplements currently scheduled" icon={Pill} />
        <AdminStatCard label="Today adherence" value={`${stats.adherence}%`} description={dailyLog ? `${dailyLog.totalTaken}/${dailyLog.totalScheduled} taken` : "Generate today's log to track adherence"} icon={CheckCircle2} />
        <AdminStatCard label="Low stock" value={stats.lowStock} description="At or below configured threshold" icon={Package} />
      </div>

      {error ? <div className="rounded-[16px] border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">{error}</div> : null}

      <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5 sm:p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#C6FF32]">Today · {today}</p>
            <h2 className="mt-2 text-2xl font-black">Daily supplement log</h2>
            <p className="mt-2 text-sm text-white/40">Generated from active supplement schedules.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {!dailyLog ? (
              <button type="button" disabled={busy} onClick={handleGenerateLog} className="min-h-11 rounded-[14px] bg-[#C6FF32] px-4 text-sm font-black text-[#030608] disabled:opacity-50">Generate today&apos;s log</button>
            ) : (
              <button type="button" disabled={busy} onClick={handleMarkMissed} className="min-h-11 rounded-[14px] border border-white/10 px-4 text-sm font-bold text-white/55">Mark pending missed</button>
            )}
          </div>
        </div>

        {dailyLog ? (
          <div className="mt-5 space-y-3">
            {dailyLog.supplements.length === 0 ? (
              <div className="rounded-[16px] border border-dashed border-white/10 p-6 text-center text-sm text-white/35">No supplements are scheduled for today.</div>
            ) : dailyLog.supplements.map((item, index) => (
              <div key={`${item.supplementId}-${item.scheduledTime}-${index}`} className="flex flex-col gap-3 rounded-[16px] border border-white/10 bg-black/10 p-4 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <p className="font-bold">{item.supplementName}</p>
                  <p className="mt-1 text-sm text-white/35">{item.plannedAmount ?? 0} {item.unit ?? ""} · {item.scheduledTime || "Anytime"}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {(["taken", "partial", "skipped", "missed", "pending"] as SupplementLogStatus[]).map((status) => (
                    <button key={status} type="button" disabled={busyItem === index} onClick={() => handleLogStatus(index, status)} className={`min-h-9 rounded-xl px-3 text-xs font-black ${item.status === status ? "bg-[#C6FF32] text-[#030608]" : "border border-white/10 text-white/45 hover:text-white"}`}>{label(status)}</button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-xl font-black">Supplement master</h2>
          <p className="mt-1 text-sm text-white/40">Maintain dose, schedule, reminders and stock thresholds.</p>
        </div>
        <button type="button" onClick={beginCreate} className="inline-flex min-h-11 items-center gap-2 rounded-[14px] bg-[#C6FF32] px-4 text-sm font-black text-[#030608]"><Plus className="h-4 w-4" /> New supplement</button>
      </div>

      {showForm ? (
        <section className="rounded-[24px] border border-[#C6FF32]/20 bg-[#C6FF32]/[0.035] p-5 sm:p-6">
          <div className="flex items-start justify-between gap-4">
            <div><p className="text-xs font-black uppercase tracking-[0.2em] text-[#C6FF32]">{editingId ? "Edit supplement" : "New supplement"}</p><h3 className="mt-2 text-2xl font-black">{editingId ? "Update stack item" : "Add to stack"}</h3></div>
            <button type="button" onClick={() => setShowForm(false)} className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-white/45"><X className="h-4 w-4" /></button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <label className="space-y-2 text-sm text-white/55">Name<input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} className={inputClass} placeholder="Creatine" /></label>
            <label className="space-y-2 text-sm text-white/55">Brand<input value={form.brand} onChange={(event) => setForm((current) => ({ ...current, brand: event.target.value }))} className={inputClass} /></label>
            <label className="space-y-2 text-sm text-white/55">Category<input value={form.category} onChange={(event) => setForm((current) => ({ ...current, category: event.target.value }))} className={inputClass} placeholder="Performance" /></label>
            <label className="space-y-2 text-sm text-white/55">Form<input value={form.form} onChange={(event) => setForm((current) => ({ ...current, form: event.target.value }))} className={inputClass} placeholder="Powder" /></label>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3 lg:grid-cols-6">
            <label className="space-y-2 text-sm text-white/55">Dose<input type="number" min="0" value={form.amount} onChange={(event) => setForm((current) => ({ ...current, amount: event.target.value }))} className={inputClass} /></label>
            <label className="space-y-2 text-sm text-white/55">Unit<input value={form.unit} onChange={(event) => setForm((current) => ({ ...current, unit: event.target.value }))} className={inputClass} placeholder="g / mg / capsule" /></label>
            <label className="space-y-2 text-sm text-white/55">Quantity<input type="number" min="1" value={form.quantity} onChange={(event) => setForm((current) => ({ ...current, quantity: event.target.value }))} className={inputClass} /></label>
            <label className="space-y-2 text-sm text-white/55">Frequency<select value={form.frequency} onChange={(event) => setForm((current) => ({ ...current, frequency: event.target.value as SupplementFrequency }))} className={inputClass}>{frequencies.map((value) => <option key={value} value={value}>{label(value)}</option>)}</select></label>
            <label className="space-y-2 text-sm text-white/55">Timing<select value={form.timingRelation} onChange={(event) => setForm((current) => ({ ...current, timingRelation: event.target.value as SupplementTimingRelation }))} className={inputClass}>{timingRelations.map((value) => <option key={value} value={value}>{label(value)}</option>)}</select></label>
            <label className="space-y-2 text-sm text-white/55">Status<select value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value as SupplementStatus }))} className={inputClass}>{statuses.map((value) => <option key={value} value={value}>{label(value)}</option>)}</select></label>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <label className="space-y-2 text-sm text-white/55">Times <span className="text-white/25">comma separated</span><input value={form.times} onChange={(event) => setForm((current) => ({ ...current, times: event.target.value }))} className={inputClass} placeholder="08:00, 21:30" /></label>
            <label className="space-y-2 text-sm text-white/55">Purposes <span className="text-white/25">comma separated</span><input value={form.purposes} onChange={(event) => setForm((current) => ({ ...current, purposes: event.target.value }))} className={inputClass} placeholder="Recovery, performance" /></label>
          </div>

          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <label className="space-y-2 text-sm text-white/55">Stock quantity<input type="number" min="0" value={form.stockQuantity} onChange={(event) => setForm((current) => ({ ...current, stockQuantity: event.target.value }))} className={inputClass} /></label>
            <label className="space-y-2 text-sm text-white/55">Low stock threshold<input type="number" min="0" value={form.lowStockThreshold} onChange={(event) => setForm((current) => ({ ...current, lowStockThreshold: event.target.value }))} className={inputClass} /></label>
            <label className="space-y-2 text-sm text-white/55">Stock unit<input value={form.stockUnit} onChange={(event) => setForm((current) => ({ ...current, stockUnit: event.target.value }))} className={inputClass} placeholder="servings / capsules" /></label>
          </div>

          <label className="mt-4 flex min-h-11 items-center gap-3 rounded-[14px] border border-white/10 px-4 text-sm text-white/55"><input type="checkbox" checked={form.reminderEnabled} onChange={(event) => setForm((current) => ({ ...current, reminderEnabled: event.target.checked }))} className="h-4 w-4 accent-[#C6FF32]" /> Reminder enabled</label>
          <label className="mt-4 block space-y-2 text-sm text-white/55">Notes<textarea rows={3} value={form.notes} onChange={(event) => setForm((current) => ({ ...current, notes: event.target.value }))} className={`${inputClass} py-3`} /></label>

          <div className="mt-6 flex justify-end gap-3"><button type="button" onClick={() => setShowForm(false)} className="min-h-11 rounded-[14px] border border-white/10 px-4 text-sm font-bold text-white/55">Cancel</button><button type="button" disabled={busy} onClick={handleSave} className="min-h-11 rounded-[14px] bg-[#C6FF32] px-5 text-sm font-black text-[#030608] disabled:opacity-50">{busy ? "Saving..." : editingId ? "Save changes" : "Add supplement"}</button></div>
        </section>
      ) : null}

      <div className="grid gap-4 xl:grid-cols-2">
        {supplements.length === 0 ? <div className="col-span-full rounded-[24px] border border-dashed border-white/10 p-10 text-center text-white/35">No supplements configured.</div> : supplements.map((item) => {
          const lowStock = typeof item.stockQuantity === "number" && typeof item.lowStockThreshold === "number" && item.stockQuantity <= item.lowStockThreshold;
          return (
            <article key={item._id} className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5">
              <div className="flex items-start justify-between gap-4">
                <div className="flex gap-4"><div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#C6FF32]/10 text-[#C6FF32]"><Pill className="h-5 w-5" /></div><div><h3 className="text-lg font-black">{item.name}</h3><p className="mt-1 text-sm text-white/35">{item.brand ? `${item.brand} · ` : ""}{item.dose.amount} {item.dose.unit} · {label(item.schedule.frequency)}</p></div></div>
                <span className={`rounded-full px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${item.status === "active" ? "bg-[#C6FF32]/10 text-[#C6FF32]" : "bg-white/[0.05] text-white/40"}`}>{label(item.status)}</span>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-2">
                <div className="rounded-[14px] border border-white/10 p-3 text-sm"><Clock3 className="mb-2 h-4 w-4 text-white/30" /><span className="text-white/60">{(item.schedule.times ?? []).join(", ") || "Anytime"}</span><p className="mt-1 text-xs text-white/30">{label(item.schedule.timingRelation ?? "anytime")}</p></div>
                <div className={`rounded-[14px] border p-3 text-sm ${lowStock ? "border-amber-400/30 bg-amber-400/5" : "border-white/10"}`}><Package className="mb-2 h-4 w-4 text-white/30" /><span className="text-white/60">{item.stockQuantity ?? "—"} {item.stockUnit ?? ""}</span><p className="mt-1 text-xs text-white/30">Threshold {item.lowStockThreshold ?? "—"}</p></div>
              </div>
              {(item.purposes ?? []).length ? <div className="mt-4 flex flex-wrap gap-2">{item.purposes?.map((purpose) => <span key={purpose} className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-white/40">{purpose}</span>)}</div> : null}
              <div className="mt-5 flex gap-2"><button type="button" onClick={() => beginEdit(item)} className="min-h-10 rounded-xl border border-white/10 px-4 text-sm font-bold text-white/55 hover:text-white">Edit</button><button type="button" disabled={busy} onClick={() => handleDelete(item)} className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-white/35 hover:text-red-300"><Trash2 className="h-4 w-4" /></button></div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
