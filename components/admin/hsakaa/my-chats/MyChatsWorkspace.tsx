"use client";

import { useEffect, useMemo, useState } from "react";
import {
  Archive,
  Brain,
  LoaderCircle,
  MessageCircle,
  RefreshCcw,
  Upload,
  UserRound,
} from "lucide-react";

import { getMemoryPeople } from "@/lib/api/memory-people";
import type { MemoryPerson } from "@/types/hsakaa";
import {
  archiveMyChat,
  getMyChat,
  getMyChats,
  importMyChat,
  refreshMyChatLearning,
  type MyChatAuthor,
  type MyChatChannel,
  type MyChatMessage,
  type MyChatThread,
} from "@/services/hsakaa.service";

const CHANNELS: Array<{ value: MyChatChannel; label: string }> = [
  { value: "whatsapp", label: "WhatsApp" },
  { value: "instagram", label: "Instagram" },
  { value: "linkedin", label: "LinkedIn" },
  { value: "x", label: "X" },
  { value: "slack", label: "Slack" },
  { value: "sms", label: "SMS" },
  { value: "other", label: "Other" },
];

function parseTranscript(input: string) {
  const messages: Array<{ author: MyChatAuthor; content: string }> = [];
  const lines = input.split(/\r?\n/);

  const classify = (line: string): { author: MyChatAuthor; content: string } | null => {
    const trimmed = line.trim();
    if (!trimmed) return null;

    const owner = trimmed.match(
      /^(?:\[ME\]|ME|M|AAKASH|YOU)\s*[:>-]\s*(.+)$/i,
    );
    if (owner) return { author: "owner", content: owner[1].trim() };

    const person = trimmed.match(
      /^(?:\[THEM\]|THEM|H|HER|HIM|PERSON)\s*[:>-]\s*(.+)$/i,
    );
    if (person) return { author: "person", content: person[1].trim() };

    const generic = trimmed.match(/^([^:]{1,40}):\s*(.+)$/);
    if (generic) {
      return { author: "person", content: generic[2].trim() };
    }

    return { author: messages.at(-1)?.author ?? "person", content: trimmed };
  };

  for (const line of lines) {
    const parsed = classify(line);
    if (!parsed?.content) continue;

    const previous = messages.at(-1);
    const hasExplicitPrefix = /^(?:\[ME\]|ME|M|AAKASH|YOU|\[THEM\]|THEM|H|HER|HIM|PERSON)\s*[:>-]/i.test(
      line.trim(),
    ) || /^[^:]{1,40}:\s*/.test(line.trim());

    if (!hasExplicitPrefix && previous && previous.author === parsed.author) {
      previous.content = `${previous.content}\n${parsed.content}`.trim();
    } else {
      messages.push(parsed);
    }
  }

  return messages.filter((item) => item.content.length > 0);
}

function personName(person: MemoryPerson) {
  return person.preferredName?.trim() || person.name;
}

function linkedPersonName(thread: MyChatThread) {
  if (!thread.personId || typeof thread.personId === "string") return null;
  return thread.personId.preferredName?.trim() || thread.personId.name;
}

