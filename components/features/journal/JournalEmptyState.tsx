import { Container } from "@/components/ui/Container";

export function JournalEmptyState() {
  return (
    <section className="pb-32">
      <Container>
        <div className="border-y border-white/10 py-20">
          <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C6FF32]">
            Journal
          </p>

          <h2 className="mt-5 text-3xl font-black tracking-[-0.04em] text-white">
            No public entries yet.
          </h2>

          <p className="mt-4 max-w-xl text-base leading-7 text-white/45">
            New reflections, lessons and operating notes will appear
            here once published.
          </p>
        </div>
      </Container>
    </section>
  );
}