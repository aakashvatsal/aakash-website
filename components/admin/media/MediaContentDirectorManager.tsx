"use client";

import { FormEvent, useMemo, useState } from "react";
import Link from "next/link";
import {
  Check,
  CheckCircle2,
  ChevronDown,
  CircleAlert,
  Clock3,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  X,
} from "lucide-react";

import {
  acceptMediaDirectorCandidate,
  generateMediaDirectorBatch,
  rejectMediaDirectorCandidate,
} from "@/lib/api/media";
import type {
  MediaDirectorCandidate,
  MediaDirectorOverview,
  MediaGenerationPurpose,
  MediaGenerationRun,
  MediaGoal,
  MediaPlatform,
} from "@/types/media";

const growthPlatforms: MediaPlatform[] = [
  "linkedin",
  "instagram",
  "youtube",
  "x",
  "whatsapp",
];

const goalOptions: Array<{ value: MediaGoal; label: string }> = [
  { value: "authority", label: "Authority" },
  { value: "personal_brand", label: "Personal brand" },
  { value: "engagement", label: "Engagement" },
  { value: "education", label: "Education" },
  { value: "awareness", label: "Awareness" },
  { value: "community", label: "Community" },
  { value: "lead_generation", label: "Lead generation" },
];

const purposeOptions: Array<{ value: MediaGenerationPurpose; label: string }> = [
  { value: "ideation", label: "New ideas" },
  { value: "repurpose", label: "Repurpose" },
  { value: "platform_adaptation", label: "Platform adaptation" },
  { value: "rewrite", label: "Rewrite" },
  { value: "calendar_fill", label: "Calendar fill" },
];

