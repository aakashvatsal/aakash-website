"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[500px] items-center justify-center">
      <div className="max-w-md rounded-3xl border border-red-500/20 bg-red-500/10 p-8 text-center">
        <h2 className="text-2xl font-bold text-white">
          Failed to load Journal
        </h2>

        <p className="mt-4 text-white/50">
          {error.message}
        </p>

        <button
          onClick={reset}
          className="mt-8 rounded-xl bg-[#C6FF32] px-6 py-3 font-bold text-black"
        >
          Try Again
        </button>
      </div>
    </div>
  );
}