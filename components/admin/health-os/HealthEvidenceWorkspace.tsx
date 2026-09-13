/* eslint-disable @next/next/no-img-element */
"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Camera,
  CheckCircle2,
  FileHeart,
  Gauge,
  Loader2,
  RefreshCw,
  Save,
  ShieldCheck,
  Upload,
} from "lucide-react";

import {
  getHealthEvidence,
  getHealthEvidenceSettings,
  getHealthPhotoContentUrl,
  getHealthSourceReportContentUrl,
  markHealthBaselineReviewed,
  updateHealthEvidenceSettings,
  uploadHealthPhoto,
  uploadHealthSourceReport,
} from "@/lib/api/health-planner";
import type {
  HealthAutonomyMode,
  HealthEvidenceOverview,
  HealthEvidenceSettings,
  HealthPhotoCategory,
} from "@/types/health-planner";

const cardClass = "rounded-[24px] border border-white/10 bg-white/[0.025] p-5 sm:p-6";
const inputClass =
  "min-h-11 w-full rounded-[14px] border border-white/10 bg-[#080b0d] px-3.5 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#C6FF32]/45";

const autonomyLabels: Array<{ key: string; label: string; note: string }> = [
  { key: "training", label: "Training", note: "Exercise selection, normal volume and progression." },
  { key: "cardio", label: "Cardio", note: "Zone 2, conditioning and recovery cardio." },
  { key: "steps", label: "Steps", note: "Daily movement targets." },
  { key: "mealStructure", label: "Meal structure", note: "Meals/macros inside your established constraints." },
  { key: "meditation", label: "Meditation", note: "Type, timing and duration." },
  { key: "routineTiming", label: "Routine timing", note: "Scheduling of ordinary Health tasks." },
  { key: "skincareRoutine", label: "Skincare routine", note: "Routine structure; products remain evidence-bound." },
  { key: "haircareRoutine", label: "Haircare routine", note: "Routine structure and wash/treatment scheduling." },
  { key: "intimateCareRoutine", label: "Intimate care", note: "Private routine scheduling; no intimate photo analysis." },
  { key: "supplements", label: "Supplements", note: "Dose/timing changes always require approval." },
  { key: "medication", label: "Medication", note: "Never autonomous." },
  { key: "professionalInstructions", label: "Professional instructions", note: "Locked; clinician/dietitian/physio/trainer instructions win." },
];

const sourceLabels: Record<string, string> = {
  professional_instruction: "Professional instruction",
  owner_update: "Your explicit update",
  connected_objective_data: "Connected objective data",
  structured_health_log: "Structured Health log",
  task_completion: "Task completion",
  ai_inference: "AI inference",
};

const photoAngles: Record<HealthPhotoCategory, string[]> = {
  body: ["front", "side_left", "side_right", "back"],
  skin: ["front", "left", "right", "close_up"],
  hair: ["front_hairline", "left_temple", "right_temple", "top", "crown"],
};

function pretty(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (char) => char.toUpperCase());
}

function dateText(value?: string | null) {
  if (!value) return "Never";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleDateString("en-IN");
}

