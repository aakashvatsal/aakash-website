import Link from "next/link";

import { Container } from "@/components/ui/Container";
import type { JournalEntry } from "@/types/journal";

import { JournalDetailMetric } from "./JournalDetailMetric";
import { JournalDetailSection } from "./JournalDetailSection";
import { JournalListSection } from "./JournalListSection";
import { JournalMoodBadge } from "./JournalMoodBadge";
import { JournalTag } from "./JournalTag";
import {
  formatJournalDate,
  getReadingValue,
  getSleepValue,
  getTypeLabel,
  getWorkoutValue,
} from "./journal.utils";

type JournalEntryDetailProps = {
  entry: JournalEntry;
};

export function JournalEntryDetail({
  entry,
}: JournalEntryDetailProps) {
  const workout = getWorkoutValue(entry);
  const reading = getReadingValue(entry);
  const sleep = getSleepValue(entry);

  return (
    <main className="min-h-screen bg-[#030608] text-white">
      <section className="pb-20 pt-28">
        <Container>
          <Link
            href="/journal"
            className="inline-flex items-center gap-2 text-sm font-black text-white/45 transition hover:text-[#C6FF32]"
          >
            <span aria-hidden>←</span>
            Back to journal
          </Link>

          <div className="mt-16 max-w-5xl">
            <div className="flex flex-wrap items-center gap-4">
              <p className="text-sm text-white/35">
                {formatJournalDate(entry.date)}
              </p>

              <JournalMoodBadge
                mood={entry.mood}
                score={entry.moodScore}
              />

              <span className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-black text-white/45">
                {getTypeLabel(entry.type)}
              </span>
            </div>

            <h1 className="mt-8 text-5xl font-black leading-[0.98] tracking-[-0.06em] sm:text-6xl lg:text-8xl">
              {entry.title}
            </h1>

            {entry.highlight && (
              <p className="mt-10 max-w-4xl text-2xl font-medium leading-10 text-white/65">
                {entry.highlight}
              </p>
            )}

            {entry.tags.length > 0 && (
              <div className="mt-10 flex flex-wrap gap-2">
                {entry.tags.map((tag) => (
                  <JournalTag key={tag} value={tag} />
                ))}
              </div>
            )}
          </div>
        </Container>
      </section>

      <section className="pb-32">
        <Container>
          <div className="grid gap-16 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div>
              {entry.content && (
                <JournalDetailSection
                  eyebrow="Reflection"
                  title="What I was thinking."
                >
                  <div className="whitespace-pre-line text-xl leading-9 text-white/65">
                    {entry.content}
                  </div>
                </JournalDetailSection>
              )}

              {entry.wins.length > 0 && (
                <JournalDetailSection
                  eyebrow="Wins"
                  title="What moved forward."
                >
                  <JournalListSection items={entry.wins} />
                </JournalDetailSection>
              )}

              {entry.lessons.length > 0 && (
                <JournalDetailSection
                  eyebrow="Lessons"
                  title="What became clearer."
                >
                  <JournalListSection items={entry.lessons} />
                </JournalDetailSection>
              )}

              {entry.decisions.length > 0 && (
                <JournalDetailSection
                  eyebrow="Decisions"
                  title="What I committed to."
                >
                  <JournalListSection items={entry.decisions} />
                </JournalDetailSection>
              )}

              {entry.ideas.length > 0 && (
                <JournalDetailSection
                  eyebrow="Ideas"
                  title="What might become something."
                >
                  <JournalListSection items={entry.ideas} />
                </JournalDetailSection>
              )}

              {entry.challenges.length > 0 && (
                <JournalDetailSection
                  eyebrow="Challenges"
                  title="What created friction."
                >
                  <JournalListSection items={entry.challenges} />
                </JournalDetailSection>
              )}

              {entry.gratitude.length > 0 && (
                <JournalDetailSection
                  eyebrow="Gratitude"
                  title="What I appreciated."
                >
                  <JournalListSection items={entry.gratitude} />
                </JournalDetailSection>
              )}

              {!entry.content &&
                !entry.wins.length &&
                !entry.lessons.length &&
                !entry.decisions.length &&
                !entry.ideas.length &&
                !entry.challenges.length &&
                !entry.gratitude.length && (
                  <div className="border-t border-white/10 py-16">
                    <p className="text-lg text-white/40">
                      No detailed reflection was added for this entry.
                    </p>
                  </div>
                )}
            </div>

            <aside className="lg:sticky lg:top-28 lg:self-start">
              <div className="rounded-[32px] border border-white/10 bg-white/[0.025] p-7">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#C6FF32]">
                  Daily signals
                </p>

                <div className="mt-8 space-y-7">
                  <JournalDetailMetric
                    label="Workout"
                    value={workout.value}
                    detail={workout.detail}
                  />

                  <JournalDetailMetric
                    label="Reading"
                    value={reading.value}
                    detail={reading.detail}
                  />

                  <JournalDetailMetric
                    label="Sleep"
                    value={sleep.value}
                    detail={sleep.detail}
                  />

                  <JournalDetailMetric
                    label="Steps"
                    value={
                      entry.steps > 0
                        ? entry.steps.toLocaleString("en-IN")
                        : "Not logged"
                    }
                  />

                  <JournalDetailMetric
                    label="Energy"
                    value={
                      typeof entry.energyScore === "number"
                        ? `${entry.energyScore}/10`
                        : "Not logged"
                    }
                  />

                  <JournalDetailMetric
                    label="Productivity"
                    value={
                      typeof entry.productivityScore === "number"
                        ? `${entry.productivityScore}/10`
                        : "Not logged"
                    }
                  />

                  <JournalDetailMetric
                    label="Stress"
                    value={
                      typeof entry.stressScore === "number"
                        ? `${entry.stressScore}/10`
                        : "Not logged"
                    }
                  />
                </div>
              </div>
            </aside>
          </div>
        </Container>
      </section>
    </main>
  );
}