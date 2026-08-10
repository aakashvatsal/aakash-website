"use client";

import Link from "next/link";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useState } from "react";
import {
  Building2,
  ChevronLeft,
  ChevronRight,
  Eye,
  Pencil,
  Plus,
  Trash2,
} from "lucide-react";

import { deleteCompany } from "@/lib/api/companies";

import type {
  Company,
  CompanyPagination,
  CompanyStage,
  CompanyStatus,
} from "@/types/company";

interface CompanyTableProps {
  companies: Company[];
  pagination: CompanyPagination;
}

const statusLabels: Record<
  CompanyStatus,
  string
> = {
  idea: "Idea",
  building: "Building",
  active: "Active",
  paused: "Paused",
  acquired: "Acquired",
  closed: "Closed",
};

const stageLabels: Record<
  CompanyStage,
  string
> = {
  idea: "Idea",
  pre_seed: "Pre Seed",
  seed: "Seed",
  early_stage: "Early Stage",
  growth: "Growth",
  mature: "Mature",
};

function formatDate(value?: string) {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
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

function formatRole(value: string) {
  return value
    .split("_")
    .map(
      (word) =>
        word.charAt(0).toUpperCase() +
        word.slice(1),
    )
    .join(" ");
}

function getStatusClass(
  status: CompanyStatus,
) {
  switch (status) {
    case "active":
      return "border-[#C6FF32]/20 bg-[#C6FF32]/10 text-[#C6FF32]";

    case "building":
      return "border-blue-400/20 bg-blue-400/10 text-blue-300";

    case "paused":
      return "border-amber-400/20 bg-amber-400/10 text-amber-300";

    case "acquired":
      return "border-purple-400/20 bg-purple-400/10 text-purple-300";

    case "closed":
      return "border-red-400/20 bg-red-400/10 text-red-300";

    default:
      return "border-white/10 bg-white/[0.04] text-white/60";
  }
}

export function CompanyTable({
  companies,
  pagination,
}: CompanyTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  const [
    deleteTarget,
    setDeleteTarget,
  ] = useState<Company | null>(null);

  const [error, setError] = useState("");

  function changePage(page: number) {
    const params = new URLSearchParams(
      searchParams.toString(),
    );

    params.set("page", String(page));

    router.push(
      `/admin/companies?${params.toString()}`,
    );
  }

  async function handleDelete() {
    if (!deleteTarget) {
      return;
    }

    try {
      setDeletingId(deleteTarget._id);
      setError("");

      await deleteCompany(deleteTarget._id);

      setDeleteTarget(null);
      router.refresh();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to delete company.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  if (companies.length === 0) {
    return (
      <div className="rounded-[32px] border border-dashed border-white/15 bg-white/[0.015] px-6 py-24 text-center">
        <div className="mx-auto grid h-16 w-16 place-items-center rounded-[20px] border border-[#C6FF32]/15 bg-[#C6FF32]/10 text-[#C6FF32]">
          <Building2 className="h-7 w-7" />
        </div>

        <h2 className="mt-6 text-3xl font-black tracking-[-0.04em] text-white">
          No companies found
        </h2>

        <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-white/40">
          Create your first company or
          change the current search and
          filter options.
        </p>

        <Link
          href="/admin/companies/new"
          className="mt-7 inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] bg-[#C6FF32] px-5 text-sm font-black text-[#030608]"
        >
          <Plus className="h-4 w-4" />
          New company
        </Link>
      </div>
    );
  }

  return (
    <>
      {error && (
        <div className="mb-6 rounded-[16px] border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.025]">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <thead>
              <tr className="border-b border-white/10 bg-white/[0.015] text-left">
                <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.14em] text-white/30">
                  Company
                </th>

                <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.14em] text-white/30">
                  Status
                </th>

                <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.14em] text-white/30">
                  Stage
                </th>

                <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.14em] text-white/30">
                  Roles
                </th>

                <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.14em] text-white/30">
                  Products
                </th>

                <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.14em] text-white/30">
                  Featured
                </th>

                <th className="px-5 py-4 text-xs font-black uppercase tracking-[0.14em] text-white/30">
                  Updated
                </th>

                <th className="px-5 py-4 text-right text-xs font-black uppercase tracking-[0.14em] text-white/30">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody>
              {companies.map((company) => (
                <tr
                  key={company._id}
                  className="border-b border-white/[0.06] transition last:border-b-0 hover:bg-white/[0.025]"
                >
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      {company.logoUrl ? (
                        <img
                          src={company.logoUrl}
                          alt={company.name}
                          className="h-11 w-11 shrink-0 rounded-[13px] border border-white/10 object-cover"
                        />
                      ) : (
                        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-[13px] border border-white/10 bg-white/[0.04]">
                          <Building2 className="h-5 w-5 text-white/35" />
                        </div>
                      )}

                      <div className="min-w-0">
                        <Link
                          href={`/admin/companies/${company._id}`}
                          className="block truncate font-bold text-white transition hover:text-[#C6FF32]"
                        >
                          {company.name}
                        </Link>

                        <p className="mt-1 max-w-xs truncate text-xs text-white/35">
                          {company.tagline ??
                            company.legalName ??
                            company.slug}
                        </p>
                      </div>
                    </div>
                  </td>

                  <td className="px-5 py-4">
                    <span
                      className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${getStatusClass(
                        company.status,
                      )}`}
                    >
                      {
                        statusLabels[
                          company.status
                        ]
                      }
                    </span>
                  </td>

                  <td className="px-5 py-4 text-sm font-medium text-white/60">
                    {
                      stageLabels[
                        company.stage
                      ]
                    }
                  </td>

                  <td className="px-5 py-4">
                    <p className="max-w-[220px] truncate text-sm text-white/55">
                      {company.roles?.length
                        ? company.roles
                            .map(formatRole)
                            .join(", ")
                        : "—"}
                    </p>
                  </td>

                  <td className="px-5 py-4 text-sm font-bold text-white/65">
                    {company.products?.length ??
                      0}
                  </td>

                  <td className="px-5 py-4">
                    {company.isFeatured ? (
                      <span className="inline-flex rounded-full border border-[#C6FF32]/20 bg-[#C6FF32]/10 px-3 py-1 text-xs font-bold text-[#C6FF32]">
                        Featured
                      </span>
                    ) : (
                      <span className="text-sm text-white/25">
                        —
                      </span>
                    )}
                  </td>

                  <td className="px-5 py-4 text-sm text-white/40">
                    {formatDate(
                      company.updatedAt,
                    )}
                  </td>

                  <td className="px-5 py-4">
                    <div className="flex justify-end gap-2">
                      <Link
                        href={`/companies/${company.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="grid h-9 w-9 place-items-center rounded-[10px] border border-white/10 text-white/40 transition hover:border-white/20 hover:bg-white/[0.04] hover:text-white"
                        aria-label={`View ${company.name}`}
                      >
                        <Eye className="h-4 w-4" />
                      </Link>

                      <Link
                        href={`/admin/companies/${company._id}`}
                        className="grid h-9 w-9 place-items-center rounded-[10px] border border-white/10 text-white/40 transition hover:border-[#C6FF32]/25 hover:bg-[#C6FF32]/10 hover:text-[#C6FF32]"
                        aria-label={`Edit ${company.name}`}
                      >
                        <Pencil className="h-4 w-4" />
                      </Link>

                      <button
                        type="button"
                        disabled={
                          deletingId ===
                          company._id
                        }
                        onClick={() =>
                          setDeleteTarget(
                            company,
                          )
                        }
                        className="grid h-9 w-9 place-items-center rounded-[10px] border border-red-400/20 text-red-300 transition hover:bg-red-400/10 disabled:cursor-not-allowed disabled:opacity-40"
                        aria-label={`Delete ${company.name}`}
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {pagination.totalPages > 1 && (
        <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-white/35">
            Page{" "}
            <span className="font-bold text-white">
              {pagination.page}
            </span>{" "}
            of{" "}
            <span className="font-bold text-white">
              {pagination.totalPages}
            </span>
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() =>
                changePage(
                  pagination.page - 1,
                )
              }
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] border border-white/10 px-4 text-sm font-bold text-white/55 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </button>

            <button
              type="button"
              disabled={
                pagination.page >=
                pagination.totalPages
              }
              onClick={() =>
                changePage(
                  pagination.page + 1,
                )
              }
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] border border-white/10 px-4 text-sm font-bold text-white/55 transition hover:border-white/20 hover:text-white disabled:cursor-not-allowed disabled:opacity-30"
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      {deleteTarget && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/75 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[24px] border border-white/10 bg-[#070b0d] p-6 shadow-2xl">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-red-300">
              Delete company
            </p>

            <h2 className="mt-4 text-xl font-black text-white">
              Delete “{deleteTarget.name}”?
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/40">
              This permanently removes the
              company. This action cannot be
              undone.
            </p>

            <div className="mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={
                  deletingId ===
                  deleteTarget._id
                }
                onClick={() =>
                  setDeleteTarget(null)
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
                onClick={handleDelete}
                className="min-h-11 rounded-[14px] bg-red-400 px-5 text-sm font-black text-[#190404] transition hover:brightness-95 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {deletingId ===
                deleteTarget._id
                  ? "Deleting..."
                  : "Delete company"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}