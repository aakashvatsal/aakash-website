"use client";

import { type FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

import { createMediaPost, updateMediaPost } from "@/lib/api/media";
import { AdminFormFooter } from "../AdminFormFooter";
import type {
  MediaPost,
  CreateMediaPostPayload,
  MediaGoal,
  MediaOutcomeStatus,
  MediaPlatform,
  MediaPostStatus,
  MediaPostType,
  MediaSourceType,
} from "@/types/media";

interface MediaFormProps {
  mode?: "create" | "edit";
  initialData?: MediaPost;
}

const platforms: MediaPlatform[] = [
  "linkedin",
  "instagram",
  "youtube",
  "x",
  "facebook",
  "threads",
];

const postTypes: MediaPostType[] = [
  "text",
  "image",
  "carousel",
  "reel",
  "video",
  "short",
  "story",
  "article",
  "poll",
];

const statuses: MediaPostStatus[] = [
  "idea",
  "draft",
  "script_ready",
  "assets_pending",
  "ready",
  "scheduled",
  "posted",
  "failed",
  "cancelled",
];

const goals: MediaGoal[] = [
  "awareness",
  "engagement",
  "education",
  "lead_generation",
  "authority",
  "community",
  "product_promotion",
  "recruitment",
  "personal_brand",
];

const sourceTypes: MediaSourceType[] = [
  "real",
  "ai_generated",
  "designed_graphic",
  "stock",
  "screen_recording",
  "none",
];

const outcomeStatuses: MediaOutcomeStatus[] = [
  "not_measured",
  "below_expectation",
  "met_expectation",
  "above_expectation",
];

function formatLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function splitLines(value: string): string[] {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function splitCommaSeparated(value: string): string[] {
  return value
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
}

function toApiDateTime(value: string): string | undefined {
  if (!value) {
    return undefined;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return undefined;
  }

  return date.toISOString();
}

function todayInputValue() {
  const date = new Date();

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function toDateInputValue(value?: string) {
  if (!value) {
    return todayInputValue();
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return todayInputValue();
  }

  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function toDateTimeLocalValue(value?: string) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);

  return localDate.toISOString().slice(0, 16);
}

function joinLines(value?: string[]) {
  return value?.join("\n") ?? "";
}

function joinCommaSeparated(value?: string[]) {
  return value?.join(", ") ?? "";
}

export function MediaForm({ mode = "create", initialData }: MediaFormProps) {
  const router = useRouter();

  const [isSubmitting, setIsSubmitting] = useState(false);

  const saving = isSubmitting;
  const isEditMode = mode === "edit";

  const [error, setError] = useState("");

  const [date, setDate] = useState(toDateInputValue(initialData?.date));

  const [platform, setPlatform] = useState<MediaPlatform>(
    initialData?.platform ?? "linkedin",
  );

  const [postType, setPostType] = useState<MediaPostType>(
    initialData?.postType ?? "text",
  );

  const [status, setStatus] = useState<MediaPostStatus>(
    initialData?.publishing?.status ?? "idea",
  );

  const [companyId, setCompanyId] = useState(initialData?.companyId ?? "");

  const [title, setTitle] = useState(initialData?.content?.title ?? "");
  const [hook, setHook] = useState(initialData?.content?.hook ?? "");

  const [shortDescription, setShortDescription] = useState(
    initialData?.content?.shortDescription ?? "",
  );

  const [detailedDescription, setDetailedDescription] = useState(
    initialData?.content?.detailedDescription ?? "",
  );

  const [caption, setCaption] = useState(initialData?.content?.caption ?? "");

  const [textPostScript, setTextPostScript] = useState(
    initialData?.content?.textPostScript ?? "",
  );

  const [videoScript, setVideoScript] = useState(
    initialData?.content?.videoScript ?? "",
  );

  const [voiceOverScript, setVoiceOverScript] = useState(
    initialData?.content?.voiceOverScript ?? "",
  );

  const [carouselSlides, setCarouselSlides] = useState(
    joinLines(initialData?.content?.carouselSlides),
  );

  const [shotList, setShotList] = useState(
    joinLines(initialData?.content?.shotList),
  );

  const [hashtags, setHashtags] = useState(
    joinCommaSeparated(initialData?.content?.hashtags),
  );

  const [cta, setCta] = useState(initialData?.content?.cta ?? "");

  const [primaryGoal, setPrimaryGoal] = useState<MediaGoal>(
    initialData?.strategy?.primaryGoal ?? "awareness",
  );

  const [secondaryGoals, setSecondaryGoals] = useState<MediaGoal[]>(
    initialData?.strategy?.secondaryGoals ?? [],
  );

  const [whyChosen, setWhyChosen] = useState(
    initialData?.strategy?.whyChosen ?? "",
  );

  const [targetAudience, setTargetAudience] = useState(
    initialData?.strategy?.targetAudience ?? "",
  );

  const [audienceProblem, setAudienceProblem] = useState(
    initialData?.strategy?.audienceProblem ?? "",
  );

  const [coreMessage, setCoreMessage] = useState(
    initialData?.strategy?.coreMessage ?? "",
  );

  const [contentPillar, setContentPillar] = useState(
    initialData?.strategy?.contentPillar ?? "",
  );

  const [desiredAudienceAction, setDesiredAudienceAction] = useState(
    initialData?.strategy?.desiredAudienceAction ?? "",
  );

  const [hypothesis, setHypothesis] = useState(
    initialData?.strategy?.hypothesis ?? "",
  );

  const [imageSource, setImageSource] = useState<MediaSourceType>(
    initialData?.creative?.imageSource ?? "none",
  );

  const [videoSource, setVideoSource] = useState<MediaSourceType>(
    initialData?.creative?.videoSource ?? "none",
  );

  const [designBrief, setDesignBrief] = useState(
    initialData?.creative?.designBrief ?? "",
  );

  const [imagePrompt, setImagePrompt] = useState(
    initialData?.creative?.imagePrompt ?? "",
  );

  const [thumbnailPrompt, setThumbnailPrompt] = useState(
    initialData?.creative?.thumbnailPrompt ?? "",
  );

  const [aiImagePrompt, setAiImagePrompt] = useState(
    initialData?.creative?.aiImagePrompt ?? "",
  );

  const [aiVideoPrompt, setAiVideoPrompt] = useState(
    initialData?.creative?.aiVideoPrompt ?? "",
  );

  const [realImageScript, setRealImageScript] = useState(
    initialData?.creative?.realImageScript ?? "",
  );

  const [realVideoScript, setRealVideoScript] = useState(
    initialData?.creative?.realVideoScript ?? "",
  );

  const [brollScript, setBrollScript] = useState(
    initialData?.creative?.brollScript ?? "",
  );

  const [requiredAssets, setRequiredAssets] = useState(
    joinLines(initialData?.creative?.requiredAssets),
  );

  const [assetUrls, setAssetUrls] = useState(
    joinLines(initialData?.creative?.assetUrls),
  );

  const [equipmentRequired, setEquipmentRequired] = useState(
    joinLines(initialData?.creative?.equipmentRequired),
  );

  const [permissionRequired, setPermissionRequired] = useState(
    initialData?.creative?.permissionRequired ?? false,
  );

  const [permissionTaken, setPermissionTaken] = useState(
    initialData?.creative?.permissionTaken ?? false,
  );

  const [permissionNotes, setPermissionNotes] = useState(
    initialData?.creative?.permissionNotes ?? "",
  );

  const [scheduledAt, setScheduledAt] = useState(
    toDateTimeLocalValue(initialData?.publishing?.scheduledAt),
  );

  const [publishedAt, setPublishedAt] = useState(
    toDateTimeLocalValue(initialData?.publishing?.publishedAt),
  );

  const [externalPostUrl, setExternalPostUrl] = useState(
    initialData?.publishing?.externalPostUrl ?? "",
  );

  const [platformPostId, setPlatformPostId] = useState(
    initialData?.publishing?.platformPostId ?? "",
  );

  const [platformAccountId, setPlatformAccountId] = useState(
    initialData?.publishing?.platformAccountId ?? "",
  );

  const [platformMediaId, setPlatformMediaId] = useState(
    initialData?.publishing?.platformMediaId ?? "",
  );

  const [analyticsUrl, setAnalyticsUrl] = useState(
    initialData?.publishing?.analyticsUrl ?? "",
  );

  const [errorMessage, setErrorMessage] = useState(
    initialData?.publishing?.errorMessage ?? "",
  );

  const [expectationSummary, setExpectationSummary] = useState(
    initialData?.expectation?.summary ?? "",
  );

  const [evaluationAfterHours, setEvaluationAfterHours] = useState(
    initialData?.expectation?.evaluationAfterHours ?? 72,
  );

  const [expectationMetrics, setExpectationMetrics] = useState<
    Array<{
      metric: string;
      expectedValue: string;
      unit: string;
    }>
  >(
    initialData?.expectation?.metrics?.map((metric) => ({
      metric: metric.metric,
      expectedValue: String(metric.expectedValue),
      unit: metric.unit ?? "",
    })) ?? [],
  );

  const [outcomeStatus, setOutcomeStatus] = useState<MediaOutcomeStatus>(
    initialData?.outcome?.status ?? "not_measured",
  );

  const [resultSummary, setResultSummary] = useState(
    initialData?.outcome?.resultSummary ?? "",
  );

  const [expectationResult, setExpectationResult] = useState(
    initialData?.outcome?.expectationResult ?? "",
  );

  const [whatWorked, setWhatWorked] = useState(
    initialData?.outcome?.whatWorked ?? "",
  );

  const [whatDidNotWork, setWhatDidNotWork] = useState(
    initialData?.outcome?.whatDidNotWork ?? "",
  );

  const [lessonLearned, setLessonLearned] = useState(
    initialData?.outcome?.lessonLearned ?? "",
  );

  const [nextAction, setNextAction] = useState(
    initialData?.outcome?.nextAction ?? "",
  );

  const [contentScore, setContentScore] = useState(
    initialData?.outcome?.contentScore != null
      ? String(initialData.outcome.contentScore)
      : "",
  );

  const [evaluatedAt, setEvaluatedAt] = useState(
    toDateTimeLocalValue(initialData?.outcome?.evaluatedAt),
  );

  const [analyticsSyncEnabled, setAnalyticsSyncEnabled] = useState(
    initialData?.analyticsSync?.enabled ?? false,
  );

  const [syncAttempts, setSyncAttempts] = useState(
    initialData?.analyticsSync?.syncAttempts ?? 0,
  );

  const [lastSyncedAt, setLastSyncedAt] = useState(
    toDateTimeLocalValue(initialData?.analyticsSync?.lastSyncedAt),
  );

  const [nextSyncAt, setNextSyncAt] = useState(
    toDateTimeLocalValue(initialData?.analyticsSync?.nextSyncAt),
  );

  const [lastSyncError, setLastSyncError] = useState(
    initialData?.analyticsSync?.lastSyncError ?? "",
  );

  const [isActive, setIsActive] = useState(initialData?.isActive ?? true);

  const [isArchived, setIsArchived] = useState(
    initialData?.isArchived ?? false,
  );

  function toggleSecondaryGoal(goal: MediaGoal) {
    setSecondaryGoals((current) => {
      if (current.includes(goal)) {
        return current.filter((item) => item !== goal);
      }

      return [...current, goal];
    });
  }

  function addExpectationMetric() {
    setExpectationMetrics((current) => [
      ...current,
      {
        metric: "",
        expectedValue: "",
        unit: "",
      },
    ]);
  }

  function updateExpectationMetric(
    index: number,
    field: "metric" | "expectedValue" | "unit",
    value: string,
  ) {
    setExpectationMetrics((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index
          ? {
              ...item,
              [field]: value,
            }
          : item,
      ),
    );
  }

  function removeExpectationMetric(index: number) {
    setExpectationMetrics((current) =>
      current.filter((_, itemIndex) => itemIndex !== index),
    );
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!title.trim()) {
      setError("Title is required.");
      return;
    }

    if (!date) {
      setError("Content date is required.");
      return;
    }

    if (!whyChosen.trim()) {
      setError("Why this content was chosen is required.");
      return;
    }

    setError("");
    setIsSubmitting(true);

    try {
      const payload: CreateMediaPostPayload = {
        companyId: companyId.trim() || undefined,

        date: new Date(`${date}T00:00:00`).toISOString(),

        platform,
        postType,

        strategy: {
          primaryGoal,
          secondaryGoals,
          whyChosen: whyChosen.trim(),

          targetAudience: targetAudience.trim() || undefined,

          audienceProblem: audienceProblem.trim() || undefined,

          coreMessage: coreMessage.trim() || undefined,

          contentPillar: contentPillar.trim() || undefined,

          desiredAudienceAction: desiredAudienceAction.trim() || undefined,

          hypothesis: hypothesis.trim() || undefined,
        },

        content: {
          title: title.trim(),

          hook: hook.trim() || undefined,

          shortDescription: shortDescription.trim() || undefined,

          detailedDescription: detailedDescription.trim() || undefined,

          caption: caption.trim() || undefined,

          textPostScript: textPostScript.trim() || undefined,

          videoScript: videoScript.trim() || undefined,

          voiceOverScript: voiceOverScript.trim() || undefined,

          carouselSlides: splitLines(carouselSlides),

          shotList: splitLines(shotList),

          hashtags: splitCommaSeparated(hashtags),

          cta: cta.trim() || undefined,
        },

        creative: {
          imageSource,
          videoSource,

          designBrief: designBrief.trim() || undefined,

          imagePrompt: imagePrompt.trim() || undefined,

          thumbnailPrompt: thumbnailPrompt.trim() || undefined,

          aiImagePrompt: aiImagePrompt.trim() || undefined,

          aiVideoPrompt: aiVideoPrompt.trim() || undefined,

          realImageScript: realImageScript.trim() || undefined,

          realVideoScript: realVideoScript.trim() || undefined,

          brollScript: brollScript.trim() || undefined,

          requiredAssets: splitLines(requiredAssets),

          assetUrls: splitLines(assetUrls),

          equipmentRequired: splitLines(equipmentRequired),

          permissionRequired,
          permissionTaken,

          permissionNotes: permissionNotes.trim() || undefined,
        },

        publishing: {
          status,

          scheduledAt: toApiDateTime(scheduledAt),

          publishedAt: toApiDateTime(publishedAt),

          externalPostUrl: externalPostUrl.trim() || undefined,

          platformPostId: platformPostId.trim() || undefined,

          platformAccountId: platformAccountId.trim() || undefined,

          platformMediaId: platformMediaId.trim() || undefined,

          analyticsUrl: analyticsUrl.trim() || undefined,

          errorMessage: errorMessage.trim() || undefined,
        },

        expectation: {
          summary: expectationSummary.trim() || undefined,

          metrics: expectationMetrics
            .filter(
              (metric) => metric.metric.trim() && metric.expectedValue !== "",
            )
            .map((metric) => ({
              metric: metric.metric.trim(),

              expectedValue: Number(metric.expectedValue),

              unit: metric.unit.trim() || undefined,
            })),

          evaluationAfterHours: Number(evaluationAfterHours) || 72,
        },

        outcome: {
          status: outcomeStatus,

          resultSummary: resultSummary.trim() || undefined,

          expectationResult: expectationResult.trim() || undefined,

          whatWorked: whatWorked.trim() || undefined,

          whatDidNotWork: whatDidNotWork.trim() || undefined,

          lessonLearned: lessonLearned.trim() || undefined,

          nextAction: nextAction.trim() || undefined,

          contentScore: contentScore === "" ? undefined : Number(contentScore),

          evaluatedAt: toApiDateTime(evaluatedAt),
        },

        analyticsSync: {
          enabled: analyticsSyncEnabled,

          lastSyncedAt: toApiDateTime(lastSyncedAt),

          nextSyncAt: toApiDateTime(nextSyncAt),

          lastSyncError: lastSyncError.trim() || undefined,

          syncAttempts: Number(syncAttempts) || 0,
        },

        memoryIds: [],
        metadata: {},

        isActive,
        isArchived,
      };

      const savedPost =
        mode === "edit" && initialData
          ? await updateMediaPost(initialData._id, payload)
          : await createMediaPost(payload);

      router.push(`/admin/media/${savedPost._id}`);

      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : mode === "edit"
            ? "Unable to update media post."
            : "Unable to create media post.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-2xl border border-red-400/20 bg-red-400/10 px-5 py-4 text-sm leading-6 text-red-200">
          {error}
        </div>
      )}

      <FormSection
        title="Basic information"
        description="Set the platform, content type and main title."
      >
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          <Field label="Content date" required>
            <input
              type="date"
              value={date}
              onChange={(event) => setDate(event.target.value)}
              required
              className={inputClassName}
            />
          </Field>

          <Field label="Platform" required>
            <select
              value={platform}
              onChange={(event) =>
                setPlatform(event.target.value as MediaPlatform)
              }
              className={inputClassName}
            >
              {platforms.map((item) => (
                <option key={item} value={item}>
                  {formatLabel(item)}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Post type" required>
            <select
              value={postType}
              onChange={(event) =>
                setPostType(event.target.value as MediaPostType)
              }
              className={inputClassName}
            >
              {postTypes.map((item) => (
                <option key={item} value={item}>
                  {formatLabel(item)}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Company ID">
            <input
              value={companyId}
              onChange={(event) => setCompanyId(event.target.value)}
              placeholder="Optional"
              className={inputClassName}
            />
          </Field>
        </div>

        <div className="mt-5">
          <Field label="Title" required>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Enter post title"
              required
              className={inputClassName}
            />
          </Field>
        </div>

        <div className="mt-5">
          <Field label="Hook">
            <textarea
              value={hook}
              onChange={(event) => setHook(event.target.value)}
              rows={3}
              placeholder="Opening hook"
              className={textareaClassName}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection
        title="Strategy"
        description="Define why this post exists and who it is for."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Primary goal" required>
            <select
              value={primaryGoal}
              onChange={(event) =>
                setPrimaryGoal(event.target.value as MediaGoal)
              }
              className={inputClassName}
            >
              {goals.map((goal) => (
                <option key={goal} value={goal}>
                  {formatLabel(goal)}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Content pillar">
            <input
              value={contentPillar}
              onChange={(event) => setContentPillar(event.target.value)}
              placeholder="Technology, leadership..."
              className={inputClassName}
            />
          </Field>
        </div>

        <div className="mt-5">
          <Field label="Secondary goals">
            <div className="flex flex-wrap gap-3">
              {goals.map((goal) => {
                const selected = secondaryGoals.includes(goal);

                return (
                  <button
                    key={goal}
                    type="button"
                    onClick={() => toggleSecondaryGoal(goal)}
                    className={
                      selected
                        ? "rounded-full border border-[#C6FF32]/30 bg-[#C6FF32]/10 px-4 py-2 text-xs font-bold text-[#C6FF32]"
                        : "rounded-full border border-white/10 bg-white/[0.03] px-4 py-2 text-xs font-bold text-white/45"
                    }
                  >
                    {formatLabel(goal)}
                  </button>
                );
              })}
            </div>
          </Field>
        </div>

        <div className="mt-5">
          <Field label="Why chosen" required>
            <textarea
              value={whyChosen}
              onChange={(event) => setWhyChosen(event.target.value)}
              rows={4}
              required
              className={textareaClassName}
            />
          </Field>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Field label="Target audience">
            <textarea
              value={targetAudience}
              onChange={(event) => setTargetAudience(event.target.value)}
              rows={3}
              className={textareaClassName}
            />
          </Field>

          <Field label="Audience problem">
            <textarea
              value={audienceProblem}
              onChange={(event) => setAudienceProblem(event.target.value)}
              rows={3}
              className={textareaClassName}
            />
          </Field>

          <Field label="Core message">
            <textarea
              value={coreMessage}
              onChange={(event) => setCoreMessage(event.target.value)}
              rows={3}
              className={textareaClassName}
            />
          </Field>

          <Field label="Desired action">
            <textarea
              value={desiredAudienceAction}
              onChange={(event) => setDesiredAudienceAction(event.target.value)}
              rows={3}
              className={textareaClassName}
            />
          </Field>
        </div>

        <div className="mt-5">
          <Field label="Hypothesis">
            <textarea
              value={hypothesis}
              onChange={(event) => setHypothesis(event.target.value)}
              rows={3}
              className={textareaClassName}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection
        title="Content"
        description="Write the post copy, scripts and supporting content."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Short description">
            <textarea
              value={shortDescription}
              onChange={(event) => setShortDescription(event.target.value)}
              rows={4}
              className={textareaClassName}
            />
          </Field>

          <Field label="Detailed description">
            <textarea
              value={detailedDescription}
              onChange={(event) => setDetailedDescription(event.target.value)}
              rows={4}
              className={textareaClassName}
            />
          </Field>
        </div>

        <div className="mt-5">
          <Field label="Caption">
            <textarea
              value={caption}
              onChange={(event) => setCaption(event.target.value)}
              rows={8}
              className={textareaClassName}
            />
          </Field>
        </div>

        <div className="mt-5">
          <Field label="Text post script">
            <textarea
              value={textPostScript}
              onChange={(event) => setTextPostScript(event.target.value)}
              rows={10}
              className={textareaClassName}
            />
          </Field>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Field label="Video script">
            <textarea
              value={videoScript}
              onChange={(event) => setVideoScript(event.target.value)}
              rows={10}
              className={textareaClassName}
            />
          </Field>

          <Field label="Voice-over script">
            <textarea
              value={voiceOverScript}
              onChange={(event) => setVoiceOverScript(event.target.value)}
              rows={10}
              className={textareaClassName}
            />
          </Field>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Field label="Carousel slides" hint="One slide per line">
            <textarea
              value={carouselSlides}
              onChange={(event) => setCarouselSlides(event.target.value)}
              rows={8}
              className={textareaClassName}
            />
          </Field>

          <Field label="Shot list" hint="One shot per line">
            <textarea
              value={shotList}
              onChange={(event) => setShotList(event.target.value)}
              rows={8}
              className={textareaClassName}
            />
          </Field>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Field label="Hashtags" hint="Comma separated">
            <input
              value={hashtags}
              onChange={(event) => setHashtags(event.target.value)}
              placeholder="#sports, #technology"
              className={inputClassName}
            />
          </Field>

          <Field label="Call to action">
            <input
              value={cta}
              onChange={(event) => setCta(event.target.value)}
              className={inputClassName}
            />
          </Field>
        </div>
      </FormSection>

      <FormSection
        title="Creative"
        description="Plan assets, prompts, equipment and permissions."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Field label="Image source">
            <select
              value={imageSource}
              onChange={(event) =>
                setImageSource(event.target.value as MediaSourceType)
              }
              className={inputClassName}
            >
              {sourceTypes.map((item) => (
                <option key={item} value={item}>
                  {formatLabel(item)}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Video source">
            <select
              value={videoSource}
              onChange={(event) =>
                setVideoSource(event.target.value as MediaSourceType)
              }
              className={inputClassName}
            >
              {sourceTypes.map((item) => (
                <option key={item} value={item}>
                  {formatLabel(item)}
                </option>
              ))}
            </select>
          </Field>
        </div>

        <TextAreaField
          label="Design brief"
          value={designBrief}
          onChange={setDesignBrief}
        />

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <TextAreaInput
            label="Image prompt"
            value={imagePrompt}
            onChange={setImagePrompt}
          />

          <TextAreaInput
            label="Thumbnail prompt"
            value={thumbnailPrompt}
            onChange={setThumbnailPrompt}
          />

          <TextAreaInput
            label="AI image prompt"
            value={aiImagePrompt}
            onChange={setAiImagePrompt}
          />

          <TextAreaInput
            label="AI video prompt"
            value={aiVideoPrompt}
            onChange={setAiVideoPrompt}
          />

          <TextAreaInput
            label="Real image script"
            value={realImageScript}
            onChange={setRealImageScript}
          />

          <TextAreaInput
            label="Real video script"
            value={realVideoScript}
            onChange={setRealVideoScript}
          />
        </div>

        <TextAreaField
          label="B-roll script"
          value={brollScript}
          onChange={setBrollScript}
        />

        <div className="mt-5 grid gap-5 md:grid-cols-3">
          <Field label="Required assets" hint="One item per line">
            <textarea
              value={requiredAssets}
              onChange={(event) => setRequiredAssets(event.target.value)}
              rows={7}
              className={textareaClassName}
            />
          </Field>

          <Field label="Asset URLs" hint="One URL per line">
            <textarea
              value={assetUrls}
              onChange={(event) => setAssetUrls(event.target.value)}
              rows={7}
              className={textareaClassName}
            />
          </Field>

          <Field label="Equipment required" hint="One item per line">
            <textarea
              value={equipmentRequired}
              onChange={(event) => setEquipmentRequired(event.target.value)}
              rows={7}
              className={textareaClassName}
            />
          </Field>
        </div>

        <div className="mt-5 flex flex-wrap gap-6">
          <CheckboxField
            label="Permission required"
            checked={permissionRequired}
            onChange={setPermissionRequired}
          />

          <CheckboxField
            label="Permission taken"
            checked={permissionTaken}
            onChange={setPermissionTaken}
          />
        </div>

        <TextAreaField
          label="Permission notes"
          value={permissionNotes}
          onChange={setPermissionNotes}
        />
      </FormSection>

      <FormSection
        title="Publishing"
        description="Control publishing status and platform information."
      >
        <div className="grid gap-5 md:grid-cols-3">
          <Field label="Status">
            <select
              value={status}
              onChange={(event) =>
                setStatus(event.target.value as MediaPostStatus)
              }
              className={inputClassName}
            >
              {statuses.map((item) => (
                <option key={item} value={item}>
                  {formatLabel(item)}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Scheduled at">
            <input
              type="datetime-local"
              value={scheduledAt}
              onChange={(event) => setScheduledAt(event.target.value)}
              className={inputClassName}
            />
          </Field>

          <Field label="Published at">
            <input
              type="datetime-local"
              value={publishedAt}
              onChange={(event) => setPublishedAt(event.target.value)}
              className={inputClassName}
            />
          </Field>
        </div>

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <Field label="External post URL">
            <input
              type="url"
              value={externalPostUrl}
              onChange={(event) => setExternalPostUrl(event.target.value)}
              className={inputClassName}
            />
          </Field>

          <Field label="Analytics URL">
            <input
              type="url"
              value={analyticsUrl}
              onChange={(event) => setAnalyticsUrl(event.target.value)}
              className={inputClassName}
            />
          </Field>

          <Field label="Platform post ID">
            <input
              value={platformPostId}
              onChange={(event) => setPlatformPostId(event.target.value)}
              className={inputClassName}
            />
          </Field>

          <Field label="Platform account ID">
            <input
              value={platformAccountId}
              onChange={(event) => setPlatformAccountId(event.target.value)}
              className={inputClassName}
            />
          </Field>

          <Field label="Platform media ID">
            <input
              value={platformMediaId}
              onChange={(event) => setPlatformMediaId(event.target.value)}
              className={inputClassName}
            />
          </Field>
        </div>

        <TextAreaField
          label="Publishing error"
          value={errorMessage}
          onChange={setErrorMessage}
        />
      </FormSection>

      <FormSection
        title="Expectation"
        description="Define the expected result before publishing."
      >
        <TextAreaInput
          label="Expectation summary"
          value={expectationSummary}
          onChange={setExpectationSummary}
        />

        <div className="mt-5 max-w-xs">
          <Field label="Evaluate after hours">
            <input
              type="number"
              min={0}
              value={evaluationAfterHours}
              onChange={(event) =>
                setEvaluationAfterHours(Number(event.target.value))
              }
              className={inputClassName}
            />
          </Field>
        </div>

        <div className="mt-7">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-black text-white/80">
                Expected metrics
              </p>

              <p className="mt-1 text-xs text-white/35">
                Add expected views, impressions, engagement or leads.
              </p>
            </div>

            <button
              type="button"
              onClick={addExpectationMetric}
              className="rounded-xl border border-white/10 px-4 py-2 text-xs font-black uppercase tracking-[0.14em] text-white/60"
            >
              Add metric
            </button>
          </div>

          <div className="mt-4 space-y-3">
            {expectationMetrics.map((metric, index) => (
              <div
                key={index}
                className="grid gap-3 rounded-2xl border border-white/10 bg-black/20 p-4 md:grid-cols-[1.5fr_1fr_1fr_auto]"
              >
                <input
                  value={metric.metric}
                  onChange={(event) =>
                    updateExpectationMetric(index, "metric", event.target.value)
                  }
                  placeholder="Metric"
                  className={inputClassName}
                />

                <input
                  type="number"
                  value={metric.expectedValue}
                  onChange={(event) =>
                    updateExpectationMetric(
                      index,
                      "expectedValue",
                      event.target.value,
                    )
                  }
                  placeholder="Value"
                  className={inputClassName}
                />

                <input
                  value={metric.unit}
                  onChange={(event) =>
                    updateExpectationMetric(index, "unit", event.target.value)
                  }
                  placeholder="Unit"
                  className={inputClassName}
                />

                <button
                  type="button"
                  onClick={() => removeExpectationMetric(index)}
                  className="h-12 rounded-xl border border-red-400/20 px-4 text-xs font-black text-red-300"
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      </FormSection>

      <FormSection
        title="Outcome"
        description="Record actual performance after publishing."
      >
        <div className="grid gap-5 md:grid-cols-3">
          <Field label="Outcome status">
            <select
              value={outcomeStatus}
              onChange={(event) =>
                setOutcomeStatus(event.target.value as MediaOutcomeStatus)
              }
              className={inputClassName}
            >
              {outcomeStatuses.map((item) => (
                <option key={item} value={item}>
                  {formatLabel(item)}
                </option>
              ))}
            </select>
          </Field>

          <Field label="Content score">
            <input
              type="number"
              min={0}
              max={10}
              step="0.1"
              value={contentScore}
              onChange={(event) => setContentScore(event.target.value)}
              className={inputClassName}
            />
          </Field>

          <Field label="Evaluated at">
            <input
              type="datetime-local"
              value={evaluatedAt}
              onChange={(event) => setEvaluatedAt(event.target.value)}
              className={inputClassName}
            />
          </Field>
        </div>

        <TextAreaField
          label="Result summary"
          value={resultSummary}
          onChange={setResultSummary}
        />

        <TextAreaField
          label="Expectation result"
          value={expectationResult}
          onChange={setExpectationResult}
        />

        <div className="mt-5 grid gap-5 md:grid-cols-2">
          <TextAreaInput
            label="What worked"
            value={whatWorked}
            onChange={setWhatWorked}
          />

          <TextAreaInput
            label="What did not work"
            value={whatDidNotWork}
            onChange={setWhatDidNotWork}
          />

          <TextAreaInput
            label="Lesson learned"
            value={lessonLearned}
            onChange={setLessonLearned}
          />

          <TextAreaInput
            label="Next action"
            value={nextAction}
            onChange={setNextAction}
          />
        </div>
      </FormSection>

      <FormSection
        title="Analytics sync"
        description="Configure external analytics synchronization."
      >
        <CheckboxField
          label="Enable analytics sync"
          checked={analyticsSyncEnabled}
          onChange={setAnalyticsSyncEnabled}
        />

        <div className="mt-5 grid gap-5 md:grid-cols-3">
          <Field label="Last synced at">
            <input
              type="datetime-local"
              value={lastSyncedAt}
              onChange={(event) => setLastSyncedAt(event.target.value)}
              className={inputClassName}
            />
          </Field>

          <Field label="Next sync at">
            <input
              type="datetime-local"
              value={nextSyncAt}
              onChange={(event) => setNextSyncAt(event.target.value)}
              className={inputClassName}
            />
          </Field>

          <Field label="Sync attempts">
            <input
              type="number"
              min={0}
              value={syncAttempts}
              onChange={(event) => setSyncAttempts(Number(event.target.value))}
              className={inputClassName}
            />
          </Field>
        </div>

        <TextAreaField
          label="Last sync error"
          value={lastSyncError}
          onChange={setLastSyncError}
        />
      </FormSection>

      <FormSection
        title="Visibility"
        description="Control whether this record is active or archived."
      >
        <div className="flex flex-wrap gap-6">
          <CheckboxField
            label="Active"
            checked={isActive}
            onChange={setIsActive}
          />

          <CheckboxField
            label="Archived"
            checked={isArchived}
            onChange={setIsArchived}
          />
        </div>
      </FormSection>

      {/* <div className="sticky bottom-5 z-20 flex flex-col justify-between gap-4 rounded-[24px] border border-white/10 bg-[#080b0d]/95 p-4 shadow-2xl backdrop-blur md:flex-row md:items-center">
        <button
          type="button"
          onClick={() => router.back()}
          disabled={isSubmitting}
          className="h-12 rounded-2xl border border-white/10 px-6 text-xs font-black uppercase tracking-[0.16em] text-white/50 disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="h-12 rounded-2xl bg-[#C6FF32] px-8 text-xs font-black uppercase tracking-[0.16em] text-black disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting
            ? mode === "edit"
              ? "Updating..."
              : "Creating..."
            : mode === "edit"
              ? "Update media post"
              : "Create media post"}
        </button>
      </div> */}

      <AdminFormFooter
        saving={saving}
        isEditMode={isEditMode}
        createLabel="Create Post"
        updateLabel="Save Post"
      />
    </form>
  );
}

const inputClassName =
  "h-12 w-full rounded-2xl border border-white/10 bg-black/20 px-4 text-sm text-white outline-none placeholder:text-white/20 focus:border-[#C6FF32]/50";

const textareaClassName =
  "w-full resize-y rounded-2xl border border-white/10 bg-black/20 px-4 py-3 text-sm leading-7 text-white outline-none placeholder:text-white/20 focus:border-[#C6FF32]/50";

function FormSection({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[28px] border border-white/10 bg-white/[0.025] p-6 md:p-8">
      <div>
        <h2 className="text-2xl font-black tracking-[-0.04em]">{title}</h2>

        {description && (
          <p className="mt-2 text-sm leading-6 text-white/35">{description}</p>
        )}
      </div>

      <div className="mt-7">{children}</div>
    </section>
  );
}

function Field({
  label,
  hint,
  required = false,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.16em] text-white/40">
        {label}

        {required && <span className="ml-1 text-[#C6FF32]">*</span>}
      </span>

      {hint && <span className="ml-2 text-xs text-white/25">{hint}</span>}

      <div className="mt-2">{children}</div>
    </label>
  );
}

function TextAreaField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="mt-5">
      <TextAreaInput label={label} value={value} onChange={onChange} />
    </div>
  );
}

function TextAreaInput({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <Field label={label}>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        rows={5}
        className={textareaClassName}
      />
    </Field>
  );
}

function CheckboxField({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <label className="inline-flex cursor-pointer items-center gap-3">
      <input
        type="checkbox"
        checked={checked}
        onChange={(event) => onChange(event.target.checked)}
        className="h-5 w-5 accent-[#C6FF32]"
      />

      <span className="text-sm font-bold text-white/60">{label}</span>
    </label>
  );
}