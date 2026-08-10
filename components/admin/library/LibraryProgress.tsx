type LibraryProgressProps = {
  percentage: number;
  currentPage?: number;
  totalPages?: number;
};

export function LibraryProgress({
  percentage,
  currentPage = 0,
  totalPages = 0,
}: LibraryProgressProps) {
  const normalizedPercentage = Math.min(
    100,
    Math.max(0, percentage),
  );

  return (
    <div className="min-w-[150px]">
      <div className="flex items-center justify-between text-xs">
        <span className="font-bold text-white">
          {normalizedPercentage}%
        </span>

        {totalPages > 0 && (
          <span className="text-white/30">
            {currentPage}/{totalPages}
          </span>
        )}
      </div>

      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full rounded-full bg-[#C6FF32]"
          style={{
            width: `${normalizedPercentage}%`,
          }}
        />
      </div>
    </div>
  );
}