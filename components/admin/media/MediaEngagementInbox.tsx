"use client";

import { useMemo, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Archive,
  CheckCircle2,
  ExternalLink,
  MessageCircle,
  RefreshCw,
  Send,
  Sparkles,
} from "lucide-react";

import {
  draftMediaEngagementReply,
  sendMediaEngagementReply,
  syncMediaEngagement,
  updateMediaEngagementStatus,
} from "@/lib/api/media";
import type {
  MediaEngagementItem,
  MediaEngagementOverview,
  MediaEngagementPriority,
  MediaEngagementStatus,
  MediaPlatform,
} from "@/types/media";

interface Props {
  initialOverview: MediaEngagementOverview;
  initialItems: MediaEngagementItem[];
}

const platformLabels: Record<MediaPlatform, string> = {
  linkedin: "LinkedIn",
  instagram: "Instagram",
  youtube: "YouTube",
  x: "X",
  facebook: "Facebook",
  threads: "Threads",
  whatsapp: "WhatsApp",
};

const priorityOrder: Record<MediaEngagementPriority, number> = {
  urgent: 4,
  high: 3,
  normal: 2,
  low: 1,
};

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
      <div className="text-xs font-semibold uppercase tracking-[0.16em] text-white/35">{label}</div>
      <div className="mt-3 text-2xl font-black text-white">{value}</div>
    </div>
  );
}

function priorityClass(priority: MediaEngagementPriority) {
  if (priority === "urgent") return "bg-red-500/10 text-red-300";
  if (priority === "high") return "bg-amber-500/10 text-amber-200";
  if (priority === "low") return "bg-white/5 text-white/40";
  return "bg-[#C6FF32]/10 text-[#C6FF32]";
}

