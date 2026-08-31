export type DietPreference =
  | "vegetarian"
  | "non_vegetarian"
  | "vegan"
  | "eggetarian"
  | "pescatarian"
  | "flexitarian";

export type DietGoal =
  | "fat_loss"
  | "muscle_gain"
  | "maintenance"
  | "performance"
  | "recovery"
  | "general_health";

export type MealType =
  | "early_morning"
  | "breakfast"
  | "mid_morning"
  | "lunch"
  | "evening_snack"
  | "pre_workout"
  | "post_workout"
  | "dinner"
  | "bedtime"
  | "other";

export type MealStatus =
  | "planned"
  | "completed"
  | "partial"
  | "skipped"
  | "replaced";

export type NutritionValues = {
  calories?: number;
  proteinGrams?: number;
  carbohydratesGrams?: number;
  fatGrams?: number;
  fibreGrams?: number;
  sugarGrams?: number;
  sodiumMg?: number;
};

export type DietFoodItem = {
  name: string;
  quantity: number;
  unit: string;
  nutrition?: NutritionValues;
};

export type DietMeal = {
  type: MealType;
  title?: string;
  plannedAt?: string;
  consumedAt?: string;
  status: MealStatus;
  plannedItems?: DietFoodItem[];
  consumedItems?: DietFoodItem[];
  plannedNutrition?: NutritionValues;
  actualNutrition?: NutritionValues;
  completionPercentage?: number;
  skipReason?: string;
  replacementReason?: string;
  notes?: string;
};

