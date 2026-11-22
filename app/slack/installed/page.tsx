import Link from "next/link";

export default function SlackInstalledPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0d0e0d] px-6 text-white">
      <section className="w-full max-w-xl rounded-3xl border border-white/10 bg-white/[0.03] p-8 shadow-2xl">
        <div className="mb-5 text-sm font-extrabold tracking-[0.2em] text-[#C6FF32]">
          HSAKAA × SLACK
        </div>
        <h1 className="mb-4 text-3xl font-black">Installation received</h1>
        <p className="text-base leading-relaxed text-white/70">
          HSAKAA was installed in your Slack workspace. Your workspace must be
          approved by the HSAKAA administrator before the assistant can answer
          questions or perform permitted actions.
        </p>
        <p className="mt-4 text-sm leading-relaxed text-white/50">
          Until access is approved, messages to HSAKAA will receive: “Sorry,
          HSAKAA is not accessible to your Slack account.”
        </p>
        <Link
          href="/"
          className="mt-7 inline-block rounded-xl border border-[#C6FF32]/40 px-5 py-3 text-sm font-semibold text-[#C6FF32]"
        >
          Return to HSAKAA
        </Link>
      </section>
    </main>
  );
}
