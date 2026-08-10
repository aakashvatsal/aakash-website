import type {
  Company,
  CompanyApiResponse,
  CompanyFilters,
  CompanyListApiResponse,
  CreateCompanyPayload,
  UpdateCompanyPayload,
} from "@/types/company";

const API_URL =
  process.env.BACKEND_API_URL ??
  "http://localhost:4000/api/v1";

const ADMIN_API_URL =
  "/api/admin/backend";

function buildQueryString(
  filters: CompanyFilters = {},
): string {
  const searchParams =
    new URLSearchParams();

  if (
    typeof filters.page ===
      "number" &&
    filters.page > 0
  ) {
    searchParams.set(
      "page",
      String(filters.page),
    );
  }

  if (
    typeof filters.limit ===
      "number" &&
    filters.limit > 0
  ) {
    searchParams.set(
      "limit",
      String(filters.limit),
    );
  }

  if (
    filters.search?.trim()
  ) {
    searchParams.set(
      "search",
      filters.search.trim(),
    );
  }

  if (filters.status) {
    searchParams.set(
      "status",
      filters.status,
    );
  }

  if (filters.stage) {
    searchParams.set(
      "stage",
      filters.stage,
    );
  }

  if (
    typeof filters.isFeatured ===
    "boolean"
  ) {
    searchParams.set(
      "isFeatured",
      String(
        filters.isFeatured,
      ),
    );
  }

  if (
    typeof filters.isActive ===
    "boolean"
  ) {
    searchParams.set(
      "isActive",
      String(
        filters.isActive,
      ),
    );
  }

  return searchParams.toString();
}

async function getErrorMessage(
  response: Response,
  fallbackMessage: string,
): Promise<string> {
  try {
    const result =
      (await response.json()) as {
        message?:
          | string
          | string[];

        error?: string;
      };

    if (
      Array.isArray(
        result.message,
      )
    ) {
      return result.message.join(
        ", ",
      );
    }

    return (
      result.message ??
      result.error ??
      fallbackMessage
    );
  } catch {
    return fallbackMessage;
  }
}

export async function getCompanies(
  filters: CompanyFilters = {},
): Promise<CompanyListApiResponse> {
  const normalizedFilters: CompanyFilters =
    {
      page: 1,
      limit: 20,
      ...filters,
    };

  const queryString =
    buildQueryString(
      normalizedFilters,
    );

  const endpoint =
    `${API_URL}/companies${
      queryString
        ? `?${queryString}`
        : ""
    }`;

  const response =
    await fetch(endpoint, {
      method: "GET",

      headers: {
        Accept:
          "application/json",
      },

      cache: "no-store",
    });

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Unable to fetch companies.",
      ),
    );
  }

  const result =
    (await response.json()) as
      CompanyListApiResponse;

  return {
    data: Array.isArray(
      result.data,
    )
      ? result.data
      : [],

    pagination: {
      page:
        result.pagination
          ?.page ??
        normalizedFilters.page ??
        1,

      limit:
        result.pagination
          ?.limit ??
        normalizedFilters.limit ??
        20,

      total:
        result.pagination
          ?.total ?? 0,

      totalPages:
        result.pagination
          ?.totalPages ?? 0,
    },
  };
}

export async function getCompanyById(
  companyId: string,
): Promise<Company> {
  if (!companyId?.trim()) {
    throw new Error(
      "Company ID is required.",
    );
  }

  const response =
    await fetch(
      `${API_URL}/companies/${encodeURIComponent(
        companyId,
      )}`,
      {
        method: "GET",

        headers: {
          Accept:
            "application/json",
        },

        cache: "no-store",
      },
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Unable to fetch company.",
      ),
    );
  }

  const result =
    (await response.json()) as
      | CompanyApiResponse
      | Company;

  if (!result) {
    throw new Error(
      "Invalid company response.",
    );
  }

  if (
    "data" in result &&
    result.data
  ) {
    return result.data;
  }

  return result as Company;
}

export async function createCompany(
  payload: CreateCompanyPayload,
): Promise<Company> {
  const response =
    await fetch(
      `${ADMIN_API_URL}/companies`,
      {
        method: "POST",

        credentials:
          "include",

        headers: {
          Accept:
            "application/json",

          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify(
            payload,
          ),
      },
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Unable to create company.",
      ),
    );
  }

  const result =
    (await response.json()) as
      | CompanyApiResponse
      | Company;

  if (!result) {
    throw new Error(
      "Company was created but the API did not return the company.",
    );
  }

  if (
    "data" in result &&
    result.data
  ) {
    return result.data;
  }

  return result as Company;
}

export async function updateCompany(
  companyId: string,
  payload: UpdateCompanyPayload,
): Promise<Company> {
  if (!companyId?.trim()) {
    throw new Error(
      "Company ID is required.",
    );
  }

  const response =
    await fetch(
      `${ADMIN_API_URL}/companies/${encodeURIComponent(
        companyId,
      )}`,
      {
        method: "PATCH",

        credentials:
          "include",

        headers: {
          Accept:
            "application/json",

          "Content-Type":
            "application/json",
        },

        body:
          JSON.stringify(
            payload,
          ),
      },
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Unable to update company.",
      ),
    );
  }

  const result =
    (await response.json()) as
      | CompanyApiResponse
      | Company;

  if (!result) {
    throw new Error(
      "Company was updated but the API did not return the company.",
    );
  }

  if (
    "data" in result &&
    result.data
  ) {
    return result.data;
  }

  return result as Company;
}

export async function deleteCompany(
  companyId: string,
): Promise<void> {
  if (!companyId?.trim()) {
    throw new Error(
      "Company ID is required.",
    );
  }

  const response =
    await fetch(
      `${ADMIN_API_URL}/companies/${encodeURIComponent(
        companyId,
      )}`,
      {
        method: "DELETE",

        credentials:
          "include",

        headers: {
          Accept:
            "application/json",
        },
      },
    );

  if (!response.ok) {
    throw new Error(
      await getErrorMessage(
        response,
        "Unable to delete company.",
      ),
    );
  }
}