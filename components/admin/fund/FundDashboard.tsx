"use client";

import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  CircleDollarSign,
  Clock3,
  FileText,
  HandCoins,
  Loader2,
  Mail,
  RefreshCw,
  Search,
  ShieldAlert,
  Smartphone,
  Tags,
  UserRound,
  WalletCards,
} from "lucide-react";

import {
  decideFundCase,
  fundEvidenceUrl,
  getFundCase,
  getFundDashboard,
  markFundPaid,
  overrideFundAmount,
  resendFundDecision,
  type FundCaseDetail,
  type FundCaseSummary,
  type FundDashboardData,
} from "@/lib/api/fund";

const panel = "rounded-[24px] border border-white/10 bg-white/[0.025]";
const input =
  "min-h-11 w-full rounded-[14px] border border-white/10 bg-[#080b0d] px-3 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#C6FF32]/45";

function money(value: number | null | undefined) {
  if (value === null || value === undefined) return "-";
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function dateTime(value: string | null | undefined) {
  if (!value) return "-";
  return new Date(value).toLocaleString("en-IN", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

function statusLabel(value: string) {
  return value.replaceAll("_", " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function causeLabel(value: string) {
  const labels: Record<string, string> = {
    unclassified: "Unclassified",
    medical_health: "Medical / health",
    education_learning: "Education / learning",
    essential_living: "Essential living",
    livelihood_employment: "Livelihood / employment",
    family_emergency: "Family emergency",
    accessibility_support: "Accessibility support",
    tools_equipment: "Tools / equipment",
    other: "Other",
  };
  return labels[value] || statusLabel(value);
}

function MetricCard({
  label,
  value,
  caption,
  icon: Icon,
}: {
  label: string;
  value: string;
  caption: string;
  icon: typeof HandCoins;
}) {
  return (
    <div className={`${panel} p-5`}>
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-white/30">{label}</p>
        <Icon className="h-4 w-4 text-[#C6FF32]" />
      </div>
      <p className="mt-3 text-2xl font-black tracking-[-0.03em]">{value}</p>
      <p className="mt-1 text-xs text-white/35">{caption}</p>
    </div>
  );
}

export function FundDashboard() {
  const [dashboard, setDashboard] = useState<FundDashboardData | null>(null);
  const [selectedId, setSelectedId] = useState("");
  const [detail, setDetail] = useState<FundCaseDetail | null>(null);
  const [query, setQuery] = useState("");
  const [reason, setReason] = useState("");
  const [amount, setAmount] = useState("");
  const [paymentReference, setPaymentReference] = useState("");
  const [paidAmount, setPaidAmount] = useState("");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");

  async function loadDashboard(preferredId?: string) {
    try {
      setError("");
      const next = await getFundDashboard();
      setDashboard(next);
      const nextId = preferredId || selectedId || next.cases[0]?.id || "";
      setSelectedId(nextId);
      if (nextId) {
        const nextDetail = await getFundCase(nextId);
        setDetail(nextDetail);
        setAmount(
          String(nextDetail.decision.assistanceAmount ?? nextDetail.suggestedAmount ?? ""),
        );
      } else {
        setDetail(null);
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load Fund dashboard.");
    }
  }

  useEffect(() => {
    void loadDashboard();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function selectCase(item: FundCaseSummary) {
    setSelectedId(item.id);
    setBusy("select");
    setError("");
    try {
      const next = await getFundCase(item.id);
      setDetail(next);
      setReason(next.decision.reason || "");
      setAmount(String(next.decision.assistanceAmount ?? next.suggestedAmount ?? ""));
      setPaymentReference(next.paymentReference || "");
      setPaidAmount(String(next.paidAmount ?? next.decision.assistanceAmount ?? ""));
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to load case.");
    } finally {
      setBusy(null);
    }
  }

  async function runDecision(action: "approve" | "needs_more_information" | "not_approve") {
    if (!detail) return;
    if (reason.trim().length < 10) {
      setError("Write a clear applicant-facing reason of at least 10 characters.");
      return;
    }

    setBusy(action);
    setError("");
    try {
      const next = await decideFundCase(detail.id, {
        action,
        reason: reason.trim(),
        ...(action === "approve" && Number(amount) > 0 ? { amount: Number(amount) } : {}),
      });
      setDetail(next);
      await loadDashboard(next.id);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to save decision.");
    } finally {
      setBusy(null);
    }
  }

  async function saveAmount() {
    if (!detail || !(Number(amount) > 0)) return;
    setBusy("amount");
    setError("");
    try {
      const next = await overrideFundAmount(detail.id, Number(amount));
      setDetail(next);
      await loadDashboard(next.id);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to override amount.");
    } finally {
      setBusy(null);
    }
  }

  async function markPaid() {
    if (!detail || paymentReference.trim().length < 3) {
      setError("Add the UTR or payment reference before marking paid.");
      return;
    }
    setBusy("paid");
    setError("");
    try {
      const next = await markFundPaid(detail.id, {
        paymentReference: paymentReference.trim(),
        ...(Number(paidAmount) > 0 ? { amount: Number(paidAmount) } : {}),
      });
      setDetail(next);
      await loadDashboard(next.id);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to mark payment.");
    } finally {
      setBusy(null);
    }
  }

  async function resend() {
    if (!detail) return;
    setBusy("resend");
    setError("");
    try {
      const next = await resendFundDecision(detail.id);
      setDetail(next);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "Unable to resend decision.");
    } finally {
      setBusy(null);
    }
  }

  const visibleCases = useMemo(() => {
    if (!dashboard) return [];
    const clean = query.trim().toLowerCase();
    if (!clean) return dashboard.cases;
    return dashboard.cases.filter((item) =>
      [
        item.caseReference,
        item.status,
        item.contact?.fullName,
        item.contact?.phone,
        item.contact?.email,
      ]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(clean)),
    );
  }, [dashboard, query]);

  if (!dashboard) {
    return (
      <div className={`${panel} grid min-h-72 place-items-center`}>
        <Loader2 className="h-6 w-6 animate-spin text-[#C6FF32]" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <MetricCard label="Allocation" value={money(dashboard.allocation)} caption={`${dashboard.month} monthly pool`} icon={HandCoins} />
        <MetricCard label="Available" value={money(dashboard.available)} caption="Not yet committed" icon={WalletCards} />
        <MetricCard label="Approved" value={money(dashboard.approved)} caption={`${dashboard.approvedCases} approved cases`} icon={CheckCircle2} />
        <MetricCard label="Committed" value={money(dashboard.committed)} caption="Approved and not marked paid" icon={Clock3} />
        <MetricCard label="Paid" value={money(dashboard.paid)} caption="Completed assistance" icon={CircleDollarSign} />
      </section>

      <section className={`${panel} p-5 sm:p-6`}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <Tags className="h-4 w-4 text-[#C6FF32]" />
              <h2 className="font-black">Cause intelligence</h2>
            </div>
            <p className="mt-2 text-xs leading-5 text-white/35">
              Internal analytics only. These categories describe application patterns and never determine eligibility.
            </p>
          </div>
          <p className="text-xs text-white/25">All-time case mix</p>
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {dashboard.causeAnalytics
            .filter((item) => item.cases > 0)
            .sort((left, right) => right.cases - left.cases)
            .map((item) => (
              <div key={item.category} className="rounded-[18px] border border-white/10 bg-white/[0.02] p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-sm font-black">{causeLabel(item.category)}</p>
                    <p className="mt-1 text-xs text-white/30">{item.cases} case{item.cases === 1 ? "" : "s"} · {item.approvedCases} approved</p>
                  </div>
                  <span className="rounded-full bg-[#C6FF32]/10 px-2.5 py-1 text-[10px] font-black text-[#C6FF32]">
                    {item.cases ? Math.round((item.approvedCases / item.cases) * 100) : 0}%
                  </span>
                </div>
                <div className="mt-4 grid grid-cols-3 gap-2 text-xs">
                  <div><p className="text-white/25">Requested</p><p className="mt-1 font-black text-white/60">{money(item.requestedAmount)}</p></div>
                  <div><p className="text-white/25">Approved</p><p className="mt-1 font-black text-white/60">{money(item.approvedAmount)}</p></div>
                  <div><p className="text-white/25">Paid</p><p className="mt-1 font-black text-white/60">{money(item.paidAmount)}</p></div>
                </div>
              </div>
            ))}
          {!dashboard.causeAnalytics.some((item) => item.cases > 0) ? (
            <p className="text-sm text-white/30">Cause patterns will appear after applications begin.</p>
          ) : null}
        </div>
      </section>

      {error ? (
        <div className="rounded-[18px] border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">{error}</div>
      ) : null}

      <div className="grid gap-6 2xl:grid-cols-[420px_minmax(0,1fr)]">
        <section className={`${panel} overflow-hidden`}>
          <div className="border-b border-white/10 p-4">
            <div className="flex items-center gap-2 rounded-[14px] border border-white/10 bg-[#080b0d] px-3">
              <Search className="h-4 w-4 text-white/30" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search cases, phone or email"
                className="min-h-11 flex-1 bg-transparent text-sm outline-none placeholder:text-white/20"
              />
              <button type="button" onClick={() => void loadDashboard()} className="p-2 text-white/35 hover:text-white" aria-label="Refresh cases">
                <RefreshCw className="h-4 w-4" />
              </button>
            </div>
          </div>
          <div className="max-h-[1100px] divide-y divide-white/5 overflow-y-auto">
            {visibleCases.map((item) => (
              <button
                type="button"
                key={item.id}
                onClick={() => void selectCase(item)}
                className={`w-full p-4 text-left transition hover:bg-white/[0.035] ${selectedId === item.id ? "bg-[#C6FF32]/[0.055]" : ""}`}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono text-xs font-black text-[#C6FF32]">{item.caseReference}</p>
                    <p className="mt-2 truncate text-sm font-black">{item.contact?.fullName || "Applicant not identified yet"}</p>
                    <p className="mt-1 text-xs text-white/35">{item.contact?.phone || item.contact?.email || "Contact not captured"}</p>
                  </div>
                  <span className="rounded-full bg-white/[0.06] px-2.5 py-1 text-[10px] font-black text-white/45">{statusLabel(item.status)}</span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-white/30">
                  <span>Requested {money(item.requestedAmount)}</span>
                  <span>{dateTime(item.createdAt)}</span>
                </div>
                <p className="mt-2 text-[10px] font-black uppercase tracking-[0.12em] text-white/25">
                  {causeLabel(item.causeCategory)} · {item.causeConfidence}% tag confidence
                </p>
              </button>
            ))}
          </div>
        </section>

        {detail ? (
          <section className="space-y-5">
            <div className={`${panel} p-5 sm:p-6`}>
              <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                <div>
                  <p className="font-mono text-sm font-black text-[#C6FF32]">{detail.caseReference}</p>
                  <h2 className="mt-2 text-2xl font-black tracking-[-0.03em]">{detail.contact?.fullName || "Unidentified applicant"}</h2>
                  <p className="mt-2 text-sm text-white/40">{statusLabel(detail.status)} {detail.prelaunchCase ? "• Prelaunch case" : ""}</p>
                  <div className="mt-3 rounded-[14px] border border-white/10 bg-white/[0.025] px-3 py-2.5">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/25">Internal cause tag · analytics only</p>
                    <p className="mt-1 text-sm font-black text-white/65">{causeLabel(detail.causeCategory)} <span className="font-normal text-white/30">({detail.causeConfidence}%)</span></p>
                    {detail.causeSummary ? <p className="mt-1 text-xs leading-5 text-white/35">{detail.causeSummary}</p> : null}
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center">
                  {[
                    ["Case", detail.caseConfidence],
                    ["Evidence", detail.evidenceConfidence],
                    ["Consistency", detail.consistency],
                  ].map(([label, value]) => (
                    <div key={String(label)} className="rounded-[16px] border border-white/10 bg-white/[0.025] px-3 py-3">
                      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/25">{label}</p>
                      <p className="mt-1 text-lg font-black">{value}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="grid gap-5 xl:grid-cols-2">
              <div className={`${panel} p-5`}>
                <div className="flex items-center gap-2"><UserRound className="h-4 w-4 text-[#C6FF32]" /><h3 className="font-black">Applicant contact</h3></div>
                <dl className="mt-4 space-y-3 text-sm">
                  <Row label="Full name" value={detail.contact?.fullName} />
                  <Row label="Phone" value={detail.contact?.phone} />
                  <Row label="Email" value={detail.contact?.email} />
                  <Row label="Preferred" value={detail.contact?.preferredContactMethod} />
                  <Row label="Captured" value={dateTime(detail.contactCapturedAt)} />
                  <Row label="Review target" value={dateTime(detail.reviewTargetAt)} />
                </dl>
              </div>

              <div className={`${panel} p-5`}>
                <div className="flex items-center gap-2"><WalletCards className="h-4 w-4 text-[#C6FF32]" /><h3 className="font-black">Payment destination</h3></div>
                <dl className="mt-4 space-y-3 text-sm">
                  <Row label="UPI" value={detail.payment?.upi} />
                  <Row label="Account" value={detail.payment?.bankAccount} />
                  <Row label="IFSC" value={detail.payment?.ifsc} />
                  <Row label="Account name" value={detail.payment?.accountHolderName} />
                  <Row label="Payment reference" value={detail.paymentReference} />
                </dl>
              </div>
            </div>

            <div className="grid gap-5 xl:grid-cols-3">
              <Insight title="Why it may succeed" items={detail.whyMaySucceed} icon={CheckCircle2} />
              <Insight title="Why it may not" items={detail.whyMayNot} icon={AlertTriangle} />
              <Insight title="Missing verification" items={detail.missingVerification} icon={ShieldAlert} />
            </div>

            <div className={`${panel} p-5`}>
              <div className="flex items-center gap-2"><ShieldAlert className="h-4 w-4 text-[#C6FF32]" /><h3 className="font-black">Risk and investigation signals</h3></div>
              <div className="mt-4 space-y-2">
                {detail.riskSignals.length ? detail.riskSignals.map((signal) => (
                  <div key={signal.code} className="rounded-[16px] border border-white/10 bg-white/[0.02] p-3">
                    <div className="flex items-center justify-between gap-3"><p className="text-xs font-black text-white/65">{signal.code}</p><span className="text-[10px] font-black uppercase text-white/30">{signal.severity}</span></div>
                    <p className="mt-2 text-xs leading-5 text-white/45">{signal.summary}</p>
                  </div>
                )) : <p className="text-sm text-white/30">No investigation signals recorded.</p>}
              </div>
            </div>

            <div className={`${panel} p-5`}>
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-2"><FileText className="h-4 w-4 text-[#C6FF32]" /><h3 className="font-black">Evidence</h3></div>
                <span className="text-xs text-white/30">{detail.evidence.length} files</span>
              </div>
              <div className="mt-4 space-y-3">
                {detail.evidence.length ? detail.evidence.map((item) => (
                  <div key={item.evidenceId} className="rounded-[18px] border border-white/10 bg-white/[0.02] p-4">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-black">{item.filename}</p>
                        <p className="mt-1 text-xs text-white/30">{item.mimeType} • {(item.size / 1024).toFixed(0)} KB</p>
                      </div>
                      <a href={fundEvidenceUrl(detail.id, item.evidenceId)} target="_blank" rel="noreferrer" className="rounded-[12px] border border-white/10 px-3 py-2 text-xs font-black text-white/60 hover:text-white">Open evidence</a>
                    </div>
                    {item.analysis ? (
                      <div className="mt-4 space-y-3 text-xs leading-5 text-white/45">
                        <p>{item.analysis.summary}</p>
                        {item.analysis.supportsClaims.length ? <p><span className="font-black text-white/65">Supports:</span> {item.analysis.supportsClaims.join("; ")}</p> : null}
                        {item.analysis.conflicts.length ? <p><span className="font-black text-white/65">Conflicts:</span> {item.analysis.conflicts.join("; ")}</p> : null}
                        {item.analysis.extractedFacts.length ? <p><span className="font-black text-white/65">Extracted:</span> {item.analysis.extractedFacts.join("; ")}</p> : null}
                      </div>
                    ) : <p className="mt-3 text-xs text-white/30">{item.analysisFailed ? "Automated analysis failed. Human inspection is still available." : "Evidence analysis pending."}</p>}
                  </div>
                )) : <p className="text-sm text-white/30">No supporting evidence uploaded yet.</p>}
              </div>
            </div>

            <div className={`${panel} p-5`}>
              <div className="flex items-center justify-between gap-4"><h3 className="font-black">Entire Fund conversation</h3><span className="text-xs text-white/30">{detail.messages.length} messages</span></div>
              <div className="mt-4 max-h-[620px] space-y-3 overflow-y-auto pr-1">
                {detail.messages.map((item) => (
                  <div key={item.id} className={`rounded-[18px] p-4 ${item.role === "user" ? "bg-[#C6FF32]/[0.07]" : "border border-white/10 bg-white/[0.02]"}`}>
                    <div className="flex items-center justify-between gap-3"><p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/30">{item.role}</p><p className="text-[10px] text-white/20">{dateTime(item.createdAt)}</p></div>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-white/60">{item.content}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className={`${panel} p-5 sm:p-6`}>
              <h3 className="font-black">Human review actions</h3>
              <div className="mt-5 grid gap-4 xl:grid-cols-[1fr_220px]">
                <textarea value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Clear applicant-facing reason for the decision" className={`${input} min-h-28 py-3`} />
                <div className="space-y-2">
                  <label className="text-xs font-black uppercase tracking-[0.16em] text-white/30">Assistance amount</label>
                  <input type="number" min="1" max="30000" value={amount} onChange={(event) => setAmount(event.target.value)} className={input} placeholder="Amount in INR" />
                  <button type="button" onClick={() => void saveAmount()} disabled={busy !== null || !(Number(amount) > 0)} className="w-full rounded-[13px] border border-white/10 px-3 py-2.5 text-xs font-black text-white/55 disabled:opacity-30">Override suggested amount</button>
                </div>
              </div>
              <div className="mt-4 grid gap-2 sm:grid-cols-3">
                <ActionButton label="Approve" active={busy === "approve"} onClick={() => void runDecision("approve")} className="bg-[#C6FF32] text-[#030608]" />
                <ActionButton label="Needs more information" active={busy === "needs_more_information"} onClick={() => void runDecision("needs_more_information")} className="border border-white/10 bg-white/[0.04] text-white" />
                <ActionButton label="Not approve" active={busy === "not_approve"} onClick={() => void runDecision("not_approve")} className="border border-red-400/20 bg-red-400/10 text-red-200" />
              </div>

              {detail.decision.type ? (
                <div className="mt-6 rounded-[18px] border border-white/10 bg-white/[0.02] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-3"><p className="text-sm font-black">Last review update: {statusLabel(detail.decision.type)}</p><p className="text-xs text-white/30">{dateTime(detail.decision.decidedAt)}</p></div>
                  <p className="mt-2 text-sm leading-6 text-white/50">{detail.decision.reason}</p>
                  <div className="mt-4 grid gap-3 sm:grid-cols-3">
                    <Delivery label="Email" status={detail.decision.delivery.emailStatus} icon={Mail} />
                    <Delivery label="WhatsApp" status={detail.decision.delivery.whatsappStatus} icon={Smartphone} />
                    <Delivery label="Manual contact" status={detail.decision.delivery.manualContactRequired ? "required" : "not required"} icon={UserRound} />
                  </div>
                  {detail.decision.delivery.lastError ? <p className="mt-3 text-xs leading-5 text-red-200/70">Delivery detail: {detail.decision.delivery.lastError}</p> : null}
                  <button type="button" onClick={() => void resend()} disabled={busy !== null} className="mt-4 rounded-[13px] border border-white/10 px-4 py-2.5 text-xs font-black text-white/60 disabled:opacity-30">{busy === "resend" ? "Resending..." : "Resend applicant decision"}</button>
                </div>
              ) : null}

              {detail.status === "approved" ? (
                <div className="mt-6 rounded-[18px] border border-[#C6FF32]/20 bg-[#C6FF32]/[0.04] p-4">
                  <p className="text-sm font-black">Mark assistance paid</p>
                  <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_180px_auto]">
                    <input value={paymentReference} onChange={(event) => setPaymentReference(event.target.value)} className={input} placeholder="UTR or payment reference" />
                    <input type="number" min="1" max="30000" value={paidAmount} onChange={(event) => setPaidAmount(event.target.value)} className={input} placeholder="Paid amount" />
                    <button type="button" onClick={() => void markPaid()} disabled={busy !== null} className="rounded-[14px] bg-white px-5 text-sm font-black text-[#030608] disabled:opacity-30">{busy === "paid" ? "Saving..." : "Mark paid"}</button>
                  </div>
                </div>
              ) : null}
            </div>
          </section>
        ) : (
          <div className={`${panel} grid min-h-72 place-items-center text-sm text-white/30`}>Select a Fund case.</div>
        )}
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string | null | undefined }) {
  return <div className="flex items-start justify-between gap-4"><dt className="text-white/30">{label}</dt><dd className="max-w-[65%] break-words text-right font-bold text-white/65">{value || "-"}</dd></div>;
}

function Insight({ title, items, icon: Icon }: { title: string; items: string[]; icon: typeof AlertTriangle }) {
  return (
    <div className={`${panel} p-5`}>
      <div className="flex items-center gap-2"><Icon className="h-4 w-4 text-[#C6FF32]" /><h3 className="font-black">{title}</h3></div>
      <ul className="mt-4 space-y-2 text-xs leading-5 text-white/45">
        {items.length ? items.map((item) => <li key={item} className="rounded-[14px] bg-white/[0.025] p-3">{item}</li>) : <li>No items recorded.</li>}
      </ul>
    </div>
  );
}

function ActionButton({ label, active, onClick, className }: { label: string; active: boolean; onClick: () => void; className: string }) {
  return <button type="button" disabled={active} onClick={onClick} className={`min-h-12 rounded-[14px] px-4 text-sm font-black disabled:opacity-50 ${className}`}>{active ? <span className="inline-flex items-center gap-2"><Loader2 className="h-4 w-4 animate-spin" />Saving</span> : label}</button>;
}

function Delivery({ label, status, icon: Icon }: { label: string; status: string; icon: typeof Mail }) {
  return <div className="rounded-[14px] bg-white/[0.03] p-3"><div className="flex items-center gap-2"><Icon className="h-3.5 w-3.5 text-[#C6FF32]" /><p className="text-xs font-black">{label}</p></div><p className="mt-1 text-xs text-white/35">{statusLabel(status)}</p></div>;
}
