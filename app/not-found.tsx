import Link from "next/link";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#030608] px-6 text-center text-white">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.35em] text-[#C6FF32]">
          404
        </p>
        <h1 className="mt-6 text-6xl font-black tracking-[-0.07em] md:text-8xl">
          This page hasn’t been written yet.
        </h1>
        <Link href="/" className="mt-10 inline-block font-black text-[#C6FF32]">
          ← Back home
        </Link>
      </div>
    </main>
  );
}