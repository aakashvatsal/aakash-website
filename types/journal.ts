export type JournalEntryType =
  | "daily"
  | "reflection"
  | "decision"
  | "idea"
  | "gratitude"
  | "lesson"
  | "meeting_note";

export type JournalMood =
  | "focused"
  | "calm"
  | "creative"
  | "happy"
  | "energetic"
  | "neutral"
  | "tired"
  | "stressed"
  | "anxious"
  | "low";

export type JournalVisibility =
  | "private"
  | "shared"
  | "public";

export type JournalSource =
  | "manual"
  | "hsakaa"
  | "system"
  | "imported"
  | "other";

export interface JournalWorkout {
  completed: boolean;
  type?: string;
  title?: string;
  durationMinutes?: number;
  strainScore?: number;
  notes?: string;
}

export interface JournalReading {
  completed: boolean;
  libraryItemId?: string;
  title?: string;
  author?: string;
  pagesRead?: number;
  progressPercentage?: number;
  thought?: string;
}

export interface JournalSleep {
  durationHours?: number;
  performancePercentage?: number;
  quality?: number;
  recoveryScore?: number;
}

export interface JournalEntry {
  _id: string;

  date: string;
  dateKey: string;
  slug: string;

  type: JournalEntryType;

  title: string;

  content?: string;
  highlight?: string;

  mood: JournalMood;

  moodScore?: number;

  energyScore?: number;
  productivityScore?: number;
  stressScore?: number;

  tags: string[];

  lessons: string[];
  decisions: string[];
  ideas: string[];
  gratitude: string[];
  challenges: string[];
  wins: string[];

  workout: JournalWorkout;

  reading: JournalReading;

  sleep: JournalSleep;

  steps: number;

  memoryIds?: string[];
  companyIds?: string[];
  libraryItemIds?: string[];

  visibility: JournalVisibility;

  isPublished: boolean;

  publishedAt?: string;

  isFavourite: boolean;

  isArchived: boolean;

  isActive: boolean;

  source: JournalSource;

  sourceExternalId?: string;

  metadata?: Record<
    string,
    unknown
  >;

  createdAt: string;

  updatedAt: string;
}

export interface JournalPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface JournalListResponse {
  data: JournalEntry[];

  pagination: JournalPagination;
}

export interface JournalQuery {
  type?: JournalEntryType;

  mood?: JournalMood;

  visibility?: JournalVisibility;

  source?: JournalSource;

  isPublished?: boolean;

  isFavourite?: boolean;

  isArchived?: boolean;

  isActive?: boolean;

  tag?: string;

  search?: string;

  page?: number;

  limit?: number;
}