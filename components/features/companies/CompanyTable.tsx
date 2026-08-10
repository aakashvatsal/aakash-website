"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  Building2,
  Eye,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import { deleteCompany } from "@/lib/api/companies";
import type {
  Company,
  CompanyStage,
  CompanyStatus,
} from "@/types/company";

interface CompanyTableProps {
  companies: Company[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

const statusLabels: Record<CompanyStatus, string> = {
  idea: "Idea",
  building: "Building",
  active: "Active",
  paused: "Paused",
  acquired: "Acquired",
  closed: "Closed",
};

const stageLabels: Record<CompanyStage, string> = {
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

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
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

export function CompanyTable({
  companies,
  pagination,
}: CompanyTableProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(
    searchParams.get("search") ?? "",
  );

  const [deletingId, setDeletingId] =
    useState<string | null>(null);

  function updateQuery(
    key: string,
    value?: string,
  ) {
    const params = new URLSearchParams(
      searchParams.toString(),
    );

    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }

    params.set("page", "1");

    router.push(
      `/admin/companies?${params.toString()}`,
    );
  }

  function handleSearchSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();
    updateQuery("search", search.trim());
  }

  async function handleDelete(company: Company) {
    const confirmed = window.confirm(
      `Delete "${company.name}"?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(company._id);

      await deleteCompany(company._id);

      router.refresh();
    } catch (error) {
      window.alert(
        error instanceof Error
          ? error.message
          : "Unable to delete company.",
      );
    } finally {
      setDeletingId(null);
    }
  }

  function changePage(page: number) {
    const params = new URLSearchParams(
      searchParams.toString(),
    );

    params.set("page", String(page));

    router.push(
      `/admin/companies?${params.toString()}`,
    );
  }

  return (
    <div className="space-y-6">

      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div className="flex flex-col gap-3 lg:flex-row">
          <form
            onSubmit={handleSearchSubmit}
            className="relative flex-1"
          >
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search companies..."
              className="h-11 w-full rounded-xl border border-white/10 bg-black/30 pl-10 pr-4 text-sm text-white outline-none placeholder:text-white/30 focus:border-[#C6FF32]/50"
            />
          </form>

          <select
            value={
              searchParams.get("status") ?? ""
            }
            onChange={(event) =>
              updateQuery(
                "status",
                event.target.value,
              )
            }
            className="h-11 rounded-xl border border-white/10 bg-[#090d10] px-4 text-sm text-white outline-none focus:border-[#C6FF32]/50"
          >
            <option value="">All statuses</option>

            {Object.entries(statusLabels).map(
              ([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ),
            )}
          </select>

          <select
            value={
              searchParams.get("stage") ?? ""
            }
            onChange={(event) =>
              updateQuery(
                "stage",
                event.target.value,
              )
            }
            className="h-11 rounded-xl border border-white/10 bg-[#090d10] px-4 text-sm text-white outline-none focus:border-[#C6FF32]/50"
          >
            <option value="">All stages</option>

            {Object.entries(stageLabels).map(
              ([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ),
            )}
          </select>
        </div>
      </div>

      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03]">
        {companies.length === 0 ? (
          <div className="flex min-h-80 flex-col items-center justify-center px-6 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-white/[0.04]">
              <Building2 className="h-6 w-6 text-white/50" />
            </div>

            <h2 className="mt-5 text-lg font-medium text-white">
              No companies found
            </h2>

            <p className="mt-2 text-sm text-white/45">
              Create your first company to get started.
            </p>

            <Link
              href="/admin/companies/new"
              className="mt-5 inline-flex h-10 items-center gap-2 rounded-xl bg-[#C6FF32] px-4 text-sm font-medium text-black"
            >
              <Plus className="h-4 w-4" />
              New Company
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1000px]">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-white/40">
                    Company
                  </th>

                  <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-white/40">
                    Status
                  </th>

                  <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-white/40">
                    Stage
                  </th>

                  <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-white/40">
                    Roles
                  </th>

                  <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-white/40">
                    Featured
                  </th>

                  <th className="px-5 py-4 text-xs font-medium uppercase tracking-wider text-white/40">
                    Updated
                  </th>

                  <th className="px-5 py-4 text-right text-xs font-medium uppercase tracking-wider text-white/40">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody>
                {companies.map((company) => (
                  <tr
                    key={company._id}
                    className="border-b border-white/[0.06] last:border-b-0 hover:bg-white/[0.025]"
                  >
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        {company.logoUrl ? (
                          <img
                            src={company.logoUrl}
                            alt={company.name}
                            className="h-11 w-11 rounded-xl border border-white/10 object-cover"
                          />
                        ) : (
                          <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/10 bg-white/[0.04]">
                            <Building2 className="h-5 w-5 text-white/40" />
                          </div>
                        )}

                        <div className="min-w-0">
                          <p className="font-medium text-white">
                            {company.name}
                          </p>

                          <p className="mt-1 max-w-xs truncate text-xs text-white/40">
                            {company.tagline ??
                              company.legalName ??
                              company.slug}
                          </p>
                        </div>
                      </div>
                    </td>

                    <td className="px-5 py-4">
                      <span className="inline-flex rounded-full border border-white/10 bg-white/[0.04] px-3 py-1 text-xs text-white/70">
                        {statusLabels[company.status]}
                      </span>
                    </td>

                    <td className="px-5 py-4 text-sm text-white/60">
                      {stageLabels[company.stage]}
                    </td>

                    <td className="px-5 py-4 text-sm text-white/60">
                      {company.roles.length
                        ? company.roles
                            .map(formatRole)
                            .join(", ")
                        : "—"}
                    </td>

                    <td className="px-5 py-4 text-sm text-white/60">
                      {company.isFeatured
                        ? "Yes"
                        : "—"}
                    </td>

                    <td className="px-5 py-4 text-sm text-white/50">
                      {formatDate(company.updatedAt)}
                    </td>

                    <td className="px-5 py-4">
                      <div className="flex justify-end gap-2">
                        <Link
                          href={`/admin/companies/${company._id}`}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white/50 transition hover:border-white/20 hover:text-white"
                          aria-label="View company"
                        >
                          <Eye className="h-4 w-4" />
                        </Link>

                        <Link
                          href={`/admin/companies/${company._id}`}
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 text-white/50 transition hover:border-white/20 hover:text-white"
                          aria-label="Edit company"
                        >
                          <Pencil className="h-4 w-4" />
                        </Link>

                        <button
                          type="button"
                          disabled={
                            deletingId === company._id
                          }
                          onClick={() =>
                            handleDelete(company)
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg border border-red-500/20 text-red-400 transition hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                          aria-label="Delete company"
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
        )}
      </div>

      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-white/40">
            Page {pagination.page} of{" "}
            {pagination.totalPages}
          </p>

          <div className="flex gap-2">
            <button
              type="button"
              disabled={pagination.page <= 1}
              onClick={() =>
                changePage(pagination.page - 1)
              }
              className="h-10 rounded-xl border border-white/10 px-4 text-sm text-white/60 disabled:cursor-not-allowed disabled:opacity-30"
            >
              Previous
            </button>

            <button
              type="button"
              disabled={
                pagination.page >=
                pagination.totalPages
              }
              onClick={() =>
                changePage(pagination.page + 1)
              }
              className="h-10 rounded-xl border border-white/10 px-4 text-sm text-white/60 disabled:cursor-not-allowed disabled:opacity-30"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}