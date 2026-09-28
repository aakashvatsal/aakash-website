const BASE = "/api/admin/backend/hsakaa/private/fund";

export type FundContact = {
  fullName?: string | null;
  phone?: string | null;
  email?: string | null;
  preferredContactMethod?: "email" | "whatsapp" | "phone" | null;
} | null;

export type FundPayment = {
  upi?: string | null;
  bankAccount?: string | null;
  ifsc?: string | null;
  accountHolderName?: string | null;
} | null;


export type FundCauseCategory =
  | "unclassified"
  | "medical_health"
  | "education_learning"
  | "essential_living"
  | "livelihood_employment"
  | "family_emergency"
  | "accessibility_support"
  | "tools_equipment"
  | "other";

export type FundCauseAnalytics = {
  category: FundCauseCategory;
  cases: number;
  approvedCases: number;
  requestedAmount: number;
  approvedAmount: number;
  paidAmount: number;
};

export type FundRiskSignal = {
  code: string;
  summary: string;
  severity: "low" | "medium" | "high";
};

export type FundCaseSummary = {
  id: string;
  caseReference: string;
  status: string;
  contact: FundContact;
  payment: FundPayment;
  requestedAmount: number | null;
  suggestedAmount: number | null;
  causeCategory: FundCauseCategory;
  causeConfidence: number;
  causeSummary: string | null;
  caseConfidence: number;
  evidenceConfidence: number;
  consistency: number;
  riskSignals: FundRiskSignal[];
  whyMaySucceed: string[];
  whyMayNot: string[];
  missingVerification: string[];
  contactCapturedAt: string | null;
  reviewTargetAt: string | null;
  decision: {
    type: string | null;
    reason: string | null;
    assistanceAmount: number | null;
    decidedAt: string | null;
    decisionMonthKey: string | null;
    delivery: {
      emailStatus: string;
      whatsappStatus: string;
      manualContactRequired: boolean;
      lastAttemptAt?: string;
      lastError?: string;
    };
  };
  paidAt: string | null;
  paidAmount: number | null;
  paymentReference: string | null;
  prelaunchCase: boolean;
  createdAt: string | null;
  updatedAt: string | null;
};

export type FundCaseDetail = FundCaseSummary & {
  messages: Array<{
    id: string;
    role: "user" | "assistant" | "system";
    content: string;
    createdAt: string;
  }>;
  evidence: Array<{
    evidenceId: string;
    filename: string;
    mimeType: string;
    size: number;
    analyzedAt: string | null;
    analysisFailed: boolean;
    analysis: null | {
      summary: string;
      evidenceConfidence: number;
      consistency: number;
      supportsClaims: string[];
      conflicts: string[];
      extractedFacts: string[];
      missingVerification: string[];
      riskSignals: FundRiskSignal[];
    };
  }>;
};

export type FundDashboardData = {
  month: string;
  startsAt: string;
  allocation: number;
  available: number;
  approved: number;
  committed: number;
  paid: number;
  approvedCases: number;
  causeAnalytics: FundCauseAnalytics[];
  cases: FundCaseSummary[];
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${BASE}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init?.body ? { "Content-Type": "application/json" } : {}),
      ...(init?.headers || {}),
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { message?: string | string[] }
      | null;
    const message = Array.isArray(payload?.message)
      ? payload.message.join(" ")
      : payload?.message;
    throw new Error(message || `Fund request failed (${response.status}).`);
  }

  return response.json() as Promise<T>;
}

export function getFundDashboard(month?: string) {
  const query = month ? `?month=${encodeURIComponent(month)}` : "";
  return request<FundDashboardData>(`/dashboard${query}`);
}

export function getFundCase(caseId: string) {
  return request<FundCaseDetail>(`/cases/${encodeURIComponent(caseId)}`);
}

export function decideFundCase(
  caseId: string,
  payload: {
    action: "approve" | "needs_more_information" | "not_approve";
    reason: string;
    amount?: number;
  },
) {
  return request<FundCaseDetail>(`/cases/${encodeURIComponent(caseId)}/decision`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function overrideFundAmount(caseId: string, amount: number) {
  return request<FundCaseDetail>(`/cases/${encodeURIComponent(caseId)}/amount`, {
    method: "PATCH",
    body: JSON.stringify({ amount }),
  });
}

export function markFundPaid(
  caseId: string,
  payload: { paymentReference: string; amount?: number },
) {
  return request<FundCaseDetail>(`/cases/${encodeURIComponent(caseId)}/paid`, {
    method: "PATCH",
    body: JSON.stringify(payload),
  });
}

export function resendFundDecision(caseId: string) {
  return request<FundCaseDetail>(
    `/cases/${encodeURIComponent(caseId)}/delivery/resend`,
    { method: "POST" },
  );
}

export function fundEvidenceUrl(caseId: string, evidenceId: string) {
  return `${BASE}/cases/${encodeURIComponent(caseId)}/evidence/${encodeURIComponent(evidenceId)}`;
}
