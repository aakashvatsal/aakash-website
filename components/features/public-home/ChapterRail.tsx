import Link from "next/link";

const chapters = [
  "Arrival",
  "Identity",
  "Companies",
  "Builder’s Log",
  "Building Public",
  "Mind Expansion",
  "Current Brain",
  "Operating System",
  "Meet HSAKAA",
];

export function ChapterRail() {
  return (
    <aside className="hidden min-h-screen p-8 lg:block">
      <Link href="/" className="flex items-center gap-3">
        <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#C6FF32] text-lg font-black text-[#030608]">
          AV
        </div>

        <div>
          <p className="font-bold">Aakash Vatsal</p>
          <p className="text-xs text-white/45">Digital Human</p>
        </div>
      </Link>

      <div className="mt-20 space-y-10">
        {chapters.map((chapter, index) => (
          <div key={chapter} className="relative pl-5">
            <span className="absolute left-0 top-1.5 h-2 w-2 rounded-full bg-[#C6FF32]" />
            <p className="text-[10px] uppercase tracking-[0.22em] text-white/30">
              Chapter {index}
            </p>
            <p className="mt-1 text-xs font-bold text-white/70">{chapter}</p>
          </div>
        ))}
      </div>
    </aside>
  );
}