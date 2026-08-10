"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="grid min-h-screen place-items-center bg-[#030608] px-6 text-center text-white">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.35em] text-[#C6FF32]">
          Something broke
        </p>

        <h1 className="mt-6 text-6xl font-black tracking-[-0.07em] md:text-8xl">
          The system hit an error.
        </h1>

        <p className="mt-6 text-sm text-white/40">{error.message}</p>

        <button
          onClick={reset}
          className="mt-10 rounded-full bg-[#C6FF32] px-6 py-3 text-sm font-black text-[#030608]"
        >
          Try again
        </button>
      </div>
    </main>
  );
}