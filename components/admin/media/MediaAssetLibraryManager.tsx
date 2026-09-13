"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";

import {
  archiveMediaLibraryAsset,
  uploadMediaAssetToLibrary,
} from "@/lib/api/media";
import type { MediaAsset, MediaAssetStorageStatus } from "@/types/media";

export function MediaAssetLibraryManager({
  storage,
  initialAssets,
}: {
  storage: MediaAssetStorageStatus;
  initialAssets: MediaAsset[];
}) {
  const router = useRouter();
  const [assets, setAssets] = useState(initialAssets);
  const [search, setSearch] = useState("");
  const [type, setType] = useState<MediaAsset["type"] | "all">("all");
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    return assets.filter((asset) => {
      if (type !== "all" && asset.type !== type) return false;
      if (!needle) return true;
      return [asset.originalName, asset.role, asset.notes, ...(asset.tags ?? [])]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [assets, search, type]);

  async function upload(file: File) {
    setBusy("upload");
    setError("");
    try {
      const asset = await uploadMediaAssetToLibrary(file, {
        source: "real",
      });
      setAssets((current) => [asset, ...current]);
      router.refresh();
    } catch (value) {
      setError(value instanceof Error ? value.message : "Media upload failed.");
    } finally {
      setBusy("");
    }
  }

  async function archive(asset: MediaAsset) {
    setBusy(asset._id);
    setError("");
    try {
      await archiveMediaLibraryAsset(asset._id);
      setAssets((current) => current.filter((item) => item._id !== asset._id));
      router.refresh();
    } catch (value) {
      setError(value instanceof Error ? value.message : "Could not archive asset.");
    } finally {
      setBusy("");
    }
  }

  return (
    <div className="space-y-6">
      {error ? (
        <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-4 text-sm text-red-200">
          {error}
        </div>
      ) : null}

      <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-5 sm:p-6">
        <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.16em] text-[#C6FF32]">Private Media storage</p>
            <h2 className="mt-2 text-2xl font-black tracking-[-0.04em]">
              {storage.configured ? "S3 ready" : "S3 configuration required"}
            </h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-white/45">
              Files upload directly from your browser to private S3. Mongo stores metadata only. Production Studio receives short-lived signed links when it needs to preview or publish an asset.
            </p>
            <div className="mt-3 text-xs text-white/35">
              {storage.bucket ?? "No bucket"} · {storage.region} · {storage.prefix}
            </div>
          </div>
          <label className={storage.configured ? "cursor-pointer rounded-xl bg-[#C6FF32] px-5 py-3 text-sm font-black text-black" : "cursor-not-allowed rounded-xl bg-white/10 px-5 py-3 text-sm font-black text-white/35"}>
            {busy === "upload" ? "Uploading…" : "Upload asset"}
            <input
              type="file"
              className="hidden"
              disabled={!storage.configured || busy === "upload"}
              accept="image/*,video/*,audio/*,application/pdf"
              onChange={(event) => {
                const file = event.target.files?.[0];
                event.target.value = "";
                if (file) void upload(file);
              }}
            />
          </label>
        </div>
      </section>

      <section className="rounded-[24px] border border-white/10 bg-white/[0.025] p-4 sm:p-5">
        <div className="grid gap-3 md:grid-cols-[1fr_220px]">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search filename, role, notes or tags"
            className="rounded-xl border border-white/10 bg-[#090d10] px-4 py-3 text-sm outline-none focus:border-[#C6FF32]/35"
          />
          <select
            value={type}
            onChange={(event) => setType(event.target.value as MediaAsset["type"] | "all")}
            className="rounded-xl border border-white/10 bg-[#090d10] px-3 py-3 text-sm"
          >
            <option value="all">All asset types</option>
            {["image", "video", "audio", "document", "thumbnail", "carousel", "broll", "other"].map((item) => (
              <option key={item} value={item}>{item}</option>
            ))}
          </select>
        </div>
      </section>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((asset) => (
          <article key={asset._id} className="overflow-hidden rounded-[22px] border border-white/10 bg-white/[0.025]">
            {asset.accessUrl && ["image", "thumbnail", "carousel"].includes(asset.type) ? (
              // eslint-disable-next-line @next/next/no-img-element -- private S3 URLs are short-lived and not Next Image candidates.
              <img src={asset.accessUrl} alt={asset.originalName || asset.role || "Media asset"} className="aspect-video w-full object-cover" />
            ) : asset.accessUrl && ["video", "broll"].includes(asset.type) ? (
              <video src={asset.accessUrl} controls preload="metadata" className="aspect-video w-full bg-black object-contain" />
            ) : (
              <div className="flex aspect-video items-center justify-center bg-white/[0.025] text-xs font-black uppercase tracking-[0.14em] text-white/25">
                {asset.type}
              </div>
            )}
            <div className="p-4">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="truncate font-black">{asset.originalName || asset.role || "Untitled asset"}</div>
                  <div className="mt-1 text-xs text-white/35">{asset.type} · {asset.source} · {asset.status}</div>
                </div>
                <button
                  type="button"
                  disabled={busy === asset._id}
                  onClick={() => void archive(asset)}
                  className="rounded-lg border border-white/10 px-2.5 py-1.5 text-xs font-bold text-white/45 hover:text-white disabled:opacity-40"
                >
                  Archive
                </button>
              </div>
              {asset.tags?.length ? (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {asset.tags.map((tag) => <span key={tag} className="rounded-full bg-white/[0.05] px-2 py-1 text-[11px] text-white/45">{tag}</span>)}
                </div>
              ) : null}
              {asset.sizeBytes ? <div className="mt-3 text-xs text-white/30">{formatBytes(asset.sizeBytes)}</div> : null}
            </div>
          </article>
        ))}
      </div>

      {!filtered.length ? (
        <div className="rounded-[24px] border border-dashed border-white/10 p-10 text-center text-sm text-white/35">
          No reusable Media assets match this view yet.
        </div>
      ) : null}
    </div>
  );
}

function formatBytes(value: number) {
  if (value < 1024) return `${value} B`;
  if (value < 1024 * 1024) return `${(value / 1024).toFixed(1)} KB`;
  if (value < 1024 * 1024 * 1024) return `${(value / (1024 * 1024)).toFixed(1)} MB`;
  return `${(value / (1024 * 1024 * 1024)).toFixed(1)} GB`;
}
