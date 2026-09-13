"use client";

import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  CircleGauge,
  RefreshCw,
  RotateCcw,
  ShieldCheck,
  XCircle,
} from "lucide-react";

import { repairMediaReleaseSafeState } from "@/lib/api/media";
import type {
  MediaReleaseCheckStatus,
  MediaReleaseOverview,
  MediaReleaseStage,
} from "@/types/media";

const stageLabels: Record<MediaReleaseStage, string> = {
  intelligence: "Intelligence",
  launch: "Launch",
  planning: "Planning",
  production: "Production",
  review: "Final review",
  delivery: "Delivery",
  learning: "Learning",
  integrity: "Integrity",
};

function statusClass(
  status: MediaReleaseCheckStatus | "ready" | "attention" | "blocked",
) {
  if (status === "pass" || status === "ready")
    return "border-[#C6FF32]/20 bg-[#C6FF32]/5 text-[#C6FF32]";
  if (status === "warn" || status === "attention")
    return "border-amber-400/20 bg-amber-400/5 text-amber-200";
  return "border-red-400/20 bg-red-400/5 text-red-200";
}

function StatusIcon({ status }: { status: MediaReleaseCheckStatus }) {
  if (status === "pass")
    return <CheckCircle2 className="h-4 w-4 text-[#C6FF32]" />;
  if (status === "warn")
    return <AlertTriangle className="h-4 w-4 text-amber-200" />;
  return <XCircle className="h-4 w-4 text-red-300" />;
}

