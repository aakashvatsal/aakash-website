import { GlassCard } from "./GlassCard";

type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <GlassCard className="p-10 text-center">
      <p className="text-3xl font-black">{title}</p>
      <p className="mx-auto mt-4 max-w-xl text-white/50">{description}</p>
    </GlassCard>
  );
}