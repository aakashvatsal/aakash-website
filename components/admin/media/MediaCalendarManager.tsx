"use client";

import { FormEvent, useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";

import {
  completeManualMediaPublication,
  connectMediaAccountToBuffer,
  disconnectMediaAccountFromBuffer,
  ensureMediaCalendarHorizon,
  publishMediaPublicationNow,
  reconcileMediaBufferPublications,
  reserveMediaCalendarSlot,
  retryMediaPublication,
  scheduleMediaPublication,
  syncMediaBufferAccounts,
  updateMediaCoreAccount,
} from "@/lib/api/media";
import type {
  BufferChannel,
  MediaAccount,
  MediaBufferStatus,
  MediaCalendarOverview,
  MediaCalendarSlot,
  MediaPublication,
} from "@/types/media";

export function MediaCalendarManager({
  initialOverview,
  accounts,
  publications,
  bufferStatus,
}: {
  initialOverview: MediaCalendarOverview;
  accounts: MediaAccount[];
  publications: MediaPublication[];
  bufferStatus: MediaBufferStatus;
}) {
  const router = useRouter();
  const [busyKey, setBusyKey] = useState("");
  const [error, setError] = useState("");
  const [slotSelections, setSlotSelections] = useState<Record<string, string>>({});
  const [autoPublish, setAutoPublish] = useState<Record<string, boolean>>({});

  const coverageGaps = initialOverview.coverage.filter((item) => !item.covered).length;
  const productionGaps = initialOverview.coverage.reduce(
    (sum, item) => sum + item.productionGaps,
    0,
  );
  const deliveryIssues = initialOverview.publishingQueue.filter(
    (item) => item.deliveryStatus === "failed" || item.deliveryStatus === "manual_required",
  ).length;

  const publicationMap = useMemo(
    () => new Map(publications.map((item) => [item._id, item])),
    [publications],
  );

  async function run(key: string, action: () => Promise<unknown>) {
    setBusyKey(key);
    setError("");
    try {
      await action();
      router.refresh();
    } catch (value) {
      setError(value instanceof Error ? value.message : "Media calendar action failed.");
    } finally {
      setBusyKey("");
    }
  }

  function publicationForSlot(slot: MediaCalendarSlot) {
    return slot.publication ?? (slot.publicationId ? publicationMap.get(slot.publicationId) : undefined);
  }

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Stat
          label="7-day coverage"
          value={initialOverview.fullyCovered ? "Covered" : `${coverageGaps} gaps`}
        />
        <Stat label="Production gaps" value={productionGaps} />
        <Stat label="Ready unscheduled" value={initialOverview.readyUnscheduled.length} />
        <Stat label="Delivery attention" value={deliveryIssues} />
      </div>

      <section className="rounded-[24px] border border-[#C6FF32]/20 bg-[#C6FF32]/[0.035] p-5 sm:p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#C6FF32]">
              Operating rule
            </p>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.04em]">
              Always planned at least {initialOverview.minimumPlanningHorizonDays} days ahead
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/45">
              HSAKAA may identify gaps and recommend content, but scheduling and publishing remain approval-controlled. Production readiness from 6D gates final scheduling.
            </p>
          </div>
          <button
            type="button"
            disabled={Boolean(busyKey)}
            onClick={() => run("ensure", ensureMediaCalendarHorizon)}
            className="rounded-xl border border-[#C6FF32]/30 px-4 py-2 text-sm font-bold text-[#C6FF32] disabled:opacity-50"
          >
            Maintain horizon
          </button>
        </div>
      </section>

      <BufferConnectionPanel
        status={bufferStatus}
        accounts={accounts}
        busyKey={busyKey}
        run={run}
      />

      <section className="space-y-4">
        <div>
          <h2 className="text-xl font-black">Account coverage & cadence</h2>
          <p className="mt-1 text-sm text-white/40">
            Coverage is measured against each account&apos;s desired weekly cadence and never uses a planning horizon below seven days.
          </p>
        </div>
        <div className="grid gap-4 xl:grid-cols-2">
          {accounts.map((account) => {
            const coverage = initialOverview.coverage.find((item) => item.accountId === account._id);
            return (
              <AccountCadenceCard
                key={account._id}
                account={account}
                coverage={coverage}
                busy={busyKey === `account:${account._id}`}
                onSave={(payload) =>
                  run(`account:${account._id}`, () => updateMediaCoreAccount(account._id, payload))
                }
              />
            );
          })}
        </div>
      </section>

      <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5 sm:p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-xl font-black">Rolling calendar slots</h2>
            <p className="mt-1 text-sm text-white/40">
              Reserve an idea early; only production-ready items can be formally scheduled.
            </p>
          </div>
          <span className="text-sm text-white/40">{initialOverview.slots.length} visible slots</span>
        </div>
        <div className="mt-5 space-y-3">
          {initialOverview.slots.map((slot) => {
            const publication = publicationForSlot(slot);
            const options = publications.filter(
              (item) =>
                item.platform === slot.platform &&
                !["posted", "cancelled"].includes(item.status),
            );
            const canSchedule =
              publication &&
              ["ready", "complete"].includes(publication.productionStatus) &&
              slot.status !== "scheduled" &&
              slot.status !== "published";
            const account = accounts.find((item) => item._id === String(slot.accountId));
            const allowAuto = Boolean(
              account?.capabilities.canPublish &&
                !account.capabilities.requiresManualPublish &&
                !(publication?.platform === "whatsapp" && publication?.format === "whatsapp_status"),
            );
            return (
              <div
                key={slot._id}
                className="grid gap-3 rounded-2xl border border-white/[0.08] p-4 lg:grid-cols-[170px_110px_1fr_auto] lg:items-center"
              >
                <div>
                  <div className="font-bold">{formatDateTime(slot.startsAt)}</div>
                  <div className="mt-1 text-xs capitalize text-white/40">{slot.platform}</div>
                </div>
                <Status value={slot.status} />
                <div>
                  {publication ? (
                    <>
                      <div className="font-semibold">{publication.title || publication.hook || "Untitled publication"}</div>
                      <div className="mt-1 text-xs text-white/40">
                        Production {publication.productionStatus} · delivery {publication.deliveryStatus ?? "not_scheduled"}
                      </div>
                    </>
                  ) : (
                    <select
                      value={slotSelections[slot._id] ?? ""}
                      onChange={(event) =>
                        setSlotSelections((current) => ({ ...current, [slot._id]: event.target.value }))
                      }
                      className="w-full rounded-xl border border-white/10 bg-[#090d10] px-3 py-2 text-sm"
                    >
                      <option value="">Choose content for this slot</option>
                      {options.map((item) => (
                        <option key={item._id} value={item._id}>
                          {item.title || item.hook || item._id} · {item.productionStatus}
                        </option>
                      ))}
                    </select>
                  )}
                </div>
                <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                  {!publication ? (
                    <button
                      type="button"
                      disabled={!slotSelections[slot._id] || Boolean(busyKey)}
                      onClick={() =>
                        run(`reserve:${slot._id}`, () =>
                          reserveMediaCalendarSlot(slot._id, slotSelections[slot._id]),
                        )
                      }
                      className="rounded-xl border border-white/10 px-3 py-2 text-xs font-bold disabled:opacity-40"
                    >
                      Reserve
                    </button>
                  ) : null}
                  {canSchedule ? (
                    <>
                      <label className="flex items-center gap-2 text-xs text-white/55">
                        <input
                          type="checkbox"
                          disabled={!allowAuto}
                          checked={autoPublish[slot._id] ?? false}
                          onChange={(event) =>
                            setAutoPublish((current) => ({ ...current, [slot._id]: event.target.checked }))
                          }
                        />
                        Auto-publish
                      </label>
                      <button
                        type="button"
                        disabled={Boolean(busyKey)}
                        onClick={() =>
                          run(`schedule:${slot._id}`, () =>
                            scheduleMediaPublication(publication._id, {
                              slotId: slot._id,
                              autoPublish: autoPublish[slot._id] ?? false,
                            }),
                          )
                        }
                        className="rounded-xl bg-[#C6FF32] px-3 py-2 text-xs font-black text-black disabled:opacity-50"
                      >
                        Schedule
                      </button>
                    </>
                  ) : null}
                </div>
              </div>
            );
          })}
          {!initialOverview.slots.length ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-white/35">
              No slots yet. Configure a weekly cadence above, then maintain the horizon.
            </div>
          ) : null}
        </div>
      </section>

      <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5 sm:p-6">
        <h2 className="text-xl font-black">Publishing & manual-delivery queue</h2>
        <p className="mt-1 text-sm text-white/40">
          Automatic delivery runs only after an explicitly approved schedule. Unsupported or uncredentialed executions land here for manual completion.
        </p>
        <div className="mt-5 space-y-3">
          {initialOverview.publishingQueue.map((item) => (
            <div
              key={item._id}
              className="flex flex-col gap-3 rounded-2xl border border-white/[0.08] p-4 lg:flex-row lg:items-center lg:justify-between"
            >
              <div>
                <div className="font-bold">{item.title || item.hook || "Untitled publication"}</div>
                <div className="mt-1 text-xs text-white/40">
                  <span className="capitalize">{item.platform}</span> · {item.deliveryStatus} · {item.scheduledAt ? formatDateTime(item.scheduledAt) : "unscheduled"}
                  {item.lastPublishError ? ` · ${item.lastPublishError}` : ""}
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                {item.deliveryStatus === "failed" ? (
                  <button
                    type="button"
                    disabled={Boolean(busyKey)}
                    onClick={() => run(`retry:${item._id}`, () => retryMediaPublication(item._id))}
                    className="rounded-xl border border-amber-300/25 px-3 py-2 text-xs font-bold text-amber-200"
                  >
                    Retry
                  </button>
                ) : null}
                {item.deliveryStatus === "manual_required" ? (
                  <button
                    type="button"
                    disabled={Boolean(busyKey)}
                    onClick={() =>
                      run(`manual:${item._id}`, () => completeManualMediaPublication(item._id))
                    }
                    className="rounded-xl border border-[#C6FF32]/30 px-3 py-2 text-xs font-bold text-[#C6FF32]"
                  >
                    Mark manually published
                  </button>
                ) : null}
                {["scheduled", "failed"].includes(item.deliveryStatus) &&
                ["ready", "complete"].includes(item.productionStatus) ? (
                  <button
                    type="button"
                    disabled={Boolean(busyKey)}
                    onClick={() =>
                      run(`publish:${item._id}`, () => publishMediaPublicationNow(item._id))
                    }
                    className="rounded-xl bg-[#C6FF32] px-3 py-2 text-xs font-black text-black"
                  >
                    Publish now
                  </button>
                ) : null}
              </div>
            </div>
          ))}
          {!initialOverview.publishingQueue.length ? (
            <div className="rounded-2xl border border-dashed border-white/10 p-8 text-center text-sm text-white/35">
              Nothing is waiting for delivery.
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

function BufferConnectionPanel({
  status,
  accounts,
  busyKey,
  run,
}: {
  status: MediaBufferStatus;
  accounts: MediaAccount[];
  busyKey: string;
  run: (key: string, action: () => Promise<unknown>) => Promise<void>;
}) {
  const supported = new Set(status.supportedPlatforms);
  const channelsByPlatform = new Map<string, BufferChannel[]>();

  for (const channel of status.channels) {
    const platform = bufferServiceToPlatform(channel.service);
    if (!platform) continue;
    const list = channelsByPlatform.get(platform) ?? [];
    list.push(channel);
    channelsByPlatform.set(platform, list);
  }

  return (
    <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-xs font-black uppercase tracking-[0.18em] text-[#C6FF32]">
            Delivery automation
          </p>
          <h2 className="mt-2 text-xl font-black">Buffer connection</h2>
          <p className="mt-2 max-w-3xl text-sm leading-6 text-white/45">
            Personal OS stays the source of truth. After you approve a schedule, Buffer can own timed
            delivery for LinkedIn, Instagram, X and YouTube Shorts. WhatsApp stays on the direct or
            manual publishing path.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!status.configured || !status.reachable || Boolean(busyKey)}
            onClick={() => run("buffer:sync", syncMediaBufferAccounts)}
            className="rounded-xl border border-[#C6FF32]/30 px-4 py-2 text-sm font-bold text-[#C6FF32] disabled:opacity-40"
          >
            Sync Buffer channels
          </button>
          <button
            type="button"
            disabled={!status.configured || !status.reachable || Boolean(busyKey)}
            onClick={() => run("buffer:reconcile", reconcileMediaBufferPublications)}
            className="rounded-xl border border-white/10 px-4 py-2 text-sm font-bold text-white/65 disabled:opacity-40"
          >
            Reconcile delivery
          </button>
        </div>
      </div>

      {!status.configured ? (
        <div className="mt-5 rounded-2xl border border-amber-300/20 bg-amber-300/[0.06] p-4 text-sm text-amber-100/80">
          Add <code className="font-bold">BUFFER_API_KEY</code> to the backend environment and restart
          the backend. Connect your social channels inside Buffer first; the API key remains server-side.
        </div>
      ) : !status.reachable ? (
        <div className="mt-5 rounded-2xl border border-red-300/20 bg-red-300/[0.06] p-4 text-sm text-red-100/80">
          Buffer is configured but could not be reached. {status.error || "Check the API key and Buffer service status."}
          Personal OS calendar data remains available; Buffer handoff is paused until the connection recovers.
        </div>
      ) : null}

      <div className="mt-5 grid gap-3 lg:grid-cols-2">
        {accounts
          .filter((account) => supported.has(account.platform))
          .map((account) => (
            <BufferAccountCard
              key={account._id}
              account={account}
              channels={channelsByPlatform.get(account.platform) ?? []}
              busy={busyKey === `buffer:${account._id}`}
              run={run}
            />
          ))}
      </div>

      <p className="mt-4 text-xs leading-5 text-white/35">
        Unsupported publication formats fall back to direct/manual delivery rather than being marked
        published. This integration intentionally uses Buffer for YouTube Shorts, not long-form uploads.
      </p>
    </section>
  );
}

function BufferAccountCard({
  account,
  channels,
  busy,
  run,
}: {
  account: MediaAccount;
  channels: BufferChannel[];
  busy: boolean;
  run: (key: string, action: () => Promise<unknown>) => Promise<void>;
}) {
  const [selected, setSelected] = useState(account.buffer?.channelId ?? "");
  const connected = Boolean(account.buffer?.channelId);
  const selectedChannel = channels.find((channel) => channel.id === selected);

  return (
    <div className="rounded-2xl border border-white/[0.08] p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="font-bold capitalize">{account.platform}</div>
          <div className="mt-1 text-xs text-white/40">{account.displayName}</div>
        </div>
        <span
          className={`rounded-full px-2.5 py-1 text-[11px] font-black uppercase tracking-[0.12em] ${
            connected
              ? "bg-[#C6FF32]/10 text-[#C6FF32]"
              : "bg-white/[0.05] text-white/40"
          }`}
        >
          {connected ? "Buffer" : "Not mapped"}
        </span>
      </div>

      {connected ? (
        <div className="mt-4 rounded-xl bg-white/[0.035] p-3 text-sm">
          <div className="font-semibold">
            {account.buffer?.displayName || account.buffer?.name || account.buffer?.channelId}
          </div>
          <div className="mt-1 text-xs text-white/40">
            Provider: {account.deliveryProvider} · service {account.buffer?.service}
            {account.buffer?.isQueuePaused ? " · queue paused" : ""}
          </div>
          <button
            type="button"
            disabled={busy}
            onClick={() =>
              run(`buffer:${account._id}`, () => disconnectMediaAccountFromBuffer(account._id))
            }
            className="mt-3 rounded-lg border border-white/10 px-3 py-1.5 text-xs font-bold text-white/55 disabled:opacity-40"
          >
            Disconnect Buffer mapping
          </button>
        </div>
      ) : (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <select
            value={selected}
            onChange={(event) => setSelected(event.target.value)}
            className="min-w-0 flex-1 rounded-xl border border-white/10 bg-[#090d10] px-3 py-2 text-sm"
          >
            <option value="">Choose Buffer channel</option>
            {channels.map((channel) => (
              <option key={channel.id} value={channel.id}>
                {channel.displayName || channel.name}
                {channel.isDisconnected ? " · disconnected" : channel.isQueuePaused ? " · queue paused" : ""}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={!selectedChannel || busy}
            onClick={() => {
              if (!selectedChannel) return;
              void run(`buffer:${account._id}`, () =>
                connectMediaAccountToBuffer(account._id, {
                  organizationId: selectedChannel.organizationId,
                  channelId: selectedChannel.id,
                }),
              );
            }}
            className="rounded-xl bg-[#C6FF32] px-4 py-2 text-sm font-black text-black disabled:opacity-40"
          >
            Connect
          </button>
        </div>
      )}
    </div>
  );
}

function bufferServiceToPlatform(service: string) {
  const key = service.trim().toLowerCase();
  if (key === "linkedin") return "linkedin";
  if (key === "instagram") return "instagram";
  if (key === "twitter") return "x";
  if (key === "youtube") return "youtube";
  return undefined;
}

function AccountCadenceCard({
  account,
  coverage,
  busy,
  onSave,
}: {
  account: MediaAccount;
  coverage?: MediaCalendarOverview["coverage"][number];
  busy: boolean;
  onSave: (payload: {
    strategy: {
      planningHorizonDays: number;
      desiredPublicationsPerWeek: number;
      timezone: string;
      preferredDaysOfWeek: number[];
      preferredPublishTimes: string[];
    };
  }) => Promise<unknown>;
}) {
  const [weekly, setWeekly] = useState(account.strategy?.desiredPublicationsPerWeek ?? 0);
  const [horizon, setHorizon] = useState(Math.max(7, account.strategy?.planningHorizonDays ?? 7));
  const [timezone, setTimezone] = useState(account.strategy?.timezone ?? "Asia/Kolkata");
  const [days, setDays] = useState((account.strategy?.preferredDaysOfWeek ?? []).join(","));
  const [times, setTimes] = useState((account.strategy?.preferredPublishTimes ?? ["09:00"]).join(","));

  async function submit(event: FormEvent) {
    event.preventDefault();
    await onSave({
      strategy: {
        planningHorizonDays: Math.max(7, Number(horizon) || 7),
        desiredPublicationsPerWeek: Math.max(0, Number(weekly) || 0),
        timezone: timezone.trim() || "Asia/Kolkata",
        preferredDaysOfWeek: days
          .split(",")
          .map((value) => Number(value.trim()))
          .filter((value) => Number.isInteger(value) && value >= 0 && value <= 6),
        preferredPublishTimes: times
          .split(",")
          .map((value) => value.trim())
          .filter(Boolean),
      },
    });
  }

  return (
    <form onSubmit={submit} className="rounded-[22px] border border-white/10 bg-white/[0.025] p-5">
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-lg font-black capitalize">{account.platform}</div>
          <div className="mt-1 text-xs text-white/40">{account.displayName}</div>
        </div>
        <div className="text-right">
          <div className={`text-sm font-black ${coverage?.covered ? "text-[#C6FF32]" : "text-amber-200"}`}>
            {coverage?.coveragePercent ?? 100}%
          </div>
          <div className="mt-1 text-xs text-white/35">
            {coverage?.assignedSlots ?? 0}/{coverage?.requiredSlots ?? 0} covered
          </div>
        </div>
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <Field label="Posts / week">
          <input type="number" min={0} max={100} value={weekly} onChange={(event) => setWeekly(Number(event.target.value))} className="input" />
        </Field>
        <Field label="Horizon days (min 7)">
          <input type="number" min={7} max={31} value={horizon} onChange={(event) => setHorizon(Number(event.target.value))} className="input" />
        </Field>
        <Field label="Timezone">
          <input value={timezone} onChange={(event) => setTimezone(event.target.value)} className="input" />
        </Field>
        <Field label="Preferred times">
          <input value={times} onChange={(event) => setTimes(event.target.value)} placeholder="09:00,18:30" className="input" />
        </Field>
      </div>
      <Field label="Preferred weekdays (0=Sun … 6=Sat)">
        <input value={days} onChange={(event) => setDays(event.target.value)} placeholder="1,3,5" className="input mt-1" />
      </Field>
      <div className="mt-4 flex items-center justify-between gap-3">
        <span className="text-xs text-white/35">
          Production gaps: {coverage?.productionGaps ?? 0}
        </span>
        <button disabled={busy} className="rounded-xl border border-white/10 px-4 py-2 text-xs font-bold disabled:opacity-50">
          Save cadence
        </button>
      </div>
      <style jsx>{`
        .input { width: 100%; border-radius: 0.75rem; border: 1px solid rgb(255 255 255 / 0.1); background: rgb(255 255 255 / 0.03); padding: 0.65rem 0.75rem; font-size: 0.875rem; }
      `}</style>
    </form>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="text-xs font-bold text-white/45">
      <span className="mb-1 block">{label}</span>
      {children}
    </label>
  );
}

function Stat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/[0.025] p-5">
      <div className="text-xs font-bold uppercase tracking-[0.16em] text-white/35">{label}</div>
      <div className="mt-3 text-3xl font-black">{value}</div>
    </div>
  );
}

function Status({ value }: { value: string }) {
  return (
    <span className="w-fit rounded-full border border-white/10 px-2.5 py-1 text-[11px] font-bold uppercase tracking-[0.12em] text-white/45">
      {value.replaceAll("_", " ")}
    </span>
  );
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}
