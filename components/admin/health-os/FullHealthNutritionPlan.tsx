import type { HealthPlanDay } from "@/types/health-planner";

type Props = {
  nutrition: HealthPlanDay["nutrition"];
  compact?: boolean;
};

function SummaryMetric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[16px] border border-white/10 bg-black/20 p-3.5">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/30">{label}</p>
      <p className="mt-1.5 text-sm font-black text-white/80">{value}</p>
    </div>
  );
}

export function FullHealthNutritionPlan({ nutrition, compact = false }: Props) {
  return (
    <div className="space-y-4">
      {nutrition.focus ? (
        <div className="rounded-[18px] border border-[#C6FF32]/15 bg-[#C6FF32]/[0.025] p-4">
          <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#C6FF32]">Nutrition focus</p>
          <p className="mt-2 text-sm leading-6 text-white/55">{nutrition.focus}</p>
        </div>
      ) : null}

      <div className="grid gap-2 sm:grid-cols-2 xl:grid-cols-5">
        <SummaryMetric label="Calories" value={nutrition.calorieTarget ? `${nutrition.calorieTarget} kcal` : "Flexible"} />
        <SummaryMetric label="Protein" value={nutrition.proteinGrams ? `${nutrition.proteinGrams} g` : "—"} />
        <SummaryMetric label="Carbs" value={nutrition.carbsGrams ? `${nutrition.carbsGrams} g` : "—"} />
        <SummaryMetric label="Fat" value={nutrition.fatGrams ? `${nutrition.fatGrams} g` : "—"} />
        <SummaryMetric label="Water" value={nutrition.hydrationLitres ? `${nutrition.hydrationLitres} L` : "—"} />
      </div>

      <div>
        <p className="text-xs font-black uppercase tracking-[0.14em] text-white/35">Full meal plan</p>
        <div className={`mt-3 grid gap-3 ${compact ? "" : "xl:grid-cols-2"}`}>
          {nutrition.meals.map((meal, index) => (
            <div key={`${meal.time}-${meal.label}-${index}`} className="rounded-[18px] border border-white/10 bg-black/20 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="text-xs font-black uppercase tracking-[0.12em] text-[#C6FF32]">{meal.time} · {meal.label}</p>
                <span className="rounded-lg bg-white/[0.04] px-2 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-white/35">
                  {meal.proteinGrams ? `${meal.proteinGrams}g protein` : "Protein flexible"}
                </span>
              </div>
              {meal.guidance ? <p className="mt-2 text-sm leading-6 text-white/55">{meal.guidance}</p> : null}

              {meal.items?.length ? (
                <div className="mt-3 space-y-2">
                  {meal.items.map((item, itemIndex) => (
                    <div key={`${item.name}-${itemIndex}`} className="rounded-[14px] border border-white/10 bg-white/[0.025] p-3">
                      <div className="flex flex-wrap items-start justify-between gap-2">
                        <div>
                          <p className="text-sm font-black text-white/85">{item.name}</p>
                          <p className="mt-1 text-[10px] font-black uppercase tracking-[0.12em] text-white/25">{item.category.replaceAll("_", " ")}</p>
                        </div>
                        <span className="text-xs font-black text-white/45">{item.quantity} {item.unit}</span>
                      </div>
                      {item.preparation ? <p className="mt-2 text-xs leading-5 text-white/45"><strong className="text-white/60">Preparation:</strong> {item.preparation}</p> : null}
                      {item.reason ? <p className="mt-1 text-xs leading-5 text-white/35"><strong className="text-white/50">Why:</strong> {item.reason}</p> : null}
                      {item.alternatives?.length ? <p className="mt-1 text-xs leading-5 text-white/30"><strong className="text-white/45">Alternatives:</strong> {item.alternatives.join(", ")}</p> : null}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="mt-3 rounded-xl border border-amber-300/15 bg-amber-300/[0.05] px-3 py-2 text-xs leading-5 text-amber-100/80">
                  Exact food items are missing for this meal. Refresh the AI plan if you want item-level quantities and preparation.
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-[18px] border border-white/10 bg-black/20 p-4">
        <p className="text-xs font-black uppercase tracking-[0.14em] text-[#C6FF32]">Creatine, protein + performance nutrition</p>
        {nutrition.performanceNutrition.length ? (
          <div className="mt-3 grid gap-2 lg:grid-cols-2">
            {nutrition.performanceNutrition.map((item, index) => (
              <div key={`${item.category}-${item.item}-${index}`} className="rounded-[14px] border border-white/10 bg-white/[0.025] p-3">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-black text-white/85">{item.item}</p>
                    {item.when ? <p className="mt-1 text-xs font-bold text-white/35">{item.when}</p> : null}
                  </div>
                  <span className={`rounded-lg px-2 py-1 text-[10px] font-black uppercase tracking-[0.08em] ${item.status === "active" ? "bg-[#C6FF32]/10 text-[#C6FF32]" : item.status === "not_needed_today" ? "bg-white/5 text-white/35" : "bg-amber-300/10 text-amber-200"}`}>
                    {item.action.replaceAll("_", " ")} · {item.status.replaceAll("_", " ")}
                  </span>
                </div>
                {item.guidance ? <p className="mt-2 text-xs leading-5 text-white/45">{item.guidance}</p> : null}
                {item.approvalRequired ? <p className="mt-2 text-[10px] font-black uppercase tracking-[0.12em] text-amber-200">Approval required before changing or starting</p> : null}
              </div>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-xs text-amber-200">Creatine/protein decisions are missing for this day. Refresh the AI plan.</p>
        )}
      </div>

      {nutrition.notes.length ? (
        <div className="rounded-[18px] border border-white/10 bg-black/20 p-4">
          <p className="text-xs font-black uppercase tracking-[0.14em] text-white/35">Nutrition notes</p>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-white/50">
            {nutrition.notes.map((note, index) => (
              <li key={`${note}-${index}`} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C6FF32]" />{note}</li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}
