"use client";

import Image from "next/image";
import {
  Activity,
  BedDouble,
  Brain,
  Check,
  ChevronRight,
  Dumbbell,
  Lock,
  LockOpen,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
  Utensils,
} from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import type { ChangeEvent, ReactNode } from "react";

import type {
  HealthGoal,
  HealthGoalHorizonMode,
  HealthPhoto,
  HealthPhotoCategory,
  HealthPlanDay,
  HealthPlanStatus,
  HealthPlanWindow,
  HealthSetup,
  HealthStrategy,
} from "@/types/health-plan";

const API = "/api/admin/backend/hsakaa/private/health-planner";
type Tab = "baseline" | "goals" | "photos" | "strategy" | "plan";

async function apiRequest<T>(path: string, init?: RequestInit): Promise<T> {
  const isForm = typeof FormData !== "undefined" && init?.body instanceof FormData;
  const response = await fetch(`${API}${path}`, {
    ...init,
    cache: "no-store",
    headers: {
      Accept: "application/json",
      ...(!isForm && init?.body ? { "Content-Type": "application/json" } : {}),
      ...init?.headers,
    },
  });

  let payload: unknown = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const message =
      payload && typeof payload === "object" && "message" in payload
        ? String((payload as { message?: unknown }).message ?? "")
        : "";
    throw new Error(message || `Health OS request failed (${response.status}).`);
  }

  return payload as T;
}

function valueFrom(record: Record<string, unknown> | undefined, key: string) {
  const value = record?.[key];
  return value === null || value === undefined ? "" : String(value);
}

function numberOrUndefined(value: string) {
  const parsed = Number(value);
  return value.trim() && Number.isFinite(parsed) ? parsed : undefined;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(new Date(value.includes("T") ? value : `${value}T12:00:00+05:30`));
}

function relativeDay(dateKey: string, today: string) {
  if (dateKey === today) return "Today";
  const base = new Date(`${today}T00:00:00Z`).getTime();
  const target = new Date(`${dateKey}T00:00:00Z`).getTime();
  const days = Math.round((target - base) / 86_400_000);
  return days === 1 ? "Tomorrow" : `+${days} days`;
}

