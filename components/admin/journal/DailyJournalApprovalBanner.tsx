"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, Globe2, LockKeyhole, Sparkles } from "lucide-react";

import {
  approveDailyJournal,
  approvePublicDailyJournal,
  getDailyContextWorkspace,
  type DailyJournalDraft,
} from "@/lib/api/daily-context";

function previousDayInIndia() {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const todayParts = Object.fromEntries(
    formatter.formatToParts(new Date()).map((part) => [part.type, part.value]),
  );
  const todayKey = `${todayParts.year}-${todayParts.month}-${todayParts.day}`;
  const previous = new Date(
    new Date(`${todayKey}T00:00:00+05:30`).getTime() - 24 * 60 * 60 * 1000,
  );
  const parts = Object.fromEntries(
    formatter.formatToParts(previous).map((part) => [part.type, part.value]),
  );
  return `${parts.year}-${parts.month}-${parts.day}`;
}

function isPending(journal: DailyJournalDraft | null | undefined) {
  return journal?.metadata?.approvalStatus === "pending_approval";
}

export function DailyJournalApprovalBanner() {
  const [privateJournal, setPrivateJournal] = useState<DailyJournalDraft | null>(null);
  const [publicJournal, setPublicJournal] = useState<DailyJournalDraft | null>(null);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getDailyContextWorkspace(previousDayInIndia())
      .then((workspace) => {
        setPrivateJournal(isPending(workspace.journal) ? workspace.journal : null);
        setPublicJournal(isPending(workspace.publicJournal) ? workspace.publicJournal : null);
      })
      .catch(() => {
        // Journal listing remains usable if the convenience approval panel fails.
      });
  }, []);

  if (!privateJournal && !publicJournal) return null;

  async function approve(kind: "private" | "public", journal: DailyJournalDraft) {
    setBusy(kind);
    setError("");
    try {
      const approved =
        kind === "private"
          ? await approveDailyJournal(journal._id)
          : await approvePublicDailyJournal(journal._id);
      if (approved.metadata?.approvalStatus !== "pending_approval") {
        if (kind === "private") setPrivateJournal(null);
        else setPublicJournal(null);
      }
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to approve journal.");
    } finally {
      setBusy("");
    }
  }

  return (
    <section className="mt-8 rounded-[22px] border border-[#C6FF32]/25 bg-[#C6FF32]/[0.04] p-5">
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#C6FF32]">
        <Sparkles className="h-4 w-4" /> HSAKAA journals ready
      </div>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">
        The private journal uses your full captured day. The public draft is a separate artifact generated only from context already classified as public-safe.
      </p>
      <Link
        href="/admin/journal/daily"
        className="mt-3 inline-flex text-sm font-bold text-[#C6FF32] hover:underline"
      >
        Review the Privacy Firewall →
      </Link>
      {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}

      <div className="mt-5 grid gap-3 xl:grid-cols-2">
        {privateJournal ? (
          <ApprovalCard
            journal={privateJournal}
            kind="private"
            busy={busy === "private"}
            onApprove={() => approve("private", privateJournal)}
          />
        ) : null}
        {publicJournal ? (
          <ApprovalCard
            journal={publicJournal}
            kind="public"
            busy={busy === "public"}
            onApprove={() => approve("public", publicJournal)}
          />
        ) : null}
      </div>
    </section>
  );
}

function ApprovalCard({
  journal,
  kind,
  busy,
  onApprove,
}: {
  journal: DailyJournalDraft;
  kind: "private" | "public";
  busy: boolean;
  onApprove: () => void;
}) {
  const Icon = kind === "private" ? LockKeyhole : Globe2;
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-white/45">
        <Icon className="h-4 w-4 text-[#C6FF32]" />
        {kind === "private" ? "Private daily journal" : "Public-safe Open Notebook draft"}
      </div>
      <h2 className="mt-3 text-lg font-black text-white">{journal.title}</h2>
      <p className="mt-2 line-clamp-3 text-sm leading-6 text-white/55">
        {journal.highlight || journal.content || "Generated and waiting for approval."}
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <Link
          href={`/admin/journal/${journal._id}`}
          className="inline-flex min-h-10 items-center rounded-xl border border-white/10 px-3 text-sm font-bold text-white/75"
        >
          Read journal
        </Link>
        <button
          type="button"
          onClick={onApprove}
          disabled={busy}
          className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#C6FF32] px-3 text-sm font-black text-[#030608] disabled:opacity-60"
        >
          <Check className="h-4 w-4" /> {busy ? "Approving…" : "Approve"}
        </button>
      </div>
    </div>
  );
}
