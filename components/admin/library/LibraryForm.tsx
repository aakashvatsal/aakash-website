"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import { AdminFormFooter } from "../AdminFormFooter";
import {
  LibraryItem,
  LibraryItemPayload,
  LibraryItemStatus,
  LibraryItemType,
} from "@/types/library";
import {
  createLibraryItem,
  updateLibraryItem,
} from "@/lib/api/library";
import { StringListEditor } from "./StringListEditor";

type LibraryFormProps = {
  item?: LibraryItem;
};

const fieldClassName =
  "min-h-12 w-full rounded-[14px] border border-white/10 bg-white/[0.025] px-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#C6FF32]/40";

const textareaClassName =
  "w-full resize-y rounded-[14px] border border-white/10 bg-white/[0.025] px-4 py-3 text-sm leading-6 text-white outline-none placeholder:text-white/25 focus:border-[#C6FF32]/40";

function toDateInput(value?: string) {
  if (!value) return "";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return "";

  return date.toISOString().slice(0, 10);
}

function emptyForm(): LibraryItemPayload {
  return {
    title: "",
    subtitle: "",
    type: LibraryItemType.BOOK,
    status: LibraryItemStatus.WANT_TO_READ,
    author: "",
    publisher: "",
    category: "",
    tags: [],
    coverImageUrl: "",
    sourceUrl: "",
    progressPercentage: 0,
    currentPage: 0,
    totalPages: 0,
    rating: undefined,
    summary: "",
    notes: "",
    keyTakeaways: [],
    quotes: [],
    startedAt: "",
    completedAt: "",
    lastReadAt: "",
    isFavourite: false,
    isArchived: false,
    isActive: true,
  };
}

function itemToForm(item: LibraryItem): LibraryItemPayload {
  return {
    title: item.title,
    subtitle: item.subtitle ?? "",
    type: item.type,
    status: item.status,
    author: item.author ?? "",
    publisher: item.publisher ?? "",
    category: item.category ?? "",
    tags: item.tags ?? [],
    coverImageUrl: item.coverImageUrl ?? "",
    sourceUrl: item.sourceUrl ?? "",
    progressPercentage: item.progressPercentage ?? 0,
    currentPage: item.currentPage ?? 0,
    totalPages: item.totalPages ?? 0,
    rating: item.rating,
    summary: item.summary ?? "",
    notes: item.notes ?? "",
    keyTakeaways: item.keyTakeaways ?? [],
    quotes: item.quotes ?? [],
    startedAt: toDateInput(item.startedAt),
    completedAt: toDateInput(item.completedAt),
    lastReadAt: toDateInput(item.lastReadAt),
    isFavourite: item.isFavourite ?? false,
    isArchived: item.isArchived ?? false,
    isActive: item.isActive ?? true,
  };
}

