import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-[500px] items-center justify-center">
      <div className="text-center">
        <h1 className="text-5xl font-black text-white">
          Journal Entry Not Found
        </h1>

        <p className="mt-4 text-white/40">
          The journal entry you're looking for doesn't exist.
        </p>

        <Link
          href="/admin/journal"
          className="mt-8 inline-flex rounded-xl bg-[#C6FF32] px-6 py-3 font-bold text-black"
        >
          Back to Journal
        </Link>
      </div>
    </div>
  );
}