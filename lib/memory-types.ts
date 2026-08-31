import { MemoryType } from "@/types/hsakaa";

export type MemoryTypeOption = {
  value: MemoryType;
  label: string;
  description: string;
};

export const MEMORY_TYPE_OPTIONS: MemoryTypeOption[] = [
  {
    value: MemoryType.FACT,
    label: "Fact",
    description:
      "A recorded state or proposition. Verification still determines how strongly HSAKAA should trust it.",
  },
  {
    value: MemoryType.PREFERENCE,
    label: "Preference",
    description: "A stable like, dislike or preferred way of doing something.",
  },
  {
    value: MemoryType.GOAL,
    label: "Goal",
    description: "A desired future state or outcome to work toward.",
  },
  {
    value: MemoryType.COMMITMENT,
    label: "Commitment",
    description:
      "A promise, obligation or explicit intention to take or avoid an action.",
  },
  {
    value: MemoryType.BELIEF,
    label: "Belief",
    description:
      "A working model currently considered true and open to revision with evidence.",
  },
  {
    value: MemoryType.LESSON,
    label: "Lesson",
    description:
      "A reusable takeaway learned from experience, reflection or an observed outcome.",
  },
  {
    value: MemoryType.EVENT,
    label: "Event",
    description:
      "Something that happened at a particular time or during a bounded period.",
  },
  {
    value: MemoryType.RELATIONSHIP,
    label: "Relationship",
    description:
      "Stable context about how people or entities are connected or how the relationship works.",
  },
  {
    value: MemoryType.ROUTINE,
    label: "Routine",
    description:
      "A repeated behavior, cadence, habit or recurring operating pattern.",
  },
  {
    value: MemoryType.PROJECT_CONTEXT,
    label: "Project context",
    description:
      "Durable project state, constraints, conventions or operating context.",
  },
  {
    value: MemoryType.OPINION,
    label: "Opinion",
    description:
      "An evaluative judgment or viewpoint that must not be presented as objective fact.",
  },
  {
    value: MemoryType.UNRESOLVED_QUESTION,
    label: "Unresolved question",
    description:
      "An open uncertainty, unanswered question or issue that still needs resolution.",
  },
];

export const LEGACY_MEMORY_TYPE_OPTIONS: MemoryTypeOption[] = [
  {
    value: MemoryType.DECISION,
    label: "Decision · legacy",
    description:
      "Historical type retained for compatibility. New decision context should use Decision Intelligence or a more precise memory type.",
  },
  {
    value: MemoryType.EXPERIENCE,
    label: "Experience · legacy",
    description:
      "Historical type retained for compatibility. New memories should usually be Event or Lesson.",
  },
  {
    value: MemoryType.PROJECT,
    label: "Project · legacy",
    description:
      "Historical type retained for compatibility. New memories should use Project context.",
  },
];

export const ALL_MEMORY_TYPE_OPTIONS = [
  ...MEMORY_TYPE_OPTIONS,
  ...LEGACY_MEMORY_TYPE_OPTIONS,
];

export function getMemoryTypeOption(type: MemoryType) {
  return ALL_MEMORY_TYPE_OPTIONS.find((option) => option.value === type);
}

export function getMemoryTypeLabel(type: MemoryType) {
  return getMemoryTypeOption(type)?.label ?? type.replaceAll("_", " ");
}

export function getMemoryTypeDescription(type: MemoryType) {
  return getMemoryTypeOption(type)?.description ?? "";
}

export function isLegacyMemoryType(type: MemoryType) {
  return LEGACY_MEMORY_TYPE_OPTIONS.some((option) => option.value === type);
}
