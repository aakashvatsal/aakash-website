import Link from "next/link";

import {
  ArrowLeft,
  Bookmark,
  BookOpen,
  Highlighter,
  Quote,
} from "lucide-react";

import { Container } from "@/components/ui/Container";
import { DisplayTitle } from "@/components/ui/DisplayTitle";
import { Eyebrow } from "@/components/ui/Eyebrow";
import { SpotlightCard } from "@/components/ui/SpotlightCard";

import {
  getBookBySlug,
  getBookHighlights,
  type Book,
  type LibraryHighlight,
} from "@/lib/library";

type BookDetailPageProps = {
  slug: string;
};

export async function BookDetailPage({
  slug,
}: BookDetailPageProps) {
  const book =
    await getBookBySlug(
      slug,
    );

  if (!book) {
    return (
      <main className="min-h-screen bg-[#030608] text-white">
        <Container>
          <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
            <BookOpen className="h-8 w-8 text-white/20" />

            <h1 className="mt-6 text-3xl font-black tracking-[-0.04em]">
              Book not found.
            </h1>

            <Link
              href="/library"
              className="mt-8 text-sm font-black text-[#C6FF32]"
            >
              ← Back to library
            </Link>
          </div>
        </Container>
      </main>
    );
  }

  const highlights =
    await getBookHighlights(
      book._id,
    );

  const progress =
    Math.min(
      Math.max(
        book.progressPercentage ??
          0,
        0,
      ),
      100,
    );

  const hasKnowledge =
    Boolean(
      book.changed,
    ) ||
    Boolean(
      book.summary,
    ) ||
    Boolean(
      book.notes,
    ) ||
    Boolean(
      book.keyTakeaways
        ?.length,
    ) ||
    Boolean(
      book.quotes
        ?.length,
    ) ||
    highlights.length >
      0;

  return (
    <main className="min-h-screen bg-[#030608] text-white">
      {/* HERO */}
      <section className="pb-20 pt-28">
        <Container>
          <Link
            href="/library"
            className="inline-flex items-center gap-2 text-sm font-black text-white/35 transition hover:text-[#C6FF32]"
          >
            <ArrowLeft className="h-4 w-4" />

            Library
          </Link>

          <div className="mt-14 grid gap-14 lg:grid-cols-[320px_1fr] xl:grid-cols-[380px_1fr]">
            <BookCover
              book={book}
              progress={
                progress
              }
            />

            <div className="flex flex-col justify-center">
              {book.category && (
                <Eyebrow>
                  {
                    book.category
                  }
                </Eyebrow>
              )}

              <DisplayTitle className="mt-6 max-w-4xl">
                {
                  book.title
                }
              </DisplayTitle>

              {book.author && (
                <p className="mt-5 text-xl text-white/45">
                  {
                    book.author
                  }
                </p>
              )}

              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
                <span className="font-black text-[#C6FF32]">
                  {formatStatus(
                    book.status,
                  )}
                </span>

                {highlights.length >
                  0 && (
                  <span className="flex items-center gap-2 text-white/40">
                    <Highlighter className="h-4 w-4" />

                    {
                      highlights.length
                    }{" "}
                    highlights
                  </span>
                )}

                {book.notesCount !==
                  undefined &&
                  book.notesCount >
                    0 && (
                    <span className="text-white/40">
                      {
                        book.notesCount
                      }{" "}
                      notes
                    </span>
                  )}

                {book.lastReadAt && (
                  <span className="text-white/30">
                    Last read{" "}
                    {formatDate(
                      book.lastReadAt,
                    )}
                  </span>
                )}

                {book.isFavourite && (
                  <span className="flex items-center gap-1.5 text-[#C6FF32]/70">
                    <Bookmark className="h-3.5 w-3.5" />

                    Favourite
                  </span>
                )}
              </div>

              {book.summary && (
                <p className="mt-10 max-w-3xl text-lg leading-8 text-white/55">
                  {
                    book.summary
                  }
                </p>
              )}
            </div>
          </div>
        </Container>
      </section>

      {/* KNOWLEDGE BODY */}
      <section className="pb-32">
        <Container>
          <div className="grid gap-16 lg:grid-cols-[260px_1fr] xl:grid-cols-[300px_1fr]">
            {/* SIDE INFORMATION */}
            <aside>
              <div className="sticky top-28 space-y-8">
                <MetaGroup
                  label="Status"
                  value={formatStatus(
                    book.status,
                  )}
                />

                <MetaGroup
                  label="Progress"
                  value={formatProgress(
                    progress,
                  )}
                />

                {book.rating !==
                  undefined &&
                  book.rating !==
                    null &&
                  book.rating >
                    0 && (
                    <MetaGroup
                      label="Rating"
                      value={`${book.rating}/5`}
                    />
                  )}

                {book.lastHighlightedAt && (
                  <MetaGroup
                    label="Last highlight"
                    value={formatDate(
                      book.lastHighlightedAt,
                    )}
                  />
                )}
              </div>
            </aside>

            {/* KNOWLEDGE CONTENT */}
            <article className="min-w-0">
              {book.changed && (
                <KnowledgeSection
                  eyebrow="Reflection"
                  title="What changed in my thinking"
                >
                  <p className="max-w-4xl text-3xl font-black leading-[1.3] tracking-[-0.035em] md:text-4xl">
                    {
                      book.changed
                    }
                  </p>
                </KnowledgeSection>
              )}

              {book.keyTakeaways &&
                book.keyTakeaways.length >
                  0 && (
                  <KnowledgeSection
                    eyebrow="Knowledge"
                    title="Key takeaways"
                  >
                    <div className="divide-y divide-white/10">
                      {book.keyTakeaways.map(
                        (
                          takeaway,
                          index,
                        ) => (
                          <div
                            key={`${takeaway}-${index}`}
                            className="grid gap-4 py-8 md:grid-cols-[56px_1fr]"
                          >
                            <span className="font-mono text-sm font-black text-[#C6FF32]">
                              {String(
                                index +
                                  1,
                              ).padStart(
                                2,
                                "0",
                              )}
                            </span>

                            <p className="max-w-3xl text-xl leading-8 text-white/75">
                              {
                                takeaway
                              }
                            </p>
                          </div>
                        ),
                      )}
                    </div>
                  </KnowledgeSection>
                )}

              {highlights.length >
                0 && (
                <KnowledgeSection
                  eyebrow="Source material"
                  title={`Highlights · ${highlights.length}`}
                >
                  <Highlights
                    highlights={
                      highlights
                    }
                  />
                </KnowledgeSection>
              )}

              {book.notes && (
                <KnowledgeSection
                  eyebrow="Personal"
                  title="My notes"
                >
                  <div className="max-w-3xl whitespace-pre-line text-lg leading-9 text-white/65">
                    {
                      book.notes
                    }
                  </div>
                </KnowledgeSection>
              )}

              {book.quotes &&
                book.quotes.length >
                  0 && (
                  <KnowledgeSection
                    eyebrow="Saved"
                    title="Quotes"
                  >
                    <div className="space-y-5">
                      {book.quotes.map(
                        (
                          quote,
                          index,
                        ) => (
                          <SpotlightCard
                            key={`${quote}-${index}`}
                            className="p-8"
                          >
                            <Quote className="h-5 w-5 text-[#C6FF32]" />

                            <p className="mt-6 max-w-3xl text-2xl font-black leading-[1.4] tracking-[-0.025em] text-white/80">
                              “
                              {
                                quote
                              }
                              ”
                            </p>
                          </SpotlightCard>
                        ),
                      )}
                    </div>
                  </KnowledgeSection>
                )}

              {!hasKnowledge && (
                <div className="rounded-[32px] border border-white/10 bg-white/[0.02] p-10">
                  <Eyebrow>
                    Knowledge
                  </Eyebrow>

                  <h2 className="mt-6 text-2xl font-black tracking-[-0.03em]">
                    Nothing captured yet.
                  </h2>

                  <p className="mt-4 max-w-xl text-lg leading-8 text-white/40">
                    Highlights,
                    notes and
                    takeaways will
                    appear here as
                    this book becomes
                    part of the
                    knowledge system.
                  </p>
                </div>
              )}
            </article>
          </div>
        </Container>
      </section>
    </main>
  );
}

