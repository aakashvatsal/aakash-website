"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { CircleAlert, Link2, Mail, Phone, Plus, Trash2 } from "lucide-react";

import { AdminFormFooter } from "@/components/admin/AdminFormFooter";
import {
  createMemoryPerson,
  updateMemoryPerson,
} from "@/lib/api/memory-people";
import {
  PersonContactReferenceSource,
  PersonIdentityStatus,
  PersonRelationshipType,
  type MemoryPerson,
} from "@/types/hsakaa";

type PersonFormMode = "create" | "edit";

type MemoryPersonFormProps = {
  mode?: PersonFormMode;
  initialData?: MemoryPerson | null;
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

type ContactReferenceFormItem = {
  source: PersonContactReferenceSource;
  label: string;
  externalId: string;
  url: string;
};

type PersonFormState = {
  linkedUserId: string;
  name: string;
  preferredName: string;
  relationship: PersonRelationshipType;
  relationshipLabel: string;
  organizationName: string;
  roleTitle: string;
  department: string;
  location: string;
  importance: number;
  firstMetAt: string;
  lastInteractionAt: string;
  emails: EmailFormItem[];
  phoneNumbers: PhoneFormItem[];
  aliases: string[];
  tags: string[];
  contactReferences: ContactReferenceFormItem[];
  notes: string;
  metadata: string;
};

const inputClassName =
  "min-h-12 w-full rounded-[16px] border border-white/10 bg-[#030608] px-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-[#C6FF32]/50";
const selectClassName =
  "min-h-12 w-full rounded-[16px] border border-white/10 bg-[#030608] px-4 text-sm text-white/75 outline-none transition focus:border-[#C6FF32]/50";

function formatEnum(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function toDateInput(value?: string) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().slice(0, 10);
}

function getInitialState(initialData?: MemoryPerson | null): PersonFormState {
  return {
    linkedUserId: initialData?.linkedUserId ?? "",
    name: initialData?.name ?? "",
    preferredName: initialData?.preferredName ?? "",
    relationship:
      initialData?.relationship ?? PersonRelationshipType.OTHER,
    relationshipLabel: initialData?.relationshipLabel ?? "",
    organizationName: initialData?.organizationName ?? "",
    roleTitle: initialData?.roleTitle ?? "",
    department: initialData?.department ?? "",
    location: initialData?.location ?? "",
    importance: initialData?.importance ?? 3,
    firstMetAt: toDateInput(initialData?.firstMetAt),
    lastInteractionAt: toDateInput(initialData?.lastInteractionAt),
    emails:
      initialData?.emails?.map((email) => ({
        email: email.email,
        isVerified: email.isVerified,
        isPrimary: email.isPrimary,
      })) ?? [],
    phoneNumbers:
      initialData?.phoneNumbers?.map((phone) => ({
        phoneNumber: phone.phoneNumber,
        countryCode: phone.countryCode ?? "",
        isVerified: phone.isVerified,
        isPrimary: phone.isPrimary,
      })) ?? [],
    aliases: initialData?.aliases ?? [],
    tags: initialData?.tags ?? [],
    contactReferences:
      initialData?.contactReferences?.map((reference) => ({
        source: reference.source,
        label: reference.label ?? "",
        externalId: reference.externalId ?? "",
        url: reference.url ?? "",
      })) ?? [],
    notes: initialData?.notes ?? "",
    metadata: JSON.stringify(initialData?.metadata ?? {}, null, 2),
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
        <span className="ml-2 text-xs font-medium text-white/25">Optional</span>
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
        <p className="mt-2 max-w-3xl text-sm leading-6 text-white/40">
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
    const normalized = input.trim().replace(/^#/, "");
    if (!normalized) return;
    if (!value.some((item) => item.toLowerCase() === normalized.toLowerCase())) {
      onChange([...value, normalized]);
    }
    setInput("");
  }

  return (
    <div>
      <div className="flex flex-col gap-3 sm:flex-row">
        <input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter" || event.key === ",") {
              event.preventDefault();
              addValue();
            }
          }}
          placeholder={placeholder}
          className={inputClassName}
        />
        <button
          type="button"
          onClick={addValue}
          className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-[16px] border border-white/10 bg-white/[0.04] px-5 text-sm font-bold text-white transition hover:border-[#C6FF32]/30 hover:text-[#C6FF32]"
        >
          <Plus className="h-4 w-4" /> Add
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
                onClick={() => onChange(value.filter((entry) => entry !== item))}
                aria-label={`Remove ${item}`}
                className="text-white/25 transition hover:text-red-300"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </span>
          ))}
        </div>
      ) : (
        <p className="mt-3 text-sm text-white/30">Nothing added yet.</p>
      )}
    </div>
  );
}

