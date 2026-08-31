import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { CareRoutineManager } from "@/components/admin/health-os/CareRoutineManager";
import { HealthOsNav } from "@/components/admin/health-os/HealthOsNav";
import { getCareDailyLog, getCareProducts } from "@/lib/api/health-extended";

export const dynamic = "force-dynamic";

function todayInIndia() {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Kolkata", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
}

const categories = ["cleanser", "toner", "serum", "moisturizer", "sunscreen", "exfoliant", "retinoid", "face_mask", "eye_cream", "spot_treatment", "lip_care", "body_wash", "body_lotion", "body_exfoliant", "antifungal", "deodorant", "powder", "other"].map((value) => ({ value, label: value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()) }));
const frequencies = ["daily", "twice_daily", "alternate_days", "weekly", "twice_weekly", "custom", "as_needed"].map((value) => ({ value, label: value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()) }));
const times = ["morning", "afternoon", "evening", "night", "as_needed"].map((value) => ({ value, label: value.replaceAll("_", " ").replace(/\b\w/g, (c) => c.toUpperCase()) }));

export default async function SkincarePage() {
  const today = todayInIndia();
  try {
    const [products, log] = await Promise.all([getCareProducts("skincare"), getCareDailyLog("skincare", today)]);
    return <main className="space-y-8"><AdminPageHeader eyebrow="Health OS" title="Skincare" description="Run the routine, track adherence and keep products/reminders current." /><HealthOsNav /><CareRoutineManager module="skincare" title="Skincare" description="Apply the right products at the right time without carrying the routine in your head." today={today} initialProducts={products} initialDailyLog={log} categories={categories} frequencies={frequencies} timesOfDay={times} /></main>;
  } catch (error) {
    return <main className="space-y-8"><AdminPageHeader eyebrow="Health OS" title="Skincare" description="Skincare routine and adherence." /><HealthOsNav /><div className="rounded-[24px] border border-red-400/20 bg-red-400/10 p-6 text-sm text-red-200">{error instanceof Error ? error.message : "Unable to load Skincare OS."}</div></main>;
  }
}
