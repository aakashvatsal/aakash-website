export type PublicHomeResponse = {
  now: {
    building: string;
    reading: string;
    learning: string;
    focus: string;
    updatedAt: string;
  };
  companies: Company[];
  latestJournal: JournalEntry[];
  books: Book[];
  health: HealthSnapshot;
  media: MediaPost[];
};

export type Company = {
  _id: string;
  slug: string;
  name: string;
  category: string;
  headline: string;
  description: string;
  image: string;
  stats: {
    label: string;
    value: string;
  }[];
};

export type JournalEntry = {
  _id: string;
  slug: string;
  date: string;
  title: string;
  image?: string;
  company?: string;
  mood?: string;
  workout?: string;
  reading?: string;
  body: string;
  tags: string[];
};

export type Book = {
  _id: string;
  slug: string;
  title: string;
  author?: string;
  category: string;
  status: "Reading" | "Finished" | "Wishlist";
  progress: number;
  rating?: number;
  note: string;
};

export type HealthSnapshot = {
  training: string;
  steps: number;
  sleepHours: number;
  meditationMinutes: number;
  readingPages: number;
  energy: number;
};

export type MediaPost = {
  _id: string;
  platform: "LinkedIn" | "Instagram" | "YouTube" | "Podcast" | "X";
  title: string;
  url: string;
  publishedAt: string;
};

export type HsakaaChatRequest = {
  mode: string;
  message: string;
};

export type HsakaaChatResponse = {
  answer: string;
};