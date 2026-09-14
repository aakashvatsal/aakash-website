"use client";

import {
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import {
  Bot,
  Check,
  Clock3,
  History,
  LoaderCircle,
  RefreshCcw,
  Send,
  ShieldCheck,
  X,
} from "lucide-react";

import { ChatRichText } from "@/components/features/hsakaa/ChatRichText";

import {
  askPrivateHsakaa,
  confirmPrivateHsakaaAction,
  getPrivateHsakaaConversation,
  getPrivateHsakaaConversations,
  rejectPrivateHsakaaAction,
  type HsakaaMode,
  type PrivateHsakaaConversationSummary,
  type HsakaaProposedAction,
} from "@/services/hsakaa.service";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
  actions?: HsakaaProposedAction[];
};

const STORAGE_KEY =
  "hsakaa_private_conversation_id";

const MODES: HsakaaMode[] = [
  "Chat",
  "Companies",
  "Journal",
  "Library",
  "Health",
  "Media",
  "Memory",
];

function formatPreviewValue(value: unknown) {
  if (value === null || value === undefined || value === "") {
    return "-";
  }

  if (Array.isArray(value)) {
    return value.length ? value.join(", ") : "-";
  }

  if (typeof value === "boolean") {
    return value ? "Yes" : "No";
  }

  if (typeof value === "object") {
    return JSON.stringify(value);
  }

  return String(value);
}

