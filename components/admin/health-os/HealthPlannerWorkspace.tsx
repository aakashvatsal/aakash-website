/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity,
  Brain,
  Camera,
  Check,
  ChevronDown,
  ChevronUp,
  Dumbbell,
  FileText,
  PackageSearch,
  HeartPulse,
  HardDrive,
  MapPin,
  LocateFixed,
  Loader2,
  Lock,
  RefreshCw,
  Sparkles,
  Target,
  Trash2,
  Unlock,
} from "lucide-react";

import {
  createHealthGoal,
  ensureHealthPlan,
  generateHealthStrategy,
  getHealthPhotoContentUrl,
  getHealthSourceReportContentUrl,
  getHealthPlannerSetup,
  getHealthPlanWindow,
  regenerateHealthPlanDay,
  migrateLegacyHealthStorage,
  removeHealthGoal,
  removeHealthPhoto,
  removeHealthSourceReport,
  reanalyzeHealthSourceReport,
  resolveHealthLocation,
  updateHealthSourceReportFollowUp,
  saveHealthBaseline,
  updateHealthGoal,
  updateHealthPlanDay,
  uploadHealthPhoto,
  uploadHealthSourceReport,
} from "@/lib/api/health-planner";
import { createProduct } from "@/lib/api/health-extended";
import type {
  HealthBaseline,
  HealthBaselinePayload,
  HealthGoalHorizonMode,
  HealthPhotoCategory,
  HealthPlannerSetup,
  HealthPlanDay,
  HealthPlanWindow,
} from "@/types/health-planner";

type Section =
  "baseline" | "targets" | "photos" | "products" | "strategy" | "plan";

type BaselineForm = {
  currentLookSummary: string;
  expectationSummary: string;
  weightKg: string;
  heightCm: string;
  waistCm: string;
  bodyFatPct: string;
  city: string;
  region: string;
  country: string;
  countryCode: string;
  timezone: string;
  latitude: string;
  longitude: string;
  locationAccuracyMeters: string;
  locationCapturedAt: string;
  locationSource: string;
  sleepHours: string;
  stepsPerDay: string;
  stressLevel: string;
  workRoutine: string;
  injuries: string;
  painNotes: string;
  medications: string;
  clinicianInstructions: string;
  dietitianInstructions: string;
  planningMode: "hsakaa" | "trainer_program";
  daysPerWeek: string;
  preferredSessionMinutes: string;
  morningConditioningType: string;
  morningConditioningMinutes: string;
  morningConditioningTime: string;
  eveningWeightsTime: string;
  normalWalkMinutes: string;
  normalWalkTime: string;
  experienceLevel: string;
  availableEquipment: string;
  trainerProgramText: string;
  dietPattern: string;
  dietRestrictions: string;
  allergies: string;
  currentCalories: string;
  currentProteinGrams: string;
  meditationMinutes: string;
  meditationFrequency: string;
  meditationType: string;
  skinGoals: string;
  skinConcerns: string;
  skinRoutineNotes: string;
  hairGoals: string;
  hairConcerns: string;
  hairRoutineNotes: string;
  intimateCareNotes: string;
  reportNotes: string;
  onboardingCompleted: boolean;
};

const emptyBaseline: BaselineForm = {
  currentLookSummary: "",
  expectationSummary: "",
  weightKg: "",
  heightCm: "",
  waistCm: "",
  bodyFatPct: "",
  city: "Mumbai",
  region: "Maharashtra",
  country: "India",
  countryCode: "IN",
  timezone: "Asia/Kolkata",
  latitude: "",
  longitude: "",
  locationAccuracyMeters: "",
  locationCapturedAt: "",
  locationSource: "",
  sleepHours: "",
  stepsPerDay: "",
  stressLevel: "",
  workRoutine: "",
  injuries: "",
  painNotes: "",
  medications: "",
  clinicianInstructions: "",
  dietitianInstructions: "",
  planningMode: "hsakaa",
  daysPerWeek: "4",
  preferredSessionMinutes: "60",
  morningConditioningType: "walk/run/jog",
  morningConditioningMinutes: "30",
  morningConditioningTime: "07:00",
  eveningWeightsTime: "19:00",
  normalWalkMinutes: "20",
  normalWalkTime: "20:30",
  experienceLevel: "beginner",
  availableEquipment: "",
  trainerProgramText: "",
  dietPattern: "",
  dietRestrictions: "",
  allergies: "",
  currentCalories: "",
  currentProteinGrams: "",
  meditationMinutes: "",
  meditationFrequency: "",
  meditationType: "",
  skinGoals: "",
  skinConcerns: "",
  skinRoutineNotes: "",
  hairGoals: "",
  hairConcerns: "",
  hairRoutineNotes: "",
  intimateCareNotes: "",
  reportNotes: "",
  onboardingCompleted: false,
};

const inputClass =
  "min-h-11 w-full rounded-[14px] border border-white/10 bg-[#080b0d] px-3.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#C6FF32]/45";
const textareaClass = `${inputClass} min-h-28 py-3`;
const cardClass =
  "rounded-[24px] border border-white/10 bg-white/[0.025] p-5 sm:p-6";

function asRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
}

function asText(value: unknown) {
  return typeof value === "string"
    ? value
    : typeof value === "number"
      ? String(value)
      : "";
}

function asBoolean(value: unknown) {
  return value === true;
}

