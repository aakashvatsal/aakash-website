import { Skeleton } from "@/components/ui/Skeleton";

export default function Loading() {
  return (
    <main className="min-h-screen bg-[#030608] px-6 py-28 text-white md:px-12 lg:px-16">
      <div className="mx-auto max-w-[1500px]">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="mt-8 h-24 max-w-4xl" />
        <Skeleton className="mt-6 h-8 max-w-2xl" />

        <div className="mt-20 grid gap-6 md:grid-cols-3">
          <Skeleton className="h-[360px]" />
          <Skeleton className="h-[360px]" />
          <Skeleton className="h-[360px]" />
        </div>
      </div>
    </main>
  );
}