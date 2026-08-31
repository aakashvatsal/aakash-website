"use client";

import {
  Activity,
  BookOpen,
  Bot,
  Brain,
  Building2,
  CalendarDays,
  CheckSquare2,
  ChevronDown,
  ChevronUp,
  Database,
  HeartPulse,
  Loader2,
  LockKeyhole,
  Network,
  Send,
  ShieldCheck,
  Sparkles,
  UserRound,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";

import {
  answerWithHsakaaContext,
  assembleHsakaaContext,
  getContextEnginePolicy,
} from "@/lib/api/context-engine";
import { KnowledgeGraphNodeType } from "@/types/knowledge-graph";
import type {
  ContextAnswerResponse,
  ContextAssemblyMode,
  ContextAssemblyResponse,
  ContextEnginePolicy,
  ContextPrivacyBoundary,
} from "@/types/context-engine";

const DOMAIN_OPTIONS = [
  { type: KnowledgeGraphNodeType.PERSON, label: "People", icon: UserRound },
  { type: KnowledgeGraphNodeType.COMPANY, label: "Companies", icon: Building2 },
  { type: KnowledgeGraphNodeType.DECISION, label: "Decisions", icon: Brain },
  { type: KnowledgeGraphNodeType.JOURNAL, label: "Journal", icon: CalendarDays },
  { type: KnowledgeGraphNodeType.MEMORY, label: "Memory", icon: Database },
  { type: KnowledgeGraphNodeType.BOOK, label: "Books", icon: BookOpen },
  { type: KnowledgeGraphNodeType.HIGHLIGHT, label: "Highlights", icon: Sparkles },
  { type: KnowledgeGraphNodeType.HEALTH, label: "Health", icon: HeartPulse },
  { type: KnowledgeGraphNodeType.MEDIA, label: "Media", icon: Activity },
  { type: KnowledgeGraphNodeType.TASK, label: "Tasks", icon: CheckSquare2 },
] as const;

const EXAMPLES = [
  "What decisions over the last six months affected 8lete, and who was involved?",
  "What books or highlights influenced ideas I later used in my companies?",
  "What patterns connect my workload, health, journal and deferred tasks?",
  "What should HSAKAA know about my current priorities across the Personal OS?",
];

function percent(value: number) {
  return `${Math.round(value * 100)}%`;
}

function formatDate(value: string | null | undefined) {
  if (!value) return "Undated";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "Undated";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function confidenceClass(confidence: "high" | "medium" | "low") {
  if (confidence === "high") return "text-[#C6FF32]";
  if (confidence === "medium") return "text-amber-200";
  return "text-rose-200";
}

export function ContextEngineWorkspace() {
  const [question, setQuestion] = useState("");
  const [boundary, setBoundary] = useState<ContextPrivacyBoundary>("private");
  const [mode, setMode] = useState<ContextAssemblyMode>("balanced");
  const [selectedTypes, setSelectedTypes] = useState<KnowledgeGraphNodeType[]>([]);
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [maxEvidence, setMaxEvidence] = useState(24);
  const [contextBudgetChars, setContextBudgetChars] = useState(18000);
  const [answerStyle, setAnswerStyle] = useState("");
  const [packet, setPacket] = useState<ContextAssemblyResponse | null>(null);
  const [answer, setAnswer] = useState<ContextAnswerResponse | null>(null);
  const [policy, setPolicy] = useState<ContextEnginePolicy | null>(null);
  const [loading, setLoading] = useState<"assemble" | "answer" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showRawContext, setShowRawContext] = useState(false);

  useEffect(() => {
    void getContextEnginePolicy()
      .then(setPolicy)
      .catch(() => undefined);
  }, []);

  const activePacket = answer ?? packet;

  const budgetLabel = useMemo(() => {
    if (!activePacket) return `${Math.round(contextBudgetChars / 1000)}k chars`;
    return `${activePacket.budget.usedChars.toLocaleString("en-IN")} / ${activePacket.budget.maxChars.toLocaleString("en-IN")} chars`;
  }, [activePacket, contextBudgetChars]);

  function toggleType(type: KnowledgeGraphNodeType) {
    setSelectedTypes((current) =>
      current.includes(type)
        ? current.filter((item) => item !== type)
        : [...current, type],
    );
  }

  function payload(nextQuestion = question) {
    return {
      question: nextQuestion.trim(),
      boundary,
      mode,
      types: selectedTypes.length ? selectedTypes : undefined,
      from: from || undefined,
      to: to || undefined,
      maxEvidence,
      contextBudgetChars,
      answerStyle: answerStyle.trim() || undefined,
    };
  }

  async function assemble(nextQuestion = question) {
    const trimmed = nextQuestion.trim();
    if (!trimmed) return;
    setLoading("assemble");
    setError(null);
    setAnswer(null);
    try {
      const result = await assembleHsakaaContext(payload(trimmed));
      setPacket(result);
      setQuestion(trimmed);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Context assembly failed.");
    } finally {
      setLoading(null);
    }
  }

  async function ask(nextQuestion = question) {
    const trimmed = nextQuestion.trim();
    if (!trimmed) return;
    setLoading("answer");
    setError(null);
    try {
      const result = await answerWithHsakaaContext(payload(trimmed));
      setAnswer(result);
      setPacket(result);
      setQuestion(trimmed);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "HSAKAA context answer failed.");
    } finally {
      setLoading(null);
    }
  }

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    void assemble();
  }

  return (
    <section className="space-y-5">
      <div className="grid gap-4 xl:grid-cols-[1.4fr_1fr]">
        <div className="rounded-[26px] border border-[#C6FF32]/15 bg-[#C6FF32]/[0.035] p-5">
          <div className="flex items-start gap-3">
            <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-[#C6FF32] text-black">
              <Network className="h-5 w-5" />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <p className="font-black text-white">Canonical context assembler</p>
                {policy?.canonicalAssembler && (
                  <span className="rounded-full border border-[#C6FF32]/20 bg-[#C6FF32]/10 px-2.5 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#C6FF32]">
                    Active
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm leading-6 text-white/45">
                Universal Search retrieves candidates. This layer chooses the domains, balances evidence, applies privacy and budget rules, checks for conflicts, and emits one citation-ready context packet.
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-[26px] border border-white/10 bg-white/[0.025] p-5">
          <div className="flex items-center gap-3">
            {boundary === "private" ? (
              <LockKeyhole className="h-5 w-5 text-[#C6FF32]" />
            ) : (
              <ShieldCheck className="h-5 w-5 text-[#C6FF32]" />
            )}
            <div>
              <p className="font-bold text-white">
                {boundary === "private" ? "Owner-only boundary" : "Public-safe boundary"}
              </p>
              <p className="mt-1 text-xs leading-5 text-white/40">
                {boundary === "private"
                  ? "Owner-only and public-safe evidence may be assembled."
                  : "Owner-only evidence is removed before context packing."}
              </p>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={submit} className="rounded-[28px] border border-white/10 bg-white/[0.025] p-5 md:p-6">
        <label className="block">
          <span className="text-xs font-black uppercase tracking-[0.16em] text-white/40">
            Ask the Personal OS
          </span>
          <textarea
            value={question}
            onChange={(event) => setQuestion(event.currentTarget.value)}
            rows={4}
            placeholder="Ask a cross-domain question. HSAKAA will decide which Personal OS context actually matters."
            className="mt-3 w-full resize-y rounded-2xl border border-white/10 bg-black/20 px-4 py-4 text-sm leading-7 text-white outline-none placeholder:text-white/25 focus:border-[#C6FF32]/40"
          />
        </label>

        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
          <select
            value={boundary}
            onChange={(event) => setBoundary(event.currentTarget.value as ContextPrivacyBoundary)}
            className="min-h-11 rounded-xl border border-white/10 bg-[#090d0f] px-3 text-sm text-white outline-none"
          >
            <option value="private">Boundary: private</option>
            <option value="public">Boundary: public-safe</option>
          </select>

          <select
            value={mode}
            onChange={(event) => setMode(event.currentTarget.value as ContextAssemblyMode)}
            className="min-h-11 rounded-xl border border-white/10 bg-[#090d0f] px-3 text-sm text-white outline-none"
          >
            <option value="balanced">Mode: balanced</option>
            <option value="fresh">Mode: favor recency</option>
            <option value="authoritative">Mode: favor importance</option>
            <option value="compact">Mode: compact</option>
          </select>

          <input
            type="date"
            value={from}
            onChange={(event) => setFrom(event.currentTarget.value)}
            aria-label="Context from date"
            className="min-h-11 rounded-xl border border-white/10 bg-[#090d0f] px-3 text-sm text-white outline-none"
          />

          <input
            type="date"
            value={to}
            onChange={(event) => setTo(event.currentTarget.value)}
            aria-label="Context to date"
            className="min-h-11 rounded-xl border border-white/10 bg-[#090d0f] px-3 text-sm text-white outline-none"
          />
        </div>

        <div className="mt-4 grid gap-4 lg:grid-cols-2">
          <label className="rounded-2xl border border-white/10 bg-black/15 p-4">
            <span className="flex items-center justify-between text-xs font-bold text-white/55">
              <span>Evidence limit</span>
              <span className="text-white">{maxEvidence}</span>
            </span>
            <input
              type="range"
              min={5}
              max={60}
              step={1}
              value={maxEvidence}
              onChange={(event) => setMaxEvidence(Number(event.currentTarget.value))}
              className="mt-3 w-full accent-[#C6FF32]"
            />
          </label>

          <label className="rounded-2xl border border-white/10 bg-black/15 p-4">
            <span className="flex items-center justify-between text-xs font-bold text-white/55">
              <span>Hard context budget</span>
              <span className="text-white">{budgetLabel}</span>
            </span>
            <input
              type="range"
              min={4000}
              max={60000}
              step={1000}
              value={contextBudgetChars}
              onChange={(event) => setContextBudgetChars(Number(event.currentTarget.value))}
              className="mt-3 w-full accent-[#C6FF32]"
            />
          </label>
        </div>

        <div className="mt-5">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.16em] text-white/40">
                Domain routing override
              </p>
              <p className="mt-1 text-xs text-white/30">
                Leave everything unselected to let HSAKAA route automatically.
              </p>
            </div>
            {selectedTypes.length > 0 && (
              <button
                type="button"
                onClick={() => setSelectedTypes([])}
                className="text-xs font-bold text-[#C6FF32]"
              >
                Use automatic routing
              </button>
            )}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {DOMAIN_OPTIONS.map(({ type, label, icon: Icon }) => {
              const selected = selectedTypes.includes(type);
              return (
                <button
                  key={type}
                  type="button"
                  onClick={() => toggleType(type)}
                  className={`inline-flex items-center gap-2 rounded-xl border px-3 py-2 text-xs font-bold transition ${
                    selected
                      ? "border-[#C6FF32]/35 bg-[#C6FF32]/10 text-[#C6FF32]"
                      : "border-white/10 bg-white/[0.025] text-white/45 hover:text-white"
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <label className="mt-5 block">
          <span className="text-xs font-black uppercase tracking-[0.16em] text-white/40">
            Optional answer style
          </span>
          <input
            value={answerStyle}
            onChange={(event) => setAnswerStyle(event.currentTarget.value)}
            placeholder="Example: concise executive summary with decisions first"
            className="mt-2 min-h-11 w-full rounded-xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#C6FF32]/40"
          />
        </label>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <button
            type="submit"
            disabled={loading !== null || !question.trim()}
            className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/[0.05] px-5 text-sm font-black text-white disabled:opacity-50"
          >
            {loading === "assemble" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Network className="h-4 w-4" />
            )}
            Assemble context only
          </button>
          <button
            type="button"
            onClick={() => void ask()}
            disabled={loading !== null || !question.trim()}
            className="inline-flex min-h-12 flex-1 items-center justify-center gap-2 rounded-2xl bg-[#C6FF32] px-5 text-sm font-black text-black disabled:opacity-50"
          >
            {loading === "answer" ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Ask through Context Engine
          </button>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {EXAMPLES.map((example) => (
            <button
              key={example}
              type="button"
              onClick={() => {
                setQuestion(example);
                void assemble(example);
              }}
              disabled={loading !== null}
              className="rounded-full border border-white/10 px-3 py-2 text-left text-xs text-white/45 transition hover:border-[#C6FF32]/25 hover:text-white disabled:opacity-50"
            >
              {example}
            </button>
          ))}
        </div>
      </form>

      {error && (
        <div className="rounded-2xl border border-rose-400/20 bg-rose-400/10 px-5 py-4 text-sm text-rose-100">
          {error}
        </div>
      )}

      {activePacket && (
        <>
          {answer && (
            <div className="rounded-[28px] border border-[#C6FF32]/20 bg-[#C6FF32]/[0.04] p-5 md:p-6">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-2xl bg-[#C6FF32] text-black">
                    <Bot className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-black text-white">HSAKAA grounded answer</p>
                    <p className={`mt-1 text-xs font-bold uppercase tracking-[0.14em] ${confidenceClass(answer.answer.confidence)}`}>
                      {answer.answer.confidence} confidence
                    </p>
                  </div>
                </div>
                {answer.ai && (
                  <span className="text-xs text-white/30">{answer.ai.model}</span>
                )}
              </div>

              <p className="mt-5 whitespace-pre-wrap text-sm leading-7 text-white/75">
                {answer.answer.answer}
              </p>

              {!!answer.answer.citations.length && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {answer.answer.citations.map((citation) => (
                    <span
                      key={citation}
                      className="rounded-lg border border-[#C6FF32]/20 bg-black/20 px-2.5 py-1 text-xs font-black text-[#C6FF32]"
                    >
                      [{citation}]
                    </span>
                  ))}
                </div>
              )}

              {!!answer.answer.caveats.length && (
                <div className="mt-5 border-t border-white/10 pt-4">
                  <p className="text-xs font-black uppercase tracking-[0.14em] text-white/35">Caveats</p>
                  <ul className="mt-2 space-y-1 text-xs leading-5 text-white/45">
                    {answer.answer.caveats.map((caveat) => (
                      <li key={caveat}>• {caveat}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <Metric label="Context confidence" value={activePacket.confidence.toUpperCase()} accent />
            <Metric label="Evidence selected" value={String(activePacket.retrieval.selectedEvidence)} />
            <Metric label="Domain coverage" value={percent(activePacket.coverage.ratio)} />
            <Metric label="Budget used" value={percent(activePacket.budget.utilization)} />
            <Metric label="Est. tokens" value={activePacket.budget.estimatedTokens.toLocaleString("en-IN")} />
          </div>

          <div className="grid gap-5 xl:grid-cols-[1fr_1.5fr]">
            <div className="space-y-5">
              <div className="rounded-[26px] border border-white/10 bg-white/[0.025] p-5">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-black text-white">Domain routing</p>
                    <p className="mt-1 text-xs text-white/35">
                      {activePacket.routing.automatic ? "Automatic routing" : "Caller override"}
                    </p>
                  </div>
                  <Brain className="h-5 w-5 text-[#C6FF32]" />
                </div>
                <div className="mt-4 space-y-3">
                  {activePacket.routing.domains.map((route) => (
                    <div key={route.type} className="rounded-2xl border border-white/8 bg-black/20 p-3">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-bold capitalize text-white">{route.type}</span>
                        <span className="text-xs font-black text-[#C6FF32]">{percent(route.score)}</span>
                      </div>
                      <p className="mt-1 text-xs leading-5 text-white/35">{route.reason}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-[26px] border border-white/10 bg-white/[0.025] p-5">
                <p className="font-black text-white">Retrieval diagnostics</p>
                <div className="mt-4 space-y-2 text-xs text-white/45">
                  <Diagnostic label="Search candidates" value={activePacket.retrieval.candidates} />
                  <Diagnostic label="Privacy eligible" value={activePacket.retrieval.privacyEligible} />
                  <Diagnostic label="After dedupe" value={activePacket.retrieval.afterDeduplication} />
                  <Diagnostic label="Budget omissions" value={activePacket.retrieval.omittedByBudget} />
                  <Diagnostic label="Limit omissions" value={activePacket.retrieval.omittedByLimit} />
                  <Diagnostic
                    label="Semantic retrieval"
                    value={activePacket.retrieval.semantic.available ? "available" : "degraded"}
                  />
                </div>
                {activePacket.retrieval.semantic.degradedReason && (
                  <p className="mt-3 rounded-xl border border-amber-300/15 bg-amber-300/[0.04] px-3 py-2 text-xs leading-5 text-amber-100/60">
                    {activePacket.retrieval.semantic.degradedReason}
                  </p>
                )}
              </div>

              <div className="rounded-[26px] border border-white/10 bg-white/[0.025] p-5">
                <p className="font-black text-white">Contradiction firewall</p>
                {activePacket.contradictions.length ? (
                  <div className="mt-4 space-y-3">
                    {activePacket.contradictions.map((contradiction) => (
                      <div key={contradiction.id} className="rounded-2xl border border-amber-300/15 bg-amber-300/[0.04] p-3">
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-xs font-black text-amber-100">{contradiction.id}</span>
                          <span className="text-[10px] font-black uppercase tracking-[0.12em] text-amber-100/50">
                            {contradiction.severity}
                          </span>
                        </div>
                        <p className="mt-2 text-xs leading-5 text-amber-50/60">{contradiction.reason}</p>
                        <p className="mt-2 text-[11px] text-white/30">{contradiction.citationIds.join(" · ")}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="mt-3 text-xs leading-5 text-white/35">
                    No deterministic contradiction signal was found in the selected evidence. HSAKAA is still instructed to preserve uncertainty.
                  </p>
                )}
              </div>
            </div>

            <div className="space-y-5">
              <div className="rounded-[26px] border border-white/10 bg-white/[0.025] p-5">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-black text-white">Evidence packet</p>
                    <p className="mt-1 text-xs text-white/35">
                      Every block has a stable citation and source attribution.
                    </p>
                  </div>
                  <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/40">
                    {activePacket.evidence.length} blocks
                  </span>
                </div>

                <div className="mt-4 space-y-3">
                  {activePacket.evidence.map((item) => (
                    <article key={item.citationId} className="rounded-2xl border border-white/8 bg-black/20 p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-lg bg-[#C6FF32] px-2 py-1 text-[10px] font-black text-black">
                              {item.citationId}
                            </span>
                            <span className="text-[10px] font-black uppercase tracking-[0.14em] text-white/30">
                              {item.type}
                            </span>
                            <span className="text-[10px] text-white/25">{item.privacy}</span>
                          </div>
                          <h3 className="mt-2 font-bold text-white">{item.label}</h3>
                        </div>
                        <div className="text-right text-[11px] text-white/30">
                          <p>{formatDate(item.occurredAt)}</p>
                          <p className="mt-1">score {percent(item.contextScore)}</p>
                        </div>
                      </div>

                      {(item.summary || item.snippet) && (
                        <p className="mt-3 text-xs leading-6 text-white/50">
                          {item.summary || item.snippet}
                        </p>
                      )}

                      <div className="mt-3 flex flex-wrap gap-1.5">
                        {item.matchReasons.map((reason) => (
                          <span key={reason} className="rounded-lg border border-white/8 px-2 py-1 text-[10px] text-white/30">
                            {reason}
                          </span>
                        ))}
                      </div>

                      <p className="mt-3 break-all border-t border-white/8 pt-3 text-[10px] text-white/25">
                        {item.source.collection}/{item.source.id}
                      </p>
                    </article>
                  ))}
                </div>
              </div>

              <div className="rounded-[26px] border border-white/10 bg-white/[0.025] p-5">
                <button
                  type="button"
                  onClick={() => setShowRawContext((current) => !current)}
                  className="flex w-full items-center justify-between gap-3 text-left"
                >
                  <div>
                    <p className="font-black text-white">Final context payload</p>
                    <p className="mt-1 text-xs text-white/35">
                      {activePacket.budget.estimatedTokens.toLocaleString("en-IN")} estimated tokens · {percent(activePacket.budget.utilization)} of budget
                    </p>
                  </div>
                  {showRawContext ? (
                    <ChevronUp className="h-4 w-4 text-white/35" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-white/35" />
                  )}
                </button>
                {showRawContext && (
                  <pre className="mt-4 max-h-[520px] overflow-auto whitespace-pre-wrap rounded-2xl border border-white/8 bg-black/30 p-4 text-[11px] leading-5 text-white/45">
                    {activePacket.context}
                  </pre>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </section>
  );
}

function Metric({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: string;
  accent?: boolean;
}) {
  return (
    <div className="rounded-[22px] border border-white/10 bg-white/[0.025] p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white/30">{label}</p>
      <p className={`mt-2 text-xl font-black ${accent ? "text-[#C6FF32]" : "text-white"}`}>{value}</p>
    </div>
  );
}

function Diagnostic({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-white/5 py-2 last:border-b-0">
      <span>{label}</span>
      <span className="font-bold text-white/70">{value}</span>
    </div>
  );
}
