"use client";

import {
  useState,
} from "react";

import {
  useRouter,
} from "next/navigation";

import {
  BookOpen,
  Dumbbell,
  Moon,
} from "lucide-react";

import {
  AdminFormFooter,
} from "../AdminFormFooter";

import type {
  JournalEntry,
  JournalEntryType,
  JournalMood,
  JournalSource,
  JournalVisibility,
} from "@/types/journal";

import {
  createJournalEntry,
  updateJournalEntry,
} from "@/lib/api/journal";

import type {
  JournalEntryPayload,
} from "@/lib/api/journal";

import {
  ScoreInput,
} from "./ScoreInput";

import {
  JournalStringListEditor,
} from "./JournalStringListEditor";

type JournalFormProps = {
  entry?: JournalEntry;
};

const fieldClassName =
  "min-h-12 w-full rounded-[14px] border border-white/10 bg-white/[0.025] px-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#C6FF32]/40";

const textareaClassName =
  "w-full resize-y rounded-[14px] border border-white/10 bg-white/[0.025] px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/25 focus:border-[#C6FF32]/40";

const JOURNAL_ENTRY_TYPES: JournalEntryType[] = [
  "daily",
  "reflection",
  "decision",
  "idea",
  "gratitude",
  "lesson",
  "meeting_note",
];

const JOURNAL_MOODS: JournalMood[] = [
  "focused",
  "calm",
  "creative",
  "happy",
  "energetic",
  "neutral",
  "tired",
  "stressed",
  "anxious",
  "low",
];

const JOURNAL_VISIBILITIES: JournalVisibility[] = [
  "private",
  "shared",
  "public",
];

const JOURNAL_SOURCES: JournalSource[] = [
  "manual",
  "hsakaa",
  "system",
  "imported",
  "other",
];

function formatLabel(
  value: string,
) {
  return value
    .replaceAll("_", " ")
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase(),
    );
}

function toDateInput(
  value?: string,
) {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return value.slice(
      0,
      10,
    );
  }

  return date
    .toISOString()
    .slice(0, 10);
}

function getTodayDate() {
  const now =
    new Date();

  const local =
    new Date(
      now.getTime() -
        now.getTimezoneOffset() *
          60_000,
    );

  return local
    .toISOString()
    .slice(0, 10);
}

function getEmptyForm(): JournalEntryPayload {
  return {
    date:
      getTodayDate(),

    type: "daily",

    title: "",

    content: "",

    highlight: "",

    mood: "neutral",

    moodScore:
      undefined,

    energyScore:
      undefined,

    productivityScore:
      undefined,

    stressScore:
      undefined,

    tags: [],

    lessons: [],

    decisions: [],

    ideas: [],

    gratitude: [],

    challenges: [],

    wins: [],

    workout: {
      completed: false,

      type: "",

      title: "",

      durationMinutes: 0,

      strainScore:
        undefined,

      notes: "",
    },

    reading: {
      completed: false,

      title: "",

      author: "",

      pagesRead: 0,

      progressPercentage:
        undefined,

      thought: "",
    },

    sleep: {
      durationHours:
        undefined,

      performancePercentage:
        undefined,

      quality:
        undefined,

      recoveryScore:
        undefined,
    },

    steps: 0,

    memoryIds: [],

    companyIds: [],

    libraryItemIds: [],

    visibility:
      "private",

    isPublished:
      false,

    isFavourite:
      false,

    isArchived:
      false,

    isActive: true,

    source: "manual",
  };
}

