import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <div className="space-y-8">
      <Skeleton className="h-32 rounded-3xl" />

      <Skeleton className="h-28 rounded-3xl" />

      <Skeleton className="h-64 rounded-3xl" />

      <Skeleton className="h-64 rounded-3xl" />

      <Skeleton className="h-64 rounded-3xl" />
    </div>
  );
}