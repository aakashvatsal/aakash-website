import { getPublicNowStatus } from "@/lib/now";

import type { NowStatus } from "@/types/now";

export type HsakaaLiveContextItem = {
  label: string;
  value: string;
};

export type HsakaaLiveContext = {
  now: NowStatus | null;
  items: HsakaaLiveContextItem[];
};

function formatLabel(
  value?: string | null,
) {
  if (!value) {
    return "";
  }

  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) =>
      character.toUpperCase(),
    );
}

export function buildHsakaaLiveContext(
  now: NowStatus | null,
): HsakaaLiveContextItem[] {
  if (!now) {
    return [];
  }

  const items: HsakaaLiveContextItem[] = [];

  if (now.activity) {
    items.push({
      label:
        formatLabel(now.activityType) ||
        "Activity",
      value: now.activity,
    });
  }

  if (now.currentFocus) {
    items.push({
      label: "Focus",
      value: now.currentFocus,
    });
  }

  if (
    now.building?.projectName ||
    now.building?.companyName
  ) {
    items.push({
      label: "Building",
      value:
        now.building.projectName ||
        now.building.companyName ||
        "",
    });
  }

  if (now.reading?.title) {
    const parts = [now.reading.title];

    if (now.reading.author) {
      parts.push(now.reading.author);
    }

    items.push({
      label: "Reading",
      value: parts.join(" · "),
    });
  }

  if (now.thinking) {
    items.push({
      label: "Thinking",
      value: now.thinking,
    });
  }

  if (
    now.showAvailability &&
    now.availability
  ) {
    items.push({
      label: "Availability",
      value: formatLabel(
        now.availability,
      ),
    });
  }

  if (
    now.showMood &&
    now.mood
  ) {
    items.push({
      label: "Mood",
      value: formatLabel(now.mood),
    });
  }

  if (
    now.showHealth &&
    now.health
  ) {
    const healthParts: string[] = [];

    if (now.health.activity) {
      healthParts.push(
        now.health.activity,
      );
    }

    if (
      now.health.sleepHours !==
      undefined &&
      now.health.sleepHours !==
        null
    ) {
      healthParts.push(
        `${now.health.sleepHours}h sleep`,
      );
    }

    if (healthParts.length) {
      items.push({
        label: "Health",
        value:
          healthParts.join(" · "),
      });
    }
  }

  return items.slice(0, 6);
}

export async function getHsakaaLiveContext(): Promise<HsakaaLiveContext> {
  const now =
    await getPublicNowStatus();

  return {
    now,
    items:
      buildHsakaaLiveContext(
        now,
      ),
  };
}