export function HealthAiPlanner() {
  const [tab, setTab] = useState<Tab>("baseline");
  const [setup, setSetup] = useState<HealthSetup | null>(null);
  const [windowData, setWindowData] = useState<HealthPlanWindow | null>(null);
  const [busy, setBusy] = useState<string | null>("loading");
  const [error, setError] = useState("");

  const loadAll = useCallback(async () => {
    const [nextSetup, nextWindow] = await Promise.all([
      apiRequest<HealthSetup>("/setup"),
      apiRequest<HealthPlanWindow>("/window"),
    ]);
    setSetup(nextSetup);
    setWindowData(nextWindow);
    return { nextSetup, nextWindow };
  }, []);

  useEffect(() => {
    let cancelled = false;
    void (async () => {
      try {
        const { nextSetup, nextWindow } = await loadAll();
        if (cancelled) return;
        if (nextSetup.readiness.planReady && !nextWindow.coverage.isCovered) {
          setBusy("bootstrap");
          const filled = await apiRequest<HealthPlanWindow>("/ensure", {
            method: "POST",
            body: JSON.stringify({ forceRefresh: false, aheadDays: 7 }),
          });
          if (!cancelled) setWindowData(filled);
        }
      } catch (caughtError) {
        if (!cancelled) setError(caughtError instanceof Error ? caughtError.message : "Unable to load Health OS.");
      } finally {
        if (!cancelled) setBusy(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [loadAll]);

  async function run(label: string, action: () => Promise<void>) {
    setBusy(label);
    setError("");
    try {
      await action();
    } catch (caughtError) {
      setError(caughtError instanceof Error ? caughtError.message : "Health OS action failed.");
    } finally {
      setBusy(null);
    }
  }

  if (!setup && busy) {
    return (
      <section className="rounded-[28px] border border-white/10 bg-white/[0.025] p-8">
        <div className="flex items-center gap-3 text-white/60">
          <RefreshCw className="h-5 w-5 animate-spin text-[#C6FF32]" />
          Loading your Health baseline…
        </div>
      </section>
    );
  }

  const readiness = setup?.readiness;

  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-white/10 bg-white/[0.025] p-6 md:p-8">
        <div className="flex flex-col gap-6 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2">
              <PillLabel icon={<Sparkles className="h-3.5 w-3.5" />} label="HSAKAA Health OS" />
              <span className="rounded-full border border-white/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-white/40">
                Private · owner only
              </span>
            </div>
            <h2 className="mt-5 text-3xl font-black tracking-[-0.04em] text-white">
              Baseline first. Target second. Plan third.
            </h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-white/40">
              HSAKAA uses your current state, reports, private progress photos, targets and actual results to build a measurable strategy and keep the next seven days planned.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <Metric label="Baseline" value={readiness?.onboardingCompleted ? "Ready" : "Needed"} />
            <Metric label="Targets" value={`${readiness?.activeGoalCount ?? 0}`} />
            <Metric label="Photos" value={`${Object.values(readiness?.photoCounts ?? {}).reduce((sum, value) => sum + value, 0)}`} />
            <Metric label="Plan" value={readiness?.planReady ? "Unlocked" : "Locked"} />
          </div>
        </div>

        {readiness?.prompts.length ? (
          <div className="mt-7 grid gap-2 md:grid-cols-2">
            {readiness.prompts.map((prompt) => (
              <div key={prompt} className="rounded-2xl border border-white/8 bg-black/20 px-4 py-3 text-xs leading-5 text-white/45">
                <span className="mr-2 text-[#C6FF32]">→</span>{prompt}
              </div>
            ))}
          </div>
        ) : null}
      </section>

      <div className="flex flex-wrap gap-2 rounded-[20px] border border-white/10 bg-white/[0.02] p-2">
        <TabButton active={tab === "baseline"} onClick={() => setTab("baseline")} label="1 · Baseline" />
        <TabButton active={tab === "goals"} onClick={() => setTab("goals")} label="2 · Targets" />
        <TabButton active={tab === "photos"} onClick={() => setTab("photos")} label="3 · Photos" />
        <TabButton active={tab === "strategy"} onClick={() => setTab("strategy")} label="4 · Strategy" />
        <TabButton active={tab === "plan"} onClick={() => setTab("plan")} label="5 · 7-Day Plan" />
      </div>

      {error ? (
        <div className="rounded-[22px] border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm leading-6 text-red-200">{error}</div>
      ) : null}

      {tab === "baseline" && setup ? (
        <BaselinePanel
          setup={setup}
          busy={busy}
          onSaved={(completed) => run("baseline", async () => {
            const next = await apiRequest<{ baseline: HealthSetup["baseline"]; readiness: HealthSetup["readiness"] }>("/baseline", {
              method: "PUT",
              body: JSON.stringify(completed),
            });
            setSetup((current) => current ? { ...current, baseline: next.baseline, readiness: next.readiness } : current);
          })}
        />
      ) : null}

      {tab === "goals" && setup ? (
        <GoalsPanel
          goals={setup.goals}
          busy={busy}
          onCreate={(payload) => run("goal-create", async () => {
            await apiRequest<HealthGoal>("/goals", { method: "POST", body: JSON.stringify(payload) });
            const next = await apiRequest<HealthSetup>("/setup");
            setSetup(next);
          })}
          onDelete={(id) => run(`goal-delete:${id}`, async () => {
            await apiRequest(`/goals/${encodeURIComponent(id)}`, { method: "DELETE" });
            const next = await apiRequest<HealthSetup>("/setup");
            setSetup(next);
          })}
        />
      ) : null}

      {tab === "photos" && setup ? (
        <PhotosPanel
          photos={setup.photos}
          busy={busy}
          onUpload={(form, query) => run("photo-upload", async () => {
            await apiRequest<HealthPhoto>(`/photos?${query.toString()}`, { method: "POST", body: form });
            const next = await apiRequest<HealthSetup>("/setup");
            setSetup(next);
          })}
          onDelete={(id) => run(`photo-delete:${id}`, async () => {
            await apiRequest(`/photos/${encodeURIComponent(id)}`, { method: "DELETE" });
            const next = await apiRequest<HealthSetup>("/setup");
            setSetup(next);
          })}
        />
      ) : null}

      {tab === "strategy" && setup ? (
        <StrategyPanel
          strategy={setup.strategy}
          planReady={setup.readiness.planReady}
          busy={busy}
          onGenerate={(force) => run("strategy", async () => {
            const strategy = await apiRequest<HealthStrategy>("/strategy/generate", { method: "POST", body: JSON.stringify({ force }) });
            setSetup((current) => current ? { ...current, strategy } : current);
          })}
        />
      ) : null}

      {tab === "plan" ? (
        <PlanPanel
          windowData={windowData}
          setup={setup}
          busy={busy}
          onEnsure={() => run("plan-ensure", async () => {
            const result = await apiRequest<HealthPlanWindow>("/ensure", {
              method: "POST",
              body: JSON.stringify({ forceRefresh: false, aheadDays: 7 }),
            });
            setWindowData(result);
            const next = await apiRequest<HealthSetup>("/setup");
            setSetup(next);
          })}
          onRegenerate={(dateKey) => run(`regenerate:${dateKey}`, async () => {
            const result = await apiRequest<HealthPlanWindow>(`/days/${encodeURIComponent(dateKey)}/regenerate`, { method: "POST" });
            setWindowData(result);
          })}
          onPatch={(dateKey, patch) => run(`patch:${dateKey}`, async () => {
            const updated = await apiRequest<HealthPlanDay>(`/days/${encodeURIComponent(dateKey)}`, { method: "PATCH", body: JSON.stringify(patch) });
            setWindowData((current) => current ? { ...current, days: current.days.map((day) => day.dateKey === dateKey ? updated : day) } : current);
          })}
        />
      ) : null}

      <section className="rounded-[24px] border border-white/10 bg-black/20 p-6">
        <div className="flex items-center gap-2 text-sm font-black text-white">
          <ShieldCheck className="h-4 w-4 text-[#C6FF32]" /> Health safety boundary
        </div>
        <p className="mt-3 max-w-4xl text-xs leading-6 text-white/35">
          HSAKAA can adapt normal training, food planning, recovery, meditation and routine execution. It does not diagnose from reports/photos, alter prescription medication, or silently change supplement doses and configured care products.
        </p>
      </section>
    </div>
  );
}

function BaselinePanel({ setup, busy, onSaved }: {
  setup: HealthSetup;
  busy: string | null;
  onSaved: (payload: Record<string, unknown>) => Promise<void>;
}) {
  const baseline = setup.baseline;
  const [currentLookSummary, setCurrentLookSummary] = useState(baseline?.currentLookSummary ?? "");
  const [expectationSummary, setExpectationSummary] = useState(baseline?.expectationSummary ?? "");
  const [heightCm, setHeightCm] = useState(valueFrom(baseline?.body, "heightCm"));
  const [weightKg, setWeightKg] = useState(valueFrom(baseline?.body, "weightKg"));
  const [waistCm, setWaistCm] = useState(valueFrom(baseline?.body, "waistCm"));
  const [bodyFat, setBodyFat] = useState(valueFrom(baseline?.body, "bodyFatPercentage"));
  const [averageSteps, setAverageSteps] = useState(valueFrom(baseline?.lifestyle, "averageSteps"));
  const [sleepHours, setSleepHours] = useState(valueFrom(baseline?.lifestyle, "sleepHours"));
  const [workStyle, setWorkStyle] = useState(valueFrom(baseline?.lifestyle, "workStyle"));
  const [injuries, setInjuries] = useState(valueFrom(baseline?.constraints, "injuriesLimitations"));
  const [clinicianInstructions, setClinicianInstructions] = useState(valueFrom(baseline?.constraints, "clinicianInstructions"));
  const [dietRestrictions, setDietRestrictions] = useState(valueFrom(baseline?.constraints, "dietaryRestrictions"));
  const [medications, setMedications] = useState(valueFrom(baseline?.constraints, "medications"));
  const [planningMode, setPlanningMode] = useState(valueFrom(baseline?.gym, "planningMode") || "hsakaa");
  const [gymDays, setGymDays] = useState(valueFrom(baseline?.gym, "daysPerWeek") || "4");
  const [sessionMinutes, setSessionMinutes] = useState(valueFrom(baseline?.gym, "preferredSessionMinutes") || "60");
  const [experience, setExperience] = useState(valueFrom(baseline?.gym, "experienceLevel") || "beginner");
  const [equipment, setEquipment] = useState(Array.isArray(baseline?.gym?.availableEquipment) ? (baseline?.gym.availableEquipment as unknown[]).join(", ") : "");
  const [trainerProgram, setTrainerProgram] = useState(valueFrom(baseline?.gym, "trainerProgramText"));
  const [dietPattern, setDietPattern] = useState(valueFrom(baseline?.diet, "dietaryPattern"));
  const [mealsPerDay, setMealsPerDay] = useState(valueFrom(baseline?.diet, "mealsPerDay"));
  const [dietPreferences, setDietPreferences] = useState(valueFrom(baseline?.diet, "preferences"));
  const [avoidFoods, setAvoidFoods] = useState(valueFrom(baseline?.diet, "avoidFoods"));
  const [meditationMinutes, setMeditationMinutes] = useState(valueFrom(baseline?.meditation, "currentMinutes"));
  const [meditationStyle, setMeditationStyle] = useState(valueFrom(baseline?.meditation, "preferredStyle"));
  const [skinConcerns, setSkinConcerns] = useState(valueFrom(baseline?.skin, "concerns"));
  const [skinRoutine, setSkinRoutine] = useState(valueFrom(baseline?.skin, "currentRoutineNotes"));
  const [hairConcerns, setHairConcerns] = useState(valueFrom(baseline?.hair, "concerns"));
  const [hairRoutine, setHairRoutine] = useState(valueFrom(baseline?.hair, "currentRoutineNotes"));
  const [intimateCareNotes, setIntimateCareNotes] = useState(valueFrom(baseline?.intimateCare, "currentRoutineNotes"));
  const [reportNotes, setReportNotes] = useState((baseline?.reportNotes ?? []).join("\n"));

  function payload(onboardingCompleted: boolean) {
    return {
      currentLookSummary,
      expectationSummary,
      body: {
        heightCm: numberOrUndefined(heightCm),
        weightKg: numberOrUndefined(weightKg),
        waistCm: numberOrUndefined(waistCm),
        bodyFatPercentage: numberOrUndefined(bodyFat),
      },
      lifestyle: {
        averageSteps: numberOrUndefined(averageSteps),
        sleepHours: numberOrUndefined(sleepHours),
        workStyle,
      },
      constraints: {
        injuriesLimitations: injuries,
        clinicianInstructions,
        dietaryRestrictions: dietRestrictions,
        medications,
      },
      gym: {
        planningMode,
        daysPerWeek: numberOrUndefined(gymDays),
        preferredSessionMinutes: numberOrUndefined(sessionMinutes),
        experienceLevel: experience,
        availableEquipment: equipment.split(",").map((item) => item.trim()).filter(Boolean),
        trainerProgramText: trainerProgram,
      },
      diet: {
        dietaryPattern: dietPattern,
        mealsPerDay: numberOrUndefined(mealsPerDay),
        preferences: dietPreferences,
        avoidFoods,
      },
      meditation: {
        currentMinutes: numberOrUndefined(meditationMinutes),
        preferredStyle: meditationStyle,
      },
      skin: { concerns: skinConcerns, currentRoutineNotes: skinRoutine },
      hair: { concerns: hairConcerns, currentRoutineNotes: hairRoutine },
      intimateCare: { currentRoutineNotes: intimateCareNotes },
      reportNotes: reportNotes.split("\n").map((item) => item.trim()).filter(Boolean),
      onboardingCompleted,
    };
  }

  return (
    <Panel title="Where are you now?" description="This is HSAKAA's baseline. Use reports and photos to make it more objective; use the text fields to capture context the numbers cannot.">
      <div className="grid gap-5 xl:grid-cols-2">
        <TextArea label="Current look / current state" value={currentLookSummary} onChange={setCurrentLookSummary} placeholder="How you look and feel now, what you notice, what currently bothers you, what is already working…" />
        <TextArea label="What do you want to become?" value={expectationSummary} onChange={setExpectationSummary} placeholder="Describe your expected body, fitness, energy, skin, hair, recovery and lifestyle outcome in plain language." />
      </div>

      <SectionTitle>Body & lifestyle</SectionTitle>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Field label="Height (cm)" value={heightCm} onChange={setHeightCm} />
        <Field label="Weight (kg)" value={weightKg} onChange={setWeightKg} />
        <Field label="Waist (cm)" value={waistCm} onChange={setWaistCm} />
        <Field label="Body fat % (if measured)" value={bodyFat} onChange={setBodyFat} />
        <Field label="Average steps" value={averageSteps} onChange={setAverageSteps} />
        <Field label="Average sleep hours" value={sleepHours} onChange={setSleepHours} />
        <Field label="Work style" value={workStyle} onChange={setWorkStyle} placeholder="Desk / mixed / active" />
      </div>

      <SectionTitle>Constraints that HSAKAA must obey</SectionTitle>
      <div className="grid gap-4 xl:grid-cols-2">
        <TextArea label="Injuries / pain / limitations" value={injuries} onChange={setInjuries} />
        <TextArea label="Doctor / dietitian / physio / trainer instructions" value={clinicianInstructions} onChange={setClinicianInstructions} />
        <TextArea label="Dietary restrictions / allergies" value={dietRestrictions} onChange={setDietRestrictions} />
        <TextArea label="Medication context (for guardrails only)" value={medications} onChange={setMedications} />
      </div>

      <SectionTitle>Gym</SectionTitle>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SelectField label="Programming" value={planningMode} onChange={setPlanningMode} options={[{ value: "hsakaa", label: "HSAKAA creates my full program" }, { value: "trainer_program", label: "Follow my trainer's program" }]} />
        <Field label="Gym days / week" value={gymDays} onChange={setGymDays} />
        <Field label="Session minutes" value={sessionMinutes} onChange={setSessionMinutes} />
        <SelectField label="Experience" value={experience} onChange={setExperience} options={["beginner", "intermediate", "advanced"].map((value) => ({ value, label: value }))} />
      </div>
      <div className="mt-4 grid gap-4 xl:grid-cols-2">
        <TextArea label="Equipment available" value={equipment} onChange={setEquipment} placeholder="Dumbbells, cables, barbell, treadmill…" />
        {planningMode === "trainer_program" ? <TextArea label="Trainer program" value={trainerProgram} onChange={setTrainerProgram} placeholder="Paste the split/program HSAKAA must follow." /> : <div />}
      </div>

      <SectionTitle>Diet, meditation, skin & hair</SectionTitle>
      <div className="grid gap-4 xl:grid-cols-2">
        <Field label="Diet pattern" value={dietPattern} onChange={setDietPattern} placeholder="Vegetarian / mixed / vegan…" />
        <Field label="Meals / day" value={mealsPerDay} onChange={setMealsPerDay} />
        <TextArea label="Food preferences" value={dietPreferences} onChange={setDietPreferences} />
        <TextArea label="Foods to avoid" value={avoidFoods} onChange={setAvoidFoods} />
        <Field label="Current meditation minutes" value={meditationMinutes} onChange={setMeditationMinutes} />
        <Field label="Preferred meditation style" value={meditationStyle} onChange={setMeditationStyle} />
        <TextArea label="Skin concerns" value={skinConcerns} onChange={setSkinConcerns} />
        <TextArea label="Current skincare routine" value={skinRoutine} onChange={setSkinRoutine} />
        <TextArea label="Hair / scalp concerns" value={hairConcerns} onChange={setHairConcerns} />
        <TextArea label="Current haircare routine" value={hairRoutine} onChange={setHairRoutine} />
        <TextArea label="Intimate-care routine / sensitivities / clinician guidance" value={intimateCareNotes} onChange={setIntimateCareNotes} placeholder="Private text context only. Do not upload intimate-area photos." />
      </div>

      <SectionTitle>Report context</SectionTitle>
      <TextArea label="Important report / clinician notes" value={reportNotes} onChange={setReportNotes} placeholder="One item per line. HSAKAA also reads Health Reports already stored in the OS." />

      <div className="mt-6 flex flex-wrap gap-3">
        <ActionButton disabled={busy !== null} onClick={() => void onSaved(payload(false))} label="Save baseline draft" />
        <ActionButton primary disabled={busy !== null || !currentLookSummary.trim() || !expectationSummary.trim()} onClick={() => void onSaved(payload(true))} label={baseline?.onboardingCompleted ? "Update completed baseline" : "Save & mark baseline complete"} />
      </div>
    </Panel>
  );
}

function GoalsPanel({ goals, busy, onCreate, onDelete }: {
  goals: HealthGoal[];
  busy: string | null;
  onCreate: (payload: Record<string, unknown>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [category, setCategory] = useState("body");
  const [title, setTitle] = useState("");
  const [currentValue, setCurrentValue] = useState("");
  const [targetValue, setTargetValue] = useState("");
  const [unit, setUnit] = useState("");
  const [horizonMode, setHorizonMode] = useState<HealthGoalHorizonMode>("relative");
  const [targetDate, setTargetDate] = useState("");
  const [relativeMonths, setRelativeMonths] = useState("3");
  const [priority, setPriority] = useState("3");
  const [successCriteria, setSuccessCriteria] = useState("");

  return (
    <Panel title="Where are you trying to get?" description="Targets give the AI strategy a measurable destination. Use exact dates, relative horizons, or ongoing standards.">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Field label="Category" value={category} onChange={setCategory} placeholder="body / strength / skin / sleep…" />
        <Field label="Target title" value={title} onChange={setTitle} placeholder="Visible abs / 8 pull-ups / clear skin…" />
        <Field label="Current" value={currentValue} onChange={setCurrentValue} />
        <Field label="Target" value={targetValue} onChange={setTargetValue} />
        <Field label="Unit" value={unit} onChange={setUnit} placeholder="kg / cm / reps / score" />
        <SelectField label="Horizon" value={horizonMode} onChange={(value) => setHorizonMode(value as HealthGoalHorizonMode)} options={[{ value: "exact_date", label: "Exact target date" }, { value: "relative", label: "Relative months" }, { value: "ongoing", label: "Ongoing" }]} />
        {horizonMode === "exact_date" ? <Field label="Target date" value={targetDate} onChange={setTargetDate} type="date" /> : null}
        {horizonMode === "relative" ? <Field label="Months" value={relativeMonths} onChange={setRelativeMonths} /> : null}
        <Field label="Priority (1–5)" value={priority} onChange={setPriority} />
      </div>
      <div className="mt-4">
        <TextArea label="Success criteria" value={successCriteria} onChange={setSuccessCriteria} placeholder="What exactly makes this target achieved?" />
      </div>
      <ActionButton
        primary
        disabled={busy !== null || !title.trim() || !targetValue.trim()}
        onClick={() => void onCreate({
          category,
          title,
          currentValue,
          targetValue,
          unit,
          horizonMode,
          ...(horizonMode === "exact_date" ? { targetDate } : {}),
          ...(horizonMode === "relative" ? { relativeMonths: Number(relativeMonths) } : {}),
          priority: Number(priority),
          successCriteria,
        })}
        label="Add target"
      />

      <div className="mt-8 grid gap-3 xl:grid-cols-2">
        {goals.map((goal) => (
          <div key={goal._id} className="rounded-[22px] border border-white/10 bg-black/20 p-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.16em] text-[#C6FF32]">{goal.category} · priority {goal.priority}</div>
                <h4 className="mt-2 font-black text-white">{goal.title}</h4>
                <p className="mt-2 text-xs leading-5 text-white/40">{goal.currentValue || "Current not recorded"} → {goal.targetValue}{goal.unit ? ` ${goal.unit}` : ""}</p>
                <p className="mt-2 text-xs text-white/25">{goal.horizonMode === "exact_date" ? goal.targetDate ? `By ${formatDate(goal.targetDate)}` : "Exact date" : goal.horizonMode === "relative" ? `${goal.relativeMonths} month horizon` : "Ongoing standard"}</p>
              </div>
              <button type="button" disabled={busy !== null} onClick={() => void onDelete(goal._id)} className="rounded-xl border border-white/10 p-2 text-white/30 hover:text-red-300 disabled:opacity-30"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
      </div>
    </Panel>
  );
}

function PhotosPanel({ photos, busy, onUpload, onDelete }: {
  photos: HealthPhoto[];
  busy: string | null;
  onUpload: (form: FormData, query: URLSearchParams) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}) {
  const [category, setCategory] = useState<HealthPhotoCategory>("body");
  const [angle, setAngle] = useState("front");
  const [takenAt, setTakenAt] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const angleSuggestions = category === "body" ? ["front", "side", "back"] : category === "skin" ? ["front", "left", "right", "close-up"] : ["front", "left-temple", "right-temple", "top", "crown"];

  return (
    <Panel title="Private visual baseline & progress" description="Upload consistent body, skin and hair checkpoints. HSAKAA stores the full history privately and creates non-diagnostic observations for comparison.">
      <div className="rounded-[22px] border border-[#C6FF32]/15 bg-[#C6FF32]/[0.04] p-5 text-xs leading-6 text-white/45">
        Use similar lighting, distance and angle over time. Body photos can be front/side/back; skin can be front/left/right/close-up; hair can be front/temples/top/crown. Intimate-area photos are intentionally not supported.
      </div>
      <div className="mt-5 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <SelectField label="Category" value={category} onChange={(value) => { setCategory(value as HealthPhotoCategory); setAngle(value === "hair" ? "front" : "front"); }} options={[{ value: "body", label: "Body" }, { value: "skin", label: "Skin" }, { value: "hair", label: "Hair" }]} />
        <SelectField label="Angle" value={angle} onChange={setAngle} options={angleSuggestions.map((value) => ({ value, label: value }))} />
        <Field label="Taken at (optional)" value={takenAt} onChange={setTakenAt} type="datetime-local" />
        <label className="block">
          <span className="mb-2 block text-[11px] font-black uppercase tracking-[0.12em] text-white/35">Photo</span>
          <input type="file" accept="image/jpeg,image/png,image/webp" onChange={(event: ChangeEvent<HTMLInputElement>) => setFile(event.target.files?.[0] ?? null)} className="block h-11 w-full rounded-2xl border border-white/10 bg-black/30 px-3 py-2 text-xs text-white/55 file:mr-3 file:rounded-lg file:border-0 file:bg-white/10 file:px-3 file:py-1 file:text-white" />
        </label>
      </div>
      <div className="mt-4">
        <ActionButton primary disabled={busy !== null || !file} onClick={() => {
          if (!file) return;
          const form = new FormData();
          form.set("file", file);
          const query = new URLSearchParams({ category, angle });
          if (takenAt) query.set("takenAt", new Date(takenAt).toISOString());
          void onUpload(form, query);
        }} label="Upload & analyze privately" icon={<Upload className="h-4 w-4" />} />
      </div>

      <div className="mt-8 grid gap-5 lg:grid-cols-2 xl:grid-cols-3">
        {photos.map((photo) => (
          <article key={photo._id} className="overflow-hidden rounded-[24px] border border-white/10 bg-black/20">
            <div className="relative aspect-[4/3] bg-black/40">
              <Image fill unoptimized sizes="(max-width: 1280px) 50vw, 33vw" className="object-cover" alt={`${photo.category} ${photo.angle} progress`} src={`${API}/photos/${encodeURIComponent(photo._id)}/content`} />
            </div>
            <div className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.16em] text-[#C6FF32]">{photo.category} · {photo.angle}</div>
                  <div className="mt-1 text-xs text-white/30">{formatDate(photo.takenAt)}</div>
                </div>
                <button type="button" disabled={busy !== null} onClick={() => void onDelete(photo._id)} className="rounded-xl border border-white/10 p-2 text-white/30 hover:text-red-300"><Trash2 className="h-4 w-4" /></button>
              </div>
              <p className="mt-4 text-sm leading-6 text-white/55">{photo.analysis.summary || "Stored privately. AI analysis was unavailable for this upload."}</p>
              {photo.analysis.observations.length ? <BulletGroup title="Visible observations" items={photo.analysis.observations} /> : null}
              {photo.analysis.improvementOpportunities.length ? <BulletGroup title="Improvement opportunities" items={photo.analysis.improvementOpportunities} /> : null}
              {photo.analysis.safetyFlags.length ? <BulletGroup title="Safety / review" items={photo.analysis.safetyFlags} /> : null}
            </div>
          </article>
        ))}
      </div>
    </Panel>
  );
}

function StrategyPanel({ strategy, planReady, busy, onGenerate }: {
  strategy: HealthStrategy | null;
  planReady: boolean;
  busy: string | null;
  onGenerate: (force: boolean) => Promise<void>;
}) {
  if (!planReady) {
    return <LockedPanel title="Strategy is locked" detail="Complete the baseline and add at least one active target first." />;
  }
  return (
    <Panel title="Health strategy" description="This is the bridge between your current baseline and your targets. It is refreshed as your data, reports and visual checkpoints change.">
      <div className="flex flex-wrap gap-3">
        <ActionButton primary disabled={busy !== null} onClick={() => void onGenerate(Boolean(strategy))} label={strategy ? "Regenerate strategy with latest evidence" : "Generate strategy"} icon={<Sparkles className="h-4 w-4" />} />
      </div>
      {strategy ? (
        <div className="mt-6 space-y-5">
          <div className="rounded-[22px] border border-[#C6FF32]/15 bg-[#C6FF32]/[0.04] p-5 text-sm leading-7 text-white/60">{strategy.summary}</div>
          <BulletGroup title="Priorities" items={strategy.priorities} />
          <div className="grid gap-4 xl:grid-cols-2">
            <StrategyCard title="Training" text={strategy.trainingStrategy} icon={<Dumbbell className="h-4 w-4" />} />
            <StrategyCard title="Nutrition" text={strategy.nutritionStrategy} icon={<Utensils className="h-4 w-4" />} />
            <StrategyCard title="Recovery" text={strategy.recoveryStrategy} icon={<BedDouble className="h-4 w-4" />} />
            <StrategyCard title="Meditation" text={strategy.meditationStrategy} icon={<Brain className="h-4 w-4" />} />
            <StrategyCard title="Skin" text={strategy.skinStrategy} icon={<Activity className="h-4 w-4" />} />
            <StrategyCard title="Hair" text={strategy.hairStrategy} icon={<Activity className="h-4 w-4" />} />
            <StrategyCard title="Intimate Care" text={strategy.intimateCareStrategy} icon={<ShieldCheck className="h-4 w-4" />} />
          </div>
          <BulletGroup title="Measurement plan" items={strategy.measurementPlan} />
          <BulletGroup title="Safety / professional review triggers" items={strategy.safetyEscalations} />
        </div>
      ) : null}
    </Panel>
  );
}

function PlanPanel({ windowData, setup, busy, onEnsure, onRegenerate, onPatch }: {
  windowData: HealthPlanWindow | null;
  setup: HealthSetup | null;
  busy: string | null;
  onEnsure: () => Promise<void>;
  onRegenerate: (dateKey: string) => Promise<void>;
  onPatch: (dateKey: string, patch: { lockedByOwner?: boolean; status?: HealthPlanStatus }) => Promise<void>;
}) {
  if (!setup?.readiness.planReady) {
    return <LockedPanel title="7-Day plan is locked" detail="Finish your baseline and add at least one active target. Photos are strongly recommended but not required to start." />;
  }
  return (
    <div className="space-y-6">
      <section className="rounded-[28px] border border-white/10 bg-white/[0.025] p-6 md:p-8">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <h3 className="text-2xl font-black text-white">Always seven days ahead</h3>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/40">Exact gym prescription, food/macros where supported, supplements from your existing schedule, meditation, sleep, skincare, haircare, private intimate-care routine and check-ins.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <ActionButton
              primary
              disabled={busy !== null || Boolean(windowData?.coverage.isCovered)}
              onClick={() => void onEnsure()}
              label={
                windowData?.coverage.isCovered
                  ? "7-day plan complete"
                  : `Generate ${windowData?.coverage.missingDays ?? 7} missing day${(windowData?.coverage.missingDays ?? 7) === 1 ? "" : "s"}`
              }
              icon={<Check className="h-4 w-4" />}
            />
          </div>
        </div>
        {windowData ? <div className="mt-6 grid gap-3 sm:grid-cols-2 xl:grid-cols-4"><Metric label="Coverage" value={`${windowData.coverage.plannedDays}/${windowData.coverage.expectedDays}`} /><Metric label="Future" value={`${windowData.coverage.futureCoverageDays} days`} /><Metric label="Missing" value={`${windowData.coverage.missingDays}`} /><Metric label="Auto refresh" value="05:30 IST" /></div> : null}
      </section>

      {windowData?.days.length ? (
        <div className="space-y-5">
          {windowData.days.map((day) => (
            <DayCard key={day.dateKey} day={day} today={windowData.coverage.today} busy={busy} onRegenerate={onRegenerate} onPatch={onPatch} />
          ))}
        </div>
      ) : (
        <section className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.015] p-10 text-center">
          <Sparkles className="mx-auto h-7 w-7 text-[#C6FF32]" />
          <h3 className="mt-4 text-xl font-black text-white">Ready to build your first week</h3>
          <p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-white/35">HSAKAA now has a baseline and target. Generate the strategy and rolling plan.</p>
          <div className="mt-5 flex justify-center"><ActionButton primary disabled={busy !== null} onClick={() => void onEnsure()} label="Generate strategy + 7-day plan" /></div>
        </section>
      )}
    </div>
  );
}

function DayCard({ day, today, busy, onRegenerate, onPatch }: {
  day: HealthPlanDay;
  today: string;
  busy: string | null;
  onRegenerate: (dateKey: string) => Promise<void>;
  onPatch: (dateKey: string, patch: { lockedByOwner?: boolean; status?: HealthPlanStatus }) => Promise<void>;
}) {
  const dayBusy = busy?.endsWith(day.dateKey) ?? false;
  return (
    <article className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.025]">
      <header className="flex flex-col gap-4 border-b border-white/10 p-6 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2 text-[11px] font-black uppercase tracking-[0.14em]"><span className="text-[#C6FF32]">{relativeDay(day.dateKey, today)}</span><span className="text-white/25">{formatDate(day.dateKey)}</span><span className="rounded-full border border-white/10 px-2 py-1 text-white/35">{day.recoveryMode}</span></div>
          <h3 className="mt-3 text-xl font-black text-white">{day.focus}</h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/40">{day.rationale}</p>
        </div>
        <div className="flex gap-2">
          <button type="button" onClick={() => void onPatch(day.dateKey, { lockedByOwner: !day.lockedByOwner })} disabled={busy !== null} className="rounded-xl border border-white/10 p-2 text-white/45 hover:text-white">{day.lockedByOwner ? <Lock className="h-4 w-4" /> : <LockOpen className="h-4 w-4" />}</button>
          <button type="button" onClick={() => void onRegenerate(day.dateKey)} disabled={busy !== null || day.lockedByOwner} className="rounded-xl border border-white/10 p-2 text-white/45 hover:text-white disabled:opacity-30"><RefreshCw className={`h-4 w-4 ${dayBusy ? "animate-spin" : ""}`} /></button>
        </div>
      </header>

      <div className="grid gap-px bg-white/10 xl:grid-cols-2">
        <DaySection title="Gym / movement" icon={<Dumbbell className="h-4 w-4" />}>
          <div className="text-sm font-black text-white">{day.training.title}</div>
          <div className="mt-1 text-xs text-white/35">{day.training.durationMinutes} min · {day.training.intensity}</div>
          {day.training.warmup.length ? <BulletGroup title="Warm-up" items={day.training.warmup} compact /> : null}
          <div className="mt-4 space-y-2">
            {day.training.exercises.map((exercise, index) => (
              <div key={`${exercise.name}-${index}`} className="rounded-2xl border border-white/8 bg-black/20 p-4">
                <div className="font-black text-white">{exercise.name}</div>
                <div className="mt-2 grid grid-cols-2 gap-2 text-xs text-white/40 sm:grid-cols-4"><span>{exercise.sets} sets</span><span>{exercise.reps} reps</span><span>RIR {exercise.rir}</span><span>RPE {exercise.rpe}</span><span>{exercise.restSeconds}s rest</span><span>Tempo {exercise.tempo}</span></div>
                {exercise.notes ? <p className="mt-2 text-xs leading-5 text-white/30">{exercise.notes}</p> : null}
              </div>
            ))}
          </div>
          <p className="mt-4 text-xs leading-5 text-white/40"><strong className="text-white/60">Cardio:</strong> {day.training.cardio.type} · {day.training.cardio.durationMinutes} min · {day.training.cardio.intensity}. {day.training.cardio.notes}</p>
          <p className="mt-3 text-xs leading-5 text-white/35"><strong className="text-white/55">Progression:</strong> {day.training.progressionRule}</p>
          <p className="mt-2 text-xs leading-5 text-white/35"><strong className="text-white/55">Deload:</strong> {day.training.deloadNote}</p>
        </DaySection>

        <DaySection title="Diet & hydration" icon={<Utensils className="h-4 w-4" />}>
          <p className="text-sm leading-6 text-white/55">{day.nutrition.focus}</p>
          <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-5"><MiniMetric label="Calories" value={day.nutrition.calorieTarget ? `${day.nutrition.calorieTarget}` : "Evidence first"} /><MiniMetric label="Protein" value={day.nutrition.proteinGrams ? `${day.nutrition.proteinGrams}g` : "—"} /><MiniMetric label="Carbs" value={day.nutrition.carbsGrams ? `${day.nutrition.carbsGrams}g` : "—"} /><MiniMetric label="Fat" value={day.nutrition.fatGrams ? `${day.nutrition.fatGrams}g` : "—"} /><MiniMetric label="Water" value={`${day.nutrition.hydrationLitres}L`} /></div>
          <div className="mt-4 space-y-2">{day.nutrition.meals.map((meal, index) => <div key={`${meal.label}-${index}`} className="rounded-xl border border-white/8 px-3 py-3 text-xs"><div className="font-black text-white/65">{meal.time} · {meal.label}</div><div className="mt-1 leading-5 text-white/35">{meal.guidance}{meal.proteinGrams ? ` · ~${meal.proteinGrams}g protein` : ""}</div></div>)}</div>
        </DaySection>

        <DaySection title="Sleep, recovery & meditation" icon={<BedDouble className="h-4 w-4" />}>
          <div className="grid grid-cols-2 gap-3"><MiniMetric label="Sleep" value={`${day.sleep.targetHours}h`} /><MiniMetric label="Steps" value={day.stepsTarget.toLocaleString()} /></div>
          <p className="mt-4 text-xs leading-5 text-white/40">Bed {day.sleep.bedtimeWindow} · Wake {day.sleep.wakeWindow}</p>
          <BulletGroup title="Sleep notes" items={day.sleep.notes} compact />
          <div className="mt-4 rounded-2xl border border-white/8 bg-black/20 p-4"><div className="font-black text-white">{day.meditation.type} · {day.meditation.durationMinutes} min</div><div className="mt-1 text-xs text-white/35">{day.meditation.when} · {day.meditation.intention}</div></div>
        </DaySection>

        <DaySection title="Care routines & supplements" icon={<Activity className="h-4 w-4" />}>
          <BulletGroup title="Skincare AM" items={day.skincare.morning} compact />
          <BulletGroup title="Skincare PM" items={day.skincare.evening} compact />
          <p className="mt-3 text-xs leading-5 text-white/40"><strong className="text-white/55">Skin focus:</strong> {day.skincare.improvementFocus}</p>
          <BulletGroup title={day.haircare.washDay ? "Haircare · wash day" : "Haircare"} items={day.haircare.routine} compact />
          <p className="mt-3 text-xs leading-5 text-white/40"><strong className="text-white/55">Hair focus:</strong> {day.haircare.improvementFocus}</p>
          <BulletGroup title="Intimate Care · private routine only" items={day.intimateCare.routine} compact />
          <p className="mt-3 text-xs leading-5 text-white/40"><strong className="text-white/55">Intimate-care focus:</strong> {day.intimateCare.improvementFocus}</p>
          <BulletGroup title="Supplements · existing schedule only" items={day.supplementSchedule} compact />
        </DaySection>
      </div>

      <footer className="grid gap-4 border-t border-white/10 p-6 lg:grid-cols-3">
        <BulletGroup title="Check-ins" items={day.checkIns} compact />
        <BulletGroup title="Signals used" items={day.signals} compact />
        <BulletGroup title="Guardrails" items={day.guardrails} compact />
      </footer>
    </article>
  );
}

function Panel({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return <section className="rounded-[28px] border border-white/10 bg-white/[0.025] p-6 md:p-8"><h3 className="text-2xl font-black tracking-[-0.03em] text-white">{title}</h3><p className="mt-2 max-w-3xl text-sm leading-6 text-white/40">{description}</p><div className="mt-7">{children}</div></section>;
}
function LockedPanel({ title, detail }: { title: string; detail: string }) { return <section className="rounded-[28px] border border-dashed border-white/10 bg-white/[0.015] p-10 text-center"><Lock className="mx-auto h-7 w-7 text-white/25" /><h3 className="mt-4 text-xl font-black text-white">{title}</h3><p className="mx-auto mt-2 max-w-xl text-sm leading-6 text-white/35">{detail}</p></section>; }
function TabButton({ active, onClick, label }: { active: boolean; onClick: () => void; label: string }) { return <button type="button" onClick={onClick} className={`min-h-10 rounded-[14px] px-4 text-sm font-bold transition ${active ? "bg-[#C6FF32] text-[#030608]" : "text-white/45 hover:bg-white/[0.05] hover:text-white"}`}>{label}</button>; }
function Field({ label, value, onChange, placeholder, type = "text" }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string; type?: string }) { return <label className="block"><span className="mb-2 block text-[11px] font-black uppercase tracking-[0.12em] text-white/35">{label}</span><input type={type} value={value} onChange={(event: ChangeEvent<HTMLInputElement>) => onChange(event.target.value)} placeholder={placeholder} className="h-11 w-full rounded-2xl border border-white/10 bg-black/30 px-4 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-[#C6FF32]/35" /></label>; }
function TextArea({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (value: string) => void; placeholder?: string }) { return <label className="block"><span className="mb-2 block text-[11px] font-black uppercase tracking-[0.12em] text-white/35">{label}</span><textarea value={value} onChange={(event: ChangeEvent<HTMLTextAreaElement>) => onChange(event.target.value)} placeholder={placeholder} rows={4} className="w-full resize-y rounded-2xl border border-white/10 bg-black/30 px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/20 focus:border-[#C6FF32]/35" /></label>; }
function SelectField({ label, value, onChange, options }: { label: string; value: string; onChange: (value: string) => void; options: Array<{ value: string; label: string }> }) { return <label className="block"><span className="mb-2 block text-[11px] font-black uppercase tracking-[0.12em] text-white/35">{label}</span><select value={value} onChange={(event: ChangeEvent<HTMLSelectElement>) => onChange(event.target.value)} className="h-11 w-full rounded-2xl border border-white/10 bg-[#090d0f] px-4 text-sm text-white outline-none focus:border-[#C6FF32]/35">{options.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}</select></label>; }
function SectionTitle({ children }: { children: ReactNode }) { return <div className="mb-4 mt-8 flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-white/55"><ChevronRight className="h-4 w-4 text-[#C6FF32]" />{children}</div>; }
function ActionButton({ label, onClick, disabled, primary = false, icon }: { label: string; onClick: () => void; disabled?: boolean; primary?: boolean; icon?: ReactNode }) { return <button type="button" onClick={onClick} disabled={disabled} className={`inline-flex h-11 items-center gap-2 rounded-2xl px-4 text-xs font-black uppercase tracking-[0.1em] transition disabled:opacity-35 ${primary ? "bg-[#C6FF32] text-[#030608]" : "border border-white/10 text-white/60 hover:border-white/20 hover:text-white"}`}>{icon}{label}</button>; }
function Metric({ label, value }: { label: string; value: string }) { return <div className="min-w-[120px] rounded-2xl border border-white/8 bg-black/20 p-4"><div className="text-[10px] font-black uppercase tracking-[0.14em] text-white/25">{label}</div><div className="mt-2 text-lg font-black text-white">{value}</div></div>; }
function MiniMetric({ label, value }: { label: string; value: string }) { return <div className="rounded-xl border border-white/8 bg-black/20 p-3"><div className="text-[9px] font-black uppercase tracking-[0.12em] text-white/25">{label}</div><div className="mt-1 text-xs font-black text-white/65">{value}</div></div>; }
function PillLabel({ icon, label }: { icon: ReactNode; label: string }) { return <span className="inline-flex items-center gap-2 rounded-full border border-[#C6FF32]/20 bg-[#C6FF32]/10 px-3 py-1 text-[11px] font-black uppercase tracking-[0.14em] text-[#C6FF32]">{icon}{label}</span>; }
function BulletGroup({ title, items, compact = false }: { title: string; items: string[]; compact?: boolean }) { if (!items.length) return null; return <div className={compact ? "mt-4" : "mt-5"}><div className="text-[10px] font-black uppercase tracking-[0.14em] text-white/30">{title}</div><div className="mt-2 space-y-1.5">{items.map((item, index) => <div key={`${item}-${index}`} className="text-xs leading-5 text-white/40">• {item}</div>)}</div></div>; }
function StrategyCard({ title, text, icon }: { title: string; text: string; icon: ReactNode }) { return <div className="rounded-[22px] border border-white/10 bg-black/20 p-5"><div className="flex items-center gap-2 text-sm font-black text-white">{icon}{title}</div><p className="mt-3 text-xs leading-6 text-white/40">{text}</p></div>; }
function DaySection({ title, icon, children }: { title: string; icon: ReactNode; children: ReactNode }) { return <section className="bg-[#050809] p-6"><div className="mb-4 flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-[#C6FF32]">{icon}{title}</div>{children}</section>; }
