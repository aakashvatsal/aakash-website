import type { ComponentProps } from "react";

import { DailyJournalWorkspace } from "@/components/admin/journal/DailyJournalWorkspace";
import {
  getDailyContextWorkspaceServer,
  getJournalIntelligenceServer,
} from "@/lib/api/daily-context.server";

type DailyJournalWorkspaceProps = ComponentProps<
  typeof DailyJournalWorkspace
>;

type DailyWorkspace =
  DailyJournalWorkspaceProps["initialWorkspace"];

type WeeklyIntelligence =
  DailyJournalWorkspaceProps["initialWeekly"];

type MonthlyIntelligence =
  DailyJournalWorkspaceProps["initialMonthly"];

type DailyJournalPageProps = {
  searchParams?: Promise<{
    date?: string | string[];
  }>;
};

function dateKeyInIndia(date: Date): string {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const year = parts.find(
    (part) => part.type === "year",
  )?.value;

  const month = parts.find(
    (part) => part.type === "month",
  )?.value;

  const day = parts.find(
    (part) => part.type === "day",
  )?.value;

  if (!year || !month || !day) {
    throw new Error(
      "Unable to calculate India date key.",
    );
  }

  return `${year}-${month}-${day}`;
}

function previousDayInIndia(): string {
  const todayKey = dateKeyInIndia(new Date());

  const [year, month, day] = todayKey
    .split("-")
    .map(Number);

  const indiaCalendarDate = new Date(
    Date.UTC(
      year,
      month - 1,
      day,
      12,
      0,
      0,
    ),
  );

  indiaCalendarDate.setUTCDate(
    indiaCalendarDate.getUTCDate() - 1,
  );

  const previousYear =
    indiaCalendarDate.getUTCFullYear();

  const previousMonth = String(
    indiaCalendarDate.getUTCMonth() + 1,
  ).padStart(2, "0");

  const previousDay = String(
    indiaCalendarDate.getUTCDate(),
  ).padStart(2, "0");

  return `${previousYear}-${previousMonth}-${previousDay}`;
}

function normalizeDateParam(
  value: string | string[] | undefined,
): string | undefined {
  if (Array.isArray(value)) {
    return value[0];
  }

  return value;
}

function isValidDateKey(
  value: string | undefined,
): value is string {
  if (!value) {
    return false;
  }

  return /^\d{4}-\d{2}-\d{2}$/.test(value);
}

export default async function DailyJournalPage({
  searchParams,
}: DailyJournalPageProps) {
  const params = searchParams
    ? await searchParams
    : {};

  const requestedDate = normalizeDateParam(
    params.date,
  );

  const dateKey = isValidDateKey(requestedDate)
    ? requestedDate
    : previousDayInIndia();

  const [workspace, weekly, monthly] =
    await Promise.all([
      getDailyContextWorkspaceServer<DailyWorkspace>(
        dateKey,
      ),

      getJournalIntelligenceServer<WeeklyIntelligence>(
        "week",
        dateKey,
      ),

      getJournalIntelligenceServer<MonthlyIntelligence>(
        "month",
        dateKey,
      ),
    ]);

  return (
    <div className="min-w-0">
      <div className="mt-8">
        <DailyJournalWorkspace
          initialWorkspace={workspace}
          initialWeekly={weekly}
          initialMonthly={monthly}
        />
      </div>
    </div>
  );
}