import Link from "next/link";

import {
  ArrowUpRight,
  BookOpen,
  Brain,
  Heart,
  Lightbulb,
  Sparkles,
  Trophy,
} from "lucide-react";

import {
  BodyText,
} from "@/components/ui/BodyText";

import {
  Container,
} from "@/components/ui/Container";

import {
  DisplayTitle,
} from "@/components/ui/DisplayTitle";

import {
  Eyebrow,
} from "@/components/ui/Eyebrow";

import {
  SpotlightCard,
} from "@/components/ui/SpotlightCard";

import type {
  JournalEntry,
  JournalPagination,
} from "@/types/journal";

interface JournalPageProps {
  entries:
    JournalEntry[];

  pagination:
    JournalPagination;
}

export function JournalPage({
  entries,
  pagination,
}: JournalPageProps) {
  const featuredEntry =
    entries[0] ??
    null;

  const recentEntries =
    entries.slice(
      1,
    );

  const totalLessons =
    entries.reduce(
      (
        total,
        entry,
      ) =>
        total +
        (
          entry.lessons ??
          []
        ).length,
      0,
    );

  const totalIdeas =
    entries.reduce(
      (
        total,
        entry,
      ) =>
        total +
        (
          entry.ideas ??
          []
        ).length,
      0,
    );

  const totalWins =
    entries.reduce(
      (
        total,
        entry,
      ) =>
        total +
        (
          entry.wins ??
          []
        ).length,
      0,
    );

  return (
    <main className="min-h-screen bg-[#030608] text-white">
      <section className="pb-16 pt-28">
        <Container>
          <Eyebrow>
            Journal
          </Eyebrow>

          <DisplayTitle className="mt-6 max-w-6xl">
            A record of how
            the thinking changed.
          </DisplayTitle>

          <BodyText className="mt-8 max-w-3xl">
            Decisions, lessons,
            ideas and observations
            captured as they happen.
            Not a polished archive —
            a timeline of how the
            systems, companies and
            thinking evolve.
          </BodyText>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
            <JournalStat
              label="Entries"
              value={
                pagination.total.toString()
              }
              detail="Published journal"
            />

            <JournalStat
              label="Lessons"
              value={
                totalLessons.toString()
              }
              detail="Captured here"
            />

            <JournalStat
              label="Ideas"
              value={
                totalIdeas.toString()
              }
              detail="Worth preserving"
            />

            <JournalStat
              label="Wins"
              value={
                totalWins.toString()
              }
              detail="Recent progress"
            />
          </div>
        </Container>
      </section>

      <section className="pb-32">
        <Container>
          {!featuredEntry ? (
            <EmptyJournal />
          ) : (
            <>
              <FeaturedEntry
                entry={
                  featuredEntry
                }
              />

              {recentEntries.length >
                0 && (
                <div className="mt-28">
                  <div className="flex flex-col gap-5 border-b border-white/10 pb-8 md:flex-row md:items-end md:justify-between">
                    <div>
                      <p className="text-[10px] font-black uppercase tracking-[0.26em] text-[#C6FF32]">
                        Timeline
                      </p>

                      <h2 className="mt-4 max-w-3xl text-4xl font-black tracking-[-0.055em] md:text-5xl">
                        Recent entries.
                      </h2>
                    </div>

                    <p className="max-w-md text-sm leading-7 text-white/30">
                      The latest
                      observations,
                      decisions and
                      lessons from the
                      journal.
                    </p>
                  </div>

                  <div className="mt-4">
                    {recentEntries.map(
                      (
                        entry,
                        index,
                      ) => (
                        <JournalTimelineEntry
                          key={
                            entry._id
                          }
                          entry={
                            entry
                          }
                          index={
                            index
                          }
                        />
                      ),
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </Container>
      </section>
    </main>
  );
}

function FeaturedEntry({
  entry,
}: {
  entry:
    JournalEntry;
}) {
  return (
    <Link
      href={`/journal/${entry.slug}`}
      className="group block"
    >
      <SpotlightCard className="overflow-hidden rounded-[40px] border border-white/10 bg-white/[0.025] transition hover:border-[#C6FF32]/30">
        <div className="grid min-h-[540px] lg:grid-cols-[0.7fr_1.3fr]">
          <div className="flex flex-col justify-between border-b border-white/10 p-8 lg:border-b-0 lg:border-r lg:p-10">
            <div>
              <p className="text-[10px] font-black uppercase tracking-[0.26em] text-[#C6FF32]">
                Latest entry
              </p>

              <p className="mt-4 text-sm text-white/35">
                {formatDate(
                  entry.date,
                )}
              </p>
            </div>

            <div className="mt-16 lg:mt-0">
              <EntryType
                type={
                  entry.type
                }
              />

              <div className="mt-6 flex flex-wrap gap-2">
                {(entry.tags ??
                  [])
                  .slice(
                    0,
                    5,
                  )
                  .map(
                    (
                      tag,
                    ) => (
                      <span
                        key={
                          tag
                        }
                        className="rounded-full border border-white/10 px-3 py-1 text-[9px] font-black uppercase tracking-[0.16em] text-white/30"
                      >
                        {tag}
                      </span>
                    ),
                  )}
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-between p-8 md:p-10 lg:p-14">
            <div>
              <h2 className="max-w-4xl text-4xl font-black leading-[0.98] tracking-[-0.06em] md:text-6xl">
                {entry.title}
              </h2>

              {entry.highlight && (
                <p className="mt-8 max-w-3xl border-l-2 border-[#C6FF32] pl-6 text-xl leading-9 text-white/55">
                  {
                    entry.highlight
                  }
                </p>
              )}

              {entry.content && (
                <p className="mt-8 max-w-3xl text-base leading-8 text-white/40">
                  {truncate(
                    entry.content,
                    360,
                  )}
                </p>
              )}
            </div>

            <div className="mt-12 flex flex-wrap items-center justify-between gap-6 border-t border-white/10 pt-7">
              <JournalContext
                entry={
                  entry
                }
              />

              <div className="flex items-center gap-2 text-sm font-bold text-white/55 transition group-hover:text-[#C6FF32]">
                Read entry

                <ArrowUpRight
                  size={
                    16
                  }
                />
              </div>
            </div>
          </div>
        </div>
      </SpotlightCard>
    </Link>
  );
}

function JournalTimelineEntry({
  entry,
  index,
}: {
  entry:
    JournalEntry;

  index:
    number;
}) {
  return (
    <Link
      href={`/journal/${entry.slug}`}
      className="group grid gap-8 border-b border-white/10 py-10 transition md:grid-cols-[180px_1fr_260px] md:items-start"
    >
      <div>
        <p className="text-sm font-black text-white/70">
          {formatDate(
            entry.date,
          )}
        </p>

        <p className="mt-2 text-[10px] font-black uppercase tracking-[0.2em] text-white/20">
          #{String(
            index + 2,
          ).padStart(
            2,
            "0",
          )}
        </p>
      </div>

      <div>
        <div className="flex flex-wrap items-center gap-3">
          <EntryType
            type={
              entry.type
            }
          />

          <MoodBadge
            mood={
              entry.mood
            }
          />
        </div>

        <h3 className="mt-5 max-w-3xl text-2xl font-black tracking-[-0.045em] transition group-hover:text-[#C6FF32] md:text-3xl">
          {entry.title}
        </h3>

        {entry.highlight && (
          <p className="mt-5 max-w-3xl text-base leading-8 text-white/45">
            {
              entry.highlight
            }
          </p>
        )}

        {!entry.highlight &&
          entry.content && (
            <p className="mt-5 max-w-3xl text-base leading-8 text-white/35">
              {truncate(
                entry.content,
                220,
              )}
            </p>
          )}

        {(entry.tags ??
          []).length >
          0 && (
          <div className="mt-6 flex flex-wrap gap-2">
            {entry.tags
              .slice(
                0,
                4,
              )
              .map(
                (
                  tag,
                ) => (
                  <span
                    key={
                      tag
                    }
                    className="text-[10px] font-black uppercase tracking-[0.16em] text-white/20"
                  >
                    #{tag}
                  </span>
                ),
              )}
          </div>
        )}
      </div>

      <JournalContext
        entry={
          entry
        }
        compact
      />
    </Link>
  );
}

function JournalContext({
  entry,
  compact = false,
}: {
  entry:
    JournalEntry;

  compact?:
    boolean;
}) {
  const items:
    {
      icon:
        typeof Brain;

      label:
        string;
    }[] =
    [];

  if (
    (
      entry.lessons ??
      []
    ).length >
    0
  ) {
    items.push({
      icon:
        Brain,

      label: `${entry.lessons.length} ${
        entry.lessons.length ===
        1
          ? "lesson"
          : "lessons"
      }`,
    });
  }

  if (
    (
      entry.ideas ??
      []
    ).length >
    0
  ) {
    items.push({
      icon:
        Lightbulb,

      label: `${entry.ideas.length} ${
        entry.ideas.length ===
        1
          ? "idea"
          : "ideas"
      }`,
    });
  }

  if (
    (
      entry.wins ??
      []
    ).length >
    0
  ) {
    items.push({
      icon:
        Trophy,

      label: `${entry.wins.length} ${
        entry.wins.length ===
        1
          ? "win"
          : "wins"
      }`,
    });
  }

  if (
    entry.reading
      ?.completed
  ) {
    items.push({
      icon:
        BookOpen,

      label:
        entry.reading
          .title ??
        "Reading",
    });
  }

  if (
    (
      entry.gratitude ??
      []
    ).length >
    0
  ) {
    items.push({
      icon:
        Heart,

      label: `${entry.gratitude.length} gratitude`,
    });
  }

  if (
    items.length ===
    0
  ) {
    return (
      <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/20">
        {formatMood(
          entry.mood,
        )}
      </p>
    );
  }

  return (
    <div
      className={
        compact
          ? "space-y-3"
          : "flex flex-wrap items-center gap-x-5 gap-y-3"
      }
    >
      {items
        .slice(
          0,
          compact
            ? 3
            : 4,
        )
        .map(
          (
            item,
          ) => {
            const Icon =
              item.icon;

            return (
              <div
                key={
                  item.label
                }
                className="flex items-center gap-2 text-xs font-bold text-white/30"
              >
                <Icon
                  size={
                    13
                  }
                />

                <span>
                  {
                    item.label
                  }
                </span>
              </div>
            );
          },
        )}
    </div>
  );
}

function JournalStat({
  label,
  value,
  detail,
}: {
  label:
    string;

  value:
    string;

  detail:
    string;
}) {
  return (
    <SpotlightCard className="rounded-[26px] p-6">
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/25">
        {label}
      </p>

      <p className="mt-4 text-4xl font-black tracking-[-0.06em]">
        {value}
      </p>

      <p className="mt-2 text-sm text-white/30">
        {detail}
      </p>
    </SpotlightCard>
  );
}

function EntryType({
  type,
}: {
  type:
    JournalEntry["type"];
}) {
  return (
    <span className="inline-flex rounded-full border border-[#C6FF32]/25 bg-[#C6FF32]/[0.06] px-3 py-1 text-[9px] font-black uppercase tracking-[0.18em] text-[#C6FF32]">
      {formatType(
        type,
      )}
    </span>
  );
}

function MoodBadge({
  mood,
}: {
  mood:
    JournalEntry["mood"];
}) {
  return (
    <span className="inline-flex items-center gap-2 text-[9px] font-black uppercase tracking-[0.18em] text-white/25">
      <Sparkles
        size={
          11
        }
      />

      {formatMood(
        mood,
      )}
    </span>
  );
}

function EmptyJournal() {
  return (
    <SpotlightCard className="rounded-[36px] border border-white/10 p-10 md:p-14">
      <p className="text-[10px] font-black uppercase tracking-[0.24em] text-[#C6FF32]">
        Journal
      </p>

      <h2 className="mt-5 text-4xl font-black tracking-[-0.055em]">
        Nothing published yet.
      </h2>

      <p className="mt-5 max-w-2xl text-base leading-8 text-white/40">
        Journal entries will
        appear here once they are
        marked public and
        published.
      </p>
    </SpotlightCard>
  );
}

function truncate(
  value:
    string,
  length:
    number,
) {
  const text =
    value.trim();

  if (
    text.length <=
    length
  ) {
    return text;
  }

  return `${text.slice(
    0,
    length,
  ).trim()}…`;
}

function formatType(
  type:
    JournalEntry["type"],
) {
  return type
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
  mood:
    JournalEntry["mood"],
) {
  return mood
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
  const date =
    new Date(
      value,
    );

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day:
        "2-digit",

      month:
        "short",

      year:
        "numeric",

      timeZone:
        "Asia/Kolkata",
    },
  ).format(
    date,
  );
}