export function LibraryForm({ item }: LibraryFormProps) {
  const router = useRouter();

  const [form, setForm] = useState<LibraryItemPayload>(() =>
    item ? itemToForm(item) : emptyForm(),
  );

  const isEditMode = Boolean(item?._id);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const calculatedProgress = useMemo(() => {
    if (form.totalPages <= 0) {
      return form.progressPercentage;
    }

    return Math.min(
      100,
      Math.max(
        0,
        Math.round((form.currentPage / form.totalPages) * 100),
      ),
    );
  }, [
    form.currentPage,
    form.totalPages,
    form.progressPercentage,
  ]);

  function updateField<K extends keyof LibraryItemPayload>(
    key: K,
    value: LibraryItemPayload[K],
  ) {
    setForm((current) => ({
      ...current,
      [key]: value,
    }));
  }

  function handleCurrentPageChange(value: number) {
    const currentPage = Math.max(0, value);

    setForm((current) => {
      const progressPercentage =
        current.totalPages > 0
          ? Math.min(
              100,
              Math.round(
                (currentPage / current.totalPages) * 100,
              ),
            )
          : current.progressPercentage;

      return {
        ...current,
        currentPage,
        progressPercentage,
      };
    });
  }

  function handleTotalPagesChange(value: number) {
    const totalPages = Math.max(0, value);

    setForm((current) => {
      const progressPercentage =
        totalPages > 0
          ? Math.min(
              100,
              Math.round(
                (current.currentPage / totalPages) * 100,
              ),
            )
          : current.progressPercentage;

      return {
        ...current,
        totalPages,
        progressPercentage,
      };
    });
  }

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (!form.title.trim()) {
      setError("Title is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload: LibraryItemPayload = {
        ...form,
        title: form.title.trim(),
        subtitle: form.subtitle?.trim() || undefined,
        author: form.author?.trim() || undefined,
        publisher: form.publisher?.trim() || undefined,
        category: form.category?.trim() || undefined,
        coverImageUrl:
          form.coverImageUrl?.trim() || undefined,
        sourceUrl: form.sourceUrl?.trim() || undefined,
        summary: form.summary?.trim() || undefined,
        notes: form.notes?.trim() || undefined,
        startedAt: form.startedAt || undefined,
        completedAt: form.completedAt || undefined,
        lastReadAt: form.lastReadAt || undefined,
        rating:
          form.rating === undefined || form.rating === null
            ? undefined
            : Number(form.rating),
      };

      if (item?._id) {
        await updateLibraryItem(item._id, payload);
      } else {
        await createLibraryItem(payload);
      }

      router.push("/admin/library");
      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to save library item.",
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={handleSubmit}>

      {error && (
        <div className="mt-6 rounded-[16px] border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_360px]">
        <div className="space-y-6">
          <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5 sm:p-7">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#C6FF32]">
              Basic information
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-2">
              <label className="sm:col-span-2">
                <span className="text-sm font-bold text-white/70">
                  Title
                </span>

                <input
                  required
                  value={form.title}
                  onChange={(event) =>
                    updateField("title", event.target.value)
                  }
                  placeholder="The Pragmatic Programmer"
                  className={`${fieldClassName} mt-2`}
                />
              </label>

              <label className="sm:col-span-2">
                <span className="text-sm font-bold text-white/70">
                  Subtitle
                </span>

                <input
                  value={form.subtitle ?? ""}
                  onChange={(event) =>
                    updateField("subtitle", event.target.value)
                  }
                  placeholder="Optional subtitle"
                  className={`${fieldClassName} mt-2`}
                />
              </label>

              <label>
                <span className="text-sm font-bold text-white/70">
                  Type
                </span>

                <select
                  value={form.type}
                  onChange={(event) =>
                    updateField(
                      "type",
                      event.target.value as LibraryItemType,
                    )
                  }
                  className={`${fieldClassName} mt-2`}
                >
                  {Object.values(LibraryItemType).map((type) => (
                    <option key={type} value={type}>
                      {type.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </label>

              <label>
                <span className="text-sm font-bold text-white/70">
                  Status
                </span>

                <select
                  value={form.status}
                  onChange={(event) =>
                    updateField(
                      "status",
                      event.target
                        .value as LibraryItemStatus,
                    )
                  }
                  className={`${fieldClassName} mt-2`}
                >
                  {Object.values(LibraryItemStatus).map(
                    (status) => (
                      <option key={status} value={status}>
                        {status.replaceAll("_", " ")}
                      </option>
                    ),
                  )}
                </select>
              </label>

              <label>
                <span className="text-sm font-bold text-white/70">
                  Author
                </span>

                <input
                  value={form.author ?? ""}
                  onChange={(event) =>
                    updateField("author", event.target.value)
                  }
                  placeholder="Author name"
                  className={`${fieldClassName} mt-2`}
                />
              </label>

              <label>
                <span className="text-sm font-bold text-white/70">
                  Publisher
                </span>

                <input
                  value={form.publisher ?? ""}
                  onChange={(event) =>
                    updateField("publisher", event.target.value)
                  }
                  placeholder="Publisher"
                  className={`${fieldClassName} mt-2`}
                />
              </label>

              <label>
                <span className="text-sm font-bold text-white/70">
                  Category
                </span>

                <input
                  value={form.category ?? ""}
                  onChange={(event) =>
                    updateField("category", event.target.value)
                  }
                  placeholder="Programming"
                  className={`${fieldClassName} mt-2`}
                />
              </label>

              <label>
                <span className="text-sm font-bold text-white/70">
                  Rating
                </span>

                <input
                  type="number"
                  min={0}
                  max={5}
                  step={0.5}
                  value={form.rating ?? ""}
                  onChange={(event) =>
                    updateField(
                      "rating",
                      event.target.value === ""
                        ? undefined
                        : Number(event.target.value),
                    )
                  }
                  placeholder="0–5"
                  className={`${fieldClassName} mt-2`}
                />
              </label>
            </div>

            <div className="mt-6">
              <StringListEditor
                label="Tags"
                values={form.tags}
                placeholder="Add tag"
                onChange={(values) =>
                  updateField("tags", values)
                }
              />
            </div>
          </section>

          <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5 sm:p-7">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#C6FF32]">
              Progress
            </p>

            <div className="mt-6 grid gap-5 sm:grid-cols-3">
              <label>
                <span className="text-sm font-bold text-white/70">
                  Current page
                </span>

                <input
                  type="number"
                  min={0}
                  value={form.currentPage}
                  onChange={(event) =>
                    handleCurrentPageChange(
                      Number(event.target.value),
                    )
                  }
                  className={`${fieldClassName} mt-2`}
                />
              </label>

              <label>
                <span className="text-sm font-bold text-white/70">
                  Total pages
                </span>

                <input
                  type="number"
                  min={0}
                  value={form.totalPages}
                  onChange={(event) =>
                    handleTotalPagesChange(
                      Number(event.target.value),
                    )
                  }
                  className={`${fieldClassName} mt-2`}
                />
              </label>

              <label>
                <span className="text-sm font-bold text-white/70">
                  Progress %
                </span>

                <input
                  type="number"
                  min={0}
                  max={100}
                  value={calculatedProgress}
                  onChange={(event) =>
                    updateField(
                      "progressPercentage",
                      Math.min(
                        100,
                        Math.max(
                          0,
                          Number(event.target.value),
                        ),
                      ),
                    )
                  }
                  className={`${fieldClassName} mt-2`}
                />
              </label>
            </div>

            <div className="mt-6 h-2 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-[#C6FF32]"
                style={{
                  width: `${calculatedProgress}%`,
                }}
              />
            </div>

            <div className="mt-6 grid gap-5 sm:grid-cols-3">
              <label>
                <span className="text-sm font-bold text-white/70">
                  Started
                </span>

                <input
                  type="date"
                  value={form.startedAt ?? ""}
                  onChange={(event) =>
                    updateField("startedAt", event.target.value)
                  }
                  className={`${fieldClassName} mt-2`}
                />
              </label>

              <label>
                <span className="text-sm font-bold text-white/70">
                  Completed
                </span>

                <input
                  type="date"
                  value={form.completedAt ?? ""}
                  onChange={(event) =>
                    updateField(
                      "completedAt",
                      event.target.value,
                    )
                  }
                  className={`${fieldClassName} mt-2`}
                />
              </label>

              <label>
                <span className="text-sm font-bold text-white/70">
                  Last read
                </span>

                <input
                  type="date"
                  value={form.lastReadAt ?? ""}
                  onChange={(event) =>
                    updateField(
                      "lastReadAt",
                      event.target.value,
                    )
                  }
                  className={`${fieldClassName} mt-2`}
                />
              </label>
            </div>
          </section>

          <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5 sm:p-7">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#C6FF32]">
              Content
            </p>

            <div className="mt-6 space-y-5">
              <label className="block">
                <span className="text-sm font-bold text-white/70">
                  Summary
                </span>

                <textarea
                  rows={5}
                  value={form.summary ?? ""}
                  onChange={(event) =>
                    updateField("summary", event.target.value)
                  }
                  placeholder="Short summary"
                  className={`${textareaClassName} mt-2`}
                />
              </label>

              <label className="block">
                <span className="text-sm font-bold text-white/70">
                  Notes
                </span>

                <textarea
                  rows={8}
                  value={form.notes ?? ""}
                  onChange={(event) =>
                    updateField("notes", event.target.value)
                  }
                  placeholder="Personal notes"
                  className={`${textareaClassName} mt-2`}
                />
              </label>

              <StringListEditor
                label="Key takeaways"
                values={form.keyTakeaways}
                placeholder="Add takeaway"
                multiline
                onChange={(values) =>
                  updateField("keyTakeaways", values)
                }
              />

              <StringListEditor
                label="Quotes"
                values={form.quotes}
                placeholder="Add quote"
                multiline
                onChange={(values) =>
                  updateField("quotes", values)
                }
              />
            </div>
          </section>
        </div>

        <aside className="space-y-6">
          <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#C6FF32]">
              Media
            </p>

            <div className="mt-5 space-y-5">
              <label className="block">
                <span className="text-sm font-bold text-white/70">
                  Cover image URL
                </span>

                <input
                  value={form.coverImageUrl ?? ""}
                  onChange={(event) =>
                    updateField(
                      "coverImageUrl",
                      event.target.value,
                    )
                  }
                  placeholder="https://..."
                  className={`${fieldClassName} mt-2`}
                />
              </label>

              {form.coverImageUrl && (
                <div className="overflow-hidden rounded-[18px] border border-white/10 bg-white/[0.025]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={form.coverImageUrl}
                    alt={form.title || "Library item cover"}
                    className="aspect-[3/4] w-full object-cover"
                  />
                </div>
              )}

              <label className="block">
                <span className="text-sm font-bold text-white/70">
                  Source URL
                </span>

                <input
                  type="url"
                  value={form.sourceUrl ?? ""}
                  onChange={(event) =>
                    updateField("sourceUrl", event.target.value)
                  }
                  placeholder="https://..."
                  className={`${fieldClassName} mt-2`}
                />
              </label>
            </div>
          </section>

          <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#C6FF32]">
              Flags
            </p>

            <div className="mt-5 space-y-3">
              <label className="flex items-center justify-between gap-4 rounded-[14px] border border-white/10 px-4 py-4">
                <div>
                  <p className="text-sm font-bold">Favourite</p>
                  <p className="mt-1 text-xs text-white/35">
                    Mark as a favourite item.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={form.isFavourite}
                  onChange={(event) =>
                    updateField(
                      "isFavourite",
                      event.target.checked,
                    )
                  }
                  className="h-4 w-4 accent-[#C6FF32]"
                />
              </label>

              <label className="flex items-center justify-between gap-4 rounded-[14px] border border-white/10 px-4 py-4">
                <div>
                  <p className="text-sm font-bold">Archived</p>
                  <p className="mt-1 text-xs text-white/35">
                    Keep it but remove it from active views.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={form.isArchived}
                  onChange={(event) =>
                    updateField(
                      "isArchived",
                      event.target.checked,
                    )
                  }
                  className="h-4 w-4 accent-[#C6FF32]"
                />
              </label>

              <label className="flex items-center justify-between gap-4 rounded-[14px] border border-white/10 px-4 py-4">
                <div>
                  <p className="text-sm font-bold">Active</p>
                  <p className="mt-1 text-xs text-white/35">
                    Disable without deleting the record.
                  </p>
                </div>

                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(event) =>
                    updateField(
                      "isActive",
                      event.target.checked,
                    )
                  }
                  className="h-4 w-4 accent-[#C6FF32]"
                />
              </label>
            </div>
          </section>
        </aside>
      </div>
      <AdminFormFooter
        saving={saving}
        isEditMode={isEditMode}
        createLabel="Create Item"
        updateLabel="Save Item"
      />
    </form>
  );
}