export function MediaEngagementInbox({ initialOverview, initialItems }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [items, setItems] = useState(initialItems);
  const [platform, setPlatform] = useState<"all" | MediaPlatform>("all");
  const [status, setStatus] = useState<"actionable" | "all" | MediaEngagementStatus>("actionable");
  const [search, setSearch] = useState("");
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>(() =>
    Object.fromEntries(initialItems.map((item) => [item._id, item.suggestedReply ?? ""])),
  );
  const [message, setMessage] = useState<string>();
  const [error, setError] = useState<string>();

  const visibleItems = useMemo(() => {
    const query = search.trim().toLowerCase();
    return [...items]
      .filter((item) => platform === "all" || item.platform === platform)
      .filter((item) => {
        if (status === "all") return true;
        if (status === "actionable") {
          return item.needsResponse && !["replied", "ignored", "archived"].includes(item.status);
        }
        return item.status === status;
      })
      .filter((item) => {
        if (!query) return true;
        return [item.text, item.authorDisplayName, item.authorUsername, item.aiSummary, item.intent]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));
      })
      .sort((a, b) => {
        const priorityDelta = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDelta !== 0) return priorityDelta;
        return new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime();
      });
  }, [items, platform, search, status]);

  function run(action: () => Promise<void>) {
    setError(undefined);
    setMessage(undefined);
    startTransition(async () => {
      try {
        await action();
      } catch (caught) {
        setError(caught instanceof Error ? caught.message : "Engagement action failed.");
      }
    });
  }

  function replaceItem(updated: MediaEngagementItem) {
    setItems((current) => current.map((item) => (item._id === updated._id ? updated : item)));
    setReplyDrafts((current) => ({ ...current, [updated._id]: updated.suggestedReply ?? current[updated._id] ?? "" }));
  }

  function sync() {
    run(async () => {
      const result = await syncMediaEngagement(100);
      setMessage(`Synced ${result.attempted} accounts · ${result.failures.length} failures.`);
      router.refresh();
    });
  }

  function draft(item: MediaEngagementItem) {
    run(async () => {
      const updated = await draftMediaEngagementReply(item._id, { force: true });
      replaceItem(updated);
      setMessage("HSAKAA refreshed the suggested reply.");
    });
  }

  function send(item: MediaEngagementItem) {
    const text = replyDrafts[item._id]?.trim();
    if (!text) {
      setError("Reply text is required.");
      return;
    }
    if (!window.confirm(`Send this ${platformLabels[item.platform]} reply now?`)) return;
    run(async () => {
      const updated = await sendMediaEngagementReply(item._id, text);
      replaceItem(updated);
      setMessage("Reply sent and recorded in Personal OS.");
    });
  }

  function setItemStatus(item: MediaEngagementItem, nextStatus: MediaEngagementStatus) {
    run(async () => {
      const updated = await updateMediaEngagementStatus(item._id, nextStatus);
      replaceItem(updated);
      setMessage(`Engagement marked ${nextStatus}.`);
    });
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
        <StatCard label="Needs response" value={initialOverview.needsResponse} />
        <StatCard label="Urgent" value={initialOverview.urgent} />
        <StatCard label="New" value={initialOverview.new} />
        <StatCard label="Open" value={initialOverview.open} />
        <StatCard label="Drafted" value={initialOverview.drafted} />
        <StatCard label="Replied" value={initialOverview.replied} />
      </div>

      <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="font-black text-white">Engagement connections</h2>
            <p className="mt-1 text-sm text-white/45">Read and write credentials are shown separately so read-only platform access can never be mistaken for reply permission.</p>
          </div>
          <button disabled={isPending} onClick={sync} className="rounded-xl bg-[#C6FF32] px-4 py-2 text-sm font-black text-black disabled:opacity-40">
            <RefreshCw className="mr-1.5 inline h-4 w-4" /> Sync inbox
          </button>
        </div>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {initialOverview.accounts
            .filter((account) => ["linkedin", "instagram", "youtube", "x", "whatsapp"].includes(account.platform))
            .map((account) => (
              <div key={account._id} className="rounded-xl border border-white/10 bg-black/20 p-4">
                <div className="font-bold text-white">{platformLabels[account.platform]}</div>
                <div className="mt-1 text-xs text-white/40">{account.displayName}</div>
                <div className="mt-3 space-y-1 text-xs">
                  <div className={account.readCredentialConfigured ? "text-[#C6FF32]" : "text-white/35"}>Read: {account.readCredentialConfigured ? "ready" : "not configured"}</div>
                  <div className={account.writeCredentialConfigured ? "text-[#C6FF32]" : "text-amber-200/70"}>Reply: {account.writeCredentialConfigured ? "ready" : "read-only / unavailable"}</div>
                  <div className="text-white/30">{account.syncMode === "webhook" ? "Webhook" : "Polling + webhook"}</div>
                </div>
              </div>
            ))}
        </div>
      </section>

      {message ? <div className="rounded-xl border border-[#C6FF32]/20 bg-[#C6FF32]/5 px-4 py-3 text-sm text-[#C6FF32]">{message}</div> : null}
      {error ? <div className="rounded-xl border border-red-500/20 bg-red-500/5 px-4 py-3 text-sm text-red-300">{error}</div> : null}

      <div className="grid gap-3 rounded-2xl border border-white/10 bg-white/[0.02] p-4 md:grid-cols-3">
        <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search author, message or intent" className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none" />
        <select value={platform} onChange={(event) => setPlatform(event.target.value as "all" | MediaPlatform)} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none">
          <option value="all">All platforms</option>
          {(["linkedin", "instagram", "youtube", "x", "whatsapp"] as MediaPlatform[]).map((item) => <option key={item} value={item}>{platformLabels[item]}</option>)}
        </select>
        <select value={status} onChange={(event) => setStatus(event.target.value as "actionable" | "all" | MediaEngagementStatus)} className="rounded-xl border border-white/10 bg-black/30 px-3 py-2 text-sm text-white outline-none">
          <option value="actionable">Needs response</option>
          <option value="all">All statuses</option>
          {(["new", "open", "drafted", "failed", "replied", "ignored", "archived"] as MediaEngagementStatus[]).map((item) => <option key={item} value={item}>{item.replaceAll("_", " ")}</option>)}
        </select>
      </div>

      <div className="space-y-3">
        {visibleItems.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 p-10 text-center text-sm text-white/40">No engagement matches this view.</div>
        ) : visibleItems.map((item) => (
          <article key={item._id} className="rounded-2xl border border-white/10 bg-white/[0.02] p-5">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-white/40">
                  <span>{platformLabels[item.platform]}</span>
                  <span>·</span>
                  <span>{item.type.replaceAll("_", " ")}</span>
                  <span>·</span>
                  <span className={`rounded-full px-2 py-0.5 ${priorityClass(item.priority)}`}>{item.priority}</span>
                  <span>·</span>
                  <span>{item.intent}</span>
                </div>
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <div className="font-bold text-white">{item.authorDisplayName || item.authorUsername || item.platformAuthorId || "Unknown author"}</div>
                  {item.authorUsername ? <span className="text-xs text-white/35">@{item.authorUsername}</span> : null}
                  <span className="text-xs text-white/30">{new Date(item.receivedAt).toLocaleString("en-IN")}</span>
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-white/75">{item.text}</p>
                {item.aiSummary ? <p className="mt-3 rounded-xl bg-white/[0.035] p-3 text-xs leading-5 text-white/50"><Sparkles className="mr-1.5 inline h-3.5 w-3.5 text-[#C6FF32]" />{item.aiSummary}</p> : null}
                {item.replyRestriction ? <p className="mt-2 text-xs text-amber-200/60">{item.replyRestriction}</p> : null}
              </div>
              <div className="flex flex-wrap gap-2">
                {item.permalink ? <Link href={item.permalink} target="_blank" className="rounded-lg border border-white/10 px-2.5 py-1.5 text-xs font-bold text-white/55"><ExternalLink className="mr-1 inline h-3.5 w-3.5" />Open</Link> : null}
                {item.status !== "ignored" && item.status !== "archived" && item.status !== "replied" ? <button disabled={isPending} onClick={() => setItemStatus(item, "ignored")} className="rounded-lg border border-white/10 px-2.5 py-1.5 text-xs font-bold text-white/45">Ignore</button> : null}
                {item.status !== "archived" ? <button disabled={isPending} onClick={() => setItemStatus(item, "archived")} className="rounded-lg border border-white/10 px-2.5 py-1.5 text-xs font-bold text-white/45"><Archive className="mr-1 inline h-3.5 w-3.5" />Archive</button> : null}
              </div>
            </div>

            {item.status === "replied" ? (
              <div className="mt-4 rounded-xl border border-[#C6FF32]/15 bg-[#C6FF32]/5 p-3 text-sm text-white/60">
                <CheckCircle2 className="mr-1.5 inline h-4 w-4 text-[#C6FF32]" /> Replied{item.replyText ? `: ${item.replyText}` : ""}
              </div>
            ) : item.needsResponse ? (
              <div className="mt-5 border-t border-white/10 pt-4">
                <textarea value={replyDrafts[item._id] ?? ""} onChange={(event) => setReplyDrafts((current) => ({ ...current, [item._id]: event.target.value }))} placeholder="HSAKAA reply draft" className="min-h-24 w-full rounded-xl border border-white/10 bg-black/30 px-3 py-3 text-sm leading-6 text-white outline-none" />
                <div className="mt-3 flex flex-wrap gap-2">
                  <button disabled={isPending} onClick={() => draft(item)} className="rounded-xl border border-[#C6FF32]/25 px-3 py-2 text-xs font-bold text-[#C6FF32] disabled:opacity-40"><Sparkles className="mr-1.5 inline h-3.5 w-3.5" />Draft with HSAKAA</button>
                  <button disabled={isPending || !item.canReply} onClick={() => send(item)} className="rounded-xl bg-[#C6FF32] px-3 py-2 text-xs font-black text-black disabled:cursor-not-allowed disabled:opacity-35"><Send className="mr-1.5 inline h-3.5 w-3.5" />Send reply</button>
                  {!item.canReply ? <span className="self-center text-xs text-white/35">Automatic reply unavailable; handle manually on platform.</span> : null}
                </div>
              </div>
            ) : null}
          </article>
        ))}
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 text-sm text-white/45">
        <MessageCircle className="mr-2 inline h-4 w-4 text-[#C6FF32]" /> HSAKAA can triage and draft automatically, but sending remains approval-controlled. You can also ask HSAKAA in Chat to find a specific engagement and propose an exact reply.
      </div>
    </div>
  );
}
