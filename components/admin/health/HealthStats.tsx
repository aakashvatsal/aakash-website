"use client";

import {
  Activity,
  Dumbbell,
  Footprints,
  HeartPulse,
  Moon,
  TrendingUp,
} from "lucide-react";

import { AdminStatCard } from "@/components/admin/AdminStatCard";
import type { HealthEntry } from "@/types/health";

type HealthStatsProps = {
  entries: HealthEntry[];
};

function average(values: number[]) {
  if (!values.length) return 0;

  return (
    values.reduce((sum, value) => sum + value, 0) /
    values.length
  );
}

export function HealthStats({
  entries,
}: HealthStatsProps) {
  const totalEntries = entries.length;

  const totalWorkouts = entries.reduce(
    (sum, entry) => sum + entry.workouts.length,
    0,
  );

  const avgSleep = average(
    entries
      .map((entry) => entry.sleep?.durationHours)
      .filter(
        (value): value is number =>
          typeof value === "number",
      ),
  );

  const avgRecovery = average(
    entries
      .map((entry) => entry.recovery?.recoveryScore)
      .filter(
        (value): value is number =>
          typeof value === "number",
      ),
  );

  const avgSteps = average(
    entries
      .map((entry) => entry.steps)
      .filter(
        (value): value is number =>
          typeof value === "number",
      ),
  );

  const activePainEntries = entries.reduce(
    (sum, entry) =>
      sum +
      entry.painEntries.filter(
        (pain) => !pain.resolved,
      ).length,
    0,
  );

  return (
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
      <AdminStatCard
        label="Entries"
        value={totalEntries}
        icon={Activity}
      />

      <AdminStatCard
        label="Workouts"
        value={totalWorkouts}
        icon={Dumbbell}
      />

      <AdminStatCard
        label="Avg Sleep"
        value={`${avgSleep.toFixed(1)} h`}
        icon={Moon}
      />

      <AdminStatCard
        label="Recovery"
        value={`${avgRecovery.toFixed(0)}%`}
        icon={TrendingUp}
      />

      <AdminStatCard
        label="Avg Steps"
        value={Math.round(avgSteps).toLocaleString()}
        icon={Footprints}
      />

      <AdminStatCard
        label="Pain Entries"
        value={activePainEntries}
        icon={HeartPulse}
      />
    </div>
  );
}