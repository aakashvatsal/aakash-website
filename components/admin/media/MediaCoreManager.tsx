"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { createMediaCoreResource, migrateLegacyMedia } from "@/lib/api/media";
import type {
  MediaAccount,
  MediaContentItem,
  MediaCoreOverview,
  MediaMigrationStatus,
  MediaPlatform,
  MediaPublication,
} from "@/types/media";

const growthPlatforms: MediaPlatform[] = [
  "linkedin",
  "instagram",
  "youtube",
  "x",
  "whatsapp",
];

export function MediaCoreManager({
  overview,
  accounts,
  content,
  publications,
  migration,
}: {
  overview: MediaCoreOverview;
  accounts: MediaAccount[];
  content: MediaContentItem[];
  publications: MediaPublication[];
  migration: MediaMigrationStatus;
}) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [platform, setPlatform] = useState<MediaPlatform>("linkedin");
  const [displayName, setDisplayName] = useState("");

  async function run(action: () => Promise<unknown>) {
    setBusy(true);
    setError("");
    try {
      await action();
      router.refresh();
    } catch (value) {
      setError(
        value instanceof Error ? value.message : "Media Core action failed.",
      );
    } finally {
      setBusy(false);
    }
  }

  async function addAccount(event: FormEvent) {
    event.preventDefault();
    await run(() =>
      createMediaCoreResource("accounts", {
        platform,
        displayName,
        isPrimary: true,
        strategy: {
          planningHorizonDays: 7,
          desiredPublicationsPerWeek: platform === "youtube" ? 2 : 7,
        },
        capabilities: { requiresManualPublish: platform === "whatsapp" },
      }),
    );
    setDisplayName("");
  }

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 md:grid-cols-4">
        <Stat label="Canonical ideas" value={overview.counts.contentItems} />
        <Stat label="Publications" value={overview.counts.publications} />
        <Stat label="Assets" value={overview.counts.assets} />
        <Stat label="Planning horizon" value={`${overview.planningHorizonDays} days`} />
      </div>

      <section className="rounded-[24px] border border-[#C6FF32]/20 bg-[#C6FF32]/[0.035] p-5 sm:p-6">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#C6FF32]">
          HSAKAA-managed creation
        </p>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <h2 className="text-2xl font-black tracking-[-0.04em]">
              New content should originate in HSAKAA
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/45">
              Manual and AI content use the same Media Core schemas. The origin and
              generation references record provenance; they do not create a separate
              AI-only content model. Legacy Media remains available for historical
              editing, analytics and migration.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/admin/hsakaa/chat"
              className="rounded-xl bg-[#C6FF32] px-4 py-3 text-sm font-black text-black"
            >
              Create with HSAKAA
            </Link>
            <Link
              href="/admin/media/intelligence"
              className="rounded-xl border border-white/10 px-4 py-3 text-sm font-bold text-white/65"
            >
              Content memory
            </Link>
          </div>
        </div>
      </section>

      <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black">Growth accounts</h2>
            <p className="mt-1 text-sm text-white/40">
              LinkedIn, Instagram, YouTube, X and WhatsApp are first-class channels.
            </p>
          </div>
          <div className="text-sm text-white/45">
            Missing: {overview.missingGrowthPlatforms.length ? overview.missingGrowthPlatforms.join(", ") : "none"}
          </div>
        </div>

        <div className="mt-5 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {growthPlatforms.map((item) => {
            const account = accounts.find((accountItem) => accountItem.platform === item);
            return (
              <div key={item} className="rounded-2xl border border-white/10 p-4">
                <div className="font-bold capitalize">{item}</div>
                <div className="mt-2 text-xs text-white/40">
                  {account
                    ? `${account.displayName} · ${account.strategy?.planningHorizonDays ?? 7}d ahead`
                    : "Not configured"}
                </div>
              </div>
            );
          })}
        </div>

        <form
          onSubmit={addAccount}
          className="mt-5 grid gap-3 md:grid-cols-[180px_1fr_auto]"
        >
          <select
            value={platform}
            onChange={(event) => setPlatform(event.target.value as MediaPlatform)}
            className="rounded-xl border border-white/10 bg-[#090d10] px-3 py-3"
          >
            {growthPlatforms.map((item) => (
              <option key={item} value={item}>
                {item}
              </option>
            ))}
          </select>
          <input
            required
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="Account display name"
            className="rounded-xl border border-white/10 bg-white/[0.03] px-4 py-3"
          />
          <button
            disabled={busy}
            className="rounded-xl bg-[#C6FF32] px-5 py-3 font-black text-black"
          >
            Add account
          </button>
        </form>
      </section>

      <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black">Canonical content</h2>
            <p className="mt-1 text-sm text-white/40">
              Read-only here. HSAKAA will create new ideas and platform executions through the same Core schema.
            </p>
          </div>
          <span className="text-sm text-white/45">{content.length} loaded</span>
        </div>

        <div className="mt-5 space-y-2">
          {content.slice(0, 10).map((item) => (
            <div
              key={item._id}
              className="rounded-xl border border-white/[0.07] px-4 py-3"
            >
              <div className="font-bold">{item.title}</div>
              <div className="mt-1 text-xs text-white/40">
                {item.thesis || "No thesis yet"} · {publications.filter((publication) => String(publication.contentItemId) === item._id).length} executions · origin {item.origin}
              </div>
            </div>
          ))}
          {!content.length ? (
            <div className="rounded-xl border border-dashed border-white/10 px-4 py-8 text-center text-sm text-white/35">
              No canonical content yet. HSAKAA will create here once the Content Director stage is enabled.
            </div>
          ) : null}
        </div>
      </section>

      <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-black">Legacy migration</h2>
            <p className="mt-1 text-sm text-white/40">
              Safe, idempotent backfill from existing media_posts into Core V2.
            </p>
          </div>
          <button
            disabled={busy || migration.remaining === 0}
            onClick={() => run(migrateLegacyMedia)}
            className="rounded-xl border border-[#C6FF32]/30 px-4 py-2 font-bold text-[#C6FF32]"
          >
            Migrate remaining
          </button>
        </div>
        <div className="mt-4 text-sm text-white/50">
          Legacy {migration.legacyPosts} · Migrated {migration.migratedPosts} · Remaining {migration.remaining}
        </div>
      </section>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number | string }) {
  return (
    <div className="rounded-[20px] border border-white/10 bg-white/[0.025] p-5">
      <div className="text-xs font-bold uppercase tracking-[0.16em] text-white/35">
        {label}
      </div>
      <div className="mt-3 text-3xl font-black">{value}</div>
    </div>
  );
}
