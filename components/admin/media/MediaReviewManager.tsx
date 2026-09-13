"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  AlertTriangle,
  CheckCircle2,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  XCircle,
} from "lucide-react";

import {
  decideMediaPreflightReview,
  runMediaPreflightReview,
} from "@/lib/api/media";
import type { MediaReviewOverview, MediaReviewQueueItem } from "@/types/media";

function stateClass(state: MediaReviewQueueItem["state"]) {
  if (state === "approved")
    return "border-[#C6FF32]/20 bg-[#C6FF32]/5 text-[#C6FF32]";
  if (state === "changes_required" || state === "stale")
    return "border-red-400/20 bg-red-400/5 text-red-200";
  if (state === "needs_review")
    return "border-amber-400/20 bg-amber-400/5 text-amber-200";
  return "border-white/10 bg-white/[0.025] text-white/45";
}

function checkClass(status: "pass" | "warn" | "block") {
  if (status === "pass")
    return "border-[#C6FF32]/15 bg-[#C6FF32]/5 text-[#C6FF32]/75";
  if (status === "warn")
    return "border-amber-400/20 bg-amber-400/5 text-amber-200";
  return "border-red-400/20 bg-red-400/5 text-red-200";
}

function Score({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/10 bg-black/20 p-3">
      <div className="text-lg font-black text-white">{value}</div>
      <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-white/30">
        {label}
      </div>
    </div>
  );
}

export function MediaReviewManager({
  initialOverview,
}: {
  initialOverview: MediaReviewOverview;
}) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string>();
  const [error, setError] = useState<string>();
  const [notes, setNotes] = useState<Record<string, string>>({});

  function act(task: () => Promise<unknown>, success: string) {
    setError(undefined);
    setMessage(undefined);
    startTransition(async () => {
      try {
        await task();
        setMessage(success);
        router.refresh();
      } catch (caught) {
        setError(
          caught instanceof Error
            ? caught.message
            : "Media review action failed.",
        );
      }
    });
  }

  const summary = initialOverview.summary;

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-[#C6FF32]" />
              <h2 className="font-black text-white">Final publishing gate</h2>
            </div>
            <p className="mt-2 max-w-3xl text-xs leading-5 text-white/45">
              Production-ready is not the same as publish-ready. HSAKAA checks
              voice, platform fit, evidence, privacy, novelty and completeness;
              only you can approve the final fingerprint.
            </p>
          </div>
          <button
            disabled={isPending}
            onClick={() => router.refresh()}
            className="rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-white/60 disabled:opacity-40"
          >
            <RefreshCw className="mr-1.5 inline h-3.5 w-3.5" />
            Refresh
          </button>
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

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
        <Score label="Queue" value={summary.total} />
        <Score label="Not reviewed" value={summary.notReviewed} />
        <Score label="Owner review" value={summary.needsReview} />
        <Score
          label="Changes / stale"
          value={summary.changesRequired + summary.stale}
        />
        <Score label="Approved" value={summary.approved} />
      </div>

      <div className="space-y-4">
        {initialOverview.items.length === 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-8 text-center text-sm text-white/35">
            No production-ready publications are waiting for preflight.
          </div>
        ) : null}
        {initialOverview.items.map((item) => (
          <ReviewCard
            key={item.publication._id}
            item={item}
            note={notes[item.publication._id] ?? ""}
            setNote={(value) =>
              setNotes((current) => ({
                ...current,
                [item.publication._id]: value,
              }))
            }
            disabled={isPending}
            run={(force) =>
              act(
                () => runMediaPreflightReview(item.publication._id, force),
                "Preflight review refreshed.",
              )
            }
            approve={() =>
              act(
                () =>
                  decideMediaPreflightReview(
                    item.publication._id,
                    "approve",
                    notes[item.publication._id],
                  ),
                "Publication approved for scheduling/publishing.",
              )
            }
            requestChanges={() =>
              act(
                () =>
                  decideMediaPreflightReview(
                    item.publication._id,
                    "changes_required",
                    notes[item.publication._id],
                  ),
                "Publication marked for changes.",
              )
            }
          />
        ))}
      </div>
    </div>
  );
}

