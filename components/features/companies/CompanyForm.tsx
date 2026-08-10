"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { AdminFormFooter } from "@/components/admin/AdminFormFooter";
import {
  FormEvent,
  ReactNode,
  useMemo,
  useState,
} from "react";
import {
  ArrowLeft,
  Plus,
  Save,
  Trash2,
} from "lucide-react";

import {
  createCompany,
  updateCompany,
} from "@/lib/api/companies";

import type {
  Company,
  CompanyFounder,
  CompanyGoal,
  CompanyLink,
  CompanyMetric,
  CompanyRole,
  CompanyStage,
  CompanyStatus,
  CreateCompanyPayload,
} from "@/types/company";

interface CompanyFormProps {
  company?: Company;
}

const companyStatuses: {
  value: CompanyStatus;
  label: string;
}[] = [
  { value: "idea", label: "Idea" },
  { value: "building", label: "Building" },
  { value: "active", label: "Active" },
  { value: "paused", label: "Paused" },
  { value: "acquired", label: "Acquired" },
  { value: "closed", label: "Closed" },
];

const companyStages: {
  value: CompanyStage;
  label: string;
}[] = [
  { value: "idea", label: "Idea" },
  { value: "pre_seed", label: "Pre Seed" },
  { value: "seed", label: "Seed" },
  { value: "early_stage", label: "Early Stage" },
  { value: "growth", label: "Growth" },
  { value: "mature", label: "Mature" },
];

const companyRoles: {
  value: CompanyRole;
  label: string;
}[] = [
  { value: "founder", label: "Founder" },
  { value: "co_founder", label: "Co-Founder" },
  { value: "ceo", label: "CEO" },
  { value: "cto", label: "CTO" },
  { value: "advisor", label: "Advisor" },
  { value: "investor", label: "Investor" },
  { value: "employee", label: "Employee" },
];

const inputClassName =
  "h-11 w-full rounded-xl border border-white/10 bg-black/30 px-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#C6FF32]/50";

const textareaClassName =
  "min-h-28 w-full resize-y rounded-xl border border-white/10 bg-black/30 px-4 py-3 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#C6FF32]/50";

