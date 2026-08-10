"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import {
  Activity,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import {
  deleteHealthEntry,
  updateHealthEntry,
} from "@/lib/api/health";

import type {
  HealthEntry,
  HealthMood,
  WorkoutType,
} from "@/types/health";

import { HealthCard } from "./HealthCard";
import { HealthFilters } from "./HealthFilters";
import { HealthStats } from "./HealthStats";

type HealthListProps = {
  initialEntries: HealthEntry[];
};

export function HealthList({
  initialEntries,
}: HealthListProps) {
  const [entries, setEntries] =
    useState<HealthEntry[]>(initialEntries);

  const [search, setSearch] = useState("");
  const [mood, setMood] = useState("");
  const [workoutType, setWorkoutType] =
    useState("");

  const [archivedOnly, setArchivedOnly] =
    useState(false);

  const [activeOnly, setActiveOnly] =
    useState(false);

  const [painOnly, setPainOnly] =
    useState(false);

  const [workoutOnly, setWorkoutOnly] =
    useState(false);

  const [updatingId, setUpdatingId] =
    useState<string | null>(null);

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [
    deleteConfirmation,
    setDeleteConfirmation,
  ] = useState<HealthEntry | null>(null);

  const [error, setError] = useState("");

  const filteredEntries = useMemo(() => {
    const normalizedSearch = search
      .trim()
      .toLowerCase();

    return [...entries]
      .filter((entry) => {
        const workouts =
          entry.workouts ?? [];

        const painEntries =
          entry.painEntries ?? [];

        if (
          mood &&
          entry.mood !== (mood as HealthMood)
        ) {
          return false;
        }

        if (
          workoutType &&
          !workouts.some(
            (workout) =>
              workout.type ===
              (workoutType as WorkoutType),
          )
        ) {
          return false;
        }

        if (
          archivedOnly &&
          !entry.isArchived
        ) {
          return false;
        }

        if (
          activeOnly &&
          !entry.isActive
        ) {
          return false;
        }

        if (
          painOnly &&
          !painEntries.some(
            (painEntry) =>
              !painEntry.resolved,
          )
        ) {
          return false;
        }

        if (
          workoutOnly &&
          workouts.length === 0
        ) {
          return false;
        }

        if (!normalizedSearch) {
          return true;
        }

        return buildSearchText(
          entry,
        ).includes(
          normalizedSearch,
        );
      })
      .sort((first, second) => {
        const firstDate =
          new Date(
            first.date,
          ).getTime();

        const secondDate =
          new Date(
            second.date,
          ).getTime();

        if (
          secondDate !==
          firstDate
        ) {
          return (
            secondDate -
            firstDate
          );
        }

        return (
          new Date(
            second.createdAt ??
              second.date,
          ).getTime() -
          new Date(
            first.createdAt ??
              first.date,
          ).getTime()
        );
      });
  }, [
    entries,
    search,
    mood,
    workoutType,
    archivedOnly,
    activeOnly,
    painOnly,
    workoutOnly,
  ]);

  const hasActiveFilters =
    Boolean(search.trim()) ||
    Boolean(mood) ||
    Boolean(workoutType) ||
    archivedOnly ||
    activeOnly ||
    painOnly ||
    workoutOnly;

  function clearFilters() {
    setSearch("");
    setMood("");
    setWorkoutType("");
    setArchivedOnly(false);
    setActiveOnly(false);
    setPainOnly(false);
    setWorkoutOnly(false);
  }

  async function handleToggleArchive(
    entry: HealthEntry,
  ) {
    try {
      setUpdatingId(entry._id);
      setError("");

      const updatedEntry =
        await updateHealthEntry(
          entry._id,
          {
            isArchived:
              !entry.isArchived,
          },
        );

      setEntries((current) =>
        current.map(
          (currentEntry) =>
            currentEntry._id ===
            entry._id
              ? {
                  ...currentEntry,
                  ...updatedEntry,
                  isArchived:
                    updatedEntry.isArchived ??
                    !entry.isArchived,
                }
              : currentEntry,
        ),
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to update health entry.",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleToggleActive(
    entry: HealthEntry,
  ) {
    try {
      setUpdatingId(entry._id);
      setError("");

      const updatedEntry =
        await updateHealthEntry(
          entry._id,
          {
            isActive:
              !entry.isActive,
          },
        );

      setEntries((current) =>
        current.map(
          (currentEntry) =>
            currentEntry._id ===
            entry._id
              ? {
                  ...currentEntry,
                  ...updatedEntry,
                  isActive:
                    updatedEntry.isActive ??
                    !entry.isActive,
                }
              : currentEntry,
        ),
      );
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to update health entry.",
      );
    } finally {
      setUpdatingId(null);
    }
  }

  async function handleDelete() {
    if (!deleteConfirmation) {
      return;
    }

    try {
      setDeletingId(
        deleteConfirmation._id,
      );

      setError("");

      await deleteHealthEntry(
        deleteConfirmation._id,
      );

      setEntries((current) =>
        current.filter(
          (entry) =>
            entry._id !==
            deleteConfirmation._id,
        ),
      );

      setDeleteConfirmation(null);
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to delete health entry.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-8">
      <HealthStats entries={entries} />

      <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-4 sm:p-5">
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
              placeholder="Search health records..."
              className="min-h-12 w-full rounded-[16px] border border-white/10 bg-[#05090b] pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#C6FF32]/40"
            />
          </div>

          <Link
            href="/admin/health/new"
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-[16px] bg-[#C6FF32] px-5 text-sm font-black text-[#030608] transition hover:brightness-95"
          >
            <Plus className="h-4 w-4" />
            New entry
          </Link>
        </div>

        <div className="mt-4">
          <HealthFilters
            mood={mood}
            workoutType={workoutType}
            archivedOnly={archivedOnly}
            activeOnly={activeOnly}
            painOnly={painOnly}
            workoutOnly={workoutOnly}
            onMoodChange={setMood}
            onWorkoutTypeChange={
              setWorkoutType
            }
            onArchivedChange={
              setArchivedOnly
            }
            onActiveChange={
              setActiveOnly
            }
            onPainChange={
              setPainOnly
            }
            onWorkoutChange={
              setWorkoutOnly
            }
          />
        </div>

        {hasActiveFilters && (
          <div className="mt-4 flex items-center justify-between gap-4 border-t border-white/[0.07] pt-4">
            <p className="text-sm text-white/30">
              Showing{" "}
              <span className="font-bold text-white">
                {
                  filteredEntries.length
                }
              </span>{" "}
              of{" "}
              <span className="font-bold text-white">
                {entries.length}
              </span>{" "}
              entries
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
      </section>

      {error && (
        <div className="rounded-[16px] border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      {filteredEntries.length ===
      0 ? (
        <HealthEmptyState
          filtered={
            hasActiveFilters
          }
          onClear={
            clearFilters
          }
        />
      ) : (
        <div className="space-y-5">
          {filteredEntries.map(
            (entry) => (
              <HealthCard
                key={
                  entry._id
                }
                entry={
                  entry
                }
                updating={
                  updatingId ===
                  entry._id
                }
                deleting={
                  deletingId ===
                  entry._id
                }
                onDelete={
                  setDeleteConfirmation
                }
                onToggleArchive={
                  handleToggleArchive
                }
                onToggleActive={
                  handleToggleActive
                }
              />
            ),
          )}
        </div>
      )}

      {deleteConfirmation && (
        <DeleteHealthModal
          entry={
            deleteConfirmation
          }
          deleting={
            deletingId ===
            deleteConfirmation._id
          }
          onCancel={() =>
            setDeleteConfirmation(
              null,
            )
          }
          onConfirm={
            handleDelete
          }
        />
      )}
    </div>
  );
}

function buildSearchText(
  entry: HealthEntry,
) {
  const values: string[] = [
    entry.date,
    entry.mood,
    entry.notes ?? "",
    ...(entry.symptoms ?? []),
    ...(entry.achievements ?? []),
    ...(entry.goals ?? []),
    ...(entry.nutrition?.meals ?? []),
    ...(entry.nutrition
      ?.supplements ?? []),
    entry.nutrition?.notes ?? "",
  ];

  for (
    const workout of
    entry.workouts ?? []
  ) {
    values.push(
      workout.type,
      workout.title ?? "",
      workout.intensity,
      workout.notes ?? "",
    );

    for (
      const exercise of
      workout.exercises ?? []
    ) {
      values.push(
        exercise.name,
        exercise.muscleGroup ??
          "",
        exercise.notes ?? "",
      );
    }
  }

  for (
    const painEntry of
    entry.painEntries ?? []
  ) {
    values.push(
      painEntry.bodyPart,
      painEntry.severity,
      painEntry.description ??
        "",
      painEntry.trigger ?? "",
      painEntry.treatment ?? "",
    );
  }

  for (
    const habit of
    entry.habits ?? []
  ) {
    values.push(
      habit.key,
      habit.label,
      habit.completed
        ? "completed"
        : "missed",
    );
  }

  return values
    .join(" ")
    .toLowerCase();
}

type HealthEmptyStateProps = {
  filtered: boolean;
  onClear: () => void;
};

function HealthEmptyState({
  filtered,
  onClear,
}: HealthEmptyStateProps) {
  return (
    <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] px-6 py-20 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-[18px] bg-[#C6FF32]/10 text-[#C6FF32]">
        <Activity className="h-6 w-6" />
      </div>

      <h3 className="mt-5 text-lg font-black text-white">
        {filtered
          ? "No matching health entries"
          : "No health entries yet"}
      </h3>

      <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/35">
        {filtered
          ? "No records match the current search and filter settings."
          : "Create your first daily health entry to begin tracking sleep, recovery, workouts and nutrition."}
      </p>

      {filtered && (
        <button
          type="button"
          onClick={onClear}
          className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-[14px] border border-white/10 px-4 text-sm font-bold text-white/60 transition hover:border-[#C6FF32]/30 hover:text-[#C6FF32]"
        >
          <X className="h-4 w-4" />
          Clear filters
        </button>
      )}
    </div>
  );
}

type DeleteHealthModalProps = {
  entry: HealthEntry;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

function DeleteHealthModal({
  entry,
  deleting,
  onCancel,
  onConfirm,
}: DeleteHealthModalProps) {
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
      return value;
    }

    return new Intl.DateTimeFormat(
      "en-IN",
      {
        day: "2-digit",
        month: "long",
        year: "numeric",
      },
    ).format(date);
  }

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-black/75 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-health-title"
    >
      <div className="w-full max-w-md rounded-[24px] border border-white/10 bg-[#05090b] p-6 shadow-2xl">
        <div className="grid h-12 w-12 place-items-center rounded-[16px] bg-red-400/10 text-red-300">
          <Trash2 className="h-5 w-5" />
        </div>

        <h2
          id="delete-health-title"
          className="mt-5 text-xl font-black text-white"
        >
          Delete health entry?
        </h2>

        <p className="mt-3 text-sm leading-6 text-white/40">
          The health entry for{" "}
          <strong className="text-white">
            {formatDate(
              entry.date,
            )}
          </strong>{" "}
          will be permanently deleted.
          This action cannot be
          undone.
        </p>

        <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={deleting}
            onClick={onCancel}
            className="min-h-11 rounded-[14px] border border-white/10 px-5 text-sm font-bold text-white/55 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={deleting}
            onClick={onConfirm}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] bg-red-400 px-5 text-sm font-black text-[#030608] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Trash2 className="h-4 w-4" />

            {deleting
              ? "Deleting..."
              : "Delete entry"}
          </button>
        </div>
      </div>
    </div>
  );
}