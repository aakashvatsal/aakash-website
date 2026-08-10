"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus, Search } from "lucide-react";

import type {
  JournalEntry,
  JournalEntryType,
  JournalMood,
} from "@/types/journal";

import {
  deleteJournalEntry,
  updateJournalEntry,
} from "@/lib/api/journal";

import { JournalCard } from "./JournalCard";
import { JournalStats } from "./JournalStats";
import { JournalFilters } from "./JournalFilters";

type JournalListProps = {
  initialEntries: JournalEntry[];
};

export function JournalList({
  initialEntries,
}: JournalListProps) {
  const [entries, setEntries] =
    useState<JournalEntry[]>(initialEntries);

  const [search, setSearch] = useState("");
  const [type, setType] = useState("");
  const [mood, setMood] = useState("");

  const [favouriteOnly, setFavouriteOnly] =
    useState(false);

  const [privateOnly, setPrivateOnly] =
    useState(false);

  const [archivedOnly, setArchivedOnly] =
    useState(false);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [updatingId, setUpdatingId] =
    useState<string | null>(null);

  const [deleteTarget, setDeleteTarget] =
    useState<JournalEntry | null>(null);

  const [error, setError] = useState("");

  const filteredEntries = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase();

    return [...entries]
      .filter((entry) => {
        if (
          type &&
          entry.type !==
            (type as JournalEntryType)
        ) {
          return false;
        }

        if (
          mood &&
          entry.mood !==
            (mood as JournalMood)
        ) {
          return false;
        }

        if (
          favouriteOnly &&
          !entry.isFavourite
        ) {
          return false;
        }

        if (
          privateOnly &&
          entry.visibility !== "private"
        ) {
          return false;
        }

        if (
          archivedOnly &&
          !entry.isArchived
        ) {
          return false;
        }

        if (!normalizedSearch) {
          return true;
        }

        const searchableText = [
          entry.title,
          entry.content ?? "",
          entry.highlight ?? "",
          ...(entry.tags ?? []),
          ...(entry.lessons ?? []),
          ...(entry.decisions ?? []),
          ...(entry.ideas ?? []),
          ...(entry.gratitude ?? []),
          ...(entry.challenges ?? []),
          ...(entry.wins ?? []),
          entry.workout?.type ?? "",
          entry.workout?.title ?? "",
          entry.workout?.notes ?? "",
          entry.reading?.title ?? "",
          entry.reading?.author ?? "",
          entry.reading?.thought ?? "",
          entry.visibility,
          entry.source,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return searchableText.includes(
          normalizedSearch,
        );
      })
      .sort((first, second) => {
        const firstDate = new Date(
          first.date,
        ).getTime();

        const secondDate = new Date(
          second.date,
        ).getTime();

        if (
          firstDate !== secondDate
        ) {
          return (
            secondDate -
            firstDate
          );
        }

        const firstCreatedAt =
          first.createdAt
            ? new Date(
                first.createdAt,
              ).getTime()
            : firstDate;

        const secondCreatedAt =
          second.createdAt
            ? new Date(
                second.createdAt,
              ).getTime()
            : secondDate;

        return (
          secondCreatedAt -
          firstCreatedAt
        );
      });
  }, [
    entries,
    search,
    type,
    mood,
    favouriteOnly,
    privateOnly,
    archivedOnly,
  ]);

  async function handleToggleFavourite(
    entry: JournalEntry,
  ) {
    try {
      setUpdatingId(entry._id);
      setError("");

      const updatedEntry =
        await updateJournalEntry(
          entry._id,
          {
            isFavourite:
              !entry.isFavourite,
          },
        );

      setEntries((current) =>
        current.map((item) =>
          item._id ===
          updatedEntry._id
            ? updatedEntry
            : item,
        ),
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to update favourite status.",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleToggleArchive(
    entry: JournalEntry,
  ) {
    try {
      setUpdatingId(entry._id);
      setError("");

      const updatedEntry =
        await updateJournalEntry(
          entry._id,
          {
            isArchived:
              !entry.isArchived,
          },
        );

      setEntries((current) =>
        current.map((item) =>
          item._id ===
          updatedEntry._id
            ? updatedEntry
            : item,
        ),
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to update archive status.",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) {
      return;
    }

    try {
      setDeletingId(
        deleteTarget._id,
      );

      setError("");

      await deleteJournalEntry(
        deleteTarget._id,
      );

      setEntries((current) =>
        current.filter(
          (entry) =>
            entry._id !==
            deleteTarget._id,
        ),
      );

      setDeleteTarget(null);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to delete journal entry.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  function clearFilters() {
    setSearch("");
    setType("");
    setMood("");
    setFavouriteOnly(false);
    setPrivateOnly(false);
    setArchivedOnly(false);
  }

  const hasFilters =
    Boolean(search.trim()) ||
    Boolean(type) ||
    Boolean(mood) ||
    favouriteOnly ||
    privateOnly ||
    archivedOnly;

  return (
    <div>
      <JournalStats
        entries={entries}
      />

      <div className="mt-8 rounded-[24px] border border-white/10 bg-white/[0.025] p-4 sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="relative min-w-0 flex-1">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />

            <input
              value={search}
              onChange={(event) =>
                setSearch(
                  event.target.value,
                )
              }
              placeholder="Search journal entries..."
              className="min-h-12 w-full rounded-[16px] border border-white/10 bg-[#05090b] pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#C6FF32]/40"
            />
          </div>

          <Link
            href="/admin/journal/new"
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-[16px] bg-[#C6FF32] px-5 text-sm font-black text-[#030608] transition hover:brightness-95"
          >
            <Plus className="h-4 w-4" />
            New entry
          </Link>
        </div>

        <div className="mt-4">
          <JournalFilters
            type={type}
            mood={mood}
            favouriteOnly={
              favouriteOnly
            }
            privateOnly={
              privateOnly
            }
            archivedOnly={
              archivedOnly
            }
            onTypeChange={
              setType
            }
            onMoodChange={
              setMood
            }
            onFavouriteChange={
              setFavouriteOnly
            }
            onPrivateChange={
              setPrivateOnly
            }
            onArchivedChange={
              setArchivedOnly
            }
          />
        </div>

        {hasFilters && (
          <div className="mt-4 flex items-center justify-between gap-4 border-t border-white/[0.07] pt-4">
            <p className="text-sm text-white/30">
              {filteredEntries.length} of{" "}
              {entries.length} entries
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

      {error && (
        <div className="mt-6 rounded-[16px] border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="mt-8">
        {filteredEntries.length ===
        0 ? (
          <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#C6FF32]/10 text-[#C6FF32]">
              <Plus className="h-6 w-6" />
            </div>

            <h2 className="mt-5 text-xl font-black text-white">
              {entries.length === 0
                ? "No journal entries yet"
                : "No matching entries"}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/35">
              {entries.length === 0
                ? "Capture your first reflection, idea, decision or daily journal entry."
                : "Try changing your search or filters."}
            </p>

            {entries.length ===
            0 ? (
              <Link
                href="/admin/journal/new"
                className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] bg-[#C6FF32] px-5 text-sm font-black text-[#030608]"
              >
                <Plus className="h-4 w-4" />
                Create entry
              </Link>
            ) : (
              <button
                type="button"
                onClick={
                  clearFilters
                }
                className="mt-6 min-h-11 rounded-[14px] border border-white/10 px-5 text-sm font-bold text-white/60 transition hover:border-white/20 hover:text-white"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {filteredEntries.map(
              (entry) => (
                <JournalCard
                  key={
                    entry._id
                  }
                  entry={
                    entry
                  }
                  deleting={
                    deletingId ===
                    entry._id
                  }
                  updating={
                    updatingId ===
                    entry._id
                  }
                  onDelete={
                    setDeleteTarget
                  }
                  onToggleFavourite={
                    handleToggleFavourite
                  }
                  onToggleArchive={
                    handleToggleArchive
                  }
                />
              ),
            )}
          </div>
        )}
      </div>

      {deleteTarget && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[24px] border border-white/10 bg-[#070b0d] p-6 shadow-2xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-red-300">
              Delete journal entry
            </p>

            <h2 className="mt-4 text-xl font-black text-white">
              Delete “
              {deleteTarget.title}
              ”?
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/40">
              This action cannot be undone.
            </p>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={
                  deletingId ===
                  deleteTarget._id
                }
                onClick={() =>
                  setDeleteTarget(
                    null,
                  )
                }
                className="min-h-11 rounded-[14px] border border-white/10 px-5 text-sm font-bold text-white/60 transition hover:border-white/20 hover:text-white disabled:opacity-40"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={
                  deletingId ===
                  deleteTarget._id
                }
                onClick={
                  handleDelete
                }
                className="min-h-11 rounded-[14px] bg-red-400 px-5 text-sm font-black text-[#190404] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deletingId ===
                deleteTarget._id
                  ? "Deleting..."
                  : "Delete entry"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}