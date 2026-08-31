import { getAdminBackendHeaders } from "@/lib/api/admin-backend-headers";
import type {
  CareDailyLog,
  CareModule,
  CareProduct,
  CareProductPayload,
  HealthReport,
  HealthReportType,
  IntegrationsOverview,
  PersonalProduct,
  ProductListResponse,
  ProductPayload,
  ProductStatus,
} from "@/types/health-extended";

const API_URL = process.env.BACKEND_API_URL ?? "http://localhost:4000/api/v1";
const ADMIN_API_URL = "/api/admin/backend";

type ApiError = { message?: string | string[]; error?: string };

async function readResponse<T>(response: Response, fallback: string): Promise<T> {
  let payload: T | ApiError | null = null;
  try {
    payload = await response.json();
  } catch {
    payload = null;
  }
  if (!response.ok) {
    const apiError = payload as ApiError | null;
    const message = Array.isArray(apiError?.message)
      ? apiError.message.join(", ")
      : apiError?.message ?? apiError?.error ?? fallback;
    throw new Error(message);
  }
  return payload as T;
}

function adminFetch(path: string, init: RequestInit = {}) {
  return fetch(`${ADMIN_API_URL}${path}`, {
    ...init,
    credentials: "include",
    headers: {
      ...(init.body ? { "Content-Type": "application/json" } : {}),
      ...(init.headers ?? {}),
    },
  });
}

export async function getCareProducts(module: CareModule): Promise<CareProduct[]> {
  return readResponse(
    await fetch(`${API_URL}/${module}/products`, { cache: "no-store", headers: getAdminBackendHeaders() }),
    `Unable to load ${module} products.`,
  );
}

export async function getCareDailyLog(module: CareModule, date: string): Promise<CareDailyLog | null> {
  const response = await fetch(`${API_URL}/${module}/logs/daily?date=${encodeURIComponent(date)}`, {
    cache: "no-store",
    headers: getAdminBackendHeaders(),
  });
  if (response.status === 404) return null;
  return readResponse(response, `Unable to load ${module} daily log.`);
}

export async function createCareProduct(module: CareModule, payload: CareProductPayload): Promise<CareProduct> {
  return readResponse(
    await adminFetch(`/${module}/products`, { method: "POST", body: JSON.stringify(payload) }),
    `Unable to create ${module} product.`,
  );
}

export async function updateCareProduct(module: CareModule, productId: string, payload: Partial<CareProductPayload>): Promise<CareProduct> {
  return readResponse(
    await adminFetch(`/${module}/products/${encodeURIComponent(productId)}`, { method: "PATCH", body: JSON.stringify(payload) }),
    `Unable to update ${module} product.`,
  );
}

export async function deleteCareProduct(module: CareModule, productId: string): Promise<void> {
  await readResponse(
    await adminFetch(`/${module}/products/${encodeURIComponent(productId)}`, { method: "DELETE" }),
    `Unable to delete ${module} product.`,
  );
}

export async function generateCareDailyLog(module: CareModule, date: string): Promise<CareDailyLog> {
  return readResponse(
    await adminFetch(`/${module}/logs/generate`, { method: "POST", body: JSON.stringify({ date }) }),
    `Unable to generate ${module} daily log.`,
  );
}

export async function updateCareRoutineItem(
  module: CareModule,
  logId: string,
  itemIndex: number,
  status: "pending" | "applied" | "partial" | "missed" | "skipped",
): Promise<CareDailyLog> {
  return readResponse(
    await adminFetch(`/${module}/logs/${encodeURIComponent(logId)}/items/${itemIndex}`, {
      method: "PATCH",
      body: JSON.stringify({
        status,
        ...(status === "applied" ? { appliedAt: new Date().toISOString() } : {}),
      }),
    }),
    `Unable to update ${module} routine item.`,
  );
}

export async function getProducts(): Promise<ProductListResponse> {
  return readResponse(
    await fetch(`${API_URL}/products?limit=100`, { cache: "no-store", headers: getAdminBackendHeaders() }),
    "Unable to load products.",
  );
}

export async function createProduct(payload: ProductPayload): Promise<PersonalProduct> {
  return readResponse(
    await adminFetch("/products", { method: "POST", body: JSON.stringify(payload) }),
    "Unable to create product.",
  );
}

export async function updateProduct(productId: string, payload: Partial<ProductPayload>): Promise<PersonalProduct> {
  return readResponse(
    await adminFetch(`/products/${encodeURIComponent(productId)}`, { method: "PATCH", body: JSON.stringify(payload) }),
    "Unable to update product.",
  );
}

export async function setProductStatus(productId: string, status: ProductStatus): Promise<PersonalProduct> {
  return readResponse(
    await adminFetch(`/products/${encodeURIComponent(productId)}/status`, {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
    "Unable to update product status.",
  );
}

export async function consumeProduct(productId: string, quantityUsed: number): Promise<PersonalProduct> {
  return readResponse(
    await adminFetch(`/products/${encodeURIComponent(productId)}/consume`, {
      method: "PATCH",
      body: JSON.stringify({ quantityUsed }),
    }),
    "Unable to update product usage.",
  );
}

export async function toggleProductFavourite(productId: string): Promise<PersonalProduct> {
  return readResponse(
    await adminFetch(`/products/${encodeURIComponent(productId)}/favourite/toggle`, { method: "PATCH" }),
    "Unable to update favourite.",
  );
}

export async function archiveProduct(productId: string): Promise<PersonalProduct> {
  return readResponse(
    await adminFetch(`/products/${encodeURIComponent(productId)}/archive`, { method: "PATCH" }),
    "Unable to archive product.",
  );
}

export async function deleteProduct(productId: string): Promise<void> {
  await readResponse(
    await adminFetch(`/products/${encodeURIComponent(productId)}`, { method: "DELETE" }),
    "Unable to delete product.",
  );
}

export async function getHealthReports(): Promise<HealthReport[]> {
  return readResponse(
    await fetch(`${API_URL}/health-reports`, { cache: "no-store", headers: getAdminBackendHeaders() }),
    "Unable to load health reports.",
  );
}

export async function generateHealthReport(payload: {
  reportType: HealthReportType;
  periodStart: string;
  periodEnd: string;
}): Promise<HealthReport> {
  return readResponse(
    await adminFetch("/health-reports/generate", { method: "POST", body: JSON.stringify(payload) }),
    "Unable to generate health report.",
  );
}

export async function updateHealthReportRecommendation(
  reportId: string,
  recommendationIndex: number,
  completed: boolean,
  result?: string,
): Promise<HealthReport> {
  return readResponse(
    await adminFetch(`/health-reports/${encodeURIComponent(reportId)}/recommendations/${recommendationIndex}`, {
      method: "PATCH",
      body: JSON.stringify({
        completed,
        ...(completed ? { completedAt: new Date().toISOString() } : {}),
        ...(result?.trim() ? { result: result.trim() } : {}),
      }),
    }),
    "Unable to update health recommendation.",
  );
}

export async function deleteHealthReport(reportId: string): Promise<void> {
  await readResponse(
    await adminFetch(`/health-reports/${encodeURIComponent(reportId)}`, { method: "DELETE" }),
    "Unable to delete health report.",
  );
}

export async function getIntegrationsOverview(): Promise<IntegrationsOverview> {
  return readResponse(
    await fetch(`${API_URL}/integrations/overview`, { cache: "no-store", headers: getAdminBackendHeaders() }),
    "Unable to load integrations status.",
  );
}
