"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  Compass,
  Rocket,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

import { bootstrapMediaLaunch, updateMediaLaunchProfile } from "@/lib/api/media";
import type { MediaLaunchOverview, MediaPlatform } from "@/types/media";

const platformLabels: Partial<Record<MediaPlatform, string>> = {
  linkedin: "LinkedIn",
  instagram: "Instagram",
  youtube: "YouTube",
  x: "X",
  whatsapp: "WhatsApp",
};

export function MediaLaunchManager({ initialOverview }: { initialOverview: MediaLaunchOverview }) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [notes, setNotes] = useState("");
  const [message, setMessage] = useState<string>();
  const [error, setError] = useState<string>();
  const state = initialOverview.state;

  function bootstrap(force = true) {
    setMessage(undefined);
    setError(undefined);
    startTransition(async () => {
      try {
        await bootstrapMediaLaunch({ force, notes });
        setMessage("Day-1 launch calibration and the first seven-day Presence plan are ready.");
        router.refresh();
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "HSAKAA could not bootstrap Media launch.");
      }
    });
  }

  function mark(platform: MediaPlatform, applied: boolean) {
    setMessage(undefined);
    setError(undefined);
    startTransition(async () => {
      try {
        await updateMediaLaunchProfile(platform, applied);
        setMessage(`${platformLabels[platform] ?? platform} profile setup marked ${applied ? "applied" : "not applied"}.`);
        router.refresh();
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Profile setup could not be updated.");
      }
    });
  }

  return (
    <div className="space-y-6">
      {message ? <div className="rounded-2xl border border-[#C6FF32]/20 bg-[#C6FF32]/5 p-4 text-sm text-[#C6FF32]">{message}</div> : null}
      {error ? <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">{error}</div> : null}

      <section className="rounded-[28px] border border-[#C6FF32]/20 bg-[#C6FF32]/[0.035] p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-end xl:justify-between">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-[#C6FF32]"><Rocket className="h-4 w-4" /> Day {initialOverview.dayNumber} · {initialOverview.phase.replaceAll("_", " ")}</div>
            <h2 className="mt-3 text-2xl font-black tracking-[-0.04em] text-white">Explore before you optimise</h2>
            <p className="mt-2 text-sm leading-6 text-white/50">The first 30 days intentionally test formats, narratives and platform-native styles. HSAKAA must collect enough comparable evidence before calling anything a winner, and it may never trade Aakash&apos;s actual voice for reach.</p>
          </div>
          <button disabled={isPending} onClick={() => bootstrap(true)} className="rounded-xl bg-[#C6FF32] px-4 py-2.5 text-sm font-black text-black disabled:opacity-40"><Sparkles className="mr-2 inline h-4 w-4" />{isPending ? "Building…" : state ? "Refresh launch + first week" : "Start Day 1 + build first week"}</button>
        </div>
        <textarea value={notes} onChange={(event) => setNotes(event.target.value)} placeholder="Optional launch constraint — e.g. I can record only on weekends, keep the first week lighter, focus more on building than company promotion." className="mt-5 min-h-24 w-full rounded-2xl border border-white/10 bg-black/25 px-4 py-3 text-sm text-white outline-none placeholder:text-white/25" />
      </section>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <Stat label="Profiles planned" value={`${initialOverview.readiness.profilesApplied}/${initialOverview.readiness.totalProfiles}`} icon={<Compass className="h-4 w-4" />} />
        <Stat label="Publishing-ready platforms" value={`${initialOverview.readiness.publishingReadyPlatforms}/5`} icon={<CheckCircle2 className="h-4 w-4" />} />
        <Stat label="Experiment share" value={`${state?.experimentPolicy.experimentSharePercent ?? 35}%`} icon={<Sparkles className="h-4 w-4" />} />
        <Stat label="Samples before conclusion" value={String(state?.experimentPolicy.minimumSamplesBeforeConclusion ?? initialOverview.policy.minimumEvidenceBeforeConclusion)} icon={<ShieldCheck className="h-4 w-4" />} />
      </div>

      {initialOverview.blockers.length ? <section className="rounded-2xl border border-amber-400/20 bg-amber-400/[0.04] p-5"><div className="flex items-center gap-2 font-black text-amber-100"><AlertTriangle className="h-4 w-4" />Publishing blockers</div><p className="mt-2 text-xs leading-5 text-amber-100/55">These do not block strategy or planning. They only block reliable delivery on the affected channel.</p><ul className="mt-3 space-y-2 text-xs leading-5 text-amber-100/70">{initialOverview.blockers.map((item) => <li key={item}>• {item}</li>)}</ul></section> : null}

      {state?.profilePlans.length ? <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"><h2 className="font-black text-white">Platform launch profiles</h2><p className="mt-1 text-xs text-white/35">One umbrella identity, platform-native expression. Apply these once on the real profiles; Products/Media data is not required first.</p><div className="mt-5 grid gap-4 xl:grid-cols-2">{state.profilePlans.map((item) => <article key={item.platform} className="rounded-xl border border-white/10 bg-black/20 p-4"><div className="flex items-start justify-between gap-3"><div><p className="font-black text-white">{platformLabels[item.platform] ?? item.platform}</p><p className="mt-1 text-xs leading-5 text-white/45">{item.objective}</p></div><button disabled={isPending} onClick={() => mark(item.platform, !item.applied)} className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase ${item.applied ? "border-[#C6FF32]/20 bg-[#C6FF32]/10 text-[#C6FF32]" : "border-white/10 text-white/40"}`}>{item.applied ? "Applied" : "Mark applied"}</button></div>{item.headline ? <Field label="Headline / name line" value={item.headline} /> : null}<Field label="Bio" value={item.bio} /><Field label="Link strategy" value={item.linkStrategy} /><Field label="Profile image" value={item.profileImageGuidance} />{item.bannerGuidance ? <Field label="Banner / channel art" value={item.bannerGuidance} /> : null}{item.pinnedOrFeatured.length ? <List label="Pin / feature" values={item.pinnedOrFeatured} /> : null}<List label="Setup checklist" values={item.setupChecklist} /></article>)}</div></section> : <section className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-white/35">Start Day 1 to generate the five platform profile briefs and the first strategic week.</section>}

      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5"><h2 className="font-black text-white">Calibration rules</h2><div className="mt-4 grid gap-3 md:grid-cols-2"><Rule text="Days 1–30 favour exploration and format/narrative diversity."/><Rule text="A small early winner cannot rewrite Aakash&apos;s permanent positioning."/><Rule text="Days 31–90 lean into repeated evidence while keeping experiments alive."/><Rule text="90+ compounds proven mechanisms with a smaller experiment budget."/></div></section>
    </div>
  );
}

function Stat({ label, value, icon }: { label: string; value: string; icon: React.ReactNode }) { return <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5"><div className="text-[#C6FF32]">{icon}</div><div className="mt-3 text-2xl font-black text-white">{value}</div><div className="text-xs text-white/40">{label}</div></div>; }
function Field({ label, value }: { label: string; value: string }) { return <div className="mt-4"><div className="text-[10px] font-black uppercase tracking-[0.12em] text-white/25">{label}</div><div className="mt-1 whitespace-pre-wrap text-xs leading-5 text-white/60">{value || "—"}</div></div>; }
function List({ label, values }: { label: string; values: string[] }) { return <div className="mt-4"><div className="text-[10px] font-black uppercase tracking-[0.12em] text-white/25">{label}</div><ul className="mt-2 space-y-1 text-xs leading-5 text-white/50">{values.map((item) => <li key={item}>• {item}</li>)}</ul></div>; }
function Rule({ text }: { text: string }) { return <div className="rounded-xl border border-white/5 bg-black/20 p-3 text-xs leading-5 text-white/45"><ShieldCheck className="mr-1.5 inline h-3.5 w-3.5 text-[#C6FF32]"/>{text}</div>; }
