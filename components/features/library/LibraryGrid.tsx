"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import {
  Loader2,
} from "lucide-react";

import {
  type Book,
  type LibraryApiResponse,
} from "@/lib/library";

import {
  LibraryBookCard,
} from "./LibraryBookCard";

interface LibraryGridProps {
  initialBooks: Book[];
  initialPage: number;
  initialTotalPages: number;
  limit: number;
}

export function LibraryGrid({
  initialBooks,
  initialPage,
  initialTotalPages,
  limit,
}: LibraryGridProps) {
  const [books, setBooks] =
    useState<Book[]>(
      initialBooks,
    );

  const [page, setPage] =
    useState(
      initialPage,
    );

  const [totalPages, setTotalPages] =
    useState(
      initialTotalPages,
    );

  const [loading, setLoading] =
    useState(false);

  const loadingRef =
    useRef(false);

  const loaderRef =
    useRef<HTMLDivElement | null>(
      null,
    );

  const hasMore =
    page < totalPages;

  const loadMore =
    useCallback(
      async () => {
        if (
          loadingRef.current ||
          !hasMore
        ) {
          return;
        }

        loadingRef.current =
          true;

        setLoading(true);

        try {
          const nextPage =
            page + 1;

          const query =
            new URLSearchParams({
              type: "book",

              page:
                nextPage.toString(),

              limit:
                limit.toString(),
            });

          const response =
            await fetch(
              `/api/library?${query.toString()}`,
              {
                method: "GET",

                headers: {
                  "Content-Type":
                    "application/json",
                },

                cache:
                  "no-store",
              },
            );

          if (!response.ok) {
            throw new Error(
              `Failed to fetch books: ${response.status}`,
            );
          }

          const result =
            (await response.json()) as
              LibraryApiResponse;

          setBooks(
            (
              existingBooks,
            ) => {
              const ids =
                new Set(
                  existingBooks.map(
                    (
                      book,
                    ) =>
                      book._id,
                  ),
                );

              const newBooks =
                result.data.filter(
                  (
                    book,
                  ) =>
                    !ids.has(
                      book._id,
                    ),
                );

              return [
                ...existingBooks,
                ...newBooks,
              ];
            },
          );

          setPage(
            result.pagination
              .page,
          );

          setTotalPages(
            result.pagination
              .totalPages,
          );
        } catch (
          error
        ) {
          console.error(
            "Failed to load more books:",
            error,
          );
        } finally {
          loadingRef.current =
            false;

          setLoading(false);
        }
      },
      [
        hasMore,
        limit,
        page,
      ],
    );

  useEffect(() => {
    const target =
      loaderRef.current;

    if (!target) {
      return;
    }

    const observer =
      new IntersectionObserver(
        (
          entries,
        ) => {
          if (
            entries[0]
              ?.isIntersecting
          ) {
            void loadMore();
          }
        },
        {
          rootMargin:
            "600px 0px",
        },
      );

    observer.observe(
      target,
    );

    return () => {
      observer.disconnect();
    };
  }, [
    loadMore,
  ]);

  return (
    <>
      <div className="grid gap-x-7 gap-y-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {books.map(
          (
            book,
          ) => (
            <LibraryBookCard
              key={
                book._id
              }
              book={
                book
              }
            />
          ),
        )}
      </div>

      <div
        ref={
          loaderRef
        }
        className="flex min-h-40 items-center justify-center"
      >
        {loading && (
          <div className="flex items-center gap-3 text-sm text-white/35">
            <Loader2 className="h-4 w-4 animate-spin" />

            Loading more books
          </div>
        )}

        {!hasMore &&
          books.length >
            0 && (
            <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-white/20">
              End of library
            </p>
          )}
      </div>
    </>
  );
}