function toDateInput(value?: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return date.toISOString().slice(0, 10);
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function splitLines(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function joinLines(value?: string[]) {
  return value?.join("\n") ?? "";
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 md:p-6">
      <div className="mb-6">
        <h2 className="text-lg font-medium text-white">
          {title}
        </h2>

        {description ? (
          <p className="mt-1 text-sm text-white/45">
            {description}
          </p>
        ) : null}
      </div>

      {children}
    </section>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: ReactNode;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-sm text-white/65">
        {label}
        {required ? (
          <span className="ml-1 text-[#C6FF32]">
            *
          </span>
        ) : null}
      </span>

      {children}
    </label>
  );
}

const emptyFounder: CompanyFounder = {
  name: "",
  email: "",
  designation: "",
  isPrimary: false,
};

const emptyLink: CompanyLink = {
  label: "",
  url: "",
};

const emptyMetric: CompanyMetric = {
  key: "",
  label: "",
  value: "",
  unit: "",
  measuredAt: "",
};

const emptyGoal: CompanyGoal = {
  title: "",
  description: "",
  progressPercentage: 0,
  targetDate: "",
  completed: false,
};

export function CompanyForm({
  company,
}: CompanyFormProps) {
  const router = useRouter();

  const isEditMode = Boolean(company?._id);

  const [name, setName] = useState(
    company?.name ?? "",
  );

  const [slug, setSlug] = useState(
    company?.slug ?? "",
  );

  const [slugEdited, setSlugEdited] = useState(
    Boolean(company?.slug),
  );

  const [legalName, setLegalName] = useState(
    company?.legalName ?? "",
  );

  const [tagline, setTagline] = useState(
    company?.tagline ?? "",
  );

  const [description, setDescription] = useState(
    company?.description ?? "",
  );

  const [status, setStatus] =
    useState<CompanyStatus>(
      company?.status ?? "active",
    );

  const [stage, setStage] =
    useState<CompanyStage>(
      company?.stage ?? "early_stage",
    );

  const [roles, setRoles] = useState<
    CompanyRole[]
  >(company?.roles ?? []);

  const [industries, setIndustries] = useState(
    joinLines(company?.industries),
  );

  const [products, setProducts] = useState(
    joinLines(company?.products),
  );

  const [markets, setMarkets] = useState(
    joinLines(company?.markets),
  );

  const [headquarters, setHeadquarters] =
    useState(company?.headquarters ?? "");

  const [website, setWebsite] = useState(
    company?.website ?? "",
  );

  const [logoUrl, setLogoUrl] = useState(
    company?.logoUrl ?? "",
  );

  const [coverImageUrl, setCoverImageUrl] =
    useState(company?.coverImageUrl ?? "");

  const [founders, setFounders] = useState<
    CompanyFounder[]
  >(company?.founders ?? []);

  const [links, setLinks] = useState<
    CompanyLink[]
  >(company?.links ?? []);

  const [metrics, setMetrics] = useState<
    CompanyMetric[]
  >(company?.metrics ?? []);

  const [goals, setGoals] = useState<
    CompanyGoal[]
  >(company?.goals ?? []);

  const [principles, setPrinciples] = useState(
    joinLines(company?.principles),
  );

  const [
    currentPriorities,
    setCurrentPriorities,
  ] = useState(
    joinLines(company?.currentPriorities),
  );

  const [challenges, setChallenges] = useState(
    joinLines(company?.challenges),
  );

  const [currentFocus, setCurrentFocus] =
    useState(company?.currentFocus ?? "");

  const [businessModel, setBusinessModel] =
    useState(company?.businessModel ?? "");

  const [targetCustomer, setTargetCustomer] =
    useState(company?.targetCustomer ?? "");

  const [metadata, setMetadata] = useState(
    JSON.stringify(company?.metadata ?? {}, null, 2),
  );

  const [foundedAt, setFoundedAt] = useState(
    toDateInput(company?.foundedAt),
  );

  const [lastReviewedAt, setLastReviewedAt] =
    useState(toDateInput(company?.lastReviewedAt));

  const [isFeatured, setIsFeatured] = useState(
    company?.isFeatured ?? false,
  );

  const [isArchived, setIsArchived] = useState(
    company?.isArchived ?? false,
  );

  const [isActive, setIsActive] = useState(
    company?.isActive ?? true,
  );

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const heading = useMemo(
    () =>
      isEditMode
        ? `Edit ${company?.name}`
        : "New Company",
    [company?.name, isEditMode],
  );

  function handleNameChange(value: string) {
    setName(value);

    if (!slugEdited) {
      setSlug(slugify(value));
    }
  }

  function toggleRole(role: CompanyRole) {
    setRoles((current) =>
      current.includes(role)
        ? current.filter((item) => item !== role)
        : [...current, role],
    );
  }

  function updateFounder(
    index: number,
    field: keyof CompanyFounder,
    value: string | boolean,
  ) {
    setFounders((current) =>
      current.map((founder, founderIndex) =>
        founderIndex === index
          ? {
              ...founder,
              [field]: value,
            }
          : founder,
      ),
    );
  }

  function removeFounder(index: number) {
    setFounders((current) =>
      current.filter(
        (_, founderIndex) => founderIndex !== index,
      ),
    );
  }

  function updateLink(
    index: number,
    field: keyof CompanyLink,
    value: string,
  ) {
    setLinks((current) =>
      current.map((link, linkIndex) =>
        linkIndex === index
          ? {
              ...link,
              [field]: value,
            }
          : link,
      ),
    );
  }

  function removeLink(index: number) {
    setLinks((current) =>
      current.filter(
        (_, linkIndex) => linkIndex !== index,
      ),
    );
  }

  function updateMetric(
    index: number,
    field: keyof CompanyMetric,
    value: string,
  ) {
    setMetrics((current) =>
      current.map((metric, metricIndex) =>
        metricIndex === index
          ? {
              ...metric,
              [field]: value,
            }
          : metric,
      ),
    );
  }

  function removeMetric(index: number) {
    setMetrics((current) =>
      current.filter(
        (_, metricIndex) => metricIndex !== index,
      ),
    );
  }

  function updateGoal(
    index: number,
    field: keyof CompanyGoal,
    value: string | number | boolean,
  ) {
    setGoals((current) =>
      current.map((goal, goalIndex) =>
        goalIndex === index
          ? {
              ...goal,
              [field]: value,
            }
          : goal,
      ),
    );
  }

  function removeGoal(index: number) {
    setGoals((current) =>
      current.filter(
        (_, goalIndex) => goalIndex !== index,
      ),
    );
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    setError("");

    if (!name.trim()) {
      setError("Company name is required.");
      return;
    }

    if (!slug.trim()) {
      setError("Company slug is required.");
      return;
    }

    let parsedMetadata: Record<string, unknown>;

    try {
      parsedMetadata = metadata.trim()
        ? JSON.parse(metadata)
        : {};
    } catch {
      setError("Metadata must contain valid JSON.");
      return;
    }

    const payload: CreateCompanyPayload = {
      name: name.trim(),
      slug: slugify(slug),
      legalName: legalName.trim() || undefined,
      tagline: tagline.trim() || undefined,
      description: description.trim() || undefined,
      status,
      stage,
      roles,
      industries: splitLines(industries),
      products: splitLines(products),
      markets: splitLines(markets),
      headquarters:
        headquarters.trim() || undefined,
      website: website.trim() || undefined,
      logoUrl: logoUrl.trim() || undefined,
      coverImageUrl:
        coverImageUrl.trim() || undefined,

      founders: founders
        .map((founder) => ({
          name: founder.name.trim(),
          email: founder.email?.trim() || undefined,
          designation:
            founder.designation?.trim() || undefined,
          isPrimary: founder.isPrimary,
        }))
        .filter((founder) => founder.name),

      links: links
        .map((link) => ({
          label: link.label.trim(),
          url: link.url.trim(),
        }))
        .filter((link) => link.label && link.url),

      metrics: metrics
        .map((metric) => ({
          key: metric.key.trim(),
          label: metric.label.trim(),
          value: metric.value,
          unit: metric.unit?.trim() || undefined,
          measuredAt:
            metric.measuredAt || undefined,
        }))
        .filter(
          (metric) => metric.key && metric.label,
        ),

      goals: goals
        .map((goal) => ({
          title: goal.title.trim(),
          description:
            goal.description?.trim() || undefined,
          progressPercentage: Math.min(
            100,
            Math.max(
              0,
              Number(goal.progressPercentage) || 0,
            ),
          ),
          targetDate: goal.targetDate || undefined,
          completed: goal.completed,
        }))
        .filter((goal) => goal.title),

      principles: splitLines(principles),
      currentPriorities:
        splitLines(currentPriorities),
      challenges: splitLines(challenges),

      currentFocus:
        currentFocus.trim() || undefined,
      businessModel:
        businessModel.trim() || undefined,
      targetCustomer:
        targetCustomer.trim() || undefined,

      metadata: parsedMetadata,

      foundedAt: foundedAt || undefined,
      lastReviewedAt:
        lastReviewedAt || undefined,

      isFeatured,
      isArchived,
      isActive,
    };

    try {
      setSaving(true);

      const savedCompany =
        isEditMode && company
          ? await updateCompany(
              company._id,
              payload,
            )
          : await createCompany(payload);

      router.push(
        `/admin/companies/${savedCompany._id}`,
      );

      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : "Unable to save company.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 pb-28"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <Link
            href="/admin/companies"
            className="inline-flex items-center gap-2 text-sm text-white/45 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to companies
          </Link>

          <h1 className="mt-4 text-3xl font-semibold text-white">
            {heading}
          </h1>

          <p className="mt-2 text-sm text-white/45">
            {isEditMode
              ? "Update company information."
              : "Add a new company to your operating system."}
          </p>
        </div>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-500/25 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      <Section
        title="Basic Information"
        description="Core company identity and current position."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Company name" required>
            <input
              value={name}
              onChange={(event) =>
                handleNameChange(event.target.value)
              }
              className={inputClassName}
              placeholder="8lete"
            />
          </Field>

          <Field label="Slug" required>
            <input
              value={slug}
              onChange={(event) => {
                setSlugEdited(true);
                setSlug(event.target.value);
              }}
              onBlur={() => setSlug(slugify(slug))}
              className={inputClassName}
              placeholder="8lete"
            />
          </Field>

          <Field label="Legal name">
            <input
              value={legalName}
              onChange={(event) =>
                setLegalName(event.target.value)
              }
              className={inputClassName}
              placeholder="Legal registered name"
            />
          </Field>

          <Field label="Tagline">
            <input
              value={tagline}
              onChange={(event) =>
                setTagline(event.target.value)
              }
              className={inputClassName}
              placeholder="Company tagline"
            />
          </Field>

          <Field label="Status">
            <select
              value={status}
              onChange={(event) =>
                setStatus(
                  event.target.value as CompanyStatus,
                )
              }
              className={inputClassName}
            >
              {companyStatuses.map((item) => (
                <option
                  key={item.value}
                  value={item.value}
                >
                  {item.label}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Stage">
            <select
              value={stage}
              onChange={(event) =>
                setStage(
                  event.target.value as CompanyStage,
                )
              }
              className={inputClassName}
            >
              {companyStages.map((item) => (
                <option
                  key={item.value}
                  value={item.value}
                >
                  {item.label}
                </option>
              ))}
            </select>
          </Field>

          <div className="md:col-span-2">
            <Field label="Description">
              <textarea
                value={description}
                onChange={(event) =>
                  setDescription(event.target.value)
                }
                className={textareaClassName}
                placeholder="Describe the company..."
              />
            </Field>
          </div>
        </div>
      </Section>

      <Section
        title="Your Roles"
        description="Select your roles within this company."
      >
        <div className="flex flex-wrap gap-3">
          {companyRoles.map((role) => {
            const selected = roles.includes(role.value);

            return (
              <button
                key={role.value}
                type="button"
                onClick={() =>
                  toggleRole(role.value)
                }
                className={`rounded-xl border px-4 py-2 text-sm transition ${
                  selected
                    ? "border-[#C6FF32]/60 bg-[#C6FF32]/10 text-[#C6FF32]"
                    : "border-white/10 bg-white/[0.03] text-white/55 hover:text-white"
                }`}
              >
                {role.label}
              </button>
            );
          })}
        </div>
      </Section>

      <Section
        title="Business Information"
        description="Markets, products and business positioning."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Headquarters">
            <input
              value={headquarters}
              onChange={(event) =>
                setHeadquarters(event.target.value)
              }
              className={inputClassName}
              placeholder="Mumbai, India"
            />
          </Field>

          <Field label="Website">
            <input
              value={website}
              onChange={(event) =>
                setWebsite(event.target.value)
              }
              className={inputClassName}
              placeholder="https://example.com"
            />
          </Field>

          <Field label="Business model">
            <textarea
              value={businessModel}
              onChange={(event) =>
                setBusinessModel(event.target.value)
              }
              className={textareaClassName}
              placeholder="How the company makes money..."
            />
          </Field>

          <Field label="Target customer">
            <textarea
              value={targetCustomer}
              onChange={(event) =>
                setTargetCustomer(event.target.value)
              }
              className={textareaClassName}
              placeholder="Who the company serves..."
            />
          </Field>

          <Field label="Industries">
            <textarea
              value={industries}
              onChange={(event) =>
                setIndustries(event.target.value)
              }
              className={textareaClassName}
              placeholder={"Sports Technology\nSaaS"}
            />
          </Field>

          <Field label="Products">
            <textarea
              value={products}
              onChange={(event) =>
                setProducts(event.target.value)
              }
              className={textareaClassName}
              placeholder={"Academy OS\nPlayer App"}
            />
          </Field>

          <Field label="Markets">
            <textarea
              value={markets}
              onChange={(event) =>
                setMarkets(event.target.value)
              }
              className={textareaClassName}
              placeholder={"India\nUnited Kingdom"}
            />
          </Field>

          <Field label="Current focus">
            <textarea
              value={currentFocus}
              onChange={(event) =>
                setCurrentFocus(event.target.value)
              }
              className={textareaClassName}
              placeholder="What the company is focused on now..."
            />
          </Field>
        </div>
      </Section>

      <Section title="Branding">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Logo URL">
            <input
              value={logoUrl}
              onChange={(event) =>
                setLogoUrl(event.target.value)
              }
              className={inputClassName}
              placeholder="https://..."
            />
          </Field>

          <Field label="Cover image URL">
            <input
              value={coverImageUrl}
              onChange={(event) =>
                setCoverImageUrl(event.target.value)
              }
              className={inputClassName}
              placeholder="https://..."
            />
          </Field>
        </div>
      </Section>

      <Section title="Founders">
        <div className="space-y-4">
          {founders.map((founder, index) => (
            <div
              key={index}
              className="rounded-xl border border-white/10 bg-black/20 p-4"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Name" required>
                  <input
                    value={founder.name}
                    onChange={(event) =>
                      updateFounder(
                        index,
                        "name",
                        event.target.value,
                      )
                    }
                    className={inputClassName}
                  />
                </Field>

                <Field label="Email">
                  <input
                    type="email"
                    value={founder.email ?? ""}
                    onChange={(event) =>
                      updateFounder(
                        index,
                        "email",
                        event.target.value,
                      )
                    }
                    className={inputClassName}
                  />
                </Field>

                <Field label="Designation">
                  <input
                    value={
                      founder.designation ?? ""
                    }
                    onChange={(event) =>
                      updateFounder(
                        index,
                        "designation",
                        event.target.value,
                      )
                    }
                    className={inputClassName}
                  />
                </Field>

                <div className="flex items-end justify-between gap-4">
                  <label className="flex h-11 items-center gap-3 text-sm text-white/60">
                    <input
                      type="checkbox"
                      checked={founder.isPrimary}
                      onChange={(event) =>
                        updateFounder(
                          index,
                          "isPrimary",
                          event.target.checked,
                        )
                      }
                    />
                    Primary founder
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      removeFounder(index)
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-red-500/20 text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() =>
              setFounders((current) => [
                ...current,
                { ...emptyFounder },
              ])
            }
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-white/60 hover:text-white"
          >
            <Plus className="h-4 w-4" />
            Add founder
          </button>
        </div>
      </Section>

      <Section title="Links">
        <div className="space-y-4">
          {links.map((link, index) => (
            <div
              key={index}
              className="grid gap-4 rounded-xl border border-white/10 bg-black/20 p-4 md:grid-cols-[1fr_2fr_auto]"
            >
              <Field label="Label">
                <input
                  value={link.label}
                  onChange={(event) =>
                    updateLink(
                      index,
                      "label",
                      event.target.value,
                    )
                  }
                  className={inputClassName}
                />
              </Field>

              <Field label="URL">
                <input
                  value={link.url}
                  onChange={(event) =>
                    updateLink(
                      index,
                      "url",
                      event.target.value,
                    )
                  }
                  className={inputClassName}
                />
              </Field>

              <button
                type="button"
                onClick={() => removeLink(index)}
                className="mt-7 flex h-10 w-10 items-center justify-center rounded-lg border border-red-500/20 text-red-400"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}

          <button
            type="button"
            onClick={() =>
              setLinks((current) => [
                ...current,
                { ...emptyLink },
              ])
            }
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-white/60"
          >
            <Plus className="h-4 w-4" />
            Add link
          </button>
        </div>
      </Section>

      <Section title="Metrics">
        <div className="space-y-4">
          {metrics.map((metric, index) => (
            <div
              key={index}
              className="rounded-xl border border-white/10 bg-black/20 p-4"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Key">
                  <input
                    value={metric.key}
                    onChange={(event) =>
                      updateMetric(
                        index,
                        "key",
                        event.target.value,
                      )
                    }
                    className={inputClassName}
                  />
                </Field>

                <Field label="Label">
                  <input
                    value={metric.label}
                    onChange={(event) =>
                      updateMetric(
                        index,
                        "label",
                        event.target.value,
                      )
                    }
                    className={inputClassName}
                  />
                </Field>

                <Field label="Value">
                  <input
                    value={String(metric.value)}
                    onChange={(event) =>
                      updateMetric(
                        index,
                        "value",
                        event.target.value,
                      )
                    }
                    className={inputClassName}
                  />
                </Field>

                <Field label="Unit">
                  <input
                    value={metric.unit ?? ""}
                    onChange={(event) =>
                      updateMetric(
                        index,
                        "unit",
                        event.target.value,
                      )
                    }
                    className={inputClassName}
                  />
                </Field>

                <Field label="Measured at">
                  <input
                    type="date"
                    value={toDateInput(
                      metric.measuredAt,
                    )}
                    onChange={(event) =>
                      updateMetric(
                        index,
                        "measuredAt",
                        event.target.value,
                      )
                    }
                    className={inputClassName}
                  />
                </Field>

                <div className="flex items-end justify-end">
                  <button
                    type="button"
                    onClick={() =>
                      removeMetric(index)
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-red-500/20 text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() =>
              setMetrics((current) => [
                ...current,
                { ...emptyMetric },
              ])
            }
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-white/60"
          >
            <Plus className="h-4 w-4" />
            Add metric
          </button>
        </div>
      </Section>

      <Section title="Goals">
        <div className="space-y-4">
          {goals.map((goal, index) => (
            <div
              key={index}
              className="rounded-xl border border-white/10 bg-black/20 p-4"
            >
              <div className="grid gap-4 md:grid-cols-2">
                <Field label="Title">
                  <input
                    value={goal.title}
                    onChange={(event) =>
                      updateGoal(
                        index,
                        "title",
                        event.target.value,
                      )
                    }
                    className={inputClassName}
                  />
                </Field>

                <Field label="Target date">
                  <input
                    type="date"
                    value={toDateInput(
                      goal.targetDate,
                    )}
                    onChange={(event) =>
                      updateGoal(
                        index,
                        "targetDate",
                        event.target.value,
                      )
                    }
                    className={inputClassName}
                  />
                </Field>

                <Field label="Progress percentage">
                  <input
                    type="number"
                    min={0}
                    max={100}
                    value={goal.progressPercentage}
                    onChange={(event) =>
                      updateGoal(
                        index,
                        "progressPercentage",
                        Number(event.target.value),
                      )
                    }
                    className={inputClassName}
                  />
                </Field>

                <div className="flex items-end justify-between">
                  <label className="flex h-11 items-center gap-3 text-sm text-white/60">
                    <input
                      type="checkbox"
                      checked={goal.completed}
                      onChange={(event) =>
                        updateGoal(
                          index,
                          "completed",
                          event.target.checked,
                        )
                      }
                    />
                    Completed
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      removeGoal(index)
                    }
                    className="flex h-10 w-10 items-center justify-center rounded-lg border border-red-500/20 text-red-400"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                <div className="md:col-span-2">
                  <Field label="Description">
                    <textarea
                      value={goal.description ?? ""}
                      onChange={(event) =>
                        updateGoal(
                          index,
                          "description",
                          event.target.value,
                        )
                      }
                      className={textareaClassName}
                    />
                  </Field>
                </div>
              </div>
            </div>
          ))}

          <button
            type="button"
            onClick={() =>
              setGoals((current) => [
                ...current,
                { ...emptyGoal },
              ])
            }
            className="inline-flex items-center gap-2 rounded-xl border border-white/10 px-4 py-2 text-sm text-white/60"
          >
            <Plus className="h-4 w-4" />
            Add goal
          </button>
        </div>
      </Section>

      <Section title="Operating Context">
        <div className="grid gap-5 md:grid-cols-3">
          <Field label="Principles">
            <textarea
              value={principles}
              onChange={(event) =>
                setPrinciples(event.target.value)
              }
              className={textareaClassName}
              placeholder="One principle per line"
            />
          </Field>

          <Field label="Current priorities">
            <textarea
              value={currentPriorities}
              onChange={(event) =>
                setCurrentPriorities(
                  event.target.value,
                )
              }
              className={textareaClassName}
              placeholder="One priority per line"
            />
          </Field>

          <Field label="Challenges">
            <textarea
              value={challenges}
              onChange={(event) =>
                setChallenges(event.target.value)
              }
              className={textareaClassName}
              placeholder="One challenge per line"
            />
          </Field>
        </div>
      </Section>

      <Section title="Dates and Metadata">
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Founded at">
            <input
              type="date"
              value={foundedAt}
              onChange={(event) =>
                setFoundedAt(event.target.value)
              }
              className={inputClassName}
            />
          </Field>

          <Field label="Last reviewed at">
            <input
              type="date"
              value={lastReviewedAt}
              onChange={(event) =>
                setLastReviewedAt(
                  event.target.value,
                )
              }
              className={inputClassName}
            />
          </Field>

          <div className="md:col-span-2">
            <Field label="Metadata JSON">
              <textarea
                value={metadata}
                onChange={(event) =>
                  setMetadata(event.target.value)
                }
                className={`${textareaClassName} min-h-48 font-mono`}
              />
            </Field>
          </div>
        </div>
      </Section>

      <Section title="Settings">
        <div className="grid gap-4 md:grid-cols-3">
          <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 p-4">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(event) =>
                setIsFeatured(event.target.checked)
              }
            />

            <span>
              <span className="block text-sm text-white">
                Featured
              </span>
              <span className="text-xs text-white/40">
                Highlight this company.
              </span>
            </span>
          </label>

          <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 p-4">
            <input
              type="checkbox"
              checked={isActive}
              onChange={(event) =>
                setIsActive(event.target.checked)
              }
            />

            <span>
              <span className="block text-sm text-white">
                Active
              </span>
              <span className="text-xs text-white/40">
                Company is currently active.
              </span>
            </span>
          </label>

          <label className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/20 p-4">
            <input
              type="checkbox"
              checked={isArchived}
              onChange={(event) =>
                setIsArchived(event.target.checked)
              }
            />

            <span>
              <span className="block text-sm text-white">
                Archived
              </span>
              <span className="text-xs text-white/40">
                Hide from active records.
              </span>
            </span>
          </label>
        </div>
      </Section>

      <AdminFormFooter
        saving={saving}
        isEditMode={isEditMode}
        createLabel="Create Company"
        updateLabel="Save Company"
        description={
            isEditMode
            ? "Save changes to update this company."
            : "Save to create this company."
        }
      />
    </form>
  );
}