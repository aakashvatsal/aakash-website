"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Check, Globe2, LockKeyhole, Sparkles } from "lucide-react";

import {
  approveAndPublishDailyJournalPair,
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
  const todayKey = formatter.format(new Date());
  const previous = new Date(
    new Date(`${todayKey}T00:00:00+05:30`).getTime() - 24 * 60 * 60 * 1000,
  );
  return formatter.format(previous);
}

function isWaiting(journal: DailyJournalDraft | null | undefined) {
  return Boolean(journal && !journal.isPublished);
}

export function DailyJournalApprovalBanner() {
  const [privateJournal, setPrivateJournal] = useState<DailyJournalDraft | null>(null);
  const [publicJournal, setPublicJournal] = useState<DailyJournalDraft | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const dateKey = previousDayInIndia();

  useEffect(() => {
    getDailyContextWorkspace(dateKey)
      .then((workspace) => {
        setPrivateJournal(isWaiting(workspace.journal) ? workspace.journal : null);
        setPublicJournal(isWaiting(workspace.publicJournal) ? workspace.publicJournal : null);
      })
      .catch(() => {
        // Journal listing remains usable if the convenience approval panel fails.
      });
  }, [dateKey]);

  if (!privateJournal && !publicJournal) return null;

  async function publishBoth() {
    setBusy(true);
    setError("");
    try {
      const result = await approveAndPublishDailyJournalPair(dateKey);
      if (result.journal?.isPublished) setPrivateJournal(null);
      if (result.publicJournal?.isPublished) setPublicJournal(null);
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to publish journal copies.");
    } finally {
      setBusy(false);
    }
  }

  const ready = Boolean(privateJournal && publicJournal);

  return (
    <section className="mt-8 rounded-[22px] border border-[#C6FF32]/25 bg-[#C6FF32]/[0.04] p-5">
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#C6FF32]">
        <Sparkles className="h-4 w-4" /> Yesterday’s journal is waiting for you
      </div>
      <p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">
        HSAKAA prepared a private full journal and a separate public-safe copy. Add anything it missed and review privacy before giving the final publishing permission.
      </p>
      <Link
        href={`/admin/journal/daily?date=${encodeURIComponent(dateKey)}`}
        className="mt-3 inline-flex text-sm font-bold text-[#C6FF32] hover:underline"
      >
        Review yesterday →
      </Link>
      {error ? <p className="mt-3 text-sm text-red-300">{error}</p> : null}

      <div className="mt-5 grid gap-3 xl:grid-cols-2">
        <StatusCard
          journal={privateJournal}
          icon={<LockKeyhole className="h-4 w-4 text-[#C6FF32]" />}
          label="Private full copy"
        />
        <StatusCard
          journal={publicJournal}
          icon={<Globe2 className="h-4 w-4 text-[#C6FF32]" />}
          label="Public-safe copy"
        />
      </div>

      <button
        type="button"
        onClick={() => void publishBoth()}
        disabled={!ready || busy}
        className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#C6FF32] px-4 text-sm font-black text-[#030608] disabled:opacity-40"
      >
        <Check className="h-4 w-4" />
        {busy ? "Publishing…" : "Approve & publish both copies"}
      </button>
    </section>
  );
}

function StatusCard({
  journal,
  icon,
  label,
}: {
  journal: DailyJournalDraft | null;
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.14em] text-white/45">
        {icon} {label}
      </div>
      {journal ? (
        <>
          <h2 className="mt-3 text-lg font-black text-white">{journal.title}</h2>
          <p className="mt-2 line-clamp-3 text-sm leading-6 text-white/55">
            {journal.highlight || journal.content || "Prepared and waiting for owner approval."}
          </p>
        </>
      ) : (
        <p className="mt-3 text-sm text-amber-300">Not ready yet. Open yesterday’s review.</p>
      )}
    </div>
  );
}
