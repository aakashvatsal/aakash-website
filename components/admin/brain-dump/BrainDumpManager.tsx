"use client";

import { useMemo, useState } from "react";
import { Archive, Brain, Check, Heart, Plus, RotateCcw, Trash2, X } from "lucide-react";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminStatCard } from "@/components/admin/AdminStatCard";
import { archiveBrainDump, createBrainDump, deleteBrainDump, discardBrainDump, processBrainDump, reopenBrainDump, updateBrainDump } from "@/lib/api/personal-os";
import type { BrainDumpItem, BrainDumpStatus, BrainDumpSummary, BrainDumpTarget } from "@/types/personal-os";

type Props = { initialItems: BrainDumpItem[]; initialSummary: BrainDumpSummary };
const inputClass = "min-h-11 w-full rounded-[14px] border border-white/10 bg-[#080b0d] px-3 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-[#C6FF32]/50";

function age(value: string) {
  const minutes = Math.max(0, Math.floor((Date.now() - new Date(value).getTime()) / 60_000));
  if (minutes < 60) return `${minutes || 1}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export function BrainDumpManager({ initialItems, initialSummary }: Props) {
  const [items, setItems] = useState(initialItems);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState("");
  const [filter, setFilter] = useState<BrainDumpStatus | "all">("inbox");
  const [processing, setProcessing] = useState<{ id: string; target: BrainDumpTarget; title: string; priority: "low" | "medium" | "high" | "urgent"; area: string; dueAt: string } | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState("");

  const visible = useMemo(() => filter === "all" ? items : items.filter((item) => item.status === filter), [filter, items]);
  const inboxCount = items.filter((item) => item.status === "inbox").length;

  async function capture() {
    if (!content.trim()) { setError("Write the thought first."); return; }
    try {
      setBusyId("capture"); setError("");
      const created = await createBrainDump({ content: content.trim(), title: title.trim() || undefined, tags: tags.split(",").map((item) => item.trim()).filter(Boolean) });
      setItems((current) => [created, ...current]);
      setContent(""); setTitle(""); setTags(""); setFilter("inbox");
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to capture thought."); }
    finally { setBusyId(null); }
  }

  async function toggleFavourite(item: BrainDumpItem) {
    try {
      setBusyId(item._id); setError("");
      const updated = await updateBrainDump(item._id, { isFavourite: !item.isFavourite });
      setItems((current) => current.map((entry) => entry._id === updated._id ? updated : entry));
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to update favourite."); }
    finally { setBusyId(null); }
  }

  async function process() {
    if (!processing) return;
    try {
      setBusyId(processing.id); setError("");
      const result = await processBrainDump(processing.id, {
        target: processing.target,
        title: processing.title.trim() || undefined,
        ...(processing.target === "task" ? {
          priority: processing.priority,
          area: processing.area.trim() || undefined,
          dueAt: processing.dueAt ? new Date(processing.dueAt).toISOString() : undefined,
        } : {}),
      });
      setItems((current) => current.map((entry) => entry._id === result.brainDump._id ? result.brainDump : entry));
      setProcessing(null);
    } catch (caught) { setError(caught instanceof Error ? caught.message : "Unable to process capture."); }
    finally { setBusyId(null); }
  }

  async function run(item: BrainDumpItem, action: "discard" | "reopen" | "archive" | "delete") {
    try {
      setBusyId(item._id); setError("");
      if (action === "delete") {
        await deleteBrainDump(item._id);
        setItems((current) => current.filter((entry) => entry._id !== item._id));
        return;
      }
      const updated = action === "discard" ? await discardBrainDump(item._id) : action === "reopen" ? await reopenBrainDump(item._id) : await archiveBrainDump(item._id);
      if (action === "archive") setItems((current) => current.filter((entry) => entry._id !== item._id));
      else setItems((current) => current.map((entry) => entry._id === updated._id ? updated : entry));
    } catch (caught) { setError(caught instanceof Error ? caught.message : `Unable to ${action} capture.`); }
    finally { setBusyId(null); }
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <AdminStatCard label="Inbox" value={inboxCount} description="Unprocessed captures" icon={Brain} />
        <AdminStatCard label="Captured today" value={initialSummary.capturedToday} description="New thoughts today" icon={Plus} />
        <AdminStatCard label="Processed today" value={initialSummary.processedToday} description="Converted into the OS" icon={Check} />
        <AdminStatCard label="Discarded today" value={initialSummary.discardedToday} description="Consciously dropped" icon={X} />
        <AdminStatCard label="Favourite inbox" value={items.filter((item) => item.status === "inbox" && item.isFavourite).length} description="Worth revisiting first" icon={Heart} />
      </section>

      <section className="rounded-[26px] border border-[#C6FF32]/20 bg-[#C6FF32]/[0.035] p-5 sm:p-6">
        <p className="text-xs font-black uppercase tracking-[0.25em] text-[#C6FF32]">Capture first. Organise later.</p>
        <textarea value={content} onChange={(event) => setContent(event.target.value)} placeholder="What is on your mind?" className={`${inputClass} mt-4 min-h-32 py-3 text-base`} />
        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_1fr_auto]">
          <input value={title} onChange={(event) => setTitle(event.target.value)} placeholder="Optional title" className={inputClass} />
          <input value={tags} onChange={(event) => setTags(event.target.value)} placeholder="Tags, comma separated" className={inputClass} />
          <button type="button" disabled={busyId === "capture"} onClick={capture} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] bg-[#C6FF32] px-5 text-sm font-black text-[#030608]"><Plus className="h-4 w-4" /> {busyId === "capture" ? "Capturing…" : "Capture"}</button>
        </div>
      </section>

      {error && <div className="rounded-[18px] border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">{error}</div>}

      <div className="flex flex-wrap gap-2">{(["inbox", "processed", "discarded", "all"] as const).map((item) => <button key={item} type="button" onClick={() => setFilter(item)} className={`rounded-full px-3 py-2 text-xs font-black ${filter === item ? "bg-[#C6FF32] text-[#030608]" : "bg-white/5 text-white/45"}`}>{item.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase())}</button>)}</div>

      {visible.length === 0 ? <AdminEmptyState icon={Brain} title="Brain Dump is clear" description="Capture anything unfinished, interesting, distracting or worth remembering." /> : <div className="space-y-3">{visible.map((item) => (
        <article key={item._id} className="rounded-[22px] border border-white/10 bg-white/[0.025] p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2 text-xs text-white/30"><span>{age(item.createdAt)}</span><span>·</span><span>{item.source}</span>{item.processedAs && <span className="rounded-full bg-[#C6FF32]/10 px-2 py-1 font-black text-[#C6FF32]">→ {item.processedAs}</span>}</div>
              {item.title && <h3 className="mt-3 text-lg font-black">{item.title}</h3>}
              <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-white/55">{item.content}</p>
              {item.tags.length > 0 && <div className="mt-3 flex flex-wrap gap-2">{item.tags.map((tag) => <span key={tag} className="text-xs text-white/30">#{tag}</span>)}</div>}
            </div>
            <div className="flex flex-wrap gap-2">
              <button type="button" disabled={busyId === item._id} onClick={() => toggleFavourite(item)} title="Favourite" className={`rounded-[12px] border p-2.5 ${item.isFavourite ? "border-[#C6FF32]/30 bg-[#C6FF32]/10 text-[#C6FF32]" : "border-white/10 text-white/40"}`}><Heart className="h-4 w-4" /></button>
              {item.status === "inbox" && <>
                <button type="button" onClick={() => setProcessing({ id: item._id, target: "task", title: item.title ?? "", priority: "medium", area: "", dueAt: "" })} className="rounded-[12px] bg-[#C6FF32] px-3 py-2 text-xs font-black text-[#030608]">Process</button>
                <button type="button" disabled={busyId === item._id} onClick={() => run(item, "discard")} className="rounded-[12px] border border-white/10 px-3 py-2 text-xs font-bold text-white/50">Discard</button>
              </>}
              {item.status === "discarded" && <button type="button" disabled={busyId === item._id} onClick={() => run(item, "reopen")} className="rounded-[12px] border border-white/10 p-2.5 text-white/45"><RotateCcw className="h-4 w-4" /></button>}
              <button type="button" disabled={busyId === item._id} onClick={() => run(item, "archive")} className="rounded-[12px] border border-white/10 p-2.5 text-white/45"><Archive className="h-4 w-4" /></button>
              <button type="button" disabled={busyId === item._id} onClick={() => { if (window.confirm("Delete this capture permanently?")) run(item, "delete"); }} className="rounded-[12px] border border-red-400/15 p-2.5 text-red-300/70"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        </article>
      ))}</div>}

      {processing && <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 p-4"><div className="w-full max-w-xl rounded-[26px] border border-white/10 bg-[#080b0d] p-6 shadow-2xl"><div className="flex items-start justify-between"><div><p className="text-xs font-black uppercase tracking-[0.22em] text-[#C6FF32]">Process capture</p><h2 className="mt-2 text-2xl font-black">Turn it into something useful</h2></div><button onClick={() => setProcessing(null)} className="p-2 text-white/40"><X className="h-5 w-5" /></button></div><div className="mt-5 space-y-4"><select value={processing.target} onChange={(event) => setProcessing((current) => current ? { ...current, target: event.target.value as BrainDumpTarget } : current)} className={inputClass}><option value="task">Task</option><option value="journal">Journal</option><option value="memory">Memory</option></select><input value={processing.title} onChange={(event) => setProcessing((current) => current ? { ...current, title: event.target.value } : current)} placeholder="Optional title" className={inputClass} />{processing.target === "task" && <><select value={processing.priority} onChange={(event) => setProcessing((current) => current ? { ...current, priority: event.target.value as typeof processing.priority } : current)} className={inputClass}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option><option value="urgent">Urgent</option></select><input value={processing.area} onChange={(event) => setProcessing((current) => current ? { ...current, area: event.target.value } : current)} placeholder="Area" className={inputClass} /><input type="datetime-local" value={processing.dueAt} onChange={(event) => setProcessing((current) => current ? { ...current, dueAt: event.target.value } : current)} className={inputClass} /></>}</div><div className="mt-6 flex justify-end gap-3"><button onClick={() => setProcessing(null)} className="rounded-[14px] border border-white/10 px-4 py-3 text-sm font-bold text-white/50">Cancel</button><button disabled={busyId === processing.id} onClick={process} className="rounded-[14px] bg-[#C6FF32] px-5 py-3 text-sm font-black text-[#030608]">{busyId === processing.id ? "Processing…" : `Create ${processing.target}`}</button></div></div></div>}
    </div>
  );
}
