import { CompanyList } from "@/components/admin/companies/CompanyList";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { getCompanies } from "@/lib/api/companies";

import type {
  Company,
  CompanyPagination,
  CompanyStage,
  CompanyStatus,
} from "@/types/company";

export const dynamic = "force-dynamic";

interface CompaniesPageProps {
  searchParams: Promise<{
    search?: string;
    status?: string;
    stage?: string;
    featured?: string;
    active?: string;
    page?: string;
  }>;
}

const companyStatuses: CompanyStatus[] = [
  "idea",
  "building",
  "active",
  "paused",
  "acquired",
  "closed",
];

const companyStages: CompanyStage[] = [
  "idea",
  "pre_seed",
  "seed",
  "early_stage",
  "growth",
  "mature",
];

function isCompanyStatus(
  value?: string,
): value is CompanyStatus {
  return companyStatuses.includes(
    value as CompanyStatus,
  );
}

function isCompanyStage(
  value?: string,
): value is CompanyStage {
  return companyStages.includes(
    value as CompanyStage,
  );
}

function parseBooleanFilter(
  value?: string,
): boolean | undefined {
  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  return undefined;
}

export default async function CompaniesPage({
  searchParams,
}: CompaniesPageProps) {
  const params = await searchParams;

  const page = Math.max(
    Number(params.page) || 1,
    1,
  );

  let companies: Company[] = [];
  let statsCompanies: Company[] = [];
  let totalCompanies = 0;
  let error = "";

  let pagination: CompanyPagination = {
    page,
    limit: 24,
    total: 0,
    totalPages: 0,
  };

  try {
    const [
      companiesResponse,
      statsResponse,
    ] = await Promise.all([
      getCompanies({
        search: params.search,

        status: isCompanyStatus(
          params.status,
        )
          ? params.status
          : undefined,

        stage: isCompanyStage(params.stage)
          ? params.stage
          : undefined,

        isFeatured: parseBooleanFilter(
          params.featured,
        ),

        isActive: parseBooleanFilter(
          params.active,
        ),

        page,
        limit: 24,
      }),

      getCompanies({
        page: 1,
        limit: 100,
      }),
    ]);

    companies =
      companiesResponse.data ?? [];

    statsCompanies =
      statsResponse.data ?? [];

    pagination =
      companiesResponse.pagination ??
      pagination;

    totalCompanies =
      statsResponse.pagination?.total ??
      statsCompanies.length;
  } catch (caughtError) {
    error =
      caughtError instanceof Error
        ? caughtError.message
        : "Unable to load companies.";
  }

  return (
  <div>
    <AdminPageHeader
      eyebrow="Venture operating system"
      title="Companies"
      description="Track every company, product, market, founder and stage of development."
      // actions={
      //   <Link
      //     href="/admin/companies/new"
      //     className="inline-flex min-h-11 items-center justify-center gap-2 rounded-[14px] bg-[#C6FF32] px-5 text-sm font-black text-[#030608] transition hover:brightness-95"
      //   >
      //     <Plus className="h-4 w-4" />
      //     New company
      //   </Link>
      // }
    />

    {error ? (
      <div className="mt-8 rounded-[20px] border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm text-red-300">
        {error}
      </div>
    ) : (
      <div className="mt-8">
        <CompanyList
          companies={companies}
          statsCompanies={statsCompanies}
          totalCompanies={totalCompanies}
          pagination={pagination}
          search={params.search}
          status={params.status}
          stage={params.stage}
          featured={params.featured}
          active={params.active}
        />
      </div>
    )}
  </div>
);
}