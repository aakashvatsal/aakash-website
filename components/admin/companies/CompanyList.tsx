"use client";

import Link from "next/link";
import {
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  FormEvent,
  useEffect,
  useState,
} from "react";
import {
  Plus,
  Search,
  SlidersHorizontal,
} from "lucide-react";

import type {
  Company,
  CompanyPagination,
  CompanyStage,
  CompanyStatus,
} from "@/types/company";

import { CompanyStats } from "./CompanyStats";
import { CompanyTable } from "./CompanyTable";

interface CompanyListProps {
  companies: Company[];
  statsCompanies: Company[];
  totalCompanies: number;
  pagination: CompanyPagination;
  error?: string;
  search?: string;
  status?: string;
  stage?: string;
  featured?: string;
  active?: string;
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

export function CompanyList({
  companies,
  statsCompanies,
  totalCompanies,
  pagination,
  error,
  search: initialSearch,
  status,
  stage,
  featured,
  active,
}: CompanyListProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [search, setSearch] = useState(
    initialSearch ?? "",
  );

  useEffect(() => {
    setSearch(initialSearch ?? "");
  }, [initialSearch]);

  function updateFilters(
    updates: Record<
      string,
      string | undefined
    >,
  ) {
    const params = new URLSearchParams(
      searchParams.toString(),
    );

    Object.entries(updates).forEach(
      ([key, value]) => {
        if (
          value !== undefined &&
          value !== ""
        ) {
          params.set(key, value);
        } else {
          params.delete(key);
        }
      },
    );

    params.set("page", "1");

    const query = params.toString();

    router.push(
      query
        ? `/admin/companies?${query}`
        : "/admin/companies",
    );
  }

  function handleSearchSubmit(
    event: FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    updateFilters({
      search: search.trim() || undefined,
    });
  }

  function clearFilters() {
    setSearch("");
    router.push("/admin/companies");
  }

  const hasFilters = Boolean(
    initialSearch ||
      status ||
      stage ||
      featured ||
      active,
  );

  return (
    <div>
      <CompanyStats
        companies={statsCompanies}
        totalCompanies={totalCompanies}
      />

      <div className="mt-8 rounded-[24px] border border-white/10 bg-white/[0.025] p-4 sm:p-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <form
            onSubmit={handleSearchSubmit}
            className="relative min-w-0 flex-1"
          >
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search companies..."
              className="min-h-12 w-full rounded-[16px] border border-white/10 bg-[#05090b] pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/25 focus:border-[#C6FF32]/40"
            />
          </form>

          <Link
            href="/admin/companies/new"
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-[16px] bg-[#C6FF32] px-5 text-sm font-black text-[#030608] transition hover:brightness-95"
          >
            <Plus className="h-4 w-4" />
            New company
          </Link>
        </div>

        <div className="mt-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:flex-wrap lg:items-center">
            <div className="flex min-h-11 items-center gap-2 text-xs font-black uppercase tracking-[0.16em] text-white/30">
              <SlidersHorizontal className="h-4 w-4" />
              Filters
            </div>

            <select
              value={status ?? ""}
              onChange={(event) =>
                updateFilters({
                  status:
                    event.target.value ||
                    undefined,
                })
              }
              className="min-h-11 rounded-[14px] border border-white/10 bg-[#05090b] px-4 text-sm text-white outline-none focus:border-[#C6FF32]/40"
            >
              <option value="">
                All statuses
              </option>

              {Object.entries(
                statusLabels,
              ).map(([value, label]) => (
                <option
                  key={value}
                  value={value}
                >
                  {label}
                </option>
              ))}
            </select>

            <select
              value={stage ?? ""}
              onChange={(event) =>
                updateFilters({
                  stage:
                    event.target.value ||
                    undefined,
                })
              }
              className="min-h-11 rounded-[14px] border border-white/10 bg-[#05090b] px-4 text-sm text-white outline-none focus:border-[#C6FF32]/40"
            >
              <option value="">
                All stages
              </option>

              {Object.entries(
                stageLabels,
              ).map(([value, label]) => (
                <option
                  key={value}
                  value={value}
                >
                  {label}
                </option>
              ))}
            </select>

            <select
              value={featured ?? ""}
              onChange={(event) =>
                updateFilters({
                  featured:
                    event.target.value ||
                    undefined,
                })
              }
              className="min-h-11 rounded-[14px] border border-white/10 bg-[#05090b] px-4 text-sm text-white outline-none focus:border-[#C6FF32]/40"
            >
              <option value="">
                All companies
              </option>

              <option value="true">
                Featured only
              </option>

              <option value="false">
                Not featured
              </option>
            </select>

            <select
              value={active ?? ""}
              onChange={(event) =>
                updateFilters({
                  active:
                    event.target.value ||
                    undefined,
                })
              }
              className="min-h-11 rounded-[14px] border border-white/10 bg-[#05090b] px-4 text-sm text-white outline-none focus:border-[#C6FF32]/40"
            >
              <option value="">
                Active and inactive
              </option>

              <option value="true">
                Active only
              </option>

              <option value="false">
                Inactive only
              </option>
            </select>
          </div>
        </div>

        {hasFilters && (
          <div className="mt-4 flex items-center justify-between gap-4 border-t border-white/[0.07] pt-4">
            <p className="text-sm text-white/30">
              {companies.length} of{" "}
              {pagination.total} companies
            </p>

            <button
              type="button"
              onClick={clearFilters}
              className="text-sm font-bold text-white/40 transition hover:text-white"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-6 rounded-[16px] border border-red-400/20 bg-red-400/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      )}

      <div className="mt-8">
        {companies.length === 0 ? (
          <div className="rounded-[24px] border border-dashed border-white/10 bg-white/[0.02] px-6 py-16 text-center">
            <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-[#C6FF32]/10 text-[#C6FF32]">
              <Plus className="h-6 w-6" />
            </div>

            <h2 className="mt-5 text-xl font-black text-white">
              {pagination.total === 0 &&
              !hasFilters
                ? "No companies yet"
                : "No matching companies"}
            </h2>

            <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-white/35">
              {pagination.total === 0 &&
              !hasFilters
                ? "Create your first company and start tracking its products, markets, founders and progress."
                : "Try changing your search or filters."}
            </p>

            {pagination.total === 0 &&
            !hasFilters ? (
              <Link
                href="/admin/companies/new"
                className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] bg-[#C6FF32] px-5 text-sm font-black text-[#030608]"
              >
                <Plus className="h-4 w-4" />
                Create company
              </Link>
            ) : (
              <button
                type="button"
                onClick={clearFilters}
                className="mt-6 min-h-11 rounded-[14px] border border-white/10 px-5 text-sm font-bold text-white/60 transition hover:border-white/20 hover:text-white"
              >
                Clear filters
              </button>
            )}
          </div>
        ) : (
          <CompanyTable
            companies={companies}
            pagination={pagination}
          />
        )}
      </div>
    </div>
  );
}