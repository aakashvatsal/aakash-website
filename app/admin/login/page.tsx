"use client";

import {
  FormEvent,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  ArrowRight,
  Eye,
  EyeOff,
  Loader2,
  LockKeyhole,
} from "lucide-react";

import {
  loginAdmin,
} from "@/lib/api/admin-auth";

export default function AdminLoginPage() {
  const router = useRouter();

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    isSubmitting,
    setIsSubmitting,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState<string | null>(
    null,
  );

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    if (!password.trim()) {
      setError(
        "Enter the admin password.",
      );

      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await loginAdmin(password);

      router.replace("/admin");
      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to login.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#030608] px-4 py-12 text-white">
      <div className="w-full max-w-md">
        <div className="mb-8 flex justify-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-[18px] border border-[#C6FF32]/20 bg-[#C6FF32]/10 text-[#C6FF32]">
            <LockKeyhole className="h-6 w-6" />
          </div>
        </div>

        <div className="rounded-[28px] border border-white/10 bg-white/[0.025] p-6 shadow-2xl sm:p-8">
          <div className="text-center">
            <p className="text-[10px] font-black uppercase tracking-[0.25em] text-[#C6FF32]">
              HSAKAA
            </p>

            <h1 className="mt-4 text-3xl font-black tracking-[-0.04em] text-white">
              Admin access
            </h1>

            <p className="mx-auto mt-3 max-w-sm text-sm leading-6 text-white/40">
              Enter your admin password to access the
              private management system.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="mt-8"
          >
            <label
              htmlFor="admin-password"
              className="text-sm font-bold text-white/70"
            >
              Password
            </label>

            <div className="relative mt-2">
              <LockKeyhole className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />

              <input
                id="admin-password"
                type={
                  showPassword
                    ? "text"
                    : "password"
                }
                value={password}
                onChange={(event) => {
                  setPassword(
                    event.target.value,
                  );

                  if (error) {
                    setError(null);
                  }
                }}
                autoComplete="current-password"
                autoFocus
                disabled={isSubmitting}
                placeholder="Enter admin password"
                className="min-h-13 w-full rounded-[16px] border border-white/10 bg-[#05090b] py-3 pl-11 pr-12 text-sm text-white outline-none transition placeholder:text-white/20 focus:border-[#C6FF32]/40 focus:ring-1 focus:ring-[#C6FF32]/10 disabled:cursor-not-allowed disabled:opacity-50"
              />

              <button
                type="button"
                onClick={() =>
                  setShowPassword(
                    (current) =>
                      !current,
                  )
                }
                disabled={isSubmitting}
                aria-label={
                  showPassword
                    ? "Hide password"
                    : "Show password"
                }
                className="absolute right-3 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-xl text-white/30 transition hover:bg-white/[0.05] hover:text-white"
              >
                {showPassword ? (
                  <EyeOff className="h-4 w-4" />
                ) : (
                  <Eye className="h-4 w-4" />
                )}
              </button>
            </div>

            {error && (
              <div className="mt-4 rounded-[14px] border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={
                isSubmitting ||
                !password.trim()
              }
              className="mt-6 inline-flex min-h-13 w-full items-center justify-center gap-2 rounded-[16px] bg-[#C6FF32] px-5 text-sm font-black text-[#030608] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />

                  Signing in...
                </>
              ) : (
                <>
                  Enter admin

                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-xs text-white/20">
          Private administrative access
        </p>
      </div>
    </main>
  );
}