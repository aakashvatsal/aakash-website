"use client";

import { useMemo, useState } from "react";
import {
  CheckCircle2,
  Clock3,
  Plus,
  RefreshCw,
  Sparkles,
  Trash2,
  X,
} from "lucide-react";

import { AdminStatCard } from "@/components/admin/AdminStatCard";
import {
  createCareProduct,
  deleteCareProduct,
  generateCareDailyLog,
  updateCareProduct,
  updateCareRoutineItem,
} from "@/lib/api/health-extended";
import type {
  CareDailyLog,
  CareModule,
  CareProduct,
  CareProductPayload,
} from "@/types/health-extended";

type Option = { value: string; label: string };

type Props = {
  module: CareModule;
  title: string;
  description: string;
  today: string;
  initialProducts: CareProduct[];
  initialDailyLog: CareDailyLog | null;
  categories: Option[];
  frequencies: Option[];
  timesOfDay: Option[];
  allowDelete?: boolean;
};

type FormState = {
  name: string;
  brand: string;
  category: string;
  status: CareProduct["status"];
  frequency: string;
  timesOfDay: string[];
  activeIngredients: string;
  purposes: string;
  reminderEnabled: boolean;
  medicallyPrescribed: boolean;
  notes: string;
};

const inputClass =
  "min-h-11 w-full rounded-[14px] border border-white/10 bg-[#080b0d] px-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-[#C6FF32]/50";

function emptyForm(categories: Option[], frequencies: Option[], times: Option[]): FormState {
  return {
    name: "",
    brand: "",
    category: categories[0]?.value ?? "other",
    status: "active",
    frequency: frequencies[0]?.value ?? "daily",
    timesOfDay: times[0] ? [times[0].value] : [],
    activeIngredients: "",
    purposes: "",
    reminderEnabled: true,
    medicallyPrescribed: false,
    notes: "",
  };
}

