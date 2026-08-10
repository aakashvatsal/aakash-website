"use client";

import {
  useState,
  type FormEvent,
  type KeyboardEvent,
  type ReactNode,
} from "react";
import { useRouter } from "next/navigation";
import {
  CircleAlert,
  Mail,
  Phone,
  Plus,
  Trash2,
} from "lucide-react";

import { AdminFormFooter } from "@/components/admin/AdminFormFooter";
import {
  createMemoryPerson,
  updateMemoryPerson,
} from "@/lib/api/memory-people";
import {
  PersonIdentityStatus,
  PersonRelationshipType,
  type MemoryPerson,
} from "@/types/hsakaa";

type PersonFormMode = "create" | "edit";

type MemoryPersonFormProps = {
  mode?: PersonFormMode;
  initialData?: MemoryPerson | null;
  // ownerUserId?: string;
};

type EmailFormItem = {
  email: string;
  isVerified: boolean;
  isPrimary: boolean;
};

type PhoneFormItem = {
  phoneNumber: string;
  countryCode: string;
  isVerified: boolean;
  isPrimary: boolean;
};

type PersonFormState = {
  linkedUserId: string;

  name: string;
  preferredName: string;

  relationship: PersonRelationshipType;
  relationshipLabel: string;

  emails: EmailFormItem[];
  phoneNumbers: PhoneFormItem[];

  identityStatus: PersonIdentityStatus;

  aliases: string[];
  tags: string[];

  notes: string;
  metadata: string;

  memoryAccessConsentGranted: boolean;

  isBlocked: boolean;
  blockedReason: string;

  isArchived: boolean;
  isActive: boolean;
};

const inputClassName =
  "min-h-12 w-full rounded-[16px] border border-white/10 bg-[#030608] px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#C6FF32]/50";

const selectClassName =
  "min-h-12 w-full rounded-[16px] border border-white/10 bg-[#030608] px-4 text-sm text-white/75 outline-none transition focus:border-[#C6FF32]/50";

