import Link from "next/link";
import {
  Activity,
  Archive,
  Bot,
  Brain,
  CalendarDays,
  Radio,
  Rocket,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  WandSparkles,
} from "lucide-react";

import { AdminPageHeader } from "@/components/admin/AdminPageHeader";

const tools = [
  {
    title: "Presence Strategy",
    description:
      "Long-term positioning, voice, audience and platform roles. HSAKAA uses this automatically when it builds the seven-day plan.",
    href: "/admin/media/presence",
    icon: SlidersHorizontal,
  },
  {
    title: "Content Director",
    description:
      "Advanced editorial workspace for alternative ideas and deeper critique when you dislike a planned item. Not required for normal weekly execution.",
    href: "/admin/media/director",
    icon: WandSparkles,
  },
  {
    title: "Content Memory",
    description:
      "Anti-repetition memory for topics, hooks, examples, structures and phrasing. The seven-day planner consumes this automatically.",
    href: "/admin/media/intelligence",
    icon: Brain,
  },
  {
    title: "Publishing Calendar",
    description:
      "Detailed cross-platform publication schedule. Approved plan items should flow here; open it when you need a calendar-level view.",
    href: "/admin/media/calendar",
    icon: CalendarDays,
  },
  {
    title: "Final Review",
    description:
      "Detailed final-content safety, claims, privacy and platform-fit review. Use it when a Plan item flags a review issue or needs inspection.",
    href: "/admin/media/review",
    icon: ShieldCheck,
  },
  {
    title: "Learning Engine",
    description:
      "Underlying performance-learning records. Day-to-day interpretation belongs in Performance; this page is for deeper inspection.",
    href: "/admin/media/learning",
    icon: Sparkles,
  },
  {
    title: "Autopilot",
    description:
      "Operational recommendations and backlog detection. Important actions should surface on Today; use this page to inspect the engine itself.",
    href: "/admin/media/autopilot",
    icon: Bot,
  },
  {
    title: "Buffer",
    description:
      "Publishing-provider diagnostics and insights. Buffer is infrastructure rather than a normal daily workspace.",
    href: "/admin/media/buffer",
    icon: Radio,
  },
  {
    title: "Operations",
    description:
      "Connection health, delivery failures, queue state and platform capabilities. Use when something is not syncing or publishing correctly.",
    href: "/admin/media/operations",
    icon: Activity,
  },
  {
    title: "Release Audit",
    description:
      "End-to-end production-readiness checks across the Media pipeline. Use before major releases or after infrastructure changes.",
    href: "/admin/media/release",
    icon: Rocket,
  },
  {
    title: "Media Core",
    description:
      "Canonical account/content/publication records and low-level administration. Normally HSAKAA manages these records for you.",
    href: "/admin/media/core",
    icon: Radio,
  },
  {
    title: "Media Archive",
    description:
      "Historical Media records and legacy editing. Kept for traceability without occupying the main operating navigation.",
    href: "/admin/media/archive",
    icon: Archive,
  },
];

export default function MediaSystemPage() {
  return (
    <div className="space-y-8">
      <AdminPageHeader
        eyebrow="Media · Advanced"
        title="System & advanced tools"
        description="These engines support Today and the 7-Day Plan automatically. Open them when you need deeper control, diagnostics or investigation—not as mandatory steps for every post."
        actions={
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/media/today"
              className="rounded-xl bg-[#C6FF32] px-4 py-2 text-sm font-black text-black"
            >
              Back to Today
            </Link>
            <Link
              href="/admin/media/plan"
              className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white/65"
            >
              7-Day Plan
            </Link>
          </div>
        }
      />

      <section className="rounded-2xl border border-[#C6FF32]/20 bg-[#C6FF32]/[0.035] p-5 text-sm leading-6 text-white/55">
        <strong className="text-white">Normal workflow:</strong> Today → 7-Day Plan → create the real asset when required → approve/review → publish → Engagement → Performance. Presence, Director, Content Memory, Calendar, Review, Learning and Autopilot remain active underneath that workflow.
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.href}
              href={tool.href}
              className="group rounded-2xl border border-white/10 bg-white/[0.02] p-5 transition hover:border-[#C6FF32]/30 hover:bg-[#C6FF32]/[0.025]"
            >
              <Icon className="h-5 w-5 text-[#C6FF32]" />
              <h2 className="mt-4 font-black text-white">{tool.title}</h2>
              <p className="mt-2 text-sm leading-6 text-white/45">{tool.description}</p>
              <div className="mt-4 text-xs font-black uppercase tracking-[0.12em] text-[#C6FF32]/70 group-hover:text-[#C6FF32]">
                Open tool →
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
