import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CareRoutineManager } from "@/components/admin/health-os/CareRoutineManager";
import { HealthOsNav } from "@/components/admin/health-os/HealthOsNav";
import { getCareDailyLog, getCareProducts } from "@/lib/api/health-extended";

export const dynamic = "force-dynamic";

function todayInIndia() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

const categories = ["shampoo", "anti_dandruff_shampoo", "conditioner", "hair_mask", "hair_oil", "hair_serum", "scalp_serum", "minoxidil", "leave_in_conditioner", "heat_protectant", "styling_product", "medicated_treatment", "other"].map((value) => ({ value, label: value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()) }));
const frequencies = ["daily", "twice_daily", "alternate_days", "weekly", "twice_weekly", "three_times_weekly", "custom", "as_needed"].map((value) => ({ value, label: value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()) }));
const times = ["morning", "afternoon", "evening", "night", "before_wash", "after_wash", "as_needed"].map((value) => ({ value, label: value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()) }));

export default async function HaircarePage() {
  const today = todayInIndia();
  try {
    const [products, log] = await Promise.all([getCareProducts("haircare"), getCareDailyLog("haircare", today)]);
    return <main className="space-y-8"><AdminPageHeader eyebrow="Health OS" title="Haircare" description="Track the hair/scalp routine, treatment cadence and daily adherence." /><HealthOsNav /><CareRoutineManager module="haircare" title="Haircare" description="Keep wash, treatment, minoxidil and styling routines visible and consistent." today={today} initialProducts={products} initialDailyLog={log} categories={categories} frequencies={frequencies} timesOfDay={times} /></main>;
  } catch (error) {
    return <main className="space-y-8"><AdminPageHeader eyebrow="Health OS" title="Haircare" description="Haircare routine and adherence." /><HealthOsNav /><div className="rounded-[24px] border border-red-400/20 bg-red-400/10 p-6 text-sm text-red-200">{error instanceof Error ? error.message : "Unable to load Haircare OS."}</div></main>;
  }
}
