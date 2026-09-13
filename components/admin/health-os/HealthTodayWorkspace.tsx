"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  Circle,
  Loader2,
  RefreshCw,
  Save,
  SkipForward,
  Sparkles,
  Target,
} from "lucide-react";

import {
  ensureHealthPlan,
  getHealthDailyProgress,
  getHealthIntelligence,
  getHealthMorningBrief,
  getHealthPlanWindow,
  saveHealthExecutionFeedback,
  syncRecentWhoopHealth,
  updateHealthRoutineTask,
} from "@/lib/api/health-planner";
import type {
  HealthDailyProgress,
  HealthIntelligence,
  HealthIntelligenceSeverity,
  HealthMorningBrief,
  HealthPlanDay,
  HealthRoutineTask,
  HealthRoutineTaskStatus,
  HealthSubstanceUseStatus,
} from "@/types/health-planner";

const HEALTH_TODAY_AUTO_REFRESH_MS = 2 * 60_000;
const HEALTH_TODAY_FOCUS_REFRESH_GUARD_MS = 5_000;

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

function metric(value: number | null | undefined, suffix = "", digits = 0) {
  return typeof value === "number" ? `${value.toFixed(digits)}${suffix}` : "—";
}

const HEALTH_TASK_GROUPS: Array<{
  key: string;
  label: string;
  domains: string[];
}> = [
  { key: "movement", label: "Gym & movement", domains: ["training", "steps"] },
  { key: "diet", label: "Diet", domains: ["nutrition"] },
  { key: "meditation", label: "Meditation", domains: ["meditation"] },
  { key: "supplements", label: "Supplements", domains: ["supplements"] },
  { key: "skincare", label: "Skincare", domains: ["skincare"] },
  { key: "bodycare", label: "Body care", domains: ["bodycare"] },
  { key: "haircare", label: "Haircare", domains: ["haircare"] },
  { key: "intimate", label: "Intimate care", domains: ["intimateCare"] },
  { key: "recovery", label: "Sleep & check-in", domains: ["sleep", "checkIn"] },
  { key: "followups", label: "Health follow-ups", domains: ["lab"] },
];

function groupHealthTasks(tasks: HealthRoutineTask[]) {
  const grouped = HEALTH_TASK_GROUPS.map((group) => ({
    ...group,
    tasks: tasks.filter((task) => group.domains.includes(task.domain)),
  })).filter((group) => group.tasks.length > 0);
  const knownDomains = new Set(HEALTH_TASK_GROUPS.flatMap((group) => group.domains));
  const other = tasks.filter((task) => !knownDomains.has(task.domain));
  return other.length
    ? [...grouped, { key: "other", label: "Other", domains: [], tasks: other }]
    : grouped;
}

