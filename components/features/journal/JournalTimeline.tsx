import { Container } from "@/components/ui/Container";

import type { JournalEntry } from "@/types/journal";

import { JournalTimelineItem } from "./JournalTimelineItem";

type JournalTimelineProps = {
  entries: JournalEntry[];
};

export function JournalTimeline({
  entries,
}: JournalTimelineProps) {
  if (!entries.length) {
    return null;
  }

  return (
    <section className="pb-32">
      <Container>
        <div className="mb-12 flex items-end justify-between gap-6">
          <div>
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C6FF32]">
              Timeline
            </p>

            <h2 className="mt-4 text-4xl font-black tracking-[-0.05em] text-white sm:text-5xl">
              Recent thoughts.
            </h2>
          </div>

          <p className="text-sm text-white/35">
            {entries.length}{" "}
            {entries.length === 1 ? "entry" : "entries"}
          </p>
        </div>

        <div>
          {entries.map((entry) => (
            <JournalTimelineItem
              key={entry._id}
              entry={entry}
            />
          ))}
        </div>
      </Container>
    </section>
  );
}