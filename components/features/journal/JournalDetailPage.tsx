import {
  ArrowLeft,
  BookOpen,
  Brain,
  Dumbbell,
  Heart,
  Lightbulb,
  Moon,
  Sparkles,
  Trophy,
} from "lucide-react";

import Link from "next/link";

import {
  Container,
} from "@/components/ui/Container";

import {
  Eyebrow,
} from "@/components/ui/Eyebrow";

import {
  SpotlightCard,
} from "@/components/ui/SpotlightCard";

import type {
  JournalEntry,
} from "@/types/journal";

interface JournalDetailPageProps {
  entry:
    JournalEntry;
}

export function JournalDetailPage({
  entry,
}: JournalDetailPageProps) {
  const hasLessons =
    (
      entry.lessons ??
      []
    ).length >
    0;

  const hasDecisions =
    (
      entry.decisions ??
      []
    ).length >
    0;

  const hasIdeas =
    (
      entry.ideas ??
      []
    ).length >
    0;

  const hasGratitude =
    (
      entry.gratitude ??
      []
    ).length >
    0;

  const hasChallenges =
    (
      entry.challenges ??
      []
    ).length >
    0;

  const hasWins =
    (
      entry.wins ??
      []
    ).length >
    0;

  const hasReading =
    Boolean(
      entry.reading?.completed ||
        entry.reading?.title,
    );

  const hasWorkout =
    Boolean(
      entry.workout?.completed ||
        entry.workout?.type,
    );

  const hasSleep =
    Boolean(
      entry.sleep?.durationHours ||
        entry.sleep
          ?.performancePercentage ||
        entry.sleep?.recoveryScore,
    );

  return (
    <main className="min-h-screen bg-[#030608] text-white">
      <section className="pb-16 pt-28">
        <Container>
          <Link
            href="/journal"
            className="inline-flex items-center gap-2 text-sm font-bold text-white/35 transition hover:text-[#C6FF32]"
          >
            <ArrowLeft
              size={
                16
              }
            />

            Journal
          </Link>

          <div className="mt-12 max-w-5xl">
            <div className="flex flex-wrap items-center gap-3">
              <Eyebrow>
                {formatType(
                  entry.type,
                )}
              </Eyebrow>

              <span className="text-white/15">
                ·
              </span>

              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/25">
                {formatDate(
                  entry.date,
                )}
              </p>

              <span className="text-white/15">
                ·
              </span>

              <MoodBadge
                mood={
                  entry.mood
                }
              />
            </div>

            <h1 className="mt-8 text-5xl font-black leading-[0.98] tracking-[-0.065em] md:text-7xl xl:text-8xl">
              {entry.title}
            </h1>

            {entry.highlight && (
              <p className="mt-10 max-w-4xl border-l-2 border-[#C6FF32] pl-6 text-xl leading-9 text-white/55 md:text-2xl md:leading-10">
                {
                  entry.highlight
                }
              </p>
            )}

            {(entry.tags ??
              []).length >
              0 && (
              <div className="mt-8 flex flex-wrap gap-2">
                {entry.tags.map(
                  (
                    tag,
                  ) => (
                    <span
                      key={
                        tag
                      }
                      className="rounded-full border border-white/10 bg-white/[0.02] px-3 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-white/30"
                    >
                      #{tag}
                    </span>
                  ),
                )}
              </div>
            )}
          </div>
        </Container>
      </section>

      <section className="pb-32">
        <Container>
          <div className="grid gap-12 xl:grid-cols-[minmax(0,1fr)_320px] xl:items-start">
            <div>
              {entry.content && (
                <article className="max-w-4xl">
                  <JournalContent
                    content={
                      entry.content
                    }
                  />
                </article>
              )}

              {hasLessons && (
                <JournalSection
                  icon={
                    Brain
                  }
                  eyebrow="Lessons"
                  title="What became clearer."
                  items={
                    entry.lessons
                  }
                />
              )}

              {hasDecisions && (
                <JournalSection
                  icon={
                    Sparkles
                  }
                  eyebrow="Decisions"
                  title="What changed after thinking."
                  items={
                    entry.decisions
                  }
                />
              )}

              {hasIdeas && (
                <JournalSection
                  icon={
                    Lightbulb
                  }
                  eyebrow="Ideas"
                  title="Things worth exploring."
                  items={
                    entry.ideas
                  }
                />
              )}

              {hasWins && (
                <JournalSection
                  icon={
                    Trophy
                  }
                  eyebrow="Wins"
                  title="Progress worth remembering."
                  items={
                    entry.wins
                  }
                />
              )}

              {hasChallenges && (
                <JournalSection
                  icon={
                    Brain
                  }
                  eyebrow="Challenges"
                  title="What resisted progress."
                  items={
                    entry.challenges
                  }
                />
              )}

              {hasGratitude && (
                <JournalSection
                  icon={
                    Heart
                  }
                  eyebrow="Gratitude"
                  title="Things worth appreciating."
                  items={
                    entry.gratitude
                  }
                />
              )}
            </div>

            <aside className="space-y-5 xl:sticky xl:top-28">
              <SpotlightCard className="rounded-[28px] p-6">
                <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#C6FF32]">
                  State
                </p>

                <div className="mt-6 space-y-5">
                  <SideMetric
                    label="Mood"
                    value={
                      formatMood(
                        entry.mood,
                      )
                    }
                  />

                  <SideMetric
                    label="Mood score"
                    value={
                      formatScore(
                        entry.moodScore,
                      )
                    }
                  />

                  <SideMetric
                    label="Energy"
                    value={
                      formatScore(
                        entry.energyScore,
                      )
                    }
                  />

                  <SideMetric
                    label="Productivity"
                    value={
                      formatScore(
                        entry.productivityScore,
                      )
                    }
                  />

                  <SideMetric
                    label="Stress"
                    value={
                      formatScore(
                        entry.stressScore,
                      )
                    }
                  />

                  <SideMetric
                    label="Steps"
                    value={
                      typeof entry.steps ===
                      "number"
                        ? entry.steps.toLocaleString(
                            "en-IN",
                          )
                        : "—"
                    }
                  />
                </div>
              </SpotlightCard>

              {hasWorkout && (
                <SpotlightCard className="rounded-[28px] p-6">
                  <div className="flex items-center gap-3">
                    <Dumbbell
                      size={
                        16
                      }
                      className="text-[#C6FF32]"
                    />

                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/30">
                      Workout
                    </p>
                  </div>

                  <p className="mt-5 text-xl font-black">
                    {entry.workout
                      .title ??
                      entry.workout
                        .type ??
                      "Workout"}
                  </p>

                  <div className="mt-5 space-y-3">
                    <SideMetric
                      label="Completed"
                      value={
                        entry.workout
                          .completed
                          ? "Yes"
                          : "No"
                      }
                    />

                    <SideMetric
                      label="Duration"
                      value={
                        typeof entry
                          .workout
                          .durationMinutes ===
                        "number"
                          ? `${entry.workout.durationMinutes} min`
                          : "—"
                      }
                    />

                    <SideMetric
                      label="Strain"
                      value={
                        typeof entry
                          .workout
                          .strainScore ===
                        "number"
                          ? entry.workout.strainScore.toFixed(
                              1,
                            )
                          : "—"
                      }
                    />
                  </div>

                  {entry.workout
                    .notes && (
                    <p className="mt-5 text-sm leading-7 text-white/35">
                      {
                        entry
                          .workout
                          .notes
                      }
                    </p>
                  )}
                </SpotlightCard>
              )}

              {hasReading && (
                <SpotlightCard className="rounded-[28px] p-6">
                  <div className="flex items-center gap-3">
                    <BookOpen
                      size={
                        16
                      }
                      className="text-[#C6FF32]"
                    />

                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/30">
                      Reading
                    </p>
                  </div>

                  <p className="mt-5 text-xl font-black leading-7">
                    {entry.reading
                      .title ??
                      "Reading"}
                  </p>

                  {entry.reading
                    .author && (
                    <p className="mt-2 text-sm text-white/30">
                      {
                        entry
                          .reading
                          .author
                      }
                    </p>
                  )}

                  <div className="mt-5 space-y-3">
                    <SideMetric
                      label="Pages"
                      value={
                        typeof entry
                          .reading
                          .pagesRead ===
                        "number"
                          ? entry.reading.pagesRead.toString()
                          : "—"
                      }
                    />

                    <SideMetric
                      label="Progress"
                      value={
                        typeof entry
                          .reading
                          .progressPercentage ===
                        "number"
                          ? `${entry.reading.progressPercentage.toFixed(
                              1,
                            )}%`
                          : "—"
                      }
                    />
                  </div>

                  {entry.reading
                    .thought && (
                    <p className="mt-5 border-l border-[#C6FF32]/40 pl-4 text-sm leading-7 text-white/40">
                      {
                        entry
                          .reading
                          .thought
                      }
                    </p>
                  )}
                </SpotlightCard>
              )}

              {hasSleep && (
                <SpotlightCard className="rounded-[28px] p-6">
                  <div className="flex items-center gap-3">
                    <Moon
                      size={
                        16
                      }
                      className="text-[#C6FF32]"
                    />

                    <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/30">
                      Sleep
                    </p>
                  </div>

                  <div className="mt-5 space-y-3">
                    <SideMetric
                      label="Duration"
                      value={
                        typeof entry
                          .sleep
                          .durationHours ===
                        "number"
                          ? `${entry.sleep.durationHours.toFixed(
                              1,
                            )} h`
                          : "—"
                      }
                    />

                    <SideMetric
                      label="Performance"
                      value={
                        typeof entry
                          .sleep
                          .performancePercentage ===
                        "number"
                          ? `${Math.round(
                              entry.sleep
                                .performancePercentage,
                            )}%`
                          : "—"
                      }
                    />

                    <SideMetric
                      label="Recovery"
                      value={
                        typeof entry
                          .sleep
                          .recoveryScore ===
                        "number"
                          ? `${Math.round(
                              entry.sleep
                                .recoveryScore,
                            )}%`
                          : "—"
                      }
                    />

                    <SideMetric
                      label="Quality"
                      value={
                        formatScore(
                          entry.sleep
                            .quality,
                        )
                      }
                    />
                  </div>
                </SpotlightCard>
              )}
            </aside>
          </div>
        </Container>
      </section>
    </main>
  );
}