export function MediaContentDirectorManager({
  overview,
  initialRuns,
}: {
  overview: MediaDirectorOverview;
  initialRuns: MediaGenerationRun[];
}) {
  const defaultPlatforms =
    overview.configuredGrowthPlatforms.length > 0
      ? overview.configuredGrowthPlatforms.filter((platform) =>
          growthPlatforms.includes(platform),
        )
      : growthPlatforms;

  const [runs, setRuns] = useState(initialRuns);
  const [activeRunId, setActiveRunId] = useState(initialRuns[0]?._id ?? "");
  const [brief, setBrief] = useState("");
  const [purpose, setPurpose] = useState<MediaGenerationPurpose>("ideation");
  const [candidateCount, setCandidateCount] = useState(
    overview.policy.candidateCountDefault,
  );
  const [platforms, setPlatforms] = useState<MediaPlatform[]>(defaultPlatforms);
  const [goals, setGoals] = useState<MediaGoal[]>(["authority", "personal_brand"]);
  const [pillars, setPillars] = useState("");
  const [audiences, setAudiences] = useState("");
  const [whyNow, setWhyNow] = useState("");
  const [constraints, setConstraints] = useState("");
  const [busy, setBusy] = useState(false);
  const [candidateBusy, setCandidateBusy] = useState("");
  const [error, setError] = useState("");

  const activeRun = useMemo(
    () => runs.find((run) => run._id === activeRunId) ?? runs[0],
    [activeRunId, runs],
  );

  const rankedCandidates = useMemo(() => {
    if (!activeRun) return [];
    const positions = new Map(
      activeRun.rankedCandidateKeys.map((key, index) => [key, index]),
    );
    return activeRun.candidates.slice().sort((first, second) => {
      const firstRank = positions.get(first.key) ?? Number.MAX_SAFE_INTEGER;
      const secondRank = positions.get(second.key) ?? Number.MAX_SAFE_INTEGER;
      if (firstRank !== secondRank) return firstRank - secondRank;
      return second.finalScore - first.finalScore;
    });
  }, [activeRun]);

  async function generate(event: FormEvent) {
    event.preventDefault();
    if (!brief.trim()) {
      setError("Give HSAKAA a clear content brief first.");
      return;
    }
    if (!platforms.length) {
      setError("Choose at least one platform.");
      return;
    }

    setBusy(true);
    setError("");
    try {
      const run = await generateMediaDirectorBatch({
        brief: brief.trim(),
        purpose,
        candidateCount,
        platforms,
        goals,
        contentPillars: splitList(pillars),
        audiences: splitList(audiences),
        whyNow: whyNow.trim() || undefined,
        constraints: splitList(constraints),
      });
      setRuns((current) => [run, ...current.filter((item) => item._id !== run._id)]);
      setActiveRunId(run._id);
    } catch (value) {
      setError(
        value instanceof Error
          ? value.message
          : "HSAKAA could not generate this content batch.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function acceptCandidate(candidate: MediaDirectorCandidate) {
    if (!activeRun) return;
    setCandidateBusy(candidate.key);
    setError("");
    try {
      const result = await acceptMediaDirectorCandidate(
        activeRun._id,
        candidate.key,
      );
      replaceRun(result.run);
    } catch (value) {
      setError(
        value instanceof Error ? value.message : "Candidate acceptance failed.",
      );
    } finally {
      setCandidateBusy("");
    }
  }

  async function rejectCandidate(candidate: MediaDirectorCandidate) {
    if (!activeRun) return;
    setCandidateBusy(candidate.key);
    setError("");
    try {
      const result = await rejectMediaDirectorCandidate(
        activeRun._id,
        candidate.key,
        "Rejected from the HSAKAA Content Director workspace.",
      );
      replaceRun(result.run);
    } catch (value) {
      setError(
        value instanceof Error ? value.message : "Candidate rejection failed.",
      );
    } finally {
      setCandidateBusy("");
    }
  }

  function replaceRun(run: MediaGenerationRun) {
    setRuns((current) =>
      current.map((item) => (item._id === run._id ? run : item)),
    );
    setActiveRunId(run._id);
  }

  function togglePlatform(platform: MediaPlatform) {
    setPlatforms((current) =>
      current.includes(platform)
        ? current.filter((item) => item !== platform)
        : [...current, platform],
    );
  }

  function toggleGoal(goal: MediaGoal) {
    setGoals((current) =>
      current.includes(goal)
        ? current.filter((item) => item !== goal)
        : [...current, goal],
    );
  }

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Generation runs" value={overview.runs} />
        <Stat label="Awaiting decisions" value={overview.pendingRuns} />
        <Stat label="Accepted runs" value={overview.acceptedRuns} />
        <Stat label="AI model" value={overview.aiModel || "Configured AI"} compact />
      </div>

      <section className="overflow-hidden rounded-[28px] border border-[#C6FF32]/20 bg-[#C6FF32]/[0.035]">
        <div className="border-b border-[#C6FF32]/10 p-5 sm:p-6">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="max-w-3xl">
              <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#C6FF32]">
                <Sparkles size={14} /> HSAKAA creative brief
              </div>
              <h2 className="mt-3 text-2xl font-black tracking-[-0.04em] sm:text-3xl">
                Generate options. Keep only the best idea.
              </h2>
              <p className="mt-2 text-sm leading-6 text-white/45">
                HSAKAA generates distinct candidates, checks them against content
                memory, critiques platform fit, and ranks the batch. Generation does
                not create canonical Media until you accept a candidate.
              </p>
            </div>
            <div className="flex flex-wrap gap-2 text-xs">
              <PolicyBadge icon={<ShieldCheck size={13} />}>Anti-repeat required</PolicyBadge>
              <PolicyBadge icon={<CheckCircle2 size={13} />}>Same canonical schema</PolicyBadge>
              <PolicyBadge icon={<Clock3 size={13} />}>No auto-publishing</PolicyBadge>
            </div>
          </div>
        </div>

        <form onSubmit={generate} className="space-y-5 p-5 sm:p-6">
          <div>
            <label className="text-xs font-black uppercase tracking-[0.14em] text-white/35">
              What should HSAKAA create?
            </label>
            <textarea
              required
              value={brief}
              onChange={(event) => setBrief(event.target.value)}
              placeholder="Example: Turn what I learned rebuilding 8lete into specific founder content about making product decisions under uncertainty. Avoid generic motivational advice."
              className="mt-2 min-h-32 w-full resize-y rounded-2xl border border-white/10 bg-[#080b0d] px-4 py-4 text-sm leading-6 outline-none transition focus:border-[#C6FF32]/40"
            />
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Field label="Purpose">
              <select
                value={purpose}
                onChange={(event) =>
                  setPurpose(event.target.value as MediaGenerationPurpose)
                }
                className="w-full rounded-xl border border-white/10 bg-[#080b0d] px-3 py-3 text-sm"
              >
                {purposeOptions.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Candidates">
              <select
                value={candidateCount}
                onChange={(event) => setCandidateCount(Number(event.target.value))}
                className="w-full rounded-xl border border-white/10 bg-[#080b0d] px-3 py-3 text-sm"
              >
                {Array.from(
                  {
                    length:
                      overview.policy.candidateCountRange[1] -
                      overview.policy.candidateCountRange[0] +
                      1,
                  },
                  (_, index) => overview.policy.candidateCountRange[0] + index,
                ).map((count) => (
                  <option key={count} value={count}>
                    {count} distinct options
                  </option>
                ))}
              </select>
            </Field>
            <Field label="Why now">
              <input
                value={whyNow}
                onChange={(event) => setWhyNow(event.target.value)}
                placeholder="Optional timing/context"
                className="w-full rounded-xl border border-white/10 bg-[#080b0d] px-3 py-3 text-sm"
              />
            </Field>
          </div>

          <div>
            <div className="text-xs font-black uppercase tracking-[0.14em] text-white/35">
              Platforms
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {growthPlatforms.map((platform) => {
                const selected = platforms.includes(platform);
                const configured = overview.configuredGrowthPlatforms.includes(platform);
                return (
                  <button
                    type="button"
                    key={platform}
                    onClick={() => togglePlatform(platform)}
                    className={`rounded-xl border px-3 py-2 text-sm font-bold capitalize transition ${
                      selected
                        ? "border-[#C6FF32]/50 bg-[#C6FF32]/10 text-[#C6FF32]"
                        : "border-white/10 text-white/45 hover:border-white/20"
                    }`}
                  >
                    {selected ? <Check className="mr-1 inline" size={13} /> : null}
                    {platform}
                    {!configured ? " · unconfigured" : ""}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <div className="text-xs font-black uppercase tracking-[0.14em] text-white/35">
              Growth goals
            </div>
            <div className="mt-2 flex flex-wrap gap-2">
              {goalOptions.map((item) => {
                const selected = goals.includes(item.value);
                return (
                  <button
                    type="button"
                    key={item.value}
                    onClick={() => toggleGoal(item.value)}
                    className={`rounded-xl border px-3 py-2 text-xs font-bold transition ${
                      selected
                        ? "border-white/25 bg-white/[0.07] text-white"
                        : "border-white/[0.07] text-white/35"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <Field label="Content pillars">
              <input
                value={pillars}
                onChange={(event) => setPillars(event.target.value)}
                placeholder="building, product, founder journey"
                className="w-full rounded-xl border border-white/10 bg-[#080b0d] px-3 py-3 text-sm"
              />
            </Field>
            <Field label="Audiences">
              <input
                value={audiences}
                onChange={(event) => setAudiences(event.target.value)}
                placeholder="founders, operators, athletes"
                className="w-full rounded-xl border border-white/10 bg-[#080b0d] px-3 py-3 text-sm"
              />
            </Field>
            <Field label="Constraints">
              <input
                value={constraints}
                onChange={(event) => setConstraints(event.target.value)}
                placeholder="no fake metrics, no generic listicles"
                className="w-full rounded-xl border border-white/10 bg-[#080b0d] px-3 py-3 text-sm"
              />
            </Field>
          </div>

          <div className="flex flex-col gap-3 border-t border-white/[0.07] pt-5 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs leading-5 text-white/30">
              Accepted candidates create canonical content and draft platform
              executions only. Scheduling and publishing arrive in Phase 6E.
            </p>
            <button
              disabled={busy || !brief.trim() || !platforms.length}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#C6FF32] px-5 py-3 text-sm font-black text-black disabled:cursor-not-allowed disabled:opacity-40"
            >
              {busy ? <RefreshCw className="animate-spin" size={16} /> : <Sparkles size={16} />}
              {busy ? "HSAKAA is thinking…" : "Generate ranked candidates"}
            </button>
          </div>
        </form>
      </section>

      <section className="rounded-[28px] border border-white/10 bg-white/[0.02] p-5 sm:p-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <div className="text-xs font-black uppercase tracking-[0.16em] text-white/30">
              Creative decision history
            </div>
            <h2 className="mt-2 text-xl font-black">Generation runs</h2>
          </div>
          {runs.length ? (
            <div className="relative min-w-64">
              <select
                value={activeRun?._id ?? ""}
                onChange={(event) => setActiveRunId(event.target.value)}
                className="w-full appearance-none rounded-xl border border-white/10 bg-[#080b0d] px-3 py-3 pr-10 text-sm"
              >
                {runs.map((run) => (
                  <option key={run._id} value={run._id}>
                    {run.brief?.slice(0, 55) || "Untitled run"} · {run.status}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={15}
                className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-white/35"
              />
            </div>
          ) : null}
        </div>

        {activeRun ? (
          <div className="mt-5 space-y-4">
            <RunSummary run={activeRun} />
            <div className="grid gap-4 xl:grid-cols-2">
              {rankedCandidates.map((candidate, index) => (
                <CandidateCard
                  key={candidate.key}
                  candidate={candidate}
                  rank={index + 1}
                  busy={candidateBusy === candidate.key}
                  onAccept={() => acceptCandidate(candidate)}
                  onReject={() => rejectCandidate(candidate)}
                />
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-2xl border border-dashed border-white/10 p-10 text-center">
            <Sparkles className="mx-auto text-white/20" size={28} />
            <h3 className="mt-4 font-black">No Content Director runs yet</h3>
            <p className="mt-2 text-sm text-white/35">
              Give HSAKAA a brief above. Draft candidates stay outside canonical
              Media until you explicitly accept one.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

function CandidateCard({
  candidate,
  rank,
  busy,
  onAccept,
  onReject,
}: {
  candidate: MediaDirectorCandidate;
  rank: number;
  busy: boolean;
  onAccept: () => void;
  onReject: () => void;
}) {
  const decided = candidate.status === "accepted" || candidate.status === "rejected";
  const blocked = candidate.status === "blocked";

  return (
    <article
      className={`rounded-[24px] border p-5 ${
        blocked
          ? "border-red-400/15 bg-red-400/[0.025]"
          : candidate.status === "accepted"
            ? "border-[#C6FF32]/25 bg-[#C6FF32]/[0.03]"
            : "border-white/[0.08] bg-black/10"
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-white/45">
              #{rank}
            </span>
            <StatusBadge status={candidate.status} />
            <RiskBadge risk={candidate.repetitionRisk} />
          </div>
          <h3 className="mt-3 text-xl font-black tracking-[-0.03em]">
            {candidate.title}
          </h3>
          <p className="mt-2 text-sm font-medium leading-6 text-white/60">
            {candidate.thesis}
          </p>
        </div>
        <Score value={candidate.finalScore} />
      </div>

      {candidate.whyNow ? (
        <p className="mt-4 rounded-xl border border-white/[0.06] bg-white/[0.02] p-3 text-xs leading-5 text-white/40">
          <span className="font-bold text-white/55">Why now:</span> {candidate.whyNow}
        </p>
      ) : null}

      <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-4">
        <MiniScore label="Novelty" value={candidate.noveltyScore} />
        <MiniScore label="Strategy" value={candidate.critic.strategicFit} />
        <MiniScore label="Platform" value={candidate.critic.platformFit} />
        <MiniScore label="Specificity" value={candidate.critic.specificity} />
      </div>

      {(candidate.critic.strengths.length || candidate.critic.risks.length) ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <CriticList label="Strengths" items={candidate.critic.strengths} />
          <CriticList label="Risks" items={candidate.critic.risks} warning />
        </div>
      ) : null}

      {candidate.critic.improvement ? (
        <div className="mt-3 text-xs leading-5 text-white/35">
          <span className="font-bold text-white/50">Editor note:</span>{" "}
          {candidate.critic.improvement}
        </div>
      ) : null}

      <div className="mt-5 space-y-2">
        {candidate.publications.map((publication) => (
          <details
            key={`${candidate.key}-${publication.platform}`}
            className="group rounded-xl border border-white/[0.07] bg-white/[0.015]"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-3 py-3 text-sm">
              <div className="flex min-w-0 items-center gap-2">
                <span className="font-black capitalize">{publication.platform}</span>
                <span className="text-xs text-white/30">{publication.format.replaceAll("_", " ")}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-white/30">
                {publication.noveltyScore} novelty
                <ChevronDown
                  size={14}
                  className="transition group-open:rotate-180"
                />
              </div>
            </summary>
            <div className="space-y-3 border-t border-white/[0.06] px-3 py-3 text-sm">
              {publication.hook ? <DraftField label="Hook" value={publication.hook} /> : null}
              {publication.caption ? <DraftField label="Caption" value={publication.caption} /> : null}
              {publication.script ? <DraftField label="Script" value={publication.script} /> : null}
              {publication.cta ? <DraftField label="CTA" value={publication.cta} /> : null}
              {publication.rationale ? (
                <DraftField label="Why this execution" value={publication.rationale} />
              ) : null}
            </div>
          </details>
        ))}
      </div>

      <div className="mt-5 flex flex-col gap-2 border-t border-white/[0.07] pt-4 sm:flex-row">
        {candidate.status === "accepted" ? (
          <Link
            href="/admin/media/core"
            className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-[#C6FF32]/30 px-4 py-3 text-sm font-black text-[#C6FF32]"
          >
            <CheckCircle2 size={15} /> Canonical content created
          </Link>
        ) : candidate.status === "rejected" ? (
          <div className="flex-1 rounded-xl border border-white/[0.07] px-4 py-3 text-center text-sm font-bold text-white/35">
            Rejection remembered by content memory
          </div>
        ) : (
          <>
            <button
              type="button"
              disabled={busy || blocked || decided}
              onClick={onAccept}
              className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#C6FF32] px-4 py-3 text-sm font-black text-black disabled:cursor-not-allowed disabled:opacity-35"
            >
              {busy ? <RefreshCw className="animate-spin" size={15} /> : <Check size={15} />}
              Accept into Media Core
            </button>
            <button
              type="button"
              disabled={busy || blocked || decided}
              onClick={onReject}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-white/55 disabled:cursor-not-allowed disabled:opacity-35"
            >
              <X size={15} /> Reject & remember
            </button>
          </>
        )}
      </div>

      {blocked ? (
        <div className="mt-3 flex gap-2 rounded-xl bg-red-400/[0.06] p-3 text-xs leading-5 text-red-200/70">
          <CircleAlert className="mt-0.5 shrink-0" size={14} />
          This candidate is blocked by anti-repetition policy and cannot be accepted.
          Ask HSAKAA for a genuinely different angle.
        </div>
      ) : null}
    </article>
  );
}

function RunSummary({ run }: { run: MediaGenerationRun }) {
  return (
    <div className="rounded-2xl border border-white/[0.07] bg-white/[0.02] p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={run.status} />
            <span className="text-xs font-bold uppercase tracking-[0.12em] text-white/30">
              {run.purpose.replaceAll("_", " ")}
            </span>
            <span className="text-xs text-white/25">{formatDate(run.createdAt)}</span>
          </div>
          <p className="mt-2 max-w-4xl text-sm font-semibold leading-6 text-white/70">
            {run.brief || "Untitled Content Director run"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {run.requestedPlatforms.map((platform) => (
            <span
              key={platform}
              className="rounded-lg border border-white/[0.07] px-2 py-1 text-[10px] font-black uppercase tracking-[0.1em] text-white/35"
            >
              {platform}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}

function CriticList({
  label,
  items,
  warning = false,
}: {
  label: string;
  items: string[];
  warning?: boolean;
}) {
  if (!items.length) return null;
  return (
    <div className="rounded-xl border border-white/[0.06] p-3">
      <div
        className={`text-[10px] font-black uppercase tracking-[0.12em] ${
          warning ? "text-amber-300/60" : "text-white/30"
        }`}
      >
        {label}
      </div>
      <ul className="mt-2 space-y-1 text-xs leading-5 text-white/45">
        {items.slice(0, 3).map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}

function DraftField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-[10px] font-black uppercase tracking-[0.12em] text-white/25">
        {label}
      </div>
      <p className="mt-1 whitespace-pre-wrap leading-6 text-white/55">{value}</p>
    </div>
  );
}

function MiniScore({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/[0.06] p-3">
      <div className="text-lg font-black">{Math.round(value)}</div>
      <div className="mt-0.5 text-[10px] font-bold uppercase tracking-[0.1em] text-white/25">
        {label}
      </div>
    </div>
  );
}

function Score({ value }: { value: number }) {
  return (
    <div className="shrink-0 text-right">
      <div className="text-3xl font-black tracking-[-0.06em] text-[#C6FF32]">
        {Math.round(value)}
      </div>
      <div className="text-[10px] font-black uppercase tracking-[0.12em] text-white/25">
        score
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  return (
    <span className="rounded-full border border-white/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white/45">
      {status.replaceAll("_", " ")}
    </span>
  );
}

function RiskBadge({ risk }: { risk: string }) {
  const className =
    risk === "blocked" || risk === "high"
      ? "border-red-400/20 text-red-200/70"
      : risk === "medium"
        ? "border-amber-300/20 text-amber-200/70"
        : "border-[#C6FF32]/20 text-[#C6FF32]/70";
  return (
    <span
      className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${className}`}
    >
      {risk} repetition
    </span>
  );
}

function PolicyBadge({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-black/20 px-2.5 py-1.5 font-bold text-white/40">
      {icon}
      {children}
    </span>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label>
      <span className="text-xs font-black uppercase tracking-[0.14em] text-white/35">
        {label}
      </span>
      <span className="mt-2 block">{children}</span>
    </label>
  );
}

function Stat({
  label,
  value,
  compact = false,
}: {
  label: string;
  value: string | number;
  compact?: boolean;
}) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/[0.025] p-5">
      <div className="text-xs font-bold uppercase tracking-[0.16em] text-white/35">
        {label}
      </div>
      <div className={`mt-3 font-black ${compact ? "text-lg" : "text-3xl"}`}>
        {value}
      </div>
    </div>
  );
}

function splitList(value: string) {
  return [
    ...new Set(
      value
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
    ),
  ];
}

function formatDate(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}
