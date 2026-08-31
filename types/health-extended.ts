export type CareModule = "skincare" | "haircare" | "intimate-care";

export type CareProduct = {
  _id: string;
  name: string;
  brand?: string;
  category: string;
  status: "active" | "paused" | "finished" | "discontinued";
  schedule: {
    frequency?: string;
    timesOfDay?: string[];
    daysOfWeek?: number[];
    intervalDays?: number;
    startDate?: string;
    endDate?: string;
    instructions?: string;
  };
  applicationAreas?: string[];
  activeIngredients?: string[];
  purposes?: string[];
  targetedConcerns?: string[];
  reminderEnabled?: boolean;
  medicallyPrescribed?: boolean;
  notes?: string;
  createdAt?: string;
  updatedAt?: string;
};

export type CareProductPayload = {
  name: string;
  brand?: string;
  category: string;
  status?: "active" | "paused" | "finished" | "discontinued";
  schedule: {
    frequency?: string;
    timesOfDay?: string[];
    daysOfWeek?: number[];
    intervalDays?: number;
    startDate?: string;
    endDate?: string;
    instructions?: string;
  };
  applicationAreas?: string[];
  activeIngredients?: string[];
  purposes?: string[];
  targetedConcerns?: string[];
  reminderEnabled?: boolean;
  medicallyPrescribed?: boolean;
  notes?: string;
};

export type CareRoutineItem = {
  productId: string;
  productName: string;
  category: string;
  timeOfDay: string;
  applicationAreas?: string[];
  status: "pending" | "applied" | "partial" | "missed" | "skipped";
  appliedAt?: string;
  notes?: string;
};

export type CareDailyLog = {
  _id: string;
  date: string;
  routineItems: CareRoutineItem[];
  totalScheduled: number;
  totalApplied: number;
  totalMissed: number;
  totalSkipped: number;
  adherencePercentage: number;
  notes?: string;
};

export type ProductCategory =
  | "skincare"
  | "haircare"
  | "supplement"
  | "medicine"
  | "fitness"
  | "meditation"
  | "personal_care"
  | "food"
  | "electronics"
  | "office"
  | "content_creation"
  | "clothing"
  | "footwear"
  | "home"
  | "other";

export type ProductType = "consumable" | "durable" | "subscription" | "digital";

export type ProductStatus =
  | "want_to_buy"
  | "ordered"
  | "available"
  | "in_use"
  | "low"
  | "finished"
  | "expired"
  | "discontinued"
  | "replaced"
  | "not_suitable"
  | "lost"
  | "damaged";

export type ProductUnit =
  | "ml"
  | "litre"
  | "gram"
  | "kg"
  | "tablet"
  | "capsule"
  | "scoop"
  | "serving"
  | "piece"
  | "pack"
  | "bottle"
  | "tube"
  | "sachet"
  | "unit";

export type PersonalProduct = {
  _id: string;
  name: string;
  brand?: string;
  category: ProductCategory;
  subCategory?: string;
  productType: ProductType;
  status: ProductStatus;
  repurchaseStatus?: "undecided" | "repurchase" | "do_not_repurchase" | "find_alternative";
  usage?: {
    initialQuantity?: number;
    remainingQuantity?: number;
    remainingPercentage?: number;
    unit?: ProductUnit;
    estimatedFinishAt?: string;
  };
  expiresAt?: string;
  tags?: string[];
  notes?: string;
  isFavourite?: boolean;
  isArchived?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type ProductPayload = {
  name: string;
  brand?: string;
  category: ProductCategory;
  productType?: ProductType;
  status?: ProductStatus;
  usage?: {
    initialQuantity?: number;
    remainingQuantity?: number;
    unit?: ProductUnit;
  };
  expiresAt?: string;
  tags?: string[];
  notes?: string;
};

export type ProductListResponse = {
  data: PersonalProduct[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
};

export type HealthReportType = "weekly" | "fortnightly" | "monthly" | "quarterly" | "custom";
export type HealthTrend = "improving" | "stable" | "declining" | "insufficient_data";

export type HealthRecommendation = {
  title: string;
  recommendation: string;
  priority: "low" | "medium" | "high" | "urgent";
  reason?: string;
  actionPlan?: string;
  expectedBenefit?: string;
  completed: boolean;
  completedAt?: string;
  result?: string;
};

export type HealthReport = {
  _id: string;
  reportType: HealthReportType;
  periodStart: string;
  periodEnd: string;
  title: string;
  executiveSummary?: string;
  overallTrend: HealthTrend;
  overallHealthScore?: number;
  sections?: Array<{
    category: string;
    summary?: string;
    trend: HealthTrend;
    positives?: string[];
    concerns?: string[];
    metrics?: Array<{
      metric: string;
      averageValue?: string | number;
      unit?: string;
      trend: HealthTrend;
      interpretation?: string;
    }>;
  }>;
  recommendations: HealthRecommendation[];
  achievements?: string[];
  risks?: string[];
  missingData?: string[];
  nextPeriodFocus?: string;
  status?: "draft" | "completed" | "reviewed";
  medicalReviewRecommended?: boolean;
  medicalReviewReason?: string;
  createdAt?: string;
};

export type IntegrationProviderStatus = {
  configured?: boolean;
  enabled?: boolean;
  connected?: boolean;
  status?: string;
  message?: string;
  reason?: string;
  [key: string]: unknown;
};

export type IntegrationsOverview = {
  generatedAt?: string;
  health?: {
    whoop?: IntegrationProviderStatus | Record<string, unknown>;
  };
  mediaAnalytics?: Record<string, IntegrationProviderStatus | boolean | string | undefined>;
};