export function MediaReleaseManager({
  initialOverview,
}: {
  initialOverview: MediaReleaseOverview;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>();
  const [error, setError] = useState<string>();

  function repair() {
    setMessage(undefined);
    setError(undefined);
    startTransition(async () => {
      try {
        const result = await repairMediaReleaseSafeState();
        setMessage(
          `Safe reconciliation completed. Release status is now ${result.overview.status} with score ${result.overview.score}/100.`,
        );
        router.refresh();
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : "Media release reconciliation failed.",
        );
      }
    });
  }

  const overview = initialOverview;
  return (
    <div className="space-y-6">
      <section
        className={`rounded-2xl border p-5 ${statusClass(overview.status)}`}
      >
        <div className="flex flex-wrap items-start justify-between gap-5">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5" />
              <h2 className="font-black text-white">
                Release candidate {overview.status}
              </h2>
            </div>
            <p className="mt-2 text-sm leading-6 text-white/55">
              {overview.releaseCandidateReady
                ? "There are no blocking Media release conditions. Warnings remain visible but do not bypass owner approval, privacy or evidence rules."
                : `${overview.blockers.length} blocking condition${overview.blockers.length === 1 ? "" : "s"} must be resolved before the Presence Engine is considered release-ready.`}
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="rounded-2xl border border-white/10 bg-black/20 px-5 py-3 text-center">
              <CircleGauge className="mx-auto h-4 w-4 text-[#C6FF32]" />
              <div className="mt-1 text-3xl font-black text-white">
                {overview.score}
              </div>
              <div className="text-[10px] font-black uppercase tracking-[0.12em] text-white/30">
                readiness
              </div>
            </div>
            <div className="flex flex-col gap-2">
              <button
                disabled={isPending}
                onClick={() => router.refresh()}
                className="rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-white/65 disabled:opacity-40"
              >
                <RefreshCw className="mr-1.5 inline h-3.5 w-3.5" />
                Refresh audit
              </button>
              <button
                disabled={isPending}
                onClick={repair}
                className="rounded-xl bg-[#C6FF32] px-3 py-2 text-xs font-black text-black disabled:opacity-40"
              >
                <RotateCcw className="mr-1.5 inline h-3.5 w-3.5" />
                Repair safe state
              </button>
            </div>
          </div>
        </div>
      </section>

      {message ? (
        <div className="rounded-xl border border-[#C6FF32]/20 bg-[#C6FF32]/5 px-4 py-3 text-sm text-[#C6FF32]">
          {message}
        </div>
      ) : null}
      {error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-8">
        {overview.stages.map((stage) => (
          <div
            key={stage.stage}
            className={`rounded-xl border p-3 ${statusClass(stage.status)}`}
          >
            <div className="text-[10px] font-black uppercase tracking-[0.1em] opacity-60">
              {stageLabels[stage.stage]}
            </div>
            <div className="mt-2 text-xl font-black text-white">
              {stage.passed}/{stage.total}
            </div>
            <div className="mt-1 text-[10px] font-black uppercase tracking-[0.1em] opacity-60">
              {stage.status}
            </div>
          </div>
        ))}
      </div>

      {overview.blockers.length ? (
        <section className="rounded-2xl border border-red-400/20 bg-red-400/[0.035] p-5">
          <h2 className="font-black text-red-200">
            Blocking release conditions
          </h2>
          <div className="mt-4 grid gap-3 xl:grid-cols-2">
            {overview.blockers.map((item) => (
              <div
                key={item.key}
                className="rounded-xl border border-red-400/10 bg-black/20 p-4"
              >
                <div className="font-bold text-white">{item.title}</div>
                <p className="mt-1 text-xs leading-5 text-red-100/65">
                  {item.message}
                </p>
                {item.action ? (
                  <Link
                    href={item.action}
                    className="mt-3 inline-block text-xs font-black text-[#C6FF32]"
                  >
                    Open fix →
                  </Link>
                ) : null}
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <h2 className="font-black text-white">Release checks</h2>
        <div className="mt-4 space-y-2">
          {overview.checks.map((check) => (
            <div
              key={check.key}
              className="flex flex-wrap items-start gap-3 rounded-xl border border-white/8 bg-black/20 p-3"
            >
              <StatusIcon status={check.status} />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <div className="font-bold text-white">{check.title}</div>
                  <span
                    className={`rounded-full border px-2 py-0.5 text-[9px] font-black uppercase tracking-[0.1em] ${statusClass(check.status)}`}
                  >
                    {stageLabels[check.stage]} · {check.status}
                  </span>
                </div>
                <p className="mt-1 text-xs leading-5 text-white/45">
                  {check.message}
                </p>
              </div>
              {check.action && check.status !== "pass" ? (
                <Link
                  href={check.action}
                  className="rounded-lg border border-white/10 px-2.5 py-1.5 text-[11px] font-bold text-white/60"
                >
                  Resolve
                </Link>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <div className="grid gap-4 xl:grid-cols-2">
        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <h2 className="font-black text-white">Current RC snapshot</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-2xl font-black text-white">
                {overview.snapshot.launchDay}
              </div>
              <div className="text-xs text-white/35">Launch day</div>
            </div>
            <div>
              <div className="text-2xl font-black text-white">
                {overview.snapshot.profilesApplied}/5
              </div>
              <div className="text-xs text-white/35">Profiles applied</div>
            </div>
            <div>
              <div className="text-2xl font-black text-white">
                {overview.snapshot.reviewQueue.approved}
              </div>
              <div className="text-xs text-white/35">Final approvals</div>
            </div>
            <div>
              <div className="text-2xl font-black text-white">
                {overview.snapshot.operations.dueSnapshots}
              </div>
              <div className="text-xs text-white/35">Analytics due</div>
            </div>
          </div>
          <p className="mt-4 text-xs leading-5 text-white/35">
            Current plan:{" "}
            {overview.snapshot.plan
              ? `${overview.snapshot.plan.startDate} → ${overview.snapshot.plan.endDate} · ${overview.snapshot.plan.days} days`
              : "none"}
            .
          </p>
        </section>

        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
          <h2 className="font-black text-white">Data integrity</h2>
          <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-2xl font-black text-white">
                {overview.snapshot.integrity.orphanedPublications}
              </div>
              <div className="text-xs text-white/35">Orphaned publications</div>
            </div>
            <div>
              <div className="text-2xl font-black text-white">
                {overview.snapshot.integrity.scheduledWithoutFreshApproval}
              </div>
              <div className="text-xs text-white/35">
                Scheduled without fresh approval
              </div>
            </div>
            <div>
              <div className="text-2xl font-black text-white">
                {overview.snapshot.integrity.scheduledWithPendingRequiredAssets}
              </div>
              <div className="text-xs text-white/35">Scheduled asset gaps</div>
            </div>
            <div>
              <div className="text-2xl font-black text-white">
                {overview.snapshot.integrity.unverifiedLibraryAssets}
              </div>
              <div className="text-xs text-white/35">
                Unverified library uploads
              </div>
            </div>
          </div>
        </section>
      </div>

      <p className="text-xs leading-5 text-white/30">
        Safe repair only reconciles already-existing delivery state. It never
        generates content, publishes, comments, replies, or approves a final
        review.
      </p>
    </div>
  );
}
