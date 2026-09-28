"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import {
  ArrowUp,
  FileText,
  HandCoins,
  Loader2,
  LockKeyhole,
  Paperclip,
  ShieldCheck,
  UserCheck,
  X,
} from "lucide-react";

const SESSION_KEY = "hsakaa_fund_session_id";
const CASE_KEY = "hsakaa_fund_case_id";

type FundMessage = {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  createdAt?: string;
};

type FundStatus = {
  enabled: boolean;
  startsAt: string;
  prelaunchEnabled: boolean;
  monthlyAllocation: number;
  humanApprovalRequired: boolean;
  reviewTargetHours: number;
};

type FundChatResponse = {
  caseId: string;
  caseReference: string;
  status: string;
  message: string;
  reviewTargetAt: string | null;
  contactCaptureStarted: boolean;
};

type RestoreResponse = {
  caseId: string;
  caseReference: string;
  status: string;
  reviewTargetAt: string | null;
  messages: FundMessage[];
};

function currency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

async function responseError(response: Response, fallback: string) {
  const payload = (await response.json().catch(() => null)) as
    | { message?: string | string[] }
    | null;
  if (Array.isArray(payload?.message)) return payload.message.join(" ");
  return payload?.message || fallback;
}

export function FundChat() {
  const [status, setStatus] = useState<FundStatus | null>(null);
  const [sessionId, setSessionId] = useState("");
  const [caseId, setCaseId] = useState("");
  const [caseReference, setCaseReference] = useState("");
  const [reviewTargetAt, setReviewTargetAt] = useState<string | null>(null);
  const [messages, setMessages] = useState<FundMessage[]>([]);
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let active = true;

    async function boot() {
      try {
        const statusResponse = await fetch("/api/fund/status", { cache: "no-store" });
        if (!statusResponse.ok) {
          throw new Error(await responseError(statusResponse, "Unable to load Fund status."));
        }
        const nextStatus = (await statusResponse.json()) as FundStatus;
        if (!active) return;
        setStatus(nextStatus);

        const storedSession = localStorage.getItem(SESSION_KEY) || crypto.randomUUID();
        localStorage.setItem(SESSION_KEY, storedSession);
        setSessionId(storedSession);

        const storedCase = localStorage.getItem(CASE_KEY) || "";
        if (!storedCase || !nextStatus.enabled) return;

        const restore = await fetch(
          `/api/fund/cases/${encodeURIComponent(storedCase)}?sessionId=${encodeURIComponent(storedSession)}`,
          { cache: "no-store" },
        );
        if (!restore.ok) {
          if (restore.status === 404) localStorage.removeItem(CASE_KEY);
          return;
        }
        const restored = (await restore.json()) as RestoreResponse;
        if (!active) return;
        setCaseId(restored.caseId);
        setCaseReference(restored.caseReference);
        setReviewTargetAt(restored.reviewTargetAt);
        setMessages(restored.messages);
      } catch (caught) {
        if (!active) return;
        setError(caught instanceof Error ? caught.message : "Unable to open HSAKAA Fund.");
      }
    }

    void boot();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, busy, uploading]);

  async function sendMessage(event: FormEvent) {
    event.preventDefault();
    const clean = message.trim();
    if (!clean || !sessionId || busy || !status?.enabled) return;

    const localMessage: FundMessage = {
      id: crypto.randomUUID(),
      role: "user",
      content: clean,
      createdAt: new Date().toISOString(),
    };

    setMessages((current) => [...current, localMessage]);
    setMessage("");
    setBusy(true);
    setError("");

    try {
      const response = await fetch("/api/fund/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sessionId,
          caseId: caseId || undefined,
          message: clean,
        }),
      });
      if (!response.ok) {
        throw new Error(await responseError(response, "Unable to continue the Fund chat."));
      }

      const result = (await response.json()) as FundChatResponse;
      setCaseId(result.caseId);
      setCaseReference(result.caseReference);
      setReviewTargetAt(result.reviewTargetAt);
      localStorage.setItem(CASE_KEY, result.caseId);
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: result.message,
          createdAt: new Date().toISOString(),
        },
      ]);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to continue the Fund chat.");
    } finally {
      setBusy(false);
    }
  }

  async function uploadEvidence() {
    if (!caseId || !sessionId || !selectedFiles.length || uploading) return;
    setUploading(true);
    setError("");

    try {
      const form = new FormData();
      form.set("sessionId", sessionId);
      form.set("caseId", caseId);
      selectedFiles.forEach((file) => form.append("files", file));

      const response = await fetch("/api/fund/evidence", {
        method: "POST",
        body: form,
      });
      if (!response.ok) {
        throw new Error(await responseError(response, "Unable to upload evidence."));
      }

      const result = (await response.json()) as { message: string };
      setMessages((current) => [
        ...current,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: result.message,
          createdAt: new Date().toISOString(),
        },
      ]);
      setSelectedFiles([]);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to upload evidence.");
    } finally {
      setUploading(false);
    }
  }

  const opensAt = status?.startsAt
    ? new Date(status.startsAt).toLocaleString("en-IN", {
        dateStyle: "long",
        timeStyle: "short",
        timeZone: "Asia/Kolkata",
      })
    : "October 1, 2026";

  return (
    <main className="min-h-dvh bg-[#030608] px-4 pb-28 pt-28 text-white sm:px-6 lg:pb-16 lg:pt-32">
      <div className="mx-auto grid max-w-[1400px] gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
        <aside className="space-y-4">
          <section className="rounded-[28px] border border-[#C6FF32]/20 bg-[#C6FF32]/[0.045] p-6">
            <div className="grid h-12 w-12 place-items-center rounded-2xl bg-[#C6FF32] text-[#030608]">
              <HandCoins className="h-6 w-6" />
            </div>
            <p className="mt-5 text-xs font-black uppercase tracking-[0.24em] text-[#C6FF32]">
              HSAKAA Fund
            </p>
            <h1 className="mt-2 text-3xl font-black tracking-[-0.04em] sm:text-4xl">
              Tell HSAKAA what happened.
            </h1>
            <p className="mt-4 text-sm leading-6 text-white/55">
              The Fund starts with {currency(status?.monthlyAllocation ?? 30000)} each month. HSAKAA helps understand and verify the request, but every final decision is made by a human.
            </p>
          </section>

          <section className="space-y-3 rounded-[24px] border border-white/10 bg-white/[0.025] p-5 text-sm text-white/55">
            <div className="flex gap-3">
              <UserCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#C6FF32]" />
              <p>Human approval is required before any assistance is committed.</p>
            </div>
            <div className="flex gap-3">
              <LockKeyhole className="mt-0.5 h-4 w-4 shrink-0 text-[#C6FF32]" />
              <p>Contact, payment details, conversation content and evidence are stored encrypted in the Fund system.</p>
            </div>
            <div className="flex gap-3">
              <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-[#C6FF32]" />
              <p>Fund information is kept outside normal HSAKAA Memory.</p>
            </div>
          </section>

          {caseReference ? (
            <section className="rounded-[22px] border border-white/10 bg-white/[0.025] p-5">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-white/30">Case</p>
              <p className="mt-2 font-mono text-sm font-bold text-[#C6FF32]">{caseReference}</p>
              {reviewTargetAt ? (
                <p className="mt-3 text-xs leading-5 text-white/40">
                  Review target: within 24 hours of contact capture, currently {new Date(reviewTargetAt).toLocaleString("en-IN")}.
                </p>
              ) : null}
            </section>
          ) : null}
        </aside>

        <section className="flex min-h-[680px] flex-col overflow-hidden rounded-[30px] border border-white/10 bg-[#05090b] shadow-[0_30px_100px_rgba(0,0,0,0.35)]">
          <header className="border-b border-white/10 px-5 py-5 sm:px-7">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-black">HSAKAA Fund conversation</p>
                <p className="mt-1 text-xs text-white/35">Explain the situation naturally. HSAKAA will ask for what is needed next.</p>
              </div>
              <span className="rounded-full border border-white/10 bg-white/[0.04] px-3 py-1.5 text-[11px] font-bold text-white/45">
                Human reviewed
              </span>
            </div>
          </header>

          <div className="flex-1 space-y-4 overflow-y-auto px-4 py-6 sm:px-7">
            {!status ? (
              <div className="grid min-h-72 place-items-center text-white/40">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            ) : !status.enabled ? (
              <div className="mx-auto mt-20 max-w-xl rounded-[24px] border border-white/10 bg-white/[0.025] p-7 text-center">
                <HandCoins className="mx-auto h-8 w-8 text-[#C6FF32]" />
                <h2 className="mt-4 text-2xl font-black">Fund opens October 1, 2026</h2>
                <p className="mt-3 text-sm leading-6 text-white/45">Public applications open {opensAt}. Prelaunch testing is currently disabled.</p>
              </div>
            ) : messages.length === 0 ? (
              <div className="mx-auto max-w-2xl py-10">
                <div className="rounded-[24px] border border-white/10 bg-white/[0.025] p-6 text-sm leading-7 text-white/60">
                  <p className="font-bold text-white">Start with the problem, not a form.</p>
                  <p className="mt-2">Tell me what happened, who the assistance is for, how much you need, when you need it, and anything that can verify the situation. I will ask follow-up questions as the case develops.</p>
                </div>
              </div>
            ) : (
              messages.map((item) => (
                <div key={item.id} className={`flex ${item.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-[88%] whitespace-pre-wrap rounded-[22px] px-4 py-3 text-sm leading-6 sm:max-w-[76%] ${
                      item.role === "user"
                        ? "bg-[#C6FF32] text-[#030608]"
                        : "border border-white/10 bg-white/[0.035] text-white/70"
                    }`}
                  >
                    {item.content}
                  </div>
                </div>
              ))
            )}

            {busy ? (
              <div className="flex justify-start">
                <div className="flex items-center gap-2 rounded-[18px] border border-white/10 bg-white/[0.035] px-4 py-3 text-sm text-white/40">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Assessing what you shared
                </div>
              </div>
            ) : null}
            <div ref={bottomRef} />
          </div>

          {error ? (
            <div className="mx-4 mb-3 rounded-[16px] border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-200 sm:mx-7">
              {error}
            </div>
          ) : null}

          {selectedFiles.length ? (
            <div className="mx-4 mb-3 rounded-[18px] border border-white/10 bg-white/[0.025] p-3 sm:mx-7">
              <div className="flex flex-wrap gap-2">
                {selectedFiles.map((file) => (
                  <span key={`${file.name}-${file.size}`} className="inline-flex items-center gap-2 rounded-full bg-white/[0.06] px-3 py-2 text-xs text-white/60">
                    <FileText className="h-3.5 w-3.5" />
                    {file.name}
                    <button
                      type="button"
                      aria-label={`Remove ${file.name}`}
                      onClick={() => setSelectedFiles((current) => current.filter((entry) => entry !== file))}
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </span>
                ))}
              </div>
              <button
                type="button"
                disabled={uploading}
                onClick={uploadEvidence}
                className="mt-3 inline-flex min-h-10 items-center gap-2 rounded-[14px] bg-white px-4 text-xs font-black text-[#030608] disabled:opacity-50"
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Paperclip className="h-4 w-4" />}
                {uploading ? "Reviewing evidence" : "Upload and review evidence"}
              </button>
            </div>
          ) : null}

          <form onSubmit={sendMessage} className="border-t border-white/10 p-4 sm:p-5">
            <div className="flex items-end gap-2 rounded-[22px] border border-white/10 bg-[#080c0e] p-2 focus-within:border-[#C6FF32]/35">
              <input
                ref={fileInputRef}
                type="file"
                accept="application/pdf,image/jpeg,image/png,image/webp"
                multiple
                className="hidden"
                onChange={(event) => setSelectedFiles(Array.from(event.target.files || []).slice(0, 4))}
              />
              <button
                type="button"
                disabled={!caseId || !status?.enabled}
                onClick={() => fileInputRef.current?.click()}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-[16px] text-white/40 transition hover:bg-white/[0.05] hover:text-white disabled:opacity-20"
                aria-label="Attach evidence"
              >
                <Paperclip className="h-5 w-5" />
              </button>
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
                disabled={!status?.enabled || busy}
                placeholder="Tell HSAKAA what happened..."
                rows={1}
                maxLength={4000}
                className="max-h-40 min-h-11 flex-1 resize-none bg-transparent px-2 py-3 text-sm text-white outline-none placeholder:text-white/20 disabled:opacity-40"
              />
              <button
                type="submit"
                disabled={!message.trim() || busy || !status?.enabled}
                className="grid h-11 w-11 shrink-0 place-items-center rounded-[16px] bg-[#C6FF32] text-[#030608] disabled:opacity-30"
                aria-label="Send message"
              >
                {busy ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowUp className="h-5 w-5" />}
              </button>
            </div>
            <p className="mt-2 px-2 text-[11px] leading-5 text-white/25">
              Do not share passwords, PINs or OTPs. Payment details are collected only as a possible destination and do not indicate approval.
            </p>
          </form>
        </section>
      </div>
    </main>
  );
}
