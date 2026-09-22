"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  BookOpen,
  BriefcaseBusiness,
  Check,
  Globe2,
  Heart,
  Lightbulb,
  LockKeyhole,
  MessageCircle,
  RefreshCw,
  ShieldCheck,
  Sparkles,
  Undo2,
} from "lucide-react";

import {
  approveAndPublishDailyJournalPair,
  clearDailyContextPrivacy,
  generateDailyJournal,
  getDailyContextWorkspace,
  getJournalIntelligence,
  regeneratePublicDailyJournal,
  refreshDailyContext,
  removeDailyJournalPointer,
  updateDailyContextPrivacy,
  upsertDailyJournalPointer,
  type DailyContextItem,
  type DailyContextPrivacy,
  type DailyContextWorkspace,
  type DailyJournalDraft,
  type DailyJournalPointerCategory,
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

const POINTERS: Array<{
  category: DailyJournalPointerCategory;
  title: string;
  prompt: string;
  placeholder: string;
  icon: React.ReactNode;
}> = [
  {
    category: "work",
    title: "Work worth remembering",
    prompt:
      "Anything important at 8lete, Frayto or HSAKAA that Tasks, meetings or company records did not capture?",
    placeholder:
      "Example: We changed the approach to… The main unresolved issue was… I spent most of the afternoon on…",
    icon: <BriefcaseBusiness className="h-4 w-4" />,
  },
  {
    category: "offline_reading",
    title: "Offline reading",
    prompt:
      "Did you read a physical/offline book that Library could not see? Add the title and what mattered, not just the fact that you read.",
    placeholder:
      "Example: Read 25 minutes of … The idea I kept thinking about was…",
    icon: <BookOpen className="h-4 w-4" />,
  },
  {
    category: "conversation",
    title: "Conversation or meeting",
    prompt:
      "Was there a conversation, meeting or person interaction worth remembering that is not already captured?",
    placeholder:
      "Example: Spoke with … about … The useful tension / insight was…",
    icon: <MessageCircle className="h-4 w-4" />,
  },
  {
    category: "decision",
    title: "Decision or unresolved thought",
    prompt:
      "Did you make a decision, change your mind, notice a trade-off, or leave an important question unresolved?",
    placeholder:
      "Example: I decided to… because… I am still unsure about…",
    icon: <Lightbulb className="h-4 w-4" />,
  },
  {
    category: "personal",
    title: "Personal context HSAKAA missed",
    prompt:
      "Anything meaningful about the day that apps and integrations simply could not know?",
    placeholder:
      "Example: A quiet moment, something funny, a frustration, a small win, or something I want future-me to remember.",
    icon: <Heart className="h-4 w-4" />,
  },
];

type PointerDraft = {
  note: string;
  privacy: "private_only" | "public_safe";
};

type PointerDrafts = Record<DailyJournalPointerCategory, PointerDraft>;

function emptyPointerDrafts(): PointerDrafts {
  return {
    work: { note: "", privacy: "private_only" },
    offline_reading: { note: "", privacy: "private_only" },
    conversation: { note: "", privacy: "private_only" },
    decision: { note: "", privacy: "private_only" },
    personal: { note: "", privacy: "private_only" },
  };
}

function pointerDraftsFromContext(items: DailyContextItem[]): PointerDrafts {
  const drafts = emptyPointerDrafts();
  for (const item of items) {
    if (item.source !== "owner") continue;
    const category = item.metadata?.category;
    if (
      category !== "work" &&
      category !== "offline_reading" &&
      category !== "conversation" &&
      category !== "decision" &&
      category !== "personal"
    ) {
      continue;
    }
    drafts[category] = {
      note: item.summary ?? "",
      privacy: item.privacy === "public_safe" ? "public_safe" : "private_only",
    };
  }
  return drafts;
}

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
  const [pointerDrafts, setPointerDrafts] = useState<PointerDrafts>(() =>
    pointerDraftsFromContext(initialWorkspace.context.items),
  );

  const context = workspace.context;
  const publicSafeCount = context.privacyCounts.public_safe ?? 0;
  const needsReviewCount = context.privacyCounts.needs_review ?? 0;
  const publicStale = workspace.publicJournal?.metadata?.publicDraftStale === true;
  const bothPublished =
    workspace.journal?.isPublished === true &&
    workspace.publicJournal?.isPublished === true;

  useEffect(() => {
    setPointerDrafts(pointerDraftsFromContext(context.items));
  }, [context.items]);

  const grouped = useMemo(() => {
    const groups = new Map<string, DailyContextItem[]>();
    for (const item of context.items) {
      if (item.source === "owner") continue;
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

  async function savePointersAndRebuild() {
    setBusy("pointers");
    setError("");
    try {
      const existingCategories = new Set(
        context.items
          .filter((item) => item.source === "owner")
          .map((item) => item.metadata?.category)
          .filter((value): value is DailyJournalPointerCategory =>
            value === "work" ||
            value === "offline_reading" ||
            value === "conversation" ||
            value === "decision" ||
            value === "personal",
          ),
      );

      for (const pointer of POINTERS) {
        const draft = pointerDrafts[pointer.category];
        const note = draft.note.trim();
        if (note) {
          await upsertDailyJournalPointer({
            dateKey: context.dateKey,
            category: pointer.category,
            note,
            privacy: draft.privacy,
          });
        } else if (existingCategories.has(pointer.category)) {
          await removeDailyJournalPointer(context.dateKey, pointer.category);
        }
      }

      await generateDailyJournal(context.dateKey, true);
      await reload();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Unable to save journal pointers.");
    } finally {
      setBusy("");
    }
  }

  async function changeDate(nextDate: string) {
    if (!nextDate) return;
    window.location.href = `/admin/journal/daily?date=${encodeURIComponent(nextDate)}`;
  }

  const pairBlockedReason = !workspace.journal
    ? "Prepare the private draft first."
    : !workspace.publicJournal
      ? "A public-safe draft is required. Mark at least one source Public safe, then regenerate."
      : needsReviewCount > 0
        ? "Resolve every Needs review privacy item first."
        : publicStale
          ? "The public draft is stale. Regenerate it first."
          : null;

  return (
    <div className="space-y-6">
      <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#C6FF32]">
              <ShieldCheck className="h-4 w-4" /> Previous-day review
            </div>
            <h2 className="mt-2 text-2xl font-black text-white">{context.dateKey}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">
              HSAKAA prepares this day from Personal OS activity. Add anything integrations could not see, then review privacy before giving the single final publishing permission.
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
              <RefreshCw className="h-4 w-4" /> Refresh captured activity
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

      <section className="rounded-[24px] border border-[#C6FF32]/20 bg-[#C6FF32]/[0.035] p-5 sm:p-6">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#C6FF32]">
          <Sparkles className="h-4 w-4" /> What might HSAKAA have missed?
        </div>
        <h2 className="mt-2 text-xl font-black text-white">Add the parts of yesterday that software cannot reliably know</h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">
          These are optional. Leave a field blank when there is nothing to add. Each note stays private unless you explicitly choose Public safe.
        </p>

        <div className="mt-5 grid gap-4 xl:grid-cols-2">
          {POINTERS.map((pointer) => {
            const draft = pointerDrafts[pointer.category];
            return (
              <div key={pointer.category} className="rounded-2xl border border-white/10 bg-black/20 p-4">
                <div className="flex items-center gap-2 text-sm font-black text-white">
                  <span className="text-[#C6FF32]">{pointer.icon}</span>
                  {pointer.title}
                </div>
                <p className="mt-2 text-sm leading-6 text-white/45">{pointer.prompt}</p>
                <textarea
                  value={draft.note}
                  onChange={(event) =>
                    setPointerDrafts((current) => ({
                      ...current,
                      [pointer.category]: {
                        ...current[pointer.category],
                        note: event.target.value,
                      },
                    }))
                  }
                  placeholder={pointer.placeholder}
                  rows={4}
                  className="mt-3 w-full rounded-xl border border-white/10 bg-[#070b0d] px-3 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/20 focus:border-[#C6FF32]/40"
                />
                <div className="mt-3 flex items-center justify-between gap-3">
                  <span className="text-xs text-white/35">Use this note in:</span>
                  <select
                    value={draft.privacy}
                    onChange={(event) =>
                      setPointerDrafts((current) => ({
                        ...current,
                        [pointer.category]: {
                          ...current[pointer.category],
                          privacy: event.target.value as "private_only" | "public_safe",
                        },
                      }))
                    }
                    className="min-h-9 rounded-lg border border-white/10 bg-[#070b0d] px-2 text-xs font-bold text-white"
                  >
                    <option value="private_only">Private copy only</option>
                    <option value="public_safe">Private + public-safe copy</option>
                  </select>
                </div>
              </div>
            );
          })}
        </div>

        <button
          type="button"
          onClick={() => void savePointersAndRebuild()}
          disabled={Boolean(busy)}
          className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-xl bg-[#C6FF32] px-4 text-sm font-black text-[#030608] disabled:opacity-50"
        >
          <RefreshCw className="h-4 w-4" />
          {busy === "pointers" ? "Saving and rebuilding…" : "Save additions & rebuild both drafts"}
        </button>
      </section>

      <section className="grid gap-4 xl:grid-cols-2">
        <JournalDraftCard
          title="Private full journal"
          icon={<LockKeyhole className="h-4 w-4" />}
          journal={workspace.journal}
          busy={busy}
          emptyActionLabel="Prepare both drafts"
          onEmptyAction={() => run("generate", () => generateDailyJournal(context.dateKey))}
          secondaryLabel="Regenerate private + public"
          onSecondary={() => run("regenerate", () => generateDailyJournal(context.dateKey, true))}
        />
        <JournalDraftCard
          title="Public-safe journal"
          icon={<Globe2 className="h-4 w-4" />}
          journal={workspace.publicJournal}
          busy={busy}
          stale={publicStale}
          emptyActionLabel="Generate public-safe draft"
          onEmptyAction={() => run("regenerate-public", () => regeneratePublicDailyJournal(context.dateKey))}
          secondaryLabel="Regenerate public draft"
          onSecondary={() => run("regenerate-public", () => regeneratePublicDailyJournal(context.dateKey))}
        />
      </section>

      <section className={`rounded-[24px] border p-5 sm:p-6 ${bothPublished ? "border-[#C6FF32]/30 bg-[#C6FF32]/[0.05]" : "border-white/10 bg-white/[0.025]"}`}>
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#C6FF32]">
          <Check className="h-4 w-4" /> Final owner permission
        </div>
        <h2 className="mt-2 text-xl font-black text-white">
          {bothPublished ? "Both journal copies are published" : "Approve & publish both copies with one click"}
        </h2>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">
          Your click is the approval. The private copy becomes the final owner-only journal inside Personal OS. The public copy is published to the public journal and can use only sources you explicitly classified Public safe.
        </p>
        {pairBlockedReason && !bothPublished ? (
          <p className="mt-3 text-sm font-bold text-amber-300">{pairBlockedReason}</p>
        ) : null}
        {!bothPublished ? (
          <button
            type="button"
            onClick={() => run("publish-pair", () => approveAndPublishDailyJournalPair(context.dateKey))}
            disabled={Boolean(busy) || Boolean(pairBlockedReason)}
            className="mt-5 inline-flex min-h-12 items-center gap-2 rounded-xl bg-[#C6FF32] px-5 text-sm font-black text-[#030608] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Check className="h-4 w-4" />
            {busy === "publish-pair" ? "Publishing…" : "Approve & publish private + public"}
          </button>
        ) : (
          <div className="mt-4 inline-flex rounded-full border border-[#C6FF32]/25 bg-[#C6FF32]/10 px-3 py-1.5 text-sm font-black text-[#C6FF32]">
            Published for {context.dateKey}
          </div>
        )}
      </section>

      <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5 sm:p-6">
        <div className="flex items-center gap-2 text-xs font-black uppercase tracking-[0.18em] text-[#C6FF32]">
          <ShieldCheck className="h-4 w-4" /> Source review
        </div>
        <p className="mt-2 text-sm leading-6 text-white/55">
          Private synthesis can use the complete factual day. Public generation can use only Public safe items. Changing privacy invalidates an older public draft until it is regenerated.
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
  emptyActionLabel,
  onEmptyAction,
  secondaryLabel,
  onSecondary,
}: {
  title: string;
  icon: React.ReactNode;
  journal: DailyJournalDraft | null;
  busy: string;
  stale?: boolean;
  emptyActionLabel: string;
  onEmptyAction: () => void;
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
              {journal.isPublished ? "published" : approved ? "approved" : "waiting for your approval"}
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
              Read full draft
            </Link>
            {!journal.isPublished ? (
              <button
                type="button"
                onClick={onSecondary}
                disabled={Boolean(busy)}
                className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-sm font-bold text-white/70 disabled:opacity-50"
              >
                <RefreshCw className="h-4 w-4" /> {secondaryLabel}
              </button>
            ) : null}
          </div>
        </>
      ) : (
        <div className="mt-3">
          <p className="text-sm leading-6 text-white/50">No draft exists for this day yet.</p>
          <button
            type="button"
            onClick={onEmptyAction}
            disabled={Boolean(busy)}
            className="mt-4 inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#C6FF32] px-3 text-sm font-black text-[#030608] disabled:opacity-50"
          >
            <Sparkles className="h-4 w-4" /> {emptyActionLabel}
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
