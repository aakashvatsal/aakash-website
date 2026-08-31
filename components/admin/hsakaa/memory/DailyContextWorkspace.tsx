"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  Check,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Sparkles,
} from "lucide-react";

import {
  approveDailyJournal,
  approvePublicDailyJournal,
  generateDailyJournal,
  getDailyContextWorkspace,
  refreshDailyContext,
  updateDailyJournalDraft,
  type DailyContextWorkspace as Workspace,
  type DailyJournalDraft,
} from "@/lib/api/daily-context";

function todayInIndia() {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const value = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${value.year}-${value.month}-${value.day}`;
}

export function DailyContextWorkspace() {
  const [dateKey, setDateKey] = useState(todayInIndia);
  const [workspace, setWorkspace] = useState<Workspace | null>(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [showTimeline, setShowTimeline] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ title: "", content: "", highlight: "" });

  const journal = workspace?.journal ?? null;
  const publicJournal = workspace?.publicJournal ?? null;
  const approvalStatus = journal?.metadata?.approvalStatus;
  const publicApprovalStatus = publicJournal?.metadata?.approvalStatus;
  const pendingApproval = approvalStatus === "pending_approval";

  useEffect(() => {
    let active = true;
    setLoading(true);
    setError("");
    getDailyContextWorkspace(dateKey)
      .then((data) => {
        if (!active) return;
        setWorkspace(data);
        seedDraft(data.journal, setDraft);
      })
      .catch((reason: unknown) => {
        if (active) setError(reason instanceof Error ? reason.message : "Unable to load daily context.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [dateKey]);

  const privacySummary = useMemo(
    () => Object.entries(workspace?.context.privacyCounts ?? {}),
    [workspace],
  );

  async function run(label: string, action: () => Promise<void>) {
    setBusy(label);
    setError("");
    try {
      await action();
    } catch (reason) {
      setError(reason instanceof Error ? reason.message : "Action failed.");
    } finally {
      setBusy("");
    }
  }

  async function reload() {
    const data = await getDailyContextWorkspace(dateKey);
    setWorkspace(data);
    seedDraft(data.journal, setDraft);
  }

  return (
    <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5 md:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#C6FF32]">Daily Context</p>
          <h2 className="mt-2 text-xl font-black text-white">Your day, captured before HSAKAA writes it</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/55">
            The snapshot is deterministic. At 00:10 IST HSAKAA automatically writes yesterday&apos;s private journal as a draft; you only need to approve it.
          </p>
        </div>
        <input
          type="date"
          value={dateKey}
          onChange={(event) => setDateKey(event.target.value)}
          className="min-h-11 rounded-xl border border-white/10 bg-[#070b0d] px-3 text-sm text-white outline-none focus:border-[#C6FF32]/60"
        />
      </div>

      {error ? <div className="mt-4 rounded-xl border border-red-400/20 bg-red-400/5 p-3 text-sm text-red-200">{error}</div> : null}

      {loading ? (
        <div className="mt-6 text-sm text-white/50">Loading daily context…</div>
      ) : workspace ? (
        <div className="mt-6 space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Stat label="Captured events" value={workspace.context.items.length} />
            <Stat label="Significant changes" value={workspace.context.changes.length} />
            <Stat label="Snapshot version" value={workspace.context.version} />
            <Stat label="Journal" value={approvalStatus === "approved" ? "Approved" : journal ? "Needs approval" : "Not generated"} />
          </div>

          <div className="flex flex-wrap gap-2">
            {Object.entries(workspace.context.sourceCounts).map(([key, count]) => (
              <Badge key={key} text={`${key.replaceAll("_", " ")} · ${count}`} />
            ))}
            {privacySummary.map(([key, count]) => (
              <Badge key={key} text={`${key.replaceAll("_", " ")} · ${count}`} subtle />
            ))}
          </div>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => run("refresh", async () => { await refreshDailyContext(dateKey); await reload(); })}
              disabled={Boolean(busy)}
              className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 px-3 text-sm font-bold text-white/75 hover:border-white/20"
            >
              <RefreshCw className="h-4 w-4" /> Refresh snapshot
            </button>
            {!journal ? (
              <button
                onClick={() => run("generate", async () => { const data = await generateDailyJournal(dateKey); setWorkspace({ context: data.context, journal: data.journal, publicJournal: data.publicJournal }); seedDraft(data.journal, setDraft); })}
                disabled={Boolean(busy)}
                className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#C6FF32] px-3 text-sm font-black text-[#030608]"
              >
                <Sparkles className="h-4 w-4" /> Generate journal now
              </button>
            ) : null}
          </div>

          {workspace.context.changes.length ? (
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <h3 className="text-sm font-black text-white">What changed</h3>
              <div className="mt-3 space-y-3">
                {workspace.context.changes.slice(0, 8).map((item) => (
                  <ContextRow key={item.id} item={item} />
                ))}
              </div>
            </div>
          ) : null}

          {journal ? (
            <div className={`rounded-2xl border p-5 ${pendingApproval ? "border-[#C6FF32]/30 bg-[#C6FF32]/[0.035]" : "border-white/10 bg-black/20"}`}>
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-black text-white">{journal.title}</h3>
                    <Badge text={approvalStatus === "approved" ? "Approved" : "Awaiting approval"} />
                    <Badge text="Private" subtle />
                  </div>
                  {journal.highlight ? <p className="mt-2 text-sm text-white/65">{journal.highlight}</p> : null}
                </div>
                <Link href={`/admin/journal/${journal._id}`} className="text-sm font-bold text-[#C6FF32] hover:underline">Open journal</Link>
              </div>

              {editing && pendingApproval ? (
                <div className="mt-5 space-y-3">
                  <input value={draft.title} onChange={(e) => setDraft((current) => ({ ...current, title: e.target.value }))} className="w-full rounded-xl border border-white/10 bg-[#070b0d] px-3 py-2 text-sm text-white" />
                  <input value={draft.highlight} onChange={(e) => setDraft((current) => ({ ...current, highlight: e.target.value }))} className="w-full rounded-xl border border-white/10 bg-[#070b0d] px-3 py-2 text-sm text-white" placeholder="Highlight" />
                  <textarea value={draft.content} onChange={(e) => setDraft((current) => ({ ...current, content: e.target.value }))} rows={12} className="w-full rounded-xl border border-white/10 bg-[#070b0d] px-3 py-2 text-sm leading-6 text-white" />
                  <button onClick={() => run("save", async () => { const updated = await updateDailyJournalDraft(journal._id, draft); setWorkspace((current) => current ? { ...current, journal: updated } : current); setEditing(false); })} className="rounded-xl border border-white/10 px-4 py-2 text-sm font-black text-white">Save draft</button>
                </div>
              ) : (
                <div className="mt-5 whitespace-pre-wrap text-sm leading-7 text-white/70">{journal.content}</div>
              )}

              {pendingApproval ? (
                <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-4">
                  <button
                    onClick={() => run("approve", async () => { const approved = await approveDailyJournal(journal._id); setWorkspace((current) => current ? { ...current, journal: approved } : current); setEditing(false); })}
                    disabled={Boolean(busy)}
                    className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#C6FF32] px-4 text-sm font-black text-[#030608]"
                  >
                    <Check className="h-4 w-4" /> Approve journal
                  </button>
                  <button onClick={() => setEditing((value) => !value)} className="min-h-10 rounded-xl border border-white/10 px-4 text-sm font-bold text-white/75">{editing ? "Cancel edit" : "Edit before approval"}</button>
                  <button
                    onClick={() => run("regenerate", async () => { const data = await generateDailyJournal(dateKey, true); setWorkspace({ context: data.context, journal: data.journal, publicJournal: data.publicJournal }); seedDraft(data.journal, setDraft); setEditing(false); })}
                    disabled={Boolean(busy)}
                    className="inline-flex min-h-10 items-center gap-2 rounded-xl border border-white/10 px-4 text-sm font-bold text-white/75"
                  >
                    <RefreshCw className="h-4 w-4" /> Regenerate
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}

          {publicJournal ? (
            <div className="rounded-2xl border border-cyan-400/20 bg-cyan-400/[0.035] p-5">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-black text-white">{publicJournal.title}</h3>
                    <Badge text={publicApprovalStatus === "approved" ? "Approved" : "Awaiting approval"} />
                    <Badge text="Public-safe draft" subtle />
                  </div>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-white/60">
                    {publicJournal.highlight || "Generated separately from public-safe Daily Context only. Private context was never sent to this generation."}
                  </p>
                </div>
                <Link href={`/admin/journal/${publicJournal._id}`} className="text-sm font-bold text-[#C6FF32] hover:underline">Open public draft</Link>
              </div>
              {publicApprovalStatus === "pending_approval" ? (
                <div className="mt-4 border-t border-white/10 pt-4">
                  <button
                    onClick={() => run("approve-public", async () => { const approved = await approvePublicDailyJournal(publicJournal._id); setWorkspace((current) => current ? { ...current, publicJournal: approved } : current); })}
                    disabled={Boolean(busy)}
                    className="inline-flex min-h-10 items-center gap-2 rounded-xl bg-[#C6FF32] px-4 text-sm font-black text-[#030608]"
                  >
                    <Check className="h-4 w-4" /> Approve public draft
                  </button>
                </div>
              ) : null}
            </div>
          ) : null}

          <button onClick={() => setShowTimeline((value) => !value)} className="inline-flex items-center gap-2 text-sm font-bold text-white/60">
            {showTimeline ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            {showTimeline ? "Hide" : "Inspect"} captured timeline
          </button>
          {showTimeline ? (
            <div className="space-y-2">
              {workspace.context.items.map((item) => <ContextRow key={item.id} item={item} />)}
            </div>
          ) : null}
        </div>
      ) : null}
    </section>
  );
}

function seedDraft(journal: DailyJournalDraft | null, setter: (value: { title: string; content: string; highlight: string }) => void) {
  setter({ title: journal?.title ?? "", content: journal?.content ?? "", highlight: journal?.highlight ?? "" });
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-2xl border border-white/10 bg-black/20 p-4"><p className="text-xs font-bold uppercase tracking-[0.16em] text-white/35">{label}</p><p className="mt-2 text-xl font-black text-white">{value}</p></div>;
}

function Badge({ text, subtle = false }: { text: string; subtle?: boolean }) {
  return <span className={`rounded-full border px-2.5 py-1 text-[11px] font-bold capitalize ${subtle ? "border-white/10 text-white/45" : "border-[#C6FF32]/20 text-[#C6FF32]"}`}>{text}</span>;
}

function ContextRow({ item }: { item: Workspace["context"]["items"][number] }) {
  return (
    <div className="rounded-xl border border-white/[0.07] bg-black/20 p-3">
      <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-white/35">
        <span>{item.source.replaceAll("_", " ")}</span><span>·</span><span>{item.privacy.replaceAll("_", " ")}</span>
      </div>
      <p className="mt-1 text-sm font-bold text-white/85">{item.title}</p>
      {item.summary ? <p className="mt-1 line-clamp-3 text-xs leading-5 text-white/50">{item.summary}</p> : null}
    </div>
  );
}