export function MemoryPersonForm({
  mode = "create",
  initialData,
}: MemoryPersonFormProps) {
  const router = useRouter();
  const [form, setForm] = useState<PersonFormState>(() =>
    getInitialState(initialData),
  );
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const isEditMode = mode === "edit";

  function updateField<Key extends keyof PersonFormState>(
    key: Key,
    value: PersonFormState[Key],
  ) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  function addEmail() {
    setForm((current) => ({
      ...current,
      emails: [
        ...current.emails,
        {
          email: "",
          isVerified: false,
          isPrimary: current.emails.length === 0,
        },
      ],
    }));
  }

  function updateEmail(index: number, field: "email" | "isPrimary", value: string | boolean) {
    setForm((current) => ({
      ...current,
      emails: current.emails.map((email, emailIndex) => {
        if (emailIndex !== index) {
          return field === "isPrimary" && value === true
            ? { ...email, isPrimary: false }
            : email;
        }
        return { ...email, [field]: value };
      }),
    }));
  }

  function removeEmail(index: number) {
    setForm((current) => {
      const emails = current.emails.filter((_, itemIndex) => itemIndex !== index);
      if (emails.length && !emails.some((email) => email.isPrimary)) {
        emails[0] = { ...emails[0], isPrimary: true };
      }
      return { ...current, emails };
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
          isPrimary: current.phoneNumbers.length === 0,
        },
      ],
    }));
  }

  function updatePhone(
    index: number,
    field: "phoneNumber" | "countryCode" | "isPrimary",
    value: string | boolean,
  ) {
    setForm((current) => ({
      ...current,
      phoneNumbers: current.phoneNumbers.map((phone, phoneIndex) => {
        if (phoneIndex !== index) {
          return field === "isPrimary" && value === true
            ? { ...phone, isPrimary: false }
            : phone;
        }
        return { ...phone, [field]: value };
      }),
    }));
  }

  function removePhone(index: number) {
    setForm((current) => {
      const phoneNumbers = current.phoneNumbers.filter(
        (_, itemIndex) => itemIndex !== index,
      );
      if (phoneNumbers.length && !phoneNumbers.some((phone) => phone.isPrimary)) {
        phoneNumbers[0] = { ...phoneNumbers[0], isPrimary: true };
      }
      return { ...current, phoneNumbers };
    });
  }

  function addReference() {
    setForm((current) => ({
      ...current,
      contactReferences: [
        ...current.contactReferences,
        {
          source: PersonContactReferenceSource.MANUAL,
          label: "",
          externalId: "",
          url: "",
        },
      ],
    }));
  }

  function updateReference(
    index: number,
    field: keyof ContactReferenceFormItem,
    value: string,
  ) {
    setForm((current) => ({
      ...current,
      contactReferences: current.contactReferences.map((reference, itemIndex) =>
        itemIndex === index ? { ...reference, [field]: value } : reference,
      ),
    }));
  }

  function validateForm() {
    if (!form.name.trim()) return "Person name is required.";
    if (form.emails.some((email) => !email.email.trim() || !email.email.includes("@"))) {
      return "Enter a valid email address or remove the empty email row.";
    }
    if (form.phoneNumbers.some((phone) => !phone.phoneNumber.trim())) {
      return "Enter a phone number or remove the empty phone row.";
    }
    try {
      const metadata = JSON.parse(form.metadata || "{}");
      if (typeof metadata !== "object" || metadata === null || Array.isArray(metadata)) {
        return "Metadata must be a valid JSON object.";
      }
    } catch {
      return "Metadata contains invalid JSON.";
    }
    return "";
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsSubmitting(true);
    setError("");

    const payload = {
      linkedUserId: form.linkedUserId.trim() || null,
      name: form.name.trim(),
      preferredName: form.preferredName.trim() || undefined,
      relationship: form.relationship,
      relationshipLabel: form.relationshipLabel.trim() || undefined,
      organizationName: form.organizationName.trim() || undefined,
      roleTitle: form.roleTitle.trim() || undefined,
      department: form.department.trim() || undefined,
      location: form.location.trim() || undefined,
      importance: form.importance,
      firstMetAt: form.firstMetAt || undefined,
      lastInteractionAt: form.lastInteractionAt || undefined,
      emails: form.emails.map((email) => ({
        email: email.email.trim().toLowerCase(),
        isPrimary: email.isPrimary,
      })),
      phoneNumbers: form.phoneNumbers.map((phone) => ({
        phoneNumber: phone.phoneNumber.trim(),
        countryCode: phone.countryCode.trim() || undefined,
        isPrimary: phone.isPrimary,
      })),
      aliases: form.aliases,
      tags: form.tags,
      contactReferences: form.contactReferences
        .map((reference) => ({
          source: reference.source,
          label: reference.label.trim() || undefined,
          externalId: reference.externalId.trim() || undefined,
          url: reference.url.trim() || undefined,
        }))
        .filter((reference) => reference.label || reference.externalId || reference.url),
      notes: form.notes.trim() || undefined,
      metadata: JSON.parse(form.metadata || "{}") as Record<string, unknown>,
    };

    try {
      const person =
        isEditMode && initialData?._id
          ? await updateMemoryPerson(initialData._id, payload)
          : await createMemoryPerson(payload);
      router.push(`/admin/hsakaa/people/${person._id}`);
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

  const identityStatus =
    initialData?.identityStatus ?? PersonIdentityStatus.UNVERIFIED;

  return (
    <form onSubmit={handleSubmit} className="space-y-8 pb-24">
      {error ? (
        <section className="rounded-[20px] border border-red-400/20 bg-red-400/[0.06] p-4">
          <div className="flex items-start gap-3">
            <CircleAlert className="mt-0.5 h-5 w-5 shrink-0 text-red-300" />
            <p className="text-sm leading-6 text-red-100">{error}</p>
          </div>
        </section>
      ) : null}

      <FormSection
        eyebrow="Identity"
        title="Who this person is"
        description="Create a stable identity record first. Email and phone are optional; HSAKAA links memories by the saved Person ID, not by guessing from a name."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <FieldLabel>Name</FieldLabel>
            <input
              value={form.name}
              onChange={(event) => updateField("name", event.target.value)}
              required
              placeholder="Rahul Sharma"
              className={inputClassName}
            />
          </div>
          <div>
            <FieldLabel optional>Preferred name</FieldLabel>
            <input
              value={form.preferredName}
              onChange={(event) => updateField("preferredName", event.target.value)}
              placeholder="Rahul"
              className={inputClassName}
            />
          </div>
          <div>
            <FieldLabel>Relationship</FieldLabel>
            <select
              value={form.relationship}
              onChange={(event) =>
                updateField("relationship", event.target.value as PersonRelationshipType)
              }
              className={selectClassName}
            >
              {Object.values(PersonRelationshipType).map((value) => (
                <option key={value} value={value}>
                  {formatEnum(value)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <FieldLabel optional>Relationship label</FieldLabel>
            <input
              value={form.relationshipLabel}
              onChange={(event) => updateField("relationshipLabel", event.target.value)}
              placeholder="Co-founder, childhood friend, mentor..."
              className={inputClassName}
            />
          </div>
        </div>
      </FormSection>

      <FormSection
        eyebrow="Directory context"
        title="Work and relationship context"
        description="Stable context helps HSAKAA identify the right person and understand where this relationship belongs without treating it as a memory."
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          <div>
            <FieldLabel optional>Company / organization</FieldLabel>
            <input value={form.organizationName} onChange={(event) => updateField("organizationName", event.target.value)} placeholder="8lete" className={inputClassName} />
          </div>
          <div>
            <FieldLabel optional>Role / title</FieldLabel>
            <input value={form.roleTitle} onChange={(event) => updateField("roleTitle", event.target.value)} placeholder="Product Manager" className={inputClassName} />
          </div>
          <div>
            <FieldLabel optional>Department / function</FieldLabel>
            <input value={form.department} onChange={(event) => updateField("department", event.target.value)} placeholder="Engineering" className={inputClassName} />
          </div>
          <div>
            <FieldLabel optional>Location</FieldLabel>
            <input value={form.location} onChange={(event) => updateField("location", event.target.value)} placeholder="Mumbai" className={inputClassName} />
          </div>
          <div>
            <FieldLabel>Importance</FieldLabel>
            <select value={form.importance} onChange={(event) => updateField("importance", Number(event.target.value))} className={selectClassName}>
              {[1, 2, 3, 4, 5].map((value) => (
                <option key={value} value={value}>{value} — {value >= 4 ? "Core" : value === 3 ? "Normal" : "Low"}</option>
              ))}
            </select>
          </div>
          <div>
            <FieldLabel optional>Linked platform user ID</FieldLabel>
            <input value={form.linkedUserId} onChange={(event) => updateField("linkedUserId", event.target.value)} placeholder="MongoDB User ObjectId" className={inputClassName} />
          </div>
          <div>
            <FieldLabel optional>First met</FieldLabel>
            <input type="date" value={form.firstMetAt} onChange={(event) => updateField("firstMetAt", event.target.value)} className={inputClassName} />
          </div>
          <div>
            <FieldLabel optional>Last interaction</FieldLabel>
            <input type="date" value={form.lastInteractionAt} onChange={(event) => updateField("lastInteractionAt", event.target.value)} className={inputClassName} />
          </div>
        </div>
      </FormSection>

      <FormSection
        eyebrow="Email identities"
        title="Email addresses"
        description="Optional identity signals. Verification is system-managed; editing a contact identity resets verification rather than letting the profile form mark it verified."
      >
        <div className="space-y-4">
          {form.emails.map((email, index) => (
            <div key={`email-${index}`} className="rounded-[20px] border border-white/10 bg-black/10 p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/35"><Mail className="h-4 w-4" /></div>
                <div className="grid min-w-0 flex-1 gap-4 md:grid-cols-[1fr_auto_auto_auto] md:items-center">
                  <input type="email" value={email.email} onChange={(event) => updateEmail(index, "email", event.target.value)} placeholder="person@example.com" className={inputClassName} />
                  <label className="flex items-center gap-2 text-sm text-white/55">
                    <input type="checkbox" checked={email.isPrimary} onChange={(event) => updateEmail(index, "isPrimary", event.target.checked)} className="h-4 w-4 accent-[#C6FF32]" /> Primary
                  </label>
                  <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${email.isVerified ? "border-[#C6FF32]/20 bg-[#C6FF32]/10 text-[#C6FF32]" : "border-white/10 bg-white/[0.04] text-white/40"}`}>
                    {email.isVerified ? "Verified" : "Unverified"}
                  </span>
                  <button type="button" onClick={() => removeEmail(index)} aria-label="Remove email" className="grid h-11 w-11 place-items-center rounded-xl border border-red-300/10 bg-red-300/[0.04] text-red-200/50 transition hover:text-red-200"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          ))}
          <button type="button" onClick={addEmail} className="inline-flex min-h-11 items-center gap-2 rounded-[14px] border border-white/10 bg-white/[0.04] px-4 text-sm font-bold text-white/60 transition hover:text-[#C6FF32]"><Plus className="h-4 w-4" /> Add email</button>
        </div>
      </FormSection>

      <FormSection
        eyebrow="Phone identities"
        title="Phone numbers"
        description="Phone is optional. Country code + local number is normalized to E.164 on the backend; verification remains system-controlled."
      >
        <div className="space-y-4">
          {form.phoneNumbers.map((phone, index) => (
            <div key={`phone-${index}`} className="rounded-[20px] border border-white/10 bg-black/10 p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/[0.04] text-white/35"><Phone className="h-4 w-4" /></div>
                <div className="grid min-w-0 flex-1 gap-4 md:grid-cols-[110px_1fr_auto_auto_auto] md:items-center">
                  <input value={phone.countryCode} onChange={(event) => updatePhone(index, "countryCode", event.target.value)} placeholder="+91" className={inputClassName} />
                  <input value={phone.phoneNumber} onChange={(event) => updatePhone(index, "phoneNumber", event.target.value)} placeholder="9876543210" className={inputClassName} />
                  <label className="flex items-center gap-2 text-sm text-white/55">
                    <input type="checkbox" checked={phone.isPrimary} onChange={(event) => updatePhone(index, "isPrimary", event.target.checked)} className="h-4 w-4 accent-[#C6FF32]" /> Primary
                  </label>
                  <span className={`rounded-full border px-2.5 py-1 text-[10px] font-black uppercase tracking-wider ${phone.isVerified ? "border-[#C6FF32]/20 bg-[#C6FF32]/10 text-[#C6FF32]" : "border-white/10 bg-white/[0.04] text-white/40"}`}>
                    {phone.isVerified ? "Verified" : "Unverified"}
                  </span>
                  <button type="button" onClick={() => removePhone(index)} aria-label="Remove phone" className="grid h-11 w-11 place-items-center rounded-xl border border-red-300/10 bg-red-300/[0.04] text-red-200/50 transition hover:text-red-200"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
            </div>
          ))}
          <button type="button" onClick={addPhone} className="inline-flex min-h-11 items-center gap-2 rounded-[14px] border border-white/10 bg-white/[0.04] px-4 text-sm font-bold text-white/60 transition hover:text-[#C6FF32]"><Plus className="h-4 w-4" /> Add phone</button>
        </div>
      </FormSection>

      <FormSection
        eyebrow="Recognition"
        title="Aliases and tags"
        description="Aliases improve exact identity resolution. Tags organize people without turning organizational labels into memories."
      >
        <div className="grid gap-6 lg:grid-cols-2">
          <div><FieldLabel optional>Aliases</FieldLabel><TagEditor value={form.aliases} onChange={(value) => updateField("aliases", value)} placeholder="Add an alias" /></div>
          <div><FieldLabel optional>Tags</FieldLabel><TagEditor value={form.tags} onChange={(value) => updateField("tags", value)} placeholder="founder, 8lete, close-friend..." /></div>
        </div>
      </FormSection>

      <FormSection
        eyebrow="Contact references"
        title="External identity references"
        description="Optional pointers to Contacts, Gmail, Calendar, WhatsApp, LinkedIn, Slack or another system. They are references only; they do not grant access or verification."
      >
        <div className="space-y-4">
          {form.contactReferences.map((reference, index) => (
            <div key={`reference-${index}`} className="rounded-[20px] border border-white/10 bg-black/10 p-4">
              <div className="grid gap-4 lg:grid-cols-[180px_1fr_1fr_1fr_auto] lg:items-center">
                <select value={reference.source} onChange={(event) => updateReference(index, "source", event.target.value)} className={selectClassName}>
                  {Object.values(PersonContactReferenceSource).map((source) => <option key={source} value={source}>{formatEnum(source)}</option>)}
                </select>
                <input value={reference.label} onChange={(event) => updateReference(index, "label", event.target.value)} placeholder="Work contact" className={inputClassName} />
                <input value={reference.externalId} onChange={(event) => updateReference(index, "externalId", event.target.value)} placeholder="External ID" className={inputClassName} />
                <div className="relative"><Link2 className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" /><input type="url" value={reference.url} onChange={(event) => updateReference(index, "url", event.target.value)} placeholder="https://..." className={`${inputClassName} pl-11`} /></div>
                <button type="button" onClick={() => updateField("contactReferences", form.contactReferences.filter((_, itemIndex) => itemIndex !== index))} aria-label="Remove reference" className="grid h-11 w-11 place-items-center rounded-xl border border-red-300/10 bg-red-300/[0.04] text-red-200/50 transition hover:text-red-200"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
          <button type="button" onClick={addReference} className="inline-flex min-h-11 items-center gap-2 rounded-[14px] border border-white/10 bg-white/[0.04] px-4 text-sm font-bold text-white/60 transition hover:text-[#C6FF32]"><Plus className="h-4 w-4" /> Add reference</button>
        </div>
      </FormSection>

      <FormSection
        eyebrow="System-managed identity"
        title="Verification and access state"
        description="These states are intentionally read-only here. Verification is established by verification flows; consent, blocking and archive actions are managed from the Person profile so a normal edit cannot fake or bypass identity state."
      >
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-[18px] border border-white/10 bg-black/10 p-4"><p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/30">Identity status</p><p className="mt-2 text-sm font-bold text-white/70">{formatEnum(identityStatus)}</p></div>
          <div className="rounded-[18px] border border-white/10 bg-black/10 p-4"><p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/30">Memory consent</p><p className="mt-2 text-sm font-bold text-white/70">{initialData?.memoryAccessConsentGranted ? "Granted" : "Not granted"}</p></div>
          <div className="rounded-[18px] border border-white/10 bg-black/10 p-4"><p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/30">Blocked</p><p className="mt-2 text-sm font-bold text-white/70">{initialData?.isBlocked ? "Yes" : "No"}</p></div>
          <div className="rounded-[18px] border border-white/10 bg-black/10 p-4"><p className="text-[10px] font-black uppercase tracking-[0.14em] text-white/30">Archived</p><p className="mt-2 text-sm font-bold text-white/70">{initialData?.isArchived ? "Yes" : "No"}</p></div>
        </div>
      </FormSection>

      <FormSection
        eyebrow="Notes"
        title="Directory notes and metadata"
        description="Keep stable identity context here. Person-specific beliefs, preferences, commitments and events belong in linked memories instead."
      >
        <div className="space-y-5">
          <div><FieldLabel optional>Notes</FieldLabel><textarea value={form.notes} onChange={(event) => updateField("notes", event.target.value)} rows={5} placeholder="Stable directory context..." className={`${inputClassName} py-3`} /></div>
          <div><FieldLabel optional>Metadata JSON</FieldLabel><textarea value={form.metadata} onChange={(event) => updateField("metadata", event.target.value)} rows={6} spellCheck={false} className={`${inputClassName} py-3 font-mono text-xs`} /></div>
        </div>
      </FormSection>

      <AdminFormFooter
        saving={isSubmitting}
        isEditMode={isEditMode}
        createLabel="Create person"
        updateLabel="Save person"
        description="Identity verification, memory consent, blocking and archive state are managed separately from profile edits."
      />
    </form>
  );
}
