"use client";

import {
  FormEvent,
  ReactNode,
  useEffect,
  useState,
} from "react";

import { useRouter } from "next/navigation";

import {
  Activity,
  BookOpen,
  BriefcaseBusiness,
  Check,
  Clock3,
  Eye,
  FileJson,
  HeartPulse,
  Loader2,
  MapPin,
  Plus,
  Save,
  Tag,
  Trash2,
} from "lucide-react";

import {
  createNowStatus,
} from "@/lib/api/now";

import type {
  CreateNowStatusPayload,
} from "@/lib/api/now";

import type {
  NowActivityType,
  NowAvailability,
  NowCompanyReference,
  NowHealthReference,
  NowMood,
  NowReadingReference,
  NowSource,
  NowStatus,
  NowVisibility,
} from "@/types/now";

interface NowFormProps {
  status?: NowStatus | null;
}

interface SectionProps {
  title: string;
  description?: string;
  icon?: ReactNode;
  children: ReactNode;
}

interface FieldProps {
  label: string;
  description?: string;
  required?: boolean;
  className?: string;
  children: ReactNode;
}

interface ToggleFieldProps {
  label: string;
  description?: string;
  checked: boolean;
  onChange: (
    checked: boolean,
  ) => void;
}

const activityTypeOptions: Array<{
  label: string;
  value: NowActivityType;
}> = [
  {
    label: "Working",
    value: "working",
  },
  {
    label: "Building",
    value: "building",
  },
  {
    label: "Coding",
    value: "coding",
  },
  {
    label: "Designing",
    value: "designing",
  },
  {
    label: "Meeting",
    value: "meeting",
  },
  {
    label: "Reading",
    value: "reading",
  },
  {
    label: "Writing",
    value: "writing",
  },
  {
    label: "Learning",
    value: "learning",
  },
  {
    label: "Researching",
    value: "researching",
  },
  {
    label: "Exercising",
    value: "exercising",
  },
  {
    label: "Walking",
    value: "walking",
  },
  {
    label: "Meditating",
    value: "meditating",
  },
  {
    label: "Eating",
    value: "eating",
  },
  {
    label: "Commuting",
    value: "commuting",
  },
  {
    label: "Travelling",
    value: "travelling",
  },
  {
    label: "Resting",
    value: "resting",
  },
  {
    label: "Sleeping",
    value: "sleeping",
  },
  {
    label: "Offline",
    value: "offline",
  },
  {
    label: "Other",
    value: "other",
  },
];

const availabilityOptions: Array<{
  label: string;
  value: NowAvailability;
}> = [
  {
    label: "Available",
    value: "available",
  },
  {
    label: "Focused",
    value: "focused",
  },
  {
    label: "Busy",
    value: "busy",
  },
  {
    label: "In Meeting",
    value: "in_meeting",
  },
  {
    label: "Do Not Disturb",
    value: "do_not_disturb",
  },
  {
    label: "Away",
    value: "away",
  },
  {
    label: "Offline",
    value: "offline",
  },
];

const moodOptions: Array<{
  label: string;
  value: NowMood;
}> = [
  {
    label: "Focused",
    value: "focused",
  },
  {
    label: "Calm",
    value: "calm",
  },
  {
    label: "Creative",
    value: "creative",
  },
  {
    label: "Energetic",
    value: "energetic",
  },
  {
    label: "Happy",
    value: "happy",
  },
  {
    label: "Neutral",
    value: "neutral",
  },
  {
    label: "Tired",
    value: "tired",
  },
  {
    label: "Stressed",
    value: "stressed",
  },
  {
    label: "Low",
    value: "low",
  },
];

const visibilityOptions: Array<{
  label: string;
  value: NowVisibility;
}> = [
  {
    label: "Public",
    value: "public",
  },
  {
    label: "Shared",
    value: "shared",
  },
  {
    label: "Private",
    value: "private",
  },
];

const sourceOptions: Array<{
  label: string;
  value: NowSource;
}> = [
  {
    label: "Manual",
    value: "manual",
  },
  {
    label: "HSAKAA",
    value: "hsakaa",
  },
  {
    label: "Health",
    value: "health",
  },
  {
    label: "Whoop",
    value: "whoop",
  },
  {
    label: "Library",
    value: "library",
  },
  {
    label: "Company",
    value: "company",
  },
  {
    label: "Calendar",
    value: "calendar",
  },
  {
    label: "System",
    value: "system",
  },
  {
    label: "Other",
    value: "other",
  },
];

const inputClassName =
  "w-full rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white outline-none transition placeholder:text-white/30 focus:border-[#C6FF32]/50 focus:bg-white/[0.05] focus:ring-1 focus:ring-[#C6FF32]/20 disabled:cursor-not-allowed disabled:opacity-50";

const textareaClassName =
  "min-h-28 w-full resize-y rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-white outline-none transition placeholder:text-white/30 focus:border-[#C6FF32]/50 focus:bg-white/[0.05] focus:ring-1 focus:ring-[#C6FF32]/20 disabled:cursor-not-allowed disabled:opacity-50";