function ActionCard({
  action,
  busy,
  onDecision,
}: {
  action: HsakaaProposedAction;
  busy: boolean;
  onDecision: (
    action: HsakaaProposedAction,
    decision: "confirm" | "reject",
  ) => void;
}) {
  const isPending = action.status === "pending";

  return (
    <div className="mt-3 overflow-hidden rounded-[18px] border border-[#C6FF32]/20 bg-[#C6FF32]/[0.04]">
      <div className="flex items-start justify-between gap-3 border-b border-white/10 px-4 py-3">
        <div className="flex gap-3">
          <div className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[#C6FF32]/10 text-[#C6FF32]">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <p className="text-xs font-black uppercase tracking-[0.14em] text-[#C6FF32]">
              Confirmation required
            </p>
            <p className="mt-1 font-bold text-white">
              {action.summary}
            </p>
          </div>
        </div>

        <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-white/40">
          {action.risk} risk
        </span>
      </div>

      <div className="grid gap-2 px-4 py-3 sm:grid-cols-2">
        {Object.entries(action.preview).map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl border border-white/[0.07] bg-black/20 px-3 py-2"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-white/30">
              {label.replaceAll(/([A-Z])/g, " $1").trim()}
            </p>
            <p className="mt-1 break-words text-xs font-semibold text-white/70">
              {formatPreviewValue(value)}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-white/10 px-4 py-3">
        <div className="flex items-center gap-1.5 text-[11px] text-white/30">
          <Clock3 className="h-3.5 w-3.5" />
          Expires {new Date(action.expiresAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </div>

        {isPending ? (
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={busy}
              onClick={() => onDecision(action, "reject")}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-xl border border-white/10 px-3 text-xs font-bold text-white/50 transition hover:border-white/20 hover:text-white disabled:opacity-40"
            >
              <X className="h-3.5 w-3.5" />
              Reject
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => onDecision(action, "confirm")}
              className="inline-flex min-h-9 items-center gap-1.5 rounded-xl bg-[#C6FF32] px-3 text-xs font-black text-[#030608] transition disabled:opacity-40"
            >
              {busy ? (
                <LoaderCircle className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Check className="h-3.5 w-3.5" />
              )}
              Confirm & execute
            </button>
          </div>
        ) : (
          <span className="text-xs font-bold text-white/45">
            {action.status === "executed"
              ? "Executed"
              : action.status === "rejected"
                ? "Rejected"
                : action.status}
          </span>
        )}
      </div>
    </div>
  );
}

export function PrivateHsakaaChat() {
  const [mode, setMode] =
    useState<HsakaaMode>("Chat");
  const [message, setMessage] =
    useState("");
  const [conversationId, setConversationId] =
    useState<string | undefined>();
  const [isLoading, setIsLoading] =
    useState(false);
  const [busyActionId, setBusyActionId] =
    useState<string | null>(null);
  const [conversations, setConversations] = useState<
    PrivateHsakaaConversationSummary[]
  >([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [chat, setChat] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content:
        "Private HSAKAA is connected to your Personal OS. It can read live context and propose Task, Brain Dump, Journal, or Memory changes. Nothing is written until you explicitly confirm the action card.",
    },
  ]);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function hydrateHistory() {
      setHistoryLoading(true);
      setHistoryError(null);

      try {
        const history = await getPrivateHsakaaConversations({ limit: 40 });
        if (cancelled) return;
        setConversations(history.data);

        const stored = window.sessionStorage.getItem(STORAGE_KEY);
        if (!stored || !/^[0-9a-f]{24}$/i.test(stored)) return;

        try {
          const detail = await getPrivateHsakaaConversation(stored);
          if (cancelled) return;
          setConversationId(stored);
          setMode((detail.conversation.mode as HsakaaMode) || "Chat");
          setChat(
            detail.messages.map((item) => ({
              role: item.role,
              content: item.content,
            })),
          );
        } catch {
          window.sessionStorage.removeItem(STORAGE_KEY);
        }
      } catch (error) {
        if (!cancelled) {
          setHistoryError(
            error instanceof Error
              ? error.message
              : "Could not load conversation history.",
          );
        }
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    }

    void hydrateHistory();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat, isLoading, busyActionId]);

  async function refreshConversationHistory() {
    try {
      const history = await getPrivateHsakaaConversations({ limit: 40 });
      setConversations(history.data);
      setHistoryError(null);
    } catch (error) {
      setHistoryError(
        error instanceof Error
          ? error.message
          : "Could not refresh conversation history.",
      );
    }
  }

  async function openConversation(id: string) {
    if (isLoading || busyActionId) return;

    setHistoryLoading(true);
    setHistoryError(null);
    try {
      const detail = await getPrivateHsakaaConversation(id);
      setConversationId(id);
      window.sessionStorage.setItem(STORAGE_KEY, id);
      setMode((detail.conversation.mode as HsakaaMode) || "Chat");
      setChat(
        detail.messages.map((item) => ({
          role: item.role,
          content: item.content,
        })),
      );
    } catch (error) {
      setHistoryError(
        error instanceof Error ? error.message : "Could not open conversation.",
      );
    } finally {
      setHistoryLoading(false);
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const text = message.trim();
    if (!text || isLoading) return;

    setMessage("");
    setChat((current) => [
      ...current,
      { role: "user", content: text },
    ]);
    setIsLoading(true);

    try {
      const result = await askPrivateHsakaa({
        mode,
        message: text,
        conversationId,
      });

      setConversationId(result.conversationId);
      window.sessionStorage.setItem(
        STORAGE_KEY,
        result.conversationId,
      );
      setChat((current) => [
        ...current,
        {
          role: "assistant",
          content: result.answer,
          actions: result.proposedActions,
        },
      ]);
      void refreshConversationHistory();
    } catch (error) {
      setChat((current) => [
        ...current,
        {
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "Private HSAKAA is unavailable right now.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleActionDecision(
    action: HsakaaProposedAction,
    decision: "confirm" | "reject",
  ) {
    if (busyActionId || action.status !== "pending") {
      return;
    }

    setBusyActionId(action.id);

    try {
      const result =
        decision === "confirm"
          ? await confirmPrivateHsakaaAction(
              action.id,
              action.confirmationToken,
            )
          : await rejectPrivateHsakaaAction(
              action.id,
              action.confirmationToken,
            );

      setChat((current) =>
        current.map((item) => ({
          ...item,
          actions: item.actions?.map((existing) =>
            existing.id === action.id
              ? {
                  ...existing,
                  status: result.action.status,
                  result: result.action.result,
                  error: result.action.error,
                }
              : existing,
          ),
        })),
      );

      setChat((current) => [
        ...current,
        {
          role: "assistant",
          content: result.message,
        },
      ]);
    } catch (error) {
      setChat((current) => [
        ...current,
        {
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "The proposed action could not be processed.",
        },
      ]);
    } finally {
      setBusyActionId(null);
    }
  }

  function newConversation() {
    window.sessionStorage.removeItem(STORAGE_KEY);
    setConversationId(undefined);
    setBusyActionId(null);
    setChat([
      {
        role: "assistant",
        content:
          "New private conversation started. Read tools are available, and Task, Brain Dump, Journal, or Memory changes will always require a confirmation card before execution.",
      },
    ]);
  }

  return (
    <div className="grid overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.025] lg:grid-cols-[280px_minmax(0,1fr)]">
      <aside className="border-b border-white/10 bg-black/10 lg:border-b-0 lg:border-r">
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <div className="flex items-center gap-2">
            <History className="h-4 w-4 text-[#C6FF32]" />
            <div>
              <p className="text-xs font-black uppercase tracking-[0.14em] text-white/70">
                My conversations
              </p>
              <p className="mt-0.5 text-[11px] text-white/30">Private HSAKAA history</p>
            </div>
          </div>
          {historyLoading ? (
            <LoaderCircle className="h-4 w-4 animate-spin text-white/30" />
          ) : null}
        </div>

        <div className="max-h-56 overflow-y-auto p-2 lg:max-h-[720px]">
          {historyError ? (
            <p className="m-2 rounded-xl border border-red-400/20 bg-red-400/5 px-3 py-2 text-xs leading-5 text-red-200/70">
              {historyError}
            </p>
          ) : null}

          {!historyLoading && conversations.length === 0 ? (
            <p className="px-3 py-5 text-xs leading-5 text-white/30">
              Your private conversations will appear here after you chat with HSAKAA.
            </p>
          ) : null}

          {conversations.map((conversation) => (
            <button
              key={conversation._id}
              type="button"
              onClick={() => void openConversation(conversation._id)}
              className={`mb-1 w-full rounded-xl px-3 py-2.5 text-left transition ${
                conversationId === conversation._id
                  ? "bg-[#C6FF32]/10 text-white"
                  : "text-white/55 hover:bg-white/[0.04] hover:text-white/80"
              }`}
            >
              <p className="truncate text-xs font-bold">
                {conversation.title || "Private conversation"}
              </p>
              <div className="mt-1 flex items-center justify-between gap-2 text-[10px] text-white/30">
                <span>{conversation.mode || "Chat"}</span>
                <span>{conversation.messageCount} messages</span>
              </div>
            </button>
          ))}
        </div>
      </aside>

      <div className="min-w-0">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-white/10 p-4 sm:p-5">
        <div className="flex items-center gap-3">
          <div className="grid h-11 w-11 place-items-center rounded-2xl border border-[#C6FF32]/20 bg-[#C6FF32]/10 text-[#C6FF32]">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <p className="font-black text-white">Private HSAKAA</p>
            <p className="text-xs text-white/35">
              Personal OS agent · confirmed write actions
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={mode}
            onChange={(event) =>
              setMode(event.target.value as HsakaaMode)
            }
            className="min-h-10 rounded-xl border border-white/10 bg-[#030608] px-3 text-xs font-bold text-white/60 outline-none"
          >
            {MODES.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>

          <button
            type="button"
            onClick={newConversation}
            className="grid h-10 w-10 place-items-center rounded-xl border border-white/10 text-white/40 transition hover:border-[#C6FF32]/30 hover:text-[#C6FF32]"
            title="New conversation"
          >
            <RefreshCcw className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="h-[min(60vh,620px)] space-y-4 overflow-y-auto p-4 sm:p-6">
        {chat.map((item, index) => (
          <div
            key={`${item.role}-${index}`}
            className={`max-w-[92%] rounded-[20px] px-4 py-3 text-sm leading-7 ${
              item.role === "user"
                ? "ml-auto bg-[#C6FF32] font-semibold text-[#030608]"
                : "border border-white/10 bg-black/20 text-white/70"
            }`}
          >
            {item.role === "assistant" ? (
              <ChatRichText content={item.content} />
            ) : (
              <div className="whitespace-pre-wrap">{item.content}</div>
            )}

            {item.actions?.map((action) => (
              <ActionCard
                key={action.id}
                action={action}
                busy={busyActionId === action.id}
                onDecision={handleActionDecision}
              />
            ))}
          </div>
        ))}

        {isLoading ? (
          <div className="max-w-[88%] rounded-[20px] border border-white/10 bg-black/20 px-4 py-3 text-sm text-white/35">
            Thinking…
          </div>
        ) : null}
        <div ref={endRef} />
      </div>

      <form
        onSubmit={handleSubmit}
        className="flex gap-3 border-t border-white/10 p-4 sm:p-5"
      >
        <textarea
          value={message}
          onChange={(event) => setMessage(event.target.value)}
          rows={2}
          placeholder="Ask HSAKAA - or tell it to create/update a task…"
          className="min-h-12 flex-1 resize-none rounded-[16px] border border-white/10 bg-[#030608] px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/25 focus:border-[#C6FF32]/40"
        />
        <button
          type="submit"
          disabled={!message.trim() || isLoading}
          className="grid h-12 w-12 shrink-0 place-items-center self-end rounded-[16px] bg-[#C6FF32] text-[#030608] transition disabled:cursor-not-allowed disabled:opacity-40"
        >
          <Send className="h-4 w-4" />
        </button>
      </form>
      </div>
    </div>
  );
}