function JournalContent({
  content,
}: {
  content:
    string;
}) {
  const paragraphs =
    content
      .split(
        /\n{2,}/,
      )
      .map(
        (
          paragraph,
        ) =>
          paragraph.trim(),
      )
      .filter(
        Boolean,
      );

  return (
    <div className="space-y-7">
      {paragraphs.map(
        (
          paragraph,
          index,
        ) => (
          <p
            key={
              index
            }
            className="whitespace-pre-line text-lg leading-9 text-white/60 md:text-xl md:leading-10"
          >
            {
              paragraph
            }
          </p>
        ),
      )}
    </div>
  );
}

function JournalSection({
  icon:
    Icon,
  eyebrow,
  title,
  items,
}: {
  icon:
    typeof Brain;

  eyebrow:
    string;

  title:
    string;

  items:
    string[];
}) {
  return (
    <section className="mt-20 border-t border-white/10 pt-10">
      <div className="flex items-center gap-3">
        <Icon
          size={
            16
          }
          className="text-[#C6FF32]"
        />

        <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#C6FF32]">
          {eyebrow}
        </p>
      </div>

      <h2 className="mt-5 text-3xl font-black tracking-[-0.05em] md:text-4xl">
        {title}
      </h2>

      <div className="mt-8 space-y-5">
        {items.map(
          (
            item,
            index,
          ) => (
            <SpotlightCard
              key={`${item}-${index}`}
              className="rounded-[24px] p-6"
            >
              <div className="flex gap-5">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#C6FF32]" />

                <p className="text-base leading-8 text-white/55">
                  {item}
                </p>
              </div>
            </SpotlightCard>
          ),
        )}
      </div>
    </section>
  );
}

