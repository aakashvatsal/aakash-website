import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CareRoutineManager } from "@/components/admin/health-os/CareRoutineManager";
import { HealthOsNav } from "@/components/admin/health-os/HealthOsNav";
import { getCareDailyLog, getCareProducts } from "@/lib/api/health-extended";

export const dynamic = "force-dynamic";

function todayInIndia() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

const categories = ["gentle_wash", "antifungal_cream", "antifungal_powder", "moisturizer", "barrier_cream", "anti_chafing", "deodorant", "wipes", "menstrual_product", "lubricant", "prescribed_medication", "other"].map((value) => ({ value, label: value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()) }));
const frequencies = ["daily", "twice_daily", "alternate_days", "weekly", "custom", "as_needed"].map((value) => ({ value, label: value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()) }));
const times = ["morning", "after_bath", "after_workout", "evening", "night", "as_needed"].map((value) => ({ value, label: value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()) }));

export default async function IntimateCarePage() {
  const today = todayInIndia();
  try {
    const [products, log] = await Promise.all([getCareProducts("intimate-care"), getCareDailyLog("intimate-care", today)]);
    return <main className="space-y-8"><AdminPageHeader eyebrow="Health OS" title="Intimate Care" description="Private routine tracking for hygiene, treatment and adherence." /><HealthOsNav /><CareRoutineManager module="intimate-care" title="Intimate care" description="Keep the routine consistent while retaining this as a private Personal OS surface." today={today} initialProducts={products} initialDailyLog={log} categories={categories} frequencies={frequencies} timesOfDay={times} allowDelete={false} /></main>;
  } catch (error) {
    return <main className="space-y-8"><AdminPageHeader eyebrow="Health OS" title="Intimate Care" description="Private care routine and adherence." /><HealthOsNav /><div className="rounded-[24px] border border-red-400/20 bg-red-400/10 p-6 text-sm text-red-200">{error instanceof Error ? error.message : "Unable to load Intimate Care OS."}</div></main>;
  }
}
