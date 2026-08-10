export enum LibraryItemType {
  BOOK = "book",
  ARTICLE = "article",
  PAPER = "paper",
  PODCAST = "podcast",
  VIDEO = "video",
  COURSE = "course",
  NOTE = "note",
}

export enum LibraryItemStatus {
  WANT_TO_READ = "want_to_read",
  READING = "reading",
  PAUSED = "paused",
  COMPLETED = "completed",
  DROPPED = "dropped",
}

export type LibraryItem = {
  _id: string;
  userId: string;
  title: string;
  subtitle?: string;
  type: LibraryItemType;
  status: LibraryItemStatus;
  author?: string;
  publisher?: string;
  category?: string;
  tags: string[];
  coverImageUrl?: string;
  sourceUrl?: string;
  progressPercentage: number;
  currentPage: number;
  totalPages: number;
  rating?: number;
  summary?: string;
  notes?: string;
  keyTakeaways: string[];
  quotes: string[];
  startedAt?: string;
  completedAt?: string;
  lastReadAt?: string;
  isFavourite: boolean;
  isArchived: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type LibraryItemPayload = {
  title: string;
  subtitle?: string;
  type: LibraryItemType;
  status: LibraryItemStatus;
  author?: string;
  publisher?: string;
  category?: string;
  tags: string[];
  coverImageUrl?: string;
  sourceUrl?: string;
  progressPercentage: number;
  currentPage: number;
  totalPages: number;
  rating?: number;
  summary?: string;
  notes?: string;
  keyTakeaways: string[];
  quotes: string[];
  startedAt?: string;
  completedAt?: string;
  lastReadAt?: string;
  isFavourite: boolean;
  isArchived: boolean;
  isActive: boolean;
};

export type LibraryListResponse = {
  status: number;
  message: string;
  data: LibraryItem[];
};