"use client";

import Link from "next/link";
import { motion } from "motion/react";

import Reveal from "@/components/ui/Reveal";
import { SpotlightCard } from "@/components/ui/SpotlightCard";
import { Container } from "@/components/ui/Container";

import type { Book } from "@/lib/library";

interface LibraryProps {
  books: Book[];
}

export function Library({
  books,
}: LibraryProps) {
  const formattedBooks: [
    string,
    string,
    string,
    string,
  ][] = books.map(
    (book) => [
      book.title,

      book.status === "completed"
        ? "Finished"
        : `${book.progressPercentage ?? 0}%`,

      book.category ?? "Uncategorized",

      book.slug,
    ],
  );

  return (
    <Reveal>
      <section className="py-28">
        <Container>
          <p className="text-xs font-black uppercase tracking-[0.28em] text-[#C6FF32]">
            My Library
          </p>

          <h2 className="mt-6 max-w-5xl text-6xl font-black leading-[0.95] tracking-[-0.06em] md:text-8xl">
            Books are how I borrow better thinking.
          </h2>

          <div className="mt-20 overflow-visible">
            <div className="relative overflow-visible py-16">
              <div className="flex min-h-[520px] flex-wrap items-end gap-5 overflow-visible border-b border-white/20 pb-12 pt-20">
                {formattedBooks.map(
                  ([
                    book,
                    progress,
                    type,
                    slug,
                  ]) => (
                    <Link
                      key={slug}
                      href={`/library/${slug}`}
                      className="block"
                    >
                      <motion.div
                        whileHover={{
                          y: -30,
                          rotate: -3,
                        }}
                        transition={{
                          duration: 0.35,
                          ease: "easeOut",
                        }}
                        className="group relative h-[360px] w-[180px] shrink-0 cursor-pointer overflow-visible"
                      >
                        <SpotlightCard className="absolute inset-0 h-full w-full rounded-t-[28px] border border-white/10 bg-white/[0.035]">
                          <span className="sr-only">
                            {book}
                          </span>
                        </SpotlightCard>

                        <div className="pointer-events-none absolute inset-0 z-10 flex flex-col p-5">
                          <p className="text-xs font-black uppercase tracking-[0.25em] text-[#C6FF32]">
                            {type}
                          </p>

                          <div className="mt-auto">
                            <h3 className="whitespace-normal break-words text-xl font-black leading-tight">
                              {book}
                            </h3>

                            <p className="mt-3 text-sm font-bold text-white/45">
                              {progress}
                            </p>
                          </div>
                        </div>
                      </motion.div>
                    </Link>
                  ),
                )}
              </div>
            </div>

            <p className="mt-8 text-sm text-white/40">
              Hover a book to pull it from the shelf. Each book opens into notes,
              quotes and how it changed my thinking.
            </p>
          </div>
        </Container>
      </section>
    </Reveal>
  );
}