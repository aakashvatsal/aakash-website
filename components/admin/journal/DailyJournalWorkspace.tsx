"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Check,
  Globe2,
  LockKeyhole,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Undo2,
} from "lucide-react";

import {
  approveDailyJournal,
  approvePublicDailyJournal,
  clearDailyContextPrivacy,
  generateDailyJournal,
  getDailyContextWorkspace,
  getJournalIntelligence,
  regeneratePublicDailyJournal,
  refreshDailyContext,
  updateDailyContextPrivacy,
  type DailyContextItem,
  type DailyContextPrivacy,
  type DailyContextWorkspace,
  type DailyJournalDraft,
  type JournalIntelligence,
} from "@/lib/api/daily-context";

const PRIVACY_OPTIONS: Array<{
  value: DailyContextPrivacy;
  label: string;
}> = [
  { value: "private_only", label: "Private only" },
  { value: "internal_safe", label: "Internal safe" },
  { value: "public_safe", label: "Public safe" },
  { value: "needs_review", label: "Needs review" },
];

export function DailyJournalWorkspace({
  initialWorkspace,
  initialWeekly,
  initialMonthly,
}: {
  initialWorkspace: DailyContextWorkspace;
  initialWeekly: JournalIntelligence;
  initialMonthly: JournalIntelligence;
}) {
  const [workspace, setWorkspace] = useState(initialWorkspace);
  const [weekly, setWeekly] = useState(initialWeekly);
  const [monthly, setMonthly] = useState(initialMonthly);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const context = workspace.context;
  const publicSafeCount = context.privacyCounts.public_safe ?? 0;
  const needsReviewCount = context.privacyCounts.needs_review ?? 0;
  const publicStale = workspace.publicJournal?.metadata?.publicDraftStale === true;

  const grouped = useMemo(() => {
    const groups = new Map<string, DailyContextItem[]>();
    for (const item of context.items) {
      const rows = groups.get(item.source) ?? [];
      rows.push(item);
      groups.set(item.source, rows);
    }
    return [...groups.entries()];
  }, [context.items]);

  async function reload(dateKey = context.dateKey) {
    const [next, nextWeekly, nextMonthly] = await Promise.all([
      getDailyContextWorkspace(dateKey),
      getJournalIntelligence("week", dateKey),
      getJournalIntelligence("month", dateKey),
    ]);
    setWorkspace(next);
    setWeekly(nextWeekly);
    setMonthly(nextMonthly);
  }

  async function run(label: string, action: () => Promise<unknown>) {
    setBusy(label);
    setError("");
    try {
      await action();
      await reload();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Request failed.");
    } finally {
      setBusy("");
    }
  }

  async function changeDate(nextDate: string) {
    if (!nextDate) return;
    window.location.href = `/admin/journal/daily?date=${encodeURIComponent(nextDate)}`;
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#C6FF32]">
              <ShieldCheck className="h-4 w-4" /> Privacy firewall
            </div>
            <h2 className="mt-2 text-2xl font-black text-white">{context.dateKey}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">
              Private synthesis sees the complete factual day. The public draft can only use items explicitly marked public-safe.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              type="date"
              value={context.dateKey}
              onChange={(event) => void changeDate(event.target.value)}
              className="min-h-10 rounded-xl border border-white/10 bg-black/30 px-3 text-sm text-white"
            />
            <button
              type="button"
              onClick={() => run("refresh", () => refreshDailyContext(context.dateKey))}
              disabled={Boolean(busy)}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-sm font-bold text-white/75 disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4" /> Refresh context
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <Metric label="Captured" value={context.items.length} />
          <Metric label="Public safe" value={publicSafeCount} />
          <Metric label="Needs review" value={needsReviewCount} attention={needsReviewCount > 0} />
          <Metric label="Privacy version" value={context.privacyVersion} />
        </div>

        {error ? (
          <div className="mt-4 rounded-xl border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        ) : null}
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <JournalDraftCard
          title="Private daily journal"
          icon={<LockKeyhole className="h-4 w-4" />}
          journal={workspace.journal}
          busy={busy}
          actionLabel={workspace.journal ? "Approve private journal" : "Generate journal"}
          onAction={() =>
            workspace.journal
              ? run("approve-private", () => approveDailyJournal(workspace.journal!._id))
              : run("generate", () => generateDailyJournal(context.dateKey))
          }
          secondaryLabel="Regenerate private + public"
          onSecondary={() => run("regenerate", () => generateDailyJournal(context.dateKey, true))}
        />
        <JournalDraftCard
          title="Public-safe Open Notebook"
          icon={<Globe2 className="h-4 w-4" />}
          journal={workspace.publicJournal}
          busy={busy}
          stale={publicStale}
          disabled={needsReviewCount > 0 || publicStale}
          actionLabel="Approve public draft"
          onAction={() =>
            workspace.publicJournal
              ? run("approve-public", () => approvePublicDailyJournal(workspace.publicJournal!._id))
              : run("regenerate-public", () => regeneratePublicDailyJournal(context.dateKey))
          }
          secondaryLabel="Regenerate public draft"
          onSecondary={() => run("regenerate-public", () => regeneratePublicDailyJournal(context.dateKey))}
        />
      </section>

      <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5 sm:p-6">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#C6FF32]">
          <Sparkles className="h-4 w-4" /> Source review
        </div>
        <p className="mt-2 text-sm leading-6 text-white/55">
          Changing an item to or from public-safe invalidates any older public approval until the public draft is regenerated.
        </p>

        <div className="mt-5 space-y-5">
          {grouped.map(([source, items]) => (
            <div key={source}>
              <div className="mb-2 text-xs font-black uppercase tracking-[0.14em] text-white/35">
                {source} · {items.length}
              </div>
              <div className="space-y-2">
                {items.map((item) => (
                  <PrivacyRow
                    key={item.id}
                    item={item}
                    disabled={Boolean(busy)}
                    onChange={(privacy) =>
                      run(`privacy-${item.id}`, () =>
                        updateDailyContextPrivacy(
                          context.dateKey,
                          item.id,
                          privacy,
                          "Owner review in Daily Journal Privacy Firewall",
                        ),
                      )
                    }
                    onClear={() =>
                      run(`clear-${item.id}`, () =>
                        clearDailyContextPrivacy(context.dateKey, item.id),
                      )
                    }
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <IntelligenceCard intelligence={weekly} />
        <IntelligenceCard intelligence={monthly} />
      </section>
    </div>
  );
}

function PrivacyRow({
  item,
  disabled,
  onChange,
  onClear,
}: {
  item: DailyContextItem;
  disabled: boolean;
  onChange: (privacy: DailyContextPrivacy) => void;
  onClear: () => void;
}) {
  return (
    <div className="rounded-2xl border border-white/8 bg-black/20 p-4">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-bold text-white">{item.title}</h3>
            {item.privacyOverride ? (
              <span className="rounded-full bg-[#C6FF32]/10 px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-[#C6FF32]">
                Owner override
              </span>
            ) : null}
          </div>
          {item.summary ? (
            <p className="mt-1 text-sm leading-6 text-white/50">{item.summary}</p>
          ) : null}
          <p className="mt-2 text-xs text-white/30">
            Default: {item.defaultPrivacy.replaceAll("_", " ")}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <select
            value={item.privacy}
            onChange={(event) => onChange(event.target.value as DailyContextPrivacy)}
            disabled={disabled}
            className="min-h-10 rounded-xl border border-white/10 bg-[#070b0d] px-3 text-sm text-white disabled:opacity-50"
          >
            {PRIVACY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          {item.privacyOverride ? (
            <button
              type="button"
              onClick={onClear}
              disabled={disabled}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-sm font-bold text-white/65 disabled:opacity-50"
            >
              <Undo2 className="h-4 w-4" /> Default
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function JournalDraftCard({
  title,
  icon,
  journal,
  busy,
  stale = false,
  disabled = false,
  actionLabel,
  onAction,
  secondaryLabel,
  onSecondary,
}: {
  title: string;
  icon: React.ReactNode;
  journal: DailyJournalDraft | null;
  busy: string;
  stale?: boolean;
  disabled?: boolean;
  actionLabel: string;
  onAction: () => void;
  secondaryLabel: string;
  onSecondary: () => void;
}) {
  const approved = journal?.metadata?.approvalStatus === "approved";
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5 sm:p-6">
      <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-[#C6FF32]">
        {icon} {title}
      </div>
      {journal ? (
        <>
          <h2 className="mt-3 text-xl font-black text-white">{journal.title}</h2>
          <p className="mt-2 line-clamp-4 text-sm leading-6 text-white/55">
            {journal.highlight || journal.content || "Draft generated."}
          </p>
          <div className="mt-3 flex flex-wrap gap-2 text-xs">
            <span className="rounded-full border border-white/10 px-2.5 py-1 text-white/50">
              {approved ? "approved" : "pending approval"}
            </span>
            {stale ? (
              <span className="rounded-full border border-amber-400/20 bg-amber-400/10 px-2.5 py-1 text-amber-300">
                stale — regenerate required
              </span>
            ) : null}
          </div>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href={`/admin/journal/${journal._id}`}
              className="inline-flex min-h-10 items-center rounded-xl border border-white/10 px-3 text-sm font-bold text-white/70"
            >
              Read draft
            </Link>
            {!approved ? (
              <button
                type="button"
                onClick={onAction}
                disabled={Boolean(busy) || disabled}
                className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#C6FF32] px-3 text-sm font-black text-[#030608] disabled:opacity-50"
              >
                <Check className="h-4 w-4" /> {actionLabel}
              </button>
            ) : null}
            <button
              type="button"
              onClick={onSecondary}
              disabled={Boolean(busy)}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-sm font-bold text-white/70 disabled:opacity-50"
            >
              <RefreshCw className="h-4 w-4" /> {secondaryLabel}
            </button>
          </div>
        </>
      ) : (
        <div className="mt-3">
          <p className="text-sm leading-6 text-white/50">No draft exists for this day yet.</p>
          <button
            type="button"
            onClick={onAction}
            disabled={Boolean(busy) || disabled}
            className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#C6FF32] px-3 text-sm font-black text-[#030608] disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" /> {actionLabel}
          </button>
        </div>
      )}
    </div>
  );
}

function IntelligenceCard({ intelligence }: { intelligence: JournalIntelligence }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5 sm:p-6">
      <div className="text-xs font-black uppercase tracking-[0.16em] text-[#C6FF32]">
        {intelligence.period === "week" ? "Weekly" : "30-day"} journal intelligence
      </div>
      <div className="mt-4 grid grid-cols-3 gap-2">
        <Metric label="Captured" value={intelligence.daysCaptured} />
        <Metric label="Expected" value={intelligence.daysExpected} />
        <Metric label="Coverage" value={`${intelligence.coveragePercentage}%`} />
      </div>
      <List title="Wins" items={intelligence.wins.slice(0, 4)} />
      <List title="Lessons" items={intelligence.lessons.slice(0, 4)} />
      <List title="Decisions" items={intelligence.decisions.slice(0, 4)} />
      {intelligence.topTags.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {intelligence.topTags.slice(0, 8).map((item) => (
            <span key={item.tag} className="rounded-full border border-white/10 px-2.5 py-1 text-xs text-white/55">
              {item.tag} · {item.count}
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

function List({ title, items }: { title: string; items: string[] }) {
  if (!items.length) return null;
  return (
    <div className="mt-4">
      <div className="text-xs font-black uppercase tracking-[0.12em] text-white/35">{title}</div>
      <ul className="mt-2 space-y-1 text-sm leading-6 text-white/55">
        {items.map((item) => (
          <li key={item}>• {item}</li>
        ))}
      </ul>
    </div>
  );
}

function Metric({
  label,
  value,
  attention = false,
}: {
  label: string;
  value: string | number;
  attention?: boolean;
}) {
  return (
    <div className={`rounded-2xl border p-3 ${attention ? "border-amber-400/20 bg-amber-400/10" : "border-white/8 bg-black/20"}`}>
      <div className="text-xs font-bold uppercase tracking-[0.1em] text-white/35">{label}</div>
      <div className={`mt-1 text-xl font-black ${attention ? "text-amber-300" : "text-white"}`}>{value}</div>
    </div>
  );
}