function ReviewCard({
  item,
  note,
  setNote,
  disabled,
  run,
  approve,
  requestChanges,
}: {
  item: MediaReviewQueueItem;
  note: string;
  setNote: (value: string) => void;
  disabled: boolean;
  run: (force: boolean) => void;
  approve: () => void;
  requestChanges: () => void;
}) {
  const review = item.review;
  const blockers =
    review?.checks.filter((check) => check.status === "block") ?? [];
  const canApprove = review?.status === "needs_review" && blockers.length === 0;
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
      <div className="flex flex-wrap items-start gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-black text-white">
              {item.publication.title ??
                item.publication.hook ??
                "Untitled publication"}
            </h3>
            <span
              className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.1em] ${stateClass(item.state)}`}
            >
              {item.state.replaceAll("_", " ")}
            </span>
          </div>
          <p className="mt-1 text-xs text-white/35">
            {item.publication.platform} · {item.publication.format} · production
            v{item.publication.productionVersion}
          </p>
        </div>
        <button
          disabled={disabled}
          onClick={() => run(true)}
          className="rounded-xl border border-white/10 px-3 py-2 text-xs font-bold text-white/65 disabled:opacity-40"
        >
          <Sparkles className="mr-1.5 inline h-3.5 w-3.5" />
          {review ? "Re-run review" : "Run review"}
        </button>
      </div>

      {review ? (
        <>
          <div className="mt-4 grid gap-2 sm:grid-cols-4 xl:grid-cols-8">
            {[
              ["Overall", review.overallScore],
              ["Voice", review.authenticityScore],
              ["Platform", review.platformFitScore],
              ["Clarity", review.clarityScore],
              ["Evidence", review.evidenceScore],
              ["Privacy", review.privacyScore],
              ["Novelty", review.noveltyScore],
              ["Production", review.productionScore],
            ].map(([label, value]) => (
              <Score
                key={String(label)}
                label={String(label)}
                value={Number(value)}
              />
            ))}
          </div>
          {review.strengths.length ? (
            <div className="mt-4 rounded-xl border border-[#C6FF32]/10 bg-[#C6FF32]/[0.025] p-3">
              <div className="text-[10px] font-black uppercase tracking-[0.12em] text-[#C6FF32]/60">
                Strengths
              </div>
              <ul className="mt-2 space-y-1 text-xs text-white/55">
                {review.strengths.map((value) => (
                  <li key={value}>• {value}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <div className="mt-4 grid gap-2 xl:grid-cols-2">
            {review.checks.map((check, index) => (
              <div
                key={`${check.category}-${index}`}
                className={`rounded-xl border p-3 ${checkClass(check.status)}`}
              >
                <div className="flex items-center gap-2 text-xs font-black">
                  {check.status === "pass" ? (
                    <CheckCircle2 className="h-3.5 w-3.5" />
                  ) : check.status === "warn" ? (
                    <AlertTriangle className="h-3.5 w-3.5" />
                  ) : (
                    <XCircle className="h-3.5 w-3.5" />
                  )}
                  {check.title}
                </div>
                <p className="mt-1 text-xs leading-5 opacity-75">
                  {check.message}
                </p>
              </div>
            ))}
          </div>
          {review.changesRequired.length ? (
            <div className="mt-4 rounded-xl border border-red-400/10 bg-red-400/[0.025] p-3">
              <div className="text-[10px] font-black uppercase tracking-[0.12em] text-red-200/60">
                Changes required
              </div>
              <ul className="mt-2 space-y-1 text-xs text-red-100/70">
                {review.changesRequired.map((value) => (
                  <li key={value}>• {value}</li>
                ))}
              </ul>
            </div>
          ) : null}
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            placeholder="Optional owner note…"
            className="mt-4 min-h-20 w-full rounded-xl border border-white/10 bg-black/25 p-3 text-sm text-white outline-none placeholder:text-white/20"
          />
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              disabled={disabled || !canApprove}
              onClick={approve}
              className="rounded-xl bg-[#C6FF32] px-4 py-2 text-xs font-black text-black disabled:cursor-not-allowed disabled:opacity-30"
            >
              Approve final
            </button>
            <button
              disabled={disabled}
              onClick={requestChanges}
              className="rounded-xl border border-red-400/20 px-4 py-2 text-xs font-bold text-red-200 disabled:opacity-30"
            >
              Request changes
            </button>
          </div>
        </>
      ) : (
        <p className="mt-4 text-xs leading-5 text-white/40">
          Run preflight after Production Studio is complete. Nothing can be
          scheduled or published until an owner-approved review exists.
        </p>
      )}
    </article>
  );
}
