"use client";

import Link from "next/link";
import {
  Archive,
  BookOpen,
  CalendarDays,
  Dumbbell,
  Footprints,
  Heart,
  LockKeyhole,
  Moon,
  Pencil,
  RotateCcw,
  Trash2,
} from "lucide-react";

import type { JournalEntry } from "@/types/journal";
import { MoodBadge } from "./MoodBadge";

type JournalCardProps = {
  entry: JournalEntry;
  deleting?: boolean;
  updating?: boolean;
  onDelete: (entry: JournalEntry) => void;
  onToggleFavourite?: (entry: JournalEntry) => void;
  onToggleArchive?: (entry: JournalEntry) => void;
};

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatType(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}

export function JournalCard({
  entry,
  deleting = false,
  updating = false,
  onDelete,
  onToggleFavourite,
  onToggleArchive,
}: JournalCardProps) {
  const workout = entry.workout;
  const reading = entry.reading;
  const sleep = entry.sleep;

  const workoutDuration =
    workout?.durationMinutes ?? 0;

  const readingPages =
    reading?.pagesRead ?? 0;

  const steps =
    entry.steps ?? 0;

  const hasWorkout =
    Boolean(workout?.completed) ||
    Boolean(workout?.type) ||
    Boolean(workout?.title) ||
    workoutDuration > 0;

  const hasReading =
    Boolean(reading?.completed) ||
    Boolean(reading?.title) ||
    Boolean(reading?.author) ||
    readingPages > 0;

  const hasSleep =
    typeof sleep?.durationHours === "number";

  const hasSteps =
    steps > 0;

  const preview =
    entry.highlight ||
    entry.content ||
    entry.lessons?.[0] ||
    entry.ideas?.[0];

  return (
    <article
      className={[
        "group relative overflow-hidden rounded-[24px] border bg-white/[0.025] transition",
        entry.isFavourite
          ? "border-[#C6FF32]/25"
          : "border-white/10 hover:border-white/20",
        entry.isArchived ? "opacity-70" : "",
        !entry.isActive ? "opacity-50" : "",
      ].join(" ")}
    >
      {entry.isFavourite && (
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#C6FF32] to-transparent" />
      )}

      <div className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-[0.15em] text-white/30">
                <CalendarDays className="h-3.5 w-3.5" />

                {formatDate(entry.date)}
              </span>

              <span className="rounded-full border border-white/10 bg-white/[0.035] px-3 py-1 text-xs font-bold text-white/45">
                {formatType(entry.type)}
              </span>

              <MoodBadge
                mood={entry.mood}
                score={entry.moodScore}
              />

              {entry.visibility === "private" && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-violet-400/20 bg-violet-400/10 px-3 py-1 text-xs font-bold text-violet-300">
                  <LockKeyhole className="h-3.5 w-3.5" />
                  Private
                </span>
              )}

              {entry.visibility === "shared" && (
                <span className="rounded-full border border-blue-400/20 bg-blue-400/10 px-3 py-1 text-xs font-bold text-blue-300">
                  Shared
                </span>
              )}

              {entry.visibility === "public" && (
                <span className="rounded-full border border-[#C6FF32]/20 bg-[#C6FF32]/10 px-3 py-1 text-xs font-bold text-[#C6FF32]">
                  Public
                </span>
              )}

              {entry.isArchived && (
                <span className="inline-flex items-center gap-1.5 rounded-full border border-orange-400/20 bg-orange-400/10 px-3 py-1 text-xs font-bold text-orange-300">
                  <Archive className="h-3.5 w-3.5" />
                  Archived
                </span>
              )}

              {!entry.isActive && (
                <span className="rounded-full border border-red-400/20 bg-red-400/10 px-3 py-1 text-xs font-bold text-red-300">
                  Inactive
                </span>
              )}
            </div>

            <Link
              href={`/admin/journal/${entry._id}`}
              className="mt-5 block"
            >
              <h2 className="text-xl font-black leading-tight text-white transition group-hover:text-[#C6FF32] sm:text-2xl">
                {entry.title}
              </h2>
            </Link>

            {entry.highlight && (
              <blockquote className="mt-4 border-l-2 border-[#C6FF32] pl-4 text-sm italic leading-6 text-white/60">
                {entry.highlight}
              </blockquote>
            )}

            {!entry.highlight && preview && (
              <p className="mt-4 line-clamp-3 max-w-4xl text-sm leading-7 text-white/45">
                {preview}
              </p>
            )}

            {entry.highlight && entry.content && (
              <p className="mt-4 line-clamp-2 max-w-4xl text-sm leading-7 text-white/35">
                {entry.content}
              </p>
            )}
          </div>

          <div className="flex shrink-0 items-center gap-1">
            {onToggleFavourite && (
              <button
                type="button"
                disabled={updating}
                onClick={() =>
                  onToggleFavourite(entry)
                }
                aria-label={
                  entry.isFavourite
                    ? "Remove from favourites"
                    : "Add to favourites"
                }
                title={
                  entry.isFavourite
                    ? "Remove favourite"
                    : "Favourite"
                }
                className={[
                  "grid h-10 w-10 place-items-center rounded-xl transition disabled:cursor-not-allowed disabled:opacity-40",
                  entry.isFavourite
                    ? "bg-[#C6FF32]/10 text-[#C6FF32]"
                    : "text-white/30 hover:bg-white/[0.05] hover:text-white",
                ].join(" ")}
              >
                <Heart
                  className="h-4 w-4"
                  fill={
                    entry.isFavourite
                      ? "currentColor"
                      : "none"
                  }
                />
              </button>
            )}

            {onToggleArchive && (
              <button
                type="button"
                disabled={updating}
                onClick={() =>
                  onToggleArchive(entry)
                }
                aria-label={
                  entry.isArchived
                    ? "Restore entry"
                    : "Archive entry"
                }
                title={
                  entry.isArchived
                    ? "Restore"
                    : "Archive"
                }
                className="grid h-10 w-10 place-items-center rounded-xl text-white/30 transition hover:bg-white/[0.05] hover:text-white disabled:cursor-not-allowed disabled:opacity-40"
              >
                {entry.isArchived ? (
                  <RotateCcw className="h-4 w-4" />
                ) : (
                  <Archive className="h-4 w-4" />
                )}
              </button>
            )}

            <Link
              href={`/admin/journal/${entry._id}`}
              aria-label="Edit journal entry"
              title="Edit"
              className="grid h-10 w-10 place-items-center rounded-xl text-white/30 transition hover:bg-[#C6FF32]/10 hover:text-[#C6FF32]"
            >
              <Pencil className="h-4 w-4" />
            </Link>

            <button
              type="button"
              disabled={deleting}
              onClick={() =>
                onDelete(entry)
              }
              aria-label="Delete journal entry"
              title="Delete"
              className="grid h-10 w-10 place-items-center rounded-xl text-white/30 transition hover:bg-red-400/10 hover:text-red-300 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        </div>

        {(hasWorkout ||
          hasReading ||
          hasSleep ||
          hasSteps) && (
          <div className="mt-6 flex flex-wrap gap-2 border-t border-white/[0.07] pt-5">
            {hasWorkout && (
              <MetricPill
                icon={Dumbbell}
                label={
                  workout?.title
                    ? workout.title
                    : workout?.type
                      ? formatType(workout.type)
                      : workout?.completed
                        ? "Workout done"
                        : "Workout"
                }
                value={
                  workoutDuration > 0
                    ? `${workoutDuration} min`
                    : undefined
                }
              />
            )}

            {hasReading && (
              <MetricPill
                icon={BookOpen}
                label={
                  reading?.title ||
                  (reading?.completed
                    ? "Reading done"
                    : "Reading")
                }
                value={
                  readingPages > 0
                    ? `${readingPages} pages`
                    : undefined
                }
              />
            )}

            {hasSleep && (
              <MetricPill
                icon={Moon}
                label="Sleep"
                value={`${sleep?.durationHours ?? 0} h${
                  typeof sleep?.quality === "number"
                    ? ` · ${sleep.quality}/10`
                    : ""
                }`}
              />
            )}

            {hasSteps && (
              <MetricPill
                icon={Footprints}
                label="Steps"
                value={formatNumber(steps)}
              />
            )}
          </div>
        )}

        {(typeof entry.energyScore === "number" ||
          typeof entry.productivityScore ===
            "number" ||
          typeof entry.stressScore === "number") && (
          <div className="mt-4 flex flex-wrap gap-x-6 gap-y-2 text-xs font-bold text-white/30">
            {typeof entry.energyScore ===
              "number" && (
              <span>
                Energy{" "}
                <strong className="text-white/65">
                  {entry.energyScore}/10
                </strong>
              </span>
            )}

            {typeof entry.productivityScore ===
              "number" && (
              <span>
                Productivity{" "}
                <strong className="text-white/65">
                  {entry.productivityScore}/10
                </strong>
              </span>
            )}

            {typeof entry.stressScore ===
              "number" && (
              <span>
                Stress{" "}
                <strong className="text-white/65">
                  {entry.stressScore}/10
                </strong>
              </span>
            )}
          </div>
        )}

        {(entry.tags?.length ?? 0) > 0 && (
          <div className="mt-5 flex flex-wrap gap-2">
            {(entry.tags ?? [])
              .slice(0, 6)
              .map((tag) => (
                <span
                  key={tag}
                  className="rounded-full border border-white/10 bg-white/[0.025] px-3 py-1 text-xs font-medium text-white/35"
                >
                  #{tag}
                </span>
              ))}

            {(entry.tags?.length ?? 0) > 6 && (
              <span className="rounded-full border border-white/10 px-3 py-1 text-xs text-white/25">
                +
                {(entry.tags?.length ?? 0) - 6}
              </span>
            )}
          </div>
        )}

        {((entry.wins?.length ?? 0) > 0 ||
          (entry.challenges?.length ?? 0) > 0 ||
          (entry.lessons?.length ?? 0) > 0) && (
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            {(entry.wins?.length ?? 0) > 0 && (
              <SummaryBlock
                label="Wins"
                value={entry.wins?.[0] ?? ""}
                count={entry.wins?.length ?? 0}
              />
            )}

            {(entry.challenges?.length ?? 0) > 0 && (
              <SummaryBlock
                label="Challenges"
                value={entry.challenges?.[0] ?? ""}
                count={
                  entry.challenges?.length ?? 0
                }
              />
            )}

            {(entry.lessons?.length ?? 0) > 0 && (
              <SummaryBlock
                label="Lessons"
                value={entry.lessons?.[0] ?? ""}
                count={entry.lessons?.length ?? 0}
              />
            )}
          </div>
        )}
      </div>
    </article>
  );
}

type MetricPillProps = {
  icon: React.ComponentType<{
    className?: string;
  }>;
  label: string;
  value?: string;
};

function MetricPill({
  icon: Icon,
  label,
  value,
}: MetricPillProps) {
  return (
    <div className="inline-flex min-w-0 items-center gap-2 rounded-[12px] border border-white/10 bg-white/[0.025] px-3 py-2">
      <Icon className="h-4 w-4 shrink-0 text-[#C6FF32]" />

      <span className="max-w-44 truncate text-xs font-bold text-white/50">
        {label}
      </span>

      {value && (
        <span className="shrink-0 text-xs font-black text-white/80">
          {value}
        </span>
      )}
    </div>
  );
}

type SummaryBlockProps = {
  label: string;
  value: string;
  count: number;
};

function SummaryBlock({
  label,
  value,
  count,
}: SummaryBlockProps) {
  return (
    <div className="rounded-[14px] border border-white/[0.07] bg-[#05090b] p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/25">
          {label}
        </p>

        {count > 1 && (
          <span className="text-[10px] font-bold text-white/20">
            +{count - 1}
          </span>
        )}
      </div>

      <p className="mt-2 line-clamp-2 text-xs leading-5 text-white/45">
        {value}
      </p>
    </div>
  );
}