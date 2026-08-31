"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import {
  completeMediaProduction,
  generateMediaProductionPack,
  updateMediaProductionAsset,
} from "@/lib/api/media";
import type {
  MediaAsset,
  MediaPlatform,
  MediaProductionOverview,
  MediaProductionStatus,
  MediaProductionStudioItem,
} from "@/types/media";

const statusOrder: MediaProductionStatus[] = [
  "assets_pending",
  "not_started",
  "planning",
  "plan_ready",
  "ready",
  "complete",
  "blocked",
];

const statusLabel: Record<MediaProductionStatus, string> = {
  not_started: "Not started",
  planning: "Planning",
  plan_ready: "Plan ready",
  assets_pending: "Assets pending",
  ready: "Ready",
  complete: "Complete",
  blocked: "Blocked",
};

export function MediaProductionStudioManager({
  overview,
  initialItems,
}: {
  overview: MediaProductionOverview;
  initialItems: MediaProductionStudioItem[];
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  const [busyId, setBusyId] = useState("");
  const [error, setError] = useState("");
  const [status, setStatus] = useState<MediaProductionStatus | "all">("all");
  const [platform, setPlatform] = useState<MediaPlatform | "all">("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [instructions, setInstructions] = useState<Record<string, string>>({});

  const platforms = useMemo(
    () =>
      Array.from(new Set(items.map((item) => item.publication.platform))).sort(),
    [items],
  );

  const filtered = useMemo(
    () =>
      items.filter(
        (item) =>
          (status === "all" || item.publication.productionStatus === status) &&
          (platform === "all" || item.publication.platform === platform),
      ),
    [items, platform, status],
  );

  function replaceItem(next: MediaProductionStudioItem) {
    setItems((current) =>
      current.map((item) =>
        item.publication._id === next.publication._id ? next : item,
      ),
    );
  }

  async function run(
    key: string,
    action: () => Promise<MediaProductionStudioItem>,
  ) {
    setBusyId(key);
    setError("");
    try {
      const result = await action();
      replaceItem(result);
      router.refresh();
    } catch (value) {
      setError(
        value instanceof Error ? value.message : "Production Studio action failed.",
      );
    } finally {
      setBusyId("");
    }
  }

  async function generate(item: MediaProductionStudioItem, force: boolean) {
    const result = await generateMediaProductionPack(item.publication._id, {
      force,
      ...(instructions[item.publication._id]?.trim()
        ? { instructions: instructions[item.publication._id].trim() }
        : {}),
    });
    return result;
  }

  async function updateAsset(
    item: MediaProductionStudioItem,
    asset: MediaAsset,
    nextStatus: "planned" | "ready",
  ) {
    setBusyId(asset._id);
    setError("");
    try {
      const result = await updateMediaProductionAsset(asset._id, {
        status: nextStatus,
      });
      if (result.publication && result.contentItem && result.assets && result.readiness) {
        replaceItem({
          publication: result.publication,
          contentItem: result.contentItem,
          assets: result.assets,
          readiness: result.readiness,
        });
      } else {
        setItems((current) =>
          current.map((entry) =>
            entry.publication._id === item.publication._id
              ? {
                  ...entry,
                  assets: entry.assets.map((existing) =>
                    existing._id === asset._id
                      ? { ...existing, status: nextStatus }
                      : existing,
                  ),
                }
              : entry,
          ),
        );
      }
      router.refresh();
    } catch (value) {
      setError(value instanceof Error ? value.message : "Asset update failed.");
    } finally {
      setBusyId("");
    }
  }

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
        <Stat label="Publications" value={overview.totalPublications} />
        <Stat label="Not started" value={overview.counts.not_started ?? 0} />
        <Stat label="Assets pending" value={overview.counts.assets_pending ?? 0} />
        <Stat label="Ready" value={overview.counts.ready ?? 0} />
        <Stat label="Ready for calendar" value={overview.readyForCalendar} accent />
      </div>

      <section className="rounded-[24px] border border-[#C6FF32]/20 bg-[#C6FF32]/[0.035] p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#C6FF32]">
              HSAKAA production boundary
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.04em]">
              Production-ready, never auto-published
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/45">
              HSAKAA turns approved platform drafts into scripts, shots, B-roll,
              carousel direction, thumbnails, camera/edit instructions and concrete
              asset requirements. Scheduling and publishing remain outside this stage.
            </p>
          </div>
          <Link
            href="/admin/hsakaa/chat"
            className="rounded-xl bg-[#C6FF32] px-4 py-3 text-sm font-black text-black"
          >
            Direct production in HSAKAA
          </Link>
        </div>
      </section>

      <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-4 sm:p-5">
        <div className="grid gap-3 md:grid-cols-2">
          <select
            value={status}
            onChange={(event) =>
              setStatus(event.target.value as MediaProductionStatus | "all")
            }
            className="rounded-xl border border-white/10 bg-[#090d10] px-3 py-3 text-sm"
          >
            <option value="all">All production states</option>
            {statusOrder.map((item) => (
              <option key={item} value={item}>
                {statusLabel[item]}
              </option>
            ))}
          </select>
          <select
            value={platform}
            onChange={(event) =>
              setPlatform(event.target.value as MediaPlatform | "all")
            }
            className="rounded-xl border border-white/10 bg-[#090d10] px-3 py-3 text-sm"
          >
            <option value="all">All platforms</option>
            {platforms.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
        </div>
      </section>

      <div className="space-y-4">
        {filtered.map((item) => {
          const publication = item.publication;
          const plan = publication.production;
          const isExpanded = expanded === publication._id;
          const generating = busyId === publication._id;
          const requiredAssets = item.assets.filter(
            (asset) => asset.generatedFromProduction && asset.required && asset.isActive !== false,
          );

          return (
            <article
              key={publication._id}
              className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5 sm:p-6"
            >
              <div className="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2 text-xs font-bold uppercase tracking-[0.12em] text-white/35">
                    <span>{publication.platform}</span>
                    <span>·</span>
                    <span>{publication.format.replaceAll("_", " ")}</span>
                    <span>·</span>
                    <StatusPill status={publication.productionStatus} />
                  </div>
                  <h3 className="mt-3 text-xl font-black tracking-[-0.03em]">
                    {publication.title || item.contentItem.title}
                  </h3>
                  <p className="mt-2 max-w-3xl text-sm leading-6 text-white/45">
                    {item.contentItem.thesis || publication.description || "No thesis recorded."}
                  </p>
                  <div className="mt-3 text-xs text-white/35">
                    Production v{publication.productionVersion ?? 0} · {item.readiness.readyAssets}/
                    {item.readiness.requiredAssets} required assets ready
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => setExpanded(isExpanded ? null : publication._id)}
                    className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white/70"
                  >
                    {isExpanded ? "Hide pack" : "View pack"}
                  </button>
                  <button
                    type="button"
                    disabled={generating}
                    onClick={() =>
                      run(publication._id, () => generate(item, Boolean(plan)))
                    }
                    className="rounded-xl border border-[#C6FF32]/30 px-4 py-2 text-sm font-black text-[#C6FF32] disabled:opacity-40"
                  >
                    {generating
                      ? "HSAKAA preparing…"
                      : plan
                        ? "Regenerate pack"
                        : "Generate production pack"}
                  </button>
                  {item.readiness.ready && publication.productionStatus !== "complete" ? (
                    <button
                      type="button"
                      disabled={busyId === `${publication._id}:complete`}
                      onClick={() =>
                        run(`${publication._id}:complete`, () =>
                          completeMediaProduction(publication._id),
                        )
                      }
                      className="rounded-xl bg-[#C6FF32] px-4 py-2 text-sm font-black text-black"
                    >
                      Mark complete
                    </button>
                  ) : null}
                </div>
              </div>

              {plan ? (
                <div className="mt-5 grid gap-3 md:grid-cols-4">
                  <MiniStat label="Shots" value={plan.shotList.length} />
                  <MiniStat label="B-roll" value={plan.broll.length} />
                  <MiniStat label="Slides" value={plan.carouselSlides.length} />
                  <MiniStat label="Assets" value={requiredAssets.length} />
                </div>
              ) : null}

              <div className="mt-5">
                <label className="text-xs font-bold uppercase tracking-[0.14em] text-white/35">
                  Extra direction for HSAKAA
                </label>
                <input
                  value={instructions[publication._id] ?? ""}
                  onChange={(event) =>
                    setInstructions((current) => ({
                      ...current,
                      [publication._id]: event.target.value,
                    }))
                  }
                  placeholder="Optional: keep this one-take, use desk setup, avoid B-roll, etc."
                  className="mt-2 w-full rounded-xl border border-white/10 bg-white/[0.025] px-4 py-3 text-sm outline-none placeholder:text-white/20 focus:border-[#C6FF32]/40"
                />
              </div>

              {isExpanded ? (
                <div className="mt-6 space-y-5 border-t border-white/[0.07] pt-6">
                  {!plan ? (
                    <EmptyPack />
                  ) : (
                    <>
                      <TextSection title="Final script" text={plan.finalScript} />
                      <TextSection
                        title="Teleprompter version"
                        text={plan.teleprompterScript}
                      />

                      {plan.talkingPoints.length ? (
                        <ListSection title="Talking points" items={plan.talkingPoints} />
                      ) : null}

                      {plan.shotList.length ? (
                        <section>
                          <SectionTitle>Shot list</SectionTitle>
                          <div className="mt-3 space-y-2">
                            {plan.shotList.map((shot) => (
                              <div
                                key={`${shot.order}-${shot.label}`}
                                className="rounded-xl border border-white/[0.07] p-4"
                              >
                                <div className="font-bold">
                                  {shot.order}. {shot.label}
                                </div>
                                <div className="mt-2 text-sm leading-6 text-white/50">
                                  {[shot.framing, shot.action, shot.dialogue]
                                    .filter(Boolean)
                                    .join(" · ")}
                                </div>
                                {shot.equipment.length ? (
                                  <div className="mt-2 text-xs text-white/35">
                                    Equipment: {shot.equipment.join(", ")}
                                  </div>
                                ) : null}
                              </div>
                            ))}
                          </div>
                        </section>
                      ) : null}

                      {plan.broll.length ? (
                        <section>
                          <SectionTitle>B-roll</SectionTitle>
                          <div className="mt-3 grid gap-2 md:grid-cols-2">
                            {plan.broll.map((shot) => (
                              <div
                                key={`${shot.order}-${shot.description}`}
                                className="rounded-xl border border-white/[0.07] p-4 text-sm"
                              >
                                <div className="font-bold">{shot.description}</div>
                                <div className="mt-1 text-white/40">
                                  {shot.purpose || "Supporting visual"} · {shot.source}
                                </div>
                              </div>
                            ))}
                          </div>
                        </section>
                      ) : null}

                      {plan.carouselSlides.length ? (
                        <section>
                          <SectionTitle>Carousel</SectionTitle>
                          <div className="mt-3 grid gap-2 md:grid-cols-2">
                            {plan.carouselSlides.map((slide) => (
                              <div
                                key={slide.slideNumber}
                                className="rounded-xl border border-white/[0.07] p-4"
                              >
                                <div className="text-xs font-black text-[#C6FF32]">
                                  SLIDE {slide.slideNumber}
                                </div>
                                <div className="mt-2 font-black">{slide.headline}</div>
                                {slide.body ? (
                                  <div className="mt-2 text-sm leading-6 text-white/50">
                                    {slide.body}
                                  </div>
                                ) : null}
                                {slide.visualDirection ? (
                                  <div className="mt-2 text-xs text-white/35">
                                    Visual: {slide.visualDirection}
                                  </div>
                                ) : null}
                              </div>
                            ))}
                          </div>
                        </section>
                      ) : null}

                      <DirectionGrid item={item} />

                      <section>
                        <SectionTitle>Asset requirements</SectionTitle>
                        <div className="mt-3 space-y-2">
                          {requiredAssets.length ? (
                            requiredAssets.map((asset) => (
                              <div
                                key={asset._id}
                                className="flex flex-col gap-3 rounded-xl border border-white/[0.07] p-4 md:flex-row md:items-center md:justify-between"
                              >
                                <div>
                                  <div className="font-bold">
                                    {asset.role || asset.productionRequirementKey || asset.type}
                                  </div>
                                  <div className="mt-1 text-xs text-white/40">
                                    {asset.type} · {asset.source} · {asset.status}
                                  </div>
                                  {asset.notes ? (
                                    <div className="mt-2 text-sm text-white/45">{asset.notes}</div>
                                  ) : null}
                                </div>
                                <button
                                  type="button"
                                  disabled={busyId === asset._id}
                                  onClick={() =>
                                    updateAsset(
                                      item,
                                      asset,
                                      asset.status === "ready" ? "planned" : "ready",
                                    )
                                  }
                                  className={
                                    asset.status === "ready"
                                      ? "rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white/60"
                                      : "rounded-xl bg-[#C6FF32] px-4 py-2 text-sm font-black text-black"
                                  }
                                >
                                  {asset.status === "ready" ? "Mark pending" : "Mark ready"}
                                </button>
                              </div>
                            ))
                          ) : (
                            <div className="rounded-xl border border-dashed border-white/10 p-5 text-sm text-white/35">
                              No production assets required for this execution.
                            </div>
                          )}
                        </div>
                      </section>

                      {plan.equipment.length ? (
                        <ListSection title="Equipment" items={plan.equipment} />
                      ) : null}
                      {plan.publishChecklist.length ? (
                        <ListSection title="Pre-calendar checklist" items={plan.publishChecklist} />
                      ) : null}
                      {plan.risks.length ? (
                        <ListSection title="Production risks" items={plan.risks} attention />
                      ) : null}
                      <TextSection title="Production notes" text={plan.notes} />
                    </>
                  )}
                </div>
              ) : null}
            </article>
          );
        })}

        {!filtered.length ? (
          <div className="rounded-[24px] border border-dashed border-white/10 p-10 text-center text-sm text-white/35">
            No publications match these production filters.
          </div>
        ) : null}
      </div>
    </div>
  );
}