export type DietEntry = {
  _id: string;
  date: string;
  preference?: DietPreference;
  targets?: {
    goal?: DietGoal;
    nutrition?: NutritionValues;
    waterLitres?: number;
    mealsCount?: number;
    fruitServings?: number;
    vegetableServings?: number;
  };
  actuals?: {
    nutrition?: NutritionValues;
    waterLitres?: number;
    mealsCompleted?: number;
    mealsSkipped?: number;
  };
  meals: DietMeal[];
  adherence?: {
    calorieTargetPercentage?: number;
    proteinTargetPercentage?: number;
    hydrationTargetPercentage?: number;
    mealPlanCompletionPercentage?: number;
    overallPercentage?: number;
    followedMealPlan?: boolean;
  };
  notes?: string;
  isActive?: boolean;
  isArchived?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type DietEntryPayload = {
  date: string;
  preference?: DietPreference;
  targets?: {
    goal?: DietGoal;
    nutrition?: NutritionValues;
    waterLitres?: number;
    mealsCount?: number;
  };
  meals?: Array<{
    type: MealType;
    title?: string;
    plannedAt?: string;
    consumedAt?: string;
    status?: MealStatus;
    plannedItems?: DietFoodItem[];
    consumedItems?: DietFoodItem[];
    completionPercentage?: number;
    skipReason?: string;
    replacementReason?: string;
    notes?: string;
  }>;
  notes?: string;
};

export type SupplementStatus =
  | "active"
  | "paused"
  | "completed"
  | "stopped";

export type SupplementFrequency =
  | "daily"
  | "alternate_days"
  | "weekly"
  | "custom"
  | "as_needed";

export type SupplementTimingRelation =
  | "before_meal"
  | "with_meal"
  | "after_meal"
  | "empty_stomach"
  | "before_workout"
  | "after_workout"
  | "before_sleep"
  | "anytime";

export type DayOfWeek =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type Supplement = {
  _id: string;
  name: string;
  brand?: string;
  category?: string;
  form?: string;
  dose: {
    amount: number;
    unit: string;
    quantity?: number;
  };
  schedule: {
    frequency: SupplementFrequency;
    daysOfWeek?: DayOfWeek[];
    times?: string[];
    timingRelation?: SupplementTimingRelation;
    intervalDays?: number;
    startDate?: string;
    endDate?: string;
    customInstructions?: string;
  };
  status: SupplementStatus;
  purposes?: string[];
  prescribedBy?: string;
  medicallyPrescribed?: boolean;
  linkedHealthGoals?: string[];
  warnings?: string[];
  knownInteractions?: string[];
  notes?: string;
  reminderEnabled?: boolean;
  stockQuantity?: number;
  lowStockThreshold?: number;
  stockUnit?: string;
  isActive?: boolean;
  isArchived?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type SupplementPayload = {
  name: string;
  brand?: string;
  category?: string;
  form?: string;
  dose: {
    amount: number;
    unit: string;
    quantity?: number;
  };
  schedule: {
    frequency?: SupplementFrequency;
    daysOfWeek?: DayOfWeek[];
    times?: string[];
    timingRelation?: SupplementTimingRelation;
    intervalDays?: number;
    startDate?: string;
    endDate?: string;
    customInstructions?: string;
  };
  status?: SupplementStatus;
  purposes?: string[];
  notes?: string;
  reminderEnabled?: boolean;
  stockQuantity?: number;
  lowStockThreshold?: number;
  stockUnit?: string;
};

export type SupplementLogStatus =
  | "pending"
  | "taken"
  | "missed"
  | "skipped"
  | "partial";

export type DailySupplementItem = {
  supplementId: string;
  supplementName: string;
  scheduledTime: string;
  status: SupplementLogStatus;
  plannedAmount?: number;
  actualAmount?: number;
  unit?: string;
  takenAt?: string;
  skipReason?: string;
  notes?: string;
};

export type DailySupplementLog = {
  _id: string;
  date: string;
  supplements: DailySupplementItem[];
  totalScheduled: number;
  totalTaken: number;
  totalMissed: number;
  totalSkipped: number;
  adherencePercentage: number;
  notes?: string;
};

export type MeditationType =
  | "mindfulness"
  | "breathing"
  | "body_scan"
  | "guided"
  | "mantra"
  | "visualization"
  | "loving_kindness"
  | "walking"
  | "sleep"
  | "sound"
  | "prayer"
  | "other";

export type MeditationStatus =
  | "planned"
  | "in_progress"
  | "paused"
  | "completed"
  | "skipped"
  | "abandoned";

export type MeditationPosition =
  | "sitting"
  | "lying"
  | "standing"
  | "walking"
  | "other";

export type MeditationEnvironment =
  | "indoor"
  | "outdoor"
  | "office"
  | "home"
  | "travel"
  | "other";

export type MeditationMood =
  | "very_calm"
  | "calm"
  | "neutral"
  | "restless"
  | "stressed"
  | "anxious"
  | "low"
  | "energetic";

export type MeditationEntry = {
  _id: string;
  date: string;
  title: string;
  type: MeditationType;
  status: MeditationStatus;
  position: MeditationPosition;
  environment?: MeditationEnvironment;
  plannedDurationMinutes: number;
  actualDurationMinutes: number;
  scheduledAt?: string;
  startedAt?: string;
  completedAt?: string;
  technique?: string;
  guideName?: string;
  appName?: string;
  focusScore?: number;
  calmnessBefore?: number;
  calmnessAfter?: number;
  stressBefore?: number;
  stressAfter?: number;
  energyBefore?: number;
  energyAfter?: number;
  satisfactionScore?: number;
  moodBefore?: MeditationMood;
  moodAfter?: MeditationMood;
  distractionsCount?: number;
  insights?: string[];
  intentions?: string[];
  benefits?: string[];
  tags?: string[];
  notes?: string;
  isFavourite?: boolean;
  isArchived?: boolean;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type MeditationPayload = {
  date: string;
  title: string;
  type?: MeditationType;
  status?: MeditationStatus;
  position?: MeditationPosition;
  environment?: MeditationEnvironment;
  plannedDurationMinutes?: number;
  actualDurationMinutes?: number;
  technique?: string;
  guideName?: string;
  appName?: string;
  focusScore?: number;
  calmnessBefore?: number;
  calmnessAfter?: number;
  stressBefore?: number;
  stressAfter?: number;
  satisfactionScore?: number;
  moodBefore?: MeditationMood;
  moodAfter?: MeditationMood;
  insights?: string[];
  intentions?: string[];
  benefits?: string[];
  tags?: string[];
  notes?: string;
  isFavourite?: boolean;
};

export type MeditationSummary = {
  totalSessions: number;
  completedSessions: number;
  skippedSessions: number;
  abandonedSessions: number;
  completionRate: number;
  totalMeditationMinutes: number;
  averageDurationMinutes: number;
  averageFocusScore: number;
  averageSatisfactionScore: number;
  calmnessImprovement: number;
  stressReduction: number;
  energyImprovement: number;
  totalInsights: number;
  totalDistractions: number;
};
