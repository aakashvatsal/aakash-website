"use client";

import {
  useMemo,
  useState,
  type FormEvent,
} from "react";
import {
  useRouter,
} from "next/navigation";
import {
  Brain,
  CalendarDays,
  CircleAlert,
  Globe2,
  Plus,
  Trash2,
  UserRound,
} from "lucide-react";

import { AdminFormFooter } from "@/components/admin/AdminFormFooter";
import {
  createMemory,
  updateMemory,
} from "@/lib/api/memory";
import {
  MemoryAccessLevel,
  MemorySensitivity,
  MemorySource,
  MemoryType,
  MemoryVerificationStatus,
  type Memory,
  type MemoryPerson,
  type MemorySourceReference,
} from "@/types/hsakaa";

type MemoryFormMode = "create" | "edit";

type MemoryFormProps = {
  mode?: MemoryFormMode;
  initialData?: Memory | null;
  people?: MemoryPerson[];
  // ownerUserId?: string;
};

type MemoryFormState = {
  content: string;
  personId: string;

  type: MemoryType;
  source: MemorySource;
  accessLevel: MemoryAccessLevel;
  sensitivity: MemorySensitivity;
  verificationStatus: MemoryVerificationStatus;

  tags: string[];

  importance: number;
  confidence: number;

  expiresAt: string;

  sourceReference: {
    entityId: string;
    entityType: string;
    externalId: string;
    sourceUrl: string;
    sourceCreatedAt: string;
  };

  isActive: boolean;
  isArchived: boolean;
};