function lines(value: string) {
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function numberOrUndefined(value: string) {
  if (!value.trim()) return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : undefined;
}

function baselineToForm(baseline: HealthBaseline | null): BaselineForm {
  if (!baseline) return emptyBaseline;
  const body = asRecord(baseline.body);
  const location = asRecord(baseline.location);
  const lifestyle = asRecord(baseline.lifestyle);
  const constraints = asRecord(baseline.constraints);
  const gym = asRecord(baseline.gym);
  const diet = asRecord(baseline.diet);
  const meditation = asRecord(baseline.meditation);
  const skin = asRecord(baseline.skin);
  const hair = asRecord(baseline.hair);
  const intimateCare = asRecord(baseline.intimateCare);
  return {
    currentLookSummary: baseline.currentLookSummary ?? "",
    expectationSummary: baseline.expectationSummary ?? "",
    weightKg: asText(body.weightKg),
    heightCm: asText(body.heightCm),
    waistCm: asText(body.waistCm),
    bodyFatPct: asText(body.bodyFatPct),
    city: asText(location.city) || "Mumbai",
    region: asText(location.region) || "Maharashtra",
    country: asText(location.country) || "India",
    countryCode: asText(location.countryCode) || "IN",
    timezone: asText(location.timezone) || "Asia/Kolkata",
    latitude: asText(location.latitude),
    longitude: asText(location.longitude),
    locationAccuracyMeters: asText(location.accuracyMeters),
    locationCapturedAt: asText(location.capturedAt),
    locationSource: asText(location.source),
    sleepHours: asText(lifestyle.sleepHours),
    stepsPerDay: asText(lifestyle.stepsPerDay),
    stressLevel: asText(lifestyle.stressLevel),
    workRoutine: asText(lifestyle.workRoutine),
    injuries: asText(constraints.injuries),
    painNotes: asText(constraints.painNotes),
    medications: asText(constraints.medications),
    clinicianInstructions: asText(constraints.clinicianInstructions),
    dietitianInstructions: asText(constraints.dietitianInstructions),
    planningMode:
      gym.planningMode === "trainer_program" ? "trainer_program" : "hsakaa",
    daysPerWeek: asText(gym.daysPerWeek) || "4",
    preferredSessionMinutes: asText(gym.preferredSessionMinutes) || "60",
    morningConditioningType:
      asText(gym.morningConditioningType) || "walk/run/jog",
    morningConditioningMinutes: asText(gym.morningConditioningMinutes) || "30",
    morningConditioningTime: asText(gym.morningConditioningTime) || "07:00",
    eveningWeightsTime: asText(gym.eveningWeightsTime) || "19:00",
    normalWalkMinutes: asText(gym.normalWalkMinutes) || "20",
    normalWalkTime: asText(gym.normalWalkTime) || "20:30",
    experienceLevel: asText(gym.experienceLevel) || "beginner",
    availableEquipment: Array.isArray(gym.availableEquipment)
      ? gym.availableEquipment.map(String).join(", ")
      : asText(gym.availableEquipment),
    trainerProgramText: asText(gym.trainerProgramText),
    dietPattern: asText(diet.pattern),
    dietRestrictions: asText(diet.restrictions),
    allergies: asText(diet.allergies),
    currentCalories: asText(diet.currentCalories),
    currentProteinGrams: asText(diet.currentProteinGrams),
    meditationMinutes: asText(meditation.minutes),
    meditationFrequency: asText(meditation.frequency),
    meditationType: asText(meditation.preferredType),
    skinGoals: asText(skin.goals),
    skinConcerns: asText(skin.concerns),
    skinRoutineNotes: asText(skin.routineNotes),
    hairGoals: asText(hair.goals),
    hairConcerns: asText(hair.concerns),
    hairRoutineNotes: asText(hair.routineNotes),
    intimateCareNotes: asText(intimateCare.routineNotes),
    reportNotes: (baseline.reportNotes ?? []).join("\n"),
    onboardingCompleted: asBoolean(baseline.onboardingCompleted),
  };
}

function baselinePayload(form: BaselineForm): HealthBaselinePayload {
  return {
    currentLookSummary: form.currentLookSummary.trim(),
    expectationSummary: form.expectationSummary.trim(),
    body: {
      weightKg: numberOrUndefined(form.weightKg),
      heightCm: numberOrUndefined(form.heightCm),
      waistCm: numberOrUndefined(form.waistCm),
      bodyFatPct: numberOrUndefined(form.bodyFatPct),
    },
    location: {
      city: form.city.trim(),
      region: form.region.trim(),
      country: form.country.trim(),
      countryCode: form.countryCode.trim().toUpperCase(),
      timezone: form.timezone.trim() || "Asia/Kolkata",
      latitude: numberOrUndefined(form.latitude),
      longitude: numberOrUndefined(form.longitude),
      accuracyMeters: numberOrUndefined(form.locationAccuracyMeters),
      capturedAt: form.locationCapturedAt || undefined,
      source: form.locationSource || undefined,
    },
    lifestyle: {
      sleepHours: numberOrUndefined(form.sleepHours),
      stepsPerDay: numberOrUndefined(form.stepsPerDay),
      stressLevel: form.stressLevel.trim(),
      workRoutine: form.workRoutine.trim(),
    },
    constraints: {
      injuries: form.injuries.trim(),
      painNotes: form.painNotes.trim(),
      medications: form.medications.trim(),
      clinicianInstructions: form.clinicianInstructions.trim(),
      dietitianInstructions: form.dietitianInstructions.trim(),
    },
    gym: {
      planningMode: form.planningMode,
      daysPerWeek: numberOrUndefined(form.daysPerWeek) ?? 4,
      preferredSessionMinutes:
        numberOrUndefined(form.preferredSessionMinutes) ?? 60,
      morningConditioningType:
        form.morningConditioningType.trim() || "walk/run/jog",
      morningConditioningMinutes:
        numberOrUndefined(form.morningConditioningMinutes) ?? 30,
      morningConditioningTime: form.morningConditioningTime || "07:00",
      eveningWeightsTime: form.eveningWeightsTime || "19:00",
      normalWalkMinutes: numberOrUndefined(form.normalWalkMinutes) ?? 20,
      normalWalkTime: form.normalWalkTime || "20:30",
      experienceLevel: form.experienceLevel.trim(),
      availableEquipment: lines(form.availableEquipment),
      trainerProgramText: form.trainerProgramText.trim(),
    },
    diet: {
      pattern: form.dietPattern.trim(),
      restrictions: form.dietRestrictions.trim(),
      allergies: form.allergies.trim(),
      currentCalories: numberOrUndefined(form.currentCalories),
      currentProteinGrams: numberOrUndefined(form.currentProteinGrams),
    },
    meditation: {
      minutes: numberOrUndefined(form.meditationMinutes),
      frequency: form.meditationFrequency.trim(),
      preferredType: form.meditationType.trim(),
    },
    skin: {
      goals: form.skinGoals.trim(),
      concerns: form.skinConcerns.trim(),
      routineNotes: form.skinRoutineNotes.trim(),
    },
    hair: {
      goals: form.hairGoals.trim(),
      concerns: form.hairConcerns.trim(),
      routineNotes: form.hairRoutineNotes.trim(),
    },
    intimateCare: { routineNotes: form.intimateCareNotes.trim() },
    reportNotes: lines(form.reportNotes),
    onboardingCompleted: form.onboardingCompleted,
  };
}

function prettyDate(dateKey: string) {
  const date = new Date(`${dateKey}T12:00:00+05:30`);
  return new Intl.DateTimeFormat("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  }).format(date);
}


type RenderableHealthPlanDay = HealthPlanDay & {
  needsV26Regeneration?: boolean;
  legacyPlanNotice?: string;
};

function planArray(value: unknown): string[] {
  return Array.isArray(value) ? value.map(String).filter(Boolean) : [];
}

function planNumber(value: unknown, fallback = 0) {
  return typeof value === "number" && Number.isFinite(value) ? value : fallback;
}

function normalizeHealthPlanDay(day: HealthPlanDay): RenderableHealthPlanDay {
  const raw = asRecord(day as unknown);
  const morning = asRecord(raw.morningConditioning);
  const training = asRecord(raw.training);
  const cardio = asRecord(training.cardio);
  const walk = asRecord(raw.normalWalk);
  const nutrition = asRecord(raw.nutrition);
  const meditation = asRecord(raw.meditation);
  const sleep = asRecord(raw.sleep);
  const skincare = asRecord(raw.skincare);
  const bodyCare = asRecord(raw.bodyCare);
  const haircare = asRecord(raw.haircare);
  const intimateCare = asRecord(raw.intimateCare);

  const needsV26Regeneration = !(
    asText(morning.type) &&
    asText(morning.when) &&
    asText(training.title) &&
    asText(training.when) &&
    asText(walk.type) &&
    asText(walk.when) &&
    asText(nutrition.focus) &&
    Array.isArray(nutrition.performanceNutrition) &&
    Array.isArray(bodyCare.morning) &&
    Array.isArray(bodyCare.evening) &&
    asText(meditation.type) &&
    typeof sleep.targetHours === "number"
  );

  const legacyPlanNotice = !needsV26Regeneration
    ? ""
    : raw.status === "completed" || raw.status === "skipped"
      ? ""
      : raw.lockedByOwner === true
        ? "This planned day uses an older Health-plan structure and is locked. Rolling refresh intentionally preserves locked days. Unlock it, then use Regenerate to upgrade this day."
        : "This planned day still uses an older Health-plan structure. Regenerate this day, or refresh the rolling plan after the current strategy refresh finishes, to replace it with the V2.7 structure.";

  const meals = Array.isArray(nutrition.meals)
    ? nutrition.meals.map((mealValue) => {
        const meal = asRecord(mealValue);
        return {
          time: asText(meal.time),
          label: asText(meal.label) || "Meal",
          guidance: asText(meal.guidance),
          items: Array.isArray(meal.items)
            ? meal.items.map((itemValue) => {
                const item = asRecord(itemValue);
                return {
                  name: asText(item.name) || "Unspecified food",
                  category: (asText(item.category) || "other") as
                    | "vegetable"
                    | "fruit"
                    | "grain_flour"
                    | "rice"
                    | "protein"
                    | "dairy_alternative"
                    | "nuts_seeds"
                    | "fat"
                    | "other",
                  quantity: planNumber(item.quantity),
                  unit: asText(item.unit),
                  preparation: asText(item.preparation),
                  reason: asText(item.reason),
                  alternatives: planArray(item.alternatives),
                };
              })
            : [],
          proteinGrams: planNumber(meal.proteinGrams),
        };
      })
    : [];

  const performanceNutrition = Array.isArray(nutrition.performanceNutrition)
    ? nutrition.performanceNutrition.map((itemValue) => {
        const item = asRecord(itemValue);
        const category = asText(item.category);
        const action = asText(item.action);
        const status = asText(item.status);
        return {
          category: (category === "creatine" ||
          category === "protein_powder"
            ? category
            : "other") as "creatine" | "protein_powder" | "other",
          action: (
            ["keep", "add", "replace", "review", "review_stop", "not_needed"].includes(action)
              ? action
              : "review"
          ) as "keep" | "add" | "replace" | "review" | "review_stop" | "not_needed",
          status: (
            ["active", "pending_approval", "review_required", "not_needed_today"].includes(status)
              ? status
              : "review_required"
          ) as "active" | "pending_approval" | "review_required" | "not_needed_today",
          item: asText(item.item) || category.replaceAll("_", " ") || "Performance nutrition",
          when: asText(item.when) || "—",
          guidance: asText(item.guidance),
          approvalRequired: item.approvalRequired === true,
        };
      })
    : [];

  const exercises = Array.isArray(training.exercises)
    ? training.exercises.map((exerciseValue) => {
        const exercise = asRecord(exerciseValue);
        return {
          name: asText(exercise.name) || "Exercise",
          sets: planNumber(exercise.sets),
          reps: asText(exercise.reps),
          rir: planNumber(exercise.rir),
          rpe: planNumber(exercise.rpe),
          restSeconds: planNumber(exercise.restSeconds),
          tempo: asText(exercise.tempo),
          notes: asText(exercise.notes),
        };
      })
    : [];

  return {
    ...(day as HealthPlanDay),
    dateKey: asText(raw.dateKey) || day.dateKey,
    status:
      raw.status === "completed" || raw.status === "skipped"
        ? raw.status
        : "planned",
    lockedByOwner: raw.lockedByOwner === true,
    ownerNotes: asText(raw.ownerNotes),
    focus: asText(raw.focus) || "Legacy Health plan",
    rationale:
      asText(raw.rationale) ||
      "This saved day predates the current Health V2.6 structure and will be regenerated when unlocked.",
    recoveryMode:
      raw.recoveryMode === "recover" || raw.recoveryMode === "build"
        ? raw.recoveryMode
        : "maintain",
    morningConditioning: {
      type: asText(morning.type) || "Regenerate required",
      durationMinutes: planNumber(morning.durationMinutes),
      intensity: asText(morning.intensity) || "easy",
      when: asText(morning.when) || "—",
      notes:
        asText(morning.notes) ||
        "Legacy day: regenerate to create the current morning conditioning block.",
    },
    training: {
      when: asText(training.when) || "—",
      title: asText(training.title) || "Regenerate required",
      type: asText(training.type) || "legacy",
      durationMinutes: planNumber(training.durationMinutes),
      intensity:
        training.intensity === "hard" ||
        training.intensity === "moderate" ||
        training.intensity === "rest"
          ? training.intensity
          : "easy",
      warmup: planArray(training.warmup),
      exercises,
      cardio: {
        type: asText(cardio.type),
        durationMinutes: planNumber(cardio.durationMinutes),
        intensity: asText(cardio.intensity),
        notes: asText(cardio.notes),
      },
      cooldown: planArray(training.cooldown),
      progressionRule: asText(training.progressionRule),
      deloadNote: asText(training.deloadNote),
    },
    normalWalk: {
      type: asText(walk.type) || "walk",
      durationMinutes: planNumber(walk.durationMinutes),
      intensity: asText(walk.intensity) || "easy",
      when: asText(walk.when) || "—",
      notes:
        asText(walk.notes) ||
        "Legacy day: regenerate to create the current separate normal-walk block.",
    },
    nutrition: {
      focus: asText(nutrition.focus) || "Regenerate required",
      calorieTarget: planNumber(nutrition.calorieTarget),
      proteinGrams: planNumber(nutrition.proteinGrams),
      carbsGrams: planNumber(nutrition.carbsGrams),
      fatGrams: planNumber(nutrition.fatGrams),
      hydrationLitres: planNumber(nutrition.hydrationLitres),
      meals,
      performanceNutrition,
      notes: planArray(nutrition.notes),
    },
    meditation: {
      type: asText(meditation.type) || "Not set",
      durationMinutes: planNumber(meditation.durationMinutes),
      when: asText(meditation.when) || "—",
      intention: asText(meditation.intention),
    },
    sleep: {
      targetHours: planNumber(sleep.targetHours),
      bedtimeWindow: asText(sleep.bedtimeWindow) || "—",
      wakeWindow: asText(sleep.wakeWindow) || "—",
      notes: planArray(sleep.notes),
    },
    skincare: {
      morning: planArray(skincare.morning),
      evening: planArray(skincare.evening),
      other: planArray(skincare.other),
      improvementFocus: asText(skincare.improvementFocus),
    },
    bodyCare: {
      morning: planArray(bodyCare.morning),
      evening: planArray(bodyCare.evening),
      other: planArray(bodyCare.other),
      improvementFocus: asText(bodyCare.improvementFocus),
    },
    haircare: {
      routine: planArray(haircare.routine),
      washDay: haircare.washDay === true,
      improvementFocus: asText(haircare.improvementFocus),
    },
    intimateCare: {
      routine: planArray(intimateCare.routine),
      improvementFocus: asText(intimateCare.improvementFocus),
    },
    supplementSchedule: planArray(raw.supplementSchedule),
    labFollowUps: Array.isArray(raw.labFollowUps)
      ? raw.labFollowUps.map((followUpValue) => {
          const followUp = asRecord(followUpValue);
          return {
            sourceReportId: asText(followUp.sourceReportId),
            testName: asText(followUp.testName) || "Follow-up",
            dueAt: asText(followUp.dueAt),
            reason: asText(followUp.reason),
          };
        })
      : [],
    stepsTarget: planNumber(raw.stepsTarget),
    checkIns: planArray(raw.checkIns),
    signals: planArray(raw.signals),
    guardrails: planArray(raw.guardrails),
    generatedAt: asText(raw.generatedAt),
    version: planNumber(raw.version),
    needsV26Regeneration,
    legacyPlanNotice,
  };
}

function SmallList({ items }: { items?: string[] }) {
  if (!items?.length)
    return <p className="text-sm text-white/30">None planned.</p>;
  return (
    <ul className="space-y-1.5 text-sm leading-6 text-white/55">
      {items.map((item, index) => (
        <li key={`${item}-${index}`}>• {item}</li>
      ))}
    </ul>
  );
}

function AvailabilityDetails({
  status,
  summary,
  sources,
}: {
  status: "verified_local" | "verified_india" | "unverified" | "not_checked";
  summary: string;
  sources: string[];
}) {
  const label =
    status === "verified_local"
      ? "Available locally"
      : status === "verified_india"
        ? "Available in India"
        : status === "unverified"
          ? "Availability unverified"
          : "Availability not checked";
  return (
    <div className="mt-3 rounded-xl border border-white/10 bg-white/[0.02] p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/35">
        {label}
      </p>
      {summary ? (
        <p className="mt-1 text-xs leading-5 text-white/45">{summary}</p>
      ) : null}
      {sources?.length ? (
        <div className="mt-2 flex flex-wrap gap-2">
          {sources.map((source, index) => (
            <a
              key={`${source}-${index}`}
              href={source}
              target="_blank"
              rel="noreferrer"
              className="rounded-lg border border-white/10 px-2 py-1 text-[10px] font-bold text-[#C6FF32]"
            >
              Source {index + 1}
            </a>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function DayCard({
  day,
  busy,
  onChanged,
}: {
  day: RenderableHealthPlanDay;
  busy: boolean;
  onChanged: () => Promise<void>;
}) {
  const [open, setOpen] = useState(false);

  async function patch(payload: Parameters<typeof updateHealthPlanDay>[1]) {
    await updateHealthPlanDay(day.dateKey, payload);
    await onChanged();
  }

  return (
    <article className="rounded-[22px] border border-white/10 bg-black/20 p-4 sm:p-5">
      {day.legacyPlanNotice ? (
        <div className="mb-4 rounded-2xl border border-amber-400/20 bg-amber-400/[0.05] p-3 text-xs leading-5 text-amber-100">
          {day.legacyPlanNotice}
        </div>
      ) : null}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#C6FF32]">
            {prettyDate(day.dateKey)}
          </p>
          <h3 className="mt-2 text-xl font-black text-white">{day.focus}</h3>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/45">
            {day.rationale}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={busy}
            onClick={() => patch({ lockedByOwner: !day.lockedByOwner })}
            className="inline-flex min-h-9 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-bold text-white/55 disabled:opacity-40"
          >
            {day.lockedByOwner ? (
              <Lock className="h-3.5 w-3.5" />
            ) : (
              <Unlock className="h-3.5 w-3.5" />
            )}
            {day.lockedByOwner ? "Locked" : "Unlocked"}
          </button>
          <button
            type="button"
            disabled={busy || day.lockedByOwner}
            onClick={async () => {
              await regenerateHealthPlanDay(day.dateKey);
              await onChanged();
            }}
            className="inline-flex min-h-9 items-center gap-2 rounded-xl border border-[#C6FF32]/25 px-3 text-xs font-bold text-[#C6FF32] disabled:opacity-40"
          >
            <RefreshCw className="h-3.5 w-3.5" />
            Regenerate
          </button>
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 text-white/55"
          >
            {open ? (
              <ChevronUp className="h-4 w-4" />
            ) : (
              <ChevronDown className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-2xl bg-white/[0.035] p-3">
          <p className="text-[11px] font-black uppercase tracking-[0.15em] text-white/30">
            Morning
          </p>
          <p className="mt-1 font-bold text-white">
            {day.morningConditioning.type}
          </p>
          <p className="mt-1 text-xs text-white/40">
            {day.morningConditioning.durationMinutes} min ·{" "}
            {day.morningConditioning.when}
          </p>
        </div>
        <div className="rounded-2xl bg-white/[0.035] p-3">
          <p className="text-[11px] font-black uppercase tracking-[0.15em] text-white/30">
            Evening weights
          </p>
          <p className="mt-1 font-bold text-white">{day.training.title}</p>
          <p className="mt-1 text-xs text-white/40">
            {day.training.durationMinutes} min · {day.training.when}
          </p>
        </div>
        <div className="rounded-2xl bg-white/[0.035] p-3">
          <p className="text-[11px] font-black uppercase tracking-[0.15em] text-white/30">
            Normal walk
          </p>
          <p className="mt-1 font-bold text-white">
            {day.normalWalk.durationMinutes} min
          </p>
          <p className="mt-1 text-xs text-white/40">{day.normalWalk.when}</p>
        </div>
        <div className="rounded-2xl bg-white/[0.035] p-3">
          <p className="text-[11px] font-black uppercase tracking-[0.15em] text-white/30">
            Nutrition
          </p>
          <p className="mt-1 font-bold text-white">
            {day.nutrition.calorieTarget
              ? `${day.nutrition.calorieTarget} kcal`
              : "Evidence-led"}
          </p>
          <p className="mt-1 text-xs text-white/40">
            Protein {day.nutrition.proteinGrams || "—"} g
          </p>
        </div>
        <div className="rounded-2xl bg-white/[0.035] p-3">
          <p className="text-[11px] font-black uppercase tracking-[0.15em] text-white/30">
            Steps
          </p>
          <p className="mt-1 font-bold text-white">
            {day.stepsTarget.toLocaleString("en-IN")}
          </p>
        </div>
        <div className="rounded-2xl bg-white/[0.035] p-3">
          <p className="text-[11px] font-black uppercase tracking-[0.15em] text-white/30">
            Sleep
          </p>
          <p className="mt-1 font-bold text-white">{day.sleep.targetHours} h</p>
          <p className="mt-1 text-xs text-white/40">
            {day.sleep.bedtimeWindow}
          </p>
        </div>
        <div className="rounded-2xl bg-white/[0.035] p-3">
          <p className="text-[11px] font-black uppercase tracking-[0.15em] text-white/30">
            Meditation
          </p>
          <p className="mt-1 font-bold text-white">
            {day.meditation.durationMinutes} min
          </p>
          <p className="mt-1 text-xs text-white/40">{day.meditation.type}</p>
        </div>
      </div>

      {open ? (
        <div className="mt-5 space-y-5 border-t border-white/10 pt-5">
          <section className="grid gap-3 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 p-4">
              <p className="text-xs font-black uppercase tracking-[0.15em] text-[#C6FF32]">
                Morning conditioning
              </p>
              <p className="mt-2 font-black">
                {day.morningConditioning.type} ·{" "}
                {day.morningConditioning.durationMinutes} min
              </p>
              <p className="mt-1 text-sm text-white/45">
                {day.morningConditioning.when} ·{" "}
                {day.morningConditioning.intensity}
              </p>
              <p className="mt-2 text-xs leading-5 text-white/35">
                {day.morningConditioning.notes}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 p-4">
              <p className="text-xs font-black uppercase tracking-[0.15em] text-[#C6FF32]">
                Evening weights
              </p>
              <p className="mt-2 font-black">
                {day.training.title} · {day.training.durationMinutes} min
              </p>
              <p className="mt-1 text-sm text-white/45">
                {day.training.when} · {day.training.intensity}
              </p>
            </div>
            <div className="rounded-2xl border border-white/10 p-4">
              <p className="text-xs font-black uppercase tracking-[0.15em] text-[#C6FF32]">
                Normal walk
              </p>
              <p className="mt-2 font-black">
                {day.normalWalk.durationMinutes} min easy walk
              </p>
              <p className="mt-1 text-sm text-white/45">
                {day.normalWalk.when} · {day.normalWalk.intensity}
              </p>
              <p className="mt-2 text-xs leading-5 text-white/35">
                {day.normalWalk.notes}
              </p>
            </div>
          </section>

          <section>
            <h4 className="flex items-center gap-2 font-black">
              <Dumbbell className="h-4 w-4 text-[#C6FF32]" />
              Evening weights prescription
            </h4>
            <div className="mt-3 grid gap-3 lg:grid-cols-2">
              {day.training.exercises.length ? (
                day.training.exercises.map((exercise, index) => (
                  <div
                    key={`${exercise.name}-${index}`}
                    className="rounded-2xl border border-white/10 p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="font-black text-white">{exercise.name}</p>
                      <span className="rounded-lg bg-[#C6FF32]/10 px-2 py-1 text-xs font-black text-[#C6FF32]">
                        {exercise.sets} × {exercise.reps}
                      </span>
                    </div>
                    <p className="mt-2 text-xs leading-5 text-white/40">
                      RIR {exercise.rir} · RPE {exercise.rpe} · Rest{" "}
                      {exercise.restSeconds}s · Tempo {exercise.tempo}
                    </p>
                    {exercise.notes ? (
                      <p className="mt-2 text-sm leading-6 text-white/50">
                        {exercise.notes}
                      </p>
                    ) : null}
                  </div>
                ))
              ) : (
                <div className="rounded-2xl border border-dashed border-white/10 p-4 text-sm text-white/35">
                  Recovery / rest day — no resistance exercises prescribed.
                </div>
              )}
            </div>
            <div className="mt-3 grid gap-3 lg:grid-cols-3">
              <div className="rounded-2xl bg-white/[0.025] p-4">
                <p className="mb-2 text-xs font-black uppercase tracking-[0.15em] text-white/30">
                  Warm-up
                </p>
                <SmallList items={day.training.warmup} />
              </div>
              <div className="rounded-2xl bg-white/[0.025] p-4">
                <p className="mb-2 text-xs font-black uppercase tracking-[0.15em] text-white/30">
                  Cardio
                </p>
                <p className="text-sm text-white/55">
                  {day.training.cardio.type} ·{" "}
                  {day.training.cardio.durationMinutes} min ·{" "}
                  {day.training.cardio.intensity}
                </p>
                <p className="mt-2 text-xs leading-5 text-white/35">
                  {day.training.cardio.notes}
                </p>
              </div>
              <div className="rounded-2xl bg-white/[0.025] p-4">
                <p className="mb-2 text-xs font-black uppercase tracking-[0.15em] text-white/30">
                  Cooldown
                </p>
                <SmallList items={day.training.cooldown} />
              </div>
            </div>
            <p className="mt-3 text-sm text-white/45">
              <strong className="text-white/70">Progression:</strong>{" "}
              {day.training.progressionRule}
            </p>
            <p className="mt-2 text-sm text-white/45">
              <strong className="text-white/70">Deload:</strong>{" "}
              {day.training.deloadNote}
            </p>
          </section>

          <section className="rounded-2xl border border-[#C6FF32]/15 bg-[#C6FF32]/[0.025] p-4">
            <p className="text-xs font-black uppercase tracking-[0.15em] text-[#C6FF32]">
              Today is the source of truth
            </p>
            <p className="mt-2 text-sm leading-6 text-white/50">
              Follow the diet, performance nutrition, skincare, haircare and body-care steps below. [OWNED] means use what you already have, [BUY] means shortlist/buy before following that step, and [REVIEW] means confirm before changing anything.
            </p>
          </section>

          <section className="grid gap-4 xl:grid-cols-2">
            <div className="rounded-2xl border border-white/10 p-4">
              <h4 className="font-black">Diet + performance nutrition</h4>
              <p className="mt-2 text-sm text-white/45">
                {day.nutrition.focus}
              </p>
              <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold text-white/55">
                <span>{day.nutrition.proteinGrams || "—"}g protein</span>
                <span>·</span>
                <span>{day.nutrition.carbsGrams || "—"}g carbs</span>
                <span>·</span>
                <span>{day.nutrition.fatGrams || "—"}g fat</span>
                <span>·</span>
                <span>{day.nutrition.hydrationLitres}L water</span>
              </div>
              <div className="mt-3 space-y-3">
                {day.nutrition.meals.map((meal, index) => (
                  <div
                    key={`${meal.label}-${index}`}
                    className="rounded-xl bg-white/[0.03] p-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <p className="text-xs font-black text-[#C6FF32]">
                        {meal.time} · {meal.label}
                      </p>
                      <span className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/30">
                        {meal.proteinGrams}g protein
                      </span>
                    </div>
                    <p className="mt-1 text-sm leading-6 text-white/50">
                      {meal.guidance}
                    </p>
                    {meal.items?.length ? (
                      <div className="mt-3 space-y-2">
                        {meal.items.map((item, itemIndex) => (
                          <div
                            key={`${item.name}-${itemIndex}`}
                            className="rounded-lg border border-white/10 bg-black/20 p-2.5"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <p className="text-sm font-black text-white">
                                {item.name}
                              </p>
                              <span className="text-xs font-bold text-white/40">
                                {item.quantity} {item.unit}
                              </span>
                            </div>
                            <p className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] text-white/25">
                              {item.category.replaceAll("_", " ")}
                            </p>
                            {item.preparation ? (
                              <p className="mt-1 text-xs leading-5 text-white/45">
                                {item.preparation}
                              </p>
                            ) : null}
                            {item.reason ? (
                              <p className="mt-1 text-xs leading-5 text-white/35">
                                Why: {item.reason}
                              </p>
                            ) : null}
                            {item.alternatives?.length ? (
                              <p className="mt-1 text-xs leading-5 text-white/30">
                                Alternatives: {item.alternatives.join(", ")}
                              </p>
                            ) : null}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="mt-2 text-xs text-amber-200">
                        This meal is missing exact food items; refresh the V2.6
                        plan.
                      </p>
                    )}
                  </div>
                ))}
              </div>
              <div className="mt-5 border-t border-white/10 pt-4">
                <p className="text-xs font-black uppercase tracking-[0.15em] text-[#C6FF32]">
                  Creatine, protein + supplement decisions
                </p>
                <div className="mt-3 space-y-2">
                  {day.nutrition.performanceNutrition.length ? (
                    day.nutrition.performanceNutrition.map((item, index) => (
                      <div
                        key={`${item.category}-${index}`}
                        className="rounded-xl border border-white/10 bg-white/[0.025] p-3"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <p className="font-black text-white">{item.item}</p>
                          <span className={`rounded-lg px-2 py-1 text-[10px] font-black uppercase ${item.status === "active" ? "bg-[#C6FF32]/10 text-[#C6FF32]" : item.status === "not_needed_today" ? "bg-white/5 text-white/35" : "bg-amber-400/10 text-amber-200"}`}>
                            {item.action.replaceAll("_", " ")} · {item.status.replaceAll("_", " ")}
                          </span>
                        </div>
                        <p className="mt-1 text-xs font-bold text-white/35">{item.when}</p>
                        {item.guidance ? (
                          <p className="mt-2 text-xs leading-5 text-white/45">{item.guidance}</p>
                        ) : null}
                        {item.approvalRequired ? (
                          <p className="mt-2 text-[10px] font-black uppercase tracking-[0.12em] text-amber-200">Approval required before changing/starting</p>
                        ) : null}
                      </div>
                    ))
                  ) : (
                    <p className="text-xs text-amber-200">Regenerate this day: creatine/protein decisions are missing.</p>
                  )}
                </div>
              </div>
            </div>
            <div className="rounded-2xl border border-white/10 p-4">
              <h4 className="font-black">Recovery + daily care</h4>
              <div className="mt-3 space-y-4 text-sm text-white/50">
                <div>
                  <p className="font-bold text-white/70">Meditation</p>
                  <p>
                    {day.meditation.durationMinutes} min {day.meditation.type} ·{" "}
                    {day.meditation.when} · {day.meditation.intention}
                  </p>
                </div>
                <div>
                  <p className="font-bold text-white/70">Skincare AM · ordered</p>
                  <SmallList items={day.skincare.morning} />
                  {day.skincare.improvementFocus ? <p className="mt-1 text-xs text-white/30">Focus: {day.skincare.improvementFocus}</p> : null}
                </div>
                <div>
                  <p className="font-bold text-white/70">Skincare PM · tonight</p>
                  <SmallList items={day.skincare.evening} />
                </div>
                <div>
                  <p className="font-bold text-white/70">Body care AM</p>
                  <SmallList items={day.bodyCare.morning} />
                </div>
                <div>
                  <p className="font-bold text-white/70">Body care PM</p>
                  <SmallList items={day.bodyCare.evening} />
                  {day.bodyCare.improvementFocus ? <p className="mt-1 text-xs text-white/30">Focus: {day.bodyCare.improvementFocus}</p> : null}
                </div>
                <div>
                  <p className="font-bold text-white/70">
                    Haircare {day.haircare.washDay ? "· wash day" : "· non-wash day"}
                  </p>
                  <SmallList items={day.haircare.routine} />
                  {day.haircare.improvementFocus ? <p className="mt-1 text-xs text-white/30">Focus: {day.haircare.improvementFocus}</p> : null}
                </div>
                <div>
                  <p className="font-bold text-white/70">Configured supplement schedule</p>
                  <SmallList items={day.supplementSchedule} />
                </div>
              </div>
            </div>
          </section>

          {day.labFollowUps?.length ? (
            <section className="rounded-2xl border border-amber-400/15 bg-amber-400/[0.03] p-4">
              <p className="text-xs font-black uppercase tracking-[0.15em] text-amber-200">
                Lab follow-ups due
              </p>
              <div className="mt-3 space-y-2">
                {day.labFollowUps.map((item, index) => (
                  <div key={`${item.testName}-${index}`}>
                    <p className="font-bold text-white">{item.testName}</p>
                    <p className="text-sm text-white/45">
                      {new Date(item.dueAt).toLocaleDateString("en-IN")} ·{" "}
                      {item.reason}
                    </p>
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section className="grid gap-4 lg:grid-cols-3">
            <div className="rounded-2xl bg-white/[0.025] p-4">
              <p className="mb-2 text-xs font-black uppercase tracking-[0.15em] text-white/30">
                Check-ins
              </p>
              <SmallList items={day.checkIns} />
            </div>
            <div className="rounded-2xl bg-white/[0.025] p-4">
              <p className="mb-2 text-xs font-black uppercase tracking-[0.15em] text-white/30">
                Signals used
              </p>
              <SmallList items={day.signals} />
            </div>
            <div className="rounded-2xl bg-white/[0.025] p-4">
              <p className="mb-2 text-xs font-black uppercase tracking-[0.15em] text-white/30">
                Guardrails
              </p>
              <SmallList items={day.guardrails} />
            </div>
          </section>

          <div className="flex flex-wrap gap-2">
            {(["planned", "completed", "skipped"] as const).map((status) => (
              <button
                key={status}
                type="button"
                disabled={busy}
                onClick={() => patch({ status })}
                className={`rounded-xl px-3 py-2 text-xs font-black ${day.status === status ? "bg-[#C6FF32] text-[#030608]" : "border border-white/10 text-white/45"}`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>
      ) : null}
    </article>
  );
}

export function HealthPlannerWorkspace() {
  const [setup, setSetup] = useState<HealthPlannerSetup | null>(null);
  const [windowData, setWindowData] = useState<HealthPlanWindow | null>(null);
  const [section, setSection] = useState<Section>("baseline");
  const [form, setForm] = useState<BaselineForm>(emptyBaseline);
  const [busy, setBusy] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [goal, setGoal] = useState({
    category: "body",
    title: "",
    currentValue: "",
    targetValue: "",
    unit: "",
    horizonMode: "relative" as HealthGoalHorizonMode,
    targetDate: "",
    relativeMonths: "3",
    priority: "3",
    successCriteria: "",
    notes: "",
  });
  const [photo, setPhoto] = useState({
    category: "body" as HealthPhotoCategory,
    angle: "front",
    takenAt: "",
    file: null as File | null,
  });
  const [sourceReport, setSourceReport] = useState({
    label: "",
    reportDate: "",
    file: null as File | null,
  });

  const refresh = useCallback(async () => {
    const [nextSetup, nextWindow] = await Promise.all([
      getHealthPlannerSetup(),
      getHealthPlanWindow(7),
    ]);
    setSetup(nextSetup);
    setWindowData(nextWindow);
    setForm(baselineToForm(nextSetup.baseline));
  }, []);

  useEffect(() => {
    refresh()
      .catch((caughtError) =>
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to load Health Planner.",
        ),
      )
      .finally(() => setLoading(false));
  }, [refresh]);

  async function captureCurrentLocation() {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      if (!("geolocation" in navigator)) {
        throw new Error("Location capture is not supported by this browser.");
      }
      const position = await new Promise<GeolocationPosition>(
        (resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 12000,
            maximumAge: 5 * 60 * 1000,
          });
        },
      );
      const timezone =
        Intl.DateTimeFormat().resolvedOptions().timeZone ||
        form.timezone ||
        "Asia/Kolkata";
      const resolved = await resolveHealthLocation({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracyMeters: position.coords.accuracy,
        timezone,
      });
      setForm((current) => ({
        ...current,
        city: resolved.city || current.city,
        region: resolved.region || current.region,
        country: resolved.country || current.country,
        countryCode: resolved.countryCode || current.countryCode,
        timezone: resolved.timezone || timezone,
        latitude: String(resolved.latitude),
        longitude: String(resolved.longitude),
        locationAccuracyMeters:
          resolved.accuracyMeters == null
            ? ""
            : String(Math.round(resolved.accuracyMeters)),
        locationCapturedAt: resolved.capturedAt,
        locationSource: resolved.source,
      }));
      setNotice(
        resolved.city
          ? `Current location captured as ${resolved.city}${resolved.region ? `, ${resolved.region}` : ""}. Save baseline to use it in planning.`
          : "Coordinates captured. City could not be resolved automatically; verify the city fields and save baseline.",
      );
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : typeof caughtError === "object" &&
              caughtError &&
              "message" in caughtError
            ? String(
                (caughtError as { message?: unknown }).message ??
                  "Unable to capture current location.",
              )
            : "Unable to capture current location.";
      setError(message);
    } finally {
      setBusy(false);
    }
  }

  const activeGoals = useMemo(
    () => setup?.goals.filter((item) => item.status === "active") ?? [],
    [setup],
  );
  const sections: Array<{
    key: Section;
    label: string;
    icon: typeof Activity;
  }> = [
    { key: "baseline", label: "Baseline", icon: HeartPulse },
    { key: "targets", label: "Targets", icon: Target },
    { key: "photos", label: "Photos", icon: Camera },
    { key: "products", label: "Products", icon: PackageSearch },
    { key: "strategy", label: "Strategy", icon: Brain },
    { key: "plan", label: "7-Day Plan", icon: Sparkles },
  ];

  async function run(action: () => Promise<unknown>, success: string) {
    setBusy(true);
    setError("");
    setNotice("");
    try {
      await action();
      await refresh();
      setNotice(success);
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Health Planner action failed.";
      if (message.includes("already refreshing the Health strategy")) {
        setNotice(
          "HSAKAA is already rebuilding the Health strategy. The in-flight refresh will be reused automatically; retry shortly if this message remains.",
        );
      } else {
        setError(message);
      }
    } finally {
      setBusy(false);
    }
  }

  if (loading)
    return (
      <div
        className={`${cardClass} flex min-h-56 items-center justify-center gap-3 text-white/45`}
      >
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading your Health baseline and plan…
      </div>
    );

  return (
    <div className="space-y-6">
      <section className={cardClass}>
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#C6FF32]">
              Baseline → target → strategy → execution
            </p>
            <h2 className="mt-2 text-2xl font-black">HSAKAA Health Planner</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/45">
              HSAKAA does not invent a plan before it understands your current
              body, lifestyle, reports, constraints, routines and expected
              outcome.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-2xl bg-white/[0.035] px-4 py-3">
              <p className="text-xl font-black">
                {setup?.readiness.onboardingCompleted ? "✓" : "—"}
              </p>
              <p className="text-[10px] uppercase tracking-[0.14em] text-white/30">
                Baseline
              </p>
            </div>
            <div className="rounded-2xl bg-white/[0.035] px-4 py-3">
              <p className="text-xl font-black">{activeGoals.length}</p>
              <p className="text-[10px] uppercase tracking-[0.14em] text-white/30">
                Targets
              </p>
            </div>
            <div className="rounded-2xl bg-white/[0.035] px-4 py-3">
              <p className="text-xl font-black">
                {windowData?.days.length ?? 0}/7
              </p>
              <p className="text-[10px] uppercase tracking-[0.14em] text-white/30">
                Days
              </p>
            </div>
          </div>
        </div>
        {setup?.readiness.prompts.length ? (
          <div className="mt-5 rounded-[18px] border border-[#C6FF32]/15 bg-[#C6FF32]/[0.025] p-4">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#C6FF32]">
              Still needed
            </p>
            <SmallList items={setup.readiness.prompts} />
          </div>
        ) : null}
      </section>

      <div className="flex flex-wrap gap-2">
        {sections.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.key}
              type="button"
              onClick={() => setSection(item.key)}
              className={`inline-flex min-h-10 items-center gap-2 rounded-[14px] px-4 text-sm font-black ${section === item.key ? "bg-[#C6FF32] text-[#030608]" : "border border-white/10 text-white/45 hover:text-white"}`}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          );
        })}
      </div>

      {error ? (
        <div className="rounded-[18px] border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">
          {error}
        </div>
      ) : null}
      {notice ? (
        <div className="rounded-[18px] border border-[#C6FF32]/20 bg-[#C6FF32]/10 p-4 text-sm text-[#C6FF32]">
          {notice}
        </div>
      ) : null}

      {section === "baseline" ? (
        <section className={cardClass}>
          <div>
            <h2 className="text-xl font-black">Where are you right now?</h2>
            <p className="mt-1 text-sm text-white/40">
              Record current look, measurements, lifestyle, training context,
              professional instructions and all routine domains. Existing Health
              Reports, tracked health, diet, supplements and meditation are
              consumed automatically by the planner.
            </p>
          </div>
          <div className="mt-5 grid gap-4 lg:grid-cols-2">
            <label className="lg:col-span-2">
              <span className="mb-2 block text-xs font-bold text-white/45">
                Current look / current state
              </span>
              <textarea
                className={textareaClass}
                value={form.currentLookSummary}
                onChange={(e) =>
                  setForm((c) => ({ ...c, currentLookSummary: e.target.value }))
                }
                placeholder="Describe how you look and feel today: body composition, energy, posture, visible concerns, fitness level…"
              />
            </label>
            <label className="lg:col-span-2">
              <span className="mb-2 block text-xs font-bold text-white/45">
                What do you expect to become?
              </span>
              <textarea
                className={textareaClass}
                value={form.expectationSummary}
                onChange={(e) =>
                  setForm((c) => ({ ...c, expectationSummary: e.target.value }))
                }
                placeholder="Describe your expected body, fitness, skin, hair, sleep, recovery and lifestyle outcome."
              />
            </label>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ["Weight (kg)", "weightKg"],
              ["Height (cm)", "heightCm"],
              ["Waist (cm)", "waistCm"],
              ["Body fat % (if known)", "bodyFatPct"],
              ["Sleep hours", "sleepHours"],
              ["Daily steps", "stepsPerDay"],
              ["Stress level", "stressLevel"],
              ["Work / daily routine", "workRoutine"],
            ].map(([label, key]) => (
              <label key={key}>
                <span className="mb-2 block text-xs font-bold text-white/45">
                  {label}
                </span>
                <input
                  className={inputClass}
                  value={form[key as keyof BaselineForm] as string}
                  onChange={(e) =>
                    setForm((c) => ({ ...c, [key]: e.target.value }))
                  }
                />
              </label>
            ))}
          </div>

          <div className="mt-6 rounded-[20px] border border-white/10 p-4">
            <div className="flex items-start gap-3">
              <MapPin className="mt-0.5 h-5 w-5 text-[#C6FF32]" />
              <div>
                <h3 className="font-black">
                  Location for practical food + product availability
                </h3>
                <p className="mt-1 text-xs leading-5 text-white/35">
                  Used only to prefer foods you can realistically source and to
                  verify public retail availability. It is not used to infer
                  health facts.
                </p>
              </div>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <input
                className={inputClass}
                placeholder="City"
                value={form.city}
                onChange={(e) =>
                  setForm((c) => ({ ...c, city: e.target.value }))
                }
              />
              <input
                className={inputClass}
                placeholder="State / region"
                value={form.region}
                onChange={(e) =>
                  setForm((c) => ({ ...c, region: e.target.value }))
                }
              />
              <input
                className={inputClass}
                placeholder="Country"
                value={form.country}
                onChange={(e) =>
                  setForm((c) => ({ ...c, country: e.target.value }))
                }
              />
              <input
                className={inputClass}
                placeholder="Country code"
                value={form.countryCode}
                onChange={(e) =>
                  setForm((c) => ({
                    ...c,
                    countryCode: e.target.value.toUpperCase(),
                  }))
                }
              />
              <input
                className={inputClass}
                placeholder="Timezone"
                value={form.timezone}
                onChange={(e) =>
                  setForm((c) => ({ ...c, timezone: e.target.value }))
                }
              />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              <button
                type="button"
                disabled={busy}
                onClick={captureCurrentLocation}
                className="inline-flex min-h-10 items-center gap-2 rounded-[12px] border border-[#C6FF32]/25 px-4 text-xs font-black text-[#C6FF32] disabled:opacity-40"
              >
                <LocateFixed className="h-3.5 w-3.5" />
                Use current location
              </button>
              {form.latitude && form.longitude ? (
                <p className="text-xs text-white/35">
                  Captured {Number(form.latitude).toFixed(4)},{" "}
                  {Number(form.longitude).toFixed(4)}
                  {form.locationAccuracyMeters
                    ? ` · ±${Math.round(Number(form.locationAccuracyMeters))} m`
                    : ""}
                  {form.locationCapturedAt
                    ? ` · ${new Date(form.locationCapturedAt).toLocaleString("en-IN")}`
                    : ""}
                </p>
              ) : (
                <p className="text-xs text-white/30">
                  Mumbai remains the default until you capture or edit your
                  location.
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 grid gap-4 lg:grid-cols-2">
            <div className="rounded-[20px] border border-white/10 p-4">
              <h3 className="font-black">
                Constraints & professional instructions
              </h3>
              <div className="mt-3 space-y-3">
                <textarea
                  className={textareaClass}
                  placeholder="Injuries / limitations"
                  value={form.injuries}
                  onChange={(e) =>
                    setForm((c) => ({ ...c, injuries: e.target.value }))
                  }
                />
                <textarea
                  className={textareaClass}
                  placeholder="Pain / movements that aggravate it"
                  value={form.painNotes}
                  onChange={(e) =>
                    setForm((c) => ({ ...c, painNotes: e.target.value }))
                  }
                />
                <textarea
                  className={textareaClass}
                  placeholder="Current medications (context only; HSAKAA will not change them)"
                  value={form.medications}
                  onChange={(e) =>
                    setForm((c) => ({ ...c, medications: e.target.value }))
                  }
                />
                <textarea
                  className={textareaClass}
                  placeholder="Doctor / physio / clinician instructions"
                  value={form.clinicianInstructions}
                  onChange={(e) =>
                    setForm((c) => ({
                      ...c,
                      clinicianInstructions: e.target.value,
                    }))
                  }
                />
                <textarea
                  className={textareaClass}
                  placeholder="Dietitian instructions"
                  value={form.dietitianInstructions}
                  onChange={(e) =>
                    setForm((c) => ({
                      ...c,
                      dietitianInstructions: e.target.value,
                    }))
                  }
                />
              </div>
            </div>
            <div className="rounded-[20px] border border-white/10 p-4">
              <h3 className="font-black">Daily movement + gym programming</h3>
              <p className="mt-1 text-xs leading-5 text-white/35">
                The planner keeps three separate blocks: morning walk/run/jog,
                evening weights, and a separate easy walk.
              </p>
              <div className="mt-3 grid gap-3 sm:grid-cols-2">
                <select
                  className={inputClass}
                  value={form.planningMode}
                  onChange={(e) =>
                    setForm((c) => ({
                      ...c,
                      planningMode: e.target
                        .value as BaselineForm["planningMode"],
                    }))
                  }
                >
                  <option value="hsakaa">HSAKAA creates full program</option>
                  <option value="trainer_program">
                    Follow trainer program
                  </option>
                </select>
                <input
                  className={inputClass}
                  placeholder="Weight days / week"
                  value={form.daysPerWeek}
                  onChange={(e) =>
                    setForm((c) => ({ ...c, daysPerWeek: e.target.value }))
                  }
                />
                <input
                  className={inputClass}
                  placeholder="Evening weights minutes"
                  value={form.preferredSessionMinutes}
                  onChange={(e) =>
                    setForm((c) => ({
                      ...c,
                      preferredSessionMinutes: e.target.value,
                    }))
                  }
                />
                <select
                  className={inputClass}
                  value={form.experienceLevel}
                  onChange={(e) =>
                    setForm((c) => ({ ...c, experienceLevel: e.target.value }))
                  }
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
                <input
                  className={inputClass}
                  placeholder="Morning: walk/run/jog"
                  value={form.morningConditioningType}
                  onChange={(e) =>
                    setForm((c) => ({
                      ...c,
                      morningConditioningType: e.target.value,
                    }))
                  }
                />
                <input
                  className={inputClass}
                  type="number"
                  min="0"
                  placeholder="Morning minutes"
                  value={form.morningConditioningMinutes}
                  onChange={(e) =>
                    setForm((c) => ({
                      ...c,
                      morningConditioningMinutes: e.target.value,
                    }))
                  }
                />
                <label className="text-xs text-white/35">
                  Morning time
                  <input
                    className={`${inputClass} mt-1`}
                    type="time"
                    value={form.morningConditioningTime}
                    onChange={(e) =>
                      setForm((c) => ({
                        ...c,
                        morningConditioningTime: e.target.value,
                      }))
                    }
                  />
                </label>
                <label className="text-xs text-white/35">
                  Evening weights time
                  <input
                    className={`${inputClass} mt-1`}
                    type="time"
                    value={form.eveningWeightsTime}
                    onChange={(e) =>
                      setForm((c) => ({
                        ...c,
                        eveningWeightsTime: e.target.value,
                      }))
                    }
                  />
                </label>
                <input
                  className={inputClass}
                  type="number"
                  min="0"
                  placeholder="Normal walk minutes"
                  value={form.normalWalkMinutes}
                  onChange={(e) =>
                    setForm((c) => ({
                      ...c,
                      normalWalkMinutes: e.target.value,
                    }))
                  }
                />
                <label className="text-xs text-white/35">
                  Normal walk time
                  <input
                    className={`${inputClass} mt-1`}
                    type="time"
                    value={form.normalWalkTime}
                    onChange={(e) =>
                      setForm((c) => ({ ...c, normalWalkTime: e.target.value }))
                    }
                  />
                </label>
              </div>
              <textarea
                className={`${textareaClass} mt-3`}
                placeholder="Available equipment, comma separated"
                value={form.availableEquipment}
                onChange={(e) =>
                  setForm((c) => ({ ...c, availableEquipment: e.target.value }))
                }
              />
              {form.planningMode === "trainer_program" ? (
                <textarea
                  className={`${textareaClass} mt-3 min-h-40`}
                  placeholder="Paste trainer program here. HSAKAA preserves it and adapts recovery/cardio/supporting work around it."
                  value={form.trainerProgramText}
                  onChange={(e) =>
                    setForm((c) => ({
                      ...c,
                      trainerProgramText: e.target.value,
                    }))
                  }
                />
              ) : null}
            </div>
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
            <div className="rounded-[20px] border border-white/10 p-4">
              <h3 className="font-black">Diet</h3>
              <div className="mt-3 space-y-3">
                <input
                  className={inputClass}
                  placeholder="Pattern / preference"
                  value={form.dietPattern}
                  onChange={(e) =>
                    setForm((c) => ({ ...c, dietPattern: e.target.value }))
                  }
                />
                <input
                  className={inputClass}
                  placeholder="Restrictions"
                  value={form.dietRestrictions}
                  onChange={(e) =>
                    setForm((c) => ({ ...c, dietRestrictions: e.target.value }))
                  }
                />
                <input
                  className={inputClass}
                  placeholder="Allergies / intolerances"
                  value={form.allergies}
                  onChange={(e) =>
                    setForm((c) => ({ ...c, allergies: e.target.value }))
                  }
                />
                <div className="grid grid-cols-2 gap-3">
                  <input
                    className={inputClass}
                    placeholder="Current kcal"
                    value={form.currentCalories}
                    onChange={(e) =>
                      setForm((c) => ({
                        ...c,
                        currentCalories: e.target.value,
                      }))
                    }
                  />
                  <input
                    className={inputClass}
                    placeholder="Protein g"
                    value={form.currentProteinGrams}
                    onChange={(e) =>
                      setForm((c) => ({
                        ...c,
                        currentProteinGrams: e.target.value,
                      }))
                    }
                  />
                </div>
              </div>
            </div>
            <div className="rounded-[20px] border border-white/10 p-4">
              <h3 className="font-black">Meditation</h3>
              <div className="mt-3 space-y-3">
                <input
                  className={inputClass}
                  placeholder="Minutes"
                  value={form.meditationMinutes}
                  onChange={(e) =>
                    setForm((c) => ({
                      ...c,
                      meditationMinutes: e.target.value,
                    }))
                  }
                />
                <input
                  className={inputClass}
                  placeholder="Frequency"
                  value={form.meditationFrequency}
                  onChange={(e) =>
                    setForm((c) => ({
                      ...c,
                      meditationFrequency: e.target.value,
                    }))
                  }
                />
                <input
                  className={inputClass}
                  placeholder="Preferred type"
                  value={form.meditationType}
                  onChange={(e) =>
                    setForm((c) => ({ ...c, meditationType: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="rounded-[20px] border border-white/10 p-4">
              <h3 className="font-black">Reports / evidence</h3>
              <p className="mt-1 text-xs leading-5 text-white/35">
                Upload private PDF/image lab or clinician reports. HSAKAA
                extracts documented evidence without independently diagnosing.
                Generated Health Reports are also consumed automatically.
              </p>
              <div className="mt-3 space-y-3">
                <input
                  className={inputClass}
                  placeholder="Report label (optional)"
                  value={sourceReport.label}
                  onChange={(e) =>
                    setSourceReport((c) => ({ ...c, label: e.target.value }))
                  }
                />
                <input
                  className={inputClass}
                  type="date"
                  value={sourceReport.reportDate}
                  onChange={(e) =>
                    setSourceReport((c) => ({
                      ...c,
                      reportDate: e.target.value,
                    }))
                  }
                />
                <input
                  className={`${inputClass} file:mr-3 file:rounded-lg file:border-0 file:bg-[#C6FF32] file:px-3 file:py-1.5 file:text-xs file:font-black file:text-[#030608]`}
                  type="file"
                  accept="application/pdf,image/jpeg,image/png,image/webp"
                  onChange={(e) =>
                    setSourceReport((c) => ({
                      ...c,
                      file: e.target.files?.[0] ?? null,
                    }))
                  }
                />
                <button
                  type="button"
                  disabled={busy || !sourceReport.file}
                  onClick={() =>
                    run(async () => {
                      if (!sourceReport.file) return;
                      await uploadHealthSourceReport({
                        file: sourceReport.file,
                        label: sourceReport.label,
                        reportDate: sourceReport.reportDate
                          ? `${sourceReport.reportDate}T12:00:00+05:30`
                          : undefined,
                      });
                      setSourceReport({
                        label: "",
                        reportDate: "",
                        file: null,
                      });
                    }, "Health report stored privately and added to planning evidence.")
                  }
                  className="inline-flex min-h-10 items-center gap-2 rounded-[12px] bg-[#C6FF32] px-4 text-xs font-black text-[#030608] disabled:opacity-40"
                >
                  <FileText className="h-4 w-4" />
                  Upload report
                </button>
              </div>
              <textarea
                className={`${textareaClass} mt-3 min-h-28`}
                placeholder="Additional report notes, one per line"
                value={form.reportNotes}
                onChange={(e) =>
                  setForm((c) => ({ ...c, reportNotes: e.target.value }))
                }
              />
              <Link
                href="/admin/health/reports"
                className="mt-3 inline-flex text-xs font-black text-[#C6FF32]"
              >
                Open generated Health Reports →
              </Link>
            </div>
            <div className="rounded-[20px] border border-white/10 p-4">
              <h3 className="font-black">Skincare</h3>
              <div className="mt-3 space-y-3">
                <input
                  className={inputClass}
                  placeholder="Goals"
                  value={form.skinGoals}
                  onChange={(e) =>
                    setForm((c) => ({ ...c, skinGoals: e.target.value }))
                  }
                />
                <textarea
                  className={textareaClass}
                  placeholder="Visible concerns"
                  value={form.skinConcerns}
                  onChange={(e) =>
                    setForm((c) => ({ ...c, skinConcerns: e.target.value }))
                  }
                />
                <textarea
                  className={textareaClass}
                  placeholder="Current routine / what has or has not worked"
                  value={form.skinRoutineNotes}
                  onChange={(e) =>
                    setForm((c) => ({ ...c, skinRoutineNotes: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="rounded-[20px] border border-white/10 p-4">
              <h3 className="font-black">Haircare</h3>
              <div className="mt-3 space-y-3">
                <input
                  className={inputClass}
                  placeholder="Goals"
                  value={form.hairGoals}
                  onChange={(e) =>
                    setForm((c) => ({ ...c, hairGoals: e.target.value }))
                  }
                />
                <textarea
                  className={textareaClass}
                  placeholder="Visible concerns"
                  value={form.hairConcerns}
                  onChange={(e) =>
                    setForm((c) => ({ ...c, hairConcerns: e.target.value }))
                  }
                />
                <textarea
                  className={textareaClass}
                  placeholder="Current routine / what has or has not worked"
                  value={form.hairRoutineNotes}
                  onChange={(e) =>
                    setForm((c) => ({ ...c, hairRoutineNotes: e.target.value }))
                  }
                />
              </div>
            </div>
            <div className="rounded-[20px] border border-white/10 p-4">
              <h3 className="font-black">Intimate care</h3>
              <textarea
                className={`${textareaClass} mt-3 min-h-40`}
                placeholder="Private routine / product / symptom context. No intimate-area photos are accepted or analyzed."
                value={form.intimateCareNotes}
                onChange={(e) =>
                  setForm((c) => ({ ...c, intimateCareNotes: e.target.value }))
                }
              />
            </div>
          </div>

          {setup?.sourceReports?.length ? (
            <div className="mt-5 rounded-[20px] border border-white/10 p-4">
              <p className="text-xs font-black uppercase tracking-[0.15em] text-white/35">
                Uploaded private report evidence
              </p>
              <div className="mt-3 grid gap-3 lg:grid-cols-2">
                {setup.sourceReports.map((report) => (
                  <article
                    key={report._id}
                    className="rounded-[16px] bg-white/[0.025] p-4"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="font-black text-white">
                          {report.label || report.originalName}
                        </p>
                        <p className="mt-1 text-xs text-white/35">
                          {new Date(report.reportDate).toLocaleDateString(
                            "en-IN",
                          )}{" "}
                          · {(report.byteSize / 1024 / 1024).toFixed(1)} MB
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Link
                          href={getHealthSourceReportContentUrl(report._id)}
                          target="_blank"
                          className="rounded-lg border border-white/10 px-2.5 py-1.5 text-xs font-bold text-white/45"
                        >
                          Open
                        </Link>
                        <button
                          type="button"
                          disabled={busy}
                          onClick={() =>
                            run(
                              () => reanalyzeHealthSourceReport(report._id),
                              "Report re-analyzed for explicit lab follow-up timing.",
                            )
                          }
                          className="rounded-lg border border-[#C6FF32]/20 px-2.5 py-1.5 text-xs font-bold text-[#C6FF32]"
                        >
                          Re-analyze
                        </button>
                        <button
                          type="button"
                          aria-label="Remove health report"
                          disabled={busy}
                          onClick={() =>
                            run(
                              () => removeHealthSourceReport(report._id),
                              "Health report removed.",
                            )
                          }
                          className="grid h-8 w-8 place-items-center rounded-lg border border-red-400/20 text-red-300"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                    {report.analysis?.summary ? (
                      <p className="mt-3 text-sm leading-6 text-white/50">
                        {report.analysis.summary}
                      </p>
                    ) : null}
                    {report.analysis?.measurements?.length ? (
                      <div className="mt-3">
                        <p className="mb-1 text-xs font-black text-white/55">
                          Measurements
                        </p>
                        <SmallList items={report.analysis.measurements} />
                      </div>
                    ) : null}
                    {report.analysis?.planningImplications?.length ? (
                      <div className="mt-3">
                        <p className="mb-1 text-xs font-black text-white/55">
                          Planning implications
                        </p>
                        <SmallList
                          items={report.analysis.planningImplications}
                        />
                      </div>
                    ) : null}
                    {report.analysis?.safetyFlags?.length ? (
                      <div className="mt-3 rounded-xl border border-amber-400/15 bg-amber-400/[0.05] p-3 text-xs leading-5 text-amber-200">
                        {report.analysis.safetyFlags.join(" ")}
                      </div>
                    ) : null}
                    {report.analysis?.followUpTests?.length ? (
                      <div className="mt-3 space-y-2">
                        <p className="text-xs font-black text-white/55">
                          Lab re-test / follow-up
                        </p>
                        {report.analysis.followUpTests.map(
                          (followUp, index) => (
                            <div
                              key={`${followUp.testName}-${index}`}
                              className="rounded-xl border border-white/10 p-3"
                            >
                              <p className="text-sm font-black text-white">
                                {followUp.testName}
                              </p>
                              <p className="mt-1 text-xs leading-5 text-white/40">
                                {followUp.timingText ||
                                  followUp.reason ||
                                  "Follow-up captured from report."}
                              </p>
                              {followUp.dueAt ? (
                                <div className="mt-2 flex flex-wrap items-center gap-2">
                                  <span className="rounded-lg bg-[#C6FF32]/10 px-2 py-1 text-xs font-bold text-[#C6FF32]">
                                    Reminder{" "}
                                    {new Date(
                                      followUp.dueAt,
                                    ).toLocaleDateString("en-IN")}
                                  </span>
                                  <button
                                    type="button"
                                    disabled={busy}
                                    onClick={() =>
                                      run(
                                        () =>
                                          updateHealthSourceReportFollowUp(
                                            report._id,
                                            index,
                                            { status: "completed" },
                                          ),
                                        "Lab follow-up marked completed.",
                                      )
                                    }
                                    className="rounded-lg border border-white/10 px-2 py-1 text-xs font-bold text-white/45"
                                  >
                                    Done
                                  </button>
                                </div>
                              ) : (
                                <label className="mt-2 block text-xs text-amber-200">
                                  Report gives no explicit timing — confirm with
                                  your clinician or choose the date you were
                                  given.
                                  <input
                                    type="date"
                                    className={`${inputClass} mt-2`}
                                    onChange={(e) => {
                                      const value = e.target.value;
                                      if (!value) return;
                                      void run(
                                        () =>
                                          updateHealthSourceReportFollowUp(
                                            report._id,
                                            index,
                                            {
                                              dueAt: `${value}T09:00:00+05:30`,
                                              reminderEnabled: true,
                                            },
                                          ),
                                        "Lab follow-up reminder date saved.",
                                      );
                                    }}
                                  />
                                </label>
                              )}
                            </div>
                          ),
                        )}
                      </div>
                    ) : null}
                  </article>
                ))}
              </div>
            </div>
          ) : null}

          <div className="mt-5 rounded-[20px] border border-white/10 p-4">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <HardDrive className="mt-0.5 h-5 w-5 text-[#C6FF32]" />
                <div>
                  <h3 className="font-black">Private Health file storage</h3>
                  <p className="mt-1 text-xs leading-5 text-white/35">
                    New Health photos and uploaded reports must live in private
                    S3. MongoDB keeps metadata and extracted evidence, not the
                    new binary file.
                  </p>
                </div>
              </div>
              <span
                className={`rounded-lg px-2.5 py-1.5 text-xs font-black ${setup?.storage?.configured ? "bg-[#C6FF32]/10 text-[#C6FF32]" : "bg-amber-400/10 text-amber-200"}`}
              >
                {setup?.storage?.configured
                  ? "S3 configured"
                  : "S3 not configured"}
              </span>
            </div>
            <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              <div className="rounded-xl bg-white/[0.03] p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.13em] text-white/30">
                  Region
                </p>
                <p className="mt-1 text-sm font-bold text-white/60">
                  {setup?.storage?.region ?? "—"}
                </p>
              </div>
              <div className="rounded-xl bg-white/[0.03] p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.13em] text-white/30">
                  Bucket
                </p>
                <p className="mt-1 truncate text-sm font-bold text-white/60">
                  {setup?.storage?.bucket ?? "Not configured"}
                </p>
              </div>
              <div className="rounded-xl bg-white/[0.03] p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.13em] text-white/30">
                  Legacy photos
                </p>
                <p className="mt-1 text-sm font-bold text-white/60">
                  {setup?.storage?.legacyPhotos ?? 0}
                </p>
              </div>
              <div className="rounded-xl bg-white/[0.03] p-3">
                <p className="text-[10px] font-black uppercase tracking-[0.13em] text-white/30">
                  Legacy reports
                </p>
                <p className="mt-1 text-sm font-bold text-white/60">
                  {setup?.storage?.legacyReports ?? 0}
                </p>
              </div>
            </div>
            {setup?.storage?.migrationRequired ? (
              <button
                type="button"
                disabled={busy || !setup.storage.configured}
                onClick={() =>
                  run(
                    () => migrateLegacyHealthStorage(),
                    "Existing Health photos/reports migrated to private S3.",
                  )
                }
                className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-[12px] border border-[#C6FF32]/25 px-4 text-xs font-black text-[#C6FF32] disabled:opacity-40"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                Migrate existing uploads to S3
              </button>
            ) : (
              <p className="mt-3 text-xs text-white/35">
                No legacy Mongo-stored Health binaries are waiting for
                migration.
              </p>
            )}
          </div>

          <label className="mt-5 flex items-start gap-3 rounded-[18px] border border-[#C6FF32]/15 bg-[#C6FF32]/[0.025] p-4 text-sm text-white/55">
            <input
              type="checkbox"
              className="mt-1"
              checked={form.onboardingCompleted}
              onChange={(e) =>
                setForm((c) => ({
                  ...c,
                  onboardingCompleted: e.target.checked,
                }))
              }
            />
            <span>
              <strong className="block text-white">
                This baseline accurately represents my current state.
              </strong>
              Mark complete only after current look, measurements, constraints,
              gym mode and important routine context are captured.
            </span>
          </label>
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              run(
                () => saveHealthBaseline(baselinePayload(form)),
                "Baseline saved.",
              )
            }
            className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-[14px] bg-[#C6FF32] px-5 text-sm font-black text-[#030608] disabled:opacity-50"
          >
            {busy ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Check className="h-4 w-4" />
            )}
            Save baseline
          </button>
        </section>
      ) : null}

      {section === "targets" ? (
        <section className={cardClass}>
          <h2 className="text-xl font-black">Where do you want to be?</h2>
          <p className="mt-1 text-sm text-white/40">
            Each target is current → target → horizon → priority → measurable
            success criteria.
          </p>
          <div className="mt-5 grid gap-3 md:grid-cols-2 lg:grid-cols-4">
            <input
              className={inputClass}
              placeholder="Category: body, strength, VO2 max…"
              value={goal.category}
              onChange={(e) =>
                setGoal((c) => ({ ...c, category: e.target.value }))
              }
            />
            <input
              className={`${inputClass} lg:col-span-2`}
              placeholder="Target title"
              value={goal.title}
              onChange={(e) =>
                setGoal((c) => ({ ...c, title: e.target.value }))
              }
            />
            <input
              className={inputClass}
              placeholder="Unit"
              value={goal.unit}
              onChange={(e) => setGoal((c) => ({ ...c, unit: e.target.value }))}
            />
            <input
              className={inputClass}
              placeholder="Current value"
              value={goal.currentValue}
              onChange={(e) =>
                setGoal((c) => ({ ...c, currentValue: e.target.value }))
              }
            />
            <input
              className={inputClass}
              placeholder="Target value"
              value={goal.targetValue}
              onChange={(e) =>
                setGoal((c) => ({ ...c, targetValue: e.target.value }))
              }
            />
            <select
              className={inputClass}
              value={goal.horizonMode}
              onChange={(e) =>
                setGoal((c) => ({
                  ...c,
                  horizonMode: e.target.value as HealthGoalHorizonMode,
                }))
              }
            >
              <option value="relative">3 / 6 / 12 months</option>
              <option value="exact_date">Exact date</option>
              <option value="ongoing">Ongoing</option>
            </select>
            {goal.horizonMode === "relative" ? (
              <input
                className={inputClass}
                type="number"
                min={1}
                max={60}
                placeholder="Months"
                value={goal.relativeMonths}
                onChange={(e) =>
                  setGoal((c) => ({ ...c, relativeMonths: e.target.value }))
                }
              />
            ) : goal.horizonMode === "exact_date" ? (
              <input
                className={inputClass}
                type="date"
                value={goal.targetDate}
                onChange={(e) =>
                  setGoal((c) => ({ ...c, targetDate: e.target.value }))
                }
              />
            ) : (
              <div className="rounded-[14px] border border-white/10 px-3.5 py-3 text-sm text-white/30">
                No end date
              </div>
            )}
            <select
              className={inputClass}
              value={goal.priority}
              onChange={(e) =>
                setGoal((c) => ({ ...c, priority: e.target.value }))
              }
            >
              {[5, 4, 3, 2, 1].map((value) => (
                <option key={value} value={value}>
                  Priority {value}
                </option>
              ))}
            </select>
            <textarea
              className={`${textareaClass} md:col-span-2`}
              placeholder="Success criteria"
              value={goal.successCriteria}
              onChange={(e) =>
                setGoal((c) => ({ ...c, successCriteria: e.target.value }))
              }
            />
            <textarea
              className={`${textareaClass} md:col-span-2`}
              placeholder="Notes / constraints"
              value={goal.notes}
              onChange={(e) =>
                setGoal((c) => ({ ...c, notes: e.target.value }))
              }
            />
          </div>
          <button
            type="button"
            disabled={busy || !goal.title.trim() || !goal.targetValue.trim()}
            onClick={() =>
              run(async () => {
                await createHealthGoal({
                  category: goal.category.trim(),
                  title: goal.title.trim(),
                  currentValue: goal.currentValue.trim(),
                  targetValue: goal.targetValue.trim(),
                  unit: goal.unit.trim(),
                  horizonMode: goal.horizonMode,
                  ...(goal.horizonMode === "exact_date"
                    ? { targetDate: goal.targetDate }
                    : {}),
                  ...(goal.horizonMode === "relative"
                    ? { relativeMonths: Number(goal.relativeMonths) }
                    : {}),
                  priority: Number(goal.priority),
                  successCriteria: goal.successCriteria.trim(),
                  notes: goal.notes.trim(),
                });
                setGoal((c) => ({
                  ...c,
                  title: "",
                  currentValue: "",
                  targetValue: "",
                  successCriteria: "",
                  notes: "",
                }));
              }, "Target added.")
            }
            className="mt-4 min-h-11 rounded-[14px] bg-[#C6FF32] px-5 text-sm font-black text-[#030608] disabled:opacity-50"
          >
            Add target
          </button>
          <div className="mt-6 grid gap-3 lg:grid-cols-2">
            {setup?.goals.length ? (
              setup.goals.map((item) => (
                <article
                  key={item._id}
                  className="rounded-[18px] border border-white/10 bg-black/20 p-4"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.15em] text-[#C6FF32]">
                        {item.category} · priority {item.priority}
                      </p>
                      <h3 className="mt-1 font-black">{item.title}</h3>
                      <p className="mt-2 text-sm text-white/50">
                        {item.currentValue || "Current not set"} →{" "}
                        <strong className="text-white">
                          {item.targetValue} {item.unit}
                        </strong>
                      </p>
                      <p className="mt-1 text-xs text-white/35">
                        {item.horizonMode === "relative"
                          ? `${item.relativeMonths} months`
                          : item.horizonMode === "exact_date"
                            ? new Date(
                                item.targetDate ?? "",
                              ).toLocaleDateString("en-IN")
                            : "Ongoing"}
                      </p>
                    </div>
                    <button
                      type="button"
                      aria-label="Remove target"
                      disabled={busy}
                      onClick={() =>
                        run(() => removeHealthGoal(item._id), "Target removed.")
                      }
                      className="grid h-9 w-9 place-items-center rounded-xl border border-red-400/20 text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                  {item.successCriteria ? (
                    <p className="mt-3 text-sm leading-6 text-white/40">
                      Success: {item.successCriteria}
                    </p>
                  ) : null}
                  <div className="mt-3 flex gap-2">
                    {(["active", "achieved", "paused"] as const).map(
                      (status) => (
                        <button
                          key={status}
                          disabled={busy}
                          type="button"
                          onClick={() =>
                            run(
                              () => updateHealthGoal(item._id, { status }),
                              `Target marked ${status}.`,
                            )
                          }
                          className={`rounded-lg px-2.5 py-1.5 text-xs font-bold ${item.status === status ? "bg-white/10 text-white" : "text-white/30"}`}
                        >
                          {status}
                        </button>
                      ),
                    )}
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[18px] border border-dashed border-white/10 p-6 text-sm text-white/35">
                No targets yet. At least one active target is required before
                Strategy and AI Plan unlock.
              </div>
            )}
          </div>
        </section>
      ) : null}

      {section === "photos" ? (
        <section className={cardClass}>
          <h2 className="text-xl font-black">Private visual baseline</h2>
          <p className="mt-1 text-sm text-white/40">
            Body, skin and hair photos stay behind the owner-authenticated
            Health API. HSAKAA makes non-diagnostic visual observations and
            keeps history for comparison. Intimate-area photos are intentionally
            unsupported.
          </p>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            <select
              className={inputClass}
              value={photo.category}
              onChange={(e) => {
                const category = e.target.value as HealthPhotoCategory;
                setPhoto((c) => ({
                  ...c,
                  category,
                  angle:
                    category === "body"
                      ? "front"
                      : category === "skin"
                        ? "front"
                        : "front_hairline",
                }));
              }}
            >
              <option value="body">Body</option>
              <option value="skin">Skin</option>
              <option value="hair">Hair</option>
            </select>
            <select
              className={inputClass}
              value={photo.angle}
              onChange={(e) =>
                setPhoto((c) => ({ ...c, angle: e.target.value }))
              }
            >
              {(photo.category === "body"
                ? ["front", "side_left", "side_right", "back"]
                : photo.category === "skin"
                  ? ["front", "left", "right", "close_up"]
                  : [
                      "front_hairline",
                      "left_temple",
                      "right_temple",
                      "top",
                      "crown",
                    ]
              ).map((value) => (
                <option key={value} value={value}>
                  {value.replaceAll("_", " ")}
                </option>
              ))}
            </select>
            <input
              className={inputClass}
              type="date"
              value={photo.takenAt}
              onChange={(e) =>
                setPhoto((c) => ({ ...c, takenAt: e.target.value }))
              }
            />
            <input
              className={`${inputClass} lg:col-span-2 file:mr-3 file:rounded-lg file:border-0 file:bg-[#C6FF32] file:px-3 file:py-1.5 file:text-xs file:font-black file:text-[#030608]`}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              onChange={(e) =>
                setPhoto((c) => ({ ...c, file: e.target.files?.[0] ?? null }))
              }
            />
          </div>
          <button
            type="button"
            disabled={busy || !photo.file}
            onClick={() =>
              run(async () => {
                if (!photo.file) return;
                await uploadHealthPhoto({
                  file: photo.file,
                  category: photo.category,
                  angle: photo.angle,
                  takenAt: photo.takenAt
                    ? `${photo.takenAt}T12:00:00+05:30`
                    : undefined,
                });
                setPhoto((c) => ({ ...c, file: null }));
              }, "Photo saved privately and analysis recorded when available.")
            }
            className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-[14px] bg-[#C6FF32] px-5 text-sm font-black text-[#030608] disabled:opacity-50"
          >
            <Camera className="h-4 w-4" />
            Upload checkpoint
          </button>
          <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {setup?.photos.length ? (
              setup.photos.map((item) => (
                <article
                  key={item._id}
                  className="overflow-hidden rounded-[18px] border border-white/10 bg-black/20"
                >
                  <img
                    src={getHealthPhotoContentUrl(item._id)}
                    alt={`${item.category} ${item.angle} progress`}
                    className="aspect-[4/3] w-full object-cover"
                  />
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs font-black uppercase tracking-[0.14em] text-[#C6FF32]">
                          {item.category} · {item.angle.replaceAll("_", " ")}
                        </p>
                        <p className="mt-1 text-xs text-white/35">
                          {new Date(item.takenAt).toLocaleDateString("en-IN")}
                        </p>
                      </div>
                      <button
                        type="button"
                        disabled={busy}
                        onClick={() =>
                          run(
                            () => removeHealthPhoto(item._id),
                            "Photo removed.",
                          )
                        }
                        className="grid h-8 w-8 place-items-center rounded-lg border border-red-400/20 text-red-300"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {item.analysis?.summary ? (
                      <p className="mt-3 text-sm leading-6 text-white/50">
                        {item.analysis.summary}
                      </p>
                    ) : (
                      <p className="mt-3 text-sm text-white/30">
                        Stored privately; AI analysis unavailable or pending.
                      </p>
                    )}
                    {item.analysis?.improvementOpportunities?.length ? (
                      <div className="mt-3">
                        <p className="mb-1 text-xs font-black text-white/55">
                          Improvement opportunities
                        </p>
                        <SmallList
                          items={item.analysis.improvementOpportunities}
                        />
                      </div>
                    ) : null}
                    {item.analysis?.safetyFlags?.length ? (
                      <div className="mt-3 rounded-xl border border-amber-400/15 bg-amber-400/[0.05] p-3 text-xs leading-5 text-amber-200">
                        {item.analysis.safetyFlags.join(" ")}
                      </div>
                    ) : null}
                  </div>
                </article>
              ))
            ) : (
              <div className="rounded-[18px] border border-dashed border-white/10 p-6 text-sm text-white/35">
                No private progress photos yet.
              </div>
            )}
          </div>
        </section>
      ) : null}

      {section === "products" ? (
        <section className={cardClass}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black">
                Products inside Health planning
              </h2>
              <p className="mt-1 text-sm text-white/40">
                Products OS remains the single inventory source. HSAKAA uses
                what you already own, remaining stock, expiry and replacement
                state before suggesting anything new.
              </p>
            </div>
            <Link
              href="/admin/health/products"
              className="inline-flex min-h-11 items-center rounded-[14px] bg-[#C6FF32] px-4 text-sm font-black text-[#030608]"
            >
              Open Product Inventory
            </Link>
          </div>
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-[18px] bg-white/[0.03] p-4">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-white/30">
                Tracked
              </p>
              <p className="mt-2 text-2xl font-black">
                {setup?.products?.total ?? 0}
              </p>
            </div>
            <div className="rounded-[18px] bg-white/[0.03] p-4">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-white/30">
                Low
              </p>
              <p className="mt-2 text-2xl font-black">
                {setup?.products?.whatToBuyNext?.summary?.lowProducts ?? 0}
              </p>
            </div>
            <div className="rounded-[18px] bg-white/[0.03] p-4">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-white/30">
                Need alternative
              </p>
              <p className="mt-2 text-2xl font-black">
                {setup?.products?.whatToBuyNext?.summary?.alternativesNeeded ??
                  0}
              </p>
            </div>
            <div className="rounded-[18px] bg-white/[0.03] p-4">
              <p className="text-xs font-black uppercase tracking-[0.14em] text-white/30">
                Expiring soon
              </p>
              <p className="mt-2 text-2xl font-black">
                {setup?.products?.whatToBuyNext?.summary?.expiringSoon ?? 0}
              </p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            {setup?.products?.products
              ?.filter(
                (product) =>
                  product.category === "skincare" ||
                  product.category === "haircare" ||
                  product.category === "supplement",
              )
              .map((product) => (
                <article
                  key={product._id}
                  className="rounded-[18px] border border-white/10 p-4"
                >
                  <p className="font-black">{product.name}</p>
                  <p className="mt-1 text-xs uppercase tracking-[0.14em] text-white/35">
                    {product.brand ? `${product.brand} · ` : ""}
                    {product.category} · {product.status}
                  </p>
                  <p className="mt-2 text-sm text-white/45">
                    {Math.round(product.usage?.remainingPercentage ?? 0)}%
                    remaining
                    {product.usage?.estimatedFinishAt
                      ? ` · est. finish ${new Date(product.usage.estimatedFinishAt).toLocaleDateString("en-IN")}`
                      : ""}
                  </p>
                </article>
              ))}
          </div>
        </section>
      ) : null}

      {section === "strategy" ? (
        <section className={cardClass}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black">AI Health Strategy</h2>
              <p className="mt-1 text-sm text-white/40">
                Built only after baseline completion + at least one active
                target. It uses tracked Health/WHOOP, diet, supplements,
                meditation, Health Reports, routines, product inventory and
                photo observations.
              </p>
              <p className="mt-2 text-xs text-white/30">
                Availability checks use {form.city || "your city"},{" "}
                {form.country || "your country"} only for public retail
                verification.
              </p>
            </div>
            <button
              type="button"
              disabled={busy || !setup?.readiness.planReady}
              onClick={() =>
                run(
                  () => generateHealthStrategy(true),
                  "Health strategy refreshed with local product checks.",
                )
              }
              className="inline-flex min-h-11 items-center gap-2 rounded-[14px] bg-[#C6FF32] px-4 text-sm font-black text-[#030608] disabled:opacity-40"
            >
              {busy ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="h-4 w-4" />
              )}
              Generate strategy
            </button>
          </div>

          {setup?.strategy ? (
            <div className="mt-5 space-y-5">
              <div className="rounded-[20px] border border-[#C6FF32]/15 bg-[#C6FF32]/[0.025] p-5">
                <p className="text-sm leading-7 text-white/65">
                  {setup.strategy.summary}
                </p>
                <div className="mt-4">
                  <p className="mb-2 text-xs font-black uppercase tracking-[0.15em] text-[#C6FF32]">
                    Priorities
                  </p>
                  <SmallList items={setup.strategy.priorities} />
                </div>
              </div>

              <div className="grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
                {[
                  ["Training", setup.strategy.trainingStrategy],
                  ["Nutrition", setup.strategy.nutritionStrategy],
                  ["Recovery", setup.strategy.recoveryStrategy],
                  ["Meditation", setup.strategy.meditationStrategy],
                  ["Skin", setup.strategy.skinStrategy],
                  ["Hair", setup.strategy.hairStrategy],
                  ["Body care", setup.strategy.bodyCareStrategy],
                  ["Intimate care", setup.strategy.intimateCareStrategy],
                ].map(([label, text]) => (
                  <div
                    key={label}
                    className="rounded-[18px] border border-white/10 p-4"
                  >
                    <p className="text-xs font-black uppercase tracking-[0.15em] text-white/30">
                      {label}
                    </p>
                    <p className="mt-2 text-sm leading-6 text-white/50">
                      {text}
                    </p>
                  </div>
                ))}
              </div>

              {setup.strategy.productRecommendations?.length ? (
                <div>
                  <p className="mb-3 text-xs font-black uppercase tracking-[0.15em] text-[#C6FF32]">
                    Skin + hair + body-care recommendations
                  </p>
                  <div className="grid gap-3 lg:grid-cols-2">
                    {setup.strategy.productRecommendations.map(
                      (item, index) => (
                        <article
                          key={`${item.domain}-${item.slot}-${index}`}
                          className="rounded-[18px] border border-white/10 p-4"
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-lg bg-[#C6FF32]/10 px-2 py-1 text-[10px] font-black uppercase text-[#C6FF32]">
                              {item.action}
                            </span>
                            <span className="text-xs font-bold text-white/35">
                              {item.domain} · {item.slot}
                            </span>
                          </div>
                          <p className="mt-3 font-black text-white">
                            {item.suggestedBrand && item.suggestedProductName
                              ? `${item.suggestedBrand} `
                              : ""}
                            {item.suggestedProductName ||
                              item.currentProduct ||
                              item.slot}
                          </p>
                          {item.currentProduct ? (
                            <p className="mt-1 text-xs text-white/35">
                              Current: {item.currentProduct}
                            </p>
                          ) : null}
                          <p className="mt-2 text-sm leading-6 text-white/50">
                            {item.reason}
                          </p>
                          <p className="mt-2 text-xs leading-5 text-white/35">
                            {item.usageGuidance}
                          </p>
                          {item.concerns?.length ? (
                            <div className="mt-2 text-xs text-amber-200">
                              {item.concerns.join(" · ")}
                            </div>
                          ) : null}
                          <AvailabilityDetails
                            status={item.availabilityStatus}
                            summary={item.availabilitySummary}
                            sources={item.availabilitySources}
                          />
                          <div className="mt-3 flex flex-wrap items-center gap-2">
                            <p className="text-[10px] font-bold uppercase tracking-[0.14em] text-white/25">
                              Suggestion only · owner approval required
                            </p>
                            {(item.action === "add" ||
                              item.action === "replace") &&
                            item.suggestedProductName ? (
                              <button
                                type="button"
                                disabled={busy}
                                onClick={() =>
                                  run(
                                    () =>
                                      createProduct({
                                        name: item.suggestedProductName,
                                        ...(item.suggestedBrand
                                          ? { brand: item.suggestedBrand }
                                          : {}),
                                        category:
                                          item.domain === "bodycare"
                                            ? "personal_care"
                                            : item.domain,
                                        productType: "consumable",
                                        status: "want_to_buy",
                                        tags: [
                                          "hsakaa-health-recommendation",
                                          item.slot,
                                        ],
                                        notes: item.reason,
                                      }),
                                    "Product added to Products OS wishlist.",
                                  )
                                }
                                className="rounded-lg border border-[#C6FF32]/20 px-2.5 py-1.5 text-xs font-black text-[#C6FF32]"
                              >
                                Add to buy list
                              </button>
                            ) : null}
                          </div>
                        </article>
                      ),
                    )}
                  </div>
                </div>
              ) : null}

              {setup.strategy.supplementRecommendations?.length ? (
                <div className="grid gap-3 sm:grid-cols-3">
                  <div className="rounded-[18px] border border-[#C6FF32]/15 bg-[#C6FF32]/[0.025] p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#C6FF32]">
                      Buy / shortlist
                    </p>
                    <p className="mt-2 text-2xl font-black text-white">
                      {
                        setup.strategy.supplementRecommendations.filter(
                          (item) =>
                            item.action === "add" || item.action === "replace",
                        ).length
                      }
                    </p>
                    <p className="mt-1 text-xs leading-5 text-white/35">
                      Only add/replace candidates. Prefer locally verified
                      options before buying.
                    </p>
                  </div>
                  <div className="rounded-[18px] border border-white/10 p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/35">
                      Keep
                    </p>
                    <p className="mt-2 text-2xl font-black text-white">
                      {
                        setup.strategy.supplementRecommendations.filter(
                          (item) => item.action === "keep",
                        ).length
                      }
                    </p>
                    <p className="mt-1 text-xs leading-5 text-white/35">
                      Current products that HSAKAA does not recommend changing.
                    </p>
                  </div>
                  <div className="rounded-[18px] border border-amber-400/15 bg-amber-400/[0.03] p-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-amber-200">
                      Review / possible stop
                    </p>
                    <p className="mt-2 text-2xl font-black text-white">
                      {
                        setup.strategy.supplementRecommendations.filter(
                          (item) =>
                            item.action === "review" ||
                            item.action === "review_stop",
                        ).length
                      }
                    </p>
                    <p className="mt-1 text-xs leading-5 text-white/35">
                      Nothing is stopped automatically. Review-stop requires
                      explicit approval and professional review where flagged.
                    </p>
                  </div>
                </div>
              ) : null}

              {setup.strategy.supplementRecommendations?.length ? (
                <div>
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                    <p className="text-xs font-black uppercase tracking-[0.15em] text-[#C6FF32]">
                      Supplement + performance nutrition recommendations
                    </p>
                    <Link
                      href="/admin/health/supplements"
                      className="text-xs font-black text-[#C6FF32]"
                    >
                      Open Supplements OS →
                    </Link>
                  </div>
                  <div className="grid gap-3 lg:grid-cols-2">
                    {setup.strategy.supplementRecommendations.map(
                      (item, index) => (
                        <article
                          key={`${item.category}-${index}`}
                          className={`rounded-[18px] border p-4 ${item.action === "review_stop" ? "border-amber-400/20 bg-amber-400/[0.03]" : "border-white/10"}`}
                        >
                          <div className="flex flex-wrap items-center gap-2">
                            <span
                              className={`rounded-lg px-2 py-1 text-[10px] font-black uppercase ${item.action === "review_stop" ? "bg-amber-400/10 text-amber-200" : "bg-[#C6FF32]/10 text-[#C6FF32]"}`}
                            >
                              {item.action.replaceAll("_", " ")}
                            </span>
                            <span className="text-xs font-bold text-white/35">
                              {item.category}
                            </span>
                          </div>
                          <p className="mt-3 font-black text-white">
                            {item.suggestedBrand
                              ? `${item.suggestedBrand} `
                              : ""}
                            {item.suggestedProductName ||
                              item.currentSupplement ||
                              item.category}
                          </p>
                          {item.currentSupplement ? (
                            <p className="mt-1 text-xs text-white/35">
                              Current: {item.currentSupplement}
                            </p>
                          ) : null}
                          <p className="mt-2 text-sm leading-6 text-white/50">
                            {item.reason}
                          </p>
                          {item.selectionCriteria?.length ? (
                            <div className="mt-3">
                              <p className="mb-1 text-[10px] font-black uppercase tracking-[0.13em] text-white/30">
                                What to choose
                              </p>
                              <SmallList items={item.selectionCriteria} />
                            </div>
                          ) : null}
                          <AvailabilityDetails
                            status={item.availabilityStatus}
                            summary={item.availabilitySummary}
                            sources={item.availabilitySources}
                          />
                          <p className="mt-3 text-[10px] font-bold uppercase tracking-[0.13em] text-white/25">
                            No automatic start/stop/dose change · owner approval
                            required
                            {item.requiresProfessionalReview
                              ? " · professional review required"
                              : ""}
                          </p>
                          {(item.action === "add" ||
                            item.action === "replace") &&
                          item.suggestedProductName ? (
                            <button
                              type="button"
                              disabled={busy}
                              onClick={() =>
                                run(
                                  () =>
                                    createProduct({
                                      name: item.suggestedProductName,
                                      ...(item.suggestedBrand
                                        ? { brand: item.suggestedBrand }
                                        : {}),
                                      category: "supplement",
                                      productType: "consumable",
                                      status: "want_to_buy",
                                      tags: [
                                        "hsakaa-health-recommendation",
                                        item.category,
                                      ],
                                      notes: item.reason,
                                    }),
                                  "Supplement candidate added to Products OS wishlist.",
                                )
                              }
                              className="mt-3 rounded-lg border border-[#C6FF32]/20 px-2.5 py-1.5 text-xs font-black text-[#C6FF32]"
                            >
                              Add to buy list
                            </button>
                          ) : null}
                        </article>
                      ),
                    )}
                  </div>
                </div>
              ) : null}

              <div className="grid gap-3 lg:grid-cols-2">
                <div className="rounded-[18px] border border-white/10 p-4">
                  <p className="mb-2 text-xs font-black uppercase tracking-[0.15em] text-white/30">
                    Measurement plan
                  </p>
                  <SmallList items={setup.strategy.measurementPlan} />
                </div>
                <div className="rounded-[18px] border border-amber-400/15 bg-amber-400/[0.03] p-4">
                  <p className="mb-2 text-xs font-black uppercase tracking-[0.15em] text-amber-200">
                    Safety / review
                  </p>
                  <SmallList items={setup.strategy.safetyEscalations} />
                </div>
              </div>
            </div>
          ) : (
            <div className="mt-5 rounded-[18px] border border-dashed border-white/10 p-6 text-sm text-white/35">
              No strategy yet.
            </div>
          )}
        </section>
      ) : null}

      {section === "plan" ? (
        <section className={cardClass}>
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-black">Today + next 6 days</h2>
              <p className="mt-1 text-sm text-white/40">
                Exact gym prescription, diet, steps, sleep, meditation,
                skincare, haircare, intimate-care routine, supplements and
                check-ins. Completed/skipped and owner-locked days are
                protected.
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                disabled={busy || !setup?.readiness.planReady}
                onClick={() => {
                  const missing = windowData?.coverage.missingDays ?? 7;
                  if (missing === 0) {
                    setNotice("7-day Health plan already complete. No existing days were changed.");
                    setError("");
                    return;
                  }
                  void run(
                    () => ensureHealthPlan(false, 7),
                    `Generated ${missing} missing Health day${missing === 1 ? "" : "s"}. Existing days were kept unchanged.`,
                  );
                }}
                className="inline-flex min-h-11 items-center gap-2 rounded-[14px] bg-[#C6FF32] px-4 text-sm font-black text-[#030608] disabled:opacity-40"
              >
                <Check className="h-4 w-4" />
                {windowData?.coverage.isCovered
                  ? "7-day plan complete"
                  : `Generate ${windowData?.coverage.missingDays ?? 7} missing day${(windowData?.coverage.missingDays ?? 7) === 1 ? "" : "s"}`}
              </button>
            </div>
          </div>
          {windowData?.coverage ? (
            <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold">
              <span className="rounded-xl bg-white/[0.04] px-3 py-2 text-white/50">
                Coverage {windowData.coverage.plannedDays}/
                {windowData.coverage.expectedDays}
              </span>
              <span className="rounded-xl bg-white/[0.04] px-3 py-2 text-white/50">
                Future days {windowData.coverage.futureCoverageDays}/
                {Math.max(0, windowData.coverage.expectedDays - 1)}
              </span>
              <span
                className={`rounded-xl px-3 py-2 ${windowData.coverage.isCovered ? "bg-[#C6FF32]/10 text-[#C6FF32]" : "bg-amber-400/10 text-amber-200"}`}
              >
                {windowData.coverage.isCovered
                  ? "Fully covered"
                  : `${windowData.coverage.missingDays} missing`}
              </span>
            </div>
          ) : null}
          <div className="mt-5 space-y-3">
            {windowData?.days.length ? (
              windowData.days.map((day) => {
                const renderableDay = normalizeHealthPlanDay(day);
                return (
                <DayCard
                  key={renderableDay.dateKey}
                  day={renderableDay}
                  busy={busy}
                  onChanged={refresh}
                />
                );
              })
            ) : (
              <div className="rounded-[18px] border border-dashed border-white/10 p-8 text-center">
                <p className="font-black text-white/70">
                  No AI Health plan generated yet.
                </p>
                <p className="mt-2 text-sm text-white/35">
                  Complete the baseline, mark onboarding complete and add at
                  least one active target.
                </p>
              </div>
            )}
          </div>
        </section>
      ) : null}
    </div>
  );
}