function formatEnum(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

function getInitialState(
  initialData?: MemoryPerson | null,
): PersonFormState {
  return {
    linkedUserId:
      initialData?.linkedUserId ?? "",

    name: initialData?.name ?? "",
    preferredName:
      initialData?.preferredName ?? "",

    relationship:
      initialData?.relationship ??
      PersonRelationshipType.OTHER,

    relationshipLabel:
      initialData?.relationshipLabel ?? "",

    emails:
      initialData?.emails?.map((email) => ({
        email: email.email,
        isVerified: email.isVerified,
        isPrimary: email.isPrimary,
      })) ?? [],

    phoneNumbers:
      initialData?.phoneNumbers?.map(
        (phone) => ({
          phoneNumber: phone.phoneNumber,
          countryCode:
            phone.countryCode ?? "",
          isVerified: phone.isVerified,
          isPrimary: phone.isPrimary,
        }),
      ) ?? [],

    identityStatus:
      initialData?.identityStatus ??
      PersonIdentityStatus.UNVERIFIED,

    aliases: initialData?.aliases ?? [],
    tags: initialData?.tags ?? [],

    notes: initialData?.notes ?? "",

    metadata: JSON.stringify(
      initialData?.metadata ?? {},
      null,
      2,
    ),

    memoryAccessConsentGranted:
      initialData
        ?.memoryAccessConsentGranted ??
      false,

    isBlocked:
      initialData?.isBlocked ?? false,

    blockedReason:
      initialData?.blockedReason ?? "",

    isArchived:
      initialData?.isArchived ?? false,

    isActive:
      initialData?.isActive ?? true,
  };
}

function FieldLabel({
  children,
  optional = false,
}: {
  children: ReactNode;
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
  children: ReactNode;
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

function TagEditor({
  value,
  onChange,
  placeholder,
}: {
  value: string[];
  onChange: (value: string[]) => void;
  placeholder: string;
}) {
  const [input, setInput] = useState("");

  function addValue() {
    const normalizedValue = input
      .trim()
      .replace(/^#/, "");

    if (!normalizedValue) {
      return;
    }

    const alreadyExists = value.some(
      (item) =>
        item.toLowerCase() ===
        normalizedValue.toLowerCase(),
    );

    if (!alreadyExists) {
      onChange([
        ...value,
        normalizedValue,
      ]);
    }

    setInput("");
  }

  function handleKeyDown(
    event: KeyboardEvent<HTMLInputElement>,
  ) {
    if (
      event.key === "Enter" ||
      event.key === ","
    ) {
      event.preventDefault();
      addValue();
    }
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          value={input}
          onChange={(event) =>
            setInput(event.target.value)
          }
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={inputClassName}
        />

        <button
          type="button"
          onClick={addValue}
          className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-[16px] border border-white/10 bg-white/[0.04] px-5 text-sm font-bold text-white transition hover:border-[#C6FF32]/30 hover:text-[#C6FF32]"
        >
          <Plus className="h-4 w-4" />
          Add
        </button>
      </div>

      {value.length ? (
        <div className="mt-4 flex flex-wrap gap-2">
          {value.map((item) => (
            <span
              key={item}
              className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.04] px-3 py-2 text-sm text-white/60"
            >
              {item}

              <button
                type="button"
                onClick={() =>
                  onChange(
                    value.filter(
                      (entry) =>
                        entry !== item,
                    ),
                  )
                }
                aria-label={`Remove ${item}`}
                className="text-white/25 transition hover:text-red-300"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-white/30">
          Nothing added yet.
        </p>
      )}
    </div>
  );
}

export function MemoryPersonForm({
  mode = "create",
  initialData,
  // ownerUserId,
}: MemoryPersonFormProps) {
  const router = useRouter();

  const [form, setForm] =
    useState<PersonFormState>(() =>
      getInitialState(initialData),
    );

  const [isSubmitting, setIsSubmitting] =
    useState(false);

  const [error, setError] = useState("");

  const isEditMode = mode === "edit";

  function updateField<
    Key extends keyof PersonFormState,
  >(
    key: Key,
    value: PersonFormState[Key],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function addEmail() {
    setForm((current) => ({
      ...current,
      emails: [
        ...current.emails,
        {
          email: "",
          isVerified: false,
          isPrimary:
            current.emails.length === 0,
        },
      ],
    }));
  }

  function updateEmail(
    index: number,
    field: keyof EmailFormItem,
    value: string | boolean,
  ) {
    setForm((current) => {
      const emails = current.emails.map(
        (email, emailIndex) => {
          if (emailIndex !== index) {
            if (
              field === "isPrimary" &&
              value === true
            ) {
              return {
                ...email,
                isPrimary: false,
              };
            }

            return email;
          }

          return {
            ...email,
            [field]: value,
          };
        },
      );

      return {
        ...current,
        emails,
      };
    });
  }

  function removeEmail(index: number) {
    setForm((current) => {
      const emails = current.emails.filter(
        (_, emailIndex) =>
          emailIndex !== index,
      );

      if (
        emails.length &&
        !emails.some(
          (email) => email.isPrimary,
        )
      ) {
        emails[0] = {
          ...emails[0],
          isPrimary: true,
        };
      }

      return {
        ...current,
        emails,
      };
    });
  }

  function addPhone() {
    setForm((current) => ({
      ...current,
      phoneNumbers: [
        ...current.phoneNumbers,
        {
          phoneNumber: "",
          countryCode: "+91",
          isVerified: false,
          isPrimary:
            current.phoneNumbers.length ===
            0,
        },
      ],
    }));
  }

  function updatePhone(
    index: number,
    field: keyof PhoneFormItem,
    value: string | boolean,
  ) {
    setForm((current) => {
      const phoneNumbers =
        current.phoneNumbers.map(
          (phone, phoneIndex) => {
            if (phoneIndex !== index) {
              if (
                field === "isPrimary" &&
                value === true
              ) {
                return {
                  ...phone,
                  isPrimary: false,
                };
              }

              return phone;
            }

            return {
              ...phone,
              [field]: value,
            };
          },
        );

      return {
        ...current,
        phoneNumbers,
      };
    });
  }

  function removePhone(index: number) {
    setForm((current) => {
      const phoneNumbers =
        current.phoneNumbers.filter(
          (_, phoneIndex) =>
            phoneIndex !== index,
        );

      if (
        phoneNumbers.length &&
        !phoneNumbers.some(
          (phone) => phone.isPrimary,
        )
      ) {
        phoneNumbers[0] = {
          ...phoneNumbers[0],
          isPrimary: true,
        };
      }

      return {
        ...current,
        phoneNumbers,
      };
    });
  }

  function validateForm() {
    if (!form.name.trim()) {
      return "Person name is required.";
    }

    const invalidEmail =
      form.emails.find(
        (email) =>
          !email.email.trim() ||
          !email.email.includes("@"),
      );

    if (invalidEmail) {
      return "Enter a valid email address or remove the empty email row.";
    }

    const invalidPhone =
      form.phoneNumbers.find(
        (phone) =>
          !phone.phoneNumber.trim(),
      );

    if (invalidPhone) {
      return "Enter a phone number or remove the empty phone row.";
    }

    if (
      form.isBlocked &&
      !form.blockedReason.trim()
    ) {
      return "Blocked reason is required when the person is blocked.";
    }

    try {
      const metadata = JSON.parse(
        form.metadata || "{}",
      );

      if (
        typeof metadata !== "object" ||
        metadata === null ||
        Array.isArray(metadata)
      ) {
        return "Metadata must be a valid JSON object.";
      }
    } catch {
      return "Metadata contains invalid JSON.";
    }

    return "";
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

    const metadata = JSON.parse(
      form.metadata || "{}",
    ) as Record<string, unknown>;

    const payload = {
      // ownerUserId:
      //   ownerUserId || undefined,

      linkedUserId:
        form.linkedUserId.trim() ||
        null,

      name: form.name.trim(),

      preferredName:
        form.preferredName.trim() ||
        undefined,

      relationship:
        form.relationship,

      relationshipLabel:
        form.relationshipLabel.trim() ||
        undefined,

      emails: form.emails.map(
        (email) => ({
          email: email.email
            .trim()
            .toLowerCase(),

          isVerified:
            email.isVerified,

          isPrimary:
            email.isPrimary,
        }),
      ),

      phoneNumbers:
        form.phoneNumbers.map(
          (phone) => ({
            phoneNumber:
              phone.phoneNumber.trim(),

            countryCode:
              phone.countryCode.trim() ||
              undefined,

            isVerified:
              phone.isVerified,

            isPrimary:
              phone.isPrimary,
          }),
        ),

      identityStatus:
        form.identityStatus,

      aliases: form.aliases,
      tags: form.tags,

      notes:
        form.notes.trim() || undefined,

      memoryAccessConsentGranted:
        form.memoryAccessConsentGranted,

      metadata,

      isBlocked: form.isBlocked,

      blockedReason:
        form.isBlocked
          ? form.blockedReason.trim()
          : undefined,

      isArchived: form.isArchived,
      isActive: form.isActive,
    };

    try {
      if (
        isEditMode &&
        initialData?._id
      ) {
        await updateMemoryPerson(
          initialData._id,
          payload,
          // ownerUserId,
        );
      } else {
        await createMemoryPerson(
          payload,
        );
      }

      router.push(
        "/admin/hsakaa/people",
      );

      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : isEditMode
            ? "Unable to update person."
            : "Unable to create person.",
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
        eyebrow="Identity"
        title="Basic person information"
        description="Add the person's identity and describe how Aakash knows them."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <FieldLabel>Name</FieldLabel>

            <input
              value={form.name}
              onChange={(event) =>
                updateField(
                  "name",
                  event.target.value,
                )
              }
              required
              placeholder="Rahul Sharma"
              className={inputClassName}
            />
          </div>

          <div>
            <FieldLabel optional>
              Preferred name
            </FieldLabel>

            <input
              value={form.preferredName}
              onChange={(event) =>
                updateField(
                  "preferredName",
                  event.target.value,
                )
              }
              placeholder="Rahul"
              className={inputClassName}
            />
          </div>

          <div>
            <FieldLabel>
              Relationship
            </FieldLabel>

            <select
              value={form.relationship}
              onChange={(event) =>
                updateField(
                  "relationship",
                  event.target
                    .value as PersonRelationshipType,
                )
              }
              className={selectClassName}
            >
              {Object.values(
                PersonRelationshipType,
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
            <FieldLabel optional>
              Relationship label
            </FieldLabel>

            <input
              value={
                form.relationshipLabel
              }
              onChange={(event) =>
                updateField(
                  "relationshipLabel",
                  event.target.value,
                )
              }
              placeholder="Childhood friend, co-founder, mentor..."
              className={inputClassName}
            />
          </div>

          <div>
            <FieldLabel optional>
              Linked platform user ID
            </FieldLabel>

            <input
              value={form.linkedUserId}
              onChange={(event) =>
                updateField(
                  "linkedUserId",
                  event.target.value,
                )
              }
              placeholder="MongoDB User ObjectId"
              className={inputClassName}
            />
          </div>

          <div>
            <FieldLabel>
              Identity status
            </FieldLabel>

            <select
              value={form.identityStatus}
              onChange={(event) =>
                updateField(
                  "identityStatus",
                  event.target
                    .value as PersonIdentityStatus,
                )
              }
              className={selectClassName}
            >
              {Object.values(
                PersonIdentityStatus,
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
        eyebrow="Email identities"
        title="Email addresses"
        description="These addresses can be used to identify and verify the person during a HSAKAA conversation."
      >
        <div className="space-y-4">
          {form.emails.map(
            (email, index) => (
              <div
                key={`email-${index}`}
                className="rounded-[20px] border border-white/10 bg-black/10 p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/35">
                    <Mail className="h-4 w-4" />
                  </div>

                  <div className="grid min-w-0 flex-1 gap-4 md:grid-cols-[1fr_auto_auto_auto] md:items-center">
                    <input
                      type="email"
                      value={email.email}
                      onChange={(event) =>
                        updateEmail(
                          index,
                          "email",
                          event.target.value,
                        )
                      }
                      placeholder="person@example.com"
                      className={inputClassName}
                    />

                    <label className="flex items-center gap-2 text-sm text-white/55">
                      <input
                        type="checkbox"
                        checked={
                          email.isPrimary
                        }
                        onChange={(event) =>
                          updateEmail(
                            index,
                            "isPrimary",
                            event.target
                              .checked,
                          )
                        }
                        className="h-4 w-4 accent-[#C6FF32]"
                      />

                      Primary
                    </label>

                    <label className="flex items-center gap-2 text-sm text-white/55">
                      <input
                        type="checkbox"
                        checked={
                          email.isVerified
                        }
                        onChange={(event) =>
                          updateEmail(
                            index,
                            "isVerified",
                            event.target
                              .checked,
                          )
                        }
                        className="h-4 w-4 accent-[#C6FF32]"
                      />

                      Verified
                    </label>

                    <button
                      type="button"
                      onClick={() =>
                        removeEmail(index)
                      }
                      aria-label="Remove email"
                      className="grid h-11 w-11 place-items-center rounded-xl border border-red-300/10 bg-red-300/[0.04] text-red-200/50 transition hover:border-red-300/30 hover:text-red-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ),
          )}

          <button
            type="button"
            onClick={addEmail}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] border border-white/10 bg-white/[0.04] px-4 text-sm font-bold text-white/60 transition hover:border-[#C6FF32]/30 hover:text-[#C6FF32]"
          >
            <Plus className="h-4 w-4" />
            Add email
          </button>
        </div>
      </FormSection>

      <FormSection
        eyebrow="Phone identities"
        title="Phone numbers"
        description="Phone identities may be used for OTP verification and person recognition."
      >
        <div className="space-y-4">
          {form.phoneNumbers.map(
            (phone, index) => (
              <div
                key={`phone-${index}`}
                className="rounded-[20px] border border-white/10 bg-black/10 p-4"
              >
                <div className="flex items-start gap-3">
                  <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/35">
                    <Phone className="h-4 w-4" />
                  </div>

                  <div className="grid min-w-0 flex-1 gap-4 md:grid-cols-[110px_1fr_auto_auto_auto] md:items-center">
                    <input
                      value={
                        phone.countryCode
                      }
                      onChange={(event) =>
                        updatePhone(
                          index,
                          "countryCode",
                          event.target.value,
                        )
                      }
                      placeholder="+91"
                      className={inputClassName}
                    />

                    <input
                      value={
                        phone.phoneNumber
                      }
                      onChange={(event) =>
                        updatePhone(
                          index,
                          "phoneNumber",
                          event.target.value,
                        )
                      }
                      placeholder="9876543210"
                      className={inputClassName}
                    />

                    <label className="flex items-center gap-2 text-sm text-white/55">
                      <input
                        type="checkbox"
                        checked={
                          phone.isPrimary
                        }
                        onChange={(event) =>
                          updatePhone(
                            index,
                            "isPrimary",
                            event.target
                              .checked,
                          )
                        }
                        className="h-4 w-4 accent-[#C6FF32]"
                      />

                      Primary
                    </label>

                    <label className="flex items-center gap-2 text-sm text-white/55">
                      <input
                        type="checkbox"
                        checked={
                          phone.isVerified
                        }
                        onChange={(event) =>
                          updatePhone(
                            index,
                            "isVerified",
                            event.target
                              .checked,
                          )
                        }
                        className="h-4 w-4 accent-[#C6FF32]"
                      />

                      Verified
                    </label>

                    <button
                      type="button"
                      onClick={() =>
                        removePhone(index)
                      }
                      aria-label="Remove phone"
                      className="grid h-11 w-11 place-items-center rounded-xl border border-red-300/10 bg-red-300/[0.04] text-red-200/50 transition hover:border-red-300/30 hover:text-red-200"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            ),
          )}

          <button
            type="button"
            onClick={addPhone}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] border border-white/10 bg-white/[0.04] px-4 text-sm font-bold text-white/60 transition hover:border-[#C6FF32]/30 hover:text-[#C6FF32]"
          >
            <Plus className="h-4 w-4" />
            Add phone
          </button>
        </div>
      </FormSection>

      <FormSection
        eyebrow="Recognition"
        title="Aliases and tags"
        description="Aliases improve recognition while tags help organize people inside HSAKAA."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <div>
            <FieldLabel optional>
              Aliases
            </FieldLabel>

            <TagEditor
              value={form.aliases}
              onChange={(value) =>
                updateField(
                  "aliases",
                  value,
                )
              }
              placeholder="Add an alias"
            />
          </div>

          <div>
            <FieldLabel optional>
              Tags
            </FieldLabel>

            <TagEditor
              value={form.tags}
              onChange={(value) =>
                updateField("tags", value)
              }
              placeholder="Add a tag"
            />
          </div>
        </div>
      </FormSection>

      <FormSection
        eyebrow="Context"
        title="Notes and metadata"
        description="Store additional private context for admin management and future integrations."
      >
        <div className="space-y-5">
          <div>
            <FieldLabel optional>
              Notes
            </FieldLabel>

            <textarea
              value={form.notes}
              onChange={(event) =>
                updateField(
                  "notes",
                  event.target.value,
                )
              }
              rows={6}
              placeholder="Private administrative notes about this person..."
              className="w-full resize-y rounded-[18px] border border-white/10 bg-[#030608] px-4 py-4 text-sm leading-7 text-white outline-none transition placeholder:text-white/25 focus:border-[#C6FF32]/50"
            />
          </div>

          <div>
            <FieldLabel optional>
              Metadata JSON
            </FieldLabel>

            <textarea
              value={form.metadata}
              onChange={(event) =>
                updateField(
                  "metadata",
                  event.target.value,
                )
              }
              rows={8}
              spellCheck={false}
              placeholder={'{\n  "company": "8lete"\n}'}
              className="w-full resize-y rounded-[18px] border border-white/10 bg-[#030608] px-4 py-4 font-mono text-sm leading-7 text-white outline-none transition placeholder:text-white/25 focus:border-[#C6FF32]/50"
            />

            <p className="mt-2 text-xs text-white/30">
              This must be a valid JSON object.
            </p>
          </div>
        </div>
      </FormSection>

      <FormSection
        eyebrow="Access"
        title="Consent and account state"
        description="Control whether person-specific memory access is permitted and whether this identity remains active."
      >
        <div className="grid gap-4 md:grid-cols-2">
          <label className="flex cursor-pointer items-start gap-3 rounded-[18px] border border-white/10 bg-black/10 p-4">
            <input
              type="checkbox"
              checked={
                form
                  .memoryAccessConsentGranted
              }
              onChange={(event) =>
                updateField(
                  "memoryAccessConsentGranted",
                  event.target.checked,
                )
              }
              className="mt-1 h-4 w-4 accent-[#C6FF32]"
            />

            <span>
              <span className="block text-sm font-bold text-white">
                Memory access consent granted
              </span>

              <span className="mt-1 block text-xs leading-5 text-white/35">
                Person-specific memories may be
                made available after successful
                identity verification.
              </span>
            </span>
          </label>

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
                Active person
              </span>

              <span className="mt-1 block text-xs leading-5 text-white/35">
                Active people may be recognized
                during verification.
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
                Keep the person record without
                showing it among active people.
              </span>
            </span>
          </label>

          <label className="flex cursor-pointer items-start gap-3 rounded-[18px] border border-white/10 bg-black/10 p-4">
            <input
              type="checkbox"
              checked={form.isBlocked}
              onChange={(event) => {
                const blocked =
                  event.target.checked;

                setForm((current) => ({
                  ...current,
                  isBlocked: blocked,
                  identityStatus: blocked
                    ? PersonIdentityStatus.BLOCKED
                    : current.identityStatus ===
                        PersonIdentityStatus.BLOCKED
                      ? PersonIdentityStatus.UNVERIFIED
                      : current.identityStatus,
                  blockedReason: blocked
                    ? current.blockedReason
                    : "",
                }));
              }}
              className="mt-1 h-4 w-4 accent-[#C6FF32]"
            />

            <span>
              <span className="block text-sm font-bold text-white">
                Blocked
              </span>

              <span className="mt-1 block text-xs leading-5 text-white/35">
                Prevent this person from receiving
                person-specific memory access.
              </span>
            </span>
          </label>
        </div>

        {form.isBlocked ? (
          <div className="mt-5">
            <FieldLabel>
              Blocked reason
            </FieldLabel>

            <textarea
              value={form.blockedReason}
              onChange={(event) =>
                updateField(
                  "blockedReason",
                  event.target.value,
                )
              }
              rows={4}
              required
              placeholder="Explain why access is blocked..."
              className="w-full resize-y rounded-[18px] border border-red-300/20 bg-[#030608] px-4 py-4 text-sm leading-7 text-white outline-none transition placeholder:text-white/25 focus:border-red-300/50"
            />
          </div>
        ) : null}
      </FormSection>

      <div className="h-24" />

      <AdminFormFooter
        saving={isSubmitting}
        isEditMode={isEditMode}
        createLabel="Create Person"
        updateLabel="Save Person"
      />
    </form>
  );
}