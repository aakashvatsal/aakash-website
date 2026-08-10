import Link from "next/link";

import {
    ArrowUpRight,
    Highlighter,
} from "lucide-react";

import type {
    Book,
} from "@/lib/library";

interface LibraryBookCardProps {
    book: Book;
}

export function LibraryBookCard({
    book,
}: LibraryBookCardProps) {
    const progress =
        Math.min(
            Math.max(
                book.progressPercentage ??
                0,
                0,
            ),
            100,
        );

    return (
        <Link
            href={`/library/${book.slug}`}
            className="group block"
        >
            <article>
                <div className="relative aspect-[2/3] overflow-hidden rounded-[28px] border border-white/10 bg-white/[0.035] transition duration-500 group-hover:-translate-y-1 group-hover:border-[#C6FF32]/30">
                    {book.coverImageUrl ? (
                        <img
                            src={book.coverImageUrl}
                            alt={`${book.title} cover`}
                            loading="lazy"
                            decoding="async"
                            className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.025]"
                        />
                    ) : (
                        <BookPlaceholder />
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/5 to-transparent" />

                    <div className="absolute left-5 top-5">
                        <StatusBadge
                            status={
                                book.status
                            }
                        />
                    </div>

                    <div className="absolute bottom-5 left-5 right-5">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-bold text-white/75">
                                {formatProgress(
                                    progress,
                                )}
                            </span>

                            <ArrowUpRight className="h-4 w-4 text-white/40 transition duration-300 group-hover:text-[#C6FF32]" />
                        </div>

                        <div className="mt-3 h-[3px] overflow-hidden rounded-full bg-white/15">
                            <div
                                className="h-full rounded-full bg-[#C6FF32] transition-[width] duration-500"
                                style={{
                                    width:
                                        `${progress}%`,
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className="px-1 pt-5">
                    <h2 className="line-clamp-2 text-xl font-black leading-[1.15] tracking-[-0.035em] text-white transition duration-300 group-hover:text-[#C6FF32]">
                        {book.title}
                    </h2>

                    {book.author && (
                        <p className="mt-2 line-clamp-1 text-sm text-white/40">
                            {book.author}
                        </p>
                    )}

                    <div className="mt-4 flex min-h-5 flex-wrap items-center gap-x-4 gap-y-2 text-xs text-white/30">
                        {typeof book.highlightsCount ===
                            "number" &&
                            book.highlightsCount >
                            0 && (
                                <span className="flex items-center gap-1.5">
                                    <Highlighter className="h-3.5 w-3.5" />

                                    {
                                        book.highlightsCount
                                    }{" "}
                                    highlights
                                </span>
                            )}

                        {book.lastReadAt && (
                            <span>
                                {formatLastRead(
                                    book.lastReadAt,
                                )}
                            </span>
                        )}
                    </div>
                </div>
            </article>
        </Link>
    );
}

function StatusBadge({
    status,
}: {
    status:
    Book["status"];
}) {
    return (
        <span className="rounded-full border border-white/10 bg-[#030608]/70 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.17em] text-white/70 backdrop-blur-md">
            {formatStatus(
                status,
            )}
        </span>
    );
}

function BookPlaceholder() {
  return (
    <div className="absolute inset-0 overflow-hidden bg-white/[0.025]">
      {/* subtle vertical book/spine lines */}
      <div className="absolute inset-y-0 left-[18%] w-px bg-white/[0.05]" />
      <div className="absolute inset-y-0 left-[22%] w-px bg-white/[0.03]" />

      {/* soft abstract shape */}
      <div className="absolute -right-16 top-20 h-52 w-52 rounded-full border border-white/[0.06]" />
      <div className="absolute -right-6 top-32 h-32 w-32 rounded-full border border-[#C6FF32]/10" />

      {/* simple visual mark */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="flex h-20 w-16 items-center justify-center rounded-[4px] border border-white/10 bg-white/[0.025] shadow-2xl">
          <div className="h-8 w-px bg-[#C6FF32]/50" />
        </div>
      </div>

      {/* subtle bottom treatment */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#030608]/70 to-transparent" />
    </div>
  );
}

function formatStatus(
    status:
        Book["status"],
) {
    const labels:
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
        labels[status] ??
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

function formatLastRead(
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

    return `Read ${new Intl.DateTimeFormat(
        "en-IN",
        {
            day: "numeric",
            month: "short",
        },
    ).format(date)}`;
}