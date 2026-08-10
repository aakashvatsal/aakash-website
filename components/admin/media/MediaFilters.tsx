"use client";

import {
  Search,
} from "lucide-react";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import {
  useEffect,
  useRef,
  useState,
  useTransition,
} from "react";

interface MediaFiltersProps {
  initialSearch?: string;
  initialPlatform?: string;
  initialStatus?: string;
  initialPostType?: string;
  initialContentPillar?: string;
}

const platformOptions = [
  {
    label: "All platforms",
    value: "",
  },
  {
    label: "LinkedIn",
    value: "linkedin",
  },
  {
    label: "Instagram",
    value: "instagram",
  },
  {
    label: "YouTube",
    value: "youtube",
  },
  {
    label: "X / Twitter",
    value: "twitter",
  },
  {
    label: "Facebook",
    value: "facebook",
  },
];

const statusOptions = [
  {
    label: "All statuses",
    value: "",
  },
  {
    label: "Idea",
    value: "idea",
  },
  {
    label: "Draft",
    value: "draft",
  },
  {
    label: "Script ready",
    value: "script_ready",
  },
  {
    label: "Assets pending",
    value: "assets_pending",
  },
  {
    label: "Ready",
    value: "ready",
  },
  {
    label: "Scheduled",
    value: "scheduled",
  },
  {
    label: "Posted",
    value: "posted",
  },
  {
    label: "Cancelled",
    value: "cancelled",
  },
];

const postTypeOptions = [
  {
    label: "All post types",
    value: "",
  },
  {
    label: "Text",
    value: "text",
  },
  {
    label: "Carousel",
    value: "carousel",
  },
  {
    label: "Image",
    value: "image",
  },
  {
    label: "Video",
    value: "video",
  },
  {
    label: "Reel",
    value: "reel",
  },
  {
    label: "Short",
    value: "short",
  },
  {
    label: "Article",
    value: "article",
  },
  {
    label: "Story",
    value: "story",
  },
];

export function MediaFilters({
  initialSearch = "",
  initialPlatform = "",
  initialStatus = "",
  initialPostType = "",
  initialContentPillar = "",
}: MediaFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const currentSearchParams =
    useSearchParams();

  const [isPending, startTransition] =
    useTransition();

  const [search, setSearch] = useState(
    initialSearch,
  );

  const [
    contentPillar,
    setContentPillar,
  ] = useState(initialContentPillar);

  const searchTimer =
    useRef<ReturnType<
      typeof setTimeout
    > | null>(null);

  const pillarTimer =
    useRef<ReturnType<
      typeof setTimeout
    > | null>(null);

  function updateFilters(
    updates: Record<
      string,
      string | undefined
    >,
  ) {
    const params = new URLSearchParams(
      currentSearchParams.toString(),
    );

    Object.entries(updates).forEach(
      ([key, value]) => {
        const normalizedValue =
          value?.trim();

        if (normalizedValue) {
          params.set(
            key,
            normalizedValue,
          );
        } else {
          params.delete(key);
        }
      },
    );

    params.delete("page");

    const queryString =
      params.toString();

    const nextUrl = queryString
      ? `${pathname}?${queryString}`
      : pathname;

    startTransition(() => {
      router.replace(nextUrl, {
        scroll: false,
      });
    });
  }

  function handleSearchChange(
    value: string,
  ) {
    setSearch(value);

    if (searchTimer.current) {
      clearTimeout(searchTimer.current);
    }

    searchTimer.current = setTimeout(
      () => {
        updateFilters({
          search: value,
        });
      },
      400,
    );
  }

  function handleContentPillarChange(
    value: string,
  ) {
    setContentPillar(value);

    if (pillarTimer.current) {
      clearTimeout(pillarTimer.current);
    }

    pillarTimer.current = setTimeout(
      () => {
        updateFilters({
          contentPillar: value,
        });
      },
      400,
    );
  }

  useEffect(() => {
    setSearch(initialSearch);
  }, [initialSearch]);

  useEffect(() => {
    setContentPillar(
      initialContentPillar,
    );
  }, [initialContentPillar]);

  useEffect(() => {
    return () => {
      if (searchTimer.current) {
        clearTimeout(
          searchTimer.current,
        );
      }

      if (pillarTimer.current) {
        clearTimeout(
          pillarTimer.current,
        );
      }
    };
  }, []);

  return (
    <div
      className={
        isPending
          ? "opacity-70 transition-opacity"
          : "transition-opacity"
      }
    >
      <div className="relative">
        <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/25" />

        <input
          type="search"
          value={search}
          onChange={(event) =>
            handleSearchChange(
              event.target.value,
            )
          }
          placeholder="Search media posts..."
          className="min-h-12 w-full rounded-[16px] border border-white/10 bg-[#05090b] pl-11 pr-4 text-sm text-white outline-none placeholder:text-white/25 transition focus:border-[#C6FF32]/40"
        />
      </div>

      <div className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <FilterSelect
          value={initialPlatform}
          options={platformOptions}
          ariaLabel="Filter by platform"
          onChange={(value) =>
            updateFilters({
              platform: value,
            })
          }
        />

        <FilterSelect
          value={initialStatus}
          options={statusOptions}
          ariaLabel="Filter by status"
          onChange={(value) =>
            updateFilters({
              status: value,
            })
          }
        />

        <FilterSelect
          value={initialPostType}
          options={postTypeOptions}
          ariaLabel="Filter by post type"
          onChange={(value) =>
            updateFilters({
              postType: value,
            })
          }
        />

        <input
          value={contentPillar}
          onChange={(event) =>
            handleContentPillarChange(
              event.target.value,
            )
          }
          placeholder="Content pillar"
          className="min-h-12 w-full rounded-[16px] border border-white/10 bg-[#05090b] px-4 text-sm text-white outline-none placeholder:text-white/25 transition focus:border-[#C6FF32]/40"
        />
      </div>
    </div>
  );
}

interface FilterOption {
  label: string;
  value: string;
}

interface FilterSelectProps {
  value?: string;
  options: FilterOption[];
  ariaLabel: string;
  onChange: (value: string) => void;
}

function FilterSelect({
  value = "",
  options,
  ariaLabel,
  onChange,
}: FilterSelectProps) {
  return (
    <select
      value={value}
      aria-label={ariaLabel}
      onChange={(event) =>
        onChange(event.target.value)
      }
      className="min-h-12 w-full cursor-pointer rounded-[16px] border border-white/10 bg-[#05090b] px-4 text-sm text-white outline-none transition focus:border-[#C6FF32]/40"
    >
      {options.map((option) => (
        <option
          key={
            option.value ||
            option.label
          }
          value={option.value}
        >
          {option.label}
        </option>
      ))}
    </select>
  );
}