function formatEnum(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

function toDateTimeLocal(value?: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const timezoneOffset =
    date.getTimezoneOffset() * 60_000;

  return new Date(
    date.getTime() - timezoneOffset,
  )
    .toISOString()
    .slice(0, 16);
}

function getInitialState(
  initialData?: Memory | null,
): MemoryFormState {
  const sourceReference =
    initialData?.sourceReference;

  return {
    content: initialData?.content ?? "",

    personId:
      typeof initialData?.personId === "string"
        ? initialData.personId
        : initialData?.personId?._id ?? "",

    type:
      initialData?.type ??
      MemoryType.FACT,

    source:
      initialData?.source ??
      MemorySource.MANUAL,

    accessLevel:
      initialData?.accessLevel ??
      MemoryAccessLevel.OWNER_ONLY,

    sensitivity:
      initialData?.sensitivity ??
      MemorySensitivity.PERSONAL,

    verificationStatus:
      initialData?.verificationStatus ??
      MemoryVerificationStatus.CONFIRMED,

    tags: initialData?.tags ?? [],

    importance:
      initialData?.importance ?? 0.5,

    confidence:
      initialData?.confidence ?? 0.5,

    expiresAt: toDateTimeLocal(
      initialData?.expiresAt,
    ),

    sourceReference: {
      entityId:
        sourceReference?.entityId ?? "",
      entityType:
        sourceReference?.entityType ?? "",
      externalId:
        sourceReference?.externalId ?? "",
      sourceUrl:
        sourceReference?.sourceUrl ?? "",
      sourceCreatedAt: toDateTimeLocal(
        sourceReference?.sourceCreatedAt,
      ),
    },

    isActive:
      initialData?.isActive ?? true,

    isArchived:
      initialData?.isArchived ?? false,
  };
}

function FieldLabel({
  children,
  optional,
}: {
  children: React.ReactNode;
  optional?: boolean;
}) {
  return (
    <label className="mb-2 block text-sm font-bold text-white/65">
      {children}

      {optional ? (
        <span className="ml-2 text-xs font-medium text-white/25">
          Optional
        </span>
      ) : null}
    </label>
  );
}

function FormSection({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5 sm:p-6">
      <div className="mb-6">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-[#C6FF32]">
          {eyebrow}
        </p>

        <h2 className="mt-2 text-xl font-black tracking-[-0.03em] text-white">
          {title}
        </h2>

        <p className="mt-2 max-w-2xl text-sm leading-6 text-white/40">
          {description}
        </p>
      </div>

      {children}
    </section>
  );
}

const inputClassName =
  "min-h-12 w-full rounded-[16px] border border-white/10 bg-[#030608] px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#C6FF32]/50";

const selectClassName =
  "min-h-12 w-full rounded-[16px] border border-white/10 bg-[#030608] px-4 text-sm text-white/75 outline-none transition focus:border-[#C6FF32]/50";

export function MemoryForm({
  mode = "create",
  initialData,
  people = [],
  // ownerUserId,
}: MemoryFormProps) {
  const router = useRouter();

  const [form, setForm] =
    useState<MemoryFormState>(() =>
      getInitialState(initialData),
    );

  const [tagInput, setTagInput] =
    useState("");

  const [showAdvanced, setShowAdvanced] =
    useState(
      Boolean(
        initialData?.sourceReference ||
          initialData?.expiresAt,
      ),
    );

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] = useState("");

  const isEditMode = mode === "edit";

  const selectedPerson = useMemo(
    () =>
      people.find(
        (person) =>
          person._id === form.personId,
      ),
    [form.personId, people],
  );

  const requiresPerson =
    form.accessLevel ===
      MemoryAccessLevel.PERSON_PRIVATE ||
    form.accessLevel ===
      MemoryAccessLevel.OWNER_AND_PERSON;

  function updateField<
    Key extends keyof MemoryFormState,
  >(
    key: Key,
    value: MemoryFormState[Key],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function updateSourceReference(
    key: keyof MemoryFormState["sourceReference"],
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      sourceReference: {
        ...current.sourceReference,
        [key]: value,
      },
    }));
  }

  function addTag() {
    const normalizedTag = tagInput
      .trim()
      .replace(/^#/, "");

    if (!normalizedTag) {
      return;
    }

    setForm((current) => {
      if (
        current.tags.some(
          (tag) =>
            tag.toLowerCase() ===
            normalizedTag.toLowerCase(),
        )
      ) {
        return current;
      }

      return {
        ...current,
        tags: [
          ...current.tags,
          normalizedTag,
        ],
      };
    });

    setTagInput("");
  }

  function removeTag(tagToRemove: string) {
    setForm((current) => ({
      ...current,
      tags: current.tags.filter(
        (tag) => tag !== tagToRemove,
      ),
    }));
  }

  function handleTagKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (
      event.key === "Enter" ||
      event.key === ","
    ) {
      event.preventDefault();
      addTag();
    }
  }

  function validateForm() {
    if (!form.content.trim()) {
      return "Memory content is required.";
    }

    if (
      requiresPerson &&
      !form.personId
    ) {
      return "Select a person for this access level.";
    }

    if (
      form.importance < 0 ||
      form.importance > 1
    ) {
      return "Importance must be between 0 and 1.";
    }

    if (
      form.confidence < 0 ||
      form.confidence > 1
    ) {
      return "Confidence must be between 0 and 1.";
    }

    return "";
  }

  function buildSourceReference():
    | MemorySourceReference
    | undefined {
    const {
      entityId,
      entityType,
      externalId,
      sourceUrl,
      sourceCreatedAt,
    } = form.sourceReference;

    const hasReference = [
      entityId,
      entityType,
      externalId,
      sourceUrl,
      sourceCreatedAt,
    ].some((value) => value.trim());

    if (!hasReference) {
      return undefined;
    }

    return {
      entityId:
        entityId.trim() || undefined,
      entityType:
        entityType.trim() || undefined,
      externalId:
        externalId.trim() || undefined,
      sourceUrl:
        sourceUrl.trim() || undefined,
      sourceCreatedAt: sourceCreatedAt
        ? new Date(
            sourceCreatedAt,
          ).toISOString()
        : undefined,
    };
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const validationError =
      validateForm();

    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError("");

    const payload = {
      // ownerUserId:
      //   ownerUserId || undefined,

      personId:
        form.personId || null,

      content: form.content.trim(),

      type: form.type,
      source: form.source,

      sourceReference:
        buildSourceReference(),

      tags: form.tags,

      importance: form.importance,
      confidence: form.confidence,

      verificationStatus:
        form.verificationStatus,

      accessLevel:
        form.accessLevel,

      sensitivity:
        form.sensitivity,

      expiresAt: form.expiresAt
        ? new Date(
            form.expiresAt,
          ).toISOString()
        : null,

      isActive: form.isActive,
      isArchived: form.isArchived,
    };

    try {
      if (
        isEditMode &&
        initialData?._id
      ) {
        await updateMemory(
          initialData._id,
          payload,
          // ownerUserId,
        );
      } else {
        await createMemory(payload);
      }

      router.push(
        "/admin/hsakaa/memory",
      );

      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : isEditMode
            ? "Unable to update memory."
            : "Unable to create memory.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-8"
    >
      {error ? (
        <section className="rounded-[20px] border border-red-400/20 bg-red-400/[0.06] p-4">
          <div className="flex items-start gap-3">
            <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-300" />

            <p className="text-sm leading-6 text-red-100">
              {error}
            </p>
          </div>
        </section>
      ) : null}

      <FormSection
        eyebrow="Core Memory"
        title="What should HSAKAA remember?"
        description="Write one clear, atomic memory. Each memory should represent one fact, preference, decision, routine, goal, experience, relationship or project."
      >
        <FieldLabel>
          Memory content
        </FieldLabel>

        <textarea
          value={form.content}
          onChange={(event) =>
            updateField(
              "content",
              event.target.value,
            )
          }
          rows={7}
          required
          placeholder="Example: Aakash prefers soy milk because he is lactose intolerant."
          className="w-full resize-y rounded-[18px] border border-white/10 bg-[#030608] px-4 py-4 text-sm leading-7 text-white outline-none transition placeholder:text-white/25 focus:border-[#C6FF32]/50"
        />

        <div className="mt-4 flex items-center justify-between gap-4 text-xs text-white/25">
          <span>
            Keep memories specific and easy to
            retrieve.
          </span>

          <span>
            {form.content.length} characters
          </span>
        </div>
      </FormSection>

      <FormSection
        eyebrow="Context"
        title="Who is this memory about?"
        description="Global memories shape HSAKAA for every visitor. Person memories become available after the related person verifies their identity."
      >
        <div className="grid gap-5 lg:grid-cols-2">
          <div>
            <FieldLabel optional>
              Person
            </FieldLabel>

            <div className="relative">
              {form.personId ? (
                <UserRound className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#C6FF32]" />
              ) : (
                <Globe2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />
              )}

              <select
                value={form.personId}
                onChange={(event) =>
                  updateField(
                    "personId",
                    event.target.value,
                  )
                }
                className={`${selectClassName} pl-11`}
              >
                <option value="">
                  Global memory
                </option>

                {people.map((person) => (
                  <option
                    key={person._id}
                    value={person._id}
                  >
                    {person.preferredName ??
                      person.name}
                    {" — "}
                    {formatEnum(
                      person.relationship,
                    )}
                  </option>
                ))}
              </select>
            </div>

            {selectedPerson ? (
              <p className="mt-2 text-xs text-white/35">
                Linked to{" "}
                <span className="font-bold text-white/60">
                  {selectedPerson.name}
                </span>
                .
              </p>
            ) : (
              <p className="mt-2 text-xs text-white/35">
                Available as general HSAKAA
                context based on its access level.
              </p>
            )}
          </div>

          <div>
            <FieldLabel>
              Access level
            </FieldLabel>

            <select
              value={form.accessLevel}
              onChange={(event) =>
                updateField(
                  "accessLevel",
                  event.target
                    .value as MemoryAccessLevel,
                )
              }
              className={selectClassName}
            >
              {Object.values(
                MemoryAccessLevel,
              ).map((value) => (
                <option
                  key={value}
                  value={value}
                >
                  {formatEnum(value)}
                </option>
              ))}
            </select>

            <p className="mt-2 text-xs leading-5 text-white/35">
              {form.accessLevel ===
              MemoryAccessLevel.OWNER_ONLY
                ? "Only the owner-side HSAKAA system can use this memory."
                : form.accessLevel ===
                    MemoryAccessLevel.PUBLIC
                  ? "This memory may be used while talking with any visitor."
                  : form.accessLevel ===
                      MemoryAccessLevel.OWNER_AND_PERSON
                    ? "Both Aakash and the verified linked person may use this memory."
                    : "This memory is intended only for the verified linked person."}
            </p>
          </div>
        </div>

        {requiresPerson &&
        !form.personId ? (
          <div className="mt-5 rounded-[16px] border border-amber-300/20 bg-amber-300/[0.06] px-4 py-3 text-sm text-amber-100">
            This access level requires a linked
            person.
          </div>
        ) : null}
      </FormSection>

      <FormSection
        eyebrow="Classification"
        title="Organize the memory"
        description="Classification helps HSAKAA filter and retrieve the right memory for each conversation."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <FieldLabel>
              Memory type
            </FieldLabel>

            <select
              value={form.type}
              onChange={(event) =>
                updateField(
                  "type",
                  event.target
                    .value as MemoryType,
                )
              }
              className={selectClassName}
            >
              {Object.values(
                MemoryType,
              ).map((value) => (
                <option
                  key={value}
                  value={value}
                >
                  {formatEnum(value)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <FieldLabel>
              Source
            </FieldLabel>

            <select
              value={form.source}
              onChange={(event) =>
                updateField(
                  "source",
                  event.target
                    .value as MemorySource,
                )
              }
              className={selectClassName}
            >
              {Object.values(
                MemorySource,
              ).map((value) => (
                <option
                  key={value}
                  value={value}
                >
                  {formatEnum(value)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <FieldLabel>
              Verification status
            </FieldLabel>

            <select
              value={
                form.verificationStatus
              }
              onChange={(event) =>
                updateField(
                  "verificationStatus",
                  event.target
                    .value as MemoryVerificationStatus,
                )
              }
              className={selectClassName}
            >
              {Object.values(
                MemoryVerificationStatus,
              ).map((value) => (
                <option
                  key={value}
                  value={value}
                >
                  {formatEnum(value)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <FieldLabel>
              Sensitivity
            </FieldLabel>

            <select
              value={form.sensitivity}
              onChange={(event) =>
                updateField(
                  "sensitivity",
                  event.target
                    .value as MemorySensitivity,
                )
              }
              className={selectClassName}
            >
              {Object.values(
                MemorySensitivity,
              ).map((value) => (
                <option
                  key={value}
                  value={value}
                >
                  {formatEnum(value)}
                </option>
              ))}
            </select>
          </div>
        </div>
      </FormSection>

      <FormSection
        eyebrow="Retrieval"
        title="Importance and confidence"
        description="These scores influence how strongly HSAKAA prioritizes the memory when generating context."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-[20px] border border-white/10 bg-black/10 p-4">
            <div className="flex items-center justify-between gap-4">
              <FieldLabel>
                Importance
              </FieldLabel>

              <span className="text-sm font-black text-[#C6FF32]">
                {Math.round(
                  form.importance * 100,
                )}
                %
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={form.importance}
              onChange={(event) =>
                updateField(
                  "importance",
                  Number(
                    event.target.value,
                  ),
                )
              }
              className="mt-3 w-full accent-[#C6FF32]"
            />

            <div className="mt-2 flex justify-between text-[10px] font-bold uppercase tracking-wider text-white/25">
              <span>Low</span>
              <span>Critical</span>
            </div>
          </div>

          <div className="rounded-[20px] border border-white/10 bg-black/10 p-4">
            <div className="flex items-center justify-between gap-4">
              <FieldLabel>
                Confidence
              </FieldLabel>

              <span className="text-sm font-black text-[#C6FF32]">
                {Math.round(
                  form.confidence * 100,
                )}
                %
              </span>
            </div>

            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={form.confidence}
              onChange={(event) =>
                updateField(
                  "confidence",
                  Number(
                    event.target.value,
                  ),
                )
              }
              className="mt-3 w-full accent-[#C6FF32]"
            />

            <div className="mt-2 flex justify-between text-[10px] font-bold uppercase tracking-wider text-white/25">
              <span>Uncertain</span>
              <span>Confirmed</span>
            </div>
          </div>
        </div>
      </FormSection>

      <FormSection
        eyebrow="Search"
        title="Tags"
        description="Add keywords that help organize the memory and improve keyword-based retrieval."
      >
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            value={tagInput}
            onChange={(event) =>
              setTagInput(
                event.target.value,
              )
            }
            onKeyDown={handleTagKeyDown}
            placeholder="Enter a tag and press Enter"
            className={inputClassName}
          />

          <button
            type="button"
            onClick={addTag}
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-[16px] border border-white/10 bg-white/[0.04] px-5 text-sm font-bold text-white transition hover:border-[#C6FF32]/30 hover:text-[#C6FF32]"
          >
            <Plus className="h-4 w-4" />
            Add tag
          </button>
        </div>

        {form.tags.length ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {form.tags.map((tag) => (
              <span
                key={tag}
                className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/60"
              >
                #{tag}

                <button
                  type="button"
                  onClick={() =>
                    removeTag(tag)
                  }
                  aria-label={`Remove ${tag}`}
                  className="text-white/25 transition hover:text-red-300"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-3 text-sm text-white/30">
            No tags added.
          </p>
        )}
      </FormSection>

      <section className="rounded-[24px] border border-white/10 bg-white/[0.025]">
        <button
          type="button"
          onClick={() =>
            setShowAdvanced(
              (current) => !current,
            )
          }
          className="flex w-full items-center justify-between gap-4 p-5 text-left sm:p-6"
        >
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#C6FF32]">
              Advanced
            </p>

            <h2 className="mt-2 text-xl font-black tracking-[-0.03em] text-white">
              Source reference and lifecycle
            </h2>

            <p className="mt-2 text-sm leading-6 text-white/40">
              Add source identifiers, expiration
              and record-state settings when
              required.
            </p>
          </div>

          <span className="text-xl font-black text-white/40">
            {showAdvanced ? "−" : "+"}
          </span>
        </button>

        {showAdvanced ? (
          <div className="border-t border-white/10 p-5 sm:p-6">
            <div className="grid gap-5 md:grid-cols-2">
              <div>
                <FieldLabel optional>
                  Entity ID
                </FieldLabel>

                <input
                  value={
                    form.sourceReference
                      .entityId
                  }
                  onChange={(event) =>
                    updateSourceReference(
                      "entityId",
                      event.target.value,
                    )
                  }
                  placeholder="MongoDB ObjectId"
                  className={inputClassName}
                />
              </div>

              <div>
                <FieldLabel optional>
                  Entity type
                </FieldLabel>

                <input
                  value={
                    form.sourceReference
                      .entityType
                  }
                  onChange={(event) =>
                    updateSourceReference(
                      "entityType",
                      event.target.value,
                    )
                  }
                  placeholder="journal_entry"
                  className={inputClassName}
                />
              </div>

              <div>
                <FieldLabel optional>
                  External ID
                </FieldLabel>

                <input
                  value={
                    form.sourceReference
                      .externalId
                  }
                  onChange={(event) =>
                    updateSourceReference(
                      "externalId",
                      event.target.value,
                    )
                  }
                  placeholder="External reference"
                  className={inputClassName}
                />
              </div>

              <div>
                <FieldLabel optional>
                  Source URL
                </FieldLabel>

                <input
                  type="url"
                  value={
                    form.sourceReference
                      .sourceUrl
                  }
                  onChange={(event) =>
                    updateSourceReference(
                      "sourceUrl",
                      event.target.value,
                    )
                  }
                  placeholder="https://..."
                  className={inputClassName}
                />
              </div>

              <div>
                <FieldLabel optional>
                  Source created at
                </FieldLabel>

                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />

                  <input
                    type="datetime-local"
                    value={
                      form.sourceReference
                        .sourceCreatedAt
                    }
                    onChange={(event) =>
                      updateSourceReference(
                        "sourceCreatedAt",
                        event.target.value,
                      )
                    }
                    className={`${inputClassName} pl-11`}
                  />
                </div>
              </div>

              <div>
                <FieldLabel optional>
                  Memory expires at
                </FieldLabel>

                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />

                  <input
                    type="datetime-local"
                    value={form.expiresAt}
                    onChange={(event) =>
                      updateField(
                        "expiresAt",
                        event.target.value,
                      )
                    }
                    className={`${inputClassName} pl-11`}
                  />
                </div>

                <p className="mt-2 text-xs leading-5 text-amber-100/50">
                  Your MongoDB TTL index permanently
                  removes the document after this
                  date.
                </p>
              </div>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <label className="flex cursor-pointer items-start gap-3 rounded-[18px] border border-white/10 bg-black/10 p-4">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) =>
                    updateField(
                      "isActive",
                      event.target.checked,
                    )
                  }
                  className="mt-1 h-4 w-4 accent-[#C6FF32]"
                />

                <span>
                  <span className="block text-sm font-bold text-white">
                    Active memory
                  </span>

                  <span className="mt-1 block text-xs leading-5 text-white/35">
                    Active memories may be used by
                    HSAKAA retrieval.
                  </span>
                </span>
              </label>

              <label className="flex cursor-pointer items-start gap-3 rounded-[18px] border border-white/10 bg-black/10 p-4">
                <input
                  type="checkbox"
                  checked={form.isArchived}
                  onChange={(event) =>
                    updateField(
                      "isArchived",
                      event.target.checked,
                    )
                  }
                  className="mt-1 h-4 w-4 accent-[#C6FF32]"
                />

                <span>
                  <span className="block text-sm font-bold text-white">
                    Archived
                  </span>

                  <span className="mt-1 block text-xs leading-5 text-white/35">
                    Keep the memory in the database
                    without showing it among active
                    memories.
                  </span>
                </span>
              </label>
            </div>
          </div>
        ) : null}
      </section>

      <div className="h-24" />

      <AdminFormFooter
        saving={isSubmitting}
        isEditMode={isEditMode}
        createLabel="Create Memory"
        updateLabel="Save Memory"
      />
    </form>
  );
}