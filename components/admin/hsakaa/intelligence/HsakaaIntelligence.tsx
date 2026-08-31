"use client";

import Link from "next/link";
import {
  Activity,
  Brain,
  CheckCircle2,
  ChevronRight,
  CircleAlert,
  Database,
  Loader2,
  MessageSquareText,
  RefreshCw,
  Search,
  Sparkles,
} from "lucide-react";
import {
  FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { HsakaaPatternIntelligence } from "@/components/admin/hsakaa/intelligence/HsakaaPatternIntelligence";
import { HsakaaDecisionLab } from "@/components/admin/hsakaa/intelligence/HsakaaDecisionLab";
import { HsakaaWeeklyReview } from "@/components/admin/hsakaa/intelligence/HsakaaWeeklyReview";

import type {
  EmbeddingBackfillResult,
  EmbeddingStatus,
  HsakaaConversationDetail,
  HsakaaConversationListResponse,
  HsakaaConversationSummary,
  HsakaaInsightStats,
} from "@/types/hsakaa-intelligence";

const ADMIN_API = "/api/admin/backend";

const EMPTY_STATS: HsakaaInsightStats = {
  totalConversations: 0,
  conversationsLast24Hours: 0,
  conversationsLast7Days: 0,
  totalMessages: 0,
  userMessages: 0,
  assistantMessages: 0,
  groundedAssistantMessages: 0,
  groundingRate: 0,
  averageMessagesPerConversation: 0,
};

const EMPTY_EMBEDDINGS: EmbeddingStatus = {
  model: "Not configured",
  eligibleTotal: 0,
  generatedCurrentModel: 0,
  missingOrStale: 0,
};

function formatDate(value?: string) {
  if (!value) {
    return "Unknown";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "Unknown";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatEnum(value?: string) {
  if (!value) {
    return "Unknown";
  }

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

async function readJson<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as
    | T
    | { message?: string | string[] }
    | null;

  if (!response.ok) {
    const rawMessage =
      payload &&
      typeof payload === "object" &&
      "message" in payload
        ? payload.message
        : undefined;

    throw new Error(
      Array.isArray(rawMessage)
        ? rawMessage.join(", ")
        : rawMessage ?? `Request failed with status ${response.status}.`,
    );
  }

  return payload as T;
}

export function HsakaaIntelligence() {
  const [stats, setStats] = useState(EMPTY_STATS);
  const [embeddingStatus, setEmbeddingStatus] =
    useState(EMPTY_EMBEDDINGS);
  const [conversations, setConversations] = useState<
    HsakaaConversationSummary[]
  >([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<HsakaaConversationDetail | null>(null);
  const [search, setSearch] = useState("");
  const [searchInput, setSearchInput] = useState("");
  const [mode, setMode] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingDetail, setIsLoadingDetail] = useState(false);
  const [isBackfilling, setIsBackfilling] = useState(false);
  const [error, setError] = useState("");
  const [actionMessage, setActionMessage] = useState("");

  const loadOverview = useCallback(async () => {
    const params = new URLSearchParams({
      page: "1",
      limit: "50",
    });

    if (search) {
      params.set("search", search);
    }

    if (mode) {
      params.set("mode", mode);
    }

    const [statsResponse, conversationsResponse, embeddingResponse] =
      await Promise.all([
        fetch(`${ADMIN_API}/chat/insights`, {
          cache: "no-store",
        }),
        fetch(`${ADMIN_API}/chat/conversations?${params.toString()}`, {
          cache: "no-store",
        }),
        fetch(`${ADMIN_API}/memory/embeddings/status`, {
          cache: "no-store",
        }),
      ]);

    const [nextStats, conversationPayload, nextEmbeddingStatus] =
      await Promise.all([
        readJson<HsakaaInsightStats>(statsResponse),
        readJson<HsakaaConversationListResponse>(conversationsResponse),
        readJson<EmbeddingStatus>(embeddingResponse),
      ]);

    setStats(nextStats);
    setConversations(conversationPayload.data);
    setEmbeddingStatus(nextEmbeddingStatus);

    setSelectedId((current) => {
      if (
        current &&
        conversationPayload.data.some(
          (conversation) => conversation._id === current,
        )
      ) {
        return current;
      }

      return conversationPayload.data[0]?._id ?? null;
    });
  }, [mode, search]);

  const loadConversation = useCallback(async (conversationId: string) => {
    try {
      setIsLoadingDetail(true);
      setError("");

      const response = await fetch(
        `${ADMIN_API}/chat/conversations/${conversationId}`,
        {
          cache: "no-store",
        },
      );

      const payload = await readJson<HsakaaConversationDetail>(response);
      setDetail(payload);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to load the selected conversation.",
      );
      setDetail(null);
    } finally {
      setIsLoadingDetail(false);
    }
  }, []);

  useEffect(() => {
    let active = true;

    async function run() {
      try {
        setIsLoading(true);
        setError("");
        await loadOverview();
      } catch (caughtError) {
        if (!active) {
          return;
        }

        setError(
          caughtError instanceof Error
            ? caughtError.message
            : "Unable to load HSAKAA intelligence.",
        );
      } finally {
        if (active) {
          setIsLoading(false);
        }
      }
    }

    run();

    return () => {
      active = false;
    };
  }, [loadOverview]);

  useEffect(() => {
    if (!selectedId) {
      setDetail(null);
      return;
    }

    loadConversation(selectedId);
  }, [loadConversation, selectedId]);

  const modes = useMemo(
    () =>
      Array.from(
        new Set(
          conversations
            .map((conversation) => conversation.mode)
            .filter(Boolean),
        ),
      ).sort(),
    [conversations],
  );

  const embeddingPercent =
    embeddingStatus.eligibleTotal > 0
      ? Math.round(
          (embeddingStatus.generatedCurrentModel /
            embeddingStatus.eligibleTotal) *
            100,
        )
      : 100;

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSearch(searchInput.trim());
  }

  async function handleBackfill() {
    if (isBackfilling) {
      return;
    }

    try {
      setIsBackfilling(true);
      setError("");
      setActionMessage("");

      const response = await fetch(
        `${ADMIN_API}/memory/embeddings/backfill`,
        {
          method: "POST",
          headers: {
            "content-type": "application/json",
          },
          body: JSON.stringify({
            limit: 500,
          }),
        },
      );

      const result = await readJson<EmbeddingBackfillResult>(response);

      setActionMessage(
        `Embedding backfill complete: ${result.generated} generated, ${result.failed} failed.`,
      );

      await loadOverview();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to backfill embeddings.",
      );
    } finally {
      setIsBackfilling(false);
    }
  }

  const statCards = [
    {
      label: "Conversations",
      value: stats.totalConversations.toLocaleString(),
      helper: `${stats.conversationsLast24Hours} active in 24h`,
      icon: MessageSquareText,
    },
    {
      label: "Grounded answers",
      value: `${stats.groundingRate}%`,
      helper: `${stats.groundedAssistantMessages} responses used memory`,
      icon: Brain,
    },
    {
      label: "Avg. depth",
      value: stats.averageMessagesPerConversation.toFixed(1),
      helper: `${stats.totalMessages} total messages`,
      icon: Activity,
    },
    {
      label: "Embedding health",
      value: `${embeddingPercent}%`,
      helper:
        embeddingStatus.missingOrStale === 0
          ? "All eligible memories are current"
          : `${embeddingStatus.missingOrStale} missing or stale`,
      icon: Database,
    },
  ];

  return (
    <div className="space-y-6">
      <HsakaaDecisionLab />
      <HsakaaWeeklyReview />
      <HsakaaPatternIntelligence />

      {error ? (
        <div className="flex items-start gap-3 rounded-[22px] border border-red-400/20 bg-red-400/[0.06] p-4 text-sm text-red-100/80">
          <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{error}</span>
        </div>
      ) : null}

      {actionMessage ? (
        <div className="flex items-start gap-3 rounded-[22px] border border-[#C6FF32]/20 bg-[#C6FF32]/[0.06] p-4 text-sm text-[#E9FFC0]">
          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-[#C6FF32]" />
          <span>{actionMessage}</span>
        </div>
      ) : null}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((card) => {
          const Icon = card.icon;

          return (
            <article
              key={card.label}
              className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-white/35">
                    {card.label}
                  </p>
                  <p className="mt-3 text-3xl font-black tracking-[-0.05em] text-white">
                    {isLoading ? "—" : card.value}
                  </p>
                </div>

                <div className="grid h-11 w-11 place-items-center rounded-2xl border border-[#C6FF32]/20 bg-[#C6FF32]/10 text-[#C6FF32]">
                  <Icon className="h-5 w-5" />
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-white/35">
                {card.helper}
              </p>
            </article>
          );
        })}
      </section>

      <section className="rounded-[26px] border border-white/10 bg-white/[0.025] p-5">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <div className="flex items-center gap-2 text-[#C6FF32]">
              <Sparkles className="h-4 w-4" />
              <p className="text-xs font-black uppercase tracking-[0.18em]">
                Semantic memory
              </p>
            </div>

            <h2 className="mt-2 text-xl font-black tracking-[-0.04em] text-white">
              Embedding health
            </h2>

            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/40">
              {embeddingStatus.generatedCurrentModel.toLocaleString()} of{" "}
              {embeddingStatus.eligibleTotal.toLocaleString()} eligible public
              memories use the current {embeddingStatus.model} embedding.
            </p>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="min-w-[220px]">
              <div className="mb-2 flex items-center justify-between text-xs font-bold text-white/45">
                <span>{embeddingPercent}% current</span>
                <span>{embeddingStatus.missingOrStale} pending</span>
              </div>
              <div className="h-2 overflow-hidden rounded-full bg-white/10">
                <div
                  className="h-full rounded-full bg-[#C6FF32] transition-all"
                  style={{ width: `${Math.max(0, Math.min(100, embeddingPercent))}%` }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={handleBackfill}
              disabled={isBackfilling || embeddingStatus.missingOrStale === 0}
              className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#C6FF32] px-4 text-sm font-black text-[#081000] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isBackfilling ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              Backfill missing
            </button>
          </div>
        </div>
      </section>

      <section className="grid min-h-[640px] overflow-hidden rounded-[26px] border border-white/10 bg-white/[0.02] xl:grid-cols-[360px_minmax(0,1fr)]">
        <div className="border-b border-white/10 xl:border-b-0 xl:border-r">
          <div className="border-b border-white/10 p-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#C6FF32]">
                  Conversations
                </p>
                <p className="mt-1 text-sm text-white/35">
                  Inspect public HSAKAA sessions.
                </p>
              </div>

              <button
                type="button"
                onClick={() => loadOverview().catch(() => undefined)}
                className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 text-white/45 transition hover:border-white/20 hover:text-white"
                aria-label="Refresh intelligence data"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleSearch} className="mt-4 flex gap-2">
              <label className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />
                <input
                  value={searchInput}
                  onChange={(event) => setSearchInput(event.target.value)}
                  placeholder="Search title"
                  className="h-10 w-full rounded-xl border border-white/10 bg-black/20 pl-9 pr-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#C6FF32]/35"
                />
              </label>

              <button
                type="submit"
                className="rounded-xl border border-white/10 px-3 text-xs font-black text-white/60 transition hover:text-white"
              >
                Search
              </button>
            </form>

            <select
              value={mode}
              onChange={(event) => setMode(event.target.value)}
              className="mt-2 h-10 w-full rounded-xl border border-white/10 bg-[#080c0f] px-3 text-sm text-white/60 outline-none focus:border-[#C6FF32]/35"
            >
              <option value="">All modes</option>
              {["Chat", "Companies", "Journal", "Library", "Health", "Media", "Memory", ...modes]
                .filter((value, index, values) => values.indexOf(value) === index)
                .map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
            </select>
          </div>

          <div className="max-h-[540px] overflow-y-auto p-2 xl:max-h-[700px]">
            {isLoading ? (
              <div className="grid min-h-48 place-items-center text-white/30">
                <Loader2 className="h-5 w-5 animate-spin" />
              </div>
            ) : conversations.length === 0 ? (
              <div className="p-6 text-center text-sm leading-6 text-white/35">
                No conversations match these filters yet.
              </div>
            ) : (
              conversations.map((conversation) => {
                const active = selectedId === conversation._id;

                return (
                  <button
                    key={conversation._id}
                    type="button"
                    onClick={() => setSelectedId(conversation._id)}
                    className={`mb-1 w-full rounded-2xl border p-4 text-left transition ${
                      active
                        ? "border-[#C6FF32]/25 bg-[#C6FF32]/[0.07]"
                        : "border-transparent hover:border-white/10 hover:bg-white/[0.03]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <p className="line-clamp-2 text-sm font-bold leading-5 text-white/85">
                        {conversation.title}
                      </p>
                      <ChevronRight className={`mt-0.5 h-4 w-4 shrink-0 ${active ? "text-[#C6FF32]" : "text-white/15"}`} />
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px] font-bold text-white/30">
                      <span className="rounded-full bg-white/[0.05] px-2 py-1 text-white/45">
                        {conversation.mode}
                      </span>
                      <span>{conversation.messageCount} messages</span>
                      <span>{formatDate(conversation.lastMessageAt)}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        </div>

        <div className="min-w-0">
          {!selectedId ? (
            <div className="grid h-full min-h-[520px] place-items-center p-8 text-center">
              <div>
                <MessageSquareText className="mx-auto h-8 w-8 text-white/20" />
                <p className="mt-4 font-bold text-white/60">No conversation selected</p>
                <p className="mt-2 text-sm text-white/30">
                  Choose a conversation to inspect its answers and memory traces.
                </p>
              </div>
            </div>
          ) : isLoadingDetail ? (
            <div className="grid h-full min-h-[520px] place-items-center text-white/30">
              <Loader2 className="h-6 w-6 animate-spin" />
            </div>
          ) : detail ? (
            <div>
              <div className="border-b border-white/10 p-5">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-xs font-black uppercase tracking-[0.18em] text-[#C6FF32]">
                      {detail.conversation.mode} mode
                    </p>
                    <h2 className="mt-2 text-xl font-black tracking-[-0.04em] text-white">
                      {detail.conversation.title}
                    </h2>
                  </div>

                  <div className="text-xs font-bold text-white/30">
                    {detail.conversation.messageCount} messages · {formatDate(detail.conversation.lastMessageAt)}
                  </div>
                </div>
              </div>

              <div className="max-h-[760px] space-y-4 overflow-y-auto p-5">
                {detail.messages.map((message) => {
                  const assistant = message.role === "assistant";
                  const memories = Array.isArray(message.memoryIds)
                    ? message.memoryIds
                    : [];

                  return (
                    <article
                      key={message._id}
                      className={`rounded-[22px] border p-4 ${
                        assistant
                          ? "border-[#C6FF32]/15 bg-[#C6FF32]/[0.035]"
                          : "border-white/10 bg-white/[0.025]"
                      }`}
                    >
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2">
                          <div className={`grid h-7 w-7 place-items-center rounded-lg ${assistant ? "bg-[#C6FF32]/10 text-[#C6FF32]" : "bg-white/[0.06] text-white/45"}`}>
                            {assistant ? (
                              <Sparkles className="h-3.5 w-3.5" />
                            ) : (
                              <MessageSquareText className="h-3.5 w-3.5" />
                            )}
                          </div>
                          <p className="text-xs font-black uppercase tracking-[0.16em] text-white/45">
                            {assistant ? "HSAKAA" : "Visitor"}
                          </p>
                        </div>
                        <span className="text-[11px] font-bold text-white/20">
                          {formatDate(message.createdAt)}
                        </span>
                      </div>

                      <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-white/70">
                        {message.content}
                      </p>

                      {assistant ? (
                        <div className="mt-4 border-t border-white/10 pt-4">
                          <div className="flex items-center justify-between gap-3">
                            <p className="text-xs font-black uppercase tracking-[0.16em] text-white/30">
                              Memory trace
                            </p>
                            <span className={`rounded-full px-2 py-1 text-[10px] font-black uppercase tracking-[0.12em] ${memories.length > 0 ? "bg-[#C6FF32]/10 text-[#C6FF32]" : "bg-white/[0.05] text-white/30"}`}>
                              {memories.length > 0 ? `${memories.length} grounded` : "No memory used"}
                            </span>
                          </div>

                          {memories.length > 0 ? (
                            <div className="mt-3 space-y-2">
                              {memories.map((memory) => (
                                <Link
                                  key={memory._id}
                                  href={`/admin/hsakaa/memory/${memory._id}`}
                                  className="block rounded-2xl border border-white/10 bg-black/15 p-3 transition hover:border-[#C6FF32]/20"
                                >
                                  <p className="line-clamp-3 text-xs leading-5 text-white/55">
                                    {memory.content}
                                  </p>
                                  <div className="mt-2 flex flex-wrap gap-2 text-[10px] font-bold uppercase tracking-[0.1em] text-white/25">
                                    <span>{formatEnum(memory.type)}</span>
                                    <span>·</span>
                                    <span>{formatEnum(memory.source)}</span>
                                    <span>·</span>
                                    <span>importance {memory.importance}</span>
                                    <span>·</span>
                                    <span>confidence {memory.confidence}</span>
                                  </div>
                                </Link>
                              ))}
                            </div>
                          ) : (
                            <p className="mt-3 text-xs leading-5 text-white/25">
                              This response was generated without a stored public memory reference. It may have relied on Now, Companies, Journal, Library, Health or Media context instead.
                            </p>
                          )}
                        </div>
                      ) : null}
                    </article>
                  );
                })}
              </div>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}