function entryToForm(
  entry: JournalEntry,
): JournalEntryPayload {
  return {
    date:
      toDateInput(
        entry.date,
      ),

    type:
      entry.type,

    title:
      entry.title,

    content:
      entry.content ??
      "",

    highlight:
      entry.highlight ??
      "",

    mood:
      entry.mood,

    moodScore:
      entry.moodScore,

    energyScore:
      entry.energyScore,

    productivityScore:
      entry.productivityScore,

    stressScore:
      entry.stressScore,

    tags:
      entry.tags ??
      [],

    lessons:
      entry.lessons ??
      [],

    decisions:
      entry.decisions ??
      [],

    ideas:
      entry.ideas ??
      [],

    gratitude:
      entry.gratitude ??
      [],

    challenges:
      entry.challenges ??
      [],

    wins:
      entry.wins ??
      [],

    workout: {
      completed:
        entry.workout
          ?.completed ??
        false,

      type:
        entry.workout
          ?.type ??
        "",

      title:
        entry.workout
          ?.title ??
        "",

      durationMinutes:
        entry.workout
          ?.durationMinutes ??
        0,

      strainScore:
        entry.workout
          ?.strainScore,

      notes:
        entry.workout
          ?.notes ??
        "",
    },

    reading: {
      completed:
        entry.reading
          ?.completed ??
        false,

      libraryItemId:
        entry.reading
          ?.libraryItemId,

      title:
        entry.reading
          ?.title ??
        "",

      author:
        entry.reading
          ?.author ??
        "",

      pagesRead:
        entry.reading
          ?.pagesRead ??
        0,

      progressPercentage:
        entry.reading
          ?.progressPercentage,

      thought:
        entry.reading
          ?.thought ??
        "",
    },

    sleep: {
      durationHours:
        entry.sleep
          ?.durationHours,

      performancePercentage:
        entry.sleep
          ?.performancePercentage,

      quality:
        entry.sleep
          ?.quality,

      recoveryScore:
        entry.sleep
          ?.recoveryScore,
    },

    steps:
      entry.steps ??
      0,

    memoryIds:
      entry.memoryIds ??
      [],

    companyIds:
      entry.companyIds ??
      [],

    libraryItemIds:
      entry.libraryItemIds ??
      [],

    visibility:
      entry.visibility ??
      "private",

    isPublished:
      entry.isPublished ??
      false,

    publishedAt:
      entry.publishedAt,

    isFavourite:
      entry.isFavourite ??
      false,

    isArchived:
      entry.isArchived ??
      false,

    isActive:
      entry.isActive ??
      true,

    source:
      entry.source ??
      "manual",

    sourceExternalId:
      entry.sourceExternalId,

    metadata:
      entry.metadata,
  };
}

