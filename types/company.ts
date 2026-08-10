export type CompanyStatus =
  | "idea"
  | "building"
  | "active"
  | "paused"
  | "acquired"
  | "closed";

export type CompanyRole =
  | "founder"
  | "co_founder"
  | "ceo"
  | "cto"
  | "advisor"
  | "investor"
  | "employee";

export type CompanyStage =
  | "idea"
  | "pre_seed"
  | "seed"
  | "early_stage"
  | "growth"
  | "mature";

export type CreateCompanyPayload = Omit<
  Company,
  | "_id"
  | "userId"
  | "createdAt"
  | "updatedAt"
>;

export interface CompanyLink {
  label: string;
  url: string;
}

export interface CompanyMetric {
  key: string;
  label: string;
  value: string | number | boolean;
  unit?: string;
  measuredAt?: string;
}

export interface CompanyGoal {
  title: string;
  description?: string;
  progressPercentage: number;
  targetDate?: string;
  completed: boolean;
}

export interface CompanyFounder {
  name: string;
  email?: string;
  designation?: string;
  isPrimary: boolean;
}

export interface Company {
  _id: string;

  userId: string;

  name: string;
  slug: string;

  legalName?: string;
  tagline?: string;
  description?: string;

  status: CompanyStatus;
  stage: CompanyStage;

  roles: CompanyRole[];

  industries: string[];
  products: string[];
  markets: string[];

  headquarters?: string;
  website?: string;

  logoUrl?: string;
  coverImageUrl?: string;

  founders: CompanyFounder[];
  links: CompanyLink[];
  metrics: CompanyMetric[];
  goals: CompanyGoal[];

  principles: string[];
  currentPriorities: string[];
  challenges: string[];

  currentFocus?: string;
  businessModel?: string;
  targetCustomer?: string;

  metadata: Record<string, unknown>;

  foundedAt?: string;
  lastReviewedAt?: string;

  isFeatured: boolean;
  isArchived: boolean;
  isActive: boolean;

  createdAt: string;
  updatedAt: string;
}

export interface CompanyListResponse {
  data: Company[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface CompanyResponse {
  data: Company;
}

export interface CompanyFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: CompanyStatus;
  stage?: CompanyStage;
}

export type UpdateCompanyPayload =
  Partial<CreateCompanyPayload>;

export interface CompanyApiResponse {
  data: Company;
  message?: string;
  status?: number;
  statusCode?: number;
}

export interface CompanyListApiResponse {
  data: Company[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  message?: string;
  status?: number;
  statusCode?: number;
}

export interface CompanyPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface CompanyFilters {
  page?: number;
  limit?: number;
  search?: string;
  status?: CompanyStatus;
  stage?: CompanyStage;
  isFeatured?: boolean;
  isActive?: boolean;
}