function label(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function list(value: string) {
  return value.split(",").map((item) => item.trim()).filter(Boolean);
}

export function CareRoutineManager({
  module,
  title,
  description,
  today,
  initialProducts,
  initialDailyLog,
  categories,
  frequencies,
  timesOfDay,
  allowDelete = true,
}: Props) {
  const [products, setProducts] = useState(initialProducts);
  const [dailyLog, setDailyLog] = useState(initialDailyLog);
  const [form, setForm] = useState<FormState>(() => emptyForm(categories, frequencies, timesOfDay));
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const activeProducts = useMemo(() => products.filter((item) => item.status === "active").length, [products]);
  const appliedToday = dailyLog?.totalApplied ?? 0;
  const scheduledToday = dailyLog?.totalScheduled ?? 0;

  function resetForm() {
    setForm(emptyForm(categories, frequencies, timesOfDay));
    setEditingId(null);
    setShowForm(false);
  }

  function editProduct(product: CareProduct) {
    setEditingId(product._id);
    setForm({
      name: product.name,
      brand: product.brand ?? "",
      category: product.category,
      status: product.status,
      frequency: product.schedule?.frequency ?? frequencies[0]?.value ?? "daily",
      timesOfDay: product.schedule?.timesOfDay ?? [],
      activeIngredients: (product.activeIngredients ?? []).join(", "),
      purposes: (product.purposes ?? []).join(", "),
      reminderEnabled: product.reminderEnabled ?? false,
      medicallyPrescribed: product.medicallyPrescribed ?? false,
      notes: product.notes ?? "",
    });
    setShowForm(true);
  }

  async function saveProduct() {
    if (!form.name.trim()) return;
    setBusy(true);
    setError(null);
    try {
      const payload: CareProductPayload = {
        name: form.name.trim(),
        ...(form.brand.trim() ? { brand: form.brand.trim() } : {}),
        category: form.category,
        status: form.status,
        schedule: {
          frequency: form.frequency,
          timesOfDay: form.timesOfDay,
          startDate: today,
        },
        activeIngredients: list(form.activeIngredients),
        purposes: list(form.purposes),
        reminderEnabled: form.reminderEnabled,
        medicallyPrescribed: form.medicallyPrescribed,
        ...(form.notes.trim() ? { notes: form.notes.trim() } : {}),
      };

      const saved = editingId
        ? await updateCareProduct(module, editingId, payload)
        : await createCareProduct(module, payload);

      setProducts((current) => {
        const exists = current.some((item) => item._id === saved._id);
        return exists
          ? current.map((item) => (item._id === saved._id ? saved : item))
          : [saved, ...current];
      });
      resetForm();
    } catch (err) {
      setError(err instanceof Error ? err.message : `Unable to save ${title.toLowerCase()} product.`);
    } finally {
      setBusy(false);
    }
  }

  async function removeProduct(productId: string) {
    if (!allowDelete || !window.confirm("Remove this product from the routine?")) return;
    setBusy(true);
    setError(null);
    try {
      await deleteCareProduct(module, productId);
      setProducts((current) => current.filter((item) => item._id !== productId));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to remove product.");
    } finally {
      setBusy(false);
    }
  }

  async function generateLog() {
    setBusy(true);
    setError(null);
    try {
      setDailyLog(await generateCareDailyLog(module, today));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to generate today’s routine.");
    } finally {
      setBusy(false);
    }
  }

  async function updateItem(index: number, status: "applied" | "skipped" | "missed") {
    if (!dailyLog) return;
    setBusy(true);
    setError(null);
    try {
      setDailyLog(await updateCareRoutineItem(module, dailyLog._id, index, status));
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to update routine item.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-3">
        <AdminStatCard label="Active products" value={activeProducts} description="Currently in your routine." icon={Sparkles} />
        <AdminStatCard label="Today" value={`${appliedToday}/${scheduledToday}`} description="Applied versus scheduled." icon={CheckCircle2} />
        <AdminStatCard label="Adherence" value={`${Math.round(dailyLog?.adherencePercentage ?? 0)}%`} description="Today’s completion." icon={Clock3} />
      </div>

      {error ? <div className="rounded-[18px] border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">{error}</div> : null}

      <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black text-white">Today’s {title} routine</h2>
            <p className="mt-1 text-sm text-white/40">{description}</p>
          </div>
          <button type="button" onClick={generateLog} disabled={busy} className="inline-flex min-h-11 items-center gap-2 rounded-[14px] bg-[#C6FF32] px-4 text-sm font-black text-[#030608] disabled:opacity-50">
            <RefreshCw className="h-4 w-4" /> {dailyLog ? "Refresh today" : "Generate today"}
          </button>
        </div>

        <div className="mt-5 space-y-3">
          {dailyLog?.routineItems?.length ? dailyLog.routineItems.map((item, index) => (
            <div key={`${item.productId}-${index}`} className="flex flex-col gap-3 rounded-[18px] border border-white/10 bg-black/20 p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="font-bold text-white">{item.productName}</p>
                <p className="mt-1 text-xs uppercase tracking-[0.16em] text-white/35">{label(item.timeOfDay)} · {label(item.category)} · {label(item.status)}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => updateItem(index, "applied")} disabled={busy || item.status === "applied"} className="rounded-xl border border-[#C6FF32]/30 px-3 py-2 text-xs font-bold text-[#C6FF32] disabled:opacity-40">Applied</button>
                <button type="button" onClick={() => updateItem(index, "skipped")} disabled={busy} className="rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-white/55">Skip</button>
                <button type="button" onClick={() => updateItem(index, "missed")} disabled={busy} className="rounded-xl border border-red-400/20 px-3 py-2 text-xs font-bold text-red-300">Missed</button>
              </div>
            </div>
          )) : (
            <div className="rounded-[18px] border border-dashed border-white/10 p-6 text-sm text-white/35">No routine generated for {today} yet.</div>
          )}
        </div>
      </section>

      <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-black">Routine products</h2>
            <p className="mt-1 text-sm text-white/40">Manage products, frequency, reminder preference and status.</p>
          </div>
          <button type="button" onClick={() => { resetForm(); setShowForm(true); }} className="inline-flex min-h-11 items-center gap-2 rounded-[14px] border border-white/10 px-4 text-sm font-bold text-white hover:bg-white/[0.05]">
            <Plus className="h-4 w-4" /> Add product
          </button>
        </div>

        {showForm ? (
          <div className="mt-5 rounded-[20px] border border-[#C6FF32]/15 bg-[#C6FF32]/[0.025] p-4 sm:p-5">
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-black">{editingId ? "Edit product" : "Add product"}</h3>
              <button type="button" onClick={resetForm} aria-label="Close form" className="grid h-9 w-9 place-items-center rounded-xl border border-white/10"><X className="h-4 w-4" /></button>
            </div>
            <div className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">
              <input className={inputClass} placeholder="Product name" value={form.name} onChange={(e) => setForm((c) => ({ ...c, name: e.target.value }))} />
              <input className={inputClass} placeholder="Brand" value={form.brand} onChange={(e) => setForm((c) => ({ ...c, brand: e.target.value }))} />
              <select className={inputClass} value={form.category} onChange={(e) => setForm((c) => ({ ...c, category: e.target.value }))}>{categories.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
              <select className={inputClass} value={form.frequency} onChange={(e) => setForm((c) => ({ ...c, frequency: e.target.value }))}>{frequencies.map((item) => <option key={item.value} value={item.value}>{item.label}</option>)}</select>
              <select className={inputClass} value={form.status} onChange={(e) => setForm((c) => ({ ...c, status: e.target.value as CareProduct["status"] }))}>
                {(["active", "paused", "finished", "discontinued"] as const).map((value) => <option key={value} value={value}>{label(value)}</option>)}
              </select>
              <div className="rounded-[14px] border border-white/10 bg-[#080b0d] p-3">
                <p className="mb-2 text-xs font-bold uppercase tracking-[0.14em] text-white/35">Time of day</p>
                <div className="flex flex-wrap gap-2">
                  {timesOfDay.map((time) => {
                    const active = form.timesOfDay.includes(time.value);
                    return <button key={time.value} type="button" onClick={() => setForm((c) => ({ ...c, timesOfDay: active ? c.timesOfDay.filter((v) => v !== time.value) : [...c.timesOfDay, time.value] }))} className={`rounded-lg px-2.5 py-1.5 text-xs font-bold ${active ? "bg-[#C6FF32] text-[#030608]" : "bg-white/[0.05] text-white/45"}`}>{time.label}</button>;
                  })}
                </div>
              </div>
              <input className={inputClass} placeholder="Active ingredients, comma separated" value={form.activeIngredients} onChange={(e) => setForm((c) => ({ ...c, activeIngredients: e.target.value }))} />
              <input className={inputClass} placeholder="Purposes, comma separated" value={form.purposes} onChange={(e) => setForm((c) => ({ ...c, purposes: e.target.value }))} />
              <input className={inputClass} placeholder="Notes" value={form.notes} onChange={(e) => setForm((c) => ({ ...c, notes: e.target.value }))} />
            </div>
            <div className="mt-4 flex flex-wrap gap-4 text-sm text-white/55">
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.reminderEnabled} onChange={(e) => setForm((c) => ({ ...c, reminderEnabled: e.target.checked }))} /> Reminders</label>
              <label className="flex items-center gap-2"><input type="checkbox" checked={form.medicallyPrescribed} onChange={(e) => setForm((c) => ({ ...c, medicallyPrescribed: e.target.checked }))} /> Medically prescribed</label>
            </div>
            <div className="mt-5 flex gap-2">
              <button type="button" onClick={saveProduct} disabled={busy || !form.name.trim()} className="min-h-11 rounded-[14px] bg-[#C6FF32] px-5 text-sm font-black text-[#030608] disabled:opacity-50">{editingId ? "Save changes" : "Add product"}</button>
              <button type="button" onClick={resetForm} className="min-h-11 rounded-[14px] border border-white/10 px-5 text-sm font-bold text-white/55">Cancel</button>
            </div>
          </div>
        ) : null}

        <div className="mt-5 grid gap-3 lg:grid-cols-2">
          {products.length ? products.map((product) => (
            <article key={product._id} className="rounded-[18px] border border-white/10 bg-black/20 p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="font-black text-white">{product.name}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-white/35">{product.brand ? `${product.brand} · ` : ""}{label(product.category)} · {label(product.status)}</p>
                </div>
                <div className="flex gap-2">
                  <button type="button" onClick={() => editProduct(product)} className="rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-white/55">Edit</button>
                  {allowDelete ? <button type="button" aria-label="Delete product" onClick={() => removeProduct(product._id)} className="grid h-9 w-9 place-items-center rounded-xl border border-red-400/20 text-red-300"><Trash2 className="h-4 w-4" /></button> : null}
                </div>
              </div>
              <p className="mt-3 text-sm text-white/45">{label(product.schedule?.frequency ?? "daily")} · {(product.schedule?.timesOfDay ?? []).map(label).join(", ") || "No time selected"}</p>
              {product.purposes?.length ? <p className="mt-2 text-xs text-white/30">{product.purposes.join(" · ")}</p> : null}
            </article>
          )) : <div className="rounded-[18px] border border-dashed border-white/10 p-6 text-sm text-white/35">No products added yet.</div>}
        </div>
      </section>
    </div>
  );
}
