import Link from "next/link";

import { MediaForm } from "@/components/admin/media/MediaForm";

export default function NewMediaPage() {
  return (
    <main className="min-h-screen bg-[#030608]">
      <div className="mx-auto max-w-[1500px]">
        <header>
          <Link
            href="/admin/media"
            className="text-xs font-black uppercase tracking-[0.18em] text-white/40 transition hover:text-[#C6FF32]"
          >
            ← Back to media
          </Link>

          <p className="mt-10 text-xs font-black uppercase tracking-[0.3em] text-[#C6FF32]">
            Content operating system
          </p>

          <h1 className="mt-5 text-5xl font-black tracking-[-0.06em] md:text-7xl">
            New media post
          </h1>

          <p className="mt-5 max-w-2xl text-base leading-8 text-white/40">
            Plan the strategy, content,
            creative requirements,
            publishing workflow and
            expected outcome.
          </p>
        </header>

        <div className="mt-12">
          <MediaForm />
        </div>
      </div>
    </main>
  );
}