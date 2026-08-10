import Reveal from "@/components/ui/Reveal";

export function Identity() {
  return (
    <Reveal>
        <section className="border-t border-white/10 px-6 py-28 md:px-12 lg:px-16">
        <div className="mx-auto max-w-6xl">
            <p className="mb-8 text-xs font-black uppercase tracking-[0.35em] text-[#C6FF32]">
            The Belief
            </p>

            <h2 className="text-5xl font-black leading-tight tracking-[-0.05em] md:text-7xl lg:text-8xl">
            People think discipline is about motivation.
            <br />
            <br />
            <span className="text-white/35">I think it’s about systems.</span>
            </h2>
        </div>
        </section>
    </Reveal>
  );
}