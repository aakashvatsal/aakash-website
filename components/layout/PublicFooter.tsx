import Link from "next/link";

export function PublicFooter() {
  return (
    <footer className="px-6 py-16 md:px-12 lg:px-16">
      <div className="mx-auto max-w-[1500px] rounded-[40px] border border-white/10 bg-white/[0.03] p-8 md:p-10">
        <div className="grid gap-10 md:grid-cols-[1fr_1fr] md:items-end">
          <div>
            <p className="text-3xl font-black tracking-[-0.05em]">
              Aakash<span className="text-[#C6FF32]">.</span>
            </p>

            <p className="mt-4 max-w-xl text-white/45">
              Building systems. Sharing everything. Teaching HSAKAA to think
              like me.
            </p>
          </div>

          <div className="flex flex-wrap gap-4 md:justify-end">
            <Link href="/companies" className="text-sm text-white/45 hover:text-white">
              Companies
            </Link>
            <Link href="/journal" className="text-sm text-white/45 hover:text-white">
              Journal
            </Link>
            <Link href="/library" className="text-sm text-white/45 hover:text-white">
              Library
            </Link>
            <Link href="/now" className="text-sm text-white/45 hover:text-white">
              Now
            </Link>
            <Link href="/hsakaa" className="text-sm text-[#C6FF32]">
              HSAKAA
            </Link>
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/35 md:flex-row md:items-center md:justify-between">
          <p>Made with ☕ in Mumbai.</p>
          <p>System Status: <span className="text-[#C6FF32]">Online ●</span></p>
        </div>
      </div>
    </footer>
  );
}