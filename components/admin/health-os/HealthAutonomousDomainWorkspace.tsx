"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CalendarDays, Loader2, RefreshCw, Send } from "lucide-react";

import {
  createHealthOwnerUpdate,
  ensureHealthPlan,
  getHealthOwnerUpdates,
  getHealthPlanWindow,
} from "@/lib/api/health-planner";
import type {
  HealthOwnerUpdate,
  HealthOwnerUpdateDomain,
  HealthPlanDay,
} from "@/types/health-planner";

type Props = {
  domain: HealthOwnerUpdateDomain;
  title: string;
  description: string;
};

function todayInIndia() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function dayLabel(dateKey: string) {
  const date = new Date(`${dateKey}T12:00:00+05:30`);
  return {
    weekday: new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      weekday: "short",
    }).format(date),
    date: new Intl.DateTimeFormat("en-IN", {
      timeZone: "Asia/Kolkata",
      day: "numeric",
      month: "short",
    }).format(date),
  };
}

function PlanDetail({ day, domain }: { day: HealthPlanDay; domain: HealthOwnerUpdateDomain }) {
  if (domain === "gym") {
    return <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Session" value={day.training.title} /><Metric label="Duration" value={`${day.training.durationMinutes} min`} /><Metric label="Intensity" value={day.training.intensity} /><Metric label="Recovery mode" value={day.recoveryMode} /></div>
      {day.training.warmup.length ? <BulletPlan title="Warm-up" items={day.training.warmup} empty="—" /> : null}
      <div className="grid gap-3 lg:grid-cols-2">{day.training.exercises.map((exercise, index) => <div key={`${exercise.name}-${index}`} className="rounded-[18px] border border-white/10 bg-black/20 p-4"><div className="flex items-start justify-between gap-3"><p className="font-black">{exercise.name}</p><span className="rounded-lg bg-[#C6FF32]/10 px-2 py-1 text-xs font-black text-[#C6FF32]">{exercise.sets} × {exercise.reps}</span></div><p className="mt-2 text-xs text-white/40">RIR {exercise.rir} · RPE {exercise.rpe} · Rest {exercise.restSeconds}s · Tempo {exercise.tempo}</p>{exercise.notes ? <p className="mt-2 text-sm leading-6 text-white/45">{exercise.notes}</p> : null}</div>)}</div>
      <div className="grid gap-3 lg:grid-cols-3"><Metric label="Cardio" value={`${day.training.cardio.type} · ${day.training.cardio.durationMinutes} min`} /><BulletPlan title="Progression" items={[day.training.progressionRule].filter(Boolean)} empty="—" /><BulletPlan title="Deload" items={[day.training.deloadNote].filter(Boolean)} empty="—" /></div>
    </div>;
  }
  if (domain === "diet") {
    return <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Metric label="Calories" value={day.nutrition.calorieTarget ? `${day.nutrition.calorieTarget} kcal` : "Flexible"} />
        <Metric label="Protein" value={day.nutrition.proteinGrams ? `${day.nutrition.proteinGrams} g` : "—"} />
        <Metric label="Carbs" value={day.nutrition.carbsGrams ? `${day.nutrition.carbsGrams} g` : "—"} />
        <Metric label="Fat" value={day.nutrition.fatGrams ? `${day.nutrition.fatGrams} g` : "—"} />
        <Metric label="Water" value={day.nutrition.hydrationLitres ? `${day.nutrition.hydrationLitres} L` : "—"} />
      </div>
      <div className="grid gap-3 lg:grid-cols-2">{day.nutrition.meals.map((meal, index) => <div key={`${meal.time}-${index}`} className="rounded-[18px] border border-white/10 bg-black/20 p-4"><p className="text-xs font-black uppercase tracking-[0.14em] text-[#C6FF32]">{meal.time} · {meal.label}</p><p className="mt-2 text-sm leading-6 text-white/60">{meal.guidance}</p>{meal.proteinGrams ? <p className="mt-2 text-xs text-white/35">~{meal.proteinGrams} g protein</p> : null}</div>)}</div>
      {day.nutrition.notes.length ? <p className="text-sm leading-6 text-white/45">{day.nutrition.notes.join(" · ")}</p> : null}
    </div>;
  }
  if (domain === "supplements") return <BulletPlan title="Configured schedule" items={day.supplementSchedule} empty="No supplement task is scheduled for this day. Existing configured doses remain authoritative." />;
  if (domain === "meditation") return <div className="grid gap-3 md:grid-cols-4"><Metric label="Type" value={day.meditation.type || "Recovery"} /><Metric label="Duration" value={`${day.meditation.durationMinutes} min`} /><Metric label="When" value={day.meditation.when || "Flexible"} /><Metric label="Purpose" value={day.meditation.intention || "Reset"} /></div>;
  if (domain === "skincare") return <div className="space-y-3"><div className="grid gap-3 lg:grid-cols-3"><BulletPlan title="Morning" items={day.skincare.morning} empty="No morning step" /><BulletPlan title="Evening" items={day.skincare.evening} empty="No evening step" /><BulletPlan title="Focus" items={[day.skincare.improvementFocus].filter(Boolean)} empty="Maintain routine" /></div><div className="grid gap-3 lg:grid-cols-3"><BulletPlan title="Body care · morning" items={day.bodyCare.morning} empty="No body-care step" /><BulletPlan title="Body care · evening" items={day.bodyCare.evening} empty="No body-care step" /><BulletPlan title="Body-care focus" items={[day.bodyCare.improvementFocus].filter(Boolean)} empty="Maintain routine" /></div></div>;
  if (domain === "haircare") return <div className="grid gap-3 lg:grid-cols-3"><BulletPlan title="Routine" items={day.haircare.routine} empty="No treatment scheduled" /><Metric label="Wash day" value={day.haircare.washDay ? "Yes" : "No"} /><BulletPlan title="Focus" items={[day.haircare.improvementFocus].filter(Boolean)} empty="Maintain routine" /></div>;
  if (domain === "intimate_care") return <div className="grid gap-3 lg:grid-cols-2"><BulletPlan title="Private routine" items={day.intimateCare.routine} empty="No special step scheduled" /><BulletPlan title="Focus" items={[day.intimateCare.improvementFocus].filter(Boolean)} empty="Maintain routine" /></div>;
  if (domain === "sleep_recovery") return <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Sleep target" value={`${day.sleep.targetHours} h`} /><Metric label="Bedtime" value={day.sleep.bedtimeWindow || "Flexible"} /><Metric label="Wake" value={day.sleep.wakeWindow || "Flexible"} /><Metric label="Steps" value={day.stepsTarget ? day.stepsTarget.toLocaleString("en-IN") : "—"} /></div>;
  return <BulletPlan title="Plan" items={[day.focus, day.rationale]} empty="No plan available." />;
}