export function HealthTodayWorkspace() {
  const [dateKey, setDateKey] = useState(() => todayInIndia());
  const [day, setDay] = useState<HealthPlanDay | null>(null);
  const [progress, setProgress] = useState<HealthDailyProgress | null>(null);
  const [intelligence, setIntelligence] = useState<HealthIntelligence | null>(null);
  const [brief, setBrief] = useState<HealthMorningBrief | null>(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [smokingStatus, setSmokingStatus] = useState<HealthSubstanceUseStatus>("untracked");
  const [smokingQuantity, setSmokingQuantity] = useState("");
  const [smokingType, setSmokingType] = useState("");
  const [alcoholStatus, setAlcoholStatus] = useState<HealthSubstanceUseStatus>("untracked");
  const [alcoholQuantity, setAlcoholQuantity] = useState("");
  const [alcoholType, setAlcoholType] = useState("");
  const [lastRefreshedAt, setLastRefreshedAt] = useState<Date | null>(null);
  const executionRefreshInFlight = useRef(false);

  const load = useCallback(async () => {
    let window = await getHealthPlanWindow(7);
    if (
      !window.coverage.isCovered ||
      !window.days.some((item) => item.dateKey === dateKey)
    ) {
      window = await ensureHealthPlan(false, 7).catch(() => window);
    }
    const [execution, insight, morningBrief] = await Promise.all([
      getHealthDailyProgress(dateKey).catch(() => null),
      getHealthIntelligence(30).catch(() => null),
      getHealthMorningBrief().catch(() => null),
    ]);
    setDay(window.days.find((item) => item.dateKey === dateKey) ?? window.days[0] ?? null);
    setProgress(execution);
    setIntelligence(insight);
    setBrief(morningBrief);
    setError("");
    if (execution) {
      setSmokingStatus(execution.feedback.smoking?.status ?? "untracked");
      setSmokingQuantity(execution.feedback.smoking?.quantity?.toString() ?? "");
      setSmokingType(execution.feedback.smoking?.type ?? "");
      setAlcoholStatus(execution.feedback.alcohol?.status ?? "untracked");
      setAlcoholQuantity(execution.feedback.alcohol?.quantity?.toString() ?? "");
      setAlcoholType(execution.feedback.alcohol?.type ?? "");
    }
  }, [dateKey]);

  const refreshExecutionOnly = useCallback(async () => {
    if (executionRefreshInFlight.current) return;
    executionRefreshInFlight.current = true;
    try {
      const execution = await getHealthDailyProgress(dateKey).catch(() => null);
      if (execution) {
        setProgress(execution);
        setSmokingStatus(execution.feedback.smoking?.status ?? "untracked");
        setSmokingQuantity(execution.feedback.smoking?.quantity?.toString() ?? "");
        setSmokingType(execution.feedback.smoking?.type ?? "");
        setAlcoholStatus(execution.feedback.alcohol?.status ?? "untracked");
        setAlcoholQuantity(execution.feedback.alcohol?.quantity?.toString() ?? "");
        setAlcoholType(execution.feedback.alcohol?.type ?? "");
        setLastRefreshedAt(new Date());
      }
    } finally {
      executionRefreshInFlight.current = false;
    }
  }, [dateKey]);

  const refreshToday = useCallback(
    async (syncSources = false) => {
      if (syncSources) {
        await syncRecentWhoopHealth(3).catch(() => undefined);
      }

      await load();
      setLastRefreshedAt(new Date());
    },
    [load],
  );

  useEffect(() => {
    refreshToday(false).catch((value) =>
      setError(value instanceof Error ? value.message : "Unable to load Health today."),
    );
  }, [refreshToday]);

  useEffect(() => {
    let inFlight = false;
    let lastRefreshAt = Date.now();

    const refreshIfVisible = async (force = false) => {
      if (document.visibilityState !== "visible" || inFlight) return;

      const currentDateKey = todayInIndia();
      if (currentDateKey !== dateKey) {
        setDateKey(currentDateKey);
        return;
      }

      const now = Date.now();
      if (!force && now - lastRefreshAt < HEALTH_TODAY_FOCUS_REFRESH_GUARD_MS) return;

      inFlight = true;
      lastRefreshAt = now;
      try {
        await refreshExecutionOnly();
      } catch (value) {
        setError(value instanceof Error ? value.message : "Unable to refresh Health today.");
      } finally {
        inFlight = false;
      }
    };

    const intervalId = window.setInterval(
      () => void refreshIfVisible(true),
      HEALTH_TODAY_AUTO_REFRESH_MS,
    );
    const handleFocus = () => void refreshIfVisible();
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") void refreshIfVisible();
    };

    window.addEventListener("focus", handleFocus);
    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener("focus", handleFocus);
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [dateKey, refreshExecutionOnly]);

  async function changeTask(key: string, status: HealthRoutineTaskStatus) {
    setBusy(key);
    setError("");
    try {
      const updatedProgress = await updateHealthRoutineTask(dateKey, key, status);
      setProgress(updatedProgress);
      setLastRefreshedAt(new Date());
    } catch (value) {
      setError(value instanceof Error ? value.message : "Unable to update task.");
    } finally {
      setBusy("");
    }
  }

  async function saveLifestyle() {
    setBusy("lifestyle");
    setError("");
    try {
      const updatedProgress = await saveHealthExecutionFeedback(dateKey, {
        smokingStatus,
        ...(smokingStatus === "yes" && smokingQuantity
          ? { smokingQuantity: Number(smokingQuantity), smokingUnit: "cigarettes", smokingType }
          : {}),
        alcoholStatus,
        ...(alcoholStatus === "yes" && alcoholQuantity
          ? { alcoholQuantity: Number(alcoholQuantity), alcoholUnit: "drinks", alcoholType }
          : {}),
      });
      setProgress(updatedProgress);
      setLastRefreshedAt(new Date());
    } catch (value) {
      setError(value instanceof Error ? value.message : "Unable to save lifestyle check-in.");
    } finally {
      setBusy("");
    }
  }

  const m = progress?.automaticMetrics;
  const completed = progress?.tasks.filter((task) => task.status === "completed").length ?? 0;
  const taskGroups = groupHealthTasks(progress?.tasks ?? []);
  const topCards = intelligence?.cards.slice(0, 4) ?? [];
  const topGoals = intelligence?.goals.slice(0, 3) ?? [];

  return (
    <div className="space-y-5">
      <section className="rounded-[26px] border border-[#C6FF32]/20 bg-[#C6FF32]/[0.035] p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="max-w-4xl">
            <div className="flex flex-wrap items-center gap-2">
              <p className="text-xs font-black uppercase tracking-[0.16em] text-[#C6FF32]">Health OS · Today</p>
              {intelligence ? <IntelligenceStatus status={intelligence.status} /> : null}
            </div>
            <h2 className="mt-2 text-2xl font-black">{day?.focus ?? "Your autonomous health day"}</h2>
            <p className="mt-2 text-sm leading-6 text-white/45">
              {brief?.headline ?? intelligence?.headline ?? day?.rationale ?? "HSAKAA combines your rolling plan with automatic health data and completion signals."}
            </p>
            {intelligence?.headline && day?.rationale ? (
              <p className="mt-2 text-xs leading-5 text-white/25">Today’s plan: {day.rationale}</p>
            ) : null}
            <p className="mt-2 text-[11px] font-bold uppercase tracking-[0.12em] text-white/20">
              Auto-sync on · {lastRefreshedAt ? `last refreshed ${lastRefreshedAt.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}` : "syncing now"}
            </p>
          </div>
          <button
            onClick={() => {
              setBusy("refresh");
              refreshToday(true)
                .catch((value) =>
                  setError(value instanceof Error ? value.message : "Unable to refresh."),
                )
                .finally(() => setBusy(""));
            }}
            className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-white/[0.06] px-3 text-xs font-black text-white/60"
          >
            <RefreshCw className={`h-4 w-4 ${busy === "refresh" ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </section>

      {error ? (
        <div className="rounded-[18px] border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4 2xl:grid-cols-6">
        <Metric label="Recovery" value={metric(m?.recoveryScore, "%")} sub="automatic" />
        <Metric label="Strain" value={metric(m?.strainScore, "", 1)} sub="automatic" />
        <Metric
          label="Sleep"
          value={metric(m?.sleepHours, " h", 1)}
          sub={m?.sleepPerformancePercentage ? `${Math.round(m.sleepPerformancePercentage)}% performance` : "automatic"}
        />
        <Metric label="Weight" value={metric(m?.weightKg, " kg", 1)} sub="WHOOP/body data" />
        <Metric
          label="HRV"
          value={metric(m?.heartRateVariabilityMs, " ms")}
          sub={m?.restingHeartRateBpm ? `RHR ${Math.round(m.restingHeartRateBpm)} bpm` : "automatic"}
        />
        <Metric label="Max HR" value={metric(m?.maximumHeartRateBpm, " bpm")} sub="body profile" />
        <Metric
          label="Steps"
          value={typeof m?.steps === "number" ? m.steps.toLocaleString("en-IN") : "—"}
          sub={day?.stepsTarget ? `target ${day.stepsTarget.toLocaleString("en-IN")}` : "tracked source"}
        />
        <Metric label="Calories burned" value={metric(m?.totalCaloriesBurned, " kcal")} sub="tracked source" />
        <Metric label="SpO₂" value={metric(m?.bloodOxygenPercentage, "%", 1)} sub="automatic" />
        <Metric label="Resp. rate" value={metric(m?.respiratoryRateBreathsPerMinute, "/min", 1)} sub="automatic" />
        <Metric
          label="Sleep debt"
          value={m?.sleepDebtMinutes != null ? `${Math.round(m.sleepDebtMinutes)} min` : "—"}
          sub="automatic"
        />
        <Metric label="Skin temp" value={metric(m?.skinTemperatureCelsius, "°C", 1)} sub="automatic" />
      </section>

      <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-black">Today summary</h3>
            <p className="mt-1 text-sm text-white/35">One view of every Health module scheduled for {dateKey}. This refreshes automatically from the latest plan, logs and wearable data.</p>
          </div>
          {progress ? (
            <span className="rounded-xl bg-white/[0.06] px-3 py-2 text-xs font-black text-white/45">
              {completed}/{progress.tasks.length} tasks complete
            </span>
          ) : null}
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {taskGroups.length ? taskGroups.map((group) => {
            const done = group.tasks.filter((task) => task.status === "completed").length;
            const skipped = group.tasks.filter((task) => task.status === "skipped").length;
            const complete = group.tasks.length > 0 && done === group.tasks.length;
            return (
              <div key={group.key} className="rounded-[16px] border border-white/10 bg-black/20 p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="text-xs font-black uppercase tracking-[0.12em] text-white/45">{group.label}</p>
                  <span className={`h-2.5 w-2.5 rounded-full ${complete ? "bg-[#C6FF32]" : done > 0 || skipped > 0 ? "bg-amber-300" : "bg-white/15"}`} />
                </div>
                <p className="mt-2 text-lg font-black text-white/80">{done}/{group.tasks.length}</p>
                <p className="mt-1 text-[11px] text-white/25">{complete ? "Complete" : skipped ? `${skipped} skipped` : done ? "In progress" : "Pending"}</p>
              </div>
            );
          }) : (
            <p className="col-span-full rounded-[16px] border border-dashed border-white/10 p-4 text-sm text-white/35">No Health tasks are scheduled for today yet.</p>
          )}
        </div>
      </section>

      {brief?.changedOvernight.length ? (
        <section className="rounded-[24px] border border-[#C6FF32]/15 bg-[#C6FF32]/[0.025] p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <RefreshCw className="h-5 w-5 text-[#C6FF32]" />
            <div>
              <h3 className="text-xl font-black">Changed automatically</h3>
              <p className="mt-1 text-sm text-white/35">HSAKAA adjusted today from the latest recovery/execution evidence. Safety-sensitive changes are never applied here automatically.</p>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {brief.changedOvernight.map((change) => (
              <div key={change} className="rounded-[16px] border border-white/10 bg-black/20 p-4 text-sm leading-6 text-white/55">{change}</div>
            ))}
          </div>
        </section>
      ) : null}

      {brief?.attention.length ? (
        <section className="rounded-[24px] border border-amber-300/15 bg-amber-300/[0.035] p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <AlertTriangle className="h-5 w-5 text-amber-200" />
            <div>
              <h3 className="text-xl font-black text-amber-50">Attention inbox</h3>
              <p className="mt-1 text-sm text-white/35">Only the highest-priority open items are shown here. Resolve, dismiss and configure reminders in Health → Attention.</p>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {brief.attention.slice(0, 3).map((item) => (
              <article key={item._id} className="rounded-[16px] border border-amber-300/10 bg-black/15 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="rounded-lg bg-amber-200/10 px-2 py-1 text-[10px] font-black uppercase text-amber-100/60">{item.priority.replaceAll("_", " ")}</span>
                  {item.domain ? <span className="text-[10px] font-black uppercase text-white/25">{item.domain}</span> : null}
                </div>
                <p className="mt-2 font-black text-amber-100/85">{item.title}</p>
                <p className="mt-1 text-sm leading-6 text-white/45">{item.message}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {topCards.length ? (
        <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <Sparkles className="h-5 w-5 text-[#C6FF32]" />
            <div>
              <h3 className="text-xl font-black">What HSAKAA notices</h3>
              <p className="mt-1 text-sm text-white/35">Only the strongest current signals are surfaced here; full evidence is in Progress.</p>
            </div>
          </div>
          <div className="mt-5 grid gap-3 lg:grid-cols-2">
            {topCards.map((card) => (
              <article key={card.key} className={`rounded-[18px] border p-4 ${insightClass(card.severity)}`}>
                <p className="text-[11px] font-black uppercase tracking-[0.12em] opacity-60">{card.severity}</p>
                <p className="mt-2 font-black">{card.title}</p>
                <p className="mt-2 text-sm leading-6 opacity-65">{card.message}</p>
              </article>
            ))}
          </div>
        </section>
      ) : null}

      {topGoals.length ? (
        <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <Target className="h-5 w-5 text-[#C6FF32]" />
            <div>
              <h3 className="text-xl font-black">Target status</h3>
              <p className="mt-1 text-sm text-white/35">Your highest-priority active targets, automatically measured where matching evidence exists.</p>
            </div>
          </div>
          <div className="mt-4 grid gap-3 lg:grid-cols-3">
            {topGoals.map((goal) => (
              <article key={goal.id} className="rounded-[18px] border border-white/10 bg-black/20 p-4">
                <div className="flex items-start justify-between gap-3">
                  <p className="font-black text-white/75">{goal.title}</p>
                  <span className="rounded-lg bg-white/[0.06] px-2 py-1 text-[10px] font-black uppercase text-white/40">
                    {goal.status.replaceAll("_", " ")}
                  </span>
                </div>
                <p className="mt-3 text-sm text-white/40">
                  {goal.currentValue == null ? "Current —" : `Current ${goal.currentValue}${goal.unit ? ` ${goal.unit}` : ""}`}
                  {goal.targetValue == null ? "" : ` → ${goal.targetValue}${goal.unit ? ` ${goal.unit}` : ""}`}
                </p>
                {goal.progressPercentage != null ? (
                  <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/[0.06]">
                    <div
                      className="h-full rounded-full bg-[#C6FF32]"
                      style={{ width: `${Math.min(100, Math.max(0, goal.progressPercentage))}%` }}
                    />
                  </div>
                ) : null}
              </article>
            ))}
          </div>
        </section>
      ) : null}

      <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h3 className="text-xl font-black">What you need to do</h3>
            <p className="mt-1 text-sm text-white/35">Every daily Health module in one checklist. Mark completion here instead of opening each module separately.</p>
          </div>
          {progress ? (
            <span className="rounded-xl bg-[#C6FF32]/10 px-3 py-2 text-xs font-black text-[#C6FF32]">
              {completed}/{progress.tasks.length} done · {Math.round(progress.taskCompletionPercentage)}%
            </span>
          ) : null}
        </div>
        <div className="mt-5 space-y-4">
          {progress?.tasks.length ? (
            taskGroups.map((group) => {
              const groupCompleted = group.tasks.filter((task) => task.status === "completed").length;
              return (
                <div key={group.key} className="rounded-[18px] border border-white/10 bg-black/15 p-3 sm:p-4">
                  <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                    <p className="text-xs font-black uppercase tracking-[0.14em] text-white/45">{group.label}</p>
                    <span className="rounded-lg bg-white/[0.05] px-2 py-1 text-[10px] font-black text-white/35">
                      {groupCompleted}/{group.tasks.length} done
                    </span>
                  </div>
                  <div className="space-y-2">
                    {group.tasks.map((task) => (
                      <div
                        key={task.key}
                        className="flex flex-col gap-3 rounded-[14px] border border-white/[0.07] bg-black/20 p-3 md:flex-row md:items-center md:justify-between"
                      >
                        <div>
                          <p className={`font-bold ${task.status === "completed" ? "text-white/35 line-through" : "text-white/80"}`}>
                            {task.label}
                          </p>
                          <div className="mt-1 flex flex-wrap gap-x-3 gap-y-1 text-xs text-white/30">
                            {task.scheduledTime ? <span>{task.scheduledTime}</span> : null}
                            {task.detail ? <span className="max-w-3xl">{task.detail}</span> : null}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            disabled={busy === task.key}
                            onClick={() => changeTask(task.key, task.status === "completed" ? "pending" : "completed")}
                            className={`inline-flex min-h-9 items-center gap-2 rounded-xl px-3 text-xs font-black ${task.status === "completed" ? "bg-[#C6FF32] text-[#030608]" : "bg-white/[0.06] text-white/55"}`}
                          >
                            {busy === task.key ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : task.status === "completed" ? (
                              <CheckCircle2 className="h-4 w-4" />
                            ) : (
                              <Circle className="h-4 w-4" />
                            )}
                            Done
                          </button>
                          <button
                            disabled={busy === task.key}
                            onClick={() => changeTask(task.key, task.status === "skipped" ? "pending" : "skipped")}
                            className={`inline-flex min-h-9 items-center gap-2 rounded-xl px-3 text-xs font-black ${task.status === "skipped" ? "bg-amber-300/20 text-amber-200" : "bg-white/[0.06] text-white/40"}`}
                          >
                            <SkipForward className="h-4 w-4" />
                            Skip
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })
          ) : (
            <p className="rounded-[16px] border border-dashed border-white/10 p-5 text-sm text-white/35">
              Tasks appear as soon as the rolling plan exists.
            </p>
          )}
        </div>
      </section>

      {day ? (
        <section className="grid gap-3 lg:grid-cols-3">
          <PlanCard
            title="Gym"
            headline={`${day.training.title} · ${day.training.durationMinutes} min`}
            body={
              day.training.exercises.length
                ? day.training.exercises.slice(0, 4).map((item) => `${item.name} — ${item.sets} × ${item.reps}`).join("\n")
                : "Recovery / no resistance training"
            }
          />
          <PlanCard
            title="Diet"
            headline={`${day.nutrition.proteinGrams || "—"}g protein · ${day.nutrition.hydrationLitres || "—"}L water`}
            body={day.nutrition.meals.slice(0, 4).map((meal) => `${meal.time} ${meal.label}: ${meal.guidance}`).join("\n")}
          />
          <PlanCard
            title="Recovery"
            headline={`${day.sleep.targetHours}h sleep · ${day.stepsTarget.toLocaleString("en-IN")} steps`}
            body={[...day.sleep.notes, `${day.meditation.durationMinutes} min ${day.meditation.type} meditation`].join("\n")}
          />
        </section>
      ) : null}

      <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5 sm:p-6">
        <h3 className="text-lg font-black">Smoking & alcohol</h3>
        <p className="mt-1 text-sm text-white/35">Only tell HSAKAA when needed. Untracked remains unknown; it is never silently treated as “No”.</p>
        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <Substance
            label="Smoking"
            status={smokingStatus}
            onStatus={setSmokingStatus}
            quantity={smokingQuantity}
            onQuantity={setSmokingQuantity}
            type={smokingType}
            onType={setSmokingType}
            placeholder="e.g. cigarettes"
          />
          <Substance
            label="Alcohol"
            status={alcoholStatus}
            onStatus={setAlcoholStatus}
            quantity={alcoholQuantity}
            onQuantity={setAlcoholQuantity}
            type={alcoholType}
            onType={setAlcoholType}
            placeholder="e.g. whisky / beer"
          />
        </div>
        <button
          onClick={saveLifestyle}
          disabled={busy === "lifestyle"}
          className="mt-4 inline-flex min-h-11 items-center gap-2 rounded-[14px] bg-[#C6FF32] px-4 text-sm font-black text-[#030608] disabled:opacity-50"
        >
          {busy === "lifestyle" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save today
        </button>
      </section>
    </div>
  );
}

function Metric({ label, value, sub }: { label: string; value: string; sub: string }) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/[0.025] p-4">
      <p className="text-[11px] font-black uppercase tracking-[0.14em] text-white/25">{label}</p>
      <p className="mt-2 text-xl font-black text-white/85">{value}</p>
      <p className="mt-1 text-[11px] text-white/25">{sub}</p>
    </div>
  );
}

function PlanCard({ title, headline, body }: { title: string; headline: string; body: string }) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.025] p-5">
      <p className="text-xs font-black uppercase tracking-[0.14em] text-[#C6FF32]">{title}</p>
      <p className="mt-2 font-black text-white/80">{headline}</p>
      <p className="mt-3 whitespace-pre-line text-sm leading-6 text-white/40">{body || "—"}</p>
    </div>
  );
}

function Substance({
  label,
  status,
  onStatus,
  quantity,
  onQuantity,
  type,
  onType,
  placeholder,
}: {
  label: string;
  status: HealthSubstanceUseStatus;
  onStatus: (value: HealthSubstanceUseStatus) => void;
  quantity: string;
  onQuantity: (value: string) => void;
  type: string;
  onType: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="rounded-[18px] border border-white/10 bg-black/20 p-4">
      <p className="font-black">{label}</p>
      <div className="mt-3 flex gap-2">
        {(["untracked", "no", "yes"] as const).map((value) => (
          <button
            key={value}
            onClick={() => onStatus(value)}
            className={`rounded-xl px-3 py-2 text-xs font-black ${status === value ? "bg-[#C6FF32] text-[#030608]" : "bg-white/[0.05] text-white/40"}`}
          >
            {value === "untracked" ? "Not logged" : value === "no" ? "No" : "Yes"}
          </button>
        ))}
      </div>
      {status === "yes" ? (
        <div className="mt-3 grid grid-cols-2 gap-2">
          <input
            inputMode="decimal"
            value={quantity}
            onChange={(event) => onQuantity(event.target.value)}
            placeholder="Quantity"
            className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm outline-none"
          />
          <input
            value={type}
            onChange={(event) => onType(event.target.value)}
            placeholder={placeholder}
            className="rounded-xl border border-white/10 bg-white/[0.03] px-3 py-2 text-sm outline-none"
          />
        </div>
      ) : null}
    </div>
  );
}

function IntelligenceStatus({ status }: { status: HealthIntelligence["status"] }) {
  const className =
    status === "attention"
      ? "bg-red-400/10 text-red-200"
      : status === "watch"
        ? "bg-amber-300/10 text-amber-200"
        : "bg-[#C6FF32]/10 text-[#C6FF32]";
  return <span className={`rounded-lg px-2 py-1 text-[10px] font-black uppercase ${className}`}>{status}</span>;
}

function insightClass(severity: HealthIntelligenceSeverity) {
  if (severity === "attention") return "border-red-400/15 bg-red-400/[0.04] text-red-100";
  if (severity === "watch") return "border-amber-300/15 bg-amber-300/[0.04] text-amber-100";
  if (severity === "positive") return "border-[#C6FF32]/15 bg-[#C6FF32]/[0.03] text-white";
  return "border-white/10 bg-black/20 text-white";
}
