import Reveal from "@/components/ui/Reveal";

export function Mission() {
  const steps = ["Problem", "System", "Iteration", "Compounding"];

  return (
    <Reveal>
        <section className="border-t border-white/10 px-6 py-28 md:px-12 lg:px-16">
        <div className="grid gap-14 lg:grid-cols-[0.8fr_1.2fr] lg:items-center">
            <div>
            <p className="mb-8 text-xs font-black uppercase tracking-[0.35em] text-[#C6FF32]">
                The Method
            </p>

            <h2 className="text-5xl font-black leading-tight tracking-[-0.05em] md:text-7xl">
                Every company I build starts the same way.
            </h2>
            </div>

            <div className="space-y-4">
            {steps.map((step, index) => (
                <div
                key={step}
                className="grid grid-cols-[80px_1fr] items-center border-b border-white/10 py-6"
                >
                <p className="text-sm font-black text-[#C6FF32]">
                    0{index + 1}
                </p>
                <p className="text-4xl font-black tracking-[-0.04em] md:text-6xl">
                    {step}
                </p>
                </div>
            ))}
            </div>
        </div>
        </section>
    </Reveal>
  );
}