export function HealthEvidenceWorkspace() {
  const [evidence, setEvidence] = useState<HealthEvidenceOverview | null>(null);
  const [settings, setSettings] = useState<HealthEvidenceSettings | null>(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [photo, setPhoto] = useState({ category: "body" as HealthPhotoCategory, angle: "front", takenAt: "", file: null as File | null });
  const [report, setReport] = useState({ label: "", reportDate: "", file: null as File | null });

  const load = useCallback(async () => {
    const [nextEvidence, nextSettings] = await Promise.all([
      getHealthEvidence(),
      getHealthEvidenceSettings(),
    ]);
    setEvidence(nextEvidence);
    setSettings(nextSettings);
  }, []);

  useEffect(() => {
    load().catch((value) => setError(value instanceof Error ? value.message : "Unable to load Health evidence."));
  }, [load]);

  const weakSignals = useMemo(
    () => evidence?.quality.filter((item) => item.status === "limited" || item.status === "missing") ?? [],
    [evidence],
  );

  async function saveSettings() {
    if (!settings) return;
    setBusy("settings");
    setError("");
    setSuccess("");
    try {
      const saved = await updateHealthEvidenceSettings({
        autonomy: settings.autonomy,
        baselineRefreshDays: settings.baselineRefreshDays,
        bodyPhotoRefreshDays: settings.bodyPhotoRefreshDays,
        skinPhotoRefreshDays: settings.skinPhotoRefreshDays,
        hairPhotoRefreshDays: settings.hairPhotoRefreshDays,
        reportFreshnessDays: settings.reportFreshnessDays,
      });
      setSettings(saved);
      await load();
      setSuccess("Health evidence and autonomy settings saved.");
    } catch (value) {
      setError(value instanceof Error ? value.message : "Unable to save Health evidence settings.");
    } finally {
      setBusy("");
    }
  }

  async function confirmBaseline() {
    setBusy("baseline");
    setError("");
    setSuccess("");
    try {
      const result = await markHealthBaselineReviewed();
      if (!result.reviewed) {
        setError("No active baseline exists yet. Complete Health → AI Plan → Baseline first.");
        return;
      }
      await load();
      setSuccess("Baseline marked reviewed without changing its content.");
    } catch (value) {
      setError(value instanceof Error ? value.message : "Unable to review baseline.");
    } finally {
      setBusy("");
    }
  }

  async function uploadCheckpoint() {
    if (!photo.file) return;
    setBusy("photo");
    setError("");
    setSuccess("");
    try {
      await uploadHealthPhoto({
        file: photo.file,
        category: photo.category,
        angle: photo.angle,
        takenAt: photo.takenAt ? `${photo.takenAt}T12:00:00+05:30` : undefined,
      });
      setPhoto((current) => ({ ...current, file: null }));
      await load();
      setSuccess("Private checkpoint uploaded. Same-angle comparison is available when a previous checkpoint exists.");
    } catch (value) {
      setError(value instanceof Error ? value.message : "Unable to upload checkpoint.");
    } finally {
      setBusy("");
    }
  }

  async function uploadReport() {
    if (!report.file) return;
    setBusy("report");
    setError("");
    setSuccess("");
    try {
      await uploadHealthSourceReport({
        file: report.file,
        label: report.label,
        reportDate: report.reportDate || undefined,
      });
      setReport({ label: "", reportDate: "", file: null });
      await load();
      setSuccess("Private report uploaded and structured evidence extracted when AI analysis is available.");
    } catch (value) {
      setError(value instanceof Error ? value.message : "Unable to upload Health report.");
    } finally {
      setBusy("");
    }
  }

  if (!evidence || !settings) {
    return (
      <div className={`${cardClass} flex min-h-56 items-center justify-center gap-3 text-white/45`}>
        <Loader2 className="h-5 w-5 animate-spin" /> Loading Health evidence…
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {error ? <Notice tone="error">{error}</Notice> : null}
      {success ? <Notice tone="success">{success}</Notice> : null}

      <section className="rounded-[26px] border border-[#C6FF32]/20 bg-[#C6FF32]/[0.035] p-5 sm:p-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div className="max-w-3xl">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#C6FF32]">Evidence quality</p>
            <h2 className="mt-2 text-2xl font-black">{evidence.overallScore}% Health data quality</h2>
            <p className="mt-2 text-sm leading-6 text-white/45">
              HSAKAA prefers measured evidence over inference and only asks you for data that is missing or stale enough to materially improve planning.
            </p>
          </div>
          <div className="grid min-w-[260px] grid-cols-2 gap-3">
            <Score label="Weak signals" value={weakSignals.length} />
            <Score label="Baseline age" value={evidence.baseline.ageDays == null ? "—" : `${evidence.baseline.ageDays}d`} />
          </div>
        </div>
      </section>

      <section className={cardClass}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2"><Gauge className="h-5 w-5 text-[#C6FF32]" /><h3 className="text-xl font-black">Data completeness</h3></div>
            <p className="mt-1 text-sm text-white/35">Freshness and tracking coverage by evidence domain.</p>
          </div>
          <button type="button" onClick={() => load()} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-white/[0.06] px-3 text-xs font-black text-white/50"><RefreshCw className="h-4 w-4" /> Refresh</button>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          {evidence.quality.map((item) => (
            <article key={item.key} className="rounded-[18px] border border-white/10 bg-black/20 p-4">
              <div className="flex items-start justify-between gap-3">
                <div><p className="font-black text-white/75">{item.label}</p><p className="mt-1 text-xs text-white/25">{dateText(item.lastObservedAt)}</p></div>
                <QualityStatus status={item.status} score={item.score} />
              </div>
              <p className="mt-3 text-xs leading-5 text-white/35">{item.detail}</p>
            </article>
          ))}
        </div>
      </section>

      <section className={cardClass}>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex items-center gap-2"><CheckCircle2 className="h-5 w-5 text-[#C6FF32]" /><h3 className="text-xl font-black">Baseline freshness</h3></div>
            <p className="mt-1 text-sm text-white/35">Refresh the baseline only when your real state changes; you do not need to repeat onboarding every month.</p>
            <div className="mt-3 flex flex-wrap gap-2 text-xs font-bold">
              <span className="rounded-xl bg-white/[0.05] px-3 py-2 text-white/50">Last reviewed {dateText(evidence.baseline.lastReviewedAt)}</span>
              <span className="rounded-xl bg-white/[0.05] px-3 py-2 text-white/50">Refresh interval {evidence.baseline.refreshAfterDays} days</span>
              <span className={`rounded-xl px-3 py-2 ${evidence.baseline.refreshRecommended ? "bg-amber-300/10 text-amber-200" : "bg-[#C6FF32]/10 text-[#C6FF32]"}`}>{evidence.baseline.refreshRecommended ? "Review recommended" : "Current"}</span>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Link href="/admin/health/plan" className="inline-flex min-h-10 items-center rounded-xl border border-white/10 px-3 text-xs font-black text-white/50">Edit baseline</Link>
            <button type="button" disabled={busy === "baseline" || !evidence.baseline.exists} onClick={confirmBaseline} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#C6FF32] px-3 text-xs font-black text-[#030608] disabled:opacity-40">{busy === "baseline" ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />} Still accurate</button>
          </div>
        </div>
      </section>

      <section className={cardClass}>
        <div className="flex items-center gap-2"><ShieldCheck className="h-5 w-5 text-[#C6FF32]" /><h3 className="text-xl font-black">Evidence precedence</h3></div>
        <p className="mt-1 text-sm text-white/35">When two sources disagree, this hierarchy is applied automatically and cannot be reordered from the UI.</p>
        <div className="mt-5 grid gap-2 lg:grid-cols-6">
          {evidence.sourcePriority.map((source, index) => (
            <div key={source} className="rounded-[16px] border border-white/10 bg-black/20 p-4">
              <p className="text-xs font-black text-[#C6FF32]">#{index + 1}</p>
              <p className="mt-1 text-sm font-black text-white/65">{sourceLabels[source] ?? pretty(source)}</p>
            </div>
          ))}
        </div>
      </section>

      <section className={cardClass}>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="text-xl font-black">Autonomy controls</h3>
            <p className="mt-1 text-sm text-white/35">Choose how much HSAKAA may adapt. Medication and professional instructions remain hard safety boundaries.</p>
          </div>
          <button type="button" disabled={busy === "settings"} onClick={saveSettings} className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#C6FF32] px-3 text-xs font-black text-[#030608] disabled:opacity-40">{busy === "settings" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save controls</button>
        </div>
        <div className="mt-5 grid gap-3 lg:grid-cols-2 xl:grid-cols-3">
          {autonomyLabels.map((item) => {
            const value = settings.autonomy[item.key] ?? "approval";
            const hardLocked = item.key === "medication" || item.key === "professionalInstructions";
            const supplement = item.key === "supplements";
            return (
              <label key={item.key} className="rounded-[18px] border border-white/10 bg-black/20 p-4">
                <span className="font-black text-white/75">{item.label}</span>
                <span className="mt-1 block min-h-10 text-xs leading-5 text-white/30">{item.note}</span>
                <select
                  value={value}
                  disabled={hardLocked}
                  onChange={(event) => setSettings((current) => current ? { ...current, autonomy: { ...current.autonomy, [item.key]: event.target.value as HealthAutonomyMode } } : current)}
                  className={`${inputClass} mt-3 disabled:cursor-not-allowed disabled:opacity-45`}
                >
                  {!supplement && !hardLocked ? <option value="autonomous">Autonomous</option> : null}
                  {!hardLocked ? <option value="approval">Approval required</option> : null}
                  {item.key !== "professionalInstructions" ? <option value="never">Never autonomous</option> : null}
                  {item.key === "professionalInstructions" ? <option value="locked">Locked</option> : null}
                </select>
              </label>
            );
          })}
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          <RefreshField label="Baseline review" value={settings.baselineRefreshDays} min={14} max={365} onChange={(value) => setSettings({ ...settings, baselineRefreshDays: value })} />
          <RefreshField label="Body photos" value={settings.bodyPhotoRefreshDays} min={7} max={365} onChange={(value) => setSettings({ ...settings, bodyPhotoRefreshDays: value })} />
          <RefreshField label="Skin photos" value={settings.skinPhotoRefreshDays} min={7} max={365} onChange={(value) => setSettings({ ...settings, skinPhotoRefreshDays: value })} />
          <RefreshField label="Hair photos" value={settings.hairPhotoRefreshDays} min={7} max={365} onChange={(value) => setSettings({ ...settings, hairPhotoRefreshDays: value })} />
          <RefreshField label="Reports" value={settings.reportFreshnessDays} min={30} max={730} onChange={(value) => setSettings({ ...settings, reportFreshnessDays: value })} />
        </div>
      </section>

      <section className={cardClass}>
        <div className="flex items-center gap-2"><Camera className="h-5 w-5 text-[#C6FF32]" /><h3 className="text-xl font-black">Photo progress</h3></div>
        <p className="mt-1 text-sm text-white/35">Same-angle body, skin and hair checkpoints are compared conservatively. Lighting, distance, pose and grooming differences reduce confidence.</p>
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          <select className={inputClass} value={photo.category} onChange={(event) => { const category = event.target.value as HealthPhotoCategory; setPhoto((current) => ({ ...current, category, angle: photoAngles[category][0] })); }}><option value="body">Body</option><option value="skin">Skin</option><option value="hair">Hair</option></select>
          <select className={inputClass} value={photo.angle} onChange={(event) => setPhoto((current) => ({ ...current, angle: event.target.value }))}>{photoAngles[photo.category].map((angle) => <option key={angle} value={angle}>{pretty(angle)}</option>)}</select>
          <input type="date" className={inputClass} value={photo.takenAt} onChange={(event) => setPhoto((current) => ({ ...current, takenAt: event.target.value }))} />
          <input type="file" accept="image/jpeg,image/png,image/webp" className={`${inputClass} lg:col-span-2 file:mr-3 file:rounded-lg file:border-0 file:bg-[#C6FF32] file:px-3 file:py-1.5 file:text-xs file:font-black file:text-[#030608]`} onChange={(event) => setPhoto((current) => ({ ...current, file: event.target.files?.[0] ?? null }))} />
        </div>
        <button type="button" disabled={busy === "photo" || !photo.file} onClick={uploadCheckpoint} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#C6FF32] px-3 text-xs font-black text-[#030608] disabled:opacity-40">{busy === "photo" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload checkpoint</button>

        <div className="mt-6 space-y-4">
          {evidence.photoComparisons.length ? evidence.photoComparisons.map((item) => (
            <article key={item.key} className="rounded-[20px] border border-white/10 bg-black/20 p-4 sm:p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div><p className="text-xs font-black uppercase tracking-[0.14em] text-[#C6FF32]">{item.category} · {pretty(item.angle)}</p><p className="mt-1 text-sm font-black text-white/70">{item.comparison?.changeSummary || "Latest checkpoint"}</p></div>
                {item.comparison?.confidence ? <span className="rounded-lg bg-white/[0.06] px-2 py-1 text-[10px] font-black uppercase text-white/40">{item.comparison.confidence} confidence</span> : null}
              </div>
              <div className="mt-4 grid gap-3 lg:grid-cols-2">
                {item.previous ? <PhotoPanel title={`Previous · ${dateText(item.previous.takenAt)}`} id={item.previous.id} summary={item.previous.summary} /> : <div className="grid min-h-64 place-items-center rounded-[18px] border border-dashed border-white/10 text-sm text-white/30">No previous same-angle checkpoint</div>}
                <PhotoPanel title={`Latest · ${dateText(item.latest.takenAt)}`} id={item.latest.id} summary={item.latest.summary} />
              </div>
              {item.comparison?.visibleChanges?.length ? <ListBlock title="Visible changes" items={item.comparison.visibleChanges} /> : null}
              {item.comparison?.consistencyNotes?.length ? <ListBlock title="Comparison limitations" items={item.comparison.consistencyNotes} muted /> : null}
            </article>
          )) : <div className="rounded-[18px] border border-dashed border-white/10 p-6 text-sm text-white/35">No private progress photos yet.</div>}
        </div>
      </section>

      <section className={cardClass}>
        <div className="flex items-center gap-2"><FileHeart className="h-5 w-5 text-[#C6FF32]" /><h3 className="text-xl font-black">Report comparison</h3></div>
        <p className="mt-1 text-sm text-white/35">Uploaded reports are evidence, not diagnoses. HSAKAA extracts documented measurements and compares the latest report with the prior report when matching markers exist.</p>
        <div className="mt-5 grid gap-3 lg:grid-cols-4">
          <input className={inputClass} placeholder="Report label (optional)" value={report.label} onChange={(event) => setReport((current) => ({ ...current, label: event.target.value }))} />
          <input type="date" className={inputClass} value={report.reportDate} onChange={(event) => setReport((current) => ({ ...current, reportDate: event.target.value }))} />
          <input type="file" accept="application/pdf,image/jpeg,image/png,image/webp" className={`${inputClass} lg:col-span-2 file:mr-3 file:rounded-lg file:border-0 file:bg-[#C6FF32] file:px-3 file:py-1.5 file:text-xs file:font-black file:text-[#030608]`} onChange={(event) => setReport((current) => ({ ...current, file: event.target.files?.[0] ?? null }))} />
        </div>
        <button type="button" disabled={busy === "report" || !report.file} onClick={uploadReport} className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#C6FF32] px-3 text-xs font-black text-[#030608] disabled:opacity-40">{busy === "report" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />} Upload report</button>

        {evidence.reportComparison.latest ? (
          <div className="mt-6">
            <div className="flex flex-wrap gap-2 text-xs font-bold">
              <a href={getHealthSourceReportContentUrl(evidence.reportComparison.latest.id)} target="_blank" rel="noreferrer" className="rounded-xl bg-[#C6FF32]/10 px-3 py-2 text-[#C6FF32]">Latest · {evidence.reportComparison.latest.label} · {dateText(evidence.reportComparison.latest.reportDate)}</a>
              {evidence.reportComparison.previous ? <a href={getHealthSourceReportContentUrl(evidence.reportComparison.previous.id)} target="_blank" rel="noreferrer" className="rounded-xl bg-white/[0.05] px-3 py-2 text-white/45">Previous · {evidence.reportComparison.previous.label} · {dateText(evidence.reportComparison.previous.reportDate)}</a> : null}
            </div>
            <div className="mt-4 overflow-x-auto rounded-[18px] border border-white/10">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-white/[0.035] text-[11px] font-black uppercase tracking-[0.12em] text-white/30"><tr><th className="px-4 py-3">Marker</th><th className="px-4 py-3">Previous</th><th className="px-4 py-3">Current</th><th className="px-4 py-3">Reference</th><th className="px-4 py-3">Report flag</th></tr></thead>
                <tbody>{evidence.reportComparison.measurements.length ? evidence.reportComparison.measurements.map((item, index) => <tr key={`${item.name}-${index}`} className="border-t border-white/10"><td className="px-4 py-3 font-black text-white/70">{item.name || "—"}</td><td className="px-4 py-3 text-white/40">{item.previousValue ? `${item.previousValue} ${item.unit}`.trim() : "—"}</td><td className="px-4 py-3 text-white/70">{item.currentValue ? `${item.currentValue} ${item.unit}`.trim() : "—"}</td><td className="px-4 py-3 text-white/35">{item.referenceRange || "—"}</td><td className="px-4 py-3"><ReportFlag value={item.flag} /></td></tr>) : <tr><td colSpan={5} className="px-4 py-8 text-center text-white/30">No structured measurements were extracted from the latest report.</td></tr>}</tbody>
              </table>
            </div>
          </div>
        ) : <div className="mt-5 rounded-[18px] border border-dashed border-white/10 p-6 text-sm text-white/35">No private source report uploaded yet.</div>}
      </section>
    </div>
  );
}

function PhotoPanel({ title, id, summary }: { title: string; id: string; summary: string }) {
  return <div className="overflow-hidden rounded-[18px] border border-white/10 bg-white/[0.025]"><img src={getHealthPhotoContentUrl(id)} alt={title} className="aspect-[4/3] w-full object-cover" /><div className="p-4"><p className="text-xs font-black uppercase tracking-[0.12em] text-white/35">{title}</p>{summary ? <p className="mt-2 text-sm leading-6 text-white/45">{summary}</p> : null}</div></div>;
}

function ListBlock({ title, items, muted = false }: { title: string; items: string[]; muted?: boolean }) {
  return <div className="mt-4"><p className={`mb-2 text-xs font-black uppercase tracking-[0.12em] ${muted ? "text-white/25" : "text-white/50"}`}>{title}</p><div className="space-y-2">{items.map((item, index) => <div key={`${item}-${index}`} className="rounded-xl bg-white/[0.035] px-3 py-2 text-xs leading-5 text-white/40">{item}</div>)}</div></div>;
}

function RefreshField({ label, value, min, max, onChange }: { label: string; value: number; min: number; max: number; onChange: (value: number) => void }) {
  return <label className="grid gap-1.5 text-xs font-black uppercase tracking-[0.1em] text-white/25"><span>{label}</span><div className="relative"><input type="number" min={min} max={max} value={value} onChange={(event) => onChange(Math.max(min, Math.min(max, Number(event.target.value) || min)))} className={inputClass} /><span className="pointer-events-none absolute right-3 top-3 text-xs font-bold normal-case tracking-normal text-white/20">days</span></div></label>;
}

function QualityStatus({ status, score }: { status: HealthEvidenceOverview["quality"][number]["status"]; score: number }) {
  const cls = status === "excellent" ? "bg-[#C6FF32]/10 text-[#C6FF32]" : status === "good" ? "bg-white/[0.07] text-white/55" : status === "limited" ? "bg-amber-300/10 text-amber-200" : "bg-red-400/10 text-red-200";
  return <span className={`rounded-lg px-2 py-1 text-[10px] font-black uppercase ${cls}`}>{score}% · {status}</span>;
}

function ReportFlag({ value }: { value: string }) {
  const cls = value === "normal" ? "bg-[#C6FF32]/10 text-[#C6FF32]" : value === "high" || value === "low" ? "bg-amber-300/10 text-amber-200" : "bg-white/[0.06] text-white/35";
  return <span className={`rounded-lg px-2 py-1 text-[10px] font-black uppercase ${cls}`}>{value || "unknown"}</span>;
}

function Score({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-[18px] border border-white/10 bg-black/20 p-4"><p className="text-[10px] font-black uppercase tracking-[0.12em] text-white/25">{label}</p><p className="mt-1 text-xl font-black text-white/80">{value}</p></div>;
}

function Notice({ tone, children }: { tone: "error" | "success"; children: React.ReactNode }) {
  return <div className={`rounded-[18px] border p-4 text-sm ${tone === "error" ? "border-red-400/20 bg-red-400/10 text-red-200" : "border-[#C6FF32]/15 bg-[#C6FF32]/[0.05] text-white/60"}`}>{children}</div>;
}
