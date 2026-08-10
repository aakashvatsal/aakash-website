export interface AdminDashboardStats {
  companies: {
    total: number;
    active: number;
  };

  journal: {
    total: number;
    published: number;
    drafts: number;
  };

  library: {
    total: number;
    reading: number;
    completed: number;
  };

  health: {
    total: number;
    workouts: number;
  };

  media: {
    total: number;
    published: number;
    scheduled: number;
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
    | "now";
  createdAt: string;
  href: string;
}

export interface AdminDashboardData {
  stats: AdminDashboardStats;
  recentActivity: AdminDashboardActivity[];
  publishingProgress: number;
}