function Section({
  title,
  description,
  icon,
  children,
}: SectionProps) {
  return (
    <section className="overflow-hidden rounded-2xl border border-white/10 bg-[#070B0E]">
      <div className="border-b border-white/10 px-5 py-5 sm:px-6">
        <div className="flex items-start gap-3">
          {icon ? (
            <div className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-xl border border-[#C6FF32]/20 bg-[#C6FF32]/10 text-[#C6FF32]">
              {icon}
            </div>
          ) : null}

          <div>
            <h2 className="text-base font-semibold text-white">
              {title}
            </h2>

            {description ? (
              <p className="mt-1 text-sm leading-6 text-white/45">
                {description}
              </p>
            ) : null}
          </div>
        </div>
      </div>

      <div className="p-5 sm:p-6">
        {children}
      </div>
    </section>
  );
}

function Field({
  label,
  description,
  required,
  className = "",
  children,
}: FieldProps) {
  return (
    <div className={className}>
      <div className="mb-2">
        <label className="text-sm font-medium text-white/80">
          {label}

          {required ? (
            <span className="ml-1 text-red-400">
              *
            </span>
          ) : null}
        </label>

        {description ? (
          <p className="mt-1 text-xs leading-5 text-white/35">
            {description}
          </p>
        ) : null}
      </div>

      {children}
    </div>
  );
}

function ToggleField({
  label,
  description,
  checked,
  onChange,
}: ToggleFieldProps) {
  return (
    <label className="flex cursor-pointer items-center justify-between gap-6 rounded-xl border border-white/10 bg-white/[0.02] p-4 transition hover:bg-white/[0.04]">
      <div>
        <p className="text-sm font-medium text-white/80">
          {label}
        </p>

        {description ? (
          <p className="mt-1 text-xs leading-5 text-white/35">
            {description}
          </p>
        ) : null}
      </div>

      <input
        type="checkbox"
        checked={checked}
        onChange={(event) =>
          onChange(
            event.target.checked,
          )
        }
        className="peer sr-only"
      />

      <span className="relative h-6 w-11 shrink-0 rounded-full bg-white/15 transition peer-checked:bg-[#C6FF32]">
        <span className="absolute left-1 top-1 size-4 rounded-full bg-white transition-transform peer-checked:translate-x-5 peer-checked:bg-black" />
      </span>
    </label>
  );
}

function toDateTimeLocal(
  value?: string | Date | null,
) {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return "";
  }

  const timezoneOffset =
    date.getTimezoneOffset() *
    60_000;

  return new Date(
    date.getTime() -
      timezoneOffset,
  )
    .toISOString()
    .slice(0, 16);
}

function toIsoDate(
  value: string,
) {
  if (!value.trim()) {
    return undefined;
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
    )
  ) {
    return undefined;
  }

  return date.toISOString();
}

function optionalText(
  value: string,
) {
  const normalizedValue =
    value.trim();

  return (
    normalizedValue ||
    undefined
  );
}

function optionalNumber(
  value: string,
) {
  if (
    value.trim() ===
    ""
  ) {
    return undefined;
  }

  const parsedValue =
    Number(value);

  return Number.isFinite(
    parsedValue,
  )
    ? parsedValue
    : undefined;
}

function hasObjectValues(
  value: Record<
    string,
    unknown
  >,
) {
  return Object.values(
    value,
  ).some(
    (item) =>
      item !== undefined &&
      item !== null &&
      item !== "",
  );
}