function BookCover({
  book,
  progress,
}: {
  book: Book;

  progress: number;
}) {
  return (
    <div className="relative aspect-[2/3] overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.025] shadow-2xl shadow-black/30">
      {book.coverImageUrl ? (
        <img
          src={
            book.coverImageUrl
          }
          alt={`${book.title} cover`}
          className="absolute inset-0 h-full w-full object-cover"
        />
      ) : (
        <BookPlaceholder />
      )}

      {book.coverImageUrl && (
        <div className="absolute inset-0 bg-gradient-to-t from-black/65 via-transparent to-transparent" />
      )}

      <div className="absolute bottom-6 left-6 right-6">
        <div className="flex items-center justify-between">
          <span className="text-xs font-black text-white/70">
            {formatProgress(
              progress,
            )}
          </span>

          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
            Progress
          </span>
        </div>

        <div className="mt-3 h-[3px] overflow-hidden rounded-full bg-white/15">
          <div
            className="h-full rounded-full bg-[#C6FF32]"
            style={{
              width:
                `${progress}%`,
            }}
          />
        </div>
      </div>
    </div>
  );
}

function BookPlaceholder() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-white/[0.025]">
      <div className="absolute inset-y-0 left-[18%] w-px bg-white/[0.05]" />

      <div className="absolute inset-y-0 left-[22%] w-px bg-white/[0.025]" />

      <div className="absolute -right-20 top-20 h-64 w-64 rounded-full border border-white/[0.05]" />

      <div className="absolute -right-5 top-36 h-40 w-40 rounded-full border border-[#C6FF32]/10" />

      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex h-24 w-[72px] items-center justify-center rounded-[5px] border border-white/10 bg-white/[0.025]">
          <div className="h-10 w-px bg-[#C6FF32]/50" />
        </div>
      </div>

      <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[#030608]/80 to-transparent" />
    </div>
  );
}

