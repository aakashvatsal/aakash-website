type Status =
  | "draft"
  | "published"
  | "scheduled"
  | "archived"
  | "active"
  | "paused"
  | "private"
  | "public"
  | "reading"
  | "finished"
  | "wishlist";

type AdminStatusBadgeProps = {
  status: Status | string;
};

const statusStyles: Record<string, string> = {
  draft: "border-amber-400/20 bg-amber-400/10 text-amber-300",
  published: "border-[#C6FF32]/25 bg-[#C6FF32]/10 text-[#C6FF32]",
  scheduled: "border-blue-400/20 bg-blue-400/10 text-blue-300",
  archived: "border-white/10 bg-white/[0.04] text-white/40",
  active: "border-[#C6FF32]/25 bg-[#C6FF32]/10 text-[#C6FF32]",
  paused: "border-orange-400/20 bg-orange-400/10 text-orange-300",
  private: "border-red-400/20 bg-red-400/10 text-red-300",
  public: "border-[#C6FF32]/25 bg-[#C6FF32]/10 text-[#C6FF32]",
  reading: "border-blue-400/20 bg-blue-400/10 text-blue-300",
  finished: "border-[#C6FF32]/25 bg-[#C6FF32]/10 text-[#C6FF32]",
  wishlist: "border-purple-400/20 bg-purple-400/10 text-purple-300",
};

export function AdminStatusBadge({
  status,
}: AdminStatusBadgeProps) {
  const normalizedStatus = status.toLowerCase();

  return (
    <span
      className={`inline-flex min-h-7 items-center rounded-full border px-3 text-[10px] font-black uppercase tracking-[0.18em] ${
        statusStyles[normalizedStatus] ??
        "border-white/10 bg-white/[0.04] text-white/45"
      }`}
    >
      {status.replaceAll("_", " ")}
    </span>
  );
}