function DirectionGrid({ item }: { item: MediaProductionStudioItem }) {
  const plan = item.publication.production;
  if (!plan) return null;
  const cards = [
    ["Thumbnail", plan.thumbnail?.concept || plan.thumbnail?.headline],
    [
      "Visual direction",
      [plan.visualDirection?.aspectRatio, plan.visualDirection?.lighting, plan.visualDirection?.background]
        .filter(Boolean)
        .join(" · "),
    ],
    [
      "Camera / audio",
      [plan.cameraInstructions?.framing, plan.cameraInstructions?.audio, plan.cameraInstructions?.lighting]
        .filter(Boolean)
        .join(" · "),
    ],
    [
      "Edit",
      [plan.editInstructions?.pacing, plan.editInstructions?.captions, plan.editInstructions?.graphics]
        .filter(Boolean)
        .join(" · "),
    ],
  ].filter((item): item is [string, string] => Boolean(item[1]));
  if (!cards.length) return null;
  return (
    <section>
      <SectionTitle>Production direction</SectionTitle>
      <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {cards.map(([label, value]) => (
          <div key={label} className="rounded-xl border border-white/[0.07] p-4">
            <div className="text-xs font-bold uppercase tracking-[0.14em] text-white/30">
              {label}
            </div>
            <div className="mt-2 text-sm leading-6 text-white/60">{value}</div>
          </div>
        ))}
      </div>
    </section>
  );
}

