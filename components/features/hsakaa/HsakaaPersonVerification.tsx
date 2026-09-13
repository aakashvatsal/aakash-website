"use client";

import { LogOut, ShieldCheck, X } from "lucide-react";
import { useState } from "react";

import {
  logoutHsakaaPerson,
  requestHsakaaPersonOtp,
  verifyHsakaaPersonOtp,
} from "@/services/hsakaa.service";

import type { HsakaaVerifiedPerson } from "@/services/hsakaa.service";

interface HsakaaPersonVerificationProps {
  person: HsakaaVerifiedPerson | null;
  disabled?: boolean;
  onVerified: (person: HsakaaVerifiedPerson) => void;
  onLoggedOut: () => void;
}

export function HsakaaPersonVerification({
  person,
  disabled = false,
  onVerified,
  onLoggedOut,
}: HsakaaPersonVerificationProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [identifier, setIdentifier] = useState("");
  const [verificationSessionId, setVerificationSessionId] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function requestOtp() {
    const value = identifier.trim();
    if (!value) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await requestHsakaaPersonOtp(value);
      setVerificationSessionId(response.verificationSessionId);
      setOtp("");
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "Could not start verification.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function verifyOtp() {
    if (!verificationSessionId || !/^\d{6}$/.test(otp.trim())) return;

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await verifyHsakaaPersonOtp(verificationSessionId, otp.trim());
      onVerified(response.person);
      setIsOpen(false);
      setIdentifier("");
      setVerificationSessionId(null);
      setOtp("");
    } catch (verifyError) {
      setError(verifyError instanceof Error ? verifyError.message : "Verification failed.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function logout() {
    setIsSubmitting(true);
    setError(null);

    try {
      await logoutHsakaaPerson();
    } finally {
      setIsSubmitting(false);
      setIsOpen(false);
      setIdentifier("");
      setVerificationSessionId(null);
      setOtp("");
      onLoggedOut();
    }
  }

  return (
    <>
      <button
        type="button"
        disabled={disabled || isSubmitting}
        onClick={() => setIsOpen(true)}
        className={`flex shrink-0 items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-[10px] font-bold transition disabled:cursor-not-allowed disabled:opacity-40 ${
          person
            ? "border-[#C6FF32]/25 bg-[#C6FF32]/10 text-[#C6FF32]"
            : "border-white/[0.08] text-white/45 hover:border-white/15 hover:bg-white/[0.04] hover:text-white/75"
        }`}
      >
        <ShieldCheck className="h-3.5 w-3.5" />
        {person ? person.name : "Know me personally?"}
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-[100] grid place-items-center bg-black/75 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-2xl border border-white/[0.10] bg-[#090D0E] p-5 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#C6FF32]">
                  Personal verification
                </p>
                <h3 className="mt-2 text-lg font-black tracking-tight text-white">
                  {person ? `Verified as ${person.name}` : "Know Aakash personally?"}
                </h3>
                <p className="mt-2 text-[12px] leading-5 text-white/40">
                  {person
                    ? "This browser has a verified session. Person-specific memories are used only when Aakash has explicitly enabled access for you."
                    : "Use an email address or phone number that Aakash has already saved for you. If it matches, you’ll receive a one-time code."}
                </p>
              </div>

              <button
                type="button"
                aria-label="Close verification"
                onClick={() => setIsOpen(false)}
                className="grid h-8 w-8 shrink-0 place-items-center rounded-lg text-white/35 transition hover:bg-white/[0.05] hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {person ? (
              <div className="mt-5">
                <div className="rounded-xl border border-[#C6FF32]/15 bg-[#C6FF32]/[0.06] px-4 py-3 text-[11px] leading-5 text-white/55">
                  You can ask about Aakash and, where he has explicitly shared it with you, your recorded shared context. Health and Media remain excluded.
                </div>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={logout}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border border-white/[0.10] px-4 py-2.5 text-[11px] font-bold text-white/55 transition hover:bg-white/[0.04] hover:text-white disabled:opacity-40"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  End verified session
                </button>
              </div>
            ) : verificationSessionId ? (
              <div className="mt-5">
                <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/30">
                  6-digit code
                </label>
                <input
                  autoFocus
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={otp}
                  maxLength={6}
                  onChange={(event) => setOtp(event.target.value.replace(/\D/g, "").slice(0, 6))}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") void verifyOtp();
                  }}
                  className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/20 px-4 py-3 text-center text-lg font-black tracking-[0.35em] text-white outline-none transition focus:border-[#C6FF32]/40"
                  placeholder="000000"
                />

                <button
                  type="button"
                  disabled={isSubmitting || otp.length !== 6}
                  onClick={verifyOtp}
                  className="mt-3 w-full rounded-xl bg-[#C6FF32] px-4 py-2.5 text-[11px] font-black text-[#030608] transition disabled:cursor-not-allowed disabled:opacity-35"
                >
                  {isSubmitting ? "Verifying…" : "Verify me"}
                </button>

                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => {
                    setVerificationSessionId(null);
                    setOtp("");
                    setError(null);
                  }}
                  className="mt-2 w-full px-4 py-2 text-[10px] font-semibold text-white/30 transition hover:text-white/60"
                >
                  Use a different email or phone
                </button>
              </div>
            ) : (
              <div className="mt-5">
                <label className="text-[10px] font-bold uppercase tracking-[0.12em] text-white/30">
                  Email or phone
                </label>
                <input
                  autoFocus
                  value={identifier}
                  onChange={(event) => setIdentifier(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") void requestOtp();
                  }}
                  className="mt-2 w-full rounded-xl border border-white/[0.10] bg-black/20 px-4 py-3 text-[12px] text-white outline-none transition placeholder:text-white/20 focus:border-[#C6FF32]/40"
                  placeholder="you@example.com or +91…"
                />

                <button
                  type="button"
                  disabled={isSubmitting || identifier.trim().length < 3}
                  onClick={requestOtp}
                  className="mt-3 w-full rounded-xl bg-[#C6FF32] px-4 py-2.5 text-[11px] font-black text-[#030608] transition disabled:cursor-not-allowed disabled:opacity-35"
                >
                  {isSubmitting ? "Sending…" : "Send verification code"}
                </button>

                <p className="mt-3 text-[9px] leading-4 text-white/22">
                  For privacy, the response does not reveal whether an identity exists in Aakash’s People records.
                </p>
              </div>
            )}

            {error && (
              <p className="mt-3 rounded-lg border border-red-400/15 bg-red-400/[0.05] px-3 py-2 text-[10px] leading-4 text-red-200/75">
                {error}
              </p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