export function MyChatsWorkspace() {
  const [people, setPeople] = useState<MemoryPerson[]>([]);
  const [threads, setThreads] = useState<MyChatThread[]>([]);
  const [selected, setSelected] = useState<MyChatThread | null>(null);
  const [messages, setMessages] = useState<MyChatMessage[]>([]);
  const [title, setTitle] = useState("");
  const [personId, setPersonId] = useState("");
  const [channel, setChannel] = useState<MyChatChannel>("whatsapp");
  const [sourceLabel, setSourceLabel] = useState("");
  const [transcript, setTranscript] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const parsedMessages = useMemo(() => parseTranscript(transcript), [transcript]);
  const ownerCount = parsedMessages.filter((item) => item.author === "owner").length;

  async function loadThreads() {
    const result = await getMyChats({ limit: 100 });
    setThreads(result.data);
  }

  useEffect(() => {
    let cancelled = false;
    async function load() {
      setIsLoading(true);
      try {
        const [peopleResult, chatsResult] = await Promise.all([
          getMemoryPeople({ limit: 100, isActive: true, isArchived: false }),
          getMyChats({ limit: 100 }),
        ]);
        if (cancelled) return;
        setPeople(peopleResult.data);
        setThreads(chatsResult.data);
      } catch (loadError) {
        if (!cancelled) {
          setError(loadError instanceof Error ? loadError.message : "Could not load My Chats.");
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }
    void load();
    return () => {
      cancelled = true;
    };
  }, []);

  async function openThread(thread: MyChatThread) {
    setError(null);
    try {
      const detail = await getMyChat(thread._id);
      setSelected(detail.thread);
      setMessages(detail.messages);
    } catch (openError) {
      setError(openError instanceof Error ? openError.message : "Could not open chat.");
    }
  }

  async function handleImport() {
    setError(null);
    setNotice(null);
    if (!title.trim()) {
      setError("Give this chat a title.");
      return;
    }
    if (!parsedMessages.length) {
      setError("Paste at least one message. Use M: for you and H: for the other person.");
      return;
    }
    if (!ownerCount) {
      setError("No Aakash-authored messages were detected. Prefix your messages with M:, ME:, Aakash:, or [ME].");
      return;
    }

    setIsImporting(true);
    try {
      const result = await importMyChat({
        title: title.trim(),
        personId: personId || undefined,
        channel,
        sourceLabel: sourceLabel.trim() || undefined,
        messages: parsedMessages,
      });
      setTitle("");
      setSourceLabel("");
      setTranscript("");
      setNotice(
        `Imported ${result.importedMessages} messages. ${result.ownerMessagesAvailableForLearning} of your messages are now available to communication-style learning.`,
      );
      await loadThreads();
      await openThread(result.thread);
    } catch (importError) {
      setError(importError instanceof Error ? importError.message : "Could not import chat.");
    } finally {
      setIsImporting(false);
    }
  }

  async function handleArchive(thread: MyChatThread) {
    setError(null);
    try {
      await archiveMyChat(thread._id);
      if (selected?._id === thread._id) {
        setSelected(null);
        setMessages([]);
      }
      await loadThreads();
    } catch (archiveError) {
      setError(archiveError instanceof Error ? archiveError.message : "Could not archive chat.");
    }
  }

  async function handleRefreshLearning() {
    setError(null);
    setNotice(null);
    setIsRefreshing(true);
    try {
      const targetPersonId =
        selected?.personId && typeof selected.personId !== "string"
          ? selected.personId._id
          : typeof selected?.personId === "string"
            ? selected.personId
            : undefined;
      await refreshMyChatLearning(targetPersonId);
      setNotice(
        targetPersonId
          ? "Global and person-specific communication fingerprints refreshed."
          : "Global Aakash communication fingerprint refreshed.",
      );
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : "Could not refresh learning.");
    } finally {
      setIsRefreshing(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 lg:grid-cols-3">
        <div className="rounded-[22px] border border-white/10 bg-white/[0.025] p-5">
          <MessageCircle className="h-5 w-5 text-[#C6FF32]" />
          <p className="mt-3 text-sm font-bold text-white">Raw chats stay owner-only</p>
          <p className="mt-1 text-xs leading-5 text-white/45">
            Imported conversations are not exposed to public HSAKAA prompts.
          </p>
        </div>
        <div className="rounded-[22px] border border-white/10 bg-white/[0.025] p-5">
          <Brain className="h-5 w-5 text-[#C6FF32]" />
          <p className="mt-3 text-sm font-bold text-white">Only your messages teach style</p>
          <p className="mt-1 text-xs leading-5 text-white/45">
            Other people&apos;s wording is context, never training material for your voice.
          </p>
        </div>
        <div className="rounded-[22px] border border-white/10 bg-white/[0.025] p-5">
          <UserRound className="h-5 w-5 text-[#C6FF32]" />
          <p className="mt-3 text-sm font-bold text-white">People-aware interaction style</p>
          <p className="mt-1 text-xs leading-5 text-white/45">
            Link a saved Person to learn how your communication naturally changes with them.
          </p>
        </div>
      </div>

      {(error || notice) && (
        <div
          className={`rounded-2xl border px-4 py-3 text-sm ${
            error
              ? "border-red-400/20 bg-red-400/[0.06] text-red-200"
              : "border-[#C6FF32]/20 bg-[#C6FF32]/[0.05] text-[#DFFF8D]"
          }`}
        >
          {error || notice}
        </div>
      )}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <section className="rounded-[28px] border border-white/10 bg-white/[0.025] p-5 sm:p-6">
          <div className="flex items-center gap-3">
            <Upload className="h-5 w-5 text-[#C6FF32]" />
            <div>
              <h2 className="font-black text-white">Import a conversation</h2>
              <p className="text-xs text-white/40">M: = you, H: = the other person. ME:/THEM: also work.</p>
            </div>
          </div>

          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            <label className="space-y-2 text-xs font-bold text-white/50 sm:col-span-2">
              Chat title
              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="e.g. Ria - WhatsApp"
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-medium text-white outline-none focus:border-[#C6FF32]/40"
              />
            </label>

            <label className="space-y-2 text-xs font-bold text-white/50">
              Person
              <select
                value={personId}
                onChange={(event) => setPersonId(event.target.value)}
                className="w-full rounded-2xl border border-white/10 bg-[#080B0D] px-4 py-3 text-sm font-medium text-white outline-none focus:border-[#C6FF32]/40"
              >
                <option value="">Not linked</option>
                {people.map((person) => (
                  <option key={person._id} value={person._id}>
                    {personName(person)}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-xs font-bold text-white/50">
              Channel
              <select
                value={channel}
                onChange={(event) => setChannel(event.target.value as MyChatChannel)}
                className="w-full rounded-2xl border border-white/10 bg-[#080B0D] px-4 py-3 text-sm font-medium text-white outline-none focus:border-[#C6FF32]/40"
              >
                {CHANNELS.map((item) => (
                  <option key={item.value} value={item.value}>
                    {item.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="space-y-2 text-xs font-bold text-white/50 sm:col-span-2">
              Source label (optional)
              <input
                value={sourceLabel}
                onChange={(event) => setSourceLabel(event.target.value)}
                placeholder="Export, manual paste, Hinge chat, etc."
                className="w-full rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm font-medium text-white outline-none focus:border-[#C6FF32]/40"
              />
            </label>

            <label className="space-y-2 text-xs font-bold text-white/50 sm:col-span-2">
              Transcript
              <textarea
                value={transcript}
                onChange={(event) => setTranscript(event.target.value)}
                rows={14}
                placeholder={"M: Hmmm that sounds good\nH: Hahaha let’s see\nM: Now I’m curious 😌"}
                className="w-full resize-y rounded-2xl border border-white/10 bg-black/20 px-4 py-3 font-mono text-sm leading-6 text-white outline-none focus:border-[#C6FF32]/40"
              />
            </label>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <p className="text-xs text-white/35">
              Parsed {parsedMessages.length} messages, {ownerCount} from you.
            </p>
            <button
              type="button"
              onClick={handleImport}
              disabled={isImporting}
              className="inline-flex min-h-11 items-center gap-2 rounded-2xl bg-[#C6FF32] px-5 text-sm font-black text-[#030608] transition disabled:opacity-40"
            >
              {isImporting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              Import & learn
            </button>
          </div>
        </section>

        <section className="overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.025]">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-5">
            <div>
              <h2 className="font-black text-white">My Chats</h2>
              <p className="text-xs text-white/40">Owner-only interaction corpus linked to People.</p>
            </div>
            <button
              type="button"
              onClick={handleRefreshLearning}
              disabled={isRefreshing}
              className="inline-flex min-h-9 items-center gap-2 rounded-xl border border-white/10 px-3 text-xs font-bold text-white/60 hover:border-white/20 hover:text-white disabled:opacity-40"
            >
              <RefreshCcw className={`h-3.5 w-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
              Refresh learning
            </button>
          </div>

          <div className="grid min-h-[520px] md:grid-cols-[240px_minmax(0,1fr)]">
            <div className="border-b border-white/10 md:border-b-0 md:border-r">
              {isLoading ? (
                <div className="grid h-40 place-items-center text-white/35">
                  <LoaderCircle className="h-5 w-5 animate-spin" />
                </div>
              ) : threads.length ? (
                <div className="max-h-[600px] overflow-y-auto p-2">
                  {threads.map((thread) => (
                    <button
                      type="button"
                      key={thread._id}
                      onClick={() => openThread(thread)}
                      className={`mb-1 w-full rounded-2xl px-3 py-3 text-left transition ${
                        selected?._id === thread._id
                          ? "bg-[#C6FF32]/10"
                          : "hover:bg-white/[0.04]"
                      }`}
                    >
                      <p className="truncate text-sm font-bold text-white">{thread.title}</p>
                      <p className="mt-1 truncate text-[11px] text-white/35">
                        {linkedPersonName(thread) || thread.channel} · {thread.ownerMessageCount}/{thread.messageCount} yours
                      </p>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="p-5 text-xs leading-5 text-white/35">No imported chats yet.</p>
              )}
            </div>

            <div className="min-w-0">
              {selected ? (
                <>
                  <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
                    <div className="min-w-0">
                      <p className="truncate font-bold text-white">{selected.title}</p>
                      <p className="mt-1 text-[11px] uppercase tracking-wider text-white/30">
                        {selected.channel} · {linkedPersonName(selected) || "not linked to a person"}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleArchive(selected)}
                      className="grid h-9 w-9 shrink-0 place-items-center rounded-xl border border-white/10 text-white/35 hover:border-red-400/30 hover:text-red-300"
                      aria-label="Archive imported chat"
                    >
                      <Archive className="h-4 w-4" />
                    </button>
                  </div>
                  <div className="max-h-[535px] space-y-3 overflow-y-auto p-5">
                    {messages.map((item, index) => (
                      <div
                        key={item._id || `${index}-${item.content.slice(0, 20)}`}
                        className={`flex ${item.author === "owner" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[86%] rounded-2xl px-4 py-3 text-sm leading-6 ${
                            item.author === "owner"
                              ? "bg-[#C6FF32]/10 text-[#E8FFB5]"
                              : "border border-white/10 bg-white/[0.035] text-white/70"
                          }`}
                        >
                          <p className="mb-1 text-[9px] font-black uppercase tracking-[0.15em] opacity-40">
                            {item.author === "owner" ? "Aakash" : "Other person"}
                          </p>
                          <p className="whitespace-pre-wrap">{item.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="grid h-full min-h-[420px] place-items-center px-8 text-center">
                  <div>
                    <MessageCircle className="mx-auto h-7 w-7 text-white/20" />
                    <p className="mt-3 text-sm font-bold text-white/55">Select a chat</p>
                    <p className="mt-1 max-w-sm text-xs leading-5 text-white/30">
                      You can inspect exactly what was imported. Public HSAKAA receives only the distilled style fingerprint.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
