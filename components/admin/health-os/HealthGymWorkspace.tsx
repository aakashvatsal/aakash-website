"use client";

import { useCallback, useEffect, useState } from "react";
import { Dumbbell, Loader2, RefreshCw } from "lucide-react";

import { ensureHealthPlan, getHealthPlanWindow } from "@/lib/api/health-planner";
import type { HealthPlanWindow } from "@/types/health-planner";

export function HealthGymWorkspace() {
  const [data, setData] = useState<HealthPlanWindow | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const load = useCallback(async () => {
    setData(await getHealthPlanWindow(7));
  }, []);

  useEffect(() => { load().catch((value) => setError(value instanceof Error ? value.message : "Unable to load gym plan.")); }, [load]);

  async function refresh() {
    setBusy(true); setError("");
    try { setData(await ensureHealthPlan(false, 7)); }
    catch (value) { setError(value instanceof Error ? value.message : "Unable to refresh gym plan."); }
    finally { setBusy(false); }
  }

  return (
    <div className="space-y-5">
      <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-4"><div><h2 className="flex items-center gap-2 text-xl font-black"><Dumbbell className="h-5 w-5 text-[#C6FF32]" />Your gym week</h2><p className="mt-1 text-sm text-white/40">Exact exercise selection, sets, reps, RIR, RPE, rest, tempo, cardio and progression from the rolling Health plan.</p></div><button type="button" disabled={busy || !data?.setup.planReady} onClick={refresh} className="inline-flex min-h-11 items-center gap-2 rounded-[14px] bg-[#C6FF32] px-4 text-sm font-black text-[#030608] disabled:opacity-40">{busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}Ensure gym week</button></div>
        {error ? <div className="mt-4 rounded-[16px] border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">{error}</div> : null}
      </section>
      {data?.days.length ? data.days.map((day) => (
        <article key={day.dateKey} className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5 sm:p-6">
          <div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-black uppercase tracking-[0.18em] text-[#C6FF32]">{new Date(`${day.dateKey}T12:00:00+05:30`).toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short" })}</p><h3 className="mt-2 text-xl font-black">{day.training.title}</h3><p className="mt-1 text-sm text-white/40">{day.training.durationMinutes} min · {day.training.intensity} · {day.recoveryMode}</p></div><span className="rounded-xl bg-white/[0.05] px-3 py-2 text-xs font-bold text-white/45">{day.status}</span></div>
          {day.training.exercises.length ? <div className="mt-5 grid gap-3 lg:grid-cols-2">{day.training.exercises.map((exercise, index) => <div key={`${exercise.name}-${index}`} className="rounded-[18px] border border-white/10 bg-black/20 p-4"><div className="flex items-start justify-between gap-3"><p className="font-black">{exercise.name}</p><span className="rounded-lg bg-[#C6FF32]/10 px-2 py-1 text-xs font-black text-[#C6FF32]">{exercise.sets} × {exercise.reps}</span></div><p className="mt-2 text-xs text-white/40">RIR {exercise.rir} · RPE {exercise.rpe} · Rest {exercise.restSeconds}s · Tempo {exercise.tempo}</p>{exercise.notes ? <p className="mt-2 text-sm leading-6 text-white/45">{exercise.notes}</p> : null}</div>)}</div> : <div className="mt-5 rounded-[18px] border border-dashed border-white/10 p-5 text-sm text-white/35">Rest / recovery day. No resistance exercises prescribed.</div>}
          <div className="mt-4 grid gap-3 lg:grid-cols-3"><div className="rounded-[16px] bg-white/[0.025] p-4"><p className="text-xs font-black uppercase tracking-[0.14em] text-white/30">Warm-up</p><p className="mt-2 text-sm leading-6 text-white/45">{day.training.warmup.join(" · ") || "—"}</p></div><div className="rounded-[16px] bg-white/[0.025] p-4"><p className="text-xs font-black uppercase tracking-[0.14em] text-white/30">Cardio</p><p className="mt-2 text-sm text-white/45">{day.training.cardio.type} · {day.training.cardio.durationMinutes} min · {day.training.cardio.intensity}</p></div><div className="rounded-[16px] bg-white/[0.025] p-4"><p className="text-xs font-black uppercase tracking-[0.14em] text-white/30">Progression</p><p className="mt-2 text-sm leading-6 text-white/45">{day.training.progressionRule}</p></div></div>
        </article>
      )) : <div className="rounded-[24px] border border-dashed border-white/10 p-8 text-center text-sm text-white/35">No gym plan yet. Complete Health AI Plan onboarding first.</div>}
    </div>
  );
}