export function NowForm({
  status,
}: NowFormProps) {
  const router =
    useRouter();

  const [
    activityType,
    setActivityType,
  ] =
    useState<NowActivityType>(
      status?.activityType ??
        "working",
    );

  const [
    activity,
    setActivity,
  ] = useState(
    status?.activity ?? "",
  );

  const [
    headline,
    setHeadline,
  ] = useState(
    status?.headline ?? "",
  );

  const [
    description,
    setDescription,
  ] = useState(
    status?.description ??
      "",
  );

  const [
    currentFocus,
    setCurrentFocus,
  ] = useState(
    status?.currentFocus ??
      "",
  );

  const [
    availability,
    setAvailability,
  ] =
    useState<NowAvailability>(
      status?.availability ??
        "focused",
    );

  const [
    mood,
    setMood,
  ] =
    useState<
      NowMood | ""
    >(status?.mood ?? "");

  const [
    energyScore,
    setEnergyScore,
  ] = useState(
    status?.energyScore?.toString() ??
      "",
  );

  const [
    focusScore,
    setFocusScore,
  ] = useState(
    status?.focusScore?.toString() ??
      "",
  );

  const [
    companyId,
    setCompanyId,
  ] = useState(
    status?.building
      ?.companyId ?? "",
  );

  const [
    companyName,
    setCompanyName,
  ] = useState(
    status?.building
      ?.companyName ??
      "",
  );

  const [
    projectName,
    setProjectName,
  ] = useState(
    status?.building
      ?.projectName ??
      "",
  );

  const [
    currentWork,
    setCurrentWork,
  ] = useState(
    status?.building
      ?.currentWork ??
      "",
  );

  const [
    libraryItemId,
    setLibraryItemId,
  ] = useState(
    status?.reading
      ?.libraryItemId ??
      "",
  );

  const [
    readingTitle,
    setReadingTitle,
  ] = useState(
    status?.reading?.title ??
      "",
  );

  const [
    readingAuthor,
    setReadingAuthor,
  ] = useState(
    status?.reading
      ?.author ?? "",
  );

  const [
    readingProgressPercentage,
    setReadingProgressPercentage,
  ] = useState(
    status?.reading
      ?.progressPercentage?.toString() ??
      "",
  );

  const [
    currentThought,
    setCurrentThought,
  ] = useState(
    status?.reading
      ?.currentThought ??
      "",
  );

  const [
    thinking,
    setThinking,
  ] = useState(
    status?.thinking ?? "",
  );

  const [
    writing,
    setWriting,
  ] = useState(
    status?.writing ?? "",
  );

  const [
    healthActivity,
    setHealthActivity,
  ] = useState(
    status?.health
      ?.activity ?? "",
  );

  const [
    workoutDurationMinutes,
    setWorkoutDurationMinutes,
  ] = useState(
    status?.health
      ?.workoutDurationMinutes?.toString() ??
      "",
  );

  const [
    steps,
    setSteps,
  ] = useState(
    status?.health
      ?.steps?.toString() ??
      "",
  );

  const [
    sleepHours,
    setSleepHours,
  ] = useState(
    status?.health
      ?.sleepHours?.toString() ??
      "",
  );

  const [
    recoveryScore,
    setRecoveryScore,
  ] = useState(
    status?.health
      ?.recoveryScore?.toString() ??
      "",
  );

  const [
    strainScore,
    setStrainScore,
  ] = useState(
    status?.health
      ?.strainScore?.toString() ??
      "",
  );

  const [
    heartRateVariabilityMs,
    setHeartRateVariabilityMs,
  ] = useState(
    status?.health
      ?.heartRateVariabilityMs?.toString() ??
      "",
  );

  const [
    restingHeartRateBpm,
    setRestingHeartRateBpm,
  ] = useState(
    status?.health
      ?.restingHeartRateBpm?.toString() ??
      "",
  );

  const [
    healthEnergyScore,
    setHealthEnergyScore,
  ] = useState(
    status?.health
      ?.energyScore?.toString() ??
      "",
  );

  const [
    healthSummary,
    setHealthSummary,
  ] = useState(
    status?.health
      ?.summary ?? "",
  );

  const [
    locationName,
    setLocationName,
  ] = useState(
    status?.locationName ??
      "",
  );

  const [
    locationType,
    setLocationType,
  ] = useState(
    status?.locationType ??
      "",
  );

  const [
    tags,
    setTags,
  ] = useState<string[]>(
    status?.tags ?? [],
  );

  const [
    tagInput,
    setTagInput,
  ] = useState("");

  const [
    visibility,
    setVisibility,
  ] =
    useState<NowVisibility>(
      status?.visibility ??
        "public",
    );

  const [
    showLocation,
    setShowLocation,
  ] = useState(
    status?.showLocation ??
      false,
  );

  const [
    showAvailability,
    setShowAvailability,
  ] = useState(
    status?.showAvailability ??
      true,
  );

  const [
    showMood,
    setShowMood,
  ] = useState(
    status?.showMood ??
      true,
  );

  const [
    showHealth,
    setShowHealth,
  ] = useState(
    status?.showHealth ??
      true,
  );

  /*
   * Every save creates a NEW Now status.
   * Therefore startedAt defaults to now,
   * not the previous status.startedAt.
   */
  const [
    startedAt,
    setStartedAt,
  ] = useState(
    toDateTimeLocal(
      new Date(),
    ),
  );

  const [
    expiresAt,
    setExpiresAt,
  ] = useState("");

  const [
    source,
    setSource,
  ] =
    useState<NowSource>(
      "manual",
    );

  const [
    metadataText,
    setMetadataText,
  ] = useState(
    JSON.stringify(
      status?.metadata ??
        {},
      null,
      2,
    ),
  );

  const [
    isSubmitting,
    setIsSubmitting,
  ] =
    useState(false);

  const [
    error,
    setError,
  ] = useState<
    string | null
  >(null);

  const [
    success,
    setSuccess,
  ] = useState<
    string | null
  >(null);

  /*
   * Current status is used only as a template
   * for the next Now status.
   */
  useEffect(() => {
    if (!status?._id) {
      return;
    }

    setActivityType(
      status.activityType ??
        "working",
    );

    setActivity(
      status.activity ?? "",
    );

    setHeadline(
      status.headline ?? "",
    );

    setDescription(
      status.description ??
        "",
    );

    setCurrentFocus(
      status.currentFocus ??
        "",
    );

    setAvailability(
      status.availability ??
        "focused",
    );

    setMood(
      status.mood ?? "",
    );

    setEnergyScore(
      status.energyScore?.toString() ??
        "",
    );

    setFocusScore(
      status.focusScore?.toString() ??
        "",
    );

    setCompanyId(
      status.building
        ?.companyId ?? "",
    );

    setCompanyName(
      status.building
        ?.companyName ??
        "",
    );

    setProjectName(
      status.building
        ?.projectName ??
        "",
    );

    setCurrentWork(
      status.building
        ?.currentWork ??
        "",
    );

    setLibraryItemId(
      status.reading
        ?.libraryItemId ??
        "",
    );

    setReadingTitle(
      status.reading?.title ??
        "",
    );

    setReadingAuthor(
      status.reading?.author ??
        "",
    );

    setReadingProgressPercentage(
      status.reading
        ?.progressPercentage?.toString() ??
        "",
    );

    setCurrentThought(
      status.reading
        ?.currentThought ??
        "",
    );

    setThinking(
      status.thinking ?? "",
    );

    setWriting(
      status.writing ?? "",
    );

    setHealthActivity(
      status.health
        ?.activity ?? "",
    );

    setWorkoutDurationMinutes(
      status.health
        ?.workoutDurationMinutes?.toString() ??
        "",
    );

    setSteps(
      status.health
        ?.steps?.toString() ??
        "",
    );

    setSleepHours(
      status.health
        ?.sleepHours?.toString() ??
        "",
    );

    setRecoveryScore(
      status.health
        ?.recoveryScore?.toString() ??
        "",
    );

    setStrainScore(
      status.health
        ?.strainScore?.toString() ??
        "",
    );

    setHeartRateVariabilityMs(
      status.health
        ?.heartRateVariabilityMs?.toString() ??
        "",
    );

    setRestingHeartRateBpm(
      status.health
        ?.restingHeartRateBpm?.toString() ??
        "",
    );

    setHealthEnergyScore(
      status.health
        ?.energyScore?.toString() ??
        "",
    );

    setHealthSummary(
      status.health
        ?.summary ?? "",
    );

    setLocationName(
      status.locationName ??
        "",
    );

    setLocationType(
      status.locationType ??
        "",
    );

    setTags(
      Array.isArray(
        status.tags,
      )
        ? status.tags
        : [],
    );

    setVisibility(
      status.visibility ??
        "public",
    );

    setShowLocation(
      status.showLocation ??
        false,
    );

    setShowAvailability(
      status.showAvailability ??
        true,
    );

    setShowMood(
      status.showMood ??
        true,
    );

    setShowHealth(
      status.showHealth ??
        true,
    );

    /*
     * Do NOT copy startedAt from the old status.
     * This is a new status.
     */
    setStartedAt(
      toDateTimeLocal(
        new Date(),
      ),
    );

    setExpiresAt("");

    setSource("manual");

    setMetadataText(
      JSON.stringify(
        status.metadata ??
          {},
        null,
        2,
      ),
    );
  }, [status]);

  useEffect(() => {
    if (!success) {
      return;
    }

    const timer =
      window.setTimeout(
        () => {
          setSuccess(null);
        },
        4000,
      );

    return () => {
      window.clearTimeout(
        timer,
      );
    };
  }, [success]);

  function addTag() {
    const normalizedTag =
      tagInput.trim();

    if (!normalizedTag) {
      return;
    }

    const alreadyExists =
      tags.some(
        (tagItem) =>
          tagItem.toLowerCase() ===
          normalizedTag.toLowerCase(),
      );

    if (!alreadyExists) {
      setTags(
        (currentTags) => [
          ...currentTags,
          normalizedTag,
        ],
      );
    }

    setTagInput("");
  }

  function removeTag(
    index: number,
  ) {
    setTags(
      (currentTags) =>
        currentTags.filter(
          (
            _,
            tagIndex,
          ) =>
            tagIndex !==
            index,
        ),
    );
  }

  function handleTagKeyDown(
    event:
      React.KeyboardEvent<HTMLInputElement>,
  ) {
    if (
      event.key ===
        "Enter" ||
      event.key === ","
    ) {
      event.preventDefault();

      addTag();
    }
  }

  function validatePayload() {
    if (!activity.trim()) {
      return "Activity is required.";
    }

    if (
      !startedAt.trim()
    ) {
      return "Started at is required.";
    }

    const normalizedEnergyScore =
      optionalNumber(
        energyScore,
      );

    if (
      normalizedEnergyScore !==
        undefined &&
      (
        normalizedEnergyScore <
          0 ||
        normalizedEnergyScore >
          10
      )
    ) {
      return "Energy score must be between 0 and 10.";
    }

    const normalizedFocusScore =
      optionalNumber(
        focusScore,
      );

    if (
      normalizedFocusScore !==
        undefined &&
      (
        normalizedFocusScore <
          0 ||
        normalizedFocusScore >
          10
      )
    ) {
      return "Focus score must be between 0 and 10.";
    }

    const normalizedReadingProgress =
      optionalNumber(
        readingProgressPercentage,
      );

    if (
      normalizedReadingProgress !==
        undefined &&
      (
        normalizedReadingProgress <
          0 ||
        normalizedReadingProgress >
          100
      )
    ) {
      return "Reading progress must be between 0 and 100.";
    }

    const normalizedSleepHours =
      optionalNumber(
        sleepHours,
      );

    if (
      normalizedSleepHours !==
        undefined &&
      (
        normalizedSleepHours <
          0 ||
        normalizedSleepHours >
          24
      )
    ) {
      return "Sleep hours must be between 0 and 24.";
    }

    const normalizedRecoveryScore =
      optionalNumber(
        recoveryScore,
      );

    if (
      normalizedRecoveryScore !==
        undefined &&
      (
        normalizedRecoveryScore <
          0 ||
        normalizedRecoveryScore >
          100
      )
    ) {
      return "Recovery score must be between 0 and 100.";
    }

    const normalizedHealthEnergyScore =
      optionalNumber(
        healthEnergyScore,
      );

    if (
      normalizedHealthEnergyScore !==
        undefined &&
      (
        normalizedHealthEnergyScore <
          0 ||
        normalizedHealthEnergyScore >
          10
      )
    ) {
      return "Health energy score must be between 0 and 10.";
    }

    if (
      expiresAt &&
      new Date(
        expiresAt,
      ).getTime() <
        new Date(
          startedAt,
        ).getTime()
    ) {
      return "Expires at cannot be earlier than started at.";
    }

    return null;
  }

  function buildPayload(): CreateNowStatusPayload {
    let metadata: Record<
      string,
      unknown
    > = {};

    if (
      metadataText.trim()
    ) {
      const parsedMetadata =
        JSON.parse(
          metadataText,
        );

      if (
        typeof parsedMetadata !==
          "object" ||
        parsedMetadata ===
          null ||
        Array.isArray(
          parsedMetadata,
        )
      ) {
        throw new Error(
          "Metadata must be a valid JSON object.",
        );
      }

      metadata =
        parsedMetadata as Record<
          string,
          unknown
        >;
    }

    const building: NowCompanyReference =
      {
        companyId:
          optionalText(
            companyId,
          ),

        companyName:
          optionalText(
            companyName,
          ),

        projectName:
          optionalText(
            projectName,
          ),

        currentWork:
          optionalText(
            currentWork,
          ),
      };

    const reading: NowReadingReference =
      {
        libraryItemId:
          optionalText(
            libraryItemId,
          ),

        title:
          optionalText(
            readingTitle,
          ),

        author:
          optionalText(
            readingAuthor,
          ),

        progressPercentage:
          optionalNumber(
            readingProgressPercentage,
          ),

        currentThought:
          optionalText(
            currentThought,
          ),
      };

    const health: NowHealthReference =
      {
        activity:
          optionalText(
            healthActivity,
          ),

        workoutDurationMinutes:
          optionalNumber(
            workoutDurationMinutes,
          ),

        steps:
          optionalNumber(
            steps,
          ),

        sleepHours:
          optionalNumber(
            sleepHours,
          ),

        recoveryScore:
          optionalNumber(
            recoveryScore,
          ),

        strainScore:
          optionalNumber(
            strainScore,
          ),

        heartRateVariabilityMs:
          optionalNumber(
            heartRateVariabilityMs,
          ),

        restingHeartRateBpm:
          optionalNumber(
            restingHeartRateBpm,
          ),

        energyScore:
          optionalNumber(
            healthEnergyScore,
          ),

        summary:
          optionalText(
            healthSummary,
          ),
      };

    return {
      activityType,

      activity:
        activity.trim(),

      headline:
        optionalText(
          headline,
        ),

      description:
        optionalText(
          description,
        ),

      currentFocus:
        optionalText(
          currentFocus,
        ),

      availability,

      mood:
        mood ||
        undefined,

      energyScore:
        optionalNumber(
          energyScore,
        ),

      focusScore:
        optionalNumber(
          focusScore,
        ),

      locationName:
        optionalText(
          locationName,
        ),

      locationType:
        optionalText(
          locationType,
        ),

      building:
        hasObjectValues(
          building as Record<
            string,
            unknown
          >,
        )
          ? building
          : undefined,

      reading:
        hasObjectValues(
          reading as Record<
            string,
            unknown
          >,
        )
          ? reading
          : undefined,

      thinking:
        optionalText(
          thinking,
        ),

      writing:
        optionalText(
          writing,
        ),

      health:
        hasObjectValues(
          health as Record<
            string,
            unknown
          >,
        )
          ? health
          : undefined,

      tags: tags
        .map(
          (tagItem) =>
            tagItem.trim(),
        )
        .filter(Boolean),

      visibility,

      showLocation,

      showAvailability,

      showMood,

      showHealth,

      startedAt:
        toIsoDate(
          startedAt,
        ) ??
        new Date().toISOString(),

      expiresAt:
        toIsoDate(
          expiresAt,
        ),

      source,

      metadata,
    };
  }

  async function handleSubmit(
    event:
      FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    if (isSubmitting) {
      return;
    }

    setError(null);
    setSuccess(null);

    const validationError =
      validatePayload();

    if (
      validationError
    ) {
      setError(
        validationError,
      );

      return;
    }

    try {
      setIsSubmitting(
        true,
      );

      const payload =
        buildPayload();

      /*
       * Always POST.
       * Every save creates a new Now status.
       */
      await createNowStatus(
        payload,
      );

      setSuccess(
        "New Now status created successfully.",
      );

      /*
       * The newly created status begins now.
       * Refresh the Server Component so it receives
       * the newly-created current status.
       */
      router.refresh();
    } catch (
      submitError
    ) {
      setError(
        submitError instanceof
          Error
          ? submitError.message
          : "Unable to create the Now status.",
      );
    } finally {
      setIsSubmitting(
        false,
      );
    }
  }

  return (
    <form
      onSubmit={
        handleSubmit
      }
      className="space-y-6 pb-28"
    >
      <div className="rounded-xl border border-white/10 bg-white/[0.02] px-4 py-3">
        <p className="text-sm font-medium text-white">
          Create a new Now status
        </p>

        <p className="mt-1 text-xs leading-5 text-white/40">
          {status
            ? "Your current status has been loaded as a starting point. Saving creates a new status and moves the current one into history."
            : "Complete the form to create your current Now status."}
        </p>
      </div>

      {error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
          {error}
        </div>
      ) : null}

      {success ? (
        <div className="flex items-center gap-2 rounded-xl border border-[#C6FF32]/20 bg-[#C6FF32]/10 px-4 py-3 text-sm text-[#C6FF32]">
          <Check className="size-4" />

          {success}
        </div>
      ) : null}

      <Section
        title="Basic Information"
        description="Set the primary activity and context for the new status."
        icon={
          <Activity className="size-4" />
        }
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field
            label="Activity Type"
            required
          >
            <select
              value={
                activityType
              }
              onChange={(
                event,
              ) =>
                setActivityType(
                  event
                    .target
                    .value as NowActivityType,
                )
              }
              className={
                inputClassName
              }
            >
              {activityTypeOptions.map(
                (
                  option,
                ) => (
                  <option
                    key={
                      option.value
                    }
                    value={
                      option.value
                    }
                    className="bg-[#070B0E]"
                  >
                    {
                      option.label
                    }
                  </option>
                ),
              )}
            </select>
          </Field>

          <Field
            label="Activity"
            required
          >
            <input
              value={
                activity
              }
              onChange={(
                event,
              ) =>
                setActivity(
                  event
                    .target
                    .value,
                )
              }
              placeholder="Building the HSAKAA backend"
              className={
                inputClassName
              }
            />
          </Field>

          <Field
            label="Headline"
            className="md:col-span-2"
          >
            <input
              value={
                headline
              }
              onChange={(
                event,
              ) =>
                setHeadline(
                  event
                    .target
                    .value,
                )
              }
              placeholder="Working on my personal operating system"
              className={
                inputClassName
              }
            />
          </Field>

          <Field
            label="Description"
            className="md:col-span-2"
          >
            <textarea
              value={
                description
              }
              onChange={(
                event,
              ) =>
                setDescription(
                  event
                    .target
                    .value,
                )
              }
              placeholder="Add more detail about the current activity."
              className={
                textareaClassName
              }
            />
          </Field>

          <Field
            label="Current Focus"
            className="md:col-span-2"
          >
            <input
              value={
                currentFocus
              }
              onChange={(
                event,
              ) =>
                setCurrentFocus(
                  event
                    .target
                    .value,
                )
              }
              placeholder="Completing the Now module"
              className={
                inputClassName
              }
            />
          </Field>
        </div>
      </Section>

      <Section
        title="Availability and State"
        description="Control availability, mood, energy and focus."
        icon={
          <Eye className="size-4" />
        }
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Availability">
            <select
              value={
                availability
              }
              onChange={(
                event,
              ) =>
                setAvailability(
                  event
                    .target
                    .value as NowAvailability,
                )
              }
              className={
                inputClassName
              }
            >
              {availabilityOptions.map(
                (
                  option,
                ) => (
                  <option
                    key={
                      option.value
                    }
                    value={
                      option.value
                    }
                    className="bg-[#070B0E]"
                  >
                    {
                      option.label
                    }
                  </option>
                ),
              )}
            </select>
          </Field>

          <Field label="Mood">
            <select
              value={mood}
              onChange={(
                event,
              ) =>
                setMood(
                  event
                    .target
                    .value as
                    | NowMood
                    | "",
                )
              }
              className={
                inputClassName
              }
            >
              <option
                value=""
                className="bg-[#070B0E]"
              >
                Not selected
              </option>

              {moodOptions.map(
                (
                  option,
                ) => (
                  <option
                    key={
                      option.value
                    }
                    value={
                      option.value
                    }
                    className="bg-[#070B0E]"
                  >
                    {
                      option.label
                    }
                  </option>
                ),
              )}
            </select>
          </Field>

          <Field label="Energy Score">
            <input
              type="number"
              min={0}
              max={10}
              value={
                energyScore
              }
              onChange={(
                event,
              ) =>
                setEnergyScore(
                  event
                    .target
                    .value,
                )
              }
              className={
                inputClassName
              }
            />
          </Field>

          <Field label="Focus Score">
            <input
              type="number"
              min={0}
              max={10}
              value={
                focusScore
              }
              onChange={(
                event,
              ) =>
                setFocusScore(
                  event
                    .target
                    .value,
                )
              }
              className={
                inputClassName
              }
            />
          </Field>
        </div>
      </Section>

      <Section
        title="Building"
        description="Reference the company, project and work currently being built."
        icon={
          <BriefcaseBusiness className="size-4" />
        }
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Company ID">
            <input
              value={
                companyId
              }
              onChange={(
                event,
              ) =>
                setCompanyId(
                  event
                    .target
                    .value,
                )
              }
              className={
                inputClassName
              }
            />
          </Field>

          <Field label="Company Name">
            <input
              value={
                companyName
              }
              onChange={(
                event,
              ) =>
                setCompanyName(
                  event
                    .target
                    .value,
                )
              }
              className={
                inputClassName
              }
            />
          </Field>

          <Field label="Project Name">
            <input
              value={
                projectName
              }
              onChange={(
                event,
              ) =>
                setProjectName(
                  event
                    .target
                    .value,
                )
              }
              className={
                inputClassName
              }
            />
          </Field>

          <Field label="Current Work">
            <input
              value={
                currentWork
              }
              onChange={(
                event,
              ) =>
                setCurrentWork(
                  event
                    .target
                    .value,
                )
              }
              className={
                inputClassName
              }
            />
          </Field>
        </div>
      </Section>

      <Section
        title="Reading"
        description="Reference the current book and reading progress."
        icon={
          <BookOpen className="size-4" />
        }
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Library Item ID">
            <input
              value={
                libraryItemId
              }
              onChange={(
                event,
              ) =>
                setLibraryItemId(
                  event
                    .target
                    .value,
                )
              }
              className={
                inputClassName
              }
            />
          </Field>

          <Field label="Title">
            <input
              value={
                readingTitle
              }
              onChange={(
                event,
              ) =>
                setReadingTitle(
                  event
                    .target
                    .value,
                )
              }
              className={
                inputClassName
              }
            />
          </Field>

          <Field label="Author">
            <input
              value={
                readingAuthor
              }
              onChange={(
                event,
              ) =>
                setReadingAuthor(
                  event
                    .target
                    .value,
                )
              }
              className={
                inputClassName
              }
            />
          </Field>

          <Field label="Progress Percentage">
            <input
              type="number"
              min={0}
              max={100}
              value={
                readingProgressPercentage
              }
              onChange={(
                event,
              ) =>
                setReadingProgressPercentage(
                  event
                    .target
                    .value,
                )
              }
              className={
                inputClassName
              }
            />
          </Field>

          <Field
            label="Current Thought"
            className="md:col-span-2"
          >
            <textarea
              value={
                currentThought
              }
              onChange={(
                event,
              ) =>
                setCurrentThought(
                  event
                    .target
                    .value,
                )
              }
              className={
                textareaClassName
              }
            />
          </Field>
        </div>
      </Section>

      <Section
        title="Thinking and Writing"
        icon={
          <Activity className="size-4" />
        }
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Thinking">
            <textarea
              value={
                thinking
              }
              onChange={(
                event,
              ) =>
                setThinking(
                  event
                    .target
                    .value,
                )
              }
              className={
                textareaClassName
              }
            />
          </Field>

          <Field label="Writing">
            <textarea
              value={
                writing
              }
              onChange={(
                event,
              ) =>
                setWriting(
                  event
                    .target
                    .value,
                )
              }
              className={
                textareaClassName
              }
            />
          </Field>
        </div>
      </Section>

      <Section
        title="Health"
        description="Add current health and recovery context."
        icon={
          <HeartPulse className="size-4" />
        }
      >
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <Field label="Activity">
            <input
              value={
                healthActivity
              }
              onChange={(
                event,
              ) =>
                setHealthActivity(
                  event
                    .target
                    .value,
                )
              }
              className={
                inputClassName
              }
            />
          </Field>

          <Field label="Workout Duration">
            <input
              type="number"
              min={0}
              value={
                workoutDurationMinutes
              }
              onChange={(
                event,
              ) =>
                setWorkoutDurationMinutes(
                  event
                    .target
                    .value,
                )
              }
              className={
                inputClassName
              }
            />
          </Field>

          <Field label="Steps">
            <input
              type="number"
              min={0}
              value={steps}
              onChange={(
                event,
              ) =>
                setSteps(
                  event
                    .target
                    .value,
                )
              }
              className={
                inputClassName
              }
            />
          </Field>

          <Field label="Sleep Hours">
            <input
              type="number"
              min={0}
              max={24}
              step={0.1}
              value={
                sleepHours
              }
              onChange={(
                event,
              ) =>
                setSleepHours(
                  event
                    .target
                    .value,
                )
              }
              className={
                inputClassName
              }
            />
          </Field>

          <Field label="Recovery Score">
            <input
              type="number"
              min={0}
              max={100}
              value={
                recoveryScore
              }
              onChange={(
                event,
              ) =>
                setRecoveryScore(
                  event
                    .target
                    .value,
                )
              }
              className={
                inputClassName
              }
            />
          </Field>

          <Field label="Strain Score">
            <input
              type="number"
              min={0}
              value={
                strainScore
              }
              onChange={(
                event,
              ) =>
                setStrainScore(
                  event
                    .target
                    .value,
                )
              }
              className={
                inputClassName
              }
            />
          </Field>

          <Field label="HRV">
            <input
              type="number"
              min={0}
              value={
                heartRateVariabilityMs
              }
              onChange={(
                event,
              ) =>
                setHeartRateVariabilityMs(
                  event
                    .target
                    .value,
                )
              }
              className={
                inputClassName
              }
            />
          </Field>

          <Field label="Resting Heart Rate">
            <input
              type="number"
              min={0}
              value={
                restingHeartRateBpm
              }
              onChange={(
                event,
              ) =>
                setRestingHeartRateBpm(
                  event
                    .target
                    .value,
                )
              }
              className={
                inputClassName
              }
            />
          </Field>

          <Field label="Energy Score">
            <input
              type="number"
              min={0}
              max={10}
              value={
                healthEnergyScore
              }
              onChange={(
                event,
              ) =>
                setHealthEnergyScore(
                  event
                    .target
                    .value,
                )
              }
              className={
                inputClassName
              }
            />
          </Field>

          <Field
            label="Health Summary"
            className="md:col-span-2 lg:col-span-3"
          >
            <textarea
              value={
                healthSummary
              }
              onChange={(
                event,
              ) =>
                setHealthSummary(
                  event
                    .target
                    .value,
                )
              }
              className={
                textareaClassName
              }
            />
          </Field>
        </div>
      </Section>

      <Section
        title="Location"
        icon={
          <MapPin className="size-4" />
        }
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Location Name">
            <input
              value={
                locationName
              }
              onChange={(
                event,
              ) =>
                setLocationName(
                  event
                    .target
                    .value,
                )
              }
              className={
                inputClassName
              }
            />
          </Field>

          <Field label="Location Type">
            <input
              value={
                locationType
              }
              onChange={(
                event,
              ) =>
                setLocationType(
                  event
                    .target
                    .value,
                )
              }
              className={
                inputClassName
              }
            />
          </Field>
        </div>
      </Section>

      <Section
        title="Tags"
        icon={
          <Tag className="size-4" />
        }
      >
        <div className="flex gap-2">
          <input
            value={
              tagInput
            }
            onChange={(
              event,
            ) =>
              setTagInput(
                event
                  .target
                  .value,
              )
            }
            onKeyDown={
              handleTagKeyDown
            }
            className={
              inputClassName
            }
          />

          <button
            type="button"
            onClick={addTag}
            className="inline-flex shrink-0 items-center gap-2 rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm font-medium text-white"
          >
            <Plus className="size-4" />

            Add
          </button>
        </div>

        {tags.length >
          0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map(
              (
                tagItem,
                index,
              ) => (
                <span
                  key={`${tagItem}-${index}`}
                  className="inline-flex items-center gap-2 rounded-full border border-[#C6FF32]/20 bg-[#C6FF32]/10 px-3 py-1.5 text-sm text-[#C6FF32]"
                >
                  {tagItem}

                  <button
                    type="button"
                    onClick={() =>
                      removeTag(
                        index,
                      )
                    }
                  >
                    <Trash2 className="size-3.5" />
                  </button>
                </span>
              ),
            )}
          </div>
        )}
      </Section>

      <Section
        title="Visibility"
        icon={
          <Eye className="size-4" />
        }
      >
        <div className="grid gap-5">
          <Field label="Visibility">
            <select
              value={
                visibility
              }
              onChange={(
                event,
              ) =>
                setVisibility(
                  event
                    .target
                    .value as NowVisibility,
                )
              }
              className={
                inputClassName
              }
            >
              {visibilityOptions.map(
                (
                  option,
                ) => (
                  <option
                    key={
                      option.value
                    }
                    value={
                      option.value
                    }
                  >
                    {
                      option.label
                    }
                  </option>
                ),
              )}
            </select>
          </Field>

          <div className="grid gap-3 md:grid-cols-2">
            <ToggleField
              label="Show Availability"
              checked={
                showAvailability
              }
              onChange={
                setShowAvailability
              }
            />

            <ToggleField
              label="Show Mood"
              checked={
                showMood
              }
              onChange={
                setShowMood
              }
            />

            <ToggleField
              label="Show Health"
              checked={
                showHealth
              }
              onChange={
                setShowHealth
              }
            />

            <ToggleField
              label="Show Location"
              checked={
                showLocation
              }
              onChange={
                setShowLocation
              }
            />
          </div>
        </div>
      </Section>

      <Section
        title="Timing"
        description="Each save starts a new Now status. The backend ends the previous current status."
        icon={
          <Clock3 className="size-4" />
        }
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field
            label="Started At"
            required
          >
            <input
              type="datetime-local"
              value={
                startedAt
              }
              onChange={(
                event,
              ) =>
                setStartedAt(
                  event
                    .target
                    .value,
                )
              }
              className={
                inputClassName
              }
            />
          </Field>

          <Field label="Expires At">
            <input
              type="datetime-local"
              value={
                expiresAt
              }
              onChange={(
                event,
              ) =>
                setExpiresAt(
                  event
                    .target
                    .value,
                )
              }
              className={
                inputClassName
              }
            />
          </Field>
        </div>
      </Section>

      <Section
        title="Source and Metadata"
        icon={
          <FileJson className="size-4" />
        }
      >
        <div className="grid gap-5">
          <Field label="Source">
            <select
              value={
                source
              }
              onChange={(
                event,
              ) =>
                setSource(
                  event
                    .target
                    .value as NowSource,
                )
              }
              className={
                inputClassName
              }
            >
              {sourceOptions.map(
                (
                  option,
                ) => (
                  <option
                    key={
                      option.value
                    }
                    value={
                      option.value
                    }
                  >
                    {
                      option.label
                    }
                  </option>
                ),
              )}
            </select>
          </Field>

          <Field
            label="Metadata"
            description="Enter a valid JSON object."
          >
            <textarea
              value={
                metadataText
              }
              onChange={(
                event,
              ) =>
                setMetadataText(
                  event
                    .target
                    .value,
                )
              }
              spellCheck={
                false
              }
              className={`${textareaClassName} min-h-48 font-mono text-xs`}
            />
          </Field>
        </div>
      </Section>

      <div className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#030608]/90 px-4 py-4 backdrop-blur-xl lg:left-64">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-white">
              New Now status
            </p>

            <p className="mt-0.5 text-xs text-white/40">
              Saving creates a new status and preserves the previous one in history.
            </p>
          </div>

          <button
            type="submit"
            disabled={
              isSubmitting
            }
            className="ml-auto inline-flex min-w-48 items-center justify-center gap-2 rounded-xl bg-[#C6FF32] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#D5FF65] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" />
            ) : (
              <Save className="size-4" />
            )}

            {isSubmitting
              ? "Creating..."
              : "Create New Now Status"}
          </button>
        </div>
      </div>
    </form>
  );
}