function SideMetric({
  label,
  value,
}: {
  label:
    string;

  value:
    string;
}) {
  return (
    <div className="flex items-center justify-between gap-5 border-b border-white/[0.06] pb-3 last:border-b-0 last:pb-0">
      <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/20">
        {label}
      </p>

      <p className="text-sm font-bold text-white/55">
        {value}
      </p>
    </div>
  );
}

function MoodBadge({
  mood,
}: {
  mood:
    JournalEntry["mood"];
}) {
  return (
    <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.18em] text-white/30">
      <Sparkles
        size={
          12
        }
      />

      {formatMood(
        mood,
      )}
    </div>
  );
}

function formatScore(
  value:
    | number
    | undefined,
) {
  if (
    typeof value !==
    "number"
  ) {
    return "—";
  }

  return `${value}/10`;
}

function formatType(
  value:
    JournalEntry["type"],
) {
  return value
    .replace(
      /_/g,
      " ",
    )
    .replace(
      /\b\w/g,
      (
        character,
      ) =>
        character.toUpperCase(),
    );
}

function formatMood(
  value:
    JournalEntry["mood"],
) {
  return value
    .replace(
      /_/g,
      " ",
    )
    .replace(
      /\b\w/g,
      (
        character,
      ) =>
        character.toUpperCase(),
    );
}

function formatDate(
  value:
    string,
) {
  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day:
        "2-digit",

      month:
        "long",

      year:
        "numeric",

      timeZone:
        "Asia/Kolkata",
    },
  ).format(
    new Date(
      value,
    ),
  );
}