function Metric({ label, value }: { label: string; value: string }) {
  return <div className="rounded-[18px] border border-white/10 bg-black/20 p-4"><p className="text-[11px] font-black uppercase tracking-[0.14em] text-white/30">{label}</p><p className="mt-2 text-base font-black text-white/80">{value}</p></div>;
}

function BulletPlan({ title, items, empty }: { title: string; items: string[]; empty: string }) {
  return <div className="rounded-[18px] border border-white/10 bg-black/20 p-4"><p className="text-xs font-black uppercase tracking-[0.14em] text-white/35">{title}</p>{items.length ? <ul className="mt-3 space-y-2 text-sm leading-6 text-white/60">{items.map((item, index) => <li key={`${item}-${index}`} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C6FF32]" />{item}</li>)}</ul> : <p className="mt-3 text-sm text-white/35">{empty}</p>}</div>;
}

export function HealthAutonomousDomainWorkspace({ domain, title, description }: Props) {
  const todayDateKey = useMemo(todayInIndia, []);
  const [days, setDays] = useState<HealthPlanDay[]>([]);
  const [selectedDateKey, setSelectedDateKey] = useState(todayDateKey);
  const [coverage, setCoverage] = useState<{ plannedDays: number; expectedDays: number; isCovered: boolean } | null>(null);
  const [updates, setUpdates] = useState<HealthOwnerUpdate[]>([]);
  const [text, setText] = useState("");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    const [initialWindow, recent] = await Promise.all([
      getHealthPlanWindow(7),
      getHealthOwnerUpdates(domain, 5),
    ]);
    const window = initialWindow.coverage.isCovered
      ? initialWindow
      : await ensureHealthPlan(false, 7).catch(() => initialWindow);
    setDays(window.days);
    setCoverage(window.coverage);
    setSelectedDateKey((current) => {
      if (window.days.some((item) => item.dateKey === current)) return current;
      if (window.days.some((item) => item.dateKey === todayDateKey)) return todayDateKey;
      return window.days[0]?.dateKey ?? todayDateKey;
    });
    setUpdates(recent);
    setError("");
  }, [domain, todayDateKey]);

  useEffect(() => {
    load().catch((value) => setError(value instanceof Error ? value.message : `Unable to load ${title}.`));
  }, [load, title]);

  const day = days.find((item) => item.dateKey === selectedDateKey) ?? days[0] ?? null;

  async function sendUpdate() {
    if (!text.trim()) return;
    setBusy("update");
    setError("");
    try {
      await createHealthOwnerUpdate(domain, text.trim(), true);
      setText("");
      await load();
    } catch (value) {
      setError(value instanceof Error ? value.message : "Unable to apply update.");
    } finally {
      setBusy("");
    }
  }

  return <div className="space-y-5">
    <section className="rounded-[24px] border border-[#C6FF32]/20 bg-[#C6FF32]/[0.035] p-5 sm:p-6"><div className="flex flex-wrap items-start justify-between gap-4"><div><p className="text-xs font-black uppercase tracking-[0.16em] text-[#C6FF32]">Autonomous Health · Rolling 7 days</p><h2 className="mt-2 text-2xl font-black">{title} plan</h2><p className="mt-2 max-w-3xl text-sm leading-6 text-white/45">{description} This page carries the full seven-day plan; completion for all Health modules is centralized in Health → Today.</p></div><button onClick={() => { setBusy("reload"); load().catch((value) => setError(value instanceof Error ? value.message : "Unable to refresh.")).finally(() => setBusy("")); }} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-white/[0.06] px-3 text-xs font-black text-white/60"><RefreshCw className={`h-4 w-4 ${busy === "reload" ? "animate-spin" : ""}`} />Refresh</button></div></section>
    {error ? <div className="rounded-[18px] border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">{error}</div> : null}

    <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3"><CalendarDays className="h-5 w-5 text-[#C6FF32]" /><div><h3 className="text-lg font-black">7-day rolling window</h3><p className="mt-1 text-sm text-white/35">Today plus the next six days. A new seventh day is appended automatically each day.</p></div></div>
        {coverage ? <span className={`rounded-xl px-3 py-2 text-xs font-black ${coverage.isCovered ? "bg-[#C6FF32]/10 text-[#C6FF32]" : "bg-amber-300/10 text-amber-200"}`}>{coverage.plannedDays}/{coverage.expectedDays} planned</span> : null}
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
        {days.map((item) => {
          const label = dayLabel(item.dateKey);
          const active = item.dateKey === day?.dateKey;
          const isToday = item.dateKey === todayDateKey;
          return <button key={item.dateKey} type="button" onClick={() => setSelectedDateKey(item.dateKey)} className={`min-h-[108px] rounded-[16px] border p-3 text-left transition ${active ? "border-[#C6FF32]/40 bg-[#C6FF32]/[0.08]" : "border-white/10 bg-black/20 hover:border-white/20"}`}><div className="flex items-center justify-between gap-2"><span className={`text-[11px] font-black uppercase tracking-[0.12em] ${active ? "text-[#C6FF32]" : "text-white/35"}`}>{label.weekday}</span>{isToday ? <span className="rounded-md bg-[#C6FF32] px-1.5 py-0.5 text-[9px] font-black uppercase text-black">Today</span> : null}</div><p className="mt-1 text-sm font-black text-white/80">{label.date}</p><p className="mt-2 line-clamp-2 text-[11px] leading-4 text-white/35">{item.focus}</p></button>;
        })}
      </div>
      {!days.length ? <p className="mt-4 rounded-[16px] border border-dashed border-white/10 p-5 text-sm text-white/35">No Health plan yet. Complete AI Plan onboarding first.</p> : null}
    </section>

    {day ? <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5 sm:p-6"><div className="mb-5"><p className="text-xs font-black uppercase tracking-[0.14em] text-white/30">AI plan · {day.dateKey}{day.dateKey === todayDateKey ? " · Today" : ""}</p><h3 className="mt-2 text-xl font-black">{day.focus}</h3><p className="mt-2 text-sm leading-6 text-white/45">{day.rationale}</p></div><PlanDetail day={day} domain={domain} /></section> : null}

    <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5 sm:p-6"><h3 className="text-lg font-black">Tell HSAKAA what changed</h3><p className="mt-1 text-sm leading-6 text-white/40">Examples: “I changed this product”, “this meal is hard to follow”, “my doctor changed the timing”, “this routine irritated me”. Your update is remembered and refreshes the rolling plan. Medication and medically significant dose changes remain owner/clinician-led.</p><textarea value={text} onChange={(event) => setText(event.target.value)} rows={4} placeholder={`Update ${title.toLowerCase()}…`} className="mt-4 w-full rounded-[16px] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#C6FF32]/40" /><button disabled={busy === "update" || !text.trim()} onClick={sendUpdate} className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-[14px] bg-[#C6FF32] px-4 text-sm font-black text-[#030608] disabled:opacity-40">{busy === "update" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}Apply update</button>{updates.length ? <div className="mt-5 border-t border-white/10 pt-4"><p className="text-xs font-black uppercase tracking-[0.14em] text-white/25">Recent updates</p><div className="mt-2 space-y-2">{updates.map((item) => <div key={item._id} className="rounded-[14px] bg-white/[0.025] px-4 py-3 text-sm leading-6 text-white/45">{item.update}</div>)}</div></div> : null}</section>
  </div>;
}
