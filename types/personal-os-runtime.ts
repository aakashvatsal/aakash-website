export type PersonalOsRuntimeStageStatus =
  | "completed"
  | "skipped"
  | "warning"
  | "failed";

export type PersonalOsRuntimeStage = {
  id: string;
  label: string;
  status: PersonalOsRuntimeStageStatus;
  startedAt: string;
  completedAt: string;
  durationMs: number;
  changed: boolean;
  changeCount: number;
  message: string;
  metadata: Record<string, unknown>;
};

export type PersonalOsRuntimeRun = {
  _id?: string;
  runId: string;
  mode: "manual";
  status: "running" | "completed" | "partial" | "failed";
  requestedAt: string;
  startedAt: string;
  completedAt?: string;
  options: {
    syncWhoop: boolean;
    allowHealthAdaptation: boolean;
    allowAi: boolean;
    maxEmbeddings: number;
  };
  stages: PersonalOsRuntimeStage[];
  summary: {
    completed?: number;
    skipped?: number;
    warnings?: number;
    failures?: number;
    meaningfulChanges?: number;
    durationMs?: number;
  };
  error?: string;
};

export type PersonalOsRuntimeStatus = {
  automationEnabled: boolean;
  disabledCronJobs: string[];
  mode: "manual" | "scheduled";
  timezone: string;
  enableInstruction: string;
  running: boolean;
  activeRun: {
    acquiredAt: string;
    expiresAt: string;
  } | null;
  latestRun: PersonalOsRuntimeRun | null;
  defaults: {
    syncWhoop: boolean;
    allowHealthAdaptation: boolean;
    allowAi: boolean;
    maxEmbeddings: number;
  };
  safeguards: string[];
  generatedAt: string;
};

export type RunPersonalOsInput = {
  syncWhoop: boolean;
  allowHealthAdaptation: boolean;
  allowAi: boolean;
  maxEmbeddings: number;
};

export type RunPersonalOsResponse = {
  started: boolean;
  skipped?: boolean;
  reason?: string;
  run?: PersonalOsRuntimeRun | null;
  status?: PersonalOsRuntimeStatus;
};

export type PersonalOsMorningRun = {
  _id?: string;
  runId: string;
  mode: "morning_manual";
  status: "running" | "completed" | "partial" | "failed";
  requestedAt: string;
  startedAt: string;
  completedAt?: string;
  options: RunPersonalOsMorningInput;
  stages: PersonalOsRuntimeStage[];
  snapshot: {
    runtime?: Record<string, unknown>;
    health?: Record<string, unknown>;
    reminders?: { due?: number; upcoming?: number };
    proactive?: {
      totalOpen?: number;
      highPriority?: number;
      activeNow?: number;
    };
    brief?: Record<string, unknown>;
    package?: {
      dateKey?: string | null;
      planReady?: boolean;
      healthTasks?: number;
      healthAttention?: number;
      dueReminders?: number;
      proactiveHighPriority?: number;
      headline?: string | null;
      taskCompletionPercentage?: number;
    };
  };
  summary: PersonalOsRuntimeRun["summary"];
  error?: string;
};

export type RunPersonalOsMorningInput = {
  syncWhoop: boolean;
  allowHealthAdaptation: boolean;
  allowAi: boolean;
  forceBrief: boolean;
  maxEmbeddings: number;
};

export type PersonalOsMorningStatus = {
  running: boolean;
  activeRun: {
    acquiredAt: string;
    expiresAt: string;
  } | null;
  latestRun: PersonalOsMorningRun | null;
  automationEnabled: boolean;
  mode: "manual";
  defaults: RunPersonalOsMorningInput;
  safeguards: string[];
  generatedAt: string;
};

export type RunPersonalOsMorningResponse = {
  started: boolean;
  skipped?: boolean;
  reason?: string;
  run?: PersonalOsMorningRun | null;
  status?: PersonalOsMorningStatus;
};
