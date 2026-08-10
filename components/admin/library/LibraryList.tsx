"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  BookOpen,
  Edit3,
  ExternalLink,
  Heart,
  Plus,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";

import type { LibraryItem } from "@/types/library";

import { deleteLibraryItem } from "@/lib/api/library";

import { AdminSearch } from "@/components/admin/AdminSearch";
import { AdminStatusBadge } from "@/components/admin/AdminStatusBadge";
import { AdminEmptyState } from "@/components/admin/AdminEmptyState";
import { AdminConfirmDialog } from "@/components/admin/AdminConfirmDialog";

import { LibraryFilters } from "./LibraryFilters";
import { LibraryProgress } from "./LibraryProgress";

type LibraryListProps = {
  initialItems: LibraryItem[];
};

export function LibraryList({
  initialItems,
}: LibraryListProps) {
  const router = useRouter();

  const [search, setSearch] =
    useState("");

  const [type, setType] =
    useState("");

  const [status, setStatus] =
    useState("");

  const [
    favouriteOnly,
    setFavouriteOnly,
  ] = useState(false);

  const [
    archivedOnly,
    setArchivedOnly,
  ] = useState(false);

  const [
    deleteTarget,
    setDeleteTarget,
  ] =
    useState<LibraryItem | null>(
      null,
    );

  const [deleting, setDeleting] =
    useState(false);

  const filteredItems =
    useMemo(() => {
      const normalizedSearch =
        search
          .trim()
          .toLowerCase();

      return initialItems.filter(
        (item) => {
          const matchesSearch =
            !normalizedSearch ||
            [
              item.title,
              item.subtitle,
              item.author,
              item.publisher,
              item.category,
              ...(item.tags ?? []),
            ]
              .filter(Boolean)
              .some((value) =>
                String(value)
                  .toLowerCase()
                  .includes(
                    normalizedSearch,
                  ),
              );

          const matchesType =
            !type ||
            item.type === type;

          const matchesStatus =
            !status ||
            item.status === status;

          const matchesFavourite =
            !favouriteOnly ||
            item.isFavourite;

          const matchesArchived =
            archivedOnly
              ? item.isArchived
              : !item.isArchived;

          return (
            matchesSearch &&
            matchesType &&
            matchesStatus &&
            matchesFavourite &&
            matchesArchived
          );
        },
      );
    }, [
      archivedOnly,
      favouriteOnly,
      initialItems,
      search,
      status,
      type,
    ]);

  const hasFilters = Boolean(
    search ||
      type ||
      status ||
      favouriteOnly ||
      archivedOnly,
  );

  function clearFilters() {
    setSearch("");
    setType("");
    setStatus("");
    setFavouriteOnly(false);
    setArchivedOnly(false);
  }

  async function handleDelete() {
    if (!deleteTarget) {
      return;
    }

    try {
      setDeleting(true);

      await deleteLibraryItem(
        deleteTarget._id,
      );

      setDeleteTarget(null);

      router.refresh();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <>
      <div>
        <div className="mt-8 rounded-[24px] border border-white/10 bg-white/[0.025] p-4 sm:p-5">
          <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
            <div className="min-w-0 flex-1">
              <AdminSearch
                value={search}
                onChange={setSearch}
                placeholder="Search title, author, category or tag"
              />
            </div>

            <Link
              href="/admin/library/new"
              className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-[16px] bg-[#C6FF32] px-5 text-sm font-black text-[#030608] transition hover:brightness-95"
            >
              <Plus className="h-4 w-4" />
              Add item
            </Link>
          </div>

          <div className="mt-4">
            <LibraryFilters
              type={type}
              status={status}
              favouriteOnly={
                favouriteOnly
              }
              archivedOnly={
                archivedOnly
              }
              onTypeChange={
                setType
              }
              onStatusChange={
                setStatus
              }
              onFavouriteChange={
                setFavouriteOnly
              }
              onArchivedChange={
                setArchivedOnly
              }
            />
          </div>

          {hasFilters && (
            <div className="mt-4 flex items-center justify-between gap-4 border-t border-white/[0.07] pt-4">
              <p className="text-sm text-white/30">
                Showing{" "}
                <span className="font-bold text-white">
                  {
                    filteredItems.length
                  }
                </span>{" "}
                of{" "}
                <span className="font-bold text-white">
                  {
                    initialItems.length
                  }
                </span>{" "}
                items
              </p>

              <button
                type="button"
                onClick={
                  clearFilters
                }
                className="text-sm font-bold text-white/40 transition hover:text-white"
              >
                Clear filters
              </button>
            </div>
          )}
        </div>

        <div className="mt-8">
          {filteredItems.length ===
          0 ? (
            <AdminEmptyState
              icon={BookOpen}
              title={
                initialItems.length ===
                0
                  ? "No library items yet"
                  : "No library items found"
              }
              description={
                initialItems.length ===
                0
                  ? "Create your first library item and start tracking books, articles, courses and other learning resources."
                  : "Try changing your search or filters."
              }
              action={
                initialItems.length ===
                0 ? (
                  <Link
                    href="/admin/library/new"
                    className="flex min-h-11 items-center gap-2 rounded-[14px] bg-[#C6FF32] px-5 text-sm font-black text-[#030608]"
                  >
                    <Plus className="h-4 w-4" />
                    Add library item
                  </Link>
                ) : (
                  <button
                    type="button"
                    onClick={
                      clearFilters
                    }
                    className="flex min-h-11 items-center rounded-[14px] border border-white/10 px-5 text-sm font-bold text-white/60 transition hover:border-white/20 hover:text-white"
                  >
                    Clear filters
                  </button>
                )
              }
            />
          ) : (
            <div className="overflow-hidden rounded-[24px] border border-white/10">
              <div className="overflow-x-auto">
                <table className="w-full min-w-[1050px]">
                  <thead className="bg-white/[0.025]">
                    <tr>
                      <th className="border-b border-white/10 px-5 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                        Item
                      </th>

                      <th className="border-b border-white/10 px-5 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                        Type
                      </th>

                      <th className="border-b border-white/10 px-5 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                        Progress
                      </th>

                      <th className="border-b border-white/10 px-5 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                        Status
                      </th>

                      <th className="border-b border-white/10 px-5 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                        Rating
                      </th>

                      <th className="border-b border-white/10 px-5 py-4 text-left text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                        Updated
                      </th>

                      <th className="border-b border-white/10 px-5 py-4 text-right text-[10px] font-black uppercase tracking-[0.2em] text-white/30">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-white/10">
                    {filteredItems.map(
                      (item) => (
                        <tr
                          key={
                            item._id
                          }
                          className="bg-[#05090b] transition hover:bg-white/[0.02]"
                        >
                          <td className="px-5 py-4">
                            <div className="flex items-center gap-4">
                              <div className="h-16 w-12 shrink-0 overflow-hidden rounded-xl border border-white/10 bg-white/[0.04]">
                                {item.coverImageUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img
                                    src={
                                      item.coverImageUrl
                                    }
                                    alt={
                                      item.title
                                    }
                                    className="h-full w-full object-cover"
                                  />
                                ) : (
                                  <div className="grid h-full place-items-center text-white/20">
                                    <BookOpen className="h-5 w-5" />
                                  </div>
                                )}
                              </div>

                              <div className="min-w-0">
                                <div className="flex items-center gap-2">
                                  <Link
                                    href={`/admin/library/${item._id}`}
                                    className="truncate font-bold text-white transition hover:text-[#C6FF32]"
                                  >
                                    {
                                      item.title
                                    }
                                  </Link>

                                  {item.isFavourite && (
                                    <Heart className="h-4 w-4 shrink-0 fill-[#C6FF32] text-[#C6FF32]" />
                                  )}
                                </div>

                                <p className="mt-1 truncate text-sm text-white/35">
                                  {item.author ||
                                    item.publisher ||
                                    "No author"}
                                </p>

                                {item.category && (
                                  <p className="mt-1 text-xs text-white/25">
                                    {
                                      item.category
                                    }
                                  </p>
                                )}
                              </div>
                            </div>
                          </td>

                          <td className="px-5 py-4 text-sm capitalize text-white/45">
                            {item.type.replaceAll(
                              "_",
                              " ",
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <LibraryProgress
                              percentage={
                                item.progressPercentage
                              }
                              currentPage={
                                item.currentPage
                              }
                              totalPages={
                                item.totalPages
                              }
                            />
                          </td>

                          <td className="px-5 py-4">
                            <AdminStatusBadge
                              status={
                                item.status
                              }
                            />
                          </td>

                          <td className="px-5 py-4 text-sm text-white/45">
                            {item.rating
                              ? `${item.rating}/5`
                              : "—"}
                          </td>

                          <td className="px-5 py-4 text-sm text-white/35">
                            {formatDate(
                              item.updatedAt,
                            )}
                          </td>

                          <td className="px-5 py-4">
                            <div className="flex justify-end gap-2">
                              {item.sourceUrl && (
                                <a
                                  href={
                                    item.sourceUrl
                                  }
                                  target="_blank"
                                  rel="noreferrer"
                                  aria-label={`Open ${item.title}`}
                                  className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 text-white/35 transition hover:border-white/20 hover:text-white"
                                >
                                  <ExternalLink className="h-4 w-4" />
                                </a>
                              )}

                              <Link
                                href={`/admin/library/${item._id}`}
                                aria-label={`Edit ${item.title}`}
                                className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 text-white/35 transition hover:border-[#C6FF32]/20 hover:bg-[#C6FF32]/10 hover:text-[#C6FF32]"
                              >
                                <Edit3 className="h-4 w-4" />
                              </Link>

                              <button
                                type="button"
                                aria-label={`Delete ${item.title}`}
                                onClick={() =>
                                  setDeleteTarget(
                                    item,
                                  )
                                }
                                className="grid h-9 w-9 place-items-center rounded-xl border border-white/10 text-white/35 transition hover:border-red-400/20 hover:bg-red-400/10 hover:text-red-300"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      ),
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>

      <AdminConfirmDialog
        open={Boolean(
          deleteTarget,
        )}
        title="Delete library item?"
        description={`This will remove “${
          deleteTarget?.title ??
          "this item"
        }” from your library.`}
        confirmLabel="Delete"
        destructive
        loading={deleting}
        onClose={() =>
          setDeleteTarget(null)
        }
        onConfirm={
          handleDelete
        }
      />
    </>
  );
}

function formatDate(
  value:
    | string
    | null
    | undefined,
): string {
  if (!value) {
    return "—";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "—";
  }

  return new Intl.DateTimeFormat(
    "en-IN",
    {
      day: "2-digit",
      month: "short",
      year: "numeric",
    },
  ).format(date);
}