function EmptyPack() {
  return (
    <div className="rounded-xl border border-dashed border-white/10 p-8 text-center">
      <div className="font-black">No production pack yet</div>
      <div className="mt-2 text-sm text-white/35">
        Ask HSAKAA to make this publication production-ready.
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  accent = false,
}: {
  label: string;
  value: number | string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-[20px] border p-5 ${
        accent
          ? "border-[#C6FF32]/20 bg-[#C6FF32]/[0.035]"
          : "border-white/10 bg-white/[0.025]"
      }`}
    >
      <div className="text-xs font-bold uppercase tracking-[0.14em] text-white/35">
        {label}
      </div>
      <div className={`mt-3 text-3xl font-black ${accent ? "text-[#C6FF32]" : ""}`}>
        {value}
      </div>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: number }) {
  return (
    <div className="rounded-xl border border-white/[0.07] px-4 py-3">
      <div className="text-xs text-white/30">{label}</div>
      <div className="mt-1 text-lg font-black">{value}</div>
    </div>
  );
}

function StatusPill({ status }: { status: MediaProductionStatus }) {
  return (
    <span
      className={`rounded-full px-2.5 py-1 text-[10px] font-black ${
        status === "ready" || status === "complete"
          ? "bg-[#C6FF32]/10 text-[#C6FF32]"
          : status === "blocked"
            ? "bg-red-400/10 text-red-300"
            : "bg-white/[0.05] text-white/45"
      }`}
    >
      {statusLabel[status]}
    </span>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <h4 className="text-sm font-black uppercase tracking-[0.13em] text-white/50">{children}</h4>;
}

function TextSection({ title, text }: { title: string; text?: string }) {
  if (!text?.trim()) return null;
  return (
    <section>
      <SectionTitle>{title}</SectionTitle>
      <div className="mt-3 whitespace-pre-wrap rounded-xl border border-white/[0.07] bg-black/10 p-4 text-sm leading-7 text-white/65">
        {text}
      </div>
    </section>
  );
}

function ListSection({
  title,
  items,
  attention = false,
}: {
  title: string;
  items: string[];
  attention?: boolean;
}) {
  return (
    <section>
      <SectionTitle>{title}</SectionTitle>
      <div className="mt-3 space-y-2">
        {items.map((item, index) => (
          <div
            key={`${index}-${item}`}
            className={`rounded-xl border px-4 py-3 text-sm leading-6 ${
              attention
                ? "border-amber-300/15 bg-amber-300/[0.035] text-amber-100/70"
                : "border-white/[0.07] text-white/55"
            }`}
          >
            {item}
          </div>
        ))}
      </div>
    </section>
  );
}
