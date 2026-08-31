export type TaskStatus =
  | "inbox"
  | "todo"
  | "in_progress"
  | "waiting"
  | "blocked"
  | "completed"
  | "cancelled";

export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskRecurrenceFrequency = "daily" | "weekly" | "monthly";

export interface TaskRecurrence {
  enabled: boolean;
  frequency?: TaskRecurrenceFrequency;
  interval: number;
  endAt?: string;
}

export interface PersonalTask {
  _id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  area?: string;
  companyId?: string;
  startAt?: string;
  dueAt?: string;
  reminderAt?: string;
  completedAt?: string;
  cancelledAt?: string;
  estimatedMinutes?: number;
  actualMinutes?: number;
  tags: string[];
  recurrence: TaskRecurrence;
  source: "manual" | "hsakaa" | "system" | "integration" | "brain_dump";
  notes?: string;
  isFavourite: boolean;
  isActive: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TaskSummary {
  totalOpen: number;
  inbox: number;
  inProgress: number;
  dueToday: number;
  overdue: number;
  completedToday: number;
  highPriority: number;
  upcoming: PersonalTask[];
}

export interface TaskPayload {
  title: string;
  description?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  area?: string;
  startAt?: string;
  dueAt?: string;
  reminderAt?: string;
  estimatedMinutes?: number;
  actualMinutes?: number;
  tags?: string[];
  recurrence?: Partial<TaskRecurrence>;
  notes?: string;
  isFavourite?: boolean;
}

export type ReminderStatus = "pending" | "snoozed" | "acknowledged" | "dismissed";
export type ReminderSourceType = "task" | "supplement" | "skincare" | "haircare" | "intimate_care";

export interface PersonalReminder {
  _id: string;
  sourceType: ReminderSourceType;
  sourceId: string;
  occurrenceKey: string;
  title: string;
  message?: string;
  scheduledFor: string;
  originalScheduledFor: string;
  status: ReminderStatus;
  snoozedUntil?: string;
  acknowledgedAt?: string;
  dismissedAt?: string;
  sourcePath?: string;
  metadata?: Record<string, unknown>;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ReminderToday {
  date: string;
  due: PersonalReminder[];
  upcoming: PersonalReminder[];
  acknowledged: PersonalReminder[];
}

export interface ReminderSummary {
  date: string;
  dueNow: number;
  overdue: number;
  upcomingToday: number;
  snoozed: number;
  acknowledgedToday: number;
  totalToday: number;
}

export type BrainDumpStatus = "inbox" | "processing" | "processed" | "discarded";
export type BrainDumpSource = "manual" | "hsakaa" | "voice" | "integration";
export type BrainDumpTarget = "task" | "journal" | "memory";

export interface BrainDumpItem {
  _id: string;
  content: string;
  title?: string;
  status: BrainDumpStatus;
  source: BrainDumpSource;
  tags: string[];
  isFavourite: boolean;
  processedAs?: BrainDumpTarget;
  processedEntityId?: string;
  processedAt?: string;
  discardedAt?: string;
  metadata?: Record<string, unknown>;
  isActive: boolean;
  isArchived: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface BrainDumpSummary {
  totalInbox: number;
  capturedToday: number;
  processedToday: number;
  discardedToday: number;
  favouriteInbox: number;
  oldestInboxAt: string | null;
  recentInbox: Array<Pick<BrainDumpItem, "_id" | "title" | "content" | "tags" | "isFavourite" | "createdAt">>;
}

export interface BrainDumpPayload {
  content: string;
  title?: string;
  source?: BrainDumpSource;
  tags?: string[];
  isFavourite?: boolean;
}

export interface BrainDumpProcessPayload {
  target: BrainDumpTarget;
  title?: string;
  tags?: string[];
  priority?: TaskPriority;
  area?: string;
  dueAt?: string;
  journalType?: string;
  memoryType?: string;
  memoryAccessLevel?: string;
  memorySensitivity?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}
