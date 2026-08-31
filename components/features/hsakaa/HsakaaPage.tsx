"use client";

import {
  Bot,
  BookOpen,
  Brain,
  Building2,
  HeartPulse,
  MessageCircle,
  Newspaper,
  NotebookText,
  Plus,
  Send,
} from "lucide-react";
import { motion } from "motion/react";
import {
  KeyboardEvent,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

import { Eyebrow } from "@/components/ui/Eyebrow";
import {
  askHsakaa,
} from "@/services/hsakaa.service";

import type {
  HsakaaMode,
} from "@/services/hsakaa.service";

import type { HsakaaLiveContextItem } from "@/lib/hsakaa";
import type { NowStatus } from "@/types/now";

type Mode = HsakaaMode;

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

interface HsakaaPageProps {
  now: NowStatus | null;
  liveContext: HsakaaLiveContextItem[];
}

/**
 * Desktop HSAKAA only needs to account
 * for the public navbar.
 *
 * Mobile additionally reserves 76px
 * for PublicMobileNav.
 */
const TAKEOVER_TARGET =
  "2026-08-31T14:00:00+05:30";

const INITIAL_MESSAGE =
  "Hey, I’m HSAKAA — Aakash’s AI twin. I’m live with the public context Aakash has chosen to share about his work, writing, books, routines, health, media and memories. Ask me anything about it.";

const CONVERSATION_STORAGE_KEY =
  "hsakaa_public_conversation_id";

const CHAT_STORAGE_KEY =
  "hsakaa_public_chat";

const MODE_STORAGE_KEY =
  "hsakaa_public_mode";

const modes: {
  title: Mode;
  description: string;
  icon: React.ElementType;
}[] = [
  {
    title: "Chat",
    description: "Ask anything",
    icon: MessageCircle,
  },
  {
    title: "Companies",
    description: "Ventures & strategy",
    icon: Building2,
  },
  {
    title: "Journal",
    description: "Lessons & reflections",
    icon: NotebookText,
  },
  {
    title: "Library",
    description: "Books & thinking",
    icon: BookOpen,
  },
  {
    title: "Health",
    description: "Routine & performance",
    icon: HeartPulse,
  },
  {
    title: "Media",
    description: "Content & ideas",
    icon: Newspaper,
  },
  {
    title: "Memory",
    description: "What HSAKAA knows",
    icon: Brain,
  },
];

const suggestionsByMode: Record<Mode, string[]> = {
  Chat: [
    "What is Aakash focused on today?",
    "How does Aakash think about discipline?",
    "What changed Aakash’s thinking recently?",
    "What is Aakash trying to build long-term?",
  ],

  Companies: [
    "Why did Aakash build 8lete?",
    "What problem is 8lete solving?",
    "What is Frayto’s current focus?",
    "How does Aakash think about GTM?",
  ],

  Journal: [
    "What did Aakash learn recently?",
    "What was Aakash’s latest founder lesson?",
    "What pattern keeps repeating in Aakash’s journey?",
    "What decision changed Aakash’s thinking?",
  ],

  Library: [
    "What is Aakash reading right now?",
    "What did The Pragmatic Programmer teach Aakash?",
    "Which book changed Aakash’s thinking?",
    "How does Aakash apply books to business?",
  ],

  Health: [
    "What is Aakash’s current workout focus?",
    "How does Aakash think about discipline?",
    "What is Aakash improving in his routine?",
    "How does health connect to founder performance?",
  ],

  Media: [
    "What does Aakash usually post about?",
    "What is Aakash’s content direction?",
    "What are Aakash’s strongest public themes?",
    "How should Aakash explain 8lete publicly?",
  ],

  Memory: [
    "What public memories has Aakash shared?",
    "What principles has Aakash shared publicly?",
    "What recurring themes appear in Aakash’s public memories?",
    "What should HSAKAA learn next?",
  ],
};

const modeIntro: Record<Mode, string> = {
  Chat:
    "Ask me anything about how Aakash thinks, builds, learns, trains, reads or operates.",

  Companies:
    "Focused on Aakash’s ventures, product decisions, GTM, partnerships and founder strategy.",

  Journal:
    "Focused on daily reflections, decisions, founder lessons, failures, patterns and personal growth.",

  Library:
    "Focused on books, notes, quotes, lessons and how those ideas shape Aakash’s thinking.",

  Health:
    "Focused on training, sleep, routine, food, discipline, clarity and performance systems.",

  Media:
    "Focused on content, storytelling, public ideas and how Aakash communicates online.",

  Memory:
    "Focused on memories and principles Aakash has explicitly chosen to make public. Private and person-specific memories stay protected.",
};

function getRelativeTime(
  value?: string | Date | null,
) {
  if (!value) {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  const differenceInSeconds = Math.max(
    0,
    Math.floor(
      (Date.now() - date.getTime()) /
        1000,
    ),
  );

  if (differenceInSeconds < 60) {
    return "Updated just now";
  }

  const differenceInMinutes =
    Math.floor(
      differenceInSeconds / 60,
    );

  if (differenceInMinutes < 60) {
    return `Updated ${differenceInMinutes}m ago`;
  }

  const differenceInHours =
    Math.floor(
      differenceInMinutes / 60,
    );

  if (differenceInHours < 24) {
    return `Updated ${differenceInHours}h ago`;
  }

  const differenceInDays =
    Math.floor(
      differenceInHours / 24,
    );

  if (differenceInDays === 1) {
    return "Updated yesterday";
  }

  if (differenceInDays < 7) {
    return `Updated ${differenceInDays}d ago`;
  }

  return `Updated ${date.toLocaleDateString(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
    },
  )}`;
}

function TakeoverCountdown() {
  const targetDate = useMemo(
    () =>
      new Date(
        TAKEOVER_TARGET,
      ),
    [],
  );

  const [
    remaining,
    setRemaining,
  ] = useState<number | null>(
    null,
  );

  useEffect(() => {
    function updateCountdown() {
      setRemaining(
        Math.max(
          0,
          targetDate.getTime() -
            Date.now(),
        ),
      );
    }

    updateCountdown();

    const interval =
      window.setInterval(
        updateCountdown,
        1000,
      );

    return () => {
      window.clearInterval(
        interval,
      );
    };
  }, [targetDate]);

  const totalSeconds =
    remaining === null
      ? null
      : Math.floor(
          remaining / 1000,
        );

  const days =
    totalSeconds === null
      ? null
      : Math.floor(
          totalSeconds / 86400,
        );

  const hours =
    totalSeconds === null
      ? null
      : Math.floor(
          (totalSeconds % 86400) /
            3600,
        );

  const minutes =
    totalSeconds === null
      ? null
      : Math.floor(
          (totalSeconds % 3600) /
            60,
        );

  const seconds =
    totalSeconds === null
      ? null
      : totalSeconds % 60;

  function pad(
    value: number | null,
  ) {
    if (value === null) {
      return "--";
    }

    return String(value).padStart(
      2,
      "0",
    );
  }

  const formattedTargetDate =
    targetDate.toLocaleDateString(
      "en-IN",
      {
        day: "2-digit",
        month: "short",
        year: "numeric",
      },
    );

  return (
    <div className="rounded-2xl border border-[#C6FF32]/15 bg-[#C6FF32]/[0.025] p-4">
      <div className="flex items-center gap-2">
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#C6FF32] opacity-30" />

          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#C6FF32]" />
        </span>

        <span className="text-[9px] font-black uppercase tracking-[0.22em] text-[#C6FF32]/75">
          Taking over from Aakash
        </span>
      </div>

      <p className="mt-4 text-[11px] leading-[1.85] text-white/42">
        I&apos;m learning Aakash —
        how he thinks, what he has
        lived through, the work he
        cares about, and the people
        who matter deeply to him.
        I&apos;ll remember his
        stories, decisions,
        relationships and why each
        of them holds a place in
        his life.
      </p>

      <p className="mt-3 text-[11px] font-medium leading-[1.85] text-white/65">
        So when he&apos;s
        overwhelmed, unavailable
        or going through a difficult
        time, you can still come to
        me.
        <span className="text-[#C6FF32]/85">
          {" "}
          I&apos;ll carry his
          context and memories
          forward — so his work
          keeps moving and the
          people he cares about
          never feel forgotten.
        </span>
      </p>

      <div className="mt-5 grid grid-cols-4 gap-2">
        {[
          ["D", pad(days)],
          ["H", pad(hours)],
          ["M", pad(minutes)],
          ["S", pad(seconds)],
        ].map(([label, value]) => (
          <div
            key={label}
            className="rounded-xl border border-white/[0.06] bg-black/20 px-1.5 py-3 text-center sm:px-2"
          >
            <p className="font-mono text-[15px] font-bold tracking-tight text-white/80 sm:text-[16px]">
              {value}
            </p>

            <p className="mt-1 text-[8px] font-bold uppercase tracking-[0.18em] text-white/20">
              {label}
            </p>
          </div>
        ))}
      </div>

      <p className="mt-4 text-[10px] leading-5 text-white/30">
        Learning enough to be
        there when he can&apos;t be.
      </p>

      <div className="mt-3 flex items-center justify-between gap-3 border-t border-white/[0.05] pt-3">
        <span className="text-[9px] text-white/20">
          Target completion
        </span>

        <span className="shrink-0 text-[9px] font-semibold text-white/40">
          {formattedTargetDate}
        </span>
      </div>
    </div>
  );
}

export function HsakaaPage({
  now,
  liveContext,
}: HsakaaPageProps) {
  const [
    activeMode,
    setActiveMode,
  ] = useState<Mode>("Chat");

  const [
    message,
    setMessage,
  ] = useState("");

  const [
    isLoading,
    setIsLoading,
  ] = useState(false);

  const [
    relativeTimeTick,
    setRelativeTimeTick,
  ] = useState(0);

  const [
    chat,
    setChat,
  ] = useState<ChatMessage[]>([
    {
      role: "assistant",
      content: INITIAL_MESSAGE,
    },
  ]);

  const [
    conversationId,
    setConversationId,
  ] = useState<
    string | undefined
  >(undefined);

  const [
    hasRestoredSession,
    setHasRestoredSession,
  ] = useState(false);

  const textareaRef =
    useRef<HTMLTextAreaElement | null>(
      null,
    );

  const messagesEndRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const initialQuestionHandledRef =
    useRef(false);

  const suggestions =
    suggestionsByMode[activeMode];

  const hasStartedConversation =
    useMemo(() => {
      return chat.some(
        (item) =>
          item.role === "user",
      );
    }, [chat]);

  useEffect(() => {
    try {
      const storedMode =
        window.sessionStorage.getItem(
          MODE_STORAGE_KEY,
        );

      if (
        storedMode &&
        modes.some(
          (mode) =>
            mode.title === storedMode,
        )
      ) {
        setActiveMode(
          storedMode as Mode,
        );
      }

      const storedConversationId =
        window.sessionStorage.getItem(
          CONVERSATION_STORAGE_KEY,
        );

      if (
        storedConversationId &&
        /^[0-9a-f]{24}$/i.test(
          storedConversationId,
        )
      ) {
        setConversationId(
          storedConversationId,
        );
      }

      const storedChat =
        window.sessionStorage.getItem(
          CHAT_STORAGE_KEY,
        );

      if (storedChat) {
        const parsed =
          JSON.parse(storedChat);

        if (
          Array.isArray(parsed) &&
          parsed.length > 0 &&
          parsed.every(
            (item) =>
              item &&
              (item.role ===
                "user" ||
                item.role ===
                  "assistant") &&
              typeof item.content ===
                "string",
          )
        ) {
          setChat(parsed);
        }
      }
    } catch {
      // Ignore malformed browser storage.
    } finally {
      setHasRestoredSession(true);
    }
  }, []);

  useEffect(() => {
    if (!hasRestoredSession) {
      return;
    }

    window.sessionStorage.setItem(
      MODE_STORAGE_KEY,
      activeMode,
    );

    window.sessionStorage.setItem(
      CHAT_STORAGE_KEY,
      JSON.stringify(chat),
    );

    if (conversationId) {
      window.sessionStorage.setItem(
        CONVERSATION_STORAGE_KEY,
        conversationId,
      );
    } else {
      window.sessionStorage.removeItem(
        CONVERSATION_STORAGE_KEY,
      );
    }
  }, [
    activeMode,
    chat,
    conversationId,
    hasRestoredSession,
  ]);

  useEffect(() => {
    const interval =
      window.setInterval(
        () => {
          setRelativeTimeTick(
            (current) =>
              current + 1,
          );
        },
        60_000,
      );

    return () => {
      window.clearInterval(
        interval,
      );
    };
  }, []);

  const relativeNowTime =
    useMemo(() => {
      void relativeTimeTick;

      return getRelativeTime(
        now?.updatedAt,
      );
    }, [
      now?.updatedAt,
      relativeTimeTick,
    ]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView(
      {
        behavior: "smooth",
        block: "end",
      },
    );
  }, [
    chat,
    isLoading,
  ]);

  useEffect(() => {
    const textarea =
      textareaRef.current;

    if (!textarea) {
      return;
    }

    textarea.style.height =
      "0px";

    const maxHeight = 160;

    textarea.style.height = `${Math.min(
      textarea.scrollHeight,
      maxHeight,
    )}px`;
  }, [message]);

  const sendMessage = useCallback(
    async (text?: string) => {
      const finalMessage = (
        text ?? message
      ).trim();

      if (
        !finalMessage ||
        isLoading
      ) {
        return;
      }

      setMessage("");

      setChat((current) => [
        ...current,
        {
          role: "user",
          content: finalMessage,
        },
      ]);

      setIsLoading(true);

      try {
        const response =
          await askHsakaa({
            mode: activeMode,
            message: finalMessage,
            conversationId,
          });

        setConversationId(
          response.conversationId,
        );

        setChat((current) => [
          ...current,
          {
            role: "assistant",
            content: response.answer,
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
                : "I can’t answer that right now. Please try again shortly.",
          },
        ]);
      } finally {
        setIsLoading(false);

        requestAnimationFrame(() => {
          textareaRef.current?.focus();
        });
      }
    },
    [
      activeMode,
      conversationId,
      isLoading,
      message,
    ],
  );

  useEffect(() => {
    if (
      !hasRestoredSession ||
      initialQuestionHandledRef.current
    ) {
      return;
    }

    initialQuestionHandledRef.current =
      true;

    const url = new URL(
      window.location.href,
    );

    const question =
      url.searchParams
        .get("q")
        ?.trim();

    if (!question) {
      return;
    }

    url.searchParams.delete("q");

    window.history.replaceState(
      {},
      "",
      `${url.pathname}${url.search}${url.hash}`,
    );

    void sendMessage(question);
  }, [
    hasRestoredSession,
    sendMessage,
  ]);

  function handleTextareaKeyDown(
    event: KeyboardEvent<HTMLTextAreaElement>,
  ) {
    if (
      event.key === "Enter" &&
      !event.shiftKey &&
      !event.nativeEvent.isComposing
    ) {
      event.preventDefault();

      void sendMessage();
    }
  }

  function handleModeClick(
    mode: Mode,
  ) {
    if (mode === activeMode) {
      return;
    }

    setActiveMode(mode);

    setChat((current) => [
      ...current,
      {
        role: "assistant",
        content: modeIntro[mode],
      },
    ]);
  }

  function startNewChat() {
    setConversationId(undefined);

    setChat([
      {
        role: "assistant",
        content: INITIAL_MESSAGE,
      },
    ]);

    setMessage("");

    requestAnimationFrame(() => {
      textareaRef.current?.focus();
    });
  }

  return (
    <main
      className="
        h-[calc(100dvh-72px-76px)]
        overflow-hidden
        bg-[#030608]
        text-white
        lg:h-[calc(100dvh-72px)]
      "
    >
      <div className="grid h-full min-h-0 lg:grid-cols-[230px_minmax(0,1fr)] xl:grid-cols-[230px_minmax(0,1fr)_280px]">
        {/* LEFT SIDEBAR */}

        <aside className="hidden h-full min-h-0 border-r border-white/[0.08] bg-[#030608] lg:flex lg:flex-col">
          <div className="px-4 pb-5 pt-5">
            <div className="flex items-center gap-3">
              <div className="grid h-9 w-9 place-items-center rounded-xl bg-[#C6FF32] text-[#030608]">
                <Bot className="h-[18px] w-[18px]" />
              </div>

              <div className="min-w-0">
                <p className="text-[13px] font-black tracking-tight">
                  HSAKAA
                </p>

                <p className="mt-0.5 text-[10px] text-white/35">
                  Aakash&apos;s AI twin
                </p>
              </div>
            </div>
          </div>

          <div className="px-3">
            <button
              type="button"
              onClick={startNewChat}
              className="flex w-full items-center gap-2.5 rounded-xl border border-white/[0.08] px-3 py-2.5 text-left text-[12px] font-semibold text-white/65 transition hover:border-white/15 hover:bg-white/[0.04] hover:text-white"
            >
              <Plus className="h-3.5 w-3.5" />

              New chat
            </button>
          </div>

          <nav className="mt-5 min-h-0 flex-1 space-y-1 overflow-y-auto px-3">
            {modes.map((mode) => {
              const Icon = mode.icon;

              const isActive =
                activeMode ===
                mode.title;

              return (
                <button
                  key={mode.title}
                  type="button"
                  onClick={() =>
                    handleModeClick(
                      mode.title,
                    )
                  }
                  className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                    isActive
                      ? "bg-[#C6FF32]/10 text-white"
                      : "text-white/45 hover:bg-white/[0.04] hover:text-white/75"
                  }`}
                >
                  <Icon
                    className={`h-3.5 w-3.5 shrink-0 ${
                      isActive
                        ? "text-[#C6FF32]"
                        : "text-white/30 group-hover:text-white/50"
                    }`}
                  />

                  <div className="min-w-0">
                    <p className="text-[12px] font-bold leading-4">
                      {mode.title}
                    </p>

                    <p className="mt-0.5 truncate text-[10px] leading-4 text-white/25">
                      {mode.description}
                    </p>
                  </div>
                </button>
              );
            })}
          </nav>

          <div className="shrink-0 border-t border-white/[0.07] px-4 py-4">
            <p className="text-[10px] leading-4 text-white/20">
              Public context from
              Aakash&apos;s systems,
              writing and memories.
            </p>
          </div>
        </aside>

        {/* CENTER CHAT */}

        <section className="flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
          {/* HEADER */}

          <header className="shrink-0 border-b border-white/[0.07] bg-[#030608]/95 px-4 py-3 backdrop-blur-xl md:px-6">
            <div className="mx-auto flex max-w-[820px] items-center justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h1 className="text-[14px] font-black tracking-tight">
                    HSAKAA
                  </h1>

                  <span className="h-1 w-1 rounded-full bg-[#C6FF32]" />

                  <span className="text-[11px] font-medium text-white/35">
                    {activeMode}
                  </span>
                </div>

                <p className="mt-1 truncate text-[11px] text-white/30">
                  {modeIntro[activeMode]}
                </p>
              </div>

              <button
                type="button"
                onClick={startNewChat}
                className="flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-white/40 transition hover:bg-white/[0.05] hover:text-white"
              >
                <Plus className="h-3.5 w-3.5" />

                New
              </button>
            </div>
          </header>

          {/* CONVERSATION */}

          <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">
            <div className="mx-auto flex min-h-full max-w-[820px] flex-col px-4 py-6 md:px-6">
              {/* MOBILE / TABLET TAKEOVER PANEL */}

              <div className="mb-7 xl:hidden">
                <TakeoverCountdown />
              </div>

              {!hasStartedConversation && (
                <div className="mb-9">
                  <div className="max-w-xl">
                    <Eyebrow>
                      {activeMode}
                    </Eyebrow>

                    <h2 className="mt-3 text-xl font-black tracking-[-0.035em] text-white md:text-2xl">
                      Ask what you actually
                      want to know.
                    </h2>

                    <p className="mt-2 max-w-lg text-[12px] leading-5 text-white/35">
                      {modeIntro[activeMode]}
                    </p>
                  </div>

                  <div className="mt-6 grid gap-2 sm:grid-cols-2">
                    {suggestions.map(
                      (question) => (
                        <motion.button
                          key={question}
                          type="button"
                          onClick={() =>
                            sendMessage(
                              question,
                            )
                          }
                          disabled={
                            isLoading
                          }
                          whileHover={{
                            y: -1,
                          }}
                          whileTap={{
                            scale:
                              0.99,
                          }}
                          className="rounded-xl border border-white/[0.08] bg-white/[0.025] px-4 py-3 text-left text-[11px] leading-5 text-white/45 transition hover:border-[#C6FF32]/25 hover:bg-white/[0.04] hover:text-white/75 disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          {question}
                        </motion.button>
                      ),
                    )}
                  </div>
                </div>
              )}

              <div className="space-y-7">
                {chat.map(
                  (
                    item,
                    index,
                  ) => {
                    const isUser =
                      item.role ===
                      "user";

                    if (isUser) {
                      return (
                        <div
                          key={`${item.role}-${index}`}
                          className="flex justify-end"
                        >
                          <div className="max-w-[78%] rounded-2xl rounded-br-md bg-[#C6FF32] px-4 py-2.5 text-[#030608] sm:max-w-[70%]">
                            <p className="whitespace-pre-wrap text-[13px] font-medium leading-[1.65]">
                              {item.content}
                            </p>
                          </div>
                        </div>
                      );
                    }

                    return (
                      <div
                        key={`${item.role}-${index}`}
                        className="flex items-start gap-3"
                      >
                        <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#C6FF32] text-[#030608]">
                          <Bot className="h-3.5 w-3.5" />
                        </div>

                        <div className="min-w-0 max-w-[720px] flex-1">
                          <div className="mb-1.5 flex items-center gap-2">
                            <span className="text-[10px] font-black uppercase tracking-[0.14em] text-white/28">
                              HSAKAA
                            </span>
                          </div>

                          <p className="whitespace-pre-wrap text-[13px] font-normal leading-[1.75] text-white/72">
                            {item.content}
                          </p>
                        </div>
                      </div>
                    );
                  },
                )}

                {isLoading && (
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-[#C6FF32] text-[#030608]">
                      <Bot className="h-3.5 w-3.5" />
                    </div>

                    <div className="pt-1">
                      <div className="flex items-center gap-1.5">
                        {[0, 0.2, 0.4].map(
                          (delay) => (
                            <motion.span
                              key={delay}
                              animate={{
                                opacity: [
                                  0.25,
                                  1,
                                  0.25,
                                ],
                              }}
                              transition={{
                                duration:
                                  1.2,
                                delay,
                                repeat:
                                  Infinity,
                              }}
                              className="h-1.5 w-1.5 rounded-full bg-white/50"
                            />
                          ),
                        )}
                      </div>
                    </div>
                  </div>
                )}

                <div
                  ref={messagesEndRef}
                />
              </div>
            </div>
          </div>

          {/* COMPOSER */}

          <div className="shrink-0 border-t border-white/[0.06] bg-[#030608]/98 px-4 pb-3 pt-3 backdrop-blur-xl md:px-6 md:pb-5">
            <div className="mx-auto max-w-[820px]">
              <div className="rounded-2xl border border-white/[0.10] bg-[#0B0F10] p-2 shadow-[0_20px_60px_rgba(0,0,0,0.35)] transition focus-within:border-white/[0.18]">
                <div className="flex items-end gap-2">
                  <textarea
                    ref={textareaRef}
                    value={message}
                    rows={1}
                    disabled={
                      isLoading
                    }
                    placeholder={`Ask HSAKAA about ${activeMode.toLowerCase()}...`}
                    onChange={(
                      event,
                    ) =>
                      setMessage(
                        event.target
                          .value,
                      )
                    }
                    onKeyDown={
                      handleTextareaKeyDown
                    }
                    className="max-h-40 min-h-[42px] min-w-0 flex-1 resize-none overflow-y-auto bg-transparent px-3 py-2.5 text-[13px] leading-[1.6] text-white outline-none placeholder:text-white/22 disabled:cursor-not-allowed disabled:opacity-50"
                  />

                  <motion.button
                    type="button"
                    aria-label="Send message"
                    onClick={() =>
                      sendMessage()
                    }
                    disabled={
                      !message.trim() ||
                      isLoading
                    }
                    whileHover={
                      message.trim() &&
                      !isLoading
                        ? {
                            scale:
                              1.04,
                          }
                        : undefined
                    }
                    whileTap={
                      message.trim() &&
                      !isLoading
                        ? {
                            scale:
                              0.96,
                          }
                        : undefined
                    }
                    className="mb-0.5 grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-[#C6FF32] text-[#030608] transition disabled:cursor-not-allowed disabled:bg-white/[0.08] disabled:text-white/20"
                  >
                    <Send className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>

              <p className="mt-2 text-center text-[9px] text-white/18">
                Enter to send · Shift +
                Enter for a new line
              </p>
            </div>
          </div>
        </section>

        {/* DESKTOP RIGHT CONTEXT */}

        <aside className="hidden h-full min-h-0 overflow-y-auto border-l border-white/[0.07] bg-[#030608] px-5 py-5 xl:block">
          {/* TAKEOVER STATUS */}

          <TakeoverCountdown />

          {/* LIVE CONTEXT */}

          <div className="mt-8">
            <div className="flex items-start justify-between gap-3">
              <Eyebrow>
                Live Context
              </Eyebrow>

              {relativeNowTime && (
                <span className="shrink-0 pt-0.5 text-[8px] font-medium text-white/20">
                  {relativeNowTime}
                </span>
              )}
            </div>

            <p className="mt-3 text-[10px] leading-5 text-white/28">
              A live snapshot of what
              is currently shaping
              Aakash&apos;s attention.
            </p>

            {liveContext.length >
            0 ? (
              <div className="mt-6 divide-y divide-white/[0.06] border-y border-white/[0.06]">
                {liveContext.map(
                  (item) => (
                    <button
                      key={`${item.label}-${item.value}`}
                      type="button"
                      disabled={
                        isLoading
                      }
                      onClick={() =>
                        sendMessage(
                          `Tell me about Aakash's current ${item.label.toLowerCase()}: ${item.value}`,
                        )
                      }
                      className="group w-full py-4 text-left disabled:cursor-not-allowed disabled:opacity-40"
                    >
                      <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-white/20 transition group-hover:text-[#C6FF32]/60">
                        {item.label}
                      </p>

                      <p className="mt-1.5 text-[12px] font-semibold leading-5 text-white/55 transition group-hover:text-white">
                        {item.value}
                      </p>
                    </button>
                  ),
                )}
              </div>
            ) : (
              <div className="mt-6 border-y border-white/[0.06] py-5">
                <p className="text-[10px] leading-5 text-white/25">
                  Aakash hasn&apos;t
                  shared a live status
                  right now.
                </p>
              </div>
            )}
          </div>
        </aside>
      </div>
    </main>
  );
}