export function JournalForm({
  entry,
}: JournalFormProps) {
  const router =
    useRouter();

  const isEditMode =
    Boolean(entry?._id);

  const [
    form,
    setForm,
  ] =
    useState<JournalEntryPayload>(
      () =>
        entry
          ? entryToForm(
              entry,
            )
          : getEmptyForm(),
    );

  const [
    saving,
    setSaving,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] =
    useState("");

  function updateField<
    K extends keyof JournalEntryPayload,
  >(
    key: K,
    value:
      JournalEntryPayload[K],
  ) {
    setForm(
      (current) => ({
        ...current,

        [key]:
          value,
      }),
    );
  }

  function updateWorkout(
    field:
      keyof NonNullable<
        JournalEntryPayload["workout"]
      >,
    value:
      | string
      | number
      | boolean
      | undefined,
  ) {
    setForm(
      (current) => ({
        ...current,

        workout: {
          ...current.workout,

          completed:
            current.workout
              ?.completed ??
            false,

          [field]:
            value,
        },
      }),
    );
  }

  function updateReading(
    field:
      keyof NonNullable<
        JournalEntryPayload["reading"]
      >,
    value:
      | string
      | number
      | boolean
      | undefined,
  ) {
    setForm(
      (current) => ({
        ...current,

        reading: {
          ...current.reading,

          completed:
            current.reading
              ?.completed ??
            false,

          [field]:
            value,
        },
      }),
    );
  }

  function updateSleep(
    field:
      keyof NonNullable<
        JournalEntryPayload["sleep"]
      >,
    value:
      number |
      undefined,
  ) {
    setForm(
      (current) => ({
        ...current,

        sleep: {
          ...current.sleep,

          [field]:
            value,
        },
      }),
    );
  }

  async function handleSubmit(
    event:
      React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (
      !form.title.trim()
    ) {
      setError(
        "Title is required.",
      );

      return;
    }

    if (!form.date) {
      setError(
        "Date is required.",
      );

      return;
    }

    try {
      setSaving(true);

      setError("");

      const payload: JournalEntryPayload =
        {
          ...form,

          title:
            form.title.trim(),

          content:
            form.content?.trim() ||
            undefined,

          highlight:
            form.highlight?.trim() ||
            undefined,

          workout: {
            completed:
              form.workout
                ?.completed ??
              false,

            type:
              form.workout
                ?.type?.trim() ||
              undefined,

            title:
              form.workout
                ?.title?.trim() ||
              undefined,

            durationMinutes:
              Math.max(
                0,
                Number(
                  form.workout
                    ?.durationMinutes ??
                    0,
                ),
              ),

            strainScore:
              form.workout
                ?.strainScore,

            notes:
              form.workout
                ?.notes?.trim() ||
              undefined,
          },

          reading: {
            completed:
              form.reading
                ?.completed ??
              false,

            libraryItemId:
              form.reading
                ?.libraryItemId ||
              undefined,

            title:
              form.reading
                ?.title?.trim() ||
              undefined,

            author:
              form.reading
                ?.author?.trim() ||
              undefined,

            pagesRead:
              Math.max(
                0,
                Number(
                  form.reading
                    ?.pagesRead ??
                    0,
                ),
              ),

            progressPercentage:
              form.reading
                ?.progressPercentage,

            thought:
              form.reading
                ?.thought?.trim() ||
              undefined,
          },

          sleep: {
            durationHours:
              form.sleep
                ?.durationHours,

            performancePercentage:
              form.sleep
                ?.performancePercentage,

            quality:
              form.sleep
                ?.quality,

            recoveryScore:
              form.sleep
                ?.recoveryScore,
          },

          steps:
            Math.max(
              0,
              Number(
                form.steps ??
                  0,
              ),
            ),

          tags:
            form.tags ??
            [],

          lessons:
            form.lessons ??
            [],

          decisions:
            form.decisions ??
            [],

          ideas:
            form.ideas ??
            [],

          gratitude:
            form.gratitude ??
            [],

          challenges:
            form.challenges ??
            [],

          wins:
            form.wins ??
            [],
        };

      if (
        entry?._id
      ) {
        await updateJournalEntry(
          entry._id,
          payload,
        );
      } else {
        await createJournalEntry(
          payload,
        );
      }

      router.push(
        "/admin/journal",
      );

      router.refresh();
    } catch (
      caughtError
    ) {
      setError(
        caughtError instanceof
          Error
          ? caughtError.message
          : "Unable to save journal entry.",
      );
    } finally {
      setSaving(false);
    }
  }

  const workout =
    form.workout ?? {
      completed: false,
    };

  const reading =
    form.reading ?? {
      completed: false,
    };

  const sleep =
    form.sleep ?? {};

  return (
    <form
      onSubmit={
        handleSubmit
      }
    >
      {error && (
        <div className="mt-6 rounded-[16px] border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
        <div className="space-y-6">
          <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5 sm:p-7">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#C6FF32]">
              Entry details
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <label>
                <span className="text-sm font-bold text-white/70">
                  Date
                </span>

                <input
                  required
                  type="date"
                  value={
                    form.date
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      "date",
                      event
                        .target
                        .value,
                    )
                  }
                  className={`${fieldClassName} mt-2`}
                />
              </label>

              <label>
                <span className="text-sm font-bold text-white/70">
                  Entry type
                </span>

                <select
                  value={
                    form.type ??
                    "daily"
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      "type",
                      event
                        .target
                        .value as JournalEntryType,
                    )
                  }
                  className={`${fieldClassName} mt-2 capitalize`}
                >
                  {JOURNAL_ENTRY_TYPES.map(
                    (
                      entryType,
                    ) => (
                      <option
                        key={
                          entryType
                        }
                        value={
                          entryType
                        }
                      >
                        {formatLabel(
                          entryType,
                        )}
                      </option>
                    ),
                  )}
                </select>
              </label>

              <label className="sm:col-span-2">
                <span className="text-sm font-bold text-white/70">
                  Title
                </span>

                <input
                  required
                  value={
                    form.title
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      "title",
                      event
                        .target
                        .value,
                    )
                  }
                  placeholder="What defined today?"
                  className={`${fieldClassName} mt-2`}
                />
              </label>

              <label className="sm:col-span-2">
                <span className="text-sm font-bold text-white/70">
                  Highlight
                </span>

                <input
                  value={
                    form.highlight ??
                    ""
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      "highlight",
                      event
                        .target
                        .value,
                    )
                  }
                  placeholder="The single most important moment or thought"
                  className={`${fieldClassName} mt-2`}
                />
              </label>

              <label className="sm:col-span-2">
                <span className="text-sm font-bold text-white/70">
                  Journal content
                </span>

                <textarea
                  rows={12}
                  value={
                    form.content ??
                    ""
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      "content",
                      event
                        .target
                        .value,
                    )
                  }
                  placeholder="Write your thoughts, reflections and observations..."
                  className={`${textareaClassName} mt-2`}
                />
              </label>
            </div>
          </section>

          <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5 sm:p-7">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#C6FF32]">
              Mood and scores
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <label>
                <span className="text-sm font-bold text-white/70">
                  Mood
                </span>

                <select
                  value={
                    form.mood ??
                    "neutral"
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      "mood",
                      event
                        .target
                        .value as JournalMood,
                    )
                  }
                  className={`${fieldClassName} mt-2 capitalize`}
                >
                  {JOURNAL_MOODS.map(
                    (
                      mood,
                    ) => (
                      <option
                        key={
                          mood
                        }
                        value={
                          mood
                        }
                      >
                        {formatLabel(
                          mood,
                        )}
                      </option>
                    ),
                  )}
                </select>
              </label>

              <ScoreInput
                label="Mood score"
                min={1}
                max={10}
                value={
                  form.moodScore
                }
                onChange={(
                  value,
                ) =>
                  updateField(
                    "moodScore",
                    value,
                  )
                }
              />

              <ScoreInput
                label="Energy"
                value={
                  form.energyScore
                }
                description="How energetic did you feel?"
                onChange={(
                  value,
                ) =>
                  updateField(
                    "energyScore",
                    value,
                  )
                }
              />

              <ScoreInput
                label="Productivity"
                value={
                  form.productivityScore
                }
                description="How productive was the day?"
                onChange={(
                  value,
                ) =>
                  updateField(
                    "productivityScore",
                    value,
                  )
                }
              />

              <ScoreInput
                label="Stress"
                value={
                  form.stressScore
                }
                description="How stressful was the day?"
                onChange={(
                  value,
                ) =>
                  updateField(
                    "stressScore",
                    value,
                  )
                }
              />
            </div>
          </section>

          <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5 sm:p-7">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#C6FF32]">
              Daily activity
            </p>

            <div className="mt-6 grid gap-5 lg:grid-cols-3">
              <div className="rounded-[20px] border border-white/10 bg-[#05090b] p-5">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#C6FF32]/10 text-[#C6FF32]">
                    <Dumbbell className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="font-bold text-white">
                      Workout
                    </p>

                    <p className="text-xs text-white/30">
                      Training completed today
                    </p>
                  </div>
                </div>

                <label className="mt-5 flex items-center gap-3 text-sm text-white/60">
                  <input
                    type="checkbox"
                    checked={
                      workout.completed ??
                      false
                    }
                    onChange={(
                      event,
                    ) =>
                      updateWorkout(
                        "completed",
                        event
                          .target
                          .checked,
                      )
                    }
                    className="h-4 w-4 accent-[#C6FF32]"
                  />

                  Workout completed
                </label>

                <label className="mt-5 block">
                  <span className="text-xs font-bold text-white/45">
                    Workout type
                  </span>

                  <input
                    value={
                      workout.type ??
                      ""
                    }
                    onChange={(
                      event,
                    ) =>
                      updateWorkout(
                        "type",
                        event
                          .target
                          .value,
                      )
                    }
                    placeholder="Push, pull, run..."
                    className={`${fieldClassName} mt-2`}
                  />
                </label>

                <label className="mt-5 block">
                  <span className="text-xs font-bold text-white/45">
                    Workout title
                  </span>

                  <input
                    value={
                      workout.title ??
                      ""
                    }
                    onChange={(
                      event,
                    ) =>
                      updateWorkout(
                        "title",
                        event
                          .target
                          .value,
                      )
                    }
                    placeholder="Push day"
                    className={`${fieldClassName} mt-2`}
                  />
                </label>

                <label className="mt-5 block">
                  <span className="text-xs font-bold text-white/45">
                    Duration in minutes
                  </span>

                  <input
                    type="number"
                    min={0}
                    value={
                      workout.durationMinutes ??
                      0
                    }
                    onChange={(
                      event,
                    ) =>
                      updateWorkout(
                        "durationMinutes",
                        Math.max(
                          0,
                          Number(
                            event
                              .target
                              .value,
                          ),
                        ),
                      )
                    }
                    className={`${fieldClassName} mt-2`}
                  />
                </label>

                <div className="mt-5">
                  <ScoreInput
                    label="Strain score"
                    min={0}
                    max={21}
                    value={
                      workout.strainScore
                    }
                    onChange={(
                      value,
                    ) =>
                      updateWorkout(
                        "strainScore",
                        value,
                      )
                    }
                  />
                </div>
              </div>

              <div className="rounded-[20px] border border-white/10 bg-[#05090b] p-5">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#C6FF32]/10 text-[#C6FF32]">
                    <BookOpen className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="font-bold text-white">
                      Reading
                    </p>

                    <p className="text-xs text-white/30">
                      Reading progress today
                    </p>
                  </div>
                </div>

                <label className="mt-5 flex items-center gap-3 text-sm text-white/60">
                  <input
                    type="checkbox"
                    checked={
                      reading.completed ??
                      false
                    }
                    onChange={(
                      event,
                    ) =>
                      updateReading(
                        "completed",
                        event
                          .target
                          .checked,
                      )
                    }
                    className="h-4 w-4 accent-[#C6FF32]"
                  />

                  Reading completed
                </label>

                <label className="mt-5 block">
                  <span className="text-xs font-bold text-white/45">
                    Title
                  </span>

                  <input
                    value={
                      reading.title ??
                      ""
                    }
                    onChange={(
                      event,
                    ) =>
                      updateReading(
                        "title",
                        event
                          .target
                          .value,
                      )
                    }
                    placeholder="Book or article"
                    className={`${fieldClassName} mt-2`}
                  />
                </label>

                <label className="mt-5 block">
                  <span className="text-xs font-bold text-white/45">
                    Author
                  </span>

                  <input
                    value={
                      reading.author ??
                      ""
                    }
                    onChange={(
                      event,
                    ) =>
                      updateReading(
                        "author",
                        event
                          .target
                          .value,
                      )
                    }
                    placeholder="Author"
                    className={`${fieldClassName} mt-2`}
                  />
                </label>

                <label className="mt-5 block">
                  <span className="text-xs font-bold text-white/45">
                    Pages read
                  </span>

                  <input
                    type="number"
                    min={0}
                    value={
                      reading.pagesRead ??
                      0
                    }
                    onChange={(
                      event,
                    ) =>
                      updateReading(
                        "pagesRead",
                        Math.max(
                          0,
                          Number(
                            event
                              .target
                              .value,
                          ),
                        ),
                      )
                    }
                    className={`${fieldClassName} mt-2`}
                  />
                </label>

                <label className="mt-5 block">
                  <span className="text-xs font-bold text-white/45">
                    Progress %
                  </span>

                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={
                      reading.progressPercentage ??
                      ""
                    }
                    onChange={(
                      event,
                    ) =>
                      updateReading(
                        "progressPercentage",
                        event
                          .target
                          .value ===
                          ""
                          ? undefined
                          : Number(
                              event
                                .target
                                .value,
                            ),
                      )
                    }
                    className={`${fieldClassName} mt-2`}
                  />
                </label>
              </div>

              <div className="rounded-[20px] border border-white/10 bg-[#05090b] p-5">
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#C6FF32]/10 text-[#C6FF32]">
                    <Moon className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="font-bold text-white">
                      Sleep
                    </p>

                    <p className="text-xs text-white/30">
                      Duration and quality
                    </p>
                  </div>
                </div>

                <label className="mt-5 block">
                  <span className="text-xs font-bold text-white/45">
                    Duration in hours
                  </span>

                  <input
                    type="number"
                    min={0}
                    max={24}
                    step={0.1}
                    value={
                      sleep.durationHours ??
                      ""
                    }
                    onChange={(
                      event,
                    ) =>
                      updateSleep(
                        "durationHours",
                        event
                          .target
                          .value ===
                          ""
                          ? undefined
                          : Number(
                              event
                                .target
                                .value,
                            ),
                      )
                    }
                    className={`${fieldClassName} mt-2`}
                  />
                </label>

                <div className="mt-5">
                  <ScoreInput
                    label="Sleep quality"
                    min={0}
                    max={10}
                    value={
                      sleep.quality
                    }
                    onChange={(
                      value,
                    ) =>
                      updateSleep(
                        "quality",
                        value,
                      )
                    }
                  />
                </div>

                <div className="mt-5">
                  <ScoreInput
                    label="Sleep performance"
                    min={0}
                    max={100}
                    value={
                      sleep.performancePercentage
                    }
                    onChange={(
                      value,
                    ) =>
                      updateSleep(
                        "performancePercentage",
                        value,
                      )
                    }
                  />
                </div>

                <div className="mt-5">
                  <ScoreInput
                    label="Recovery"
                    min={0}
                    max={100}
                    value={
                      sleep.recoveryScore
                    }
                    onChange={(
                      value,
                    ) =>
                      updateSleep(
                        "recoveryScore",
                        value,
                      )
                    }
                  />
                </div>
              </div>
            </div>

            <label className="mt-6 block max-w-sm">
              <span className="text-sm font-bold text-white/70">
                Steps
              </span>

              <input
                type="number"
                min={0}
                value={
                  form.steps ??
                  0
                }
                onChange={(
                  event,
                ) =>
                  updateField(
                    "steps",
                    Math.max(
                      0,
                      Number(
                        event
                          .target
                          .value,
                      ),
                    ),
                  )
                }
                className={`${fieldClassName} mt-2`}
              />
            </label>
          </section>

          <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5 sm:p-7">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#C6FF32]">
              Reflection
            </p>

            <div className="mt-6 space-y-7">
              <JournalStringListEditor
                label="Wins"
                values={
                  form.wins ??
                  []
                }
                placeholder="What went well today?"
                multiline
                onChange={(
                  values,
                ) =>
                  updateField(
                    "wins",
                    values,
                  )
                }
              />

              <JournalStringListEditor
                label="Challenges"
                values={
                  form.challenges ??
                  []
                }
                placeholder="What was difficult?"
                multiline
                onChange={(
                  values,
                ) =>
                  updateField(
                    "challenges",
                    values,
                  )
                }
              />

              <JournalStringListEditor
                label="Lessons"
                values={
                  form.lessons ??
                  []
                }
                placeholder="What did you learn?"
                multiline
                onChange={(
                  values,
                ) =>
                  updateField(
                    "lessons",
                    values,
                  )
                }
              />

              <JournalStringListEditor
                label="Decisions"
                values={
                  form.decisions ??
                  []
                }
                placeholder="What decision did you make?"
                multiline
                onChange={(
                  values,
                ) =>
                  updateField(
                    "decisions",
                    values,
                  )
                }
              />

              <JournalStringListEditor
                label="Ideas"
                values={
                  form.ideas ??
                  []
                }
                placeholder="Capture an idea"
                multiline
                onChange={(
                  values,
                ) =>
                  updateField(
                    "ideas",
                    values,
                  )
                }
              />

              <JournalStringListEditor
                label="Gratitude"
                values={
                  form.gratitude ??
                  []
                }
                placeholder="What are you grateful for?"
                multiline
                onChange={(
                  values,
                ) =>
                  updateField(
                    "gratitude",
                    values,
                  )
                }
              />

              <JournalStringListEditor
                label="Tags"
                values={
                  form.tags ??
                  []
                }
                placeholder="Add tag"
                onChange={(
                  values,
                ) =>
                  updateField(
                    "tags",
                    values,
                  )
                }
              />
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#C6FF32]">
              Entry state
            </p>

            <div className="mt-5 space-y-5">
              <label className="block">
                <span className="text-sm font-bold text-white/70">
                  Visibility
                </span>

                <select
                  value={
                    form.visibility ??
                    "private"
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      "visibility",
                      event
                        .target
                        .value as JournalVisibility,
                    )
                  }
                  className={`${fieldClassName} mt-2 capitalize`}
                >
                  {JOURNAL_VISIBILITIES.map(
                    (
                      visibility,
                    ) => (
                      <option
                        key={
                          visibility
                        }
                        value={
                          visibility
                        }
                      >
                        {formatLabel(
                          visibility,
                        )}
                      </option>
                    ),
                  )}
                </select>
              </label>

              <label className="block">
                <span className="text-sm font-bold text-white/70">
                  Source
                </span>

                <select
                  value={
                    form.source ??
                    "manual"
                  }
                  onChange={(
                    event,
                  ) =>
                    updateField(
                      "source",
                      event
                        .target
                        .value as JournalSource,
                    )
                  }
                  className={`${fieldClassName} mt-2 capitalize`}
                >
                  {JOURNAL_SOURCES.map(
                    (
                      source,
                    ) => (
                      <option
                        key={
                          source
                        }
                        value={
                          source
                        }
                      >
                        {formatLabel(
                          source,
                        )}
                      </option>
                    ),
                  )}
                </select>
              </label>

              <StateToggle
                label="Published"
                description="Allow this entry to appear in public Journal views when visibility is Public."
                checked={
                  form.isPublished ??
                  false
                }
                onChange={(
                  checked,
                ) =>
                  updateField(
                    "isPublished",
                    checked,
                  )
                }
              />

              <StateToggle
                label="Favourite"
                description="Keep this entry highlighted."
                checked={
                  form.isFavourite ??
                  false
                }
                onChange={(
                  checked,
                ) =>
                  updateField(
                    "isFavourite",
                    checked,
                  )
                }
              />

              <StateToggle
                label="Archived"
                description="Remove it from the default active Journal view."
                checked={
                  form.isArchived ??
                  false
                }
                onChange={(
                  checked,
                ) =>
                  updateField(
                    "isArchived",
                    checked,
                  )
                }
              />

              <StateToggle
                label="Active"
                description="Disable the entry without deleting it."
                checked={
                  form.isActive ??
                  true
                }
                onChange={(
                  checked,
                ) =>
                  updateField(
                    "isActive",
                    checked,
                  )
                }
              />
            </div>
          </section>

          <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#C6FF32]">
              Entry preview
            </p>

            <div className="mt-5">
              <p className="text-xs font-bold uppercase tracking-[0.18em] text-white/25">
                {form.date ||
                  "No date"}
              </p>

              <h3 className="mt-3 text-xl font-black leading-tight text-white">
                {form.title ||
                  "Untitled journal entry"}
              </h3>

              {form.highlight && (
                <p className="mt-4 border-l-2 border-[#C6FF32] pl-4 text-sm italic leading-6 text-white/55">
                  {
                    form.highlight
                  }
                </p>
              )}

              <div className="mt-5 flex flex-wrap gap-2">
                <span className="rounded-full border border-[#C6FF32]/20 bg-[#C6FF32]/10 px-3 py-1 text-xs font-bold capitalize text-[#C6FF32]">
                  {formatLabel(
                    form.mood ??
                      "neutral",
                  )}
                </span>

                <span className="rounded-full border border-white/10 bg-white/[0.025] px-3 py-1 text-xs font-bold capitalize text-white/40">
                  {formatLabel(
                    form.type ??
                      "daily",
                  )}
                </span>

                <span className="rounded-full border border-white/10 bg-white/[0.025] px-3 py-1 text-xs font-bold capitalize text-white/40">
                  {formatLabel(
                    form.visibility ??
                      "private",
                  )}
                </span>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <PreviewMetric
                  label="Steps"
                  value={(
                    form.steps ??
                    0
                  ).toLocaleString(
                    "en-IN",
                  )}
                />

                <PreviewMetric
                  label="Sleep"
                  value={
                    sleep.durationHours
                      ? `${sleep.durationHours}h`
                      : "—"
                  }
                />

                <PreviewMetric
                  label="Workout"
                  value={
                    workout.completed
                      ? "Done"
                      : "Not done"
                  }
                />

                <PreviewMetric
                  label="Reading"
                  value={
                    reading.completed
                      ? `${reading.pagesRead ?? 0} pages`
                      : "Not done"
                  }
                />
              </div>
            </div>
          </section>
        </aside>

        <div className="xl:col-span-2">
          <AdminFormFooter
            saving={
              saving
            }
            isEditMode={
              isEditMode
            }
            createLabel="Create Entry"
            updateLabel="Save Entry"
          />
        </div>
      </div>
    </form>
  );
}

type StateToggleProps = {
  label: string;

  description:
    string;

  checked:
    boolean;

  onChange: (
    checked: boolean,
  ) => void;
};

function StateToggle({
  label,
  description,
  checked,
  onChange,
}: StateToggleProps) {
  return (
    <label className="flex items-center justify-between gap-4 rounded-[14px] border border-white/10 px-4 py-4">
      <div>
        <p className="text-sm font-bold text-white">
          {label}
        </p>

        <p className="mt-1 text-xs leading-5 text-white/30">
          {
            description
          }
        </p>
      </div>

      <input
        type="checkbox"
        checked={
          checked
        }
        onChange={(
          event,
        ) =>
          onChange(
            event.target
              .checked,
          )
        }
        className="h-4 w-4 accent-[#C6FF32]"
      />
    </label>
  );
}

function PreviewMetric({
  label,
  value,
}: {
  label: string;

  value: string;
}) {
  return (
    <div className="rounded-[14px] border border-white/10 p-3">
      <p className="text-[10px] font-black uppercase tracking-[0.18em] text-white/25">
        {label}
      </p>

      <p className="mt-2 font-black text-white">
        {value}
      </p>
    </div>
  );
}