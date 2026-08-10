"use client";

import {
  LibraryItemStatus,
  LibraryItemType,
} from "@/types/library";

type LibraryFiltersProps = {
  type: string;
  status: string;
  favouriteOnly: boolean;
  archivedOnly: boolean;
  onTypeChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onFavouriteChange: (value: boolean) => void;
  onArchivedChange: (value: boolean) => void;
};

const selectClassName =
  "min-h-11 rounded-[14px] border border-white/10 bg-[#070b0d] px-3 text-sm text-white outline-none focus:border-[#C6FF32]/40";

export function LibraryFilters({
  type,
  status,
  favouriteOnly,
  archivedOnly,
  onTypeChange,
  onStatusChange,
  onFavouriteChange,
  onArchivedChange,
}: LibraryFiltersProps) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <select
        value={type}
        onChange={(event) => onTypeChange(event.target.value)}
        className={selectClassName}
      >
        <option value="">All types</option>

        {Object.values(LibraryItemType).map((itemType) => (
          <option key={itemType} value={itemType}>
            {itemType.replaceAll("_", " ")}
          </option>
        ))}
      </select>

      <select
        value={status}
        onChange={(event) => onStatusChange(event.target.value)}
        className={selectClassName}
      >
        <option value="">All statuses</option>

        {Object.values(LibraryItemStatus).map((itemStatus) => (
          <option key={itemStatus} value={itemStatus}>
            {itemStatus.replaceAll("_", " ")}
          </option>
        ))}
      </select>

      <label className="flex min-h-11 items-center gap-3 rounded-[14px] border border-white/10 bg-white/[0.025] px-4 text-sm text-white/55">
        <input
          type="checkbox"
          checked={favouriteOnly}
          onChange={(event) =>
            onFavouriteChange(event.target.checked)
          }
          className="h-4 w-4 accent-[#C6FF32]"
        />
        Favourites only
      </label>

      <label className="flex min-h-11 items-center gap-3 rounded-[14px] border border-white/10 bg-white/[0.025] px-4 text-sm text-white/55">
        <input
          type="checkbox"
          checked={archivedOnly}
          onChange={(event) =>
            onArchivedChange(event.target.checked)
          }
          className="h-4 w-4 accent-[#C6FF32]"
        />
        Archived only
      </label>
    </div>
  );
}