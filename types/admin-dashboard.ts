export interface AdminDashboardStats {
  companies: { total: number; active: number };
  journal: { total: number; published: number; drafts: number };
  library: { total: number; reading: number; completed: number };
  health: { total: number; workouts: number };
  media: { total: number; published: number; scheduled: number };
  tasks: {
    totalOpen: number;
    inbox: number;
    inProgress: number;
    dueToday: number;
    overdue: number;
    completedToday: number;
    highPriority: number;
  };
  reminders: {
    dueNow: number;
    overdue: number;
    upcomingToday: number;
    snoozed: number;
    acknowledgedToday: number;
  };
  brainDump: {
    inbox: number;
    capturedToday: number;
    processedToday: number;
    favouriteInbox: number;
  };
  meditation: {
    sessionsThisWeek: number;
    completedThisWeek: number;
    minutesThisWeek: number;
    completionRate: number;
  };
}

export interface AdminDashboardActivity {
  id: string;
  title: string;
  module:
    | "companies"
    | "journal"
    | "library"
    | "health"
    | "media"
    | "now"
    | "tasks"
    | "meditation"
    | "brainDump";
  createdAt: string;
  href: string;
  personalHref?: string;
}

export interface AdminDashboardToday {
  date: string;
  tasks: {
    dueToday: number;
    overdue: number;
    completedToday: number;
    upcoming: unknown[];
  };
  reminders: {
    dueNow: number;
    overdue: number;
    upcomingToday: number;
    snoozed: number;
  };
  currentFocus: unknown | null;
  latestHealth: {
    id: string;
    date: string;
    steps: number | null;
    weightKg: number | null;
    sleepHours: number | null;
    sleepScore: number | null;
    recoveryScore: number | null;
    workouts: number;
  } | null;
  brainDump: {
    inbox: number;
    capturedToday: number;
    recentInbox: unknown[];
  };
  meditation: {
    weekStart: string;
    totalSessions: number;
    completedSessions: number;
    minutes: number;
  };
}

export interface AdminDashboardData {
  generatedAt?: string;
  timezone?: string;
  stats: AdminDashboardStats;
  today: AdminDashboardToday;
  recentActivity: AdminDashboardActivity[];
  publishingProgress: number;
}
