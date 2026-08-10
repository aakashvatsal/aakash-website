import type {
  AdminDashboardData,
} from "@/types/admin-dashboard";

const API_URL =
  process.env.BACKEND_API_URL ??
  "http://localhost:4000/api/v1";

interface ApiResponse<T> {
  statusCode?: number;
  message?: string;
  data: T;
}

export async function getAdminDashboard(): Promise<AdminDashboardData> {
  const response = await fetch(
    `${API_URL}/admin/dashboard`,
    {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      credentials: "include",
      cache: "no-store",
    },
  );

  if (!response.ok) {
    let message =
      "Unable to load the admin dashboard.";

    try {
      const error = await response.json();

      if (typeof error?.message === "string") {
        message = error.message;
      }
    } catch {
      // Keep fallback error.
    }

    throw new Error(message);
  }

  const result =
    (await response.json()) as
      | ApiResponse<AdminDashboardData>
      | AdminDashboardData;

  if (
    "data" in result &&
    result.data
  ) {
    return result.data;
  }

  return result as AdminDashboardData;
}