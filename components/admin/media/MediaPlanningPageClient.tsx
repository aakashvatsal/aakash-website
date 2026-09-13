"use client";

import { useCallback, useEffect, useState } from "react";
import { RefreshCw } from "lucide-react";
import { getMediaPlanningOverview } from "@/lib/api/media";
import type { MediaPlanningOverview } from "@/types/media";
import { MediaPlanningManager } from "@/components/admin/media/MediaPlanningManager";

export function MediaPlanningPageClient() {
  const [overview, setOverview] = useState<MediaPlanningOverview | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const loadOverview = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      setOverview(await getMediaPlanningOverview());
    } catch (value) {
      setOverview(null);
      setError(
        value instanceof Error
          ? value.message
          : "Unable to load the Media plan right now.",
      );
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadOverview();
  }, [loadOverview]);

  if (loading && !overview) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-sm text-white/45">
        Loading the 7-day plan...
      </div>
    );
  }

  if (!overview) {
    return (
      <div className="rounded-2xl border border-red-400/20 bg-red-400/10 p-5">
        <p className="text-sm font-bold text-red-100">
          The Media plan could not be loaded.
        </p>
        <p className="mt-2 text-xs leading-5 text-red-100/65">
          {error || "The backend did not return a usable planning response."}
        </p>
        <button
          type="button"
          onClick={() => void loadOverview()}
          className="mt-4 rounded-xl border border-red-200/20 px-3 py-2 text-xs font-bold text-red-50"
        >
          <RefreshCw className="mr-1.5 inline h-3.5 w-3.5" />
          Retry
        </button>
      </div>
    );
  }

  return (
    <MediaPlanningManager
      initialOverview={overview}
      onOverviewRefresh={loadOverview}
    />
  );
}