function Highlights({
  highlights,
}: {
  highlights: LibraryHighlight[];
}) {
  return (
    <div className="space-y-4">
      {highlights.map(
        (
          highlight,
          index,
        ) => (
          <div
            key={
              highlight._id ||
              highlight.externalId
            }
            className="group rounded-[28px] border border-white/10 bg-white/[0.018] p-7 transition duration-300 hover:border-white/20 hover:bg-white/[0.025]"
          >
            <div className="flex gap-5">
              <div className="pt-1">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#C6FF32]/10">
                  <Highlighter className="h-3.5 w-3.5 text-[#C6FF32]" />
                </span>
              </div>

              <div className="min-w-0 flex-1">
                {highlight.text && (
                  <p className="max-w-4xl text-xl font-semibold leading-8 text-white/80">
                    {
                      highlight.text
                    }
                  </p>
                )}

                {highlight.note && (
                  <div className="mt-6 border-l-2 border-[#C6FF32]/40 pl-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#C6FF32]/70">
                      My note
                    </p>

                    <p className="mt-2 max-w-3xl leading-7 text-white/55">
                      {
                        highlight.note
                      }
                    </p>
                  </div>
                )}

                <div className="mt-5 flex flex-wrap items-center gap-4 text-xs text-white/25">
                  <span>
                    Highlight{" "}
                    {index +
                      1}
                  </span>

                  {highlight.highlightedAt && (
                    <span>
                      {formatDate(
                        highlight.highlightedAt,
                      )}
                    </span>
                  )}

                  {highlight.isFavourite && (
                    <span className="flex items-center gap-1.5 text-[#C6FF32]/70">
                      <Bookmark className="h-3 w-3" />

                      Saved
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        ),
      )}
    </div>
  );
}

function KnowledgeSection({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string;

  title: string;

  children: React.ReactNode;
}) {
  return (
    <section className="border-t border-white/10 py-16 first:border-t-0 first:pt-0">
      <Eyebrow>
        {eyebrow}
      </Eyebrow>

      <h2 className="mb-10 mt-4 text-2xl font-black tracking-[-0.035em]">
        {title}
      </h2>

      {children}
    </section>
  );
}

function MetaGroup({
  label,
  value,
}: {
  label: string;

  value: string;
}) {
  return (
    <div>
      <p className="text-[10px] font-black uppercase tracking-[0.22em] text-white/25">
        {label}
      </p>

      <p className="mt-2 text-lg font-black text-white/70">
        {value}
      </p>
    </div>
  );
}

function formatStatus(
  status: Book["status"],
) {
  const statuses:
    Record<
      string,
      string
    > = {
    want_to_read:
      "Want to read",

    reading:
      "Reading",

    paused:
      "Paused",

    completed:
      "Finished",

    dropped:
      "Dropped",
  };

  return (
    statuses[status] ??
    status.replaceAll(
      "_",
      " ",
    )
  );
}

function formatProgress(
  progress: number,
) {
  if (
    progress <= 0
  ) {
    return "Not started";
  }

  if (
    progress >= 99.5
  ) {
    return "Finished";
  }

  return `${progress.toFixed(
    progress % 1 === 0
      ? 0
      : 1,
  )}%`;
}

function formatDate(
  value: string,
) {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
    },
  ).format(date);
}